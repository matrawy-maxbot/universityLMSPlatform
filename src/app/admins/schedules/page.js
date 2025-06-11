'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import './styles/page.css';
import ScheduleDialog from './components/ScheduleDialog';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import { useScheduleDialog } from './components/script';
import { getAllSchedules, createSchedule, updateSchedule, deleteSchedule } from './api';

export default function Schedules() {
  const scheduleDialogHookData = useScheduleDialog();
  const { 
    isDialogOpen, 
    openDialog,
    closeDialog,
    scheduleType, 
    setScheduleType, 
    scheduleTitle, 
    setScheduleTitle, 
    departments, 
    setDepartments, 
    groups, 
    setGroups, 
    timePeriods, 
    setTimePeriods, 
    scheduleData: tableDataForDialog,
    setScheduleData,
    resizingCell,
    handleCellClick, 
    handleCellDoubleClick, 
    addSession, 
    addDynamicRow,
    startResize,
    getCellSession, 
    increaseColspan, 
    increaseRowspan, 
    decreaseColspan, 
    decreaseRowspan,
    resetSelection, 
    editMode,
    setEditMode,
    handleSessionDrop, 
    tableScale, 
    zoomIn, 
    zoomOut,
    deleteSession
  } = scheduleDialogHookData;
  
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentScheduleId, setCurrentScheduleId] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);

  // Load schedules on component mount
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setIsLoading(true);
        const fetchedSchedules = await getAllSchedules();
        console.log('Fetched schedules:', fetchedSchedules);
        setSchedules(fetchedSchedules);
      } catch (error) {
        console.error('Error fetching schedules:', error);
        showNotificationWithMessage('Failed to load schedules', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSchedules();
  }, []);

  // Handle click on existing schedule card
  const handleScheduleClick = (schedule) => {
    setIsEditMode(true);
    setCurrentScheduleId(schedule.id);
    
    console.log('Loading schedule for edit:', schedule);
    
    // Load schedule data into dialog
    setScheduleTitle(schedule.title);
    setScheduleType(schedule.scheduleType || 'weekly');
    
    // التأكد من أن بيانات الجدول موجودة ومنسقة بشكل صحيح
    if (schedule.scheduleData) {
      console.log('Setting schedule data:', schedule.scheduleData);
      setScheduleData(schedule.scheduleData);
    } else {
      console.warn('Schedule data is missing, using default data');
      setScheduleData(tableDataForDialog);
    }
    
    // تحميل بيانات المجموعات
    if (schedule.groups && Array.isArray(schedule.groups)) {
      console.log('Loading groups from schedule:', schedule.groups);
      
      // التأكد من أن كل مجموعة لها معرف نصي
      const formattedGroups = schedule.groups.map(group => ({
        ...group,
        id: group.id ? String(group.id) : `GRP${Date.now()}`
      }));
      
      setGroups(formattedGroups);
    } else {
      console.warn('No groups found in schedule, using empty array');
      setGroups([]);
    }
    
    // تحميل بيانات التوقيتات
    if (schedule.time_periods && Array.isArray(schedule.time_periods)) {
      console.log('Loading time periods from schedule:', schedule.time_periods);
      
      // التأكد من أن التوقيتات تحتوي على جميع الحقول المطلوبة
      const formattedTimePeriods = schedule.time_periods.map((period, index) => ({
        id: period.id || index + 1,
        start: period.start || '08:45',
        end: period.end || '09:30',
        enabled: period.enabled !== false
      }));
      
      setTimePeriods(formattedTimePeriods);
    } else {
      console.warn('No time periods found in schedule, using default time periods');
      // استخدام التوقيتات الافتراضية
      const defaultTimePeriods = [
        { id: 1, start: '08:45', end: '09:30', enabled: true },
        { id: 2, start: '09:30', end: '10:15', enabled: true },
        { id: 3, start: '10:15', end: '11:00', enabled: true },
        { id: 4, start: '11:00', end: '11:45', enabled: true },
        { id: 5, start: '11:45', end: '12:30', enabled: true },
        { id: 6, start: '12:30', end: '13:15', enabled: true },
        { id: 7, start: '13:15', end: '14:00', enabled: true },
        { id: 8, start: '14:00', end: '14:45', enabled: true },
        { id: 9, start: '14:45', end: '15:30', enabled: true }
      ];
      setTimePeriods(defaultTimePeriods);
    }
    
    // Open dialog in edit mode
    openDialog();
  };

  // Handle new schedule creation
  const handleCreateNewClick = () => {
    // Create empty slot template with all required fields
    const emptySlot = {
      group_id: 0,
      course_code: "EMPTY",
      course_name: "Empty Slot",
      instructor: "None",
      room: "N/A",
      time_period_start_id: 0,
      time_period_end_id: 0,
      is_lecture: false,
      is_lab: false
    };
    
    // Reset all fields for new schedule
    setIsEditMode(false);
    setCurrentScheduleId(null);
    setScheduleTitle('');
    setScheduleType('weekly');
    // تفريغ قائمة المجموعات
    setGroups([]);
    // تفريغ قائمة الأقسام
    setDepartments([]);
    
    // إعادة تعيين التوقيتات إلى القيم الافتراضية
    const defaultTimePeriods = [
      { id: 1, start: '08:45', end: '09:30', enabled: true },
      { id: 2, start: '09:30', end: '10:15', enabled: true },
      { id: 3, start: '10:15', end: '11:00', enabled: true },
      { id: 4, start: '11:00', end: '11:45', enabled: true },
      { id: 5, start: '11:45', end: '12:30', enabled: true },
      { id: 6, start: '12:30', end: '13:15', enabled: true },
      { id: 7, start: '13:15', end: '14:00', enabled: true },
      { id: 8, start: '14:00', end: '14:45', enabled: true },
      { id: 9, start: '14:45', end: '15:30', enabled: true }
    ];
    setTimePeriods(defaultTimePeriods);
    
    // تهيئة بيانات الجدول بقيم فارغة
    setScheduleData({
      weekly: {
        Saturday: Array(9).fill({ ...emptySlot }),
        Sunday: Array(9).fill({ ...emptySlot }),
        Monday: Array(9).fill({ ...emptySlot }),
        Tuesday: Array(9).fill({ ...emptySlot }),
        Wednesday: Array(9).fill({ ...emptySlot }),
        Thursday: Array(9).fill({ ...emptySlot }),
      },
      dynamic: []
    });
    
    openDialog();
  };

  // Helper function to show notification with custom message
  const showNotificationWithMessage = (message, type = 'success') => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Handle dialog close with success
  const handleDialogClose = async (saved = false, deleted = false) => {
    closeDialog();
    
    if (deleted && isEditMode && currentScheduleId) {
      // Schedule was deleted from the dialog - حذف الجدول مباشرة بدلاً من الاعتماد على setScheduleToDelete
      try {
        await deleteSchedule(currentScheduleId);
        
        // Remove from local state
        setSchedules(prevSchedules => prevSchedules.filter(schedule => schedule.id !== currentScheduleId));
        
        // Show success notification
        showNotificationWithMessage('Schedule deleted successfully!');
      } catch (error) {
        console.error('Error deleting schedule:', error);
        showNotificationWithMessage('Failed to delete schedule. Please try again.', 'error');
      }
    } else if (saved) {
      try {
        // تنسيق بيانات الجدول للإرسال
        let formattedScheduleData = {};
        
        if (scheduleType === 'weekly') {
          // تأكد من أن لدينا هيكل صحيح للبيانات
          const weeklyData = tableDataForDialog.weekly || tableDataForDialog;
          
          // تهيئة الأيام
          const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
          days.forEach(day => {
            formattedScheduleData[day] = [];
            
            // تحويل البيانات إلى تنسيق مسطح للإرسال إلى قاعدة البيانات
            if (weeklyData[day]) {
              // استخراج جلسات اليوم
              for (let periodIndex = 0; periodIndex < weeklyData[day].length; periodIndex++) {
                if (!weeklyData[day][periodIndex]) continue;
                
                const periodsData = weeklyData[day][periodIndex];
                // استخراج الجلسات لكل قسم
                for (const deptKey in periodsData) {
                  const deptData = periodsData[deptKey];
                  // استخراج الجلسات لكل مجموعة
                  for (const groupKey in deptData) {
                    const sessionData = deptData[groupKey];
                    
                    if (sessionData && sessionData.courseCode) {
                      // استخراج معلومات الامتداد
                      const colspan = sessionData.colspan || 1;
                      const rowspan = sessionData.rowspan || 1;
                      
                      // استخراج معلومات الحقل الأصلي
                      const mainCell = {
                        group_id: groupKey,
                        course_code: sessionData.courseCode,
                        course_name: sessionData.courseName,
                        instructor: sessionData.instructor,
                        room: sessionData.room,
                        is_lecture: sessionData.isLecture,
                        is_lab: sessionData.isLab,
                        time_period_id: periodIndex,
                        colspan: colspan,
                        rowspan: rowspan,
                        is_main_cell: true
                      };
                      
                      // إضافة الخلية إلى مصفوفة اليوم
                      if (!formattedScheduleData[day]) {
                        formattedScheduleData[day] = [];
                      }
                      
                      // للتتبع: طباعة بيانات الخلية الجديدة قبل إضافتها
                      console.log(`Adding cell to ${day} at period ${periodIndex}:`, mainCell);
                      
                      // إضافة الخلية إلى مصفوفة اليوم
                      formattedScheduleData[day].push(mainCell);
                      
                      // تم إلغاء الجزء الخاص بإضافة الخلايا الفرعية للامتداد
                      // نحن الآن نعتمد فقط على خصائص colspan و rowspan في الخلية الرئيسية
                      // ستكون مسؤولية واجهة المستخدم تفسير هذه القيم عند العرض
                    }
                  }
                }
              }
            }
          });
        } else {
          // تنسيق البيانات للجدول الديناميكي
          formattedScheduleData = tableDataForDialog.dynamic || [];
        }
        
        console.log('Formatted schedule data for API:', formattedScheduleData);
        
        // تنسيق المجموعات لإرسالها إلى API
        const formattedGroups = groups.map(group => {
          // استخراج رقم من معرف المجموعة بغض النظر عن تنسيقه
          let groupId;
          if (typeof group.id === 'number') {
            // تحويل الرقم إلى نص
            groupId = String(group.id);
          } else if (typeof group.id === 'string') {
            // استخدام النص كما هو
            groupId = group.id;
          } else {
            // إنشاء معرف نصي جديد باستخدام الطابع الزمني
            groupId = `GRP${Date.now()}`;
          }
          
          return {
            id: groupId,
            name: group.name,
            enabled: group.enabled !== false
          };
        });
        
        // تنسيق التوقيتات لإرسالها إلى API
        const formattedTimePeriods = timePeriods.map(period => ({
          id: period.id,
          start: period.start,
          end: period.end,
          enabled: period.enabled !== false
        }));
        
        console.log('Saving schedule with groups:', formattedGroups);
        console.log('Saving schedule with time periods:', formattedTimePeriods);
        
        if (isEditMode && currentScheduleId) {
          // Update existing schedule
          const updatedScheduleData = {
            title: scheduleTitle,
            scheduleData: {
              weekly: {
                Saturday: formattedScheduleData['Saturday'] || [],
                Sunday: formattedScheduleData['Sunday'] || [],
                Monday: formattedScheduleData['Monday'] || [],
                Tuesday: formattedScheduleData['Tuesday'] || [],
                Wednesday: formattedScheduleData['Wednesday'] || [],
                Thursday: formattedScheduleData['Thursday'] || []
              },
              dynamic: [],
              coveredCells: {}
            },
            scheduleType: scheduleType,
            groups: formattedGroups,
            timePeriods: formattedTimePeriods
          };
          
          console.log('Sending update data:', updatedScheduleData);
          
          try {
            const updatedSchedule = await updateSchedule(currentScheduleId, updatedScheduleData);
            
            // Update local state
            setSchedules(prevSchedules => 
              prevSchedules.map(schedule => 
                schedule.id === currentScheduleId ? updatedSchedule : schedule
              )
            );
            
            // Show success notification
            showNotificationWithMessage('Schedule updated successfully!');
          } catch (updateError) {
            console.error('Error during schedule update:', updateError);
            
            // Retry with simplified data
            const simplifiedData = {
              title: scheduleTitle,
              scheduleType: scheduleType,
              scheduleData: {
                weekly: {
                  Saturday: formattedScheduleData['Saturday'] || [],
                  Sunday: formattedScheduleData['Sunday'] || [],
                  Monday: formattedScheduleData['Monday'] || [],
                  Tuesday: formattedScheduleData['Tuesday'] || [],
                  Wednesday: formattedScheduleData['Wednesday'] || [],
                  Thursday: formattedScheduleData['Thursday'] || []
                },
                dynamic: [],
                coveredCells: {}
              },
              groups: formattedGroups,
              timePeriods: formattedTimePeriods
            };
            
            console.log('Retrying with simplified data:', simplifiedData);
            
            const updatedSchedule = await updateSchedule(currentScheduleId, simplifiedData);
            
            // Update local state
            setSchedules(prevSchedules => 
              prevSchedules.map(schedule => 
                schedule.id === currentScheduleId ? updatedSchedule : schedule
              )
            );
        
        // Show success notification
            showNotificationWithMessage('Schedule updated successfully!');
          }
        } else if (scheduleTitle) {
          // Create new schedule
          const newScheduleData = {
            title: scheduleTitle,
            scheduleData: {
              weekly: {
                Saturday: formattedScheduleData['Saturday'] || [],
                Sunday: formattedScheduleData['Sunday'] || [],
                Monday: formattedScheduleData['Monday'] || [],
                Tuesday: formattedScheduleData['Tuesday'] || [],
                Wednesday: formattedScheduleData['Wednesday'] || [],
                Thursday: formattedScheduleData['Thursday'] || []
              },
              dynamic: [],
              coveredCells: {}
            },
            scheduleType: scheduleType,
            groups: formattedGroups,
            timePeriods: formattedTimePeriods
          };
          
          console.log('Creating new schedule with data:', newScheduleData);
          
          const createdSchedule = await createSchedule(newScheduleData);
        
          // Add to schedules list
          setSchedules(prevSchedules => [...prevSchedules, createdSchedule]);
        
          // Show success notification
          showNotificationWithMessage('Schedule created successfully!');
        }
      } catch (error) {
        console.error('Error saving schedule:', error);
        showNotificationWithMessage('Failed to save schedule. Please try again.', 'error');
      }
    }
  };

  // Handle schedule deletion
  const handleDeleteClick = (e, schedule) => {
    e.stopPropagation();
    setScheduleToDelete(schedule);
    setShowDeleteConfirm(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (scheduleToDelete) {
      try {
        await deleteSchedule(scheduleToDelete.id);
        
        // Remove from local state
        setSchedules(prevSchedules => prevSchedules.filter(schedule => schedule.id !== scheduleToDelete.id));
        
        // Show success notification
        showNotificationWithMessage('Schedule deleted successfully!');
      } catch (error) {
        console.error('Error deleting schedule:', error);
        showNotificationWithMessage('Failed to delete schedule. Please try again.', 'error');
      } finally {
        setShowDeleteConfirm(false);
        setScheduleToDelete(null);
      }
    }
  };
  
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setScheduleToDelete(null);
  };
  
  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h1 className="page-title">Schedule</h1>
        <div className="header-actions">
          <button className="action-btn create" onClick={handleCreateNewClick}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create New Schedule
          </button>
        </div>
      </div>
      
      {/* Success Notification */}
      {showNotification && (
        <div className="notification success">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>{notificationMessage || (isEditMode ? "Schedule updated successfully!" : "Schedule created successfully!")}</span>
        </div>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading schedules...</p>
        </div>
      )}
      
      {/* No Schedules State */}
      {!isLoading && schedules.length === 0 && (
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="empty-icon">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <h3>No schedules found</h3>
          <p>Create your first schedule by clicking the button above.</p>
        </div>
      )}
      
      <div className="schedule-grid">
        {/* Schedule Cards */}
        {!isLoading && schedules.map((schedule) => (
          <div key={schedule.id} className="schedule-card" onClick={() => handleScheduleClick(schedule)}>
            <div className="schedule-image">
                <Image src={schedule.image} alt={schedule.title} width={300} height={200} />
            </div>
            <div className="schedule-content">
                <h2 className="schedule-title">{schedule.title}</h2>
                <div className="footer">
                    <div className="schedule-meta">
                        <div className="meta-item">
                            <span className="meta-label">Created at</span>
                            <span className="meta-value">{new Date(schedule.createdAt).toLocaleDateString()}</span>
                        </div>
                        {schedule.lastEditAt && (
                          <div className="meta-item">
                              <span className="meta-label">Last edit at</span>
                              <span className="meta-value">{new Date(schedule.lastEditAt).toLocaleString()}</span>
                          </div>
                        )}
                    </div>
                    <div className="schedule-author">
                        <Image src={schedule.author.avatar} alt={schedule.author.name} className="author-avatar" width={40} height={40} />
                        <span className="author-name">{schedule.author.name}</span>
                    </div>
                </div>
            </div>
            <button 
              className="delete-schedule-btn" 
              onClick={(e) => handleDeleteClick(e, schedule)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Schedule Dialog */}
      <ScheduleDialog 
        isOpen={isDialogOpen} 
        onClose={handleDialogClose} 
        scheduleType={scheduleType}
        setScheduleType={setScheduleType}
        scheduleTitle={scheduleTitle}
        setScheduleTitle={setScheduleTitle}
        departments={departments}
        setDepartments={setDepartments}
        groups={groups}
        setGroups={setGroups}
        timePeriods={timePeriods}
        setTimePeriods={setTimePeriods}
        tableData={tableDataForDialog}
        resizingCell={resizingCell}
        handleCellClick={handleCellClick}
        handleCellDoubleClick={handleCellDoubleClick}
        addSession={addSession}
        addDynamicRow={addDynamicRow}
        startResize={startResize}
        getCellSession={getCellSession}
        increaseColspan={increaseColspan}
        increaseRowspan={increaseRowspan}
        decreaseColspan={decreaseColspan}
        decreaseRowspan={decreaseRowspan}
        resetSelection={resetSelection}
        editMode={editMode}
        setEditMode={setEditMode}
        handleSessionDrop={handleSessionDrop}
        tableScale={tableScale}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        deleteSession={deleteSession}
        isEditMode={isEditMode}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Confirm Schedule Deletion"
        message={`Are you sure you want to delete "${scheduleToDelete?.title}" schedule?`}
        confirmText="Delete Schedule"
      />
    </div>
  );
}