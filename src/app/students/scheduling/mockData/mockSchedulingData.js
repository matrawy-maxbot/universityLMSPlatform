// Mock data for scheduling module

// Helper function to simulate API delay
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock schedules data
export const mockSchedules = [
  {
    id: 1,
    title: "Software Engineering - Level 3",
    image: "/images/schedule.jpg",
    createdAt: "2023-05-28T10:20:30.000Z",
    updatedAt: "2023-05-28T10:20:30.000Z",
    author_id: "D001",
    author: {
      id: "D001",
      firstname: "Ahmed",
      lastname: "Emad",
      profileimage: "/images/shadcn.jpg"
    },
    groups: [
      { id: "G1", name: "Group 1" },
      { id: "G2", name: "Group 2" },
      { id: "All", name: "All Students" }
    ],
    time_periods: [
      { id: 0, start: "08:00 AM", end: "09:00 AM" },
      { id: 1, start: "09:00 AM", end: "10:00 AM" },
      { id: 2, start: "10:00 AM", end: "11:00 AM" },
      { id: 3, start: "11:00 AM", end: "12:00 PM" },
      { id: 4, start: "12:00 PM", end: "01:00 PM" },
      { id: 5, start: "01:00 PM", end: "02:00 PM" },
      { id: 6, start: "02:00 PM", end: "03:00 PM" },
      { id: 7, start: "03:00 PM", end: "04:00 PM" },
      { id: 8, start: "04:00 PM", end: "05:00 PM" }
    ],
    schedule_data: {
      Saturday: [
        null,
        {
          "ALL": {
            "G1": {
              courseCode: "CS201",
              courseName: "Data Structures",
              instructor: "Dr. Ahmed Ibrahim",
              room: "H101",
              isLecture: true,
              isLab: false
            }
          }
        },
        {
          "ALL": {
            "G1": {
              courseCode: "CS201",
              courseName: "Data Structures",
              instructor: "Dr. Ahmed Ibrahim",
              room: "H101",
              isLecture: true,
              isLab: false
            }
          }
        },
        null,
        {
          "SEC": {
            "G1": {
              courseCode: "CS202",
              courseName: "Database Systems",
              instructor: "Eng. Omar Ahmed",
              room: "H203",
              isLecture: false,
              isLab: false
            }
          }
        },
        {
          "SEC": {
            "G1": {
              courseCode: "CS202",
              courseName: "Database Systems",
              instructor: "Eng. Omar Ahmed",
              room: "H203",
              isLecture: false,
              isLab: false
            }
          }
        },
        null,
        null,
        null
      ],
      Sunday: [
        null,
        null,
        {
          "ALL": {
            "G1": {
              courseCode: "CS203",
              courseName: "Operating Systems",
              instructor: "Dr. Mohamed Hassan",
              room: "H102",
              isLecture: true,
              isLab: false
            }
          }
        },
        {
          "ALL": {
            "G1": {
              courseCode: "CS203",
              courseName: "Operating Systems",
              instructor: "Dr. Mohamed Hassan",
              room: "H102",
              isLecture: true,
              isLab: false
            }
          }
        },
        null,
        null,
        null,
        null
      ],
      Monday: [
        null,
        {
          "ALL": {
            "G1": {
              courseCode: "CS202",
              courseName: "Database Systems",
              instructor: "Dr. Aisha Mahmoud",
              room: "H101",
              isLecture: true,
              isLab: false
            }
          }
        },
        {
          "ALL": {
            "G1": {
              courseCode: "CS202",
              courseName: "Database Systems",
              instructor: "Dr. Aisha Mahmoud",
              room: "H101",
              isLecture: true,
              isLab: false
            }
          }
        },
        null,
        null,
        {
          "SEC": {
            "G1": {
              courseCode: "CS201",
              courseName: "Data Structures",
              instructor: "Eng. Omar Ahmed",
              room: "H202",
              isLecture: false,
              isLab: false
            }
          }
        },
        {
          "SEC": {
            "G1": {
              courseCode: "CS201",
              courseName: "Data Structures",
              instructor: "Eng. Omar Ahmed",
              room: "H202",
              isLecture: false,
              isLab: false
            }
          }
        },
        null,
        null
      ],
      Tuesday: [
        null,
        null,
        {
          "ALL": {
            "G1": {
              courseCode: "CS204",
              courseName: "Computer Networks",
              instructor: "Dr. Khaled Ali",
              room: "H103",
              isLecture: true,
              isLab: false
            }
          }
        },
        {
          "ALL": {
            "G1": {
              courseCode: "CS204",
              courseName: "Computer Networks",
              instructor: "Dr. Khaled Ali",
              room: "H103",
              isLecture: true,
              isLab: false
            }
          }
        },
        null,
        {
          "SEC": {
            "G1": {
              courseCode: "CS203",
              courseName: "Operating Systems",
              instructor: "Eng. Yasser Karim",
              room: "H201",
              isLecture: false,
              isLab: false
            }
          }
        },
        {
          "SEC": {
            "G1": {
              courseCode: "CS203",
              courseName: "Operating Systems",
              instructor: "Eng. Yasser Karim",
              room: "H201",
              isLecture: false,
              isLab: false
            }
          }
        },
        null,
        null
      ],
      Wednesday: [
        null,
        {
          "ALL": {
            "G1": {
              courseCode: "CS205",
              courseName: "Software Engineering",
              instructor: "Dr. Fatima Saleh",
              room: "H104",
              isLecture: true,
              isLab: false
            }
          }
        },
        {
          "ALL": {
            "G1": {
              courseCode: "CS205",
              courseName: "Software Engineering",
              instructor: "Dr. Fatima Saleh",
              room: "H104",
              isLecture: true,
              isLab: false
            }
          }
        },
        null,
        null,
        null
      ],
      Thursday: [
        null,
        null,
        null,
        {
          "SEC": {
            "G1": {
              courseCode: "CS205",
              courseName: "Software Engineering",
              instructor: "Eng. Hossam Adel",
              room: "H204",
              isLecture: false,
              isLab: false
            }
          }
        },
        {
          "SEC": {
            "G1": {
              courseCode: "CS205",
              courseName: "Software Engineering",
              instructor: "Eng. Hossam Adel",
              room: "H204",
              isLecture: false,
              isLab: false
            }
          }
        },
        null,
        null,
        null,
        null
      ],
      Friday: Array(9).fill(null)
    },
    scheduleType: 'weekly',
    department_id: "CS"
  },
  {
    id: 2,
    title: "Computer Science - Level 2",
    image: "/images/schedule2.png",
    createdAt: "2023-05-20T08:15:00.000Z",
    updatedAt: "2023-05-25T14:30:00.000Z",
    author_id: "D002",
    author: {
      id: "D002",
      firstname: "Fatima",
      lastname: "Ali",
      profileimage: "/images/shadcn.jpg"
    },
    groups: [
      { id: "G1", name: "Group 1" },
      { id: "G2", name: "Group 2" },
      { id: "All", name: "All Students" }
    ],
    time_periods: [
      { id: 0, start: "08:00 AM", end: "09:00 AM" },
      { id: 1, start: "09:00 AM", end: "10:00 AM" },
      { id: 2, start: "10:00 AM", end: "11:00 AM" },
      { id: 3, start: "11:00 AM", end: "12:00 PM" },
      { id: 4, start: "12:00 PM", end: "01:00 PM" },
      { id: 5, start: "01:00 PM", end: "02:00 PM" },
      { id: 6, start: "02:00 PM", end: "03:00 PM" },
      { id: 7, start: "03:00 PM", end: "04:00 PM" },
      { id: 8, start: "04:00 PM", end: "05:00 PM" }
    ],
    schedule_data: {
      Saturday: Array(9).fill(null),
      Sunday: Array(9).fill(null),
      Monday: Array(9).fill(null),
      Tuesday: Array(9).fill(null),
      Wednesday: Array(9).fill(null),
      Thursday: Array(9).fill(null),
      Friday: Array(9).fill(null)
    },
    scheduleType: 'weekly',
    department_id: "CS"
  }
];

