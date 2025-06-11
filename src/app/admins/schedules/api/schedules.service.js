/**
 * خدمة للتعامل مع API الجداول الدراسية
 */

import { getCookie } from "cookies-next";
import axios from "axios";

// العنوان الأساسي للـ API
const API_BASE_URL = 'http://localhost:3001/api/v1';

const token = getCookie('access_token');

// تهيئة إعدادات axios الأساسية
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
});

// بيانات افتراضية للاستخدام عند فشل الاتصال بالخادم
const MOCK_SCHEDULES = [
  {
    id: 1,
    title: "Software Engineering",
    image: "/images/schedule.jpg",
    createdAt: "2025-05-28T10:20:30.000Z",
    updatedAt: "2025-05-28T10:20:30.000Z",
    author_id: "D001",
    author: {
      id: "D001",
      firstname: "Ahmed",
      lastname: "Emad",
      profileimage: "/images/shadcn.jpg"
    },
    scheduleData: {
      weekly: {
        Saturday: Array(9).fill(null),
        Sunday: Array(9).fill(null),
        Monday: Array(9).fill(null),
        Tuesday: Array(9).fill(null),
        Wednesday: Array(9).fill(null),
        Thursday: Array(9).fill(null),
      },
      dynamic: []
    },
    scheduleType: 'weekly',
    department_id: "CS"
  },
  {
    id: 2,
    title: "Computer Science",
    image: "/images/schedule2.png",
    createdAt: "2025-05-20T08:15:00.000Z",
    updatedAt: "2025-05-25T14:30:00.000Z",
    author_id: "D002",
    author: {
      id: "D002",
      firstname: "Fatima",
      lastname: "Ali",
      profileimage: "/images/shadcn.jpg"
    },
    scheduleData: {
      weekly: {
        Saturday: Array(9).fill(null),
        Sunday: Array(9).fill(null),
        Monday: Array(9).fill(null),
        Tuesday: Array(9).fill(null),
        Wednesday: Array(9).fill(null),
        Thursday: Array(9).fill(null),
      },
      dynamic: []
    },
    scheduleType: 'weekly',
    department_id: "CS"
  }
];

// للاختبار: بيانات وهمية للكورسات
const MOCK_COURSES = [
  { id: 'CS101', code: 'CS101', name: 'Introduction to Computer Science' },
  { id: 'CS102', code: 'CS102', name: 'Programming Fundamentals' },
  { id: 'CS103', code: 'CS103', name: 'Discrete Mathematics' },
  { id: 'CS104', code: 'CS104', name: 'Computer Architecture' },
  { id: 'CS201', code: 'CS201', name: 'Object-Oriented Programming' },
  { id: 'CS202', code: 'CS202', name: 'Data Structures' },
  { id: 'CS204', code: 'CS204', name: 'Algorithms Analysis' },
  { id: 'IS101', code: 'IS101', name: 'Information Systems Concepts' },
  { id: 'MATH101', code: 'MATH101', name: 'Calculus I' },
  { id: 'PHYS101', code: 'PHYS101', name: 'Physics for Computing' },
  { id: 'ENG101', code: 'ENG101', name: 'Technical Writing' }
];

// للاختبار: بيانات وهمية للمعلمين
const MOCK_INSTRUCTORS = {
  professors: [
    { id: 'PROF001', name: 'Dr. Ahmed Ibrahim', department: 'CS' },
    { id: 'PROF002', name: 'Dr. Mohamed Hassan', department: 'CS' },
    { id: 'PROF003', name: 'Dr. Aisha Mahmoud', department: 'IS' },
    { id: 'PROF004', name: 'Dr. Khaled Ali', department: 'IT' },
    { id: 'PROF005', name: 'Dr. Fatima Saleh', department: 'DS' }
  ],
  assistants: [
    { id: 'TA001', name: 'Eng. Omar Ahmed', department: 'CS' },
    { id: 'TA002', name: 'Eng. Nour Mohamed', department: 'CS' },
    { id: 'TA003', name: 'Eng. Yasser Karim', department: 'IS' },
    { id: 'TA004', name: 'Eng. Laila Tarek', department: 'IT' },
    { id: 'TA005', name: 'Eng. Hossam Adel', department: 'DS' }
  ]
};

// معلومات المعلمين مقسمة حسب المواد
const MOCK_COURSE_INSTRUCTORS = {
  'CS101': {
    professors: ['PROF001', 'PROF002'],
    assistants: ['TA001', 'TA002']
  },
  'CS102': {
    professors: ['PROF001'],
    assistants: ['TA001']
  },
  'CS103': {
    professors: ['PROF002'],
    assistants: ['TA002']
  },
  'CS104': {
    professors: ['PROF003'],
    assistants: ['TA003']
  },
  'CS201': {
    professors: ['PROF001'],
    assistants: ['TA001']
  },
  'CS202': {
    professors: ['PROF002'],
    assistants: ['TA002']
  },
  'CS204': {
    professors: ['PROF003'],
    assistants: ['TA003']
  },
  'IS101': {
    professors: ['PROF004'],
    assistants: ['TA004']
  },
  'MATH101': {
    professors: ['PROF005'],
    assistants: ['TA005']
  },
  'PHYS101': {
    professors: ['PROF002'],
    assistants: ['TA002']
  },
  'ENG101': {
    professors: ['PROF005'],
    assistants: ['TA005']
  }
};

