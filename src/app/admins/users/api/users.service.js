/**
 * خدمة للتعامل مع API المستخدمين
 */

import { getCookie } from "cookies-next";
import axios from "axios";

// العنوان الأساسي للـ API
const API_BASE_URL = 'http://localhost:3001/api/v1';

// بيانات افتراضية للاستخدام عند فشل الاتصال بالخادم
const MOCK_USERS = [
  {
    id: '1',
    firstname: 'Ahmed',
    secondname: 'Mohamed',
    lastname: 'Hassan',
    email: 'ahmed.mohamed@example.com',
    type: 1, // Student
    profileimage: '/images/avatars/student1.jpg',
    status: 'active',
    createdAt: '2023-09-15T10:00:00.000Z'
  },
  {
    id: '2',
    firstname: 'Sara',
    secondname: 'Ali',
    lastname: 'Ibrahim',
    email: 'sara.ali@example.com',
    type: 1, // Student
    profileimage: '/images/avatars/student2.jpg',
    status: 'active',
    createdAt: '2023-08-20T14:30:00.000Z'
  },
  {
    id: '3',
    firstname: 'Dr. Mohamed',
    secondname: 'Ahmed',
    lastname: 'Khaled',
    email: 'dr.mohamed@example.com',
    type: 2, // Doctor
    profileimage: '/images/avatars/doctor1.jpg',
    status: 'active',
    createdAt: '2023-07-10T09:15:00.000Z'
  },
  {
    id: '4',
    firstname: 'Eng. Fatima',
    secondname: 'Mahmoud',
    lastname: 'Sayed',
    email: 'eng.fatima@example.com',
    type: 3, // Teacher
    profileimage: '/images/avatars/teacher1.jpg',
    status: 'inactive',
    createdAt: '2023-06-05T11:45:00.000Z'
  },
  {
    id: '5',
    firstname: 'Prof. Khaled',
    secondname: 'Ibrahim',
    lastname: 'Ali',
    email: 'prof.khaled@example.com',
    type: 4, // Professor
    profileimage: '/images/avatars/doctor2.jpg',
    status: 'active',
    createdAt: '2023-05-12T08:20:00.000Z'
  },
  {
    id: '6',
    firstname: 'Admin',
    secondname: '',
    lastname: 'User',
    email: 'admin@example.com',
    type: 5, // Admin
    profileimage: '/images/avatars/admin1.jpg',
    status: 'active',
    createdAt: '2023-04-01T00:00:00.000Z'
  }
];

