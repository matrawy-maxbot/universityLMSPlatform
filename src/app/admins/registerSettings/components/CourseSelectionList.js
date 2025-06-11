'use client';

import { useState, useEffect } from 'react';
import styles from '../styles/CourseSelectionList.module.css';
import { getAllCourses } from '../api/index';

export default function CourseSelectionList({ 
  title = 'Courses', 
  description = 'Select courses from the list', 
  courseIds = [], 
  onAddCourse = () => {}, 
  onRemoveCourse = () => {}, 
  listType = 'default' 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getAllCourses();
        
        // Verify data structure and ensure availableCourses is an array
        let coursesArray = [];
        
        if (Array.isArray(response)) {
          coursesArray = response;
        } else if (response && typeof response === 'object') {
          // If data is in a sub-property like data or courses
          if (Array.isArray(response.data)) {
            coursesArray = response.data;
          } else if (Array.isArray(response.courses)) {
            coursesArray = response.courses;
          } else {
            // Try to extract array from data object
            const possibleArrays = Object.values(response).filter(Array.isArray);
            if (possibleArrays.length > 0) {
              coursesArray = possibleArrays[0];
            }
          }
        }
        
        console.log('Fetched courses:', coursesArray);
        setAvailableCourses(coursesArray);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
        setAvailableCourses([]);  // Ensure empty array in case of error
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);
  
  // Update selected courses whenever courseIds changes
  useEffect(() => {
    if (!Array.isArray(availableCourses) || availableCourses.length === 0) {
      // If courses array is empty, just display courseIds
      const defaultSelected = courseIds.map(id => ({ 
        id, 
        name: id,
        code: id
      }));
      setSelectedCourses(defaultSelected);
      return;
    }
    
    const selected = courseIds.map(id => {
      const course = availableCourses.find(c => c.id === id);
      return course ? { 
        id, 
        name: course.coursename || course.name || id,
        code: course.coursecode || id
      } : { 
        id, 
        name: id,
        code: id
      };
    });
    
    setSelectedCourses(selected);
  }, [courseIds, availableCourses]);
  
  // Filter courses based on search - ensure availableCourses is an array
  const filteredCourses = Array.isArray(availableCourses) 
    ? availableCourses.filter(course => 
        ((course?.coursename || course?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
         (course?.coursecode || course?.id || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
        !courseIds.includes(course.id)
      )
    : [];
  
  const handleAddCourse = (courseId) => {
    onAddCourse(courseId);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };
  
  return (
    <div className={styles.courseSelectionContainer}>
      <h3 className={styles.listTitle}>{title}</h3>
      <p className={styles.listDescription}>{description}</p>
      
      {/* Search for and add courses */}
      <div className={styles.courseSearchContainer}>
        <div className={styles.searchInputWrapper}>
          <input
            type="text"
            className={styles.courseSearchInput}
            placeholder="Search for a course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsDropdownOpen(true)}
          />
          <button 
            className={styles.searchToggleButton}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isDropdownOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              )}
            </svg>
          </button>
        </div>
        
        {isDropdownOpen && (
          <div className={styles.courseDropdown}>
            {isLoading ? (
              <div className={styles.dropdownLoadingState}>
                <div className={styles.dropdownSpinner}></div>
                <p>Loading courses...</p>
              </div>
            ) : error ? (
              <div className={styles.dropdownErrorState}>
                <p>{error}</p>
              </div>
            ) : filteredCourses.length > 0 ? (
              filteredCourses.map(course => (
                <div 
                  key={course.id} 
                  className={styles.dropdownItem}
                  onClick={() => handleAddCourse(course.id)}
                >
                  <span className={styles.courseCode}>{course.coursecode || course.id}</span>
                  <span className={styles.courseName}>{course.coursename || course.name}</span>
                </div>
              ))
            ) : (
              <div className={styles.noCoursesMessage}>
                {searchTerm ? 'No matching courses found' : 'No available courses'}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Selected courses list */}
      <div className={styles.selectedCoursesContainer}>
        {selectedCourses.length > 0 ? (
          <ul className={styles.coursesList}>
            {selectedCourses.map(course => (
              <li key={course.id} className={styles.courseItem}>
                <div className={styles.courseInfo}>
                  <span className={styles.courseCode}>{course.code}</span>
                  <span className={styles.courseName}>{course.name}</span>
                </div>
                <button 
                  className={styles.removeCourseButton}
                  onClick={() => onRemoveCourse(course.id)}
                  aria-label={`Remove ${course.code}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.emptyCoursesMessage}>
            <svg xmlns="http://www.w3.org/2000/svg" className={styles.emptyIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No courses added yet. Use the search box above to add courses.</p>
          </div>
        )}
      </div>
    </div>
  );
} 