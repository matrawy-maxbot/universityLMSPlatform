// Mock data for assignments module

// Helper function to simulate API delay
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock assignments data
export const mockAssignments = [
  {
    id: 1,
    title: 'تصميم واجهة مستخدم',
    course: 'Software Engineering',
    courseId: 'CS101',
    courseCode: 'SE101',
    instructor: 'DR. Ahmed Emad',
    status: 'active',
    startTime: '2024-07-25T10:00:00.000Z',
    endTime: '2024-08-10T23:59:59.000Z',
    createdAt: '2024-07-20T14:30:00.000Z',
    description: 'Design a software architecture for a student management system.',
    totalPoints: 100,
    attachedFiles: [
      { id: 'f1', name: 'assignment_spec.pdf', url: '/files/spec.pdf', size: '250 KB' },
      { id: 'f2', name: 'template.docx', url: '/files/template.docx', size: '50 KB' }
    ],
    submissions: [
      { 
        id: 's1',
        studentId: 101, 
        studentName: 'Alice Smith', 
        avatarUrl: 'https://i.pravatar.cc/150?img=1', 
        displayId: '12345678', 
        status: 'submitted', 
        submittedAt: '2024-08-05T11:00:00.000Z', 
        pointsAwarded: null, 
        feedback: null,
        submittedFiles: [
          { id: 's_f1', name: 'alice_submission_report.pdf', url: '/files/alice_report.pdf', size: '1.2MB' }
        ]
      },
      { 
        id: 's2',
        studentId: 102, 
        studentName: 'Bob Johnson', 
        avatarUrl: 'https://i.pravatar.cc/150?img=2', 
        displayId: '87654321', 
        status: 'completed', 
        submittedAt: '2024-08-06T15:30:00.000Z', 
        pointsAwarded: 85, 
        feedback: 'Good effort.',
        submittedFiles: [
          { id: 's_f3', name: 'bob_final_essay.docx', url: '/files/bob_essay.docx', size: '850KB' }
        ]
      },
      {
        id: 's3',
        studentId: 103,
        studentName: 'Charlie Brown',
        avatarUrl: 'https://i.pravatar.cc/150?img=3',
        displayId: '11223344',
        status: 'missing',
        submittedAt: null,
        pointsAwarded: null,
        feedback: null,
        submittedFiles: []
      },
      {
        id: 's4',
        studentId: 104,
        studentName: 'Diana Prince',
        avatarUrl: 'https://i.pravatar.cc/150?img=4',
        displayId: '55667788',
        status: 'completed',
        submittedAt: '2024-08-09T09:15:00.000Z',
        pointsAwarded: 95,
        feedback: 'Excellent work!',
        submittedFiles: [
          { id: 's_f4', name: 'diana_presentation.pptx', url: '/files/diana_slides.pptx', size: '3.5MB' },
          { id: 's_f5', name: 'diana_research_notes.txt', url: '/files/diana_notes.txt', size: '15KB' }
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'تطوير قاعدة بيانات',
    course: 'Database Systems',
    courseId: 'CS102',
    courseCode: 'DB102',
    instructor: 'DR. Fatima Ali',
    status: 'missing',
    startTime: '2024-08-15T10:00:00.000Z',
    endTime: '2024-08-30T23:59:59.000Z',
    createdAt: '2024-08-10T09:15:00.000Z',
    description: 'Normalize the provided database schema to 3NF.',
    totalPoints: 50,
    attachedFiles: [],
    submissions: []
  },
  {
    id: 3,
    title: 'تحليل متطلبات النظام',
    course: 'Software Engineering',
    courseId: 'CS101',
    courseCode: 'SE101',
    instructor: 'DR. Ahmed Emad',
    status: 'completed',
    startTime: '2024-06-10T08:00:00.000Z',
    endTime: '2024-06-25T23:59:59.000Z',
    createdAt: '2024-06-05T11:20:00.000Z',
    description: 'Analyze and document the requirements for the student management system.',
    totalPoints: 75,
    attachedFiles: [
      { id: 'f3', name: 'requirements_template.docx', url: '/files/req_template.docx', size: '120 KB' }
    ],
    submissions: [
      {
        id: 's5',
        studentId: 101,
        studentName: 'Alice Smith',
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
        displayId: '12345678',
        status: 'completed',
        submittedAt: '2024-06-20T14:30:00.000Z',
        pointsAwarded: 70,
        feedback: 'Good analysis, but missing some non-functional requirements.',
        submittedFiles: [
          { id: 's_f6', name: 'alice_requirements.docx', url: '/files/alice_req.docx', size: '450KB' }
        ]
      }
    ]
  }
];

// Mock API functions
export const mockApis = {
  // Get assignments for a course
  getAssignmentsByCourse: async (courseId) => {
    await delay(800);
    return mockAssignments.filter(assignment => assignment.courseId === courseId || courseId === '101');
  },
  
  // Get assignment by ID
  getAssignmentById: async (id) => {
    await delay(500);
    const assignment = mockAssignments.find(a => a.id === parseInt(id));
    return assignment || null;
  },
  
  // Create new assignment
  createAssignment: async (assignmentData) => {
    await delay(1000);
    const newAssignment = {
      id: mockAssignments.length + 1,
      ...assignmentData,
      createdAt: new Date().toISOString(),
      submissions: []
    };
    return newAssignment;
  },
  
  // Update assignment
  updateAssignment: async (id, assignmentData) => {
    await delay(800);
    const assignment = mockAssignments.find(a => a.id === parseInt(id));
    if (!assignment) return null;
    
    const updatedAssignment = {
      ...assignment,
      ...assignmentData
    };
    return updatedAssignment;
  },
  
  // Delete assignment
  deleteAssignment: async (id) => {
    await delay(600);
    return { success: true, message: 'Assignment deleted successfully' };
  },
  
  // Upload assignment file
  uploadAssignmentFile: async (id, file) => {
    await delay(1200);
    const mockFile = {
      id: `f${Date.now()}`,
      name: file.name,
      url: `/files/${file.name}`,
      size: `${Math.floor(Math.random() * 1000) + 100} KB`
    };
    return mockFile;
  },
  
  // Delete assignment file
  deleteAssignmentFile: async (assignmentId, fileId) => {
    await delay(500);
    return { success: true, message: 'File deleted successfully' };
  },
  
  // Grade submission
  gradeSubmission: async (submissionId, points, feedback) => {
    await delay(700);
    return {
      id: submissionId,
      pointsAwarded: points,
      feedback: feedback,
      status: 'completed'
    };
  }
};

// Mock submissions API functions
export const mockSubmissionsApis = {
  // Get submissions for an assignment
  getSubmissionsByAssignment: async (assignmentId) => {
    await delay(600);
    const assignment = mockAssignments.find(a => a.id === parseInt(assignmentId));
    return assignment ? assignment.submissions : [];
  },
  
  // Get submission by ID
  getSubmissionById: async (id) => {
    await delay(400);
    for (const assignment of mockAssignments) {
      const submission = assignment.submissions.find(s => s.id === id);
      if (submission) return submission;
    }
    return null;
  },
  
  // Download submission file
  downloadSubmissionFile: async (submissionId, fileId) => {
    await delay(800);
    // In a real implementation, this would return a Blob
    return new Blob(['Mock file content'], { type: 'application/octet-stream' });
  }
}; 