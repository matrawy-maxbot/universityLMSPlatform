/**
 * خدمة للتعامل مع API المهام
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
    title: 'تصميم واجهة مستخدم',
    course: 'Software Engineering',
    courseId: '101',
    instructor: 'DR. Ahmed Emad',
    status: 'active',
    startTime: '2024-07-25T10:00:00.000Z',
    endTime: '2024-08-10T23:59:59.000Z',
    createdAt: '2024-07-20T14:30:00.000Z',
    description: 'Design a software architecture for a student management system.',
    totalPoints: 100,
    attachedFiles: [
      { id: 'f1', name: 'assignment_spec.pdf', url: '/files/spec.pdf', size: '250 KB' },
      { id: 'f2', name: 'template.docx', url: '/files/template.docx', size: '50 KB' }
    ],
    submissions: [
      { studentId: 101, studentName: 'Alice Smith', avatarUrl: 'https://i.pravatar.cc/150?img=1', displayId: '12345678', status: 'submitted', submittedAt: '2024-08-05T11:00:00.000Z', pointsAwarded: null, feedback: null,
        submittedFiles: [
          { id: 's_f1', name: 'alice_submission_report.pdf', url: '/files/alice_report.pdf', size: '1.2MB' }
        ]
      },
      { studentId: 102, studentName: 'Bob Johnson', avatarUrl: 'https://i.pravatar.cc/150?img=2', displayId: '87654321', status: 'completed', submittedAt: '2024-08-06T15:30:00.000Z', pointsAwarded: 85, feedback: 'Good effort.',
        submittedFiles: [
          { id: 's_f3', name: 'bob_final_essay.docx', url: '/files/bob_essay.docx', size: '850KB' }
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'تطوير قاعدة بيانات',
    course: 'Database Systems',
    courseId: '102',
    instructor: 'DR. Fatima Ali',
    status: 'missing',
    startTime: '2024-08-15T10:00:00.000Z',
    endTime: '2024-08-30T23:59:59.000Z',
    createdAt: '2024-08-10T09:15:00.000Z',
    description: 'Normalize the provided database schema to 3NF.',
    totalPoints: 50,
    attachedFiles: [],
    submissions: []
  }
];

/**
 * تنسيق بيانات المهمة القادمة من الخادم لتتوافق مع واجهة المستخدم
 */
