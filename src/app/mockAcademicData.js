/**
 * Academic Data Mock Utilities
 * Contains semesters, levels, groups, and group memberships data
 */

// Semester data from the database
export const mockSemesters = [
  {
    id: 1,
    semester: "summer",
    semesterstartyear: "2021",
    semesterendyear: "2022",
    endedat: "2025-05-29 11:00:19.458+00",
    createdAt: "2025-05-29 11:00:19.458+00",
    updatedAt: "2025-05-29 11:00:19.458+00"
  },
  {
    id: 2,
    semester: "fall",
    semesterstartyear: "2021",
    semesterendyear: "2022",
    endedat: "2025-05-29 11:00:19.458+00",
    createdAt: "2025-05-29 11:00:26.822+00",
    updatedAt: "2025-05-29 11:00:26.822+00"
  },
  {
    id: 3,
    semester: "fall",
    semesterstartyear: "2022",
    semesterendyear: "2023",
    endedat: "2025-05-29 11:00:19.458+00",
    createdAt: "2025-05-29 11:00:35.287+00",
    updatedAt: "2025-05-29 11:00:35.287+00"
  },
  {
    id: 4,
    semester: "spring",
    semesterstartyear: "2022",
    semesterendyear: "2023",
    endedat: "2025-05-29 11:00:19.458+00",
    createdAt: "2025-05-29 11:00:41.87+00",
    updatedAt: "2025-05-29 11:00:41.87+00"
  },
  {
    id: 5,
    semester: "spring",
    semesterstartyear: "2023",
    semesterendyear: "2024",
    endedat: "2025-05-29 11:00:19.458+00",
    createdAt: "2025-05-29 11:00:48.581+00",
    updatedAt: "2025-05-29 11:00:48.581+00"
  },
  {
    id: 6,
    semester: "fall",
    semesterstartyear: "2023",
    semesterendyear: "2024",
    endedat: "2025-05-29 11:00:19.458+00",
    createdAt: "2025-05-29 11:00:53.071+00",
    updatedAt: "2025-05-29 11:00:53.071+00"
  },
  {
    id: 7,
    semester: "fall",
    semesterstartyear: "2025",
    semesterendyear: "2026",
    endedat: "2025-05-30 22:09:28.549+00",
    createdAt: "2025-05-29 11:01:00.588+00",
    updatedAt: "2025-05-30 22:09:28.551+00"
  },
  {
    id: 8,
    semester: "spring",
    semesterstartyear: "2026",
    semesterendyear: "2027",
    endedat: "2025-05-30 23:18:51.605+00",
    createdAt: "2025-05-30 22:40:18.715+00",
    updatedAt: "2025-05-30 23:18:51.605+00"
  },
  {
    id: 9,
    semester: "winter",
    semesterstartyear: "2026",
    semesterendyear: "2027",
    endedat: "2025-05-31 03:26:48.456+00",
    createdAt: "2025-05-30 23:18:59.771+00",
    updatedAt: "2025-05-31 03:26:48.457+00"
  },
  {
    id: 10,
    semester: "spring",
    semesterstartyear: "2027",
    semesterendyear: "2028",
    endedat: "2025-05-31 10:52:58.738+00",
    createdAt: "2025-05-31 03:27:14.439+00",
    updatedAt: "2025-05-31 10:52:58.739+00"
  },
  {
    id: 11,
    semester: "summer",
    semesterstartyear: "2025",
    semesterendyear: "2026",
    endedat: "2025-05-31 11:23:26.95+00",
    createdAt: "2025-05-31 10:53:14.945+00",
    updatedAt: "2025-05-31 11:23:26.951+00"
  },
  {
    id: 12,
    semester: "fall",
    semesterstartyear: "2028",
    semesterendyear: "2029",
    endedat: "2025-06-01 05:51:35.307+00",
    createdAt: "2025-05-31 11:23:39.805+00",
    updatedAt: "2025-06-01 05:51:35.308+00"
  },
  {
    id: 13,
    semester: "fall",
    semesterstartyear: "2024",
    semesterendyear: "2025",
    endedat: "2025-06-01 06:38:15.361+00",
    createdAt: "2025-06-01 05:52:32.149+00",
    updatedAt: "2025-06-01 06:38:15.361+00"
  },
  {
    id: 14,
    semester: "fall",
    semesterstartyear: "2025",
    semesterendyear: "2026",
    endedat: "2025-06-03 08:18:10.923+00",
    createdAt: "2025-06-01 06:38:32.215+00",
    updatedAt: "2025-06-03 08:18:10.925+00"
  },
  {
    id: 15,
    semester: "spring",
    semesterstartyear: "2028",
    semesterendyear: "2029",
    endedat: "",
    createdAt: "2025-06-03 08:18:43.099+00",
    updatedAt: "2025-06-03 09:36:50.813+00"
  }
];

