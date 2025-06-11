'use client';

import { useState, useEffect } from 'react';

// Dialog state hook
export const useScheduleDialog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scheduleType, setScheduleType] = useState('weekly'); // 'weekly' or 'dynamic'
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [editMode, setEditMode] = useState(true); // إضافة حالة وضع التحرير (مفعّل افتراضيًا)
  const [tableScale, setTableScale] = useState(1);
  
  // Department and group settings
  const [departments, setDepartments] = useState([
    { id: 'ALL', name: 'ALL', enabled: true }
  ]);
  
  const [groups, setGroups] = useState([]);
  
  // Time periods - تحديد التوقيتات بشكل صريح
  const [timePeriods, setTimePeriods] = useState([
    { id: 1, start: '08:45', end: '09:30', enabled: true },
    { id: 2, start: '09:30', end: '10:15', enabled: true },
    { id: 3, start: '10:15', end: '11:00', enabled: true },
    { id: 4, start: '11:00', end: '11:45', enabled: true },
    { id: 5, start: '11:45', end: '12:30', enabled: true },
    { id: 6, start: '12:30', end: '13:15', enabled: true },
    { id: 7, start: '13:15', end: '14:00', enabled: true },
    { id: 8, start: '14:00', end: '14:45', enabled: true },
    { id: 9, start: '14:45', end: '15:30', enabled: true }
  ]);

  // Schedule data structure
  const [scheduleData, setScheduleData] = useState({
    weekly: {
      Saturday: Array(9).fill(null),
      Sunday: Array(9).fill(null),
      Monday: Array(9).fill(null),
      Tuesday: Array(9).fill(null),
      Wednesday: Array(9).fill(null),
      Thursday: Array(9).fill(null),
    },
    dynamic: []
  });

  // Cell states
  const [selectedCell, setSelectedCell] = useState(null); // خلية مختارة للتحرير
  const [resizingCell, setResizingCell] = useState(null); // خلية مختارة للتوسيع
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [resizeDelta, setResizeDelta] = useState({ x: 0, y: 0 });
  const [resizeStep, setResizeStep] = useState(25); // Pixels to move for each increment

  const openDialog = () => {
    // ضبط التوقيتات بشكل صريح قبل فتح النافذة
    setTimePeriods([
      { id: 1, start: '08:45', end: '09:30', enabled: true },
      { id: 2, start: '09:30', end: '10:15', enabled: true },
      { id: 3, start: '10:15', end: '11:00', enabled: true },
      { id: 4, start: '11:00', end: '11:45', enabled: true },
      { id: 5, start: '11:45', end: '12:30', enabled: true },
      { id: 6, start: '12:30', end: '13:15', enabled: true },
      { id: 7, start: '13:15', end: '14:00', enabled: true },
      { id: 8, start: '14:00', end: '14:45', enabled: true },
      { id: 9, start: '14:45', end: '15:30', enabled: true }
    ]);
    setIsDialogOpen(true);
  };
  
  const closeDialog = () => setIsDialogOpen(false);

  // النقرة العادية - للتوسيع فقط
  const handleCellClick = (day, periodIndex, department, group) => {
    // تحقق مما إذا كانت الخلية تحتوي على محاضرة
    const existingSession = getCellSession(day, periodIndex, department, group);
    
    if (existingSession) {
      // اختر الخلية للتوسيع فقط
      setResizingCell({ 
        day, 
        periodIndex, 
        department, 
        group,
        session: existingSession,
        mode: 'weekly' // يمكن تغييره حسب النوع
      });
    } else {
      // إذا كانت فارغة، يمكن للمستخدم إضافة محاضرة جديدة
      setResizingCell(null);
      
      // عين الخلية كخلية محددة بدون تفعيل وضع التحرير
      setSelectedCell({ 
        day, 
        periodIndex, 
        department, 
        group,
        mode: 'weekly' 
      });
    }
  };
  
  // النقر المزدوج - لفتح نافذة التحرير
  const handleCellDoubleClick = (day, periodIndex, department, group, mode = 'weekly') => {
    // تحقق مما إذا كانت الخلية تحتوي على محاضرة
    const existingSession = getCellSession(day, periodIndex, department, group, mode);
    
    // في حالة النقر المزدوج، دائمًا اختر الخلية للتحرير
    setSelectedCell({ 
      day, 
      periodIndex, 
      department, 
      group,
      mode 
    });
    
    // تفعيل وضع التحرير
    setEditMode(true);
    
    // إذا كانت الخلية تحتوي على محاضرة، احتفظ بمعلومات التوسيع أيضًا
    if (existingSession) {
      setResizingCell({ 
        day, 
        periodIndex, 
        department, 
        group,
        session: existingSession,
        mode
      });
    } else {
      setResizingCell(null);
    }
    
    return existingSession; // إرجاع البيانات لاستخدامها في مكونات أخرى
  };

  // Get session data for a specific cell
  const getCellSession = (day, periodIndex, department, group, mode = 'weekly') => {
    // Ya no necesitamos verificar las celdas de cubrimiento
    // La visualización se basa solo en el colspan y rowspan de la celda principal
    
    // إذا لم تكن خلية مغطاة، نستمر بالطريقة العادية
    if (mode === 'dynamic') {
      const rowIndex = day; // day represents the row index in dynamic mode
      if (!scheduleData.dynamic[rowIndex]?.data?.[periodIndex]?.[department]?.[group]) {
        return null;
      }
      return scheduleData.dynamic[rowIndex].data[periodIndex][department][group];
    } else {
      // التأكد من أن المعرفات المستخدمة هي نصية
      const groupId = typeof group === 'object' ? group.id : String(group);
      
      // التحقق من وجود البيانات
      if (!scheduleData.weekly[day]?.[periodIndex]?.[department]?.[groupId]) {
        // محاولة العثور بالمعرف الرقمي إذا لم يتم العثور بالمعرف النصي
        if (typeof group === 'string' && !isNaN(parseInt(group)) && 
            scheduleData.weekly[day]?.[periodIndex]?.[department]?.[parseInt(group)]) {
          return scheduleData.weekly[day][periodIndex][department][parseInt(group)];
        }
        return null;
      }
      return scheduleData.weekly[day][periodIndex][department][groupId];
    }
  };

  // Add session to schedule with colspan and rowspan
  const addSession = (sessionData) => {
    if (!selectedCell) return;
    
    const { day, periodIndex, department, group, mode } = selectedCell;
    
    // إضافة سجلات للتتبع لمساعدة في حل المشكلة
    console.log('Adding session:', { 
      day, 
      periodIndex, 
      department, 
      group, 
      mode,
      sessionData 
    });
    
    const newScheduleData = JSON.parse(JSON.stringify(scheduleData)); // Deep copy to ensure state update
    
    // Add colspan and rowspan properties (default to 1)
    const sessionWithSpan = {
      ...sessionData,
      colspan: sessionData.colspan || 1,
      rowspan: sessionData.rowspan || 1,
      time_period_id: periodIndex // إضافة معرف الفترة الزمنية
    };
    
    if (mode === 'dynamic') {
      // For dynamic mode
      if (!newScheduleData.dynamic[day]) {
        newScheduleData.dynamic[day] = { data: [] };
      }
      
      if (!newScheduleData.dynamic[day].data[periodIndex]) {
        newScheduleData.dynamic[day].data[periodIndex] = {};
      }
      
      if (!newScheduleData.dynamic[day].data[periodIndex][department]) {
        newScheduleData.dynamic[day].data[periodIndex][department] = {};
      }
      
      newScheduleData.dynamic[day].data[periodIndex][department][group] = sessionWithSpan;
    } else {
      // For weekly mode
      if (!newScheduleData.weekly[day]) {
        newScheduleData.weekly[day] = [];
      }
      
      if (!newScheduleData.weekly[day][periodIndex]) {
        newScheduleData.weekly[day][periodIndex] = {};
      }
      
      if (!newScheduleData.weekly[day][periodIndex][department]) {
        newScheduleData.weekly[day][periodIndex][department] = {};
      }
      
      newScheduleData.weekly[day][periodIndex][department][group] = sessionWithSpan;
      
      // Ya no necesitamos crear celdas adicionales para el cubrimiento
      // La visualización se basa solo en colspan y rowspan de la celda principal
    }
    
    setScheduleData(newScheduleData);
    
    // Reset selection to avoid confusion
    setSelectedCell(null);
  };

  // إعادة ضبط حالة التحديد
  const resetSelection = () => {
    setResizingCell(null);
    setSelectedCell(null);
    setEditMode(false); // إغلاق وضع التحرير عند إعادة الضبط
  };

  // Start resize operation
  const startResize = (e, direction) => {
    if (!resizingCell) return;
    
    e.preventDefault();
    setResizeDelta({ x: 0, y: 0 });
    setIsResizing(true);
    setResizeDirection(direction);
    
    // Add event listeners for mouse movement and mouse up
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
  };
  
  // Handle resize during mouse movement
  const handleResize = (e) => {
    if (!isResizing || !resizingCell) return;
    
    // Calculate deltas from start position
    const newDeltaX = e.clientX - resizeDelta.x;
    const newDeltaY = e.clientY - resizeDelta.y;
    
    // Simple implementation with direct increment/decrement
    const { day, periodIndex, department, group, session, mode } = resizingCell;
    let { colspan = 1, rowspan = 1, ...rest } = session;
    
    // Check if we've moved enough to trigger a span change
    let spanChanged = false;
    
    // Handle horizontal resizing (right or corner)
    if ((resizeDirection === 'right' || resizeDirection === 'corner')) {
      // Determine if we need to increase/decrease based on step size
      const stepsX = Math.floor(newDeltaX / resizeStep);
      if (stepsX !== Math.floor(resizeDelta.x / resizeStep)) {
        // We've crossed a threshold for change
        const newColspan = Math.max(1, colspan + (stepsX - Math.floor(resizeDelta.x / resizeStep)));
        if (newColspan !== colspan) {
          colspan = newColspan;
          spanChanged = true;
          console.log(`Updating colspan to ${colspan}`);
        }
      }
    }
    
    // Handle vertical resizing (bottom or corner)
    if ((resizeDirection === 'bottom' || resizeDirection === 'corner')) {
      // Determine if we need to increase/decrease based on step size
      const stepsY = Math.floor(newDeltaY / resizeStep);
      if (stepsY !== Math.floor(resizeDelta.y / resizeStep)) {
        // We've crossed a threshold for change
        const newRowspan = Math.max(1, rowspan + (stepsY - Math.floor(resizeDelta.y / resizeStep)));
        if (newRowspan !== rowspan) {
          rowspan = newRowspan;
          spanChanged = true;
          console.log(`Updating rowspan to ${rowspan}`);
        }
      }
    }
    
    // Update the resizeDelta for next comparison
    setResizeDelta({ x: newDeltaX, y: newDeltaY });
    
    // Only update if something changed
    if (spanChanged) {
      const updatedSession = { ...rest, colspan, rowspan };
      updateSession(day, periodIndex, department, group, updatedSession, mode);
    }
  };
  
  // Stop resize operation
  const stopResize = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
  };
  
  // Update an existing session
  const updateSession = (day, periodIndex, department, group, updatedSession, mode = 'weekly') => {
    // Create a deep copy of the current state
    const newScheduleData = JSON.parse(JSON.stringify(scheduleData));
    
    if (mode === 'dynamic') {
      const rowIndex = day;
      if (newScheduleData.dynamic[rowIndex]?.data?.[periodIndex]?.[department]?.[group]) {
        newScheduleData.dynamic[rowIndex].data[periodIndex][department][group] = updatedSession;
      }
    } else {
      if (newScheduleData.weekly[day]?.[periodIndex]?.[department]?.[group]) {
        newScheduleData.weekly[day][periodIndex][department][group] = updatedSession;
      }
    }
    
    // Force a complete state update
    setScheduleData(newScheduleData);
    
    // Update the resizing cell reference as well
    if (resizingCell) {
      setResizingCell({
        ...resizingCell,
        session: updatedSession
      });
    }
  };

  // Function to manually increase colspan
  const increaseColspan = () => {
    if (!resizingCell) return;
    
    const { day, periodIndex, department, group, session, mode } = resizingCell;
    const { colspan = 1, rowspan = 1, ...rest } = session;
    
    const updatedSession = { 
      ...rest,
      colspan: colspan + 1,
      rowspan: rowspan  // Preserve existing rowspan
    };
    
    updateSession(day, periodIndex, department, group, updatedSession, mode);
  };
  
  // Function to manually increase rowspan
  const increaseRowspan = () => {
    if (!resizingCell) return;
    
    const { day, periodIndex, department, group, session, mode } = resizingCell;
    const { colspan = 1, rowspan = 1, ...rest } = session;
    
    const updatedSession = { 
      ...rest,
      colspan: colspan,  // Preserve existing colspan
      rowspan: rowspan + 1
    };
    
    updateSession(day, periodIndex, department, group, updatedSession, mode);
  };
  
  // Function to manually decrease colspan
  const decreaseColspan = () => {
    if (!resizingCell) return;
    
    const { day, periodIndex, department, group, session, mode } = resizingCell;
    const { colspan = 1, rowspan = 1, ...rest } = session;
    
    // Don't let it go below 1
    if (colspan <= 1) return;
    
    const updatedSession = { 
      ...rest,
      colspan: colspan - 1,
      rowspan: rowspan  // Preserve existing rowspan
    };
    
    updateSession(day, periodIndex, department, group, updatedSession, mode);
  };
  
  // Function to manually decrease rowspan
  const decreaseRowspan = () => {
    if (!resizingCell) return;
    
    const { day, periodIndex, department, group, session, mode } = resizingCell;
    const { colspan = 1, rowspan = 1, ...rest } = session;
    
    // Don't let it go below 1
    if (rowspan <= 1) return;
    
    const updatedSession = { 
      ...rest,
      colspan: colspan,  // Preserve existing colspan
      rowspan: rowspan - 1
    };
    
    updateSession(day, periodIndex, department, group, updatedSession, mode);
  };

  // Function to delete a session
  const deleteSession = () => {
    if (!resizingCell) return;
    
    const { day, periodIndex, department, group, mode } = resizingCell;
    
    // Create a deep copy of the current state
    const newScheduleData = JSON.parse(JSON.stringify(scheduleData));
    
    if (mode === 'dynamic') {
      const rowIndex = day;
      if (newScheduleData.dynamic[rowIndex]?.data?.[periodIndex]?.[department]?.[group]) {
        // Remove the session
        delete newScheduleData.dynamic[rowIndex].data[periodIndex][department][group];
      }
    } else {
      if (newScheduleData.weekly[day]?.[periodIndex]?.[department]?.[group]) {
        // Remove the session
        delete newScheduleData.weekly[day][periodIndex][department][group];
      }
    }
    
    // Update state
    setScheduleData(newScheduleData);
    
    // Clear the cell selection
    setResizingCell(null);
    setSelectedCell(null);
    setEditMode(false);
  };

  // Helper function to get data from nested structure (Will be kept for getCellSession and future D&D)
  const getSessionFromSchedule = (data, mode, dayOrRowIndex, periodIdx, deptIdOrName, grpIdOrName) => {
    try {
      if (mode === 'dynamic') {
        return data.dynamic[dayOrRowIndex]?.data?.[periodIdx]?.[deptIdOrName]?.[grpIdOrName] || null;
      } else { // weekly
        return data.weekly[dayOrRowIndex]?.[periodIdx]?.[deptIdOrName]?.[grpIdOrName] || null;
      }
    } catch (e) {
      return null;
    }
  };

  // Helper function to set data in nested structure (Will be kept for future D&D)
  const setSessionInSchedule = (data, mode, dayOrRowIndex, periodIdx, deptIdOrName, grpIdOrName, sessionValue) => {
    if (mode === 'dynamic') {
      if (!data.dynamic[dayOrRowIndex]) data.dynamic[dayOrRowIndex] = { date: scheduleData.dynamic[dayOrRowIndex]?.date || new Date().toISOString().split('T')[0] , data: {} };
      if (!data.dynamic[dayOrRowIndex].data) data.dynamic[dayOrRowIndex].data = {};
      if (!data.dynamic[dayOrRowIndex].data[periodIdx]) data.dynamic[dayOrRowIndex].data[periodIdx] = {};
      if (!data.dynamic[dayOrRowIndex].data[periodIdx][deptIdOrName]) data.dynamic[dayOrRowIndex].data[periodIdx][deptIdOrName] = {};
      data.dynamic[dayOrRowIndex].data[periodIdx][deptIdOrName][grpIdOrName] = sessionValue;
    } else { // weekly
      if (!data.weekly[dayOrRowIndex]) data.weekly[dayOrRowIndex] = []; // Should be pre-initialized
      if (!data.weekly[dayOrRowIndex][periodIdx]) data.weekly[dayOrRowIndex][periodIdx] = {};
      if (!data.weekly[dayOrRowIndex][periodIdx][deptIdOrName]) data.weekly[dayOrRowIndex][periodIdx][deptIdOrName] = {};
      data.weekly[dayOrRowIndex][periodIdx][deptIdOrName][grpIdOrName] = sessionValue;
    }
  };

  // Add new dynamic row
  const addDynamicRow = (rowData) => {
    if (scheduleType === 'dynamic') {
      const newRow = {
        date: rowData.date,
        data: {}
      };
      
      setScheduleData({
        ...scheduleData,
        dynamic: [...scheduleData.dynamic, newRow]
      });
    }
  };

  // Listen for escape key to cancel resize
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isResizing) {
        stopResize();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isResizing]);

  const handleSessionDrop = (draggedItemData, targetCellCtx) => {
    if (!draggedItemData || !targetCellCtx) return false;
    
    console.log('Handling drop:', { draggedItemData, targetCellCtx });
    
    try {
      // Extract source and target information
      const { session: sourceSession, colspan, rowspan, timePeriodId: sourcePeriodId } = draggedItemData;
      const { day: targetDay, periodIndex: targetPeriodId, department: targetDept, group: targetGroup } = targetCellCtx;
      
      // Check if target cell is already occupied
      const targetHasSession = getCellSession(targetDay, targetPeriodId, targetDept, targetGroup);
      if (targetHasSession) {
        console.log('Target cell is already occupied');
        return false;
      }
      
      // Create a new session object for the target cell
      const newSession = {
        ...sourceSession,
        time_period_id: targetPeriodId // استخدام معرف الفترة الزمنية الجديدة
      };
      
      // Delete the session from the source cell
      if (resizingCell) {
        const { day: sourceDay, periodIndex: sourcePeriod, department: sourceDept, group: sourceGroup } = resizingCell;
        
        // Create a deep copy of the schedule data
        const newScheduleData = JSON.parse(JSON.stringify(scheduleData));
        
        // Remove the source session
        if (newScheduleData.weekly[sourceDay]?.[sourcePeriod]?.[sourceDept]?.[sourceGroup]) {
          delete newScheduleData.weekly[sourceDay][sourcePeriod][sourceDept][sourceGroup];
        }
        
        // Add the session to the target cell
        if (!newScheduleData.weekly[targetDay]) {
          newScheduleData.weekly[targetDay] = [];
        }
        
        if (!newScheduleData.weekly[targetDay][targetPeriodId]) {
          newScheduleData.weekly[targetDay][targetPeriodId] = {};
        }
        
        if (!newScheduleData.weekly[targetDay][targetPeriodId][targetDept]) {
          newScheduleData.weekly[targetDay][targetPeriodId][targetDept] = {};
        }
        
        // Add the session with its original colspan and rowspan
        newScheduleData.weekly[targetDay][targetPeriodId][targetDept][targetGroup] = {
          ...newSession,
          colspan,
          rowspan,
          time_period_id: targetPeriodId // استخدام معرف الفترة الزمنية الجديدة
        };
        
        // No necesitamos crear celdas adicionales para el cubrimiento
        // La visualización se basa solo en colspan y rowspan
        
        // Update the schedule data
        setScheduleData(newScheduleData);
        
        // Update selection to the new cell
        setResizingCell({
          day: targetDay,
          periodIndex: targetPeriodId,
          department: targetDept,
          group: targetGroup,
          session: newSession,
          mode: 'weekly'
        });
        
        return true;
      }
    } catch (error) {
      console.error('Error during drag and drop:', error);
    }
    
    return false;
  };

  const zoomIn = () => {
    setTableScale(prevScale => {
      const newScale = Math.min(prevScale + 0.1, 2);
      console.log('Zooming In - New Scale:', newScale); // Log new scale
      return newScale;
    });
  };

  const zoomOut = () => {
    setTableScale(prevScale => {
      const newScale = Math.max(prevScale - 0.1, 0.5);
      console.log('Zooming Out - New Scale:', newScale); // Log new scale
      return newScale;
    });
  };

  return {
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
    scheduleData,
    setScheduleData,
    selectedCell,
    resizingCell,
    handleCellClick,
    handleCellDoubleClick,
    addSession,
    addDynamicRow,
    isResizing,
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
  };
};
