'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import './styles/page.css';
import { useRouter } from 'next/navigation';
import { getAllCourses, getCourseById, deleteCourse } from './api/index';
import CourseDialog from './components/AddCourseDialog';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';

// Helper functions
const getCourseStatus = (status) => {
  switch (status) {
    case 0: return 'Inactive';
    case 1: return 'Active';
    case 2: return 'Archived';
    default: return 'Unknown';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function CoursesManagement() {
  const router = useRouter();
  
  // States for handling loading and course data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    inactiveCourses: 0,
    archivedCourses: 0
  });
  
  // State for managing course dialogs
  const [isAddCourseDialogOpen, setIsAddCourseDialogOpen] = useState(false);
  const [isEditCourseDialogOpen, setIsEditCourseDialogOpen] = useState(false);
  const [currentEditCourse, setCurrentEditCourse] = useState(null);
  
  // State for delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  // Fetch courses data from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Fetch all courses at once (no pagination)
        const data = await getAllCourses();
        console.log("Courses data: ", data);
        
        // Sort courses by level in ascending order
        const sortedData = [...data].sort((a, b) => {
          const levelA = parseInt(a.level || 1);
          const levelB = parseInt(b.level || 1);
          return levelA - levelB;
        });
        
        setCourses(sortedData);
        setFilteredCourses(sortedData);
        
        // Calculate course statistics
        const statistics = {
          totalCourses: sortedData.length,
          activeCourses: sortedData.filter(course => course.status === 1).length,
          inactiveCourses: sortedData.filter(course => course.status === 0).length,
          archivedCourses: sortedData.filter(course => course.status === 2).length
        };
        
        setStats(statistics);
        setError(null);
      } catch (err) {
        console.error('Error fetching courses data:', err);
        setError(err.response?.data?.message || 'Error loading courses data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  // Filter courses when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const filtered = courses.filter(course => 
        course.coursename?.toLowerCase().includes(lowerCaseSearchTerm) || 
        course.coursecode?.toLowerCase().includes(lowerCaseSearchTerm) ||
        (course.department && course.department.toLowerCase().includes(lowerCaseSearchTerm))
      );
      setFilteredCourses(filtered);
    }
  }, [searchTerm, courses]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle adding a new course
  const handleAddCourse = () => {
    setIsAddCourseDialogOpen(true);
  };
  
  // Handle editing a course
  const handleEditCourse = async (courseId) => {
    try {
      setLoading(true);
      // Fetch the specific course data
      const courseData = await getCourseById(courseId);
      console.log("Fetched course data for edit:", courseData);
      
      // Set the current course being edited
      setCurrentEditCourse(courseData);
      
      // Open the edit dialog
      setIsEditCourseDialogOpen(true);
    } catch (err) {
      console.error('Error fetching course data for edit:', err);
      alert('Failed to load course data for editing');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle initiating course deletion
  const handleDeleteCourseClick = (courseId) => {
    setCourseToDelete(courseId);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle confirming course deletion
  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    
    try {
      setLoading(true);
      
      // Call the deleteCourse API
      await deleteCourse(courseToDelete);
      
      // Remove the course from the local state
      const updatedCourses = courses.filter(course => course.id !== courseToDelete);
      
      // Sort is already maintained since we're just removing an item
      setCourses(updatedCourses);
      
      // Update filtered courses if necessary
      if (searchTerm.trim() === '') {
        setFilteredCourses(updatedCourses);
      } else {
        // Re-apply filtering
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filtered = updatedCourses.filter(course => 
          course.coursename?.toLowerCase().includes(lowerCaseSearchTerm) || 
          course.coursecode?.toLowerCase().includes(lowerCaseSearchTerm) ||
          (course.department && course.department.toLowerCase().includes(lowerCaseSearchTerm))
        );
        setFilteredCourses(filtered);
      }
      
      // Update statistics
      const statistics = {
        totalCourses: updatedCourses.length,
        activeCourses: updatedCourses.filter(course => course.status === 1).length,
        inactiveCourses: updatedCourses.filter(course => course.status === 0).length,
        archivedCourses: updatedCourses.filter(course => course.status === 2).length
      };
      
      setStats(statistics);
      
      // Close the delete dialog
      setIsDeleteDialogOpen(false);
      setCourseToDelete(null);
    } catch (err) {
      console.error('Error deleting course:', err);
      alert('Failed to delete course');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle successful course creation or update
  const handleCourseSaved = async (courseData, isEdit = false) => {
    try {
      setLoading(true);
      
      let updatedCourses;
      if (isEdit) {
        // إذا كان تعديل، قم بتحديث الكورس في البيانات المحلية
        updatedCourses = courses.map(course => 
          course.id === courseData.id ? courseData : course
        );
      } else {
        // إذا كان إنشاء جديد، أضف الكورس إلى البيانات المحلية
        updatedCourses = [courseData, ...courses];
      }
      
      // Sort the updated courses by level
      const sortedCourses = [...updatedCourses].sort((a, b) => {
        const levelA = parseInt(a.level || 1);
        const levelB = parseInt(b.level || 1);
        return levelA - levelB;
      });
      
      setCourses(sortedCourses);
      
      // Update filtered courses if search is empty
      if (searchTerm.trim() === '') {
        setFilteredCourses(sortedCourses);
      } else {
        // Re-apply filtering while maintaining sort
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filtered = sortedCourses.filter(course => 
          course.coursename?.toLowerCase().includes(lowerCaseSearchTerm) || 
          course.coursecode?.toLowerCase().includes(lowerCaseSearchTerm) ||
          (course.department && course.department.toLowerCase().includes(lowerCaseSearchTerm))
        );
        setFilteredCourses(filtered);
      }
      
      // Update statistics
      const statistics = {
        totalCourses: sortedCourses.length,
        activeCourses: sortedCourses.filter(course => course.status === 1).length,
        inactiveCourses: sortedCourses.filter(course => course.status === 0).length,
        archivedCourses: sortedCourses.filter(course => course.status === 2).length
      };
      
      setStats(statistics);
    } catch (err) {
      console.error('Error updating courses data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading courses data...</p>
      </div>
    );
  }

  // Show error state if there's a problem
  if (error) {
    return (
      <div className="error-state">
        <svg xmlns="http://www.w3.org/2000/svg" className="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2>Error Loading Data</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="courses-management-container">
      {/* Header section */}
      <div className="header-section">
        <div className="title-section">
          <h1>Courses Management</h1>
          <p>Manage all courses in the platform</p>
        </div>
        <div className="actions-section">
          <button 
            className="add-course-button"
            onClick={handleAddCourse}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Course
          </button>
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="stats-section">
        <div className="stat-card total-courses">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalCourses}</div>
            <div className="stat-label">Total Courses</div>
          </div>
        </div>
        <div className="stat-card active-courses">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeCourses}</div>
            <div className="stat-label">Active Courses</div>
          </div>
        </div>
        <div className="stat-card inactive-courses">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.inactiveCourses}</div>
            <div className="stat-label">Inactive Courses</div>
          </div>
        </div>
        <div className="stat-card archived-courses">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.archivedCourses}</div>
            <div className="stat-label">Archived Courses</div>
          </div>
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="courses-grid">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-card-header">
                <h3 className="course-title">
                  {course.coursename}
                  <span className="course-code">{course.coursecode}</span>
                </h3>
                <div className={`course-status status-${getCourseStatus(course.status || 1).toLowerCase()}`}>
                  {getCourseStatus(course.status || 1)}
                </div>
              </div>
              
              <div className="course-card-content">
                <div className="course-details">
                  <div className="course-detail">
                    <span className="detail-label">Credits:</span>
                    <span className="detail-value">{course.coursehours || '0'} Hours</span>
                  </div>
                  
                  <div className="course-semester">
                    <span className="semester-info">{course.semester || 'fall'} 2024/2025</span>
                    <span className="level-info">Level {course.level || '1'}</span>
                  </div>
                  
                  {(course.doctors?.length > 0 || course.assistants?.length > 0) && (
                    <div className="course-instructors instructors-section">
                      <div className="instructors-label">Instructors:</div>
                      <div className="instructors-list">
                        {course.doctorDetails && course.doctorDetails.length > 0 ? (
                          course.doctorDetails.map((doctor, index) => (
                            <span key={doctor.id || index} className="instructor-tag doctor-tag">
                              Dr. {doctor.firstname} {doctor.lastname}
                            </span>
                          ))
                        ) : (
                          course.doctors?.map((doctorId, index) => (
                            <span key={doctorId || index} className="instructor-tag doctor-tag">
                              Dr. {doctorId}
                            </span>
                          ))
                        )}
                        
                        {course.assistantDetails && course.assistantDetails.length > 0 ? (
                          course.assistantDetails.map((assistant, index) => (
                            <span key={assistant.id || index} className="instructor-tag assistant-tag">
                              Eng. {assistant.firstname} {assistant.lastname}
                            </span>
                          ))
                        ) : (
                          course.assistants?.map((assistantId, index) => (
                            <span key={assistantId || index} className="instructor-tag assistant-tag">
                              Eng. {assistantId}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="course-card-footer">
                <button 
                  className="card-action-button visit-button"
                  onClick={() => router.push(`/courses/${course.id}`)}
                >
                  Visit
                </button>
                
                <div className="card-actions">
                  <button 
                    className="card-action-icon edit"
                    onClick={() => handleEditCourse(course.id)}
                    title="Edit Course"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    className="card-action-icon delete"
                    onClick={() => handleDeleteCourseClick(course.id)}
                    title="Delete Course"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-courses-message">
            <svg xmlns="http://www.w3.org/2000/svg" className="no-data-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3>No courses found</h3>
            <p>Try adjusting your search or add a new course</p>
          </div>
        )}
      </div>

      {/* Add/Edit Course Dialog */}
      {isAddCourseDialogOpen && (
        <CourseDialog
          isOpen={isAddCourseDialogOpen}
          onClose={() => setIsAddCourseDialogOpen(false)}
          onSuccess={(courseData) => {
            handleCourseSaved(courseData);
            setIsAddCourseDialogOpen(false);
          }}
        />
      )}

      {isEditCourseDialogOpen && currentEditCourse && (
        <CourseDialog
          isOpen={isEditCourseDialogOpen}
          onClose={() => {
            setIsEditCourseDialogOpen(false);
            setCurrentEditCourse(null);
          }}
          onSuccess={(courseData) => {
            handleCourseSaved(courseData, true);
            setIsEditCourseDialogOpen(false);
            setCurrentEditCourse(null);
          }}
          editMode={true}
          courseData={currentEditCourse}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCourseToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone."
      />
    </div>
  );
} 