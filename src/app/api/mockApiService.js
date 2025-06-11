/**
 * Mock API Service
 * 
 * This service provides mock implementations of API endpoints
 * to be used when the backend is not available.
 */

import { mockUsers } from '../mockUtils';
import { 
  mockStudentRecords, 
  mockStudentGrades, 
  mockDoctorRecords, 
  mockAssistantRecords, 
  mockAdminRecords,
  getStudentById,
  getGradesByStudentId,
  calculateStudentGPA
} from '../mockExtendedData';
import {
  mockSemesters,
  mockLevels,
  mockGroups,
  mockGroupMembers,
  getSemesterById,
  getLevelById,
  getGroupById,
  getGroupsByMember,
  getMembersByGroup,
  getCurrentSemester,
  formatSemesterName,
  getAcademicYears
} from '../mockAcademicData';
import {
  mockCourses,
  mockCourseRegistrationSettings,
  mockCourseRegisters,
  getCourseById,
  getCoursesByGroup,
  getCoursesByLevel,
  getRegistrationSettingsBySemester,
  getStudentRegistrations,
  getConfirmedRegistrations,
  getStudentsInCourse,
  calculateStudentRegisteredHours,
  isRegistrationOpen
} from '../mockCourseData';
import { mockSchedules, mockQuizzes, mockAssignments, mockAnalyticsData, delay } from '../mockUtils';

// Add a delay to simulate network latency
const SIMULATED_DELAY = 300; // milliseconds

/**
 * User API Services
 */
export const userService = {
  // Get current user profile
  getCurrentUser: async () => {
    await delay(SIMULATED_DELAY);
    // Get user from localStorage (set during login)
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw new Error('User not authenticated');
    }
    
    const user = JSON.parse(userStr);
    return { success: true, data: user };
  },
  
  // Get user details by ID
  getUserById: async (userId) => {
    await delay(SIMULATED_DELAY);
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    return { success: true, data: user };
  },
  
  // Update user profile
  updateUserProfile: async (userData) => {
    await delay(SIMULATED_DELAY);
    // In a real app, this would update the backend
    // For mock, we'll just return success
    return { success: true, data: userData };
  }
};

/**
 * Student API Services
 */
export const studentService = {
  // Get student academic record
  getStudentRecord: async (studentId) => {
    await delay(SIMULATED_DELAY);
    const student = getStudentById(studentId);
    if (!student) {
      return { success: false, message: 'Student record not found' };
    }
    return { success: true, data: student };
  },
  
  // Get student grades
  getStudentGrades: async (studentId) => {
    await delay(SIMULATED_DELAY);
    const grades = getGradesByStudentId(studentId);
    return { success: true, data: grades };
  },
  
  // Calculate student GPA
  getStudentGPA: async (studentId) => {
    await delay(SIMULATED_DELAY);
    const gpa = calculateStudentGPA(studentId);
    return { success: true, data: { gpa } };
  },
  
  // Get registered courses for a student
  getRegisteredCourses: async (studentId) => {
    await delay(SIMULATED_DELAY);
    
    // Get student registrations
    const registrations = getConfirmedRegistrations(studentId);
    
    // Map registrations to course details
    const registeredCourses = registrations.map(reg => {
      const course = getCourseById(reg.courseid);
      const semester = getSemesterById(reg.semesterid);
      return {
        id: reg.courseid,
        name: course?.coursename || 'Unknown Course',
        code: course?.coursecode || reg.courseid,
        instructor: course?.instructorid || 'Unknown Instructor',
        hours: course?.coursehours || 3,
        group: course?.group || '',
        level: course?.level || 1,
        semester: formatSemesterName(semester),
        semesterId: reg.semesterid,
        confirmDate: reg.confirmDate
      };
    });
    
    return { success: true, data: registeredCourses };
  },
  
  // Get pending course registrations
  getPendingRegistrations: async (studentId) => {
    await delay(SIMULATED_DELAY);
    
    const pendingRegs = mockCourseRegisters.filter(reg => 
      reg.studentid === studentId && 
      reg.confirm === false && 
      reg.isRejected === false
    );
    
    const pendingCourses = pendingRegs.map(reg => {
      const course = getCourseById(reg.courseid);
      return {
        id: reg.id,
        courseId: reg.courseid,
        courseName: course?.coursename || 'Unknown Course',
        courseCode: course?.coursecode || reg.courseid,
        semesterId: reg.semesterid,
        hours: course?.coursehours || 3,
        createdAt: reg.createdAt
      };
    });
    
    return { success: true, data: pendingCourses };
  },
  
  // Get student groups
  getStudentGroups: async (studentId) => {
    await delay(SIMULATED_DELAY);
    const groups = getGroupsByMember(studentId);
    return { success: true, data: groups };
  },
  
  // Register for a course
  registerForCourse: async (studentId, courseId, semesterId) => {
    await delay(SIMULATED_DELAY);
    
    // Check if registration is open
    if (!isRegistrationOpen(semesterId)) {
      return { 
        success: false, 
        message: 'Course registration is not open for this semester' 
      };
    }
    
    // Check if already registered
    const existingReg = mockCourseRegisters.find(
      reg => reg.studentid === studentId && 
             reg.courseid === courseId && 
             reg.semesterid === semesterId &&
             !reg.isRejected
    );
    
    if (existingReg) {
      return { 
        success: false, 
        message: 'You are already registered for this course' 
      };
    }
    
    // Check credit hour limits
    const course = getCourseById(courseId);
    if (!course) {
      return { 
        success: false, 
        message: 'Course not found' 
      };
    }
    
    const currentHours = calculateStudentRegisteredHours(studentId, semesterId);
    const settings = getRegistrationSettingsBySemester(semesterId);
    const student = getStudentById(studentId);
    
    let maxAllowedHours = student?.maxhours || 18;
    
    // Apply GPA conditions if applicable
    if (settings?.gpaconditions) {
      try {
        const conditions = JSON.parse(settings.gpaconditions);
        const gpa = parseFloat(calculateStudentGPA(studentId));
        
        for (const condition of conditions) {
          if (gpa < condition.lowerthan) {
            maxAllowedHours = condition.maxhours;
            break;
          }
        }
      } catch (err) {
        console.error('Error parsing GPA conditions:', err);
      }
    }
    
    if (currentHours + course.coursehours > maxAllowedHours) {
      return { 
        success: false, 
        message: `Cannot register for this course. It would exceed your maximum allowed hours (${maxAllowedHours})` 
      };
    }
    
    // Mock successful registration
    const newRegistration = {
      id: mockCourseRegisters.length + 1,
      studentid: studentId,
      courseid: courseId,
      semesterid: semesterId,
      confirm: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isRejected: false,
      rejectionReason: "",
      confirmDate: null,
      rejectionDate: null
    };
    
    // In a real implementation, we would add this to the database
    // For mock, we'll just return success
    return { 
      success: true, 
      message: 'Course registration request submitted',
      data: newRegistration
    };
  }
};

