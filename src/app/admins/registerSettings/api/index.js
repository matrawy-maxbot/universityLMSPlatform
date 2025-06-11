/**
 * ملف تصدير لوظائف API
 */

export { 
  // وظائف إعدادات التسجيل
  getRegistrationSettings,
  updateRegistrationSettings,
  getAllCourses,
  
  // وظائف السيميسترات
  getAllSemesters,
  getCurrentSemester,
  createSemester,
  updateSemester,
  endSemester
} from './registration-settings.service'; 