'use client';

import Image from 'next/image';
import './styles/page.css';
import TableManager from '@/components/TableManager';
import { useRef, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockApis } from './mockData/mockPreviewData';
import { getCookie } from 'cookies-next';

export default function CoursePreview() {
  const tableContainerRef = useRef(null);
  const tableRef = useRef(null);
  const searchInputRef = useRef(null);
  const tableManagerRef = useRef(null);
  const params = useParams();
  const router = useRouter();
  
  // Estados para manejar la carga y los datos del curso
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [students, setStudents] = useState([]);

  // Datos de ejemplo para la tabla (esto se reemplazará con datos reales del API)
  const tableData = [
    {
      student: {
        avatar: 'https://i.pravatar.cc/150?img=1',
        name: 'John Doe',
        id: '1234567890'
      },
      date: '2024/02/15',
      grade: '95',
      assignments: '48/50', 
      quizzes: '47/50',
      status: 'excellent'
    },
    {
      student: {
        avatar: 'https://i.pravatar.cc/150?img=2',  
        name: 'Jane Smith',
        id: '1234567891'
      },
      date: '2024/02/16',
      grade: '88',
      assignments: '45/50', 
      quizzes: '43/50',
      status: 'good'
    },
    {
      student: {
        avatar: 'https://i.pravatar.cc/150?img=3',  
        name: 'Michael Brown',
        id: '1234567892'
      },
      date: '2024/02/17',
      grade: '75',
      assignments: '40/50', 
      quizzes: '38/50',
      status: 'average'
    },
    {
      student: {
        avatar: 'https://i.pravatar.cc/150?img=4',  
        name: 'Emily Davis',
        id: '1234567893'
      },
      date: '2024/02/18',
      grade: '65',
      assignments: '35/50', 
      quizzes: '32/50',
      status: 'needs_improvement'
    },
    {
      student: {
        avatar: 'https://i.pravatar.cc/150?img=5',  
        name: 'Daniel Wilson',
        id: '1234567894'
      },
      date: '2024/02/19',
      grade: '55',
      assignments: '30/50', 
      quizzes: '28/50',
      status: 'failing'
    }
  ];

  // Obtener los datos del curso con un solo llamado a la API
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const accessToken = getCookie('access_token');
        
        if (!accessToken) {
          router.push('/login');
          return;
        }
        
        // Use mock API instead of real API call
        const courseId = params.courseId;
        const response = await mockApis.getCourseDetails(courseId);
        
        const { course, students } = response.data || {};
        
        // Create instructor object using first assistant's data if available
        if (course && course.assistantDetails && course.assistantDetails.length > 0) {
          const assistant = course.assistantDetails[0];
          course.instructor = {
            avatar: assistant.profileimage || "/images/shadcn.jpg",
            name: `${assistant.firstname} ${assistant.secondname} ${assistant.lastname}`,
            title: "Assistant"
          };
        }
        
        setCourseData(course);
        setStudents(students || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError(err.response?.data?.message || 'Error al cargar los datos del curso');
        setLoading(false);
      }
    };
    
    fetchCourseDetails();
  }, [params.courseId, router]);

  useEffect(() => {
    console.log('students: ', students);
  }, [students]);

  const handleDataChange = (data) => {
    // console.log('Table data updated:', data);
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    if (tableManagerRef.current) {
      tableManagerRef.current.focusSearch();
    }
  };

  // Mostrar un mensaje de carga mientras se obtienen los datos
  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading course data...</p>
      </div>
    );
  }

  // Mostrar un mensaje de error si hay algún problema
  if (error) {
    return (
      <div className="error-state">
        <svg xmlns="http://www.w3.org/2000/svg" className="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p>{error}</p>
        <button onClick={() => router.push('/teachers/doctors/scheduling')}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="course-preview-container" ref={tableContainerRef}>
      {/* Course Info Card */}
      <div className="course-info-card">
        <div className="card-header">
          <div className="course-title">
            <div className="title-text">
              <h2>{courseData?.coursename || 'Course Name'} <span className="course-code">{courseData?.coursecode || 'Code'}</span></h2>
              <div className="course-badges">
                <div className="course-badge hours">
                  <div className="badge-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="badge-content">
                    <span className="badge-label">Course Hours</span>
                    <span className="badge-value">{courseData?.coursehours || '3'} Hours</span>
                  </div>
                </div>
                <div className="course-badge group">
                  <div className="badge-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="badge-content">
                    <span className="badge-label">Group</span>
                    <span className="badge-value">{courseData?.group || 'Group 1'}</span>
                  </div>
                </div>
                <div className="course-badge level">
                  <div className="badge-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M468.995 166.96 364.73 151.812a31.212 31.212 0 0 1-23.511-17.085l-46.637-94.481c-7.301-14.795-22.089-23.987-38.59-23.987-16.494 0-31.281 9.192-38.582 23.987l-46.629 94.481a31.238 31.238 0 0 1-23.503 17.085L43.005 166.96c-16.332 2.375-29.644 13.596-34.74 29.29-5.096 15.687-.922 32.588 10.891 44.101l75.451 73.553a31.195 31.195 0 0 1 8.977 27.63l-17.816 103.85c-2.79 16.271 3.774 32.395 17.124 42.095 13.366 9.707 30.728 10.944 45.307 3.274l93.266-49.035a31.212 31.212 0 0 1 29.06 0l93.266 49.035c14.586 7.664 31.926 6.44 45.315-3.282 13.35-9.699 19.906-25.824 17.116-42.087l-17.816-103.842a31.195 31.195 0 0 1 8.985-27.638l75.451-73.553c11.813-11.513 15.986-28.414 10.891-44.101-5.094-15.694-18.406-26.915-34.738-29.29zm15.61 64.937-75.451 73.553a43.007 43.007 0 0 0-12.382 38.083l17.816 103.85c2.052 11.974-2.59 23.395-12.42 30.543-9.83 7.14-22.112 8.032-32.887 2.375l-93.266-49.035a43.01 43.01 0 0 0-40.035 0L142.712 480.3c-10.752 5.649-23.05 4.773-32.88-2.375-9.838-7.148-14.48-18.561-12.428-30.543l17.816-103.85a43.001 43.001 0 0 0-12.374-38.083l-75.451-73.553c-8.7-8.477-11.659-20.444-7.901-32.003 3.751-11.559 13.173-19.499 25.202-21.251l104.28-15.149a43.049 43.049 0 0 0 32.395-23.541L228 45.471c5.38-10.898 15.84-17.408 27.991-17.408 12.159 0 22.619 6.51 27.999 17.408l46.637 94.481a43.02 43.02 0 0 0 32.403 23.541l104.272 15.149c12.028 1.752 21.451 9.692 25.202 21.251 3.76 11.56.801 23.527-7.899 32.004z" />
                    </svg>
                  </div>
                  <div className="badge-content">
                    <span className="badge-value">{courseData?.level ? `Level ${courseData.level}` : 'Level 3'}</span>
                  </div>
                </div>
                <div className="course-badge requirement">
                  <div className="badge-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                      <path d="M470.006 301.042c-16.074-9.26-26.057-26.511-26.057-45.041 0-18.521 9.982-35.772 26.01-45.023 16.45-9.457 23.292-29.107 16.262-46.719-8.811-22.247-20.808-43.026-35.57-61.768-11.763-14.922-32.196-18.83-48.645-9.312-16.027 9.312-35.992 9.34-52.066.07-16.028-9.27-25.963-26.549-25.916-45.112 0-18.99-13.591-34.75-32.383-37.468a247.327 247.327 0 0 0-71.328.07c-18.746 2.737-32.336 18.488-32.29 37.44 0 18.54-9.936 35.809-25.963 45.07-16.075 9.26-35.992 9.241-52.066-.061-16.449-9.518-36.882-5.591-48.645 9.331a249.99 249.99 0 0 0-20.011 29.562c-5.952 10.306-11.154 21.108-15.559 32.088-7.077 17.64-.234 37.318 16.215 46.799 16.075 9.251 26.057 26.511 26.511 45.032s-9.982 35.767-26.01 45.032c-16.449 9.458-23.291 29.098-16.262 46.705a246.096 246.096 0 0 0 35.57 61.772c11.763 14.922 32.196 18.83 48.645 9.312 16.028-9.312 35.992-9.331 52.066-.07 16.027 9.27 25.963 26.549 25.963 45.112-.047 18.985 13.59 34.745 32.336 37.469a247.073 247.073 0 0 0 35.382 2.549c11.998 0 23.995-.872 35.945-2.62 18.746-2.742 32.336-18.479 32.336-37.431-.047-18.549 9.888-35.819 25.916-45.079 16.074-9.26 35.992-9.241 52.066.061 16.449 9.518 36.882 5.6 48.645-9.331a251.455 251.455 0 0 0 20.011-29.553c5.905-10.305 11.201-21.108 15.559-32.097 7.079-17.64.237-37.323-16.213-46.789zm-150.247-8.22c-9.795 17.031-25.682 29.22-44.708 34.31-18.98 5.089-38.851 2.479-55.863-7.363-35.148-20.302-47.239-65.418-26.947-100.59 13.591-23.592 38.429-36.798 63.876-36.798 12.513 0 25.12 3.168 36.695 9.851 35.148 20.297 47.239 65.427 26.947 100.59z" />
                    </svg>
                  </div>
                  <div className="badge-content">
                    <span className="badge-value">{courseData?.requirement || 'Optional Requirement'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="right-side">
              <div className="instructor-info">
                <Image 
                  src={courseData?.instructor?.avatar || "/images/shadcn.jpg"}
                  alt="Instructor" 
                  className="instructor-avatar"
                  width={40}
                  height={40}
                />
                <div className="instructor-details">
                  <h3>{courseData?.instructor?.name || "Eng. Ahmed Khaled"}</h3>
                  <span className="badge assistant">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <g>
                        <path d="m23.126 9.868-2.151-2.154V5.996a2.997 2.997 0 0 0-2.991-2.995h-1.716L14.117.848c-1.131-1.131-3.101-1.131-4.231 0L7.735 3.001H6.019a2.996 2.996 0 0 0-2.991 2.995v1.718L.876 9.868a3.003 3.003 0 0 0 0 4.235l2.151 2.154v1.718a2.997 2.997 0 0 0 2.991 2.995h1.716l2.151 2.153c.565.565 1.317.877 2.116.877s1.55-.312 2.115-.877l2.151-2.153h1.716a2.996 2.996 0 0 0 2.991-2.995v-1.718l2.152-2.154a3.003 3.003 0 0 0 0-4.235Zm-4.922.343-5.054 4.995c-.614.61-1.423.916-2.231.916s-1.613-.305-2.229-.913L6.091 12.71a1 1 0 1 1 1.408-1.421l2.598 2.498a1.17 1.17 0 0 0 1.644 0l5.055-4.996a1 1 0 1 1 1.408 1.421Z" />
                      </g>
                    </svg>
                    {courseData?.instructor?.title || "Assistant"}
                  </span>
                </div>
              </div>
              <div className="students-badge">
                <div className="badge-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="badge-content">
                  <span className="badge-label">Enrolled Students</span>
                  <span className="badge-value">{students.length} <span>Students</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Students List Table */}
        <div className="students-list-table">
          <div className="table-header">
            <h3>Students List</h3>
            <div className="search-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input 
                type="text" 
                placeholder="Search by student name or ID..." 
                ref={searchInputRef}
                onFocus={handleSearchFocus}
              />
            </div>
          </div>
          <div className="table-container">
            <table ref={tableRef}></table>
          </div>
        </div>
      </div>
      <TableManager
        ref={tableManagerRef}
        containerRef={tableContainerRef}
        rowsPerPage={10}
        onDataChange={handleDataChange}
        initialData={students.map(student => { 
          return {
            student: {
              avatar: student.profileimage || "/images/shadcn.jpg",
              name: student.firstname + ' ' + student.secondname + ' ' + student.thirdname + ' ' + student.lastname,
              id: student.id
            },
            date: '2024/02/16',
            grade: student.grade || '88',
            assignments: student.assignments || '45/50',
            quizzes: student.quizzes || '43/50',
            status: student.status || 'good'
          }
        })} // Usar los datos de estudiantes reales cuando estén disponibles
        tableRef={tableRef}
        editColumns={false}
        tableHeaders={[
          {
            id: "student",
            label: "Student",
            sortable: false,
            editable: false
          },
          {
            id: "date",
            label: "Date",
            sortable: false,
            editable: false
          },
          {
            id: "grade",
            label: "Grade",
            sortable: false,
            editable: false
          },
          {
            id: "assignments",
            label: "Assignments",
            sortable: false,
            editable: false
          },
          {
            id: "quizzes",
            label: "Quizzes",
            sortable: false,
            editable: false
          },
          {
            id: "status",
            label: "Status",
            sortable: false,
            editable: false
          }
        ]}
        tableCellValuesHTML={{
          "Student": (row) => (
            <div className="student-info">
              <Image 
                src={row.student.avatar} 
                alt="Student Avatar" 
                width={40} 
                height={40} 
                className="student-avatar"
              />
              <div>
                <div className="student-name">{row.student.name}</div>
                <div className="student-id">ID: {row.student.id}</div>
              </div>
            </div>
          ),
          "Date": (row) => row.date || '2024/02/16',
          "Grade": (row) => row.grade || '88',
          "Assignments": (row) => row.assignments || '45/50',
          "Quizzes": (row) => row.quizzes || '43/50',
          "Status": (row) => (
            <div className={`grade-status ${row.status}`}>{row.status}</div>
          )
        }}
        searchOptions={{
          placeholder: "Search by student name or ID...",
          debounceTime: 300,
          caseSensitive: false,
          searchFields: ['student.name', 'student.id'],
          highlightMatches: true,
          showResultsCount: false,
          searchRef: searchInputRef
        }}
      />
    </div>
  );
}