/**
 * Utility functions for the quizzes page
 */

/**
 * Format the remaining time in a human-readable format
 * @param {Date} deadline - The deadline date
 * @param {Date} now - Current time (optional, uses new Date() if not provided)
 * @returns {string} Formatted time string
 */
export function formatTimeRemaining(deadline, now = new Date()) {
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
 * Calculate the percentage of time elapsed for a quiz
 * @param {Date} startTime - When the quiz started
 * @param {Date} endTime - When the quiz ends
 * @param {Date} now - Current time (optional, uses new Date() if not provided)
 * @returns {number} Percentage of time elapsed (0-100)
 */
export function calculateTimeElapsed(startTime, endTime, now = new Date()) {
  // If quiz hasn't started yet
  if (now < startTime) {
    return 0;
  }
  
  // If quiz has ended
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
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return dateObj.toLocaleDateString('en-US', options);
}

/**
 * Setup click outside handler for a modal/dialog
 * @param {Function} closeHandler - Function to call when clicking outside
 * @param {Array} excludeSelectors - CSS selectors for elements to exclude from outside click detection
 * @returns {Function} Cleanup function to remove the event listener
 */
export function setupClickOutsideHandler(closeHandler, excludeSelectors = ['.quiz-dialog']) {
  const handleClickOutside = (event) => {
    // Check if the click is on the overlay (background) and not on any excluded elements
    const isClickOutside = excludeSelectors.every(selector => {
      const element = event.target.closest(selector);
      return !element;
    });
    
    if (isClickOutside && event.target.classList.contains('quiz-dialog-overlay')) {
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