// Mock quizzes data
export const mockQuizzes = [
  {
    id: 1,
    title: 'Quiz 2: Data Structures',
    course: 'Data Structures',
    courseId: 'CS201',
    instructor: 'Dr. Ahmed Ibrahim',
    status: 'active',
    startTime: new Date(new Date().getFullYear(), new Date().getMonth(), 15, 10, 0, 0).toISOString(),
    endTime: new Date(new Date().getFullYear(), new Date().getMonth(), 15, 12, 0, 0).toISOString(),
    createdAt: new Date(new Date().getFullYear(), new Date().getMonth(), 10, 14, 30, 0).toISOString(),
    formLink: 'https://forms.google.com/quiz1',
    description: 'This quiz covers searching and sorting algorithms. Make sure to review Big O notation and complexity analysis.'
  },
  {
    id: 2,
    title: 'Quiz 1: Database Systems',
    course: 'Database Systems',
    courseId: 'CS202',
    instructor: 'Dr. Aisha Mahmoud',
    status: 'scheduled',
    startTime: new Date(new Date().getFullYear(), new Date().getMonth(), 20, 9, 0, 0).toISOString(),
    endTime: new Date(new Date().getFullYear(), new Date().getMonth(), 20, 10, 0, 0).toISOString(),
    createdAt: new Date(new Date().getFullYear(), new Date().getMonth(), 12, 11, 45, 0).toISOString(),
    formLink: 'https://forms.google.com/quiz2',
    description: 'This quiz will cover database normalization, SQL basics, and ER diagrams.'
  },
  {
    id: 3,
    title: 'Quiz 1: Operating Systems',
    course: 'Operating Systems',
    courseId: 'CS203',
    instructor: 'Dr. Mohamed Hassan',
    status: 'completed',
    startTime: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 25, 14, 0, 0).toISOString(),
    endTime: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 25, 15, 0, 0).toISOString(),
    createdAt: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 20, 9, 30, 0).toISOString(),
    formLink: 'https://forms.google.com/quiz3',
    description: 'This quiz covered process management and scheduling algorithms.'
  }
];