// Academic levels data from the database
export const mockLevels = [
  {
    id: 1,
    levelhours: 36,
    User: {
      id: "D001",
      firstname: "خالد",
      secondname: "محمود",
      thirdname: "السيد",
      lastname: "أحمد",
      email: "doctor1@university.edu",
      profileimage: "/images/shadcn.jpg"
    }
  },
  {
    id: 2,
    levelhours: 36,
    User: {
      id: "D002",
      firstname: "فاطمة",
      secondname: "علي",
      thirdname: "محمد",
      lastname: "عبد العزيز",
      email: "doctor2@university.edu",
      profileimage: "/images/shadcn.jpg"
    }
  },
  {
    id: 3,
    levelhours: 36,
    User: {
      id: "DA001",
      firstname: "حسام",
      secondname: "علي",
      thirdname: "أحمد",
      lastname: "الدسوقي",
      email: "doctor_admin@university.edu",
      profileimage: ""
    }
  },
  {
    id: 4,
    levelhours: 36,
    User: {
      id: "DA001",
      firstname: "حسام",
      secondname: "علي",
      thirdname: "أحمد",
      lastname: "الدسوقي",
      email: "doctor_admin@university.edu",
      profileimage: ""
    }
  }
];

// Student groups data from the database
export const mockGroups = [
  {
    id: "07fa15f9efc86d86",
    title: "admins",
    authorid: "20217875",
    description: "Group created for digital college platform",
    isPublic: true,
    tags: "{}",
    metadata: "{}",
    createdAt: "2025-05-30 00:54:53.933+00",
    updatedAt: "2025-05-30 00:54:53.933+00"
  },
  {
    id: "0ab7d914b92c79c2",
    title: "C",
    authorid: "20217875",
    description: "Group created for digital college platform",
    isPublic: true,
    tags: "{}",
    metadata: "{}",
    createdAt: "2025-05-30 01:01:02.175+00",
    updatedAt: "2025-05-30 01:01:02.175+00"
  },
  {
    id: "21e462a4f71e42c6",
    title: "B",
    authorid: "20217875",
    description: "Group created for digital college platform",
    isPublic: true,
    tags: "{}",
    metadata: "{}",
    createdAt: "2025-05-30 01:00:51.625+00",
    updatedAt: "2025-05-30 01:00:51.625+00"
  },
  {
    id: "31564c6959c83fc9",
    title: "D",
    authorid: "20217875",
    description: "Group created for digital college platform",
    isPublic: true,
    tags: "{}",
    metadata: "{}",
    createdAt: "2025-05-30 01:01:21.819+00",
    updatedAt: "2025-05-30 01:01:21.819+00"
  },
  {
    id: "421f6730ac6c359f",
    title: "assistants",
    authorid: "20217875",
    description: "Group created for digital college platform",
    isPublic: true,
    tags: "{}",
    metadata: "{}",
    createdAt: "2025-05-30 00:55:48.418+00",
    updatedAt: "2025-05-30 00:55:48.418+00"
  },
  {
    id: "918d5e8b3d15356f",
    title: "students",
    authorid: "20217875",
    description: "Group created for digital college platform",
    isPublic: true,
    tags: "{}",
    metadata: "{}",
    createdAt: "2025-05-30 00:57:01.113+00",
    updatedAt: "2025-05-30 00:57:01.113+00"
  },
  {
    id: "d3b0f5d6735860c4",
    title: "A",
    authorid: "20217875",
    description: "Group created for digital college platform",
    isPublic: true,
    tags: "{}",
    metadata: "{}",
    createdAt: "2025-05-30 00:58:43.927+00",
    updatedAt: "2025-05-30 00:58:43.927+00"
  },
  {
    id: "ef81187826f30d6c",
    title: "doctors",
    authorid: "20217875",
    description: "Group created for digital college platform",
    isPublic: true,
    tags: "{}",
    metadata: "{}",
    createdAt: "2025-05-30 00:56:22.476+00",
    updatedAt: "2025-05-30 00:56:22.476+00"
  }
];

