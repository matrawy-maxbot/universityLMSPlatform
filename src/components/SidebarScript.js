'use client';

import { useEffect } from 'react';
import { createAnnouncementDialog } from '../app/announcements/script.js';

export default function SidebarScript() {
     console.log("SidebarScript");
  useEffect(() => {
    // Sidebar state management
    const sidebar = document.querySelector('.sidebar');
    const sidebarRail = document.querySelector('[data-sidebar="rail"]');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const menuItems = document.querySelectorAll('[data-sidebar="menu-item"]');
    const menuButtons = document.querySelectorAll('[data-sidebar="menu-button"]');

    // Handle sidebar collapse from both rail and toggle button
    function toggleSidebar() {
      if(window.innerWidth < 1100) {
        if(sidebar.getAttribute('data-state') === 'mini_collapsed' || sidebar.getAttribute('data-state') === 'collapsed' || sidebar.getAttribute('data-state') === 'expanded') {
          sidebar.setAttribute('data-state', 'mini_expanded');
        } else {
          sidebar.setAttribute('data-state', 'mini_collapsed');
        }
        return;
      }
      const isCollapsed = sidebar.getAttribute('data-state') === 'collapsed';
      sidebar.setAttribute('data-state', isCollapsed ? 'expanded' : 'collapsed');
    }

    // إعداد أزرار الشريط الجانبي
    if (sidebarRail && sidebarRail.parentNode) {
      const newSidebarRail = sidebarRail.cloneNode(true);
      sidebarRail.parentNode.replaceChild(newSidebarRail, sidebarRail);
      newSidebarRail.addEventListener('click', toggleSidebar);
    }

    if (sidebarToggle && sidebarToggle.parentNode) {
      const newSidebarToggle = sidebarToggle.cloneNode(true);
      sidebarToggle.parentNode.replaceChild(newSidebarToggle, sidebarToggle);
      newSidebarToggle.addEventListener('click', toggleSidebar);
    }

    // Handle collapsible menu items
    menuItems.forEach(item => {
      const button = item.querySelector('[data-sidebar="menu-button"]');
      const submenu = item.querySelector('.submenu-container');
      
      if (button && submenu && button.parentNode) {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', () => {
          if (sidebar.getAttribute('data-state') === 'collapsed') {
            return; // Don't toggle submenu when sidebar is collapsed
          }
          
          const isOpen = item.getAttribute('data-state') === 'open';
          
          // Close all other open items
          menuItems.forEach(otherItem => {
            if (otherItem !== item && otherItem.getAttribute('data-state') === 'open') {
              otherItem.setAttribute('data-state', 'closed');
              const otherSubmenu = otherItem.querySelector('.submenu-container');
              if (otherSubmenu) {
                otherSubmenu.style.height = '0';
              }
            }
          });
          
          // Toggle current item
          item.setAttribute('data-state', isOpen ? 'closed' : 'open');
          if (isOpen) {
            submenu.style.height = '0';
          } else {
            submenu.style.height = submenu.scrollHeight + 'px';
          }
        });
      }
    });

    // Handle menu button active states
    const newMenuButtons = [];
    menuButtons.forEach(button => {
      if (button && button.parentNode) {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        newMenuButtons.push(newButton);
        
        newButton.addEventListener('click', () => {
          const isActive = newButton.getAttribute('data-active') === 'true';
          
          // Remove active state from all buttons
          newMenuButtons.forEach(btn => {
            if (btn) {
              btn.setAttribute('data-active', 'false');
            }
          });
          
          // Toggle current button
          if (!isActive) {
            newButton.setAttribute('data-active', 'true');
          }

          // If this is the announcements button, open the dialog
          if (newButton.id === 'announcements-menu-button') {
            createAnnouncementDialog();
          }
        });
      }
    });

    // Navigation item functionality
    const navItems = document.querySelectorAll('.nav-item');
    const newNavItems = [];

    navItems.forEach(item => {
      if (item && item.parentNode) {
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        newNavItems.push(newItem);
        
        newItem.addEventListener('click', () => {
          // Remove active class from all items
          newNavItems.forEach(i => {
            if (i) {
              i.classList.remove('active');
            }
          });
          // Add active class to clicked item
          newItem.classList.add('active');
        });
      }
    });

    // Theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    if (themeToggle && themeToggle.parentNode) {
      const newThemeToggle = themeToggle.cloneNode(true);
      themeToggle.parentNode.replaceChild(newThemeToggle, themeToggle);
      
      newThemeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        const themeIcon = newThemeToggle.querySelector('.nav-icon');
        if (themeIcon) {
          themeIcon.style.opacity = body.classList.contains('dark-theme') ? '1' : '0.7';
        }
      });
    }

    // // Tab switching functionality
    // const tabs = document.querySelectorAll('.tab');
    // const newTabs = [];

    // tabs.forEach(tab => {
    //   if (tab && tab.parentNode) {
    //     const newTab = tab.cloneNode(true);
    //     tab.parentNode.replaceChild(newTab, tab);
    //     newTabs.push(newTab);
        
    //     newTab.addEventListener('click', () => {
    //       // Remove active class from all tabs
    //       newTabs.forEach(t => {
    //         if (t) {
    //           t.classList.remove('active');
    //         }
    //       });
    //       // Add active class to clicked tab
    //       newTab.classList.add('active');
    //     });
    //   }
    // });

    // Account Dropdown Toggle
    const accountTrigger = document.getElementById('account-trigger');
    const accountDropdown = document.querySelector('.sidebar-dropdown');
    const headerProfile = document.getElementById('header-profile');
    const headerDropdown = document.getElementById('header-dropdown');

    function setupDropdown(trigger, dropdown) {
      if (trigger && dropdown && trigger.parentNode) {
        // إزالة أي مستمعي أحداث سابقين لمنع التكرار
        const newTrigger = trigger.cloneNode(true);
        trigger.parentNode.replaceChild(newTrigger, trigger);
        
        newTrigger.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.classList.toggle('show');
        });
        
        return newTrigger;
      }
      return null;
    }

    // Notifications Dropdown Toggle
    const notificationsTrigger = document.getElementById('notifications-trigger');
    const notificationsDropdown = document.getElementById('notifications-dropdown');
    const notificationsCloseBtn = notificationsDropdown?.querySelector('.close-btn');
    const notificationTabs = notificationsDropdown?.querySelectorAll('.notification-tab');
    const newNotificationTabs = [];

    function setupNotificationsDropdown() {
      if (notificationsTrigger && notificationsDropdown && notificationsTrigger.parentNode) {
        // إزالة أي مستمعي أحداث سابقين لمنع التكرار
        const newTrigger = notificationsTrigger.cloneNode(true);
        notificationsTrigger.parentNode.replaceChild(newTrigger, notificationsTrigger);
        
        newTrigger.addEventListener('click', (e) => {
          e.stopPropagation();
          notificationsDropdown.classList.toggle('show');
        });

        // Close button functionality
        if (notificationsCloseBtn && notificationsCloseBtn.parentNode) {
          const newCloseBtn = notificationsCloseBtn.cloneNode(true);
          notificationsCloseBtn.parentNode.replaceChild(newCloseBtn, notificationsCloseBtn);
          
          newCloseBtn.addEventListener('click', () => {
            notificationsDropdown.classList.remove('show');
          });
        }

        // Tab switching functionality
        notificationTabs?.forEach(tab => {
          if (tab && tab.parentNode) {
            const newTab = tab.cloneNode(true);
            tab.parentNode.replaceChild(newTab, tab);
            newNotificationTabs.push(newTab);
            
            newTab.addEventListener('click', () => {
              const targetTab = newTab.getAttribute('data-tab');
              
              // Update active tab
              newNotificationTabs.forEach(t => {
                if (t) {
                  t.classList.remove('active');
                }
              });
              newTab.classList.add('active');
              
              // Update content with animation
              const contents = notificationsDropdown.querySelectorAll('.tab-content');
              contents.forEach(content => {
                if (content) {
                  if (content.getAttribute('data-content') === targetTab) {
                    content.classList.add('active');
                  } else {
                    content.classList.remove('active');
                  }
                }
              });
            });
          }
        });
        
        return newTrigger;
      }
      return null;
    }

    // Close dropdowns when clicking outside
    const handleOutsideClick = (e) => {
      if (accountDropdown && !accountDropdown.contains(e.target) && !accountTrigger?.contains(e.target)) {
        accountDropdown.classList.remove('show');
      }
      if (headerDropdown && !headerDropdown.contains(e.target) && !headerProfile?.contains(e.target)) {
        headerDropdown.classList.remove('show');
      }
      if (notificationsDropdown && !notificationsDropdown.contains(e.target) && !notificationsTrigger?.contains(e.target)) {
        notificationsDropdown.classList.remove('show');
      }
    };
    
    // إضافة مستمع حدث واحد للنقر خارج القوائم المنسدلة
    document.addEventListener('click', handleOutsideClick);

    // إعداد القوائم المنسدلة
    const newAccountTrigger = setupDropdown(accountTrigger, accountDropdown);
    
    // إعداد قائمة الملف الشخصي في الهيدر بشكل منفصل
    if (headerProfile && headerDropdown) {
      // إضافة مستمع حدث مباشرة على العنصر الأصلي
      headerProfile.addEventListener('click', (e) => {
          console.log("headerProfile");
        // e.stopPropagation(); don't stop the propagation of the event to avoid the dropdown buttons to be clicked
        headerDropdown.classList.toggle('show');
      });
    }
    
    const newNotificationsTrigger = setupNotificationsDropdown();

    // Handle progress animation for assignment cards
    document.querySelectorAll('.assignment-card[data-progress]').forEach(card => {
      if (card) {
        card.style.setProperty('--data-progress', card.dataset.progress);
      }
    }); 

    // Handle progress animation for quiz cards
    document.querySelectorAll('.quiz-card[data-progress]').forEach(card => {
      if (card) {
        card.style.setProperty('--data-progress', card.dataset.progress);
      }
    }); 

    // Cleanup function to remove event listeners when component unmounts
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      // Add other cleanup code as needed
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return null; // This component doesn't render anything
}