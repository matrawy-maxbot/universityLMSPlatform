/**
 * تصدير خدمات API المهام
 */

// API functions that use mock data
import { mockApis, mockSubmissionsApis } from '../mockData/mockAssignmentsData';

// Re-export all mock API functions
export const getAssignmentsByCourse = mockApis.getAssignmentsByCourse;
export const getAssignmentById = mockApis.getAssignmentById;
export const createAssignment = mockApis.createAssignment;
export const updateAssignment = mockApis.updateAssignment;
export const deleteAssignment = mockApis.deleteAssignment;
export const uploadAssignmentFile = mockApis.uploadAssignmentFile;
export const deleteAssignmentFile = mockApis.deleteAssignmentFile;
export const gradeSubmission = mockApis.gradeSubmission;

// Export submission-related APIs
export const getSubmissionsByAssignment = mockSubmissionsApis.getSubmissionsByAssignment;
export const getSubmissionById = mockSubmissionsApis.getSubmissionById;
export const downloadSubmissionFile = mockSubmissionsApis.downloadSubmissionFile;

// This file serves as a bridge between the application and the mock data
// In a real application, these functions would make actual API calls to a backend server 