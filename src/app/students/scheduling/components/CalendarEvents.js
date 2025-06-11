'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CalendarEvents({ selectedSchedule, calendarEvents }) {
  const router = useRouter();
  const eventsDialogRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState('December');

  useEffect(() => {
    const today = new Date();
    setCurrentMonth(today.toLocaleString('default', { month: 'long' }));
  }, []);

  useEffect(() => {
    const calendarDays = document.querySelectorAll('.calendar-day');
    const eventsDialog = eventsDialogRef.current;
    const dialogClose = eventsDialog?.querySelector('.dialog-close');
    const selectedDateSpan = eventsDialog?.querySelector('.selected-date');

    const handleDayClick = (day) => {
      const dayNumber = day.querySelector('.day-number').textContent;
      
      // تجاهل الأيام الفارغة أو أيام الشهور المجاورة
      if (!dayNumber || day.classList.contains('next-month') || day.classList.contains('prev-month')) {
        return;
      }
      
      if (selectedDateSpan) {
        const dateText = `${currentMonth} ${dayNumber}`;
        setSelectedDate(dateText);
        selectedDateSpan.textContent = dateText;
      }
      
      // جلب الأحداث لهذا اليوم من calendarEvents
      const dayEvents = calendarEvents[dayNumber] || [];
      console.log(`Selected day ${dayNumber} events:`, dayEvents);
      setSelectedDayEvents(dayEvents);
      
      if (eventsDialog) {
        eventsDialog.classList.add('show');
      }
    };

    const handleDialogClose = () => {
      if (eventsDialog) {
        eventsDialog.classList.remove('show');
      }
    };

    const handleDialogClick = (e) => {
      if (e.target === eventsDialog) {
        handleDialogClose();
      }
    };

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && eventsDialog?.classList.contains('show')) {
        handleDialogClose();
      }
    };

    // Add event listeners
    calendarDays.forEach(day => {
      day.addEventListener('click', () => handleDayClick(day));
    });

    if (dialogClose) {
      dialogClose.addEventListener('click', handleDialogClose);
    }

    if (eventsDialog) {
      eventsDialog.addEventListener('click', handleDialogClick);
    }

    document.addEventListener('keydown', handleEscapeKey);

    // Cleanup function
    return () => {
      calendarDays.forEach(day => {
        day.removeEventListener('click', () => handleDayClick(day));
      });

      if (dialogClose) {
        dialogClose.removeEventListener('click', handleDialogClose);
      }

      if (eventsDialog) {
        eventsDialog.removeEventListener('click', handleDialogClick);
      }

      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [calendarEvents, currentMonth]);

  // تحويل نوع الحدث إلى اسم مناسب للعرض
  const getEventTypeName = (type) => {
    switch (type) {
      case 'lecture': return 'Lecture';
      case 'lab': return 'Lab';
      case 'section': return 'Section';
      case 'quiz': return 'Quiz';
      case 'assignment': return 'Assignment';
      default: return 'Class';
    }
  };

  // التنقل إلى صفحة تفاصيل الكويز
  const navigateToQuizDetails = (quizId) => {
    if (eventsDialogRef.current) {
      eventsDialogRef.current.classList.remove('show');
    }
    router.push(`/students/quizzes/${quizId}`);
  };

  // التنقل إلى صفحة تفاصيل الواجب
  const navigateToAssignmentDetails = (assignmentId) => {
    if (eventsDialogRef.current) {
      eventsDialogRef.current.classList.remove('show');
    }
    router.push(`/students/assignments/${assignmentId}`);
  };

  return (
    <div className="events-dialog" id="events-dialog" ref={eventsDialogRef}>
      <div className="dialog-content">
        <div className="dialog-header">
          <h3>Events for <span className="selected-date">December 1</span></h3>
          <button className="dialog-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="dialog-body">
          <div className="events-list-detailed">
            {selectedDayEvents && selectedDayEvents.length > 0 ? (
              selectedDayEvents.map((event, index) => (
                <div 
                  key={index} 
                  className="event-item-detailed"
                  onClick={
                    event.type === 'quiz' 
                      ? () => navigateToQuizDetails(event.id.replace('quiz-', '')) 
                      : event.type === 'assignment'
                      ? () => navigateToAssignmentDetails(event.id.replace('assignment-', ''))
                      : undefined
                  }
                  style={event.type === 'quiz' || event.type === 'assignment' ? { cursor: 'pointer' } : {}}
                >
                  <div className="event-header">
                    <h4 className="event-title">{event.title}</h4>
                    <span className="event-time">{event.time}</span>
                  </div>
                  <div className="event-details">
                    <span className="event-course">{event.course} - {event.instructor}</span>
                    <span className="event-room">Room: {event.room}</span>
                    <span className="event-group">Group: {event.group || 'All'}</span>
                    <span className={`event-type ${event.type}`}>{getEventTypeName(event.type)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-events-message">
                No events scheduled for this day
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 