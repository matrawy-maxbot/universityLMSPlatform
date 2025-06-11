/**
 * خدمة للتعامل مع API الاختبارات القصيرة
 */

import { getCookie } from "cookies-next";
import axios from "axios";

// العنوان الأساسي للـ API
const API_BASE_URL = 'http://localhost:3001/api/v1';

const token = getCookie('access_token');

// تهيئة إعدادات axios الأساسية
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
});

// بيانات افتراضية للاستخدام عند فشل الاتصال بالخادم
const MOCK_QUIZZES = [
  {
    id: 1,
    title: 'Quiz 1 - Introduction to Algorithms',
    course: 'Algorithm Design',
    courseId: '101',
    instructor: 'DR. Fatima Ali',
    status: 'completed',
    startTime: '2024-07-10T10:00:00.000Z',
    endTime: '2024-07-10T11:00:00.000Z',
    createdAt: '2024-07-05T14:30:00.000Z',
    description: 'This quiz covers the basic concepts of algorithm analysis and design, including Big O notation and common sorting algorithms.',
    googleFormUrl: 'https://forms.gle/xxxxxxxxxxxxxxxxx',
    totalPoints: 20,
    attachedFiles: [
      { id: 'qf1', name: 'study_guide_quiz1.pdf', url: '/files/quiz1_guide.pdf', size: '350 KB' },
    ]
  },
  {
    id: 2,
    title: 'Quiz 2 - Data Structures Fundamentals',
    course: 'Algorithm Design',
    courseId: '101',
    instructor: 'DR. Fatima Ali',
    status: 'active',
    startTime: new Date(Date.now() - 1*60*60*1000).toISOString(),
    endTime: new Date(Date.now() + 2*60*60*1000).toISOString(),
    createdAt: '2024-07-15T09:00:00.000Z',
    description: 'Focuses on fundamental data structures like arrays, linked lists, stacks, and queues.',
    googleFormUrl: 'https://forms.gle/yyyyyyyyyyyyyyyyy',
    totalPoints: 25,
    attachedFiles: []
  }
];

/**
 * تنسيق بيانات الاختبار القادمة من الخادم لتتوافق مع واجهة المستخدم
 */
const formatQuizData = (quiz) => {
  console.log('Raw quiz data from API:', quiz);
  
  // استخلاص اسم المقرر
  let courseName = 'Unknown Course';
  let courseCode = '';
  
  // إذا كان لدينا تفاصيل المقرر كاملة
  if (quiz.course && typeof quiz.course === 'object') {
    console.log('Course object from API:', quiz.course);
    // محاولة استخراج الاسم من جميع الحقول المحتملة
    courseName = quiz.course.coursename || 
                quiz.course.course_name || 
                quiz.course.name || 
                quiz.course.title || 
                'Unknown Course';
                
    courseCode = quiz.course.coursecode || 
                quiz.course.course_code || 
                quiz.course.code || 
                '';
  } else if (typeof quiz.course === 'string') {
    // إذا كان لدينا اسم المقرر فقط كنص
    courseName = quiz.course;
  } else if (quiz.course_name) {
    // إذا كان اسم المقرر في جذر كائن الاختبار
    courseName = quiz.course_name;
    courseCode = quiz.course_code || '';
  }

  // تحويل حالة الاختبار
  let status = 'scheduled';
  const now = new Date();
  const startDate = new Date(quiz.start_time);
  const endDate = new Date(quiz.end_time);
  
  if (now > endDate) {
    status = 'completed';
  } else if (now >= startDate && now <= endDate) {
    status = 'active';
  }

  if (quiz.status === 'postponed') {
    status = 'postponed';
  }
  
  // تحضير بيانات المؤلف
  let instructorName = 'Unknown';
  
  console.log('Author data from API:', quiz.author);
  
  if (quiz.author) {
    if (typeof quiz.author === 'object') {
      // محاولة استخراج الاسم من جميع الحقول المحتملة
      const firstName = quiz.author.firstname || 
                      quiz.author.first_name || 
                      quiz.author.fname || 
                      '';
                      
      const lastName = quiz.author.lastname || 
                      quiz.author.last_name || 
                      quiz.author.lname || 
                      '';
                      
      if (firstName || lastName) {
        instructorName = `DR. ${firstName} ${lastName}`.trim();
      } else if (quiz.author.fullname) {
        instructorName = quiz.author.fullname;
      } else if (quiz.author.name) {
        instructorName = quiz.author.name;
      }
    } else if (typeof quiz.author === 'string') {
      instructorName = quiz.author;
    }
  } else if (quiz.author_name) {
    // إذا كان اسم المؤلف في جذر كائن الاختبار
    instructorName = quiz.author_name;
  }

  // تحسين البيانات للعرض في واجهة المستخدم
  const formattedData = {
    id: quiz.id || quiz._id,
    title: quiz.title,
    course: courseName,
    courseId: quiz.course_id,
    courseCode: courseCode,
    instructor: instructorName,
    status: status,
    startTime: quiz.start_time,
    endTime: quiz.end_time,
    createdAt: quiz.createdAt || quiz.created_at,
    description: quiz.description || '',
    totalPoints: quiz.total_points,
    googleFormUrl: quiz.google_form_url || '',
    attachedFiles: Array.isArray(quiz.attached_files) 
      ? quiz.attached_files.map(file => ({
          id: file.id || file._id,
          name: file.name,
          url: file.url,
          size: file.size || '0 KB'
        }))
      : []
  };
  
  console.log('Formatted quiz data:', formattedData);
  return formattedData;
};

