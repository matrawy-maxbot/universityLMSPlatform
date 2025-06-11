/**
 * Registration confirmations API service
 */

import { getCookie } from "cookies-next";
import axios from "axios";

// API base URL
const API_BASE_URL = 'http://localhost:3001/api/v1';

// Caching mechanism to prevent excessive API calls
const apiCache = {
  registrations: new Map(), // Map of semesterId_status -> {data, timestamp}
  semesters: { data: null, timestamp: null },
  currentSemester: { data: null, timestamp: null },
  // Cache expiration time in milliseconds (5 minutes)
  CACHE_TTL: 5 * 60 * 1000,
  
  // Check if cache is valid
  isValid(cacheEntry) {
    if (!cacheEntry || !cacheEntry.timestamp) return false;
    return (Date.now() - cacheEntry.timestamp) < this.CACHE_TTL;
  },
  
  // Get cached data if valid, otherwise return null
  get(cacheKey, cacheStore) {
    const cacheEntry = cacheStore instanceof Map ? 
      cacheStore.get(cacheKey) : cacheStore;
      
    if (this.isValid(cacheEntry)) {
      console.log(`Using cached data for ${cacheKey}`);
      return cacheEntry.data;
    }
    
    return null;
  },
  
  // Set cache with current timestamp
  set(cacheKey, data, cacheStore) {
    const cacheEntry = { 
      data, 
      timestamp: Date.now()
    };
    
    if (cacheStore instanceof Map) {
      cacheStore.set(cacheKey, cacheEntry);
    } else {
      // For simple objects like currentSemester
      Object.assign(cacheStore, cacheEntry);
    }
  },
  
  // Clear specific cache entry
  clear(cacheKey, cacheStore) {
    if (cacheStore instanceof Map) {
      cacheStore.delete(cacheKey);
    } else {
      cacheStore.data = null;
      cacheStore.timestamp = null;
    }
  },
  
  // Clear all cache
  clearAll() {
    this.registrations.clear();
    this.semesters.data = null;
    this.semesters.timestamp = null;
    this.currentSemester.data = null;
    this.currentSemester.timestamp = null;
  }
};

// Mock data for development and testing
const MOCK_REGISTRATIONS = [
  {
    id: 1,
    studentId: "STD12345",
    courseId: "CS101",
    semesterId: 7,
    status: "pending",
    createdAt: "2024-07-15T10:30:00Z",
    updatedAt: null,
    rejectionReason: null,
    student: {
      id: "STD12345",
      name: "John Smith",
      email: "john.smith@example.com",
      gpa: 3.7,
      major: "Computer Science",
      year: 3,
      creditsCompleted: 85
    },
    course: {
      id: "CS101",
      coursename: "Introduction to Computer Science",
      coursecode: "CS101",
      credithours: 3,
      prerequisites: []
    }
  },
  {
    id: 2,
    studentId: "STD12346",
    courseId: "MATH201",
    semesterId: 7,
    status: "approved",
    createdAt: "2024-07-15T11:15:00Z",
    updatedAt: "2024-07-16T09:20:00Z",
    rejectionReason: null,
    student: {
      id: "STD12346",
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      gpa: 3.9,
      major: "Mathematics",
      year: 2,
      creditsCompleted: 62
    },
    course: {
      id: "MATH201",
      coursename: "Linear Algebra",
      coursecode: "MATH201",
      credithours: 4,
      prerequisites: ["MATH101"]
    }
  },
  {
    id: 3,
    studentId: "STD12347",
    courseId: "PHYS301",
    semesterId: 7,
    status: "rejected",
    createdAt: "2024-07-14T14:30:00Z",
    updatedAt: "2024-07-16T10:45:00Z",
    rejectionReason: "Prerequisites not met",
    student: {
      id: "STD12347",
      name: "Michael Brown",
      email: "michael.brown@example.com",
      gpa: 2.8,
      major: "Physics",
      year: 3,
      creditsCompleted: 70
    },
    course: {
      id: "PHYS301",
      coursename: "Quantum Mechanics",
      coursecode: "PHYS301",
      credithours: 4,
      prerequisites: ["PHYS201", "MATH202"]
    }
  },
  {
    id: 4,
    studentId: "STD12348",
    courseId: "CS102",
    semesterId: 7,
    status: "pending",
    createdAt: "2024-07-16T08:45:00Z",
    updatedAt: null,
    rejectionReason: null,
    student: {
      id: "STD12348",
      name: "Emily Davis",
      email: "emily.davis@example.com",
      gpa: 3.4,
      major: "Computer Science",
      year: 2,
      creditsCompleted: 55
    },
    course: {
      id: "CS102",
      coursename: "Data Structures and Algorithms",
      coursecode: "CS102",
      credithours: 3,
      prerequisites: ["CS101"]
    }
  },
  {
    id: 5,
    studentId: "STD12349",
    courseId: "ENG101",
    semesterId: 7,
    status: "pending",
    createdAt: "2024-07-16T09:30:00Z",
    updatedAt: null,
    rejectionReason: null,
    student: {
      id: "STD12349",
      name: "David Wilson",
      email: "david.wilson@example.com",
      gpa: 3.2,
      major: "English Literature",
      year: 1,
      creditsCompleted: 28
    },
    course: {
      id: "ENG101",
      coursename: "English Composition",
      coursecode: "ENG101",
      credithours: 3,
      prerequisites: []
    }
  }
];

