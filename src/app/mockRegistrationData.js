/**
 * Mock Registration Data
 * بيانات افتراضية للتسجيل الأكاديمي
 */

// بيانات معلومات الطالب للتسجيل
export const mockStudentRegistrationInfo = {
  student: {
    id: "S001",
    firstname: "مصطفى",
    secondname: "أحمد",
    thirdname: "محمد",
    lastname: "خالد",
    email: "student1@university.edu",
    registerationaccess: true,
    maxhours: 144
  },
  level: {
    id: 1,
    level: 1,
    levelhours: 36,
    User: {
      id: "D001",
      firstname: "خالد",
      secondname: "محمود",
      thirdname: "السيد",
      lastname: "أحمد",
      email: "doctor1@university.edu"
    }
  },
  currentSemester: {
    id: 1,
    semester: "Fall",
    semesterstartyear: 2023,
    semesterendyear: 2024,
    semesterstartdate: "2023-09-01",
    semesterenddate: "2024-01-15"
  },
  passedHours: 36,
  advisor: {
    id: "D001",
    firstname: "خالد",
    secondname: "محمود",
    thirdname: "السيد",
    lastname: "أحمد",
    email: "doctor1@university.edu"
  }
};

// إعدادات التسجيل الأكاديمي
export const mockRegistrationSettings = {
  id: 1,
  open: true,
  minhours: 12,
  maxhours: 18,
  startdate: "2023-08-15",
  enddate: "2023-08-30",
  semesterid: 1
};

// المقررات المتاحة للتسجيل
export const mockAvailableCourses = [
  {
    id: "CS201",
    coursecode: "CS201",
    coursename: "Data Structures",
    coursehours: 3,
    department: "CS",
    description: "Implementation and analysis of fundamental data structures",
    instructor: "Dr. Khalid Ahmed",
    instructor_id: "D001"
  },
  {
    id: "CS202",
    coursecode: "CS202",
    coursename: "Computer Architecture",
    coursehours: 3,
    department: "CS",
    description: "Study of computer organization and architecture",
    instructor: "Dr. Fatima Ali",
    instructor_id: "D002"
  },
  {
    id: "MATH201",
    coursecode: "MATH201",
    coursename: "Discrete Mathematics",
    coursehours: 3,
    department: "MATH",
    description: "Study of mathematical structures that are fundamentally discrete",
    instructor: "Dr. Fatima Ali",
    instructor_id: "D002"
  },
  {
    id: "STAT201",
    coursecode: "STAT201",
    coursename: "Probability & Statistics",
    coursehours: 3,
    department: "MATH",
    description: "Introduction to probability theory and statistical analysis",
    instructor: "Dr. Hussam El-Desouky",
    instructor_id: "DA001"
  }
];

// المقررات المسجلة بالفعل في الفصل الدراسي الحالي
export const mockRegisteredCourses = [
  {
    id: 1,
    userId: "S001",
    courseid: "CS101",
    confirm: true,
    createdAt: "2023-08-16T10:30:00.000Z",
    updatedAt: "2023-08-16T10:30:00.000Z",
    Course: {
      id: "CS101",
      coursecode: "CS101",
      coursename: "Introduction to Computer Science",
      coursehours: 3,
      department: "CS",
      description: "An introduction to the basic concepts of computer science"
    }
  },
  {
    id: 2,
    userId: "S001",
    courseid: "CS102",
    confirm: true,
    createdAt: "2023-08-16T10:35:00.000Z",
    updatedAt: "2023-08-16T10:35:00.000Z",
    Course: {
      id: "CS102",
      coursecode: "CS102",
      coursename: "Programming Fundamentals",
      coursehours: 3,
      department: "CS",
      description: "An introduction to programming using Python"
    }
  },
  {
    id: 3,
    userId: "S001",
    courseid: "MATH101",
    confirm: true,
    createdAt: "2023-08-16T10:40:00.000Z",
    updatedAt: "2023-08-16T10:40:00.000Z",
    Course: {
      id: "MATH101",
      coursecode: "MATH101",
      coursename: "Calculus I",
      coursehours: 4,
      department: "MATH",
      description: "Introduction to differential and integral calculus"
    }
  }
];

// دوال الواجهة المزيفة (mock API)

// دالة للحصول على معلومات التسجيل للطالب
export const getMockStudentRegistrationInfo = async (studentId) => {
  // إضافة تأخير لمحاكاة طلب الشبكة
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    success: true,
    data: mockStudentRegistrationInfo
  };
};

// دالة للحصول على إعدادات التسجيل
export const getMockRegistrationSettings = async () => {
  // إضافة تأخير لمحاكاة طلب الشبكة
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    data: mockRegistrationSettings
  };
};

// دالة للحصول على المقررات المتاحة للتسجيل
export const getMockAvailableCourses = async () => {
  // إضافة تأخير لمحاكاة طلب الشبكة
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    data: mockAvailableCourses
  };
};

// دالة للحصول على المقررات المسجلة بالفعل
export const getMockRegisteredCourses = async (semesterId) => {
  // إضافة تأخير لمحاكاة طلب الشبكة
  await new Promise(resolve => setTimeout(resolve, 700));
  
  return {
    success: true,
    data: mockRegisteredCourses
  };
};

// دالة لتسجيل مقرر جديد
export const registerMockCourse = async (courseData) => {
  // إضافة تأخير لمحاكاة طلب الشبكة
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // يمكن هنا إضافة المقرر إلى المقررات المسجلة
  const newRegistration = {
    id: mockRegisteredCourses.length + 1,
    userId: "S001",
    courseid: courseData.courseId,
    confirm: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    Course: mockAvailableCourses.find(course => course.id === courseData.courseId)
  };
  
  // للتطبيق الحقيقي يمكنك إضافة المقرر إلى القائمة
  // mockRegisteredCourses.push(newRegistration);
  
  return {
    success: true,
    data: newRegistration
  };
};

// دالة لإلغاء تسجيل مقرر
export const unregisterMockCourse = async (registrationId) => {
  // إضافة تأخير لمحاكاة طلب الشبكة
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // للتطبيق الحقيقي يمكنك حذف المقرر من القائمة
  // mockRegisteredCourses = mockRegisteredCourses.filter(reg => reg.id !== registrationId);
  
  return {
    success: true,
    message: "Course unregistered successfully"
  };
}; 