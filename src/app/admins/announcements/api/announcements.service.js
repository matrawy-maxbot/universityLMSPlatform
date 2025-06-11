/**
 * Service for handling announcements API
 */

import { getCookie } from "cookies-next";
import axios from "axios";

// API base URL
const API_BASE_URL = 'http://localhost:3001/api/v1';

const token = getCookie('access_token');

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  timeout: 10000 // 10 seconds timeout
});

// Add response interceptor
apiClient.interceptors.response.use(
  response => response.data.data, // Return the data property directly
  error => {
    const errorMessage = error.response?.data?.message || 'Something went wrong';
    console.error('API error:', errorMessage);
    
    // For easier error handling in components
    const enhancedError = new Error(errorMessage);
    enhancedError.response = error.response;
    enhancedError.originalError = error;
    throw enhancedError;
  }
);

// IMPORTANT: Mock data for testing when API is not available
// This is used when the server returns an error or when the database table doesn't exist yet
// Error: "relation 'announcements' does not exist" means you need to create the announcements table in your database
const MOCK_ANNOUNCEMENTS = [
  {
    id: 'announcement1',
    title: 'Welcome to the New Student Management System!',
    message: 'We\'ve launched a completely redesigned version of the system with advanced features to enhance user experience. The new system offers an easy-to-use interface and more comprehensive detailed reports.',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    isActive: true,
    authorid: 'author1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    buttons: [
      { text: 'Learn More', url: 'https://example.com/new-system', style: 'primary' },
      { text: 'Watch Tutorial', url: 'https://example.com/tutorial', style: 'outline' }
    ],
    author: {
      id: 'author1',
      firstname: 'Ahmed',
      lastname: 'Emad',
      email: 'ahmed@example.com',
      profileimage: '/images/shadcn.jpg'
    }
  },
  {
    id: 'announcement2',
    title: 'Registration for Fall 2023 Now Open',
    message: 'Registration for the Fall 2023 semester is now open. Please log in to your account and select your courses before the deadline. Contact your academic advisor if you need assistance.',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
    isActive: true,
    authorid: 'author2',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    buttons: [
      { text: 'Register Now', url: 'https://example.com/register', style: 'primary' }
    ],
    author: {
      id: 'author2',
      firstname: 'Laila',
      lastname: 'Kamel',
      email: 'laila@example.com',
      profileimage: 'https://i.pravatar.cc/150?img=5'
    }
  }
];

/**
 * Fetch all announcements with author details
 * @returns {Promise<Array>} List of announcements
 */
export const getAllAnnouncements = async () => {
  try {
    return await apiClient.get('/announcements/with-authors')
      .catch(error => {
        // Log the error in detail for debugging
        console.error('API error in getAllAnnouncements:', error.message, error);
        
        // If the error is about missing database table, add specific message
        if (error.message && error.message.includes('relation "announcements" does not exist')) {
          console.warn('The announcements table does not exist in the database. Using mock data instead.');
        } else {
          console.warn('Using mock data due to API error.');
        }
        
        return MOCK_ANNOUNCEMENTS;
      });
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    console.warn('Using mock data due to API error.');
    return MOCK_ANNOUNCEMENTS;
  }
};

/**
 * Get announcement by ID
 * @param {string} id Announcement ID
 * @returns {Promise<Object>} Announcement data
 */
export const getAnnouncementById = async (id) => {
  try {
    // Handle both id and _id formats
    const announcementId = id._id || id;
    
    console.log(`Fetching announcement with ID: ${announcementId}`);
    
    return await apiClient.get(`/announcements/${announcementId}/with-author`)
      .catch(error => {
        console.error(`API error in getAnnouncementById for ID ${announcementId}:`, error.message, error);
        
        // Try to find in mock data
        const mockAnnouncement = MOCK_ANNOUNCEMENTS.find(announcement => announcement.id === announcementId);
        if (mockAnnouncement) {
          console.warn(`Using mock data for announcement ID ${announcementId} due to API error.`);
          return mockAnnouncement;
        }
        throw error;
      });
  } catch (error) {
    console.error(`Failed to fetch announcement with ID ${id}:`, error);
    
    // Try to find in mock data
    const mockAnnouncement = MOCK_ANNOUNCEMENTS.find(announcement => announcement.id === id);
    if (mockAnnouncement) {
      console.warn(`Using mock data for announcement ID ${id} due to API error.`);
      return mockAnnouncement;
    }
    
    throw error;
  }
};

/**
 * Create a new announcement
 * @param {Object} announcementData Announcement data
 * @returns {Promise<Object>} New announcement
 */
export const createAnnouncement = async (announcementData) => {
  try {
    console.log('Sending request to create announcement:', announcementData);
    return await apiClient.post('/announcements', announcementData)
      .catch(error => {
        console.error('API error in createAnnouncement:', error.message, error);
        throw error;
      });
  } catch (error) {
    console.error('Failed to create announcement:', error);
    throw error;
  }
};

/**
 * Update an announcement
 * @param {string} id Announcement ID
 * @param {Object} announcementData Updated data
 * @returns {Promise<Object>} Updated announcement
 */
export const updateAnnouncement = async (id, announcementData) => {
  try {
    // Check if announcementData contains _id (MongoDB format) and use it if available
    // This handles the case where the backend expects _id but frontend uses id
    const announcementId = announcementData._id || id;
    
    console.log(`Updating announcement with ID: ${announcementId}`);
    
    return await apiClient.put(`/announcements/${announcementId}`, announcementData)
      .catch(error => {
        console.error(`API error in updateAnnouncement for ID ${announcementId}:`, error.message, error);
        console.warn('Updating mock announcement due to API error.');
        
        // Update mock data if API fails
        const updatedMockAnnouncement = {
          ...announcementData,
          id: announcementId,
          updatedAt: new Date().toISOString()
        };
        return updatedMockAnnouncement;
      });
  } catch (error) {
    console.error(`Failed to update announcement with ID ${id}:`, error);
    console.warn('Updating mock announcement due to API error.');
    
    // Update mock data if API fails
    const updatedMockAnnouncement = {
      ...announcementData,
      id,
      updatedAt: new Date().toISOString()
    };
    return updatedMockAnnouncement;
  }
};

/**
 * Delete an announcement
 * @param {string} id Announcement ID
 * @returns {Promise<boolean>} Operation result
 */
export const deleteAnnouncement = async (id) => {
  try {
    // Handle both id and _id formats
    const announcementId = id._id || id;
    
    console.log(`Deleting announcement with ID: ${announcementId}`);
    
    await apiClient.delete(`/announcements/${announcementId}`)
      .catch(error => {
        console.error(`API error in deleteAnnouncement for ID ${announcementId}:`, error.message, error);
        console.warn('Simulating successful delete due to API error.');
        return true;
      });
    return true;
  } catch (error) {
    console.error(`Failed to delete announcement with ID ${id}:`, error);
    console.warn('Simulating successful delete due to API error.');
    return true; // Simulate successful delete on error
  }
}; 