// Group membership data from the database
export const mockGroupMembers = [
  {
    id: 1,
    groupid: "07fa15f9efc86d86",
    member: "20217875",
    createdAt: "2025-05-30 00:54:53.985+00",
    updatedAt: "2025-05-30 00:54:53.985+00"
  },
  {
    id: 2,
    groupid: "07fa15f9efc86d86",
    member: "A001",
    createdAt: "2025-05-30 00:54:53.988+00",
    updatedAt: "2025-05-30 00:54:53.988+00"
  },
  {
    id: 3,
    groupid: "07fa15f9efc86d86",
    member: "A002",
    createdAt: "2025-05-30 00:54:53.991+00",
    updatedAt: "2025-05-30 00:54:53.991+00"
  },
  {
    id: 4,
    groupid: "07fa15f9efc86d86",
    member: "DA001",
    createdAt: "2025-05-30 00:54:53.993+00",
    updatedAt: "2025-05-30 00:54:53.993+00"
  },
  {
    id: 5,
    groupid: "421f6730ac6c359f",
    member: "AS001",
    createdAt: "2025-05-30 00:55:48.452+00",
    updatedAt: "2025-05-30 00:55:48.452+00"
  },
  {
    id: 6,
    groupid: "421f6730ac6c359f",
    member: "AS003",
    createdAt: "2025-05-30 00:55:48.456+00",
    updatedAt: "2025-05-30 00:55:48.456+00"
  },
  {
    id: 7,
    groupid: "421f6730ac6c359f",
    member: "AS006",
    createdAt: "2025-05-30 00:55:48.457+00",
    updatedAt: "2025-05-30 00:55:48.457+00"
  },
  {
    id: 8,
    groupid: "421f6730ac6c359f",
    member: "AS002",
    createdAt: "2025-05-30 00:55:48.459+00",
    updatedAt: "2025-05-30 00:55:48.459+00"
  },
  {
    id: 9,
    groupid: "421f6730ac6c359f",
    member: "AS005",
    createdAt: "2025-05-30 00:55:48.46+00",
    updatedAt: "2025-05-30 00:55:48.46+00"
  },
  {
    id: 10,
    groupid: "421f6730ac6c359f",
    member: "AS004",
    createdAt: "2025-05-30 00:55:48.461+00",
    updatedAt: "2025-05-30 00:55:48.461+00"
  }
];

// For brevity, only including a subset of group members
// Complete data can be generated as needed

// Helper functions for working with the academic data
export const getSemesterById = (semesterId) => {
  return mockSemesters.find(semester => semester.id === semesterId);
};

export const getLevelById = (levelId) => {
  return mockLevels.find(level => level.id === levelId);
};

export const getGroupById = (groupId) => {
  return mockGroups.find(group => group.id === groupId);
};

export const getGroupsByMember = (memberId) => {
  const memberGroupIds = mockGroupMembers
    .filter(gm => gm.member === memberId)
    .map(gm => gm.groupid);
  
  return mockGroups.filter(group => memberGroupIds.includes(group.id));
};

export const getMembersByGroup = (groupId) => {
  return mockGroupMembers
    .filter(gm => gm.groupid === groupId)
    .map(gm => gm.member);
};

export const getCurrentSemester = () => {
  // Return the most recent semester that hasn't ended
  const now = new Date();
  
  return mockSemesters
    .filter(s => !s.endedat || new Date(s.endedat) > now)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || mockSemesters[0];
};

export const formatSemesterName = (semester) => {
  if (!semester) return 'Unknown Semester';
  
  return `${semester.semester.charAt(0).toUpperCase() + semester.semester.slice(1)} ${semester.semesterstartyear}/${semester.semesterendyear}`;
};

// Academic year utility
export const getAcademicYears = () => {
  const uniqueYears = new Set();
  
  mockSemesters.forEach(semester => {
    uniqueYears.add(`${semester.semesterstartyear}/${semester.semesterendyear}`);
  });
  
  return Array.from(uniqueYears).sort();
};

/**
 * Mock Academic Records Data
 * بيانات افتراضية للسجلات الأكاديمية
 */

