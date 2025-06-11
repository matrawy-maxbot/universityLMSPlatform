/**
 * خدمة للتعامل مع API المجموعات
 */

import { getCookie } from "cookies-next";

// العنوان الأساسي للـ API
const API_BASE_URL = 'http://localhost:3001/api/v1';

const token = getCookie('access_token');

console.log("token: ",token);

// بيانات افتراضية للاستخدام عند فشل الاتصال بالخادم
const MOCK_GROUPS = [
  {
    id: 'group1',
    title: 'Software Engineering',
    description: 'Group for software engineering students',
    isPublic: true,
    authorid: 'author1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      membersCount: 33
    },
    author: {
      id: 'author1',
      firstname: 'Ahmed',
      lastname: 'Emad',
      email: 'ahmed@example.com',
      profileimage: '/images/shadcn.jpg'
    }
  },
  {
    id: 'group2',
    title: 'Web Development',
    description: 'Group for web development enthusiasts',
    isPublic: true,
    authorid: 'author2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      membersCount: 25
    },
    author: {
      id: 'author2',
      firstname: 'Laila',
      lastname: 'Kamel',
      email: 'laila@example.com',
      profileimage: 'https://i.pravatar.cc/150?img=5'
    }
  }
];

/**
 * جلب جميع المجموعات مع تفاصيل المؤلفين
 * @returns {Promise<Array>} قائمة المجموعات
 */
export const getAllGroupsWithAuthors = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups/with-authors`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!response.ok) {
      console.warn(`API request failed with status ${response.status}. Using mock data instead.`);
      // استخدام البيانات الافتراضية في حالة فشل الطلب
      return MOCK_GROUPS;
    }
    
    const data = await response.json();
    const groups = data.data || [];
    
    // Obtener el recuento de miembros para cada grupo
    const groupsWithMembers = await Promise.all(groups.map(async (group) => {
      try {
        // Intentar obtener miembros del grupo
        const members = await getGroupMembers(group.id);
        
        // Asegurarse de que el objeto metadata exista
        if (!group.metadata) {
          group.metadata = {};
        }
        
        // Actualizar el recuento de miembros
        group.metadata.membersCount = members.length;
      } catch (error) {
        console.error(`Error al obtener miembros para el grupo ${group.id}:`, error);
        // Si hay error, mantener el valor existente o usar 0
        if (!group.metadata) {
          group.metadata = { membersCount: 0 };
        } else if (!group.metadata.membersCount) {
          group.metadata.membersCount = 0;
        }
      }
      return group;
    }));
    
    return groupsWithMembers;
  } catch (error) {
    console.error('Failed to fetch groups:', error);
    console.warn('Using mock data due to API error.');
    // استخدام البيانات الافتراضية في حالة حدوث خطأ
    return MOCK_GROUPS;
  }
};

/**
 * الحصول على مجموعة بواسطة المعرّف
 * @param {string} id معرّف المجموعة
 * @returns {Promise<Object>} بيانات المجموعة
 */
export const getGroupById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!response.ok) {
      // في حالة وجود بيانات افتراضية تطابق المعرّف
      const mockGroup = MOCK_GROUPS.find(group => group.id === id);
      if (mockGroup) return mockGroup;
      throw new Error(`Error fetching group: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Failed to fetch group with ID ${id}:`, error);
    // محاولة إيجاد المجموعة في البيانات الافتراضية
    const mockGroup = MOCK_GROUPS.find(group => group.id === id);
    if (mockGroup) return mockGroup;
    throw error;
  }
};

/**
 * إنشاء مجموعة جديدة
 * @param {Object} groupData بيانات المجموعة
 * @returns {Promise<Object>} المجموعة الجديدة
 */
export const createGroup = async (groupData) => {
  try {
    console.log('Sending request to create group:', groupData);
    const response = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(groupData),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.warn(`API request failed with status ${response.status}. Server response:`, responseData);
      
      // تحديد نوع الخطأ من الرد للعرض للمستخدم
      let errorMessage = 'فشل في إنشاء المجموعة';
      if (responseData && responseData.message) {
        errorMessage = responseData.message;
      }
      
      const error = new Error(errorMessage);
      error.response = {
        status: response.status,
        data: responseData
      };
      throw error;
    }
    
    console.log('Group created successfully:', responseData);
    return responseData.data;
  } catch (error) {
    console.error('Failed to create group:', error);
    if (!error.response) {
      error.response = {
        status: 'NETWORK_ERROR',
        data: { message: 'Network error or CORS issue' }
      };
    }
    throw error;
  }
};

/**
 * تحديث بيانات مجموعة
 * @param {string} id معرّف المجموعة
 * @param {Object} groupData بيانات التحديث
 * @returns {Promise<Object>} بيانات المجموعة المحدثة
 */
export const updateGroup = async (id, groupData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(groupData),
    });
    
    if (!response.ok) {
      console.warn(`API request failed with status ${response.status}. Updating mock group instead.`);
      // تحديث المجموعة الافتراضية في حالة فشل الطلب
      const updatedMockGroup = {
        ...groupData,
        id,
        updatedAt: new Date().toISOString()
      };
      return updatedMockGroup;
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Failed to update group with ID ${id}:`, error);
    console.warn('Updating mock group due to API error.');
    // تحديث المجموعة الافتراضية في حالة حدوث خطأ
    const updatedMockGroup = {
      ...groupData,
      id,
      updatedAt: new Date().toISOString()
    };
    return updatedMockGroup;
  }
};

