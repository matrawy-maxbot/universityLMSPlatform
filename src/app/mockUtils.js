/**
 * Mock data utilities for the application
 * This file provides mock data to simulate backend responses
 */

// Mock user accounts
export const mockUsers = [
  {
    id: "20217875",
    firstname: "ali",
    secondname: "mohamed",
    thirdname: "ahmed",
    lastname: "elgendy",
    nickname: "ali.elgendy",
    nationality: "egyptian",
    nationalid: "5427773",
    birthdate: "2002-08-26",
    gender: 1,
    type: 3, // Admin
    email: "ali.elgendy@example.com",
    phonenumber: "+201054856317",
    phonenumber2: "+201157411859",
    password: "$2a$10$sdBCEsLNTJyXflbkEtg9K.IDuFR2xDdMYtYUHAtWbo99LKguFfIwu", // password is "password123"
    profileimage: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFuJTIwYXZhdGFyfGVufDB8fDB8fHww",
    createdAt: "2025-05-26 00:00:00+00",
    updatedAt: "2025-06-01 02:09:05.254+00"
  },
  {
    id: "28782577",
    firstname: "dfgethtrhtr",
    secondname: "dfbfdhrth",
    thirdname: "fbfgbtb",
    lastname: "rbrtbrttr",
    nickname: "tyjytjt",
    nationality: "Egyptian",
    nationalid: "7277235775",
    birthdate: "2025-05-15",
    gender: 0,
    type: 0, // Student
    email: "trrhrhrt@gmail.com",
    phonenumber: "7527328383",
    phonenumber2: "298282829",
    password: "$2b$10$u8ufM5jqAb7hzbU0/TFOVuaUDjMYUTsPpS/BNG7hz9hCCPUTLIiem", // student123
    profileimage: "",
    createdAt: "2025-05-30 11:09:10.023+00",
    updatedAt: "2025-05-30 11:09:10.023+00"
  },
  {
    id: "652245",
    firstname: "riyadh",
    secondname: "ahmed",
    thirdname: "bnbvnv",
    lastname: "fares",
    nickname: "riyadh fares",
    nationality: "Egyptian",
    nationalid: "293737839377",
    birthdate: "2000-02-15",
    gender: 1,
    type: 0, // Student
    email: "sdfdhd@gmail.com",
    phonenumber: "4254343543",
    phonenumber2: "7835435434",
    password: "$2b$10$/bNtFivsHCbbAQq939fEGer9PY4HGFUGAWN2ZY8G57bJjqrFma1Cm", // student123
    profileimage: "/images/default-avatar.jpg",
    createdAt: "2025-05-30 10:48:22.105+00",
    updatedAt: "2025-05-30 10:50:00.24+00"
  },
  {
    id: "A001",
    firstname: "أحمد",
    secondname: "محمد",
    thirdname: "سعيد",
    lastname: "عبد الرحمن",
    nickname: "أحمد إداري",
    nationality: "Egyptian",
    nationalid: "29901012615477",
    birthdate: "1999-01-01",
    gender: 0,
    type: 3, // Admin
    email: "admin1@university.edu",
    phonenumber: "01012345678",
    password: "$2b$10$dUyyedDBj.59xnxbpFZAOOSG8Y8zRwONoUSoDFbgn6g7adsiXB66a", // admin123
    profileimage: "",
    createdAt: "2025-05-29 10:17:10.961+00",
    updatedAt: "2025-05-29 10:17:10.961+00"
  },
  {
    id: "A002",
    firstname: "سارة",
    secondname: "أحمد",
    thirdname: "إبراهيم",
    lastname: "محمود",
    nickname: "سارة إدارية",
    nationality: "Egyptian",
    nationalid: "29902022715488",
    birthdate: "1999-02-02",
    gender: 1,
    type: 3, // Admin
    email: "admin2@university.edu",
    phonenumber: "01023456789",
    password: "$2b$10$hv0jxFdra.f4f7gP.aZFVOqB3ums6aRdO1V3OMnTYb3LX6eO87LJ6", // admin123
    profileimage: "",
    createdAt: "2025-05-29 10:17:11.134+00",
    updatedAt: "2025-05-29 10:17:11.134+00"
  },
  {
    id: "AS001",
    firstname: "محمد",
    secondname: "عبد الله",
    thirdname: "حسن",
    lastname: "إبراهيم",
    nickname: "محمد المعيد",
    nationality: "Egyptian",
    nationalid: "29306062955334",
    birthdate: "1993-06-06",
    gender: 0,
    type: 1, // Assistant
    email: "assistant1@university.edu",
    phonenumber: "01067890123",
    password: "$2b$10$bhsOc6z/RhP0Ib5VS45z2.9TMc5JxbsseZ8tCY5Ie8iy5NePnkXBe", // assistant123
    profileimage: "",
    createdAt: "2025-05-29 10:17:11.692+00",
    updatedAt: "2025-05-29 10:17:11.692+00"
  },
  {
    id: "AS002",
    firstname: "نورا",
    secondname: "سمير",
    thirdname: "أحمد",
    lastname: "عبد الحميد",
    nickname: "نورا المعيدة",
    nationality: "Egyptian",
    nationalid: "29307073055345",
    birthdate: "1993-07-07",
    gender: 1,
    type: 1, // Assistant
    email: "assistant2@university.edu",
    phonenumber: "01078901234",
    password: "$2b$10$dgnNSzeRjJ8hERQeZkQQKuZ8ioKjMhPv9zdBKHP.clC2VQcz2wTJC", // assistant123
    profileimage: "",
    createdAt: "2025-05-29 10:17:11.819+00",
    updatedAt: "2025-05-29 10:17:11.819+00"
  },
  {
    id: "D001",
    firstname: "khalid",
    secondname: "mahmoud",
    thirdname: "elsayed",
    lastname: "ahmed",
    nickname: "دكتور خالد",
    nationality: "Egyptian",
    nationalid: "28804012755312",
    birthdate: "1988-04-01",
    gender: 0,
    type: 2, // Doctor
    email: "doctor1@university.edu",
    phonenumber: "01045678901",
    password: "$2b$10$QD52S4ekvWO2lqeMqBp1geJqHsm58lXqXegsX0e.W5.A3BbwpdT2W", // password is "doctor123"
    profileimage: "/images/shadcn.jpg",
    createdAt: "2025-05-29 10:17:11.413+00",
    updatedAt: "2025-05-29 10:17:11.413+00"
  },
  {
    id: "D002",
    firstname: "فاطمة",
    secondname: "علي",
    thirdname: "محمد",
    lastname: "عبد العزيز",
    nickname: "دكتورة فاطمة",
    nationality: "Egyptian",
    nationalid: "28805052855323",
    birthdate: "1988-05-05",
    gender: 1,
    type: 2, // Doctor
    email: "doctor2@university.edu",
    phonenumber: "01056789012",
    password: "$2b$10$JhJ0/FTu1hGS2AbqNDVXd.uiaNyKHskMCqArGuhqkCjdqEwiv1JNW", // doctor123
    profileimage: "",
    createdAt: "2025-05-29 10:17:11.533+00",
    updatedAt: "2025-05-29 10:17:11.533+00"
  },
  {
    id: "DA001",
    firstname: "حسام",
    secondname: "علي",
    thirdname: "أحمد",
    lastname: "الدسوقي",
    nickname: "حسام الإداري",
    nationality: "Egyptian",
    nationalid: "27703012654321",
    birthdate: "1977-03-01",
    gender: 0,
    type: 4, // Department head
    email: "doctor_admin@university.edu",
    phonenumber: "01034567890",
    phonenumber2: "01134567890",
    password: "$2b$10$6mEL/nIdwlL10x4RiI/X6.YZs9.JlxjO6RT5HcA5b7A6cKZxHI5im", // doctoradmin123
    profileimage: "",
    createdAt: "2025-05-29 10:17:11.284+00",
    updatedAt: "2025-05-29 10:17:11.284+00"
  },
  {
    id: "S001",
    firstname: "مصطفى",
    secondname: "أحمد",
    thirdname: "محمد",
    lastname: "خالد",
    nationality: "Egyptian",
    nationalid: "30201013512345",
    birthdate: "2002-01-01",
    gender: 0,
    type: 0, // Student
    email: "student1@university.edu",
    phonenumber: "01123456789",
    password: "$2b$10$U/uR4klq7wsJtdV.mrqNN.tszIiJOaY6ufAF0.GjqSB1kewNNlXRG", // student123
    profileimage: "",
    createdAt: "2025-05-29 10:17:12.509+00",
    updatedAt: "2025-05-29 10:17:12.509+00"
  },
  {
    id: "S008",
    firstname: "آية",
    secondname: "محمد",
    thirdname: "كمال",
    lastname: "إبراهيم",
    nationality: "Egyptian",
    nationalid: "30208084212412",
    birthdate: "2002-08-08",
    gender: 1,
    type: 0, // Student
    email: "student8@university.edu",
    phonenumber: "01190123456",
    password: "$2b$10$.WHATQgL7iHAxM7QorZsxumW79g2FjiVLaHJOmE3rlXmO31P3AIlq", // password is "student123"
    profileimage: "/images/shadcn.jpg",
    createdAt: "2025-05-29 10:17:13.497+00",
    updatedAt: "2025-05-29 10:17:13.497+00"
  }
];

