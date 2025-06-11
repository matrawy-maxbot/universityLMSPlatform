'use client';

import { useState, useEffect } from 'react';
import styles from '../styles/AddCourseDialog.module.css';
import { createCourse, updateCourse } from '../api/index';
import { getUsersByType } from '../../groups/api/users.service';

export default function CourseDialog({ isOpen, onClose, onSuccess, editMode = false, courseData = null }) {
  const [formData, setFormData] = useState({
    id: '',
    coursecode: '',
    coursename: '',
    coursehours: 4,
    level: 1,
    semester: 'fall',
    doctors: [],
    assistants: [],
    requirement: 'optional',
    defaultmaxpoints: 150,
    specificmaxpoints: [],
    precoursespassed: []
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // State for doctors and assistants lists
  const [doctorsList, setDoctorsList] = useState([]);
  const [assistantsList, setAssistantsList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  
  // State for specific max points modal
  const [isSpecificPointsModalOpen, setIsSpecificPointsModalOpen] = useState(false);
  const [currentSpecificPoint, setCurrentSpecificPoint] = useState({
    groupID: '',
    maxPoints: 100
  });
  
  // State for dropdown visibility
  const [showDoctorsDropdown, setShowDoctorsDropdown] = useState(false);
  const [showAssistantsDropdown, setShowAssistantsDropdown] = useState(false);
  const [showPrerequisitesDropdown, setShowPrerequisitesDropdown] = useState(false);
  
  // State for search filters
  const [doctorFilter, setDoctorFilter] = useState('');
  const [assistantFilter, setAssistantFilter] = useState('');
  const [prerequisiteFilter, setPrerequisiteFilter] = useState('');
  
  // Filtered lists
  const filteredDoctors = doctorsList.filter(doctor => 
    `${doctor.firstname} ${doctor.lastname}`.toLowerCase().includes(doctorFilter.toLowerCase())
  );
  
  const filteredAssistants = assistantsList.filter(assistant => 
    `${assistant.firstname} ${assistant.lastname}`.toLowerCase().includes(assistantFilter.toLowerCase())
  );
  
  const filteredCourses = coursesList.filter(course => 
    `${course.id} - ${course.name}`.toLowerCase().includes(prerequisiteFilter.toLowerCase())
  );
  
  // Load doctors and assistants
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch doctors (type 2)
        const doctorsData = await getUsersByType(2);
        setDoctorsList(doctorsData);
        
        // Fetch assistants (type 1)
        const assistantsData = await getUsersByType(1);
        setAssistantsList(assistantsData);
        
        // TODO: Fetch courses for prerequisites
        // This would typically come from an API call
        setCoursesList([
          { id: 'CS101', name: 'Introduction to Computer Science' },
          { id: 'IS112', name: 'Information Systems' },
          { id: 'MATH101', name: 'Calculus I' },
          { id: 'PHYS101', name: 'Physics I' }
        ]);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Load course data when in edit mode
  useEffect(() => {
    if (editMode && courseData) {
      console.log("Loading course data for edit:", courseData);
      
      // تجهيز البيانات للتحرير
      const updatedFormData = {
        id: courseData.id || '',
        coursecode: courseData.coursecode || '',
        coursename: courseData.coursename || '',
        coursehours: courseData.coursehours || 4,
        level: courseData.level || 1,
        semester: courseData.semester || 'fall',
        doctors: courseData.doctors || [],
        assistants: courseData.assistants || [],
        requirement: courseData.requirement || 'optional',
        defaultmaxpoints: courseData.defaultmaxpoints || 150,
        specificmaxpoints: courseData.specificmaxpoints || [],
        precoursespassed: courseData.precoursespassed || []
      };
      
      setFormData(updatedFormData);
    }
  }, [editMode, courseData]);
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.coursecode.trim()) {
      newErrors.coursecode = 'Course code is required';
    }
    
    if (!formData.coursename.trim()) {
      newErrors.coursename = 'Course name is required';
    }
    
    if (!formData.coursehours || formData.coursehours < 1) {
      newErrors.coursehours = 'Credits must be at least 1';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field when user makes changes
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle adding an item to a multi-select field
  const handleAddItem = (item, fieldName) => {
    setFormData(prev => {
      // Check if item already exists in the array
      if (prev[fieldName].includes(item.id)) {
        return prev;
      }
      return {
        ...prev,
        [fieldName]: [...prev[fieldName], item.id]
      };
    });
    
    // Close the dropdown after selection
    if (fieldName === 'doctors') setShowDoctorsDropdown(false);
    if (fieldName === 'assistants') setShowAssistantsDropdown(false);
    if (fieldName === 'precoursespassed') setShowPrerequisitesDropdown(false);
  };
  
  // Handle removing an item from a multi-select field
  const handleRemoveItem = (itemId, fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter(id => id !== itemId)
    }));
  };
  
  // Get item details by ID
  const getItemById = (id, list) => {
    return list.find(item => item.id === id);
  };
  
  // Handle specific max points
  const handleAddSpecificPoint = () => {
    if (!currentSpecificPoint.groupID || currentSpecificPoint.maxPoints < 1) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      specificmaxpoints: [...prev.specificmaxpoints, { ...currentSpecificPoint }]
    }));
    
    setCurrentSpecificPoint({ groupID: '', maxPoints: 100 });
    setIsSpecificPointsModalOpen(false);
  };
  
  const handleRemoveSpecificPoint = (index) => {
    setFormData(prev => ({
      ...prev,
      specificmaxpoints: prev.specificmaxpoints.filter((_, i) => i !== index)
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // تحويل البيانات إلى الأنواع المناسبة
      const courseDataToSubmit = {
        ...formData,
        coursehours: parseInt(formData.coursehours),
        level: parseInt(formData.level),
        defaultmaxpoints: parseInt(formData.defaultmaxpoints)
      };
      
      // Set id to coursecode if creating a new course
      if (!editMode && !courseDataToSubmit.id && courseDataToSubmit.coursecode) {
        courseDataToSubmit.id = courseDataToSubmit.coursecode;
      }
      
      let result;
      
      if (editMode) {
        // تحديث كورس موجود
        result = await updateCourse(formData.id, courseDataToSubmit);
      } else {
        // إنشاء كورس جديد
        result = await createCourse(courseDataToSubmit);
      }
      
      console.log(`Course ${editMode ? 'updated' : 'created'} successfully:`, result);
      
      // إغلاق النافذة وإرجاع البيانات المحدثة
      onSuccess(result);
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} course:`, error);
      setSubmitError(error.message || `Failed to ${editMode ? 'update' : 'create'} course`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render tag selection field
  const renderTagSelectionField = (label, name, itemsList, selectedIds, showDropdown, setShowDropdown, filter, setFilter) => {
    return (
      <div className={styles.formGroup}>
        <label htmlFor={name}>{label}</label>
        
        <div className={styles.tagSelectionContainer}>
          <div className={styles.selectedTagsContainer}>
            {selectedIds.map(id => {
              const item = getItemById(id, itemsList);
              return item ? (
                <div key={id} className={styles.selectedTag}>
                  <span>{item.firstname ? `${item.firstname} ${item.lastname}` : `${item.id} - ${item.name}`}</span>
                  <button 
                    type="button" 
                    className={styles.removeTagButton}
                    onClick={() => handleRemoveItem(id, name)}
                  >
                    ×
                  </button>
                </div>
              ) : null;
            })}
            
            <button 
              type="button" 
              className={styles.addTagButton}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              + Add
            </button>
          </div>
          
          {showDropdown && (
            <div className={styles.dropdownContainer}>
              <div className={styles.dropdownHeader}>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className={styles.dropdownSearch}
                />
              </div>
              
              <div className={styles.dropdownList}>
                {itemsList.length > 0 ? (
                  itemsList.map(item => (
                    <div 
                      key={item.id} 
                      className={`${styles.dropdownItem} ${selectedIds.includes(item.id) ? styles.selected : ''}`}
                      onClick={() => handleAddItem(item, name)}
                    >
                      {item.firstname ? `${item.firstname} ${item.lastname}` : `${item.id} - ${item.name}`}
                    </div>
                  ))
                ) : (
                  <div className={styles.dropdownNoResults}>No items found</div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {errors[name] && <div className={styles.errorMessage}>{errors[name]}</div>}
      </div>
    );
  };
  
  if (!isOpen) return null;
  
  return (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialogContent}>
        <div className={styles.dialogHeader}>
          <h2>{editMode ? 'Edit Course' : 'Add New Course'}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.courseForm}>
          <div className={styles.formGrid}>
            {/* Course Code */}
            <div className={styles.formGroup}>
              <label htmlFor="coursecode">Course Code *</label>
              <input
                type="text"
                id="coursecode"
                name="coursecode"
                value={formData.coursecode}
                onChange={handleChange}
                placeholder="e.g. CHEM301"
                className={errors.coursecode ? styles.inputError : ''}
              />
              {errors.coursecode && <div className={styles.errorMessage}>{errors.coursecode}</div>}
            </div>
            
            {/* Course Name */}
            <div className={styles.formGroup}>
              <label htmlFor="coursename">Course Name *</label>
              <input
                type="text"
                id="coursename"
                name="coursename"
                value={formData.coursename}
                onChange={handleChange}
                placeholder="e.g. كيمياء تحليلية"
                className={errors.coursename ? styles.inputError : ''}
              />
              {errors.coursename && <div className={styles.errorMessage}>{errors.coursename}</div>}
            </div>
            
            {/* Course Hours */}
            <div className={styles.formGroup}>
              <label htmlFor="coursehours">Course Hours *</label>
              <input
                type="number"
                id="coursehours"
                name="coursehours"
                value={formData.coursehours}
                onChange={handleChange}
                placeholder="4"
                className={errors.coursehours ? styles.inputError : ''}
              />
              {errors.coursehours && <div className={styles.errorMessage}>{errors.coursehours}</div>}
            </div>
            
            {/* Level */}
            <div className={styles.formGroup}>
              <label htmlFor="level">Level *</label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className={errors.level ? styles.inputError : ''}
              >
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
              </select>
              {errors.level && <div className={styles.errorMessage}>{errors.level}</div>}
            </div>
            
            {/* Semester */}
            <div className={styles.formGroup}>
              <label htmlFor="semester">Semester *</label>
              <select
                id="semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className={errors.semester ? styles.inputError : ''}
              >
                <option value="fall">Fall</option>
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
              </select>
              {errors.semester && <div className={styles.errorMessage}>{errors.semester}</div>}
            </div>
            
            {/* Requirement */}
            <div className={styles.formGroup}>
              <label htmlFor="requirement">Requirement</label>
              <select
                id="requirement"
                name="requirement"
                value={formData.requirement}
                onChange={handleChange}
                className={errors.requirement ? styles.inputError : ''}
              >
                <option value="required">Required</option>
                <option value="optional">Optional</option>
              </select>
              {errors.requirement && <div className={styles.errorMessage}>{errors.requirement}</div>}
            </div>
            
            {/* Default Max Points */}
            <div className={styles.formGroup}>
              <label htmlFor="defaultmaxpoints">Default Max Points</label>
              <input
                type="number"
                id="defaultmaxpoints"
                name="defaultmaxpoints"
                value={formData.defaultmaxpoints}
                onChange={handleChange}
                placeholder="150"
                className={errors.defaultmaxpoints ? styles.inputError : ''}
              />
              {errors.defaultmaxpoints && <div className={styles.errorMessage}>{errors.defaultmaxpoints}</div>}
            </div>
          </div>
          
          <div className={styles.formSection}>
            <h3>Course Instructors</h3>
            
            {/* Doctors */}
            {renderTagSelectionField(
              'Doctors', 
              'doctors', 
              filteredDoctors, 
              formData.doctors,
              showDoctorsDropdown,
              setShowDoctorsDropdown,
              doctorFilter,
              setDoctorFilter
            )}
            
            {/* Assistants */}
            {renderTagSelectionField(
              'Assistants', 
              'assistants', 
              filteredAssistants, 
              formData.assistants,
              showAssistantsDropdown,
              setShowAssistantsDropdown,
              assistantFilter,
              setAssistantFilter
            )}
          </div>
          
          <div className={styles.formSection}>
            <h3>Prerequisites</h3>
            
            {/* Prerequisites */}
            {renderTagSelectionField(
              'Prerequisite Courses', 
              'precoursespassed', 
              filteredCourses, 
              formData.precoursespassed,
              showPrerequisitesDropdown,
              setShowPrerequisitesDropdown,
              prerequisiteFilter,
              setPrerequisiteFilter
            )}
          </div>
          
          <div className={styles.formSection}>
            <h3>Specific Max Points</h3>
            
            <div className={styles.specificPointsContainer}>
              {formData.specificmaxpoints.length > 0 ? (
                <table className={styles.specificPointsTable}>
                  <thead>
                    <tr>
                      <th>Group ID</th>
                      <th>Max Points</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.specificmaxpoints.map((point, index) => (
                      <tr key={index}>
                        <td>{point.groupID}</td>
                        <td>{point.maxPoints}</td>
                        <td>
                          <button
                            type="button"
                            className={styles.removeButton}
                            onClick={() => handleRemoveSpecificPoint(index)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No specific max points defined.</p>
              )}
              
              <button
                type="button"
                className={styles.addButton}
                onClick={() => setIsSpecificPointsModalOpen(true)}
              >
                Add Specific Max Points
              </button>
            </div>
          </div>
          
          {/* Submit Error */}
          {submitError && (
            <div className={styles.submitError}>
              {submitError}
            </div>
          )}
          
          {/* Form Actions */}
          <div className={styles.formActions}>
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : editMode ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Specific Max Points Modal */}
      {isSpecificPointsModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Add Specific Max Points</h3>
              <button 
                className={styles.closeButton} 
                onClick={() => setIsSpecificPointsModalOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label htmlFor="groupID">Group ID</label>
                <select
                  id="groupID"
                  value={currentSpecificPoint.groupID}
                  onChange={(e) => setCurrentSpecificPoint({...currentSpecificPoint, groupID: e.target.value})}
                >
                  <option value="">Select a group</option>
                  {/* This would typically be populated from an API call */}
                  <option value="65466">Group 65466</option>
                  <option value="65467">Group 65467</option>
                  <option value="65468">Group 65468</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="maxPoints">Max Points</label>
                <input
                  type="number"
                  id="maxPoints"
                  value={currentSpecificPoint.maxPoints}
                  onChange={(e) => setCurrentSpecificPoint({...currentSpecificPoint, maxPoints: parseInt(e.target.value)})}
                  min="1"
                />
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setIsSpecificPointsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.submitButton}
                onClick={handleAddSpecificPoint}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 