/**
 * Utility functions for the assignments page
 */

/**
 * Format the remaining time in a human-readable format
 * @param {Date} deadline - The deadline date
 * @returns {string} Formatted time string
 */
export function formatTimeRemaining(deadline) {
  const now = new Date();
  const timeRemaining = deadline - now;
  
  // If deadline has passed
  if (timeRemaining <= 0) {
    return 'Deadline passed';
  }
  
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} left`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} left`;
  } else {
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes} minute${minutes > 1 ? 's' : ''} left`;
  }
}

/**
 * Calculate the percentage of time elapsed for an assignment
 * @param {Date} startTime - When the assignment started
 * @param {Date} endTime - When the assignment ends
 * @param {Date} now - Current time (optional, uses new Date() if not provided)
 * @returns {number} Percentage of time elapsed (0-100)
 */
export function calculateTimeElapsed(startTime, endTime, now = new Date()) {
  // If assignment hasn't started yet
  if (now < startTime) {
    return 0;
  }
  
  // If assignment has ended
  if (now > endTime) {
    return 100;
  }
  
  // Calculate percentage
  const totalDuration = endTime - startTime;
  const elapsed = now - startTime;
  return Math.floor((elapsed / totalDuration) * 100);
}

/**
 * Format a date to a readable string
 * @param {Date|string} date - The date to format
 * @param {boolean} includeTime - Whether to include the time
 * @returns {string} Formatted date string
 */
export function formatDate(date, includeTime = true) {
  const dateObj = new Date(date);
  
  const options = {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  // Format as DD/MM/YYYY
  return dateObj.toLocaleDateString('en-GB', options);
}

/**
 * Format a file size in a human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate uploaded file
 * @param {File} file - The file to validate
 * @param {Array} allowedTypes - Allowed MIME types
 * @param {number} maxSize - Maximum file size in bytes (default: 5MB)
 * @returns {Object} Validation result with valid flag and message
 */
export function validateFile(file, allowedTypes, maxSize = 5 * 1024 * 1024) {
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      message: `File is too large. Maximum size is ${Math.floor(maxSize / (1024 * 1024))}MB.`
    };
  }
  
  // Check file type
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: `Invalid file type. Allowed types: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`
    };
  }
  
  // File is valid
  return {
    valid: true,
    message: 'File is valid'
  };
}

/**
 * Get file extension from file object
 * @param {File} file - The file object
 * @returns {string} The file extension
 */
export function getFileExtension(file) {
  return file.name.split('.').pop().toLowerCase();
}

/**
 * Get appropriate icon based on file type
 * @param {File} file - The file object
 * @returns {string} Icon path or name
 */
export function getFileIcon(file) {
  const extension = getFileExtension(file);
  
  // This is a simplistic approach, in a real app you'd have more comprehensive mapping
  switch(extension) {
    case 'pdf':
      return 'pdf-icon';
    case 'doc':
    case 'docx':
      return 'word-icon';
    case 'xls':
    case 'xlsx':
      return 'excel-icon';
    case 'ppt':
    case 'pptx':
      return 'powerpoint-icon';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'image-icon';
    default:
      return 'file-icon';
  }
}

/**
 * Simulate file download (in a real app, this would use actual API)
 * @param {Object} file - The file to download
 * @returns {Promise} Promise that resolves when download completes
 */
export function downloadFile(file) {
  return new Promise((resolve, reject) => {
    try {
      // For demo purposes, just simulate a download - in real app, this would be replaced with actual download logic
      console.log(`Downloading file: ${file.name}`);
      
      // Create a fake download link (in real app this would be the actual file URL)
      const link = document.createElement('a');
      link.href = file.url || 'data:;base64,';
      link.download = file.name;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Simulate network delay
      setTimeout(() => {
        resolve({ success: true, file: file.name });
      }, 1000);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Setup click outside handler for a modal/dialog
 * @param {Function} closeHandler - Function to call when clicking outside
 * @param {Array} excludeSelectors - CSS selectors for elements to exclude from outside click detection
 * @returns {Function} Cleanup function to remove the event listener
 */
export function setupClickOutsideHandler(closeHandler, excludeSelectors = ['.assignment-dialog']) {
  const handleClickOutside = (event) => {
    // Check if the click is on the overlay (background) and not on any excluded elements
    const isClickOutside = excludeSelectors.every(selector => {
      const element = event.target.closest(selector);
      return !element;
    });
    
    if (isClickOutside && event.target.classList.contains('assignment-dialog-overlay')) {
      closeHandler();
    }
  };
  
  // Add the event listener
  document.addEventListener('mousedown', handleClickOutside);
  
  // Return a cleanup function
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}

/**
 * Group assignments by course
 * @param {Array} assignments - Array of assignment objects
 * @returns {Object} Object with course names as keys and arrays of assignments as values
 */
export function groupAssignmentsByCourse(assignments) {
  return assignments.reduce((groups, assignment) => {
    const course = assignment.course;
    if (!groups[course]) {
      groups[course] = [];
    }
    groups[course].push(assignment);
    return groups;
  }, {});
}

/**
 * Format the assignment status for display
 * @param {string} status - The assignment status
 * @returns {string} Formatted status text
 */
export function formatAssignmentStatus(status) {
  switch(status) {
    case 'active':
      return 'Active';
    case 'submitted':
      return 'Submitted';
    case 'completed':
      return 'Completed';
    case 'postponed':
      return 'Postponed';
    case 'missing':
      return 'Missing';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
