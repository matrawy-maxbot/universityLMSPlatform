'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getAllSemesters, getCurrentSemester } from '../api';
import styles from '../styles/SemesterSelector.module.css';

export default function SemesterSelector({ onSemesterChange }) {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use a ref to track if the initial fetch has been completed
  const initialFetchDone = useRef(false);
  // Use a ref to track the latest onSemesterChange callback to avoid dependency issues
  const onSemesterChangeRef = useRef(onSemesterChange);
  
  // Update the callback ref when the prop changes
  useEffect(() => {
    onSemesterChangeRef.current = onSemesterChange;
  }, [onSemesterChange]);
  
  // Format semester name with year for display
  const formatSemesterName = (semester) => {
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
    
    // Add active indicator
    if (semester.isActive || !semester.endedat) {
      displayName += ' (Active)';
    }
    
    return displayName;
  };
  
  // Memoize the fetch function to avoid recreating it on each render
  const fetchSemesters = useCallback(async () => {
    // Skip if we've already done the initial fetch
    if (initialFetchDone.current) {
      return;
    }
    
    try {
      console.log('Fetching semesters data');
      setLoading(true);
      setError(null);
      
      // Get all semesters
      const semestersData = await getAllSemesters();
      console.log('Received semesters data:', semestersData);
      
      // Get current semester
      const currentSemesterData = await getCurrentSemester();
      console.log('Received current semester data:', currentSemesterData);
      
      if (Array.isArray(semestersData) && semestersData.length > 0) {
        // Sort semesters by created date (newest first)
        const sortedSemesters = [...semestersData].sort((a, b) => {
          const dateA = new Date(a.createdat || 0);
          const dateB = new Date(b.createdat || 0);
          return dateB - dateA;
        });
        
        console.log('Sorted and processed semesters:', sortedSemesters);
        setSemesters(sortedSemesters);
        
        // Set the current semester as selected if available
        if (currentSemesterData) {
          console.log('Setting current semester as selected:', currentSemesterData);
          setSelectedSemester(currentSemesterData);
          if (onSemesterChangeRef.current) {
            onSemesterChangeRef.current(currentSemesterData);
          }
        } else if (sortedSemesters.length > 0) {
          // Otherwise use the most recent semester
          console.log('No current semester, using most recent:', sortedSemesters[0]);
          setSelectedSemester(sortedSemesters[0]);
          if (onSemesterChangeRef.current) {
            onSemesterChangeRef.current(sortedSemesters[0]);
          }
        }
      } else {
        console.warn('No semesters data received or empty array');
        setSemesters([]);
      }
      
      // Mark initial fetch as complete to prevent further automatic fetches
      initialFetchDone.current = true;
    } catch (err) {
      console.error('Error fetching semesters:', err);
      setError('Failed to load semesters');
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies to prevent recreation
  
  // Only fetch once when component mounts
  useEffect(() => {
    fetchSemesters();
    
    // Clean up function
    return () => {
      // Any cleanup needed
    };
  }, [fetchSemesters]);

  // Handle semester selection change
  const handleSemesterChange = (e) => {
    const semesterId = parseInt(e.target.value, 10);
    const selected = semesters.find(sem => sem.id === semesterId);
    
    if (selected) {
      console.log('Selected semester changed to:', selected);
      setSelectedSemester(selected);
      if (onSemesterChangeRef.current) {
        onSemesterChangeRef.current(selected);
      }
    }
  };

  // Manual refresh function if needed
  const handleRefresh = async () => {
    // Reset the flag to allow fetching again
    initialFetchDone.current = false;
    await fetchSemesters();
  };

  return (
    <div className={styles.semesterSelector}>
      <div className={styles.selectorHeader}>
        <label htmlFor="semester-select" className={styles.selectorLabel}>
          Select Semester:
        </label>
        
        <select
          id="semester-select"
          className={styles.selectorDropdown}
          value={selectedSemester?.id || ''}
          onChange={handleSemesterChange}
          disabled={loading || semesters.length === 0}
        >
          {semesters.length === 0 ? (
            <option value="">No semesters available</option>
          ) : (
            semesters.map(semester => (
              <option key={semester.id} value={semester.id}>
                {formatSemesterName(semester)}
              </option>
            ))
          )}
        </select>
        
        <button 
          className={styles.refreshButton}
          onClick={handleRefresh}
          disabled={loading}
          title="Refresh semesters list"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
        </button>
      </div>
      
      {loading && (
        <div className={styles.loadingIndicator}>
          <span className={styles.loadingDot}></span>
          <span className={styles.loadingDot}></span>
          <span className={styles.loadingDot}></span>
        </div>
      )}
      
      {error && (
        <div className={styles.errorMessage}>
          <svg xmlns="http://www.w3.org/2000/svg" className={styles.errorIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
} 