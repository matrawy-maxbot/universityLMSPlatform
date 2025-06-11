'use client';

import React from 'react';
import styles from '../styles/ConfirmDialog.module.css';

export default function ConfirmDialog({
  isOpen = false,
  title = 'Confirmation',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm = () => {},
  onCancel = () => {}
}) {
  if (!isOpen) return null;
  
  return (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialogContent}>
        <h2 className={styles.dialogTitle}>{title}</h2>
        
        <p className={styles.dialogMessage}>{message}</p>
        
        <div className={styles.dialogActions}>
          <button 
            className={styles.cancelButton} 
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={styles.confirmButton} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
} 