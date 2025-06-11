/**
 * Course Data Mock Utilities
 * Contains courses, registration settings, and course registrations data
 */

// Courses data from the database
export const mockCourses = [
  {
    id: "ARCH201",
    coursecode: "ARCH201",
    coursename: "تصميم معماري متقدم",
    coursehours: 5,
    group: "العمارة",
    level: 2,
    requirement: "ARCH101",
    instructorid: "D025",
    doctors: "{D002}",
    assistants: "{AS006}",
    semestername: "fall",
    precoursespassed: "{ARCH101}",
    defaultmaxpoints: 300,
    specificmaxpoints: "[]",
    createdAt: "2025-05-29 10:57:31.809+00",
    updatedAt: "2025-05-29 10:57:31.809+00"
  },
  {
    id: "ART103",
    coursecode: "ART103",
    coursename: "تاريخ الفن الحديث",
    coursehours: 2,
    group: "الفنون",
    level: 1,
    requirement: "ART101",
    instructorid: "D050",
    doctors: "{D001}",
    assistants: "{AS005}",
    semestername: "spring",
    precoursespassed: "{ART101}",
    defaultmaxpoints: 100,
    specificmaxpoints: "[]",
    createdAt: "2025-05-29 10:58:15.858+00",
    updatedAt: "2025-05-29 10:58:15.858+00"
  },
  {
    id: "BIO202",
    coursecode: "BIO202",
    coursename: "علم الوراثة",
    coursehours: 4,
    group: "الأحياء",
    level: 2,
    requirement: "BIO101",
    instructorid: "D015",
    doctors: "{D002}",
    assistants: "{AS004}",
    semestername: "spring",
    precoursespassed: "{BIO101}",
    defaultmaxpoints: 200,
    specificmaxpoints: "[]",
    createdAt: "2025-05-29 10:57:05.196+00",
    updatedAt: "2025-05-29 10:57:05.196+00"
  },
  {
    id: "BUS101",
    coursecode: "BUS101",
    coursename: "مبادئ الإدارة",
    coursehours: 3,
    group: "إدارة الأعمال",
    level: 1,
    requirement: "",
    instructorid: "D030",
    doctors: "{D001}",
    assistants: "{AS001}",
    semestername: "fall",
    precoursespassed: "{}",
    defaultmaxpoints: 120,
    specificmaxpoints: "[]",
    createdAt: "2025-05-29 10:57:40.466+00",
    updatedAt: "2025-05-29 10:57:40.466+00"
  },
  {
    id: "CHEM102",
    coursecode: "CHEM102",
    coursename: "كيمياء عضوية",
    coursehours: 3,
    group: "الكيمياء",
    level: 1,
    requirement: "CHEM101",
    instructorid: "D008",
    doctors: "{D001}",
    assistants: "{AS003}",
    semestername: "spring",
    precoursespassed: "{CHEM101}",
    defaultmaxpoints: 150,
    specificmaxpoints: "[]",
    createdAt: "2025-05-29 10:56:57.569+00",
    updatedAt: "2025-05-29 10:56:57.569+00"
  },
  {
    id: "CHEM301",
    coursecode: "CHEM301",
    coursename: "كيمياء تحليلية",
    coursehours: 4,
    group: "الكيمياء",
    level: 3,
    requirement: "CHEM201",
    instructorid: "D070",
    doctors: "{DA001}",
    assistants: "{AS004}",
    semestername: "fall",
    precoursespassed: "{CHEM201}",
    defaultmaxpoints: 200,
    specificmaxpoints: "[]",
    createdAt: "2025-05-29 10:58:54.739+00",
    updatedAt: "2025-05-29 10:58:54.739+00"
  },
  {
    id: "CS202",
    coursecode: "CS202",
    coursename: "نظم التشغيل",
    coursehours: 3,
    group: "علوم الحاسب",
    level: 2,
    requirement: "CS103",
    instructorid: "D002",
    doctors: "{D002}",
    assistants: "{AS003}",
    semestername: "fall",
    precoursespassed: "{CS103}",
    defaultmaxpoints: 150,
    specificmaxpoints: "[]",
    createdAt: "2025-05-29 10:56:12.612+00",
    updatedAt: "2025-05-29 10:56:12.612+00"
  },
  {
    id: "CS301",
    coursecode: "CS301",
    coursename: "هندسة البرمجيات",
    coursehours: 4,
    group: "علوم الحاسب",
    level: 3,
    requirement: "CS201",
    instructorid: "D005",
    doctors: "{D001}",
    assistants: "{AS005}",
    semestername: "fall",
    precoursespassed: "{CS201}",
    defaultmaxpoints: 200,
    specificmaxpoints: "[]",
    createdAt: "2025-05-29 10:56:27.967+00",
    updatedAt: "2025-05-29 10:56:27.967+00"
  },
  {
    id: "CS305",
    coursecode: "CS305",
    coursename: "أمن المعلومات",
    coursehours: 4,
    group: "علوم الحاسب",
    level: 3,
    requirement: "CS202",
    instructorid: "D007",
    doctors: "{D002}",
    assistants: "{AS006}",
    semestername: "fall",
    precoursespassed: "{CS202}",
    defaultmaxpoints: 220,
    specificmaxpoints: "[]",
    createdAt: "2025-05-29 10:58:23.56+00",
    updatedAt: "2025-05-29 10:58:23.56+00"
  },
  {
    id: "CS401",
    coursecode: "CS401",
    coursename: "الذكاء الاصطناعي",
    coursehours: 4,
    group: "علوم الحاسب",
    level: 4,
    requirement: "CS301",
    instructorid: "D003",
    doctors: "{D001}",
    assistants: "{AS005}",
    semestername: "fall",
    precoursespassed: "{CS301}",
    defaultmaxpoints: 250,
    specificmaxpoints: "[]",
    createdAt: "2025-05-29 10:57:24.313+00",
    updatedAt: "2025-05-29 10:57:24.313+00"
  },
  {
    id: "CS403",
    coursecode: "CS403",
    coursename: "تعلم الآلة",
    coursehours: 4,
    group: "علوم الحاسب",
    level: 4,
    requirement: "CS401",
    instructorid: "D075",
    doctors: "{D001}",
    assistants: "{AS005}",
    semestername: "spring",
    precoursespassed: "{CS401}",
    defaultmaxpoints: 250,
    specificmaxpoints: "[]",
    createdAt: "2025-05-29 10:59:02.377+00",
    updatedAt: "2025-05-29 10:59:02.377+00"
  },
  {
    id: "cs454",
    coursecode: "cs454",
    coursename: "dfhbfdhfdhddf",
    coursehours: 4,
    group: "",
    level: 1,
    requirement: "optional",
    instructorid: "",
    doctors: "{}",
    assistants: "{AS003,AS002}",
    semestername: "fall",
    precoursespassed: "{IS112}",
    defaultmaxpoints: 150,
    specificmaxpoints: "[]",
    createdAt: "2025-05-30 14:44:58.743+00",
    updatedAt: "2025-05-30 14:45:20.919+00"
  },
  {
    id: "EE201",
    coursecode: "EE201",
    coursename: "دوائر كهربائية",
    coursehours: 4,
    group: "الهندسة الكهربائية",
    level: 2,
    requirement: "PHY201",
    instructorid: "D055",
    doctors: "{DA001}",
    assistants: "{AS001}",
    semestername: "fall",
    precoursespassed: "{PHY201}",
    defaultmaxpoints: 200,
    specificmaxpoints: "[]",
    createdAt: "2025-05-29 10:58:30.984+00",
    updatedAt: "2025-05-29 10:58:30.984+00"
  },
  {
    id: "ENG105",
    coursecode: "ENG105",
    coursename: "كتابة التقارير الفنية",
    coursehours: 2,
    group: "اللغة الإنجليزية",
    level: 1,
    requirement: "",
    instructorid: "D020",
    doctors: "{DA001}",
    assistants: "{AS005}",
    semestername: "fall",
    precoursespassed: "{}",
    defaultmaxpoints: 100,
    specificmaxpoints: "[]",
    createdAt: "2025-05-29 10:57:15.452+00",
    updatedAt: "2025-05-29 10:57:15.452+00"
  },
  {
    id: "LAW301",
    coursecode: "LAW301",
    coursename: "القانون التجاري",
    coursehours: 4,
    group: "القانون",
    level: 3,
    requirement: "LAW201",
    instructorid: "D040",
    doctors: "{D002}",
    assistants: "{AS003}",
    semestername: "fall",
    precoursespassed: "{LAW201}",
    defaultmaxpoints: 200,
    specificmaxpoints: "[]",
    createdAt: "2025-05-29 10:57:58.919+00",
    updatedAt: "2025-05-29 10:57:58.919+00"
  },
  {
    id: "MATH101",
    coursecode: "MATH101",
    coursename: "حساب التفاضل والتكامل",
    coursehours: 4,
    group: "الرياضيات",
    level: 1,
    requirement: "",
    instructorid: "D010",
    doctors: "{D002}",
    assistants: "{AS001}",
    semestername: "fall",
    precoursespassed: "{}",
    defaultmaxpoints: 100,
    specificmaxpoints: "[]",
    createdAt: "2025-05-29 10:56:37.887+00",
    updatedAt: "2025-05-29 10:56:37.887+00"
  },
  {
    id: "MATH202",
    coursecode: "MATH202",
    coursename: "جبر خطي",
    coursehours: 3,
    group: "الرياضيات",
    level: 2,
    requirement: "MATH101",
    instructorid: "D060",
    doctors: "{D001}",
    assistants: "{AS002}",
    semestername: "spring",
    precoursespassed: "{MATH101}",
    defaultmaxpoints: 150,
    specificmaxpoints: "[]",
    createdAt: "2025-05-29 10:58:38.207+00",
    updatedAt: "2025-05-29 10:58:38.207+00"
  },
  {
    id: "MED101",
    coursecode: "MED101",
    coursename: "تشريح جسم الإنسان",
    coursehours: 6,
    group: "الطب",
    level: 1,
    requirement: "",
    instructorid: "D045",
    doctors: "{DA001}",
    assistants: "{AS004}",
    semestername: "fall",
    precoursespassed: "{}",
    defaultmaxpoints: 300,
    specificmaxpoints: "[]",
    createdAt: "2025-05-29 10:58:07.464+00",
    updatedAt: "2025-05-29 10:58:07.464+00"
  },
  {
    id: "PHIL101",
    coursecode: "PHIL101",
    coursename: "مدخل إلى الفلسفة",
    coursehours: 2,
    group: "الفلسفة",
    level: 1,
    requirement: "",
    instructorid: "D065",
    doctors: "{D002}",
    assistants: "{AS003}",
    semestername: "fall",
    precoursespassed: "{}",
    defaultmaxpoints: 100,
    specificmaxpoints: "[]",
    createdAt: "2025-05-29 10:58:46.125+00",
    updatedAt: "2025-05-29 10:58:46.125+00"
  },
  {
    id: "PHY201",
    coursecode: "PHY201",
    coursename: "فيزياء الكهرومغناطيسية",
    coursehours: 3,
    group: "الفيزياء",
    level: 2,
    requirement: "PHY101",
    instructorid: "D012",
    doctors: "{DA001}",
    assistants: "{AS002}",
    semestername: "spring",
    precoursespassed: "{PHY101}",
    defaultmaxpoints: 180,
    specificmaxpoints: "[]",
    createdAt: "2025-05-29 10:56:49.987+00",
    updatedAt: "2025-05-29 10:56:49.987+00"
  },
  {
    id: "PSY202",
    coursecode: "PSY202",
    coursename: "علم النفس الاجتماعي",
    coursehours: 3,
    group: "علم النفس",
    level: 2,
    requirement: "PSY101",
    instructorid: "D035",
    doctors: "{D001}",
    assistants: "{AS002}",
    semestername: "fall",
    precoursespassed: "{PSY101}",
    defaultmaxpoints: 150,
    specificmaxpoints: "[]",
    createdAt: "2025-05-29 10:57:49.19+00",
    updatedAt: "2025-05-29 10:57:49.19+00"
  }
];

