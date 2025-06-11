/**
 * Student Grades API Service
 * خدمة API لإدارة درجات الطلاب
 */
import { getCookie } from 'cookies-next';
import axios from 'axios';

// Base URL for API
const API_BASE_URL = 'http://localhost:3001/api/v1';

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${getCookie('access_token')}`,
    'Content-Type': 'application/json'
  }
});

// Get auth token from cookies
const getAuthToken = () => {
  const token = getCookie('access_token');
  console.log('Auth token:', token ? 'Token exists' : 'No token found');
  return token || '';
};

// Check if user is logged in
const isAuthenticated = () => {
  const token = getAuthToken();
  const authenticated = !!token;
  console.log('User authenticated:', authenticated);
  return authenticated;
};

// Get request config with auth headers
const getRequestConfig = () => {
  const token = getAuthToken();
  return {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
};

// Handle API response
const handleApiResponse = (response) => {
  console.log('API Response:', {
    status: response.status,
    statusText: response.statusText,
    hasData: !!response.data,
    success: response.data?.success !== false
  });
  
  if (response.data && response.data.success === false) {
    throw new Error(response.data.message || 'حدث خطأ أثناء الاتصال بالخادم');
  }
  
  return response.data.data || response.data;
};

/**
 * Get all semesters
 * الحصول على جميع الفصول الدراسية
 */
export const getSemesters = async () => {
  console.log('Fetching semesters...');
  try {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      console.warn('User is not authenticated. Redirecting to login page...');
      // Return empty array instead of throwing error to prevent React error
      return [];
    }
    
    console.log('Making API request to get semesters');
    const response = await instance.get(
      `${API_BASE_URL}/semesters`,
    );
    
    const data = handleApiResponse(response);
    console.log('Semesters data received:', {
      count: data.length,
      semesters: data.map(s => ({ id: s.id, name: s.semester, active: !!s.isActive }))
    });
    return data;
  } catch (error) {
    console.error('Error fetching semesters:', error);
    console.log('Error details:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response'
    });
    
    // Check if it's an auth error
    if (error.response && error.response.status === 401) {
      console.warn('Authentication error. Redirecting to login page...');
      // Redirect to login page (handled by the component)
      return [];
    }
    throw new Error('فشل في الحصول على الفصول الدراسية');
  }
};

/**
 * Get courses by semester
 * الحصول على المقررات حسب الفصل الدراسي
 */
export const getCoursesBySemester = async (semesterId) => {
  console.log('Fetching courses for semester:', semesterId);
  try {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      console.warn('User is not authenticated. Redirecting to login page...');
      return [];
    }
    
    if (!semesterId) {
      console.error('Invalid semesterId:', semesterId);
      return [];
    }
    
    console.log('Making API request to get courses for semester', semesterId);
    const response = await instance.get(
      `${API_BASE_URL}/course-registers/semester/${semesterId}`,
    );
    
    const data = handleApiResponse(response);
    console.log('Courses data received:', {
      count: data.length,
      courses: data.map(c => ({ id: c.id, code: c.coursecode, name: c.coursename }))
    });
    return data;
  } catch (error) {
    console.error(`Error fetching courses for semester ${semesterId}:`, error);
    console.log('Error details:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response'
    });
    
    // Check if it's an auth error
    if (error.response && error.response.status === 401) {
      console.warn('Authentication error. Redirecting to login page...');
      return [];
    }
    throw new Error('فشل في الحصول على المقررات');
  }
};

/**
 * Get student grades for a specific course and semester
 * الحصول على درجات الطلاب لمقرر وفصل دراسي محدد
 */
export const getStudentGrades = async (courseId, semesterId) => {
  console.log('Fetching student grades for course:', courseId, 'and semester:', semesterId);
  try {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      console.warn('User is not authenticated. Redirecting to login page...');
      return [];
    }
    
    if (!courseId || !semesterId) {
      console.error('Invalid courseId or semesterId:', { courseId, semesterId });
      return [];
    }
    
    // Handle the case where courseId might be an object
    let actualCourseId = courseId;
    if (typeof courseId === 'object' && courseId !== null) {
      actualCourseId = courseId.courseid || courseId.id;
      console.log('courseId is an object, using:', actualCourseId);
    }
    
    // Convert IDs to strings to ensure consistent format
    const courseIdStr = String(actualCourseId);
    const semesterIdStr = String(semesterId);
    
    console.log('Making API request to get student grades with:', {
      courseIdStr,
      semesterIdStr,
      url: `${API_BASE_URL}/students/course/${courseIdStr}/semester/${semesterIdStr}/grades`
    });
    
    const response = await instance.get(
      `${API_BASE_URL}/students/course/${courseIdStr}/semester/${semesterIdStr}/grades`,
    );
    
    const data = handleApiResponse(response);
    console.log('Raw student grades data:', data);
    
    // If data is empty, try an alternative endpoint
    if (Array.isArray(data) && data.length === 0) {
      console.log('No grades found, trying alternative endpoint');
      
      try {
        // Try to get the students enrolled in this course
        const enrollmentResponse = await instance.get(
          `${API_BASE_URL}/course-registers/course/${courseIdStr}/students/${semesterIdStr}`,
        );
        
        const enrollmentData = handleApiResponse(enrollmentResponse);
        console.log('Student enrollment data:', enrollmentData);
        
        if (Array.isArray(enrollmentData) && enrollmentData.length > 0) {
          // Create placeholder grades for enrolled students
          return enrollmentData.map(enrollment => {
            const student = enrollment.User || {};
            return {
              id: student.id || enrollment.studentid,
              name: [
                student.firstname || '',
                student.secondname || '',
                student.thirdname || '',
                student.lastname || ''
              ].filter(Boolean).join(' '),
              studentId: student.id || enrollment.studentid,
              courseId: courseIdStr,
              semesterId: semesterIdStr,
              points: 0, // Default to 0 points
              maxPoints: 100,
              percentage: 0,
              status: 'راسب',
              gradeId: null // No grade record yet
            };
          });
        }
      } catch (enrollmentError) {
        console.error('Error fetching student enrollments:', enrollmentError);
      }
    }
    
    // Process and normalize the data
    const processedData = Array.isArray(data) ? data.map(grade => {
      // Get student info
      const student = grade.User || {};
      
      // Calculate percentage
      const percentage = grade.maxpoints > 0 
        ? (grade.points / grade.maxpoints) * 100 
        : 0;
      
      // Return processed grade with student info
      return {
        id: student.id || grade.studentid,
        name: [
          student.firstname || '',
          student.secondname || '',
          student.thirdname || '',
          student.lastname || ''
        ].filter(Boolean).join(' '),
        studentId: student.id || grade.studentid,
        courseId: courseIdStr,
        semesterId: semesterIdStr,
        points: grade.points || 0,
        maxPoints: grade.maxpoints || 100,
        percentage: percentage,
        status: percentage >= 50 ? 'ناجح' : 'راسب',
        gradeId: grade.id // Original grade record ID
      };
    }) : [];
    
    console.log('Processed student grades data:', {
      count: processedData.length,
      students: processedData.map(s => ({ 
        id: s.id, 
        name: s.name, 
        points: s.points, 
        percentage: s.percentage 
      }))
    });
    
    return processedData;
  } catch (error) {
    console.error(`Error fetching grades for course ${courseId} in semester ${semesterId}:`, error);
    console.log('Error details:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response'
    });
    throw new Error('فشل في الحصول على درجات الطلاب');
  }
};

/**
 * Update student grade
 * تحديث درجة طالب
 */
export const updateStudentGrade = async (gradeData) => {
  console.log('Updating student grade with data:', gradeData);
  try {
    // التأكد من أن البيانات صحيحة
    if (!gradeData.studentid || !gradeData.courseid) {
      console.error('Missing required fields in grade data:', gradeData);
      throw new Error('البيانات المطلوبة غير موجودة (studentid, courseid)');
    }
    
    // تكوين بيانات الطلب - تأكد من تحويل الأنواع بشكل صحيح
    const payload = {
      studentid: String(gradeData.studentid),
      courseid: String(gradeData.courseid),
      semesterid: Number(gradeData.semesterid),
      points: Number(gradeData.points || 0),
      maxpoints: Number(gradeData.maxpoints || 100)
    };
    
    console.log('Preparing grade update with payload:', payload);
    
    // خيارات الطلب
    const requestConfig = {
      ...getRequestConfig(),
      timeout: 10000
    };
    
    // 1. أولاً، نتحقق ما إذا كانت الدرجة موجودة بالفعل
    let existingGradeId = null;
    
    try {
      console.log(`Checking if grade exists for student ${payload.studentid} in course ${payload.courseid}`);
      let checkResponse = await instance.get(
        `${API_BASE_URL}/students/${payload.studentid}/course/${payload.courseid}/grade`,
      ).catch(error => {
        console.log("updateStudentGrade axios error: ", error);
        return error;
      });

      console.log("checkResponse by getStudentCourseGrade: ", checkResponse);

      checkResponse = checkResponse.data?.data || checkResponse.data;
      
      if (checkResponse && checkResponse.id) {
        existingGradeId = checkResponse.id;
        console.log('Found existing grade with ID:', existingGradeId);
      }
    } catch (checkError) {
      // إذا لم يتم العثور على درجة، استمر إلى إنشاء درجة جديدة
      console.log('No existing grade found, will create new grade');
    }
    
    let response;
    
    // 2. إذا وجدنا درجة موجودة، استخدم طريقة PUT لتحديثها بمعرفها
    if (existingGradeId) {
      console.log(`Updating existing grade with ID ${existingGradeId}`, payload, requestConfig);
      response = await instance.put(
        `${API_BASE_URL}/students/grades/${existingGradeId}`,
        payload
      );
    } else {
      // 3. إذا لم نجد درجة موجودة، أنشئ درجة جديدة
      console.log('Creating new grade record');
      response = await instance.post(
        `${API_BASE_URL}/students/grades`,
        payload
      );
    }
    
    // تأكد من نجاح الطلب
    if (response.status !== 200 && response.status !== 201) {
      console.error('API responded with error status:', response.status, response.data);
      throw new Error(response.data?.message || 'حدث خطأ أثناء تحديث الدرجة');
    }
    
    const result = handleApiResponse(response);
    console.log('Grade update successful with result:', result);
    return result;
  } catch (error) {
    console.error('Error updating student grade:', error);
    
    // طباعة تفاصيل الخطأ للمساعدة في التصحيح
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    };
    console.log('Error details:', errorDetails);
    
    throw new Error('فشل في تحديث درجة الطالب');
  }
};

/**
 * Get a specific student's grade for a course
 * الحصول على درجة طالب محدد في مقرر
 */
export const getStudentCourseGrade = async (studentId, courseId, semesterId) => {
  console.log('Fetching specific student grade:', { studentId, courseId, semesterId });
  try {
    let url = `${API_BASE_URL}/students/${studentId}/course/${courseId}/grade`;
    
    // Add semester parameter if provided
    if (semesterId) {
      url = `${API_BASE_URL}/students/${studentId}/course/${courseId}/semester/${semesterId}/grade`;
    }
    
    console.log('Making API request to:', url);
    const response = await instance.get(
      url
    );
    
    const data = handleApiResponse(response);
    console.log('Student grade data:', data);
    return data;
  } catch (error) {
    // If 404, the grade doesn't exist yet
    if (error.response && error.response.status === 404) {
      console.log('Grade not found (404)');
      return null;
    }
    
    console.error('Error fetching student course grade:', error);
    console.log('Error details:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response'
    });
    throw new Error('فشل في الحصول على درجة الطالب');
  }
};

/**
 * Get current semester
 * الحصول على الفصل الدراسي الحالي
 */
export const getCurrentSemester = async () => {
  console.log('Fetching current semester');
  try {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      console.warn('User is not authenticated. Redirecting to login page...');
      return null;
    }
    
    console.log('Making API request to get current semester');
    const response = await instance.get(
      `${API_BASE_URL}/semesters/current`
    );
    
    const data = handleApiResponse(response);
    console.log('Current semester data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching current semester:', error);
    console.log('Error details:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response'
    });
    
    // Check if it's an auth error
    if (error.response && error.response.status === 401) {
      console.warn('Authentication error. Redirecting to login page...');
      return null;
    }
    // If there's no explicit current semester API, try to get it from the semesters list
    try {
      console.log('Trying to find current semester from semesters list');
      const semesters = await getSemesters();
      const currentSemester = semesters.find(sem => sem.isActive);
      if (currentSemester) {
        console.log('Found current semester from list:', currentSemester);
        return currentSemester;
      }
    } catch (innerError) {
      console.error('Error finding current semester from semesters list:', innerError);
    }
    
    return null;
  }
};

/**
 * Bulk update student grades
 * تحديث درجات الطلاب بشكل جماعي
 */
export const bulkUpdateStudentGrades = async (gradesData) => {
  console.log('Bulk updating student grades:', gradesData);
  try {
    console.log('Making API request to bulk update grades');
    const response = await instance.post(
      `${API_BASE_URL}/students/grades/bulk`,
      { grades: gradesData }
    );
    
    const result = handleApiResponse(response);
    console.log('Bulk update result:', result);
    return result;
  } catch (error) {
    console.error('Error bulk updating student grades:', error);
    console.log('Error details:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response'
    });
    throw new Error('فشل في تحديث درجات الطلاب بشكل جماعي');
  }
}; 