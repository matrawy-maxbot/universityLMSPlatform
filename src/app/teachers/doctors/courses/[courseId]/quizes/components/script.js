/**
 * Utility functions for the Quizzes page in teacher assistant view
 */

/**
 * Format a date to a readable string (e.g., DD/MM/YYYY, HH:MM)
 * @param {Date|string} date - The date to format
 * @param {boolean} includeTime - Whether to include the time (default: true)
 * @returns {string} Formatted date string or 'Invalid Date'
 */
export function formatDate(date, includeTime = true) {
  if (!date) return 'N/A'; // Handle null or undefined dates
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'Invalid Date'; // Check for invalid date objects

  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = false; // Use 24-hour format or true for 12-hour with AM/PM
  }

  return dateObj.toLocaleDateString('en-GB', options);
}

/**
 * Format the remaining or upcoming time for a quiz
 * @param {Date|string} targetTime - The start or end time of the quiz
 * @param {string} status - The current status of the quiz ('active', 'postponed', 'completed', 'scheduled')
 * @returns {string} Formatted time string (e.g., "Ends in 2 hours", "Starts in 3 days", "Finished")
 */
export function formatQuizTimeStatus(targetTime, status, startTime = null) {
  if (!targetTime && status !== 'completed') return 'Time N/A';
  if (status === 'completed') return 'Finished';
  if (status === 'postponed') return 'Postponed'; 

  const now = new Date();
  const time = new Date(targetTime);
  if (isNaN(time.getTime())) return 'Invalid Time';

  let timeDifference = time - now;
  let unit = '';
  let value = 0;
  let prefix = '';

  if (status === 'active') {
    prefix = 'Ends in ';
    if (timeDifference <= 0) return 'Ending now';
  } else if (status === 'scheduled' || (status === 'postponed' && startTime)) {
    // For postponed, if startTime is provided, calculate relative to that for upcoming start
    const actualTargetTime = status === 'postponed' && startTime ? new Date(startTime) : time;
    timeDifference = actualTargetTime - now;
    prefix = 'Starts in ';
    if (timeDifference <= 0) return 'Starting soon / Check status';
  } else {
    return 'Scheduled'; // Default for scheduled if no specific time difference logic fits
  }
  

  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    value = days;
    unit = `day${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    value = hours;
    unit = `hour${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    value = minutes;
    unit = `minute${minutes > 1 ? 's' : ''}`;
  } else {
    return status === 'active' ? 'Ending now' : 'Starting soon';
  }
  return `${prefix}${value} ${unit}`;
}


/**
 * Format quiz status for display
 * @param {string} status - Quiz status (e.g., 'active', 'completed', 'postponed')
 * @returns {string} Formatted status text (e.g., "Active", "Completed")
 */
export function formatQuizStatus(status) {
  if (!status) return 'N/A';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Validate uploaded file (can be reused from assignments or made generic)
 * @param {File} file - The file to validate
 * @param {Array} allowedTypes - Allowed MIME types
 * @param {number} maxSizeMB - Maximum file size in MB (default: 10MB)
 * @returns {Object} Validation result { valid: boolean, message: string }
 */
export function validateFile(file, allowedTypes, maxSizeMB = 10) {
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      message: `File is too large. Max size: ${maxSizeMB}MB.`
    };
  }
  if (allowedTypes && allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes.map(type => type.substring(type.lastIndexOf('/') + 1)).join(', ');
    return {
      valid: false,
      message: `Invalid file type. Allowed: ${allowedExtensions}.`
    };
  }
  return { valid: true, message: 'File is valid' };
}

/**
 * Format file size from bytes to KB, MB, GB
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size string
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Simulate file download (can be reused or adapted)
 * @param {object} file - File object with name and url (or fileObject for new files)
 */
export function downloadFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || (!file.url && !file.fileObject)) {
      return reject(new Error('File URL or object is missing.'));
    }
    try {
      const link = document.createElement('a');
      if (file.fileObject && !file.url) { // For newly added files not yet uploaded
        link.href = URL.createObjectURL(file.fileObject);
      } else {
        link.href = file.url;
      }
      link.download = file.name || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (file.fileObject && !file.url) {
        URL.revokeObjectURL(link.href); // Clean up object URL
      }
      resolve({ success: true, fileName: file.name });
    } catch (error) {
      console.error('Download error:', error);
      reject(error);
    }
  });
}

/**
 * Setup click outside handler for a modal/dialog
 * @param {Function} closeHandler - Function to call when clicking outside
 * @param {Array<string>} dialogSelectors - CSS selectors for the dialog elements themselves
 * @param {string} overlaySelector - CSS selector for the overlay (optional)
 * @returns {Function} Cleanup function to remove the event listener
 */
export function setupClickOutsideHandler(closeHandler, dialogSelectors, overlaySelector = null) {
  const handleClickOutside = (event) => {
    const isClickInsideDialog = dialogSelectors.some(selector => event.target.closest(selector));
    
    if (isClickInsideDialog) {
      return; // Click was inside one of the dialog elements
    }

    // If an overlay selector is provided, only close if the click is directly on the overlay
    if (overlaySelector) {
      if (event.target.matches(overlaySelector)) {
        closeHandler();
      }
    } else {
      // If no overlay selector, assume any click outside the dialogs should close (use with caution)
      closeHandler(); 
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}

/**
 * Formats a date string (ISO or Date object) to "YYYY-MM-DDTHH:mm" for datetime-local input.
 * @param {string | Date} isoString - The ISO date string or Date object.
 * @returns {string} The formatted string or empty if input is invalid.
 */
export const formatDateTimeLocal = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return ''; // Invalid date

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (e) {
    console.error("Error formatting date-time local:", isoString, e);
    return '';
  }
};

/**
 * Calculate the percentage of time elapsed for a quiz.
 * @param {string | Date} startTime - The quiz start time.
 * @param {string | Date} endTime - The quiz end time.
 * @param {Date} [now=new Date()] - The current time.
 * @returns {number} Percentage elapsed (0-100), or 0 if times are invalid/not started, 100 if finished.
 */
export function calculateQuizProgress(startTime, endTime, now = new Date()) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
    return 0; // Invalid times or start is after end
  }

  if (now < start) {
    return 0; // Quiz hasn't started
  }

  if (now >= end) {
    return 100; // Quiz has finished
  }

  const totalDuration = end - start;
  const elapsed = now - start;
  
  return Math.max(0, Math.min(100, Math.floor((elapsed / totalDuration) * 100)));
}
