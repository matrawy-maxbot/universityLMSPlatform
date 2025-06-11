/**
 * خدمة للتعامل مع API الواجبات الدراسية للطلاب
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
const MOCK_ASSIGNMENTS = [
  {
    id: 1,
    title: 'تصميم نظام إدارة الطلاب',
    course: 'هندسة البرمجيات',
    courseId: '101',
    instructor: 'د. أحمد عماد',
    status: 'active',
    startTime: '2023-09-15T10:00:00.000Z',
    endTime: '2023-09-30T23:59:59.000Z',
    createdAt: '2023-09-10T14:30:00.000Z',
    description: 'صمم بنية برمجية لنظام إدارة الطلاب. قم بتضمين مخططات المكونات وشرح مفصل لكل وحدة.',
    files: [
      { id: 1, name: 'تعليمات_الواجب.pdf', url: '/files/assignment_instructions.pdf', size: '250 KB' },
      { id: 2, name: 'وثيقة_مرجعية.docx', url: '/files/reference_document.docx', size: '120 KB' }
    ]
  },
  {
    id: 2,
    title: 'تطبيع قاعدة البيانات',
    course: 'هندسة البرمجيات',
    courseId: '101',
    instructor: 'د. أحمد عماد',
    status: 'submitted',
    startTime: '2023-10-05T10:00:00.000Z',
    endTime: '2023-10-20T23:59:59.000Z',
    createdAt: '2023-09-28T09:15:00.000Z',
    description: 'قم بتطبيع مخطط قاعدة البيانات المقدمة إلى 3NF وقدم تبريرًا لكل خطوة من خطوات التطبيع.',
    files: [
      { id: 3, name: 'مخطط_قاعدة_البيانات.xlsx', url: '/files/data_set.xlsx', size: '540 KB' }
    ]
  },
  {
    id: 3,
    title: 'تطوير تطبيق ويب',
    course: 'هندسة البرمجيات',
    courseId: '101',
    instructor: 'د. أحمد عماد',
    status: 'completed',
    startTime: '2023-08-10T10:00:00.000Z',
    endTime: '2023-08-25T23:59:59.000Z',
    createdAt: '2023-08-05T11:45:00.000Z',
    description: 'طور تطبيق ويب متجاوب باستخدام React يتيح للمستخدمين إنشاء وإدارة قائمة المهام. قم بتضمين ميزات لإضافة وتعديل وحذف المهام.',
    files: []
  }
];

/**
 * تنسيق بيانات الواجب القادمة من الخادم لتتوافق مع واجهة المستخدم
 */
