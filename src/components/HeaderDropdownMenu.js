"use client";

import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { deleteCookie } from 'cookies-next';
import { useState, useEffect } from 'react';

export default function HeaderDropdownMenu() {
  const router = useRouter();
  const pathname = usePathname();
  let userType = 'student'; // Default userType
  const [userData, setUserData] = useState({ name: 'Guest', email: 'guest@example.com' });

  // Get user data from localStorage on component mount
  useEffect(() => {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        setUserData({
          name: `${parsedUser.firstname || ''} ${parsedUser.lastname || ''}`.trim() || 'User',
          email: parsedUser.email || 'user@example.com'
        });
      }
    } catch (error) {
      console.error('Error getting user data:', error);
    }
  }, []);

  // Determine user type based on URL path
  if (pathname.startsWith('/students')) {
    userType = 'student';
  } else if (pathname.startsWith('/teachers/doctors')) {
    userType = 'doctor';
  } else if (pathname.startsWith('/teachers/assistants')) {
    userType = 'assistant';
  } else if (pathname.startsWith('/admins')) {
    userType = 'admin';
  }

  // Generate the correct settings link based on user type
  const getSettingsLink = () => {
    if (userType === 'student') return '/students/settings';
    if (userType === 'doctor') return '/teachers/doctors/settings';
    if (userType === 'assistant') return '/teachers/assistants/settings';
    if (userType === 'admin') return '/admins/settings';
    return '/'; // Default fallback
  };

  const handleLogout = () => {
    // حذف التوكن وبيانات المستخدم من localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // حذف التوكن ونوع المستخدم من الكوكيز
    deleteCookie('access_token');
    deleteCookie('refresh_token');
    deleteCookie('user_type');
    
    // التوجيه إلى صفحة تسجيل الدخول
    window.location.href = '/login';
  };

  return (
    <>
      <div className="nav-dropdown-user">
        <Image
          src="/images/shadcn.jpg"
          alt="Profile"
          width={40}
          height={40}
          className="profile-img"
        />
        <div className="user-info">
          <span className="user-name">{userData.name}</span>
          <span className="user-email">{userData.email}</span>
        </div>
      </div>
      <div className="nav-dropdown-menu">
        <a
          href={getSettingsLink()}
          className="menu-item"
          onClick={(e) => {
            e.preventDefault();
            router.push(getSettingsLink());
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Account
        </a>
        <div className="nav-dropdown-divider"></div>
        <a
          href={getSettingsLink()}
          className="menu-item"
          onClick={(e) => {
            e.preventDefault();
            router.push(getSettingsLink());
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
          </svg>
          Notifications
        </a>
        <div className="nav-dropdown-divider"></div>
        <Link href="/login" legacyBehavior>
          <a className="menu-item" onClick={handleLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Log out
          </a>
        </Link>
      </div>
    </>
  );
} 