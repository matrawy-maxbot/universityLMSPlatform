"use client";

import { useState } from 'react';
import Joi from 'joi';
import { useRouter } from 'next/navigation';
import { mockUsers } from '../../mockUtils';
import { delay } from '../../mockUtils';

// دالة التحقق من صحة كلمة المرور (للعرض التوضيحي فقط)
// في التطبيق الحقيقي، ستستخدم bcrypt.compare()
const checkPassword = (email, plainPassword) => {
  // For demo purposes, all mock users have standard passwords based on their type
  const user = mockUsers.find(u => u.email === email);
  if (!user) return false;
  
  // Map user types to standard passwords for demo
  const passwordMap = {
    0: "student123",    // Student
    1: "assistant123",  // Assistant
    2: "doctor123",     // Doctor
    3: "admin123",      // Admin
    4: "doctoradmin123" // Department head
  };
  
  return passwordMap[user.type] === plainPassword;
};

export const loginUser = async (credentials) => {
  try {
    // Add artificial delay to simulate network request
    await delay(800);
    
    // Validation schema with modified email validation for browser compatibility
    const schema = Joi.object({
      email: Joi.string()
        .email({ tlds: { allow: false } }) // Disable TLD validation
        .required(),
      password: Joi.string().required()
    });

    // Validate input
    const { error } = schema.validate(credentials);
    
    if (error) {
      return {
        success: false,
        message: error.details[0].message
      };
    }

    console.log("Login attempt with:", credentials);

    // Find user by email
    const user = mockUsers.find(u => u.email === credentials.email);
    
    if (!user) {
      return {
        success: false,
        message: "Invalid email or password"
      };
    }

    // Check password (simplified for mock data)
    const isValidPassword = checkPassword(credentials.email, credentials.password);
    if (!isValidPassword) {
      return {
        success: false,
        message: "Invalid email or password"
      };
    }

    // Create mock token
    const mockToken = `mock_token_${Date.now()}_${user.id}`;
    const mockRefreshToken = `mock_refresh_${Date.now()}_${user.id}`;

    // Return successful login response with mock tokens
    return {
      success: true,
      data: {
        accessToken: mockToken,
        refreshToken: mockRefreshToken,
        user: {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          type: user.type,
          profileimage: user.profileimage || null,
          name: `${user.firstname} ${user.lastname}`
        }
      }
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred during login'
    };
  }
};

// دالة للتحقق من صلاحية التوكن
export const verifyToken = async (token) => {
  try {
    await delay(300); // Add artificial delay
    
    if (!token) {
      return {
        success: false,
        message: 'No token provided'
      };
    }

    // Pretend to validate the token - in real app this would check with backend
    if (token.startsWith('mock_token_')) {
      // Extract user ID from token (just a mock implementation)
      const parts = token.split('_');
      const userId = parts[parts.length - 1]; // Get the last part which should be the user ID
      const user = mockUsers.find(u => u.id === userId);
      
      if (user) {
        return {
          success: true,
          data: {
            user: {
              id: user.id,
              type: user.type,
              email: user.email,
              firstname: user.firstname,
              lastname: user.lastname,
              name: `${user.firstname} ${user.lastname}`,
              profileimage: user.profileimage || null
            }
          }
        };
      }
    }

    return {
      success: false,
      message: 'Invalid token'
    };
    
  } catch (error) {
    console.error('Token verification error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred during token verification'
    };
  }
};

// التحقق مما إذا كان المستخدم مصرح له بالوصول إلى مسار معين
export const checkAuthorization = (userType, currentPath) => {
  // مسارات مسموح بها لكل نوع مستخدم
  const authorizedPaths = {
    0: ['/students'], // الطلاب
    1: ['/teachers/assistants'], // المساعدين
    2: ['/teachers/doctors'], // الدكاترة
    3: ['/admins'], // المسؤولين
    4: ['/teachers/doctors'] // دكاترة إداريين (رؤساء أقسام)
  };

  // التحقق من صفحة تسجيل الدخول
  if (currentPath === '/login') {
    return true;
  }

  // التحقق من الصفحة الرئيسية
  if (currentPath === '/') {
    return true;
  }

  // التحقق إذا كان المستخدم غير معرّف أو نوعه غير موجود
  if (userType === undefined || !authorizedPaths[userType]) {
    return false;
  }

  // التحقق ما إذا كان المسار الحالي يبدأ بأحد المسارات المصرح بها لنوع المستخدم
  return authorizedPaths[userType].some(path => currentPath.startsWith(path));
};