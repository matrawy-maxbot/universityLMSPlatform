'use client';

import React, { useState } from 'react';
import styles from '../styles/RegistrationsList.module.css';

export default function RegistrationsList({ 
  registrations = [], 
  selectedId = null,
  onSelect,
  onApprove,
  onReject
}) {
  const [bulkSelected, setBulkSelected] = useState([]);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [pendingRejectId, setPendingRejectId] = useState(null);

  // Format student name, handling Arabic names properly
  const formatStudentName = (student) => {
    if (!student) return 'Unknown Student';
    
    // If the student has individual name components, use them
    if (student.firstname || student.secondname || student.thirdname || student.lastname) {
      return [
        student.firstname || '',
        student.secondname || '',
        student.thirdname || '',
        student.lastname || ''
      ].filter(Boolean).join(' ');
    }
    
    // Fallback to the name field
    return student.name || 'Unknown Student';
  };

  // Handle registration selection
  const handleSelect = (registration) => {
    if (onSelect) {
      onSelect(registration);
    }
  };

  // Handle approval action
  const handleApprove = (e, id) => {
    e.stopPropagation();
    if (onApprove) {
      onApprove(id);
    }
  };

  // Open rejection modal
  const handleRejectClick = (e, id) => {
    e.stopPropagation();
    setPendingRejectId(id);
    setRejectionReason('');
    setShowRejectionModal(true);
  };

  // Submit rejection with reason
  const handleRejectConfirm = () => {
    if (onReject && pendingRejectId) {
      onReject(pendingRejectId, rejectionReason);
      setShowRejectionModal(false);
      setPendingRejectId(null);
      setRejectionReason('');
    }
  };

  // Cancel rejection
  const handleRejectCancel = () => {
    setShowRejectionModal(false);
    setPendingRejectId(null);
    setRejectionReason('');
  };

  // Toggle bulk selection of a registration
  const toggleBulkSelect = (e, id) => {
    e.stopPropagation();
    
    setBulkSelected(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Approve all selected registrations
  const handleBulkApprove = () => {
    if (bulkSelected.length > 0 && onApprove) {
      // Process each selected registration
      bulkSelected.forEach(id => {
        onApprove(id);
      });
      // Clear selections after processing
      setBulkSelected([]);
    }
  };

  // Reject all selected registrations
  const handleBulkReject = () => {
    setPendingRejectId('bulk');
    setRejectionReason('');
    setShowRejectionModal(true);
  };

  // Confirm bulk rejection
  const handleBulkRejectConfirm = () => {
    if (bulkSelected.length > 0 && onReject) {
      // Process each selected registration
      bulkSelected.forEach(id => {
        onReject(id, rejectionReason);
      });
      // Clear selections and close modal
      setBulkSelected([]);
      setShowRejectionModal(false);
      setPendingRejectId(null);
      setRejectionReason('');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  };

  // Get status badge styling
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return styles.statusApproved;
      case 'rejected':
        return styles.statusRejected;
      case 'pending':
      default:
        return styles.statusPending;
    }
  };

  // Determine registration status from fields
  const getRegistrationStatus = (registration) => {
    if (registration.confirm === true) {
      return 'approved';
    } else if (registration.isRejected === true) {
      return 'rejected';
    } else {
      return 'pending';
    }
  };

  return (
    <div className={styles.registrationsListContainer}>
      {registrations.length === 0 ? (
        <div className={styles.emptyState}>
          <svg xmlns="http://www.w3.org/2000/svg" className={styles.emptyIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No registration requests found</p>
        </div>
      ) : (
        <>
          {/* Bulk actions */}
          {bulkSelected.length > 0 && (
            <div className={styles.bulkActions}>
              <span className={styles.bulkCount}>
                {bulkSelected.length} {bulkSelected.length === 1 ? 'item' : 'items'} selected
              </span>
              <div className={styles.bulkButtons}>
                <button 
                  className={styles.bulkApproveButton}
                  onClick={handleBulkApprove}
                >
                  Approve Selected
                </button>
                <button 
                  className={styles.bulkRejectButton}
                  onClick={handleBulkReject}
                >
                  Reject Selected
                </button>
              </div>
            </div>
          )}
          
          {/* Registrations list */}
          <div className={styles.listHeader}>
            <div className={styles.headerSelect}></div>
            <div className={styles.headerStudent}>Student</div>
            <div className={styles.headerCourse}>Course</div>
            <div className={styles.headerDate}>Date</div>
            <div className={styles.headerStatus}>Status</div>
            <div className={styles.headerActions}>Actions</div>
          </div>
          
          <ul className={styles.registrationsList}>
            {registrations.map(registration => (
              <li 
                key={registration.id} 
                className={`${styles.registrationItem} ${selectedId === registration.id ? styles.selectedItem : ''}`}
                onClick={() => handleSelect(registration)}
              >
                <div className={styles.itemSelect}>
                  <input 
                    type="checkbox"
                    checked={bulkSelected.includes(registration.id)}
                    onChange={(e) => toggleBulkSelect(e, registration.id)}
                    onClick={(e) => e.stopPropagation()}
                    disabled={registration.status !== 'pending' || registration.confirm === true || registration.isRejected === true}
                  />
                </div>
                
                <div className={styles.itemStudent}>
                  <div className={styles.studentName}>
                    {formatStudentName(registration.student)}
                  </div>
                  <div className={styles.studentId}>
                    ID: {registration.student?.id || registration.studentId || 'N/A'}
                  </div>
                </div>
                
                <div className={styles.itemCourse}>
                  <div className={styles.courseCode}>
                    {registration.course?.coursecode || registration.courseId || 'Unknown Course'}
                  </div>
                  <div className={styles.courseName}>
                    {registration.course?.coursename || 'N/A'}
                  </div>
                </div>
                
                <div className={styles.itemDate}>
                  {formatDate(registration.createdAt)}
                </div>
                
                <div className={styles.itemStatus}>
                  <span className={`${styles.statusBadge} ${getStatusBadgeClass(getRegistrationStatus(registration))}`}>
                    {getRegistrationStatus(registration).toUpperCase()}
                  </span>
                </div>
                
                <div className={styles.itemActions}>
                  {!registration.confirm && !registration.isRejected ? (
                    <>
                      <button 
                        className={styles.approveButton}
                        onClick={(e) => handleApprove(e, registration.id)}
                        title="Approve"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={styles.actionIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button 
                        className={styles.rejectButton}
                        onClick={(e) => handleRejectClick(e, registration.id)}
                        title="Reject"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={styles.actionIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <div className={styles.statusInfo}>
                      {registration.confirm ? (
                        <span className={styles.approvedInfo} title={`Approved on ${formatDate(registration.confirmDate)}`}>
                          Approved
                        </span>
                      ) : registration.isRejected ? (
                        <span className={styles.rejectedInfo} title={`Rejected: ${registration.rejectionReason || 'No reason provided'}`}>
                          Rejected
                        </span>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      
      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>
              {pendingRejectId === 'bulk' ? 'Reject Selected Registrations' : 'Reject Registration'}
            </h3>
            
            <div className={styles.modalBody}>
              <label htmlFor="rejection-reason" className={styles.modalLabel}>
                Reason for rejection:
              </label>
              <textarea
                id="rejection-reason"
                className={styles.reasonTextarea}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter a reason for rejection (optional)"
                rows={4}
              />
            </div>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={handleRejectCancel}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmButton}
                onClick={pendingRejectId === 'bulk' ? handleBulkRejectConfirm : handleRejectConfirm}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 