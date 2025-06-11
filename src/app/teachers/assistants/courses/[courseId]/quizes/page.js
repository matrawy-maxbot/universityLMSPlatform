'use client';

import Image from 'next/image';
import './styles/page.css';
import { useState, useEffect, useRef } from 'react';
import { 
    formatDate, 
    formatQuizTimeStatus, 
    formatQuizStatus, 
    validateFile, 
    formatFileSize, 
    downloadFile, 
    setupClickOutsideHandler,
    formatDateTimeLocal,
    calculateQuizProgress
} from './components/script';
import { useParams } from 'next/navigation';
import {
    getQuizzesByCourse,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    uploadQuizFile,
    deleteQuizFile
} from './api';

// Import mock data for fallback
import { mockQuizzes } from './mockData/mockQuizesData';

export default function Quizes() {
  const params = useParams();
  const courseId = params.courseId;
  
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isQuizDialogOpen, setIsQuizDialogOpen] = useState(false);
  const [isEditingQuiz, setIsEditingQuiz] = useState(false);
  const [editedQuiz, setEditedQuiz] = useState(null);
  const [viewModeQuiz, setViewModeQuiz] = useState('details');
  const [quizFileError, setQuizFileError] = useState(null);
  const [quizBlockMessage, setQuizBlockMessage] = useState({ isOpen: false, message: '', type: 'info' });
  const [showQuizDeleteConfirm, setShowQuizDeleteConfirm] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State for Create New Quiz
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [newQuizData, setNewQuizData] = useState({
    title: '',
    course: '', // Will be auto-filled
    courseId: '', // Will be auto-filled
    description: '',
    startTime: '',
    endTime: '',
    totalPoints: '',
    googleFormUrl: '',
    attachedFiles: []
  });
  const [newQuizFileError, setNewQuizFileError] = useState(null);

  const quizDialogRef = useRef(null);
  const createQuizDialogRef = useRef(null); // Ref for the create quiz dialog

  useEffect(() => {
    const fetchQuizzes = async () => {
      setIsLoading(true);
      try {
        const quizData = await getQuizzesByCourse(courseId);
        console.log('Fetched quizzes:', quizData);
        setAllQuizzes(quizData);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        // استخدام البيانات الوهمية في حالة الفشل
        setAllQuizzes(mockQuizzes);
        showQuizBlockMessage('Failed to load quizzes. Using mock data.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuizzes();
    setIsMounted(true);
  }, [courseId]);

  useEffect(() => {
    let cleanupDialog, cleanupCreateDialog;
    if (isQuizDialogOpen && quizDialogRef.current) {
        cleanupDialog = setupClickOutsideHandler(
            closeQuizDialog, 
            ['.teacher-quiz-dialog'], 
            '.assignment-dialog-overlay' // Assuming overlay class is generic
        );
    }
    if (isCreatingQuiz && createQuizDialogRef.current) {
        cleanupCreateDialog = setupClickOutsideHandler(
            handleCancelCreateQuiz, 
            ['.teacher-create-quiz-dialog'], // Specific class for create dialog
            '.assignment-dialog-overlay'
        );
    }
    return () => {
        if (cleanupDialog) cleanupDialog();
        if (cleanupCreateDialog) cleanupCreateDialog();
    };
  }, [isQuizDialogOpen, isCreatingQuiz]);

  const handleQuizCardClick = async (quiz) => {
    try {
      // Obtener los detalles actualizados del quiz desde la API
      const quizDetails = await getQuizById(quiz.id);
      setSelectedQuiz(quizDetails);
      setIsEditingQuiz(false); 
      setEditedQuiz(JSON.parse(JSON.stringify(quizDetails)));
      setViewModeQuiz('details');
      setQuizFileError(null); 
      setIsQuizDialogOpen(true);
      closeQuizBlockMessage(); 
      setShowQuizDeleteConfirm(false);
      setQuizToDelete(null);
      // Also ensure create quiz dialog is closed if main dialog opens
      setIsCreatingQuiz(false); 
      setNewQuizData({ 
        title: '', 
        course: '', 
        courseId: courseId, // Auto-fill courseId with current course
        description: '', 
        startTime: '', 
        endTime: '', 
        totalPoints: '', 
        googleFormUrl: '', 
        attachedFiles: [] 
      });
      setNewQuizFileError(null);
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      showQuizBlockMessage('Failed to load quiz details. Please try again later.', 'error');
    }
  };

  const closeQuizDialog = () => {
    setIsQuizDialogOpen(false);
    setSelectedQuiz(null);
    setIsEditingQuiz(false);
    setEditedQuiz(null);
    setViewModeQuiz('details');
    setQuizFileError(null);
    closeQuizBlockMessage(); 
    setShowQuizDeleteConfirm(false);
    setQuizToDelete(null);
    // Also ensure create quiz dialog is closed if main dialog opens
    setIsCreatingQuiz(false); 
    setNewQuizData({ 
      title: '', 
      course: '', 
      courseId: courseId, 
      description: '', 
      startTime: '', 
      endTime: '', 
      totalPoints: '', 
      googleFormUrl: '', 
      attachedFiles: [] 
    });
    setNewQuizFileError(null);
  };

  const handleEditQuizClick = () => {
    if (!selectedQuiz) return;
    setEditedQuiz(JSON.parse(JSON.stringify(selectedQuiz)));
    setIsEditingQuiz(true);
    setQuizFileError(null);
  };

  const handleCancelEditQuiz = () => {
    setIsEditingQuiz(false);
    setEditedQuiz(JSON.parse(JSON.stringify(selectedQuiz)));
    setQuizFileError(null);
  };

  const handleEditQuizChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedQuiz(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? null : parseFloat(value)) : value)
    }));
  };

  const handleQuizDateTimeChange = (e) => {
    const { name, value } = e.target;
    let dateValue = value;
    if (value && !value.endsWith('Z')) {
        dateValue = new Date(value).toISOString();
    } else if (!value) {
        dateValue = null;
    }

    setEditedQuiz(prev => ({
        ...prev,
        [name]: dateValue
    }));
  };

  const handleEditQuizFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validationResult = validateFile(file);
    if (validationResult.error) {
      setQuizFileError(validationResult.error);
      return;
    }
    
    setQuizFileError(null);
    
    // Create a new file object with ID
    const newFile = {
      id: `file_${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      size: formatFileSize(file.size)
    };
    
    setEditedQuiz(prev => ({
      ...prev,
      attachedFiles: [...(prev.attachedFiles || []), newFile]
    }));
    
    e.target.value = null; // Reset input
  };

  const removeEditQuizFile = async (fileIdToRemove) => {
    if (!selectedQuiz || !editedQuiz) return;

    try {
      if (fileIdToRemove.startsWith('file_')) {
        // Si es un archivo recién agregado, simplemente eliminarlo del estado
        setEditedQuiz(prev => ({
          ...prev,
          attachedFiles: prev.attachedFiles.filter(file => file.id !== fileIdToRemove)
        }));
      } else {
        // Si es un archivo existente, llamar a la API
        await deleteQuizFile(selectedQuiz.id, fileIdToRemove);
        
        setEditedQuiz(prev => ({
          ...prev,
          attachedFiles: prev.attachedFiles.filter(file => file.id !== fileIdToRemove)
        }));
      }
    } catch (error) {
      console.error('Error removing file:', error);
      showQuizBlockMessage('Failed to remove file. Please try again.', 'error');
    }
  };

  const handleSaveChangesQuiz = async () => {
    if (!editedQuiz) return;
    
    try {
      // Validar datos
      if (!editedQuiz.title || !editedQuiz.startTime || !editedQuiz.endTime) {
        showQuizBlockMessage('Please fill all required fields.', 'error');
        return;
      }
      
      console.log('Updating quiz with data:', editedQuiz);
      
      // Guardar cambios en la API
      const updatedQuiz = await updateQuiz(editedQuiz.id, editedQuiz);
      
      console.log('Updated quiz:', updatedQuiz);
      
      // Subir archivos nuevos
      const newFiles = editedQuiz.attachedFiles.filter(file => file.id.startsWith('file_'));
      if (newFiles && newFiles.length > 0) {
        for (const file of newFiles) {
          try {
            const uploadedFile = await uploadQuizFile(editedQuiz.id, {
              id: file.id,
              name: file.name,
              url: file.url,
              size: file.size
            });
            console.log('Uploaded file:', uploadedFile);
          } catch (fileError) {
            console.error('Error uploading file:', fileError);
            showQuizBlockMessage(`Failed to upload file ${file.name}`, 'warning');
          }
        }
      }
      
      // Actualizar estado local
      setSelectedQuiz(updatedQuiz);
      setEditedQuiz(updatedQuiz);
      setIsEditingQuiz(false);
      
      // Actualizar la lista de quizzes
      setAllQuizzes(prev => 
        prev.map(q => q.id === updatedQuiz.id ? updatedQuiz : q)
      );
      
      showQuizBlockMessage('Quiz updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating quiz:', error);
      showQuizBlockMessage('Failed to update quiz. Please try again.', 'error');
    }
  };

  const handleDeleteQuizClick = (quiz) => {
    setQuizToDelete(quiz);
    setShowQuizDeleteConfirm(true);
  };

  const confirmActualDeleteQuiz = async () => {
    if (!quizToDelete) return;
    
    try {
      console.log('Deleting quiz:', quizToDelete.id);
      const result = await deleteQuiz(quizToDelete.id);
      console.log('Delete result:', result);
      
      // Actualizar lista de quizzes
      setAllQuizzes(prev => prev.filter(q => q.id !== quizToDelete.id));
      
      // Cerrar diálogo
      setShowQuizDeleteConfirm(false);
      setQuizToDelete(null);
      closeQuizDialog();
      
      showQuizBlockMessage('Quiz deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      showQuizBlockMessage('Failed to delete quiz. Please try again.', 'error');
      setShowQuizDeleteConfirm(false);
    }
  };

  const showQuizBlockMessage = (message, type = 'info') => {
    setQuizBlockMessage({ isOpen: true, message, type });
  };

  const closeQuizBlockMessage = () => {
    setQuizBlockMessage({ isOpen: false, message: '', type: 'info' });
  };

  const handleQuizFileDownload = (file) => {
    downloadFile(file.url, file.name);
  };

  // Create Quiz Functions
  const handleOpenCreateQuizDialog = () => {
    setIsCreatingQuiz(true);
    // Reset new quiz form and pre-fill courseId
    setNewQuizData({
      title: '',
      course: '',
      courseId: courseId,
      description: '',
      startTime: '',
      endTime: '',
      totalPoints: '',
      googleFormUrl: '',
      attachedFiles: []
    });
    setNewQuizFileError(null);
    setIsQuizDialogOpen(false); // Ensure main dialog is closed
    closeQuizBlockMessage();
  };

  const handleCancelCreateQuiz = () => {
    setIsCreatingQuiz(false);
    setNewQuizData({
      title: '',
      course: '',
      courseId: courseId,
      description: '',
      startTime: '',
      endTime: '',
      totalPoints: '',
      googleFormUrl: '',
      attachedFiles: []
    });
    setNewQuizFileError(null);
  };

  const handleNewQuizChange = (e) => {
    const { name, value, type } = e.target;
    setNewQuizData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const handleNewQuizDateTimeChange = (e) => {
    const { name, value } = e.target;
    let dateValue = value;
    if (value) {
      dateValue = new Date(value).toISOString();
    }

    setNewQuizData(prev => ({
      ...prev,
      [name]: dateValue
    }));
  };

  const handleNewQuizFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validationResult = validateFile(file);
    if (validationResult.error) {
      setNewQuizFileError(validationResult.error);
      return;
    }
    
    setNewQuizFileError(null);
    
    // Create a new file object with ID
    const newFile = {
      id: `file_${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      size: formatFileSize(file.size)
    };
    
    setNewQuizData(prev => ({
      ...prev,
      attachedFiles: [...(prev.attachedFiles || []), newFile]
    }));
    
    e.target.value = null; // Reset input
  };

  const removeNewQuizFile = (fileIdToRemove) => {
    setNewQuizData(prev => ({
      ...prev,
      attachedFiles: prev.attachedFiles.filter(file => file.id !== fileIdToRemove)
    }));
  };

  const handleSaveNewQuiz = async () => {
    try {
      // Validar datos
      if (!newQuizData.title || !newQuizData.startTime || !newQuizData.endTime || !newQuizData.totalPoints) {
        showQuizBlockMessage('Please fill all required fields.', 'error');
        return;
      }
      
      // Crear nuevo quiz
      const createdQuiz = await createQuiz({
        ...newQuizData,
        course: newQuizData.course || 'Software Engineering', // Default course name
      });
      
      console.log('Created quiz:', createdQuiz);
      
      // Subir archivos
      const files = newQuizData.attachedFiles;
      if (files && files.length > 0) {
        for (const file of files) {
          try {
            const uploadedFile = await uploadQuizFile(createdQuiz.id, {
              id: file.id,
              name: file.name,
              url: file.url,
              size: file.size
            });
            console.log('Uploaded file:', uploadedFile);
          } catch (fileError) {
            console.error('Error uploading file:', fileError);
          }
        }
      }
      
      // Actualizar lista de quizzes
      setAllQuizzes(prev => [createdQuiz, ...prev]);
      
      // Cerrar diálogo
      setIsCreatingQuiz(false);
      
      showQuizBlockMessage('Quiz created successfully!', 'success');
    } catch (error) {
      console.error('Error creating quiz:', error);
      showQuizBlockMessage('Failed to create quiz. Please try again.', 'error');
    }
  };

  return (
     <div className="teacher-quizzes-container">
          <div className="create-quiz-header">
            <button onClick={handleOpenCreateQuizDialog} className="create-quiz-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/></svg>
                Create New Quiz
            </button>
          </div>

          {allQuizzes.length === 0 && !isLoading && !isCreatingQuiz && <p>No quizzes found for this course yet.</p>}
          {isLoading && <p>Loading quizzes...</p>}

          {allQuizzes.length > 0 && (
            <div className="course-section-quiz">
                <h2 className="course-header-title-quiz">Course Quizzes</h2>
                {allQuizzes.map((quiz) => (
                    <div 
                        key={quiz.id} 
                        className={`quiz-card status-${quiz.status.toLowerCase()}`}
                        onClick={() => handleQuizCardClick(quiz)}
                        style={quiz.status === 'active' ? { '--quiz-progress': `${calculateQuizProgress(quiz.startTime, quiz.endTime)}%` } : {}}
                    >
                        <div className="quiz-title-row">
                            <div className="quiz-title">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {isEditingQuiz && selectedQuiz?.id === quiz.id ? editedQuiz.title : quiz.title}
                                <span className={`status-badge ${quiz.status.toLowerCase()}`}>{formatQuizStatus(quiz.status)}</span>
                            </div>
                            <div className={`time-left ${quiz.status === 'active' ? 'active-time' : (quiz.status === 'completed' || quiz.status === 'postponed' ? 'finished' : '')}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="time-icon" viewBox="0 0 72 72">
                                    <path className="cls-1" d="M72,36c0,1.66-1.34,3-3,3s-3-1.34-3-3c-.02-16.56-13.44-29.98-30-30-1.66,0-3-1.34-3-3s1.34-3,3-3c19.87.02,35.98,16.13,36,36ZM48,39c1.66,0,3-1.34,3-3s-1.34-3-3-3h-6.83c-.52-.9-1.27-1.65-2.17-2.17v-9.83c0-1.66-1.34-3-3-3s-3,1.34-3,3v9.83c-2.86,1.65-3.85,5.31-2.2,8.17s5.31,3.85,8.17,2.2c.91-.53,1.67-1.29,2.2-2.2h6.83ZM5.48,20.35c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3-1.34-3-3-3ZM6,36c0-1.66-1.34-3-3-3s-3,1.34-3,3,1.34,3,3,3,3-1.34,3-3ZM36,66c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3ZM12.66,9.62c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3h0c0-1.66-1.34-3-3-3ZM23.34,2.52c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3h0c0-1.66-1.34-3-3-3h0ZM5.48,45.65c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3-1.34-3-3-3ZM12.66,56.38c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3-1.34-3-3-3ZM23.34,63.48c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3-1.34-3-3-3ZM66.52,45.65c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3-1.34-3-3-3h0ZM59.34,56.38c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3-1.34-3-3-3ZM48.66,63.48c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3-1.34-3-3-3Z"/>
                                </svg>
                                <span className="time-left-text">
                                    {isMounted ? formatQuizTimeStatus(quiz.endTime, quiz.status, quiz.startTime) : '...'}
                                </span>
                            </div>
                        </div>
                        <div className="quiz-meta">
                            <div className="quiz-author">
                                <Image src={quiz.instructorAvatar || "/images/shadcn.jpg"} alt={quiz.instructor} className="author-avatar" width={28} height={28} />
                                <div className="author-info">
                                    <span className="author-name">{quiz.instructor}</span>
                                    <span className="created-at">Created: {isMounted ? formatDate(quiz.createdAt, false) : '...'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          )}

          {isQuizDialogOpen && selectedQuiz && (
            <div className="assignment-dialog-overlay">
                <div className="teacher-quiz-dialog" ref={quizDialogRef}>
                    <button className="dialog-close-btn" onClick={closeQuizDialog}>&times;</button>
                    <div className="assignment-dialog-header">
                        {isEditingQuiz ? (
                            <input 
                                type="text"
                                name="title"
                                value={editedQuiz.title || ''}
                                onChange={handleEditQuizChange}
                                className="dialog-title-input"
                                placeholder="Quiz Title"
                            />
                        ) : (
                            <h2 className="dialog-title">{selectedQuiz.title}</h2>
                        )}
                        <span className={`status-badge dialog-status ${selectedQuiz.status.toLowerCase()}`}>{formatQuizStatus(selectedQuiz.status)}</span>
                    </div>
                    <div className="dialog-content">
                        <div className="quiz-dialog-section quiz-details-section">
                            <div className="info-grid">
                                <div className="info-item"><span className="info-label">Course:</span> <span className="info-value">{selectedQuiz.course}</span></div>
                                <div className="info-item"><span className="info-label">Instructor:</span> <span className="info-value">{selectedQuiz.instructor}</span></div>
                                {isEditingQuiz ? (
                                    <>
                                        <div className="info-item">
                                            <label htmlFor="totalPoints" className="info-label editor-label">Total Points:</label>
                                            <input
                                                type="number"
                                                id="totalPoints"
                                                name="totalPoints"
                                                value={editedQuiz.totalPoints === null || editedQuiz.totalPoints === undefined ? '' : editedQuiz.totalPoints}
                                                onChange={handleEditQuizChange}
                                                className="dialog-input"
                                                placeholder="e.g., 100"
                                                min="0"
                                            />
                                        </div>
                                        <div className="info-item"><span className="info-label">Created At:</span> <span className="info-value">{isMounted ? formatDate(selectedQuiz.createdAt) : '...'}</span></div>
                                    </>
                                ) : (
                                    <>
                                        <div className="info-item"><span className="info-label">Created At:</span> <span className="info-value">{isMounted ? formatDate(selectedQuiz.createdAt) : '...'}</span></div>
                                        <div className="info-item"><span className="info-label">Total Points:</span> <span className="info-value">{selectedQuiz.totalPoints ?? 'N/A'}</span></div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="quiz-dialog-section quiz-schedule-section">
                            <h4 className="section-grid-title">Quiz Schedule</h4>
                            {isEditingQuiz ? (
                                <div className="info-grid editor-grid">
                                    <div className="info-item editor-field">
                                        <label htmlFor="startTime" className="info-label editor-label">Starts:</label>
                                        <input
                                            type="datetime-local"
                                            id="startTime"
                                            name="startTime"
                                            value={editedQuiz.startTime ? formatDateTimeLocal(new Date(editedQuiz.startTime).toISOString()) : ''}
                                            onChange={handleQuizDateTimeChange}
                                            className="dialog-input"
                                        />
                                    </div>
                                    <div className="info-item editor-field">
                                        <label htmlFor="endTime" className="info-label editor-label">Ends:</label>
                                        <input
                                            type="datetime-local"
                                            id="endTime"
                                            name="endTime"
                                            value={editedQuiz.endTime ? formatDateTimeLocal(new Date(editedQuiz.endTime).toISOString()) : ''}
                                            onChange={handleQuizDateTimeChange}
                                            className="dialog-input"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="info-grid">
                                    <div className="info-item"><span className="info-label">Starts:</span> <span className="info-value">{isMounted ? formatDate(selectedQuiz.startTime) : '...'}</span></div>
                                    <div className="info-item"><span className="info-label">Ends:</span> <span className="info-value">{isMounted ? formatDate(selectedQuiz.endTime) : '...'}</span></div>
                                    <div className="info-item full-width"><span className="info-label">Time Status:</span> <span className="info-value">{isMounted ? formatQuizTimeStatus(selectedQuiz.endTime, selectedQuiz.status, selectedQuiz.startTime) : '...'}</span></div>
                                </div>
                            )}
                            {selectedQuiz.status === 'active' && !isEditingQuiz && isMounted && (
                                <div className="time-progress-container">
                                    <div className="time-progress-label">
                                        <span>Quiz Progress:</span>
                                        <span>{calculateQuizProgress(selectedQuiz.startTime, selectedQuiz.endTime)}% elapsed</span>
                                    </div>
                                    <div className="time-progress">
                                        <div className="time-progress-bar" style={{ width: `${calculateQuizProgress(selectedQuiz.startTime, selectedQuiz.endTime)}%` }}></div>
                                    </div>
                                    <div className="time-remaining">Time remaining: {formatQuizTimeStatus(selectedQuiz.endTime, selectedQuiz.status, selectedQuiz.startTime)}</div>
                                </div>
                            )}
                        </div>

                        <div className="quiz-dialog-section quiz-description-section">
                            <h3 className="section-title-bordered">Description</h3>
                            {isEditingQuiz ? (
                                <textarea
                                    name="description"
                                    value={editedQuiz.description || ''}
                                    onChange={handleEditQuizChange}
                                    className="dialog-textarea"
                                    placeholder="Quiz description..."
                                    rows="4"
                                />
                            ) : (
                                <p className="description-text">{selectedQuiz.description || 'No description provided.'}</p>
                            )}
                        </div>

                        <div className="quiz-dialog-section">
                            <h3 className="section-title-bordered">Google Form Link</h3>
                            {isEditingQuiz ? (
                                <input
                                    type="url"
                                    name="googleFormUrl"
                                    value={editedQuiz.googleFormUrl || ''}
                                    onChange={handleEditQuizChange}
                                    className="dialog-input"
                                    placeholder="https://forms.gle/example"
                                />
                            ) : (
                                selectedQuiz.googleFormUrl ? (
                                    <a href={selectedQuiz.googleFormUrl} target="_blank" rel="noopener noreferrer" className="google-form-link">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#673AB7"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2.5 10.25H13v2.25h-2V12.25h-2.5V10.5h2.5V8.25H13v2.25h2.5v1.75zM6 4h5v2H6V4zm0 14v-2h5v2H6zm0-3v-2h3v2H6zm0-3v-2h3v2H6zm0-3V9h3v2H6zm10 8h-3v-2h3v2zm0-3h-3v-2h3v2zm0-3h-3v-2h3v2z"/></svg>
                                        Open Quiz Form
                                    </a>
                                ) : <p>No Google Form link provided.</p>
                            )}
                        </div>

                        <div className="quiz-dialog-section">
                            <h3 className="section-title-bordered">Attached Files</h3>
                            {isEditingQuiz ? (
                                <>
                                    <div className="file-list quiz-file-list editor-file-list">
                                        {(editedQuiz.attachedFiles && editedQuiz.attachedFiles.length > 0) ? editedQuiz.attachedFiles.map(file => (
                                            <div key={file.id} className="file-item editor-file-item">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 2v6h6"/></svg>
                                                <div className="file-info">
                                                    <span className="file-name">{file.name}</span>
                                                    <span className="file-size">{file.size}</span>
                                                </div>
                                                <button onClick={() => removeEditQuizFile(file.id)} className="remove-file-btn editor-remove-file-btn" title="Remove file">&times;</button>
                                            </div>
                                        )) : <p className="no-files">No files currently attached.</p>}
                                    </div>
                                    <input 
                                        type="file" 
                                        id="quizFileEdit" 
                                        onChange={handleEditQuizFileChange} 
                                        className="dialog-file-input editor-file-input"
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="quizFileEdit" className="dialog-btn secondary dialog-file-label editor-file-label">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{marginRight: '0.5rem'}}><path d="M14 2H6C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zm-3-8.06V18H9v-4.06c-.94-.54-1.5-1.6-1.5-2.94C7.5 9.12 9.12 7.5 11 7.5s3.5 1.62 3.5 3.5c0 1.33-.56 2.4-1.5 2.94zM11 9.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/></svg>
                                        Add File
                                    </label>
                                    {quizFileError && <p className="file-error-message editor-file-error">{quizFileError}</p>}
                                </>
                            ) : (
                                (selectedQuiz.attachedFiles && selectedQuiz.attachedFiles.length > 0) ? (
                                    <div className="file-list quiz-file-list">
                                        {selectedQuiz.attachedFiles.map(file => (
                                            <div key={file.id} className="file-item downloadable" onClick={() => handleQuizFileDownload(file)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 2v6h6"/></svg>
                                                <div className="file-info"><span className="file-name">{file.name}</span><span className="file-size">{file.size}</span></div>
                                                <svg className="download-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"/></svg>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="no-files">No files attached to this quiz.</p>
                            )}
                        </div>
                        
                    </div>
                    <div className="dialog-actions">
                        {!isEditingQuiz ? (
                            <>
                                <button 
                                    className="dialog-btn danger" 
                                    onClick={() => { 
                                        setQuizToDelete(selectedQuiz);
                                        setShowQuizDeleteConfirm(true); 
                                    }}
                                >
                                    Delete Quiz
                                </button>
                                <button 
                                    className="dialog-btn secondary" 
                                    onClick={closeQuizDialog}
                                >
                                    Close
                                </button>
                                <div style={{ flexGrow: 1 }}></div> {/* Spacer */} 
                                <button 
                                    className="dialog-btn primary" 
                                    onClick={handleEditQuizClick}
                                >
                                    Edit Quiz
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="dialog-btn secondary" onClick={handleCancelEditQuiz}>Cancel</button>
                                <button className="dialog-btn primary" onClick={handleSaveChangesQuiz}>Save Changes</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
          )}

          {/* Create New Quiz Dialog */}
          {isCreatingQuiz && (
            <div className="assignment-dialog-overlay"> {/* Reusing overlay style */}
                <div className="teacher-quiz-dialog teacher-create-quiz-dialog" ref={createQuizDialogRef}> {/* Added specific class */} 
                    <button className="dialog-close-btn" onClick={handleCancelCreateQuiz}>&times;</button>
                    <div className="assignment-dialog-header create-quiz-dialog-header">
                        <h2 className="dialog-title">Create New Quiz</h2>
                        {newQuizData.course && (
                            <span className="dialog-course-subtitle">
                                {newQuizData.course}
                                {newQuizData.courseId && <span className="course-id-display"> ({newQuizData.courseId})</span>}
                            </span>
                        )}
                    </div>
                    <div className="dialog-content">
                        <div className="quiz-dialog-section">
                            <label htmlFor="newQuizTitle" className="info-label editor-label">Quiz Title*</label>
                            <input 
                                type="text" 
                                id="newQuizTitle" 
                                name="title" 
                                value={newQuizData.title} 
                                onChange={handleNewQuizChange} 
                                className="dialog-input" 
                                placeholder="e.g., Midterm Review Quiz"
                                required 
                            />
                        </div>

                        <div className="info-grid editor-grid"> {/* Using info-grid for layout consistency */}
                            <div className="info-item editor-field">
                                <label htmlFor="newQuizTotalPoints" className="info-label editor-label">Total Points*</label>
                                <input 
                                    type="number" 
                                    id="newQuizTotalPoints" 
                                    name="totalPoints" 
                                    value={newQuizData.totalPoints} 
                                    onChange={handleNewQuizChange} 
                                    className="dialog-input" 
                                    placeholder="e.g., 100"
                                    min="0"
                                    required 
                                />
                            </div>
                            <div className="info-item editor-field">
                                <label htmlFor="newQuizGoogleFormUrl" className="info-label editor-label">Google Form URL</label>
                                <input 
                                    type="url" 
                                    id="newQuizGoogleFormUrl" 
                                    name="googleFormUrl" 
                                    value={newQuizData.googleFormUrl} 
                                    onChange={handleNewQuizChange} 
                                    className="dialog-input" 
                                    placeholder="https://forms.gle/example"
                                />
                            </div>
                        </div>

                        <div className="quiz-dialog-section quiz-schedule-section">
                            <h4 className="section-grid-title">Quiz Schedule*</h4>
                            <div className="info-grid editor-grid">
                                <div className="info-item editor-field">
                                    <label htmlFor="newQuizStartTime" className="info-label editor-label">Starts:</label>
                                    <input 
                                        type="datetime-local" 
                                        id="newQuizStartTime" 
                                        name="startTime" 
                                        value={newQuizData.startTime ? formatDateTimeLocal(newQuizData.startTime) : ''} 
                                        onChange={handleNewQuizDateTimeChange} 
                                        className="dialog-input" 
                                        required 
                                    />
                                </div>
                                <div className="info-item editor-field">
                                    <label htmlFor="newQuizEndTime" className="info-label editor-label">Ends:</label>
                                    <input 
                                        type="datetime-local" 
                                        id="newQuizEndTime" 
                                        name="endTime" 
                                        value={newQuizData.endTime ? formatDateTimeLocal(newQuizData.endTime) : ''} 
                                        onChange={handleNewQuizDateTimeChange} 
                                        className="dialog-input" 
                                        required 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="quiz-dialog-section">
                            <label htmlFor="newQuizDescription" className="info-label editor-label">Description</label>
                            <textarea 
                                id="newQuizDescription" 
                                name="description" 
                                value={newQuizData.description} 
                                onChange={handleNewQuizChange} 
                                className="dialog-textarea" 
                                rows={4} 
                                placeholder="Quiz instructions, topics covered, etc."
                            />
                        </div>

                        <div className="quiz-dialog-section">
                            <h3 className="section-title-bordered">Attach Files</h3>
                            <div className="file-list quiz-file-list editor-file-list">
                                {(newQuizData.attachedFiles && newQuizData.attachedFiles.length > 0) ? (
                                    newQuizData.attachedFiles.map((file) => (
                                        <div key={file.id} className="file-item editor-file-item">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 2v6h6"/></svg>
                                            <div className="file-info">
                                                <span className="file-name">{file.name}</span>
                                                <span className="file-size">{file.size}</span>
                                            </div>
                                            <button onClick={() => removeNewQuizFile(file.id)} className="remove-file-btn editor-remove-file-btn" title="Remove file">&times;</button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-files">No files attached yet.</p>
                                )}
                            </div>
                            <input 
                                type="file" 
                                id="newQuizFile" 
                                onChange={handleNewQuizFileChange} 
                                className="dialog-file-input editor-file-input" 
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="newQuizFile" className="dialog-btn secondary dialog-file-label editor-file-label">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{marginRight: '0.5rem'}}><path d="M14 2H6C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zm-3-8.06V18H9v-4.06c-.94-.54-1.5-1.6-1.5-2.94C7.5 9.12 9.12 7.5 11 7.5s3.5 1.62 3.5 3.5c0 1.33-.56 2.4-1.5 2.94zM11 9.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/></svg>
                                Add File
                            </label>
                            {newQuizFileError && <p className="file-error-message editor-file-error">{newQuizFileError}</p>}
                        </div>
                    </div>
                    <div className="dialog-actions">
                        <button className="dialog-btn secondary" onClick={handleCancelCreateQuiz}>Cancel</button>
                        <button className="dialog-btn primary" onClick={handleSaveNewQuiz}>Create Quiz</button>
                    </div>
                </div>
            </div>
          )}

          {quizBlockMessage.isOpen && (
            <div className={`custom-block-message-overlay type-${quizBlockMessage.type}`} onClick={closeQuizBlockMessage}> 
                <div className={`custom-block-message-dialog type-${quizBlockMessage.type}`} onClick={(e) => e.stopPropagation()}>
                    <div className="block-message-header"><span className="block-message-title">{quizBlockMessage.type.charAt(0).toUpperCase() + quizBlockMessage.type.slice(1)}</span></div>
                    <p className="block-message-content">{quizBlockMessage.message}</p>
                    <div className="block-message-actions">
                        <button 
                            className={`dialog-btn ${quizBlockMessage.type === 'error' || quizBlockMessage.type === 'warning' ? 'danger' : (quizBlockMessage.type === 'success' ? 'primary' : 'secondary')}`} 
                            onClick={closeQuizBlockMessage}
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
          )}

          {showQuizDeleteConfirm && quizToDelete && (
            <div className="custom-confirm-overlay"> 
              <div className="custom-confirm-dialog">
                <h3 className="confirm-dialog-title">Confirm Deletion</h3>
                <p className="confirm-dialog-message">
                  Are you sure you want to delete the quiz: <br />
                  <strong>{quizToDelete.title}</strong>?
                  <br /><br />
                  This action cannot be undone.
                </p>
                <div className="confirm-dialog-actions">
                  <button className="dialog-btn secondary" onClick={() => {setShowQuizDeleteConfirm(false); setQuizToDelete(null);}}>Cancel</button>
                  <button className="dialog-btn danger" onClick={confirmActualDeleteQuiz}>Delete Quiz</button>
                </div>
              </div>
            </div>
          )}

     </div>
  );
}