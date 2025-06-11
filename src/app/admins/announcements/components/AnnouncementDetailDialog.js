'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import '../styles/AnnouncementDetailDialog.css';

export default function AnnouncementDetailDialog({ 
  isOpen, 
  onClose, 
  announcementData, 
  onAnnouncementUpdate, 
  onAnnouncementDelete 
}) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  // Buttons state
  const [buttons, setButtons] = useState([]);
  const [showButtonForm, setShowButtonForm] = useState(false);
  const [buttonText, setButtonText] = useState('');
  const [buttonUrl, setButtonUrl] = useState('');
  const [buttonStyle, setButtonStyle] = useState('primary');
  const [editingButtonIndex, setEditingButtonIndex] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState(null);
  
  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const dialogRef = useRef(null);
  const titleInputRef = useRef(null);
  
  // Set today as min date for date inputs
  const today = new Date().toISOString().split('T')[0];

  // Initialize form with announcement data when the dialog opens
  useEffect(() => {
    if (isOpen && announcementData) {
      // Convert date strings to date input format (YYYY-MM-DD)
      const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        try {
          // Handle both date strings and Date objects
          const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
          return date.toISOString().split('T')[0];
        } catch (error) {
          console.error('Error formatting date:', error);
          return '';
        }
      };
      
      // Parse dates from original data if available
      const originalData = announcementData.originalData || {};
      
      setTitle(announcementData.title || '');
      setMessage(announcementData.message || '');
      setStartDate(formatDateForInput(originalData.startDate || announcementData.startDate));
      setEndDate(formatDateForInput(originalData.endDate || announcementData.endDate));
      setIsActive(announcementData.isActive !== undefined ? announcementData.isActive : true);
      
      // Initialize buttons
      const announcementButtons = announcementData.buttons || originalData.buttons || [];
      setButtons(announcementButtons);
      
      setIsEditing(false);
      setShowButtonForm(false);
      setShowDeleteConfirm(false);
      setFormError(null);
    }
  }, [isOpen, announcementData]);

  // Update form data when announcementData changes (e.g. after an update)
  useEffect(() => {
    if (isOpen && announcementData && !isEditing) {
      console.log('Announcement data updated in dialog:', announcementData);
      
      // Update the displayed data without changing edit mode
      setTitle(announcementData.title || '');
      setMessage(announcementData.message || '');
      
      // Initialize buttons if they exist
      const announcementButtons = announcementData.buttons || announcementData.originalData?.buttons || [];
      setButtons(announcementButtons);
    }
  }, [announcementData, isOpen, isEditing]);

  // Focus the title input when entering edit mode
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);

  // Handle clicking outside the dialog to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        if (!isUpdating && !isDeleting && !showDeleteConfirm) {
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
  }, [isOpen, onClose, isUpdating, isDeleting, showDeleteConfirm]);

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setFormError(null);
    setShowButtonForm(false);
  };

  const handleSaveChanges = async () => {
    // Validate form
    if (!title.trim() || !message.trim() || !startDate) {
      setFormError('Please fill in all required fields.');
      return;
    }
    
    try {
      setIsUpdating(true);
      setFormError(null);
      
      // Format dates as ISO strings
      const formattedStartDate = startDate ? new Date(startDate).toISOString() : null;
      const formattedEndDate = endDate ? new Date(endDate).toISOString() : null;
      
      // Prepare updated announcement data
      const updatedAnnouncement = {
        id: announcementData.id,
        title: title.trim(),
        message: message.trim(),
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        isActive,
        buttons: buttons.length > 0 ? buttons : undefined
      };
      
      console.log('Saving changes to announcement:', updatedAnnouncement);
      
      // Call parent update handler and wait for it to complete
      await onAnnouncementUpdate(updatedAnnouncement);
      
      // Exit edit mode after successful update
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating announcement:', error);
      setFormError('Failed to update announcement. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      setFormError(null);
      
      // Call parent delete handler
      await onAnnouncementDelete(announcementData.id);
      
      // Close dialog after successful delete
      onClose();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      setFormError('Failed to delete announcement. Please try again.');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
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

  // SVG icons
  const EditIconSvg = () => (
    <svg className="action-icon edit-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );

  const DeleteIconSvg = () => (
    <svg className="action-icon delete-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );

  if (!isOpen || !announcementData) return null;

  return (
    <div className="announcement-dialog-overlay">
      <div className="announcement-dialog detail-announcement-dialog" ref={dialogRef}>
        <div className="dialog-header">
          <h2>{isEditing ? 'Edit Announcement' : 'Announcement Details'}</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            disabled={isUpdating || isDeleting}
          >
            ✕
          </button>
        </div>
        
        <div className="dialog-content">
          {!showDeleteConfirm ? (
            <>
              <div className="announcement-detail-content">
                {isEditing ? (
                  <form>
                    <div className="form-group">
                      <label htmlFor="edit-announcement-title">Title *</label>
                      <input
                        id="edit-announcement-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter announcement title"
                        className={!title.trim() ? 'input-error' : ''}
                        ref={titleInputRef}
                        required
                      />
                      {!title.trim() && (
                        <div className="error-message">Title is required</div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="edit-announcement-message">Message *</label>
                      <textarea
                        id="edit-announcement-message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter announcement message"
                        className={!message.trim() ? 'input-error' : ''}
                        required
                        rows={5}
                      ></textarea>
                      {!message.trim() && (
                        <div className="error-message">Message is required</div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="edit-announcement-start-date">Start Date *</label>
                      <input
                        id="edit-announcement-start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={!startDate ? 'input-error' : ''}
                        required
                      />
                      {!startDate && (
                        <div className="error-message">Start date is required</div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="edit-announcement-end-date">End Date (Optional)</label>
                      <input
                        id="edit-announcement-end-date"
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
                              id="edit-announcement-is-active"
                              type="checkbox"
                              checked={isActive}
                              onChange={(e) => setIsActive(e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                          <label htmlFor="edit-announcement-is-active" className="toggle-label">
                            Active
                          </label>
                        </div>
                        <span className={`status-label ${isActive ? 'active' : 'inactive'}`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="detail-header">
                      <h3 className="announcement-title">{announcementData.title}</h3>
                      <span className={`status-badge ${announcementData.isActive ? 'active' : 'inactive'}`}>
                        {announcementData.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="detail-message">
                      <p>{announcementData.message}</p>
                    </div>
                    
                    {/* Display buttons if any */}
                    {buttons && buttons.length > 0 && (
                      <div className="announcement-buttons">
                        <div className="buttons-container">
                          {buttons.map((button, index) => (
                            <a 
                              key={index}
                              href={button.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={`announcement-button ${button.style || 'primary'}`}
                            >
                              {button.text}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="detail-meta">
                      <div className="meta-item">
                        <span className="meta-label">Created</span>
                        <span className="meta-value">{announcementData.createdAt}</span>
                      </div>
                      
                      {announcementData.lastEditAt && (
                        <div className="meta-item">
                          <span className="meta-label">Last Updated</span>
                          <span className="meta-value">{announcementData.lastEditAt}</span>
                        </div>
                      )}
                      
                      {announcementData.startDate && (
                        <div className="meta-item">
                          <span className="meta-label">Start Date</span>
                          <span className="meta-value">{announcementData.startDate}</span>
                        </div>
                      )}
                      
                      {announcementData.endDate && (
                        <div className="meta-item">
                          <span className="meta-label">End Date</span>
                          <span className="meta-value">{announcementData.endDate}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="detail-author">
                      <div className="author-info">
                        <Image 
                          src={announcementData.authorAvatar} 
                          alt={announcementData.authorName} 
                          width={40} 
                          height={40} 
                          className="author-avatar" 
                        />
                        <span className="author-name">{announcementData.authorName}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {formError && (
                <div className="form-error-message">{formError}</div>
              )}
              
              <div className="dialog-actions">
                {isEditing ? (
                  <>
                    <button 
                      type="button" 
                      className="cancel-button" 
                      onClick={toggleEditMode}
                      disabled={isUpdating}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="submit-button"
                      onClick={handleSaveChanges}
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      type="button" 
                      className="edit-button action-button" 
                      onClick={toggleEditMode}
                    >
                      <EditIconSvg /> Edit
                    </button>
                    <button 
                      type="button" 
                      className="delete-button action-button"
                      onClick={handleDeleteClick}
                    >
                      <DeleteIconSvg /> Delete
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="delete-confirmation">
              <h3>Confirm Deletion</h3>
              <p>Are you sure you want to delete this announcement?</p>
              <p className="delete-title">"{announcementData.title}"</p>
              <p>This action cannot be undone.</p>
              
              <div className="confirmation-actions">
                <button 
                  type="button" 
                  className="cancel-button" 
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="delete-confirm-button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Announcement'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 