// Mock semesters data
const MOCK_SEMESTERS = [
  { 
    id: 7, 
    semester: 'fall', 
    startyear: '2024', 
    endyear: '2025', 
    createdat: '2024-05-15T10:00:00Z', 
    endedat: null 
  },
  { 
    id: 6, 
    semester: 'summer', 
    startyear: '2024', 
    endyear: '2024', 
    createdat: '2024-03-10T10:00:00Z', 
    endedat: '2024-05-10T10:00:00Z' 
  }
];

/**
 * Get authentication token
 * @returns {string|null} Auth token or null if not available
 */
const getAuthToken = () => {
  const token = getCookie('access_token');
  if (!token) {
    console.error('Authentication token not found');
    return null;
  }
  return token;
};

/**
 * Create request config with auth headers
 * @param {boolean} isJson Whether request includes JSON data
 * @returns {Object} Request config
 */
const getRequestConfig = (isJson = false) => {
  const token = getAuthToken();
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  if (isJson) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
};

/**
 * Process API response
 * @param {Object} response API response
 * @returns {Object} Processed data
 */
const handleApiResponse = (response) => {
  if (response && response.data) {
    if (process.env.NODE_ENV === 'development') {
      // Log concisely to avoid console clutter
      if (Array.isArray(response.data.data)) {
        console.log(`API Response: ${response.data.data.length} items received`);
      } else {
        const { success, message } = response.data;
        console.log(`API Response: success=${success}${message ? `, message=${message}` : ''}`);
      }
    }
    return response.data;
  }
  throw new Error('Invalid API response format');
};

/**
 * Get registration requests
 * @param {number} semesterId Semester ID
 * @param {string} status Filter by status (pending, approved, rejected, all)
 * @returns {Promise<Array>} Registration requests
 */