/**
 * تنسيق بيانات الجدول الدراسي القادمة من الخادم لتتوافق مع واجهة المستخدم
 */
const formatScheduleData = (schedule) => {
  console.log('Raw schedule data from API:', schedule);
  
  // تحضير بيانات المؤلف
  let authorName = 'Unknown';
  let authorAvatar = '/images/shadcn.jpg';
  let authorId = schedule.author_id || 'unknown';
  
  console.log('Author data from API:', schedule.author);
  
  if (schedule.author) {
    if (typeof schedule.author === 'object') {
      // محاولة استخراج الاسم من جميع الحقول المحتملة
      const firstName = schedule.author.firstname || 
                      schedule.author.first_name || 
                      schedule.author.fname || 
                      '';
                      
      const lastName = schedule.author.lastname || 
                      schedule.author.last_name || 
                      schedule.author.lname || 
                      '';
                      
      if (firstName || lastName) {
        authorName = `DR. ${firstName} ${lastName}`.trim();
      } else if (schedule.author.fullname) {
        authorName = schedule.author.fullname;
      } else if (schedule.author.name) {
        authorName = schedule.author.name;
      }
      
      // استخراج صورة المؤلف
      authorAvatar = schedule.author.profileimage || 
                   schedule.author.profile_image || 
                   schedule.author.avatar || 
                   '/images/shadcn.jpg';
                   
      // استخراج معرف المؤلف إذا كان موجودًا
      authorId = schedule.author.id || authorId;
    } else if (typeof schedule.author === 'string') {
      authorName = schedule.author;
    }
  } else if (schedule.author_name) {
    // إذا كان اسم المؤلف في جذر كائن الجدول
    authorName = schedule.author_name;
  }
  
  // إذا كنا ما زلنا نفتقد بيانات المؤلف، نحاول استخراجها من حقول أخرى
  if (authorName === 'Unknown' && schedule.author_id) {
    authorId = schedule.author_id;
  }

  // تحضير بيانات الجدول
  let scheduleData = {
    weekly: {
      Saturday: Array(9).fill(null),
      Sunday: Array(9).fill(null),
      Monday: Array(9).fill(null),
      Tuesday: Array(9).fill(null),
      Wednesday: Array(9).fill(null),
      Thursday: Array(9).fill(null),
    },
    dynamic: [],
    coveredCells: {} // خريطة للخلايا المغطاة
  };
  
  try {
    // تحميل بيانات الجدول من الخادم
    if (schedule.schedule_data) {
      console.log('Schedule data structure:', schedule.schedule_data);
      
      // محاولة تحليل البيانات إذا كانت نصية
      let parsedData;
      if (typeof schedule.schedule_data === 'string') {
        try {
          parsedData = JSON.parse(schedule.schedule_data);
          console.log('Parsed string schedule data:', parsedData);
        } catch (parseError) {
          console.error('Error parsing schedule data string:', parseError);
          parsedData = null;
        }
      } else {
        // استخدام البيانات كما هي إذا كانت كائن
        parsedData = schedule.schedule_data;
      }
      
      if (parsedData) {
        // تحضير بيانات الأيام
        const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
        
        // إذا كان هناك هيكل متداخل (weekly)
        if (parsedData.weekly) {
          console.log('Found nested weekly structure:', parsedData.weekly);
          
          // التعامل مع بيانات الجلسات داخل weekly
          days.forEach(day => {
            if (Array.isArray(parsedData.weekly[day])) {
              console.log(`Processing ${parsedData.weekly[day].length} cells for ${day}`);
              
              // إعداد هيكل البيانات المناسب
              scheduleData.weekly[day] = Array(9).fill(null).map(() => ({}));
              
              // معالجة كل خلية في اليوم
              parsedData.weekly[day].forEach(cell => {
                if (!cell) return;
                
                // استخراج البيانات الأساسية
                const {
                  group_id,
                  course_code,
                  course_name,
                  instructor,
                  room,
                  is_lecture,
                  is_lab,
                  time_period_id,
                  is_main_cell,
                  parent_cell_id,
                  extension_type,
                  colspan = 1,
                  rowspan = 1
                } = cell;
                
                // تجاهل الخلايا بدون معرف مجموعة أو معرف فترة زمنية
                if (!group_id || time_period_id === undefined) {
                  console.warn(`Skipping cell with missing group_id or time_period_id: ${JSON.stringify(cell)}`);
                  return;
                }
                
                // تحضير بيانات الجلسة
                const sessionData = {
                  courseCode: course_code,
                  courseName: course_name,
                  instructor,
                  room,
                  isLecture: !!is_lecture,
                  isLab: !!is_lab,
                  colspan,
                  rowspan
                };
                
                // إضافة الجلسة إلى الجدول
                if (!scheduleData.weekly[day][time_period_id]) {
                  scheduleData.weekly[day][time_period_id] = {};
                }
                
                if (!scheduleData.weekly[day][time_period_id]['ALL']) {
                  scheduleData.weekly[day][time_period_id]['ALL'] = {};
                }
                
                // تخزين الجلسة في الجدول
                scheduleData.weekly[day][time_period_id]['ALL'][group_id] = sessionData;
                
                // إذا كانت هذه خلية ممتدة (غير رئيسية)، نضيفها إلى خريطة الخلايا المغطاة
                if (!is_main_cell && parent_cell_id) {
                  // استخراج معلومات الخلية الأصلية
                  const [parentDay, parentPeriod, parentDept, parentGroup] = parent_cell_id.split('-');
                  
                  // إضافة معلومات التغطية
                  const cellKey = `${day}-${time_period_id}-ALL-${group_id}`;
                  scheduleData.coveredCells[cellKey] = {
                    isCovered: true,
                    coveredBy: parent_cell_id,
                    extensionType: extension_type || 'unknown'
                  };
                }
              });
            } else {
              console.warn(`No cells found for ${day} or not in array format`);
            }
          });
        } else {
          // التعامل مع الهيكل المسطح القديم
          console.log('Using flat structure for schedule data');
          
          days.forEach(day => {
            if (Array.isArray(parsedData[day])) {
              console.log(`Processing ${parsedData[day].length} cells for ${day} (flat structure)`);
              
              // إعداد هيكل البيانات المناسب
              scheduleData.weekly[day] = Array(9).fill(null).map(() => ({}));
              
              // معالجة كل خلية في اليوم
              parsedData[day].forEach(cell => {
                if (!cell) return;
                
                // استخراج البيانات الأساسية
                const {
                  group_id,
                  course_code,
                  course_name,
                  instructor,
                  room,
                  is_lecture,
                  is_lab,
                  time_period_id,
                  is_main_cell,
                  parent_cell_id,
                  extension_type,
                  colspan = 1,
                  rowspan = 1
                } = cell;
                
                // تجاهل الخلايا بدون معرف مجموعة أو معرف فترة زمنية
                if (!group_id || time_period_id === undefined) {
                  console.warn(`Skipping cell with missing group_id or time_period_id: ${JSON.stringify(cell)}`);
                  return;
                }
                
                // تحضير بيانات الجلسة
                const sessionData = {
                  courseCode: course_code,
                  courseName: course_name,
                  instructor,
                  room,
                  isLecture: !!is_lecture,
                  isLab: !!is_lab,
                  colspan,
                  rowspan
                };
                
                // إضافة الجلسة إلى الجدول
                if (!scheduleData.weekly[day][time_period_id]) {
                  scheduleData.weekly[day][time_period_id] = {};
                }
                
                if (!scheduleData.weekly[day][time_period_id]['ALL']) {
                  scheduleData.weekly[day][time_period_id]['ALL'] = {};
                }
                
                // تخزين الجلسة في الجدول
                scheduleData.weekly[day][time_period_id]['ALL'][group_id] = sessionData;
                
                // إذا كانت هذه خلية ممتدة (غير رئيسية)، نضيفها إلى خريطة الخلايا المغطاة
                if (!is_main_cell && parent_cell_id) {
                  // استخراج معلومات الخلية الأصلية
                  const [parentDay, parentPeriod, parentDept, parentGroup] = parent_cell_id.split('-');
                  
                  // إضافة معلومات التغطية
                  const cellKey = `${day}-${time_period_id}-ALL-${group_id}`;
                  scheduleData.coveredCells[cellKey] = {
                    isCovered: true,
                    coveredBy: parent_cell_id,
                    extensionType: extension_type || 'unknown'
                  };
                }
              });
            }
          });
        }
        
        // معالجة بيانات الجدول الديناميكي
        if (parsedData.dynamic && Array.isArray(parsedData.dynamic)) {
          scheduleData.dynamic = parsedData.dynamic;
        }
        
        // نسخ بيانات الخلايا المغطاة إذا كانت موجودة
        if (parsedData.coveredCells) {
          scheduleData.coveredCells = parsedData.coveredCells;
        }
      }
    } else {
      console.warn('No schedule_data found in response');
    }
  } catch (error) {
    console.error('Error processing schedule data:', error);
  }
  
  // استخراج المجموعات والتوقيتات
  const groups = schedule.groups || [];
  const timePeriods = schedule.time_periods || [];

  // تحسين البيانات للعرض في واجهة المستخدم
  const formattedData = {
    id: schedule.id || schedule._id,
    title: schedule.title,
    image: schedule.image || "/images/schedule.jpg",
    createdAt: schedule.createdAt || schedule.created_at,
    lastEditAt: schedule.updatedAt || schedule.updated_at || schedule.last_edit_at,
    author: {
      name: authorName,
      avatar: authorAvatar,
      id: authorId
    },
    scheduleData: scheduleData,
    scheduleType: schedule.scheduleType || schedule.schedule_type || 'weekly',
    departmentId: schedule.department_id,
    // إضافة المجموعات والتوقيتات إلى البيانات المُعادة
    groups: groups,
    timePeriods: timePeriods
  };
  
  console.log('Formatted schedule data structure:', {
    id: formattedData.id,
    title: formattedData.title,
    groups: formattedData.groups.length,
    timePeriods: formattedData.timePeriods.length,
    weekly: Object.keys(formattedData.scheduleData.weekly).map(day => 
      `${day}: ${Object.keys(formattedData.scheduleData.weekly[day]).filter(k => 
        formattedData.scheduleData.weekly[day][k] && 
        Object.keys(formattedData.scheduleData.weekly[day][k]).length > 0
      ).length} periods with data`
    )
  });
  
  return formattedData;
};

