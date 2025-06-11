'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import './styles/page.css';
import CreateGroupDialog from './components/CreateGroupDialog';
import GroupDetailDialog from './components/GroupDetailDialog';
import { getAllGroupsWithAuthors, deleteGroup, updateGroup } from './api/groups.service';

// الصورة الافتراضية للمستخدم في حالة عدم وجود صورة
const DEFAULT_AVATAR = '/images/shadcn.jpg';

export default function Groups() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [groupsList, setGroupsList] = useState([]); // استخدام مصفوفة فارغة بدلاً من البيانات الثابتة
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedGroupData, setSelectedGroupData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // جلب المجموعات عند تحميل الصفحة
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllGroupsWithAuthors();
        
        // تحويل البيانات إلى الشكل المطلوب للعرض
        const formattedGroups = data.map(group => ({
          id: group.id,
          title: group.title,
          membersCount: group.metadata?.membersCount || 0,
          authorName: group.author ? `${group.author.firstname} ${group.author.lastname}` : 'Unknown',
          authorAvatar: group.author?.profileimage || DEFAULT_AVATAR,
          createdAt: new Date(group.createdAt).toLocaleDateString(),
          lastEditAt: new Date(group.updatedAt).toLocaleString(),
          // إضافة البيانات الأصلية للاستخدام في حالة التحديث
          originalData: group
        }));
        
        setGroupsList(formattedGroups);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setError('فشل في جلب المجموعات. يرجى المحاولة مرة أخرى لاحقًا.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  const openDetailDialog = (groupData) => {
    setSelectedGroupData(groupData);
    setIsDetailDialogOpen(true);
  };

  const closeDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedGroupData(null);
  };

  const handleGroupCreate = (newGroupData) => {
    console.log('[GroupsPage] Received new group data:', newGroupData);
    // إضافة المجموعة الجديدة إلى القائمة
    setGroupsList(prevGroups => [newGroupData, ...prevGroups]);
  };

  const handleGroupUpdate = async (updatedGroup) => {
    try {
      // استخدام البيانات الأصلية للتحديث لتجنب فقدان المعلومات
      const originalGroup = groupsList.find(g => g.id === updatedGroup.id)?.originalData || {};
      
      // دمج البيانات المحدثة مع البيانات الأصلية
      const groupToUpdate = {
        ...originalGroup,
        title: updatedGroup.title,
        // يمكن إضافة المزيد من الحقول حسب الحاجة
        metadata: {
          ...originalGroup.metadata,
          membersCount: updatedGroup.membersCount
        }
      };
      
      // تحديث المجموعة في الخادم
      const response = await updateGroup(updatedGroup.id, groupToUpdate);
      
      // تحديث واجهة المستخدم بعد نجاح التحديث
      setGroupsList(prevGroups => prevGroups.map(group => 
        group.id === updatedGroup.id 
          ? {
              ...group,
              title: updatedGroup.title,
              membersCount: updatedGroup.membersCount,
              lastEditAt: new Date().toLocaleString(),
              originalData: response // تحديث البيانات الأصلية أيضًا
            } 
          : group
      ));
      
      // عرض رسالة نجاح
      console.log('Group updated successfully:', response);
    } catch (error) {
      console.error('Error updating group:', error);
      // يمكن إضافة إشعار للمستخدم هنا
    }
  };

  const handleGroupDelete = async (groupId) => {
    try {
      // حذف المجموعة من الخادم
      await deleteGroup(groupId);
      
      // حذف المجموعة من واجهة المستخدم
      setGroupsList(prevGroups => prevGroups.filter(group => group.id !== groupId));
      
      // عرض رسالة نجاح
      console.log('Group deleted successfully');
    } catch (error) {
      console.error('Error deleting group:', error);
      // يمكن إضافة إشعار للمستخدم هنا
    }
  };

  // Placeholder for group icon SVG content - to avoid repeating it many times
  const GroupIconSvg = () => (
    <svg className="group-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 151 113.25">
        <circle className="cls-2" cx="25.17" cy="18.88" r="18.88"/>
        <path className="cls-2" d="M45.87,50.77c-12.87,8.03-20.7,22.14-20.7,37.31h-12.58c-6.94-.02-12.56-5.64-12.58-12.58v-12.58c.03-10.41,8.46-18.84,18.88-18.88h12.58c5.56.01,10.83,2.48,14.41,6.73Z"/>
        <circle className="cls-3" cx="125.83" cy="18.88" r="18.88"/>
        <path className="cls-3" d="M151,62.92v12.58c-.02,6.94-5.64,12.56-12.58,12.58h-12.58c0-15.17-7.83-29.28-20.7-37.31,3.58-4.26,8.85-6.72,14.41-6.73h12.58c10.41.03,18.84,8.46,18.88,18.88Z"/>
        <circle className="cls-1" cx="75.5" cy="25.17" r="25.17"/>
        <path className="cls-1" d="M113.25,88.08v6.29c-.03,10.41-8.46,18.84-18.88,18.88h-37.75c-10.41-.03-18.84-8.46-18.88-18.88v-6.29c0-17.37,14.08-31.46,31.46-31.46h12.58c17.37,0,31.46,14.08,31.46,31.46Z"/>
    </svg>
  );
  // Placeholder for member icon SVG
  const MemberIconSvg = () => (
    <svg className="member-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33.37 40">
        <path className="cls-1" d="M16.43,19.27c2.65,0,4.94-.95,6.81-2.82,1.87-1.87,2.82-4.16,2.82-6.81s-.95-4.94-2.82-6.81c-1.87-1.87-4.17-2.82-6.81-2.82s-4.94.95-6.81,2.82c-1.87,1.87-2.82,4.16-2.82,6.81s.95,4.94,2.82,6.81c1.87,1.87,4.17,2.82,6.81,2.82ZM33.29,30.76c-.05-.78-.16-1.63-.32-2.53-.16-.9-.37-1.76-.62-2.54-.26-.81-.61-1.61-1.04-2.37-.45-.79-.98-1.48-1.58-2.05-.62-.59-1.38-1.07-2.26-1.42-.88-.35-1.85-.52-2.89-.52-.41,0-.8.17-1.57.66-.54.35-1.09.7-1.63,1.05-.52.33-1.23.65-2.11.93-.86.28-1.72.42-2.58.42s-1.73-.14-2.58-.42c-.88-.28-1.59-.6-2.11-.93-.61-.39-1.16-.74-1.63-1.05-.76-.5-1.16-.66-1.57-.66-1.04,0-2.01.18-2.89.52-.88.35-1.64.83-2.26,1.42-.59.57-1.12,1.26-1.57,2.05-.43.76-.79,1.56-1.04,2.37-.25.78-.46,1.64-.62,2.54-.16.9-.27,1.75-.32,2.53C.03,31.54,0,32.33,0,33.12,0,35.21.66,36.9,1.97,38.15c1.29,1.23,3,1.85,5.08,1.85h19.26c2.08,0,3.79-.62,5.08-1.85,1.31-1.25,1.97-2.94,1.97-5.03,0-.81-.03-1.6-.08-2.36h0Z"/>
    </svg>
  );

  return (
    <>
      <div className="groups-container">
        {isLoading ? (
          <div className="loading-container">جاري تحميل المجموعات...</div>
        ) : error ? (
          <div className="error-container">{error}</div>
        ) : (
          <div className="groups-grid">
            {/* Map over groupsList to render group cards dynamically */}
            {groupsList.map(group => (
              <div className="group-card" key={group.id} onClick={() => openDetailDialog(group)}>
                <div className="group-header">
                  <GroupIconSvg />
                  <h2 className="group-title">{group.title}</h2>
                </div>
                <div className="footer">
                  <div className="group-meta">
                    <div className="meta-item">
                      <span className="meta-label">Created at</span>
                      <span className="meta-value">{group.createdAt}</span>
                    </div>
                    {group.lastEditAt && (
                      <div className="meta-item">
                        <span className="meta-label">Last edit at</span>
                        <span className="meta-value">{group.lastEditAt}</span>
                      </div>
                    )}
                  </div>
                  <div className="group-members">
                    <div className="members-count">
                      <div className="members-label">Members</div>
                      <div className="members-number">
                        <MemberIconSvg />
                        <span>{group.membersCount}</span>
                      </div>
                    </div>
                    <div className="group-author">
                      <Image src={group.authorAvatar} alt={group.authorName} className="author-avatar" width={40} height={40} />
                      <span className="author-name">{group.authorName}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Create New Group Card */}
            <div className="create-group-card" onClick={openDialog}>
              <svg className="create-group-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 176.91 149.65">
                  <g>
                      <circle className="cls-4" cx="25.17" cy="18.88" r="18.88"/>
                      <path className="cls-4" d="M45.87,50.77c-12.87,8.03-20.7,22.14-20.7,37.31h-12.58c-6.94-.02-12.56-5.64-12.58-12.58v-12.58c.03-10.41,8.46-18.84,18.88-18.88h12.58c5.56.01,10.83,2.48,14.41,6.73Z"/>
                      <circle className="cls-5" cx="125.83" cy="18.88" r="18.88"/>
                      <path className="cls-5" d="M151,62.92v12.58c-.02,6.94-5.64,12.56-12.58,12.58h-12.58c0-15.17-7.83-29.28-20.7-37.31,3.58-4.26,8.85-6.72,14.41-6.73h12.58c10.41.03,18.84,8.46,18.88,18.88Z"/>
                      <circle className="cls-2" cx="75.5" cy="25.17" r="25.17"/>
                      <path className="cls-2" d="M113.25,88.08v6.29c-.03,10.41-8.46,18.84-18.88,18.88h-37.75c-10.41-.03-18.84-8.46-18.88-18.88v-6.29c0-17.37,14.08-31.46,31.46-31.46h12.58c17.37,0,31.46,14.08,31.46,31.46Z"/>
                  </g>
                  <g>
                      <circle className="cls-1" cx="128.41" cy="101.15" r="42.5"/>
                      <g>
                          <line className="cls-3" x1="128.66" y1="84.65" x2="128.66" y2="118.65"/>
                          <line className="cls-3" x1="145.84" y1="101.14" x2="111.84" y2="101.14"/>
                      </g>
                  </g>
              </svg>
              <h2 className="create-group-title">Create New Group</h2>
            </div>
          </div>
        )}
      </div>
      <CreateGroupDialog 
        isOpen={isDialogOpen} 
        onClose={closeDialog} 
        onGroupCreate={handleGroupCreate} // Pass the handler function
      />
      <GroupDetailDialog
        isOpen={isDetailDialogOpen}
        onClose={closeDetailDialog}
        groupData={selectedGroupData}
        onGroupUpdate={handleGroupUpdate}
        onGroupDelete={handleGroupDelete}
      />
    </>
  );
}