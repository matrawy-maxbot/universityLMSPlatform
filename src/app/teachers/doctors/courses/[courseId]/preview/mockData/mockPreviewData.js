// Mock data for course preview module

// Helper function to simulate API delay
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock course data
export const mockCourseData = {
  id: 1,
  coursename: "Software Engineering",
  coursecode: "CS305",
  coursehours: 3,
  group: "Group 1",
  level: 3,
  requirement: "Optional Requirement",
  instructor: {
    avatar: "/images/shadcn.jpg",
    name: "Eng. Ahmed Khaled",
    title: "Assistant"
  },
  assistantDetails: [
    {
      id: "A001",
      firstname: "Ahmed",
      secondname: "Khaled",
      lastname: "Ibrahim",
      profileimage: "/images/shadcn.jpg"
    }
  ]
};

// Mock students data
export const mockStudents = [
  {
    id: "S001",
    firstname: "John",
    secondname: "David",
    thirdname: "",
    lastname: "Doe",
    profileimage: "https://i.pravatar.cc/150?img=1",
    grade: "95",
    assignments: "48/50",
    quizzes: "47/50",
    status: "excellent"
  },
  {
    id: "S002",
    firstname: "Jane",
    secondname: "Marie",
    thirdname: "",
    lastname: "Smith",
    profileimage: "https://i.pravatar.cc/150?img=2",
    grade: "88",
    assignments: "45/50",
    quizzes: "43/50",
    status: "good"
  },
  {
    id: "S003",
    firstname: "Michael",
    secondname: "James",
    thirdname: "",
    lastname: "Brown",
    profileimage: "https://i.pravatar.cc/150?img=3",
    grade: "75",
    assignments: "40/50",
    quizzes: "38/50",
    status: "average"
  },
  {
    id: "S004",
    firstname: "Emily",
    secondname: "Rose",
    thirdname: "",
    lastname: "Davis",
    profileimage: "https://i.pravatar.cc/150?img=4",
    grade: "65",
    assignments: "35/50",
    quizzes: "32/50",
    status: "needs_improvement"
  },
  {
    id: "S005",
    firstname: "Daniel",
    secondname: "Thomas",
    thirdname: "",
    lastname: "Wilson",
    profileimage: "https://i.pravatar.cc/150?img=5",
    grade: "55",
    assignments: "30/50",
    quizzes: "28/50",
    status: "failing"
  }
];

// Mock API functions
export const mockApis = {
  // Get course details
  getCourseDetails: async (courseId) => {
    await delay(800);
    return {
      data: {
        course: mockCourseData,
        students: mockStudents
      }
    };
  }
}; 