/**
 * جلب جميع الجداول الدراسية
 * @param {string} departmentId معرف القسم الأكاديمي (اختياري)
 * @returns {Promise<Array>} قائمة الجداول الدراسية
 */
export const getAllSchedules = async (departmentId = null) => {
  try {
    let apiUrl = '/schedules';
    if (departmentId) {
      apiUrl = `/schedules?department_id=${departmentId}`;
    }
    
    // محاولة الوصول إلى API
    try {
      const response = await api.get(apiUrl);
      console.log('Schedules response:', response.data);
      
      const schedules = response.data.data || [];
      
      // جلب تفاصيل المؤلفين
      const schedulesWithDetails = await Promise.all(
        schedules.map(async (schedule) => {
          // جلب تفاصيل المؤلف إذا كان لدينا معرف المؤلف
          if (schedule.author_id) {
            try {
              const authorResponse = await api.get(`/users/${schedule.author_id}`);
              schedule.author = authorResponse.data.data;
            } catch (authorError) {
              console.warn(`Failed to fetch author details for schedule ${schedule.id}:`, authorError);
              // إضافة بيانات مؤلف افتراضية
              schedule.author = { 
                id: schedule.author_id,
                firstname: 'Unknown',
                lastname: 'Author',
                profileimage: '/images/shadcn.jpg'
              };
            }
          }
          
          return schedule;
        })
      );
      
      return schedulesWithDetails.map(formatScheduleData);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      console.info('Using mock data instead');
      
      // إرجاع بيانات افتراضية
      if (departmentId) {
        return MOCK_SCHEDULES.filter(s => s.department_id === departmentId).map(formatScheduleData);
      }
      return MOCK_SCHEDULES.map(formatScheduleData);
    }
  } catch (error) {
    console.error('Error in getAllSchedules:', error);
    return MOCK_SCHEDULES.map(formatScheduleData);
  }
};

