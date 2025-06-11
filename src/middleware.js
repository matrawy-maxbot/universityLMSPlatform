import { NextResponse } from 'next/server';

// تعريف المسارات العامة التي لا تتطلب مصادقة
const publicPaths = ['/login', '/register', '/forgot-password'];

// تعريف المسارات المسموح بها لكل نوع مستخدم
const authorizedPaths = {
  0: ['/students'], // الطلاب
  1: ['/teachers/assistants'], // المساعدين
  2: ['/teachers/doctors'], // الدكاترة
  3: ['/admins'], // المسؤولين
  4: ['/teachers/doctors'] // نوع إضافي (قد يكون رئيس قسم مثلاً)
};

// التحقق من تصريح المستخدم للوصول إلى المسار
function isAuthorized(userType, path) {
  // المسارات العامة متاحة للجميع
  if (publicPaths.some(publicPath => path.startsWith(publicPath))) {
    return true;
  }
  
  // التحقق من الصفحة الرئيسية
  if (path === '/') {
    return true;
  }
  
  // التحقق إذا كان المستخدم غير معرّف أو نوعه غير موجود
  if (userType === undefined || !authorizedPaths[userType]) {
    return false;
  }
  
  // التحقق ما إذا كان المسار الحالي يبدأ بأحد المسارات المصرح بها لنوع المستخدم
  return authorizedPaths[userType].some(authorizedPath => path.startsWith(authorizedPath));
}

// توجيه المستخدم للصفحة المناسبة حسب نوع الحساب
function getUserHomePage(userType) {
  switch (parseInt(userType)) {
    case 0:
      return '/students/scheduling';
    case 1:
      return '/teachers/assistants/scheduling';
    case 2:
      return '/teachers/doctors/scheduling';
    case 3:
      return '/admins/statics';
    case 4:
      return '/teachers/doctors/scheduling';
    default:
      return '/login';
  }
}

// بيانات المستخدمين المحلية للاختبار
const mockUsers = [
  // Admin
  {
    id: "20217875",
    type: 3,
    email: "ali.elgendy@example.com",
    firstname: "ali",
    lastname: "elgendy"
  },
  {
    id: "A001",
    type: 3,
    email: "admin1@university.edu",
    firstname: "أحمد",
    lastname: "عبد الرحمن"
  },
  // Doctor
  {
    id: "D001",
    type: 2,
    email: "doctor1@university.edu",
    firstname: "khalid",
    lastname: "ahmed"
  },
  {
    id: "D002",
    type: 2,
    email: "doctor2@university.edu",
    firstname: "فاطمة",
    lastname: "عبد العزيز"
  },
  // Department head (doctor admin)
  {
    id: "DA001",
    type: 4,
    email: "doctor_admin@university.edu",
    firstname: "حسام",
    lastname: "الدسوقي"
  },
  // Assistant
  {
    id: "AS001",
    type: 1,
    email: "assistant1@university.edu",
    firstname: "محمد",
    lastname: "إبراهيم"
  },
  {
    id: "AS002",
    type: 1,
    email: "assistant2@university.edu",
    firstname: "نورا",
    lastname: "عبد الحميد"
  },
  // Students
  {
    id: "S001",
    type: 0,
    email: "student1@university.edu",
    firstname: "مصطفى",
    lastname: "خالد"
  },
  {
    id: "S008",
    type: 0,
    email: "student8@university.edu",
    firstname: "آية",
    lastname: "إبراهيم"
  },
  {
    id: "28782577",
    type: 0,
    email: "trrhrhrt@gmail.com",
    firstname: "dfgethtrhtr",
    lastname: "rbrtbrttr"
  },
  {
    id: "652245",
    type: 0,
    email: "sdfdhd@gmail.com",
    firstname: "riyadh",
    lastname: "fares"
  }
];

