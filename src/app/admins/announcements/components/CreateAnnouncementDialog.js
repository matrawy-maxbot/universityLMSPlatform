'use client';

import { useState, useRef, useEffect } from 'react';
import '../styles/CreateAnnouncementDialog.css';
import { createAnnouncement } from '../api/announcements.service';
import { getCurrentUser } from '../api/users.service';
import { getCookie } from 'cookies-next';

// Get token for later use
const token = getCookie('access_token');

export default function CreateAnnouncementDialog({ isOpen, onClose, onAnnouncementCreate }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formInteracted, setFormInteracted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // Buttons state
  const [buttons, setButtons] = useState([]);
  const [showButtonForm, setShowButtonForm] = useState(false);
  const [buttonText, setButtonText] = useState('');
  const [buttonUrl, setButtonUrl] = useState('');
  const [buttonStyle, setButtonStyle] = useState('primary');
  const [editingButtonIndex, setEditingButtonIndex] = useState(null);

  const titleInputRef = useRef(null);
  const dialogRef = useRef(null);
  
  // Set today as min date for date inputs
  const today = new Date().toISOString().split('T')[0];

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setMessage('');
      setStartDate(today);
      setEndDate('');
      setIsActive(true);
      setFormInteracted(false);
      setIsSubmitting(false);
      setSubmitError(null);
      setButtons([]);
      setShowButtonForm(false);
      setButtonText('');
      setButtonUrl('');
      setButtonStyle('primary');
      setEditingButtonIndex(null);
    }
  }, [isOpen, today]);

  // Focus title input when dialog opens
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle clicking outside the dialog to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        if (!isSubmitting) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, isSubmitting]);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setFormInteracted(true);
    
    if (!title.trim() || !message.trim() || !startDate) {
      console.warn('Missing required fields');
      setSubmitError('Please fill in all required fields.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // Get current user information
      let authorId = null;
      let currentUser = null;
      
      try {
        currentUser = await getCurrentUser();
        authorId = currentUser.id;
        console.log(`Current user ID: ${authorId}`);
      } catch (userError) {
        console.error('Error getting current user:', userError);
        setSubmitError('Failed to get current user information. Please try again.');
        setIsSubmitting(false);
        return;
      }
      
      // Make sure we have a valid authorId
      if (!authorId) {
        setSubmitError('Current user ID not found.');
        setIsSubmitting(false);
        return;
      }
      
      // Make sure authorId is a string
      authorId = String(authorId);
      
      // Prepare announcement data
      const announcementData = {
        title: title.trim(),
        message: message.trim(),
        startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : null,
        isActive,
        authorid: authorId,
        buttons: buttons.length > 0 ? buttons : []
      };
      
      // Create announcement via API
      console.log('Creating announcement with data:', announcementData);
      const createdAnnouncement = await createAnnouncement(announcementData);
      
      // Format the new announcement for display
      const formattedAnnouncement = {
        id: createdAnnouncement.id,
        title: createdAnnouncement.title,
        message: createdAnnouncement.message,
        startDate: createdAnnouncement.startDate ? new Date(createdAnnouncement.startDate).toLocaleDateString() : null,
        endDate: createdAnnouncement.endDate ? new Date(createdAnnouncement.endDate).toLocaleDateString() : null,
        isActive: createdAnnouncement.isActive,
        authorName: currentUser ? `${currentUser.firstname} ${currentUser.lastname}` : 'Unknown',
        authorAvatar: currentUser?.profileimage || '/images/shadcn.jpg',
        createdAt: new Date().toLocaleDateString(),
        lastEditAt: new Date().toLocaleString(),
        buttons: createdAnnouncement.buttons || buttons,
        // Store original data for later use
        originalData: createdAnnouncement
      };
      
      // Call parent component's handler
      onAnnouncementCreate(formattedAnnouncement);
      
      // Close the dialog
      onClose();
    } catch (error) {
      console.error('Error creating announcement:', error);
      
      // Set appropriate error message
      if (error.response && error.response.data && error.response.data.message) {
        setSubmitError(error.response.data.message);
      } else {
        setSubmitError('Failed to create announcement. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Button management functions
  const handleAddButton = () => {
    setShowButtonForm(true);
    setButtonText('');
    setButtonUrl('');
    setButtonStyle('primary');
    setEditingButtonIndex(null);
  };

  const handleEditButton = (index) => {
    const button = buttons[index];
    setButtonText(button.text);
    setButtonUrl(button.url);
    setButtonStyle(button.style || 'primary');
    setShowButtonForm(true);
    setEditingButtonIndex(index);
  };

  const handleDeleteButton = (index) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const handleSaveButton = () => {
    if (!buttonText.trim() || !buttonUrl.trim()) {
      return;
    }

    const newButton = {
      text: buttonText.trim(),
      url: buttonUrl.trim(),
      style: buttonStyle
    };

    if (editingButtonIndex !== null) {
      // Update existing button
      const updatedButtons = [...buttons];
      updatedButtons[editingButtonIndex] = newButton;
      setButtons(updatedButtons);
    } else {
      // Add new button
      setButtons([...buttons, newButton]);
    }

    // Reset form
    setShowButtonForm(false);
    setButtonText('');
    setButtonUrl('');
    setButtonStyle('primary');
    setEditingButtonIndex(null);
  };

  const handleCancelButton = () => {
    setShowButtonForm(false);
    setButtonText('');
    setButtonUrl('');
    setButtonStyle('primary');
    setEditingButtonIndex(null);
  };

  if (!isOpen) return null;

  return (
    <div className="announcement-dialog-overlay">
      <div className="announcement-dialog create-announcement-dialog" ref={dialogRef}>
        <div className="dialog-header">
          <h2>Create New Announcement</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleCreateAnnouncement}>
          <div className="form-group">
            <label htmlFor="announcement-title">Title *</label>
            <input
              id="announcement-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter announcement title"
              className={formInteracted && !title.trim() ? 'input-error' : ''}
              ref={titleInputRef}
              required
            />
            {formInteracted && !title.trim() && (
              <div className="error-message">Title is required</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="announcement-message">Message *</label>
            <textarea
              id="announcement-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter announcement message"
              className={formInteracted && !message.trim() ? 'input-error' : ''}
              required
              rows={5}
            ></textarea>
            {formInteracted && !message.trim() && (
              <div className="error-message">Message is required</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="announcement-start-date">Start Date *</label>
            <input
              id="announcement-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={today}
              className={formInteracted && !startDate ? 'input-error' : ''}
              required
            />
            {formInteracted && !startDate && (
              <div className="error-message">Start date is required</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="announcement-end-date">End Date (Optional)</label>
            <input
              id="announcement-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || today}
            />
          </div>

          {/* Buttons section */}
          <div className="form-group">
            <label className="section-label">Announcement Buttons</label>
            
            {buttons.length > 0 && (
              <div className="buttons-list">
                {buttons.map((button, index) => (
                  <div key={index} className="button-item">
                    <div className="button-preview">
                      <span className={`button-badge ${button.style}`}>{button.text}</span>
                      <span className="button-url">{button.url}</span>
                    </div>
                    <div className="button-actions">
                      <button type="button" className="icon-button edit" onClick={() => handleEditButton(index)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button type="button" className="icon-button delete" onClick={() => handleDeleteButton(index)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!showButtonForm ? (
              <button 
                type="button" 
                className="add-button-btn" 
                onClick={handleAddButton}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Button
              </button>
            ) : (
              <div className="button-form">
                <div className="form-row">
                  <div className="form-group half">
                    <label htmlFor="button-text">Button Text *</label>
                    <input
                      id="button-text"
                      type="text"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="e.g. Read More"
                    />
                  </div>
                  <div className="form-group half">
                    <label htmlFor="button-style">Style</label>
                    <select
                      id="button-style"
                      value={buttonStyle}
                      onChange={(e) => setButtonStyle(e.target.value)}
                    >
                      <option value="primary">Primary</option>
                      <option value="outline">Outline</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="button-url">URL *</label>
                  <input
                    id="button-url"
                    type="text"
                    value={buttonUrl}
                    onChange={(e) => setButtonUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="button-form-actions">
                  <button type="button" className="cancel-button" onClick={handleCancelButton}>
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="submit-button"
                    onClick={handleSaveButton}
                    disabled={!buttonText.trim() || !buttonUrl.trim()}
                  >
                    {editingButtonIndex !== null ? 'Update Button' : 'Add Button'}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <div className="toggle-switch-container">
              <div className="toggle-switch-group">
                <label className="toggle-switch">
                  <input
                    id="announcement-is-active"
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <label htmlFor="announcement-is-active" className="toggle-label">
                  Active
                </label>
              </div>
              <span className={`status-label ${isActive ? 'active' : 'inactive'}`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          {submitError && (
            <div className="form-error-message">{submitError}</div>
          )}
          
          <div className="dialog-actions">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 