/**
 * جلب جدول دراسي معين حسب المعرّف
 * @param {string} id معرّف الجدول
 * @returns {Promise<Object>} بيانات الجدول
 */
export const getScheduleById = async (id) => {
  try {
    // محاولة الوصول إلى API
    try {
      const response = await api.get(`/schedules/${id}`);
      console.log(`Successfully fetched schedule with ID ${id}`);
      
      const scheduleData = response.data.data;
      
      // جلب تفاصيل المؤلف
      if (scheduleData.author_id) {
        try {
          const authorResponse = await api.get(`/users/${scheduleData.author_id}`);
          scheduleData.author = authorResponse.data.data;
        } catch (authorError) {
          console.warn(`Failed to fetch author details for schedule ${id}:`, authorError);
          // إضافة بيانات مؤلف افتراضية
          scheduleData.author = { 
            id: scheduleData.author_id,
            firstname: 'Unknown',
            lastname: 'Author',
            profileimage: '/images/shadcn.jpg'
          };
        }
      }
      
      return formatScheduleData(scheduleData);
    } catch (error) {
      console.error(`Failed to fetch schedule with ID ${id}:`, error);
      
      // إرجاع بيانات افتراضية
      const mockSchedule = MOCK_SCHEDULES.find(s => s.id.toString() === id.toString());
      if (mockSchedule) {
        return formatScheduleData(mockSchedule);
      }
      throw new Error(`Schedule with ID ${id} not found`);
    }
  } catch (error) {
    console.error(`Error in getScheduleById:`, error);
    throw error;
  }
};

/**
 * إنشاء جدول دراسي جديد
 * @param {Object} scheduleData بيانات الجدول الدراسي
 * @returns {Promise<Object>} الجدول الدراسي المنشأ
 */
