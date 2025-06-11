'use client';

import React, { useState } from 'react';
import styles from '../styles/GPAConditionsList.module.css';

export default function GPAConditionsList({ 
  conditions = [],
  onAddCondition, 
  onRemoveCondition 
}) {
  const [newCondition, setNewCondition] = useState({
    lowerthan: 2.0,
    maxhours: 12
  });

  // Add new GPA condition
  const handleAddCondition = () => {
    onAddCondition(newCondition);
    
    // Reset default values
    setNewCondition({
      lowerthan: 2.0,
      maxhours: 12
    });
  };

  // Change value in new condition form
  const handleNewConditionChange = (e) => {
    const { name, value } = e.target;
    setNewCondition(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  return (
    <div className={styles.gpaConditionsContainer}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>GPA-Based Credit Hour Conditions</h2>
        <button 
          className={styles.addButton}
          onClick={handleAddCondition}
          aria-label="Add GPA condition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Condition
        </button>
      </div>
      
      {/* Add new condition form */}
      <div className={styles.newConditionForm}>
        <div className={styles.conditionRow}>
          <div className={styles.gpaField}>
            <label className={styles.fieldLabel}>GPA less than</label>
            <input
              type="number"
              name="lowerthan"
              className={styles.gpaInput}
              value={newCondition.lowerthan}
              onChange={handleNewConditionChange}
              step="0.1"
              min="0"
              max="4.0"
            />
          </div>
          
          <div className={styles.hoursField}>
            <label className={styles.fieldLabel}>Maximum Hours</label>
            <input
              type="number"
              name="maxhours"
              className={styles.hoursInput}
              value={newCondition.maxhours}
              onChange={handleNewConditionChange}
              min="1"
              max="24"
            />
          </div>
        </div>
      </div>
      
      {conditions.length === 0 ? (
        <div className={styles.emptyState}>
          <svg xmlns="http://www.w3.org/2000/svg" className={styles.emptyIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>No GPA conditions defined. Add a condition to set credit hour limits based on student GPA.</p>
        </div>
      ) : (
        <div className={styles.conditionsGrid}>
          <div className={styles.conditionHeader}>
            <div className={styles.gpaHeader}>GPA less than</div>
            <div className={styles.hoursHeader}>Maximum Hours</div>
            <div className={styles.actionHeader}>Actions</div>
          </div>
          
          {conditions.map((condition, index) => (
            <div key={index} className={styles.conditionRow}>
              <div className={styles.gpaField}>
                <span className={styles.conditionValue}>{condition.lowerthan}</span>
              </div>
              
              <div className={styles.hoursField}>
                <span className={styles.conditionValue}>{condition.maxhours}</span>
              </div>
              
              <div className={styles.actionField}>
                <button 
                  className={styles.removeButton}
                  onClick={() => onRemoveCondition(index)}
                  aria-label="Remove condition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className={styles.conditionsInfo}>
        <div className={styles.infoIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p>These conditions override the general maximum credit hours based on student GPA. For example, if a student's GPA is below 2.0, they may be limited to 12 credit hours instead of the general maximum.</p>
      </div>
    </div>
  );
} 