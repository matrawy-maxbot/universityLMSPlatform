/**
 * Extended mock data utilities for the application
 * This file provides additional mock data tables to simulate the database
 */

// Student records with academic details
export const mockStudentRecords = [
  {
    studentid: "28782577",
    maxhours: 18,
    section: "A",
    major: "General",
    registerationaccess: true,
    platformaccess: true,
    createdAt: "2025-05-30 11:09:10.093+00",
    updatedAt: "2025-05-30 11:09:10.093+00"
  },
  {
    studentid: "S001",
    maxhours: 21,
    section: "1",
    major: "علوم الحاسب",
    registerationaccess: true,
    platformaccess: true,
    createdAt: "2025-05-29 10:21:59.481+00",
    updatedAt: "2025-05-29 10:21:59.481+00"
  },
  {
    studentid: "S002",
    maxhours: 21,
    section: "2",
    major: "نظم المعلومات",
    registerationaccess: true,
    platformaccess: true,
    createdAt: "2025-05-29 10:21:59.481+00",
    updatedAt: "2025-05-29 10:21:59.481+00"
  },
  {
    studentid: "S004",
    maxhours: 24,
    section: "3",
    major: "الذكاء الاصطناعي",
    registerationaccess: true,
    platformaccess: true,
    createdAt: "2025-05-29 10:21:59.481+00",
    updatedAt: "2025-05-29 10:21:59.481+00"
  },
  {
    studentid: "S005",
    maxhours: 21,
    section: "2",
    major: "هندسة البرمجيات",
    registerationaccess: true,
    platformaccess: true,
    createdAt: "2025-05-29 10:21:59.481+00",
    updatedAt: "2025-05-29 10:21:59.481+00"
  },
  {
    studentid: "S006",
    maxhours: 18,
    section: "1",
    major: "نظم المعلومات",
    registerationaccess: true,
    platformaccess: true,
    createdAt: "2025-05-29 10:21:59.481+00",
    updatedAt: "2025-05-29 10:21:59.481+00"
  },
  {
    studentid: "S007",
    maxhours: 21,
    section: "3",
    major: "علوم الحاسب",
    registerationaccess: true,
    platformaccess: true,
    createdAt: "2025-05-29 10:21:59.481+00",
    updatedAt: "2025-05-29 10:21:59.481+00"
  },
  {
    studentid: "S008",
    maxhours: 24,
    section: "2",
    major: "الذكاء الاصطناعي",
    registerationaccess: true,
    platformaccess: true,
    createdAt: "2025-05-29 10:21:59.481+00",
    updatedAt: "2025-05-29 10:21:59.481+00"
  },
  {
    studentid: "S009",
    maxhours: 18,
    section: "1",
    major: "علوم الحاسب",
    registerationaccess: true,
    platformaccess: true,
    createdAt: "2025-05-29 10:21:59.481+00",
    updatedAt: "2025-05-29 10:21:59.481+00"
  },
  {
    studentid: "S010",
    maxhours: 21,
    section: "3",
    major: "نظم المعلومات",
    registerationaccess: true,
    platformaccess: true,
    createdAt: "2025-05-29 10:21:59.481+00",
    updatedAt: "2025-05-29 10:21:59.481+00"
  }
];

// Student grades
export const mockStudentGrades = [
  {
    id: 5,
    studentid: "S008",
    courseid: "PHIL101",
    semesterid: 14,
    points: 60,
    maxpoints: 100,
    createdAt: "2025-06-01 09:33:35.802+00",
    updatedAt: "2025-06-01 09:33:35.802+00"
  },
  {
    id: 6,
    studentid: "S008",
    courseid: "MED101",
    semesterid: 14,
    points: 82,
    maxpoints: 100,
    createdAt: "2025-06-01 09:33:46.815+00",
    updatedAt: "2025-06-01 09:33:46.815+00"
  },
  // Add more mock grades for demonstration
  {
    id: 7,
    studentid: "S001",
    courseid: "CS101",
    semesterid: 14,
    points: 88,
    maxpoints: 100,
    createdAt: "2025-06-01 09:33:46.815+00",
    updatedAt: "2025-06-01 09:33:46.815+00"
  },
  {
    id: 8,
    studentid: "S001",
    courseid: "MATH101",
    semesterid: 14,
    points: 75,
    maxpoints: 100,
    createdAt: "2025-06-01 09:33:46.815+00",
    updatedAt: "2025-06-01 09:33:46.815+00"
  },
  {
    id: 9,
    studentid: "S002",
    courseid: "CS101",
    semesterid: 14,
    points: 92,
    maxpoints: 100,
    createdAt: "2025-06-01 09:33:46.815+00",
    updatedAt: "2025-06-01 09:33:46.815+00"
  }
];