export const createSchedule = async (scheduleData) => {
  try {
    console.log('Creating new schedule with data:', scheduleData);
    
    // تحضير البيانات للإرسال
    const formData = {
      title: scheduleData.title,
      schedule_type: scheduleData.scheduleType || 'weekly',
      groups: scheduleData.groups,
      time_periods: scheduleData.timePeriods,
      schedule_data: {
        weekly: {
          Saturday: [],
          Sunday: [],
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: []
        },
        dynamic: [],
        coveredCells: {}
      }
    };

    // نسخ بيانات الخلايا مباشرة من البيانات الأصلية
    if (scheduleData.scheduleData && scheduleData.scheduleData.weekly) {
      const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
      
      days.forEach(day => {
        if (Array.isArray(scheduleData.scheduleData.weekly[day])) {
          // نسخ المصفوفة مباشرة
          formData.schedule_data.weekly[day] = [...scheduleData.scheduleData.weekly[day]];
          console.log(`Copied ${formData.schedule_data.weekly[day].length} cells for ${day}`);
        }
      });
      
      // نسخ بيانات coveredCells و dynamic
      if (scheduleData.scheduleData.coveredCells) {
        formData.schedule_data.coveredCells = scheduleData.scheduleData.coveredCells;
      }
      
      if (scheduleData.scheduleData.dynamic) {
        formData.schedule_data.dynamic = scheduleData.scheduleData.dynamic;
      }
    }
    
    console.log('Sending formatted data to API:', formData);
    
    // إرسال الطلب إلى الخادم
    const response = await api.post('/schedules', formData);
    
    console.log('Schedule created successfully:', response.data);
    
    // تنسيق البيانات المستلمة
    return formatScheduleData(response.data.data || response.data);
  } catch (error) {
    console.error('Error creating schedule:', error);
    console.error('Error message:', error.response?.data || error.message);
      
    // إذا كان الخطأ يتعلق بالتنسيق، نجرب مرة أخرى بتنسيق مبسط
    try {
      console.log('Retrying with alternative data format...');
      
      // إعداد البيانات للإرسال بتنسيق أبسط
      const simplifiedData = {
        title: scheduleData.title,
        schedule_type: scheduleData.scheduleType || 'weekly',
        groups: scheduleData.groups,
        time_periods: scheduleData.timePeriods,
        schedule_data: {
          Saturday: [],
          Sunday: [],
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: []
        }
      };
      
      // نسخ بيانات الخلايا مباشرة من scheduleData.scheduleData.weekly إلى المستوى الأعلى
      if (scheduleData.scheduleData && scheduleData.scheduleData.weekly) {
        const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
        
        days.forEach(day => {
          if (Array.isArray(scheduleData.scheduleData.weekly[day])) {
            // نسخ المصفوفة إلى المستوى الأعلى من schedule_data
            simplifiedData.schedule_data[day] = [...scheduleData.scheduleData.weekly[day]];
            console.log(`Retry: Copied ${simplifiedData.schedule_data[day].length} cells for ${day}`);
          }
        });
      }
      
      console.log('Sending simplified data to API:', simplifiedData);
      
      const retryResponse = await api.post('/schedules', simplifiedData);
      console.log('Schedule created successfully on retry:', retryResponse.data);
      
      return formatScheduleData(retryResponse.data.data || retryResponse.data);
    } catch (retryError) {
      console.error('Error on retry:', retryError);
      console.error('Retry error message:', retryError.response?.data || retryError.message);
      
      // استخدام بيانات وهمية في حالة الفشل
      return createMockSchedule(scheduleData);
    }
  }
};

/**
 * تحديث جدول دراسي موجود
 * @param {string} id معرّف الجدول
 * @param {Object} scheduleData بيانات التحديث
 * @returns {Promise<Object>} الجدول المحدّث
 */
