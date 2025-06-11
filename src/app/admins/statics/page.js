'use client';

import './styles/page.css';
import AnalyticsDashboard from './components/AnalyticsDashboard';

export default function AnalyticsPage() {
  return (
    <div className="analytics-dashboard-container">
      <div className="dashboard-header">
        <h2>College Analytics Dashboard</h2>
        <p className="dashboard-subtitle">Comprehensive analysis of student performance and academic metrics</p>
      </div>
      
      <div className="analytics-grid">
        {/* Student Analytics Section */}
        <div className="analytics-card student-analytics">
          <div className="card-header">
            <h3>Student Analytics</h3>
          </div>
          <div className="card-content">
            <div className="chart-container">
              <div id="studentAnalyticsChart" className="shadcn-chart"></div>
            </div>
            <div className="stats-summary">
              <div className="stat-item">
                <span className="stat-label">Total Students</span>
                <span className="stat-value" id="totalStudentsValue">1,245</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Completed 104+ Hours</span>
                <span className="stat-value" id="completedHoursValue">876</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Course Performance Section */}
        <div className="analytics-card course-performance">
          <div className="card-header">
            <h3>Course Performance</h3>
          </div>
          <div className="card-content">
            <div className="chart-container">
              <canvas id="coursePerformanceChart"></canvas>
            </div>
            <div className="performance-summary">
              <div className="best-course">
                <span className="summary-label">Best Performing Course</span>
                <span className="summary-value">Database Systems</span>
                <span className="summary-stat">92% Pass Rate</span>
              </div>
              <div className="worst-course">
                <span className="summary-label">Most Challenging Course</span>
                <span className="summary-value">Advanced Mathematics</span>
                <span className="summary-stat">68% Pass Rate</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* GPA Distribution Section */}
        <div className="analytics-card gpa-distribution">
          <div className="card-header">
            <h3>GPA Distribution</h3>
          </div>
          <div className="card-content">
            <div className="chart-container">
              <canvas id="gpaDistributionChart"></canvas>
            </div>
            <div className="gpa-summary">
              <div className="gpa-range excellent">
                <span className="range-label">GPA - 3.5</span>
                <span className="range-value">245 Students</span>
              </div>
              <div className="gpa-range good">
                <span className="range-label">3.0 - 3.5</span>
                <span className="range-value">412 Students</span>
              </div>
              <div className="gpa-range average">
                <span className="range-label">2.5 - 3.0</span>
                <span className="range-value">328 Students</span>
              </div>
              <div className="gpa-range fair">
                <span className="range-label">2.0 - 2.5</span>
                <span className="range-value">156 Students</span>
              </div>
              <div className="gpa-range poor">
                <span className="range-label">1.5 - 2.0</span>
                <span className="range-value">78 Students</span>
              </div>
              <div className="gpa-range very-poor">
                <span className="range-label">&lt; 1.5</span>
                <span className="range-value">26 Students</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Gender GPA Analysis Section */}
        <div className="analytics-card gender-gpa-analysis">
          <div className="card-header">
            <h3>Gender GPA Analysis</h3>
          </div>
          <div className="card-content">
            <div className="chart-container">
              <canvas id="genderGPAChart"></canvas>
            </div>
            <div className="gender-stats">
              <div className="gender-stat male">
                <div className="gender-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="7" r="5"/>
                    <path d="M12 12v7"/>
                    <path d="M8 16h8"/>
                  </svg>
                </div>
                <div className="gender-info">
                  <span className="gender-label">Male Students</span>
                  <span className="gender-count male-count">0</span>
                  <span className="gender-gpa male-gpa">0.00</span>
                </div>
              </div>
              <div className="gender-stat female">
                <div className="gender-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="7" r="5"/>
                    <path d="M12 12v7"/>
                    <path d="M8 16h8"/>
                  </svg>
                </div>
                <div className="gender-info">
                  <span className="gender-label">Female Students</span>
                  <span className="gender-count female-count">0</span>
                  <span className="gender-gpa female-gpa">0.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Course Retake Analysis Section */}
        <div className="analytics-card course-retake-analysis">
          <div className="card-header">
            <h3>Course Retake Analysis</h3>
          </div>
          <div className="card-content">
            <div className="chart-container">
              <canvas id="courseRetakeChart"></canvas>
            </div>
            <div className="retake-stats">
              <div className="retake-section">
                <h4>Most Retaken Courses</h4>
                <ul className="most-retaken-list">
                  {/* Will be populated by JavaScript */}
                </ul>
              </div>
              <div className="retake-section">
                <h4>Best First-Attempt Courses</h4>
                <ul className="best-first-attempt-list">
                  {/* Will be populated by JavaScript */}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Department Distribution Section */}
        <div className="analytics-card department-distribution">
          <div className="card-header">
            <h3>Department Distribution</h3>
          </div>
          <div className="card-content">
            <div className="chart-container">
              <canvas id="departmentDistributionChart"></canvas>
            </div>
            <div className="department-stats">
              <div className="department-stat computer-science">
                <span className="dept-label">Computer Science</span>
                <span className="dept-value">0</span>
              </div>
              <div className="department-stat information-systems">
                <span className="dept-label">Information Systems</span>
                <span className="dept-value">0</span>
              </div>
              <div className="department-stat information-technology">
                <span className="dept-label">Information Technology</span>
                <span className="dept-value">0</span>
              </div>
              <div className="department-stat artificial-intelligence">
                <span className="dept-label">Artificial Intelligence</span>
                <span className="dept-value">0</span>
              </div>
              <div className="department-stat software-systems">
                <span className="dept-label">Software Systems</span>
                <span className="dept-value">0</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* GPA Trend Analysis Section */}
        <div className="analytics-card gpa-trend-analysis">
          <div className="card-header">
            <h3>GPA Trend Analysis</h3>
          </div>
          <div className="card-content">
            <div className="chart-container">
              <canvas id="gpaTrendChart"></canvas>
            </div>
            <div className="trend-stats">
              <div className="trend-stat improving">
                <div className="trend-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20V4"/>
                    <path d="M5 11l7-7 7 7"/>
                  </svg>
                </div>
                <div className="trend-info">
                  <span className="trend-label">Improving GPA</span>
                  <span className="trend-count improving-count">0</span>
                  <span className="trend-percent improving-percent">0%</span>
                </div>
              </div>
              <div className="trend-stat declining">
                <div className="trend-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 4v16"/>
                    <path d="M5 13l7 7 7-7"/>
                  </svg>
                </div>
                <div className="trend-info">
                  <span className="trend-label">Declining GPA</span>
                  <span className="trend-count declining-count">0</span>
                  <span className="trend-percent declining-percent">0%</span>
                </div>
              </div>
              <div className="trend-stat stable">
                <div className="trend-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14"/>
                    <path d="M12 5v14"/>
                  </svg>
                </div>
                <div className="trend-info">
                  <span className="trend-label">Stable GPA</span>
                  <span className="trend-count stable-count">0</span>
                  <span className="trend-percent stable-percent">0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}