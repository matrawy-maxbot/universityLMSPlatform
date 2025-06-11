'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getRegistrationRequests, approveRegistration, rejectRegistration } from './api';
import RegistrationsList from './components/RegistrationsList';
import StudentInfo from './components/StudentInfo';
import SemesterSelector from './components/SemesterSelector';
import styles from './styles/page.module.css';

export default function RegisterConfirmations() {
  const [registrations, setRegistrations] = useState([]);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use a ref to track the latest semester ID to prevent duplicate fetches
  const lastFetchedSemesterId = useRef(null);
  const lastFetchedStatus = useRef(null);
  const isFetching = useRef(false);

  // Memoize the fetch function to avoid recreating it on each render
  const fetchRegistrations = useCallback(async (semesterId, status) => {
    // Skip if the same semester and status are already being fetched or if no semester is selected
    if (!semesterId || isFetching.current) {
      return;
    }
    
    // Skip if we're trying to fetch the same data we already have
    if (lastFetchedSemesterId.current === semesterId && 
        lastFetchedStatus.current === status && 
        registrations.length > 0) {
      return;
    }
    
    isFetching.current = true;
    lastFetchedSemesterId.current = semesterId;
    lastFetchedStatus.current = status;
    
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching registrations for semester:', semesterId);
      
      const data = await getRegistrationRequests(semesterId, status);
      
      console.log('Received registrations:', data);
      
      // Process registrations to ensure they have all required fields
      const processedData = Array.isArray(data) ? data.map(reg => {
        // Ensure each registration has required fields
        let registration = { ...reg };
        
        // Determine status based on confirm and isRejected flags
        if (registration.confirm === true) {
          registration.status = 'approved';
        } else if (registration.isRejected === true) {
          registration.status = 'rejected';
        } else {
          registration.status = 'pending';
        }
        
        // Ensure new fields have defaults if not present
        registration.confirmDate = registration.confirmDate || null;
        registration.rejectionDate = registration.rejectionDate || null;
        registration.isRejected = registration.isRejected || false;
        registration.rejectionReason = registration.rejectionReason || null;
        
        // Get student data if available
        if (!registration.student && registration.User) {
          registration.student = registration.User;
        } else if (!registration.student && registration.studentid) {
          // In a real application, we would fetch student details here
          // For now, we'll create a placeholder student object
          registration.student = {
            id: registration.studentid,
            name: `Student ${registration.studentid}`,
            // Add other student fields as needed
          };
        }
        
        // Get course data if available
        if (!registration.course && registration.Course) {
          registration.course = registration.Course;
        } else if (!registration.course && registration.courseid) {
          // In a real application, we would fetch course details here
          // For now, we'll create a placeholder course object
          registration.course = {
            id: registration.courseid,
            coursecode: registration.courseid,
            coursename: `Course ${registration.courseid}`,
            // Add other course fields as needed
          };
        }
        
        return registration;
      }) : [];
      
      setRegistrations(processedData);
      
      // Clear selected registration when getting new data
      setSelectedRegistration(null);
      setShowStudentDialog(false);
    } catch (err) {
      console.error('Error fetching registration requests:', err);
      setError('Failed to fetch registration requests');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  // Fetch registration requests when semester or filter status changes
  useEffect(() => {
    if (!currentSemester) {
      return;
    }
    
    // Map UI filter status to API status query parameter
    // The backend expects: 'pending', 'approved', 'rejected', or 'all'
    let apiStatus = filterStatus;
    
    // This mapping is already correct as our UI values match the API expectations
    // But adding this comment for clarity that we're now using the updated backend status filtering
    
    fetchRegistrations(currentSemester.id, apiStatus);
  }, [currentSemester?.id, filterStatus, fetchRegistrations]);

  // Handle semester change
  const handleSemesterChange = useCallback((semester) => {
    console.log('Semester changed to:', semester);
    setCurrentSemester(semester);
  }, []);

  // Handle registration selection
  const handleRegistrationSelect = useCallback((registration) => {
    setSelectedRegistration(registration);
    setShowStudentDialog(true);
  }, []);

  // Close student dialog
  const handleCloseDialog = useCallback(() => {
    setShowStudentDialog(false);
  }, []);

  // Handle registration approval
  const handleApprove = useCallback(async (registrationId) => {
    try {
      setLoading(true);
      const updatedRegistration = await approveRegistration(registrationId);
      
      // Update the local state to reflect the change
      setRegistrations(prevRegistrations => 
        prevRegistrations.map(reg => 
          reg.id === registrationId 
            ? { 
                ...reg, 
                status: 'approved', 
                confirm: true,
                confirmDate: updatedRegistration.confirmDate || new Date().toISOString(),
                isRejected: false,
                rejectionReason: null,
                rejectionDate: null
              } 
            : reg
        )
      );
      
      // If this was the selected registration, update it
      setSelectedRegistration(prev => 
        prev && prev.id === registrationId
          ? { 
              ...prev, 
              status: 'approved', 
              confirm: true,
              confirmDate: updatedRegistration.confirmDate || new Date().toISOString(),
              isRejected: false,
              rejectionReason: null,
              rejectionDate: null
            }
          : prev
      );
      
      // Close dialog after successful approval
      if (selectedRegistration?.id === registrationId) {
        setTimeout(() => {
          setShowStudentDialog(false);
        }, 1000); // Show success for 1 second before closing
      }
    } catch (err) {
      console.error('Error approving registration:', err);
      setError('Failed to approve registration');
    } finally {
      setLoading(false);
    }
  }, [selectedRegistration]);

  // Handle registration rejection
  const handleReject = useCallback(async (registrationId, reason) => {
    try {
      setLoading(true);
      const updatedRegistration = await rejectRegistration(registrationId, reason);
      
      // Update the local state to reflect the change
      setRegistrations(prevRegistrations => 
        prevRegistrations.map(reg => 
          reg.id === registrationId 
            ? { 
                ...reg, 
                status: 'rejected', 
                confirm: false,
                isRejected: true,
                rejectionReason: reason || updatedRegistration.rejectionReason,
                rejectionDate: updatedRegistration.rejectionDate || new Date().toISOString(),
                confirmDate: null
              } 
            : reg
        )
      );
      
      // If this was the selected registration, update it
      setSelectedRegistration(prev => 
        prev && prev.id === registrationId
          ? { 
              ...prev, 
              status: 'rejected', 
              confirm: false,
              isRejected: true,
              rejectionReason: reason || updatedRegistration.rejectionReason,
              rejectionDate: updatedRegistration.rejectionDate || new Date().toISOString(),
              confirmDate: null
            }
          : prev
      );
      
      // Close dialog after successful rejection
      if (selectedRegistration?.id === registrationId) {
        setTimeout(() => {
          setShowStudentDialog(false);
        }, 1000); // Show success for 1 second before closing
      }
    } catch (err) {
      console.error('Error rejecting registration:', err);
      setError('Failed to reject registration');
    } finally {
      setLoading(false);
    }
  }, [selectedRegistration]);

  // Filter registrations based on search term
  const filteredRegistrations = registrations.filter(reg => {
    if (!searchTerm.trim()) return true;
    
    const searchFields = [
      reg.student?.name,
      reg.student?.id,
      reg.course?.coursecode,
      reg.course?.coursename
    ];
    
    // Check if any field contains the search term (case insensitive)
    return searchFields.some(field => 
      field && field.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Format semester name with year
  const formatSemesterDisplay = (semester) => {
    if (!semester) return '';
    
    // Capitalize the first letter of the semester name
    const name = semester.semester ? 
      semester.semester.charAt(0).toUpperCase() + semester.semester.slice(1) : 
      '';
    
    // Get years, using fallbacks if needed
    const startYear = semester.startyear || '';
    const endYear = semester.endyear || '';
    
    // Create display name based on available data
    let displayName = name;
    
    if (startYear && endYear) {
      displayName += ` ${startYear}/${endYear}`;
    } else if (startYear) {
      displayName += ` ${startYear}`;
    }
    
    return displayName;
  };

  // Debug current semester value
  useEffect(() => {
    if (currentSemester) {
      console.log('Current semester state updated:', currentSemester);
    }
  }, [currentSemester]);

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Registration Confirmations</h1>
      
      {/* Semester Selector */}
      <SemesterSelector onSemesterChange={handleSemesterChange} />
      
      {/* Error display */}
      {error && (
        <div className={styles.errorMessage}>
          <svg xmlns="http://www.w3.org/2000/svg" className={styles.errorIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      {currentSemester ? (
        <div className={styles.currentSemesterInfo}>
          <p>
            Viewing registrations for semester: 
            <strong className={styles.semesterName}>
              {formatSemesterDisplay(currentSemester)}
              {!currentSemester.endedat && ' (Active)'}
            </strong>
          </p>
        </div>
      ) : (
        <div className={styles.noSemesterMessage}>
          <p>Please select a semester to view registration requests.</p>
        </div>
      )}
      
      {currentSemester && (
        <div className={styles.mainContent}>
          <div className={styles.filtersSection}>
            {/* Search box */}
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search by student name, ID, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            {/* Status filter */}
            <div className={styles.statusFilter}>
              <label className={styles.filterLabel}>Status:</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={styles.statusSelect}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
          
          <div className={styles.registrationsContainer}>
            {/* Registrations list */}
            {loading && !registrations.length ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading registration requests...</p>
              </div>
            ) : (
              <RegistrationsList
                registrations={filteredRegistrations}
                selectedId={selectedRegistration?.id}
                onSelect={handleRegistrationSelect}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            )}
          </div>
        </div>
      )}
      
      {/* Student Info Dialog */}
      {showStudentDialog && selectedRegistration && (
        <div className={styles.dialogOverlay} onClick={handleCloseDialog}>
          <div className={styles.dialogContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={handleCloseDialog}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <StudentInfo 
              student={selectedRegistration.student}
              registration={selectedRegistration}
              onApprove={() => handleApprove(selectedRegistration.id)}
              onReject={(reason) => handleReject(selectedRegistration.id, reason)}
            />
          </div>
        </div>
      )}
    </div>
  );
} 