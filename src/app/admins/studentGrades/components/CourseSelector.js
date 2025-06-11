'use client';

import { useState, useEffect } from 'react';
import styles from '../styles/CourseSelector.module.css';

export default function CourseSelector({ 
  courses = [], 
  selectedCourse, 
  onChange,
  disabled = false 
}) {
  console.log('CourseSelector rendering with:', {
    coursesCount: courses.length,
    selectedCourseId: selectedCourse?.id,
    disabled: disabled,
    coursesList: courses.map(c => ({ 
      id: c.id, 
      code: c.Course?.coursecode, 
      name: c.Course?.coursename 
    }))
  });

  const [searchTerm, setSearchTerm] = useState('');
  
  // Format course display name
  const formatCourseName = (course) => {
    if (!course) return '';
    
    // Get course data from the Course sub-object
    const courseData = course.Course || {};
    const code = courseData.coursecode || course.courseid || '';
    const name = courseData.coursename || '';
    
    return `${code} - ${name}`;
  };
  
  // Handle course selection
  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    console.log('Course select changed to ID:', courseId);
    
    const selected = courses.find(course => course.id.toString() === courseId);
    console.log('Found course object:', selected);
    
    if (selected && onChange) {
      console.log('Calling onChange with course:', selected);
      onChange(selected);
    }
  };
  
  // Handle search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    console.log('Course search changed to:', e.target.value);
  };
  
  // Filter courses based on search term
  const filteredCourses = searchTerm
    ? courses.filter(course => {
        const courseData = course.Course || {};
        const code = courseData.coursecode || course.courseid || '';
        const name = courseData.coursename || '';
        
        return code.toLowerCase().includes(searchTerm.toLowerCase()) ||
               name.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : courses;
  
  console.log('Filtered courses:', {
    filteredCount: filteredCourses.length,
    searchTerm: searchTerm
  });

  return (
    <div className={styles.courseSelector}>
      <label htmlFor="course-select" className={styles.label}>
        المقرر الدراسي:
      </label>
      
      <div className={styles.selectorContainer}>
        {courses.length > 10 && (
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="بحث عن مقرر..."
              value={searchTerm}
              onChange={handleSearchChange}
              disabled={disabled || courses.length === 0}
            />
            <svg 
              className={styles.searchIcon} 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        )}
        
        <select
          id="course-select"
          className={styles.select}
          value={selectedCourse?.id || ''}
          onChange={handleCourseChange}
          disabled={disabled || courses.length === 0}
        >
          {courses.length === 0 ? (
            <option value="">لا توجد مقررات</option>
          ) : (
            <>
              <option value="">اختر المقرر</option>
              {filteredCourses.map(course => (
                <option key={course.id} value={course.id}>
                  {formatCourseName(course)}
                </option>
              ))}
            </>
          )}
        </select>
      </div>
      
      {selectedCourse && (
        <div className={styles.courseInfo}>
          <div className={styles.courseDetail}>
            <span className={styles.detailLabel}>رمز المقرر:</span>
            <span className={styles.detailValue}>
              {selectedCourse.Course?.coursecode || selectedCourse.courseid || 'غير محدد'}
            </span>
          </div>
          <div className={styles.courseDetail}>
            <span className={styles.detailLabel}>اسم المقرر:</span>
            <span className={styles.detailValue}>
              {selectedCourse.Course?.coursename || 'غير محدد'}
            </span>
          </div>
          <div className={styles.courseDetail}>
            <span className={styles.detailLabel}>الساعات:</span>
            <span className={styles.detailValue}>
              {selectedCourse.Course?.coursehours || 'غير محدد'}
            </span>
          </div>
          <div className={styles.courseDetail}>
            <span className={styles.detailLabel}>الدرجة الكاملة:</span>
            <span className={styles.detailValue}>
              {selectedCourse.Course?.defaultmaxpoints || 100}
            </span>
          </div>
        </div>
      )}
      
      {disabled && (
        <div className={styles.loadingIndicator}>
          <span className={styles.loadingDot}></span>
          <span className={styles.loadingDot}></span>
          <span className={styles.loadingDot}></span>
        </div>
      )}
    </div>
  );
} 