/**
 * Course API Services
 */
export const courseService = {
  // Get all courses
  getAllCourses: async () => {
    await delay(SIMULATED_DELAY);
    return { success: true, data: mockCourses };
  },
  
  // Get course by ID
  getCourseById: async (courseId) => {
    await delay(SIMULATED_DELAY);
    const course = getCourseById(courseId);
    if (!course) {
      return { success: false, message: 'Course not found' };
    }
    return { success: true, data: course };
  },
  
  // Get courses by department/group
  getCoursesByGroup: async (group) => {
    await delay(SIMULATED_DELAY);
    const courses = getCoursesByGroup(group);
    return { success: true, data: courses };
  },
  
  // Get courses by level
  getCoursesByLevel: async (level) => {
    await delay(SIMULATED_DELAY);
    const courses = getCoursesByLevel(parseInt(level));
    return { success: true, data: courses };
  },
  
  // Get courses available for registration
  getAvailableCourses: async (semesterId) => {
    await delay(SIMULATED_DELAY);
    
    if (!isRegistrationOpen(semesterId)) {
      return { 
        success: false, 
        message: 'Course registration is not open for this semester' 
      };
    }
    
    // Filter courses by semester name
    const semester = getSemesterById(semesterId);
    if (!semester) {
      return { success: false, message: 'Semester not found' };
    }
    
    const courses = mockCourses.filter(course => course.semestername === semester.semester);
    return { success: true, data: courses };
  },
  
  // Get students in a course
  getStudentsInCourse: async (courseId, semesterId) => {
    await delay(SIMULATED_DELAY);
    
    const studentIds = getStudentsInCourse(courseId, semesterId);
    const students = studentIds.map(id => {
      const user = mockUsers.find(u => u.id === id);
      const studentRecord = getStudentById(id);
      
      return {
        id,
        name: user?.name || 'Unknown Student',
        major: studentRecord?.major || 'Unknown Major',
        section: studentRecord?.section || '-'
      };
    });
    
    return { success: true, data: students };
  },
  
  // Get registration settings for a semester
  getRegistrationSettings: async (semesterId) => {
    await delay(SIMULATED_DELAY);
    
    const settings = getRegistrationSettingsBySemester(semesterId);
    if (!settings) {
      return { success: false, message: 'Registration settings not found' };
    }
    
    return { success: true, data: settings };
  }
};

/**
 * Schedule API Services
 */