export const getRegistrationRequests = async (semesterId, status = 'pending') => {
  // Create a cache key based on semesterId and status
  const cacheKey = `${semesterId}_${status}`;
  
  // Check cache first
  const cachedData = apiCache.get(cacheKey, apiCache.registrations);
  if (cachedData !== null) {
    return cachedData;
  }
  
  try {
    const config = getRequestConfig();
    // Using the correct route from courseRegisters.routes.js
    // GET /api/v1/course-registers/semester/:semesterid
    let url = `${API_BASE_URL}/course-registers/semester/${semesterId}`;
    
    // Add status filter as query parameter if not 'all'
    if (status !== 'all') {
      url += `?status=${status}`;
    }
    
    console.log('Fetching registrations from URL:', url);
    const response = await axios.get(url, config);
    console.log('Response from getRegistrationRequests:', response);
    const data = handleApiResponse(response);
    console.log('Parsed registration data:', data);
    
    // Process response data
    let registrations = [];
    
    if (Array.isArray(data)) {
      registrations = data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.data)) {
        registrations = data.data;
      } else if (Array.isArray(data.registrations)) {
        registrations = data.registrations;
      } else {
        const possibleArrays = Object.values(data).filter(Array.isArray);
        if (possibleArrays.length > 0) {
          registrations = possibleArrays[0];
        } else {
          // Handle single registration object case
          if (data.id) {
            registrations = [data];
          }
        }
      }
    }
    
    // Map data to consistent format
    console.log('Processing registrations:', registrations);
    
    // Process registrations to ensure they have student and course data
    const processedRegistrations = registrations.map(registration => {
      // Debug each registration object
      console.log('Processing registration item:', registration);
      
      // Convert confirm field to status field for UI consistency
      let status = 'pending';
      if (registration.confirm === true) {
        status = 'approved';
      } else if (registration.isRejected === true) {
        status = 'rejected';
      }
      
      // Handle new API structure that includes User and Course objects
      const student = registration.User || {
        id: registration.studentid || registration.studentId,
        name: `${registration.firstname || ''} ${registration.lastname || ''}`.trim() || 
              `Student ${registration.studentid || registration.studentId}`
      };
      
      // Create full name from the new API structure if available
      if (student && (student.firstname || student.lastname || student.secondname || student.thirdname)) {
        student.name = [
          student.firstname || '',
          student.secondname || '',
          student.thirdname || '',
          student.lastname || ''
        ].filter(Boolean).join(' ');
      }
      
      // Normalize course data from the new API structure
      const course = registration.Course || {
        id: registration.courseid || registration.courseId,
        coursecode: registration.courseid || registration.courseId,
        coursename: registration.coursename || `Course ${registration.courseid || registration.courseId}`
      };
      
      // Build a consistent registration object structure
      return {
        ...registration,
        status,
        // Ensure IDs are available with fallbacks
        id: registration.id,
        studentId: registration.studentid || registration.studentId || student.id,
        courseId: registration.courseid || registration.courseId || course.id || course.coursecode,
        semesterId: registration.semesterid || registration.semesterId,
        // Add the new fields
        isRejected: registration.isRejected || false,
        rejectionReason: registration.rejectionReason || null,
        confirmDate: registration.confirmDate || null,
        rejectionDate: registration.rejectionDate || null,
        // Add student and course objects
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          gpa: student.gpa,
          major: student.major,
          year: student.year,
          creditsCompleted: student.creditsCompleted,
          // Add new properties from the API
          firstname: student.firstname,
          secondname: student.secondname,
          thirdname: student.thirdname,
          lastname: student.lastname,
          profileimage: student.profileimage
        },
        course: {
          id: course.id || course.coursecode,
          coursecode: course.coursecode,
          coursename: course.coursename,
          credithours: course.coursehours || course.credithours,
          level: course.level,
          prerequisites: course.prerequisites || []
        },
        // Normalize semester data if available
        semester: registration.semester ? {
          id: registration.semester.id,
          semester: registration.semester.semester,
          startyear: registration.semester.semesterstartyear,
          endyear: registration.semester.semesterendyear,
          createdat: registration.semester.createdAt,
          endedat: registration.semester.endedat
        } : null
      };
    });
    
    console.log('Processed registrations:', processedRegistrations);
    
    // Save to cache
    apiCache.set(cacheKey, processedRegistrations, apiCache.registrations);
    
    return processedRegistrations;
  } catch (error) {
    console.error('Error fetching registration requests:', error);
    
    // Return mock data if connection error
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.warn('Using mock registration data');
      
      // Filter mock data to match requested parameters
      const mockData = MOCK_REGISTRATIONS.filter(reg => {
        const semesterMatch = reg.semesterId === semesterId;
        const statusMatch = status === 'all' || reg.status === status;
        return semesterMatch && statusMatch;
      });
      
      // Save mock data to cache
      apiCache.set(cacheKey, mockData, apiCache.registrations);
      
      return mockData;
    }
    
    throw error;
  }
};

/**
 * Get detailed information about a specific registration
 * @param {number} registrationId Registration ID
 * @returns {Promise<Object>} Registration details
 */