const formatAssignmentData = (assignment, assignmentSubmissions = []) => {
  console.log('Raw assignment data from API:', assignment);
  
  // استخلاص اسم المقرر
  let courseName = 'Unknown Course';
  let courseCode = '';
  
  // إذا كان لدينا تفاصيل المقرر كاملة
  if (assignment.course && typeof assignment.course === 'object') {
    console.log('Course object from API:', assignment.course);
    // محاولة استخراج الاسم من جميع الحقول المحتملة
    courseName = assignment.course.coursename || 
                assignment.course.course_name || 
                assignment.course.name || 
                assignment.course.title || 
                'Unknown Course';
                
    courseCode = assignment.course.coursecode || 
                assignment.course.course_code || 
                assignment.course.code || 
                '';
  } else if (typeof assignment.course === 'string') {
    // إذا كان لدينا اسم المقرر فقط كنص
    courseName = assignment.course;
  } else if (assignment.course_name) {
    // إذا كان اسم المقرر في جذر كائن المهمة
    courseName = assignment.course_name;
    courseCode = assignment.course_code || '';
  }

  // تحويل حالة المهمة
  let status = 'active';
  const now = new Date();
  const endDate = new Date(assignment.end_time);
  
  if (now > endDate) {
    status = 'completed';
  }
  
  // تحضير بيانات المؤلف
  let instructorName = 'Unknown';
  
  console.log('Author data from API:', assignment.author);
  
  if (assignment.author) {
    if (typeof assignment.author === 'object') {
      // محاولة استخراج الاسم من جميع الحقول المحتملة
      const firstName = assignment.author.firstname || 
                       assignment.author.first_name || 
                       assignment.author.fname || 
                       '';
                       
      const lastName = assignment.author.lastname || 
                      assignment.author.last_name || 
                      assignment.author.lname || 
                      '';
                      
      if (firstName || lastName) {
        instructorName = `DR. ${firstName} ${lastName}`.trim();
      } else if (assignment.author.fullname) {
        instructorName = assignment.author.fullname;
      } else if (assignment.author.name) {
        instructorName = assignment.author.name;
      }
    } else if (typeof assignment.author === 'string') {
      instructorName = assignment.author;
    }
  } else if (assignment.author_name) {
    // إذا كان اسم المؤلف في جذر كائن المهمة
    instructorName = assignment.author_name;
  }

  // تحسين البيانات للعرض في واجهة المستخدم
  const formattedData = {
    id: assignment.id || assignment._id,
    title: assignment.title,
    course: courseName,
    courseId: assignment.course_id,
    courseCode: courseCode,
    instructor: instructorName,
    status: status,
    startTime: assignment.start_time,
    endTime: assignment.end_time,
    createdAt: assignment.created_at,
    description: assignment.description || '',
    totalPoints: assignment.total_points,
    attachedFiles: Array.isArray(assignment.attached_files) 
      ? assignment.attached_files.map(file => ({
          id: file.id || file._id,
          name: file.name,
          url: file.url,
          size: file.size || '0 KB'
        }))
      : [],
    submissions: Array.isArray(assignmentSubmissions) 
      ? assignmentSubmissions.map(sub => ({
          id: sub.id || sub._id,
          studentId: sub.student_id,
          studentName: sub.student?.firstname ? `${sub.student.firstname} ${sub.student.lastname}` : 'Unknown Student',
          avatarUrl: sub.student?.profileimage || 'https://i.pravatar.cc/150',
          displayId: sub.student?.student_id || '00000000',
          status: sub.points_awarded !== null ? 'completed' : 'submitted',
          submittedAt: sub.submitted_at,
          pointsAwarded: sub.points_awarded,
          feedback: sub.feedback,
          submittedFiles: Array.isArray(sub.attached_files) 
            ? sub.attached_files.map(file => ({
                id: file.id || file._id,
                name: file.name,
                url: file.url,
                size: file.size || '0 KB'
              }))
            : []
        }))
      : []
  };
  
  console.log('Formatted assignment data:', formattedData);
  return formattedData;
};

/**
 * جلب جميع المهام لمقرر دراسي محدد
 * @param {string} courseId معرف المقرر الدراسي
 * @returns {Promise<Array>} قائمة المهام
 */
