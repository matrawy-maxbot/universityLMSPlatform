/**
 * خدمة للتعامل مع API إعدادات التسجيل
 */

import { getCookie } from "cookies-next";
import axios from "axios";

// العنوان الأساسي للـ API
const API_BASE_URL = 'http://localhost:3001/api/v1';

// بيانات افتراضية للاستخدام عند فشل الاتصال بالخادم
const MOCK_REGISTRATION_SETTINGS = {
  open: true,
  maxhours: 18,
  minhours: 2,
  gpaconditions: [
    {
      lowerthan: 2.0,
      maxhours: 12
    },
    {
      lowerthan: 3.0,
      maxhours: 15
    }
  ],
  remainingcoursesids: ["COMP101", "MATH201", "PHYS301"],
  semesterid: 2,
  specifiedcourses: ["CS101", "MATH202"]
};

// بيانات افتراضية للكورسات
const MOCK_COURSES = [
  { id: 'CS101', coursename: 'Introduction to Computer Science', coursecode: 'CS101' },
  { id: 'CS102', coursename: 'Data Structures and Algorithms', coursecode: 'CS102' },
  { id: 'MATH101', coursename: 'Calculus I', coursecode: 'MATH101' },
  { id: 'MATH102', coursename: 'Calculus II', coursecode: 'MATH102' },
  { id: 'PHYS101', coursename: 'Physics I', coursecode: 'PHYS101' },
  { id: 'PHYS102', coursename: 'Physics II', coursecode: 'PHYS102' },
  { id: 'CHEM101', coursename: 'Chemistry I', coursecode: 'CHEM101' },
  { id: 'ENG101', coursename: 'English Composition', coursecode: 'ENG101' },
  { id: 'COMP101', coursename: 'Introduction to Programming', coursecode: 'COMP101' },
  { id: 'MATH201', coursename: 'Linear Algebra', coursecode: 'MATH201' },
  { id: 'PHYS301', coursename: 'Quantum Mechanics', coursecode: 'PHYS301' },
  { id: 'MATH202', coursename: 'Differential Equations', coursecode: 'MATH202' }
];

/**
 * الحصول على توكن المصادقة
 * @returns {string|null} توكن المصادقة أو null إذا لم يكن متوفرا
 */
const getAuthToken = () => {
  const token = getCookie('access_token');
  if (!token) {
    console.error('Authentication token not found');
    return null;
  }
  return token;
};

/**
 * إنشاء كائن تهيئة الطلب مع رأس المصادقة
 * @param {boolean} isJson ما إذا كان الطلب يتضمن بيانات JSON
 * @returns {Object} كائن التهيئة
 */
const getRequestConfig = (isJson = false) => {
  const token = getAuthToken();
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  if (isJson) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
};

/**
 * معالجة استجابة API
 * @param {Object} response استجابة API
 * @returns {Object} البيانات المعالجة
 */
const handleApiResponse = (response) => {
  if (response && response.data) {
    // تسجيل الاستجابة فقط في حالة وجود بيانات مهمة أو خطأ
    if (process.env.NODE_ENV === 'development') {
      // تسجيل بشكل مختصر لتجنب إغراق الكونسول
      if (Array.isArray(response.data.data)) {
        // إذا كانت الاستجابة تحتوي على مصفوفة، نطبع فقط عدد العناصر
        console.log(`API Response: ${response.data.data.length} items received`);
      } else {
        // طباعة أقل في حالة البيانات العادية
        const { success, message } = response.data;
        console.log(`API Response: success=${success}${message ? `, message=${message}` : ''}`);
      }
    }
    return response.data;
  }
  throw new Error('Invalid API response format');
};

/**
 * الحصول على إعدادات التسجيل
 * @returns {Promise<Object>} إعدادات التسجيل
 */
