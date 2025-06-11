'use client';

import { useEffect, useState, useRef } from 'react';
// Import mock data and functions instead of axios
import { delay, mockAvailableCourses, mockRegisteredCourses, mockApis } from '../mockData/mockRegistrationData';

export default function RegistrationManager({ studentData, currentSemester, registrationSettings }) {
  const [selectedHours, setSelectedHours] = useState(0);
  const [maxHours, setMaxHours] = useState(18);
  const [minHours, setMinHours] = useState(9);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registrationError, setRegistrationError] = useState(null);
  const [isUnregisterDialogOpen, setIsUnregisterDialogOpen] = useState(false);
  const [courseToUnregister, setCourseToUnregister] = useState(null);
  const [unregisterLoading, setUnregisterLoading] = useState(false);
  const [unregisterError, setUnregisterError] = useState(null);
  const [registeredHours, setRegisteredHours] = useState(0);

  const semesterFooterRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        console.log('Fetching available courses using mock data...');
        
        // Use mock API functions instead of axios
        const availableResponse = await mockApis.getAvailableCourses();
        console.log('Available Courses Response:', availableResponse.data);
        
        const availableCourseData = availableResponse.data || [];
        
        // Transform the available courses data
        const formattedAvailableCourses = availableCourseData.map(course => {
          // Make sure we have proper course information by checking different possible data structures
          const courseName = course.coursename || course.name || course.course?.name || 'Unnamed Course';
          const courseCode = course.coursecode || course.code || course.course?.code || 'Unknown Code';
          const courseHours = course.coursehours || course.hours || course.course?.hours || 3;
          
          return {
            id: courseCode,
            name: courseName,
            code: courseCode,
            hours: courseHours,
            description: course.description || course.course?.description || 'No description available',
            prerequisites: course.prerequisites || [],
            instructor: course.instructor || 'TBA',
            isRegistered: false,
            isNew: false
          };
        });
        
        console.log('Formatted Available Courses:', formattedAvailableCourses);
        
        setAvailableCourses(formattedAvailableCourses);

        // Fetch registered courses for current semester
        try {
          const registeredResponse = await mockApis.getRegisteredCourses(currentSemester.id);
          
          console.log('Registered Courses Response - FULL DATA:', JSON.stringify(registeredResponse.data, null, 2));
          
          const registeredCourseData = registeredResponse.data || [];
          
          // Transform the registered courses data
          const formattedRegisteredCourses = registeredCourseData.map(course => {
            console.log('Processing course item:', course);
            
            // استخراج بيانات الكورس من خاصية Course
            const courseData = course.Course || {};
            
            // استخراج البيانات الأساسية
            const courseName = courseData.coursename || 'Course ' + course.courseid;
            const courseCode = courseData.coursecode || course.courseid || 'Unknown Code';
            const courseHours = courseData.coursehours || 3;
            
            console.log('Extracted course data:', { courseName, courseCode, courseHours });
            
            return {
              id: course.id || courseCode,
              name: courseName,
              code: courseCode,
              hours: courseHours,
              description: courseData.description || 'No description available',
              confirmed: course.confirm || false,
              registrationDate: course.createdAt,
              isRegistered: true, // Mark as already registered
              isNew: false,
              registrationId: course.id // Store the actual registration ID for deletion
            };
          });
          
          console.log('Final Formatted Registered Courses:', formattedRegisteredCourses);
          
          setRegisteredCourses(formattedRegisteredCourses);
          
          // Calculate total registered hours
          const totalRegisteredHours = formattedRegisteredCourses.reduce((total, course) => total + course.hours, 0);
          setRegisteredHours(totalRegisteredHours);
          
          // Do NOT initialize selected courses with registered courses
          // Instead, keep them separate
          setSelectedCourses([]);
          setSelectedHours(0);
          
          // Remove registered courses from available courses to prevent duplicate selection
          if (formattedRegisteredCourses.length > 0) {
            const registeredCourseIds = formattedRegisteredCourses.map(course => course.code);
            console.log('Registered course IDs to filter out:', registeredCourseIds);
            
            // Make sure we filter available courses properly
            setAvailableCourses(prev => {
              const filtered = prev.filter(course => !registeredCourseIds.includes(course.code));
              console.log('Available courses after filtering:', filtered);
              return filtered;
            });
          }
        } catch (err) {
          console.error('Error fetching registered courses:', err);
          // Don't fail the whole component if just this request fails
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching available courses:', err);
        setError('Failed to load available courses');
        setLoading(false);
      }
    };

    // Set hours limits from registration settings
    if (registrationSettings) {
      // Set max hours from registration settings or student data
      if (registrationSettings.maxhours) {
        setMaxHours(registrationSettings.maxhours);
      } else if (studentData && studentData.student) {
        setMaxHours(studentData.student.maxhours || 18);
      }
      
      // Set min hours from registration settings
      if (registrationSettings.minhours) {
        setMinHours(registrationSettings.minhours);
      }
    }

    fetchData();
  }, [studentData, registrationSettings, currentSemester]);

  const addCourseToSelected = (course) => {
    // Add flags to identify course status
    const courseWithFlags = { 
      ...course, 
      isNew: true
    };
    
    console.log('Adding course with flags:', courseWithFlags);
    
    // Check if adding this course would exceed max hours
    const totalHours = selectedHours + registeredHours + course.hours;
    if (totalHours > maxHours) {
      setIsErrorDialogOpen(true);
      return;
    }

    setSelectedCourses([...selectedCourses, courseWithFlags]);
    setAvailableCourses(availableCourses.filter(c => c.id !== course.id));
    setSelectedHours(selectedHours + course.hours);
  };

  const removeCourseFromSelected = (course) => {
    setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
    setAvailableCourses([...availableCourses, course]);
    setSelectedHours(selectedHours - course.hours);
  };

  const handleUnregisterCourse = (course) => {
    setCourseToUnregister(course);
    setIsUnregisterDialogOpen(true);
  };

  const confirmUnregister = async () => {
    if (!courseToUnregister || !courseToUnregister.registrationId) return;
    
    setUnregisterLoading(true);
    setUnregisterError(null);
    
    try {
      // Use mock API instead of axios
      await mockApis.unregisterCourse(courseToUnregister.registrationId);
      
      // Update state to remove the unregistered course
      setRegisteredCourses(registeredCourses.filter(c => c.registrationId !== courseToUnregister.registrationId));
      
      // Update registered hours
      setRegisteredHours(prevHours => prevHours - (courseToUnregister.hours || 0));
      
      // Add the course back to available courses
      setAvailableCourses(prev => [...prev, {
        ...courseToUnregister,
        isRegistered: false,
        isNew: false
      }]);
      
      // Close dialog and reset state
      setIsUnregisterDialogOpen(false);
      setCourseToUnregister(null);
      
      // Show success message
      alert('تم إلغاء تسجيل المقرر بنجاح');
    } catch (err) {
      console.error('Error unregistering course:', err);
      setUnregisterError('فشل في إلغاء تسجيل المقرر. يرجى المحاولة مرة أخرى.');
    } finally {
      setUnregisterLoading(false);
    }
  };

  const handleRegister = () => {
    // Reset error state
    setRegistrationError(null);
    
    // Check if any new courses are selected
    if (selectedCourses.length === 0) {
      setRegistrationError('الرجاء اختيار مقرر واحد على الأقل للتسجيل.');
      return;
    }
    
    // Check minimum hours requirement
    const totalHours = selectedHours + registeredHours;
    if (totalHours < minHours) {
      setRegistrationError(`يجب أن تسجل ما لا يقل عن ${minHours} ساعات معتمدة.`);
      return;
    }
    
    setIsConfirmDialogOpen(true);
  };

  const handleConfirm = async () => {
    try {
      // Prepare registration data with only new courses
      const registrationData = {
        semesterId: currentSemester.id,
        courses: selectedCourses.map(course => course.code)
      };
      
      console.log('Sending registration data:', registrationData);
      
      // Use mock API instead of axios
      const response = await mockApis.registerCourses(registrationData);
      
      console.log('Registration Response:', response.data);
      
      setIsConfirmDialogOpen(false);
      setIsSuccessDialogOpen(true);
    } catch (err) {
      console.error('Error registering courses:', err);
      setRegistrationError('Failed to register courses. Please try again.');
      setIsConfirmDialogOpen(false);
    }
  };

  if (loading) return <div className="loading">Loading course information...</div>;
  if (error) return <div className="error">{error}</div>;

  // Calculate total hours (registered + selected)
  const totalHours = registeredHours + selectedHours;

  return (
    <>
      {/* Main Container with both sections */}
      <div className="registration-main-container">
        {/* Registered Courses Section (always shown at the top) */}
        <div className="registered-courses-container">
          <div className="courses-column full-width">
            <h2 className="courses-title">My Registered Courses</h2>
            <p className="courses-subtitle">Current semester registered courses</p>
            
            {registeredCourses.length === 0 ? (
              <div className="no-courses-message">You haven't registered for any courses yet</div>
            ) : (
              <>
                <div className="registered-courses-list">
                  {registeredCourses.map((course, index) => (
                    <div key={course.id || index} className={`registered-course-item ${course.confirmed ? 'confirmed' : 'pending'}`}>
                      <div className="course-info">
                        <h3>{course.name || 'Unnamed Course'}</h3>
                        <div className="course-details">
                          <span className="course-code">{course.code || 'Unknown Code'}</span>
                          <span className="course-hours">{course.hours || 3} Hours</span>
                          <span className={`course-status ${course.confirmed ? 'confirmed' : 'pending'}`}>
                            {course.confirmed ? 'Confirmed' : 'Pending Approval'}
                          </span>
                        </div>
                      </div>
                      <button 
                        className="unregister-course-btn"
                        onClick={() => handleUnregisterCourse(course)}
                        title="إلغاء تسجيل المقرر"
                      >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="registered-summary">
                  <div className="total-registered">
                    <span>Total Courses: {registeredCourses.length}</span>
                    <span>Total Hours: {registeredHours}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Registration Section (always shown below) */}
        <div className="courses-selection-container">
          <h2 className="section-title">Registration</h2>
          
          <div className="courses-column">
            <h2 className="courses-title">Available Courses</h2>
            <p className="courses-subtitle">Select courses to register</p>
            
            <div className="courses-list">
              {availableCourses.length === 0 ? (
                <div className="no-courses-message">No available courses found for your level</div>
              ) : (
                availableCourses.map(course => (
                  <div key={course.id} className="course-item" data-id={course.id}>
                    <div className="course-info">
                      <h3>{course.name}</h3>
                      <div className="course-details">
                        <span className="course-code">{course.code}</span>
                        <span className="course-hours">{course.hours} Hours</span>
                      </div>
                    </div>
                    <button 
                      className="add-course-btn"
                      onClick={() => addCourseToSelected(course)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="courses-column">
            <h2 className="courses-title">Selected Courses</h2>
            <p className="courses-subtitle">New courses to be registered</p>
            
            <div className="courses-list">
              {selectedCourses.length === 0 ? (
                <div className="no-courses-message">No courses selected yet</div>
              ) : (
                selectedCourses.map(course => (
                  <div key={course.id} className="course-item selected" data-id={course.id}>
                    <div className="course-info">
                      <h3>{course.name}</h3>
                      <div className="course-details">
                        <span className="course-code">{course.code}</span>
                        <span className="course-hours">{course.hours} Hours</span>
                        <span className="course-status new">New</span>
                      </div>
                    </div>
                    <button 
                      className="remove-course-btn"
                      onClick={() => removeCourseFromSelected(course)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="semester-footer" ref={semesterFooterRef}>
            <div className="semester-info">
              <div className="semester-detail">
                <p>Min Hours: <span>{minHours}</span></p>
              </div>
              <div className="semester-detail">
                <p>Max Hours: <span>{maxHours}</span></p>
              </div>
              <div className="semester-detail">
                <p>Registered Hours: <span>{registeredHours}</span></p>
              </div>
              <div className="semester-detail">
                <p>Selected Hours: <span>{selectedHours}</span></p>
              </div>
              <div className="semester-detail">
                <p>Total Hours: <span>{totalHours}</span></p>
              </div>
            </div>
            
            {registrationError && (
              <div className="registration-error-message">{registrationError}</div>
            )}
            
            <button 
              className={`register-button ${selectedCourses.length === 0 || totalHours < minHours ? 'disabled' : ''}`}
              onClick={handleRegister}
              disabled={selectedCourses.length === 0 || totalHours < minHours}
            >
              Register Courses
            </button>
          </div>
        </div>
      </div>
      
      {/* Registration Confirmation Dialog */}
      {isConfirmDialogOpen && (
        <div className="registration-dialog">
          <div className="dialog-content">
            <div className="dialog-header">
              <h3>Confirm Registration</h3>
              <button className="close-dialog" onClick={() => setIsConfirmDialogOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="dialog-body">
              <div className="dialog-message">
                You are about to register for the following new courses:
              </div>
              <div className="selected-courses-list">
                {selectedCourses.map(course => (
                  <div key={course.id} className="course-row">
                    <div className="course-info-dialog">
                      <h4 className="course-title">{course.name}</h4>
                      <div className="course-details-small">
                        <span className="course-code">{course.code}</span>
                        <span className="course-hours">{course.hours} Hours</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hours-summary">
                <p>Total Selected Hours: <span className="total-hours">{selectedHours}</span></p>
                <p>Already Registered Hours: <span className="total-hours">{registeredHours}</span></p>
                <p>Total Hours: <span className="total-hours">{totalHours}</span></p>
              </div>
            </div>
            <div className="dialog-footer">
              <button className="cancel-btn" onClick={() => setIsConfirmDialogOpen(false)}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleConfirm}>
                Confirm Registration
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Dialog */}
      {isSuccessDialogOpen && (
        <div className="registration-dialog">
          <div className="dialog-content">
            <div className="dialog-header">
              <h3>Registration Successful</h3>
              <button className="close-dialog" onClick={() => setIsSuccessDialogOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="dialog-body">
              <div className="success-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9033 20.9782 14.8354 21.5896C12.7674 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="dialog-message">
                Your course registration was successful! 
                You have registered for {selectedCourses.length} new courses, bringing your total to {selectedCourses.length + registeredCourses.length} courses ({totalHours} credit hours).
              </div>
            </div>
            <div className="dialog-footer">
              <button className="confirm-btn" onClick={() => {
                setIsSuccessDialogOpen(false);
                window.location.reload();
              }}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Dialog */}
      {isErrorDialogOpen && (
        <div className="registration-dialog" id="max-hours-error-dialog">
          <div className="dialog-content">
            <div className="dialog-header">
              <h3>Maximum Hours Exceeded</h3>
              <button className="close-dialog" onClick={() => setIsErrorDialogOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="dialog-body">
              <div className="error-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="dialog-message">
                You cannot register for more than <span className="max-hours">{maxHours}</span> credit hours this semester.
                <br />
                Current registered hours: {registeredHours}
                <br />
                Attempted to add: {selectedHours + registeredHours} hours
              </div>
            </div>
            <div className="dialog-footer">
              <button className="confirm-btn" onClick={() => setIsErrorDialogOpen(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Unregister Confirmation Dialog */}
      {isUnregisterDialogOpen && courseToUnregister && (
        <div className="registration-dialog">
          <div className="dialog-content">
            <div className="dialog-header">
              <h3>Confirm Unregistration</h3>
              <button className="close-dialog" onClick={() => {
                setIsUnregisterDialogOpen(false);
                setCourseToUnregister(null);
              }}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="dialog-body">
              <div className="warning-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12M12 16H12.01M21.73 18L13.73 4.99C13.5396 4.6746 13.2772 4.40679 12.9655 4.21211C12.6538 4.01743 12.3018 3.90016 11.9423 3.87279C11.5829 3.84541 11.2195 3.90892 10.8877 4.05795C10.5558 4.20698 10.2666 4.43689 10.04 4.726L2.03999 18C1.81395 18.292 1.66876 18.6342 1.61805 18.9955C1.56733 19.3568 1.61292 19.7248 1.75083 20.0655C1.88873 20.4062 2.11433 20.7081 2.40553 20.9414C2.69674 21.1746 3.04398 21.3309 3.40999 21.394C3.91999 21.462 6.40999 22 12 22C17.59 22 20.08 21.462 20.59 21.394C20.956 21.3309 21.3032 21.1746 21.5944 20.9414C21.8856 20.7081 22.1112 20.4062 22.2491 20.0655C22.387 19.7248 22.4326 19.3568 22.3819 18.9955C22.3312 18.6342 22.186 18.292 21.96 18H21.73Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="dialog-message">
                هل أنت متأكد أنك تريد إلغاء تسجيل المقرر التالي؟
              </div>
              <div className="selected-courses-list">
                <div className="course-row">
                  <div className="course-info-dialog">
                    <h4 className="course-title">{courseToUnregister.name}</h4>
                    <div className="course-details-small">
                      <span className="course-code">{courseToUnregister.code}</span>
                      <span className="course-hours">{courseToUnregister.hours} Hours</span>
                      <span className={`course-status ${courseToUnregister.confirmed ? 'confirmed' : 'pending'}`}>
                        {courseToUnregister.confirmed ? 'Confirmed' : 'Pending Approval'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {unregisterError && (
                <div className="dialog-error">
                  {unregisterError}
                </div>
              )}
            </div>
            <div className="dialog-footer">
              <button 
                className="cancel-btn" 
                onClick={() => {
                  setIsUnregisterDialogOpen(false);
                  setCourseToUnregister(null);
                }}
                disabled={unregisterLoading}
              >
                إلغاء
              </button>
              <button 
                className="confirm-btn danger"
                onClick={confirmUnregister}
                disabled={unregisterLoading}
              >
                {unregisterLoading ? 'جاري إلغاء التسجيل...' : 'تأكيد إلغاء التسجيل'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 