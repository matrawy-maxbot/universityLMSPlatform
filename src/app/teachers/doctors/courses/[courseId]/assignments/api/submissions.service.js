/**
 * خدمة للتعامل مع API تسليمات المهام
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

/**
 * تنسيق بيانات التسليم القادمة من الخادم لتتوافق مع واجهة المستخدم
 */
const formatSubmissionData = (submission) => {
  return {
    id: submission.id,
    studentId: submission.student_id,
    assignmentId: submission.assignment_id,
    studentName: submission.student?.firstname ? `${submission.student.firstname} ${submission.student.lastname}` : 'Unknown Student',
    avatarUrl: submission.student?.profileimage || 'https://i.pravatar.cc/150',
    displayId: submission.student?.student_id || '00000000',
    status: submission.points_awarded !== null ? 'completed' : 'submitted',
    submittedAt: submission.submitted_at,
    pointsAwarded: submission.points_awarded,
    feedback: submission.feedback,
    submittedFiles: Array.isArray(submission.attached_files) 
      ? submission.attached_files.map(file => ({
          id: file.id,
          name: file.name,
          url: file.url,
          size: file.size || '0 KB'
        }))
      : []
  };
};

/**
 * الحصول على تسليمات مهمة معينة
 * @param {string} assignmentId معرّف المهمة
 * @returns {Promise<Array>} قائمة التسليمات
 */
export const getSubmissionsByAssignment = async (assignmentId) => {
  try {
    // المسار الصحيح وفقًا للباك إند
    try {
      const response = await api.get(`/assignment-submissions/assignment/${assignmentId}`);
      console.log(`Successfully fetched submissions with path /assignment-submissions/assignment/${assignmentId}`);
      return (response.data.data || []).map(formatSubmissionData);
    } catch (firstError) {
      // إذا فشل المسار الصحيح، جرب مسارات بديلة (للتوافق مع الإصدارات القديمة)
      console.warn(`Failed with /assignment-submissions/assignment/${assignmentId}, trying legacy path...`);
      
      try {
        const response = await api.get(`/submissions/assignment/${assignmentId}`);
        console.log(`Successfully fetched submissions with path /submissions/assignment/${assignmentId}`);
        return (response.data.data || []).map(formatSubmissionData);
      } catch (secondError) {
        // إذا فشل المسار الثاني أيضًا، جرب مسارًا آخر
        console.warn(`Failed with legacy path, trying query parameter format...`);
        
        try {
          // استخدام تنسيق معلمات الاستعلام
          const response = await api.get(`/assignment-submissions?assignment_id=${assignmentId}`);
          console.log(`Successfully fetched submissions with path /assignment-submissions?assignment_id=${assignmentId}`);
          return (response.data.data || []).map(formatSubmissionData);
        } catch (thirdError) {
          // إذا فشلت جميع المحاولات، أرجع مصفوفة فارغة
          console.error(`All attempts to fetch submissions for assignment ${assignmentId} failed.`);
          return [];
        }
      }
    }
  } catch (error) {
    console.error(`Failed to fetch submissions for assignment ${assignmentId}:`, error);
    return [];
  }
};

/**
 * الحصول على تسليم محدد بواسطة المعرف
 * @param {string} id معرّف التسليم
 * @returns {Promise<Object>} بيانات التسليم
 */
export const getSubmissionById = async (id) => {
  try {
    // المسار الصحيح وفقًا للباك إند
    try {
      const response = await api.get(`/assignment-submissions/${id}`);
      return formatSubmissionData(response.data.data);
    } catch (firstError) {
      // إذا فشل المسار الأول، جرب مسارًا بديلاً
      console.warn(`Failed with /assignment-submissions/${id}, trying legacy path...`);
      
      try {
        const response = await api.get(`/submissions/${id}`);
        return formatSubmissionData(response.data.data);
      } catch (secondError) {
        console.error(`Failed to fetch submission with ID ${id} after trying multiple paths.`);
        throw new Error(`Submission with ID ${id} not found`);
      }
    }
  } catch (error) {
    console.error(`Failed to fetch submission with ID ${id}:`, error);
    throw error;
  }
};