// بيانات طالب مع السجل الأكاديمي الكامل
export const mockStudentAcademicRecord = {
  student: {
    id: "S001",
    firstname: "مصطفى",
    secondname: "أحمد",
    thirdname: "محمد",
    lastname: "خالد",
    nationality: "Egyptian",
    nationalid: "30201013512345",
    birthdate: "2002-01-01",
    gender: 0,
    email: "student1@university.edu",
    phonenumber: "01123456789",
    maxhours: 144,
    profileimage: "/images/shadcn.jpg",
    groupIDs: [1, 3, 5]
  },
  semesters: [
    {
      semesterId: 1,
      semester: "Fall",
      semesterStartYear: 2023,
      semesterEndYear: 2024,
      courses: [
        {
          courseId: "CS101",
          courseCode: "CS101",
          courseName: "Introduction to Computer Science",
          courseHours: 3,
          points: 85,
          maxPoints: 100,
          percentage: 85,
          courseLevel: 1
        },
        {
          courseId: "MATH101",
          courseCode: "MATH101",
          courseName: "Calculus I",
          courseHours: 4,
          points: 78,
          maxPoints: 100,
          percentage: 78,
          courseLevel: 1
        },
        {
          courseId: "PHYS101",
          courseCode: "PHYS101",
          courseName: "Physics I",
          courseHours: 4,
          points: 82,
          maxPoints: 100,
          percentage: 82,
          courseLevel: 1
        },
        {
          courseId: "ENG101",
          courseCode: "ENG101",
          courseName: "English Composition",
          courseHours: 3,
          points: 90,
          maxPoints: 100,
          percentage: 90,
          courseLevel: 1
        }
      ]
    },
    {
      semesterId: 2,
      semester: "Spring",
      semesterStartYear: 2023,
      semesterEndYear: 2024,
      courses: [
        {
          courseId: "CS102",
          courseCode: "CS102",
          courseName: "Programming Fundamentals",
          courseHours: 3,
          points: 88,
          maxPoints: 100,
          percentage: 88,
          courseLevel: 1
        },
        {
          courseId: "MATH102",
          courseCode: "MATH102",
          courseName: "Calculus II",
          courseHours: 4,
          points: 75,
          maxPoints: 100,
          percentage: 75,
          courseLevel: 1
        },
        {
          courseId: "PHYS102",
          courseCode: "PHYS102",
          courseName: "Physics II",
          courseHours: 4,
          points: 79,
          maxPoints: 100,
          percentage: 79,
          courseLevel: 1
        },
        {
          courseId: "CHEM101",
          courseCode: "CHEM101",
          courseName: "Chemistry I",
          courseHours: 3,
          points: 72,
          maxPoints: 100,
          percentage: 72,
          courseLevel: 1
        }
      ]
    },
    {
      semesterId: 3,
      semester: "Fall",
      semesterStartYear: 2024,
      semesterEndYear: 2025,
      courses: [
        {
          courseId: "CS201",
          courseCode: "CS201",
          courseName: "Data Structures",
          courseHours: 3,
          points: 92,
          maxPoints: 100,
          percentage: 92,
          courseLevel: 2
        },
        {
          courseId: "CS202",
          courseCode: "CS202",
          courseName: "Computer Architecture",
          courseHours: 3,
          points: 84,
          maxPoints: 100,
          percentage: 84,
          courseLevel: 2
        },
        {
          courseId: "MATH201",
          courseCode: "MATH201",
          courseName: "Discrete Mathematics",
          courseHours: 3,
          points: 86,
          maxPoints: 100,
          percentage: 86,
          courseLevel: 2
        },
        {
          courseId: "STAT201",
          courseCode: "STAT201",
          courseName: "Probability & Statistics",
          courseHours: 3,
          points: 80,
          maxPoints: 100,
          percentage: 80,
          courseLevel: 2
        }
      ]
    },
    {
      semesterId: 4,
      semester: "Spring",
      semesterStartYear: 2024,
      semesterEndYear: 2025,
      courses: [
        {
          courseId: "CS203",
          courseCode: "CS203",
          courseName: "Algorithms",
          courseHours: 3,
          points: 87,
          maxPoints: 100,
          percentage: 87,
          courseLevel: 2
        },
        {
          courseId: "CS204",
          courseCode: "CS204",
          courseName: "Operating Systems",
          courseHours: 3,
          points: 83,
          maxPoints: 100,
          percentage: 83,
          courseLevel: 2
        },
        {
          courseId: "CS205",
          courseCode: "CS205",
          courseName: "Software Engineering",
          courseHours: 3,
          points: 89,
          maxPoints: 100,
          percentage: 89,
          courseLevel: 2
        },
        {
          courseId: "CS206",
          courseCode: "CS206",
          courseName: "Web Development",
          courseHours: 3,
          points: 91,
          maxPoints: 100,
          percentage: 91,
          courseLevel: 2
        }
      ]
    }
  ],
  levels: mockLevels
};

// بيانات الرسم البياني للمعدل التراكمي (GPA)
export const mockGpaData = {
  labels: ['01', '02', '03', '04', '05', '06', '07', '08'],
  data: [3.38, 3.14, 3.42, 3.5, 0, 0, 0, 0]
};

// دالة للحصول على البيانات الأكاديمية للطالب
export const getMockAcademicRecords = async (studentId) => {
  // إضافة تأخير لمحاكاة طلب الشبكة
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // يمكن استخدام معرف الطالب للحصول على بيانات خاصة به (في حالة وجود أكثر من طالب)
  return {
    success: true,
    data: mockStudentAcademicRecord
  };
}; 