const formatAssignmentData = (assignment) => {
  console.log("assignment being formatted: ", assignment);
  
  // استخلاص معرف الواجب (قد يكون _id أو id)
  const assignmentId = assignment._id || assignment.id;
  
  // استخلاص معرف المقرر (قد يكون course_id أو courseId)
  const courseId = assignment.course_id || assignment.courseId;
  
  // استخلاص اسم المقرر
  let courseName = 'مقرر غير معروف';
  
  // إذا كان لدينا تفاصيل المقرر كاملة
  if (assignment && typeof assignment === 'object') {
    // محاولة استخراج الاسم من جميع الحقول المحتملة
    courseName = assignment.coursename || 
                assignment.course_name || 
                assignment.name || 
                assignment.course || 
                'مقرر غير معروف';
  }

  // تحويل حالة الواجب
  let status = 'scheduled';
  const now = new Date();
  const startTime = assignment.start_time || assignment.startTime;
  const endTime = assignment.end_time || assignment.endTime;
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  
  if (now > endDate) {
    // إذا تم تسليم الواجب
    if (assignment.submitted || assignment.status === 'submitted') {
      status = 'completed';
    } else {
      // إذا لم يتم تسليم الواجب وانتهى الوقت
      status = 'missing';
    }
  } else if (now >= startDate && now <= endDate) {
    // إذا تم تسليم الواجب
    if (assignment.submitted || assignment.status === 'submitted') {
      status = 'submitted';
    } else {
      // إذا لم يتم تسليم الواجب والوقت مازال متاح
      status = 'active';
    }
  } else if (now < startDate) {
    status = 'scheduled';
  }

  // إذا كانت الحالة محددة مسبقًا، استخدمها
  if (assignment.status) {
    status = assignment.status;
  }
  
  // تحضير بيانات الأستاذ
  let instructorName = 'غير معروف';
  
  if (assignment.instructor) {
    if (typeof assignment.instructor === 'object') {
      // محاولة استخراج الاسم من جميع الحقول المحتملة
      const firstName = assignment.instructor.firstname || 
                      assignment.instructor.first_name || 
                      assignment.instructor.fname || 
                      '';
                      
      const lastName = assignment.instructor.lastname || 
                      assignment.instructor.last_name || 
                      assignment.instructor.lname || 
                      '';
                      
      if (firstName || lastName) {
        instructorName = `${(assignment.instructor.type == 2 || assignment.instructor.type == 4) ? "Dr" : "Eng"}. ${firstName} ${lastName}`.trim();
      } else if (assignment.instructor.fullname) {
        instructorName = assignment.instructor.fullname;
      } else if (assignment.instructor.name) {
        instructorName = assignment.instructor.name;
      }
    } else if (typeof assignment.instructor === 'string') {
      instructorName = assignment.instructor;
    }
  } else if (assignment.author) {
    if (typeof assignment.author === 'object') {
      const firstName = assignment.author.firstname || 
                      assignment.author.first_name || 
                      assignment.author.fname || 
                      '';
                      
      const lastName = assignment.author.lastname || 
                      assignment.author.last_name || 
                      assignment.author.lname || 
                      '';
                      
      if (firstName || lastName) {
        instructorName = `${(assignment.author.type == 2 || assignment.author.type == 4) ? "Dr" : "Eng"}. ${firstName} ${lastName}`.trim();
      } else if (assignment.author.fullname) {
        instructorName = assignment.author.fullname;
      } else if (assignment.author.name) {
        instructorName = assignment.author.name;
      }
    } else if (typeof assignment.author === 'string') {
      instructorName = assignment.author;
    }
  } else if (assignment.author_id) {
    // إذا كان لدينا فقط معرف المؤلف، نستخدم اسم افتراضي
    instructorName = `${(assignment.author_id.type == 2 || assignment.author_id.type == 4) ? "Dr" : "Eng"}. ${assignment.author_id.firstname} ${assignment.author_id.lastname}`;
  }

  // زمن الإنشاء (createdAt)
  const createdAt = assignment.createdAt || assignment.created_at || new Date().toISOString();

  // حساب الأيام المتبقية
  let daysLeft = 0;
  if (now < endDate) {
    daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
  }

  // تحضير الملفات المرفقة
  const files = assignment.files || assignment.attachments || [];

  // تحسين البيانات للعرض في واجهة المستخدم
  return {
    id: assignmentId,
    title: assignment.title || 'واجب بون عنوان',
    course: courseName,
    courseId: courseId,
    instructor: instructorName,
    status: status,
    startTime: startTime,
    endTime: endTime,
    createdAt: createdAt,
    description: assignment.description || '',
    daysLeft: daysLeft,
    files: files,
    // إذا كان الوقت انتهى
    finished: now > endDate
  };
};

/**
 * جلب جميع الواجبات الدراسية المتاحة للطالب
 * @returns {Promise<Array>} قائمة الواجبات الدراسية
 */
export const getStudentAssignments = async () => {
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
    
    // 2. نجلب واجبات كل مقرر مسجل للطالب باستخدام المسار المباشر
    const assignmentsPromises = studentCourses.map(async (course) => {
      try {
        console.log("course: ", course);
        const response = await api.get(`/assignments/course/${course.courseid}`);
        const assignments = response.data.data || [];
        console.log("assignments for course: ", assignments);

        const formattedAssignments = assignments.map(assignment => formatAssignmentData({
          coursename: course.Course.coursename,
          coursecode: course.Course.coursecode,
          ...assignment
        }));
        console.log("formattedAssignments: ", formattedAssignments);
        return formattedAssignments;
      } catch (error) {
        console.warn(`Failed to fetch assignments for course ${course.courseid}:`, error);
        // إذا فشلت محاولة الحصول على واجبات مقرر معين، نعيد مصفوفة فارغة لهذا المقرر
        return [];
      }
    });
    
    // انتظار جميع الطلبات ودمج النتائج
    const assignmentsResults = await Promise.all(assignmentsPromises);
    
    // دمج جميع الواجبات في مصفوفة واحدة
    const allAssignments = assignmentsResults.flat();

    console.log("allAssignments: ", allAssignments);
    
    // ترتيب الواجبات: الواجبات النشطة أولاً، ثم المقدمة، ثم المكتملة، ثم الفائتة
    return allAssignments.sort((a, b) => {
      const order = { active: 0, submitted: 1, completed: 2, missing: 3, scheduled: 4 };
      
      // ترتيب حسب الحالة أولاً
      if (order[a.status] !== order[b.status]) {
        return order[a.status] - order[b.status];
      }
      
      // ثم ترتيب حسب تاريخ النهاية (الأقرب أولاً)
      return new Date(a.endTime) - new Date(b.endTime);
    });
  } catch (error) {
    console.error('Failed to fetch student assignments:', error);
    // في حالة فشل جلب البيانات من الخادم، نرجع البيانات الافتراضية
    return MOCK_ASSIGNMENTS;
  }
};