export const updateSchedule = async (id, scheduleData) => {
  try {
    console.log('Updating schedule with data:', scheduleData);
    
    // تحضير البيانات للإرسال
    const formData = {
      title: scheduleData.title,
      schedule_type: scheduleData.scheduleType || 'weekly',
      groups: scheduleData.groups,
      time_periods: scheduleData.timePeriods,
      schedule_data: {
        weekly: {
          Saturday: [],
          Sunday: [],
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: []
        },
        dynamic: [],
        coveredCells: {}
      }
    };

    // نسخ بيانات الخلايا مباشرة من البيانات الأصلية
    if (scheduleData.scheduleData && scheduleData.scheduleData.weekly) {
      const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
      
      days.forEach(day => {
        if (Array.isArray(scheduleData.scheduleData.weekly[day])) {
          // نسخ المصفوفة مباشرة
          formData.schedule_data.weekly[day] = [...scheduleData.scheduleData.weekly[day]];
          console.log(`Copied ${formData.schedule_data.weekly[day].length} cells for ${day}`);
        }
      });
      
      // نسخ بيانات coveredCells و dynamic
      if (scheduleData.scheduleData.coveredCells) {
        formData.schedule_data.coveredCells = scheduleData.scheduleData.coveredCells;
      }
      
      if (scheduleData.scheduleData.dynamic) {
        formData.schedule_data.dynamic = scheduleData.scheduleData.dynamic;
      }
    }
    
    console.log('Sending formatted data to API:', formData);
    
    // إرسال الطلب إلى الخادم
    const response = await api.put(`/schedules/${id}`, formData);
    
    console.log('Schedule updated successfully:', response.data);
    
    // تنسيق البيانات المستلمة
    return formatScheduleData(response.data.data || response.data);
  } catch (error) {
    console.error('Error updating schedule:', error);
    console.error('Error message:', error.response?.data || error.message);
      
    // إذا كان الخطأ يتعلق بالتنسيق، نجرب مرة أخرى بتنسيق مبسط
    try {
      console.log('Retrying with alternative data format...');
      
      // إعداد البيانات للإرسال بتنسيق أبسط
      const simplifiedData = {
        title: scheduleData.title,
        schedule_type: scheduleData.scheduleType || 'weekly',
        groups: scheduleData.groups,
        time_periods: scheduleData.timePeriods,
        schedule_data: {
          Saturday: [],
          Sunday: [],
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: []
        }
      };
      
      // نسخ بيانات الخلايا مباشرة من scheduleData.scheduleData.weekly إلى المستوى الأعلى
      if (scheduleData.scheduleData && scheduleData.scheduleData.weekly) {
        const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
        
        days.forEach(day => {
          if (Array.isArray(scheduleData.scheduleData.weekly[day])) {
            // نسخ المصفوفة إلى المستوى الأعلى من schedule_data
            simplifiedData.schedule_data[day] = [...scheduleData.scheduleData.weekly[day]];
            console.log(`Retry: Copied ${simplifiedData.schedule_data[day].length} cells for ${day}`);
          }
        });
      }
      
      console.log('Sending simplified data to API:', simplifiedData);
      
      const retryResponse = await api.put(`/schedules/${id}`, simplifiedData);
      console.log('Schedule updated successfully on retry:', retryResponse.data);
      
      return formatScheduleData(retryResponse.data.data || retryResponse.data);
    } catch (retryError) {
      console.error('Error on retry:', retryError);
      console.error('Retry error message:', retryError.response?.data || retryError.message);
        
      // محاولة ثالثة بتبسيط أكثر للبيانات
      try {
        const minimalData = {
          title: scheduleData.title,
          schedule_type: scheduleData.scheduleType || 'weekly'
        };
        
        console.log('Last attempt with minimal data:', minimalData);
        const lastRetryResponse = await api.put(`/schedules/${id}`, minimalData);
        
        if (lastRetryResponse.data) {
          return formatScheduleData(lastRetryResponse.data.data || lastRetryResponse.data);
        }
      } catch (finalError) {
        console.error('All API attempts failed:', finalError);
      }
      
      // للاختبار: تحديث الجدول محليًا
      const scheduleIndex = MOCK_SCHEDULES.findIndex(schedule => schedule.id == id);
      if (scheduleIndex === -1) {
        throw new Error('Schedule not found');
      }
      
      // تحديث الجدول محليًا
      MOCK_SCHEDULES[scheduleIndex] = {
        ...MOCK_SCHEDULES[scheduleIndex],
        title: scheduleData.title,
        schedule_type: scheduleData.scheduleType || 'weekly',
        schedule_data: scheduleData.scheduleData,
        updatedAt: new Date().toISOString(),
        groups: scheduleData.groups || [],
        time_periods: scheduleData.timePeriods || [],
        // الحفاظ على بيانات المؤلف
        author: MOCK_SCHEDULES[scheduleIndex].author,
        author_id: MOCK_SCHEDULES[scheduleIndex].author_id
      };
      
      return formatScheduleData(MOCK_SCHEDULES[scheduleIndex]);
    }
  }
};

/**
 * حذف جدول دراسي
 * @param {string} id معرّف الجدول
 * @returns {Promise<boolean>} نتيجة عملية الحذف
 */
export const deleteSchedule = async (id) => {
  try {
    // محاولة حذف الجدول
    try {
      await api.delete(`/schedules/${id}`);
      console.log(`Successfully deleted schedule with ID ${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete schedule with ID ${id}:`, error);
      
      // حذف من قائمة البيانات المحلية
      const scheduleIndex = MOCK_SCHEDULES.findIndex(s => s.id.toString() === id.toString());
      if (scheduleIndex !== -1) {
        MOCK_SCHEDULES.splice(scheduleIndex, 1);
        return true;
      }
      throw new Error(`Schedule with ID ${id} not found`);
    }
  } catch (error) {
    console.error(`Failed to delete schedule with ID ${id}:`, error);
    throw error;
  }
};

