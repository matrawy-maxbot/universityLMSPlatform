"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NavTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const [isInboxPage, setIsInboxPage] = useState(false);
  const [userType, setUserType] = useState('');
  
  useEffect(() => {
    // Determine user type based on URL
    if (pathname.startsWith('/students')) {
      setUserType('student');
    } else if (pathname.startsWith('/teachers/doctors')) {
      setUserType('doctor');
    } else if (pathname.startsWith('/teachers/assistants')) {
      setUserType('assistant');
    } else if (pathname.startsWith('/admins')) {
      setUserType('admin');
    }
    
    // Check if current URL ends with /inbox
    const checkIsInboxPage = pathname.endsWith('/inbox');
    setIsInboxPage(checkIsInboxPage);
    console.log('isInboxPage', checkIsInboxPage, pathname, isInboxPage);
    
    // Store current path when page loads (except for inbox)
    if (!pathname.includes('/inbox')) {
      sessionStorage.setItem('previousPage', pathname);
    }
  }, [pathname]);

  useEffect(() => {
    console.log('isInboxPage updated:', isInboxPage);
  }, [isInboxPage]);
  
  const handleDashboardClick = () => {
    const previousPage = sessionStorage.getItem('previousPage') || 
      getDefaultDashboardPage();
    router.push(previousPage);
  };
  
  const handleInboxClick = () => {
    console.log('handleInboxClick');
    const inboxPath = getInboxPath();
    router.push(inboxPath);
  };
  
  const getDefaultDashboardPage = () => {
    if (userType === 'student') return '/students/scheduling';
    if (userType === 'doctor') return '/teachers/doctors/scheduling';
    if (userType === 'assistant') return '/teachers/assistants/scheduling';
    if (userType === 'admin') return '/admins/statics';
    return '/';
  };
  
  const getInboxPath = () => {
    if (userType === 'student') return '/students/inbox';
    if (userType === 'doctor') return '/teachers/doctors/inbox';
    if (userType === 'assistant') return '/teachers/assistants/inbox';
    if (userType === 'admin') return '/admins/inbox';
    return '/inbox';
  };
  
  return (
    <div className="tabs">
      <button 
        className={`tab ${!pathname.endsWith('/inbox') ? 'active' : ''}`} 
        id="dashboard" 
        onClick={handleDashboardClick}
      >
        Dashboard
      </button>
      <button 
        className={`tab ${pathname.endsWith('/inbox') ? 'active' : ''} filled`} 
        id="inbox" 
        onClick={handleInboxClick}
      >
        Inbox
        <span className="notification-badge">3</span>
      </button>
    </div>
  );
} 