// بيانات افتراضية إضافية للصفحات التالية
const MOCK_USERS_PAGE_2 = [
  {
    id: '7',
    firstname: 'Layla',
    secondname: 'Mahmoud',
    lastname: 'Ahmed',
    email: 'layla.mahmoud@example.com',
    type: 1, // Student
    profileimage: '/images/avatars/student3.jpg',
    status: 'active',
    createdAt: '2023-03-22T08:30:00.000Z'
  },
  {
    id: '8',
    firstname: 'Omar',
    secondname: 'Hassan',
    lastname: 'Mohamed',
    email: 'omar.hassan@example.com',
    type: 1, // Student
    profileimage: '/images/avatars/student4.jpg',
    status: 'active',
    createdAt: '2023-02-18T10:45:00.000Z'
  },
  {
    id: '9',
    firstname: 'Dr. Nour',
    secondname: 'Sayed',
    lastname: 'Ali',
    email: 'dr.nour@example.com',
    type: 2, // Doctor
    profileimage: '/images/avatars/doctor3.jpg',
    status: 'active',
    createdAt: '2023-01-05T14:20:00.000Z'
  },
  {
    id: '10',
    firstname: 'Eng. Youssef',
    secondname: 'Khaled',
    lastname: 'Ibrahim',
    email: 'eng.youssef@example.com',
    type: 3, // Teacher
    profileimage: '/images/avatars/teacher2.jpg',
    status: 'active',
    createdAt: '2022-12-12T09:10:00.000Z'
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
 * تنسيق بيانات المستخدم القادمة من الخادم
 */
const formatUserData = (user) => {
  return {
    id: user._id || user.id,
    firstname: user.firstname || user.first_name || '',
    secondname: user.secondname || user.middle_name || '',
    thirdname: user.thirdname || user.third_name || '',
    lastname: user.lastname || user.last_name || '',
    nickname: user.nickname || user.nick_name || null,
    nationality: user.nationality || 'Egyptian',
    nationalid: user.nationalid || user.national_id || '',
    birthdate: user.birthdate || user.birth_date || '',
    gender: user.gender !== undefined ? user.gender : 1,
    type: user.type !== undefined ? user.type : 0,
    email: user.email || '',
    phonenumber: user.phonenumber || user.phone_number || '',
    phonenumber2: user.phonenumber2 || user.phone_number2 || null,
    profileimage: user.profileimage || user.profile_image || user.avatar || '/images/default-avatar.jpg',
    status: user.status || 'active',
    createdAt: user.createdAt || user.created_at || new Date().toISOString(),
    updatedAt: user.updatedAt || user.updated_at || user.createdAt || user.created_at || new Date().toISOString()
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
  
  return response.data.data;
};

/**
 * الحصول على بيانات الطالب
 * @param {string} studentId معرف الطالب
 * @returns {Promise<Object>} بيانات الطالب
 */
export const getStudentDetails = async (studentId) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    console.log(`Fetching student details for ID ${studentId}`);
    const response = await axios.get(`${API_BASE_URL}/students/${studentId}`, getRequestConfig());
    console.log("getStudentDetails response:", response.data);
    
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching student details for ID ${studentId}:`, error);
    return null;
  }
};

/**
 * الحصول على بيانات الدكتور
 * @param {string} doctorId معرف الدكتور
 * @returns {Promise<Object>} بيانات الدكتور
 */
export const getDoctorDetails = async (doctorId) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    console.log(`Fetching doctor details for ID ${doctorId}`);
    const response = await axios.get(`${API_BASE_URL}/doctors/${doctorId}`, getRequestConfig());
    console.log("getDoctorDetails response:", response.data);
    
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching doctor details for ID ${doctorId}:`, error);
    return null;
  }
};

/**
 * الحصول على بيانات المساعد
 * @param {string} assistantId معرف المساعد
 * @returns {Promise<Object>} بيانات المساعد
 */
export const getAssistantDetails = async (assistantId) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    console.log(`Fetching assistant details for ID ${assistantId}`);
    const response = await axios.get(`${API_BASE_URL}/assistants/${assistantId}`, getRequestConfig());
    console.log("getAssistantDetails response:", response.data);
    
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching assistant details for ID ${assistantId}:`, error);
    return null;
  }
};

/**
 * الحصول على بيانات المسؤول
 * @param {string} adminId معرف المسؤول
 * @returns {Promise<Object>} بيانات المسؤول
 */
export const getAdminDetails = async (adminId) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    console.log(`Fetching admin details for ID ${adminId}`);
    const response = await axios.get(`${API_BASE_URL}/admins/${adminId}`, getRequestConfig());
    console.log("getAdminDetails response:", response.data);
    
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching admin details for ID ${adminId}:`, error);
    return null;
  }
};

/**
 * إضافة البيانات الإضافية للمستخدم حسب نوعه
 * @param {Object} user بيانات المستخدم الأساسية
 * @returns {Promise<Object>} بيانات المستخدم مع البيانات الإضافية
 */