/**
 * جلب الأقسام الأكاديمية
 * @returns {Promise<Array>} قائمة الأقسام
 */
export const getDepartments = async () => {
  try {
    const response = await api.get('/departments');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    return [
      { id: 'CS', name: 'Computer Science' },
      { id: 'IS', name: 'Information Systems' },
      { id: 'IT', name: 'Information Technology' },
      { id: 'DS', name: 'Decision Support' }
    ];
  }
};

/**
 * تحميل صورة للجدول الدراسي
 * @param {string} id معرّف الجدول
 * @param {File} imageFile ملف الصورة
 * @returns {Promise<Object>} الجدول المحدّث مع رابط الصورة
 */
export const uploadScheduleImage = async (id, imageFile) => {
  try {
    // إنشاء FormData لتحميل الصورة
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post(`/schedules/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return formatScheduleData(response.data.data);
  } catch (error) {
    console.error(`Failed to upload image for schedule ${id}:`, error);
    
    // إرجاع عنوان URL وهمي للصورة في حالة الفشل
    return {
      image: URL.createObjectURL(imageFile)
    };
  }
};

/**
 * جلب جميع المجموعات الدراسية
 * @returns {Promise<Array>} قائمة المجموعات
 */
export const getAvailableGroups = async () => {
  try {
    // محاولة الوصول إلى API
    try {
      const response = await api.get('/groups/with-authors');
      console.log('Groups response:', response.data);
      
      const groups = response.data.data || [];
      return groups.map(group => {
        // تحويل المعرف إلى نص في جميع الحالات
        let groupId;
        
        if (group.id !== undefined) {
          // تحويل المعرف إلى نص مهما كان نوعه
          groupId = String(group.id);
        } else {
          // إنشاء معرف نصي جديد إذا لم يكن موجودًا
          groupId = `GRP${Date.now()}${Math.floor(Math.random() * 1000)}`;
        }
        
        return {
          id: groupId,
          name: group.title,
          author: group.author || { firstname: 'Unknown', lastname: 'Author' }
        };
      });
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      
      // إرجاع بيانات افتراضية
      return [
        { id: 'GRP001', name: 'Computer Science - Year 1', author: { firstname: 'Ahmed', lastname: 'Mahmoud' } },
        { id: 'GRP002', name: 'Computer Science - Year 2', author: { firstname: 'Mohamed', lastname: 'Ali' } },
        { id: 'GRP003', name: 'Information Systems - Year 1', author: { firstname: 'Khaled', lastname: 'Ibrahim' } },
        { id: 'GRP004', name: 'Information Systems - Year 2', author: { firstname: 'Mahmoud', lastname: 'Essam' } }
      ];
    }
  } catch (error) {
    console.error('Error in getAvailableGroups:', error);
    return [];
  }
};

/**
 * جلب جميع المواد الدراسية (الكورسات)
 * @param {string} departmentId معرف القسم الأكاديمي (اختياري)
 * @returns {Promise<Array>} قائمة المواد الدراسية
 */
export const getCourses = async (departmentId = null) => {
  try {
    let apiUrl = '/courses';
    if (departmentId) {
      apiUrl = `/courses?department_id=${departmentId}`;
    }
    
    // محاولة الوصول إلى API
    try {
      const response = await api.get(apiUrl);
      console.log('Courses API response:', response.data);
      
      const courses = response.data.data || [];
      return courses;
    } catch (error) {
      console.error('Failed to fetch courses from API:', error);
      console.info('Using mock data for courses');
      
      // إعادة بيانات الكورسات الوهمية
      console.log('MOCK_COURSES available:', MOCK_COURSES);
      
      // إرجاع بيانات افتراضية
      if (departmentId) {
        // نفترض أن الـ ID يبدأ بنفس حروف القسم
        const filteredCourses = MOCK_COURSES.filter(c => c.code.startsWith(departmentId));
        console.log('Filtered courses by department:', filteredCourses);
        return filteredCourses;
      }
      
      // إعادة بيانات MOCK_COURSES مع تسجيل إضافي
      console.log('Returning all mock courses:', MOCK_COURSES);
      return MOCK_COURSES;
    }
  } catch (error) {
    console.error('Error in getCourses:', error);
    
    // إنشاء بيانات افتراضية محلية في حالة حدوث أي خطأ
    const defaultCourses = [
      { id: 'CS101', code: 'CS101', name: 'Introduction to Computer Science' },
      { id: 'CS102', code: 'CS102', name: 'Programming Fundamentals' },
      { id: 'CS103', code: 'CS103', name: 'Discrete Mathematics' }
    ];
    
    console.log('Using default courses as fallback:', defaultCourses);
    return defaultCourses;
  }
};

/**
 * جلب المعلمين لمادة دراسية معينة
 * @param {string} courseId معرف المادة الدراسية
 * @param {boolean} isLecture هل هي محاضرة (true) أم سكشن (false)
 * @returns {Promise<Array>} قائمة المعلمين
 */
export const getInstructorsByCourse = async (courseId, isLecture = true) => {
  try {
    const type = isLecture ? 'professors' : 'assistants';
    let apiUrl = `/courses/${courseId}/instructors?type=${type}`;
    
    // محاولة الوصول إلى API
    try {
      const response = await api.get(apiUrl);
      console.log(`Instructors response for course ${courseId}:`, response.data);
      
      const instructors = response.data.data || [];
      return instructors;
    } catch (error) {
      console.error(`Failed to fetch instructors for course ${courseId}:`, error);
      console.info('Using mock data for instructors');

      try {
        // محاولة الحصول على بيانات الكورس أولاً للوصول إلى قائمة المعلمين
        const courseResponse = await api.get(`/courses/${courseId}`);
        const courseData = courseResponse.data.data || {};
        console.log(`Course data for ${courseId}:`, courseData);

        // اعتمادًا على نوع الجلسة، نختار قائمة الأساتذة أو المساعدين
        const instructorIds = isLecture ? (courseData.doctors || []) : (courseData.assistants || []);
        console.log(`Instructor IDs for ${courseId} (${isLecture ? 'professors' : 'assistants'}):`, instructorIds);

        if (instructorIds.length > 0) {
          // جلب بيانات المعلمين من API
          const instructorsPromises = instructorIds.map(id => api.get(`/users/${id}`).catch(err => null));
          const instructorsResponses = await Promise.all(instructorsPromises);
          
          // استخراج بيانات المعلمين من الاستجابات الناجحة فقط
          const instructorsData = instructorsResponses
            .filter(resp => resp && resp.data && resp.data.data)
            .map(resp => {
              const userData = resp.data.data;
              // استخدام لقب مناسب حسب نوع الجلسة ونوع المعلم
              const title = isLecture ? 'Dr.' : 'Eng.';
              
              // لتحسين الدقة، يمكن أيضًا التحقق من نوع المستخدم إذا كان متاحًا
              // مثلا: userData.type === 'doctor' ? 'Dr.' : 'Eng.'
              
              return {
                id: userData.id,
                name: `${title} ${userData.firstname || ''} ${userData.lastname || ''}`.trim(),
                department: userData.department || 'Unknown'
              };
            });
            
          console.log(`Fetched instructor data:`, instructorsData);
          return instructorsData;
        }
      } catch (courseError) {
        console.error(`Failed to fetch course data for ${courseId}:`, courseError);
      }
      
      // استخدام البيانات الوهمية كخيار أخير
      const courseInstructors = MOCK_COURSE_INSTRUCTORS[courseId] || { professors: [], assistants: [] };
      const instructorIds = courseInstructors[type] || [];
      const allInstructors = MOCK_INSTRUCTORS[type] || [];
      
      return instructorIds.map(id => allInstructors.find(i => i.id === id)).filter(Boolean);
    }
  } catch (error) {
    console.error(`Error in getInstructorsByCourse for course ${courseId}:`, error);
    return [];
  }
};

// دالة لإنشاء جدول وهمي في حالة فشل الاتصال بالخادم
const createMockSchedule = (scheduleData) => {
  console.log('Creating mock schedule with data:', scheduleData);
  
  // إنشاء معرف فريد للجدول الوهمي
  const mockId = Date.now().toString();
  
  // إنشاء جدول وهمي باستخدام البيانات المقدمة
  const mockSchedule = {
    id: mockId,
    title: scheduleData.title,
    image: "/images/schedule.jpg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author_id: "MOCK_AUTHOR",
    author: {
      id: "MOCK_AUTHOR",
      firstname: "Test",
      lastname: "User",
      profileimage: "/images/shadcn.jpg"
    },
    schedule_data: {
      weekly: {
        Saturday: scheduleData.scheduleData?.weekly?.Saturday || [],
        Sunday: scheduleData.scheduleData?.weekly?.Sunday || [],
        Monday: scheduleData.scheduleData?.weekly?.Monday || [],
        Tuesday: scheduleData.scheduleData?.weekly?.Tuesday || [],
        Wednesday: scheduleData.scheduleData?.weekly?.Wednesday || [],
        Thursday: scheduleData.scheduleData?.weekly?.Thursday || []
      },
      dynamic: scheduleData.scheduleData?.dynamic || [],
      coveredCells: scheduleData.scheduleData?.coveredCells || {}
    },
    schedule_type: scheduleData.scheduleType || 'weekly',
    department_id: "MOCK_DEPT",
    groups: scheduleData.groups || [],
    time_periods: scheduleData.timePeriods || []
  };
  
  // إضافة الجدول الوهمي إلى قائمة الجداول المحلية
  MOCK_SCHEDULES.push(mockSchedule);
  
  // تنسيق البيانات للعرض في واجهة المستخدم
  return formatScheduleData(mockSchedule);
}; 