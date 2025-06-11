'use client';

import './styles/page.css';
import CalendarEvents from './components/CalendarEvents';

export default function SchedulingPage() {
  return (
    <>
      <div className="calendar-container">
        {/* Calendar Header */}
        <div className="calendar-header">
          <div className="calendar-navigation">
            <button className="show-all-btn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              show all schedules
            </button>
            <div className="month-selector">
              <button className="month-nav prev">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <div className="date-display">
                <h2>December</h2>
                <span className="year">2025</span>
              </div>
              <button className="month-nav next">
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
              {/* First Week */}
              <div className="calendar-day has-events">
                <span className="day-number">1</span>
                <div className="events-list">
                  <div className="event exam">Exam</div>
                  <div className="event quiz">Quiz</div>
                  <div className="event assignment">Assignment</div>
                  <div className="event lecture">Lecture</div>
                </div>
              </div>
              <div className="calendar-day">
                <span className="day-number">2</span>
              </div>
              <div className="calendar-day has-events">
                <span className="day-number">3</span>
                <div className="events-list">
                  <div className="event assignment">Assignment</div>
                  <div className="event lecture">Lecture</div>
                </div>
              </div>
              <div className="calendar-day">
                <span className="day-number">4</span>
              </div>
              <div className="calendar-day has-events">
                <span className="day-number">5</span>
                <div className="events-list">
                  <div className="event lecture">Lecture</div>
                </div>
              </div>
              <div className="calendar-day has-events">
                <span className="day-number">6</span>
                <div className="events-list">
                  <div className="event lecture">Lecture</div>
                </div>
              </div>
              <div className="calendar-day">
                <span className="day-number">7</span>
              </div>

              {/* Second Week */}
              <div className="calendar-day has-events">
                <span className="day-number">8</span>
                <div className="events-list">
                  <div className="event quiz">Quiz</div>
                  <div className="event lecture">Lecture</div>
                </div>
              </div>
              <div className="calendar-day">
                <span className="day-number">9</span>
              </div>
              <div className="calendar-day has-events">
                <span className="day-number">10</span>
                <div className="events-list">
                  <div className="event lecture">Lecture</div>
                </div>
              </div>
              <div className="calendar-day">
                <span className="day-number">11</span>
              </div>
              <div className="calendar-day has-events">
                <span className="day-number">12</span>
                <div className="events-list">
                  <div className="event lecture">Lecture</div>
                </div>
              </div>
              <div className="calendar-day has-events">
                <span className="day-number">13</span>
                <div className="events-list">
                  <div className="event lecture">Lecture</div>
                </div>
              </div>
              <div className="calendar-day">
                <span className="day-number">14</span>
              </div>

              {/* Third Week */}
              <div className="calendar-day has-events">
                <span className="day-number">15</span>
                <div className="events-list">
                  <div className="event lecture">Lecture</div>
                </div>
              </div>
              <div className="calendar-day has-events">
                <span className="day-number">16</span>
                <div className="events-list">
                  <div className="event quiz">Quiz</div>
                </div>
              </div>
              <div className="calendar-day">
                <span className="day-number">17</span>
              </div>
              <div className="calendar-day has-events">
                <span className="day-number">18</span>
                <div className="events-list">
                  <div className="event exam">Exam</div>
                  <div className="event quiz">Quiz</div>
                  <div className="event assignment">Assignment</div>
                </div>
              </div>
              <div className="calendar-day has-events">
                <span className="day-number">19</span>
                <div className="events-list">
                  <div className="event assignment">Assignment</div>
                  <div className="event lecture">Lecture</div>
                </div>
              </div>
              <div className="calendar-day has-events">
                <span className="day-number">20</span>
                <div className="events-list">
                  <div className="event quiz">Quiz</div>
                  <div className="event lecture">Lecture</div>
                </div>
              </div>
              <div className="calendar-day">
                <span className="day-number">21</span>
              </div>

              {/* Fourth Week */}
              <div className="calendar-day has-events">
                <span className="day-number">22</span>
                <div className="events-list">
                  <div className="event lecture">Lecture</div>
                </div>
              </div>
              <div className="calendar-day">
                <span className="day-number">23</span>
              </div>
              <div className="calendar-day">
                <span className="day-number">24</span>
              </div>
              <div className="calendar-day">
                <span className="day-number">25</span>
              </div>
              <div className="calendar-day has-events">
                <span className="day-number">26</span>
                <div className="events-list">
                  <div className="event lecture">Lecture</div>
                </div>
              </div>
              <div className="calendar-day has-events">
                <span className="day-number">27</span>
                <div className="events-list">
                  <div className="event lecture">Lecture</div>
                </div>
              </div>
              <div className="calendar-day has-events">
                <span className="day-number">28</span>
                <div className="events-list">
                  <div className="event quiz">Quiz</div>
                </div>
              </div>

              {/* Fifth Week */}
              <div className="calendar-day">
                <span className="day-number">29</span>
              </div>
              <div className="calendar-day">
                <span className="day-number">30</span>
              </div>
              <div className="calendar-day">
                <span className="day-number">31</span>
              </div>
              <div className="calendar-day next-month">
                <span className="day-number">1</span>
              </div>
              <div className="calendar-day next-month">
                <span className="day-number">2</span>
              </div>
              <div className="calendar-day next-month">
                <span className="day-number">3</span>
              </div>
              <div className="calendar-day next-month">
                <span className="day-number">4</span>
              </div>
            </div>
          </div>

          {/* Active Assignments Section */}
          <div className="active-assignments">
            <h3>Active Assignments</h3>
            <p className="subtitle">Lorem ipsum dolor sit amet, conseca dipiscing elit, sedfdgdfd</p>
            
            <div className="assignments-list">
              <div className="assignment-card urgent">
                <div className="assignment-date">NOV 22, 2025</div>
                <h4 className="assignment-title">Night Sahrah</h4>
                <p className="assignment-course">Baraweza Elbashmohandes</p>
                <div className="assignment-meta">
                  <div className="deadline">
                    <span className="label">Deadline:</span>
                    <span className="value">2 Hours left</span>
                  </div>
                  <div className="time">11:00 PM</div>
                </div>
                <div className="progress-bar"></div>
              </div>

              <div className="assignment-card">
                <div className="assignment-date">NOV 22, 2025</div>
                <h4 className="assignment-title">Night Sahrah</h4>
                <p className="assignment-course">Baraweza Elbashmohandes</p>
                <div className="assignment-meta">
                  <div className="deadline">
                    <span className="label">Deadline:</span>
                    <span className="value">2 Days left</span>
                  </div>
                  <div className="time">11:00 PM</div>
                </div>
                <div className="progress-bar"></div>
              </div>

              <div className="assignment-card completed">
                <div className="assignment-date">NOV 22, 2025</div>
                <h4 className="assignment-title">Night Sahrah</h4>
                <p className="assignment-course">Baraweza Elbashmohandes</p>
                <div className="assignment-meta">
                  <div className="deadline">
                    <span className="label">Completed:</span>
                    <span className="value completed">2 Days ago</span>
                  </div>
                  <div className="time">11:00 PM</div>
                </div>
                <div className="progress-bar completed"></div>
              </div>

              <div className="assignment-card">
                <div className="assignment-date">NOV 22, 2025</div>
                <h4 className="assignment-title">Night Sahrah</h4>
                <p className="assignment-course">Baraweza Elbashmohandes</p>
                <div className="assignment-meta">
                  <div className="deadline">
                    <span className="label">Deadline:</span>
                    <span className="value">2 Days left</span>
                  </div>
                  <div className="time">11:00 PM</div>
                </div>
                <div className="progress-bar"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CalendarEvents />
    </>
  );
}