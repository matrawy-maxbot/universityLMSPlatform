/**
 * تصدير خدمات API الاختبارات القصيرة
 */

// Import mock data and API functions
import { mockQuizApi } from '../mockData/mockQuizesData';

// Re-export all mock API functions
export const getQuizzesByCourse = mockQuizApi.getQuizzesByCourse;
export const getQuizById = mockQuizApi.getQuizById;
export const createQuiz = mockQuizApi.createQuiz;
export const updateQuiz = mockQuizApi.updateQuiz;
export const deleteQuiz = mockQuizApi.deleteQuiz;
export const uploadQuizFile = mockQuizApi.uploadQuizFile;
export const deleteQuizFile = mockQuizApi.deleteQuizFile;

// This file serves as a bridge between the application and the mock data
// In a real application, these functions would make actual API calls to a backend server 