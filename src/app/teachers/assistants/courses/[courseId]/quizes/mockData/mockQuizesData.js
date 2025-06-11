// Mock data for quizes module

// Helper function to simulate API delay
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock quizzes data
export const mockQuizzes = [
  {
    id: 1,
    title: 'اختبار منتصف الفصل',
    course: 'Software Engineering',
    courseId: 'CS101',
    instructor: 'DR. Ahmed Emad',
    instructorAvatar: '/images/shadcn.jpg',
    status: 'active',
    startTime: '2024-07-25T10:00:00.000Z',
    endTime: '2024-08-10T23:59:59.000Z',
    createdAt: '2024-07-20T14:30:00.000Z',
    description: 'اختبار منتصف الفصل يغطي المواضيع من الفصل 1 إلى الفصل 5. يرجى الاطلاع على الملفات المرفقة للمراجعة.',
    totalPoints: 100,
    googleFormUrl: 'https://forms.gle/example1',
    attachedFiles: [
      { id: 'qf1', name: 'midterm_review.pdf', url: '/files/midterm_review.pdf', size: '250 KB' },
      { id: 'qf2', name: 'practice_questions.docx', url: '/files/practice_questions.docx', size: '120 KB' }
    ]
  },
  {
    id: 2,
    title: 'اختبار الفصل الأول',
    course: 'Database Systems',
    courseId: 'CS102',
    instructor: 'DR. Fatima Ali',
    instructorAvatar: '/images/avatars/fatima.jpg',
    status: 'completed',
    startTime: '2024-06-10T08:00:00.000Z',
    endTime: '2024-06-10T10:00:00.000Z',
    createdAt: '2024-06-05T11:20:00.000Z',
    description: 'اختبار الفصل الأول يغطي مقدمة في قواعد البيانات، النماذج العلائقية، والجبر العلائقي.',
    totalPoints: 50,
    googleFormUrl: 'https://forms.gle/example2',
    attachedFiles: [
      { id: 'qf3', name: 'chapter1_summary.pdf', url: '/files/chapter1_summary.pdf', size: '180 KB' }
    ]
  },
  {
    id: 3,
    title: 'اختبار قصير - الأسبوع الثالث',
    course: 'Software Engineering',
    courseId: 'CS101',
    instructor: 'DR. Ahmed Emad',
    instructorAvatar: '/images/shadcn.jpg',
    status: 'upcoming',
    startTime: '2024-09-05T14:00:00.000Z',
    endTime: '2024-09-05T14:30:00.000Z',
    createdAt: '2024-08-25T09:45:00.000Z',
    description: 'اختبار قصير يغطي مواضيع الأسبوع الثالث: دورة حياة تطوير البرمجيات ونماذج العمليات.',
    totalPoints: 20,
    googleFormUrl: 'https://forms.gle/example3',
    attachedFiles: []
  },
  {
    id: 4,
    title: 'اختبار نهاية الفصل',
    course: 'Software Engineering',
    courseId: 'CS101',
    instructor: 'DR. Ahmed Emad',
    instructorAvatar: '/images/shadcn.jpg',
    status: 'postponed',
    startTime: '2024-12-15T09:00:00.000Z',
    endTime: '2024-12-15T12:00:00.000Z',
    createdAt: '2024-11-30T10:15:00.000Z',
    description: 'اختبار نهاية الفصل الدراسي يغطي جميع المواضيع التي تمت دراستها خلال الفصل.',
    totalPoints: 150,
    googleFormUrl: 'https://forms.gle/example4',
    attachedFiles: [
      { id: 'qf4', name: 'final_exam_topics.pdf', url: '/files/final_exam_topics.pdf', size: '320 KB' },
      { id: 'qf5', name: 'sample_questions.pdf', url: '/files/sample_questions.pdf', size: '450 KB' }
    ]
  }
];

// Mock API functions
export const mockQuizApi = {
  // Get quizzes for a course
  getQuizzesByCourse: async (courseId) => {
    await delay(800);
    return mockQuizzes.filter(quiz => quiz.courseId === courseId || courseId === '101');
  },
  
  // Get quiz by ID
  getQuizById: async (id) => {
    await delay(500);
    const quiz = mockQuizzes.find(q => q.id === parseInt(id));
    return quiz || null;
  },
  
  // Create new quiz
  createQuiz: async (quizData) => {
    await delay(1000);
    const newQuiz = {
      id: mockQuizzes.length + 1,
      ...quizData,
      instructor: 'DR. Ahmed Emad', // افتراضي
      instructorAvatar: '/images/shadcn.jpg', // افتراضي
      status: 'upcoming', // افتراضي للاختبارات الجديدة
      createdAt: new Date().toISOString()
    };
    mockQuizzes.push(newQuiz);
    return newQuiz;
  },
  
  // Update quiz
  updateQuiz: async (id, quizData) => {
    await delay(800);
    const index = mockQuizzes.findIndex(q => q.id === parseInt(id));
    if (index === -1) return null;
    
    const updatedQuiz = {
      ...mockQuizzes[index],
      ...quizData
    };
    mockQuizzes[index] = updatedQuiz;
    return updatedQuiz;
  },
  
  // Delete quiz
  deleteQuiz: async (id) => {
    await delay(600);
    const index = mockQuizzes.findIndex(q => q.id === parseInt(id));
    if (index !== -1) {
      mockQuizzes.splice(index, 1);
    }
    return { success: true, message: 'Quiz deleted successfully' };
  },
  
  // Upload quiz file
  uploadQuizFile: async (id, file) => {
    await delay(1200);
    const mockFile = {
      id: file.id || `qf${Date.now()}`,
      name: file.name,
      url: file.url || `/files/${file.name}`,
      size: file.size || `${Math.floor(Math.random() * 500) + 100} KB`
    };
    
    const quizIndex = mockQuizzes.findIndex(q => q.id === parseInt(id));
    if (quizIndex !== -1) {
      if (!mockQuizzes[quizIndex].attachedFiles) {
        mockQuizzes[quizIndex].attachedFiles = [];
      }
      mockQuizzes[quizIndex].attachedFiles.push(mockFile);
    }
    
    return mockFile;
  },
  
  // Delete quiz file
  deleteQuizFile: async (quizId, fileId) => {
    await delay(500);
    const quizIndex = mockQuizzes.findIndex(q => q.id === parseInt(quizId));
    if (quizIndex !== -1 && mockQuizzes[quizIndex].attachedFiles) {
      mockQuizzes[quizIndex].attachedFiles = mockQuizzes[quizIndex].attachedFiles.filter(f => f.id !== fileId);
    }
    return { success: true, message: 'File deleted successfully' };
  }
}; 