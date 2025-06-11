'use client';

import { useState, useEffect } from 'react';
import { getRegistrationSettings, updateRegistrationSettings } from './api';
import styles from './styles/page.module.css';
import SettingsForm from './components/SettingsForm';
import GPAConditionsList from './components/GPAConditionsList';
import CourseSelectionList from './components/CourseSelectionList';
import SemesterSettings from './components/SemesterSettings';

export default function RegisterSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [showRegistrationSettings, setShowRegistrationSettings] = useState(false);

  // Fetch registration settings
  useEffect(() => {
    if (!currentSemester) {
      // Only fetch registration settings if there is an active semester
      return;
    }

    // Variable to control cancellation when component unmounts
    let isMounted = true;
    let timeoutId = null;

    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching registration settings for semester:', currentSemester.id);
        
        const data = await getRegistrationSettings();
        
        // Make sure the component is still mounted before updating state
        if (!isMounted) return;
        
        console.log('Received registration settings:', data);
        
        // Verify data structure and ensure all required properties exist
        if (!data) {
          console.error('Received null or undefined data from API');
          setError('Failed to fetch registration settings: Invalid data received');
          return;
        }
        
        // Check if data contains expected properties
        if (typeof data !== 'object') {
          console.error('Received non-object data:', data);
          setError('Failed to fetch registration settings: Invalid data format');
          return;
        }
        
        // Ensure the data is associated with the current semester
        const settingsWithSemesterId = {
          ...data,
          semesterid: data.semesterid || currentSemester.id
        };
        
        setSettings(settingsWithSemesterId);
        setShowRegistrationSettings(true);
      } catch (err) {
        console.error('Error fetching registration settings:', err);
        if (isMounted) {
          setError('Failed to fetch registration settings');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Short delay to avoid consecutive requests when changing semester
    timeoutId = setTimeout(fetchSettings, 400);

    // Cleanup when component is removed
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentSemester?.id]); // Use only semester ID to avoid re-execution on any change in semester object

  // Handle changes to basic registration settings
  const handleSettingsChange = (newSettings) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };

  // Add new GPA condition
  const handleAddGPACondition = (condition) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      gpaconditions: [...(prevSettings.gpaconditions || []), condition]
    }));
  };

  // Remove GPA condition
  const handleRemoveGPACondition = (index) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      gpaconditions: prevSettings.gpaconditions.filter((_, i) => i !== index)
    }));
  };

  // Add course to remaining courses
  const handleAddRemainingCourse = (courseId) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      remainingcoursesids: [...(prevSettings.remainingcoursesids || []), courseId]
    }));
  };

  // Remove course from remaining courses
  const handleRemoveRemainingCourse = (courseId) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      remainingcoursesids: prevSettings.remainingcoursesids.filter(id => id !== courseId)
    }));
  };

  // Add course to specified courses
  const handleAddSpecifiedCourse = (courseId) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      specifiedcourses: [...(prevSettings.specifiedcourses || []), courseId]
    }));
  };

  // Remove course from specified courses
  const handleRemoveSpecifiedCourse = (courseId) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      specifiedcourses: prevSettings.specifiedcourses.filter(id => id !== courseId)
    }));
  };

  // Save all settings
  const handleSaveSettings = async () => {
    try {
      setSaveLoading(true);
      setSaveMessage(null);
      setError(null);

      // Update semester ID in settings
      const updatedSettings = {
        ...settings,
        semesterid: currentSemester?.id || settings.semesterid
      };

      console.log('Saving settings:', updatedSettings);
      
      // Validate settings before saving
      if (!updatedSettings.semesterid) {
        setError('Cannot save settings: No semester selected');
        return;
      }
      
      const response = await updateRegistrationSettings(updatedSettings);
      console.log('Save response:', response);
      
      // Update local state with the returned data to ensure consistency
      if (response) {
        setSettings(response);
      }
      
      setSaveMessage('Settings saved successfully');
      
      // Remove success message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      
      // Provide more detailed error message if available
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Failed to save settings: ${err.response.data.message}`);
      } else {
        setError('Failed to save settings');
      }
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle semester change
  const handleSemesterChange = (semester) => {
    console.log('Semester changed to:', semester);
    setCurrentSemester(semester);
  };

  // Handle new semester creation
  const handleSemesterCreated = (semester) => {
    console.log('New semester created:', semester);
    setCurrentSemester(semester);
    
    // Create default registration settings for the new semester
    setSettings({
      open: false,
      maxhours: 18,
      minhours: 2,
      gpaconditions: [
        {
          lowerthan: 2.0,
          maxhours: 12
        }
      ],
      remainingcoursesids: [],
      semesterid: semester.id,
      specifiedcourses: []
    });
    
    setShowRegistrationSettings(true);
  };

  // Ensure settings are synced with semester
  useEffect(() => {
    if (currentSemester && settings && settings.semesterid !== currentSemester.id) {
      console.log('Syncing settings with current semester ID');
      setSettings(prev => ({
        ...prev,
        semesterid: currentSemester.id
      }));
    }
  }, [currentSemester, settings]);

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Registration Settings</h1>
      
      {/* Semester Settings Component */}
      <SemesterSettings 
        onSemesterChange={handleSemesterChange} 
        onSemesterCreated={handleSemesterCreated}
      />

      {/* Additional information about current semester */}
      {currentSemester && (
        <div className={styles.currentSemesterSummary}>
          <p>
            Current settings for semester: 
            <strong>
              {(() => {
                if (!currentSemester) return 'Semester';
                
                const semName = currentSemester.semester || 'Semester';
                const startYear = currentSemester.startyear || '';
                const endYear = currentSemester.endyear || '';
                const yearText = startYear ? (endYear ? `${startYear}/${endYear}` : startYear) : '';
                
                return `${semName} ${yearText}`;
              })()}
            </strong>
            {currentSemester && !currentSemester.endedat && <span className={styles.activeSemesterBadge}>Active</span>}
          </p>
        </div>
      )}
      
      {/* Display registration settings only if there is an active semester */}
      {showRegistrationSettings ? (
        <>
          {/* Loading state */}
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading registration settings...</p>
            </div>
          ) : (
            <>
              {/* Error messages */}
              {error && (
                <div className={styles.errorMessage}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={styles.errorIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
              
              {/* Success messages */}
              {saveMessage && (
                <div className={styles.successMessage}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={styles.successIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{saveMessage}</span>
                </div>
              )}
              
              {settings && (
                <div className={styles.settingsContainer}>
                  {/* Basic Settings Form */}
                  <SettingsForm 
                    settings={{
                      open: !!settings.open,
                      maxhours: Number(settings.maxhours) || 18,
                      minhours: Number(settings.minhours) || 2,
                      ...settings
                    }} 
                    onChange={handleSettingsChange} 
                  />
                  
                  {/* GPA Conditions List */}
                  <GPAConditionsList 
                    conditions={Array.isArray(settings.gpaconditions) ? settings.gpaconditions : []} 
                    onAddCondition={handleAddGPACondition} 
                    onRemoveCondition={handleRemoveGPACondition}
                  />
                  
                  <div className={styles.coursesSection}>
                    <div className={styles.coursesGrid}>
                      {/* Remaining Courses List */}
                      <CourseSelectionList 
                        title="Remaining Courses" 
                        description="Select courses that students can register for even if prerequisites are not completed" 
                        courseIds={Array.isArray(settings.remainingcoursesids) ? settings.remainingcoursesids : []} 
                        onAddCourse={handleAddRemainingCourse} 
                        onRemoveCourse={handleRemoveRemainingCourse}
                        listType="remaining"
                      />
                      
                      {/* Specified Courses List */}
                      <CourseSelectionList 
                        title="Specified Courses" 
                        description="Select courses that will be shown to students in this semester" 
                        courseIds={Array.isArray(settings.specifiedcourses) ? settings.specifiedcourses : []} 
                        onAddCourse={handleAddSpecifiedCourse} 
                        onRemoveCourse={handleRemoveSpecifiedCourse}
                        listType="specified"
                      />
                    </div>
                  </div>
                  
                  {/* Save button */}
                  <div className={styles.saveActions}>
                    <button 
                      className={styles.saveButton} 
                      onClick={handleSaveSettings} 
                      disabled={saveLoading}
                    >
                      {saveLoading ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        !currentSemester && !loading && (
          <div className={styles.noSemesterMessage}>
            <svg xmlns="http://www.w3.org/2000/svg" className={styles.infoIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              No active semester currently. Please create a new semester to set up registration settings.
              <br />
              <small className={styles.helperText}>Create a new semester using the form above.</small>
            </p>
          </div>
        )
      )}
    </div>
  );
} 