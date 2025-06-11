'use client';

import React from 'react';
import styles from '../styles/SettingsForm.module.css';

export default function SettingsForm({ settings = {}, onChange = () => {} }) {
  // Ensure default values for all properties
  const safeSettings = {
    open: false,
    maxhours: 18,
    minhours: 2,
    ...settings
  };
  
  // Handle field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) : value);
    
    onChange({
      [name]: newValue
    });
  };
  
  return (
    <div className={styles.settingsFormContainer}>
      <h2 className={styles.sectionTitle}>Basic Registration Settings</h2>
      
      <div className={styles.formGrid}>
        {/* Registration Status */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <span className={styles.labelText}>Registration Status</span>
            <div className={styles.toggleContainer}>
              <input
                type="checkbox"
                id="registrationStatus"
                name="open"
                className={styles.toggleInput}
                checked={safeSettings.open}
                onChange={handleChange}
              />
              <label htmlFor="registrationStatus" className={styles.toggleSwitch}>
                <span className={styles.toggleSlider}></span>
              </label>
              <span className={styles.toggleLabel}>
                {safeSettings.open ? 'Open' : 'Closed'}
              </span>
            </div>
          </label>
        </div>
        
        {/* Minimum Credit Hours */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="minhours">
            <span className={styles.labelText}>Minimum Credit Hours</span>
          </label>
          <input
            type="number"
            id="minhours"
            name="minhours"
            className={styles.numberInput}
            min="1"
            max="24"
            value={safeSettings.minhours}
            onChange={handleChange}
          />
        </div>
        
        {/* Maximum Credit Hours */}
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="maxhours">
            <span className={styles.labelText}>Maximum Credit Hours</span>
          </label>
          <input
            type="number"
            id="maxhours"
            name="maxhours"
            className={styles.numberInput}
            min="1"
            max="24"
            value={safeSettings.maxhours}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div className={styles.settingsInfo}>
        <div className={styles.infoIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p>These settings define the general registration criteria for courses. The minimum and maximum credit hours apply to all students unless overridden by GPA conditions below.</p>
      </div>
    </div>
  );
} 