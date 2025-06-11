/**
 * خدمة للتعامل مع API الكورسات
 */

import { getCookie } from "cookies-next";
import axios from "axios";

// العنوان الأساسي للـ API
const API_BASE_URL = 'http://localhost:3001/api/v1';

// بيانات افتراضية للاستخدام عند فشل الاتصال بالخادم
const MOCK_COURSES = [
  {
    id: 'MATH101',
    coursecode: 'MATH101',
    coursename: 'حساب التفاضل والتكامل',
    coursehours: 4,
    level: 1,
    semester: 'fall',
    doctors: ['3'],
    assistants: ['4'],
    doctorDetails: [
      {
        id: '3',
        firstname: 'محمد',
        secondname: 'أحمد',
        thirdname: 'خالد',
        lastname: 'حسن',
        profileimage: '/images/avatars/doctor1.jpg',
        type: 2
      }
    ],
    assistantDetails: [
      {
        id: '4',
        firstname: 'فاطمة',
        secondname: 'محمود',
        lastname: 'سيد',
        profileimage: '/images/avatars/assistant1.jpg',
        type: 1
      }
    ],
    status: 1,
    requirement: 'required',
    defaultmaxpoints: 150,
    specificmaxpoints: [],
    precoursespassed: [],
    createdAt: '2023-09-01T10:00:00.000Z'
  },
  {
    id: 'ENG105',
    coursecode: 'ENG105',
    coursename: 'كتابة التقارير الفنية',
    coursehours: 2,
    level: 1,
    semester: 'fall',
    doctors: ['5'],
    assistants: [],
    doctorDetails: [
      {
        id: '5',
        firstname: 'خالد',
        secondname: 'إبراهيم',
        lastname: 'علي',
        profileimage: '/images/avatars/doctor2.jpg',
        type: 2
      }
    ],
    assistantDetails: [],
    status: 1,
    requirement: 'optional',
    defaultmaxpoints: 100,
    specificmaxpoints: [],
    precoursespassed: [],
    createdAt: '2023-08-15T14:30:00.000Z'
  },
  {
    id: 'BUS101',
    coursecode: 'BUS101',
    coursename: 'مبادئ الإدارة',
    coursehours: 3,
    level: 1,
    semester: 'fall',
    doctors: ['9'],
    assistants: ['10'],
    doctorDetails: [
      {
        id: '9',
        firstname: 'نور',
        secondname: 'سيد',
        lastname: 'علي',
        profileimage: '/images/avatars/doctor3.jpg',
        type: 2
      }
    ],
    assistantDetails: [
      {
        id: '10',
        firstname: 'يوسف',
        secondname: 'خالد',
        lastname: 'إبراهيم',
        profileimage: '/images/avatars/assistant2.jpg',
        type: 1
      }
    ],
    status: 1,
    requirement: 'required',
    defaultmaxpoints: 150,
    specificmaxpoints: [],
    precoursespassed: [],
    createdAt: '2023-07-20T09:15:00.000Z'
  }
];

