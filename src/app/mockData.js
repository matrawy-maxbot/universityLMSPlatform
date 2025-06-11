/**
 * Mock Data Index Module
 * 
 * This file re-exports all the mock data modules for easy access
 * throughout the application.
 */

// Re-export all mock data and utilities
export * from './mockUtils';
export * from './mockExtendedData';
export * from './mockAcademicData';
export * from './mockCourseData';

// Re-export the mock API service
export { default as mockApiService } from './api/mockApiService';

/**
 * Helper function to initialize mock data
 * This can be called at the application startup to ensure
 * all mock data is loaded and relationships are established
 */
export const initializeMockData = () => {
  console.log('Initializing mock data system...');
  // Perform any initialization tasks if needed
  // For now this is just a placeholder
  
  return {
    success: true,
    message: 'Mock data system initialized successfully'
  };
};

/**
 * Available mock user credentials for demonstration
 */
export const mockCredentials = [
  { type: 'Student', email: 'student8@university.edu', password: 'student123', userId: 'S008' },
  { type: 'Doctor', email: 'doctor1@university.edu', password: 'doctor123', userId: 'D001' },
  { type: 'Assistant', email: 'assistant1@university.edu', password: 'assistant123', userId: 'AS001' },
  { type: 'Admin', email: 'admin1@university.edu', password: 'admin123', userId: 'A001' },
  { type: 'Dept Head', email: 'doctor_admin@university.edu', password: 'doctoradmin123', userId: 'DA001' }
]; 