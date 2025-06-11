// Mock data for student grades module

// Helper function to simulate API delay
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock semesters data
export const mockSemesters = [
  {
    id: '1',
    semester: 'الفصل الدراسي الأول 2023-2024',
    isActive: true,
    startDate: '2023-09-01',
    endDate: '2024-01-15'
  },
  {
    id: '2',
    semester: 'الفصل الدراسي الثاني 2023-2024',
    isActive: false,
    startDate: '2024-02-01',
    endDate: '2024-06-15'
  },
  {
    id: '3',
    semester: 'الفصل الصيفي 2024',
    isActive: false,
    startDate: '2024-07-01',
    endDate: '2024-08-15'
  }
];

// Mock courses data by semester
export const mockCoursesBySemester = {
  '1': [
    {
      id: '101',
      courseid: 'CS101',
      coursename: 'مقدمة في علوم الحاسب',
      coursecode: 'CS101',
      defaultmaxpoints: 100,
      Course: {
        id: 'CS101',
        coursename: 'مقدمة في علوم الحاسب',
        coursecode: 'CS101'
      }
    },
    {
      id: '102',
      courseid: 'CS102',
      coursename: 'برمجة الحاسب',
      coursecode: 'CS102',
      defaultmaxpoints: 100,
      Course: {
        id: 'CS102',
        coursename: 'برمجة الحاسب',
        coursecode: 'CS102'
      }
    },
    {
      id: '103',
      courseid: 'MATH101',
      coursename: 'رياضيات متقطعة',
      coursecode: 'MATH101',
      defaultmaxpoints: 100,
      Course: {
        id: 'MATH101',
        coursename: 'رياضيات متقطعة',
        coursecode: 'MATH101'
      }
    }
  ],
  '2': [
    {
      id: '201',
      courseid: 'CS201',
      coursename: 'هياكل البيانات',
      coursecode: 'CS201',
      defaultmaxpoints: 100,
      Course: {
        id: 'CS201',
        coursename: 'هياكل البيانات',
        coursecode: 'CS201'
      }
    },
    {
      id: '202',
      courseid: 'CS202',
      coursename: 'تصميم قواعد البيانات',
      coursecode: 'CS202',
      defaultmaxpoints: 100,
      Course: {
        id: 'CS202',
        coursename: 'تصميم قواعد البيانات',
        coursecode: 'CS202'
      }
    }
  ],
  '3': [
    {
      id: '301',
      courseid: 'CS301',
      coursename: 'تطوير تطبيقات الويب',
      coursecode: 'CS301',
      defaultmaxpoints: 100,
      Course: {
        id: 'CS301',
        coursename: 'تطوير تطبيقات الويب',
        coursecode: 'CS301'
      }
    }
  ]
};