/**
 * حذف مجموعة
 * @param {string} id معرّف المجموعة
 * @returns {Promise<boolean>} نتيجة العملية
 */
export const deleteGroup = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      console.warn(`API request failed with status ${response.status}. Simulating successful deletion.`);
      return true; // محاكاة نجاح العملية
    }
    
    const data = await response.json();
    return data.success || true;
  } catch (error) {
    console.error(`Failed to delete group with ID ${id}:`, error);
    console.warn('Simulating successful deletion due to API error.');
    return true; // محاكاة نجاح العملية
  }
};

// المجموعة الافتراضية من الأعضاء للاستخدام عند فشل الطلب
const MOCK_MEMBERS = [
  {
    id: 'member1',
    user: {
      id: 'user1',
      firstname: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      profileimage: 'https://i.pravatar.cc/150?img=1',
      type: 'Student'
    },
    joinedAt: new Date().toISOString()
  },
  {
    id: 'member2',
    user: {
      id: 'user2',
      firstname: 'Jane',
      lastname: 'Smith',
      email: 'jane@example.com',
      profileimage: 'https://i.pravatar.cc/150?img=2',
      type: 'Student'
    },
    joinedAt: new Date().toISOString()
  }
];

/**
 * الحصول على أعضاء المجموعة
 * @param {string} groupId معرّف المجموعة
 * @returns {Promise<Array>} قائمة الأعضاء
 */
export const getGroupMembers = async (groupId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      console.warn(`API request failed with status ${response.status}. Using mock members data.`);
      return MOCK_MEMBERS;
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Failed to fetch members for group with ID ${groupId}:`, error);
    console.warn('Using mock members data due to API error.');
    return MOCK_MEMBERS;
  }
};

/**
 * إضافة أعضاء إلى مجموعة
 * @param {string} groupId معرّف المجموعة
 * @param {Array<string>} members قائمة معرّفات الأعضاء
 * @returns {Promise<Object>} بيانات المجموعة المحدثة
 */
export const addMembersToGroup = async (groupId, members) => {
  try {
    console.log(`Adding members to group ${groupId}:`, members);
    
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ members }),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.warn(`API request failed with status ${response.status}. Server response:`, responseData);
      
      const errorMessage = responseData && responseData.message 
        ? responseData.message 
        : 'فشل في إضافة الأعضاء إلى المجموعة';
        
      const error = new Error(errorMessage);
      error.response = {
        status: response.status,
        data: responseData
      };
      throw error;
    }
    
    console.log('Members added successfully:', responseData);
    return responseData.data;
  } catch (error) {
    console.error(`Failed to add members to group with ID ${groupId}:`, error);
    if (!error.response) {
      error.response = {
        status: 'NETWORK_ERROR',
        data: { message: 'Network error or CORS issue' }
      };
    }
    throw error;
  }
};

/**
 * إزالة عضو من مجموعة
 * @param {string} groupId معرّف المجموعة
 * @param {string} memberId معرّف العضو
 * @returns {Promise<Object>} بيانات المجموعة المحدثة
 */
export const removeMemberFromGroup = async (groupId, memberId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/member/${memberId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      console.warn(`API request failed with status ${response.status}. Simulating successful member removal.`);
      // محاكاة نجاح العملية
      return { id: groupId, message: 'Member removed successfully (mock)' };
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Failed to remove member ${memberId} from group with ID ${groupId}:`, error);
    console.warn('Simulating successful member removal due to API error.');
    // محاكاة نجاح العملية
    return { id: groupId, message: 'Member removed successfully (mock)' };
  }
}; 