export const getAssignmentsByCourse = async (courseId) => {
  try {
    // طلب المهام
    const assignmentsResponse = await api.get(`/assignments/course/${courseId}`);
    console.log('Assignments by course response:', assignmentsResponse);
    const assignments = assignmentsResponse.data.data || [];
    
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
    
    // جلب التسليمات وتفاصيل المؤلفين لكل مهمة
    const assignmentsWithDetails = await Promise.all(
      assignments.map(async (assignment) => {
        // جلب تفاصيل المؤلف
        let authorDetails = null;
        try {
          if (assignment.author_id) {
            const authorResponse = await api.get(`/users/${assignment.author_id}`);
            authorDetails = authorResponse.data.data;
            console.log('Author details:', authorDetails);
            
            // التحقق من أن لدينا حقول الاسم المتوقعة
            if (authorDetails && !authorDetails.firstname && !authorDetails.lastname) {
              console.warn('Author details missing expected fields:', authorDetails);
              
              // البحث عن بيانات الاسم في أي مكان آخر
              if (authorDetails.name) {
                const nameParts = authorDetails.name.split(' ');
                if (nameParts.length > 1) {
                  authorDetails.firstname = nameParts[0];
                  authorDetails.lastname = nameParts.slice(1).join(' ');
                } else {
                  authorDetails.firstname = authorDetails.name;
                }
              } else if (authorDetails.fullname) {
                const nameParts = authorDetails.fullname.split(' ');
                if (nameParts.length > 1) {
                  authorDetails.firstname = nameParts[0];
                  authorDetails.lastname = nameParts.slice(1).join(' ');
                } else {
                  authorDetails.firstname = authorDetails.fullname;
                }
              }
            }
          }
        } catch (authorError) {
          console.warn(`Failed to fetch author details for author ID ${assignment.author_id}:`, authorError);
        }
        
        // دمج البيانات الإضافية مع بيانات المهمة
        const enhancedAssignment = {
          ...assignment,
          course: courseDetails || { coursename: 'Unknown Course' },
          author: {
            ...(assignment.author || {}),
            ...(authorDetails || { firstname: 'Unknown', lastname: '' })
          }
        };
        
        console.log('Enhanced assignment:', enhancedAssignment);
        
        // استخراج المعرف المناسب (id أو _id)
        const assignmentId = assignment.id || assignment._id;
        if (!assignmentId) {
          console.error('Assignment has no ID:', assignment);
          return formatAssignmentData(enhancedAssignment, []);
        }
        
        // جلب التسليمات
        try {
          // المسار الصحيح وفقًا للباك إند
          console.log(`Trying path: /assignment-submissions/assignment/${assignmentId}`);
          const submissionsResponse = await api.get(`/assignment-submissions/assignment/${assignmentId}`);
          const submissions = submissionsResponse.data.data || [];
          
          return formatAssignmentData(enhancedAssignment, submissions);
        } catch (error) {
          // إذا فشل، حاول مسارًا بديلاً (لمرونة أكبر)
          try {
            console.warn(`Failed with /assignment-submissions/assignment/${assignmentId}, trying legacy path...`);
            const submissionsResponse = await api.get(`/submissions/assignment/${assignmentId}`);
            const submissions = submissionsResponse.data.data || [];
            
            return formatAssignmentData(enhancedAssignment, submissions);
          } catch (secondError) {
            // إذا فشلت جميع المحاولات، استخدم قائمة تسليمات فارغة
            console.error(`All attempts to fetch submissions for assignment ${assignmentId} failed.`);
            return formatAssignmentData(enhancedAssignment, []);
          }
        }
      })
    );
    
    return assignmentsWithDetails;
  } catch (error) {
    console.error('Failed to fetch assignments:', error);
    console.warn('Using mock data due to API error.');
    // استخدام البيانات الافتراضية المفلترة حسب المقرر الدراسي
    return MOCK_ASSIGNMENTS.filter(assignment => 
      assignment.courseId === courseId || assignment.course.toLowerCase().includes(courseId.toLowerCase())
    );
  }
};

/**
 * الحصول على مهمة محددة بواسطة المعرف
 * @param {string} id معرف المهمة
 * @returns {Promise<Object>} بيانات المهمة
 */
