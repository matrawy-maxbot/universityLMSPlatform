'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import ScheduleCell from './ScheduleCell';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { getAvailableGroups, getCourses, getInstructorsByCourse } from '../api';
import '../styles/dialog.css';

export default function ScheduleDialog({
  isOpen, 
  onClose, 
  scheduleType, setScheduleType, 
  scheduleTitle, setScheduleTitle, 
  departments, setDepartments, 
  groups, setGroups, 
  timePeriods, setTimePeriods, 
  tableData,
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
  deleteSession,
  isEditMode
}) {
  console.log("ScheduleDialog received tableScale:", tableScale);

  const [step, setStep] = useState(isEditMode ? 3 : 1); // 1: Basic Info, 2: Configure Table, 3: Edit Table
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionFormData, setSessionFormData] = useState({
    courseCode: '',
    courseName: '',
    instructor: '',
    room: '',
    isLecture: true // true for lecture (green), false for section (blue)
  });
  
  // إضافة حالة لنافذة تأكيد الحذف
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [courseCodeToDelete, setCourseCodeToDelete] = useState('');
  
  // إضافة حالة جديدة لتأكيد حذف الجدول
  const [showScheduleDeleteConfirm, setShowScheduleDeleteConfirm] = useState(false);
  
  // Department management
  const [editingDept, setEditingDept] = useState(null);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [draggedDept, setDraggedDept] = useState(null);
  
  // Group management
  const [editingGroup, setEditingGroup] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [draggedGroup, setDraggedGroup] = useState(null);

  // Time period management
  const [isAddingTimePeriod, setIsAddingTimePeriod] = useState(false);
  const [newTimePeriodStart, setNewTimePeriodStart] = useState('08:45');
  const [newTimePeriodEnd, setNewTimePeriodEnd] = useState('09:30');

  // Available groups from database
  const [availableGroups, setAvailableGroups] = useState([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  // إضافة حالات جديدة للكورسات والمعلمين
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingInstructors, setIsLoadingInstructors] = useState(false);
  
  // Refs for drag and drop
  const deptListRef = useRef(null);
  const groupListRef = useRef(null);
  
  // اضافة useEffect للتبديل إلى الخطوة 3 عند فتح النافذة في وضع التعديل
  useEffect(() => {
    if (isOpen) {
      setStep(isEditMode ? 3 : 1);
    }
  }, [isOpen, isEditMode]);
  
  // Load available groups from database
  useEffect(() => {
    const loadGroups = async () => {
      if (isOpen && step === 2) {
        setIsLoadingGroups(true);
        try {
          const groups = await getAvailableGroups();
          setAvailableGroups(groups);
        } catch (error) {
          console.error('Failed to load groups:', error);
        } finally {
          setIsLoadingGroups(false);
        }
      }
    };
    
    loadGroups();
  }, [isOpen, step]);
  
  // تحميل التوقيتات عند فتح النافذة وتهيئتها بشكل صحيح
  useEffect(() => {
    if (isOpen) {
      // تهيئة التوقيتات بشكل صريح عند فتح النافذة
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
      
      // الحفاظ على خصائص 'enabled' من التوقيتات الحالية
      const formattedTimePeriods = defaultTimePeriods.map((defaultPeriod, index) => {
        const currentPeriod = timePeriods[index];
        return {
          ...defaultPeriod,
          enabled: currentPeriod ? currentPeriod.enabled : true
        };
      });
      
      setTimePeriods(formattedTimePeriods);
    }
  }, [isOpen]); // أزلنا timePeriods من مصفوفة التبعيات لمنع الحلقة اللانهائية
  
  // تحميل الكورسات عند فتح النافذة
  useEffect(() => {
    const loadCourses = async () => {
      if (isOpen && (step === 3 || selectedSession)) {
        setIsLoadingCourses(true);
        try {
          const coursesData = await getCourses();
          console.log('Loaded courses data:', coursesData);
          setCourses(coursesData);
        } catch (error) {
          console.error('Failed to load courses:', error);
        } finally {
          setIsLoadingCourses(false);
        }
      }
    };
    
    loadCourses();
  }, [isOpen, step, selectedSession]);
  
  // تحميل المعلمين عند اختيار كورس
  useEffect(() => {
    const loadInstructors = async () => {
      if (sessionFormData.courseCode) {
        setIsLoadingInstructors(true);
        try {
          const instructorsData = await getInstructorsByCourse(sessionFormData.courseCode, sessionFormData.isLecture);
          setInstructors(instructorsData);
        } catch (error) {
          console.error('Failed to load instructors:', error);
        } finally {
          setIsLoadingInstructors(false);
        }
      } else {
        // إذا لم يتم اختيار كورس، قم بتفريغ قائمة المعلمين
        setInstructors([]);
      }
    };
    
    loadInstructors();
  }, [sessionFormData.courseCode, sessionFormData.isLecture]);
  
  // Add new department
  const addDepartment = () => {
    if (newDepartmentName.trim()) {
      // Check for duplicate names
      if (departments.some(dept => dept.name.toLowerCase() === newDepartmentName.trim().toLowerCase())) {
        alert('This department name already exists.');
        return;
      }
      
      const newDept = {
        name: newDepartmentName.trim(),
        enabled: true
      };
      
      setDepartments([...departments, newDept]);
      setNewDepartmentName('');
      setIsAddingDepartment(false);
    }
  };
  
  // Delete department
  const deleteDepartment = (name) => {
    setDepartments(departments.filter(dept => dept.name !== name));
  };
  
  // Start editing department
  const startEditDepartment = (dept) => {
    setEditingDept(dept.name);
    setNewDepartmentName(dept.name);
  };
  
  // Update department
  const updateDepartment = () => {
    if (newDepartmentName.trim()) {
      // Check for duplicate names, excluding the current one being edited
      if (departments.some(dept => 
        dept.name.toLowerCase() === newDepartmentName.trim().toLowerCase() && 
        dept.name !== editingDept
      )) {
        alert('This department name already exists.');
        return;
      }
      
      setDepartments(departments.map(dept => 
        dept.name === editingDept ? 
          {...dept, name: newDepartmentName.trim()} : 
          dept
      ));
      setEditingDept(null);
      setNewDepartmentName('');
    }
  };
  
  // Handle department drag start
  const handleDeptDragStart = (e, deptName) => {
    setDraggedDept(deptName);
    e.currentTarget.classList.add('dragging');
    // For better drag preview effect
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  };
  
  // Handle department drag end
  const handleDeptDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedDept(null);
  };
  
  // Handle department drag over
  const handleDeptDragOver = (e, deptName) => {
    e.preventDefault();
    if (!draggedDept || draggedDept === deptName) return;
    
    // Reorder departments
    const draggedIndex = departments.findIndex(dept => dept.name === draggedDept);
    const targetIndex = departments.findIndex(dept => dept.name === deptName);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newDepartments = [...departments];
      const [removed] = newDepartments.splice(draggedIndex, 1);
      newDepartments.splice(targetIndex, 0, removed);
      setDepartments(newDepartments);
    }
  };

  // Add new group
  const addGroup = () => {
    if (newGroupName.trim()) {
      // Check for duplicate names
      if (groups.some(group => group.name.toLowerCase() === newGroupName.trim().toLowerCase())) {
        alert('This group name already exists in the schedule.');
        return;
      }
      
      // Try to find group in available groups
      const selectedGroup = availableGroups.find(g => g.name === newGroupName);
      
      // إنشاء معرف نصي للمجموعة
      let groupId;
      
      if (selectedGroup) {
        // استخدام معرف المجموعة الموجودة كنص
        groupId = String(selectedGroup.id);
      } else {
        // إنشاء معرف نصي جديد
        const timestamp = Date.now();
        groupId = `GRP${timestamp}`;
      }
      
      const newGroup = {
        id: groupId,
        name: newGroupName.trim(),
        enabled: true
      };
      
      setGroups([...groups, newGroup]);
      setNewGroupName('');
      setIsAddingGroup(false);
    }
  };
  
  // Delete group
  const deleteGroup = (name) => {
    setGroups(groups.filter(group => group.name !== name));
  };
  
  // Start editing group
  const startEditGroup = (group) => {
    setEditingGroup(group.name);
    setNewGroupName(group.name);
    
    // تحميل المجموعات المتاحة عند تعديل مجموعة
    if (!isLoadingGroups && availableGroups.length === 0) {
      const loadGroups = async () => {
        setIsLoadingGroups(true);
        try {
          const groups = await getAvailableGroups();
          setAvailableGroups(groups);
        } catch (error) {
          console.error('Failed to load groups:', error);
        } finally {
          setIsLoadingGroups(false);
        }
      };
      loadGroups();
    }
  };
  
  // Update group
  const updateGroup = () => {
    if (newGroupName.trim()) {
      // Check for duplicate names, excluding the current one being edited
      if (groups.some(group => 
        group.name.toLowerCase() === newGroupName.trim().toLowerCase() && 
        group.name !== editingGroup
      )) {
        alert('This group name already exists.');
        return;
      }
      
      setGroups(groups.map(group => 
        group.name === editingGroup ? 
          {...group, name: newGroupName.trim()} : 
          group
      ));
      setEditingGroup(null);
      setNewGroupName('');
    }
  };
  
  // Handle group drag start
  const handleGroupDragStart = (e, groupName) => {
    setDraggedGroup(groupName);
    e.currentTarget.classList.add('dragging');
    // For better drag preview effect
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  };
  
  // Handle group drag end
  const handleGroupDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedGroup(null);
  };
  
  // Handle group drag over
  const handleGroupDragOver = (e, groupName) => {
    e.preventDefault();
    if (!draggedGroup || draggedGroup === groupName) return;
    
    // Reorder groups
    const draggedIndex = groups.findIndex(group => group.name === draggedGroup);
    const targetIndex = groups.findIndex(group => group.name === groupName);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newGroups = [...groups];
      const [removed] = newGroups.splice(draggedIndex, 1);
      newGroups.splice(targetIndex, 0, removed);
      setGroups(newGroups);
    }
  };

  // Toggle department enabled status
  const toggleDepartment = (name) => {
    setDepartments(departments.map(dept => 
      dept.name === name ? {...dept, enabled: !dept.enabled} : dept
    ));
  };
  
  // Toggle group enabled status
  const toggleGroup = (name) => {
    setGroups(groups.map(group => 
      group.name === name ? {...group, enabled: !group.enabled} : group
    ));
  };

  // Toggle time period
  const toggleTimePeriod = (id) => {
    setTimePeriods(timePeriods.map(period => 
      period.id === id ? {...period, enabled: !period.enabled} : period
    ));
  };

  // Update time period
  const updateTimePeriod = (id, field, value) => {
    setTimePeriods(timePeriods.map(period => 
      period.id === id ? {...period, [field]: value} : period
    ));
  };

  // Add new time period
  const addTimePeriod = () => {
    // Validate times
    if (!newTimePeriodStart || !newTimePeriodEnd) {
      alert('Please enter both start and end times.');
      return;
    }

    let highestId = 0;
    if (timePeriods.length > 0) {
      const numericIds = timePeriods.map(p => {
        const idStr = String(p.id).replace('period', ''); // Handle potential string IDs like "periodX"
        const num = parseInt(idStr, 10);
        return isNaN(num) ? 0 : num;
      });
      if (numericIds.length > 0) {
        highestId = Math.max(0, ...numericIds);
      }
    }
    const newId = highestId + 1; // Generate numeric ID

    const newPeriod = {
      id: newId, // Use numeric ID
      start: newTimePeriodStart,
      end: newTimePeriodEnd,
      enabled: true
    };
    
    setTimePeriods([...timePeriods, newPeriod]);
    
    // Reset form
    setNewTimePeriodStart('08:45');
    setNewTimePeriodEnd('09:30');
    setIsAddingTimePeriod(false);
  };
  
  // Delete time period
  const deleteTimePeriod = (id) => {
    setTimePeriods(timePeriods.filter(period => period.id !== id));
  };

  // تعديل دالة handleSessionFormChange للتعامل مع اختيار الكورس
  const handleSessionFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // إذا كان الحقل هو اختيار الكورس، نقوم بضبط اسم الكورس تلقائيًا
    if (name === 'courseCode') {
      const selectedCourse = courses.find(course => course.coursecode === value || course.code === value || course.id === value);
      setSessionFormData({
        ...sessionFormData,
        courseCode: value,
        courseName: selectedCourse ? selectedCourse.coursename || selectedCourse.name || 'Unnamed Course' : ''
      });
    } else if (name === 'isLecture') {
      // إذا تم تغيير نوع الجلسة (محاضرة/سكشن)، نعيد ضبط المعلم
      setSessionFormData({
        ...sessionFormData,
        isLecture: type === 'checkbox' ? checked : value === 'true',
        instructor: '' // إعادة ضبط المعلم
      });
    } else {
      // للحقول الأخرى، نحدثها كالمعتاد
      setSessionFormData({
        ...sessionFormData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Get session data for a cell
  const getSessionData = (day, periodIndex, department, group) => {
    if (scheduleType === 'weekly' && 
        tableData.weekly[day] && 
        tableData.weekly[day][periodIndex] && 
        tableData.weekly[day][periodIndex][department] && 
        tableData.weekly[day][periodIndex][department][group]) {
      return tableData.weekly[day][periodIndex][department][group];
    }
    return null;
  };

  // Handle cell click - this will open the session form only when in edit mode
  const handleCellSelection = (day, periodIndex, department, group, mode = 'weekly') => {
    // سجل المعلومات للتتبع
    console.log('handleCellSelection called with:', { day, periodIndex, department, group, mode });
    
    // تأكد من أن المجموعة معرف وليست كائن
    const groupId = typeof group === 'object' ? group.id : group;
    
    // Call the hook's function to set the selectedCell for data operations
    // and get existing session data.
    const existingSessionData = handleCellDoubleClick(day, periodIndex, department, groupId, mode);
    console.log('Existing session data:', existingSessionData);

    // Set local state to show and populate the form
    setSelectedSession({ 
      day, 
      periodIndex, 
      department, 
      group: groupId, // Always store as ID
      mode 
    }); // Activates the form UI

    if (existingSessionData) {
      // Populate form with existing data, preserving colspan/rowspan if they exist
      setSessionFormData(existingSessionData);
      console.log('Form populated with existing data:', existingSessionData);
    } else {
      // Reset form for new session
      setSessionFormData({
        courseCode: '',
        courseName: '',
        instructor: '',
        room: '',
        isLecture: true
        // colspan and rowspan will be defaulted to 1 by addSession if not present
      });
      console.log('Form reset for new session');
    }
    // scheduleData.setEditMode(true) is handled by scheduleData.handleCellDoubleClick
  };

  // Add or update session
  const submitSessionForm = (e) => {
    e.preventDefault();
    if (selectedSession) {
      // Add the session data
      addSession(sessionFormData);
      
      // Visual feedback that saving succeeded
      const saveButton = e.target.querySelector('.save-btn');
      if (saveButton) {
        const originalText = saveButton.innerText;
        saveButton.innerText = 'Saved!';
        saveButton.classList.add('saved');
        
        // Reset button text after a short delay
        setTimeout(() => {
          saveButton.innerText = originalText;
          saveButton.classList.remove('saved');
          
          // Clear form and selection after confirmation
          setSelectedSession(null);
          setSessionFormData({
            courseCode: '',
            courseName: '',
            instructor: '',
            room: '',
            isLecture: true
          });
          
          resetSelection();
        }, 800);
      } else {
        // If we can't find the button for some reason, still reset everything
        setSelectedSession(null);
        setSessionFormData({
          courseCode: '',
          courseName: '',
          instructor: '',
          room: '',
          isLecture: true
        });
        
        resetSelection();
      }
    }
  };

  // Close the dialog without saving
  const handleCancel = () => {
    // إعادة تعيين الخطوة إلى 1 حتى يبدأ الديالوج من البداية في المرة القادمة
    setStep(1);
    resetSelection && resetSelection();
    closeEditForm();
    onClose(false, false);
  };
  
  // Close the dialog
  const handleClose = (saved = false, deleted = false) => {
    // إعادة تعيين الخطوة إلى 1 حتى يبدأ الديالوج من البداية في المرة القادمة
    setStep(1);
    resetSelection && resetSelection();
    closeEditForm();
    onClose(saved, deleted);
  };
  
  // إغلاق نافذة التعديل
  const closeEditForm = () => {
    setSelectedSession(null);
    // إعادة ضبط وضع التعديل
    resetSelection && resetSelection();
  };

  // Save and close the dialog
  const handleSave = () => {
    setStep(1);
    onClose(true, false); // Pass true for saved and false for deleted
  };

  // إضافة دالة handleDeleteClick
  const handleDeleteClick = (sessionData, courseCode) => {
    setSessionToDelete(sessionData);
    setCourseCodeToDelete(courseCode || 'selected');
    setShowDeleteConfirm(true);
  };

  // إضافة دالة handleDeleteConfirm
  const handleDeleteConfirm = () => {
    deleteSession && deleteSession();
    setShowDeleteConfirm(false);
  };

  // إضافة دالة handleDeleteCancel
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  // Add function to handle schedule delete button click
  const handleScheduleDeleteClick = () => {
    setShowScheduleDeleteConfirm(true);
  };
  
  // Add function to handle confirm schedule deletion
  const handleScheduleDeleteConfirm = () => {
    setShowScheduleDeleteConfirm(false);
    // Close dialog with special parameter to indicate deletion
    onClose(false, true);
  };
  
  // Add function to handle cancel schedule deletion
  const handleScheduleDeleteCancel = () => {
    setShowScheduleDeleteConfirm(false);
  };

  // إضافة useEffect جديد لتفريغ المجموعات والأقسام عند فتح الديالوج في وضع الإنشاء
  useEffect(() => {
    // فقط عند فتح الديالوج لإنشاء جدول جديد (وليس في وضع التعديل)
    if (isOpen && !isEditMode) {
      // تفريغ المجموعات إذا لم تكن فارغة بالفعل
      if (groups && groups.length > 0) {
        setGroups([]);
      }
      
      // تفريغ الأقسام إذا لم تكن فارغة بالفعل
      if (departments && departments.length > 0) {
        setDepartments([]);
      }
      
      // تأكد من أن العنوان فارغ
      setScheduleTitle('');
    }
  }, [isOpen, isEditMode]);

  // Render time period setup
  const renderTimePeriodSetup = () => (
    <div className="time-periods-setup">
      <div className="section-header">
        <h3>Time Periods</h3>
        <button 
          type="button" 
          className="add-btn"
          onClick={() => setIsAddingTimePeriod(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Add
        </button>
      </div>
      
      {isAddingTimePeriod && (
        <div className="edit-form">
          <div className="form-row">
            <input 
              type="time"
              value={newTimePeriodStart}
              onChange={(e) => setNewTimePeriodStart(e.target.value)}
              aria-label="Start time"
              required
              pattern="[0-9]{2}:[0-9]{2}"
            />
            <span className="time-separator">to</span>
            <input 
              type="time"
              value={newTimePeriodEnd}
              onChange={(e) => setNewTimePeriodEnd(e.target.value)}
              aria-label="End time"
              required
              pattern="[0-9]{2}:[0-9]{2}"
            />
          </div>
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => {
                setIsAddingTimePeriod(false);
                setNewTimePeriodStart('08:45');
                setNewTimePeriodEnd('09:30');
              }}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="save-btn"
              onClick={addTimePeriod}
            >
              Add
            </button>
          </div>
        </div>
      )}
      
      <div className="time-periods-list">
        {timePeriods.map((period) => (
          <div 
            key={period.id} 
            className={`time-period-item ${!period.enabled ? 'disabled' : ''}`}
          >
            <input
              type="checkbox"
              checked={period.enabled}
              onChange={() => toggleTimePeriod(period.id)}
              id={`period-${period.id}`}
            />
            <input
              type="time"
              value={period.start}
              onChange={(e) => updateTimePeriod(period.id, 'start', e.target.value)}
              disabled={!period.enabled}
              aria-label="Start time"
              required
              pattern="[0-9]{2}:[0-9]{2}"
            />
            <span className="time-separator">to</span>
            <input
              type="time"
              value={period.end}
              onChange={(e) => updateTimePeriod(period.id, 'end', e.target.value)}
              disabled={!period.enabled}
              aria-label="End time"
              required
              pattern="[0-9]{2}:[0-9]{2}"
            />
            <button 
              type="button" 
              className="icon-btn delete"
              onClick={() => deleteTimePeriod(period.id)}
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // Render groups selection
  const renderGroups = () => (
    <div className="groups-setup-container">
      <div className="groups-setup">
        <div className="section-header">
          <h3>Groups</h3>
          <button 
            type="button" 
            className="add-btn"
            onClick={() => setIsAddingGroup(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add
          </button>
        </div>
        
        {isAddingGroup && (
          <div className="edit-form">
            <div className="form-row">
              {isLoadingGroups ? (
                <div className="loading-indicator">Loading groups...</div>
              ) : availableGroups.length > 0 ? (
                <select 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="group-select"
                >
                  <option value="">-- Select a group --</option>
                  {availableGroups.map(availGroup => (
                    <option key={availGroup.id} value={availGroup.name}>
                      {availGroup.name}
                    </option>
                  ))}
                  <option value="custom">-- Add custom group --</option>
                </select>
              ) : (
              <input 
                type="text" 
                placeholder="Group Name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              )}
              
              {newGroupName === 'custom' && (
                <input 
                  type="text" 
                  placeholder="Custom Group Name"
                  value=""
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setIsAddingGroup(false);
                  setNewGroupName('');
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="save-btn"
                onClick={addGroup}
                disabled={!newGroupName}
              >
                Add
              </button>
            </div>
          </div>
        )}
        
        <div className="entities-list" ref={groupListRef}>
          {groups.length > 0 ? (
            groups.map((group) => (
            <div 
              key={group.name} 
              className="entity-item"
              draggable
              onDragStart={(e) => handleGroupDragStart(e, group.name)}
              onDragEnd={handleGroupDragEnd}
              onDragOver={(e) => handleGroupDragOver(e, group.name)}
            >
              {editingGroup === group.name ? (
                <div className="edit-form inline">
                  <div className="form-row">
                      {isLoadingGroups ? (
                        <div className="loading-indicator">Loading groups...</div>
                      ) : availableGroups.length > 0 ? (
                        <select 
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          className="group-select"
                        >
                          <option value="">-- Select a group --</option>
                          {availableGroups.map(availGroup => (
                            <option key={availGroup.id} value={availGroup.name}>
                              {availGroup.name}
                            </option>
                          ))}
                          <option value="custom">-- Add custom group --</option>
                        </select>
                      ) : (
                    <input 
                      type="text" 
                      placeholder="Group Name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                      )}
                      
                      {newGroupName === 'custom' && (
                        <input 
                          type="text" 
                          placeholder="Custom Group Name"
                          value=""
                          onChange={(e) => setNewGroupName(e.target.value)}
                          className="mt-2"
                        />
                      )}
                  </div>
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="icon-btn cancel"
                      onClick={() => {
                        setEditingGroup(null);
                        setNewGroupName('');
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                    <button 
                      type="button" 
                      className="icon-btn save"
                      onClick={updateGroup}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="entity-drag-handle">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6"></line>
                      <line x1="8" y1="12" x2="21" y2="12"></line>
                      <line x1="8" y1="18" x2="21" y2="18"></line>
                      <line x1="3" y1="6" x2="3.01" y2="6"></line>
                      <line x1="3" y1="12" x2="3.01" y2="12"></line>
                      <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                  </div>
                  <div className="entity-name" onClick={() => toggleGroup(group.name)}>
                    {group.name}
                    {!group.enabled && <span className="disabled-label">غير مفعل</span>}
                  </div>
                  <div className="entity-actions">
                    <button 
                      type="button" 
                      className="icon-btn edit"
                      onClick={() => startEditGroup(group)}
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button 
                      type="button" 
                      className="icon-btn delete"
                      onClick={() => deleteGroup(group.name)}
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
            ))
          ) : (
            <div className="empty-groups-message">No groups available. Add a group to get started.</div>
          )}
        </div>
      </div>
    </div>
  );

  // Render schedule type selection
  const renderScheduleTypeSelection = () => (
    <div className="schedule-type-selection">
      <h3>Schedule Type</h3>
      <div className="schedule-type-cards">
        <label className={`schedule-type-card ${scheduleType === 'weekly' ? 'selected' : ''}`}>
          <div className="radio-circle">
            <input
              type="radio"
              name="scheduleType"
              value="weekly"
              checked={scheduleType === 'weekly'}
              onChange={() => setScheduleType('weekly')}
            />
            <div className="radio-dot"></div>
          </div>
          <div className="card-content">
            <h4>Weekly Schedule</h4>
            <p>Fixed days from Saturday to Thursday</p>
          </div>
        </label>
      </div>
    </div>
  );

  // Render schedule title input
  const renderScheduleTitleInput = () => (
    <div className="schedule-title-input">
      <h3>Schedule Title</h3>
      <input
        type="text"
        value={scheduleTitle}
        onChange={(e) => setScheduleTitle(e.target.value)}
        placeholder="Enter schedule title here..."
        className="title-input"
      />
    </div>
  );

  // Render session form
  const renderSessionForm = () => (
    <div className="session-form-container">
      <h3>{selectedSession ? 'Edit Session' : 'Add New Session'}</h3>
      <form className="session-form" onSubmit={submitSessionForm}>
        <div className="form-row session-type">
          <label>
            Session Type:
            <div className="session-type-options">
              <label className={`schedule-type-card ${sessionFormData.isLecture ? 'selected' : ''}`}>
                <div className="radio-circle">
                  <input
                    type="radio"
                    name="isLecture"
                    checked={sessionFormData.isLecture}
                    onChange={() => setSessionFormData({...sessionFormData, isLecture: true, instructor: ''})}
                  />
                  <div className="radio-dot"></div>
                </div>
                <div className="card-content">
                  <h4>Lecture (with professor)</h4>
                  <div className="color-preview lecture"></div>
                </div>
              </label>
              <label className={`schedule-type-card ${!sessionFormData.isLecture ? 'selected' : ''}`}>
                <div className="radio-circle">
                  <input
                    type="radio"
                    name="isLecture"
                    checked={!sessionFormData.isLecture}
                    onChange={() => setSessionFormData({...sessionFormData, isLecture: false, instructor: ''})}
                  />
                  <div className="radio-dot"></div>
                </div>
                <div className="card-content">
                  <h4>Section (with assistant)</h4>
                  <div className="color-preview section"></div>
                </div>
              </label>
            </div>
          </label>
        </div>

        <div className="form-row">
          <label className="full-width">
            Course:
            {isLoadingCourses ? (
              <div className="loading-indicator small">Loading courses...</div>
            ) : (
              <select
                name="courseCode"
                value={sessionFormData.courseCode}
                onChange={handleSessionFormChange}
                className="course-select"
              >
                <option value="">-- Select a course --</option>
                {courses && courses.length > 0 ? (
                  courses.map(course => {
                    console.log('Rendering course option:', course);
                    return (
                      <option key={course.coursecode || course.code || course.id} value={course.coursecode || course.code || course.id}>
                        {course.coursecode || course.code || course.id} - {course.coursename || course.name || 'Unnamed Course'}
                      </option>
                    );
                  })
                ) : (
                  <option value="" disabled>No courses available</option>
                )}
              </select>
            )}
          </label>
        </div>
        
        <div className="form-row">
          <label className="full-width">
            Instructor:
            {isLoadingInstructors ? (
              <div className="loading-indicator small">Loading instructors...</div>
            ) : (
              <select
                name="instructor"
                value={sessionFormData.instructor}
                onChange={handleSessionFormChange}
                className="instructor-select"
                disabled={!sessionFormData.courseCode}
              >
                <option value="">-- Select an instructor --</option>
                {instructors && instructors.length > 0 ? (
                  instructors.map(instructor => {
                    console.log('Rendering instructor option:', instructor);
                    // قد يكون المعلم كائنًا كاملًا أو مجرد اسم
                    const instructorId = instructor.id || '';
                    const instructorName = instructor.name || instructor;
                    return (
                      <option key={instructorId || instructorName} value={instructorName}>
                        {instructorName}
                      </option>
                    );
                  })
                ) : (
                  <option value="" disabled>No instructors available for this course</option>
                )}
              </select>
            )}
          </label>
        </div>

        <div className="form-row">
          <label className="full-width">
            Room:
            <input
              type="text"
              name="room"
              value={sessionFormData.room}
              onChange={handleSessionFormChange}
              placeholder="e.g. 1125"
              className="room-input"
            />
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={closeEditForm}>
            Cancel
          </button>
          <button type="submit" className="save-btn" disabled={!sessionFormData.courseCode || !sessionFormData.instructor || !sessionFormData.room}>
            Save
          </button>
        </div>
      </form>
    </div>
  );

  // Render weekly schedule table
  const renderWeeklyTable = () => {
    const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
    const enabledTimePeriods = timePeriods.filter(period => period.enabled);
    const enabledGroups = groups.filter(group => group.enabled);

    // إنشاء مصفوفة لتتبع الخلايا المغطاة
    const coveredCells = {};

    // تحديد الخلايا المغطاة بواسطة خلايا ممتدة
    days.forEach(day => {
      enabledTimePeriods.forEach((period, periodIndex) => {
        enabledGroups.forEach(group => {
          const sessionData = getCellSession(day, periodIndex, 'ALL', group.id, 'weekly');
          if (sessionData) {
            const colspan = sessionData.colspan || 1;
            const rowspan = sessionData.rowspan || 1;
            
            // إذا كان هناك امتداد أفقي (colspan)، نحدد الخلايا المغطاة
            if (colspan > 1) {
              for (let c = 1; c < colspan; c++) {
                const targetPeriodIndex = periodIndex + c;
                if (targetPeriodIndex < enabledTimePeriods.length) {
                  const key = `${day}-${targetPeriodIndex}-${group.id}`;
                  coveredCells[key] = true;
                }
              }
            }
            
            // إذا كان هناك امتداد رأسي (rowspan)، نحدد الخلايا المغطاة
            if (rowspan > 1) {
              const groupIndex = enabledGroups.findIndex(g => g.id === group.id);
              if (groupIndex !== -1) {
                for (let r = 1; r < rowspan; r++) {
                  const targetGroupIndex = groupIndex + r;
                  if (targetGroupIndex < enabledGroups.length) {
                    const targetGroup = enabledGroups[targetGroupIndex];
                    const key = `${day}-${periodIndex}-${targetGroup.id}`;
                    coveredCells[key] = true;
                    
                    // إذا كان هناك امتداد أفقي أيضاً، نحدد الخلايا المغطاة في الصفوف التالية
                    if (colspan > 1) {
                      for (let c = 1; c < colspan; c++) {
                        const targetPeriodIndex = periodIndex + c;
                        if (targetPeriodIndex < enabledTimePeriods.length) {
                          const combinedKey = `${day}-${targetPeriodIndex}-${targetGroup.id}`;
                          coveredCells[combinedKey] = true;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        });
      });
    });

    console.log('Covered cells:', coveredCells);

    return (
      <table className="schedule-table">
        <thead>
          <tr>
            <th rowSpan="2" style={{ position: tableScale > 1 ? 'relative' : 'sticky' }}>Days</th>
            <th rowSpan="2" style={{ position: tableScale > 1 ? 'relative' : 'sticky' }}>Group</th>
            {enabledTimePeriods.map((period, index) => (
              <th key={period.id} colSpan="1" style={{ position: tableScale > 1 ? 'relative' : 'sticky' }}>
                {period.start}<br/>{period.end}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            enabledGroups.map((group, groupIndex) => {
              const isFirstCellOfDay = groupIndex === 0;

              return (
                <tr key={`${day}-${group.name}`}>
                  {isFirstCellOfDay && enabledGroups.length > 0 ? (
                    <td rowSpan={enabledGroups.length} className="day-cell">
                      {day}
                    </td>
                  ) : null}
                  <td className="group-cell">{group.name}</td>
                  {enabledTimePeriods.map((period, periodIndex) => {
                    // تحقق مما إذا كانت الخلية مغطاة بخلية أخرى ممتدة
                    const cellKey = `${day}-${periodIndex}-${group.id}`;
                    const isCovered = coveredCells[cellKey];
                    
                    if (isCovered) {
                      // إذا كانت الخلية مغطاة، نعرضها مع display: none
                      return (
                        <td 
                          key={`${day}-${group.name}-${period.id}`}
                          style={{ display: 'none' }}
                        ></td>
                      );
                    }
                    
                    // Obtener datos de la sesión para esta celda
                    const sessionDataForCell = getCellSession(day, periodIndex, 'ALL', group.id, 'weekly');
                    
                    // Si no hay datos de sesión, renderizar una celda vacía
                    if (!sessionDataForCell) {
                      return (
                        <td 
                          key={`${day}-${group.name}-${period.id}`}
                          className="schedule-cell table-drop-target empty-cell"
                          onClick={() => handleCellClick(day, periodIndex, 'ALL', group.id)}
                          onDoubleClick={() => handleCellSelection(day, periodIndex, 'ALL', group.id, 'weekly')}
                          onDragOver={(event) => {
                            event.preventDefault();
                            event.dataTransfer.dropEffect = 'move';
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            const jsonData = event.dataTransfer.getData('application/json');
                            if (!jsonData) return;
                            
                            try {
                              const draggedData = JSON.parse(jsonData);
                              if (draggedData.type === 'schedule-session') {
                                const targetCellInfo = {
                                  day: day, 
                                  periodIndex: periodIndex, 
                                  department: 'ALL', 
                                  group: group.id, 
                                  mode: 'weekly'
                                };
                                handleSessionDrop && handleSessionDrop(draggedData, targetCellInfo);
                              }
                            } catch (e) {
                              console.error("Error parsing dragged data: ", e);
                            }
                          }}
                        ></td>
                      );
                    }
                    
                    // Verificar si la celda está seleccionada
                    const isSelected = resizingCell && 
                      resizingCell.day === day && 
                      resizingCell.periodIndex === periodIndex && 
                      resizingCell.group === group.id;
                    
                    // Obtener colspan y rowspan de los datos de la sesión
                    const colSpan = sessionDataForCell.colspan || 1;
                    const rowSpan = sessionDataForCell.rowspan || 1;
                    
                    return (
                      <td 
                        key={`${day}-${group.name}-${period.id}`}
                        className="schedule-cell table-drop-target"
                        onClick={() => handleCellClick(day, periodIndex, 'ALL', group.id)}
                        onDoubleClick={() => handleCellSelection(day, periodIndex, 'ALL', group.id, 'weekly')}
                        colSpan={colSpan}
                        rowSpan={rowSpan}
                        onDragOver={(event) => {
                          event.preventDefault();
                          event.dataTransfer.dropEffect = 'move';
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          const jsonData = event.dataTransfer.getData('application/json');
                          if (!jsonData) return;
                          
                          try {
                            const draggedData = JSON.parse(jsonData);
                            if (draggedData.type === 'schedule-session') {
                              const targetCellInfo = {
                                day: day, 
                                periodIndex: periodIndex, 
                                department: 'ALL', 
                                group: group.id, 
                                mode: 'weekly'
                              };
                              handleSessionDrop && handleSessionDrop(draggedData, targetCellInfo);
                            }
                          } catch (e) {
                            console.error("Error parsing dragged data: ", e);
                          }
                        }}
                      >
                        <ScheduleCell 
                          sessionData={sessionDataForCell} 
                          isSelected={isSelected}
                          onResize={(e, direction) => startResize(e, direction)}
                          increaseColspan={increaseColspan}
                          increaseRowspan={increaseRowspan}
                          decreaseColspan={decreaseColspan}
                          decreaseRowspan={decreaseRowspan}
                          deleteSession={deleteSession}
                          onDeleteClick={handleDeleteClick}
                          timePeriodId={periodIndex}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })
          ))}
        </tbody>
      </table>
    );
  };

  // Render the table editor
  const renderTableEditor = () => {
    const enabledTimePeriods = timePeriods.filter(period => period.enabled);
    const enabledDepartments = departments.filter(dept => dept.enabled);
    const enabledGroups = groups.filter(group => group.enabled);

    return (
      <div className="table-editor">
        <div className="table-header-controls">
          <h3>Schedule Table</h3>
          <div className="table-zoom-controls">
            <button onClick={() => zoomOut && zoomOut()} title="Zoom Out">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <span>{Math.round((tableScale || 1) * 100)}%</span>
            <button onClick={() => zoomIn && zoomIn()} title="Zoom In">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
        </div>
        
        <div className="scaled-table-outer-wrapper"> 
          <div 
            className="schedule-table-container"
            style={{ transform: `scale(${tableScale})` }}
          >
            {scheduleType === 'weekly' ? (
              renderWeeklyTable()
            ) : (
              renderWeeklyTable()
            )}
          </div>
        </div>

      </div>
    );
  };

  // Render based on current step
  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <>
            {renderScheduleTitleInput()}
            {renderScheduleTypeSelection()}
            <div className="step-actions">
              <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
              {isEditMode && (
                <button 
                  className="delete-schedule-dialog-btn" 
                  onClick={handleScheduleDeleteClick}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  Delete Schedule
                </button>
              )}
              <button 
                className="next-btn" 
                onClick={() => setStep(2)}
                disabled={!scheduleTitle.trim()} // Disable if no title
              >
                Next
              </button>
            </div>
          </>
        );
      case 2:
        return (
          <>
            {renderGroups()}
            {renderTimePeriodSetup()}
            <div className="step-actions">
              <button className="back-btn" onClick={() => setStep(1)}>Schedule Name</button>
              <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
              {isEditMode && (
                <button 
                  className="delete-schedule-dialog-btn" 
                  onClick={handleScheduleDeleteClick}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  Delete Schedule
                </button>
              )}
              <button className="next-btn" onClick={() => setStep(3)}>Next</button>
            </div>
          </>
        );
      case 3:
        return (
          <>
            {renderTableEditor()}
            {selectedSession && renderSessionForm()}
            <div className="step-actions">
              <button className="back-btn" onClick={() => setStep(2)}>Schedule List</button>
              <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
              {isEditMode && (
                <button 
                  className="delete-schedule-dialog-btn" 
                  onClick={handleScheduleDeleteClick}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  Delete Schedule
                </button>
              )}
              <button className="save-schedule-btn" onClick={handleSave}>
                {isEditMode ? "Update Schedule" : "Save Schedule"}
              </button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-container">
        <div className="dialog-header">
          <h2>{isEditMode ? "Edit Schedule" : "Create New Schedule"}</h2>
          <button className="close-btn" onClick={handleCancel}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="dialog-content">
          {renderStepContent()}
        </div>
      </div>

      {/* نافذة تأكيد الحذف */}
      <DeleteConfirmDialog 
        isOpen={showDeleteConfirm}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${courseCodeToDelete} session?`}
        confirmText="Delete Session"
      />
      
      {/* نافذة تأكيد حذف الجدول */}
      <DeleteConfirmDialog 
        isOpen={showScheduleDeleteConfirm}
        onCancel={handleScheduleDeleteCancel}
        onConfirm={handleScheduleDeleteConfirm}
        title="Confirm Schedule Deletion"
        message="Are you sure you want to delete this schedule? This action cannot be undone."
        confirmText="Delete Schedule"
      />
    </div>
  );
} 