// Doctors data
export const mockDoctorRecords = [
  {
    doctorid: "D001",
    createdAt: "2025-05-29 10:20:57.778+00",
    updatedAt: "2025-05-29 10:20:57.778+00"
  },
  {
    doctorid: "D002",
    createdAt: "2025-05-29 10:20:57.778+00",
    updatedAt: "2025-05-29 10:20:57.778+00"
  },
  {
    doctorid: "DA001",
    createdAt: "2025-05-29 10:20:57.778+00",
    updatedAt: "2025-05-29 10:20:57.778+00"
  }
];

// Assistants data
export const mockAssistantRecords = [
  {
    assistantid: "AS001",
    createdAt: "2025-05-29 10:20:39.291+00",
    updatedAt: "2025-05-29 10:20:39.291+00"
  },
  {
    assistantid: "AS002",
    createdAt: "2025-05-29 10:20:39.291+00",
    updatedAt: "2025-05-29 10:20:39.291+00"
  },
  {
    assistantid: "AS003",
    createdAt: "2025-05-29 10:20:39.291+00",
    updatedAt: "2025-05-29 10:20:39.291+00"
  },
  {
    assistantid: "AS004",
    createdAt: "2025-05-29 10:20:39.291+00",
    updatedAt: "2025-05-29 10:20:39.291+00"
  },
  {
    assistantid: "AS005",
    createdAt: "2025-05-29 10:20:39.291+00",
    updatedAt: "2025-05-29 10:20:39.291+00"
  },
  {
    assistantid: "AS006",
    createdAt: "2025-05-29 10:20:39.291+00",
    updatedAt: "2025-05-29 10:20:39.291+00"
  }
];

// Admin data with permissions
export const mockAdminRecords = [
  {
    adminid: "20217875",
    permissions: "{}",
    createdAt: "2025-06-01 02:09:05.284+00",
    updatedAt: "2025-06-01 02:09:05.284+00"
  },
  {
    adminid: "A001",
    permissions: "{manage_users,manage_courses,manage_registrations,view_reports}",
    createdAt: "2025-05-29 10:21:26.278+00",
    updatedAt: "2025-05-29 10:21:26.278+00"
  },
  {
    adminid: "A002",
    permissions: "{manage_users,manage_courses,manage_registrations,view_reports}",
    createdAt: "2025-05-29 10:21:18.832+00",
    updatedAt: "2025-05-29 10:21:18.832+00"
  }
];

// Mock semesters
export const mockSemesters = [
  {
    id: 14,
    name: "Spring 2025",
    start_date: "2025-01-15",
    end_date: "2025-05-30",
    is_current: true,
    status: "active"
  },
  {
    id: 13,
    name: "Fall 2024",
    start_date: "2024-09-01",
    end_date: "2024-12-20",
    is_current: false,
    status: "completed"
  }
];

// Additional mock courses
export const mockAdditionalCourses = [
  {
    id: "PHIL101",
    code: "PHIL101",
    name: "Introduction to Philosophy",
    coursecode: "PHIL101",
    coursename: "Introduction to Philosophy",
    instructor: "Dr. Fatima Ali",
    instructor_id: "D002",
    department: "GEN",
    credits: 2,
    description: "An introduction to philosophical concepts and critical thinking."
  },
  {
    id: "MED101",
    code: "MED101",
    name: "Medical Terminology",
    coursecode: "MED101",
    coursename: "Medical Terminology",
    instructor: "Dr. Khalid Ahmed",
    instructor_id: "D001",
    department: "GEN",
    credits: 2,
    description: "Basic medical terminology for computer science students."
  },
  {
    id: "MATH101",
    code: "MATH101",
    name: "Calculus I",
    coursecode: "MATH101",
    coursename: "Calculus I",
    instructor: "Dr. Fatima Ali",
    instructor_id: "D002",
    department: "MATH",
    credits: 3,
    description: "Introduction to differential and integral calculus."
  }
];

// Utility function to find a student record by ID
export const getStudentById = (studentId) => {
  return mockStudentRecords.find(student => student.studentid === studentId);
};

// Utility function to get grades for a specific student
export const getGradesByStudentId = (studentId) => {
  return mockStudentGrades.filter(grade => grade.studentid === studentId);
};

// Utility function to calculate GPA for a student
export const calculateStudentGPA = (studentId) => {
  const grades = getGradesByStudentId(studentId);
  if (grades.length === 0) return 0;
  
  let totalPoints = 0;
  let totalMaxPoints = 0;
  
  grades.forEach(grade => {
    totalPoints += grade.points;
    totalMaxPoints += grade.maxpoints;
  });
  
  // Convert to 4.0 scale (assuming 100-point scale)
  const percentageGPA = totalPoints / totalMaxPoints;
  return (percentageGPA * 4.0).toFixed(2);
}; 