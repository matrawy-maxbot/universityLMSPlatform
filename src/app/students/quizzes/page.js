'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import './styles/page.css';
import { formatTimeRemaining, calculateTimeElapsed, formatDate, setupClickOutsideHandler } from './components/script';
import { getStudentQuizzes, getStudentQuizzesByCourse } from './api';

export default function Quizes() {
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
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
  
  // Fetch quizzes from API
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        
        let data;
        if (selectedCourse) {
          console.log("selectedCourse frontend was selected: ", selectedCourse);
          // If a course is selected, fetch quizzes for that specific course
          data = await getStudentQuizzesByCourse(selectedCourse);
        } else {
          // Otherwise fetch all quizzes
          data = await getStudentQuizzes();
        }
        
        setQuizzes(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError('Failed to load quizzes. Please try again later.');
        setLoading(false);
      }
    };
    
    if (isMounted) {
      fetchQuizzes();
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
    
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [isDialogOpen]);

  const handleQuizClick = (quiz) => {
    setSelectedQuiz(quiz);
    setIsDialogOpen(true);
  };

  // Calculate time elapsed percentage for active quiz
  const getElapsedPercentage = (quiz) => {
    if (!isMounted || !currentTime || !quiz || quiz.status !== 'active') {
      return 0;
    }
    
    return calculateTimeElapsed(new Date(quiz.startTime), new Date(quiz.endTime), currentTime);
  };

  // Only render time-sensitive content after client-side hydration
  const renderTimeInfo = (quiz) => {
    if (!isMounted || !currentTime) {
      return <span className="time-left-text">Loading...</span>;
    }

    if (quiz.status === 'active') {
      return <span className="time-left-text">{formatTimeRemaining(new Date(quiz.endTime), currentTime)}</span>;
    } else if (quiz.status === 'postponed') {
      return <span className="time-left-text">Starts in {formatTimeRemaining(new Date(quiz.startTime), currentTime).replace('left', '')}</span>;
    } else {
      return <span className="time-left-text">Finished</span>;
    }
  };

  // Group quizzes by course
  const quizzesByCourse = quizzes.reduce((acc, quiz) => {
    console.log("quiz frontend: ", quiz);
    const courseId = quiz.courseId || quiz.courseid || 'unknown';
    const courseName = quiz.coursename || quiz.course || 'Unknown Course';
    console.log("courseId frontend: ", courseId);
    if (!acc[courseId]) {
      acc[courseId] = {
        name: courseName,
        quizzes: []
      };
    }
    
    acc[courseId].quizzes.push(quiz);
    return acc;
  }, {});

  // Handle course selection
  const handleCourseSelect = (courseId) => {
    console.log("courseId frontend selected: ", courseId);
    setSelectedCourse(courseId === selectedCourse ? null : courseId);
  };

  if (loading) {
    return (
      <div className="quizzes-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quizzes-container">
        <div className="error-container">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="error-icon">
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"/>
          </svg>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quizzes-container">
      {Object.keys(quizzesByCourse).length > 0 && (
        <div className="course-selector">
          <h3>Filter by Course:</h3>
          <div className="course-buttons">
            <button 
              className={`course-button ${selectedCourse === null ? 'active' : ''}`}
              onClick={() => setSelectedCourse(null)}
            >
              All Courses
            </button>
            {Object.entries(quizzesByCourse).map(([courseId, { name }]) => (
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

      {Object.entries(quizzesByCourse).map(([courseId, { name, quizzes: courseQuizzes }]) => (
        <div className="course-section" key={courseId}>
          <div className="course-header-title">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35.34 42">
              <path d="M5.35,33.53h28.61c.09,0,.17-.01.25-.03,0,0,.01,0,.02,0,.61,0,1.11-.5,1.11-1.11V1.11c0-.61-.5-1.11-1.11-1.11H5.35C2.4,0,0,2.4,0,5.34c0,.04,0,.08.01.12,0,2.72-.04,27.72,0,31.01,0,.06,0,.13,0,.19,0,2.83,2.22,5.15,5.01,5.33.06,0,.11.02.17.02h29.05c.61,0,1.11-.5,1.11-1.11v-4.17c0-.61-.5-1.11-1.11-1.11s-1.11.5-1.11,1.11v3.06H5.35c-1.68,0-3.06-1.34-3.12-3,0-.03,0-.06,0-.09,0-.05,0-.12,0-.22.1-1.64,1.46-2.94,3.12-2.94h0ZM6.1,5.34c0-.61.5-1.11,1.11-1.11s1.11.5,1.11,1.11v22.48c0,.61-.5,1.11-1.11,1.11s-1.11-.5-1.11-1.11V5.34h0Z"/>
            </svg>
            <span>Course :</span> {name}
          </div>

          {/* Quiz Cards */}
          {courseQuizzes.map((quiz) => (
            <div 
              key={quiz.id} 
              className="quiz-card" 
              data-progress={getElapsedPercentage(quiz)}
              onClick={() => handleQuizClick(quiz)}
            >
              <div className="quiz-title">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {quiz.title}
                <span className={`status-badge ${quiz.status}`}>
                  {quiz.status === 'active' ? 'Active' : quiz.status === 'postponed' ? 'Postponed' : 'Finished'}
                </span>
              </div>
              <div className="quiz-meta">
                <div className="quiz-author">
                  <Image src="/images/shadcn.jpg" alt={quiz.instructor} className="author-avatar" width={40} height={40} />
                  <div className="author-info">
                    <span className="author-name">{quiz.instructor}</span>
                    <span className="created-at">Created {isMounted ? formatTimeRemaining(new Date(quiz.createdAt), currentTime).replace('left', 'ago') : 'recently'}</span>
                  </div>
                </div>
                <div className={`time-left ${quiz.status === 'active' ? 'active-time' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="time-icon" viewBox="0 0 72 72">
                    <path className="cls-1" d="M72,36c0,1.66-1.34,3-3,3s-3-1.34-3-3c-.02-16.56-13.44-29.98-30-30-1.66,0-3-1.34-3-3s1.34-3,3-3c19.87.02,35.98,16.13,36,36ZM48,39c1.66,0,3-1.34,3-3s-1.34-3-3-3h-6.83c-.52-.9-1.27-1.65-2.17-2.17v-9.83c0-1.66-1.34-3-3-3s-3,1.34-3,3v9.83c-2.86,1.65-3.85,5.31-2.2,8.17s5.31,3.85,8.17,2.2c.91-.53,1.67-1.29,2.2-2.2h6.83ZM5.48,20.35c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3-1.34-3-3-3ZM6,36c0-1.66-1.34-3-3-3s-3,1.34-3,3,1.34,3,3,3,3-1.34,3-3ZM36,66c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3-1.34-3-3-3ZM12.66,9.62c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3h0c0-1.66-1.34-3-3-3ZM23.34,2.52c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3h0c0-1.66-1.34-3-3-3h0ZM5.48,45.65c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3-1.34-3-3-3ZM12.66,56.38c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3-1.34-3-3-3ZM23.34,63.48c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3-1.34-3-3-3ZM66.52,45.65c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3-1.34-3-3-3h0ZM59.34,56.38c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3-1.34-3-3-3ZM48.66,63.48c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3-1.34-3-3-3Z"/>
                  </svg>
                  {renderTimeInfo(quiz)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Quiz Dialog */}
      {isDialogOpen && selectedQuiz && (
        <div className="quiz-dialog-overlay">
          <div className="quiz-dialog" ref={dialogRef}>
            <button 
              className="dialog-close-btn"
              onClick={() => setIsDialogOpen(false)}
            >
              &times;
            </button>
            
            <div className="quiz-dialog-header">
              <h2 className="dialog-title">{selectedQuiz.title}</h2>
              <span className={`status-badge ${selectedQuiz.status}`}>
                {selectedQuiz.status === 'active' ? 'Active' : selectedQuiz.status === 'postponed' ? 'Postponed' : 'Finished'}
              </span>
            </div>
            
            <div className="quiz-dialog-content">
              <div className="quiz-info-section">
                <div className="info-item">
                  <h3>Course:</h3>
                  <p>{selectedQuiz.course}</p>
                </div>
                
                <div className="info-item">
                  <h3>Instructor:</h3>
                  <p>{selectedQuiz.instructor}</p>
                </div>
                
                <div className="info-item">
                  <h3>Created on:</h3>
                  <p>{isMounted ? formatDate(selectedQuiz.createdAt) : 'Loading...'}</p>
                </div>
              </div>
              
              <div className="quiz-time-section">
                <h3>Quiz Schedule:</h3>
                <div className="time-details">
                  <div className="time-item">
                    <span className="time-label">Start Time:</span>
                    <span className="time-value">{isMounted ? formatDate(selectedQuiz.startTime) : 'Loading...'}</span>
                  </div>
                  <div className="time-item">
                    <span className="time-label">End Time:</span>
                    <span className="time-value">{isMounted ? formatDate(selectedQuiz.endTime) : 'Loading...'}</span>
                  </div>
                </div>
                
                {isMounted && selectedQuiz.status === 'active' && (
                  <div className="time-progress-container">
                    <div className="time-progress-label">
                      <span>Quiz Progress:</span>
                      <span>{getElapsedPercentage(selectedQuiz)}% completed</span>
                    </div>
                    <div className="time-progress">
                      <div 
                        className="time-progress-bar" 
                        style={{ width: `${getElapsedPercentage(selectedQuiz)}%` }}
                      ></div>
                    </div>
                    <div className="time-remaining">
                      Time remaining: {formatTimeRemaining(new Date(selectedQuiz.endTime), currentTime)}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="quiz-description-section">
                <h3>Description:</h3>
                <p>{selectedQuiz.description}</p>
              </div>
            </div>
            
            <div className="quiz-dialog-actions">
              {selectedQuiz.status === 'active' ? (
                <a 
                  className="take-quiz-btn"
                  href={selectedQuiz.formLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Take Quiz Now
                </a>
              ) : selectedQuiz.status === 'postponed' ? (
                <button className="disabled-btn">
                  Quiz Not Started Yet
                </button>
              ) : (
                <button className="disabled-btn">
                  Quiz Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {quizzes.length === 0 && !loading && !error && (
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" className="empty-icon" viewBox="0 0 24 24">
            <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 15H4V8h16v11z"/>
            <path d="M11 11h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
          </svg>
          <p>No quizzes available at the moment</p>
        </div>
      )}
    </div>
  );
}