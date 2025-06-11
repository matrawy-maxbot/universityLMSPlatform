"use client";

import { useEffect } from 'react';
import { initAnnouncements } from './script';
import './styles.css';

export default function AnnouncementsClient() {
  useEffect(() => {
    // مسح سجل الإعلانات المعروضة عند كل تحميل للصفحة للتأكد من ظهورها دائمًا
    try {
      localStorage.removeItem('lastAnnouncementShown');
    } catch (e) {
      console.error("خطأ في مسح سجل الإعلانات:", e);
    }

    // تشغيل الإعلانات فورًا
    initAnnouncements();
  }, []);

  // هذا المكون لا يعرض أي شيء، فقط يقوم بتهيئة الإعلانات
  return null;
} 