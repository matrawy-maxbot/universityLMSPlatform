'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import styles from './styles/page.module.css';
import SemesterSelector from './components/SemesterSelector';
import CourseSelector from './components/CourseSelector';
import StudentGradesTable from './components/StudentGradesTable';
import { getSemesters, getCoursesBySemester, getStudentGrades, updateStudentGrade, getCurrentSemester } from './api';

// Import mock data for fallback (optional)
import { mockSemesters, mockCoursesBySemester, mockStudentGrades } from './mockData/mockStudentGradesData';

export default function StudentGradesPage() {
  const router = useRouter();
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Assume authenticated initially
  
  // Check authentication
  useEffect(() => {
    const token = getCookie('access_token');
    if (!token) {
      setIsAuthenticated(false);
      // Set timeout to allow rendering the unauthorized message before redirecting
      const timeoutId = setTimeout(() => {
        router.push('/login?redirect=/admins/studentGrades');
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [router]);
  
  // 1. Load current semester and all semesters when component mounts
  useEffect(() => {
    // Don't fetch data if not authenticated
    if (!isAuthenticated) return;
    
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        console.log('Starting initial data fetch');
        
        // First try to get the current semester directly
        const currentSemester = await getCurrentSemester();
        console.log('Current semester from API:', currentSemester);
        
        // Then get all semesters
        const allSemesters = await getSemesters();
        console.log('All semesters from API:', allSemesters);
        
        if (allSemesters.length === 0) {
          console.log('No semesters found, checking authentication');
          // Check if it might be an auth issue
          const token = getCookie('access_token');
          if (!token) {
            console.log('No auth token found, setting isAuthenticated to false');
            setIsAuthenticated(false);
            return;
          }
          
          // If no semesters found but authenticated, use mock data as fallback
          console.log('Using mock semesters as fallback');
          setSemesters(mockSemesters);
          setSelectedSemester(mockSemesters.find(sem => sem.isActive) || mockSemesters[0]);
          return;
        }
        
        console.log('Setting semesters state with:', allSemesters);
        setSemesters(allSemesters);
        
        // Set the selected semester - prioritize the direct current semester call
        if (currentSemester) {
          console.log('Setting selected semester from current semester API:', currentSemester);
          setSelectedSemester(currentSemester);
        } else {
          // Fallback to finding the active semester from the list
          const activeSemester = allSemesters.find(sem => sem.isActive);
          if (activeSemester) {
            console.log('Setting selected semester from active semester in list:', activeSemester);
            setSelectedSemester(activeSemester);
          } else if (allSemesters.length > 0) {
            // If no active semester, select the first one
            console.log('No active semester found, selecting first semester:', allSemesters[0]);
            setSelectedSemester(allSemesters[0]);
          } else {
            console.log('No semesters available to select');
          }
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('فشل في تحميل البيانات الأولية');
        
        // Use mock data as fallback
        console.log('Using mock data as fallback due to error');
        setSemesters(mockSemesters);
        setSelectedSemester(mockSemesters.find(sem => sem.isActive) || mockSemesters[0]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [isAuthenticated, router]);
  
  // 2. Load courses when semester changes
  useEffect(() => {
    if (!selectedSemester || !isAuthenticated) {
      console.log('Cannot fetch courses - prerequisites not met:', {
        hasSemester: !!selectedSemester,
        isAuthenticated: isAuthenticated,
        semesterId: selectedSemester?.id
      });
      return;
    }
    
    const fetchCourses = async () => {
      try {
        setLoading(true);
        console.log('Fetching courses for semester:', selectedSemester);
        setSelectedCourse(null); // Reset selected course
        setStudents([]); // Reset students
        
        const data = await getCoursesBySemester(selectedSemester.id);
        console.log('Courses received for semester:', {
          semesterId: selectedSemester.id,
          coursesCount: data.length,
          courses: data
        });
        
        // If no courses found, use mock data as fallback
        if (data.length === 0) {
          console.log('No courses found, using mock data as fallback');
          const mockCourses = mockCoursesBySemester[selectedSemester.id] || [];
          if (mockCourses.length > 0) {
            setCourses(mockCourses);
            setSelectedCourse(mockCourses[0]);
            return;
          }
        }
        
        setCourses(data);
        
        // Auto-select first course if available
        if (data.length > 0) {
          console.log('Auto-selecting first course:', data[0]);
          setSelectedCourse(data[0]);
        } else {
          console.log('No courses available to select');
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('فشل في تحميل المقررات');
        
        // Use mock data as fallback
        console.log('Using mock courses as fallback due to error');
        const mockCourses = mockCoursesBySemester[selectedSemester.id] || [];
        if (mockCourses.length > 0) {
          setCourses(mockCourses);
          setSelectedCourse(mockCourses[0]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    console.log('Initiating course fetch for semester ID:', selectedSemester.id);
    fetchCourses();
  }, [selectedSemester, isAuthenticated]);
  
  // 3. Load students and grades when course changes
  useEffect(() => {
    if (!selectedCourse || !selectedSemester || !isAuthenticated) {
      console.log('Cannot fetch student grades - prerequisites not met:', {
        hasCourse: !!selectedCourse,
        hasSemester: !!selectedSemester,
        isAuthenticated: isAuthenticated
      });
      return;
    }
    
    const fetchStudentGrades = async () => {
      try {
        setLoading(true);
        console.log('Fetching student grades for:', {
          courseId: selectedCourse.id,
          courseid: selectedCourse.courseid,
          semesterId: selectedSemester.id,
          selectedCourse: selectedCourse
        });
        
        // Extract the correct course ID - could be either in id or courseid
        const courseId = selectedCourse.courseid || selectedCourse.id;
        const semesterId = selectedSemester.id;
        
        console.log('Using course ID:', courseId, 'and semester ID:', semesterId);
        
        const data = await getStudentGrades(courseId, semesterId);
        console.log('Student grades received:', {
          count: data.length,
          data: data
        });
        
        // If no student grades found, use mock data as fallback
        if (data.length === 0) {
          console.log('No student grades found, checking mock data');
          const mockKey = `${courseId}-${semesterId}`;
          const mockData = mockStudentGrades[mockKey];
          
          if (mockData && mockData.length > 0) {
            console.log('Using mock student grades as fallback');
            setStudents(mockData);
            return;
          }
        }
        
        setStudents(data);
      } catch (err) {
        console.error('Error fetching student grades:', err);
        setError('فشل في تحميل درجات الطلاب');
        
        // Use mock data as fallback
        console.log('Using mock student grades as fallback due to error');
        const courseId = selectedCourse.courseid || selectedCourse.id;
        const semesterId = selectedSemester.id;
        const mockKey = `${courseId}-${semesterId}`;
        const mockData = mockStudentGrades[mockKey];
        
        if (mockData && mockData.length > 0) {
          setStudents(mockData);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentGrades();
  }, [selectedCourse, selectedSemester, isAuthenticated]);
  
  // 4. Handle semester selection
  const handleSemesterChange = useCallback((semester) => {
    console.log('Semester changed to:', semester);
    setSelectedSemester(semester);
  }, []);
  
  // 5. Handle course selection
  const handleCourseChange = useCallback((course) => {
    console.log('Course changed to:', course);
    setSelectedCourse(course);
  }, []);
  
  // 6. Handle grade update
  const handleGradeUpdate = useCallback(async (studentId, points) => {
    if (!selectedCourse || !selectedSemester || !isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get the course's maximum points
      const maxPoints = selectedCourse.defaultmaxpoints || 100;
      
      // Ensure points is within valid range
      if (points < 0 || points > maxPoints) {
        setError(`الدرجة يجب أن تكون بين 0 و ${maxPoints}`);
        return;
      }
      
      // استخراج بيانات المقرر بالشكل الصحيح
      // يجب استخدام courseid (رمز المقرر) وليس id (معرف سجل التسجيل)
      let courseId = '';
      
      // محاولة الحصول على معرف المقرر بعدة طرق
      if (selectedCourse.courseid) {
        // إذا كان هناك حقل courseid مباشر، نستخدمه
        courseId = selectedCourse.courseid;
      } else if (selectedCourse.Course && selectedCourse.Course.coursecode) {
        // إذا كان هناك كائن Course فرعي، نستخدم coursecode منه
        courseId = selectedCourse.Course.coursecode;
      } else {
        // إذا لم نجد معرف المقرر، نستخدم الاسم كملاذ أخير
        courseId = selectedCourse.id.toString();
      }
      
      console.log('Course details:', {
        selectedCourse,
        extractedCourseId: courseId
      });
      
      console.log('Preparing grade update with:', {
        studentId: studentId,
        courseId: courseId,
        semesterId: selectedSemester.id,
        points: points,
        maxPoints: maxPoints
      });
      
      // Update the grade
      await updateStudentGrade({
        studentid: studentId,
        courseid: courseId,
        semesterid: selectedSemester.id,
        points: points,
        maxpoints: maxPoints
      });
      
      // Update local state to reflect the change
      setStudents(prevStudents => 
        prevStudents.map(student => {
          if (student.id === studentId) {
            // Calculate new percentage
            const newPercentage = (points / maxPoints) * 100;
            // Determine status based on percentage (passing is 50% or higher)
            const newStatus = newPercentage >= 50 ? 'ناجح' : 'راسب';
            
            console.log('Updating student grade in UI:', {
              studentId,
              oldPoints: student.points,
              newPoints: points,
              oldPercentage: student.percentage,
              newPercentage,
              oldStatus: student.status,
              newStatus
            });
            
            // Return updated student object with new points, percentage and status
            return { 
              ...student, 
              points: points,
              percentage: newPercentage,
              status: newStatus
            };
          }
          return student;
        })
      );
      
      // Show success message
      setSuccess('تم تحديث الدرجة بنجاح');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating grade:', err);
      setError('فشل في تحديث الدرجة');
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, selectedSemester, isAuthenticated]);
  
  // 7. Handle bulk grade update
  const handleBulkGradeUpdate = useCallback(async (gradesData) => {
    if (!selectedCourse || !selectedSemester || !isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // استخراج بيانات المقرر بالشكل الصحيح
      let courseId = '';
      
      // محاولة الحصول على معرف المقرر بعدة طرق
      if (selectedCourse.courseid) {
        // إذا كان هناك حقل courseid مباشر، نستخدمه
        courseId = selectedCourse.courseid;
      } else if (selectedCourse.Course && selectedCourse.Course.coursecode) {
        // إذا كان هناك كائن Course فرعي، نستخدم coursecode منه
        courseId = selectedCourse.Course.coursecode;
      } else {
        // إذا لم نجد معرف المقرر، نستخدم الاسم كملاذ أخير
        courseId = selectedCourse.id.toString();
      }
      
      console.log('Processing bulk grade update for course:', courseId);
      
      // Process each grade update
      for (const { studentId, points } of gradesData) {
        const maxPoints = selectedCourse.defaultmaxpoints || 100;
        
        // Calculate new percentage and status for console logging
        const newPercentage = (points / maxPoints) * 100;
        const newStatus = newPercentage >= 50 ? 'ناجح' : 'راسب';
        
        console.log('Updating grade for student:', {
          studentId,
          points,
          percentage: newPercentage,
          status: newStatus
        });
        
        // Update the grade
        await updateStudentGrade({
          studentid: studentId,
          courseid: courseId,
          semesterid: selectedSemester.id,
          points: points,
          maxpoints: maxPoints
        });
      }
      
      // Refresh student data
      const updatedData = await getStudentGrades(courseId, selectedSemester.id);
      setStudents(updatedData);
      
      // Show success message
      setSuccess('تم تحديث الدرجات بنجاح');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating grades:', err);
      setError('فشل في تحديث الدرجات');
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, selectedSemester, isAuthenticated]);

  // Handle unauthorized state
  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.unauthorizedMessage}>
          <h2>غير مصرح لك بالدخول</h2>
          <p>يرجى تسجيل الدخول للوصول إلى هذه الصفحة.</p>
          <p>جاري توجيهك إلى صفحة تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>إدارة درجات الطلاب</h1>
      
      {/* Error and success messages */}
      {error && (
        <div className={styles.errorMessage}>
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      {success && (
        <div className={styles.successMessage}>
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}
      
      {/* Selectors */}
      <div className={styles.selectors}>
        <SemesterSelector 
          semesters={semesters} 
          selectedSemester={selectedSemester} 
          onChange={handleSemesterChange}
          disabled={loading}
        />
        
        <CourseSelector 
          courses={courses} 
          selectedCourse={selectedCourse} 
          onChange={handleCourseChange}
          disabled={loading || !selectedSemester}
        />
      </div>
      
      {/* Student grades table */}
      <StudentGradesTable 
        students={students}
        loading={loading}
        onGradeUpdate={handleGradeUpdate}
        onBulkGradeUpdate={handleBulkGradeUpdate}
        selectedCourse={selectedCourse}
        disabled={!selectedCourse || !selectedSemester}
      />
    </div>
  );
} 