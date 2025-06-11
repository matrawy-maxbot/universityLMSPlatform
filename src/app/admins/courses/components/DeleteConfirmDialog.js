'use client';

import React from 'react';
import styles from '../styles/DeleteConfirmDialog.module.css';

export default function DeleteConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;
  
  return (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialogContent}>
        <h2 className={styles.dialogTitle}>{title || 'Delete Course'}</h2>
        
        <p className={styles.dialogMessage}>
          {message || 'Are you sure you want to delete this course? This action cannot be undone.'}
        </p>
        
        <div className={styles.dialogActions}>
          <button 
            className={styles.cancelButton} 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className={styles.deleteButton} 
            onClick={onConfirm}
          >
            Delete Course
          </button>
        </div>
      </div>
    </div>
  );
} 