/**
 * جلب جميع الاختبارات القصيرة لمقرر دراسي محدد
 * @param {string} courseId معرف المقرر الدراسي
 * @returns {Promise<Array>} قائمة الاختبارات القصيرة
 */
export const getQuizzesByCourse = async (courseId) => {
  try {
    // جلب تفاصيل المقرر
    let courseDetails = null;
    try {
      const courseResponse = await api.get(`/courses/${courseId}`);
      courseDetails = courseResponse.data.data;
      console.log('Course details by course id:', courseDetails);
      
      // التحقق من أن البيانات تحتوي على الحقول المتوقعة
      if (courseDetails && !courseDetails.coursename && !courseDetails.name) {
        console.warn('Course details missing expected fields:', courseDetails);
        
        // محاولة العثور على الاسم في أي حقل آخر
        if (courseDetails.title) {
          courseDetails.coursename = courseDetails.title;
        } else if (courseDetails.course_name) {
          courseDetails.coursename = courseDetails.course_name;
        }
        
        // إنشاء حقل coursename بناءً على معرف المقرر إذا لم نجد اسمًا
        if (!courseDetails.coursename) {
          courseDetails.coursename = `Course ${courseId}`;
        }
      }
    } catch (courseError) {
      console.warn(`Failed to fetch course details for course ID ${courseId}:`, courseError);
      // إنشاء بيانات مقرر افتراضية إذا لم نتمكن من جلبها
      courseDetails = { 
        id: courseId,
        coursename: `Course ${courseId}`,
        coursecode: courseId
      };
    }

    // محاولة الوصول إلى API لجلب الاختبارات
    let quizzes = [];
    try {
      const response = await api.get(`/quizzes/course/${courseId}`);
      console.log(`Successfully fetched quizzes with path /quizzes/course/${courseId}`);
      quizzes = response.data.data || [];
    } catch (firstError) {
      // إذا فشل الاتصال بالمسار الأول، جرب مسارًا بديلًا
      console.warn(`Failed with /quizzes/course/${courseId}, trying alternative path...`);
      
      try {
        const response = await api.get(`/quizzes?course_id=${courseId}`);
        console.log(`Successfully fetched quizzes with path /quizzes?course_id=${courseId}`);
        quizzes = response.data.data || [];
      } catch (secondError) {
        console.error(`All attempts to fetch quizzes for course ${courseId} failed.`);
        console.info(`Returning mock data for course ${courseId}`);
        
        // إرجاع بيانات افتراضية
        return MOCK_QUIZZES.filter(quiz => quiz.courseId === courseId);
      }
    }
    
    // معالجة كل اختبار وإضافة تفاصيل المقرر والمؤلف
    const quizzesWithDetails = await Promise.all(
      quizzes.map(async (quiz) => {
        // نسخ بيانات المقرر إلى الاختبار
        quiz.course = courseDetails;
        
        // جلب تفاصيل المؤلف إذا كان لدينا معرف المؤلف
        if (quiz.author_id) {
          try {
            const authorResponse = await api.get(`/users/${quiz.author_id}`);
            quiz.author = authorResponse.data.data;
            console.log('Author details fetched:', quiz.author);
          } catch (authorError) {
            console.warn(`Failed to fetch author details for author ID ${quiz.author_id}:`, authorError);
            // إضافة بيانات مؤلف افتراضية
            quiz.author = { 
              id: quiz.author_id,
              firstname: 'Unknown',
              lastname: 'Author' 
            };
          }
        }
        
        return quiz;
      })
    );
    
    // تطبيق التنسيق على البيانات
    return quizzesWithDetails.map(formatQuizData);
  } catch (error) {
    console.error(`Failed to fetch quizzes for course ${courseId}:`, error);
    return MOCK_QUIZZES.filter(quiz => quiz.courseId === courseId);
  }
};