export const getRegistrationSettings = async () => {
  try {
    // محاولة الحصول على البيانات من API
    const config = getRequestConfig();
    const response = await axios.get(`${API_BASE_URL}/course-registration-settings`, config);
    const data = handleApiResponse(response);
    
    console.log('Original registration settings from API:', data);
    
    // Process the response to ensure consistent data structure
    let formattedSettings;
    
    // If data is wrapped in a data property, extract it
    if (data && data.data) {
      formattedSettings = data.data;
    } else if (data && typeof data === 'object') {
      // If data is directly in the response
      formattedSettings = data;
    } else {
      // Fall back to mock data if response format is unexpected
      console.warn('Unexpected API response format. Using mock data.');
      return MOCK_REGISTRATION_SETTINGS;
    }
    
    // Ensure all required properties exist with default values if missing
    const normalizedSettings = {
      open: formattedSettings.open || false,
      maxhours: formattedSettings.maxhours || 18,
      minhours: formattedSettings.minhours || 2,
      gpaconditions: Array.isArray(formattedSettings.gpaconditions) ? formattedSettings.gpaconditions : [],
      remainingcoursesids: Array.isArray(formattedSettings.remainingcoursesids) ? formattedSettings.remainingcoursesids : [],
      specifiedcourses: Array.isArray(formattedSettings.specifiedcourses) ? formattedSettings.specifiedcourses : [],
      semesterid: formattedSettings.semesterid || null
    };
    
    console.log('Normalized registration settings:', normalizedSettings);
    return normalizedSettings;
  } catch (error) {
    console.error('Error fetching registration settings:', error);
    
    // إذا كان الخطأ متعلق بالاتصال، ارجع بيانات وهمية
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.warn('Using mock registration settings data');
      return MOCK_REGISTRATION_SETTINGS;
    }
    
    throw error;
  }
};

/**
 * تحديث إعدادات التسجيل
 * @param {Object} settingsData بيانات إعدادات التسجيل المحدثة
 * @returns {Promise<Object>} إعدادات التسجيل المحدثة
 */
export const updateRegistrationSettings = async (settingsData) => {
  try {
    // Ensure data is properly formatted before sending
    const normalizedSettings = {
      open: settingsData.open || false,
      maxhours: settingsData.maxhours || 18,
      minhours: settingsData.minhours || 2,
      gpaconditions: Array.isArray(settingsData.gpaconditions) ? settingsData.gpaconditions : [],
      remainingcoursesids: Array.isArray(settingsData.remainingcoursesids) ? settingsData.remainingcoursesids : [],
      specifiedcourses: Array.isArray(settingsData.specifiedcourses) ? settingsData.specifiedcourses : [],
      semesterid: settingsData.semesterid || null
    };
    
    console.log('Sending normalized settings to API:', normalizedSettings);
    
    // محاولة تحديث البيانات عبر API
    const config = getRequestConfig(true);
    const response = await axios.put(
      `${API_BASE_URL}/course-registration-settings`,
      normalizedSettings,
      config
    );
    
    const data = handleApiResponse(response);
    console.log('Update response from API:', data);
    
    // Process the response to ensure consistent data structure
    let updatedSettings;
    
    // If data is wrapped in a data property, extract it
    if (data && data.data) {
      updatedSettings = data.data;
    } else if (data && typeof data === 'object') {
      // If data is directly in the response
      updatedSettings = data;
    } else {
      // If response doesn't contain the updated data, return the normalized input
      console.warn('API response did not include updated settings. Using sent data.');
      return normalizedSettings;
    }
    
    // Return the normalized version of the response data
    return {
      open: updatedSettings.open || false,
      maxhours: updatedSettings.maxhours || 18,
      minhours: updatedSettings.minhours || 2,
      gpaconditions: Array.isArray(updatedSettings.gpaconditions) ? updatedSettings.gpaconditions : [],
      remainingcoursesids: Array.isArray(updatedSettings.remainingcoursesids) ? updatedSettings.remainingcoursesids : [],
      specifiedcourses: Array.isArray(updatedSettings.specifiedcourses) ? updatedSettings.specifiedcourses : [],
      semesterid: updatedSettings.semesterid || normalizedSettings.semesterid
    };
  } catch (error) {
    console.error('Error updating registration settings:', error);
    
    // إذا كان الخطأ متعلق بالاتصال، ارجع البيانات المرسلة كأنها تم تحديثها
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.warn('Using provided data as mock update response');
      return settingsData;
    }
    
    throw error;
  }
};

/**
 * الحصول على قائمة الكورسات المتاحة
 * @returns {Promise<Array>} قائمة الكورسات
 */