export const enrichUserWithTypeDetails = async (user) => {
  if (!user || !user.id) return user;
  
  const userId = user.id;
  const userType = user.type;
  
  try {
    switch (userType) {
      case 0: // طالب
        const studentDetails = await getStudentDetails(userId);
        if (studentDetails) {
          return {
            ...user,
            maxhours: studentDetails.maxhours,
            section: studentDetails.section,
            major: studentDetails.major,
            registerationaccess: studentDetails.registerationaccess,
            platformaccess: studentDetails.platformaccess
          };
        }
        break;
        
      case 1: // مساعد
        const assistantDetails = await getAssistantDetails(userId);
        if (assistantDetails) {
          return {
            ...user,
            assistantDetails
          };
        }
        break;
        
      case 2: // دكتور
        const doctorDetails = await getDoctorDetails(userId);
        if (doctorDetails) {
          return {
            ...user,
            doctorDetails
          };
        }
        break;
        
      case 3: // مسؤول
        const adminDetails = await getAdminDetails(userId);
        if (adminDetails) {
          return {
            ...user,
            permissions: adminDetails.permissions || []
          };
        }
        break;
        
      case 4: // دكتور ومسؤول
        const doctorAndAdminDetails = await getDoctorDetails(userId);
        const adminDetailsForDoctor = await getAdminDetails(userId);
        
        return {
          ...user,
          doctorDetails: doctorAndAdminDetails,
          permissions: adminDetailsForDoctor?.permissions || []
        };
        break;
    }
  } catch (error) {
    console.error(`Error enriching user ${userId} with type details:`, error);
  }
  
  return user;
};

/**
 * جلب جميع المستخدمين
 * @param {number} page رقم الصفحة (اختياري، الافتراضي هو 1)
 * @param {number} limit عدد العناصر في الصفحة (اختياري، الافتراضي هو 10)
 * @returns {Promise<Array>} قائمة المستخدمين
 */
export const getAllUsers = async (page = 1, limit = 10) => {
  try {
    console.log("getAllUsers");
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const response = await axios.get(`${API_BASE_URL}/users`, getRequestConfig());
    console.log("response.data: ", response.data);
    
    const userData = handleApiResponse(response);
    const formattedUsers = Array.isArray(userData) ? userData.map(formatUserData) : [];
    
    // إضافة البيانات الإضافية لكل مستخدم حسب نوعه
    const enrichedUsers = [];
    for (const user of formattedUsers) {
      const enrichedUser = await enrichUserWithTypeDetails(user);
      enrichedUsers.push(enrichedUser);
    }
    
    return enrichedUsers;
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // في حالة الفشل، استخدم البيانات الافتراضية
    if (page === 1) {
      return MOCK_USERS;
    } else if (page === 2) {
      return MOCK_USERS_PAGE_2;
    } else {
      return []; // لا توجد بيانات للصفحات التالية
    }
  }
};

/**
 * جلب مستخدم محدد بواسطة المعرف
 * @param {string} id معرف المستخدم
 * @returns {Promise<Object>} بيانات المستخدم
 */
export const getUserById = async (id) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const response = await axios.get(`${API_BASE_URL}/users/${id}`, getRequestConfig());
    console.log("getUserById response:", response.data);
    
    const userData = handleApiResponse(response);
    const formattedUser = formatUserData(userData);
    
    // إضافة البيانات الإضافية للمستخدم حسب نوعه
    const enrichedUser = await enrichUserWithTypeDetails(formattedUser);
    
    return enrichedUser;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    
    // في حالة الفشل، ابحث في جميع البيانات الافتراضية
    const allMockUsers = [...MOCK_USERS, ...MOCK_USERS_PAGE_2];
    const mockUser = allMockUsers.find(user => user.id === id);
    if (mockUser) {
      return mockUser;
    }
    
    throw error;
  }
};

/**
 * إنشاء طالب في قاعدة البيانات
 * @param {string} studentId معرف الطالب
 * @param {Object} studentData بيانات الطالب الإضافية
 * @returns {Promise<Object>} بيانات الطالب المنشأ
 */
