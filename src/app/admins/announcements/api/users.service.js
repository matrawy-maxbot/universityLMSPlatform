/**
 * Service for handling users API
 */

import { getCookie } from "cookies-next";

// API base URL
const API_BASE_URL = 'http://localhost:3001/api/v1';

const token = getCookie('access_token');

// Mock users for testing when API is not available
const MOCK_USERS = [
  {
    id: 'user1',
    firstname: 'Ahmed',
    lastname: 'Emad',
    email: 'ahmed@example.com',
    type: 1,
    profileimage: '/images/shadcn.jpg',
    status: 'Active'
  },
  {
    id: 'user2',
    firstname: 'Laila',
    lastname: 'Kamel',
    email: 'laila@example.com',
    type: 2,
    profileimage: 'https://i.pravatar.cc/150?img=5',
    status: 'Active'
  },
  {
    id: 'user3',
    firstname: 'Mohamed',
    lastname: 'Ali',
    email: 'mohamed@example.com',
    type: 3,
    profileimage: 'https://i.pravatar.cc/150?img=3',
    status: 'Active'
  }
];

/**
 * Get all users
 * @returns {Promise<Array>} List of users
 */
export const getAllUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!response.ok) {
      console.warn(`API request failed with status ${response.status}. Using mock data instead.`);
      return MOCK_USERS;
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    console.warn('Using mock data due to API error.');
    return MOCK_USERS;
  }
};

/**
 * Get user by ID
 * @param {string} id User ID
 * @returns {Promise<Object>} User data
 */
export const getUserById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!response.ok) {
      const mockUser = MOCK_USERS.find(user => user.id === id);
      if (mockUser) return mockUser;
      throw new Error(`Error fetching user: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Failed to fetch user with ID ${id}:`, error);
    const mockUser = MOCK_USERS.find(user => user.id === id);
    if (mockUser) return mockUser;
    throw error;
  }
};

/**
 * Get current user information
 * @returns {Promise<Object>} Current user data
 */
export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/verify-token`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching current user: ${response.statusText}`);
    }
    
    const data = await response.json();
    const user = data.user || (data.data && data.data.user);
    
    if (!user || !user.id) {
      throw new Error('No user data found in token');
    }
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

/**
 * Get text representation of user type
 * @param {number} type User type code
 * @returns {string} User type text
 */
export const getUserTypeText = (type) => {
  switch (type) {
    case 1:
      return 'Admin';
    case 2:
      return 'Doctor';
    case 3:
      return 'Assistant';
    case 4:
      return 'Student';
    case 5:
      return 'Admin & Doctor';
    default:
      return 'User';
  }
}; 