'use client';

import Image from 'next/image';
import './styles/page.css';
import { useEffect, useState } from 'react';
import GpaChart from './components/script';
import { getMockAcademicRecords } from '@/app/mockAcademicData';

export default function AcademicRecord() {
  const [academicData, setAcademicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAcademicRecords = async () => {
      try {
        setLoading(true);
        
        // الحصول على بيانات المستخدم المخزنة في localStorage
        const userData = localStorage.getItem('user');
        if (!userData) {
          setError('User data not found');
          setLoading(false);
          return;
        }
        
        const user = JSON.parse(userData);
        
        // استخدام الدالة للحصول على البيانات الافتراضية
        const response = await getMockAcademicRecords(user.id);
        
        if (response.success) {
          setAcademicData(response.data);
        } else {
          setError('Failed to load academic records');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching academic records:', err);
        setError('Failed to load academic records');
        setLoading(false);
      }
    };

    fetchAcademicRecords();
  }, []);

  if (loading) return <div className="loading">Loading academic records...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!academicData) return <div className="no-data">No academic records found</div>;

  // Get student and semesters data (handle both direct and nested structures)
  const student = academicData.student || (academicData.data && academicData.data.student) || {};
  const semesters = academicData.semesters || (academicData.data && academicData.data.semesters) || [];
  const levels = academicData.levels || (academicData.data && academicData.data.levels) || [];
  
  if (!student || !semesters || semesters.length === 0) {
    return <div className="no-data">No academic records found or invalid data format</div>;
  }
  
  // Calculate total passed hours (sum of all courses across all semesters)
  const passedHours = semesters.reduce((total, semester) => 
    total + semester.courses.reduce((sum, course) => sum + (course.courseHours || 3), 0), 0);
  
  // Calculate student's current level based on passed hours and levels data
  let currentLevel = 1;
  let currentLevelLabel = "First Level";
  let completedHours = 0;
  let supervisor = "";
  
  if (levels && levels.length > 0) {
    // Sort levels by id to ensure correct order
    const sortedLevels = [...levels].sort((a, b) => a.id - b.id);
    
    // Find current level
    let remainingHours = passedHours;
    for (let i = 0; i < sortedLevels.length; i++) {
      const level = sortedLevels[i];
      const levelHours = level.levelhours || 0;
      
      if (remainingHours >= levelHours) {
        // Student has completed this level
        remainingHours -= levelHours;
        completedHours += levelHours;
        currentLevel = level.id;
        supervisor = level.User;
        
        // If there's a next level and student has started it
        if (i < sortedLevels.length - 1 && remainingHours > 0) {
          currentLevel = sortedLevels[i + 1].id;
          supervisor = sortedLevels[i + 1].User;
        }
      } else {
        // Student is in this level but hasn't completed it
        currentLevel = level.id;
        supervisor = level.User;
        break;
      }
    }
    
    // Convert numerical level to text label
    switch (currentLevel) {
      case 1:
        currentLevelLabel = "First Level";
        break;
      case 2:
        currentLevelLabel = "Second Level";
        break;
      case 3:
        currentLevelLabel = "Third Level";
        break;
      case 4:
        currentLevelLabel = "Fourth Level";
        break;
      default:
        currentLevelLabel = `Level ${currentLevel}`;
    }
  }
  
  // Function to determine grade letter and class from percentage
  const getGradeInfo = (percentage) => {
    let letterGrade = '';
    let gradeStatusClass = '';
    
    if (percentage >= 90) {
      letterGrade = 'A';
      gradeStatusClass = 'excellent';
    } else if (percentage >= 85) {
      letterGrade = 'B+';
      gradeStatusClass = 'good';
    } else if (percentage >= 80) {
      letterGrade = 'B';
      gradeStatusClass = 'good';
    } else if (percentage >= 75) {
      letterGrade = 'C+';
      gradeStatusClass = 'pass';
    } else if (percentage >= 70) {
      letterGrade = 'C';
      gradeStatusClass = 'pass';
    } else if (percentage >= 65) {
      letterGrade = 'D+';
      gradeStatusClass = 'pass';
    } else if (percentage >= 60) {
      letterGrade = 'D';
      gradeStatusClass = 'pass';
    } else {
      letterGrade = 'F';
      gradeStatusClass = 'fail';
    }
    
    return { letterGrade, gradeStatusClass };
  };
  
  // Helper to calculate GPA for a semester
  const calculateSemesterGPA = (courses) => {
    if (!courses || courses.length === 0) return 0;
    
    const totalPoints = courses.reduce((sum, course) => sum + course.percentage, 0);
    return (totalPoints / courses.length / 25).toFixed(2); // Simple GPA calculation
  };
  
  // Calculate overall GPA
  const overallGPA = (semesters.reduce((sum, semester) => 
    sum + parseFloat(calculateSemesterGPA(semester.courses)), 0) / semesters.length).toFixed(2);
  
  // Get GPA letter grade
  const gpaGrade = getGradeInfo(overallGPA * 25).letterGrade;

  return (
    <div className="academic-record-container">
      {/* Header Card */}
      <div className="student-info-card">
        <div className="student-profile">
          <div className="profile-section">
            <div className="profile-image-container">
              <Image src={student.profileimage || "/images/shadcn.jpg"} alt="Student Profile" className="profile-image" width={100} height={100} />
            </div>
            <div className="graduation-cap">
              <Image src="/images/student_cap.svg" alt="Graduation Cap" width={100} height={100} />
            </div>
          </div>
          <div className="student-details">
            <h2 className="student-name">{`${student.firstname || ''} ${student.secondname || ''} ${student.thirdname || ''} ${student.lastname || ''}`}</h2>
            <div className="student-id">{student.id || ''}</div>
            <div className="level-badge">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m21.56 10.739-1.36-1.58c-.26-.3-.47-.86-.47-1.26v-1.7c0-1.06-.87-1.93-1.93-1.93h-1.7c-.39 0-.96-.21-1.26-.47l-1.58-1.36c-.69-.59-1.82-.59-2.52 0l-1.57 1.37c-.3.25-.87.46-1.26.46H6.18c-1.06 0-1.93.87-1.93 1.93v1.71c0 .39-.21.95-.46 1.25l-1.35 1.59c-.58.69-.58 1.81 0 2.5l1.35 1.59c.25.3.46.86.46 1.25v1.71c0 1.06.87 1.93 1.93 1.93h1.73c.39 0 .96.21 1.26.47l1.58 1.36c.69.59 1.82.59 2.52 0l1.58-1.36c.3-.26.86-.47 1.26-.47h1.7c1.06 0 1.93-.87 1.93-1.93v-1.7c0-.39.21-.96.47-1.26l1.36-1.58c.58-.69.58-1.83-.01-2.52zm-5.4-.63-4.83 4.83a.75.75 0 0 1-1.06 0l-2.42-2.42c-.29-.29-.29-.77 0-1.06s.77-.29 1.06 0l1.89 1.89 4.3-4.3c.29-.29.77-.29 1.06 0s.29.77 0 1.06z"></path></svg>
              {currentLevelLabel}
            </div>
          </div>
        </div>
        
        <div className="stats-grid">
          <div className="stat-box advisor">
            <div className="stat-header">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/>
              </svg>
              <span>Academic Advisor</span>
            </div>
            <div className="advisor-name">
              {supervisor.firstname ? `Dr. ${supervisor.firstname} ${supervisor.secondname} ${supervisor.thirdname} ${supervisor.lastname}` : "Unknown"}
            </div>
          </div>
          <div className="stat-box hours">
            <div className="stat-header">
              <span>Passed Hours</span>
            </div>
            <div className="stat-value">
              <span className="number">{passedHours}</span>
              <span className="line"></span>
              <span className="total">{student.maxhours || 0}</span>
            </div>
          </div>
          <div className="stat-box gpa">
            <div className="stat-header">
              <span>GPA</span>
              <span className="grade">{gpaGrade}</span>
            </div>
            <div className="stat-content">
              <span className="gpa-value">{overallGPA}</span>
            </div>
          </div>
        </div>
      </div>

      {/* GPA Analysis Chart */}
      <div className="gpa-analysis-card">
        <h3>GPA Analysis</h3>
        <GpaChart />
      </div>

      {/* Academic Record Table */}
      <div className="academic-record-table">
        <h2 className="table-title">Student Academic Record</h2>
        <p className="table-description">Complete record of all courses taken during your academic journey, including grades and performance metrics.</p>
        
        {semesters.map((semester) => {
          const semesterGPA = calculateSemesterGPA(semester.courses);
          const semesterHours = semester.courses.reduce(
            (sum, course) => sum + (course.courseHours || 3), 0
          );
          
          return (
            <div className="semester-section" key={semester.semesterId}>
              <div className="semester-header">
                <div className="semester-info">
                  <h3>Semester: <span>{`${semester.semester} ${semester.semesterStartYear}/${semester.semesterEndYear}`}</span></h3>
                  <div className="semester-stats">
                    <span>Semester Hours: <strong>{semesterHours}</strong></span>
                    <span>Semester GPA: <strong>{semesterGPA}</strong></span>
                  </div>
                </div>
              </div>

              <div className="table-container">
                <table className="courses-table">
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Course Hours</th>
                      <th>Points</th>
                      <th>Grade</th>
                      <th>Course Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {semester.courses.map((course) => {
                      const { letterGrade, gradeStatusClass } = getGradeInfo(course.percentage);
                      
                      // Handle the nested structure of courseSpecificMaxPoints
                      let specificMaxPoints = null;
                      if (course.courseSpecificMaxPoints && Array.isArray(course.courseSpecificMaxPoints)) {
                        // Find matching group ID if student has groupIDs
                        if (student.groupIDs && Array.isArray(student.groupIDs)) {
                          // Find a matching group in courseSpecificMaxPoints that's in student's groupIDs
                          const matchingGroup = course.courseSpecificMaxPoints.find(group => 
                            student.groupIDs.includes(group.groupID)
                          );
                          if (matchingGroup) {
                            specificMaxPoints = matchingGroup.maxPoints;
                          }
                        }
                      }
                      
                      const maxPoints = course.maxPoints || specificMaxPoints || course.courseDefaultMaxPoints || 100;

                      return (
                        <tr key={course.courseId}>
                          <td>{course.courseCode}</td>
                          <td>{course.courseName}</td>
                          <td>{course.courseHours || 3}</td>
                          <td>{`${course.points} / ${maxPoints}`}</td>
                          <td className={`grade-status ${gradeStatusClass}`}>{letterGrade}</td>
                          <td>{course.courseLevel || 3}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
     