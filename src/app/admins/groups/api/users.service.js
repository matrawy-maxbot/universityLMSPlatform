/**
 * خدمة للتعامل مع API المستخدمين
 */

import { getCookie } from "cookies-next";

// العنوان الأساسي للـ API
const API_BASE_URL = 'http://localhost:3001/api/v1';

const token = getCookie('access_token');

/**
 * تحويل رقم نوع المستخدم إلى نص
 * @param {number} typeCode رقم نوع المستخدم
 * @returns {string} نوع المستخدم كنص
 */
export const getUserTypeText = (typeCode) => {
  switch (Number(typeCode)) {
    case 0: return 'Student';
    case 1: return 'Assistant';
    case 2: return 'Doctor';
    case 3: return 'Admin';
    case 4: return 'Admin & Doctor';
    default: return 'User';
  }
};

/**
 * جلب جميع المستخدمين
 * @returns {Promise<Array>} قائمة المستخدمين
 */
export const getAllUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!response.ok) {
      console.warn(`API request failed with status ${response.status}. Using mock data instead.`);
      // استخدام البيانات الافتراضية في حالة فشل الطلب
      return MOCK_USERS;
    }
    
    const data = await response.json();
    // تحويل البيانات لإضافة نوع المستخدم كنص
    const formattedUsers = (data.data || []).map(user => ({
      ...user,
      typeText: getUserTypeText(user.type)
    }));
    return formattedUsers;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    console.warn('Using mock data due to API error.');
    // استخدام البيانات الافتراضية في حالة حدوث خطأ
    return MOCK_USERS;
  }
};

/**
 * جلب المستخدمين حسب النوع (Student, Doctor, Assistant, Admin)
 * @param {string} type نوع المستخدم
 * @returns {Promise<Array>} قائمة المستخدمين
 */
export const getUsersByType = async (type) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/type/${type}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!response.ok) {
      console.warn(`API request failed with status ${response.status}. Using mock data instead.`);
      // تصفية البيانات الافتراضية حسب النوع
      return MOCK_USERS.filter(user => user.type === type);
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Failed to fetch users of type ${type}:`, error);
    console.warn('Using mock data due to API error.');
    // تصفية البيانات الافتراضية حسب النوع
    return MOCK_USERS.filter(user => user.type === type);
  }
};

// بيانات افتراضية للاستخدام عند فشل الاتصال بالخادم
const MOCK_USERS = [
  {
    id: 1,
    firstname: 'Ahmed',
    lastname: 'Mohamed',
    email: 'ahmed@example.com',
    profileimage: 'https://i.pravatar.cc/150?img=1',
    type: 0,
    typeText: 'Student',
    status: 'Active'
  },
  {
    id: 2,
    firstname: 'Fatima',
    lastname: 'Ali',
    email: 'fatima@example.com',
    profileimage: 'https://i.pravatar.cc/150?img=2',
    type: 0,
    typeText: 'Student',
    status: 'Active'
  },
  {
    id: 3,
    firstname: 'Dr. Mohamed',
    lastname: 'Hassan',
    email: 'dr.mohamed@example.com',
    profileimage: 'https://i.pravatar.cc/150?img=3',
    type: 2,
    typeText: 'Doctor',
    status: 'Active'
  },
  {
    id: 4,
    firstname: 'Eng. Laila',
    lastname: 'Kamel',
    email: 'laila@example.com',
    profileimage: 'https://i.pravatar.cc/150?img=4',
    type: 1,
    typeText: 'Assistant',
    status: 'Active'
  },
  {
    id: 5,
    firstname: 'Omar',
    lastname: 'Youssef',
    email: 'omar@example.com',
    profileimage: 'https://i.pravatar.cc/150?img=5',
    type: 3,
    typeText: 'Admin',
    status: 'Active'
  },
  {
    id: 6,
    firstname: 'Dr. Khaled',
    lastname: 'Ibrahim',
    email: 'khaled@example.com',
    profileimage: 'https://i.pravatar.cc/150?img=8',
    type: 4,
    typeText: 'Admin & Doctor',
    status: 'Active'
  }
]; 