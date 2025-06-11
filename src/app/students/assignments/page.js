'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import './styles/page.css';
import { formatTimeRemaining, validateFile, downloadFile, setupClickOutsideHandler, formatDate, calculateTimeElapsed } from './components/script';
import { getStudentAssignments, getStudentAssignmentById, submitAssignment, downloadAssignmentFile, getStudentAssignmentsByCourse } from './api';

export default function Assignments() {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileError, setFileError] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const dialogRef = useRef(null);

  // Set isMounted to true after component mounts (client-side only)
  useEffect(() => {
    setIsMounted(true);
    setCurrentTime(new Date());
    
    // Update current time every minute
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  // جلب بيانات الواجبات من API
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        
        let data;
        if (selectedCourse) {
          console.log("selectedCourse frontend was selected: ", selectedCourse);
          // If a course is selected, fetch assignments for that specific course
          data = await getStudentAssignmentsByCourse(selectedCourse);
        } else {
          // Otherwise fetch all assignments
          data = await getStudentAssignments();
        }
        
        console.log("Fetched assignments:", data);
        setAssignments(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching assignments:", err);
        setError("Failed to load assignments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (isMounted) {
      fetchAssignments();
    }
  }, [isMounted, selectedCourse]);

  // Set up click outside handler when dialog is open
  useEffect(() => {
    let cleanup;
    
    if (isDialogOpen) {
      cleanup = setupClickOutsideHandler(() => {
        setIsDialogOpen(false);
      });
    }
    
    // Clean up event listener when component unmounts or dialog closes
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [isDialogOpen]);

  const handleAssignmentClick = async (assignment) => {
    try {
      // جلب تفاصيل الواجب الكاملة
      const detailedAssignment = await getStudentAssignmentById(assignment.id);
      console.log("Detailed assignment:", detailedAssignment);
      
      setSelectedAssignment(detailedAssignment);
      setIsDialogOpen(true);
      setSelectedFiles([]);
      setFileError(null);
    } catch (err) {
      console.error("Error fetching assignment details:", err);
      // في حالة الفشل، استخدم البيانات المتوفرة
      setSelectedAssignment(assignment);
      setIsDialogOpen(true);
      setSelectedFiles([]);
      setFileError(null);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    let hasError = false;
    
    const validatedFiles = files.map(file => {
      const validation = validateFile(file, ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
      if (!validation.valid) {
        hasError = true;
        setFileError(`File "${file.name}": ${validation.message}`);
        return null;
      }
      return file;
    }).filter(file => file !== null);

    if (!hasError) {
      setSelectedFiles(prev => [...prev, ...validatedFiles]);
      setFileError(null);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      if (selectedAssignment && selectedFiles.length > 0) {
        setLoading(true);
        const result = await submitAssignment(selectedAssignment.id, selectedFiles);
        console.log('Submission result:', result);
        
        // تحديث حالة الواجب في القائمة المحلية
        const updatedAssignments = assignments.map(assignment => {
          if (assignment.id === selectedAssignment.id) {
            return {
              ...assignment,
              status: 'submitted'
            };
          }
          return assignment;
        });
        
        setAssignments(updatedAssignments);
        
        // إغلاق نافذة الحوار
        setIsDialogOpen(false);
        
        // إظهار رسالة نجاح
        alert('Assignment submitted successfully!');
      } else {
        setFileError('Please select at least one file to submit.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setFileError('Failed to submit assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileDownload = async (file) => {
    try {
      const fileBlob = await downloadAssignmentFile(file.id);
      
      // إنشاء عنصر رابط للتنزيل
      const url = window.URL.createObjectURL(fileBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      
      // تنظيف بعد التنزيل
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  // Calculate time elapsed percentage for active assignment
  const getElapsedPercentage = (assignment) => {
    if (!isMounted || !currentTime || !assignment || assignment.status !== 'active') {
      return 0;
    }
    
    return calculateTimeElapsed(new Date(assignment.startTime), new Date(assignment.endTime), currentTime);
  };

  // Group assignments by course
  const assignmentsByCourse = assignments.reduce((acc, assignment) => {
    console.log("assignment frontend: ", assignment);
    const courseId = assignment.courseId || 'unknown';
    const courseName = assignment.course || 'Unknown Course';
    console.log("courseId frontend: ", courseId);
    if (!acc[courseId]) {
      acc[courseId] = {
        name: courseName,
        assignments: []
      };
    }
    
    acc[courseId].assignments.push(assignment);
    return acc;
  }, {});

  // Handle course selection
  const handleCourseSelect = (courseId) => {
    console.log("courseId frontend selected: ", courseId);
    setSelectedCourse(courseId === selectedCourse ? null : courseId);
  };

  if (loading && assignments.length === 0) {
    return (
      <div className="assignments-container">
        <div className="assignments-header">
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (error && assignments.length === 0) {
    return (
      <div className="assignments-container">
        <div className="assignments-header">
          <h1>Assignments</h1>
        </div>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">Retry</button>
        </div>
      </div>
    );
  }

  if (assignments.length === 0 && !loading) {
    return (
      <div className="assignments-container">
        <div className="assignments-header">
          <h1>Assignments</h1>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h2>No Assignments</h2>
          <p>You don't have any assignments at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="assignments-container">
      <div className="assignments-header">
        
        {/* Filter by course - Button based */}
        {Object.keys(assignmentsByCourse).length > 0 && (
          <div className="course-selector">
            <h3>Filter by Course:</h3>
            <div className="course-buttons">
              <button 
                className={`course-button ${selectedCourse === null ? 'active' : ''}`}
                onClick={() => setSelectedCourse(null)}
              >
                All Courses
              </button>
              {Object.entries(assignmentsByCourse).map(([courseId, { name }]) => (
                <button 
                  key={courseId} 
                  className={`course-button ${selectedCourse === courseId ? 'active' : ''}`}
                  onClick={() => handleCourseSelect(courseId)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="assignments-list">
        {Object.entries(assignmentsByCourse).map(([courseId, { name, assignments: courseAssignments }]) => (
          <div key={courseId} className="course-group">
            <div className="course-header">
              <svg className="course-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35.34 42">
                <path d="M5.35,33.53h28.61c.09,0,.17-.01.25-.03,0,0,.01,0,.02,0,.61,0,1.11-.5,1.11-1.11V1.11c0-.61-.5-1.11-1.11-1.11H5.35C2.4,0,0,2.4,0,5.34c0,.04,0,.08.01.12,0,2.72-.04,27.72,0,31.01,0,.06,0,.13,0,.19,0,2.83,2.22,5.15,5.01,5.33.06,0,.11.02.17.02h29.05c.61,0,1.11-.5,1.11-1.11v-4.17c0-.61-.5-1.11-1.11-1.11s-1.11.5-1.11,1.11v3.06H5.35c-1.68,0-3.06-1.34-3.12-3,0-.03,0-.06,0-.09,0-.05,0-.12,0-.22.1-1.64,1.46-2.94,3.12-2.94h0ZM6.1,5.34c0-.61.5-1.11,1.11-1.11s1.11.5,1.11,1.11v22.48c0,.61-.5,1.11-1.11,1.11s-1.11-.5-1.11-1.11V5.34h0Z"></path>
              </svg>
              <h2 className="course-title">Course : {name}</h2>
            </div>
            
            {courseAssignments.map((assignment) => (
              <div 
                key={assignment.id} 
                className="assignment-card"
                onClick={() => handleAssignmentClick(assignment)}
              >
                <div className="assignment-content">
                  <div className="assignment-header">
                    <svg className="bookmark-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <h3 className="assignment-title">{assignment.title}</h3>
                  </div>
                  
                  <div className="assignment-meta">
                    <div className="instructor-info">
                      <Image src="/images/shadcn.jpg" alt={assignment.instructor} className="instructor-avatar" width={24} height={24} />
                      <span className="instructor-name">{assignment.instructor}</span>
                      <span className="separator">•</span>
                      <span className="created-date">Created {isMounted ? formatDate(assignment.createdAt) : ''}</span>
                      <span className={`status-badge ${assignment.status}`}>
                        {assignment.status === 'active' ? 'Active' : 
                         assignment.status === 'submitted' ? 'Submitted' : 
                         assignment.status === 'completed' ? 'Completed' :
                         assignment.status === 'scheduled' ? 'Scheduled' : 'Missing'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="time-indicator">
                  <svg className="time-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeDasharray="63" strokeDashoffset="20"></circle>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                  <span className="time-text">
                    {assignment.finished ? 'Finished' : 
                     `${assignment.daysLeft} days left`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Dialog for assignment details */}
      {isDialogOpen && selectedAssignment && (
        <div className="assignment-dialog-overlay">
          <div className="assignment-dialog" ref={dialogRef}>
            <button 
              className="dialog-close-btn"
              onClick={() => setIsDialogOpen(false)}
            >
              &times;
            </button>
            
            <div className="assignment-dialog-header">
              <h2 className="dialog-title">{selectedAssignment.title}</h2>
              <span className={`status-badge ${selectedAssignment.status}`}>
                {selectedAssignment.status === 'active' ? 'Active' : 
                 selectedAssignment.status === 'submitted' ? 'Submitted' : 
                 selectedAssignment.status === 'completed' ? 'Completed' :
                 selectedAssignment.status === 'scheduled' ? 'Scheduled' : 'Missing'}
              </span>
            </div>
            
            <div className="dialog-content">
              <div className="assignment-info-section">
                <div className="info-item">
                  <h3>Course:</h3>
                  <p>{selectedAssignment.course}</p>
                </div>
                
                <div className="info-item">
                  <h3>Instructor:</h3>
                  <p>{selectedAssignment.instructor}</p>
                </div>
                
                <div className="info-item">
                  <h3>Created on:</h3>
                  <p>{isMounted ? formatDate(selectedAssignment.createdAt) : 'Loading...'}</p>
                </div>
              </div>
              
              <div className="assignment-time-section">
                <h3>Assignment Schedule:</h3>
                <div className="time-details">
                  <div className="time-item">
                    <span className="time-label">Start Time:</span>
                    <span className="time-value">{isMounted ? formatDate(selectedAssignment.startTime) : 'Loading...'}</span>
                  </div>
                  <div className="time-item">
                    <span className="time-label">Deadline:</span>
                    <span className="time-value">{isMounted ? formatDate(selectedAssignment.endTime) : 'Loading...'}</span>
                  </div>
                </div>
                
                {isMounted && selectedAssignment.status === 'active' && (
                  <div className="time-progress-container">
                    <div className="time-progress-label">
                      <span>Assignment Progress:</span>
                      <span>{getElapsedPercentage(selectedAssignment)}% completed</span>
                    </div>
                    <div className="time-progress">
                      <div 
                        className="time-progress-bar" 
                        style={{ width: `${getElapsedPercentage(selectedAssignment)}%` }}
                      ></div>
                    </div>
                    <div className="time-remaining">
                      Time remaining: {formatTimeRemaining(new Date(selectedAssignment.endTime), currentTime)}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="assignment-description-section">
                <h3>Description:</h3>
                <p>{selectedAssignment.description}</p>
              </div>
              
              {selectedAssignment.files && selectedAssignment.files.length > 0 && (
                <div className="assignment-files-section">
                  <h3>Attachment Files:</h3>
                  <div className="files-list">
                    {selectedAssignment.files.map((file, index) => (
                      <div key={index} className="file-item">
                        <div className="file-info">
                          <svg className="file-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <line x1="10" y1="9" x2="8" y2="9"></line>
                          </svg>
                          <div className="file-details">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">{file.size}</span>
                          </div>
                        </div>
                        <button 
                          className="download-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileDownload(file);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedAssignment.status === 'active' && (
                <div className="assignment-upload-section">
                  <h3>Submit Your Work:</h3>
                  
                  <div className="file-upload-area">
                    <label className="upload-label">
                      <input 
                        type="file" 
                        className="file-input"
                        multiple
                        onChange={handleFileChange}
                      />
                      <svg className="upload-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <span>Drag files here or click to upload</span>
                    </label>
                    
                    {fileError && <p className="file-error">{fileError}</p>}
                    
                    {selectedFiles.length > 0 && (
                      <div className="selected-files">
                        <h4>Selected Files:</h4>
                        <ul className="selected-files-list">
                          {selectedFiles.map((file, index) => (
                            <li key={index} className="selected-file-item">
                              <span className="selected-file-name">{file.name}</span>
                              <span className="selected-file-size">({Math.round(file.size / 1024)} KB)</span>
                              <button 
                                className="remove-file-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(index);
                                }}
                              >
                                &times;
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    className="submit-btn"
                    onClick={handleSubmit}
                    disabled={selectedFiles.length === 0}
                  >
                    Submit Assignment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {assignments.length === 0 && !loading && !error && (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h2>No Assignments</h2>
          <p>You don't have any assignments at the moment.</p>
        </div>
      )}
    </div>
  );
}