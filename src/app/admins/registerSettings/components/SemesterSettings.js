'use client';

import { useState, useEffect } from 'react';
import styles from '../styles/SemesterSettings.module.css';
import { getCurrentSemester, createSemester, endSemester } from '../api';
import ConfirmDialog from './ConfirmDialog';

export default function SemesterSettings({ onSemesterChange, onSemesterCreated }) {
  const [currentSemester, setCurrentSemester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewSemesterForm, setShowNewSemesterForm] = useState(false);
  const [showEndConfirmDialog, setShowEndConfirmDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startyear: new Date().getFullYear(),
    endyear: new Date().getFullYear() + 1
  });

  // Fetch current semester data
  useEffect(() => {
    let isMounted = true;
    let requestTimeoutId = null;
    
    const fetchCurrentSemester = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Delay request to avoid simultaneous requests
        const data = await getCurrentSemester();
        
        // Ensure component is still mounted before updating state
        if (!isMounted) return;
        
        console.log('Received semester data in component:', data);
        
        // Check if there is a current semester (not null and not ended)
        if (data && !data.endedat) {
          setCurrentSemester(data);
          setShowNewSemesterForm(false);
          if (onSemesterChange) {
            onSemesterChange(data);
          }
        } else {
          // No active semester or data is null
          console.log('No active semester or data is null, showing creation form');
          setCurrentSemester(null);
          setShowNewSemesterForm(true);
          if (onSemesterChange) {
            onSemesterChange(null);
          }
        }
      } catch (err) {
        console.error('Error fetching current semester:', err);
        if (isMounted) {
          setError('Failed to fetch current semester data');
          setCurrentSemester(null);
          setShowNewSemesterForm(true);
          if (onSemesterChange) {
            onSemesterChange(null);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Use a short delay before sending the request
    requestTimeoutId = setTimeout(fetchCurrentSemester, 500);
    
    // Cleanup when component is removed
    return () => {
      isMounted = false;
      if (requestTimeoutId) {
        clearTimeout(requestTimeoutId);
      }
    };
  }, []); // Empty dependency array to execute request only once on mount

  // Handle new semester form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'startyear' || name === 'endyear' ? parseInt(value, 10) : value
    }));
  };

  // Submit new semester creation form
  const handleCreateSemester = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate data
      if (!formData.name.trim()) {
        setError('Please enter a semester name');
        return;
      }
      
      if (formData.startyear > formData.endyear) {
        setError('Start year must be less than or equal to end year');
        return;
      }
      
      // Prepare data to match database structure
      // Convert semester name to lowercase to avoid validation error
      const semesterData = {
        semester: formData.name.toLowerCase(), // Convert to lowercase
        semesterstartyear: formData.startyear.toString(),
        semesterendyear: formData.endyear.toString()
      };
      
      console.log('Sending semester data:', semesterData);
      
      // Create new semester
      const newSemester = await createSemester(semesterData);
      console.log('Received new semester data:', newSemester);
      
      // Format received data to match expected UI structure
      const formattedSemester = {
        id: newSemester.id,
        semester: newSemester.semester,
        name: newSemester.semester,
        startyear: newSemester.semesterstartyear,
        endyear: newSemester.semesterendyear,
        // Standardize created date field name to be createdat (lowercase)
        createdat: newSemester.createdAt || newSemester.createdat || new Date().toISOString(),
        endedat: newSemester.endedat
      };
      
      console.log('Formatted new semester:', formattedSemester);
      
      // Update current semester
      setCurrentSemester(formattedSemester);
      setShowNewSemesterForm(false);
      
      // Notify parent component of change
      if (onSemesterChange) {
        onSemesterChange(formattedSemester);
      }
      
      // Notify parent component of new semester creation
      if (onSemesterCreated) {
        onSemesterCreated(formattedSemester);
      }
    } catch (err) {
      console.error('Error creating semester:', err);
      
      // Display API error message if available
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Failed to create new semester: ${err.response.data.message}`);
      } else {
        setError('Failed to create new semester');
      }
    } finally {
      setLoading(false);
    }
  };

  // Request end semester confirmation
  const handleEndSemesterRequest = () => {
    setShowEndConfirmDialog(true);
  };

  // End current semester
  const handleEndSemester = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentSemester || !currentSemester.id) {
        setError('No current semester to end');
        return;
      }
      
      // End semester
      const endedSemester = await endSemester(currentSemester.id);
      
      // Update local semester state
      setCurrentSemester(null);
      setShowNewSemesterForm(true);
      
      // Notify parent component of change
      if (onSemesterChange) {
        onSemesterChange(null);
      }
      
      setShowEndConfirmDialog(false);
    } catch (err) {
      console.error('Error ending semester:', err);
      setError('Failed to end semester');
    } finally {
      setLoading(false);
    }
  };

  // In case of loading
  if (loading && !currentSemester && !showNewSemesterForm) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Loading semester data...</p>
      </div>
    );
  }

  console.log('Current semester:', currentSemester ? 'exists' : 'null');
  if (currentSemester) {
    console.log('Current semester createdAt:', currentSemester.createdat);
  }

  return (
    <div className={styles.semesterSettingsContainer}>
      <h2 className={styles.sectionTitle}>Semester Settings</h2>
      
      {/* Display error messages */}
      {error && (
        <div className={styles.errorMessage}>
          <svg xmlns="http://www.w3.org/2000/svg" className={styles.errorIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      {/* Display message if no active semester and creation form hasn't been shown yet */}
      {!currentSemester && !showNewSemesterForm && !loading && (
        <div className={styles.noActiveSemesterMessage}>
          <p>No active semester currently. Please create a new semester.</p>
          <button 
            className={styles.createSemesterButton}
            onClick={() => setShowNewSemesterForm(true)}
          >
            Create New Semester
          </button>
        </div>
      )}
      
      {/* Display current semester information */}
      {currentSemester && !currentSemester.endedat && (
        <div className={styles.currentSemesterInfo}>
          <div className={styles.semesterHeader}>
            <div>
              <h3 className={styles.semesterName}>
                {currentSemester.semester || 'Semester'} {currentSemester.startyear || ''}{currentSemester.startyear && currentSemester.endyear && '/'}{currentSemester.endyear || ''}
              </h3>
              <p className={styles.semesterStatus}>Active Semester</p>
            </div>
            <button 
              className={styles.endSemesterButton}
              onClick={handleEndSemesterRequest}
              disabled={loading}
            >
              End Semester
            </button>
          </div>
          
          <div className={styles.semesterDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Start Date:</span>
              <span className={styles.detailValue}>
                {
                  (() => {
                    if (!currentSemester) return 'Date not available';
                    
                    // Attempt to use any available date field
                    const dateValue = currentSemester.createdat || currentSemester.createdAt;
                    if (!dateValue) return 'Date not available';
                    
                    try {
                      console.log('Formatting date for:', dateValue);
                      const date = new Date(dateValue);
                      // Check if date is valid
                      return isNaN(date.getTime()) ? 
                        'Date not available' : 
                        date.toLocaleDateString('en-US');
                    } catch (e) {
                      console.error('Error formatting date:', e);
                      return 'Date not available';
                    }
                  })()
                }
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>ID:</span>
              <span className={styles.detailValue}>{currentSemester.id || '-'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Start Year:</span>
              <span className={styles.detailValue}>{currentSemester.startyear || '-'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>End Year:</span>
              <span className={styles.detailValue}>{currentSemester.endyear || '-'}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* New semester creation form */}
      {showNewSemesterForm && (
        <div className={styles.newSemesterForm}>
          <h3 className={styles.formTitle}>Create New Semester</h3>
          <form onSubmit={handleCreateSemester}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.formLabel}>Semester Name</label>
              <select
                id="name"
                name="name"
                className={styles.formSelect}
                value={formData.name}
                onChange={handleFormChange}
                required
              >
                <option value="">Select Semester</option>
                <option value="fall">fall (Fall)</option>
                <option value="spring">spring (Spring)</option>
                <option value="summer">summer (Summer)</option>
                <option value="winter">winter (Winter)</option>
              </select>
              <small className={styles.formHelperText}>
                All semester names must be in lowercase English letters
              </small>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="startyear" className={styles.formLabel}>Start Year</label>
                <input
                  type="number"
                  id="startyear"
                  name="startyear"
                  className={styles.formInput}
                  value={formData.startyear}
                  onChange={handleFormChange}
                  min="2020"
                  max="2050"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="endyear" className={styles.formLabel}>End Year</label>
                <input
                  type="number"
                  id="endyear"
                  name="endyear"
                  className={styles.formInput}
                  value={formData.endyear}
                  onChange={handleFormChange}
                  min="2020"
                  max="2050"
                  required
                />
              </div>
            </div>
            
            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.createSemesterButton}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Start New Semester'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* End semester confirmation dialog */}
      <ConfirmDialog
        isOpen={showEndConfirmDialog}
        title="End Semester Confirmation"
        message="Are you sure you want to end the current semester? This action cannot be undone."
        confirmText="End Semester"
        cancelText="Cancel"
        onConfirm={handleEndSemester}
        onCancel={() => setShowEndConfirmDialog(false)}
      />
    </div>
  );
} 