/**
 * جلب واجبات مقرر دراسي معين
 * @param {string} courseId معرف المقرر الدراسي
 * @returns {Promise<Array>} قائمة الواجبات الدراسية
 */
export const getStudentAssignmentsByCourse = async (courseId) => {
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
    
    // محاولة الوصول إلى API لجلب الواجبات
    let assignments = [];
    try {
      const response = await api.get(`/assignments/course/${courseId}`);
      assignments = response.data.data || [];
      console.log("Assignments from API:", assignments);
    } catch (error) {
      console.error(`Failed to fetch assignments for course ${courseId}:`, error);
      // إرجاع بيانات افتراضية
      return MOCK_ASSIGNMENTS.filter(assignment => assignment.courseId === courseId);
    }

    // دمج معلومات المقرر مع كل واجب وتنسيقها
    const formattedAssignments = assignments.map(assignment => {
      // إذا كانت معلومات المقرر متاحة، نضيفها إلى الواجب
      if (courseDetails) {
        return formatAssignmentData({
          coursename: courseDetails.coursename || courseDetails.name,
          coursecode: courseDetails.coursecode || courseDetails.code,
          ...assignment
        });
      } else {
        // إذا لم تكن معلومات المقرر متاحة، نستخدم الواجب كما هو
        return formatAssignmentData({
          ...assignment,
          course_id: courseId
        });
      }
    });
    
    console.log("Formatted assignments:", formattedAssignments);
    
    // ترتيب الواجبات: الواجبات النشطة أولاً، ثم المقدمة، ثم المكتملة، ثم الفائتة
    return formattedAssignments.sort((a, b) => {
      const order = { active: 0, submitted: 1, completed: 2, missing: 3, scheduled: 4 };
      
      // ترتيب حسب الحالة أولاً
      if (order[a.status] !== order[b.status]) {
        return order[a.status] - order[b.status];
      }
      
      // ثم ترتيب حسب تاريخ النهاية (الأقرب أولاً)
      return new Date(a.endTime) - new Date(b.endTime);
    });
  } catch (error) {
    console.error(`Failed to fetch assignments for course ${courseId}:`, error);
    return MOCK_ASSIGNMENTS.filter(assignment => assignment.courseId === courseId);
  }
};

/**
 * جلب واجب دراسي معين حسب المعرّف
 * @param {string} id معرّف الواجب
 * @returns {Promise<Object>} بيانات الواجب
 */
export const getStudentAssignmentById = async (id) => {
  try {
    const response = await api.get(`/assignments/${id}`);
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response from server');
    }
    
    const assignment = response.data.data;
    
    // جلب تفاصيل المقرر إذا كان لدينا معرف المقرر
    let courseDetails = null;
    if (assignment.course_id) {
      try {
        const courseResponse = await api.get(`/courses/${assignment.course_id}`);
        courseDetails = courseResponse.data.data;
        console.log("Course details for assignment:", courseDetails);
      } catch (courseError) {
        console.warn(`Failed to fetch course details for assignment ${id}:`, courseError);
      }
    }
    
    // دمج معلومات المقرر مع الواجب وتنسيقه
    if (courseDetails) {
      return formatAssignmentData({
        coursename: courseDetails.coursename || courseDetails.name,
        coursecode: courseDetails.coursecode || courseDetails.code,
        ...assignment
      });
    } else {
      return formatAssignmentData(assignment);
    }
  } catch (error) {
    console.error(`Failed to fetch assignment with ID ${id}:`, error);
    const mockAssignment = MOCK_ASSIGNMENTS.find(assignment => assignment.id.toString() === id.toString());
    
    if (mockAssignment) {
      return mockAssignment;
    }
    
    throw error;
  }
};

/**
 * تسليم واجب دراسي
 * @param {string} assignmentId معرّف الواجب
 * @param {Array} files ملفات الواجب المرفقة
 * @returns {Promise<Object>} نتيجة عملية التسليم
 */
export const submitAssignment = async (assignmentId, files) => {
  try {
    // إنشاء نموذج البيانات (FormData) لرفع الملفات
    const formData = new FormData();
    formData.append('assignmentId', assignmentId);
    
    // إضافة الملفات
    files.forEach((file, index) => {
      formData.append('files', file);
    });
    
    // تعديل إعدادات الـ API لدعم رفع الملفات
    const response = await axios({
      method: 'post',
      url: `${API_BASE_URL}/assignments/${assignmentId}/submit`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.data) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Failed to submit assignment ${assignmentId}:`, error);
    throw error;
  }
};

/**
 * تنزيل ملف مرفق بواجب
 * @param {string} fileId معرّف الملف
 * @returns {Promise<Blob>} محتوى الملف
 */
export const downloadAssignmentFile = async (fileId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${API_BASE_URL}/assignments/files/${fileId}`,
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Failed to download file ${fileId}:`, error);
    throw error;
  }
}; 