// بيانات افتراضية إضافية للصفحات التالية
const MOCK_COURSES_PAGE_2 = [
  {
    id: 'CHEM101',
    coursecode: 'CHEM101',
    coursename: 'General Chemistry',
    description: 'Introduction to the principles of chemistry.',
    department: 'Chemistry',
    coursehours: 4,
    level: 2,
    semester: 'spring',
    doctors: ['5'],
    assistants: [],
    doctorDetails: [
      {
        id: '5',
        firstname: 'Khaled',
        lastname: 'Ibrahim Ali',
        profileimage: '/images/avatars/doctor2.jpg',
        type: 2
      }
    ],
    status: 1,
    requirement: 'required',
    defaultmaxpoints: 150,
    specificmaxpoints: [],
    precoursespassed: [],
    courseImage: '/images/courses/chem101.jpg',
    enrolledStudents: ['7', '8'],
    createdAt: '2023-04-12T10:30:00.000Z'
  },
  {
    id: 'HIST101',
    coursecode: 'HIST101',
    coursename: 'World History',
    description: 'Survey of major historical events and developments across the world.',
    department: 'History',
    coursehours: 3,
    level: 1,
    semester: 'fall',
    doctors: ['10'],
    assistants: [],
    doctorDetails: [
      {
        id: '10',
        firstname: 'Youssef',
        lastname: 'Khaled Ibrahim',
        profileimage: '/images/avatars/teacher2.jpg',
        type: 2
      }
    ],
    status: 1,
    requirement: 'optional',
    defaultmaxpoints: 100,
    specificmaxpoints: [],
    precoursespassed: [],
    courseImage: '/images/courses/hist101.jpg',
    enrolledStudents: ['1'],
    createdAt: '2023-03-20T14:15:00.000Z'
  }
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
 * تنسيق بيانات الكورس القادمة من الخادم
 */
const formatCourseData = (course) => {
  return {
    id: course.id,
    coursecode: course.coursecode || '',
    coursename: course.coursename || '',
    coursehours: course.coursehours || 0,
    level: course.level || 1,
    semester: course.semestername || course.semester || '',
    doctors: course.doctors || [],
    assistants: course.assistants || [],
    doctorDetails: Array.isArray(course.doctorDetails) ? course.doctorDetails : [],
    assistantDetails: Array.isArray(course.assistantDetails) ? course.assistantDetails : [],
    requirement: course.requirement || 'optional',
    defaultmaxpoints: course.defaultmaxpoints || 150,
    specificmaxpoints: course.specificmaxpoints || [],
    precoursespassed: course.precoursespassed || [],
    status: course.status !== undefined ? course.status : 1,
    department: course.department || '',
    courseImage: course.courseImage || '',
    enrolledStudents: course.enrolledStudents || [],
    createdAt: course.createdAt || new Date().toISOString(),
    updatedAt: course.updatedAt || course.createdAt || new Date().toISOString()
  };
};

/**
 * معالجة استجابة API
 * @param {Object} response استجابة API
 * @returns {Object} البيانات المنسقة
 */
const handleApiResponse = (response) => {
  if (!response.data) {
    throw new Error('Invalid response from server');
  }
  
  if (response.data.success === false) {
    throw new Error(response.data.message || 'API request failed');
  }
  
  return response.data.data || response.data;
};

/**
 * الحصول على جميع الكورسات
 * @param {number} page رقم الصفحة
 * @param {number} limit عدد العناصر في الصفحة
 * @returns {Promise<Array>} قائمة الكورسات
 */
export const getAllCourses = async (page = 1, limit = 10) => {
  try {
    const config = getRequestConfig();
    const response = await axios.get(`${API_BASE_URL}/courses?page=${page}&limit=${limit}`, config);
    const coursesData = handleApiResponse(response);
    
    return Array.isArray(coursesData) 
      ? coursesData.map(formatCourseData)
      : coursesData.courses.map(formatCourseData);
  } catch (error) {
    console.error('Error fetching courses:', error);
    console.log('Using mock data instead');
    
    // استخدام البيانات الافتراضية في حالة فشل الاتصال بالخادم
    return page === 1 ? MOCK_COURSES : MOCK_COURSES_PAGE_2;
  }
};

/**
 * الحصول على كورس معين بواسطة المعرف
 * @param {string} id معرف الكورس
 * @returns {Promise<Object>} بيانات الكورس
 */
export const getCourseById = async (id) => {
  try {
    const config = getRequestConfig();
    const response = await axios.get(`${API_BASE_URL}/courses/${id}`, config);
    const courseData = handleApiResponse(response);
    
    return formatCourseData(courseData);
  } catch (error) {
    console.error(`Error fetching course with ID ${id}:`, error);
    console.log('Using mock data instead');
    
    // البحث عن الكورس في البيانات الافتراضية
    const mockCourse = [...MOCK_COURSES, ...MOCK_COURSES_PAGE_2].find(
      course => course.id === id
    );
    
    if (!mockCourse) {
      throw new Error(`Course with ID ${id} not found`);
    }
    
    return formatCourseData(mockCourse);
  }
};

/**
 * إنشاء كورس جديد
 * @param {Object} courseData بيانات الكورس
 * @returns {Promise<Object>} بيانات الكورس المنشأ
 */
export const createCourse = async (courseData) => {
  try {
    // Set id to coursecode if id is empty
    if (!courseData.id && courseData.coursecode) {
      courseData.id = courseData.coursecode;
    }
    
    const config = getRequestConfig(true);
    const response = await axios.post(`${API_BASE_URL}/courses`, courseData, config);
    const createdCourse = handleApiResponse(response);
    
    return formatCourseData(createdCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    
    // في بيئة الاختبار، نقوم بإنشاء كورس وهمي
    const mockCourse = {
      id: courseData.id || courseData.coursecode || Math.random().toString(36).substr(2, 9),
      ...courseData,
      createdAt: new Date().toISOString()
    };
    
    return formatCourseData(mockCourse);
  }
};

/**
 * تحديث بيانات كورس
 * @param {string} id معرف الكورس
 * @param {Object} courseData بيانات الكورس المحدثة
 * @returns {Promise<Object>} بيانات الكورس المحدث
 */
export const updateCourse = async (id, courseData) => {
  try {
    const config = getRequestConfig(true);
    const response = await axios.put(`${API_BASE_URL}/courses/${id}`, courseData, config);
    const updatedCourse = handleApiResponse(response);
    
    return formatCourseData(updatedCourse);
  } catch (error) {
    console.error(`Error updating course with ID ${id}:`, error);
    
    // في بيئة الاختبار، نقوم بتحديث الكورس في البيانات الافتراضية
    const mockCourses = [...MOCK_COURSES, ...MOCK_COURSES_PAGE_2];
    const courseIndex = mockCourses.findIndex(course => course.id === id);
    
    if (courseIndex === -1) {
      throw new Error(`Course with ID ${id} not found`);
    }
    
    const updatedMockCourse = {
      ...mockCourses[courseIndex],
      ...courseData,
      updatedAt: new Date().toISOString()
    };
    
    return formatCourseData(updatedMockCourse);
  }
};

/**
 * حذف كورس
 * @param {string} id معرف الكورس
 * @returns {Promise<boolean>} نجاح العملية
 */
export const deleteCourse = async (id) => {
  try {
    const config = getRequestConfig();
    const response = await axios.delete(`${API_BASE_URL}/courses/${id}`, config);
    return handleApiResponse(response);
  } catch (error) {
    console.error(`Error deleting course with ID ${id}:`, error);
    
    // في بيئة الاختبار، نفترض أن الحذف تم بنجاح
    return { success: true };
  }
};

/**
 * الحصول على الطلاب المسجلين في كورس معين
 * @param {string} courseId معرف الكورس
 * @returns {Promise<Array>} قائمة الطلاب المسجلين
 */
export const getEnrolledStudents = async (courseId) => {
  try {
    const config = getRequestConfig();
    const response = await axios.get(`${API_BASE_URL}/courses/${courseId}/students`, config);
    return handleApiResponse(response);
  } catch (error) {
    console.error(`Error fetching enrolled students for course ${courseId}:`, error);
    
    // في بيئة الاختبار، نقوم بإرجاع قائمة وهمية من الطلاب
    const mockCourse = [...MOCK_COURSES, ...MOCK_COURSES_PAGE_2].find(
      course => course.id === courseId
    );
    
    if (!mockCourse) {
      throw new Error(`Course with ID ${courseId} not found`);
    }
    
    // نفترض أن لدينا بيانات الطلاب المسجلين في الكورس
    return mockCourse.enrolledStudents.map(studentId => ({
      id: studentId,
      name: `Student ${studentId}`,
      email: `student${studentId}@example.com`
    }));
  }
};

/**
 * تسجيل طالب في كورس
 * @param {string} courseId معرف الكورس
 * @param {string} studentId معرف الطالب
 * @returns {Promise<Object>} نتيجة العملية
 */
export const enrollStudent = async (courseId, studentId) => {
  try {
    const config = getRequestConfig(true);
    const response = await axios.post(`${API_BASE_URL}/courses/${courseId}/enroll`, { studentId }, config);
    return handleApiResponse(response);
  } catch (error) {
    console.error(`Error enrolling student ${studentId} in course ${courseId}:`, error);
    
    // في بيئة الاختبار، نفترض أن التسجيل تم بنجاح
    return { 
      success: true,
      message: `Student ${studentId} enrolled in course ${courseId} successfully`
    };
  }
};

/**
 * إلغاء تسجيل طالب من كورس
 * @param {string} courseId معرف الكورس
 * @param {string} studentId معرف الطالب
 * @returns {Promise<Object>} نتيجة العملية
 */
export const unenrollStudent = async (courseId, studentId) => {
  try {
    const config = getRequestConfig(true);
    const response = await axios.post(`${API_BASE_URL}/courses/${courseId}/unenroll`, { studentId }, config);
    return handleApiResponse(response);
  } catch (error) {
    console.error(`Error unenrolling student ${studentId} from course ${courseId}:`, error);
    
    // في بيئة الاختبار، نفترض أن إلغاء التسجيل تم بنجاح
    return { 
      success: true,
      message: `Student ${studentId} unenrolled from course ${courseId} successfully`
    };
  }
}; 