// Mock student grades data by course and semester
export const mockStudentGrades = {
  // Semester 1, Course CS101
  'CS101-1': [
    {
      id: '1001',
      name: 'أحمد محمد علي',
      studentId: '1001',
      courseId: 'CS101',
      semesterId: '1',
      points: 85,
      maxPoints: 100,
      percentage: 85,
      status: 'ناجح',
      gradeId: 'g1001'
    },
    {
      id: '1002',
      name: 'سارة أحمد إبراهيم',
      studentId: '1002',
      courseId: 'CS101',
      semesterId: '1',
      points: 92,
      maxPoints: 100,
      percentage: 92,
      status: 'ناجح',
      gradeId: 'g1002'
    },
    {
      id: '1003',
      name: 'محمود خالد عبد الرحمن',
      studentId: '1003',
      courseId: 'CS101',
      semesterId: '1',
      points: 78,
      maxPoints: 100,
      percentage: 78,
      status: 'ناجح',
      gradeId: 'g1003'
    },
    {
      id: '1004',
      name: 'فاطمة محمد سعيد',
      studentId: '1004',
      courseId: 'CS101',
      semesterId: '1',
      points: 45,
      maxPoints: 100,
      percentage: 45,
      status: 'راسب',
      gradeId: 'g1004'
    },
    {
      id: '1005',
      name: 'عمر أحمد حسن',
      studentId: '1005',
      courseId: 'CS101',
      semesterId: '1',
      points: 65,
      maxPoints: 100,
      percentage: 65,
      status: 'ناجح',
      gradeId: 'g1005'
    }
  ],
  
  // Semester 1, Course CS102
  'CS102-1': [
    {
      id: '1001',
      name: 'أحمد محمد علي',
      studentId: '1001',
      courseId: 'CS102',
      semesterId: '1',
      points: 75,
      maxPoints: 100,
      percentage: 75,
      status: 'ناجح',
      gradeId: 'g2001'
    },
    {
      id: '1002',
      name: 'سارة أحمد إبراهيم',
      studentId: '1002',
      courseId: 'CS102',
      semesterId: '1',
      points: 88,
      maxPoints: 100,
      percentage: 88,
      status: 'ناجح',
      gradeId: 'g2002'
    },
    {
      id: '1003',
      name: 'محمود خالد عبد الرحمن',
      studentId: '1003',
      courseId: 'CS102',
      semesterId: '1',
      points: 62,
      maxPoints: 100,
      percentage: 62,
      status: 'ناجح',
      gradeId: 'g2003'
    }
  ],
  
  // Semester 1, Course MATH101
  'MATH101-1': [
    {
      id: '1001',
      name: 'أحمد محمد علي',
      studentId: '1001',
      courseId: 'MATH101',
      semesterId: '1',
      points: 70,
      maxPoints: 100,
      percentage: 70,
      status: 'ناجح',
      gradeId: 'g3001'
    },
    {
      id: '1004',
      name: 'فاطمة محمد سعيد',
      studentId: '1004',
      courseId: 'MATH101',
      semesterId: '1',
      points: 55,
      maxPoints: 100,
      percentage: 55,
      status: 'ناجح',
      gradeId: 'g3002'
    },
    {
      id: '1005',
      name: 'عمر أحمد حسن',
      studentId: '1005',
      courseId: 'MATH101',
      semesterId: '1',
      points: 48,
      maxPoints: 100,
      percentage: 48,
      status: 'راسب',
      gradeId: 'g3003'
    }
  ],
  
  // Semester 2, Course CS201
  'CS201-2': [
    {
      id: '1001',
      name: 'أحمد محمد علي',
      studentId: '1001',
      courseId: 'CS201',
      semesterId: '2',
      points: 80,
      maxPoints: 100,
      percentage: 80,
      status: 'ناجح',
      gradeId: 'g4001'
    },
    {
      id: '1002',
      name: 'سارة أحمد إبراهيم',
      studentId: '1002',
      courseId: 'CS201',
      semesterId: '2',
      points: 95,
      maxPoints: 100,
      percentage: 95,
      status: 'ناجح',
      gradeId: 'g4002'
    }
  ],
  
  // Semester 2, Course CS202
  'CS202-2': [
    {
      id: '1003',
      name: 'محمود خالد عبد الرحمن',
      studentId: '1003',
      courseId: 'CS202',
      semesterId: '2',
      points: 72,
      maxPoints: 100,
      percentage: 72,
      status: 'ناجح',
      gradeId: 'g5001'
    },
    {
      id: '1004',
      name: 'فاطمة محمد سعيد',
      studentId: '1004',
      courseId: 'CS202',
      semesterId: '2',
      points: 68,
      maxPoints: 100,
      percentage: 68,
      status: 'ناجح',
      gradeId: 'g5002'
    }
  ],
  
  // Semester 3, Course CS301
  'CS301-3': [
    {
      id: '1005',
      name: 'عمر أحمد حسن',
      studentId: '1005',
      courseId: 'CS301',
      semesterId: '3',
      points: 0, // لم يتم إدخال الدرجة بعد
      maxPoints: 100,
      percentage: 0,
      status: 'راسب',
      gradeId: 'g6001'
    }
  ]
};

// Mock API functions
export const mockStudentGradesApi = {
  // Get all semesters
  getSemesters: async () => {
    await delay(800);
    return mockSemesters;
  },
  
  // Get current semester
  getCurrentSemester: async () => {
    await delay(500);
    return mockSemesters.find(sem => sem.isActive) || mockSemesters[0];
  },
  
  // Get courses by semester
  getCoursesBySemester: async (semesterId) => {
    await delay(800);
    return mockCoursesBySemester[semesterId] || [];
  },
  
  // Get student grades for a specific course and semester
  getStudentGrades: async (courseId, semesterId) => {
    await delay(1000);
    const key = `${courseId}-${semesterId}`;
    return mockStudentGrades[key] || [];
  },
  
  // Update student grade
  updateStudentGrade: async (gradeData) => {
    await delay(800);
    const { studentid, courseid, semesterid, points, maxpoints } = gradeData;
    
    // Find the key in mockStudentGrades
    const key = `${courseid}-${semesterid}`;
    
    // If the key exists in mockStudentGrades
    if (mockStudentGrades[key]) {
      // Find the student in the array
      const studentIndex = mockStudentGrades[key].findIndex(student => student.studentId === studentid);
      
      if (studentIndex !== -1) {
        // Calculate percentage
        const percentage = (points / maxpoints) * 100;
        
        // Determine status
        const status = percentage >= 50 ? 'ناجح' : 'راسب';
        
        // Update the student's grade
        mockStudentGrades[key][studentIndex] = {
          ...mockStudentGrades[key][studentIndex],
          points,
          maxPoints: maxpoints,
          percentage,
          status
        };
      }
    }
    
    return { success: true, message: 'تم تحديث الدرجة بنجاح' };
  },
  
  // Bulk update student grades
  bulkUpdateStudentGrades: async (gradesData) => {
    await delay(1200);
    
    for (const gradeData of gradesData) {
      await mockStudentGradesApi.updateStudentGrade(gradeData);
    }
    
    return { success: true, message: 'تم تحديث الدرجات بنجاح' };
  }
}; 