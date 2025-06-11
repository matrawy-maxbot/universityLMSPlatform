// Mock data for grades module

// Helper function to simulate API delay
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock course data
export const mockCourseData = {
  id: 1,
  coursename: "Introduction to Computer Science",
  coursecode: "CS101",
  coursehours: 3,
  group: "Group 1",
  level: 3,
  requirement: "Core Requirement",
  instructor: {
    avatar: "/images/shadcn.jpg",
    name: "Dr. Ahmed Mohamed",
    title: "Professor"
  },
  assistantDetails: [
    {
      id: "A001",
      firstname: "Ahmed",
      secondname: "Mohamed",
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
    profileimage: "https://i.pravatar.cc/150?img=1"
  },
  {
    id: "S002",
    firstname: "Jane",
    secondname: "Marie",
    thirdname: "",
    lastname: "Smith",
    profileimage: "https://i.pravatar.cc/150?img=2"
  },
  {
    id: "S003",
    firstname: "Michael",
    secondname: "James",
    thirdname: "",
    lastname: "Brown",
    profileimage: "https://i.pravatar.cc/150?img=3"
  },
  {
    id: "S004",
    firstname: "Emily",
    secondname: "Rose",
    thirdname: "",
    lastname: "Davis",
    profileimage: "https://i.pravatar.cc/150?img=4"
  },
  {
    id: "S005",
    firstname: "Daniel",
    secondname: "Thomas",
    thirdname: "",
    lastname: "Wilson",
    profileimage: "https://i.pravatar.cc/150?img=5"
  }
];

// Mock saved table data
export const mockTableData = {
  headers: ["Student", "Date", "Grade", "Assignments", "Quizzes", "Status"],
  values: [
    {
      student_id: "S001",
      date: "2024/02/15",
      grade: "95",
      assignments: "48/50",
      quizzes: "47/50",
      status: "excellent"
    },
    {
      student_id: "S002",
      date: "2024/02/16",
      grade: "88",
      assignments: "45/50",
      quizzes: "43/50",
      status: "good"
    },
    {
      student_id: "S003",
      date: "2024/02/17",
      grade: "75",
      assignments: "40/50",
      quizzes: "38/50",
      status: "average"
    },
    {
      student_id: "S004",
      date: "2024/02/18",
      grade: "65",
      assignments: "35/50",
      quizzes: "32/50",
      status: "needs_improvement"
    },
    {
      student_id: "S005",
      date: "2024/02/19",
      grade: "55",
      assignments: "30/50",
      quizzes: "28/50",
      status: "failing"
    }
  ]
};

// Mock API functions
export const mockApis = {
  // Get course details
  getCourseDetails: async (courseId) => {
    await delay(800);
    return {
      data: {
        data: {
          course: mockCourseData,
          students: mockStudents
        }
      }
    };
  },
  
  // Get saved table data
  getTableData: async (courseId) => {
    await delay(600);
    return {
      data: {
        data: mockTableData
      }
    };
  },
  
  // Save table data
  saveTableData: async (courseId, tableData) => {
    await delay(1000);
    return {
      data: {
        message: "Table data saved successfully",
        data: tableData
      }
    };
  }
}; 