export const getAllCourses = async () => {
  try {
    // محاولة الحصول على البيانات من API
    const config = getRequestConfig();
    const response = await axios.get(`${API_BASE_URL}/courses`, config);
    
    // معالجة البيانات المرجعة للتأكد من إرجاع مصفوفة
    const data = handleApiResponse(response);
    
    // التحقق من هيكل البيانات
    if (Array.isArray(data)) {
      // إذا كانت البيانات مصفوفة مباشرة
      return data;
    } else if (data && typeof data === 'object') {
      // إذا كانت البيانات في خاصية فرعية مثل data أو courses
      if (Array.isArray(data.data)) {
        return data.data;
      } else if (Array.isArray(data.courses)) {
        return data.courses;
      } else {
        // محاولة استخراج مصفوفة من كائن البيانات
        const possibleArrays = Object.values(data).filter(Array.isArray);
        if (possibleArrays.length > 0) {
          return possibleArrays[0];
        }
      }
    }
    
    // إذا لم نتمكن من العثور على مصفوفة، نعيد مصفوفة فارغة
    console.warn('Unexpected API response format for courses. Returning empty array.');
    return [];
    
  } catch (error) {
    console.error('Error fetching courses:', error);
    
    // إذا كان الخطأ متعلق بالاتصال، ارجع بيانات وهمية
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.warn('Using mock courses data');
      return MOCK_COURSES;
    }
    
    // في حالة حدوث خطأ آخر، نعيد مصفوفة فارغة
    return [];
  }
};

/**
 * الحصول على جميع السيميسترات (الفصول الدراسية)
 * @returns {Promise<Array>} قائمة السيميسترات
 */
export const getAllSemesters = async () => {
  try {
    const config = getRequestConfig();
    const response = await axios.get(`${API_BASE_URL}/semesters`, config);
    
    const data = handleApiResponse(response);
    
    // التحقق من هيكل البيانات
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.data)) {
        return data.data;
      } else if (Array.isArray(data.semesters)) {
        return data.semesters;
      } else {
        const possibleArrays = Object.values(data).filter(Array.isArray);
        if (possibleArrays.length > 0) {
          return possibleArrays[0];
        }
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching semesters:', error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.warn('Using mock semesters data');
      return [
        { id: 1, name: 'Fall', startyear: 2023, endyear: 2024, createdat: '2023-09-01', endedat: '2024-01-15' },
        { id: 2, name: 'Spring', startyear: 2024, endyear: 2024, createdat: '2024-01-20', endedat: null }
      ];
    }
    
    return [];
  }
};

/**
 * الحصول على السيميستر الحالي
 * @returns {Promise<Object>} بيانات السيميستر الحالي
 */
export const getCurrentSemester = async () => {
  try {
    const config = getRequestConfig();
    const response = await axios.get(`${API_BASE_URL}/semesters/current`, config);
    const data = handleApiResponse(response);
    
    console.log('Original semester data from API:', data);
    
    // فحص إذا كانت البيانات تشير إلى عدم وجود فصل دراسي نشط
    if (data && data.success === false && data.message === "No active semester found") {
      console.log('No active semester found (success: false response)');
      return null;
    }
    
    // تنسيق وتنظيف البيانات
    if (data && data.data) {
      // في بعض الأحيان تكون البيانات مغلفة داخل كائن data
      const semesterData = data.data;
      
      // تنسيق البيانات حسب هيكل قاعدة البيانات - مع توحيد أسماء الحقول
      const formattedData = {
        id: semesterData.id,
        name: semesterData.semester, // استخدام اسم الفصل الدراسي من حقل semester
        semester: semesterData.semester,
        startyear: semesterData.semesterstartyear,
        endyear: semesterData.semesterendyear,
        // توحيد اسم حقل تاريخ الإنشاء ليكون createdat (بحروف صغيرة)
        createdat: semesterData.createdAt || semesterData.createdat,
        endedat: semesterData.endedat
      };
      
      console.log('Formatted semester data:', formattedData);
      return formattedData;
    }
    
    // إذا كانت البيانات ليست مغلفة وتمثل فصل دراسي
    if (data && data.id) {
      const formattedData = {
        id: data.id,
        name: data.semester,
        semester: data.semester,
        startyear: data.semesterstartyear,
        endyear: data.semesterendyear,
        // توحيد اسم حقل تاريخ الإنشاء
        createdat: data.createdAt || data.createdat,
        endedat: data.endedat
      };
      
      console.log('Formatted semester data (no nesting):', formattedData);
      return formattedData;
    }
    
    // إذا وصلنا إلى هنا ولم يتم التعرف على شكل البيانات، فمن المحتمل أنه لا يوجد فصل دراسي نشط
    console.log('Unrecognized data format or no active semester. Returning null.');
    return null;
  } catch (error) {
    console.error('Error fetching current semester:', error);
    
    // التعامل مع حالة عدم وجود فصل دراسي نشط (404)
    if (error.response && error.response.status === 404) {
      console.log('No active semester found. This is an expected condition, not an error.');
      // إرجاع null لإشارة إلى عدم وجود فصل دراسي نشط
      return null;
    }
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.warn('Using mock current semester data');
      return { 
        id: 7, 
        name: 'fall', 
        semester: 'fall',
        startyear: '2024', 
        endyear: '2025', 
        createdat: new Date().toISOString(), 
        endedat: null 
      };
    }
    
    return null;
  }
};