// Mock assignments data
export const mockAssignments = [
  {
    id: 1,
    title: 'Assignment 1: Database Design',
    course: 'Database Systems',
    courseId: 'CS202',
    instructor: 'Dr. Aisha Mahmoud',
    status: 'active',
    startTime: new Date(new Date().getFullYear(), new Date().getMonth(), 10, 9, 0, 0).toISOString(),
    endTime: new Date(new Date().getFullYear(), new Date().getMonth(), 25, 23, 59, 59).toISOString(),
    createdAt: new Date(new Date().getFullYear(), new Date().getMonth(), 8, 14, 30, 0).toISOString(),
    description: 'Design a database schema for a student management system. Include ER diagrams and SQL creation scripts.',
    files: [
      { id: 1, name: 'assignment_instructions.pdf', url: '/files/assignment_instructions.pdf', size: '250 KB' }
    ]
  },
  {
    id: 2,
    title: 'Assignment 2: Operating System Concepts',
    course: 'Operating Systems',
    courseId: 'CS203',
    instructor: 'Dr. Mohamed Hassan',
    status: 'active',
    startTime: new Date(new Date().getFullYear(), new Date().getMonth(), 5, 10, 0, 0).toISOString(),
    endTime: new Date(new Date().getFullYear(), new Date().getMonth(), 18, 23, 59, 59).toISOString(),
    createdAt: new Date(new Date().getFullYear(), new Date().getMonth(), 3, 11, 15, 0).toISOString(),
    description: 'Implement a simple process scheduler using any programming language of your choice.',
    files: [
      { id: 2, name: 'scheduler_requirements.docx', url: '/files/scheduler_requirements.docx', size: '180 KB' }
    ]
  },
  {
    id: 3,
    title: 'Assignment 1: Network Protocols',
    course: 'Computer Networks',
    courseId: 'CS204',
    instructor: 'Dr. Khaled Ali',
    status: 'completed',
    startTime: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 15, 9, 0, 0).toISOString(),
    endTime: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 29, 23, 59, 59).toISOString(),
    createdAt: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 12, 10, 45, 0).toISOString(),
    description: 'Write a research paper on TCP/IP protocol suite and its implementation in modern networks.',
    files: []
  }
];

// Mock API functions
export const mockApis = {
  // Get all schedules
  getAllSchedules: async () => {
    await delay(800);
    return mockSchedules;
  },
  
  // Get schedule by ID
  getScheduleById: async (id) => {
    await delay(600);
    const schedule = mockSchedules.find(s => s.id.toString() === id.toString());
    if (!schedule) {
      throw new Error(`Schedule with ID ${id} not found`);
    }
    return schedule;
  },
  
  // Get student quizzes
  getStudentQuizzes: async () => {
    await delay(900);
    return mockQuizzes;
  },
  
  // Get student quizzes by course
  getStudentQuizzesByCourse: async (courseId) => {
    await delay(700);
    return mockQuizzes.filter(q => q.courseId === courseId);
  },
  
  // Get student assignments
  getStudentAssignments: async () => {
    await delay(1000);
    return mockAssignments;
  },
  
  // Get student assignments by course
  getStudentAssignmentsByCourse: async (courseId) => {
    await delay(800);
    return mockAssignments.filter(a => a.courseId === courseId);
  }
}; 