export const getAssignmentById = async (id) => {
  try {
    // طلب المهمة
    const assignmentResponse = await api.get(`/assignments/${id}`);
    
    console.log('Assignment by id response:', assignmentResponse);
    
    const assignment = assignmentResponse.data.data;
    
    if (!assignment) {
      throw new Error(`Assignment with ID ${id} not found`);
    }

    // جلب تفاصيل المقرر
    let courseDetails = null;
    try {
      if (assignment.course_id) {
        const courseResponse = await api.get(`/courses/${assignment.course_id}`);
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
            courseDetails.coursename = `Course ${assignment.course_id}`;
          }
        }
      } else {
        console.warn('No course_id found in assignment data');
      }
    } catch (courseError) {
      console.warn(`Failed to fetch course details for course ID ${assignment.course_id}:`, courseError);
    }

    // جلب تفاصيل المؤلف
    let authorDetails = null;
    try {
      if (assignment.author_id) {
        const authorResponse = await api.get(`/users/${assignment.author_id}`);
        authorDetails = authorResponse.data.data;
        console.log('Author details:', authorDetails);
        
        // التحقق من أن لدينا حقول الاسم المتوقعة
        if (authorDetails && !authorDetails.firstname && !authorDetails.lastname) {
          console.warn('Author details missing expected fields:', authorDetails);
          
          // البحث عن بيانات الاسم في أي مكان آخر
          if (authorDetails.name) {
            const nameParts = authorDetails.name.split(' ');
            if (nameParts.length > 1) {
              authorDetails.firstname = nameParts[0];
              authorDetails.lastname = nameParts.slice(1).join(' ');
            } else {
              authorDetails.firstname = authorDetails.name;
            }
          } else if (authorDetails.fullname) {
            const nameParts = authorDetails.fullname.split(' ');
            if (nameParts.length > 1) {
              authorDetails.firstname = nameParts[0];
              authorDetails.lastname = nameParts.slice(1).join(' ');
            } else {
              authorDetails.firstname = authorDetails.fullname;
            }
          }
        }
      } else {
        console.warn('No author_id found in assignment data');
      }
    } catch (authorError) {
      console.warn(`Failed to fetch author details for author ID ${assignment.author_id}:`, authorError);
    }

    // دمج البيانات الإضافية مع بيانات المهمة
    const enhancedAssignment = {
      ...assignment,
      course: courseDetails || { coursename: 'Unknown Course' },
      author: authorDetails || { firstname: 'Unknown', lastname: '' }
    };
    
    console.log('Enhanced assignment with course and author:', enhancedAssignment);
    
    // استخراج المعرف المناسب (id أو _id)
    const assignmentId = assignment.id || assignment._id || id;
    
    // جلب التسليمات للمهمة
    let submissions = [];
    try {
      // المسار الصحيح وفقًا للباك إند
      console.log(`Trying path: /assignment-submissions/assignment/${assignmentId}`);
      const submissionsResponse = await api.get(`/assignment-submissions/assignment/${assignmentId}`);
      submissions = submissionsResponse.data.data || [];
    } catch (submissionError) {
      // إذا فشل، حاول مسارًا بديلاً
      try {
        console.warn(`Failed with /assignment-submissions/assignment/${assignmentId}, trying legacy path...`);
        const submissionsResponse = await api.get(`/submissions/assignment/${assignmentId}`);
        submissions = submissionsResponse.data.data || [];
      } catch (secondError) {
        console.warn(`Failed to fetch submissions for assignment ${assignmentId}:`, secondError);
        // تستخدم مصفوفة فارغة في حالة فشل جميع المحاولات
      }
    }
    
    return formatAssignmentData(enhancedAssignment, submissions);
  } catch (error) {
    console.error(`Failed to fetch assignment with ID ${id}:`, error);
    // محاولة إيجاد المهمة في البيانات الافتراضية
    const mockAssignment = MOCK_ASSIGNMENTS.find(assignment => assignment.id.toString() === id.toString());
    if (mockAssignment) return mockAssignment;
    throw error;
  }
};

/**
 * إنشاء مهمة جديدة
 * @param {Object} assignmentData بيانات المهمة
 * @returns {Promise<Object>} المهمة الجديدة
 */
