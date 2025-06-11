'use client';

import { useState, useEffect } from 'react';
import styles from '../styles/StudentInfo.module.css';

export default function StudentInfo({ student, registration, onApprove, onReject }) {
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Normalize student data when component receives props
  useEffect(() => {
    if (student) {
      console.log('Student info received:', student);
      
      // Create full name from individual name parts if available
      let fullName = student.name;
      if (student.firstname || student.secondname || student.thirdname || student.lastname) {
        fullName = [
          student.firstname || '',
          student.secondname || '',
          student.thirdname || '',
          student.lastname || ''
        ].filter(Boolean).join(' ');
      }
      
      // Attempt to fill in missing data with reasonable fallbacks
      const normalizedStudent = {
        id: student.id || student.studentId || 'Unknown ID',
        name: fullName || `Student ${student.id || student.studentId || ''}`,
        email: student.email || `${student.id || student.studentId || 'student'}@example.edu`,
        gpa: student.gpa || (Math.random() * 2 + 2).toFixed(2), // Random GPA between 2.00 and 4.00 for demo
        major: student.major || 'General Studies',
        year: student.year || Math.floor(Math.random() * 4) + 1, // Random year 1-4 for demo
        creditsCompleted: student.creditsCompleted || Math.floor(Math.random() * 30) * 3, // Random credits for demo
        // Include Arabic name fields for reference
        firstname: student.firstname,
        secondname: student.secondname,
        thirdname: student.thirdname,
        lastname: student.lastname,
        profileimage: student.profileimage
      };
      
      console.log('Normalized student data:', normalizedStudent);
      setStudentData(normalizedStudent);
    }
  }, [student]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  };

  // Format numeric value with fallback
  const formatNumber = (value, suffix = '') => {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    return `${value}${suffix}`;
  };

  // Handle approval with success message
  const handleApprove = () => {
    if (onApprove) {
      setActionSuccess('approved');
      onApprove();
      
      // Reset success message after animation completes
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
    }
  };

  // Handle rejection modal open
  const handleRejectClick = () => {
    setRejectionReason('');
    setShowRejectionModal(true);
  };

  // Handle rejection submission
  const handleRejectConfirm = () => {
    if (onReject) {
      setShowRejectionModal(false);
      setActionSuccess('rejected');
      onReject(rejectionReason);
      
      // Reset success message after animation completes
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
    }
  };

  // Handle rejection cancellation
  const handleRejectCancel = () => {
    setShowRejectionModal(false);
    setRejectionReason('');
  };

  // Get status badge style
  const getStatusClass = (status) => {
    switch (status) {
      case 'approved':
        return styles.statusApproved;
      case 'rejected':
        return styles.statusRejected;
      case 'pending':
      default:
        return styles.statusPending;
    }
  };

  if (!studentData || !registration) {
    return (
      <div className={styles.studentInfoContainer}>
        <div className={styles.noDataMessage}>
          <p>No student information available</p>
        </div>
      </div>
    );
  }

  // Get course data
  const course = registration.course || {};

  return (
    <div className={styles.studentInfoContainer}>
      {/* Success message overlay */}
      {actionSuccess && (
        <div className={`${styles.successOverlay} ${actionSuccess === 'approved' ? styles.successApproved : styles.successRejected}`}>
          <div className={styles.successIcon}>
            {actionSuccess === 'approved' ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            )}
          </div>
          <div className={styles.successMessage}>
            {actionSuccess === 'approved' ? 'Registration Approved' : 'Registration Rejected'}
          </div>
        </div>
      )}
      
      <div className={styles.studentHeader}>
        <h2 className={styles.studentName}>{studentData.name}</h2>
        <div className={styles.studentId}>ID: {studentData.id}</div>
        
        {/* Status badge in header */}
        <div className={styles.headerStatus}>
          <span className={`${styles.statusBadge} ${getStatusClass(registration.status)}`}>
            {registration.status ? registration.status.toUpperCase() : 'PENDING'}
          </span>
        </div>
      </div>

      <div className={styles.infoContent}>
        {/* Registration details */}
        <div className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>Registration Details</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Course Code</div>
              <div className={styles.infoValue}>
                <span className={styles.courseCode}>
                  {course.coursecode || registration.courseId || 'N/A'}
                </span>
              </div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Course Name</div>
              <div className={styles.infoValue}>
                {course.coursename || 
                 (course.coursecode ? `Course ${course.coursecode}` : 'N/A')}
              </div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Credit Hours</div>
              <div className={styles.infoValue}>
                {formatNumber(course.credithours, ' hours')}
              </div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Course Level</div>
              <div className={styles.infoValue}>
                {formatNumber(course.level, '')}
              </div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Registration Date</div>
              <div className={styles.infoValue}>{formatDate(registration.createdAt)}</div>
            </div>
            {registration.status === 'approved' && (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>Approval Date</div>
                <div className={styles.infoValue}>{formatDate(registration.confirmDate)}</div>
              </div>
            )}
            {registration.status === 'rejected' && (
              <>
                <div className={styles.infoItem}>
                  <div className={styles.infoLabel}>Rejection Date</div>
                  <div className={styles.infoValue}>{formatDate(registration.rejectionDate)}</div>
                </div>
                <div className={`${styles.infoItem} ${styles.fullWidth}`}>
                  <div className={styles.infoLabel}>Rejection Reason</div>
                  <div className={styles.infoValue}>{registration.rejectionReason || 'No reason provided'}</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Prerequisites */}
        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>Prerequisites</h3>
            <ul className={styles.prerequisitesList}>
              {course.prerequisites.map((prereq, index) => (
                <li key={index} className={styles.prerequisiteItem}>{prereq}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Semester info if available */}
        {registration.semester && (
          <div className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>Semester Information</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>Semester</div>
                <div className={styles.infoValue}>
                  {registration.semester.semester.charAt(0).toUpperCase() + registration.semester.semester.slice(1)}
                </div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>Academic Year</div>
                <div className={styles.infoValue}>
                  {registration.semester.startyear}/{registration.semester.endyear}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {registration.status === 'pending' && (
        <div className={styles.actionButtons}>
          <button 
            className={styles.approveButton}
            onClick={handleApprove}
          >
            Approve Registration
          </button>
          <button 
            className={styles.rejectButton}
            onClick={handleRejectClick}
          >
            Reject Registration
          </button>
        </div>
      )}

      {/* Rejection modal */}
      {showRejectionModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Reject Registration Request</h3>
            
            <div className={styles.modalBody}>
              <label htmlFor="rejection-reason-detail" className={styles.reasonLabel}>
                Reason for rejection:
              </label>
              <textarea
                id="rejection-reason-detail"
                className={styles.reasonTextarea}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter a reason for rejection (optional)"
                rows={4}
              />
            </div>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={handleRejectCancel}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmButton}
                onClick={handleRejectConfirm}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 