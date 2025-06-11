/**
 * خدمة للتعامل مع API الاختبارات للطلاب
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
    title: 'Quiz 2',
    course: 'Software Engineering',
    courseId: '101',
    instructor: 'DR. Ahmed Emad',
    status: 'active',
    startTime: '2023-08-01T10:00:00.000Z',
    endTime: '2023-08-01T14:00:00.000Z',
    createdAt: '2023-07-28T10:00:00.000Z',
    formLink: 'https://forms.google.com/quiz1',
    description: 'This quiz covers chapters 5-7 from the textbook. Focus on software architecture and design patterns.'
  },
  {
    id: 2,
    title: 'Quiz 3',
    course: 'Software Engineering',
    courseId: '101',
    instructor: 'DR. Ahmed Emad',
    status: 'postponed',
    startTime: '2023-08-15T10:00:00.000Z',
    endTime: '2023-08-15T12:00:00.000Z',
    createdAt: '2023-07-25T10:00:00.000Z',
    formLink: 'https://forms.google.com/quiz2',
    description: 'This quiz will test your knowledge on agile methodologies and sprint planning techniques.'
  },
  {
    id: 3,
    title: 'Quiz 1',
    course: 'Software Engineering',
    courseId: '101',
    instructor: 'DR. Ahmed Emad',
    status: 'completed',
    startTime: '2023-07-15T10:00:00.000Z',
    endTime: '2023-07-15T12:00:00.000Z',
    createdAt: '2023-07-10T10:00:00.000Z',
    formLink: 'https://forms.google.com/quiz3',
    description: 'Introduction to software engineering principles and methodologies.'
  }
];

/**
 * تنسيق بيانات الاختبار القادمة من الخادم لتتوافق مع واجهة المستخدم
 */
