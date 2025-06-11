/**
 * API services index file
 * ملف فهرس خدمات API
 */

// Import mock data and API functions
import { mockStudentGradesApi } from '../mockData/mockStudentGradesData';

// Export mock API functions
export const getSemesters = mockStudentGradesApi.getSemesters;
export const getCurrentSemester = mockStudentGradesApi.getCurrentSemester;
export const getCoursesBySemester = mockStudentGradesApi.getCoursesBySemester;
export const getStudentGrades = mockStudentGradesApi.getStudentGrades;
export const updateStudentGrade = mockStudentGradesApi.updateStudentGrade;
export const bulkUpdateStudentGrades = mockStudentGradesApi.bulkUpdateStudentGrades;

// Add missing function that might be used by the application
export const getStudentCourseGrade = async (studentId, courseId, semesterId) => {
  const grades = await mockStudentGradesApi.getStudentGrades(courseId, semesterId);
  return grades.find(grade => grade.studentId === studentId) || null;
};

// This file serves as a bridge between the application and the mock data
// In a real application, these functions would make actual API calls to a backend server

// Remove the duplicate exports from studentGrades.service
// export { 
//   getSemesters, getCurrentSemester, 
//   getCoursesBySemester, 
//   getStudentGrades, updateStudentGrade, getStudentCourseGrade, bulkUpdateStudentGrades 
// } from './studentGrades.service'; 