// Mock courses
export const mockCourses = [
  { 
    id: 'CS101', 
    code: 'CS101', 
    name: 'Introduction to Computer Science',
    coursecode: 'CS101',
    coursename: 'Introduction to Computer Science',
    instructor: 'Dr. Khalid Ahmed',
    instructor_id: 'D001',
    department: 'CS',
    credits: 3,
    description: 'An introduction to the basic concepts of computer science.'
  },
  { 
    id: 'CS102', 
    code: 'CS102', 
    name: 'Programming Fundamentals',
    coursecode: 'CS102',
    coursename: 'Programming Fundamentals',
    instructor: 'Dr. Khalid Ahmed',
    instructor_id: 'D001',
    department: 'CS',
    credits: 3,
    description: 'An introduction to programming using Python.'
  },
  { 
    id: 'CS201', 
    code: 'CS201', 
    name: 'Data Structures',
    coursecode: 'CS201',
    coursename: 'Data Structures',
    instructor: 'Dr. Khalid Ahmed',
    instructor_id: 'D001',
    department: 'CS',
    credits: 4,
    description: 'Implementation and analysis of fundamental data structures.'
  },
  { 
    id: 'CS301', 
    code: 'CS301', 
    name: 'Database Systems',
    coursecode: 'CS301',
    coursename: 'Database Systems',
    instructor: 'Dr. Fatima Ali',
    instructor_id: 'D002',
    department: 'CS',
    credits: 3,
    description: 'Database design, implementation, and optimization.'
  }
];