// Course registration settings data from the database
export const mockCourseRegistrationSettings = [
  {
    id: 1,
    open: true,
    maxhours: 18,
    minhours: 2,
    gpaconditions: '[{"maxhours": 16, "lowerthan": 2.5}]',
    remainingcoursesids: "{}",
    semesterid: 13,
    specifiedcourses: "{}",
    createdAt: "2025-05-29 16:30:02.914+00",
    updatedAt: "2025-06-01 05:52:58.349+00"
  }
];

// Course registrations data from the database
export const mockCourseRegisters = [
  {
    id: 6,
    studentid: "S008",
    courseid: "MED101",
    semesterid: 14,
    confirm: true,
    createdAt: "2025-06-01 06:41:04.75+00",
    updatedAt: "2025-06-01 06:42:19.802+00",
    isRejected: false,
    rejectionReason: "",
    confirmDate: "2025-06-01 06:42:19.802+00",
    rejectionDate: null
  },
  {
    id: 7,
    studentid: "S008",
    courseid: "BUS101",
    semesterid: 14,
    confirm: true,
    createdAt: "2025-06-01 09:06:45.034+00",
    updatedAt: "2025-06-01 09:07:32.093+00",
    isRejected: false,
    rejectionReason: "",
    confirmDate: "2025-06-01 09:07:32.092+00",
    rejectionDate: null
  },
  {
    id: 23,
    studentid: "S001",
    courseid: "BUS101",
    semesterid: 14,
    confirm: true,
    createdAt: "2025-06-01 09:06:45.034+00",
    updatedAt: "2025-06-01 09:07:32.093+00",
    isRejected: false,
    rejectionReason: "",
    confirmDate: "2025-06-01 09:07:32.092+00",
    rejectionDate: null
  },
  {
    id: 24,
    studentid: "S002",
    courseid: "BUS101",
    semesterid: 14,
    confirm: true,
    createdAt: "2025-06-01 09:06:45.034+00",
    updatedAt: "2025-06-01 09:07:32.093+00",
    isRejected: false,
    rejectionReason: "",
    confirmDate: "2025-06-01 09:07:32.092+00",
    rejectionDate: null
  },
  {
    id: 25,
    studentid: "S017",
    courseid: "BUS101",
    semesterid: 14,
    confirm: true,
    createdAt: "2025-06-01 09:06:45.034+00",
    updatedAt: "2025-06-01 09:07:32.093+00",
    isRejected: false,
    rejectionReason: "",
    confirmDate: "2025-06-01 09:07:32.092+00",
    rejectionDate: null
  },
  {
    id: 26,
    studentid: "S004",
    courseid: "BUS101",
    semesterid: 14,
    confirm: true,
    createdAt: "2025-06-01 09:06:45.034+00",
    updatedAt: "2025-06-01 09:07:32.093+00",
    isRejected: false,
    rejectionReason: "",
    confirmDate: "2025-06-01 09:07:32.092+00",
    rejectionDate: null
  },
  {
    id: 27,
    studentid: "S005",
    courseid: "BUS101",
    semesterid: 14,
    confirm: true,
    createdAt: "2025-06-01 09:06:45.034+00",
    updatedAt: "2025-06-01 09:07:32.093+00",
    isRejected: false,
    rejectionReason: "",
    confirmDate: "2025-06-01 09:07:32.092+00",
    rejectionDate: null
  },
  {
    id: 28,
    studentid: "S006",
    courseid: "BUS101",
    semesterid: 14,
    confirm: true,
    createdAt: "2025-06-01 09:06:45.034+00",
    updatedAt: "2025-06-01 09:07:32.093+00",
    isRejected: false,
    rejectionReason: "",
    confirmDate: "2025-06-01 09:07:32.092+00",
    rejectionDate: null
  },
  {
    id: 29,
    studentid: "S007",
    courseid: "BUS101",
    semesterid: 14,
    confirm: true,
    createdAt: "2025-06-01 09:06:45.034+00",
    updatedAt: "2025-06-01 09:07:32.093+00",
    isRejected: false,
    rejectionReason: "",
    confirmDate: "2025-06-01 09:07:32.092+00",
    rejectionDate: null
  },
  {
    id: 30,
    studentid: "S009",
    courseid: "BUS101",
    semesterid: 14,
    confirm: true,
    createdAt: "2025-06-01 09:06:45.034+00",
    updatedAt: "2025-06-01 09:07:32.093+00",
    isRejected: false,
    rejectionReason: "",
    confirmDate: "2025-06-01 09:07:32.092+00",
    rejectionDate: null
  },
  {
    id: 31,
    studentid: "S010",
    courseid: "BUS101",
    semesterid: 14,
    confirm: true,
    createdAt: "2025-06-01 09:06:45.034+00",
    updatedAt: "2025-06-01 09:07:32.093+00",
    isRejected: false,
    rejectionReason: "",
    confirmDate: "2025-06-01 09:07:32.092+00",
    rejectionDate: null
  },
  {
    id: 32,
    studentid: "S011",
    courseid: "BUS101",
    semesterid: 14,
    confirm: true,
    createdAt: "2025-06-01 09:06:45.034+00",
    updatedAt: "2025-06-01 09:07:32.093+00",
    isRejected: false,
    rejectionReason: "",
    confirmDate: "2025-06-01 09:07:32.092+00",
    rejectionDate: null
  },
  {
    id: 33,
    studentid: "S012",
    courseid: "BUS101",
    semesterid: 14,
    confirm: true,
    createdAt: "2025-06-01 09:06:45.034+00",
    updatedAt: "2025-06-01 09:07:32.093+00",
    isRejected: false,
    rejectionReason: "",
    confirmDate: "2025-06-01 09:07:32.092+00",
    rejectionDate: null
  },
  {
    id: 34,
    studentid: "S013",
    courseid: "BUS101",
    semesterid: 14,
    confirm: true,
    createdAt: "2025-06-01 09:06:45.034+00",
    updatedAt: "2025-06-01 09:07:32.093+00",
    isRejected: false,
    rejectionReason: "",
    confirmDate: "2025-06-01 09:07:32.092+00",
    rejectionDate: null
  },
  {
    id: 35,
    studentid: "S014",
    courseid: "BUS101",
    semesterid: 14,
    confirm: true,
    createdAt: "2025-06-01 09:06:45.034+00",
    updatedAt: "2025-06-01 09:07:32.093+00",
    isRejected: false,
    rejectionReason: "",
    confirmDate: "2025-06-01 09:07:32.092+00",
    rejectionDate: null
  },
  {
    id: 36,
    studentid: "S015",
    courseid: "BUS101",
    semesterid: 14,
    confirm: true,
    createdAt: "2025-06-01 09:06:45.034+00",
    updatedAt: "2025-06-01 09:07:32.093+00",
    isRejected: false,
    rejectionReason: "",
    confirmDate: "2025-06-01 09:07:32.092+00",
    rejectionDate: null
  },
  {
    id: 37,
    studentid: "S016",
    courseid: "BUS101",
    semesterid: 14,
    confirm: true,
    createdAt: "2025-06-01 09:06:45.034+00",
    updatedAt: "2025-06-01 09:07:32.093+00",
    isRejected: false,
    rejectionReason: "",
    confirmDate: "2025-06-01 09:07:32.092+00",
    rejectionDate: null
  },
  {
    id: 38,
    studentid: "S008",
    courseid: "ENG105",
    semesterid: 14,
    confirm: false,
    createdAt: "2025-06-01 09:34:59.983+00",
    updatedAt: "2025-06-01 09:34:59.983+00",
    isRejected: false,
    rejectionReason: "",
    confirmDate: null,
    rejectionDate: null
  },
  {
    id: 39,
    studentid: "S008",
    courseid: "MATH101",
    semesterid: 14,
    confirm: false,
    createdAt: "2025-06-03 07:51:19.719+00",
    updatedAt: "2025-06-03 07:51:19.719+00",
    isRejected: false,
    rejectionReason: "",
    confirmDate: null,
    rejectionDate: null
  }
];

