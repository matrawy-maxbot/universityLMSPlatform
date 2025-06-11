'use client';

import { useState, useEffect } from 'react';
import styles from '../styles/AddUserDialog.module.css';
import { createUser, updateUser } from '../api/index';

export default function UserDialog({ isOpen, onClose, onSuccess, editMode = false, userData = null }) {
  const [formData, setFormData] = useState({
    id: '',
    firstname: '',
    secondname: '',
    thirdname: '',
    lastname: '',
    nickname: '',
    nationality: 'Egyptian',
    nationalid: '',
    birthdate: '',
    gender: '1', // 1: male (default)
    type: '0', // 0: student (default)
    email: '',
    phonenumber: '',
    phonenumber2: '',
    password: '',
    confirmPassword: '',
    profileimage: '',
    // حقول الطالب
    maxhours: '18',
    section: 'A',
    major: 'General',
    registerationaccess: true,
    platformaccess: true,
    // حقول المسؤول
    permissions: []
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Load user data when in edit mode
  useEffect(() => {
    if (editMode && userData) {
      console.log("Loading user data for edit:", userData);
      
      // Format birthdate to YYYY-MM-DD for input[type="date"]
      let formattedBirthdate = '';
      if (userData.birthdate) {
        try {
          // Try to parse the date and format it
          const birthDate = new Date(userData.birthdate);
          if (!isNaN(birthDate.getTime())) {
            formattedBirthdate = birthDate.toISOString().split('T')[0];
          } else {
            formattedBirthdate = userData.birthdate;
          }
        } catch (e) {
          console.error("Error formatting birthdate:", e);
          formattedBirthdate = userData.birthdate;
        }
      }
      
      // استخدام البيانات الإضافية للمستخدم حسب نوعه
      const userType = userData.type !== undefined && userData.type !== null ? userData.type.toString() : '0';
      
      // تجهيز البيانات الأساسية
      const updatedFormData = {
        id: userData.id || '',
        firstname: userData.firstname || '',
        secondname: userData.secondname || '',
        thirdname: userData.thirdname || '',
        lastname: userData.lastname || '',
        nickname: userData.nickname || '',
        nationality: userData.nationality || 'Egyptian',
        nationalid: userData.nationalid || '',
        birthdate: formattedBirthdate,
        gender: (userData.gender !== undefined && userData.gender !== null) ? userData.gender.toString() : '1',
        type: userType,
        email: userData.email || '',
        phonenumber: userData.phonenumber || '',
        phonenumber2: userData.phonenumber2 || '',
        password: '',
        confirmPassword: '',
        profileimage: userData.profileimage || '',
        
        // القيم الافتراضية للحقول الإضافية
        maxhours: '18',
        section: 'A',
        major: 'General',
        registerationaccess: true,
        platformaccess: true,
        permissions: []
      };
      
      // إضافة البيانات الخاصة بالطالب إذا كان المستخدم طالبًا
      if (userType === '0' && userData.maxhours !== undefined) {
        updatedFormData.maxhours = userData.maxhours.toString();
        updatedFormData.section = userData.section || 'A';
        updatedFormData.major = userData.major || 'General';
        updatedFormData.registerationaccess = userData.registerationaccess !== undefined ? userData.registerationaccess : true;
        updatedFormData.platformaccess = userData.platformaccess !== undefined ? userData.platformaccess : true;
      }
      
      // إضافة البيانات الخاصة بالمسؤول إذا كان المستخدم مسؤولًا
      if ((userType === '3' || userType === '4') && userData.permissions) {
        updatedFormData.permissions = Array.isArray(userData.permissions) ? userData.permissions : [];
      }
      
      setFormData(updatedFormData);
    }
  }, [editMode, userData]);
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.id.trim()) {
      newErrors.id = 'User ID is required';
    }
    
    if (!formData.firstname.trim()) {
      newErrors.firstname = 'First name is required';
    }
    
    if (!formData.secondname.trim()) {
      newErrors.secondname = 'Second name is required';
    }
    
    if (!formData.thirdname.trim()) {
      newErrors.thirdname = 'Third name is required';
    }
    
    if (!formData.lastname.trim()) {
      newErrors.lastname = 'Last name is required';
    }
    
    if (!formData.nationalid.trim()) {
      newErrors.nationalid = 'National ID is required';
    }
    
    if (!formData.birthdate.trim()) {
      newErrors.birthdate = 'Birth date is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }
    
    if (!formData.phonenumber.trim()) {
      newErrors.phonenumber = 'Phone number is required';
    }
    
    // Only validate password in create mode or if password field is filled in edit mode
    if (!editMode || formData.password) {
      if (!editMode && !formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password && formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    // تحقق من حقول الطالب إذا كان نوع المستخدم طالب
    if (formData.type === '0') {
      if (!formData.maxhours || parseInt(formData.maxhours) < 1) {
        newErrors.maxhours = 'Max hours must be at least 1';
      }
      
      if (!formData.section.trim()) {
        newErrors.section = 'Section is required';
      }
      
      if (!formData.major.trim()) {
        newErrors.major = 'Major is required';
      }
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
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare user data
      const userDataToSubmit = {
        id: formData.id,
        firstname: formData.firstname,
        secondname: formData.secondname,
        thirdname: formData.thirdname,
        lastname: formData.lastname,
        nickname: formData.nickname || null,
        nationality: formData.nationality,
        nationalid: formData.nationalid,
        birthdate: formData.birthdate,
        gender: parseInt(formData.gender),
        type: parseInt(formData.type),
        email: formData.email,
        phonenumber: formData.phonenumber,
        phonenumber2: formData.phonenumber2 || null,
        profileimage: formData.profileimage || null
      };
      
      // Only include password if it's provided (required for create, optional for edit)
      if (formData.password) {
        userDataToSubmit.password = formData.password;
      }
      
      // إضافة البيانات الخاصة بالطالب إذا كان نوع المستخدم طالب
      if (formData.type === '0') {
        userDataToSubmit.studentData = {
          maxhours: parseInt(formData.maxhours),
          section: formData.section,
          major: formData.major,
          registerationaccess: formData.registerationaccess,
          platformaccess: formData.platformaccess
        };
      }
      
      // إضافة البيانات الخاصة بالمسؤول إذا كان نوع المستخدم مسؤول
      if (formData.type === '3' || formData.type === '4') {
        userDataToSubmit.adminData = {
          permissions: formData.permissions
        };
      }
      
      // Call API to create or update user
      let savedUserData;
      if (editMode) {
        console.log(`Updating user ${formData.id}`);
        savedUserData = await updateUser(formData.id, userDataToSubmit);
        console.log("User updated successfully:", savedUserData);
      } else {
        console.log("Creating new user");
        savedUserData = await createUser(userDataToSubmit);
        console.log("User created successfully:", savedUserData);
      }
      
      // Close dialog and notify parent of success
      onSuccess(savedUserData, editMode);
      onClose();
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} user:`, error);
      
      // Display a more user-friendly error message
      let errorMessage = error.message || `Failed to ${editMode ? 'update' : 'create'} user`;
      
      // Check for specific error types
      if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
        if (errorMessage.includes('email')) {
          errorMessage = 'This email address is already in use.';
        } else if (errorMessage.includes('id') || errorMessage.includes('_id')) {
          errorMessage = 'This user ID is already in use.';
        } else {
          errorMessage = 'A user with this information already exists.';
        }
      } else if (errorMessage.includes('Authentication') || errorMessage.includes('token') || 
                errorMessage.includes('unauthorized') || errorMessage.includes('not authorized')) {
        errorMessage = 'You are not authorized to perform this action. Please log in again.';
      } else if (errorMessage.includes('validation') || errorMessage.includes('required')) {
        errorMessage = 'Please check your input. Some required fields may be missing or invalid.';
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render form field with label and error handling
  const renderField = (label, name, type = 'text', options = null, placeholder = '') => {
    return (
      <div className={styles.formGroup}>
        <label htmlFor={name}>{label}</label>
        {type === 'select' ? (
          <select
            id={name}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className={errors[name] ? styles.inputError : ''}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === 'checkbox' ? (
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name={name}
              checked={formData[name]}
              onChange={handleChange}
            />
            {placeholder}
          </label>
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder={placeholder}
            className={errors[name] ? styles.inputError : ''}
          />
        )}
        {errors[name] && <span className={styles.errorText}>{errors[name]}</span>}
      </div>
    );
  };

  if (!isOpen) return null;
  
  return (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialogContent}>
        <div className={styles.dialogHeader}>
          <h2>{editMode ? 'Edit User' : 'Add New User'}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          {submitError && (
            <div className={styles.submitError}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {submitError}
            </div>
          )}
          
          <div className={styles.sectionHeader}>
            <h3>Basic Information</h3>
          </div>
          
          <div className={styles.formRow}>
            {renderField('User ID', 'id', 'text', null, 'Enter user ID')}
            {renderField('User Type', 'type', 'select', [
              { value: '0', label: 'Student' },
              { value: '1', label: 'Assistant' },
              { value: '2', label: 'Doctor' },
              { value: '3', label: 'Admin' },
              { value: '4', label: 'Doctor & Admin' }
            ])}
          </div>
          
          <div className={styles.formRow}>
            {renderField('First Name', 'firstname', 'text', null, 'Enter first name')}
            {renderField('Second Name', 'secondname', 'text', null, 'Enter second name')}
          </div>
          
          <div className={styles.formRow}>
            {renderField('Third Name', 'thirdname', 'text', null, 'Enter third name')}
            {renderField('Last Name', 'lastname', 'text', null, 'Enter last name')}
          </div>
          
          <div className={styles.formRow}>
            {renderField('Nickname (Optional)', 'nickname', 'text', null, 'Enter nickname')}
            {renderField('Gender', 'gender', 'select', [
              { value: '1', label: 'Male' },
              { value: '0', label: 'Female' }
            ])}
          </div>
          
          <div className={styles.sectionHeader}>
            <h3>Contact Information</h3>
          </div>
          
          <div className={styles.formRow}>
            {renderField('Email', 'email', 'email', null, 'Enter email address')}
            {renderField('Phone Number', 'phonenumber', 'tel', null, 'Enter phone number')}
          </div>
          
          <div className={styles.formRow}>
            {renderField('Alternative Phone (Optional)', 'phonenumber2', 'tel', null, 'Enter alternative phone')}
          </div>
          
          <div className={styles.sectionHeader}>
            <h3>Personal Information</h3>
          </div>
          
          <div className={styles.formRow}>
            {renderField('Nationality', 'nationality', 'text', null, 'Enter nationality')}
            {renderField('National ID', 'nationalid', 'text', null, 'Enter national ID')}
          </div>
          
          <div className={styles.formRow}>
            {renderField('Birth Date', 'birthdate', 'date')}
            {renderField('Profile Image URL (Optional)', 'profileimage', 'text', null, 'Enter profile image URL')}
          </div>
          
          {!editMode && (
            <>
              <div className={styles.sectionHeader}>
                <h3>Security</h3>
              </div>
              
              <div className={styles.formRow}>
                {renderField('Password', 'password', 'password', null, 'Enter password')}
                {renderField('Confirm Password', 'confirmPassword', 'password', null, 'Confirm password')}
              </div>
            </>
          )}
          
          {formData.type === '0' && (
            <>
              <div className={styles.sectionHeader}>
                <h3>Student Information</h3>
              </div>
              
              <div className={styles.formRow}>
                {renderField('Max Hours', 'maxhours', 'number', null, 'Enter max hours')}
                {renderField('Section', 'section', 'text', null, 'Enter section')}
              </div>
              
              <div className={styles.formRow}>
                {renderField('Major', 'major', 'text', null, 'Enter major')}
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  {renderField('', 'registerationaccess', 'checkbox', null, 'Registration Access')}
                </div>
                <div className={styles.formGroup}>
                  {renderField('', 'platformaccess', 'checkbox', null, 'Platform Access')}
                </div>
              </div>
            </>
          )}
          
          {(formData.type === '3' || formData.type === '4') && (
            <>
              <div className={styles.sectionHeader}>
                <h3>Admin Permissions</h3>
              </div>
              
              <div className={styles.permissionsContainer}>
                {/* Permissions checkboxes would go here */}
                <div className={styles.formGroup}>
                  {renderField('', 'permissions', 'checkbox', null, 'User Management')}
                </div>
                <div className={styles.formGroup}>
                  {renderField('', 'permissions', 'checkbox', null, 'Course Management')}
                </div>
                <div className={styles.formGroup}>
                  {renderField('', 'permissions', 'checkbox', null, 'System Settings')}
                </div>
              </div>
            </>
          )}
          
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
              {isSubmitting ? 'Saving...' : editMode ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 