'use client';

import React from 'react';
import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import ReactDOM from 'react-dom/client';

const TableManager = forwardRef(({ 
  containerRef, 
  rowsPerPage = 10, 
  searchColumn = 0,
  onDataChange,
  onColumnRename,
  onColumnDelete,
  onColumnAdd,
  initialData = [],
  tableRef,
  tableHeaders = [],
  tableCellValuesHTML = {},
  searchOptions = {
    placeholder: "Search...",
    debounceTime: 300,
    caseSensitive: false,
    searchFields: [],
    highlightMatches: false,
    showResultsCount: false,
    searchRef: null
  },
  editColumns = false
}, ref) => {
  const [tableData, setTableData] = useState(initialData);
  const tableDataRef = useRef(tableData);
  const [columns, setColumns] = useState([]);
  const columnsRef = useRef(columns);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: [],
    minGrade: '',
    maxGrade: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(0);
  const [editingColumn, setEditingColumn] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [cellInputValue, setCellInputValue] = useState('');
  
  const searchTimeoutRef = useRef(null);
  const tableInstance = useRef(null);
  const eventListeners = useRef([]);
  const addColumnHandlerRef = useRef(null);
  const editRowHandlersRef = useRef([]);
  const observerRef = useRef(null);
  const mountedButtonsRef = useRef(new Set());

  // Validate refs
  useEffect(() => {
    if (!containerRef?.current) {
      console.warn('containerRef is required for TableManager');
    }
    if (!searchOptions.searchRef?.current) {
      console.warn('searchRef is required in searchOptions for search functionality');
    }
  }, [containerRef, searchOptions.searchRef]);

  // Initialize table and columns
  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    // Create or get table
    let table;
    if (tableRef?.current) {
      table = tableRef.current;
    } else {
      table = container.querySelector('table');
      if (!table) {
        table = document.createElement('table');
        container.appendChild(table);
      }
    }
    tableInstance.current = table;

    // Initialize columns only if columnsRef is empty
    if (columnsRef.current.length === 0) {
      const headers = tableHeaders.length > 0 ? tableHeaders.map(header => ({
        id: typeof header === 'string' ? header.toLowerCase().replace(/\s+/g, '_') : header.id,
        label: typeof header === 'string' ? header : header.label,
        sortable: typeof header === 'string' ? true : header.sortable !== false,
        editable: typeof header === 'string' ? true : header.editable !== false
      })) : [];

      setColumns(headers);
      columnsRef.current = headers;
    }
  }, [containerRef, tableRef, tableHeaders]);

  // Update columnsRef whenever columns change
  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  // Handle columns update and setup
  useEffect(() => {
    if (columns.length > 0 && tableInstance.current) {
      setupEventListeners();
      renderTable();
    }
  }, [columns]);

    // Setup event listeners
  const setupEventListeners = () => {
    const container = containerRef.current;
    const table = tableInstance.current;
    if (!container || !table) return;

    // Remove existing event listeners
    eventListeners.current.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    eventListeners.current = [];

    // Scroll event for infinite scroll
    const handleScroll = (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      if (scrollHeight - scrollTop === clientHeight) {
        loadMoreData();
      }
    };

    // Resize event
    const handleResize = () => {
      renderTable();
    };

    // Sort events
    const handleSort = (header) => {
      const columnId = header.dataset.id;
      const sortDirection = header.dataset.sortDirection === 'asc' ? 'desc' : 'asc';
      header.dataset.sortDirection = sortDirection;
      
      const sortedData = [...tableData].sort((a, b) => {
        const aValue = a[columnId];
        const bValue = b[columnId];
        return sortDirection === 'asc' ? 
          (aValue > bValue ? 1 : -1) : 
          (aValue < bValue ? 1 : -1);
      });
      
      updateTableData(sortedData);
    };

    // Add event listeners
    const addEventListener = (element, type, handler) => {
      element.addEventListener(type, handler);
      eventListeners.current.push({ element, type, handler });
    };

    // Add scroll event
    addEventListener(container, 'scroll', handleScroll);

    // Add resize event
    addEventListener(window, 'resize', handleResize);

    // Add sort events
    const headers = table.querySelectorAll('th');
    headers.forEach(header => {
      if (header.dataset.sortable !== 'false') {
        addEventListener(header, 'click', () => handleSort(header));
      }
    });
  };

  // Render table
  const renderTable = () => {
    const table = tableInstance.current;
    if (!table) return;

    // Clear existing content
    table.innerHTML = '';

    // Create thead
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Add headers
    columns.forEach(column => {
      const th = document.createElement('th');
      th.dataset.id = column.id;
      th.dataset.sortable = column.sortable;
      th.dataset.editable = column.editable;
      th.className = 'column-header';

      // Create column header container
      const headerContainer = document.createElement('div');
      headerContainer.className = 'column-header-container';

      // Create column content
      const columnContent = document.createElement('div');
      columnContent.className = 'column-content';

      if (editingColumn === column.id) {
        // Create input for editing
        const input = document.createElement('input');
        input.type = 'text';
        input.value = column.label;
        input.className = 'column-name-input';
        
        // Handle input blur
        input.addEventListener('blur', () => {
          const newName = input.value.trim();
          if (newName) {
            setColumns(prevColumns => 
              prevColumns.map(col => 
                col.id === column.id 
                  ? { ...col, label: newName }
                  : col
              )
            );
            
            // Notify parent component about column rename
            if (onColumnRename && newName !== column.label) {
              setTimeout(() => {
                onColumnRename(column.id, column.label, newName);
              }, 0);
            }
          }
          setEditingColumn(null);
        });
        
        // Handle enter key
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            const newName = input.value.trim();
            if (newName) {
              setColumns(prevColumns => 
                prevColumns.map(col => 
                  col.id === column.id 
                    ? { ...col, label: newName }
                    : col
                )
              );
              
              // Notify parent component about column rename
              if (onColumnRename && newName !== column.label) {
                setTimeout(() => {
                  onColumnRename(column.id, column.label, newName);
                }, 0);
              }
            }
            setEditingColumn(null);
          }
        });
        
        columnContent.appendChild(input);
        // Use setTimeout to ensure the input is added to the DOM before focusing
        setTimeout(() => {
          input.focus();
        }, 0);
      } else {
        columnContent.textContent = column.label;
        
        // Add click handler for editable columns
        if (column.editable) {
          columnContent.addEventListener('click', () => {
            setEditingColumn(column.id);
          });
        }
      }

      // Create delete button
      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete-column-btn';
      deleteButton.innerHTML = '×';
      deleteButton.title = 'Delete Column';
      deleteButton.style.display = 'none';

      // Only add delete button if column is editable
      if (column.editable) {
        // Add click handler for delete button
        deleteButton.addEventListener('click', (e) => {
          e.stopPropagation();
          handleColumnDelete(column.id);
        });

        // Add hover effects
        th.addEventListener('mouseenter', () => {
          deleteButton.style.display = 'block';
        });

        th.addEventListener('mouseleave', () => {
          deleteButton.style.display = 'none';
        });

        // Add click handler for column header
        th.addEventListener('click', () => {
          deleteButton.style.display = deleteButton.style.display === 'none' ? 'block' : 'none';
        });

        // Append delete button
        headerContainer.appendChild(deleteButton);
      }

      // Append elements
      headerContainer.appendChild(columnContent);
      th.appendChild(headerContainer);
      headerRow.appendChild(th);
    });

    // Add edit column header if editColumns is true
    if (editColumns) {
      const editTh = document.createElement('th');
      editTh.className = 'edit-column';
      editTh.innerHTML = `
        <div class="header-actions">
          <button class="action-button add-column-btn" title="Add Column">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      `;
      headerRow.appendChild(editTh);
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create tbody
    const tbody = document.createElement('tbody');

    // Add rows
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentPageData = tableData.slice(startIndex, endIndex);

    currentPageData.forEach((row, index) => {
      const tr = document.createElement('tr');
      tr.dataset.id = row.id || index;

      columns.forEach(column => {
        const td = document.createElement('td');
        td.dataset.id = column.id;
        td.dataset.editable = column.editable ? 'true' : 'false';
        
        // Render cell content
        const renderCellContent = () => {
        if (tableCellValuesHTML[column.label]) {
            const content = tableCellValuesHTML[column.label](row);
            if (React.isValidElement(content)) {
            const container = document.createElement('div');
            td.appendChild(container);
            const root = ReactDOM.createRoot(container);
              root.render(content);
            } else {
              td.textContent = String(content);
            }
          } else if (tableCellValuesHTML["*"]) {
            // Handle wildcard pattern for dynamic columns
            const content = tableCellValuesHTML["*"](row, column.id);
            if (React.isValidElement(content)) {
              const container = document.createElement('div');
              td.appendChild(container);
              const root = ReactDOM.createRoot(container);
              root.render(content);
            } else {
              td.textContent = String(content);
            }
          } else {
            const value = row[column.id] || row[column.label] || '';
            td.textContent = String(value);
          }
        };

        if (editingCell && editingCell.rowId === (row.id || index) && editingCell.columnId === column.id) {
          // Create input for editing
          const input = document.createElement('input');
          input.type = 'text';
          input.value = cellInputValue;
          let oldValue = input.value;
          console.log("oldValue", oldValue);
          input.className = 'cell-input';
          
          let isHandlingKey = false;
          
          // Handle input change
          input.addEventListener('input', (e) => {
            setCellInputValue(e.target.value);
          });
          
          // Handle input blur
          input.addEventListener('blur', (e) => {
            // Skip blur handling if we're handling a key event
            if (isHandlingKey) return;
            
            setTimeout(() => {
              const activeElement = document.activeElement;
              console.log('activeElement', activeElement);
              if (activeElement === input) return;
              
              const newValue = input.value.trim();
              console.log('blur newValue', newValue, input.value);
              if (newValue) {
                handleCellEdit(row.id || index, column.id, newValue);
              }
              setEditingCell(null);
              setCellInputValue('');
            }, 0);
          });
          
          // Handle enter key
          input.addEventListener('keydown', (e) => {
            isHandlingKey = true;
            
            if (e.key === 'Enter') {
              const newValue = input.value.trim();
              console.log('Enter newValue', newValue, input.value);
              if (newValue) {
                handleCellEdit(row.id || index, column.id, newValue);
              }
              setEditingCell(null);
              setCellInputValue('');
            } else if (e.key === 'Escape') {
              console.log("Escape change old value:", oldValue);
              handleCellEdit(row.id || index, column.id, oldValue);
              setEditingCell(null);
              setCellInputValue('');
            }
            
            // Reset the flag after a short delay
            setTimeout(() => {
              isHandlingKey = false;
            }, 100);
          });
          
          td.appendChild(input);
          setTimeout(() => {
            input.focus();
            input.select();
          }, 0);
        } else {
          renderCellContent();

          // Add click handler for editable cells
        if (column.editable) {
            td.addEventListener('click', (e) => {

              if (e.target.tagName === 'INPUT') return;

              e.stopPropagation();
              const currentValue = row[column.id] || row[column.label] || '';
              setCellInputValue(currentValue);
              setEditingCell({
                rowId: row.id || index,
                columnId: column.id
              });
            });
          }
        }

        tr.appendChild(td);
      });

      // Add edit column cell if editColumns is true
      if (editColumns) {
        const editTd = document.createElement('td');
        editTd.className = 'edit-row';
        editTd.innerHTML = `          <div class="row-actions">
            <button class="action-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
          </div>
        `;

        // Add click handler for edit button
        const editButton = editTd;
        editButton.addEventListener('click', (e) => {
          console.log("edit button clicked");
          e.stopPropagation();
          // Find the first editable cell in the row
          const firstEditableCell = tr.querySelector('td[data-editable="true"]');
          if (firstEditableCell) {
            const columnId = firstEditableCell.dataset.id;
            const currentValue = firstEditableCell.textContent;
            setCellInputValue(currentValue);
            setEditingCell({
              rowId: row.id || index,
              columnId: columnId
            });
          }
        });

        tr.appendChild(editTd);
      }

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    // Add loading indicator
    if (isLoading) {
      const loadingRow = document.createElement('tr');
      loadingRow.className = 'loading-row';
      const loadingCell = document.createElement('td');
      loadingCell.colSpan = columns.length + (editColumns ? 1 : 0);
      loadingCell.innerHTML = '<div class="loading-spinner">Loading...</div>';
      loadingRow.appendChild(loadingCell);
      tbody.appendChild(loadingRow);
    }

    // Add search results count
    if (searchOptions.showResultsCount && searchTerm) {
      const resultsCount = document.createElement('div');
      resultsCount.className = 'search-results-count';
      resultsCount.textContent = `Found ${searchResults} results`;
      table.parentNode.insertBefore(resultsCount, table);
    }
  };

  const handleCellEdit = (rowId, columnId, newValue) => {
    console.log('handleCellEdit', rowId, columnId, newValue);
    const updatedData = tableData.map(row => {
      if (row.id === rowId || row.id === undefined && tableData.indexOf(row) === rowId) {
        return { ...row, [columnId]: newValue };
      }
      return row;
    });
    
    console.log('Updated data:', updatedData);
    updateTableData(updatedData);
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  // Public methods
  const refreshTable = () => {
    console.log("refreshTable called with columns:", columnsRef.current.length, "and data:", tableDataRef.current.length);
    
    // Ensure we have the latest columns and data
    setColumns(columnsRef.current);
    
    // Force re-render with clean DOM
    if (tableInstance.current) {
      tableInstance.current.innerHTML = '';
      
      setTimeout(() => {
        renderTable();
        console.log("Table re-rendered after refresh");
      }, 0);
    }
  };

  const updateTableData = (newData) => {
    console.log("updateTableData to :", newData);
    setTableData(newData);
    tableDataRef.current = newData;
    
    // Re-render the table after data update
    setTimeout(() => {
      renderTable();
    }, 0);
  };

  // Public method to focus search input
  const focusSearch = () => {
    if (!searchOptions.searchRef?.current) {
      console.warn('Search ref is not available');
      return;
    }
    searchOptions.searchRef.current.focus();
  };

  // Public method to clear search
  const clearSearch = () => {
    if (!searchOptions.searchRef?.current) {
      console.warn('Search ref is not available');
      return;
    }
      searchOptions.searchRef.current.value = '';
      setSearchTerm('');
    updateTableData(tableData);
    setSearchResults(0);
  };

  // Expose public methods
  useEffect(() => {
    const container = containerRef.current;
    // console.log("container", container);
    if (container) {
      container.refreshTable = refreshTable;
      container.updateTableData = updateTableData;
      container.focusSearch = focusSearch;
      container.clearSearch = clearSearch;
    }
  }, [containerRef]);

  // Load more data
  const loadMoreData = () => {
    if (isLoading) return;
    
    setIsLoading(true);
    // Simulate loading more data
    setTimeout(() => {
      const newData = [...tableData, ...tableData.slice(tableData.length, tableData.length + rowsPerPage)];
      updateTableData(newData);
      setIsLoading(false);
    }, 1000);
  };

  // Expose methods to the parent component
  useImperativeHandle(ref, () => ({
    refreshTable,
    updateData: updateTableData,
    search: handleSearch,
    focusSearch,
    clearSearch,
    getData: () => tableData,
    getColumns: () => columns,
    deleteColumn: (columnId) => {
      try {
        // Normalize the column ID to check for different formats
        const normalizedColumnId = columnId.toLowerCase().replace(/\s+/g, '_');
        
        // Try to find the column by direct ID match first
        let columnToDelete = columns.find(col => col.id === columnId);
        
        // If not found, try with normalized ID or by label
        if (!columnToDelete) {
          columnToDelete = columns.find(col => 
            col.id.toLowerCase() === columnId.toLowerCase() || 
            col.id === normalizedColumnId ||
            col.label.toLowerCase() === columnId.toLowerCase()
          );
        }
        
        if (!columnToDelete) {
          console.warn(`Column with ID ${columnId} not found`);
          return false;
        }
        
        // Don't allow deleting the 'student' column or essential columns
        if (columnToDelete.id === 'student' || columnToDelete.editable === false) {
          console.warn(`Cannot delete essential column: ${columnToDelete.id}`);
          return false;
        }
        
        // Call the internal column delete handler with the actual column ID from our state
        handleColumnDelete(columnToDelete.id);
        return true;
      } catch (error) {
        console.error("Error deleting column:", error);
        return false;
      }
    }
  }));

  // Update originalData when initialData changes
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      updateTableData(initialData);
    }
  }, [initialData]); // Update when initialData changes

  // Handle search functionality
  const handleSearch = (term) => {
    console.log("handleSearch", term);
    console.log("tableData from search", tableData);
    if (!term) {
      setSearchResults(0);
      setTableData(tableDataRef.current);
      return;
    }

    const searchTerm = searchOptions.caseSensitive ? term : term.toLowerCase();
    console.log("tableDataRef.current", tableDataRef.current);
    const filteredData = tableDataRef.current.filter(row => {
      if (searchOptions.searchFields.length > 0) {
        return searchOptions.searchFields.some(field => {
          const value = getNestedValue(row, field);
          const searchValue = searchOptions.caseSensitive ? value : value?.toString().toLowerCase();
          return searchValue?.includes(searchTerm);
        });
      } else {
        return Object.values(row).some(value => {
          const searchValue = searchOptions.caseSensitive ? value : value?.toString().toLowerCase();
          return searchValue?.includes(searchTerm);
        });
      }
    });

    setTableData(filteredData);
    setSearchResults(filteredData.length);
    setCurrentPage(1);
  };

  // Add useEffect to handle rendering after data changes
  useEffect(() => {
    renderTable();
  }, [tableData, currentPage, filters]);

  // Helper function to get nested values
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => {
      return current ? current[key] : undefined;
    }, obj);
  };

  // Setup search functionality
  useEffect(() => {
    if (!searchOptions.searchRef?.current) return;

    const searchInput = searchOptions.searchRef.current;
    // console.log("searchInput", searchInput);
    // Set placeholder
    searchInput.placeholder = searchOptions.placeholder;

    // Add event listener for search
    const handleInputChange = (e) => {
      // console.log("handleInputChange", e.target.value);
      setSearchTerm(e.target.value);
      
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(() => {
        console.log("searchTimeoutRef tableData", tableData);
        handleSearch(e.target.value);
      }, searchOptions.debounceTime);
    };

    // Add focus event listener
    const handleFocus = () => {
      searchInput.classList.add('search-focused');
    };

    const handleBlur = () => {
      searchInput.classList.remove('search-focused');
    };

    // Add event listeners
    searchInput.addEventListener('input', handleInputChange);
    searchInput.addEventListener('focus', handleFocus);
    searchInput.addEventListener('blur', handleBlur);

    // Cleanup
    return () => {
      searchInput.removeEventListener('input', handleInputChange);
      searchInput.removeEventListener('focus', handleFocus);
      searchInput.removeEventListener('blur', handleBlur);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchOptions.searchRef, searchOptions.placeholder, searchOptions.debounceTime]);

  // Function to add a new column
  const addNewColumn = () => {
    console.log("Adding new column");
    // Generate a unique ID for the new column
    const newColumnId = `column_${Date.now()}`;
    const newColumn = {
      id: newColumnId,
      label: 'New Column',
      sortable: true,
      editable: true
    };

    // Add the new column to columns state
    setColumns(prevColumns => {
      const newColumns = [...prevColumns, newColumn];
      columnsRef.current = newColumns;
      return newColumns;
    });

    // Update table data to include the new column
    const newTableData = tableData.map(row => ({
      ...row,
      [newColumnId]: '' // Initialize with empty value
    }));
    updateTableData(newTableData);

    // Force re-render of the table immediately
    setTimeout(() => {
      // Clear the table and rebuild it completely
      if (tableInstance.current) {
        tableInstance.current.innerHTML = '';
      }
      renderTable();
      console.log("Table re-rendered after adding new column");
    }, 10);

    // Notify parent component about column addition
    if (onColumnAdd) {
      setTimeout(() => {
        onColumnAdd(newColumnId, newColumn.label);
      }, 0);
    }
  };

  // Handle column deletion
  const handleColumnDelete = (columnId) => {
    // Get the column details before deleting it
    const columnToDelete = columns.find(col => col.id === columnId);
    
    // Update columns state
    const newColumns = columns.filter(col => col.id !== columnId);
    setColumns(newColumns);
    columnsRef.current = newColumns;
    
    // Update table data to remove the column
    const newTableData = tableData.map(row => {
      const newRow = { ...row };
      delete newRow[columnId];
      return newRow;
    });
    updateTableData(newTableData);
    
    // Force re-render of the table immediately
    setTimeout(() => {
      renderTable();
    }, 0);
    
    // Notify parent component about column deletion
    if (onColumnDelete && columnToDelete) {
      setTimeout(() => {
        onColumnDelete(columnId, columnToDelete.label);
      }, 0);
    }
  };

  // Handle column name edit
  const handleColumnNameEdit = (columnId, newName) => {
    // Get current column name before update
    const currentColumn = columns.find(col => col.id === columnId);
    const oldName = currentColumn ? currentColumn.label : '';
    
    setColumns(prevColumns => {
      const newColumns = prevColumns.map(col => 
        col.id === columnId 
          ? { ...col, label: newName }
          : col
      );
      columnsRef.current = newColumns;
      return newColumns;
    });
    
    // Notify parent component about column rename
    if (onColumnRename && newName !== oldName) {
      setTimeout(() => {
        onColumnRename(columnId, oldName, newName);
      }, 0);
    }
  };

  // Add event listeners for edit buttons
  useEffect(() => {
    if (!editColumns) return;

    const table = tableInstance.current;
    if (!table) return;

    // Function to setup event listeners
    const setupEventListeners = () => {
      // Add column button click handler
      const addColumnBtn = table.querySelector('.edit-column');
      // console.log('Setting up add column button:', addColumnBtn);
      
      if (addColumnBtn) {
        const handleAddColumn = (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Add column clicked');
          addNewColumn();
        };
        
        // Remove existing listener if any
        if (addColumnHandlerRef.current) {
          addColumnBtn.removeEventListener('click', addColumnHandlerRef.current);
        }
        
        addColumnHandlerRef.current = handleAddColumn;
        addColumnBtn.addEventListener('click', handleAddColumn);
      }

      // Edit row buttons click handlers
      const editButtons = table.querySelectorAll('.row-actions .action-button');
      // console.log('Setting up edit buttons:', editButtons.length);
      
      editButtons.forEach((button, index) => {
        const handleEditRow = (e) => {
          e.preventDefault(); 
          // e.stopPropagation();
          console.log('Edit row clicked:', index);
        };
        
        // Remove existing listener if any
        if (editRowHandlersRef.current[index]) {
          button.removeEventListener('click', editRowHandlersRef.current[index]);
        }
        
        editRowHandlersRef.current[index] = handleEditRow;
        button.addEventListener('click', handleEditRow);
      });
    };

    // Setup MutationObserver to watch for changes in the table
    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          console.log('DOM changed, checking for buttons...');
          setupEventListeners();
        }
      });
    });

    // Start observing the table for changes
    observerRef.current.observe(table, {
      childList: true,
      subtree: true
    });

    // Initial setup
    setupEventListeners();

    // Add click event listener to the table for event delegation
    const handleTableClick = (e) => {
      const target = e.target;
      // console.log('target', target);
      
      // Check if the click was on the add column button
      if (target.closest('.edit-column')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Add column clicked (delegated)');
        addNewColumn();
        return;
      }
      
      // Check if the click was on an editable column header
      const columnHeader = target.closest('th[data-editable="true"]');
      if (columnHeader) {
        const columnId = columnHeader.dataset.id;
        console.log('columnHeader', columnHeader, columnId);
        setEditingColumn(columnId);
        return;
      }
      
      // Check if the click was on an edit button
      const editButton = target.closest('.row-actions .action-button');
      if (editButton) {
        e.preventDefault();
        e.stopPropagation();
        const row = editButton.closest('tr');
        const index = Array.from(row.parentNode.children).indexOf(row);
        console.log('Edit row clicked (delegated):', index);
      }

      // Check if the click was on an editable cell
      const cell = target.closest('td[data-editable="true"]');
      console.log('cell', cell);
      if (cell) {

        if (e.target.tagName === 'INPUT') return;

        e.stopPropagation();
        const row = cell.closest('tr');
        const rowId = row.dataset.id;
        const columnId = cell.dataset.id;
        const currentValue = cell.textContent;
        setCellInputValue(currentValue);
        setEditingCell({
          rowId,
          columnId
        });
        return;
      }
    };

    table.addEventListener('click', handleTableClick);

    return () => {
      // Disconnect observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Remove table click listener
      table.removeEventListener('click', handleTableClick);

      // Cleanup event listeners
      if (addColumnHandlerRef.current) {
        const addColumnBtn = table.querySelector('.edit-column');
        if (addColumnBtn) {
          addColumnBtn.removeEventListener('click', addColumnHandlerRef.current);
        }
      }

      editRowHandlersRef.current.forEach((handler, index) => {
        const editButtons = table.querySelectorAll('.row-actions .action-button');
        if (editButtons[index]) {
          editButtons[index].removeEventListener('click', handler);
        }
      });
    };
  }, [editColumns, tableData, editingColumn, columns, editingCell, cellInputValue]);

  // Add effect to handle column changes
  useEffect(() => {
    renderTable();
  }, [editingColumn, columns]);

  // Add effect to handle cell editing
  useEffect(() => {
    renderTable();
  }, [editingCell]);

  return null;
});

export default TableManager; 