export const getRegistrationDetails = async (registrationId) => {
  // This function doesn't need caching as it's for a specific registration
  // and isn't causing the excessive API calls problem
  try {
    const config = getRequestConfig();
    // Using the correct route from courseRegisters.routes.js
    // GET /api/v1/course-registers/:id
    const response = await axios.get(`${API_BASE_URL}/course-registers/${registrationId}`, config);
    const data = handleApiResponse(response);
    
    // Format the response to match our UI expectations
    let registration = null;
    
    if (data && typeof data === 'object') {
      if (data.data) {
        registration = data.data;
      } else {
        registration = data;
      }
    }
    
    if (registration) {
      // Convert confirm field to status field
      let status = 'pending';
      if (registration.confirm === true) {
        status = 'approved';
      } else if (registration.confirm === false && registration.rejectionReason) {
        status = 'rejected';
      }
      
      return {
        ...registration,
        status,
        studentId: registration.studentid || registration.studentId,
        courseId: registration.courseid || registration.courseId,
        semesterId: registration.semesterid || registration.semesterId,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching registration details:', error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.warn('Using mock data for registration details');
      const registration = MOCK_REGISTRATIONS.find(reg => reg.id === registrationId);
      return registration || null;
    }
    
    throw error;
  }
};

/**
 * Approve a registration request
 * @param {number} registrationId Registration ID
 * @returns {Promise<Object>} Updated registration
 */
export const approveRegistration = async (registrationId) => {
  try {
    const config = getRequestConfig(true);
    
    // Using the new dedicated approval endpoint from courseRegisters.routes.js
    // PUT /api/v1/course-registers/:id/approve
    const response = await axios.put(
      `${API_BASE_URL}/course-registers/${registrationId}/approve`,
      {}, // No body needed, the endpoint handles setting confirm=true and adding confirmDate
      config
    );
    
    const data = handleApiResponse(response);
    
    // Clear any cached registration data that might be affected by this update
    apiCache.registrations.forEach((value, key) => {
      if (key.includes('_')) {
        apiCache.clear(key, apiCache.registrations);
      }
    });
    
    // Return the formatted response
    let registration = null;
    
    if (data && typeof data === 'object') {
      if (data.data) {
        registration = data.data;
      } else {
        registration = data;
      }
    }
    
    if (registration) {
      return {
        ...registration,
        status: 'approved',
        studentId: registration.studentid || registration.studentId,
        courseId: registration.courseid || registration.courseId,
        semesterId: registration.semesterid || registration.semesterId,
        confirmDate: registration.confirmDate || new Date().toISOString(),
        isRejected: false,
        rejectionReason: null,
        rejectionDate: null
      };
    }
    
    return {
      id: registrationId,
      status: 'approved',
      confirmDate: new Date().toISOString(),
      isRejected: false,
      rejectionReason: null,
      rejectionDate: null,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error approving registration:', error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.warn('Using mock response for approval');
      return { 
        id: registrationId, 
        status: 'approved',
        confirmDate: new Date().toISOString(),
        isRejected: false,
        rejectionReason: null,
        rejectionDate: null,
        updatedAt: new Date().toISOString() 
      };
    }
    
    throw error;
  }
};

/**
 * Reject a registration request
 * @param {number} registrationId Registration ID
 * @param {string} reason Rejection reason
 * @returns {Promise<Object>} Updated registration
 */
export const rejectRegistration = async (registrationId, reason) => {
  try {
    const config = getRequestConfig(true);
    
    // Using the new dedicated rejection endpoint from courseRegisters.routes.js
    // PUT /api/v1/course-registers/:id/reject
    const response = await axios.put(
      `${API_BASE_URL}/course-registers/${registrationId}/reject`,
      { 
        rejectionReason: reason || 'Rejected by administrator'
      }, 
      config
    );
    
    const data = handleApiResponse(response);
    
    // Clear any cached registration data that might be affected by this update
    apiCache.registrations.forEach((value, key) => {
      if (key.includes('_')) {
        apiCache.clear(key, apiCache.registrations);
      }
    });
    
    // Return the formatted response
    let registration = null;
    
    if (data && typeof data === 'object') {
      if (data.data) {
        registration = data.data;
      } else {
        registration = data;
      }
    }
    
    if (registration) {
      return {
        ...registration,
        status: 'rejected',
        rejectionReason: reason || registration.rejectionReason,
        rejectionDate: registration.rejectionDate || new Date().toISOString(),
        isRejected: true,
        confirm: false,
        confirmDate: null,
        studentId: registration.studentid || registration.studentId,
        courseId: registration.courseid || registration.courseId,
        semesterId: registration.semesterid || registration.semesterId,
      };
    }
    
    return {
      id: registrationId,
      status: 'rejected',
      rejectionReason: reason,
      rejectionDate: new Date().toISOString(),
      isRejected: true,
      confirm: false,
      confirmDate: null,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error rejecting registration:', error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.warn('Using mock response for rejection');
      return { 
        id: registrationId, 
        status: 'rejected', 
        rejectionReason: reason,
        rejectionDate: new Date().toISOString(),
        isRejected: true,
        confirm: false,
        confirmDate: null,
        updatedAt: new Date().toISOString() 
      };
    }
    
    throw error;
  }
};

/**
 * Get all semesters
 * @returns {Promise<Array>} List of semesters
 */
export const getAllSemesters = async () => {
  // Check cache first
  const cachedData = apiCache.get('semesters', apiCache.semesters);
  if (cachedData !== null) {
    return cachedData;
  }
  
  try {
    const config = getRequestConfig();
    const response = await axios.get(`${API_BASE_URL}/semesters`, config);
    
    const data = handleApiResponse(response);
    
    // Debug response structure
    console.log('Raw semesters response:', JSON.stringify(data).substring(0, 500) + '...');
    
    // Process data structure
    let semesters = [];
    if (Array.isArray(data)) {
      semesters = data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.data)) {
        semesters = data.data;
      } else if (Array.isArray(data.semesters)) {
        semesters = data.semesters;
      } else {
        const possibleArrays = Object.values(data).filter(Array.isArray);
        if (possibleArrays.length > 0) {
          semesters = possibleArrays[0];
        }
      }
    }
    
    // Normalize semester fields to ensure consistent data structure
    const normalizedSemesters = semesters.map(sem => {
      // Debug individual semester structure
      console.log('Processing semester:', JSON.stringify(sem));
      
      return {
        id: sem.id,
        semester: sem.semester || sem.name || '',
        startyear: sem.startyear || sem.semesterstartyear || sem.start_year || '',
        endyear: sem.endyear || sem.semesterendyear || sem.end_year || '',
        createdat: sem.createdat || sem.createdAt || sem.created_at || '',
        endedat: sem.endedat || sem.endedAt || sem.ended_at || null,
        isActive: sem.endedat ? false : true
      };
    });
    
    // Cache the result
    apiCache.set('semesters', normalizedSemesters, apiCache.semesters);
    
    return normalizedSemesters;
  } catch (error) {
    console.error('Error fetching semesters:', error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.warn('Using mock semesters data');
      
      // Normalize mock semesters
      const normalizedMockSemesters = MOCK_SEMESTERS.map(sem => ({
        id: sem.id,
        semester: sem.semester || sem.name || '',
        startyear: sem.startyear || sem.semesterstartyear || sem.start_year || '',
        endyear: sem.endyear || sem.semesterendyear || sem.end_year || '',
        createdat: sem.createdat || sem.createdAt || sem.created_at || '',
        endedat: sem.endedat || sem.endedAt || sem.ended_at || null,
        isActive: sem.endedat ? false : true
      }));
      
      // Cache the mock data
      apiCache.set('semesters', normalizedMockSemesters, apiCache.semesters);
      
      return normalizedMockSemesters;
    }
    
    return [];
  }
};

