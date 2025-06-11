'use client';

import { useState, useEffect } from 'react';
import styles from '../styles/SemesterSelector.module.css';

export default function SemesterSelector({ 
  semesters = [], 
  selectedSemester, 
  onChange, 
  disabled = false 
}) {
  console.log('SemesterSelector rendering with:', {
    semestersCount: semesters.length,
    selectedSemesterId: selectedSemester?.id,
    disabled: disabled
  });

  // Format semester name for display
  const formatSemesterName = (semester) => {
    if (!semester) return '';
    
    // Get name and years
    const name = semester.semester || '';
    const startYear = semester.semesterstartyear || semester.startyear || '';
    const endYear = semester.semesterendyear || semester.endyear || '';
    
    // Create display name
    let displayName = name.charAt(0).toUpperCase() + name.slice(1);
    
    if (startYear && endYear) {
      displayName += ` ${startYear}/${endYear}`;
    } else if (startYear) {
      displayName += ` ${startYear}`;
    }
    
    // Add active indicator
    if (semester.isActive) {
      displayName += ' (الفصل الحالي)';
    }
    
    return displayName;
  };

  // Handle semester selection
  const handleSemesterChange = (e) => {
    const semesterId = parseInt(e.target.value, 10);
    console.log('Semester select changed to ID:', semesterId);
    
    const selected = semesters.find(sem => sem.id === semesterId);
    console.log('Found semester object:', selected);
    
    if (selected && onChange) {
      console.log('Calling onChange with semester:', selected);
      onChange(selected);
    }
  };

  return (
    <div className={styles.semesterSelector}>
      <label htmlFor="semester-select" className={styles.label}>
        الفصل الدراسي:
      </label>
      
      <select
        id="semester-select"
        className={styles.select}
        value={selectedSemester?.id || ''}
        onChange={handleSemesterChange}
        disabled={disabled || semesters.length === 0}
      >
        {semesters.length === 0 ? (
          <option value="">لا توجد فصول دراسية</option>
        ) : (
          <>
            <option value="">اختر الفصل الدراسي</option>
            {semesters.map(semester => (
              <option key={semester.id} value={semester.id}>
                {formatSemesterName(semester)}
              </option>
            ))}
          </>
        )}
      </select>
      
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