'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import './styles/page.css';
import CreateAnnouncementDialog from './components/CreateAnnouncementDialog';
import AnnouncementDetailDialog from './components/AnnouncementDetailDialog';
import { getAllAnnouncements, deleteAnnouncement, updateAnnouncement } from './api/announcements.service';

// Default avatar for users if none is provided
const DEFAULT_AVATAR = '/images/shadcn.jpg';

export default function Announcements() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedAnnouncementData, setSelectedAnnouncementData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch announcements when page loads
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllAnnouncements();
        
        // Format announcements for display
        const formattedAnnouncements = data.map(announcement => ({
          id: announcement._id,
          title: announcement.title,
          message: announcement.message,
          startDate: announcement.startDate ? new Date(announcement.startDate).toLocaleDateString() : null,
          endDate: announcement.endDate ? new Date(announcement.endDate).toLocaleDateString() : null,
          isActive: announcement.isActive,
          authorName: announcement.author ? `${announcement.author.firstname} ${announcement.author.lastname}` : 'Unknown',
          authorAvatar: announcement.author?.profileimage || DEFAULT_AVATAR,
          createdAt: new Date(announcement.createdAt).toLocaleDateString(),
          lastEditAt: new Date(announcement.updatedAt).toLocaleString(),
          buttons: announcement.buttons || [],
          // Save original data for updates
          originalData: announcement
        }));

        console.log('formattedAnnouncements: ', formattedAnnouncements);
        
        setAnnouncementsList(formattedAnnouncements);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        setError('فشل في جلب الإعلانات. يرجى المحاولة مرة أخرى لاحقًا.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const openCreateDialog = () => setIsCreateDialogOpen(true);
  const closeCreateDialog = () => setIsCreateDialogOpen(false);

  const openDetailDialog = (announcementData) => {
    setSelectedAnnouncementData(announcementData);
    setIsDetailDialogOpen(true);
  };

  const closeDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedAnnouncementData(null);
  };

  const handleAnnouncementCreate = (newAnnouncementData) => {
    setAnnouncementsList(prevAnnouncements => [newAnnouncementData, ...prevAnnouncements]);
  };

  const handleAnnouncementUpdate = async (updatedAnnouncement) => {
    try {
      // Find the announcement to update to avoid losing information
      const originalAnnouncement = announcementsList.find(a => a.id === updatedAnnouncement.id)?.originalData || {};
      
      // Prepare data for API call - convert dates to ISO strings
      const startDate = updatedAnnouncement.startDate ? 
        (typeof updatedAnnouncement.startDate === 'string' ? new Date(updatedAnnouncement.startDate) : updatedAnnouncement.startDate).toISOString() :
        null;
        
      const endDate = updatedAnnouncement.endDate ? 
        (typeof updatedAnnouncement.endDate === 'string' ? new Date(updatedAnnouncement.endDate) : updatedAnnouncement.endDate).toISOString() :
        null;
      
      // Merge updated data with original data
      const announcementToUpdate = {
        ...originalAnnouncement,
        title: updatedAnnouncement.title,
        message: updatedAnnouncement.message,
        startDate,
        endDate,
        isActive: updatedAnnouncement.isActive,
        buttons: updatedAnnouncement.buttons
      };
      
      // Make sure we're using the MongoDB _id for the API call
      const announcementId = originalAnnouncement._id || updatedAnnouncement.id;
      console.log(`Updating announcement with ID: ${announcementId}, original _id: ${originalAnnouncement._id}`);
      
      // Update announcement on server
      const response = await updateAnnouncement(announcementId, announcementToUpdate);
      
      // Create updated announcement data for UI
      const updatedAnnouncementData = {
        id: updatedAnnouncement.id,
        title: updatedAnnouncement.title,
        message: updatedAnnouncement.message,
        startDate: startDate ? new Date(startDate).toLocaleDateString() : null,
        endDate: endDate ? new Date(endDate).toLocaleDateString() : null,
        isActive: updatedAnnouncement.isActive,
        buttons: updatedAnnouncement.buttons,
        authorName: selectedAnnouncementData.authorName,
        authorAvatar: selectedAnnouncementData.authorAvatar,
        createdAt: selectedAnnouncementData.createdAt,
        lastEditAt: new Date().toLocaleString(),
        originalData: response // Update original data too
      };
      
      // Update UI after successful update
      setAnnouncementsList(prevAnnouncements => prevAnnouncements.map(announcement => 
        announcement.id === updatedAnnouncement.id 
          ? updatedAnnouncementData
          : announcement
      ));
      
      // Update the selected announcement data to reflect changes in the detail dialog
      setSelectedAnnouncementData(updatedAnnouncementData);
      
      console.log('Announcement updated successfully:', response);
    } catch (error) {
      console.error('Error updating announcement:', error);
    }
  };

  const handleAnnouncementDelete = async (announcementId) => {
    try {
      // Find the announcement to get the original data with _id
      const announcementToDelete = announcementsList.find(a => a.id === announcementId);
      
      if (!announcementToDelete) {
        console.error('Announcement not found for deletion:', announcementId);
        return;
      }
      
      // Use the original MongoDB _id if available
      const idToDelete = announcementToDelete.originalData?._id || announcementId;
      console.log(`Deleting announcement with ID: ${idToDelete}`);
      
      // Delete announcement from server
      await deleteAnnouncement(idToDelete);
      
      // Remove announcement from UI
      setAnnouncementsList(prevAnnouncements => prevAnnouncements.filter(announcement => announcement.id !== announcementId));
      
      console.log('Announcement deleted successfully');
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  // Announcement icon SVG
  const AnnouncementIconSvg = () => (
    <svg className="announcement-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );

  return (
    <>
      <div className="announcements-container">
        {isLoading ? (
          <div className="loading-container">جاري تحميل الإعلانات...</div>
        ) : error ? (
          <div className="error-container">{error}</div>
        ) : (
          <div className="announcements-grid">
            {/* Map over announcementsList to render announcement cards dynamically */}
            {announcementsList.map(announcement => (
              <div className={`announcement-card ${!announcement.isActive ? 'inactive-announcement' : ''}`} key={announcement.id} onClick={() => openDetailDialog(announcement)}>
                <div className="announcement-header">
                  <AnnouncementIconSvg />
                  <h2 className="announcement-title">{announcement.title}</h2>
                </div>
                <div className="announcement-content">
                  <p className="announcement-message">{announcement.message}</p>
                  
                  {/* Display buttons preview if any */}
                  {announcement.buttons && announcement.buttons.length > 0 && (
                    <div className="announcement-buttons-preview">
                      {announcement.buttons.length === 1 ? (
                        <span className="button-count">1 Button</span>
                      ) : (
                        <span className="button-count">{announcement.buttons.length} Buttons</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="footer">
                  <div className="announcement-meta">
                    <div className="meta-item">
                      <span className="meta-label">Created at</span>
                      <span className="meta-value">{announcement.createdAt}</span>
                    </div>
                    {announcement.lastEditAt && (
                      <div className="meta-item">
                        <span className="meta-label">Last edit at</span>
                        <span className="meta-value">{announcement.lastEditAt}</span>
                      </div>
                    )}
                    {announcement.startDate && (
                      <div className="meta-item">
                        <span className="meta-label">Start date</span>
                        <span className="meta-value">{announcement.startDate}</span>
                      </div>
                    )}
                    {announcement.endDate && (
                      <div className="meta-item">
                        <span className="meta-label">End date</span>
                        <span className="meta-value">{announcement.endDate}</span>
                      </div>
                    )}
                    <div className="meta-item">
                      <span className="meta-label">Status</span>
                      <span className={`meta-value status-badge ${announcement.isActive ? 'active' : 'inactive'}`}>
                        {announcement.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="announcement-author">
                    <Image src={announcement.authorAvatar} alt={announcement.authorName} className="author-avatar" width={40} height={40} />
                    <span className="author-name">{announcement.authorName}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Create New Announcement Card */}
            <div className="create-announcement-card" onClick={openCreateDialog}>
              <svg className="create-announcement-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <line x1="12" y1="6" x2="12" y2="14"></line>
                <line x1="8" y1="10" x2="16" y2="10"></line>
              </svg>
              <h2 className="create-announcement-title">Create New Announcement</h2>
            </div>
          </div>
        )}
      </div>
      <CreateAnnouncementDialog 
        isOpen={isCreateDialogOpen} 
        onClose={closeCreateDialog} 
        onAnnouncementCreate={handleAnnouncementCreate}
      />
      <AnnouncementDetailDialog
        isOpen={isDetailDialogOpen}
        onClose={closeDetailDialog}
        announcementData={selectedAnnouncementData}
        onAnnouncementUpdate={handleAnnouncementUpdate}
        onAnnouncementDelete={handleAnnouncementDelete}
      />
    </>
  );
} 