/**
 * جلب اختبار قصير معين حسب المعرّف
 * @param {string} id معرّف الاختبار
 * @returns {Promise<Object>} بيانات الاختبار
 */
export const getQuizById = async (id) => {
  try {
    let quizData = null;
    
    // محاولة الوصول إلى API الرئيسي
    try {
      const response = await api.get(`/quizzes/${id}`);
      console.log(`Successfully fetched quiz with ID ${id}`);
      quizData = response.data.data;
    } catch (firstError) {
      // إذا فشل الاتصال، ارجع بيانات افتراضية
      console.error(`Failed to fetch quiz with ID ${id}:`, firstError);
      const mockQuiz = MOCK_QUIZZES.find(quiz => quiz.id.toString() === id.toString());
      if (mockQuiz) {
        return mockQuiz;
      }
      throw new Error(`Quiz with ID ${id} not found`);
    }
    
    // جلب تفاصيل المقرر
    if (quizData.course_id) {
      try {
        const courseResponse = await api.get(`/courses/${quizData.course_id}`);
        quizData.course = courseResponse.data.data;
        console.log('Course details for quiz:', quizData.course);
      } catch (courseError) {
        console.warn(`Failed to fetch course details for quiz ${id}:`, courseError);
        // إنشاء بيانات مقرر افتراضية
        quizData.course = { 
          id: quizData.course_id,
          coursename: `Course ${quizData.course_id}`,
          coursecode: quizData.course_id
        };
      }
    }
    
    // جلب تفاصيل المؤلف
    if (quizData.author_id) {
      try {
        const authorResponse = await api.get(`/users/${quizData.author_id}`);
        quizData.author = authorResponse.data.data;
        console.log('Author details for quiz:', quizData.author);
      } catch (authorError) {
        console.warn(`Failed to fetch author details for quiz ${id}:`, authorError);
        // إضافة بيانات مؤلف افتراضية
        quizData.author = { 
          id: quizData.author_id,
          firstname: 'Unknown',
          lastname: 'Author' 
        };
      }
    }
    
    return formatQuizData(quizData);
  } catch (error) {
    console.error(`Failed to fetch quiz with ID ${id}:`, error);
    throw error;
  }
};

/**
 * إنشاء اختبار قصير جديد
 * @param {Object} quizData بيانات الاختبار القصير
 * @returns {Promise<Object>} الاختبار القصير المنشأ
 */