// Helper functions for working with the course data

// Get course by ID
export const getCourseById = (courseId) => {
  return mockCourses.find(course => course.id === courseId);
};

// Get courses by department/group
export const getCoursesByGroup = (group) => {
  return mockCourses.filter(course => course.group === group);
};

// Get courses by level
export const getCoursesByLevel = (level) => {
  return mockCourses.filter(course => course.level === level);
};

// Get registration settings for a semester
export const getRegistrationSettingsBySemester = (semesterId) => {
  return mockCourseRegistrationSettings.find(settings => settings.semesterid === semesterId);
};

// Get student course registrations
export const getStudentRegistrations = (studentId) => {
  return mockCourseRegisters.filter(reg => reg.studentid === studentId);
};

// Get confirmed registrations for a student
export const getConfirmedRegistrations = (studentId) => {
  return mockCourseRegisters.filter(reg => reg.studentid === studentId && reg.confirm === true);
};

// Get students registered for a course
export const getStudentsInCourse = (courseId, semesterId) => {
  return mockCourseRegisters.filter(reg => 
    reg.courseid === courseId && 
    reg.semesterid === semesterId && 
    reg.confirm === true && 
    reg.isRejected === false
  ).map(reg => reg.studentid);
};

// Calculate total registered hours for a student in a semester
export const calculateStudentRegisteredHours = (studentId, semesterId) => {
  const registrations = mockCourseRegisters.filter(reg => 
    reg.studentid === studentId && 
    reg.semesterid === semesterId && 
    reg.confirm === true && 
    reg.isRejected === false
  );
  
  let totalHours = 0;
  registrations.forEach(reg => {
    const course = getCourseById(reg.courseid);
    if (course) {
      totalHours += course.coursehours;
    }
  });
  
  return totalHours;
};