export const createStudent = async (studentId, studentData = {}) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    // بيانات افتراضية للطالب
    const defaultStudentData = {
      studentid: studentId,
      maxhours: 18,
      section: 'A',
      major: 'General',
      registerationaccess: true,
      platformaccess: true
    };
    
    // دمج البيانات الافتراضية مع البيانات المدخلة
    const finalStudentData = {
      ...defaultStudentData,
      ...studentData
    };
    
    console.log(`Creating student with ID ${studentId}:`, finalStudentData);
    const response = await axios.post(`${API_BASE_URL}/students`, finalStudentData, getRequestConfig(true));
    console.log("createStudent response:", response.data);
    
    return response.data && response.data.success === true;
  } catch (error) {
    console.error(`Error creating student with ID ${studentId}:`, error);
    
    // إعادة توجيه رسائل الخطأ من الخادم إذا كانت متوفرة
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    
    throw error;
  }
};

/**
 * إنشاء دكتور في قاعدة البيانات
 * @param {string} doctorId معرف الدكتور
 * @returns {Promise<Object>} بيانات الدكتور المنشأ
 */
export const createDoctor = async (doctorId) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const doctorData = {
      doctorid: doctorId
    };
    
    console.log(`Creating doctor with ID ${doctorId}`);
    const response = await axios.post(`${API_BASE_URL}/doctors`, doctorData, getRequestConfig(true));
    console.log("createDoctor response:", response.data);
    
    return response.data && response.data.success === true;
  } catch (error) {
    console.error(`Error creating doctor with ID ${doctorId}:`, error);
    
    // إعادة توجيه رسائل الخطأ من الخادم إذا كانت متوفرة
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    
    throw error;
  }
};

/**
 * إنشاء مساعد في قاعدة البيانات
 * @param {string} assistantId معرف المساعد
 * @returns {Promise<Object>} بيانات المساعد المنشأ
 */
export const createAssistant = async (assistantId) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const assistantData = {
      assistantid: assistantId
    };
    
    console.log(`Creating assistant with ID ${assistantId}`);
    const response = await axios.post(`${API_BASE_URL}/assistants`, assistantData, getRequestConfig(true));
    console.log("createAssistant response:", response.data);
    
    return response.data && response.data.success === true;
  } catch (error) {
    console.error(`Error creating assistant with ID ${assistantId}:`, error);
    
    // إعادة توجيه رسائل الخطأ من الخادم إذا كانت متوفرة
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    
    throw error;
  }
};

/**
 * إنشاء مسؤول في قاعدة البيانات
 * @param {string} adminId معرف المسؤول
 * @param {Array} permissions صلاحيات المسؤول
 * @returns {Promise<Object>} بيانات المسؤول المنشأ
 */
export const createAdmin = async (adminId, permissions = []) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const adminData = {
      adminid: adminId,
      permissions: Array.isArray(permissions) ? permissions : []
    };
    
    console.log(`Creating admin with ID ${adminId}:`, adminData);
    const response = await axios.post(`${API_BASE_URL}/admins`, adminData, getRequestConfig(true));
    console.log("createAdmin response:", response.data);
    
    return response.data && response.data.success === true;
  } catch (error) {
    console.error(`Error creating admin with ID ${adminId}:`, error);
    
    // إعادة توجيه رسائل الخطأ من الخادم إذا كانت متوفرة
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    
    throw error;
  }
};

/**
 * إنشاء مستخدم جديد
 * @param {Object} userData بيانات المستخدم
 * @returns {Promise<Object>} بيانات المستخدم المنشأ
 */
