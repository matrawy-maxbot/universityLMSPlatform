'use client';

import { useEffect, useRef } from 'react';

export default function CalendarEvents() {
  const eventsDialogRef = useRef(null);

  useEffect(() => {
    const calendarDays = document.querySelectorAll('.calendar-day');
    const eventsDialog = eventsDialogRef.current;
    const dialogClose = eventsDialog?.querySelector('.dialog-close');
    const selectedDateSpan = eventsDialog?.querySelector('.selected-date');

    const handleDayClick = (day) => {
      const dayNumber = day.querySelector('.day-number').textContent;
      if (selectedDateSpan) {
        selectedDateSpan.textContent = `December ${dayNumber}`;
      }
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
  }, []);

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
            <div className="event-item-detailed">
              <div className="event-header">
                <h4 className="event-title">Software Engineering Final</h4>
                <span className="event-time">09:00 AM</span>
              </div>
              <div className="event-details">
                <span className="event-course">CSE 323 - Software Engineering</span>
                <span className="event-type exam">Exam</span>
              </div>
            </div>
            
            <div className="event-item-detailed">
              <div className="event-header">
                <h4 className="event-title">Database Quiz</h4>
                <span className="event-time">11:30 AM</span>
              </div>
              <div className="event-details">
                <span className="event-course">CSE 421 - Database Systems</span>
                <span className="event-type quiz">Quiz</span>
              </div>
            </div>

            <div className="event-item-detailed">
              <div className="event-header">
                <h4 className="event-title">Project Submission</h4>
                <span className="event-time">02:00 PM</span>
              </div>
              <div className="event-details">
                <span className="event-course">CSE 323 - Software Engineering</span>
                <span className="event-type assignment">Assignment</span>
              </div>
            </div>

            <div className="event-item-detailed">
              <div className="event-header">
                <h4 className="event-title">Operating Systems</h4>
                <span className="event-time">03:30 PM</span>
              </div>
              <div className="event-details">
                <span className="event-course">CSE 312 - Operating Systems</span>
                <span className="event-type lecture">Lecture</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 