// التحقق من صحة التوكن واسترداد معلومات المستخدم من الخادم
async function verifyToken(token) {
  try {
    // التحقق من أن التوكن موجود وصالح (افتراضياً)
    if (!token || !token.startsWith('mock_token_')) {
      return { success: false };
    }

    // استخراج معرف المستخدم من التوكن
    const userId = token.split('_')[3];
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      return { success: false };
    }

    // إرجاع بيانات المستخدم
    return { 
      success: true, 
      user: user
    };
  } catch (error) {
    console.error('Token verification error in middleware:', error);
    return { success: false };
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // تجاهل التحقق لملفات API و_next وملفات الصور
  if (
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') || 
    pathname.includes('.') ||
    pathname.startsWith('/images')
  ) {
    return NextResponse.next();
  }

  // تحقق من وجود كوكي يشير إلى عملية تسجيل الدخول الجارية لتجنب حلقة إعادة التوجيه
  const redirectingFlag = request.cookies.get('auth_redirecting')?.value;
  if (redirectingFlag === 'true') {
    return NextResponse.next();
  }

  // تجاهل التحقق للمسارات العامة
  if (publicPaths.some(path => pathname.startsWith(path))) {
    // التحقق من وجود توكن، إذا كان موجودًا وفي صفحة عامة مثل login
    // قم بتوجيه المستخدم للصفحة المناسبة
    const authToken = request.cookies.get('access_token')?.value;
    
    if (authToken) {
      // التحقق من صحة التوكن واسترداد معلومات المستخدم
      const verificationResult = await verifyToken(authToken);
      
      if (verificationResult.success && verificationResult.user) {
        const userType = verificationResult.user.type;
        const userHomePage = getUserHomePage(userType);
        
        const url = request.nextUrl.clone();
        url.pathname = userHomePage;
        
        // وضع علامة تشير إلى أن إعادة التوجيه قيد التنفيذ
        const response = NextResponse.redirect(url);
        // تعيين كوكي مؤقت لتجنب حلقة إعادة التوجيه
        response.cookies.set('auth_redirecting', 'true', {
          maxAge: 10, // 10 ثوان فقط
          path: '/',
        });
        
        // تحديث كوكي نوع المستخدم
        response.cookies.set('user_type', userType.toString(), {
          maxAge: 30 * 24 * 60 * 60, // 30 يوم
          path: '/',
        });
        
        return response;
      } else {
        // إذا كان التوكن غير صالح، حذفه من الكوكيز
        const response = NextResponse.next();
        response.cookies.delete('access_token');
        response.cookies.delete('refresh_token');
        response.cookies.delete('user_type');
        return response;
      }
    }
    return NextResponse.next();
  }

  // التحقق من وجود التوكن
  const authToken = request.cookies.get('access_token')?.value;
  if (!authToken) {
    // إعادة توجيه إلى صفحة تسجيل الدخول
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    
    // وضع علامة تشير إلى أن إعادة التوجيه قيد التنفيذ
    const response = NextResponse.redirect(url);
    response.cookies.set('auth_redirecting', 'true', {
      maxAge: 10, // 10 ثوان فقط
      path: '/',
    });
    
    return response;
  }

  // التحقق من صحة التوكن واسترداد معلومات المستخدم
  const verificationResult = await verifyToken(authToken);
  
  if (!verificationResult.success || !verificationResult.user) {
    // إذا كان التوكن غير صالح، حذفه من الكوكيز وإعادة التوجيه إلى صفحة تسجيل الدخول
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    
    const response = NextResponse.redirect(url);
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    response.cookies.delete('user_type');
    
    // وضع علامة تشير إلى أن إعادة التوجيه قيد التنفيذ
    response.cookies.set('auth_redirecting', 'true', {
      maxAge: 10, // 10 ثوان فقط
      path: '/',
    });
    
    return response;
  }

  // التحقق من تصريحات المستخدم للوصول إلى المسار الحالي
  const userType = verificationResult.user.type;
  if (!isAuthorized(userType, pathname)) {
    // إعادة توجيه إلى الصفحة المناسبة لنوع المستخدم
    const userHomePage = getUserHomePage(userType);
    const url = request.nextUrl.clone();
    url.pathname = userHomePage;
    
    // وضع علامة تشير إلى أن إعادة التوجيه قيد التنفيذ
    const response = NextResponse.redirect(url);
    response.cookies.set('auth_redirecting', 'true', {
      maxAge: 10, // 10 ثوان فقط
      path: '/',
    });
    
    // تحديث كوكي نوع المستخدم
    response.cookies.set('user_type', userType.toString(), {
      maxAge: 30 * 24 * 60 * 60, // 30 يوم
      path: '/',
    });
    
    return response;
  }
  
  // تحديث كوكي نوع المستخدم في كل مرة
  const response = NextResponse.next();
  response.cookies.set('user_type', userType.toString(), {
    maxAge: 30 * 24 * 60 * 60, // 30 يوم
    path: '/',
  });
  
  return response;
}

// تكوين المسارات التي يعمل عليها middleware
export const config = {
  matcher: [
    /*
     * المطابقة مع كل المسارات ما عدا:
     * 1. /api (API روابط)
     * 2. /_next (ملفات Next.js الداخلية)
     * 3. /_static (الملفات الثابتة إذا تم تكوينها)
     * 4. /images (مجلد الصور)
     * 5. أي ملفات مثل فافيكون.أيكو وروبوتس.تكست وما إلى ذلك
     */
    '/((?!api|_next|_static|images|.*\\.).*)',
  ],
}; 