/**
 * إنشاء سيميستر جديد
 * @param {Object} semesterData بيانات السيميستر الجديد
 * @returns {Promise<Object>} بيانات السيميستر المنشأ
 */
export const createSemester = async (semesterData) => {
  try {
    // تأكد من أن semester هو بحروف صغيرة
    if (semesterData.semester) {
      semesterData.semester = semesterData.semester.toLowerCase();
    }
    
    const config = getRequestConfig(true);
    console.log('Creating semester with data:', semesterData);
    
    const response = await axios.post(`${API_BASE_URL}/semesters`, semesterData, config);
    const responseData = handleApiResponse(response);
    
    console.log('API response for create semester:', responseData);
    
    // تحديد البيانات المرجعة حسب شكل الاستجابة
    const data = responseData.data || responseData;
    
    // إذا كانت البيانات المرجعة ليست بالشكل المطلوب، نقوم بتنسيقها
    if (data) {
      // توحيد أسماء الحقول خاصة تاريخ الإنشاء
      const formattedData = {
        id: data.id,
        semester: data.semester,
        semesterstartyear: data.semesterstartyear,
        semesterendyear: data.semesterendyear,
        // التعامل مع اختلاف تنسيق اسم حقل تاريخ الإنشاء (بالحروف الكبيرة والصغيرة)
        createdat: data.createdAt || data.createdat || data.createdAt || new Date().toISOString(),
        endedat: data.endedat
      };
      
      console.log('Returning formatted semester data:', formattedData);
      return formattedData;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating semester:', error);
    
    // طباعة المزيد من المعلومات التشخيصية عن الخطأ
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.warn('Using mock response for create semester');
      
      // إنشاء بيانات وهمية تتوافق مع هيكل البيانات المطلوب
      const mockData = { 
        ...semesterData, 
        id: Date.now(), 
        createdat: new Date().toISOString(), 
        endedat: null 
      };
      
      console.log('Returning mock semester data:', mockData);
      return mockData;
    }
    
    throw error;
  }
};

/**
 * تحديث بيانات سيميستر
 * @param {string|number} id معرف السيميستر
 * @param {Object} semesterData بيانات السيميستر المحدثة
 * @returns {Promise<Object>} بيانات السيميستر المحدث
 */
export const updateSemester = async (id, semesterData) => {
  try {
    const config = getRequestConfig(true);
    const response = await axios.put(`${API_BASE_URL}/semesters/${id}`, semesterData, config);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error updating semester:', error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.warn('Using mock response for update semester');
      return { ...semesterData, id, updatedat: new Date().toISOString() };
    }
    
    throw error;
  }
};

/**
 * إنهاء السيميستر
 * @param {string|number} id معرف السيميستر
 * @returns {Promise<Object>} بيانات السيميستر بعد الإنهاء
 */
export const endSemester = async (id) => {
  try {
    const config = getRequestConfig(true);
    const response = await axios.post(`${API_BASE_URL}/semesters/${id}/end`, {}, config);
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error ending semester:', error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.warn('Using mock response for end semester');
      return { id, endedat: new Date().toISOString() };
    }
    
    throw error;
  }
}; 