'use client';

import Image from 'next/image';
import './styles/page.css';

export default function Auditlog() {
  return (
     <div className="audit-container">
          <div className="audit-header">
               <div className="audit-title-section">
                    <svg className="audit-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                         <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                         <line x1="16" y1="2" x2="16" y2="6"></line>
                         <line x1="8" y1="2" x2="8" y2="6"></line>
                         <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <h1 className="page-title">Audit Logs</h1>
               </div>
               <div className="view-toggle">
                    <div className="audit-filters">
                         <div className="custom-filter-dropdown">
                              <button className="custom-filter-trigger">
                              <svg className="custom-filter-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#e0e7ff"/><path d="M8 12l2 2 4-4" stroke="#6366f1" strokeWidth="2" fill="none"/></svg>
                              <span>Filters</span>
                              <svg className="custom-filter-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" fill="none" stroke="#6366f1" strokeWidth="2"/></svg>
                              </button>
                              <div className="custom-filter-menu">
                              <div className="custom-filter-section">
                                   <span className="custom-filter-title">Status</span>
                                   <label className="custom-checkbox">
                                   <input type="checkbox" />
                                   <span className="checkmark"></span>
                                   Success
                                   </label>
                                   <label className="custom-checkbox">
                                   <input type="checkbox" />
                                   <span className="checkmark"></span>
                                   Error
                                   </label>
                              </div>
                              <div className="custom-filter-section">
                                   <span className="custom-filter-title">Date</span>
                                   <label className="custom-radio">
                                   <input type="radio" name="date" />
                                   <span className="radiomark"></span>
                                   All Time
                                   </label>
                                   <label className="custom-radio">
                                   <input type="radio" name="date" />
                                   <span className="radiomark"></span>
                                   Last 24 Hours
                                   </label>
                                   <label className="custom-radio">
                                   <input type="radio" name="date" />
                                   <span className="radiomark"></span>
                                   Last 7 Days
                                   </label>
                              </div>
                              <button className="custom-filter-apply">Apply</button>
                              </div>
                         </div>
                         <div className="custom-sort-dropdown">
                              <button className="custom-sort-trigger">
                              <svg className="custom-sort-icon" viewBox="0 0 24 24">
                                   <rect x="6" y="4" width="12" height="2" rx="1" fill="#60a5fa"/>
                                   <rect x="6" y="11" width="8" height="2" rx="1" fill="#2563eb"/>
                                   <rect x="6" y="18" width="4" height="2" rx="1" fill="#1e40af"/>
                              </svg>
                              <span>Sort</span>
                              <svg className="custom-sort-arrow" viewBox="0 0 24 24">
                                   <polyline points="6 9 12 15 18 9" fill="none" stroke="#2563eb" strokeWidth="2"/>
                              </svg>
                              </button>
                              <div className="custom-sort-menu">
                              <div className="custom-sort-section">
                                   <span className="custom-sort-title">Sort by</span>
                                   <label className="custom-radio">
                                   <input type="radio" name="sort" />
                                   <span className="radiomark"></span>
                                   Newest First
                                   </label>
                                   <label className="custom-radio">
                                   <input type="radio" name="sort" />
                                   <span className="radiomark"></span>
                                   Oldest First
                                   </label>
                                   <label className="custom-radio">
                                   <input type="radio" name="sort" />
                                   <span className="radiomark"></span>
                                   Status (Success First)
                                   </label>
                                   <label className="custom-radio">
                                   <input type="radio" name="sort" />
                                   <span className="radiomark"></span>
                                   Status (Error First)
                                   </label>
                              </div>
                              <button className="custom-sort-apply">Apply</button>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
          
          <div className="audit-logs">
               {/* Log Item - Success */}
               <div className="log-item">
                    <div className="log-status success">
                         <svg className="status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                         </svg>
                    </div>
                    <div className="log-content">
                         <div className="log-message">
                              Lorem ipsum dolor sit amet, consectetuer adipiscing elit
                         </div>
                         <div className="log-meta">
                              <Image src="/images/shadcn.jpg" alt="DR. Ahmed Emad" className="user-avatar" width={40} height={40} />
                              <span className="log-author">DR. Ahmed Emad</span>
                              <span className="log-dot">•</span>
                              <span className="log-date">24/5/2025 11:20 PM</span>
                         </div>
                    </div>
               </div>
               
               {/* Log Item - Error */}
               <div className="log-item">
                    <div className="log-status error">
                         <svg className="status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="15" y1="9" x2="9" y2="15"></line>
                              <line x1="9" y1="9" x2="15" y2="15"></line>
                         </svg>
                    </div>
                    <div className="log-content">
                         <div className="log-message">
                              Lorem ipsum dolor sit amet, consectetuer adipiscing elit
                         </div>
                         <div className="log-meta">
                              <Image src="/images/shadcn.jpg" alt="DR. Ahmed Emad" className="user-avatar" width={40} height={40} />
                              <span className="log-author">DR. Ahmed Emad</span>
                              <span className="log-dot">•</span>
                              <span className="log-date">24/5/2025 11:20 PM</span>
                         </div>
                    </div>
               </div>
               
               {/* Log Item - Success */}
               <div className="log-item">
                    <div className="log-status success">
                         <svg className="status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                         </svg>
                    </div>
                    <div className="log-content">
                         <div className="log-message">
                              Lorem ipsum dolor sit amet, consectetuer adipiscing elit
                         </div>
                         <div className="log-meta">
                              <Image src="/images/shadcn.jpg" alt="DR. Ahmed Emad" className="user-avatar" width={40} height={40} />
                              <span className="log-author">DR. Ahmed Emad</span>
                              <span className="log-dot">•</span>
                              <span className="log-date">24/5/2025 11:20 PM</span>
                         </div>
                    </div>
               </div>
               
               {/* Log Item - Error */}
               <div className="log-item">
                    <div className="log-status error">
                         <svg className="status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="15" y1="9" x2="9" y2="15"></line>
                              <line x1="9" y1="9" x2="15" y2="15"></line>
                         </svg>
                    </div>
                    <div className="log-content">
                         <div className="log-message">
                              Lorem ipsum dolor sit amet, consectetuer adipiscing elit
                         </div>
                         <div className="log-meta">
                              <Image src="/images/shadcn.jpg" alt="DR. Ahmed Emad" className="user-avatar" width={40} height={40} />
                              <span className="log-author">DR. Ahmed Emad</span>
                              <span className="log-dot">•</span>
                              <span className="log-date">24/5/2025 11:20 PM</span>
                         </div>
                    </div>
               </div>
          </div>
     </div>
  );
}