export const createUser = async (userData) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    // استخراج البيانات الخاصة بكل نوع من المستخدمين
    const { studentData, adminData, ...basicUserData } = userData;
    
    console.log("Creating user with data:", basicUserData);
    const response = await axios.post(`${API_BASE_URL}/users`, basicUserData, getRequestConfig(true));
    console.log("createUser response:", response.data);
    
    const createdUserData = handleApiResponse(response);
    const formattedUserData = formatUserData(createdUserData);
    
    // إنشاء السجل المناسب حسب نوع المستخدم
    try {
      const userId = formattedUserData.id;
      const userType = formattedUserData.type;
      
      console.log(`Creating specific record for user ID ${userId} with type ${userType}`);
      
      switch (userType) {
        case 0: // طالب
          await createStudent(userId, studentData);
          break;
        case 1: // مساعد
          await createAssistant(userId);
          break;
        case 2: // دكتور
          await createDoctor(userId);
          break;
        case 3: // مسؤول
          await createAdmin(userId, adminData?.permissions);
          break;
        case 4: // دكتور ومسؤول
          await createDoctor(userId);
          await createAdmin(userId, adminData?.permissions);
          break;
        default:
          console.warn(`Unknown user type ${userType} for user ${userId}`);
      }
      
      console.log(`Successfully created specific record for user ID ${userId} with type ${userType}`);
    } catch (specificError) {
      console.error('Error creating specific user record:', specificError);
      // لا نريد إيقاف العملية إذا فشل إنشاء السجل الخاص، لأن المستخدم الأساسي تم إنشاؤه بالفعل
    }
    
    return formattedUserData;
  } catch (error) {
    console.error('Error creating user:', error);
    
    // إعادة توجيه رسائل الخطأ من الخادم إذا كانت متوفرة
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    
    throw error;
  }
};

/**
 * تحديث بيانات مستخدم
 * @param {string} id معرف المستخدم
 * @param {Object} userData بيانات المستخدم المحدثة
 * @returns {Promise<Object>} بيانات المستخدم المحدثة
 */
export const updateUser = async (id, userData) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    // استخراج البيانات الخاصة بكل نوع من المستخدمين
    const { studentData, adminData, ...basicUserData } = userData;
    
    // الحصول على بيانات المستخدم الحالية قبل التحديث
    const currentUserData = await getUserById(id);
    const currentType = currentUserData.type;
    const newType = basicUserData.type !== undefined ? parseInt(basicUserData.type) : currentType;
    
    console.log(`Updating user ${id} with data:`, basicUserData);
    console.log(`User type change: ${currentType} -> ${newType}`);
    
    // تحديث بيانات المستخدم الأساسية
    const response = await axios.put(`${API_BASE_URL}/users/${id}`, basicUserData, getRequestConfig(true));
    console.log("updateUser response:", response.data);
    
    const updatedUserData = handleApiResponse(response);
    const formattedUserData = formatUserData(updatedUserData);
    
    // إذا تغير نوع المستخدم أو كان هناك بيانات إضافية، قم بتحديث السجلات المناسبة
    if (newType !== currentType || studentData || adminData) {
      try {
        console.log(`User type changed from ${currentType} to ${newType} or additional data provided, updating specific records`);
        
        // إنشاء السجلات الجديدة حسب النوع الجديد
        switch (newType) {
          case 0: // طالب
            await createStudent(id, studentData);
            break;
          case 1: // مساعد
            await createAssistant(id);
            break;
          case 2: // دكتور
            await createDoctor(id);
            break;
          case 3: // مسؤول
            await createAdmin(id, adminData?.permissions);
            break;
          case 4: // دكتور ومسؤول
            await createDoctor(id);
            await createAdmin(id, adminData?.permissions);
            break;
        }
        
        console.log(`Successfully created new specific records for user ID ${id} with new type ${newType}`);
      } catch (specificError) {
        console.error('Error updating specific user records:', specificError);
        // لا نريد إيقاف العملية إذا فشل تحديث السجلات الخاصة
      }
    }
    
    return formattedUserData;
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error);
    
    // إعادة توجيه رسائل الخطأ من الخادم إذا كانت متوفرة
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    
    throw error;
  }
};

/**
 * حذف طالب من قاعدة البيانات
 * @param {string} studentId معرف الطالب
 * @returns {Promise<boolean>} نجاح العملية
 */
