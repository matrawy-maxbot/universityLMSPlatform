"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { verifyToken, checkAuthorization } from '@/app/login/components/script';

export default function AuthCheck() {
  const [isLoading, setIsLoading] = useState(true);
  const currentPath = usePathname();
  const router = useRouter();

  useEffect(() => {
    // تجاهل التحقق في صفحة تسجيل الدخول
    if (currentPath === '/login') {
      setIsLoading(false);
      return;
    }

    // التحقق من علامة auth_checked لمنع التحقق المتكرر
    const authChecked = sessionStorage.getItem('auth_checked');
    if (authChecked === 'true' && currentPath === '/login') {
      setIsLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        // الحصول على التوكن من localStorage
        const token = localStorage.getItem('token');
        
        // إذا لم يوجد توكن، التوجه لصفحة تسجيل الدخول
        if (!token) {
          // وضع علامة لمنع التحقق المتكرر
          sessionStorage.setItem('auth_checked', 'true');
          // تجنب التوجيه إذا كنا بالفعل في صفحة تسجيل الدخول
          if (currentPath !== '/login') {
            router.push('/login');
          }
          setIsLoading(false);
          return;
        }

        // التحقق من صلاحية التوكن
        const result = await verifyToken(token);
        
        // إذا فشل التحقق من التوكن، التوجه لصفحة تسجيل الدخول
        if (!result.success || !result.data || !result.data.user) {
          // إزالة بيانات الجلسة غير الصالحة
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // وضع علامة لمنع التحقق المتكرر
          sessionStorage.setItem('auth_checked', 'true');
          // تجنب التوجيه إذا كنا بالفعل في صفحة تسجيل الدخول
          if (currentPath !== '/login') {
            router.push('/login');
          }
          setIsLoading(false);
          return;
        }

        const userType = result.data.user.type;
        
        // التحقق مما إذا كان المستخدم مصرح له بالوصول إلى المسار الحالي
        const isAuthorized = checkAuthorization(userType, currentPath);
        
        if (!isAuthorized) {
          // إعادة توجيه المستخدم إلى الصفحة المناسبة له
          switch (parseInt(userType)) {
            case 0:
              router.push('/students/scheduling');
              break;
            case 1:
              router.push('/teachers/assistants/scheduling');
              break;
            case 2:
              router.push('/teachers/doctors/scheduling');
              break;
            case 3:
              router.push('/admins/statics');
              break;
            case 4:
              router.push('/teachers/doctors/scheduling');
              break;
            default:
              router.push('/404');
          }
          return;
        }

        // تحديث بيانات المستخدم في localStorage
        localStorage.setItem('user', JSON.stringify(result.data.user));
        // وضع علامة لمنع التحقق المتكرر
        sessionStorage.setItem('auth_checked', 'true');
      } catch (error) {
        console.error('Authentication check failed:', error);
        // في حالة حدوث خطأ، التوجه لصفحة تسجيل الدخول
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // وضع علامة لمنع التحقق المتكرر
        sessionStorage.setItem('auth_checked', 'true');
        // تجنب التوجيه إذا كنا بالفعل في صفحة تسجيل الدخول
        if (currentPath !== '/login') {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [currentPath, router]);

  // هذا المكون لا يعرض أي شيء، فقط يتحقق من المصادقة
  return null;
} 