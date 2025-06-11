"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function NavHandler() {
  const pathname = usePathname();
  
  useEffect(() => {
    console.log('NavHandler component mounted');
    // Check if we're on an inbox page
    const isInboxPage = pathname.endsWith('/inbox');
    
    // Set active state for sidebar inbox button only
    const sidebarInboxButton = document.querySelector('.sidebar .menu-button.inbox');
    
    if (isInboxPage && sidebarInboxButton) {
      sidebarInboxButton.classList.add('active');
    } else if (sidebarInboxButton) {
      sidebarInboxButton.classList.remove('active');
    }
    
    // No need to handle other tabs as NavTabs component handles that
  }, [pathname]); // Re-run when pathname changes
  
  return null; // This component doesn't render anything
} 