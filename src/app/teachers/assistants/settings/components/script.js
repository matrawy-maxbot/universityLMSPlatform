'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

export default function AccountSettings() {
  const [formData, setFormData] = useState({
    nickname: 'Mohammed Saeed',
    username: 'mohammed.saeed',
    email: 'mohammed.saeed@example.com',
    phoneNumber: '+20 123 456 789',
    studentId: '202018932',
    language: 'Arabic',
  });

  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const [avatar, setAvatar] = useState('/images/shadcn.jpg');
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user is typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nickname.trim()) {
      newErrors.nickname = 'Nickname is required';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // In a real app, you would submit the data to an API here
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    // Reset form data to original values
    setFormData({
      nickname: 'Mohammed Saeed',
      username: 'mohammed.saeed',
      email: 'mohammed.saeed@example.com',
      phoneNumber: '+20 123 456 789',
      studentId: '202018932',
      language: 'Arabic',
    });
    setErrors({});
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Profile Section */}
        <div className="profile-section">
          <h2 className="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Profile Information
          </h2>
          
          <div className="avatar-section">
            <div className="avatar-container">
              <Image 
                src={avatar} 
                alt="Profile Avatar" 
                className="avatar-image" 
                width={120} 
                height={120} 
              />
              {isEditing && (
                <div className="avatar-overlay" onClick={handleAvatarClick}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16"></path>
                    <path d="M19 19v-2a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2"></path>
                    <circle cx="9" cy="9" r="2"></circle>
                  </svg>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*" 
                onChange={handleFileChange} 
              />
            </div>
            
            <div className="avatar-instructions">
              <h3>Profile Picture</h3>
              <p>Upload a new avatar for your profile. JPG, GIF or PNG. Max size of 800K.</p>
              {isEditing && (
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleAvatarClick}
                >
                  Change Avatar
                </button>
              )}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="nickname">Nickname</label>
              <input 
                type="text" 
                id="nickname" 
                name="nickname" 
                className={`form-input editable ${errors.nickname ? 'has-error' : ''}`}
                value={formData.nickname} 
                onChange={handleChange}
                disabled={!isEditing}
              />
              {errors.nickname && <div className="error-message">{errors.nickname}</div>}
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                className="form-input"
                value={formData.username} 
                disabled={true}
              />
              <div className="input-hint">Username cannot be changed</div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                className="form-input"
                value={formData.email} 
                disabled={true}
              />
              <div className="input-hint">Email cannot be changed</div>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="phoneNumber">Phone Number</label>
              <input 
                type="tel" 
                id="phoneNumber" 
                name="phoneNumber" 
                className="form-input editable"
                value={formData.phoneNumber} 
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="studentId">Student ID</label>
              <input 
                type="text" 
                id="studentId" 
                name="studentId" 
                className="form-input"
                value={formData.studentId} 
                disabled={true}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="language">Preferred Language</label>
              <select 
                id="language" 
                name="language" 
                className="form-input editable"
                value={formData.language} 
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="Arabic">Arabic</option>
                <option value="English">English</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          {!isEditing ? (
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleEditClick}
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleCancelClick}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Save Changes
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
