'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import './styles/page.css';
import TableManager from '@/components/TableManager';
import { useRouter } from 'next/navigation';
import { getAllUsers, getUserById, deleteUser } from './api/index';
import UserDialog from './components/AddUserDialog';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';

// Helper functions
const getUserType = (type) => {
  switch (type) {
    case 0: return 'Student';
    case 1: return 'Assistant';
    case 2: return 'Doctor';
    case 3: return 'Admin';
    case 4: return 'Doctor & Admin';
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

export default function UsersManagement() {
  const tableContainerRef = useRef(null);
  const tableRef = useRef(null);
  const searchInputRef = useRef(null);
  const tableManagerRef = useRef(null);
  const router = useRouter();
  
  // States for handling loading and user data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    assistants: 0,
    doctors: 0,
    admins: 0
  });
  
  // State for managing user dialogs
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [currentEditUser, setCurrentEditUser] = useState(null);
  
  // State for delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Transform users data to table format
  const transformUsersToTableData = (usersData) => {
    return usersData.map(user => ({
      user: {
        avatar: user.profileimage || "/images/default-avatar.jpg",
        name: `${user.firstname || ''} ${user.secondname || ''} ${user.lastname || ''}`.trim(),
        id: user.id || user._id
      },
      email: user.email || 'N/A',
      type: getUserType(user.type),
      status: user.status || 'active',
      joinDate: formatDate(user.createdAt || user.created_at),
      actions: user.id || user._id
    }));
  };

  // Fetch users data from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Fetch all users at once (no pagination)
        const data = await getAllUsers();
        console.log("data: ", data);
        
        setUsers(data);
        setTableData(transformUsersToTableData(data));
        
        // Calculate user statistics
        const statistics = {
          totalUsers: data.length,
          students: data.filter(user => user.type === 0).length,
          assistants: data.filter(user => user.type === 1).length,
          doctors: data.filter(user => user.type === 2 || user.type === 4).length,
          admins: data.filter(user => user.type === 3).length
        };
        
        setStats(statistics);
        setError(null);
      } catch (err) {
        console.error('Error fetching users data:', err);
        setError(err.response?.data?.message || 'Error loading users data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Update table data when users change
  useEffect(() => {
    if (users.length > 0) {
      setTableData(transformUsersToTableData(users));
    }
  }, [users]);

  const handleDataChange = (data) => {
    // Handle any data changes if needed
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    if (tableManagerRef.current) {
      tableManagerRef.current.focusSearch();
    }
  };

  // Handle adding a new user
  const handleAddUser = () => {
    setIsAddUserDialogOpen(true);
  };
  
  // Handle editing a user
  const handleEditUser = async (userId) => {
    try {
      setLoading(true);
      // Fetch the specific user data with additional type-specific fields
      const userData = await getUserById(userId);
      console.log("Fetched user data for edit:", userData);
      
      // Set the current user being edited
      setCurrentEditUser(userData);
      
      // Open the edit dialog
      setIsEditUserDialogOpen(true);
    } catch (err) {
      console.error('Error fetching user data for edit:', err);
      alert('Failed to load user data for editing');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle initiating user deletion
  const handleDeleteUserClick = (userId) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle confirming user deletion
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setLoading(true);
      
      // In a real app, you would call the deleteUser API here
      await deleteUser(userToDelete);
      
      // Remove the user from the local state
      const updatedUsers = users.filter(user => (user.id || user._id) !== userToDelete);
      setUsers(updatedUsers);
      
      // Update statistics
      const statistics = {
        totalUsers: updatedUsers.length,
        students: updatedUsers.filter(user => user.type === 0).length,
        assistants: updatedUsers.filter(user => user.type === 1).length,
        doctors: updatedUsers.filter(user => user.type === 2 || user.type === 4).length,
        admins: updatedUsers.filter(user => user.type === 3).length
      };
      
      setStats(statistics);
      
      // Close the delete dialog
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle successful user creation or update
  const handleUserSaved = async (userData, isEdit = false) => {
    try {
      setLoading(true);
      
      if (isEdit) {
        // إذا كان تعديل، قم بتحديث المستخدم في البيانات المحلية
        const updatedUsers = users.map(user => 
          (user.id || user._id) === userData.id ? userData : user
        );
        setUsers(updatedUsers);
      } else {
        // إذا كان إنشاء جديد، أضف المستخدم إلى البيانات المحلية
        setUsers(prevUsers => [userData, ...prevUsers]);
      }
      
      // Update statistics
      const updatedUsers = isEdit 
        ? users.map(user => (user.id || user._id) === userData.id ? userData : user)
        : [userData, ...users];
        
      const statistics = {
        totalUsers: updatedUsers.length,
        students: updatedUsers.filter(user => user.type === 0).length,
        assistants: updatedUsers.filter(user => user.type === 1).length,
        doctors: updatedUsers.filter(user => user.type === 2 || user.type === 4).length,
        admins: updatedUsers.filter(user => user.type === 3 || user.type === 4).length
      };
      
      setStats(statistics);
    } catch (err) {
      console.error('Error updating users data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading users data...</p>
      </div>
    );
  }

  // Show error state if there's a problem
  if (error) {
    return (
      <div className="error-state">
        <svg xmlns="http://www.w3.org/2000/svg" className="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="users-management-container" ref={tableContainerRef}>
      {/* Users Info Card */}
      <div className="users-info-card">
        <div className="card-header">
          <div className="users-title">
            <div className="title-text">
              <h2>Users Management</h2>
              <div className="users-badges">
                <div className="users-badge total">
                  <div className="badge-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="badge-content">
                    <span className="badge-label">Total Users</span>
                    <span className="badge-value">{stats.totalUsers}</span>
                  </div>
                </div>
                <div className="users-badge students">
                  <div className="badge-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998a12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg>
                  </div>
                  <div className="badge-content">
                    <span className="badge-label">Students</span>
                    <span className="badge-value">{stats.students}</span>
                  </div>
                </div>
                <div className="users-badge assistants">
                  <div className="badge-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                  </div>
                  <div className="badge-content">
                    <span className="badge-label">Assistants</span>
                    <span className="badge-value">{stats.assistants}</span>
                  </div>
                </div>
                <div className="users-badge doctors">
                  <div className="badge-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <div className="badge-content">
                    <span className="badge-label">Doctors</span>
                    <span className="badge-value">{stats.doctors}</span>
                  </div>
                </div>
                <div className="users-badge admins">
                  <div className="badge-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="badge-content">
                    <span className="badge-label">Admins</span>
                    <span className="badge-value">{stats.admins}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="right-side">
              <button className="add-user-btn" onClick={handleAddUser}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add New User
              </button>
            </div>
          </div>
        </div>
        
        {/* Users List Table */}
        <div className="users-list-table">
          <div className="table-header">
            <h3>Users List</h3>
            <div className="search-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input 
                type="text" 
                placeholder="Search by name, email, or ID..." 
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
        rowsPerPage={users.length} // Show all users
        onDataChange={handleDataChange}
        initialData={tableData}
        tableRef={tableRef}
        editColumns={false}
        tableHeaders={[
          {
            id: "user",
            label: "User",
            sortable: true,
            editable: false
          },
          {
            id: "email",
            label: "Email",
            sortable: true,
            editable: false
          },
          {
            id: "type",
            label: "Type",
            sortable: true,
            editable: false
          },
          {
            id: "status",
            label: "Status",
            sortable: true,
            editable: false
          },
          {
            id: "joinDate",
            label: "Join Date",
            sortable: true,
            editable: false
          },
          {
            id: "actions",
            label: "Actions",
            sortable: false,
            editable: false
          }
        ]}
        tableCellValuesHTML={{
          "User": (row) => (
            <div className="user-info">
              <Image 
                src={row.user.avatar} 
                alt="User Avatar" 
                width={40} 
                height={40} 
                className="user-avatar"
              />
              <div>
                <div className="user-name">{row.user.name}</div>
                <div className="user-id">ID: {row.user.id}</div>
              </div>
            </div>
          ),
          "Email": (row) => row.email,
          "Type": (row) => (
            <div className={`user-type ${row.type.toLowerCase()}`}>{row.type}</div>
          ),
          "Status": (row) => (
            <div className={`user-status ${row.status}`}>{row.status}</div>
          ),
          "Join Date": (row) => row.joinDate,
          "Actions": (row) => (
            <div className="action-buttons">
              <button className="action-btn edit" onClick={() => handleEditUser(row.actions)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button className="action-btn delete" onClick={() => handleDeleteUserClick(row.actions)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )
        }}
        searchOptions={{
          placeholder: "Search by name, email, or ID...",
          debounceTime: 300,
          caseSensitive: false,
          searchFields: ['user.name', 'user.id', 'email'],
          highlightMatches: true,
          showResultsCount: false,
          searchRef: searchInputRef
        }}
      />
      
      {/* Add User Dialog */}
      <UserDialog 
        isOpen={isAddUserDialogOpen} 
        onClose={() => setIsAddUserDialogOpen(false)} 
        onSuccess={(userData) => handleUserSaved(userData, false)} 
        editMode={false}
      />
      
      {/* Edit User Dialog */}
      <UserDialog 
        isOpen={isEditUserDialogOpen} 
        onClose={() => setIsEditUserDialogOpen(false)} 
        onSuccess={(userData) => handleUserSaved(userData, true)}
        editMode={true}
        userData={currentEditUser}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
} 