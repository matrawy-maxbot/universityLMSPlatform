'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import '../styles/CreateGroupDialog.css';
import Image from 'next/image';
import { createGroup, getAllGroupsWithAuthors, addMembersToGroup } from '../api/groups.service';
import { getAllUsers, getUserTypeText } from '../api/users.service';
import { getCookie } from 'cookies-next';
// import TableManager from '@/components/TableManager'; // Remove TableManager import

// Obtener el token para su uso posterior
const token = getCookie('access_token');

/**
 * دالة للحصول على معلومات المستخدم الحالي من التوكن
 * @returns {Promise<Object>} معلومات المستخدم الحالي
 */
const getCurrentUser = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/v1/users/verify-token', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to verify token');
    }

    const data = await response.json();
    const user = data.user || (data.data && data.data.user);
    
    if (!user || !user.id) {
      throw new Error('No user data found in token');
    }
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

const TABLE_HEADERS_CONFIG_AVAILABLE = [
  { id: "student", label: "Available People" }, // Combined header for clarity
  { id: "role", label: "Role" },
  { id: "select", label: "Select" }
];

const TABLE_HEADERS_CONFIG_SELECTED = [
  { id: "student", label: "Selected People" }, // Combined header
  { id: "role", label: "Role" },
  { id: "action", label: "Action" }
];