/**
 * الحصول على تسليم طالب معين لمهمة معينة
 * @param {string} assignmentId معرّف المهمة
 * @param {string} studentId معرّف الطالب
 * @returns {Promise<Object>} بيانات التسليم
 */
export const getSubmissionByAssignmentAndStudent = async (assignmentId, studentId) => {
  try {
    // المسار الصحيح وفقًا للباك إند
    try {
      const response = await api.get(`/assignment-submissions/assignment/${assignmentId}/student/${studentId}`);
      return response.data.data ? formatSubmissionData(response.data.data) : null;
    } catch (firstError) {
      // إذا فشل المسار الأول، جرب مسارًا بديلاً
      console.warn(`Failed with /assignment-submissions/assignment/${assignmentId}/student/${studentId}, trying legacy path...`);
      
      try {
        const response = await api.get(`/submissions/assignment/${assignmentId}/student/${studentId}`);
        return response.data.data ? formatSubmissionData(response.data.data) : null;
      } catch (secondError) {
        // إذا فشل المسار الثاني أيضًا، جرب مسارًا آخر
        console.warn(`Failed with legacy path, trying query format...`);
        
        try {
          // جرب تنسيق استعلام مختلف
          const response = await api.get(`/assignment-submissions?assignment_id=${assignmentId}&student_id=${studentId}`);
          const submissions = response.data.data || [];
          // الحصول على التسليم الأول إذا وجد
          return submissions.length > 0 ? formatSubmissionData(submissions[0]) : null;
        } catch (thirdError) {
          console.error(`All attempts to fetch submission for assignment ${assignmentId} and student ${studentId} failed.`);
          return null;
        }
      }
    }
  } catch (error) {
    console.error(`Failed to fetch submission for assignment ${assignmentId} and student ${studentId}:`, error);
    return null;
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
    
    // المسار الصحيح وفقًا للباك إند
    try {
      const response = await api.post(`/assignment-submissions/${submissionId}/feedback`, apiData);
      return formatSubmissionData(response.data.data);
    } catch (firstError) {
      console.warn(`Failed with /assignment-submissions/${submissionId}/feedback, trying legacy path...`);
      
      // إذا فشل، حاول مسارًا بديلاً
      try {
        const response = await api.post(`/submissions/${submissionId}/feedback`, apiData);
        return formatSubmissionData(response.data.data);
      } catch (secondError) {
        console.error(`Failed to grade submission with ID ${submissionId} after trying multiple paths.`);
        throw secondError;
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

/**
 * تنزيل ملف مرفق من التسليم
 * @param {string} submissionId معرّف التسليم
 * @param {string} fileId معرّف الملف
 * @returns {Promise<Blob>} بيانات الملف للتنزيل
 */
export const downloadSubmissionFile = async (submissionId, fileId) => {
  try {
    // المسار الصحيح وفقًا للباك إند
    try {
      const response = await axios.get(`${API_BASE_URL}/assignment-submissions/${submissionId}/files/${fileId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        responseType: 'blob' // ضروري للحصول على بيانات الملف كـ Blob
      });
      return response.data;
    } catch (firstError) {
      // إذا فشل المسار الأول، جرب مسارًا بديلاً
      console.warn(`Failed with /assignment-submissions/${submissionId}/files/${fileId}/download, trying legacy path...`);
      
      try {
        const response = await axios.get(`${API_BASE_URL}/submissions/${submissionId}/files/${fileId}/download`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          responseType: 'blob'
        });
        return response.data;
      } catch (secondError) {
        // إذا فشل المسار الثاني أيضًا، جرب مسارًا آخر
        console.warn(`Failed with legacy path, trying direct file access...`);
        
        try {
          // قد يكون هناك مسار مباشر للملف
          const response = await axios.get(`${API_BASE_URL}/files/${fileId}/download`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            responseType: 'blob'
          });
          return response.data;
        } catch (thirdError) {
          // إذا فشلت جميع المحاولات، ارفع الخطأ
          throw thirdError;
        }
      }
    }
  } catch (error) {
    console.error(`Failed to download file ${fileId} from submission ${submissionId}:`, error);
    let errorMessage = 'فشل في تنزيل الملف';
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