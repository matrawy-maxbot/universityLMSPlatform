'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from '../styles/StudentGradesTable.module.css';

export default function StudentGradesTable({ 
  students = [], 
  loading = false, 
  onGradeUpdate,
  onBulkGradeUpdate,
  selectedCourse,
  disabled = false
}) {
  const [editableStudents, setEditableStudents] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkGradeValue, setBulkGradeValue] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  
  // Reset state when students change
  useEffect(() => {
    setEditableStudents({});
    setSearchTerm('');
    setSelectedStudents([]);
    setShowBulkEditModal(false);
    setBulkGradeValue('');
  }, [students]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Filter students based on search term
  const filteredStudents = searchTerm
    ? students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toString().includes(searchTerm)
      )
    : students;
  
  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // Get sorted students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });
  
  // Get sort direction icon
  const getSortDirectionIcon = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };
  
  // Toggle student selection for bulk actions
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prevSelected => {
      if (prevSelected.includes(studentId)) {
        return prevSelected.filter(id => id !== studentId);
      } else {
        return [...prevSelected, studentId];
      }
    });
  };
  
  // Toggle all students selection
  const toggleAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student.id));
    }
  };
  
  // Start editing a student's grade
  const startEditing = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setEditableStudents(prev => ({
        ...prev,
        [studentId]: student.points
      }));
    }
  };
  
  // Handle grade input change
  const handleGradeChange = (studentId, value) => {
    const numericValue = Math.max(0, Math.min(selectedCourse?.defaultmaxpoints || 100, parseInt(value) || 0));
    setEditableStudents(prev => ({
      ...prev,
      [studentId]: numericValue
    }));
  };
  
  // Save edited grade
  const saveGrade = async (studentId) => {
    if (onGradeUpdate && editableStudents[studentId] !== undefined) {
      await onGradeUpdate(studentId, editableStudents[studentId]);
      
      // Remove from editable state after saving
      setEditableStudents(prev => {
        const newState = { ...prev };
        delete newState[studentId];
        return newState;
      });
    }
  };
  
  // Cancel editing
  const cancelEditing = (studentId) => {
    setEditableStudents(prev => {
      const newState = { ...prev };
      delete newState[studentId];
      return newState;
    });
  };
  
  // Open bulk edit modal
  const openBulkEditModal = () => {
    if (selectedStudents.length > 0) {
      setShowBulkEditModal(true);
    }
  };
  
  // Close bulk edit modal
  const closeBulkEditModal = () => {
    setShowBulkEditModal(false);
    setBulkGradeValue('');
  };
  
  // Handle bulk grade input change
  const handleBulkGradeChange = (e) => {
    const value = e.target.value;
    const maxPoints = selectedCourse?.defaultmaxpoints || 100;
    
    // Ensure value is within valid range
    const numericValue = value === '' ? '' : Math.max(0, Math.min(maxPoints, parseInt(value) || 0));
    setBulkGradeValue(numericValue.toString());
  };
  
  // Apply bulk grade update
  const applyBulkGradeUpdate = async () => {
    if (onBulkGradeUpdate && bulkGradeValue !== '' && selectedStudents.length > 0) {
      const gradesData = selectedStudents.map(studentId => ({
        studentId,
        points: parseInt(bulkGradeValue)
      }));
      
      await onBulkGradeUpdate(gradesData);
      
      // Reset state
      setShowBulkEditModal(false);
      setBulkGradeValue('');
      setSelectedStudents([]);
    }
  };
  
  // Format percentage
  const formatPercentage = (percentage) => {
    return `${Math.round(percentage)}%`;
  };
  
  // Get grade color based on percentage
  const getGradeColor = (percentage) => {
    if (percentage >= 90) return styles.gradeExcellent;
    if (percentage >= 80) return styles.gradeVeryGood;
    if (percentage >= 70) return styles.gradeGood;
    if (percentage >= 60) return styles.gradeFair;
    if (percentage >= 50) return styles.gradePass;
    return styles.gradeFail;
  };

  return (
    <div className={styles.tableContainer}>
      {/* Table toolbar */}
      <div className={styles.tableToolbar}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="بحث عن طالب..."
            value={searchTerm}
            onChange={handleSearchChange}
            disabled={loading || disabled || students.length === 0}
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
        
        <div className={styles.bulkActions}>
          <span className={styles.selectedCount}>
            {selectedStudents.length > 0 && `${selectedStudents.length} طالب محدد`}
          </span>
          
          {selectedStudents.length > 0 && (
            <button 
              className={styles.bulkEditButton}
              onClick={openBulkEditModal}
              disabled={loading || disabled}
            >
              تعديل الدرجات
            </button>
          )}
        </div>
      </div>
      
      {/* Students table */}
      <div className={styles.tableWrapper}>
        <table className={styles.gradesTable}>
          <thead>
            <tr>
              <th className={styles.checkboxCell}>
                <input 
                  type="checkbox" 
                  checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                  onChange={toggleAllStudents}
                  disabled={loading || disabled || students.length === 0}
                />
              </th>
              <th onClick={() => requestSort('name')}>
                اسم الطالب {getSortDirectionIcon('name')}
              </th>
              <th onClick={() => requestSort('studentId')}>
                رقم الطالب {getSortDirectionIcon('studentId')}
              </th>
              <th onClick={() => requestSort('points')}>
                الدرجة {getSortDirectionIcon('points')}
              </th>
              <th onClick={() => requestSort('percentage')}>
                النسبة {getSortDirectionIcon('percentage')}
              </th>
              <th onClick={() => requestSort('status')}>
                الحالة {getSortDirectionIcon('status')}
              </th>
              <th className={styles.actionsCell}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className={styles.loadingCell}>
                  <div className={styles.loadingIndicator}>
                    <span className={styles.loadingDot}></span>
                    <span className={styles.loadingDot}></span>
                    <span className={styles.loadingDot}></span>
                  </div>
                  جاري تحميل البيانات...
                </td>
              </tr>
            ) : sortedStudents.length === 0 ? (
              <tr>
                <td colSpan="7" className={styles.emptyCell}>
                  {students.length === 0 
                    ? 'قم باختيار الفصل الدراسي والمقرر لعرض الطلاب'
                    : 'لا يوجد طلاب مسجلين في هذا المقرر'}
                </td>
              </tr>
            ) : (
              sortedStudents.map(student => (
                <tr key={student.id} className={selectedStudents.includes(student.id) ? styles.selectedRow : ''}>
                  <td className={styles.checkboxCell}>
                    <input 
                      type="checkbox" 
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudentSelection(student.id)}
                      disabled={loading || disabled}
                    />
                  </td>
                  <td className={styles.nameCell}>{student.name}</td>
                  <td>{student.studentId}</td>
                  <td className={styles.gradeCell}>
                    {editableStudents[student.id] !== undefined ? (
                      <input
                        type="number"
                        className={styles.gradeInput}
                        value={editableStudents[student.id]}
                        onChange={(e) => handleGradeChange(student.id, e.target.value)}
                        min="0"
                        max={selectedCourse?.defaultmaxpoints || 100}
                        disabled={loading}
                      />
                    ) : (
                      <span className={getGradeColor(student.percentage)}>
                        {student.points} / {student.maxPoints || 100}
                      </span>
                    )}
                  </td>
                  <td className={`${styles.percentageCell} ${getGradeColor(student.percentage)}`}>
                    {formatPercentage(student.percentage)}
                  </td>
                  <td className={`${styles.statusCell} ${student.status === 'ناجح' ? styles.passStatus : styles.failStatus}`}>
                    {student.status}
                  </td>
                  <td className={styles.actionsCell}>
                    {editableStudents[student.id] !== undefined ? (
                      <>
                        <button 
                          className={styles.saveButton}
                          onClick={() => saveGrade(student.id)}
                          disabled={loading || disabled}
                        >
                          حفظ
                        </button>
                        <button 
                          className={styles.cancelButton}
                          onClick={() => cancelEditing(student.id)}
                          disabled={loading || disabled}
                        >
                          إلغاء
                        </button>
                      </>
                    ) : (
                      <button 
                        className={styles.editButton}
                        onClick={() => startEditing(student.id)}
                        disabled={loading || disabled}
                      >
                        تعديل
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Bulk edit modal */}
      {showBulkEditModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>تعديل درجات الطلاب</h3>
            <p className={styles.modalDescription}>
              أدخل الدرجة لتطبيقها على {selectedStudents.length} طالب محدد
            </p>
            
            <div className={styles.modalContent}>
              <label htmlFor="bulk-grade" className={styles.modalLabel}>
                الدرجة (من 0 إلى {selectedCourse?.defaultmaxpoints || 100})
              </label>
              <input
                id="bulk-grade"
                type="number"
                className={styles.modalInput}
                value={bulkGradeValue}
                onChange={handleBulkGradeChange}
                min="0"
                max={selectedCourse?.defaultmaxpoints || 100}
              />
            </div>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.modalApplyButton}
                onClick={applyBulkGradeUpdate}
                disabled={bulkGradeValue === ''}
              >
                تطبيق
              </button>
              <button 
                className={styles.modalCancelButton}
                onClick={closeBulkEditModal}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 