export const createAssignment = async (assignmentData) => {
  try {
    // تحويل البيانات لتتوافق مع متطلبات الباك إند
    const apiData = {
      title: assignmentData.title,
      description: assignmentData.description,
      course_id: assignmentData.courseId,
      start_time: assignmentData.startTime,
      end_time: assignmentData.endTime,
      total_points: assignmentData.totalPoints,
      attached_files: assignmentData.attachedFiles?.map(file => ({
        id: file.id,
        name: file.name,
        url: file.url,
        size: file.size
      }))
    };
    
    console.log('Sending request to create assignment:', apiData);
    
    const response = await api.post('/assignments', apiData);
    console.log('Assignment created successfully:', response.data);
    
    // بعد الإنشاء، نقوم بجلب البيانات الكاملة للمهمة بما في ذلك المقرر والمؤلف
    // يمكننا الحصول على المعرف من استجابة API بعد الإنشاء
    try {
      const newAssignmentId = response.data.data.id || response.data.data._id;
      if (newAssignmentId) {
        console.log(`Fetching complete data for newly created assignment with ID ${newAssignmentId}`);
        const completeAssignment = await getAssignmentById(newAssignmentId);
        return completeAssignment;
      } else {
        console.warn('Created assignment response missing ID, using API response data');
        return formatAssignmentData(response.data.data);
      }
    } catch (fetchError) {
      console.warn(`Failed to fetch complete assignment data after creation:`, fetchError);
      // إذا فشل جلب البيانات الكاملة، نعود إلى استخدام استجابة API للإنشاء
      return formatAssignmentData(response.data.data);
    }
  } catch (error) {
    console.error('Failed to create assignment:', error);
    let errorMessage = 'فشل في إنشاء المهمة';
    let errorResponse = { status: 'NETWORK_ERROR', data: { message: 'Network error or CORS issue' } };
    
    if (error.response) {
      // الخطأ من الخادم مع استجابة
      errorResponse = {
        status: error.response.status,
        data: error.response.data
      };
      
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    }
    
    const err = new Error(errorMessage);
    err.response = errorResponse;
    throw err;
  }
};

/**
 * تحديث بيانات مهمة
 * @param {string} id معرّف المهمة
 * @param {Object} assignmentData بيانات التحديث
 * @returns {Promise<Object>} بيانات المهمة المحدثة
 */
export const updateAssignment = async (id, assignmentData) => {
  try {
    // تحويل البيانات لتتوافق مع متطلبات الباك إند
    const apiData = {
      title: assignmentData.title,
      description: assignmentData.description,
      start_time: assignmentData.startTime,
      end_time: assignmentData.endTime,
      total_points: assignmentData.totalPoints,
      attached_files: assignmentData.attachedFiles?.map(file => ({
        id: file.id,
        name: file.name,
        url: file.url,
        size: file.size
      }))
    };
    
    // لا نقوم بتحديث معرف المقرر الدراسي لأنه لا يمكن نقل المهمة لمقرر آخر
    
    const response = await api.put(`/assignments/${id}`, apiData);
    console.log('Assignment updated successfully:', response.data);
    
    // بعد التحديث، نقوم بجلب البيانات الكاملة للمهمة بما في ذلك المقرر والمؤلف
    // هذا يضمن أننا دائمًا نعرض البيانات المحدثة والكاملة
    try {
      const updatedAssignment = await getAssignmentById(id);
      return updatedAssignment;
    } catch (fetchError) {
      console.warn(`Failed to fetch complete assignment data after update, using API response:`, fetchError);
      // إذا فشل جلب البيانات الكاملة، نعود إلى استخدام استجابة API للتحديث
      return formatAssignmentData(response.data.data);
    }
  } catch (error) {
    console.error(`Failed to update assignment with ID ${id}:`, error);
    let errorMessage = 'فشل في تحديث المهمة';
    let errorResponse = { status: 'NETWORK_ERROR', data: { message: 'Network error or CORS issue' } };
    
    if (error.response) {
      // الخطأ من الخادم مع استجابة
      errorResponse = {
        status: error.response.status,
        data: error.response.data
      };
      
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    }
    
    const err = new Error(errorMessage);
    err.response = errorResponse;
    throw err;
  }
};

/**
 * حذف مهمة
 * @param {string} id معرّف المهمة
 * @returns {Promise<boolean>} نتيجة العملية
 */
export const deleteAssignment = async (id) => {
  try {
    await api.delete(`/assignments/${id}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete assignment with ID ${id}:`, error);
    let errorMessage = 'فشل في حذف المهمة';
    let errorResponse = { status: 'NETWORK_ERROR', data: { message: 'Network error or CORS issue' } };
    
    if (error.response) {
      // الخطأ من الخادم مع استجابة
      errorResponse = {
        status: error.response.status,
        data: error.response.data
      };
      
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    }
    
    const err = new Error(errorMessage);
    err.response = errorResponse;
    throw err;
  }
};