const formatQuizData = (quiz) => {
  console.log("quiz was formatted: ", quiz);

  // استخلاص معرف الاختبار (قد يكون _id أو id)
  const quizId = quiz._id || quiz.id;
  
  // استخلاص معرف المقرر (قد يكون course_id أو courseId)
  const courseId = quiz.course_id || quiz.courseId;
  
  // استخلاص اسم المقرر
  let courseName = 'Unknown Course';
  
  // إذا كان لدينا تفاصيل المقرر كاملة
  if (quiz && typeof quiz === 'object') {
    // محاولة استخراج الاسم من جميع الحقول المحتملة
    courseName = quiz.coursename || 
                quiz.course_name || 
                quiz.name || 
                quiz.title || 
                'Unknown Course';
  } else if (typeof quiz.course === 'string') {
    // إذا كان لدينا اسم المقرر فقط كنص
    courseName = quiz.course;
  } else if (quiz.course_name) {
    // إذا كان اسم المقرر في جذر كائن الاختبار
    courseName = quiz.course_name;
  }

  // تحويل حالة الاختبار
  let status = 'scheduled';
  const now = new Date();
  const startTime = quiz.start_time || quiz.startTime;
  const endTime = quiz.end_time || quiz.endTime;
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  
  if (now > endDate) {
    status = 'completed';
  } else if (now >= startDate && now <= endDate) {
    status = 'active';
  } else if (now < startDate) {
    status = 'postponed';
  }

  if (quiz.status === 'postponed' || quiz.status === 'cancelled') {
    status = quiz.status;
  }
  
  // تحضير بيانات الأستاذ
  let instructorName = 'Unknown';
  
  if (quiz.instructor) {
    if (typeof quiz.instructor === 'object') {
      // محاولة استخراج الاسم من جميع الحقول المحتملة
      const firstName = quiz.instructor.firstname || 
                      quiz.instructor.first_name || 
                      quiz.instructor.fname || 
                      '';
                      
      const lastName = quiz.instructor.lastname || 
                      quiz.instructor.last_name || 
                      quiz.instructor.lname || 
                      '';
                      
      if (firstName || lastName) {
        instructorName = `DR. ${firstName} ${lastName}`.trim();
      } else if (quiz.instructor.fullname) {
        instructorName = quiz.instructor.fullname;
      } else if (quiz.instructor.name) {
        instructorName = quiz.instructor.name;
      }
    } else if (typeof quiz.instructor === 'string') {
      instructorName = quiz.instructor;
    }
  } else if (quiz.author) {
    if (typeof quiz.author === 'object') {
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
  } else if (quiz.author_id) {
    // إذا كان لدينا فقط معرف المؤلف، نستخدم اسم افتراضي
    instructorName = `DR. ${quiz.author_id}`;
  }

  // زمن الإنشاء (createdAt)
  const createdAt = quiz.createdAt || quiz.created_at || new Date().toISOString();

  // تحسين البيانات للعرض في واجهة المستخدم
  return {
    id: quizId,
    title: quiz.title || 'Untitled Quiz',
    course: courseName,
    courseId: courseId,
    instructor: instructorName,
    status: status,
    startTime: startTime,
    endTime: endTime,
    createdAt: createdAt,
    description: quiz.description || '',
    formLink: quiz.google_form_url || quiz.formLink || ''
  };
};

/**
 * جلب جميع الاختبارات القصيرة المتاحة للطالب
 * @returns {Promise<Array>} قائمة الاختبارات القصيرة
 */
export const getStudentQuizzes = async () => {
  try {
    // 1. أولاً نقوم بجلب المقررات المسجلة للطالب
    const coursesResponse = await api.get('/course-registers/me/current-courses');
    
    if (!coursesResponse.data || !coursesResponse.data.data) {
      throw new Error('Invalid response from server when fetching student courses');
    }
    
    const studentCourses = coursesResponse.data.data || [];
    
    console.log("studentCourses: ", studentCourses);
    
    if (studentCourses.length === 0) {
      console.log('No registered courses found for the student');
      return [];
    }
    
    // 2. نجلب اختبارات كل مقرر مسجل للطالب باستخدام المسار المباشر
    const quizzesPromises = studentCourses.map(async (course) => {
      try {
        console.log("course: ", course);
        const response = await api.get(`/quizzes/course/${course.courseid}`);
        const quizzes = response.data.data || [];
        console.log("quizzes s ss s: ", quizzes);

        const formattedQuizzes = quizzes.map(quiz => formatQuizData({
          coursename: course.Course.coursename,
          coursecode: course.Course.coursecode,
          ...quiz
        }));
        console.log("formattedQuizzes: ", formattedQuizzes);
        return formattedQuizzes;
      } catch (error) {
        console.warn(`Failed to fetch quizzes for course ${course.courseid}:`, error);
        // إذا فشلت محاولة الحصول على اختبارات مقرر معين، نعيد مصفوفة فارغة لهذا المقرر
        return [];
      }
    });
    
    // انتظار جميع الطلبات ودمج النتائج
    const quizzesResults = await Promise.all(quizzesPromises);
    
    // دمج جميع الاختبارات في مصفوفة واحدة
    const allQuizzes = quizzesResults.flat();

    console.log("allQuizzes: ", allQuizzes);
    
    // ترتيب الاختبارات: الاختبارات النشطة أولاً، ثم المؤجلة، ثم المكتملة
    return allQuizzes.sort((a, b) => {
      const order = { active: 0, postponed: 1, completed: 2, cancelled: 3 };
      
      // ترتيب حسب الحالة أولاً
      if (order[a.status] !== order[b.status]) {
        return order[a.status] - order[b.status];
      }
      
      // ثم ترتيب حسب تاريخ البدء (الأحدث أولاً)
      return new Date(b.startTime) - new Date(a.startTime);
    });
  } catch (error) {
    console.error('Failed to fetch student quizzes:', error);
    // في حالة فشل جلب البيانات من الخادم، نرجع البيانات الافتراضية
    return MOCK_QUIZZES;
  }
};

/**
 * جلب جميع الاختبارات القصيرة للطالب في مقرر دراسي معين
 * @param {string} courseId معرف المقرر الدراسي
 * @returns {Promise<Array>} قائمة الاختبارات القصيرة
 */
export const getStudentQuizzesByCourse = async (courseId) => {
  try {
    // أولاً، نحصل على معلومات المقرر
    let courseDetails = null;
    try {
      const courseResponse = await api.get(`/courses/${courseId}`);
      courseDetails = courseResponse.data.data;
      console.log("Course details:", courseDetails);
    } catch (courseError) {
      console.warn(`Failed to fetch course details for course ID ${courseId}:`, courseError);
    }
    
    // محاولة الوصول إلى API لجلب الاختبارات
    let quizzes = [];
    try {
      const response = await api.get(`/quizzes/course/${courseId}`);
      quizzes = response.data.data || [];
      console.log("Quizzes from API:", quizzes);
    } catch (firstError) {
      // إذا فشل الاتصال بالمسار الأول، جرب مسارًا بديلًا
      console.warn(`Failed with /quizzes/course/${courseId}, trying alternative path...`);
      
      try {
        const response = await api.get(`/student/quizzes?course_id=${courseId}`);
        quizzes = response.data.data || [];
      } catch (secondError) {
        console.error(`All attempts to fetch quizzes for course ${courseId} failed.`);
        console.info(`Returning mock data for course ${courseId}`);
        
        // إرجاع بيانات افتراضية
        return MOCK_QUIZZES.filter(quiz => quiz.courseId === courseId);
      }
    }

    // دمج معلومات المقرر مع كل اختبار وتنسيقها
    const formattedQuizzes = quizzes.map(quiz => {
      // إذا كانت معلومات المقرر متاحة، نضيفها إلى الاختبار
      if (courseDetails) {
        return formatQuizData({
          coursename: courseDetails.coursename || courseDetails.name,
          coursecode: courseDetails.coursecode || courseDetails.code,
          ...quiz
        });
      } else {
        // إذا لم تكن معلومات المقرر متاحة، نستخدم الاختبار كما هو
        return formatQuizData({
          ...quiz,
          course_id: courseId
        });
      }
    });
    
    console.log("Formatted quizzes:", formattedQuizzes);
    return formattedQuizzes;
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
export const getStudentQuizById = async (id) => {
  try {
    const response = await api.get(`/quizzes/${id}`);
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response from server');
    }
    
    const quiz = response.data.data;
    
    // جلب تفاصيل المقرر إذا كان لدينا معرف المقرر
    let courseDetails = null;
    if (quiz.course_id) {
      try {
        const courseResponse = await api.get(`/courses/${quiz.course_id}`);
        courseDetails = courseResponse.data.data;
        console.log("Course details for quiz:", courseDetails);
      } catch (courseError) {
        console.warn(`Failed to fetch course details for quiz ${id}:`, courseError);
      }
    }
    
    // دمج معلومات المقرر مع الاختبار وتنسيقه
    if (courseDetails) {
      return formatQuizData({
        coursename: courseDetails.coursename || courseDetails.name,
        coursecode: courseDetails.coursecode || courseDetails.code,
        ...quiz
      });
    } else {
      return formatQuizData(quiz);
    }
  } catch (error) {
    console.error(`Failed to fetch quiz with ID ${id}:`, error);
    const mockQuiz = MOCK_QUIZZES.find(quiz => quiz.id.toString() === id.toString());
    
    if (mockQuiz) {
      return mockQuiz;
    }
    
    throw error;
  }
};

/**
 * إرسال إجابات الطالب على اختبار قصير
 * @param {string} quizId معرّف الاختبار
 * @param {Object} answers إجابات الطالب
 * @returns {Promise<Object>} نتائج الإرسال
 */
export const submitQuizAnswers = async (quizId, answers) => {
  try {
    const response = await api.post(`/student/quizzes/${quizId}/submit`, answers);
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Failed to submit answers for quiz ${quizId}:`, error);
    throw error;
  }
};

/**
 * الحصول على نتائج الطالب في اختبار قصير محدد
 * @param {string} quizId معرّف الاختبار
 * @returns {Promise<Object>} نتائج الطالب
 */
export const getQuizResults = async (quizId) => {
  try {
    const response = await api.get(`/student/quizzes/${quizId}/results`);
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch results for quiz ${quizId}:`, error);
    throw error;
  }
};

/**
 * الحصول على جميع نتائج الطالب في الاختبارات القصيرة
 * @returns {Promise<Array>} قائمة بنتائج الاختبارات
 */
export const getAllQuizResults = async () => {
  try {
    const response = await api.get('/student/quizzes/results');
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch all quiz results:', error);
    throw error;
  }
}; 