// Mock schedules
export const mockSchedules = [
  {
    id: 1,
    title: "Software Engineering",
    image: "/images/schedule.jpg",
    createdAt: "2025-05-28T10:20:30.000Z",
    updatedAt: "2025-05-28T10:20:30.000Z",
    author_id: "D001",
    author: {
      id: "D001",
      firstname: "Khalid",
      lastname: "Ahmed",
      profileimage: "/images/shadcn.jpg"
    },
    scheduleData: {
      weekly: {
        Saturday: [
          null, 
          { courseId: 'CS101', group: 'A', room: 'Lab 1', type: 'lecture' },
          { courseId: 'CS102', group: 'B', room: 'Room 202', type: 'lecture' },
          null,
          { courseId: 'CS201', group: 'A', room: 'Lab 3', type: 'practical' },
          null,
          null,
          null,
          null
        ],
        Sunday: [
          null,
          null,
          { courseId: 'CS301', group: 'C', room: 'Room 303', type: 'lecture' },
          { courseId: 'CS301', group: 'C', room: 'Room 303', type: 'lecture' },
          null,
          null,
          null,
          null,
          null
        ],
        Monday: [
          null,
          { courseId: 'CS101', group: 'A', room: 'Lab 1', type: 'practical' },
          { courseId: 'CS101', group: 'A', room: 'Lab 1', type: 'practical' },
          null,
          null,
          null,
          null,
          null,
          null
        ],
        Tuesday: [
          null,
          null,
          null,
          null,
          { courseId: 'CS102', group: 'B', room: 'Lab 2', type: 'practical' },
          { courseId: 'CS102', group: 'B', room: 'Lab 2', type: 'practical' },
          null,
          null,
          null
        ],
        Wednesday: [
          { courseId: 'CS201', group: 'A', room: 'Room 101', type: 'lecture' },
          { courseId: 'CS201', group: 'A', room: 'Room 101', type: 'lecture' },
          null,
          null,
          null,
          null,
          null,
          null,
          null
        ],
        Thursday: Array(9).fill(null),
      },
      dynamic: []
    },
    scheduleType: 'weekly',
    department_id: "CS"
  },
  {
    id: 2,
    title: "Computer Science",
    image: "/images/schedule2.png",
    createdAt: "2025-05-20T08:15:00.000Z",
    updatedAt: "2025-05-25T14:30:00.000Z",
    author_id: "D002",
    author: {
      id: "D002",
      firstname: "Fatima",
      lastname: "Ali",
      profileimage: "/images/shadcn.jpg"
    },
    scheduleData: {
      weekly: {
        Saturday: Array(9).fill(null),
        Sunday: Array(9).fill(null),
        Monday: Array(9).fill(null),
        Tuesday: Array(9).fill(null),
        Wednesday: Array(9).fill(null),
        Thursday: Array(9).fill(null),
      },
      dynamic: []
    },
    scheduleType: 'weekly',
    department_id: "CS"
  }
];