export const deleteStudent = async (studentId) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    console.log(`Deleting student with ID ${studentId}`);
    const response = await axios.delete(`${API_BASE_URL}/students/${studentId}`, getRequestConfig());
    console.log("deleteStudent response:", response.data);
    
    return response.data && response.data.success === true;
  } catch (error) {
    console.error(`Error deleting student with ID ${studentId}:`, error);
    throw error;
  }
};

/**
 * حذف دكتور من قاعدة البيانات
 * @param {string} doctorId معرف الدكتور
 * @returns {Promise<boolean>} نجاح العملية
 */
export const deleteDoctor = async (doctorId) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    console.log(`Deleting doctor with ID ${doctorId}`);
    const response = await axios.delete(`${API_BASE_URL}/doctors/${doctorId}`, getRequestConfig());
    console.log("deleteDoctor response:", response.data);
    
    return response.data && response.data.success === true;
  } catch (error) {
    console.error(`Error deleting doctor with ID ${doctorId}:`, error);
    throw error;
  }
};

/**
 * حذف مساعد من قاعدة البيانات
 * @param {string} assistantId معرف المساعد
 * @returns {Promise<boolean>} نجاح العملية
 */
export const deleteAssistant = async (assistantId) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    console.log(`Deleting assistant with ID ${assistantId}`);
    const response = await axios.delete(`${API_BASE_URL}/assistants/${assistantId}`, getRequestConfig());
    console.log("deleteAssistant response:", response.data);
    
    return response.data && response.data.success === true;
  } catch (error) {
    console.error(`Error deleting assistant with ID ${assistantId}:`, error);
    throw error;
  }
};

/**
 * حذف مسؤول من قاعدة البيانات
 * @param {string} adminId معرف المسؤول
 * @returns {Promise<boolean>} نجاح العملية
 */
export const deleteAdmin = async (adminId) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    console.log(`Deleting admin with ID ${adminId}`);
    const response = await axios.delete(`${API_BASE_URL}/admins/${adminId}`, getRequestConfig());
    console.log("deleteAdmin response:", response.data);
    
    return response.data && response.data.success === true;
  } catch (error) {
    console.error(`Error deleting admin with ID ${adminId}:`, error);
    throw error;
  }
};

/**
 * حذف مستخدم
 * @param {string} id معرف المستخدم
 * @returns {Promise<boolean>} نجاح العملية
 */
export const deleteUser = async (id) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    // الحصول على بيانات المستخدم قبل الحذف
    try {
      const userData = await getUserById(id);
      const userType = userData.type;
      
      console.log(`Deleting specific records for user ID ${id} with type ${userType}`);
      
      // حذف السجلات المرتبطة حسب نوع المستخدم
      switch (userType) {
        case 0: // طالب
          await deleteStudent(id);
          break;
        case 1: // مساعد
          await deleteAssistant(id);
          break;
        case 2: // دكتور
          await deleteDoctor(id);
          break;
        case 3: // مسؤول
          await deleteAdmin(id);
          break;
        case 4: // دكتور ومسؤول
          try { await deleteDoctor(id); } catch (e) { console.error(e); }
          try { await deleteAdmin(id); } catch (e) { console.error(e); }
          break;
      }
      
      console.log(`Successfully deleted specific records for user ID ${id}`);
    } catch (specificError) {
      console.error('Error deleting specific user records:', specificError);
      // لا نريد إيقاف العملية إذا فشل حذف السجلات الخاصة
    }
    
    // حذف المستخدم الأساسي
    console.log(`Deleting user ${id}`);
    const response = await axios.delete(`${API_BASE_URL}/users/${id}`, getRequestConfig());
    console.log("deleteUser response:", response.data);
    
    return response.data && response.data.success === true;
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    
    // إعادة توجيه رسائل الخطأ من الخادم إذا كانت متوفرة
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    
    throw error;
  }
}; 