export const createQuiz = async (quizData) => {
  try {
    // تأكد من أن البيانات تحتوي على الحقول المطلوبة
    if (!quizData.title) throw new Error('Quiz title is required');
    if (!quizData.courseId) throw new Error('Course ID is required');
    if (!quizData.startTime) throw new Error('Start time is required');
    if (!quizData.endTime) throw new Error('End time is required');
    if (!quizData.totalPoints && quizData.totalPoints !== 0) throw new Error('Total points is required');

    // تحويل البيانات إلى التنسيق المتوافق مع API
    const apiData = {
      title: quizData.title,
      course_id: quizData.courseId,
      description: quizData.description || '',
      start_time: quizData.startTime,
      end_time: quizData.endTime,
      total_points: quizData.totalPoints,
      google_form_url: quizData.googleFormUrl || null,
    };

    console.log('Creating new quiz with data:', apiData);

    // محاولة إنشاء اختبار جديد
    const response = await api.post('/quizzes', apiData);
    console.log('Create quiz response:', response);

    if (!response.data || !response.data.data) {
      throw new Error('Invalid response from server');
    }

    const createdQuiz = response.data.data;

    // إذا كانت هناك ملفات مرفقة، قم بتحميلها
    if (Array.isArray(quizData.attachedFiles) && quizData.attachedFiles.length > 0) {
      console.log(`Uploading ${quizData.attachedFiles.length} files for quiz ${createdQuiz.id}`);
      
      // تحميل كل ملف على حدة
      for (const file of quizData.attachedFiles) {
        try {
          await uploadQuizFile(createdQuiz.id, file);
          console.log(`Successfully uploaded file ${file.name} for quiz ${createdQuiz.id}`);
        } catch (fileError) {
          console.error(`Failed to upload file ${file.name}:`, fileError);
        }
      }
    }

    // جلب تفاصيل المقرر
    try {
      const courseResponse = await api.get(`/courses/${quizData.courseId}`);
      createdQuiz.course = courseResponse.data.data;
    } catch (courseError) {
      console.warn(`Failed to fetch course details for quiz:`, courseError);
      createdQuiz.course = { 
        id: quizData.courseId,
        coursename: quizData.course || `Course ${quizData.courseId}`,
        coursecode: quizData.courseId
      };
    }
    
    // جلب تفاصيل المؤلف (المستخدم الحالي)
    try {
      const userResponse = await api.get('/users/me');
      createdQuiz.author = userResponse.data.data;
    } catch (userError) {
      console.warn('Failed to fetch current user details:', userError);
    }

    // تنسيق البيانات للعرض في واجهة المستخدم
    return formatQuizData(createdQuiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    throw error;
  }
};

/**
 * تحديث اختبار قصير موجود
 * @param {string} id معرّف الاختبار
 * @param {Object} quizData بيانات التحديث
 * @returns {Promise<Object>} الاختبار المحدّث
 */
export const updateQuiz = async (id, quizData) => {
  try {
    // تحويل البيانات إلى التنسيق المتوافق مع API
    const apiData = {};
    
    if (quizData.title !== undefined) apiData.title = quizData.title;
    if (quizData.description !== undefined) apiData.description = quizData.description;
    if (quizData.startTime !== undefined) apiData.start_time = quizData.startTime;
    if (quizData.endTime !== undefined) apiData.end_time = quizData.endTime;
    if (quizData.totalPoints !== undefined) apiData.total_points = quizData.totalPoints;
    if (quizData.googleFormUrl !== undefined) apiData.google_form_url = quizData.googleFormUrl;
    if (quizData.status === 'postponed') apiData.status = 'postponed';
    
    // محاولة تحديث الاختبار
    try {
      const response = await api.put(`/quizzes/${id}`, apiData);
      console.log(`Successfully updated quiz with ID ${id}`);
      return formatQuizData(response.data.data);
    } catch (error) {
      console.error(`Failed to update quiz with ID ${id}:`, error);
      
      // تحديث في قائمة البيانات المحلية
      const quizIndex = MOCK_QUIZZES.findIndex(quiz => quiz.id.toString() === id.toString());
      if (quizIndex !== -1) {
        const updatedQuiz = {
          ...MOCK_QUIZZES[quizIndex],
          ...quizData,
          lastUpdated: new Date().toISOString()
        };
        MOCK_QUIZZES[quizIndex] = updatedQuiz;
        return updatedQuiz;
      }
      throw new Error(`Quiz with ID ${id} not found`);
    }
  } catch (error) {
    console.error(`Failed to update quiz with ID ${id}:`, error);
    throw error;
  }
};

/**
 * حذف اختبار قصير
 * @param {string} id معرّف الاختبار
 * @returns {Promise<boolean>} نتيجة عملية الحذف
 */
export const deleteQuiz = async (id) => {
  try {
    // محاولة حذف الاختبار
    try {
      await api.delete(`/quizzes/${id}`);
      console.log(`Successfully deleted quiz with ID ${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete quiz with ID ${id}:`, error);
      
      // حذف من قائمة البيانات المحلية
      const quizIndex = MOCK_QUIZZES.findIndex(quiz => quiz.id.toString() === id.toString());
      if (quizIndex !== -1) {
        MOCK_QUIZZES.splice(quizIndex, 1);
        return true;
      }
      throw new Error(`Quiz with ID ${id} not found`);
    }
  } catch (error) {
    console.error(`Failed to delete quiz with ID ${id}:`, error);
    throw error;
  }
};

/**
 * إضافة ملف مرفق إلى اختبار قصير
 * @param {string} id معرّف الاختبار
 * @param {Object} file معلومات الملف
 * @returns {Promise<Object>} الاختبار المحدّث مع الملف المضاف
 */
export const uploadQuizFile = async (id, file) => {
  try {
    // التأكد من وجود بيانات الملف المطلوبة
    if (!file.id || !file.name || !file.url) {
      throw new Error('File must have id, name, and url properties');
    }
    
    // محاولة إضافة الملف عبر API
    try {
      const response = await api.post(`/quizzes/${id}/files`, file);
      console.log(`Successfully added file to quiz with ID ${id}`);
      return formatQuizData(response.data.data);
    } catch (error) {
      console.error(`Failed to add file to quiz with ID ${id}:`, error);
      
      // إضافة الملف في قائمة البيانات المحلية
      const quizIndex = MOCK_QUIZZES.findIndex(quiz => quiz.id.toString() === id.toString());
      if (quizIndex !== -1) {
        const updatedQuiz = {
          ...MOCK_QUIZZES[quizIndex],
          attachedFiles: [...(MOCK_QUIZZES[quizIndex].attachedFiles || []), file],
          lastUpdated: new Date().toISOString()
        };
        MOCK_QUIZZES[quizIndex] = updatedQuiz;
        return updatedQuiz;
      }
      throw new Error(`Quiz with ID ${id} not found`);
    }
  } catch (error) {
    console.error(`Failed to add file to quiz with ID ${id}:`, error);
    throw error;
  }
};

/**
 * حذف ملف مرفق من اختبار قصير
 * @param {string} quizId معرّف الاختبار
 * @param {string} fileId معرّف الملف
 * @returns {Promise<Object>} الاختبار المحدّث بعد حذف الملف
 */
export const deleteQuizFile = async (quizId, fileId) => {
  try {
    // محاولة حذف الملف عبر API
    try {
      const response = await api.delete(`/quizzes/${quizId}/files/${fileId}`);
      console.log(`Successfully removed file ${fileId} from quiz ${quizId}`);
      return formatQuizData(response.data.data);
    } catch (error) {
      console.error(`Failed to remove file ${fileId} from quiz ${quizId}:`, error);
      
      // حذف الملف من قائمة البيانات المحلية
      const quizIndex = MOCK_QUIZZES.findIndex(quiz => quiz.id.toString() === quizId.toString());
      if (quizIndex !== -1) {
        const updatedQuiz = {
          ...MOCK_QUIZZES[quizIndex],
          attachedFiles: (MOCK_QUIZZES[quizIndex].attachedFiles || []).filter(file => file.id !== fileId),
          lastUpdated: new Date().toISOString()
        };
        MOCK_QUIZZES[quizIndex] = updatedQuiz;
        return updatedQuiz;
      }
      throw new Error(`Quiz with ID ${quizId} not found`);
    }
  } catch (error) {
    console.error(`Failed to remove file ${fileId} from quiz ${quizId}:`, error);
    throw error;
  }
}; 