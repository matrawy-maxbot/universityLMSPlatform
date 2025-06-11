'use client';

import { useState, useEffect } from 'react';

// import { useState } from 'react'; // useState is not used anymore

export default function ScheduleCell({ 
  sessionData, 
  isSelected, 
  // onResize, // onResize is not used in the provided snippet, but was in original. Assuming it should be here if resize handles exist.
  increaseColspan, 
  increaseRowspan, 
  decreaseColspan, 
  decreaseRowspan,
  deleteSession,
  onDeleteClick, // prop جديدة لإخبار المكون الأب بضرورة فتح نافذة تأكيد الحذف
  timePeriodId // إضافة معرف الفترة الزمنية
}) {
  // طباعة بيانات الخلية للتتبع
  useEffect(() => {
    if (sessionData) {
      console.log('ScheduleCell rendering with sessionData:', sessionData);
      console.log('Cell time period ID:', timePeriodId);
    }
  }, [sessionData, timePeriodId]);
  
  if (!sessionData) {
    return <div className="empty-cell"></div>;
  }
  
  const { courseCode, courseName, instructor, room, isLecture, colspan = 1, rowspan = 1 } = sessionData;
  
  const handleDragStart = (event) => {
    if (!sessionData) return;
    
    const dragData = {
      type: 'schedule-session', // To identify the type of data being dragged
      session: sessionData,      // The actual session object
      colspan: colspan,          // Original colspan
      rowspan: rowspan,          // Original rowspan
      timePeriodId: timePeriodId // إضافة معرف الفترة الزمنية
    };
    event.dataTransfer.setData('application/json', JSON.stringify(dragData));
    event.dataTransfer.effectAllowed = 'move';
    // Optionally, add a class to the cell being dragged for styling
    // event.currentTarget.classList.add('dragging'); 
    // We might need a global state for this if style needs to persist across components
  };

  // const handleDragEnd = (event) => {
  //   // event.currentTarget.classList.remove('dragging');
  // };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDeleteClick) {
      onDeleteClick(sessionData, courseCode);
    }
  };

  const handleDeleteConfirm = () => {
    deleteSession && deleteSession();
  };

  const handleDeleteCancel = () => {
    // No need to handle cancel as the parent component will handle it
  };
  
  return (
    <div 
      className={`cell-content ${isLecture ? 'lecture' : 'section'} ${isSelected ? 'selected' : ''}`}
      draggable={isSelected && !!sessionData} // Draggable only if selected and has data
      onDragStart={isSelected ? handleDragStart : undefined}
      // onDragEnd={isSelected ? handleDragEnd : undefined}
      data-time-period-id={timePeriodId} // إضافة معرف الفترة الزمنية كسمة للعنصر
    >
      <div className="course-info">
        <div className="course-code">{courseCode || 'No Code'}</div>
        <div className="course-name">{courseName || 'Unnamed Course'}</div>
      </div>
      <div className="instructor">{instructor || 'No Instructor'}</div>
      <div className="room">{room || 'No Room'}</div>
      
      {/* Display current dimensions if selected */}
      {isSelected && (
        <div className="cell-dimensions">
          {colspan} × {rowspan}
        </div>
      )}
      
      {isSelected && (
        <>
          {/* أزرار التحكم في العرض (الفترات) */}
          <div className="resize-controls right-controls">
            {/* زر إضافة فترة (زيادة العرض) */}
            <button 
              className="plus-btn right-plus" 
              onClick={(e) => {
                e.stopPropagation();
                increaseColspan && increaseColspan();
              }}
              title="إضافة فترة"
            >
              +
            </button>
            
            {/* زر إنقاص فترة */}
            {colspan > 1 && (
              <button 
                className="minus-btn right-minus" 
                onClick={(e) => {
                  e.stopPropagation();
                  decreaseColspan && decreaseColspan();
                }}
                title="إنقاص فترة"
              >
                -
              </button>
            )}
          </div>
          
          {/* أزرار التحكم في الارتفاع (المجموعات) */}
          <div className="resize-controls bottom-controls">
            {/* زر إضافة مجموعة (زيادة الارتفاع) */}
            <button 
              className="plus-btn bottom-plus" 
              onClick={(e) => {
                e.stopPropagation();
                increaseRowspan && increaseRowspan();
              }}
              title="إضافة مجموعة"
            >
              +
            </button>
            
            {/* زر إنقاص مجموعة */}
            {rowspan > 1 && (
              <button 
                className="minus-btn bottom-minus" 
                onClick={(e) => {
                  e.stopPropagation();
                  decreaseRowspan && decreaseRowspan();
                }}
                title="إنقاص مجموعة"
              >
                -
              </button>
            )}
          </div>

          {/* زر حذف المحاضرة/السكشن */}
          <button 
            className="delete-btn session-delete" 
            onClick={handleDeleteClick}
            title="Delete Session"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </>
      )}
    </div>
  );
} 