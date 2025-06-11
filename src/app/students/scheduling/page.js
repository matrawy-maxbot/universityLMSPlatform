'use client';

import { useState, useEffect } from 'react';
import './styles/page.css';
import CalendarEvents from './components/CalendarEvents';
import { mockApis } from './mockData/mockSchedulingData';
import { useRouter } from 'next/navigation';

// Import mock API functions
const { getAllSchedules, getScheduleById, getStudentQuizzes, getStudentAssignments } = mockApis;

export default function SchedulingPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState({});
  const [activeAssignments, setActiveAssignments] = useState([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [studentQuizzes, setStudentQuizzes] = useState([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [studentAssignments, setStudentAssignments] = useState([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);

  // أسماء الشهور بالإنجليزية
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // جلب جميع الجداول الدراسية عند تحميل الصفحة
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setIsLoading(true);
        const fetchedSchedules = await getAllSchedules();
        console.log('Fetched schedules:', fetchedSchedules);
        setSchedules(fetchedSchedules);
        
        // اختيار أول جدول افتراضيًا إذا كان متوفر
        if (fetchedSchedules.length > 0) {
          await loadScheduleData(fetchedSchedules[0].id);
        }
        
        setIsFirstLoad(false);
      } catch (error) {
        console.error('Error fetching schedules:', error);
        setIsFirstLoad(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSchedules();
  }, []);

  // جلب كويزات الطالب
  useEffect(() => {
    const fetchStudentQuizzes = async () => {
      try {
        setIsLoadingQuizzes(true);
        const quizzes = await getStudentQuizzes();
        console.log('Fetched student quizzes:', quizzes);
        setStudentQuizzes(quizzes);
        
        // إذا تم تحميل الجدول والواجبات، قم بتحديث الأحداث
        if (selectedSchedule && !isLoadingAssignments) {
          updateEventsForCurrentMonth(calendarEvents);
        }
      } catch (error) {
        console.error('Error fetching student quizzes:', error);
      } finally {
        setIsLoadingQuizzes(false);
      }
    };
    
    fetchStudentQuizzes();
  }, [selectedSchedule]);

  // جلب واجبات الطالب
  useEffect(() => {
    const fetchStudentAssignments = async () => {
      try {
        setIsLoadingAssignments(true);
        const assignments = await getStudentAssignments();
        console.log('Fetched student assignments:', assignments);
        setStudentAssignments(assignments);
        
        // إذا تم تحميل الجدول والكويزات، قم بتحديث الأحداث
        if (selectedSchedule && !isLoadingQuizzes) {
          updateEventsForCurrentMonth(calendarEvents);
        }
      } catch (error) {
        console.error('Error fetching student assignments:', error);
      } finally {
        setIsLoadingAssignments(false);
      }
    };
    
    fetchStudentAssignments();
  }, [selectedSchedule]);

  // إعادة معالجة بيانات الجدول عند تغيير الشهر أو السنة
  useEffect(() => {
    // تجنب التنفيذ عند التحميل الأولي للصفحة
    if (!isFirstLoad && selectedSchedule) {
      console.log(`Month or year changed. Reprocessing schedule data for ${monthNames[currentMonth]} ${currentYear}`);
      setIsLoading(true);
      
      // إعادة معالجة بيانات الجدول الزمني للشهر الجديد
      const events = processScheduleToCalendarEvents(selectedSchedule);
      
      // إعادة تحميل الكويزات والواجبات للشهر الجديد
      updateEventsForCurrentMonth(events);
      
      setIsLoading(false);
    }
  }, [currentMonth, currentYear]);

  // تحديث الأحداث للشهر الحالي
  const updateEventsForCurrentMonth = (events) => {
    // نسخة جديدة من الأحداث من الجدول الدراسي فقط (بدون كويزات أو واجبات)
    const updatedEvents = { ...events };
    
    console.log(`Updating events for ${monthNames[currentMonth]} ${currentYear}`);
    
    // إضافة الكويزات للشهر الحالي
    if (studentQuizzes && studentQuizzes.length > 0) {
      console.log(`Checking ${studentQuizzes.length} quizzes for ${monthNames[currentMonth]} ${currentYear}`);
      studentQuizzes.forEach(quiz => {
        const quizDate = new Date(quiz.startTime);
        // التحقق بدقة إذا كان الكويز في الشهر والسنة الحاليين
        if (quizDate.getMonth() === currentMonth && quizDate.getFullYear() === currentYear) {
          const day = quizDate.getDate();
          console.log(`Adding quiz "${quiz.title}" to day ${day} of ${monthNames[currentMonth]} ${currentYear}`);
          
          // إنشاء حدث للكويز
          const quizEvent = {
            id: `quiz-${quiz.id}`,
            title: quiz.title,
            time: quizDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'quiz',
            instructor: quiz.instructor,
            room: 'Online',
            course: quiz.course,
            group: 'All'
          };
          
          // إضافة الكويز إلى أحداث اليوم
          if (!updatedEvents[day]) {
            updatedEvents[day] = [];
          }
          updatedEvents[day].push(quizEvent);
        } else {
          console.log(`Quiz "${quiz.title}" date ${quizDate.toLocaleDateString()} does not match current month ${monthNames[currentMonth]} ${currentYear}`);
        }
      });
    }
    
    // إضافة الواجبات للشهر الحالي
    if (studentAssignments && studentAssignments.length > 0) {
      console.log(`Checking ${studentAssignments.length} assignments for ${monthNames[currentMonth]} ${currentYear}`);
      studentAssignments.forEach(assignment => {
        // إضافة فقط الواجبات النشطة والمؤجلة
        if (assignment.status === 'active' || assignment.status === 'scheduled') {
          const assignmentDate = new Date(assignment.endTime);
          // التحقق بدقة إذا كان الواجب في الشهر والسنة الحاليين
          if (assignmentDate.getMonth() === currentMonth && assignmentDate.getFullYear() === currentYear) {
            const day = assignmentDate.getDate();
            console.log(`Adding assignment "${assignment.title}" to day ${day} of ${monthNames[currentMonth]} ${currentYear}`);
            
            // إنشاء حدث للواجب
            const assignmentEvent = {
              id: `assignment-${assignment.id}`,
              title: assignment.title,
              time: assignmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'assignment',
              instructor: assignment.instructor,
              room: 'Online',
              course: assignment.course,
              group: 'All'
            };
            
            // إضافة الواجب إلى أحداث اليوم
            if (!updatedEvents[day]) {
              updatedEvents[day] = [];
            }
            updatedEvents[day].push(assignmentEvent);
          } else {
            console.log(`Assignment "${assignment.title}" date ${assignmentDate.toLocaleDateString()} does not match current month ${monthNames[currentMonth]} ${currentYear}`);
          }
        }
      });
    }
    
    console.log("Final updated events:", updatedEvents);
    // تحديث الأحداث
    setCalendarEvents(updatedEvents);
  };

  // تحميل بيانات جدول معين وتحويله إلى أحداث تقويم
  const loadScheduleData = async (scheduleId) => {
    try {
      console.log(`Fetching schedule with ID: ${scheduleId}`);
      const scheduleData = await getScheduleById(scheduleId);
      console.log("Raw schedule data received from API:", scheduleData);
      console.log("Schedule data type:", typeof scheduleData);
      
      if (!scheduleData) {
        console.error("API returned null or undefined schedule data");
        return;
      }
      
      // تحقق من الحقول الرئيسية
      console.log("Schedule ID:", scheduleData.id);
      console.log("Schedule title:", scheduleData.title);
      console.log("Schedule author:", scheduleData.author);
      console.log("Schedule data keys:", Object.keys(scheduleData));
      
      if (scheduleData.schedule_data) {
        console.log("Schedule data format: Using schedule_data");
        console.log("Data keys:", Object.keys(scheduleData.schedule_data));
      } else if (scheduleData.scheduleData) {
        console.log("Schedule data format: Using scheduleData");
        console.log("Data keys:", Object.keys(scheduleData.scheduleData));
      }
      
      setSelectedSchedule(scheduleData);
      
      // تحويل بيانات الجدول إلى أحداث مجمعة حسب التاريخ
      const events = processScheduleToCalendarEvents(scheduleData);
      console.log("Processed calendar events:", events);
      
      // إضافة الكويزات والواجبات للشهر الحالي
      updateEventsForCurrentMonth(events);
    } catch (error) {
      console.error(`Error loading schedule with ID ${scheduleId}:`, error);
      if (error.response) {
        console.error("API response error:", error.response.data);
        console.error("API response status:", error.response.status);
      }
    }
  };

  // معالجة بيانات الجدول وتحويلها إلى أحداث التقويم
  const processScheduleToCalendarEvents = (schedule) => {
    console.log("Processing schedule to calendar events:", schedule);
    const events = {};
    const currentDate = new Date(currentYear, currentMonth, 1);
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // فحص هيكل البيانات المستلمة
    console.log("Schedule structure:", schedule);
    
    // التأكد من وجود بيانات الجدول
    if (!schedule) {
      console.log("No schedule object found");
      return events;
    }

    // تحليل هيكل البيانات بشكل صحيح
    let rawData;
    if (schedule.schedule_data) {
      // هيكل البيانات من قاعدة البيانات - مسطح
      rawData = schedule.schedule_data;
      console.log("Found schedule data in schedule.schedule_data:", rawData);
    } else if (schedule.scheduleData && schedule.scheduleData.weekly) {
      // هيكل البيانات من API القديم - متداخل
      rawData = schedule.scheduleData.weekly;
      console.log("Found schedule data in schedule.scheduleData.weekly:", rawData);
    } else if (schedule.scheduleData) {
      // محاولة أخرى للوصول للبيانات
      rawData = schedule.scheduleData;
      console.log("Found schedule data in schedule.scheduleData:", rawData);
    } else {
      console.log("Could not find schedule data in expected locations");
      return events;
    }
    
    // تخزين مرجع لمجموعات الجدول الدراسي
    const groups = schedule.groups || [];
    const groupMap = {};
    groups.forEach(group => {
      groupMap[group.id] = group.name;
    });
    console.log("Group mapping:", groupMap);
    
    // تخزين مرجع لأوقات الفترات - تم تعديل هذا الجزء للتعامل مع time_period_id كفهرس
    const timePeriods = schedule.time_periods || schedule.timePeriods || [];
    const timeMap = {};
    
    // إنشاء خريطة للفترات الزمنية بناءً على فهرسها في المصفوفة
    timePeriods.forEach((period, index) => {
      timeMap[index] = period.start;
    });
    console.log("Time period mapping:", timeMap);
    
    // أيام الأسبوع - تم العودة للترتيب الأصلي الذي يتوافق مع بيانات API
    const weekDays = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    // مصفوفة تحويل من ترتيب JavaScript إلى ترتيب البيانات المخزنة
    const dayMapping = {
      0: 6, // الأحد (0 في JS) هو الفهرس 1 في مصفوفتنا
      1: 0, // الإثنين (1 في JS) هو الفهرس 2 في مصفوفتنا
      2: 1, // الثلاثاء (2 في JS) هو الفهرس 3 في مصفوفتنا
      3: 2, // الأربعاء (3 في JS) هو الفهرس 4 في مصفوفتنا
      4: 3, // الخميس (4 في JS) هو الفهرس 5 في مصفوفتنا
      5: 4, // الجمعة (5 في JS) هو الفهرس 6 في مصفوفتنا
      6: 5  // السبت (6 في JS) هو الفهرس 0 في مصفوفتنا
    };
    
    // الآن سنضيف الأحداث لكل يوم من الشهر
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const jsDayIndex = date.getDay(); // getDay() يعطي 0 للأحد، 1 للإثنين، ... 6 للسبت
      const mappedDayIndex = dayMapping[jsDayIndex]; // تحويل فهرس اليوم إلى الفهرس المناسب في مصفوفتنا
      const dayName = weekDays[mappedDayIndex];
      
      // تحقق ما إذا كان هناك بيانات لهذا اليوم
      const dayData = rawData[dayName];
      console.log(`Day data for ${dayName}:`, dayData);
      
      if (!dayData || !Array.isArray(dayData) || dayData.length === 0) {
        console.log(`No events for ${dayName}`);
        continue; // لا توجد أحداث لهذا اليوم
      }
      
      console.log(`Processing ${dayData.length} events for ${dayName}`);
      
      // استخدام مجموعة لتتبع الأحداث الفريدة ومنع التكرار
      const eventKeys = new Set();
      let dayEvents = [];
      
      // معالجة كل جلسة في هذا اليوم
      dayData.forEach((timeSlotObject, periodIndex) => {
        if (!timeSlotObject) {
          console.log(`Time slot ${periodIndex} is empty for ${dayName}`);
          return; // Skip if the time slot itself is null/undefined
        }

        // timeSlotObject is typically { ALL: { group_id1: {course_data_1}, group_id_2: {course_data_2} } }
        for (const keyInTimeSlot in timeSlotObject) { // keyInTimeSlot will be "ALL" or similar
          const groupToCourseMap = timeSlotObject[keyInTimeSlot]; // This is { group_id1: {course_data_1}, ... }

          if (typeof groupToCourseMap !== 'object' || groupToCourseMap === null) {
            console.log(`Expected object for groupToCourseMap, got:`, groupToCourseMap, `for key ${keyInTimeSlot} in time slot ${periodIndex} for ${dayName}`);
            continue;
          }

          // Iterate over group IDs (which are keys in groupToCourseMap)
          for (const groupIdKey in groupToCourseMap) { // groupIdKey is "d3b0f5d6735860c4", "21e462a4f71e42c6", etc.
            const courseData = groupToCourseMap[groupIdKey];

            if (typeof courseData !== 'object' || courseData === null) {
              console.log(`Expected object for courseData, got:`, courseData, `for group ID key ${groupIdKey} in ${dayName}`);
              continue;
            }

            const courseCode = courseData.courseCode;
            const courseName = courseData.courseName;
            const instructor = courseData.instructor;
            const room = courseData.room;
            const isLecture = courseData.isLecture;
            const isLab = courseData.isLab;
            
            if (!courseCode || !courseName) {
              console.log(`Skipping incomplete course data for group ${groupIdKey} in ${dayName}, slot ${periodIndex}:`, courseData);
              continue;
            }
            
            console.log(`Processing course: ${courseCode} (${courseName}) for group ${groupMap[groupIdKey] || groupIdKey} in slot ${periodIndex} on ${dayName}`);

            // إنشاء مفتاح فريد لمنع التكرار
            const eventKey = `${courseCode}-${periodIndex}-${room}-${groupIdKey}`;
            if (eventKeys.has(eventKey)) {
              console.log(`Duplicate event key skipped: ${eventKey}`);
              continue;
            }
            eventKeys.add(eventKey);
            
            // العثور على وقت الجلسة - استخدام periodIndex مباشرة للوصول إلى الوقت المناسب
            let timeDisplay = timeMap[periodIndex] || `${8 + periodIndex}:00`;

            dayEvents.push({
              id: `${courseCode}-${periodIndex}-${groupIdKey}`, // Ensure unique ID for React key
              title: courseName,
              time: timeDisplay,
              type: isLab ? 'lab' : isLecture ? 'lecture' : 'section',
              instructor: instructor || "Unknown Instructor",
              room: room || "Unknown Room",
              course: courseCode,
              group: groupMap[groupIdKey] || groupIdKey // Use the mapped group name
            });
          }
        }
      });
      
      // إذا وجدنا أحداث لهذا اليوم، نضيفها للقائمة
      if (dayEvents.length > 0) {
        events[day] = dayEvents;
      }
    }
    
    // طباعة الأحداث المستخرجة للتشخيص
    console.log("Extracted schedule events:", events);
    return events;
  };

  // معالجة بيانات الجدول غير المنظمة حسب اليوم
  const processUnstructuredScheduleData = (schedule, data) => {
    const events = {};
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    console.log("Processing unstructured data:", data);
    
    // إذا كانت البيانات عبارة عن مصفوفة
    if (Array.isArray(data)) {
      // أيام الأسبوع - تم العودة للترتيب الأصلي الذي يتوافق مع بيانات API
      const weekDays = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      
      // مصفوفة تحويل من ترتيب JavaScript إلى ترتيب البيانات المخزنة
      const dayMapping = {
        0: 1, // الأحد (0 في JS) هو الفهرس 1 في مصفوفتنا
        1: 2, // الإثنين (1 في JS) هو الفهرس 2 في مصفوفتنا
        2: 3, // الثلاثاء (2 في JS) هو الفهرس 3 في مصفوفتنا
        3: 4, // الأربعاء (3 في JS) هو الفهرس 4 في مصفوفتنا
        4: 5, // الخميس (4 في JS) هو الفهرس 5 في مصفوفتنا
        5: 6, // الجمعة (5 في JS) هو الفهرس 6 في مصفوفتنا
        6: 0  // السبت (6 في JS) هو الفهرس 0 في مصفوفتنا
      };
      
      // معالجة كل جلسة في البيانات
      data.forEach(session => {
        if (!session) return;
        
        // استخراج معلومات الجلسة
        const courseCode = session.course_code || session.courseCode;
        const courseName = session.course_name || session.courseName;
        const day = session.day || '';
        const dayOfWeek = weekDays.indexOf(day);
        
        if (courseCode && dayOfWeek !== -1) {
          // حساب أيام هذا الشهر التي تقع في هذا اليوم من الأسبوع
          for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(currentYear, currentMonth, d);
            const jsDayIndex = date.getDay();
            const mappedDayIndex = dayMapping[jsDayIndex];
            
            if (mappedDayIndex === dayOfWeek) {
              // إنشاء حدث لهذا اليوم
              if (!events[d]) events[d] = [];
              
              events[d].push({
                id: `${courseCode}-${d}`,
                title: courseName || "Unknown Course",
                time: session.start_time || "08:00",
                type: session.type || (session.is_lecture ? 'lecture' : session.is_lab ? 'lab' : 'section'),
                instructor: session.instructor || "Unknown Instructor",
                room: session.room || "Unknown Room",
                course: courseCode
              });
            }
          }
        }
      });
    }
    
    return events;
  };

  // التنقل للشهر السابق
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // التنقل للشهر التالي
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // عرض جميع الجداول
  const handleShowAllSchedules = () => {
    // يمكن تنفيذ منطق لعرض قائمة بجميع الجداول واختيار واحد منها
    console.log('Show all schedules clicked');
  };

  // تحديد لون الخلفية للصف حسب وجود أحداث
  const getCellClassName = (day) => {
    if (!day) return '';
    
    const hasEvents = calendarEvents[day] && calendarEvents[day].length > 0;
    
    if (!hasEvents) return '';
    
    // تحديد اللون حسب عدد الأحداث
    const eventsCount = calendarEvents[day].length;
    
    if (eventsCount >= 4) return 'has-events high-events';
    if (eventsCount >= 2) return 'has-events medium-events';
    return 'has-events low-events';
  };

  // الحصول على أنواع الفعاليات ليوم معين
  const getDayEventTypes = (day) => {
    if (!calendarEvents[day] || calendarEvents[day].length === 0) {
      return [];
    }
    
    console.log(`Getting event types for day ${day}:`, calendarEvents[day]);
    
    // تجميع أنواع الأحداث الفريدة
    const eventTypes = new Set();
    calendarEvents[day].forEach(event => {
      if (event && event.type) {
        eventTypes.add(event.type);
        console.log(`Added event type: ${event.type} for ${event.title}`);
      } else {
        console.log("Event without type:", event);
      }
    });
    
    return Array.from(eventTypes);
  };

  // إنشاء مصفوفة أيام الشهر الحالي
  const generateCalendarDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = الأحد, 6 = السبت
    
    // تحديد عدد الأيام من الشهر السابق التي يجب عرضها
    // في التقويم، السبت هو أول يوم في الأسبوع (الفهرس 6 في JS)
    const prevMonthDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    // حساب عدد الأيام في الشهر السابق
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    // إنشاء مصفوفة تحتوي على جميع أيام التقويم (الشهر السابق + الحالي + التالي)
    const days = [];
    
    // إضافة أيام من الشهر السابق
    for (let i = daysInPrevMonth - prevMonthDays + 1; i <= daysInPrevMonth; i++) {
      days.push({
        day: i,
        currentMonth: false,
        isPrevMonth: true,
        isNextMonth: false
      });
    }
    
    // إضافة أيام الشهر الحالي
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        currentMonth: true,
        isPrevMonth: false,
        isNextMonth: false
      });
    }
    
    // حساب عدد الأيام المتبقية لإكمال الشبكة (6 صفوف × 7 أعمدة = 42)
    const remainingDays = 42 - (prevMonthDays + daysInMonth);
    
    // إضافة أيام من الشهر التالي
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        currentMonth: false,
        isPrevMonth: false,
        isNextMonth: true
      });
    }
    
    return days;
  };

  // التنقل إلى صفحة تفاصيل الكويز
  const navigateToQuizDetails = (quizId) => {
    router.push(`/students/quizzes/${quizId}`);
  };

  // التنقل إلى صفحة تفاصيل الواجب
  const navigateToAssignmentDetails = (assignmentId) => {
    router.push(`/students/assignments/${assignmentId}`);
  };

  return (
    <>
      <div className="calendar-container">
        {/* Calendar Header */}
        <div className="calendar-header">
          <div className="calendar-navigation">
            <button className="show-all-btn" onClick={handleShowAllSchedules}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              show all schedules
            </button>
            <div className="month-selector">
              <button className="month-nav prev" onClick={goToPreviousMonth}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <div className="date-display">
                <h2>{monthNames[currentMonth]}</h2>
                <span className="year">{currentYear}</span>
              </div>
              <button className="month-nav next" onClick={goToNextMonth}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="calendar-main">
          {/* Calendar Grid */}
          <div className="calendar-grid">
            {/* Days Header */}
            <div className="days-header">
              <div className="day-name">Saturday</div>
              <div className="day-name">Sunday</div>
              <div className="day-name">Monday</div>
              <div className="day-name">Tuesday</div>
              <div className="day-name">Wednesday</div>
              <div className="day-name">Thursday</div>
              <div className="day-name">Friday</div>
            </div>

            {/* Calendar Days */}
            <div className="calendar-days">
              {isLoading ? (
                <div className="loading-indicator">Loading schedule data...</div>
              ) : (
                <>
                  {/* عرض أيام التقويم بشكل ديناميكي */}
                  {generateCalendarDays().map((dayInfo, index) => (
                    <div 
                      key={index} 
                      className={`calendar-day ${dayInfo.currentMonth ? getCellClassName(dayInfo.day) : ''} ${dayInfo.isPrevMonth ? 'prev-month' : ''} ${dayInfo.isNextMonth ? 'next-month' : ''}`}
                    >
                      <span className="day-number">{dayInfo.day}</span>
                      {dayInfo.currentMonth && (
                        <div className="events-list">
                          {getDayEventTypes(dayInfo.day).map((type, idx) => (
                            <div key={idx} className={`event ${type}`}>
                              {type === 'lecture' ? 'Lecture' : type === 'lab' ? 'Lab' : type === 'quiz' ? 'Quiz' : type === 'assignment' ? 'Assignment' : 'Section'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Active Assignments Section */}
          <div className="active-assignments">
            <h3>Active Assignments</h3>
            <p className="subtitle">Your pending assignments for this semester</p>
            
            <div className="assignments-list">
              {isLoadingAssignments ? (
                <div className="loading-indicator">Loading assignments...</div>
              ) : studentAssignments.length > 0 ? (
                studentAssignments
                  .filter(assignment => assignment.status === 'active' || assignment.status === 'scheduled')
                  .slice(0, 4)
                  .map((assignment, index) => {
                    const assignmentDate = new Date(assignment.endTime);
                    const now = new Date();
                    const diffTime = Math.abs(assignmentDate - now);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
                    const isUrgent = diffDays <= 1;
                    const isScheduled = assignment.status === 'scheduled';
                    
                    return (
                      <div 
                        key={index} 
                        className={`assignment-card ${isUrgent ? 'urgent' : ''} ${isScheduled ? 'scheduled' : ''}`}
                        onClick={() => navigateToAssignmentDetails(assignment.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="assignment-date">
                          {assignmentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <h4 className="assignment-title">{assignment.title}</h4>
                        <p className="assignment-course">{assignment.course}</p>
                        <div className="assignment-meta">
                          <div className="deadline">
                            <span className="label">
                              {isScheduled ? 'Scheduled:' : 'Deadline:'}
                            </span>
                            <span className={`value ${isUrgent ? 'urgent' : ''}`}>
                              {diffDays > 0 
                                ? `${diffDays} ${diffDays === 1 ? 'Day' : 'Days'} left` 
                                : `${diffHours} ${diffHours === 1 ? 'Hour' : 'Hours'} left`}
                            </span>
                          </div>
                          <div className="time">
                            {assignmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className={`progress-bar ${isUrgent ? 'urgent' : ''}`}></div>
                      </div>
                    );
                  })
              ) : (
                <div className="no-assignments-message">No active assignments</div>
              )}
            </div>
            
            {/* Upcoming Quizzes Section */}
            <h3 className="mt-4">Upcoming Quizzes</h3>
            <p className="subtitle">Your scheduled quizzes for this semester</p>
            
            <div className="assignments-list">
              {isLoadingQuizzes ? (
                <div className="loading-indicator">Loading quizzes...</div>
              ) : studentQuizzes.length > 0 ? (
                studentQuizzes
                  .filter(quiz => quiz.status === 'active' || quiz.status === 'postponed')
                  .slice(0, 4)
                  .map((quiz, index) => {
                    const quizDate = new Date(quiz.startTime);
                    const now = new Date();
                    const diffTime = Math.abs(quizDate - now);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const isToday = quizDate.toDateString() === now.toDateString();
                    
                    return (
                      <div 
                        key={index} 
                        className={`assignment-card ${isToday ? 'urgent' : ''} ${quiz.status === 'postponed' ? 'postponed' : ''}`}
                        onClick={() => navigateToQuizDetails(quiz.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="assignment-date">
                          {quizDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <h4 className="assignment-title">{quiz.title}</h4>
                        <p className="assignment-course">{quiz.course}</p>
                        <div className="assignment-meta">
                          <div className="deadline">
                            <span className="label">
                              {isToday ? 'Today:' : quiz.status === 'postponed' ? 'Postponed:' : 'Scheduled:'}
                            </span>
                            <span className={`value ${isToday ? 'urgent' : ''}`}>
                              {isToday 
                                ? 'Today' 
                                : quiz.status === 'postponed' 
                                  ? 'New date TBA' 
                                  : `${diffDays} ${diffDays === 1 ? 'Day' : 'Days'} left`}
                            </span>
                          </div>
                          <div className="time">
                            {quizDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className={`progress-bar ${isToday ? 'urgent' : ''}`}></div>
                      </div>
                    );
                  })
              ) : (
                <div className="no-quizzes-message">No upcoming quizzes scheduled</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <CalendarEvents selectedSchedule={selectedSchedule} calendarEvents={calendarEvents} />
    </>
  );
}