/**
 * رفع ملف مرفق للمهمة
 * @param {string} id معرّف المهمة
 * @param {File} file الملف المراد رفعه
 * @returns {Promise<Object>} بيانات الملف المرفق
 */
export const uploadAssignmentFile = async (id, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // عند استخدام FormData، نحتاج إلى تخصيص رؤوس الطلب
    const response = await axios.post(`${API_BASE_URL}/assignments/${id}/files`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data;
  } catch (error) {
    console.error(`Failed to upload file for assignment with ID ${id}:`, error);
    let errorMessage = 'فشل في رفع الملف';
    let errorResponse = { status: 'NETWORK_ERROR', data: { message: 'Network error or CORS issue' } };
    
    if (error.response) {
      errorResponse = {
        status: error.response.status,
        data: error.response.data
      };
      
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    }
    
    const err = new Error(errorMessage);
    err.response = errorResponse;
    throw err;
  }
};

/**
 * حذف ملف مرفق من مهمة
 * @param {string} assignmentId معرّف المهمة
 * @param {string} fileId معرّف الملف
 * @returns {Promise<boolean>} نتيجة العملية
 */
export const deleteAssignmentFile = async (assignmentId, fileId) => {
  try {
    await api.delete(`/assignments/${assignmentId}/files/${fileId}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete file ${fileId} from assignment ${assignmentId}:`, error);
    let errorMessage = 'فشل في حذف الملف';
    let errorResponse = { status: 'NETWORK_ERROR', data: { message: 'Network error or CORS issue' } };
    
    if (error.response) {
      errorResponse = {
        status: error.response.status,
        data: error.response.data
      };
      
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    }
    
    const err = new Error(errorMessage);
    err.response = errorResponse;
    throw err;
  }
};

/**
 * إضافة تقييم وملاحظات لتسليم مهمة
 * @param {string} submissionId معرّف التسليم
 * @param {number} points النقاط
 * @param {string} feedback الملاحظات
 * @returns {Promise<Object>} بيانات التسليم المحدثة
 */
export const gradeSubmission = async (submissionId, points, feedback) => {
  try {
    const apiData = {
      points_awarded: points,
      feedback: feedback
    };
    
    // حاول مع المسار الأول المتوقع
    try {
      const response = await api.post(`/submissions/${submissionId}/feedback`, apiData);
      return response.data.data;
    } catch (firstError) {
      // إذا فشل المسار الأول، جرب مسارًا بديلاً
      console.warn(`Failed with /submissions/${submissionId}/feedback, trying alternative path...`);
      
      try {
        const response = await api.post(`/submission/${submissionId}/feedback`, apiData);
        return response.data.data;
      } catch (secondError) {
        // إذا فشل المسار الثاني أيضًا، جرب مسارًا آخر
        console.warn(`Failed with /submission/${submissionId}/feedback, trying third alternative...`);
        
        try {
          // قد يكون المسار بدون /feedback
          const response = await api.post(`/submissions/${submissionId}`, apiData);
          return response.data.data;
        } catch (thirdError) {
          // إذا فشلت جميع المحاولات، ارفع الخطأ
          throw thirdError;
        }
      }
    }
  } catch (error) {
    console.error(`Failed to grade submission ${submissionId}:`, error);
    let errorMessage = 'فشل في إضافة التقييم';
    let errorResponse = { status: 'NETWORK_ERROR', data: { message: 'Network error or CORS issue' } };
    
    if (error.response) {
      errorResponse = {
        status: error.response.status,
        data: error.response.data
      };
      
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    }
    
    const err = new Error(errorMessage);
    err.response = errorResponse;
    throw err;
  }
}; 