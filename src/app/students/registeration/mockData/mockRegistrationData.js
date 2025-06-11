// Mock data for registration module

// Helper function to simulate API delay
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Registration settings
export const mockRegistrationSettings = {
  id: 1,
  minhours: 9,
  maxhours: 18,
  open: true,
  createdAt: "2023-09-01T10:00:00.000Z",
  updatedAt: "2023-09-15T14:30:00.000Z"
};

// Current semester data
export const mockCurrentSemester = {
  id: 2,
  semester: "Fall",
  semesterstartyear: 2023,
  semesterendyear: 2024,
  createdAt: "2023-08-15T08:00:00.000Z",
  updatedAt: "2023-08-15T08:00:00.000Z"
};

// Student registration info
export const mockStudentData = {
  student: {
    id: 1001,
    firstname: "Ahmed",
    secondname: "Mohamed",
    lastname: "Ali",
    email: "ahmed.mohamed@example.com",
    maxhours: 18,
    registerationaccess: true
  },
  level: {
    id: 2,
    level: 2,
    User: {
      id: 101,
      firstname: "Khaled",
      secondname: "Ibrahim",
      lastname: "Hassan",
      email: "khaled.ibrahim@example.com"
    }
  },
  currentSemester: mockCurrentSemester,
  passedHours: 36,
  advisor: {
    id: 101,
    firstname: "Khaled",
    secondname: "Ibrahim",
    lastname: "Hassan",
    email: "khaled.ibrahim@example.com"
  }
};

// Available courses for registration
export const mockAvailableCourses = [
  {
    id: "CS201",
    coursecode: "CS201",
    coursename: "Data Structures and Algorithms",
    coursehours: 3,
    description: "Introduction to data structures and algorithm analysis"
  },
  {
    id: "CS202",
    coursecode: "CS202",
    coursename: "Database Systems",
    coursehours: 4,
    description: "Introduction to database design and implementation"
  },
  {
    id: "CS203",
    coursecode: "CS203",
    coursename: "Operating Systems",
    coursehours: 3,
    description: "Fundamentals of operating system design"
  },
  {
    id: "CS204",
    coursecode: "CS204",
    coursename: "Computer Networks",
    coursehours: 3,
    description: "Introduction to computer networking concepts"
  },
  {
    id: "CS205",
    coursecode: "CS205",
    coursename: "Software Engineering",
    coursehours: 3,
    description: "Principles of software engineering and development"
  }
];

// Already registered courses
export const mockRegisteredCourses = [
  {
    id: 1,
    courseid: "CS101",
    confirm: true,
    createdAt: "2023-09-10T09:00:00.000Z",
    updatedAt: "2023-09-10T09:00:00.000Z",
    Course: {
      coursecode: "CS101",
      coursename: "Introduction to Programming",
      coursehours: 4,
      description: "Introduction to programming concepts and problem solving"
    }
  },
  {
    id: 2,
    courseid: "CS102",
    confirm: false,
    createdAt: "2023-09-10T09:05:00.000Z",
    updatedAt: "2023-09-10T09:05:00.000Z",
    Course: {
      coursecode: "CS102",
      coursename: "Discrete Mathematics",
      coursehours: 3,
      description: "Mathematical foundations for computer science"
    }
  }
];

// Mock API functions
export const mockApis = {
  // Get student registration info
  getStudentRegistrationInfo: async () => {
    await delay(800);
    return { 
      data: mockStudentData 
    };
  },
  
  // Get registration settings
  getRegistrationSettings: async () => {
    await delay(600);
    return { 
      data: mockRegistrationSettings 
    };
  },
  
  // Get available courses
  getAvailableCourses: async () => {
    await delay(1000);
    return { 
      data: mockAvailableCourses 
    };
  },
  
  // Get registered courses
  getRegisteredCourses: async (semesterId) => {
    await delay(900);
    return { 
      data: mockRegisteredCourses 
    };
  },
  
  // Register courses
  registerCourses: async (registrationData) => {
    await delay(1500);
    return { 
      data: {
        message: "Courses registered successfully",
        registeredCourses: registrationData.courses.map(code => {
          const course = mockAvailableCourses.find(c => c.coursecode === code);
          return {
            id: Math.floor(Math.random() * 1000) + 100,
            courseid: code,
            confirm: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            Course: course
          };
        })
      }
    };
  },
  
  // Unregister course
  unregisterCourse: async (registrationId) => {
    await delay(800);
    return { 
      data: {
        message: "Course unregistered successfully"
      }
    };
  }
}; 