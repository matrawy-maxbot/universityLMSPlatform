'use client';

import { useEffect, useRef, useState } from 'react';

export function useImportDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedOption, setSelectedOption] = useState('none');
  const [isDragging, setIsDragging] = useState(false);

  const importDialogRef = useRef(null);
  const fileInputRef = useRef(null);
  const fileDropAreaRef = useRef(null);
  const warningMessageRef = useRef(null);
  const applyBtnRef = useRef(null);

  useEffect(() => {
    const importDialog = importDialogRef.current;
    const fileDropArea = fileDropAreaRef.current;
    const fileInput = fileInputRef.current;
    const warningMessage = warningMessageRef.current;
    const applyBtn = applyBtnRef.current;

    if (!importDialog || !fileDropArea || !fileInput || !warningMessage || !applyBtn) return;

    // Handle file drag and drop
    const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const highlight = () => {
      setIsDragging(true);
    };

    const unhighlight = () => {
      setIsDragging(false);
    };

    const handleDrop = (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      handleFiles(files);
    };

    const handleFiles = (files) => {
      if (files.length > 0) {
        const file = files[0];
        if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
            file.type === 'application/vnd.ms-excel') {
          setSelectedFile(file);
          applyBtn.disabled = false;
          fileDropArea.querySelector('p').textContent = `Selected: ${file.name}`;
        } else {
          alert('Please select an Excel file (.xlsx or .xls)');
        }
      }
    };

    // Add event listeners
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      fileDropArea.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      fileDropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      fileDropArea.addEventListener(eventName, unhighlight, false);
    });

    fileDropArea.addEventListener('drop', handleDrop, false);
    fileDropArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));

    // Cleanup
    return () => {
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileDropArea.removeEventListener(eventName, preventDefaults, false);
      });

      ['dragenter', 'dragover'].forEach(eventName => {
        fileDropArea.removeEventListener(eventName, highlight, false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        fileDropArea.removeEventListener(eventName, unhighlight, false);
      });

      fileDropArea.removeEventListener('drop', handleDrop, false);
      fileDropArea.removeEventListener('click', () => fileInput.click());
      fileInput.removeEventListener('change', () => handleFiles(fileInput.files));
    };
  }, []);

  const handleImportClick = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetDialog();
  };

  const handleOptionChange = (e) => {
    const value = e.target.value;
    setSelectedOption(value);
    if (value === 'replace') {
      warningMessageRef.current?.classList.add('show');
    } else {
      warningMessageRef.current?.classList.remove('show');
    }
  };

  const handleApplyClick = () => {
    if (!selectedFile) {
      alert('Please select an Excel file');
      return;
    }

    // Here you would implement the actual import logic based on the selected option
    alert('Import successful!');
    setIsDialogOpen(false);
    resetDialog();
  };

  const resetDialog = () => {
    setSelectedFile(null);
    setSelectedOption('none');
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (fileDropAreaRef.current) {
      fileDropAreaRef.current.querySelector('p').textContent = 'Drag and drop your Excel file here';
    }
    if (warningMessageRef.current) warningMessageRef.current.classList.remove('show');
    if (applyBtnRef.current) applyBtnRef.current.disabled = true;
  };

  return {
    isDialogOpen,
    isDragging,
    selectedOption,
    importDialogRef,
    fileInputRef,
    fileDropAreaRef,
    warningMessageRef,
    applyBtnRef,
    handleImportClick,
    handleCloseDialog,
    handleOptionChange,
    handleApplyClick
  };
} 