/**
 * Get current semester
 * @returns {Promise<Object|null>} Current semester or null if none active
 */
export const getCurrentSemester = async () => {
  // Check cache first
  const cachedData = apiCache.get('currentSemester', apiCache.currentSemester);
  if (cachedData !== null) {
    return cachedData;
  }
  
  try {
    const config = getRequestConfig();
    const response = await axios.get(`${API_BASE_URL}/semesters/current`, config);
    const data = handleApiResponse(response);
    
    // Debug response structure
    console.log('Raw current semester response:', JSON.stringify(data).substring(0, 500) + '...');
    
    // Check if data indicates no active semester
    if (data && data.success === false && data.message === "No active semester found") {
      // Cache the null result
      apiCache.set('currentSemester', null, apiCache.currentSemester);
      return null;
    }
    
    // Format data
    let currentSemester = null;
    let rawSemesterData = null;
    
    if (data && data.data) {
      rawSemesterData = data.data;
    } else if (data && data.id) {
      // If data is not nested
      rawSemesterData = data;
    }
    
    if (rawSemesterData) {
      console.log('Processing current semester:', JSON.stringify(rawSemesterData));
      
      currentSemester = {
        id: rawSemesterData.id,
        name: rawSemesterData.semester,
        semester: rawSemesterData.semester,
        startyear: rawSemesterData.startyear || rawSemesterData.semesterstartyear || rawSemesterData.start_year || '',
        endyear: rawSemesterData.endyear || rawSemesterData.semesterendyear || rawSemesterData.end_year || '',
        createdat: rawSemesterData.createdat || rawSemesterData.createdAt || rawSemesterData.created_at || '',
        endedat: rawSemesterData.endedat || rawSemesterData.endedAt || rawSemesterData.ended_at || null,
        isActive: rawSemesterData.endedat ? false : true
      };
    }
    
    // Cache the result
    apiCache.set('currentSemester', currentSemester, apiCache.currentSemester);
    
    return currentSemester;
  } catch (error) {
    console.error('Error fetching current semester:', error);
    
    // Handle case where no active semester exists (404)
    if (error.response && error.response.status === 404) {
      apiCache.set('currentSemester', null, apiCache.currentSemester);
      return null;
    }
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.warn('Using mock current semester data');
      const mockCurrentSemester = {
        ...MOCK_SEMESTERS[0],
        isActive: true
      };
      
      // Cache the mock data
      apiCache.set('currentSemester', mockCurrentSemester, apiCache.currentSemester);
      
      return mockCurrentSemester; // Return the first mock semester as current
    }
    
    return null;
  }
}; 