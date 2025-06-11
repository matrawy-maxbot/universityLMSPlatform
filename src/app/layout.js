import "@/app/globals.css";
import SidebarScript from "@/components/SidebarScript";
import Image from 'next/image';
import InteractiveSidebar from '@/components/InteractiveSidebar';
import NavHandler from '@/components/NavHandler';
import NavTabs from '@/components/NavTabs';
import HeaderDropdownMenu from '@/components/HeaderDropdownMenu';
import AnnouncementsClient from '@/app/announcements/client';

export const metadata = {
  title: "Digital Collage Platform",
  description: "Digital Collage Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
      </head>
      <body>
          <div className="group/sidebar-wrapper" style={{ "--sidebar-width": "16rem", "--sidebar-width-icon": "3rem" }}>
              <InteractiveSidebar />
              <NavHandler />
              
              <main className="main-content">
                  {/* Breadcrumb Navigation */}
                  <nav className="breadcrumb-nav">
                      <div className="breadcrumb-nav-inner">
                          <button className="sidebar-toggle" aria-label="Toggle Sidebar">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                                  <line x1="9" y1="3" x2="9" y2="21"></line>
                              </svg>
                          </button>
                          <a href="#">Student</a>
                          <span className="breadcrumb-separator">›</span>
                          <span className="current">Courses</span>
                      </div>
                      <NavTabs />
                      <div className="nav-controls">
                          <div className="right-controls">
                              <button className="theme-toggle">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" id="Layer_2" data-name="Layer 2" viewBox="0 0 29 29">
                                      <g id="Layer_1-2" data-name="Layer 1">
                                          <path className="cls-1" d="M14.5.5c-3.87,3.87-3.87,10.13,0,14,3.87,3.87,10.13,3.87,14,0,0,7.73-6.27,14-14,14S.5,22.23.5,14.5,6.77.5,14.5.5Z"/>
                                      </g>
                                  </svg>
                              </button>
                              <div className="notifications-wrapper">
                                  <button className="notifications filled" id="notifications-trigger">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" id="Layer_2" data-name="Layer 2" viewBox="0 0 31.5 34.84" style={{ strokeWidth: "2.5px" }}>
                                          <g id="Layer_1-2" data-name="Layer 1">
                                              <g>
                                                  <path className="cls-1" d="M5.75,10.75C5.75,5.23,10.23.75,15.75.75s10,4.48,10,10c0,11.67,5,15,5,15H.75s5-3.33,5-15"/>
                                                  <path className="cls-1" d="M12.92,32.42c.86,1.56,2.83,2.14,4.39,1.28.54-.3.98-.74,1.28-1.28"/>
                                              </g>
                                          </g>
                                      </svg>
                                      <span className="notification-badge">3</span>
                                  </button>
                                  <div className="notifications-dropdown" id="notifications-dropdown">
                                      <div className="notifications-header">
                                          <h3>Notification</h3>
                                          <button className="close-btn">
                                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
                                                  <path d="M18 6L6 18M6 6l12 12"/>
                                              </svg>
                                          </button>
                                      </div>
                                      <div className="notifications-tabs">
                                          <button className="notification-tab filled active" data-tab="general">General<span className="count">2</span></button>
                                          <button className="notification-tab" data-tab="teams">Teams<span className="count">1</span></button>
                                          <button className="notification-tab" data-tab="documents">Documents<span className="count">3</span></button>
                                      </div>
                                      <div className="notifications-content">
                                          <div className="tab-content active" data-content="general">
                                              <div className="notification-list">
                                                  <div className="notification-item">
                                                      <div className="avatar-wrapper unread">
                                                          <Image 
                                                            src="/images/shadcn.jpg" 
                                                            alt="User" 
                                                            width={40} 
                                                            height={40}
                                                            className="user-avatar" 
                                                          />
                                                          <span className="unread-badge"></span>
                                                      </div>
                                                      <div className="notification-info">
                                                          <p><strong>Sulastri Silami</strong> requests permission to change <strong>Project - Nganter App</strong></p>
                                                          <span className="meta">Project • 5 min ago</span>
                                                      </div>
                                                  </div>
                                                  <div className="notification-item">
                                                      <div className="avatar-wrapper">
                                                          <Image 
                                                            src="/images/shadcn.jpg" 
                                                            alt="User" 
                                                            width={40} 
                                                            height={40}
                                                            className="user-avatar" 
                                                          />
                                                          <span className="unread-badge"></span>
                                                      </div>
                                                      <div className="notification-info">
                                                          <p><strong>Michael Dandi</strong> requests permission to change <strong>Project - Andromeda Website</strong></p>
                                                          <span className="meta">Project • 21 min ago</span>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                          <div className="tab-content" data-content="teams">
                                              <div className="notification-list">
                                                  <div className="notification-item">
                                                      <div className="avatar-wrapper unread">
                                                          <Image 
                                                            src="/images/shadcn.jpg" 
                                                            alt="User" 
                                                            width={40} 
                                                            height={40}
                                                            className="user-avatar" 
                                                          />
                                                          <span className="unread-badge"></span>
                                                      </div>
                                                      <div className="notification-info">
                                                          <p><strong>Team Alpha</strong> has added you as a member</p>
                                                          <span className="meta">Teams • 1 hour ago</span>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                          <div className="tab-content" data-content="documents">
                                              <div className="notification-list">
                                                  <div className="no-notifications">
                                                      <p>There is no notifications yet</p>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                              <div className="profile" id="header-profile">
                                  <Image 
                                    src="/images/shadcn.jpg" 
                                    alt="Profile" 
                                    width={40} 
                                    height={40}
                                    className="profile-img" 
                                  />
                                  <div className="nav-dropdown" id="header-dropdown">
                                      <HeaderDropdownMenu />
                                  </div>
                              </div>
                          </div>
                      </div>
                  </nav>

                  {/* Content Area */}
                  <div className="content">
                      {children}
                  </div>
              </main>
          </div>
          
          {/* إضافة مكون SidebarScript هنا */}
          <SidebarScript />
          
          {/* مكون الإعلانات */}
          <AnnouncementsClient />
      </body>
    </html>
  );
}