// Check if registration is open for a semester
export const isRegistrationOpen = (semesterId) => {
  const settings = getRegistrationSettingsBySemester(semesterId);
  return settings ? settings.open : false;
};

/**
 * Mock Course Data
 * بيانات افتراضية للمقررات الدراسية
 */

// بيانات المقررات الدراسية للطالب الحالي
export const mockStudentCourses = [
  {
    id: 1,
    userId: "S001",
    courseId: "CS101",
    semesterId: 1,
    coursehours: 3,
    midterm_grade: 22,
    midterm_max: 30,
    final_grade: 0,
    final_max: 70,
    attendance: 90,
    attendance_max: 100,
    assignment_grade: 18,
    assignment_max: 20,
    quiz_grade: 9,
    quiz_max: 10,
    semester_grade: 0,
    Course: {
      id: "CS101",
      coursecode: "CS101",
      coursename: "Introduction to Computer Science",
      coursehours: 3,
      level: 1,
      instructor_id: "D001",
      instructor: "Dr. Khalid Ahmed",
      department: "CS"
    },
    semester: {
      id: 1,
      semester: "Fall",
      semesterstartyear: 2023,
      semesterendyear: 2024,
      semesterstartdate: "2023-09-01",
      semesterenddate: "2024-01-15"
    }
  },
  {
    id: 2,
    userId: "S001",
    courseId: "CS102",
    semesterId: 1,
    coursehours: 3,
    midterm_grade: 25,
    midterm_max: 30,
    final_grade: 0,
    final_max: 70,
    attendance: 95,
    attendance_max: 100,
    assignment_grade: 19,
    assignment_max: 20,
    quiz_grade: 8,
    quiz_max: 10,
    semester_grade: 0,
    Course: {
      id: "CS102",
      coursecode: "CS102",
      coursename: "Programming Fundamentals",
      coursehours: 3,
      level: 1,
      instructor_id: "D001",
      instructor: "Dr. Khalid Ahmed",
      department: "CS"
    },
    semester: {
      id: 1,
      semester: "Fall",
      semesterstartyear: 2023,
      semesterendyear: 2024,
      semesterstartdate: "2023-09-01",
      semesterenddate: "2024-01-15"
    }
  },
  {
    id: 3,
    userId: "S001",
    courseId: "MATH101",
    semesterId: 1,
    coursehours: 4,
    midterm_grade: 24,
    midterm_max: 30,
    final_grade: 0,
    final_max: 70,
    attendance: 85,
    attendance_max: 100,
    assignment_grade: 17,
    assignment_max: 20,
    quiz_grade: 7,
    quiz_max: 10,
    semester_grade: 0,
    Course: {
      id: "MATH101",
      coursecode: "MATH101",
      coursename: "Calculus I",
      coursehours: 4,
      level: 1,
      instructor_id: "D002",
      instructor: "Dr. Fatima Ali",
      department: "MATH"
    },
    semester: {
      id: 1,
      semester: "Fall",
      semesterstartyear: 2023,
      semesterendyear: 2024,
      semesterstartdate: "2023-09-01",
      semesterenddate: "2024-01-15"
    }
  },
  {
    id: 4,
    userId: "S001",
    courseId: "PHYS101",
    semesterId: 1,
    coursehours: 4,
    midterm_grade: 23,
    midterm_max: 30,
    final_grade: 0,
    final_max: 70,
    attendance: 80,
    attendance_max: 100,
    assignment_grade: 16,
    assignment_max:.0,
    quiz_grade: 9,
    quiz_max: 10,
    semester_grade: 0,
    Course: {
      id: "PHYS101",
      coursecode: "PHYS101",
      coursename: "Physics I",
      coursehours: 4,
      level: 1,
      instructor_id: "D002",
      instructor: "Dr. Fatima Ali",
      department: "PHYS"
    },
    semester: {
      id: 1,
      semester: "Fall",
      semesterstartyear: 2023,
      semesterendyear: 2024,
      semesterstartdate: "2023-09-01",
      semesterenddate: "2024-01-15"
    }
  },
  {
    id: 5,
    userId: "S001",
    courseId: "CS201",
    semesterId: 2,
    coursehours: 3,
    midterm_grade: 28,
    midterm_max: 30,
    final_grade: 0,
    final_max: 70,
    attendance: 98,
    attendance_max: 100,
    assignment_grade: 20,
    assignment_max: 20,
    quiz_grade: 10,
    quiz_max: 10,
    semester_grade: 0,
    Course: {
      id: "CS201",
      coursecode: "CS201",
      coursename: "Data Structures",
      coursehours: 3,
      level: 2,
      instructor_id: "D001",
      instructor: "Dr. Khalid Ahmed",
      department: "CS"
    },
    semester: {
      id: 2,
      semester: "Spring",
      semesterstartyear: 2023,
      semesterendyear: 2024,
      semesterstartdate: "2024-02-01",
      semesterenddate: "2024-06-15"
    }
  }
];

// دالة للحصول على مقررات الطالب الحالية
export const getMockStudentCourses = async (studentId) => {
  // إضافة تأخير لمحاكاة طلب الشبكة
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // يمكن استخدام معرف الطالب للحصول على بيانات خاصة به (في حالة وجود أكثر من طالب)
  // هنا نقوم بتصفية المقررات بناءً على الفصل الدراسي الحالي (مثال: الفصل الأول)
  const currentSemesterId = 1; // الفصل الدراسي الحالي
  const currentCourses = mockStudentCourses.filter(course => course.semesterId === currentSemesterId);
  
  return {
    success: true,
    data: currentCourses
  };
}; 