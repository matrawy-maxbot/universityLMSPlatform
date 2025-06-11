"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { announcements } from './script';
import './styles.css';

export default function AnnouncementsPage() {
  const router = useRouter();
  const [announcementsList, setAnnouncementsList] = useState([]);
  
  useEffect(() => {
    // استخدام بيانات الإعلانات من ملف السكريبت
    setAnnouncementsList(announcements);
  }, []);

  return (
    <div className="announcements-page">
      <h1>إدارة الإعلانات</h1>
      <p>هنا يمكن للمسؤولين إدارة الإعلانات التي تظهر للمستخدمين</p>
      
      {/* هذه الصفحة ستكون متاحة فقط للإدارة لإضافة/تعديل الإعلانات */}
      <div className="announcements-list">
        {announcementsList.map(announcement => (
          <div key={announcement.id} className="announcement-item">
            <h3>{announcement.title}</h3>
            <p>{announcement.description}</p>
            <img 
              src={announcement.imageUrl} 
              alt={announcement.title}
              style={{ maxWidth: '300px' }}
            />
            <p>تاريخ النشر: {announcement.publishDate}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 