'use client';

import { useChat } from './components/script';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import './styles/page.css';

const Emojies = [
    {
        id: 1,
        name: '🙏',
        emoji: '🙏'
    }
];

// Define EmojiPickerContent as a functional component here
const EmojiPickerContent = ({ emojis, selectedEmojiCategory, getCurrentCategoryEmojis, handleEmojiCategoryChange, onEmojiSelect }) => (
    <>
        <div className="emoji-categories">
            {emojis.map((category) => (
                <button
                    key={category.slug}
                    className={`emoji-category-btn ${selectedEmojiCategory === category.slug ? 'active' : ''}`}
                    onClick={() => handleEmojiCategoryChange(category.slug)}
                    title={category.name}
                >
                    {category.emojis[0]?.emoji} {/* Safe access emoji */}
                </button>
            ))}
        </div>
        <div className="emoji-grid">
            {getCurrentCategoryEmojis().map((emoji, index) => (
                <span
                    key={index}
                    className="emoji"
                    onClick={() => onEmojiSelect(emoji)} // Pass the full emoji object
                    title={emoji.name}
                >
                    {emoji.emoji}
                </span>
            ))}
        </div>
    </>
);

export default function Inbox() {
    const {
        // State
        messages,
        setMessages,
        currentChat,
        directMessages,
        showEmojiPicker,
        searchTerm,
        activeMessageMenu,
        showReplyContainer,
        replyInfo,
        emojis,
        selectedEmojiCategory,
        getCurrentCategoryEmojis,
        emojiPickerContext,
        reactionPopover,
        showForwardModal,
        forwardingMessage,
        showChatInfoPanel,
        activeChatInfoTab,
        showImageLightbox,
        lightboxImage,
        showAttachmentMenu,
        stagedFiles,
        selectedStagedImage,
        showPollModal,
        pollData,
        pollVotersPopover,
        editingMessage, // Add editingMessage here

        // Refs
        messageInputRef,
        messagesContainerRef,
        emojiPickerRef,
        fileUploadRef,
        reactionPopoverRef,
        messageDropdownRef,
        attachmentMenuButtonRef,
        attachmentMenuRef,

        // Functions
        handleChannelClick,
        handleMessageMenuClick,
        handleMessageAction,
        sendMessage,
        handleFileUpload,
        toggleEmojiPicker,
        addEmoji,
        handleSearch,
        setShowReplyContainer,
        setReplyInfo,
        handleEmojiCategoryChange,
        openFullEmojiPickerForReaction,
        setActiveMessageMenu,
        setShowEmojiPicker,
        setEmojiPickerContext,
        openReactionPopover,
        closeReactionPopover,
        handleReactionTabChange,
        openForwardModal,
        closeForwardModal,
        confirmForwardMessage,
        toggleChatInfoPanel,
        selectChatInfoTab,
        toggleMuteChat,
        openImageLightbox,
        closeImageLightbox,
        goToNextImageInLightbox,
        goToPreviousImageInLightbox,
        toggleAttachmentMenu,
        handleAttachmentOptionClick,
        removeStagedFile,
        handleSelectStagedImage,
        clearAllStagedFiles,
        handlePollQuestionChange,
        handlePollOptionChange,
        addPollOption,
        removePollOption,
        togglePollSetting,
        closePollModal,
        createPoll,
        handlePollVote,
        openPollVotersPopover,
        closePollVotersPopover,
        handlePollVotersTabChange,
        getVotedOptionsByUser,
        togglePinChat,
        setEditingMessage // Add setEditingMessage from useChat
    } = useChat();

    // State for managing selected recipients in the forward modal
    const [selectedForwardRecipients, setSelectedForwardRecipients] = useState([]);
    
    // State for delete confirmation modal
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState(null);
    
    // State for message selection
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // State for toast notification
    const [toast, setToast] = useState({ show: false, message: '' });
    
    // State for scroll to bottom button
    const [showScrollButton, setShowScrollButton] = useState(false);
    
    // State for image zoom in lightbox
    const [zoomLevel, setZoomLevel] = useState(1);
    
    // State for image drag when zoomed in
    const [isDragging, setIsDragging] = useState(false);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageBounds, setImageBounds] = useState({ width: 0, height: 0 });
    const lightboxImageRef = useRef(null);
    const lightboxContentRef = useRef(null);

    // State for members search
    const [membersSearchTerm, setMembersSearchTerm] = useState('');
    
    // Mock data for group members
    const getGroupMembers = () => {
        // Generate a consistent set of members for the current chat
        const owner = {
            id: 'owner',
            name: directMessages.get(currentChat)?.name.split(' ')[0] || 'Group Owner',
            avatar: directMessages.get(currentChat)?.avatar || 'https://i.pravatar.cc/150?img=30',
            role: 'Owner'
        };
        
        const admins = [
            {
                id: 'admin1',
                name: 'User 19',
                avatar: 'https://i.pravatar.cc/150?img=20',
                role: 'Admin'
            },
            {
                id: 'admin2',
                name: 'User 55',
                avatar: 'https://i.pravatar.cc/150?img=21',
                role: 'Admin'
            }
        ];
        
        const members = [
            {
                id: 'current_user',
                name: 'You (Current User)',
                avatar: 'https://i.pravatar.cc/150?img=4',
                role: 'Member'
            },
            {
                id: 'member1',
                name: 'User 12',
                avatar: 'https://i.pravatar.cc/150?img=25',
                role: 'Member'
            },
            {
                id: 'member2',
                name: 'User 6',
                avatar: 'https://i.pravatar.cc/150?img=32',
                role: 'Member'
            },
        ];
        
        return { owner, admins, members };
    };
    
    // Function to filter members based on search term
    const filterMembers = (members, searchTerm) => {
        if (!searchTerm) return members;
        
        const term = searchTerm.toLowerCase();
        return {
            owner: members.owner.name.toLowerCase().includes(term) ? members.owner : null,
            admins: members.admins.filter(admin => admin.name.toLowerCase().includes(term)),
            members: members.members.filter(member => member.name.toLowerCase().includes(term))
        };
    };
    
    // Get all members and filter them based on search term
    const allMembers = getGroupMembers();
    const filteredMembers = filterMembers(allMembers, membersSearchTerm);
    
    // Calculate total members count
    const totalMembersCount = 
        (allMembers.owner ? 1 : 0) + 
        allMembers.admins.length + 
        allMembers.members.length;
    
    // Function for handling members search
    const handleMembersSearch = (e) => {
        setMembersSearchTerm(e.target.value);
    };

    // Function to show toast notification
    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => {
            setToast({ show: false, message: '' });
        }, 2000);
    };

    // Function to prepare image list for lightbox from messages
    const getImageListFromMessages = () => {
        return messages
            .filter(msg => msg.isFile && msg.fileType && msg.fileType.startsWith('image/') && msg.fileDataUrl)
            .map(msg => ({ src: msg.fileDataUrl, name: msg.fileName }));
    };

    // Reset textarea height to default
    const resetTextareaHeight = () => {
        if (messageInputRef.current) {
            messageInputRef.current.style.height = 'auto';
        }
    };

    // Auto-resize textarea based on content
    const autoResizeTextarea = () => {
        if (messageInputRef.current) {
            resetTextareaHeight();
            messageInputRef.current.style.height = messageInputRef.current.scrollHeight + 'px';
        }
    };

    // Handle message input
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = messageInputRef.current.value.trim();
            if (message) {
                sendMessage(message);
                resetTextareaHeight(); // Reset height after sending
            }
        }
    };
    
    // Toggle message selection
    const toggleMessageSelection = (messageId) => {
        setSelectedMessages(prevSelected => {
            const isAlreadySelected = prevSelected.includes(messageId);
            
            if (isAlreadySelected) {
                // If message is already selected, remove it from selection
                const newSelected = prevSelected.filter(id => id !== messageId);
                if (newSelected.length === 0) {
                    setIsSelectionMode(false); // Exit selection mode if no messages selected
                }
                return newSelected;
            } else {
                // If message is not selected, add it to selection
                setIsSelectionMode(true); // Enter selection mode
                return [...prevSelected, messageId];
            }
        });
        setActiveMessageMenu(null); // Close dropdown
    };
    
    // Select a message from dropdown menu
    const handleSelectMessage = (message) => {
        toggleMessageSelection(message.id);
    };
    
    // Clear all selected messages
    const clearSelectedMessages = () => {
        setSelectedMessages([]);
        setIsSelectionMode(false);
    };
    
    // Delete selected messages
    const deleteSelectedMessages = () => {
        if (selectedMessages.length === 0) return;
        
        // Use the setMessages function from useChat
        setMessages(prevMessages => 
            prevMessages.filter(message => !selectedMessages.includes(message.id))
        );
        
        // Clear selection after deletion
        clearSelectedMessages();
        
        // Close delete confirmation modal
        setShowDeleteConfirmModal(false);
    };
    
    // Forward selected messages
    const forwardSelectedMessages = () => {
        // For now, we'll just forward the first selected message
        // In a real implementation, you might want to forward all selected messages
        if (selectedMessages.length > 0) {
            const messageToForward = messages.find(msg => msg.id === selectedMessages[0]);
            if (messageToForward) {
                openForwardModal(messageToForward);
            }
        }
    };

    // Reset selected recipients when the forward modal opens
    useEffect(() => {
        if (showForwardModal) {
            setSelectedForwardRecipients([]);
            // Clear any existing checked states from checkboxes manually if needed, 
            // though re-rendering based on state should ideally handle this.
            const checkboxes = document.querySelectorAll('input[name="forwardRecipients"]');
            checkboxes.forEach(cb => cb.checked = false);
        }
    }, [showForwardModal]);

    // Function to show delete confirmation
    const showDeleteConfirmation = (message) => {
        setMessageToDelete(message);
        setShowDeleteConfirmModal(true);
        setActiveMessageMenu(null); // Close dropdown menu
    };

    // Copy selected messages to clipboard
    const copySelectedMessages = () => {
        if (selectedMessages.length === 0) return;
        
        // Find all selected messages and extract their content
        const selectedMessageContents = messages
            .filter(message => selectedMessages.includes(message.id))
            .map(message => {
                // Format the message with sender and content
                const sender = message.sender;
                
                // Handle different message types
                let content = '';
                if (message.isPoll) {
                    content = `Poll: ${message.pollData.question}`;
                } else if (message.isFile) {
                    content = message.fileName + (message.content ? `: ${message.content}` : '');
                } else {
                    content = message.content || '';
                }
                
                return `${sender}: ${content}`;
            })
            .join('\n\n'); // Separate messages with new lines
        
        // Copy to clipboard
        navigator.clipboard.writeText(selectedMessageContents)
            .then(() => {
                // Show toast notification
                showToast(`${selectedMessages.length} message${selectedMessages.length > 1 ? 's' : ''} copied to clipboard`);
            })
            .catch(err => {
                console.error('Failed to copy messages: ', err);
                showToast('Failed to copy messages');
            });
    };

    // Function to scroll to original message when reply is clicked
    const scrollToOriginalMessage = (replyToMessageId) => {
        if (!replyToMessageId) return;
        
        // Find the message element by ID
        const messageElement = document.getElementById(`message-${replyToMessageId}`);
        if (messageElement) {
            // Scroll the message into view
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Highlight the message temporarily
            messageElement.classList.add('message-highlight');
            setTimeout(() => {
                messageElement.classList.remove('message-highlight');
            }, 2000);
            
            // Show a toast notification
            showToast('Scrolled to original message');
        } else {
            // Message not found
            showToast('Original message not found');
        }
    };

    // State for channel tabs
    const [activeChannelTab, setActiveChannelTab] = useState('direct'); // 'direct' or 'news'

    // State for active member menu
    const [activeMemberMenu, setActiveMemberMenu] = useState(null);
    const memberMenuRef = useRef(null);

    // Function to handle channel tab clicks
    const handleChannelTabClick = (tabName) => {
        setActiveChannelTab(tabName);
    };

    // Handle member menu click
    const handleMemberMenuClick = (e, memberId) => {
        e.stopPropagation(); // Prevent parent click events
        setActiveMemberMenu(prev => prev === memberId ? null : memberId);
    };

    // Handle member action
    const handleMemberAction = (action, member) => {
        switch(action) {
            case 'makeAdmin':
                // Here you would implement the logic to make a member an admin
                showToast(`${member.name} is now an admin`);
                break;
            case 'removeAdmin':
                // Here you would implement the logic to remove admin rights
                showToast(`${member.name} is no longer an admin`);
                break;
            case 'message':
                // Logic to open a direct message with this member
                handleChannelClick('direct-' + member.id);
                toggleChatInfoPanel(); // Close the info panel
                break;
            default:
                break;
        }
        setActiveMemberMenu(null); // Close the menu after action
    };

    // Close member menu when clicking outside
    useEffect(() => {
        const handleClickOutsideMemberMenu = (event) => {
            if (activeMemberMenu !== null && 
                memberMenuRef.current && 
                !memberMenuRef.current.contains(event.target)) {
                setActiveMemberMenu(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutsideMemberMenu);
        return () => {
            document.removeEventListener("mousedown", handleClickOutsideMemberMenu);
        };
    }, [activeMemberMenu]);

    return (
        <div className="chat-container">
            {/* Channels Sidebar */}
            <div className="channels-sidebar">
                <div className="channels-header">
                    <div className="channel-tabs">
                        <button 
                            className={`channel-tab ${activeChannelTab === 'direct' ? 'active' : ''}`}
                            onClick={() => handleChannelTabClick('direct')}
                        >
                            <svg className="tab-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span>Direct</span>
                        </button>
                        <button 
                            className={`channel-tab ${activeChannelTab === 'news' ? 'active' : ''}`}
                            onClick={() => handleChannelTabClick('news')}
                        >
                            <svg className="tab-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span>Groups</span>
                        </button>
                    </div>
                </div>
                {activeChannelTab === 'direct' && (
                    <div className="search-bar">
                        <i className="fas fa-search"></i>
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                        />
                    </div>
                )}
                <div className="channels-list">
                    {activeChannelTab === 'direct' ? (
                        // Direct Messages Tab Content - Show individual chats and pinned admin news
                        (() => {
                            // Create array from Map entries
                            const directMessagesArray = Array.from(directMessages.entries());
                            
                            // Filter to show only direct messages and the admin news group
                            const filteredMessages = directMessagesArray.filter(([userId, userData]) => 
                                !userData.isGroup || userId === 'admin-news' // Always show admin news
                            );
                            
                            // Sort: pinned items first, then by latest message time
                            const sortedMessages = filteredMessages.sort((a, b) => {
                                // Check if either is pinned - pinned items come first
                                if (a[1].isPinned && !b[1].isPinned) return -1;
                                if (!a[1].isPinned && b[1].isPinned) return 1;
                                // Then sort by other criteria (could be last message time or anything else)
                                return 0;
                            });

                            return sortedMessages.map(([userId, userData]) => (
                                <div 
                                    key={userId}
                                    className={`channel-item ${userId === currentChat ? 'active' : ''} ${userData.isPinned ? 'pinned' : ''}`}
                                    onClick={() => handleChannelClick(userId)}
                                    data-user-id={userId}
                                    data-has-unread={userData.unread > 0 ? 'true' : 'false'}
                                >
                                    <div className="channel-avatar">
                                        <img src={userData.avatar} alt={userData.name} />
                                        <span className={`channel-status ${userData.status}`}></span>
                                    </div>
                                    <div className="channel-info">
                                        <div className="channel-name">
                                            {userData.isPinned && <span className="pin-indicator">⭐</span>} {userData.name}
                                        </div>
                                        <div className="channel-preview">{userData.lastMessage}</div>
                                    </div>
                                    <div className="channel-meta">
                                        <span className="channel-time">{userData.lastTime}</span>
                                        {userData.unread > 0 && (
                                            <span className="below-time-badge">{userData.unread}</span>
                                        )}
                                    </div>
                                </div>
                            ));
                        })()
                    ) : (
                        // Groups Tab Content - Show course groups
                        [
                            {
                                id: 'course-1',
                                name: 'Computer Science',
                                avatar: 'https://i.pravatar.cc/150?img=8',
                                subgroups: [
                                    { id: 'cs-lectures', name: 'Lectures', icon: 'lecture', unread: 2, lastMessage: 'Next lecture will cover neural networks', time: '10:30' },
                                    { id: 'cs-sections', name: 'Sections', icon: 'section', lastMessage: 'Assignment 3 solutions', time: '14:15' },
                                    { id: 'cs-admin', name: 'Admin', icon: 'admin', unread: 3, lastMessage: 'Midterm grades released', time: '09:45' }
                                ]
                            },
                            {
                                id: 'course-2',
                                name: 'Mathematics',
                                avatar: 'https://i.pravatar.cc/150?img=9',
                                subgroups: [
                                    { id: 'math-lectures', name: 'Lectures', icon: 'lecture', lastMessage: 'Chapter 5 material uploaded', time: '15:20' },
                                    { id: 'math-sections', name: 'Sections', icon: 'section', unread: 1, lastMessage: 'Tutorial session tomorrow', time: '11:50' },
                                    { id: 'math-admin', name: 'Admin', icon: 'admin', lastMessage: 'Exam room announced', time: 'Yesterday' }
                                ]
                            },
                            {
                                id: 'course-3',
                                name: 'Engineering Physics',
                                avatar: 'https://i.pravatar.cc/150?img=12',
                                subgroups: [
                                    { id: 'phys-lectures', name: 'Lectures', icon: 'lecture', unread: 4, lastMessage: 'Lecture slides available', time: '16:05' },
                                    { id: 'phys-sections', name: 'Sections', icon: 'section', lastMessage: 'Lab report template', time: 'Today' },
                                    { id: 'phys-admin', name: 'Admin', icon: 'admin', lastMessage: 'Course syllabus updated', time: 'Yesterday' }
                                ]
                            }
                        ].map((course) => (
                            <div key={course.id} className="course-group-container">
                                <div className="course-header">
                                    <div className="course-avatar">
                                        <img src={course.avatar} alt={course.name} />
                                    </div>
                                    <div className="course-name">
                                        {course.name}
                                    </div>
                                </div>
                                <div className="subgroups-list">
                                    {course.subgroups.map((subgroup) => (
                                        <div 
                                            key={subgroup.id} 
                                            className={`channel-item subgroup-item ${subgroup.id === currentChat ? 'active' : ''}`}
                                            onClick={() => handleChannelClick(subgroup.id)}
                                            data-has-unread={subgroup.unread > 0 ? 'true' : 'false'}
                                        >
                                            <div className="channel-avatar subgroup-avatar">
                                                {subgroup.icon === 'lecture' && (
                                                    <svg className="subgroup-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="8" r="7"></circle>
                                                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                                                    </svg>
                                                )}
                                                {subgroup.icon === 'section' && (
                                                    <svg className="subgroup-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                                    </svg>
                                                )}
                                                {subgroup.icon === 'admin' && (
                                                    <svg className="subgroup-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                        <circle cx="8.5" cy="7" r="4"></circle>
                                                        <polyline points="17 11 19 13 23 9"></polyline>
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="channel-info subgroup-info">
                                                <div className="channel-name">{subgroup.name}</div>
                                                <div className="channel-preview">{subgroup.lastMessage}</div>
                                            </div>
                                            <div className="channel-meta">
                                                <span className="channel-time">{subgroup.time}</span>
                                                {subgroup.unread > 0 && (
                                                    <span className="below-time-badge">{subgroup.unread}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="chat-area">
                {currentChat ? (
                    <>
                        <div className="chat-header">
                            <div className="chat-user-info">
                                <div className="chat-user-avatar">
                                    <img src={directMessages.get(currentChat)?.avatar} alt="User Avatar" />
                                    <span className={`chat-user-status ${directMessages.get(currentChat)?.status}`}></span>
                                </div>
                                <div className="chat-user-details">
                                    <span className="chat-user-name">{directMessages.get(currentChat)?.name}</span>
                                    <span className="chat-user-status-text">{directMessages.get(currentChat)?.status}</span>
                                </div>
                            </div>
                            <div className="chat-header-actions">
                                {/* Add other actions here if needed, like video call, search in chat etc. */}
                                <button onClick={toggleChatInfoPanel} className="chat-header-action-btn" title="Chat Info">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="1"></circle>
                                        <circle cx="19" cy="12" r="1"></circle>
                                        <circle cx="5" cy="12" r="1"></circle>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        {/* Bulk Actions Bar - Only visible when in selection mode */}
                        {isSelectionMode && (
                            <div className="bulk-actions-bar">
                                <div className="selection-info">
                                    <span>{selectedMessages.length} selected</span>
                                    <button onClick={clearSelectedMessages} className="clear-selection-btn">
                                        Cancel
                                    </button>
                                </div>
                                <div className="bulk-actions">
                                    <button onClick={copySelectedMessages} className="bulk-action-btn" disabled={selectedMessages.length === 0}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                                        </svg>
                                        Copy
                                    </button>
                                    <button onClick={forwardSelectedMessages} className="bulk-action-btn" disabled={selectedMessages.length === 0}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <g>
                                                <path d="m23.772 10.462-8.5-8.25a.752.752 0 0 0-.814-.153.752.752 0 0 0-.458.691v4.252C6.257 7.136 0 13.476 0 21.25c0 .342.241.622.572.708a.715.715 0 0 0 .177.022.788.788 0 0 0 .678-.404A12.754 12.754 0 0 1 12.582 15H14v4.25c0 .301.181.573.458.691a.752.752 0 0 0 .814-.153l8.5-8.25a.747.747 0 0 0 0-1.076z"></path>
                                            </g>
                                        </svg>
                                        Forward
                                    </button>
                                    <button onClick={() => showDeleteConfirmation(null)} className="bulk-action-btn delete-btn" disabled={selectedMessages.length === 0}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            <line x1="10" y1="11" x2="10" y2="17"></line>
                                            <line x1="14" y1="11" x2="14" y2="17"></line>
                                        </svg>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className={`messages-container ${isSelectionMode ? 'selection-mode' : ''}`} 
                            ref={messagesContainerRef}
                            onScroll={() => {
                                if (messagesContainerRef.current) {
                                    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
                                    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
                                    setShowScrollButton(distanceFromBottom > 100);
                                }
                            }}
                        >
                            
                            {/* Scroll to bottom button */}
                            {showScrollButton && (
                                <button 
                                    className="scroll-to-bottom-btn"
                                    onClick={() => {
                                        if (messagesContainerRef.current) {
                                            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                                        }
                                    }}
                                    title="Scroll to latest messages"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </button>
                            )}
                            
                            {messages.map((message) => (
                                <div 
                                    key={message.id}
                                    id={`message-${message.id}`}
                                    className={`message ${message.sender === 'You' ? 'outgoing' : 'incoming'} ${message.isFile ? 'message-file' : ''} ${selectedMessages.includes(message.id) ? 'selected' : ''} ${message.isNew ? 'new-message-animation' : ''}`}
                                    onClick={() => isSelectionMode && toggleMessageSelection(message.id)}
                                    onContextMenu={(e) => {
                                        e.preventDefault(); // منع سلوك النقر بزر الماوس الأيمن الافتراضي
                                        handleMessageMenuClick(e, message.id); // استدعاء نفس الوظيفة المستخدمة مع زر القائمة
                                        return false; // تأكيد إيقاف السلوك الافتراضي
                                    }}
                                >
                                    <div className="message-avatar">
                                        <img src={message.avatar} alt={message.sender} />
                                        {/* Add a selection indicator that's visible when in selection mode */}
                                        {isSelectionMode && (
                                            <div className="message-selection-indicator">
                                                <div className={`selection-checkbox ${selectedMessages.includes(message.id) ? 'checked' : ''}`}>
                                                    {selectedMessages.includes(message.id) && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="message-content">
                                        <div className="message-header">
                                            {message.sender === 'You' ? '' : <span className="message-author">{message.sender}</span>}
                                            <span className="message-time">{message.timestamp}</span>
                                            {message.isEdited && <span className="message-edited-indicator">(edited)</span>}
                                        </div>
                                        {message.isReply && message.replyTo && (<>
                                                {message.replyTo.isFile && message.replyTo.fileType && message.replyTo.fileType.startsWith('image/') && message.replyTo.fileDataUrl ? (
                                                    <div 
                                                        className="reply-file-preview" 
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent toggling selection if in selection mode
                                                            scrollToOriginalMessage(message.replyTo.originalMessageId);
                                                        }}
                                                        style={{ cursor: 'pointer' }}
                                                        title="Click to view original message"
                                                    >
                                                        <div className="img-container">
                                                            <img src={message.replyTo.fileDataUrl} alt={message.replyTo.fileName} className="reply-image-preview" />
                                                        </div>
                                                        <div className="reply-text">
                                                            <span className="reply-author">{message.replyTo.author}</span>
                                                            <span>{message.replyTo.text || ''}</span>
                                                        </div>
                                                    </div>
                                                ) : message.replyTo.isFile ? (
                                                    <div 
                                                        className="reply-file-info"
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent toggling selection if in selection mode
                                                            scrollToOriginalMessage(message.replyTo.originalMessageId);
                                                        }}
                                                        style={{ cursor: 'pointer' }}
                                                        title="Click to view original message"
                                                    >
                                                        <div className="reply-file-icon">
                                                            <svg className="file-type-icon generic" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                                                <polyline points="13 2 13 9 20 9"></polyline>
                                                            </svg>
                                                        </div>
                                                        <div className="reply-text">
                                                            <span className="reply-author">{message.replyTo.author}</span>
                                                            <span>{message.replyTo.text || ''}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div 
                                                        className="reply-preview"
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent toggling selection if in selection mode
                                                            scrollToOriginalMessage(message.replyTo.originalMessageId);
                                                        }}
                                                        style={{ cursor: 'pointer' }}
                                                        title="Click to view original message"
                                                    >
                                                        <span className="reply-text">
                                                            <span className="reply-author">{message.replyTo.author}</span>
                                                            <span>{message.replyTo.text}</span>
                                                        </span>
                                                    </div>
                                                )}
                                        </>)}

                                        {/* Conditional rendering for different message types */}
                                        {message.isPoll ? (
                                            <div className="poll-container">
                                                <div className="poll-header">
                                                    <div className="poll-question">{message.pollData.question}</div>
                                                </div>
                                                <div className="poll-options">
                                                    {message.pollData.options.map((option, index) => {
                                                        // Determinar si esta opción está seleccionada basándose en si el mensaje es del usuario actual
                                                        const isOptionSelected = option.votes && Array.isArray(option.votes) && 
                                                                              option.votes.some(vote => vote === 'You' || (vote.id && vote.id === 'current_user_id_placeholder'));
                                                        
                                                        return (
                                                            <div 
                                                                key={index} 
                                                                className={`poll-option ${isOptionSelected ? 'selected' : ''}`}
                                                                onClick={() => {
                                                                    // Usar la nueva función para manejar el voto
                                                                    handlePollVote(message.id, index);
                                                                    console.log(`Voted for option: ${option.text}`);
                                                                }}
                                                            >
                                                                <div 
                                                                    className="poll-progress-bar" 
                                                                    style={{ width: `${message.pollData.totalVotes > 0 ? ((option.votes?.length || 0) / message.pollData.totalVotes) * 100 : 0}%` }}
                                                                ></div>
                                                                <div className="poll-option-text">{option.text}</div>
                                                                <div className="poll-option-percent">
                                                                    {message.pollData.totalVotes > 0 
                                                                        ? Math.round(((option.votes?.length || 0) / message.pollData.totalVotes) * 100) 
                                                                        : 0}%
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="poll-footer">
                                                    <div className="poll-total-votes">
                                                        {message.pollData.totalVotes} {message.pollData.totalVotes === 1 ? 'vote' : 'votes'}
                                                        {message.pollData.totalVotes > 0 && (
                                                            <button 
                                                                className="view-poll-voters-btn" 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openPollVotersPopover(message.id, e.currentTarget);
                                                                }}
                                                            >
                                                                View Voters
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Poll Voters Popover */}
                                                {pollVotersPopover.show && pollVotersPopover.messageId === message.id && (
                                                    (() => {
                                                        const anchorEl = pollVotersPopover.anchorEl;
                                                        const messageEl = anchorEl.closest('.message');
                                                        
                                                        if (!messageEl) {
                                                            return null;
                                                        }
                                                        
                                                        const messageRect = messageEl.getBoundingClientRect();
                                                        const anchorRect = anchorEl.getBoundingClientRect();
                                                        
                                                        let popoverStyleProps = {
                                                            position: 'absolute',
                                                            top: `${(anchorRect.bottom - messageRect.top) + 5}px`,
                                                            left: '0px',
                                                            right: '0px',
                                                            width: 'auto',
                                                            zIndex: 1050,
                                                        };
                                                        
                                                        return (
                                                            <div
                                                                className="poll-voters-popover"
                                                                style={popoverStyleProps}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <div className="poll-voters-header">
                                                                    <h3>Poll Voters</h3>
                                                                    <button 
                                                                        className="close-popover-btn" 
                                                                        onClick={closePollVotersPopover} 
                                                                        title="Close"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                                <div className="poll-voters-tabs">
                                                                    <button
                                                                        className={`poll-voters-tab ${pollVotersPopover.activeTab === 'All' ? 'active' : ''}`}
                                                                        onClick={() => handlePollVotersTabChange('All')}
                                                                    >
                                                                        All ({pollVotersPopover.voters.length})
                                                                    </button>
                                                                    {pollVotersPopover.options.map(option => (
                                                                        <button
                                                                            key={option.index}
                                                                            className={`poll-voters-tab ${pollVotersPopover.activeTab === option.index.toString() ? 'active' : ''}`}
                                                                            onClick={() => handlePollVotersTabChange(option.index.toString())}
                                                                        >
                                                                            {option.text.length > 15 ? option.text.substring(0, 15) + '...' : option.text} ({option.voteCount})
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                
                                                                <div className="poll-voters-body">
                                                                    {pollVotersPopover.filteredVoters.length > 0 ? (
                                                                        <ul className="poll-voters-list">
                                                                            {pollVotersPopover.filteredVoters.map((item, index) => {
                                                                                const voter = typeof item.voter === 'string' ? { name: item.voter } : item.voter;
                                                                                return (
                                                                                    <li key={index} className="poll-voter-item">
                                                                                        <div className="poll-voter-avatar-container">
                                                                                            <img 
                                                                                                src={voter.avatar || `https://i.pravatar.cc/150?u=${voter.name || index}`} 
                                                                                                alt={voter.name || 'Unknown user'} 
                                                                                                className="poll-voter-avatar" 
                                                                                            />
                                                                                        </div>
                                                                                        <div className="poll-voter-info">
                                                                                            <span className="poll-voter-name">{voter.name || 'Unknown user'}</span>
                                                                                            <span className="poll-voter-option">
                                                                                                Voted for: {item.optionText}
                                                                                            </span>
                                                                                        </div>
                                                                                    </li>
                                                                                );
                                                                            })}
                                                                        </ul>
                                                                    ) : (
                                                                        <p className="no-voters-message">No votes for this option.</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })()
                                                )}
                                            </div>
                                        ) : message.isFile ? (
                                            // File message rendering (existing code)
                                            message.fileType && message.fileType.startsWith('image/') && message.fileDataUrl ? (
                                                // Only show image preview for image files with a data URL
                                                <div className="message-text image-only-preview">
                                                    <div 
                                                        className="file-image-preview-container clickable-image" 
                                                        onClick={() => {
                                                            const allMessageImages = getImageListFromMessages();
                                                            openImageLightbox(message.fileDataUrl, message.fileName, allMessageImages);
                                                        }}
                                                        title="View image"
                                                    >
                                                        <img src={message.fileDataUrl} alt={message.fileName} className="file-image-preview" />
                                                    </div>
                                                    {message.content && (
                                                        <div className="message-file-text">
                                                            {message.content.split('\n').map((line, index) => (
                                                                <span key={`img-line-${index}`} className="message-line">
                                                                    {line || ' '}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                // Show full file details for non-image files or images without a data URL
                                                <div className="message-text"> 
                                                    <div className="file-details-container">
                                                        <div className="file-icon-container">
                                                            {message.fileType && message.fileType.startsWith('image/') ? ( // Still show image icon if it's an image but no preview
                                                                <svg className="file-type-icon image" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                                    <polyline points="21 15 16 10 5 21"></polyline>
                                                                </svg>
                                                            ) : (
                                                                <svg className="file-type-icon generic" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                                                    <polyline points="13 2 13 9 20 9"></polyline>
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div className="file-meta-container">
                                                            <div className="file-name">{message.fileName}</div>
                                                            <div className="file-size">{message.fileSize}</div>
                                                        </div>
                                                    </div>
                                                    {message.content && (
                                                        <div className="message-file-text">
                                                            {message.content.split('\n').map((line, index) => (
                                                                <span key={`file-line-${index}`} className="message-line">
                                                                    {line || ' '}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        ) : (
                                            // Regular text message (existing code)
                                            message.content && (
                                                <div className="message-text">
                                                    {message.content.split('\n').map((line, index) => (
                                                        <span key={index} className="message-line">
                                                            {line || ' '}
                                                        </span>
                                                    ))}
                                                </div>
                                            )
                                        )}

                                        {/* عرض الرياكشنات أسفل الرسالة */}
                                        {message.reactions && message.reactions.length > 0 && (
                                            <div className="message-reactions">
                                                {message.reactions.map((reaction, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="reaction-emoji"
                                                        onClick={(e) => openReactionPopover(message, e.currentTarget, reaction.emoji)}
                                                        title={`${reaction.users.length} ${reaction.users.length === 1 ? 'reaction' : 'reactions'}`}
                                                    >
                                                        {reaction.emoji}
                                                        {reaction.users && reaction.users.length > 0 && (
                                                            <span className="reaction-count">{reaction.users.length}</span>
                                                        )}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Reaction Details Popover - MOVED HERE */}
                                        {reactionPopover.show && reactionPopover.messageId === message.id && reactionPopover.anchorEl && (
                                            (() => {
                                                const anchorEl = reactionPopover.anchorEl;
                                                const messageEl = anchorEl.closest('.message');

                                                if (!messageEl) {
                                                    return null;
                                                }

                                                const messageRect = messageEl.getBoundingClientRect();
                                                const anchorRect = anchorEl.getBoundingClientRect();

                                                let popoverStyleProps = {
                                                    position: 'absolute',
                                                    top: `${(anchorRect.bottom - messageRect.top) + 5}px`,
                                                    left: '0px',      // Set left to 0
                                                    right: '0px',     // Set right to 0
                                                    width: 'auto',    // Allow width to be determined by left/right
                                                    zIndex: 1050,
                                                };
                                                
                                                // No need for sender-based logic for left/right anymore
                                                
                                                return (
                                                    <div
                                                        className="reaction-details-popover"
                                                        ref={reactionPopoverRef}
                                                        style={popoverStyleProps}
                                                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside popover
                                                    >
                                                        <div className="reaction-popover-tabs">
                                                            <button
                                                                key="All"
                                                                className={`reaction-popover-tab ${reactionPopover.activeReactionTab === 'All' ? 'active' : ''}`}
                                                                onClick={() => handleReactionTabChange('All')}
                                                            >
                                                                All {reactionPopover.allReactionsForMessage.reduce((total, reaction) => total + reaction.users.length, 0)}
                                                            </button>
                                                            {reactionPopover.distinctEmojisForPopover.map(tabInfo => (
                                                                <button
                                                                    key={tabInfo.emoji}
                                                                    className={`reaction-popover-tab ${reactionPopover.activeReactionTab === tabInfo.emoji ? 'active' : ''}`}
                                                                    onClick={() => handleReactionTabChange(tabInfo.emoji)}
                                                                    title={tabInfo.emoji}
                                                                >
                                                                    {tabInfo.emoji} {tabInfo.count}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <div className="reaction-popover-body">
                                                            <ul className="reaction-users-list">
                                                                {reactionPopover.usersForActiveTab.map(user => (
                                                                    <li key={user.id + (user.reactedEmoji || '')} className="reaction-user-item">
                                                                        {user.avatar && <img src={user.avatar} alt={user.name} className="reaction-user-avatar" />}
                                                                        <span className="reaction-user-name">{user.name}</span>
                                                                        {reactionPopover.activeReactionTab === 'All' && user.reactedEmoji && (
                                                                            <span className="reaction-user-emoji">{user.reactedEmoji}</span>
                                                                        )}
                                                                    </li>
                                                                ))}
                                                                {reactionPopover.usersForActiveTab.length === 0 && (
                                                                    <li className="no-reactions-message">No reactions for this emoji.</li>
                                                                )}
                                                            </ul>
                                                        </div>
                                                         <button className="close-popover-btn" onClick={closeReactionPopover} title="Close">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                );
                                            })() // End of IIFE
                                        )}

                                        <div className={`message-actions-menu ${activeMessageMenu === message.id ? 'active' : ''}`}>
                                            <button 
                                                className="message-menu-btn" 
                                                title="More"
                                                onClick={(e) => handleMessageMenuClick(e, message.id)}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="5" r="1.5"/>
                                                    <circle cx="12" cy="12" r="1.5"/>
                                                    <circle cx="12" cy="19" r="1.5"/>
                                                </svg>
                                            </button>
                                            {activeMessageMenu === message.id && (
                                                <div 
                                                    className="message-dropdown-menu"
                                                    ref={messageDropdownRef} // Attach the ref
                                                    onClick={(e) => e.stopPropagation()} // Prevent click propagation
                                                >
                                                    <div className="dropdown-item" onClick={() => handleSelectMessage(message)}>
                                                        <span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                                <path d="M9 12l2 2 4-4"></path>
                                                            </svg>
                                                        </span>
                                                        select
                                                    </div>
                                                    <div className="dropdown-item" onClick={() => handleMessageAction('reply', message)}>
                                                        <span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                                <g>
                                                                    <path d="M7.707 3.293a1 1 0 0 1 0 1.414L5.414 7H11a7 7 0 0 1 7 7v2a1 1 0 0 1-2 0v-2a5 5 0 0 0-5-5H5.414l2.293 2.293a1 1 0 1 1-1.414 1.414l-4-4a1 1 0 0 1 0-1.414l4-4a1 1 0 0 1 1.414 0z"></path>
                                                                </g>
                                                            </svg>
                                                        </span>
                                                        reply
                                                    </div>
                                                    <div className="dropdown-item" onClick={() => handleMessageAction('copy', message)}>
                                                        <span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                                <g>
                                                                    <path d="M271 512H80c-44.113 0-80-35.887-80-80V161c0-44.113 35.887-80 80-80h191c44.113 0 80 35.887 80 80v271c0 44.113-35.887 80-80 80zM80 121c-22.055 0-40 17.945-40 40v271c0 22.055 17.945 40 40 40h191c22.055 0 40-17.945 40-40V161c0-22.055-17.945-40-40-40zm351 261V80c0-44.113-35.887-80-80-80H129c-11.047 0-20 8.953-20 20s8.953 20 20 20h222c22.055 0 40 17.945 40 40v302c0 11.047 8.953 20 20 20s20-8.953 20-20zm0 0"></path>
                                                                </g>
                                                            </svg>
                                                        </span>
                                                        copy
                                                    </div>
                                                    <div className="dropdown-item" onClick={() => openForwardModal(message)}>
                                                        <span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                                                <g>
                                                                    <path d="m23.772 10.462-8.5-8.25a.752.752 0 0 0-.814-.153.752.752 0 0 0-.458.691v4.252C6.257 7.136 0 13.476 0 21.25c0 .342.241.622.572.708a.715.715 0 0 0 .177.022.788.788 0 0 0 .678-.404A12.754 12.754 0 0 1 12.582 15H14v4.25c0 .301.181.573.458.691a.752.752 0 0 0 .814-.153l8.5-8.25a.747.747 0 0 0 0-1.076z"></path>
                                                                </g>
                                                            </svg>
                                                        </span>
                                                        forward
                                                    </div>
                                                    {message.sender === 'You' && (
                                                        <div className="dropdown-item" onClick={() => handleMessageAction('edit', message)}>
                                                            <span>
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                                </svg>
                                                            </span>
                                                            edit
                                                        </div>
                                                    )}
                                                    {message.sender === 'You' && (
                                                        <div className="dropdown-item" onClick={() => showDeleteConfirmation(message)}>
                                                            <span>
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                                                </svg>
                                                            </span>
                                                            delete
                                                        </div>
                                                    )}
                                                    <div className="dropdown-divider"></div>
                                                    <div className="dropdown-emojis">
                                                        {/* Quick reactions */}
                                                        <span className="emoji" onClick={() => handleMessageAction('emoji', { ...message, emoji: '🙏' })}>🙏</span>
                                                        <span className="emoji" onClick={() => handleMessageAction('emoji', { ...message, emoji: '😢' })}>😢</span>
                                                        <span className="emoji" onClick={() => handleMessageAction('emoji', { ...message, emoji: '😮' })}>😮</span>
                                                        <span className="emoji" onClick={() => handleMessageAction('emoji', { ...message, emoji: '😂' })}>😂</span>
                                                        <span className="emoji" onClick={() => handleMessageAction('emoji', { ...message, emoji: '❤️' })}>❤️</span>
                                                        <span className="emoji" onClick={() => handleMessageAction('emoji', { ...message, emoji: '👍' })}>👍</span>
                                                        <span 
                                                            className="emoji open-full-picker-btn"
                                                            onClick={(e) => openFullEmojiPickerForReaction(message, e)} // Pass event
                                                            title="More reactions"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <circle cx="12" cy="12" r="10"></circle>
                                                                <line x1="12" y1="8" x2="12" y2="16"></line>
                                                                <line x1="8" y1="12" x2="16" y2="12"></line>
                                                            </svg>
                                                        </span>
                                                    </div>
                                                    {/* Emoji picker for reactions, positioned by CSS relative to this dropdown */}
                                                    {showEmojiPicker && emojiPickerContext?.mode === 'reaction' && emojiPickerContext?.message?.id === message.id && (
                                                        <div className="emoji-picker emoji-picker-reaction" ref={emojiPickerRef} onClick={(e) => e.stopPropagation()}>
                                                            <EmojiPickerContent
                                                                emojis={emojis}
                                                                selectedEmojiCategory={selectedEmojiCategory}
                                                                getCurrentCategoryEmojis={getCurrentCategoryEmojis}
                                                                handleEmojiCategoryChange={handleEmojiCategoryChange}
                                                                onEmojiSelect={(selectedEmoji) => {
                                                                    handleMessageAction('emoji', { ...emojiPickerContext.message, emoji: selectedEmoji.emoji });
                                                                    setShowEmojiPicker(false);
                                                                    setEmojiPickerContext(null);
                                                                    setActiveMessageMenu(null);
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="message-input-container">
                            {showReplyContainer && (
                                <div className="reply-container">
                                    <div className="reply-info">
                                        <div className="reply-author">{replyInfo.author}</div>
                                        <div className="reply-content">
                                            {replyInfo.isFile && replyInfo.fileType && replyInfo.fileType.startsWith('image/') && replyInfo.fileDataUrl ? (
                                                <div className="reply-file-preview">
                                                    <div className="img-container">
                                                        <img src={replyInfo.fileDataUrl} alt={replyInfo.fileName} className="reply-image-preview" />
                                                    </div>
                                                    <div className="reply-text">{replyInfo.text || ''}</div>
                                                </div>
                                            ) : replyInfo.isFile ? (
                                                <div className="reply-file-info">
                                                    <div className="reply-file-preview">
                                                        <div className="reply-file-icon">
                                                            <svg className="file-type-icon generic" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                                                <polyline points="13 2 13 9 20 9"></polyline>
                                                            </svg>
                                                        </div>
                                                        <div className="reply-text">{replyInfo.text || ''}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="reply-preview">
                                                    <div className="reply-text">{replyInfo.text}</div>
                                                </div>
                                            )}
                                        </div>
                                        <button className="cancel-reply-btn" onClick={() => setShowReplyContainer(false)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                            {/* Staged Files Preview */}
                            {stagedFiles && stagedFiles.length > 0 && (
                                <div className="staged-files-preview-container">
                                    <button 
                                        className="clear-all-staged-btn" 
                                        onClick={clearAllStagedFiles}
                                        title="Clear all selected files"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                    {/* Enlarged Image Preview Area */}
                                    {selectedStagedImage && selectedStagedImage.isImage && (
                                        <div className="enlarged-staged-image-preview">
                                            <img src={selectedStagedImage.dataUrl} alt={`Preview of ${selectedStagedImage.name}`} />
                                        </div>
                                    )}
    
                                    {/* Thumbnails Strip - only if there are image files */}
                                    {stagedFiles.some(file => file.isImage) && (
                                        <div className="staged-thumbnails-strip">
                                            {stagedFiles.map(file => (
                                                file.isImage ? (
                                                    <div 
                                                        key={`thumb-${file.id}`} 
                                                        className={`thumbnail-item ${selectedStagedImage && selectedStagedImage.id === file.id ? 'active' : ''}`}
                                                        // onClick is now on the image itself, not the div, to avoid conflict with delete button
                                                    >
                                                        <img src={file.dataUrl} alt={file.name} onClick={() => handleSelectStagedImage(file)} />
                                                        <button 
                                                            className="remove-thumbnail-btn" 
                                                            onClick={() => removeStagedFile(file.id)}
                                                            title="Remove image"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                        </button>
                                                    </div>
                                                ) : null // Non-image files are not shown in the thumbnail strip
                                            ))}
                                        </div>
                                    )}
    
                                    {/* List of non-image staged files */}
                                    {stagedFiles.some(file => !file.isImage) && (
                                        <div className="all-staged-files-list">
                                            <h4>Files:</h4> {/* Optional header for clarity */}
                                            {stagedFiles.map(file => (
                                                !file.isImage ? (
                                                    <div key={`list-${file.id}`} className="staged-file-item">
                                                        <div className="file-icon-container">
                                                            {/* Generic file icon for non-images */}
                                                            <svg className="file-type-icon generic" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                                                        </div>
                                                        <div className="file-meta-container">
                                                            <div className="file-name">{file.name}</div>
                                                            <div className="file-size">{file.size}</div>
                                                        </div>
                                                        <button className="remove-staged-file-btn" onClick={() => removeStagedFile(file.id)} title="Remove file">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                        </button>
                                                    </div>
                                                ) : null
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="message-input-wrapper">
                                <div className="message-actions message-actions-left">
                                    <input 
                                        type="file" 
                                        className="file-upload"
                                        accept="image/*,video/*"
                                        ref={fileUploadRef}
                                        onChange={handleFileUpload}
                                        multiple
                                        style={{ display: 'none' }}
                                    />
                                    <button 
                                        className="message-action-btn" 
                                        onClick={toggleAttachmentMenu} 
                                        ref={attachmentMenuButtonRef}
                                        title="Attach file"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                        </svg>
                                    </button>
                                    <button className="message-action-btn" onClick={toggleEmojiPicker} title="Emoji">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                                            <line x1="9" y1="9" x2="9.01" y2="9"/>
                                            <line x1="15" y1="9" x2="15.01" y2="9"/>
                                        </svg>
                                    </button>

                                    {/* Emoji picker for input, positioned by CSS at bottom of chat */}
                                    {showEmojiPicker && emojiPickerContext?.mode === 'input' && (
                                        <div className="emoji-picker emoji-picker-input" ref={emojiPickerRef} onClick={(e) => e.stopPropagation()}>
                                            <EmojiPickerContent
                                                emojis={emojis}
                                                selectedEmojiCategory={selectedEmojiCategory}
                                                getCurrentCategoryEmojis={getCurrentCategoryEmojis}
                                                handleEmojiCategoryChange={handleEmojiCategoryChange}
                                                onEmojiSelect={(selectedEmoji) => {
                                                    addEmoji(selectedEmoji.emoji); // Adds to input, keeps picker open
                                                }}
                                            />
                                        </div>
                                    )}
                                    
                                    {/* Attachment Options Menu */}
                                    {showAttachmentMenu && (
                                        <div className="attachment-options-menu" ref={attachmentMenuRef}>
                                            <div className="dropdown-item" onClick={() => handleAttachmentOptionClick('media')}>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                                <span>Media (Photos & Videos)</span>
                                            </div>
                                            <div className="dropdown-item" onClick={() => handleAttachmentOptionClick('files')}>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                                                <span>File (Documents, etc.)</span>
                                            </div>
                                            <div className="dropdown-item" onClick={() => handleAttachmentOptionClick('poll')}>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
                                                <span>Poll</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <textarea 
                                    placeholder="Send a message..." 
                                    className="message-input"
                                    ref={messageInputRef}
                                    onKeyDown={handleKeyPress}
                                    onInput={autoResizeTextarea}
                                    rows="1"
                                ></textarea>
                                <div className="message-actions message-actions-right">
                                    {editingMessage && (
                                        <button 
                                            className="message-action-btn cancel-edit-btn" 
                                            onClick={() => {
                                                setEditingMessage(null);
                                                if(messageInputRef.current) messageInputRef.current.value = '';
                                                resetTextareaHeight();
                                            }} 
                                            title="Cancel edit"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                    )}
                                    <button className="message-action-btn" onClick={() => {
                                        sendMessage(messageInputRef.current.value);
                                        resetTextareaHeight();
                                    }} title={editingMessage ? "Save changes" : "Send message"}>
                                        {editingMessage ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                                <path fill="currentColor" d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <h3>Select a chat to start messaging</h3>
                    </div>
                )}
            </div>

            {/* Chat Info Panel */}
            {currentChat && (
            <div className={`chat-info-panel ${showChatInfoPanel ? 'show' : ''}`}>
                <div className="chat-info-panel-header">
                    <h3>{directMessages.get(currentChat)?.isGroup ? 'Group Info' : 'Contact Info'}</h3>
                    <button onClick={toggleChatInfoPanel} className="close-panel-btn" title="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div className="chat-info-panel-user">
                    <img src={directMessages.get(currentChat)?.avatar} alt={directMessages.get(currentChat)?.name} className="chat-info-panel-avatar" />
                    <h4>{directMessages.get(currentChat)?.name}</h4>
                    {/* Add more user/group details here if needed, like status or member count for groups */} 
                </div>
                <div className="chat-info-panel-tabs">
                    {[
                        { key: 'Overview', label: 'Overview' },
                        ...(directMessages.get(currentChat)?.isGroup ? [{ key: 'Members', label: 'Members' }] : []),
                        { key: 'Media', label: 'Media' },
                        { key: 'Files', label: 'Files' },
                        { key: 'Links', label: 'Links' },
                    ].map(tab => (
                        <button 
                            key={tab.key} 
                            className={`tab-btn ${activeChatInfoTab === tab.key ? 'active' : ''}`}
                            onClick={() => selectChatInfoTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="chat-info-panel-content">
                    {activeChatInfoTab === 'Overview' && (
                        <div className="tab-content-overview">
                            <div className="overview-section item-detail-section">
                                <span className="item-label">Creation Date</span>
                                <span className="item-value">{directMessages.get(currentChat)?.creationDate || 'N/A'}</span>
                            </div>
                            
                            {/* Pin/Unpin Option */}
                            <div className="overview-section item-detail-section pin-section">
                                <span className="item-label">Pin Chat</span>
                                <div className="pin-toggle-wrapper">
                                    <span className="item-value pin-status">
                                        {directMessages.get(currentChat)?.isPinned ? 'Starred ⭐' : 'Not Starred'}
                                    </span>
                                    <label className="switch">
                                        <input 
                                            type="checkbox" 
                                            checked={directMessages.get(currentChat)?.isPinned || false} 
                                            onChange={() => togglePinChat(currentChat)}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                            
                            {directMessages.get(currentChat)?.isGroup && (
                                <>
                                    {/* Who can send messages */}
                                    <div className="overview-section item-detail-section messaging-permissions-section">
                                        <div className="section-header">
                                            <span className="section-title">
                                                <svg className="section-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                                </svg>
                                                Who Can Send Messages
                                            </span>
                                        </div>
                                        <div className="messaging-options">
                                            <div className="messaging-option">
                                                <input 
                                                    type="radio" 
                                                    id="owner-only" 
                                                    name="messaging-permission" 
                                                    value="owner-only" 
                                                    checked={directMessages.get(currentChat)?.messagePermissions === 'owner-only'}
                                                    onChange={() => handlePermissionChange('owner-only')} 
                                                />
                                                <label htmlFor="owner-only">
                                                    <div className="option-info">
                                                        <span className="option-title">Owner Only</span>
                                                        <span className="option-description">Only the group owner can send messages</span>
                                                    </div>
                                                </label>
                                            </div>
                                            <div className="messaging-option">
                                                <input 
                                                    type="radio" 
                                                    id="owner-admins" 
                                                    name="messaging-permission" 
                                                    value="owner-admins" 
                                                    checked={directMessages.get(currentChat)?.messagePermissions === 'owner-admins'}
                                                    onChange={() => handlePermissionChange('owner-admins')}
                                                />
                                                <label htmlFor="owner-admins">
                                                    <div className="option-info">
                                                        <span className="option-title">Owner & Admins Only</span>
                                                        <span className="option-description">Only the owner and admins can send messages</span>
                                                    </div>
                                                </label>
                                            </div>
                                            <div className="messaging-option">
                                                <input 
                                                    type="radio" 
                                                    id="everyone" 
                                                    name="messaging-permission" 
                                                    value="everyone" 
                                                    checked={directMessages.get(currentChat)?.messagePermissions === 'everyone' || !directMessages.get(currentChat)?.messagePermissions} // Default to everyone if not set
                                                    onChange={() => handlePermissionChange('everyone')}
                                                />
                                                <label htmlFor="everyone">
                                                    <div className="option-info">
                                                        <span className="option-title">Everyone</span>
                                                        <span className="option-description">All group members can send messages</span>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Chat version selection */}
                                    <div className="overview-section item-detail-section chat-version-section">
                                        <div className="section-header">
                                            <span className="section-title">
                                                <svg className="section-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                                </svg>
                                                Chat Version
                                            </span>
                                        </div>
                                        <div className="chat-version-selector">
                                            <select className="version-dropdown">
                                                <option value="current">Current Version (2023)</option>
                                                <option value="2022">2022 Version</option>
                                                <option value="2021">2021 Version</option>
                                                <option value="2020">2020 Version</option>
                                            </select>
                                            <div className="version-info">
                                                <div className="info-pill current">
                                                    <span>Current Version</span>
                                                </div>
                                                <p className="version-note">
                                                    Note: You cannot send or edit messages in archived versions
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            <div className="overview-section item-detail-section notification-section">
                                <span className="item-label">Notifications</span>
                                <div className="notification-toggle-wrapper">
                                    <span className="item-value notification-status">
                                        {directMessages.get(currentChat)?.isMuted ? 'Muted' : 'Active'}
                                    </span>
                                    <label className="switch">
                                        <input 
                                            type="checkbox" 
                                            checked={!(directMessages.get(currentChat)?.isMuted || false)} 
                                            onChange={() => toggleMuteChat(currentChat)}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                            {/* Add more sections like 'Report User/Group', 'Block User' etc. if needed */}
                        </div>
                    )}
                    {directMessages.get(currentChat)?.isGroup && activeChatInfoTab === 'Members' && (
                        <div className="tab-content-members">
                            <div className="members-list-container">
                                {/* Search bar for members */}
                                <div className="members-search-container">
                                    <div className="members-search-wrapper">
                                        <svg className="members-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="11" cy="11" r="8"></circle>
                                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                        </svg>
                                        <input 
                                            type="text" 
                                            className="members-search-input" 
                                            placeholder="Search members..." 
                                            value={membersSearchTerm}
                                            onChange={handleMembersSearch}
                                        />
                                    </div>
                                </div>
                                
                                {/* Show total number of members */}
                                <div className="members-count-header">
                                    <span className="members-count-text">
                                        <svg className="members-count-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                        </svg>
                                        {totalMembersCount} Members
                                    </span>
                                </div>
                                
                                {/* Group Owner */}
                                {filteredMembers.owner && (
                                    <>
                                        <div className="members-section-header">
                                            <span>Owner</span>
                                        </div>
                                        <div className="member-item-panel owner">
                                            <img src={filteredMembers.owner.avatar} alt="Group Owner" className="member-avatar-panel" />
                                            <div className="member-info-panel">
                                                <span className="member-name-panel">
                                                    {filteredMembers.owner.name} (Owner)
                                                </span>
                                                <span className="member-role-panel">Owner</span>
                                            </div>
                                            <div className={`member-actions ${activeMemberMenu === filteredMembers.owner.id ? 'active' : ''}`}>
                                                <button className="member-menu-btn" onClick={(e) => handleMemberMenuClick(e, filteredMembers.owner.id)} title="More options">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="5" r="1.5"/>
                                                        <circle cx="12" cy="12" r="1.5"/>
                                                        <circle cx="12" cy="19" r="1.5"/>
                                                    </svg>
                                                </button>
                                                {activeMemberMenu === filteredMembers.owner.id && (
                                                    <div className="member-dropdown-menu" ref={memberMenuRef} onClick={(e) => e.stopPropagation()}>
                                                        <div className="dropdown-item" onClick={() => handleMemberAction('message', filteredMembers.owner)}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                                            </svg>
                                                            <span>Message</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                                
                                {/* Admins Section */}
                                {filteredMembers.admins.length > 0 && (
                                    <>
                                        <div className="members-section-header">
                                            <span>Admins</span>
                                        </div>
                                        {filteredMembers.admins.map((admin) => (
                                            <div key={admin.id} className="member-item-panel admin">
                                                <img src={admin.avatar} alt={admin.name} className="member-avatar-panel" />
                                                <div className="member-info-panel">
                                                    <span className="member-name-panel">{admin.name}</span>
                                                    <span className="member-role-panel">Admin</span>
                                                </div>
                                                <div className={`member-actions ${activeMemberMenu === admin.id ? 'active' : ''}`}>
                                                    <button className="member-menu-btn" onClick={(e) => handleMemberMenuClick(e, admin.id)} title="More options">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <circle cx="12" cy="5" r="1.5"/>
                                                            <circle cx="12" cy="12" r="1.5"/>
                                                            <circle cx="12" cy="19" r="1.5"/>
                                                        </svg>
                                                    </button>
                                                    {activeMemberMenu === admin.id && (
                                                        <div className="member-dropdown-menu" ref={memberMenuRef} onClick={(e) => e.stopPropagation()}>
                                                            <div className="dropdown-item" onClick={() => handleMemberAction('message', admin)}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                                                </svg>
                                                                <span>Message</span>
                                                            </div>
                                                            <div className="dropdown-item" onClick={() => handleMemberAction('removeAdmin', admin)}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                                    <circle cx="8.5" cy="7" r="4"></circle>
                                                                    <line x1="18" y1="8" x2="23" y2="13"></line>
                                                                    <line x1="23" y1="8" x2="18" y2="13"></line>
                                                                </svg>
                                                                <span>Remove Admin</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                                
                                {/* Members Section */}
                                {filteredMembers.members.length > 0 && (
                                    <>
                                        <div className="members-section-header">
                                            <span>Members</span>
                                        </div>
                                        {filteredMembers.members.map((member) => (
                                            <div key={member.id} className="member-item-panel">
                                                <img src={member.avatar} alt={member.name} className="member-avatar-panel" />
                                                <div className="member-info-panel">
                                                    <span className="member-name-panel">{member.name}</span>
                                                    <span className="member-role-panel">Member</span>
                                                </div>
                                                <div className={`member-actions ${activeMemberMenu === member.id ? 'active' : ''}`}>
                                                    <button className="member-menu-btn" onClick={(e) => handleMemberMenuClick(e, member.id)} title="More options">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <circle cx="12" cy="5" r="1.5"/>
                                                            <circle cx="12" cy="12" r="1.5"/>
                                                            <circle cx="12" cy="19" r="1.5"/>
                                                        </svg>
                                                    </button>
                                                    {activeMemberMenu === member.id && (
                                                        <div className="member-dropdown-menu" ref={memberMenuRef} onClick={(e) => e.stopPropagation()}>
                                                            <div className="dropdown-item" onClick={() => handleMemberAction('message', member)}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                                                </svg>
                                                                <span>Message</span>
                                                            </div>
                                                            <div className="dropdown-item" onClick={() => handleMemberAction('makeAdmin', member)}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                                    <circle cx="8.5" cy="7" r="4"></circle>
                                                                    <polyline points="17 11 19 13 23 9"></polyline>
                                                                </svg>
                                                                <span>Make Admin</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                                
                                {/* No Results Message */}
                                {!filteredMembers.owner && filteredMembers.admins.length === 0 && filteredMembers.members.length === 0 && (
                                    <div className="no-members-results">
                                        <p>No members found matching "{membersSearchTerm}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {activeChatInfoTab === 'Media' && (
                        <div className="tab-content-media">
                            <div className="media-grid">
                                {[...Array(Math.floor(Math.random() * 10) + 6)].map((_, i) => {
                                    const imageName = `shared_media_${i + 1}.jpg`;
                                    const imageSrc = `https://picsum.photos/seed/${currentChat}-media-${i}/400/400`; // Consistent larger source for lightbox
                                    const allMediaImages = [...Array(Math.floor(Math.random() * 10) + 6)].map((_, j) => ({
                                        src: `https://picsum.photos/seed/${currentChat}-media-${j}/400/400`,
                                        name: `shared_media_${j + 1}.jpg`
                                    })); // Re-generate the list for context
                                    return (
                                        <div 
                                            key={`media-${i}`}
                                            className="media-item clickable-image" 
                                            onClick={() => openImageLightbox(imageSrc, imageName, allMediaImages)}
                                            title={imageName}
                                        >
                                            <img src={`https://picsum.photos/seed/${currentChat}-media-${i}/200/200`} alt={imageName} />
                                        </div>
                                    );
                                })}
                                {([...Array(Math.floor(Math.random() * 10) + 6)].length === 0) && <p>No media shared yet.</p>}
                            </div>
                        </div>
                    )}
                    {activeChatInfoTab === 'Files' && (
                        <div className="tab-content-files">
                            <ul className="files-list">
                                {[...Array(Math.floor(Math.random() * 5) + 2)].map((_, i) => (
                                    <li key={`file-${i}`} className="file-item-panel">
                                        <div className="file-icon-panel generic">📄</div> {/* Generic file icon */}
                                        <div className="file-info-panel">
                                            <span className="file-name-panel">document_report_final_{i+1}.pdf</span>
                                            <span className="file-meta-panel">{(Math.random() * 5 + 0.5).toFixed(1)} MB - Shared {new Date(Date.now() - Math.random()*1000000000).toLocaleDateString()}</span>
                                        </div>
                                        <button className="file-action-btn" title="Download"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg></button>
                                    </li>
                                ))}
                                 {([...Array(Math.floor(Math.random() * 5) + 2)].length === 0) && <p>No files shared yet.</p>} 
                            </ul>
                        </div>
                    )}
                    {activeChatInfoTab === 'Links' && (
                        <div className="tab-content-links">
                            <ul className="links-list">
                                {[...Array(Math.floor(Math.random() * 7) + 3)].map((_, i) => (
                                <li key={`link-${i}`} className="link-item-panel">
                                    <div className="link-favicon-panel">🔗</div> {/* Generic link icon */}
                                    <div className="link-info-panel">
                                        <a href="#" target="_blank" rel="noopener noreferrer" className="link-url-panel">https://example.com/article/important-topic-{i+1}</a>
                                        <span className="link-meta-panel">Shared by User {Math.floor(Math.random()*100)} - {new Date(Date.now() - Math.random()*2000000000).toLocaleDateString()}</span>
                                    </div>
                                </li>
                                ))}
                                {([...Array(Math.floor(Math.random() * 7) + 3)].length === 0) && <p>No links shared yet.</p>} 
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            )}

            {/* Forward Message Modal */}
            {showForwardModal && forwardingMessage && (
                <div className="forward-modal-overlay">
                    <div className="forward-modal-content">
                        <div className="forward-modal-header">
                            <h3>Forward Message</h3>
                            <button onClick={closeForwardModal} className="close-forward-modal-btn" title="Close">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div className="forward-modal-body">
                            <div className="message-preview-container">
                                <h4>Message to forward:</h4>
                                <div className={`message ${forwardingMessage.sender === 'You' ? 'outgoing' : 'incoming'} preview`}>
                                    <div className="message-avatar">
                                        <img src={forwardingMessage.avatar} alt={forwardingMessage.sender} />
                                    </div>
                                    <div className="message-content">
                                        <div className="message-header">
                                            {forwardingMessage.sender === 'You' ? '' : <span className="message-author">{forwardingMessage.sender}</span>}
                                            <span className="message-time">{forwardingMessage.timestamp}</span>
                                        </div>
                                        {forwardingMessage.isFile ? (
                                            <div className="message-text">
                                                <div className="file-details-container">
                                                    <div className="file-icon-container">
                                                        {forwardingMessage.fileType && forwardingMessage.fileType.startsWith('image/') ? (
                                                            <svg className="file-type-icon image" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                                <polyline points="21 15 16 10 5 21"></polyline>
                                                            </svg>
                                                        ) : (
                                                            <svg className="file-type-icon generic" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                                                <polyline points="13 2 13 9 20 9"></polyline>
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="file-meta-container">
                                                        <div className="file-name">{forwardingMessage.fileName}</div>
                                                        <div className="file-size">{forwardingMessage.fileSize}</div>
                                                    </div>
                                                </div>
                                                {forwardingMessage.fileType && forwardingMessage.fileType.startsWith('image/') && forwardingMessage.fileDataUrl && (
                                                    <div className="file-image-preview-container">
                                                        <img src={forwardingMessage.fileDataUrl} alt={forwardingMessage.fileName} className="file-image-preview" />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            forwardingMessage.content && <div className="message-text" dangerouslySetInnerHTML={{ __html: forwardingMessage.content }}></div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <h4>Select recipients:</h4>
                            <div className="recipients-list">
                                {Array.from(directMessages.entries())
                                    .filter(([userId, _]) => userId !== currentChat) // Don't list current chat
                                    .map(([userId, userData]) => (
                                    <div key={userId} className="recipient-item">
                                        <input 
                                            type="checkbox" 
                                            id={`fwd-user-${userId}`} 
                                            name="forwardRecipients" 
                                            value={userId} 
                                            onChange={(e) => {
                                                const { value, checked } = e.target;
                                                setSelectedForwardRecipients(prev =>
                                                    checked ? [...prev, value] : prev.filter(id => id !== value)
                                                );
                                            }}
                                        />
                                        <label htmlFor={`fwd-user-${userId}`}>
                                            <img src={userData.avatar} alt={userData.name} className="recipient-avatar" />
                                            <span className="recipient-name">{userData.name}</span>
                                        </label>
                                    </div>
                                ))}
                                {Array.from(directMessages.entries()).filter(([userId, _]) => userId !== currentChat).length === 0 && (
                                    <p>No other chats available to forward to.</p>
                                )}
                            </div>
                        </div>
                        <div className="forward-modal-footer">
                            <button onClick={closeForwardModal} className="btn btn-secondary">Cancel</button>
                            <button 
                                onClick={() => {
                                    const selectedUsers = Array.from(document.querySelectorAll('input[name="forwardRecipients"]:checked'))
                                                               .map(cb => cb.value);
                                    if (selectedUsers.length > 0) {
                                        confirmForwardMessage(selectedUsers);
                                    } else {
                                        alert("Please select at least one recipient."); // Or some other UI feedback
                                    }
                                }}
                                className={`btn btn-primary ${selectedForwardRecipients.length === 0 ? 'hidden' : ''}`}
                                disabled={selectedForwardRecipients.length === 0} // Also disable for accessibility
                            >
                                Forward
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Lightbox Modal */}
            {showImageLightbox && lightboxImage.src && (
                <div className="image-lightbox-overlay" onClick={() => {
                    // Reset drag position and zoom before closing
                    setDragPosition({ x: 0, y: 0 });
                    setZoomLevel(1);
                    closeImageLightbox();
                }}>
                    <div className="image-lightbox-content" 
                         ref={lightboxContentRef} 
                         onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking on content */}
                        
                        {lightboxImage.imageList.length > 1 && (
                            <button 
                                className="lightbox-nav-btn prev" 
                                onClick={() => {
                                    goToPreviousImageInLightbox();
                                    setZoomLevel(1); // إعادة تعيين مستوى التكبير عند تغيير الصورة
                                    setDragPosition({ x: 0, y: 0 }); // Reset drag position
                                }} 
                                disabled={lightboxImage.currentIndex <= 0}
                                title="Previous image"
                            >
                                <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
                            </button>
                        )}
                        
                        <img 
                            ref={lightboxImageRef}
                            src={lightboxImage.src} 
                            alt={lightboxImage.name || 'Enlarged image'} 
                            className="lightbox-image-display" 
                            style={{ 
                                transform: `translate(${dragPosition.x}px, ${dragPosition.y}px) scale(${zoomLevel})`, 
                                transition: isDragging ? 'none' : 'transform 0.3s ease',
                                cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                            }}
                            onLoad={() => {
                                // Get image dimensions when loaded
                                if (lightboxImageRef.current) {
                                    const { width, height } = lightboxImageRef.current.getBoundingClientRect();
                                    setImageBounds({ width, height });
                                }
                            }}
                            onMouseDown={(e) => {
                                // Only enable dragging when zoomed in
                                if (zoomLevel > 1) {
                                    e.preventDefault();
                                    setIsDragging(true);
                                    setDragStart({
                                        x: e.clientX - dragPosition.x,
                                        y: e.clientY - dragPosition.y
                                    });
                                    
                                    // Update image bounds on drag start to ensure accurate constraints
                                    if (lightboxImageRef.current) {
                                        const { width, height } = lightboxImageRef.current.getBoundingClientRect();
                                        setImageBounds({ width, height });
                                    }
                                }
                            }}
                            onMouseMove={(e) => {
                                if (isDragging && zoomLevel > 1) {
                                    // Calculate the raw new position
                                    const newX = e.clientX - dragStart.x;
                                    const newY = e.clientY - dragStart.y;
                                    
                                    // Get references to elements
                                    const image = lightboxImageRef.current;
                                    const container = lightboxContentRef.current;
                                    
                                    if (!image || !container) return;
                                    
                                    // Get dimensions
                                    const imageRect = image.getBoundingClientRect();
                                    const containerRect = container.getBoundingClientRect();
                                    
                                    // Calculate the true image dimensions considering zoom
                                    const scaledImageWidth = imageRect.width;
                                    const scaledImageHeight = imageRect.height;
                                    
                                    // Set minimum visibility requirements (at least this % of image must remain visible)
                                    const minVisiblePercent = 0.25; // 25% of the image must remain visible
                                    
                                    // Calculate how much of the image is allowed to move outside the container
                                    const maxOutsideX = scaledImageWidth * (1 - minVisiblePercent);
                                    const maxOutsideY = scaledImageHeight * (1 - minVisiblePercent);
                                    
                                    // Calculate the minimum allowed boundaries
                                    // These allow the image to be partially outside but not completely
                                    const minX = -(containerRect.width/2 + maxOutsideX);
                                    const maxX = containerRect.width/2 + maxOutsideX;
                                    const minY = -(containerRect.height/2 + maxOutsideY);
                                    const maxY = containerRect.height/2 + maxOutsideY;
                                    
                                    // Apply constraints to keep part of the image always visible
                                    const constrainedX = Math.max(minX, Math.min(maxX, newX));
                                    const constrainedY = Math.max(minY, Math.min(maxY, newY));
                                    
                                    setDragPosition({
                                        x: constrainedX,
                                        y: constrainedY
                                    });
                                }
                            }}
                            onMouseUp={() => {
                                setIsDragging(false);
                            }}
                            onMouseLeave={() => {
                                setIsDragging(false);
                            }}
                            onWheel={(e) => {
                                // التكبير/التصغير بعجلة الماوس
                                e.preventDefault(); // منع السلوك الافتراضي للعجلة
                                if (e.deltaY < 0) {
                                    // تمرير لأعلى = تكبير
                                    setZoomLevel(prev => Math.min(3, prev + 0.1));
                                } else {
                                    // تمرير لأسفل = تصغير
                                    setZoomLevel(prev => {
                                        const newZoom = Math.max(1, prev - 0.1);
                                        // If zooming out to 1, reset position
                                        if (newZoom === 1) {
                                            setDragPosition({ x: 0, y: 0 });
                                        }
                                        return newZoom;
                                    });
                                }
                            }}
                        />
                        
                        {lightboxImage.imageList.length > 1 && (
                            <button 
                                className="lightbox-nav-btn next" 
                                onClick={() => {
                                    goToNextImageInLightbox();
                                    setZoomLevel(1); // إعادة تعيين مستوى التكبير عند تغيير الصورة
                                    setDragPosition({ x: 0, y: 0 }); // Reset drag position
                                }} 
                                disabled={lightboxImage.currentIndex >= lightboxImage.imageList.length - 1}
                                title="Next image"
                            >
                                <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41L13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
                            </button>
                        )}

                        {/* Zoom Controls */}
                        <div className="lightbox-zoom-controls">
                            <button 
                                className="lightbox-zoom-btn" 
                                onClick={() => setZoomLevel(prev => {
                                    const newZoom = Math.max(1, prev - 0.2);
                                    // If zooming out to 1, reset position
                                    if (newZoom === 1) {
                                        setDragPosition({ x: 0, y: 0 });
                                    }
                                    return newZoom;
                                })}
                                title="Zoom out"
                                disabled={zoomLevel <= 1}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    <line x1="8" y1="11" x2="14" y2="11"></line>
                                </svg>
                            </button>
                            <button 
                                className="lightbox-zoom-btn" 
                                onClick={() => {
                                    setZoomLevel(1);
                                    setDragPosition({ x: 0, y: 0 }); // Reset position when resetting zoom
                                }}
                                title="Reset zoom"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </button>
                            <button 
                                className="lightbox-zoom-btn" 
                                onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.2))}
                                title="Zoom in"
                                disabled={zoomLevel >= 3}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    <line x1="11" y1="8" x2="11" y2="14"></line>
                                    <line x1="8" y1="11" x2="14" y2="11"></line>
                                </svg>
                            </button>
                        </div>

                        <div className="lightbox-actions">
                            <a 
                                href={lightboxImage.src} 
                                download={lightboxImage.name || 'image.png'} 
                                className="lightbox-btn download-btn"
                                title="Download image"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                <span>Download</span>
                            </a>
                            <button onClick={() => {
                                // Reset drag position and zoom before closing
                                setDragPosition({ x: 0, y: 0 });
                                setZoomLevel(1);
                                closeImageLightbox();
                            }} className="lightbox-btn close-lightbox-btn" title="Close viewer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                <span>Close</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Poll Creation Modal */}
            {showPollModal && (
                <div className="modal-overlay poll-modal-overlay">
                    <div className="modal-content poll-modal-content">
                        <div className="modal-header poll-modal-header">
                            <h3>Create Poll</h3>
                            <button onClick={closePollModal} className="close-modal-btn" title="Close">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body poll-modal-body">
                            <div className="poll-question-container">
                                <label htmlFor="poll-question">Question</label>
                                <input 
                                    type="text" 
                                    id="poll-question" 
                                    value={pollData.question} 
                                    onChange={handlePollQuestionChange} 
                                    placeholder="Ask a question..." 
                                    className="poll-question-input"
                                />
                            </div>
                            
                            <div className="poll-options-container">
                                <label>Options</label>
                                {pollData.options.map((option, index) => (
                                    <div key={index} className="poll-option-item">
                                        <input 
                                            type="text" 
                                            value={option} 
                                            onChange={(e) => handlePollOptionChange(index, e.target.value)} 
                                            placeholder={`Option ${index + 1}`} 
                                            className="poll-option-input"
                                        />
                                        {pollData.options.length > 2 && (
                                            <button 
                                                className="remove-option-btn" 
                                                onClick={() => removePollOption(index)}
                                                title="Remove option"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button className="add-option-btn" onClick={addPollOption}>
                                    + Add Option
                                </button>
                            </div>
                            
                            <div className="poll-settings">
                                <div className="poll-setting-item">
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            checked={pollData.allowMultipleAnswers} 
                                            onChange={() => togglePollSetting('allowMultipleAnswers')} 
                                        />
                                        Allow multiple answers
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer poll-modal-footer">
                            <button onClick={closePollModal} className="btn btn-secondary">Cancel</button>
                            <button onClick={createPoll} className="btn btn-primary">Create Poll</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirmModal && (
                <div className="modal-overlay delete-confirm-modal-overlay">
                    <div className="modal-content delete-confirm-modal-content">
                        <div className="modal-header delete-confirm-modal-header">
                            <h3>Confirm Deletion</h3>
                        </div>
                        <div className="modal-body delete-confirm-modal-body">
                            <p className="delete-confirm-question">
                                {selectedMessages.length > 0 
                                    ? `Are you sure you want to delete ${selectedMessages.length} message${selectedMessages.length > 1 ? 's' : ''}?` 
                                    : 'Are you sure you want to delete this message?'}
                            </p>
                            <p className="delete-confirm-warning">
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="modal-footer delete-confirm-modal-footer">
                            <button 
                                onClick={() => {
                                    setShowDeleteConfirmModal(false);
                                    setMessageToDelete(null);
                                }} 
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    if (selectedMessages.length > 0) {
                                        deleteSelectedMessages();
                                    } else if (messageToDelete) {
                                        handleMessageAction('delete', messageToDelete);
                                    }
                                    setShowDeleteConfirmModal(false);
                                    setMessageToDelete(null);
                                }} 
                                className="btn btn-danger"
                            >
                                Delete Message
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast.show && (
                <div className="toast-notification">
                    <span>{toast.message}</span>
                </div>
            )}
        </div>
    );
}