// Mock quizzes for students
export const mockQuizzes = [
  {
    id: 1,
    title: 'Quiz 1 - Introduction',
    course: 'Introduction to Computer Science',
    courseId: 'CS101',
    instructor: 'Dr. Khalid Ahmed',
    status: 'completed',
    startTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    endTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),   // 14 days ago
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    formLink: 'https://forms.google.com/quiz1',
    description: 'This quiz covers basic computer science concepts from chapters 1-3.'
  },
  {
    id: 2,
    title: 'Quiz 2 - Data Types',
    course: 'Programming Fundamentals',
    courseId: 'CS102',
    instructor: 'Dr. Khalid Ahmed',
    status: 'active',
    startTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),      // 1 hour ago
    endTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),        // 5 hours from now
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    formLink: 'https://forms.google.com/quiz2',
    description: 'Quiz on Python data types, variables, and operators.'
  },
  {
    id: 3,
    title: 'Quiz 3 - Database Design',
    course: 'Database Systems',
    courseId: 'CS301',
    instructor: 'Dr. Fatima Ali',
    status: 'postponed',
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 5 days + 2 hours from now
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    formLink: 'https://forms.google.com/quiz3',
    description: 'Covers database design principles, normalization, and ER diagrams.'
  }
];

// Mock assignments for students
export const mockAssignments = [
  {
    id: 1,
    title: 'Assignment 1 - Hello World',
    course: 'Programming Fundamentals',
    courseId: 'CS102',
    instructor: 'Dr. Khalid Ahmed',
    status: 'completed',
    startTime: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    endTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),   // 15 days ago
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
    description: 'Write your first Python program that prints "Hello World".',
    grade: 95,
    feedback: 'Great work! Clean code and well-documented.'
  },
  {
    id: 2,
    title: 'Assignment 2 - Data Structures Implementation',
    course: 'Data Structures',
    courseId: 'CS201',
    instructor: 'Dr. Khalid Ahmed',
    status: 'active',
    startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),  // 5 days ago
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),    // 2 days from now
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),  // 7 days ago
    description: 'Implement a linked list, stack, and queue in Python.',
    grade: null,
    feedback: null
  },
  {
    id: 3,
    title: 'Assignment 3 - Database Design',
    course: 'Database Systems',
    courseId: 'CS301',
    instructor: 'Dr. Fatima Ali',
    status: 'scheduled',
    startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),  // 1 day from now
    endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),    // 8 days from now
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),  // 1 day ago
    description: 'Design a database for a university system with students, courses, professors, and grades.',
    grade: null,
    feedback: null
  }
];

// Mock analytics data for admin dashboard
export const mockAnalyticsData = [
  {
    id: 1,
    name: "John Doe",
    gender: "male",
    department: "Computer Science",
    cumulativeGPA: 3.5,
    courses: [
      { code: "CS101", grade: 3.7, attempts: 1, semester: "Fall 2023" },
      { code: "CS102", grade: 3.5, attempts: 1, semester: "Fall 2023" },
      { code: "MATH101", grade: 2.8, attempts: 2, semester: "Spring 2023" }
    ]
  },
  {
    id: 2,
    name: "Jane Smith",
    gender: "female",
    department: "Information Systems",
    cumulativeGPA: 3.8,
    courses: [
      { code: "IS101", grade: 4.0, attempts: 1, semester: "Fall 2023" },
      { code: "CS101", grade: 3.5, attempts: 1, semester: "Fall 2023" },
      { code: "MATH101", grade: 3.7, attempts: 1, semester: "Spring 2023" }
    ]
  },
  {
    id: 3,
    name: "Mike Johnson",
    gender: "male",
    department: "Information Technology",
    cumulativeGPA: 2.9,
    courses: [
      { code: "IT101", grade: 3.0, attempts: 1, semester: "Fall 2023" },
      { code: "CS101", grade: 2.5, attempts: 2, semester: "Spring 2023" },
      { code: "MATH101", grade: 3.2, attempts: 1, semester: "Fall 2023" }
    ]
  }
];

// Helper functions
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms)); 