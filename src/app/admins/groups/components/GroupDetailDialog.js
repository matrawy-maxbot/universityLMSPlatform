'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import '../styles/GroupDetailDialog.css';
import { getGroupMembers, updateGroup, deleteGroup, addMembersToGroup, removeMemberFromGroup } from '../api/groups.service';
import { getAllUsers, getUserTypeText } from '../api/users.service';

const TABLE_HEADERS_CONFIG_AVAILABLE = [
  { id: "student", label: "Available People" },
  { id: "role", label: "Role" },
  { id: "select", label: "Select" }
];

const TABLE_HEADERS_CONFIG_SELECTED = [
  { id: "student", label: "Group Members" },
  { id: "role", label: "Role" },
  { id: "action", label: "Action" }
];

// Status badge component 
const StatusBadge = ({ status }) => {
  let badgeClass = 'status-badge-detail ';
  if (status === 'Active') badgeClass += 'status-active-detail';
  else if (status === 'Pending') badgeClass += 'status-pending-detail';
  else badgeClass += 'status-inactive-detail';
  return <span className={badgeClass}>{status}</span>;
};

export default function GroupDetailDialog({ isOpen, onClose, groupData, onGroupUpdate, onGroupDelete }) {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [people, setPeople] = useState([]);
  const [selectedPeopleIdsInternal, setSelectedPeopleIdsInternal] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const searchInputRef = useRef(null);
  
  // States for editing group name
  const [isEditingName, setIsEditingName] = useState(false);
  const [groupName, setGroupName] = useState('');
  const groupNameInputRef = useRef(null);
  
  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Define filter options
  const filters = ['All', 'Students', 'Doctors', 'Teaching Assistants', 'Admins'];
  
  // Define table headers
  const availableTableHeaders = TABLE_HEADERS_CONFIG_AVAILABLE;
  const selectedTableHeaders = TABLE_HEADERS_CONFIG_SELECTED;

  // Initialize data when dialog opens
  useEffect(() => {
    if (isOpen && groupData) {
      setGroupName(groupData.title || '');
      setSelectedFilter('All');
      setSearchTerm('');
      setIsEditingName(false);
      setShowDeleteConfirm(false);
      setIsLoading(true);
      setError(null);
      
      // جلب المستخدمين المتاحين من API
      const fetchAvailableUsers = async () => {
        try {
          const users = await getAllUsers();
          
          // تحويل بيانات المستخدمين إلى التنسيق المطلوب
          const formattedUsers = users.map(user => ({
            id: user.id,
            name: `${user.firstname} ${user.lastname}`,
            role: user.typeText || getUserTypeText(user.type) || 'User',
            avatar: user.profileimage || 'https://i.pravatar.cc/150',
            status: user.status || 'Active'
          }));
          
          setPeople(formattedUsers);
        } catch (error) {
          console.error('Error fetching users:', error);
          setError('فشل في جلب المستخدمين. يرجى المحاولة مرة أخرى لاحقًا.');
        }
      };
      
      // جلب أعضاء المجموعة من API
      const fetchGroupMembers = async () => {
        try {
          if (groupData.originalData && groupData.originalData.id) {
            const members = await getGroupMembers(groupData.originalData.id);
            
            // تحويل المعرّفات إلى مجموعة Set
            const memberIds = new Set(members.map(member => member.user?.id).filter(Boolean));
            setSelectedPeopleIdsInternal(memberIds);
          } else {
            // للتجربة فقط، في حالة عدم وجود بيانات أصلية، نفترض أنه لا يوجد أعضاء
            setSelectedPeopleIdsInternal(new Set());
          }
        } catch (error) {
          console.error('Error fetching group members:', error);
          setError('فشل في جلب أعضاء المجموعة. يرجى المحاولة مرة أخرى لاحقًا.');
        } finally {
          setIsLoading(false);
        }
      };
      
      // تنفيذ الاستعلامات
      fetchAvailableUsers();
      fetchGroupMembers();
    }
  }, [isOpen, groupData]);
  
  // Focus input when switching to edit mode
  useEffect(() => {
    if (isEditingName && groupNameInputRef.current) {
      groupNameInputRef.current.focus();
    }
  }, [isEditingName]);

  // Filter available people by role
  const filteredByRolePeople = useMemo(() => {
    if (selectedFilter === 'All') {
      return people;
    }
    return people.filter(person => {
      if (selectedFilter === 'Students') return person.role === 'Student';
      if (selectedFilter === 'Doctors') return person.role === 'Doctor' || person.role === 'Admin & Doctor';
      if (selectedFilter === 'Teaching Assistants') return person.role === 'Assistant';
      if (selectedFilter === 'Admins') return person.role === 'Admin' || person.role === 'Admin & Doctor';
      return true;
    });
  }, [people, selectedFilter]);

  // Apply search and exclusion of already selected people
  const availablePeople = useMemo(() => {
    let list = filteredByRolePeople;
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      list = list.filter(person => 
        person.name.toLowerCase().includes(lowerSearchTerm) || 
        person.id.toString().toLowerCase().includes(lowerSearchTerm) ||
        person.role.toLowerCase().includes(lowerSearchTerm)
      );
    }
    // Exclude people who are already selected
    return list.filter(person => !selectedPeopleIdsInternal.has(person.id));
  }, [filteredByRolePeople, searchTerm, selectedPeopleIdsInternal]);

  // Get data for selected people
  const selectedPeopleData = useMemo(() => {
    return people.filter(person => selectedPeopleIdsInternal.has(person.id));
  }, [people, selectedPeopleIdsInternal]);

  // Handle adding a person to the group
  const handleAddPerson = async (personId) => {
    try {
      setIsUpdating(true);
      // تحديث الواجهة أولاً لتجربة مستخدم أفضل
      setSelectedPeopleIdsInternal(prevSelectedIds => new Set(prevSelectedIds).add(personId));
      
      // إرسال الطلب إلى API إذا كانت هناك بيانات أصلية
      if (groupData.originalData && groupData.originalData.id) {
        await addMembersToGroup(groupData.originalData.id, [personId]);
      }
    } catch (error) {
      console.error(`Error adding member ${personId} to group:`, error);
      // في حالة الخطأ، نعيد الحالة للخلف
      setSelectedPeopleIdsInternal(prevSelectedIds => {
        const newSet = new Set(prevSelectedIds);
        newSet.delete(personId);
        return newSet;
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle removing a person from the group
  const handleRemovePerson = async (personId) => {
    try {
      setIsUpdating(true);
      // تحديث الواجهة أولاً لتجربة مستخدم أفضل
      setSelectedPeopleIdsInternal(prevSelectedIds => {
        const newSelectedIds = new Set(prevSelectedIds);
        newSelectedIds.delete(personId);
        return newSelectedIds;
      });
      
      // إرسال الطلب إلى API إذا كانت هناك بيانات أصلية
      if (groupData.originalData && groupData.originalData.id) {
        await removeMemberFromGroup(groupData.originalData.id, personId);
      }
    } catch (error) {
      console.error(`Error removing member ${personId} from group:`, error);
      // في حالة الخطأ، نعيد الحالة للخلف
      setSelectedPeopleIdsInternal(prevSelectedIds => new Set(prevSelectedIds).add(personId));
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle search term changes
  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Toggle between view and edit mode for group name
  const toggleEditName = () => {
    if (isEditingName) {
      // If we're exiting edit mode, we commit the change
      setIsEditingName(false);
    } else {
      // If we're entering edit mode, we start editing
      setIsEditingName(true);
    }
  };
  
  // Handle group name changes
  const handleGroupNameChange = (e) => {
    setGroupName(e.target.value);
  };
  
  // Handle save when pressing Enter in the name field
  const handleGroupNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditingName(false);
    }
  };
  
  // Handle delete button click
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };
  
  // Handle cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };
  
  // Handle confirm delete
  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      
      // حذف المجموعة عبر API إذا كانت هناك بيانات أصلية
      if (groupData.originalData && groupData.originalData.id) {
        await deleteGroup(groupData.originalData.id);
      }
      
      if (onGroupDelete && groupData) {
        onGroupDelete(groupData.id);
      }
      onClose();
    } catch (error) {
      console.error('Error deleting group:', error);
      setError('فشل في حذف المجموعة. يرجى المحاولة مرة أخرى لاحقًا.');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Save group changes
  const handleSaveChanges = async () => {
    try {
      setIsUpdating(true);
      
      if (onGroupUpdate && groupData) {
        // إعداد بيانات التحديث
        const updatedGroup = {
          ...groupData,
          title: groupName.trim() || groupData.title,
          membersCount: selectedPeopleIdsInternal.size,
        };
        
        // تحديث المجموعة عبر API إذا كانت هناك بيانات أصلية
        if (groupData.originalData && groupData.originalData.id) {
          const groupToUpdate = {
            ...groupData.originalData,
            title: groupName.trim() || groupData.originalData.title,
            metadata: {
              ...groupData.originalData.metadata,
              membersCount: selectedPeopleIdsInternal.size,
              selectedMembers: Array.from(selectedPeopleIdsInternal)
            }
          };
          
          await updateGroup(groupData.originalData.id, groupToUpdate);
        }
        
        onGroupUpdate(updatedGroup);
      }
      onClose();
    } catch (error) {
      console.error('Error updating group:', error);
      setError('فشل في تحديث المجموعة. يرجى المحاولة مرة أخرى لاحقًا.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen || !groupData) return null;

  // SVG for member icon
  const MemberIconSvg = () => (
    <svg className="member-icon-detail" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33.37 40">
        <path className="cls-1" d="M16.43,19.27c2.65,0,4.94-.95,6.81-2.82,1.87-1.87,2.82-4.16,2.82-6.81s-.95-4.94-2.82-6.81c-1.87-1.87-4.17-2.82-6.81-2.82s-4.94.95-6.81,2.82c-1.87,1.87-2.82,4.16-2.82,6.81s.95,4.94,2.82,6.81c1.87,1.87,4.17,2.82,6.81,2.82ZM33.29,30.76c-.05-.78-.16-1.63-.32-2.53-.16-.9-.37-1.76-.62-2.54-.26-.81-.61-1.61-1.04-2.37-.45-.79-.98-1.48-1.58-2.05-.62-.59-1.38-1.07-2.26-1.42-.88-.35-1.85-.52-2.89-.52-.41,0-.8.17-1.57.66-.54.35-1.09.7-1.63,1.05-.52.33-1.23.65-2.11.93-.86.28-1.72.42-2.58.42s-1.73-.14-2.58-.42c-.88-.28-1.59-.6-2.11-.93-.61-.39-1.16-.74-1.63-1.05-.76-.5-1.16-.66-1.57-.66-1.04,0-2.01.18-2.89.52-.88.35-1.64.83-2.26,1.42-.59.57-1.12,1.26-1.57,2.05-.43.76-.79,1.56-1.04,2.37-.25.78-.46,1.64-.62,2.54-.16.9-.27,1.75-.32,2.53C.03,31.54,0,32.33,0,33.12,0,35.21.66,36.9,1.97,38.15c1.29,1.23,3,1.85,5.08,1.85h19.26c2.08,0,3.79-.62,5.08-1.85,1.31-1.25,1.97-2.94,1.97-5.03,0-.81-.03-1.6-.08-2.36h0Z"/>
    </svg>
  );
  
  // SVG for edit icon
  const EditIconSvg = () => (
    <svg className="edit-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );
  
  // SVG for delete icon
  const DeleteIconSvg = () => (
    <svg className="delete-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );

  return (
    <div className="detail-dialog-overlay">
      <div className="detail-dialog-content">
        <button className="close-button" onClick={onClose}>×</button>
        
        {/* Group Header */}
        <div className="group-header-detail">
          <MemberIconSvg />
          {isEditingName ? (
            <input
              ref={groupNameInputRef}
              type="text"
              value={groupName}
              onChange={handleGroupNameChange}
              onKeyDown={handleGroupNameKeyDown}
              onBlur={() => setIsEditingName(false)}
              className="group-name-input"
              aria-label="Group name"
            />
          ) : (
            <h2 className="group-title-detail">
              {groupName || groupData.title}
              <button 
                className="edit-name-button" 
                onClick={toggleEditName} 
                aria-label="Edit group name"
              >
                <EditIconSvg />
              </button>
            </h2>
          )}
        </div>
        
        {error && <p className="error-message">{error}</p>}
        
        {isLoading ? (
          <div className="loading-container">جاري تحميل البيانات...</div>
        ) : (
          <>
            {/* Group Info */}
            <div className="group-info-detail">
              <div className="info-item">
                <span className="info-label">Created By:</span>
                <span className="info-value">{groupData.authorName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Created At:</span>
                <span className="info-value">{groupData.createdAt}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Update:</span>
                <span className="info-value">{groupData.lastEditAt}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Members:</span>
                <span className="info-value members-count-badge">{selectedPeopleIdsInternal.size}</span>
              </div>
            </div>
            
            {/* Tables Container */}
            <div className="tables-container">
              {/* Available People Table */}
              <div className="table-section">
                <h3>Available People</h3>
                
                <div className="table-controls">
                  <div className="search-box">
                    <input
                      type="text"
                      ref={searchInputRef}
                      placeholder="Search people..."
                      onChange={handleSearchTermChange}
                      className="search-input"
                    />
                  </div>
                  
                  <div className="filters-container">
                    {filters.map(filter => (
                      <button 
                        key={filter} 
                        className={`filter-button ${selectedFilter === filter ? 'active' : ''}`}
                        onClick={() => setSelectedFilter(filter)}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="table-wrapper">
                  <table className="people-table">
                    <thead>
                      <tr>
                        {availableTableHeaders.map(header => (
                          <th key={header.id}>{header.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {availablePeople.length === 0 ? (
                        <tr>
                          <td colSpan={availableTableHeaders.length} className="no-results">
                            No people available
                          </td>
                        </tr>
                      ) : (
                        availablePeople.map(person => (
                          <tr key={person.id}>
                            <td className="person-cell">
                              <div className="person-info">
                                <Image 
                                  src={person.avatar} 
                                  width={40} 
                                  height={40} 
                                  alt={person.name}
                                  className="person-avatar" 
                                />
                                <span className="person-name">{person.name}</span>
                              </div>
                            </td>
                            <td>{person.role}</td>
                            <td>
                              <button 
                                className="add-button"
                                onClick={() => handleAddPerson(person.id)}
                                disabled={isUpdating}
                              >
                                Add
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Selected People Table */}
              <div className="table-section">
                <h3>Group Members</h3>
                <div className="table-wrapper">
                  <table className="people-table">
                    <thead>
                      <tr>
                        {selectedTableHeaders.map(header => (
                          <th key={header.id}>{header.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPeopleData.length === 0 ? (
                        <tr>
                          <td colSpan={selectedTableHeaders.length} className="no-results">
                            No members selected
                          </td>
                        </tr>
                      ) : (
                        selectedPeopleData.map(person => (
                          <tr key={person.id}>
                            <td className="person-cell">
                              <div className="person-info">
                                <Image 
                                  src={person.avatar} 
                                  width={40} 
                                  height={40} 
                                  alt={person.name}
                                  className="person-avatar" 
                                />
                                <span className="person-name">{person.name}</span>
                              </div>
                            </td>
                            <td>{person.role}</td>
                            <td>
                              <button 
                                className="remove-button"
                                onClick={() => handleRemovePerson(person.id)}
                                disabled={isUpdating}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Confirmation dialog for delete */}
        {showDeleteConfirm && (
          <div className="confirm-delete-overlay">
            <div className="confirm-delete-modal">
              <h3>Delete Group</h3>
              <p className="confirm-message">Are you sure you want to delete this group? This action cannot be undone.</p>
              <div className="confirm-actions">
                <button 
                  className="confirm-cancel-btn" 
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-delete-btn" 
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Group'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="detail-dialog-actions">
          <button 
            className="delete-group-button" 
            onClick={handleDeleteClick}
            disabled={isUpdating || isLoading}
          >
            <DeleteIconSvg /> Delete Group
          </button>
          <div className="right-actions">
            <button 
              className="cancel-button" 
              onClick={onClose}
              disabled={isUpdating || isDeleting}
            >
              Cancel
            </button>
            <button 
              className="create-button" 
              onClick={handleSaveChanges}
              disabled={isUpdating || isDeleting || isLoading}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 