export const scheduleService = {
  // Get all schedules
  getAllSchedules: async () => {
    await delay(SIMULATED_DELAY);
    return { success: true, data: mockSchedules };
  },
  
  // Get schedule by ID
  getScheduleById: async (scheduleId) => {
    await delay(SIMULATED_DELAY);
    const schedule = mockSchedules.find(s => s.id === scheduleId);
    if (!schedule) {
      return { success: false, message: 'Schedule not found' };
    }
    return { success: true, data: schedule };
  }
};

/**
 * Quiz API Services
 */
export const quizService = {
  // Get all quizzes for a student
  getStudentQuizzes: async () => {
    await delay(SIMULATED_DELAY);
    return { success: true, data: mockQuizzes };
  },
  
  // Get quizzes for a specific course
  getQuizzesByCourse: async (courseId) => {
    await delay(SIMULATED_DELAY);
    const quizzes = mockQuizzes.filter(q => q.courseId === courseId);
    return { success: true, data: quizzes };
  }
};

/**
 * Assignment API Services
 */
export const assignmentService = {
  // Get all assignments for a student
  getStudentAssignments: async () => {
    await delay(SIMULATED_DELAY);
    return { success: true, data: mockAssignments };
  },
  
  // Get assignments for a specific course
  getAssignmentsByCourse: async (courseId) => {
    await delay(SIMULATED_DELAY);
    const assignments = mockAssignments.filter(a => a.courseId === courseId);
    return { success: true, data: assignments };
  }
};

/**
 * Admin API Services
 */
export const adminService = {
  // Get admin record
  getAdminRecord: async (adminId) => {
    await delay(SIMULATED_DELAY);
    const admin = mockAdminRecords.find(a => a.adminid === adminId);
    if (!admin) {
      return { success: false, message: 'Admin record not found' };
    }
    return { success: true, data: admin };
  },
  
  // Get analytics data
  getAnalyticsData: async () => {
    await delay(SIMULATED_DELAY);
    return { success: true, data: mockAnalyticsData };
  },
  
  // Get all students
  getAllStudents: async () => {
    await delay(SIMULATED_DELAY);
    const students = mockUsers.filter(u => u.type === 0);
    return { success: true, data: students };
  },
  
  // Get all faculty
  getAllFaculty: async () => {
    await delay(SIMULATED_DELAY);
    const faculty = mockUsers.filter(u => u.type === 1 || u.type === 2 || u.type === 4);
    return { success: true, data: faculty };
  },
  
  // Update registration settings
  updateRegistrationSettings: async (semesterId, settingsData) => {
    await delay(SIMULATED_DELAY);
    // In a real app, this would update the backend
    // For mock, we'll just return success
    return { 
      success: true, 
      message: 'Registration settings updated',
      data: { ...settingsData, semesterid: semesterId }
    };
  },
  
  // Approve course registration
  approveRegistration: async (registrationId) => {
    await delay(SIMULATED_DELAY);
    // In a real app, this would update the backend
    // For mock, we'll just return success
    return { 
      success: true, 
      message: 'Course registration approved'
    };
  },
  
  // Reject course registration
  rejectRegistration: async (registrationId, reason) => {
    await delay(SIMULATED_DELAY);
    // In a real app, this would update the backend
    // For mock, we'll just return success
    return { 
      success: true, 
      message: 'Course registration rejected'
    };
  }
};

/**
 * Academic API Services (for semesters, levels, groups)
 */
export const academicService = {
  // Get all semesters
  getAllSemesters: async () => {
    await delay(SIMULATED_DELAY);
    return { success: true, data: mockSemesters };
  },
  
  // Get current semester
  getCurrentSemester: async () => {
    await delay(SIMULATED_DELAY);
    const semester = getCurrentSemester();
    return { success: true, data: semester };
  },
  
  // Get semester by ID
  getSemesterById: async (semesterId) => {
    await delay(SIMULATED_DELAY);
    const semester = getSemesterById(semesterId);
    if (!semester) {
      return { success: false, message: 'Semester not found' };
    }
    return { success: true, data: semester };
  },
  
  // Get all academic levels
  getAllLevels: async () => {
    await delay(SIMULATED_DELAY);
    return { success: true, data: mockLevels };
  },
  
  // Get all groups
  getAllGroups: async () => {
    await delay(SIMULATED_DELAY);
    return { success: true, data: mockGroups };
  },
  
  // Get group members
  getGroupMembers: async (groupId) => {
    await delay(SIMULATED_DELAY);
    const memberIds = getMembersByGroup(groupId);
    const members = memberIds.map(id => mockUsers.find(u => u.id === id)).filter(Boolean);
    return { success: true, data: members };
  },
  
  // Get academic years
  getAcademicYears: async () => {
    await delay(SIMULATED_DELAY);
    return { success: true, data: getAcademicYears() };
  }
};

// Export a default service that combines all services
export default {
  user: userService,
  student: studentService,
  course: courseService,
  schedule: scheduleService,
  quiz: quizService,
  assignment: assignmentService,
  admin: adminService,
  academic: academicService
}; 