export default function CreateGroupDialog({ isOpen, onClose, onGroupCreate }) {
  // console.log('[CreateGroupDialog] Component Rerendered. isOpen:', isOpen); // Keep logs for now if helpful
  const [groupName, setGroupName] = useState('');
  const [formInteracted, setFormInteracted] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [people, setPeople] = useState([]);
  const [selectedPeopleIdsInternal, setSelectedPeopleIdsInternal] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // const tableManagerRef = useRef(null); // No longer needed
  // const tableContainerRef = useRef(null); // No longer needed if table is inline
  const searchInputRef = useRef(null);

  useEffect(() => {
    // جلب المستخدمين عند فتح النافذة
    if (isOpen) {
      setIsLoading(true);
      const fetchUsers = async () => {
        try {
          // جلب المستخدمين من API
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
          // يمكن عرض رسالة خطأ للمستخدم هنا
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUsers();
      setGroupName('');
      setFormInteracted(false);
      setSelectedFilter('All');
      setSelectedPeopleIdsInternal(new Set());
      setSearchTerm('');
      setIsSubmitting(false);
      setSubmitError(null);
      if(searchInputRef.current) searchInputRef.current.value = '';
    }
  }, [isOpen]);

  const filteredByRolePeople = useMemo(() => {
    // console.log('[CreateGroupDialog] Recalculating filteredByRolePeople memo. Dependencies: people, selectedFilter');
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

  const selectedPeopleData = useMemo(() => {
    return people.filter(person => selectedPeopleIdsInternal.has(person.id));
  }, [people, selectedPeopleIdsInternal]);

  useEffect(() => {
    // console.log('[CreateGroupDialog] Effect to (potentially) clear selections. Dependency: availablePeople');
    // No direct action needed on selectedPeopleIdsInternal here because availablePeople already excludes them.
    // If we had checkboxes on availablePeople that could get out of sync, this might be different.
  }, [availablePeople]);

  const handleAddPerson = (personId) => {
    setSelectedPeopleIdsInternal(prevSelectedIds => new Set(prevSelectedIds).add(personId));
  };

  const handleRemovePerson = (personId) => {
    setSelectedPeopleIdsInternal(prevSelectedIds => {
      const newSelectedIds = new Set(prevSelectedIds);
      newSelectedIds.delete(personId);
      return newSelectedIds;
    });
  };

  const handleCreateGroup = async () => {
    setFormInteracted(true);
    if (!groupName.trim()) {
      console.warn('[CreateGroupDialog] Attempted to create group with empty name.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // الحصول على معلومات المستخدم الحالي
      let authorId = null;
      let currentUser = null;
      
      try {
        // استخدام بيانات المستخدم الحالي المسجل دخوله
        currentUser = await getCurrentUser();
        authorId = currentUser.id;
        console.log(`[CreateGroupDialog] Current user ID: ${authorId}`);
      } catch (userError) {
        console.error('[CreateGroupDialog] Error getting current user:', userError);
        setSubmitError('فشل في الحصول على معلومات المستخدم الحالي. يرجى المحاولة مرة أخرى.');
        setIsSubmitting(false);
        return;
      }
      
      // Confirmar que tenemos un ID válido
      if (!authorId) {
        setSubmitError('لم يتم العثور على معرف المستخدم الحالي.');
        setIsSubmitting(false);
        return;
      }
      
      // Asegurarse de que el ID sea una cadena (string)
      authorId = String(authorId);
      
      // إعداد بيانات المجموعة للإرسال - بدون الأعضاء
      const groupData = {
        title: groupName.trim(),
        authorid: authorId,
        description: `Group created for digital college platform`,
        isPublic: true,
        tags: []
      };
      
      console.log('[CreateGroupDialog] Sending group data:', groupData);
      
      // إنشاء المجموعة عبر API
      const newGroup = await createGroup(groupData);
      
      // Definir el número de miembros antes de agregar miembros
      const membersCount = selectedPeopleIdsInternal.size;
      
      // إضافة الأعضاء المحددين إلى المجموعة التي تم إنشاؤها
      if (membersCount > 0 && newGroup && newGroup.id) {
        try {
          console.log(`[CreateGroupDialog] Adding ${membersCount} members to group ${newGroup.id}`);
          const membersArray = Array.from(selectedPeopleIdsInternal).map(id => String(id));
          await addMembersToGroup(newGroup.id, membersArray);
          console.log('[CreateGroupDialog] Members added successfully');
        } catch (memberError) {
          console.error('[CreateGroupDialog] Error adding members to group:', memberError);
          // نستمر في العملية حتى لو فشلت إضافة الأعضاء، لأن المجموعة تم إنشاؤها بالفعل
        }
      }
      
      // استخدام بيانات المستخدم الحالي التي حصلنا عليها بالفعل
      let authorName = "Current User";
      let authorAvatar = "/images/shadcn.jpg"; // Default avatar
      console.log('[CreateGroupDialog] Current user:', currentUser);
      
      if (currentUser) {
        if (currentUser.firstname && currentUser.lastname) {
          authorName = `${currentUser.firstname} ${currentUser.lastname}`;
        }
        if (currentUser.profileimage) {
          authorAvatar = currentUser.profileimage;
        }
      }

      // إضافة المعلومات المرئية للمجموعة لعرضها في الواجهة
      const formattedGroup = {
        id: newGroup.id,
        title: newGroup.title,
        membersCount: membersCount,
        authorName: authorName,
        authorAvatar: authorAvatar,
        createdAt: new Date().toLocaleDateString(),
        lastEditAt: new Date().toLocaleString(),
        originalData: {
          ...newGroup,
          metadata: {
            ...(newGroup.metadata || {}),
            membersCount: membersCount
          }
        } // تخزين البيانات الأصلية للاستخدام لاحقًا
      };
      
      console.log('[CreateGroupDialog] Group created successfully:', formattedGroup);
      
      if (onGroupCreate) {
        onGroupCreate(formattedGroup);
      }
      
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
      // محاولة الحصول على مزيد من المعلومات حول الخطأ
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      setSubmitError('حدث خطأ أثناء إنشاء المجموعة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filters = ['All', 'Students', 'Doctors', 'Teaching Assistants', 'Admins'];
  // Headers for the two tables
  const availableTableHeaders = TABLE_HEADERS_CONFIG_AVAILABLE;
  const selectedTableHeaders = TABLE_HEADERS_CONFIG_SELECTED;

  const isCreateDisabled = !groupName.trim();
  const showGroupNameError = formInteracted && !groupName.trim();

  const handleGroupNameChange = (e) => {
    setFormInteracted(true);
    setGroupName(e.target.value);
  }

  const handleFilterChange = (filter) => {
    setFormInteracted(true);
    setSelectedFilter(filter);
  }

  const handleSearchTermChange = (e) => {
    setFormInteracted(true);
    setSearchTerm(e.target.value);
  }
  
  const handleGroupNameBlur = () => {
    setFormInteracted(true);
  }

  return (
    <div className="dialog-overlay">
      <div className="dialog-content dialog-content-two-tables">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Create New Group</h2>
        
        {submitError && <p className="error-message submit-error">{submitError}</p>}
        
        <div className="form-group">
          <label htmlFor="groupName">Group Name <span className="required-star">*</span></label>
          <input 
            type="text"
            id="groupName"
            value={groupName}
            onChange={handleGroupNameChange}
            onBlur={handleGroupNameBlur}
            placeholder="Enter group name"
            aria-required="true"
            className={showGroupNameError ? 'input-error' : ''}
          />
          {showGroupNameError && <p className="error-message">Group name is required.</p>}
        </div>

        <div className="form-group">
          <input 
            type="text" 
            ref={searchInputRef} 
            placeholder="Search available people..."
            className="search-input-field"
            onChange={handleSearchTermChange}
            value={searchTerm}
          />
        </div>
        
        {isLoading ? (
          <div className="loading-container">جاري تحميل البيانات...</div>
        ) : (
          <div className="two-tables-layout">
            {/* Available People Table */}
            <div className="table-section available-people-section">
              {/* <h3>Available</h3> */}
              <div className="people-table-container people-table-container-available">
                <table>
                  <thead>
                    <tr>
                      {availableTableHeaders.map(header => (
                        <th key={header.id} className={`th-${header.id}`}>{header.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {availablePeople.length > 0 ? (
                      availablePeople.map(person => (
                        <tr key={person.id}>
                          <td className="td-student">
                            <div className="student-info-cell">
                              <Image 
                                src={person.avatar} 
                                alt={person.name} 
                                width={32}
                                height={32}
                                className="student-avatar-img"
                              />
                              <div className="student-details">
                                <div className="student-name-table">{person.name}</div>
                                <div className="student-id-table">ID: {person.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="td-role">{person.role}</td>
                          <td className="td-select">
                            <button className="action-button add-person-btn" onClick={() => handleAddPerson(person.id)} title="Add Person">Add</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={availableTableHeaders.length} className="no-data-message">{searchTerm ? 'No available people match your search.' : 'No available people for this filter.'}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Selected People Table */}
            <div className="table-section selected-people-section">
              {/* <h3>Selected</h3> */}
              <div className="people-table-container people-table-container-selected">
                <table>
                  <thead>
                    <tr>
                      {selectedTableHeaders.map(header => (
                        <th key={header.id} className={`th-${header.id}`}>{header.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPeopleData.length > 0 ? (
                      selectedPeopleData.map(person => (
                        <tr key={person.id}>
                          <td className="td-student">
                            <div className="student-info-cell">
                              <Image 
                                src={person.avatar} 
                                alt={person.name} 
                                width={32}
                                height={32}
                                className="student-avatar-img"
                              />
                              <div className="student-details">
                                <div className="student-name-table">{person.name}</div>
                                <div className="student-id-table">ID: {person.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="td-role">{person.role}</td>
                          <td className="td-action">
                            <button className="action-button remove-person-btn" onClick={() => handleRemovePerson(person.id)} title="Remove Person">Remove</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={selectedTableHeaders.length} className="no-data-message">No people selected.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        <div className="action-buttons">
          <button 
            className="cancel-button" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            className="submit-button" 
            onClick={handleCreateGroup} 
            disabled={isCreateDisabled || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
} 