'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function useChat() {
    // State management
    const [messages, setMessages] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [emojis, setEmojis] = useState([]);
    const [selectedEmojiCategory, setSelectedEmojiCategory] = useState('smileys_emotion');
    const [directMessages, setDirectMessages] = useState(new Map([
        ['admin-news', {
            name: 'College News',
            avatar: 'https://i.pravatar.cc/150?img=8',
            status: 'online',
            lastMessage: 'Final exam schedules updated',
            lastTime: 'Today',
            unread: 3,
            isGroup: true,
            isMuted: false,
            isPinned: true, // This group is pinned
            creationDate: '2023-01-01'
        }],
        ['1', {
            name: 'John Doe',
            avatar: 'https://i.pravatar.cc/150?img=1',
            status: 'online',
            lastMessage: 'I need help with my project',
            lastTime: '12:05 PM',
            unread: 0,
            creationDate: '2023-03-15'
        }],
        ['2', {
            name: 'Jane Smith',
            avatar: 'https://i.pravatar.cc/150?img=2',
            status: 'online',
            lastMessage: 'Hello! How are you?',
            lastTime: '11:35 AM',
            unread: 0,
            creationDate: '2023-02-20'
        }],
        ['3', {
            name: 'Mike Johnson',
            avatar: 'https://i.pravatar.cc/150?img=3',
            status: 'away',
            lastMessage: 'Almost done, just reviewing it now',
            lastTime: '10:05 AM',
            unread: 1,
            creationDate: '2023-04-01'
        }],
        ['4', {
            name: 'Project Team',
            avatar: 'https://i.pravatar.cc/150?img=4',
            status: 'online',
            lastMessage: 'Can we discuss this in tomorrow\'s meeting?',
            lastTime: '09:40 AM',
            unread: 0,
            isGroup: true,
            members: [
                { id: 'user1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1', role: 'Admin' },
                { id: 'user2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2', role: 'Member' },
                { id: 'user3', name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?img=3', role: 'Member' },
                { id: 'user4', name: 'Sarah Wilson', avatar: 'https://i.pravatar.cc/150?img=5', role: 'Member' },
                { id: 'user5', name: 'David Lee', avatar: 'https://i.pravatar.cc/150?img=7', role: 'Member' }
            ],
            creationDate: '2023-01-10'
        }],
        ['5', {
            name: 'Study Group',
            avatar: 'https://i.pravatar.cc/150?img=6',
            status: 'online',
            lastMessage: 'I\'ll send them later today',
            lastTime: '2:20 PM',
            unread: 5,
            isGroup: true,
            members: [
                { id: 'user1', name: 'Emily Chen', avatar: 'https://i.pravatar.cc/150?img=10', role: 'Admin' },
                { id: 'user2', name: 'Alex Rodriguez', avatar: 'https://i.pravatar.cc/150?img=11', role: 'Member' },
                { id: 'user3', name: 'Jesse Brown', avatar: 'https://i.pravatar.cc/150?img=12', role: 'Member' },
                { id: 'currentUser', name: 'You', avatar: 'https://i.pravatar.cc/150?img=13', role: 'Member' }
            ],
            creationDate: '2023-02-05'
        }],
        // Add subgroup channels
        ['cs-lectures', {
            name: 'CS Lectures',
            avatar: 'https://i.pravatar.cc/150?img=20',
            status: 'online',
            lastMessage: 'Next lecture will cover neural networks',
            lastTime: '10:30 AM',
            unread: 2,
            isGroup: true,
            creationDate: '2023-01-15'
        }],
        ['cs-sections', {
            name: 'CS Sections',
            avatar: 'https://i.pravatar.cc/150?img=22',
            status: 'online',
            lastMessage: 'Assignment 3 solutions',
            lastTime: '2:15 PM',
            unread: 0,
            isGroup: true,
            creationDate: '2023-01-15'
        }],
        ['cs-admin', {
            name: 'CS Admin',
            avatar: 'https://i.pravatar.cc/150?img=25',
            status: 'online',
            lastMessage: 'Midterm grades released',
            lastTime: '9:45 AM',
            unread: 3,
            isGroup: true,
            creationDate: '2023-01-15'
        }],
        ['math-lectures', {
            name: 'Math Lectures',
            avatar: 'https://i.pravatar.cc/150?img=30',
            status: 'online',
            lastMessage: 'Chapter 5 material uploaded',
            lastTime: '3:20 PM',
            unread: 0,
            isGroup: true,
            creationDate: '2023-01-15'
        }],
        ['math-sections', {
            name: 'Math Sections',
            avatar: 'https://i.pravatar.cc/150?img=32',
            status: 'online',
            lastMessage: 'Tutorial session tomorrow',
            lastTime: '11:50 AM',
            unread: 1,
            isGroup: true,
            creationDate: '2023-01-15'
        }],
        ['math-admin', {
            name: 'Math Admin',
            avatar: 'https://i.pravatar.cc/150?img=35',
            status: 'online',
            lastMessage: 'Exam room announced',
            lastTime: 'Yesterday',
            unread: 0,
            isGroup: true,
            creationDate: '2023-01-15'
        }],
        ['phys-lectures', {
            name: 'Physics Lectures',
            avatar: 'https://i.pravatar.cc/150?img=40',
            status: 'online',
            lastMessage: 'Lecture slides available',
            lastTime: '4:05 PM',
            unread: 4,
            isGroup: true,
            creationDate: '2023-01-15'
        }],
        ['phys-sections', {
            name: 'Physics Sections',
            avatar: 'https://i.pravatar.cc/150?img=42',
            status: 'online',
            lastMessage: 'Lab report template',
            lastTime: 'Today',
            unread: 0,
            isGroup: true,
            creationDate: '2023-01-15'
        }],
        ['phys-admin', {
            name: 'Physics Admin',
            avatar: 'https://i.pravatar.cc/150?img=45',
            status: 'online',
            lastMessage: 'Course syllabus updated',
            lastTime: 'Yesterday',
            unread: 0,
            isGroup: true,
            creationDate: '2023-01-15'
        }],
        // Add Public Chat channels
        ['cs-public', {
            name: 'CS Public Chat',
            avatar: 'https://i.pravatar.cc/150?img=60',
            status: 'online',
            lastMessage: 'Has anyone started the final project?',
            lastTime: '08:20 AM',
            unread: 5,
            isGroup: true,
            creationDate: '2023-01-15'
        }],
        ['math-public', {
            name: 'Math Public Chat',
            avatar: 'https://i.pravatar.cc/150?img=61',
            status: 'online',
            lastMessage: 'Anyone want to form a study group?',
            lastTime: '12:40 PM',
            unread: 2,
            isGroup: true,
            creationDate: '2023-01-15'
        }],
        ['phys-public', {
            name: 'Physics Public Chat',
            avatar: 'https://i.pravatar.cc/150?img=62',
            status: 'online',
            lastMessage: 'Looking for a lab partner',
            lastTime: '16:30 PM',
            unread: 0,
            isGroup: true,
            creationDate: '2023-01-15'
        }]
    ]));
    const [originalDirectMessages, setOriginalDirectMessages] = useState(directMessages);
    const [currentReplyMessage, setCurrentReplyMessage] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMessageMenu, setActiveMessageMenu] = useState(null);
    const [showReplyContainer, setShowReplyContainer] = useState(false);
    const [replyInfo, setReplyInfo] = useState({ author: '', text: '' });
    const [emojiPickerContext, setEmojiPickerContext] = useState(null);
    const [stagedFiles, setStagedFiles] = useState([]); // New state for staged files
    const [selectedStagedImage, setSelectedStagedImage] = useState(null); // New state for the currently enlarged staged image
    const [editingMessage, setEditingMessage] = useState(null); // State for the message being edited

    // State for forwarding messages
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [forwardingMessage, setForwardingMessage] = useState(null);

    // State for Chat Info Panel
    const [showChatInfoPanel, setShowChatInfoPanel] = useState(false);
    const [activeChatInfoTab, setActiveChatInfoTab] = useState('Overview'); // Default tab in English

    // State for Image Lightbox
    const [showImageLightbox, setShowImageLightbox] = useState(false);
    const [lightboxImage, setLightboxImage] = useState({
        src: null,
        name: null,
        currentIndex: -1,
        imageList: [] // Array of objects like { src, name }
    });

    // State for attachment menu
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

    // Estado para la modal de encuestas
    const [showPollModal, setShowPollModal] = useState(false);
    const [pollData, setPollData] = useState({
        question: '',
        options: ['', ''],
        allowMultipleAnswers: false
    });

    // State para el popover de votantes de encuestas
    const [pollVotersPopover, setPollVotersPopover] = useState({
        show: false,
        messageId: null,
        voters: [],
        options: [], // Para almacenar las opciones disponibles en la encuesta
        activeTab: 'All', // Pestaña activa: 'All' o el índice de la opción
        filteredVoters: [], // Votantes filtrados según la pestaña activa
        anchorEl: null
    });

    // Ensure currentUser has an avatar for consistency in reaction popover
    const currentUser = { id: 'current_user_id_placeholder', name: 'You (Placeholder)', avatar: 'https://i.pravatar.cc/150?img=4' };

    const messageInputRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const fileUploadRef = useRef(null);
    const reactionPopoverRef = useRef(null);
    const menuButtonRef = useRef(null); // Ref for the button that opened the current menu
    const messageDropdownRef = useRef(null); // Ref for the active message dropdown menu content
    const attachmentMenuButtonRef = useRef(null); // Ref for the attachment menu button
    const attachmentMenuRef = useRef(null); // Ref for the attachment menu itself

    const [reactionPopover, setReactionPopover] = useState({
        show: false,
        messageId: null,
        allReactionsForMessage: [], // Store all reactions for the current message {emoji, users[]}
        distinctEmojisForPopover: [], // For tabs: [{emoji: '👍', count: 2}, ...]
        activeReactionTab: 'All', // 'All' or specific emoji - Default to English
        usersForActiveTab: [],    // Users to display based on active tab [{id, name, avatar, reactedEmoji}]
        anchorEl: null
    });

    // Initialize messages with some reactions for demonstration
     useEffect(() => {
        if (currentChat) {
            const demoReactionsUser1 = [
                { emoji: '👍', users: [{ id: 'user2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' }, { id: 'user3', name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?img=3' }] },
                { emoji: '❤️', users: [currentUser, { id: 'user2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' }] }
            ];
             const demoReactionsUser2 = [
                { emoji: '😂', users: [currentUser] },
                { emoji: '😮', users: [{ id: 'user1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' }] }
            ];

            const defaultMessages = {
                'admin-news': [
                    { 
                        id: 1, 
                        sender: 'College Admin', 
                        avatar: 'https://i.pravatar.cc/150?img=8', 
                        content: 'Welcome to the College News channel! This is where all official college announcements will be posted.', 
                        timestamp: '09:00 AM',
                        reactions: [{ emoji: '👍', users: [{ id: 'user1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' }, { id: 'user2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' }] }]
                    },
                    { 
                        id: 2, 
                        sender: 'College Admin', 
                        avatar: 'https://i.pravatar.cc/150?img=8', 
                        content: 'IMPORTANT: Final exam schedules have been updated. Please check the academic portal for your personalized schedule.', 
                        timestamp: '10:15 AM',
                        reactions: [{ emoji: '👍', users: [{ id: 'user4', name: 'Sarah Wilson', avatar: 'https://i.pravatar.cc/150?img=5' }] }]
                    },
                    { 
                        id: 3, 
                        sender: 'College Admin', 
                        avatar: 'https://i.pravatar.cc/150?img=8', 
                        content: 'The library will be open 24/7 during final exams week (May 15-22).', 
                        timestamp: '11:30 AM',
                        reactions: []
                    },
                    { 
                        id: 4, 
                        sender: 'Dean of Students', 
                        avatar: 'https://i.pravatar.cc/150?img=13', 
                        content: 'Reminder: Scholarship applications for the next semester are due by June 1st. Visit the financial aid office for assistance.', 
                        timestamp: '12:45 PM', 
                        reactions: [{ emoji: '❤️', users: [{ id: 'user5', name: 'Alex Rodriguez', avatar: 'https://i.pravatar.cc/150?img=11' }] }]
                    },
                    {
                        id: 5,
                        sender: 'Student Affairs',
                        avatar: 'https://i.pravatar.cc/150?img=14',
                        content: 'The campus career fair will be held next Thursday from 10AM to 4PM in the main hall. Over 30 companies will be attending!',
                        timestamp: '2:30 PM',
                        reactions: [{ emoji: '🎉', users: [currentUser, { id: 'user2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' }] }]
                    },
                    {
                        id: 6,
                        sender: 'IT Department',
                        avatar: 'https://i.pravatar.cc/150?img=15',
                        content: 'System maintenance will be performed this Saturday from 2AM to 6AM. Some online services may be temporarily unavailable during this time.',
                        timestamp: 'Yesterday',
                        reactions: []
                    }
                ],
                '1': [
                    { id: 1, sender: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1', content: 'Hello! How can I help you today?', timestamp: '12:00 PM', reactions: demoReactionsUser1 },
                    { id: 2, sender: 'You', avatar: currentUser.avatar, content: 'I need help with my project', timestamp: '12:05 PM', reactions: [{ emoji: '👍', users: [{ id: 'user1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' }] }] },
                    { id: 3, sender: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1', content: 'Sure, what kind of project is it?', timestamp: '12:10 PM', reactions: [] }
                ],
                '2': [
                    { id: 1, sender: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2', content: 'Hi there!', timestamp: '11:30 AM', reactions: demoReactionsUser2 },
                    { id: 2, sender: 'You', avatar: currentUser.avatar, content: 'Hello! How are you?', timestamp: '11:35 AM', reactions: [] }
                ],
                '3': [
                    { id: 1, sender: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?img=3', content: 'Did you finish the report?', timestamp: '10:00 AM', reactions: [] },
                    { id: 2, sender: 'You', avatar: currentUser.avatar, content: 'Almost done, just reviewing it now', timestamp: '10:05 AM', reactions: [] }
                ],
                '4': [
                    { id: 1, sender: 'Sarah Wilson', avatar: 'https://i.pravatar.cc/150?img=5', content: 'I\'ve updated the project timeline', timestamp: '09:30 AM', reactions: [] },
                    { id: 2, sender: 'David Lee', avatar: 'https://i.pravatar.cc/150?img=7', content: 'Looks good to me', timestamp: '09:35 AM', reactions: [] },
                    { id: 3, sender: 'You', avatar: currentUser.avatar, content: 'Can we discuss this in tomorrow\'s meeting?', timestamp: '09:40 AM', reactions: [] },
                    { id: 4, sender: 'Sarah Wilson', avatar: 'https://i.pravatar.cc/150?img=5', content: 'Sure, I\'ll add it to the agenda', timestamp: '09:45 AM', reactions: [] }
                ],
                '5': [
                    { id: 1, sender: 'Emily Chen', avatar: 'https://i.pravatar.cc/150?img=10', content: 'Don\'t forget about the assignment due next week!', timestamp: '2:00 PM', reactions: [] },
                    { id: 2, sender: 'Alex Rodriguez', avatar: 'https://i.pravatar.cc/150?img=11', content: 'Has anyone started on the research section?', timestamp: '2:05 PM', reactions: [] },
                    { id: 3, sender: 'You', avatar: currentUser.avatar, content: 'I\'ve already finished the first part', timestamp: '2:10 PM', reactions: [] },
                    { id: 4, sender: 'Jesse Brown', avatar: 'https://i.pravatar.cc/150?img=12', content: 'Can someone share their notes from yesterday?', timestamp: '2:15 PM', reactions: [] },
                    { id: 5, sender: 'Emily Chen', avatar: 'https://i.pravatar.cc/150?img=10', content: 'I\'ll send them later today', timestamp: '2:20 PM', reactions: [] }
                ],
                // Add subgroup messages
                'cs-lectures': [
                    { 
                        id: 1, 
                        sender: 'Prof. Johnson', 
                        avatar: 'https://i.pravatar.cc/150?img=20', 
                        content: 'Welcome to Computer Science Lectures channel!', 
                        timestamp: '09:00 AM',
                        reactions: []
                    },
                    { 
                        id: 2, 
                        sender: 'Prof. Johnson', 
                        avatar: 'https://i.pravatar.cc/150?img=20', 
                        content: 'The next lecture will cover neural networks and deep learning architectures.', 
                        timestamp: '09:15 AM',
                        reactions: [{ emoji: '👍', users: [{ id: 'user1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' }] }]
                    },
                    { 
                        id: 3, 
                        sender: 'Teaching Assistant', 
                        avatar: 'https://i.pravatar.cc/150?img=22', 
                        content: 'Please review chapters 5-7 before the lecture. There will be a quiz on this material.', 
                        timestamp: '10:30 AM',
                        reactions: []
                    }
                ],
                'cs-sections': [
                    { 
                        id: 1, 
                        sender: 'Teaching Assistant', 
                        avatar: 'https://i.pravatar.cc/150?img=22', 
                        content: 'Assignment 3 solutions have been posted.', 
                        timestamp: '2:15 PM',
                        reactions: []
                    },
                    { 
                        id: 2, 
                        sender: 'You', 
                        avatar: currentUser.avatar, 
                        content: 'Will we go over the solutions in the next section?', 
                        timestamp: '2:20 PM',
                        reactions: []
                    },
                    { 
                        id: 3, 
                        sender: 'Teaching Assistant', 
                        avatar: 'https://i.pravatar.cc/150?img=22', 
                        content: 'Yes, we will cover the most challenging problems from the assignment.', 
                        timestamp: '2:25 PM',
                        reactions: []
                    }
                ],
                'cs-admin': [
                    { 
                        id: 1, 
                        sender: 'Course Administrator', 
                        avatar: 'https://i.pravatar.cc/150?img=25', 
                        content: 'Midterm grades have been released. Check your student portal.', 
                        timestamp: '9:45 AM',
                        reactions: []
                    },
                    { 
                        id: 2, 
                        sender: 'Prof. Johnson', 
                        avatar: 'https://i.pravatar.cc/150?img=20', 
                        content: 'Office hours this week will be held on Tuesday from 2-4PM and Thursday from 1-3PM.', 
                        timestamp: '10:15 AM',
                        reactions: []
                    },
                    { 
                        id: 3, 
                        sender: 'Course Administrator', 
                        avatar: 'https://i.pravatar.cc/150?img=25', 
                        content: 'If you need special accommodations for the final exam, please submit your request by the end of this week.', 
                        timestamp: '11:30 AM',
                        reactions: []
                    }
                ],
                'math-lectures': [
                    { 
                        id: 1, 
                        sender: 'Prof. Smith', 
                        avatar: 'https://i.pravatar.cc/150?img=30', 
                        content: 'Chapter 5 material has been uploaded to the course website.', 
                        timestamp: '3:20 PM',
                        reactions: []
                    },
                    { 
                        id: 2, 
                        sender: 'Prof. Smith', 
                        avatar: 'https://i.pravatar.cc/150?img=30', 
                        content: 'Next lecture will focus on differential equations and their applications.', 
                        timestamp: '3:25 PM',
                        reactions: []
                    }
                ],
                'math-sections': [
                    { 
                        id: 1, 
                        sender: 'Teaching Assistant', 
                        avatar: 'https://i.pravatar.cc/150?img=32', 
                        content: 'Tutorial session tomorrow will be in Room 302B at 3PM.', 
                        timestamp: '11:50 AM',
                        reactions: []
                    },
                    { 
                        id: 2, 
                        sender: 'You', 
                        avatar: currentUser.avatar, 
                        content: 'Will we be covering the material from this week\'s lecture?', 
                        timestamp: '12:05 PM',
                        reactions: []
                    },
                    { 
                        id: 3, 
                        sender: 'Teaching Assistant', 
                        avatar: 'https://i.pravatar.cc/150?img=32', 
                        content: 'Yes, and we\'ll also do practice problems for the upcoming quiz.', 
                        timestamp: '12:30 PM',
                        reactions: [{ emoji: '👍', users: [currentUser] }]
                    }
                ],
                'phys-lectures': [
                    { 
                        id: 1, 
                        sender: 'Prof. Williams', 
                        avatar: 'https://i.pravatar.cc/150?img=40', 
                        content: 'Lecture slides for today\'s class are now available.', 
                        timestamp: '4:05 PM',
                        reactions: []
                    },
                    { 
                        id: 2, 
                        sender: 'Prof. Williams', 
                        avatar: 'https://i.pravatar.cc/150?img=40', 
                        content: 'We will have a guest lecturer next week discussing quantum computing applications.', 
                        timestamp: '4:10 PM',
                        reactions: [{ emoji: '🎉', users: [{ id: 'user4', name: 'Sarah Wilson', avatar: 'https://i.pravatar.cc/150?img=5' }] }]
                    }
                ],
                'math-admin': [
                    { 
                        id: 1, 
                        sender: 'Department Secretary', 
                        avatar: 'https://i.pravatar.cc/150?img=35', 
                        content: 'The final exam for Mathematics will be held in Room 201, Building A.', 
                        timestamp: '11:20 AM',
                        reactions: []
                    },
                    { 
                        id: 2, 
                        sender: 'Prof. Smith', 
                        avatar: 'https://i.pravatar.cc/150?img=30', 
                        content: 'All students must bring their ID cards to the exam.', 
                        timestamp: '11:25 AM',
                        reactions: []
                    },
                    { 
                        id: 3, 
                        sender: 'Department Secretary', 
                        avatar: 'https://i.pravatar.cc/150?img=35', 
                        content: 'Calculator policy for the final exam has been updated on the course website.', 
                        timestamp: '1:15 PM',
                        reactions: []
                    }
                ],
                'phys-sections': [
                    { 
                        id: 1, 
                        sender: 'Lab Instructor', 
                        avatar: 'https://i.pravatar.cc/150?img=42', 
                        content: 'Lab report template has been uploaded to the course files section.', 
                        timestamp: '9:30 AM',
                        reactions: []
                    },
                    { 
                        id: 2, 
                        sender: 'Lab Instructor', 
                        avatar: 'https://i.pravatar.cc/150?img=42', 
                        content: 'Remember to include error analysis in your lab reports this week.', 
                        timestamp: '9:35 AM',
                        reactions: []
                    },
                    { 
                        id: 3, 
                        sender: 'You', 
                        avatar: currentUser.avatar, 
                        content: 'Is there a specific format for the error calculations?', 
                        timestamp: '10:15 AM',
                        reactions: []
                    },
                    { 
                        id: 4, 
                        sender: 'Lab Instructor', 
                        avatar: 'https://i.pravatar.cc/150?img=42', 
                        content: 'Please follow the guidelines in Chapter 3 of your lab manual.', 
                        timestamp: '10:45 AM',
                        reactions: [{ emoji: '👍', users: [currentUser] }]
                    }
                ],
                'phys-admin': [
                    { 
                        id: 1, 
                        sender: 'Physics Department', 
                        avatar: 'https://i.pravatar.cc/150?img=45', 
                        content: 'The course syllabus has been updated to include the new textbook references.', 
                        timestamp: '2:00 PM',
                        reactions: []
                    },
                    { 
                        id: 2, 
                        sender: 'Prof. Williams', 
                        avatar: 'https://i.pravatar.cc/150?img=40', 
                        content: 'Students who missed the midterm must contact the department to arrange a makeup exam.', 
                        timestamp: '2:15 PM',
                        reactions: []
                    },
                    { 
                        id: 3, 
                        sender: 'Physics Department', 
                        avatar: 'https://i.pravatar.cc/150?img=45', 
                        content: 'There will be a department seminar this Friday at 3PM that counts as extra credit for this course.', 
                        timestamp: '4:30 PM',
                        reactions: [{ emoji: '🎯', users: [{ id: 'user5', name: 'David Lee', avatar: 'https://i.pravatar.cc/150?img=7' }] }]
                    }
                ],
                // Add Public Chat messages
                'cs-public': [
                    { 
                        id: 1, 
                        sender: 'John Doe', 
                        avatar: 'https://i.pravatar.cc/150?img=1', 
                        content: 'Has anyone started the final project yet?', 
                        timestamp: '08:20 AM',
                        reactions: []
                    },
                    { 
                        id: 2, 
                        sender: 'Jane Smith', 
                        avatar: 'https://i.pravatar.cc/150?img=2', 
                        content: 'I just started looking at the requirements yesterday.', 
                        timestamp: '08:25 AM',
                        reactions: []
                    },
                    { 
                        id: 3, 
                        sender: 'Mike Johnson', 
                        avatar: 'https://i.pravatar.cc/150?img=3', 
                        content: 'I\'m thinking of focusing on the neural network implementation part.', 
                        timestamp: '08:30 AM',
                        reactions: [{ emoji: '👍', users: [{ id: 'user1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' }] }]
                    },
                    { 
                        id: 4, 
                        sender: 'Sarah Wilson', 
                        avatar: 'https://i.pravatar.cc/150?img=5', 
                        content: 'Would anyone be interested in forming a study group for the final?', 
                        timestamp: '09:15 AM',
                        reactions: [{ emoji: '🙋', users: [{ id: 'user2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' }, { id: 'user3', name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?img=3' }] }]
                    },
                    { 
                        id: 5, 
                        sender: 'You', 
                        avatar: 'https://i.pravatar.cc/150?img=4', 
                        content: 'I\'d be interested in joining a study group!', 
                        timestamp: '09:20 AM',
                        reactions: []
                    }
                ],
                'math-public': [
                    { 
                        id: 1, 
                        sender: 'David Lee', 
                        avatar: 'https://i.pravatar.cc/150?img=7', 
                        content: 'Anyone want to form a study group for calc 3?', 
                        timestamp: '12:40 PM',
                        reactions: []
                    },
                    { 
                        id: 2, 
                        sender: 'Emily Chen', 
                        avatar: 'https://i.pravatar.cc/150?img=10', 
                        content: 'I\'m interested! What days are you thinking?', 
                        timestamp: '12:45 PM',
                        reactions: []
                    },
                    { 
                        id: 3, 
                        sender: 'Alex Rodriguez', 
                        avatar: 'https://i.pravatar.cc/150?img=11', 
                        content: 'Me too. I\'m struggling with the multivariable integrals section.', 
                        timestamp: '12:50 PM',
                        reactions: [{ emoji: '😔', users: [{ id: 'user10', name: 'Emily Chen', avatar: 'https://i.pravatar.cc/150?img=10' }] }]
                    },
                    { 
                        id: 4, 
                        sender: 'David Lee', 
                        avatar: 'https://i.pravatar.cc/150?img=7', 
                        content: 'Great! How about Wednesdays and Sundays in the library?', 
                        timestamp: '1:00 PM',
                        reactions: [{ emoji: '👍', users: [{ id: 'user10', name: 'Emily Chen', avatar: 'https://i.pravatar.cc/150?img=10' }, { id: 'user11', name: 'Alex Rodriguez', avatar: 'https://i.pravatar.cc/150?img=11' }] }]
                    }
                ],
                'phys-public': [
                    { 
                        id: 1, 
                        sender: 'Jesse Brown', 
                        avatar: 'https://i.pravatar.cc/150?img=12', 
                        content: 'Looking for a lab partner for the optics experiment next week.', 
                        timestamp: '4:30 PM',
                        reactions: []
                    },
                    { 
                        id: 2, 
                        sender: 'Taylor Smith', 
                        avatar: 'https://i.pravatar.cc/150?img=13', 
                        content: 'I still need a partner too. Want to team up?', 
                        timestamp: '4:45 PM',
                        reactions: []
                    },
                    { 
                        id: 3, 
                        sender: 'Jesse Brown', 
                        avatar: 'https://i.pravatar.cc/150?img=12', 
                        content: 'Yes, that would be great! I\'ll send you a direct message to coordinate.', 
                        timestamp: '4:50 PM',
                        reactions: [{ emoji: '👍', users: [{ id: 'user13', name: 'Taylor Smith', avatar: 'https://i.pravatar.cc/150?img=13' }] }]
                    }
                ]
            };
            setMessages((defaultMessages[currentChat] || []).map(m => ({...m, reactions: m.reactions || [] })));
        }
    }, [currentChat]); // currentUser is stable, no need to add to dependency array for this demo init

    // Load emojis from JSON file
    useEffect(() => {
        fetch('/emojis.json')
            .then(response => response.json())
            .then(data => {
                setEmojis(data);
            })
            .catch(error => {
                console.error('Error loading emojis:', error);
            });
    }, []);

    // Get current category emojis
    const getCurrentCategoryEmojis = () => {
        const category = emojis.find(cat => cat.slug === selectedEmojiCategory);
        return category ? category.emojis : [];
    };

    // Handle emoji category change
    const handleEmojiCategoryChange = (categorySlug) => {
        setSelectedEmojiCategory(categorySlug);
    };

    // Handle channel switching
    const handleChannelClick = (userId) => {
        const userData = directMessages.get(userId);
        if (!userData) return;
        
        // Update current chat
        setCurrentChat(userId);
        
        // Reset unread count
        const updatedMessages = new Map(directMessages);
        updatedMessages.get(userId).unread = 0;
        setDirectMessages(updatedMessages);
    };

    // Message menu functionality
    const handleMessageMenuClick = (e, messageId) => {
        e.stopPropagation();
        if (activeMessageMenu === messageId) {
            setActiveMessageMenu(null);
            menuButtonRef.current = null; // Clear ref when closing
        } else {
            setActiveMessageMenu(messageId);
            menuButtonRef.current = e.currentTarget; // Store ref when opening
        }
    };

    // Handle message actions
    const handleMessageAction = (action, message) => {
        switch (action) {
            case 'reply':
                setReplyInfo({
                    author: message.sender,
                    text: message.content,
                    isFile: message.isFile || false,
                    fileName: message.fileName || null,
                    fileSize: message.fileSize || null,
                    fileType: message.fileType || null,
                    fileDataUrl: message.fileDataUrl || null,
                    originalMessageId: message.id // Store the original message ID
                });
                setShowReplyContainer(true);
                if (messageInputRef.current) {
                    messageInputRef.current.focus();
                }
                break;
            case 'copy':
                navigator.clipboard.writeText(message.content);
                break;
            case 'forward':
                // Implement forward functionality
                setForwardingMessage(message);
                setShowForwardModal(true);
                break;
            case 'delete':
                setMessages(prev => prev.filter(m => m.id !== message.id));
                break;
            case 'edit':
                setEditingMessage(message); 
                if (messageInputRef.current) {
                    messageInputRef.current.value = message.content;
                    messageInputRef.current.focus();
                }
                // Close reply container if it was open
                setShowReplyContainer(false);
                setReplyInfo({ author: '', text: '' });
                break;
            case 'emoji':
                let actedMessageId = message.id;
                let actedEmoji = message.emoji;

                setMessages(prevMessages => {
                    const newMessages = prevMessages.map(m => {
                        if (m.id === actedMessageId) {
                            let reactions = Array.isArray(m.reactions) ? JSON.parse(JSON.stringify(m.reactions)) : [];
                            const existingReactionIndex = reactions.findIndex(r => r.emoji === actedEmoji);

                            if (existingReactionIndex > -1) {
                                const reaction = reactions[existingReactionIndex];
                                const userIndex = reaction.users.findIndex(u => u.id === currentUser.id);
                                if (userIndex > -1) {
                                    reaction.users.splice(userIndex, 1);
                                    if (reaction.users.length === 0) {
                                        reactions.splice(existingReactionIndex, 1);
                                    }
                                } else {
                                    reaction.users.push(currentUser);
                                }
                            } else {
                                reactions.push({ emoji: actedEmoji, users: [currentUser] });
                            }
                            return { ...m, reactions };
                        }
                        return m;
                    });

                    if (reactionPopover.show && reactionPopover.messageId === actedMessageId) {
                        const updatedMessageFromNewState = newMessages.find(m => m.id === actedMessageId);
                        if (updatedMessageFromNewState) {
                            const messageReactions = updatedMessageFromNewState.reactions || [];
                            const distinctEmojis = messageReactions.map(r => ({
                                emoji: r.emoji,
                                count: r.users.length
                            })).filter(r => r.count > 0);

                            let usersToDisplay = [];
                            const currentActiveTab = reactionPopover.activeReactionTab;
                            if (currentActiveTab === 'All') {
                                messageReactions.forEach(reaction => {
                                    reaction.users.forEach(user => {
                                        if (!usersToDisplay.find(u => u.id === user.id)) {
                                            usersToDisplay.push({ ...user, reactedEmoji: reaction.emoji });
                                        }
                                    });
                                });
                            } else {
                                const targetReaction = messageReactions.find(r => r.emoji === currentActiveTab);
                                usersToDisplay = targetReaction ? targetReaction.users.map(u => ({ ...u, reactedEmoji: targetReaction.emoji })) : [];
                            }

                            setReactionPopover(prevPopoverState => ({
                                ...prevPopoverState,
                                allReactionsForMessage: messageReactions,
                                distinctEmojisForPopover: distinctEmojis,
                                usersForActiveTab: usersToDisplay
                            }));
                        } else { 
                             setReactionPopover(prevPopoverState => ({ ...prevPopoverState, show: false }));
                        }
                    }
                    return newMessages;
                });

                // Explicitly close relevant pickers/menus after an emoji action
                if (emojiPickerContext?.mode === 'reaction') {
                    setShowEmojiPicker(false); // Close the full emoji picker if it was used for this reaction
                    setEmojiPickerContext(null); // Clear the context for the reaction emoji picker
                }
                setActiveMessageMenu(null); // Always close the message dropdown menu
                break;
        }
        // The if-block below is intended to close the menu for other actions, or if an emoji action wasn't from the reaction picker.
        // Given that setActiveMessageMenu(null) is now called directly above for ALL emoji actions,
        // this condition will be true for non-emoji actions, and for emoji actions it will be a redundant (but harmless) call to setActiveMessageMenu(null).
        if (action !== 'emoji' || emojiPickerContext?.mode !== 'reaction') {
             setActiveMessageMenu(null);
        }
    };

    // Add new message to chat
    const addMessage = (message) => {
        const newMessage = {
            ...message,
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // More unique ID
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reactions: message.reactions || [],
            isNew: true // Flag to identify new messages for animation
        };
        console.log("Adding message to state (full object):", JSON.stringify(newMessage, null, 2)); // Detailed log
        
        // Determine if this is a message from the current user
        const isCurrentUserMessage = message.sender === 'You';
        
        // Check if the user is already at the bottom of the chat before adding the message
        // Use a more reliable method with a larger threshold (200px)
        let isAtBottom = false;
        
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
            
            // Consider user at bottom if within 200px from bottom or at the very bottom
            isAtBottom = distanceFromBottom < 200 || scrollTop + clientHeight >= scrollHeight;
            console.log(`Scroll check: distance from bottom=${distanceFromBottom}px, isAtBottom=${isAtBottom}`);
        }
            
        // Add message to the state
        setMessages(prevMessages => [...prevMessages, newMessage]);
        
        // Scroll logic: always scroll for current user messages, only scroll for others if user was at bottom
        setTimeout(() => {
            if (messagesContainerRef.current) {
                // Auto-scroll if it's the current user's message OR if the user was already at the bottom
                if (isCurrentUserMessage || isAtBottom) {
                    console.log(`Auto-scrolling because: ${isCurrentUserMessage ? 'user message' : 'was at bottom'}`);
                    // Use a small delay to ensure DOM has updated
                    setTimeout(() => {
                        if (messagesContainerRef.current) {
                            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                        }
                    }, 50);
                }
                
                // Find the newly added message element and add animation class
                const messageElement = document.getElementById(`message-${newMessage.id}`);
                if (messageElement) {
                    // Add animation class based on message sender
                    messageElement.classList.add('new-message-animation');
                    
                    // Remove the animation class after animation completes
                    setTimeout(() => {
                        if (messageElement) {
                            messageElement.classList.remove('new-message-animation');
                        }
                    }, 500); // Match the animation duration in CSS
                }
            }
        }, 0);
    };

    // Send message
    const sendMessage = (text) => {
        const trimmedText = text ? text.trim() : '';

        if (!trimmedText && stagedFiles.length === 0 && !editingMessage) { // Added !editingMessage condition
            console.log("No text or staged files to send, and not in edit mode.");
            return;
        }
        if (!currentChat) {
            console.log("No current chat selected.");
            return;
        }
    
        const userData = directMessages.get(currentChat);
        if (!userData && !editingMessage) { // Added !editingMessage condition
            console.error("User data not found for current chat and not in edit mode.");
            return;
        }

        if (editingMessage) {
            // Logic for updating an existing message
            setMessages(prevMessages => 
                prevMessages.map(msg => 
                    msg.id === editingMessage.id 
                        ? { ...msg, content: trimmedText, isEdited: true, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } 
                        : msg
                )
            );
            setEditingMessage(null); // Clear editing state
            if (messageInputRef.current) {
                messageInputRef.current.value = ''; // Explicitly clear textarea after edit
            }
        } else {
            // Logic for sending a new message (existing logic)
            if (stagedFiles.length > 0) {
                stagedFiles.forEach((file, index) => {
                    const isLastFile = index === stagedFiles.length - 1;
                    let messageTextContent = null;
                    let actualReplyInfo = null;
                    let actualIsReply = false;

                    // If it's the last file AND there is text, this file message carries the text and reply context.
                    if (isLastFile && trimmedText) {
                        messageTextContent = trimmedText;
                        console.log(`DEBUG: Last file. Text content to add: "${messageTextContent}"`); // Debug log for text content
                        if (showReplyContainer) {
                            actualReplyInfo = replyInfo;
                            actualIsReply = true;
                        }
                    }

                    const fileMessageData = {
                        sender: 'You',
                        avatar: currentUser.avatar,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        isFile: true,
                        fileName: file.name,
                        fileSize: file.size,
                        fileType: file.type,
                        fileDataUrl: file.dataUrl,
                        content: messageTextContent, // Text content here
                        fileDisplayType: file.displayType,
                        isReply: actualIsReply,      // Reply context here
                        replyTo: actualIsReply && actualReplyInfo ? { 
                            ...actualReplyInfo
                        } : null
                    };
                    console.log("Sending file message:", fileMessageData);
                    addMessage(fileMessageData);
                });
            } else if (trimmedText) {
                // Only text, no files
                const textMessageData = {
                    sender: 'You',
                    avatar: currentUser.avatar,
                    content: trimmedText,
                    isReply: showReplyContainer,
                    replyTo: showReplyContainer ? {
                        author: replyInfo.author, 
                        text: replyInfo.text,
                        isFile: replyInfo.isFile,
                        fileName: replyInfo.fileName,
                        fileType: replyInfo.fileType,
                        fileDataUrl: replyInfo.fileDataUrl,
                        originalMessageId: replyInfo.originalMessageId // Include the original message ID
                    } : null,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                console.log("Sending text-only message:", textMessageData);
                addMessage(textMessageData);
            }
        
            // Clear input, reply container, and staged files
            if (messageInputRef.current) {
                messageInputRef.current.value = '';
            }
            setShowReplyContainer(false);
            setReplyInfo({ author: '', text: '' });
            setStagedFiles([]);
            setSelectedStagedImage(null); // Ensure selected staged image is also cleared
            if (editingMessage) setEditingMessage(null); // Clear editing state if it was active
        
            // Simulate reply (for demo purposes) - Only if a standalone text message with no files was sent
            if (!editingMessage && !stagedFiles.length && trimmedText && !showReplyContainer) { // Added !editingMessage
                setTimeout(() => {
                    addMessage({
                        sender: userData.name,
                        avatar: userData.avatar,
                        content: 'This is a demo reply for text-only message.',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    });
                }, 1000);
            }
        }
    };

    // Handle file upload
    const handleFileUpload = (e) => {
        const files = e.target.files;
        console.log("File upload triggered, files selected:", files?.length);

        if (!files || files.length === 0) {
            console.log("No files selected, exiting handleFileUpload.");
            return;
        }

        const filePromises = Array.from(files).map(file => {
            return new Promise((resolve, reject) => {
                console.log(`Starting to process file:`, file.name, file.type, file.size);
                const reader = new FileReader();
                reader.onload = (event) => {
                    const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
                    let fileTypeDisplay = 'File';
                    let isImage = false;
                    if (file.type.startsWith('image/')) {
                        fileTypeDisplay = 'Image';
                        isImage = true;
                    } else if (file.type.startsWith('video/')) {
                        fileTypeDisplay = 'Video'; // Videos will be treated like other files for now in preview
                    }
                    resolve({
                        id: file.name + Date.now() + Math.random(),
                        name: file.name,
                        size: `${fileSizeInMB} MB`,
                        type: file.type,
                        dataUrl: event.target.result, // This is key for image preview
                        displayType: fileTypeDisplay,
                        isImage: isImage
                    });
                };
                reader.onerror = (error) => {
                    console.error("Error reading file:", file.name, error);
                    reject(error);
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.allSettled(filePromises)
            .then(results => {
                const successfullyReadFiles = [];
                results.forEach(result => {
                    if (result.status === "fulfilled") {
                        successfullyReadFiles.push(result.value);
                    } else {
                        console.warn("A file could not be processed:", result.reason);
                    }
                });

                if (successfullyReadFiles.length > 0) {
                    setStagedFiles(prevStagedFiles => {
                        const updatedStagedFiles = [...prevStagedFiles, ...successfullyReadFiles];
                        console.log("Updating stagedFiles state with:", updatedStagedFiles);
                        // If no image is currently selected for preview, and the first new file is an image, select it.
                        if (!selectedStagedImage && updatedStagedFiles.length > 0 && updatedStagedFiles[0].isImage) {
                            setSelectedStagedImage(updatedStagedFiles[0]);
                        }
                        return updatedStagedFiles;
                    });
                } else {
                    console.log("No files were successfully processed to be staged.");
                }
            });

        if (e.target) {
            e.target.value = null;
        }
    };

    // Function to remove a staged file
    const removeStagedFile = (fileIdToRemove) => {
        setStagedFiles(prevStagedFiles => {
            const updatedStagedFiles = prevStagedFiles.filter(file => file.id !== fileIdToRemove);
            // If the removed file was the selected image, update the selected image
            if (selectedStagedImage && selectedStagedImage.id === fileIdToRemove) {
                if (updatedStagedFiles.length > 0 && updatedStagedFiles[0].isImage) {
                    setSelectedStagedImage(updatedStagedFiles[0]);
                } else {
                    setSelectedStagedImage(null); // No more images or no files left
                }
            }
            return updatedStagedFiles;
        });
    };

    // Function to handle selecting a staged image for enlarged preview
    const handleSelectStagedImage = (file) => {
        if (file.isImage) {
            setSelectedStagedImage(file);
        }
    };

    // Emoji picker functionality
    const toggleEmojiPicker = (e) => { // For main input emoji button
        if (e) e.stopPropagation();
        if (!showEmojiPicker) {
            setEmojiPickerContext({ mode: 'input', message: null, anchorEl: e?.currentTarget });
        } else {
            setEmojiPickerContext(null);
        }
        if (messageInputRef.current) {
            messageInputRef.current.focus();
        }
        setShowEmojiPicker(!showEmojiPicker);
    };

    const addEmoji = (emoji) => { // For adding emoji to input
        if (messageInputRef.current) {
            messageInputRef.current.value += emoji;
            // setShowEmojiPicker(false); // Keep picker open if user wants to add multiple
            messageInputRef.current.focus();
        }
    };

    // Function to open emoji picker for reactions
    const openFullEmojiPickerForReaction = (message, event) => {
        event.stopPropagation(); // Prevent menu from closing immediately
        setEmojiPickerContext({ mode: 'reaction', message: message, anchorEl: event.currentTarget });
        setShowEmojiPicker(true);
        // activeMessageMenu should remain open
    };

    // Open reaction details popover
    const openReactionPopover = (targetMessage, anchorElement, clickedEmoji = null) => {
        const messageReactions = targetMessage.reactions || [];

        const distinctEmojis = messageReactions.map(r => ({
            emoji: r.emoji,
            count: r.users.length
        })).filter(r => r.count > 0);

        let initialActiveTab = 'All';
        let usersToDisplay = [];

        if (clickedEmoji && distinctEmojis.some(de => de.emoji === clickedEmoji)) {
            initialActiveTab = clickedEmoji;
            const targetReaction = messageReactions.find(r => r.emoji === clickedEmoji);
            if (targetReaction) {
                usersToDisplay = targetReaction.users.map(user => ({ ...user, reactedEmoji: clickedEmoji }));
            }
        } else {
            messageReactions.forEach(reaction => {
                reaction.users.forEach(user => {
                    if (!usersToDisplay.find(u => u.id === user.id)) {
                        usersToDisplay.push({ ...user, reactedEmoji: reaction.emoji });
                    }
                });
            });
        }

        setReactionPopover(prev => ({
            ...prev,
            show: true,
            messageId: targetMessage.id,
            allReactionsForMessage: messageReactions,
            distinctEmojisForPopover: distinctEmojis,
            activeReactionTab: initialActiveTab,
            usersForActiveTab: usersToDisplay,
            anchorEl: anchorElement
        }));
    };

    // Handle changing active tab in reaction popover
    const handleReactionTabChange = (emojiTab) => {
        const currentMessageReactions = reactionPopover.allReactionsForMessage;
        let usersToDisplay = [];

        if (emojiTab === 'All') {
            currentMessageReactions.forEach(reaction => {
                reaction.users.forEach(user => {
                    if (!usersToDisplay.find(u => u.id === user.id)) {
                        usersToDisplay.push({ ...user, reactedEmoji: reaction.emoji });
                    }
                });
            });
        } else {
            const targetReaction = currentMessageReactions.find(r => r.emoji === emojiTab);
            if (targetReaction) {
                usersToDisplay = targetReaction.users.map(user => ({ ...user, reactedEmoji: emojiTab }));
            }
        }

        setReactionPopover(prev => ({
            ...prev,
            activeReactionTab: emojiTab,
            usersForActiveTab: usersToDisplay
        }));
    };

    // Close reaction details popover
    const closeReactionPopover = () => {
        setReactionPopover(prevState => ({ ...prevState, show: false, anchorEl: null }));
    };

    // Handle clicks outside emoji picker, reaction popover, and message dropdown menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close emoji picker
            if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                const emojiPickerAnchorEl = emojiPickerContext?.anchorEl;
                if (!(emojiPickerAnchorEl && emojiPickerAnchorEl.contains(event.target))) {
                    setShowEmojiPicker(false);
                    if (emojiPickerContext?.mode === 'input') {
                        setEmojiPickerContext(null);
                    }
                    // Do not reset context for reaction here, it's reset when menu closes or reaction chosen
                }
            }

            // Close reaction popover
            if (reactionPopover.show && reactionPopoverRef.current && !reactionPopoverRef.current.contains(event.target)) {
                if (!(reactionPopover.anchorEl && reactionPopover.anchorEl.contains(event.target))) {
                     closeReactionPopover();
                }
            }

            // Close poll voters popover
            if (pollVotersPopover.show && event.target.closest('.poll-voters-popover') === null) {
                if (!(pollVotersPopover.anchorEl && pollVotersPopover.anchorEl.contains(event.target))) {
                    // Cerrar directamente sin llamar a la función externa
                    setPollVotersPopover(prevState => ({ ...prevState, show: false, anchorEl: null }));
                }
            }

            // Close active message menu
            if (activeMessageMenu !== null &&
                menuButtonRef.current &&
                !menuButtonRef.current.contains(event.target) &&
                messageDropdownRef.current &&
                !messageDropdownRef.current.contains(event.target)
            ) {
                setActiveMessageMenu(null);
                menuButtonRef.current = null; // Clean up
            }

            // Close attachment menu
            if (showAttachmentMenu && 
                attachmentMenuButtonRef.current && 
                !attachmentMenuButtonRef.current.contains(event.target) &&
                attachmentMenuRef.current && 
                !attachmentMenuRef.current.contains(event.target)
            ) {
                setShowAttachmentMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker, emojiPickerContext, reactionPopover.show, reactionPopover.anchorEl, closeReactionPopover, activeMessageMenu, setActiveMessageMenu, setShowEmojiPicker, setEmojiPickerContext, showAttachmentMenu, setShowAttachmentMenu, pollVotersPopover.show, pollVotersPopover.anchorEl]);

    // Search functionality
    const handleSearch = (e) => {
        const searchValue = e.target.value.toLowerCase();
        setSearchTerm(searchValue);
        
        // If search term is empty, restore original messages
        if (!searchValue) {
            setDirectMessages(originalDirectMessages);
            return;
        }
        
        // Filter direct messages based on search term
        const filteredMessages = new Map();
        originalDirectMessages.forEach((userData, userId) => {
            if (userData.name.toLowerCase().includes(searchValue)) {
                filteredMessages.set(userId, userData);
            }
        });
        
        setDirectMessages(filteredMessages);
    };

    // Function to open the forward modal (can be called directly if needed)
    const openForwardModal = (message) => {
        setForwardingMessage(message);
        setShowForwardModal(true);
        setActiveMessageMenu(null); // Close the message menu
    };

    // Function to close the forward modal
    const closeForwardModal = () => {
        setShowForwardModal(false);
        setForwardingMessage(null);
    };

    // Function to confirm forwarding (placeholder for now)
    const confirmForwardMessage = (selectedChatIds) => {
        if (!forwardingMessage || !selectedChatIds || selectedChatIds.length === 0) {
            console.error("No message to forward or no recipients selected.");
            closeForwardModal();
            return;
        }
        console.log("Forwarding message:", forwardingMessage, "to chats:", selectedChatIds);
        // Here, you would typically iterate over selectedChatIds
        // and send the forwardingMessage to each selected chat.
        // This might involve calling a modified `sendMessage` or a new function
        // that handles adding messages to other chats.

        // For demonstration, let's assume it's forwarded and close the modal.
        closeForwardModal();
    };

    // Chat Info Panel functions
    const toggleChatInfoPanel = () => {
        setShowChatInfoPanel(prev => !prev);
        // Optionally reset to default tab when opening, or persist last tab
        if (!showChatInfoPanel) {
            setActiveChatInfoTab('Overview'); // Reset to English default
        }
    };

    const selectChatInfoTab = (tabName) => {
        setActiveChatInfoTab(tabName);
    };

    // Function to toggle mute status for a chat
    const toggleMuteChat = (chatId) => {
        setDirectMessages(prevDirectMessages => {
            const newDirectMessages = new Map(prevDirectMessages);
            const chatData = newDirectMessages.get(chatId);
            if (chatData) {
                newDirectMessages.set(chatId, { ...chatData, isMuted: !chatData.isMuted });
            }
            return newDirectMessages;
        });
        // Also update originalDirectMessages if you want mute state to persist across searches
        setOriginalDirectMessages(prevOriginalDirectMessages => {
            const newOriginalDirectMessages = new Map(prevOriginalDirectMessages);
            const chatData = newOriginalDirectMessages.get(chatId);
            if (chatData) {
                newOriginalDirectMessages.set(chatId, { ...chatData, isMuted: !chatData.isMuted });
            }
            return newOriginalDirectMessages;
        });
    };

    // Function to toggle pinned status for a chat
    const togglePinChat = (chatId) => {
        setDirectMessages(prevDirectMessages => {
            const newDirectMessages = new Map(prevDirectMessages);
            const chatData = newDirectMessages.get(chatId);
            if (chatData) {
                newDirectMessages.set(chatId, { ...chatData, isPinned: !chatData.isPinned });
            }
            return newDirectMessages;
        });
        // Also update originalDirectMessages to persist across searches
        setOriginalDirectMessages(prevOriginalDirectMessages => {
            const newOriginalDirectMessages = new Map(prevOriginalDirectMessages);
            const chatData = newOriginalDirectMessages.get(chatId);
            if (chatData) {
                newOriginalDirectMessages.set(chatId, { ...chatData, isPinned: !chatData.isPinned });
            }
            return newOriginalDirectMessages;
        });
    };

    // Image Lightbox functions
    const openImageLightbox = (clickedImageSrc, clickedImageName, allImagesInContext) => {
        const imageList = allImagesInContext.map(img => ({ src: img.src, name: img.name }));
        const currentIndex = imageList.findIndex(img => img.src === clickedImageSrc && img.name === clickedImageName);

        if (currentIndex !== -1) {
            setLightboxImage({
                src: clickedImageSrc,
                name: clickedImageName,
                currentIndex: currentIndex,
                imageList: imageList
            });
            setShowImageLightbox(true);
        } else {
            // Fallback if the clicked image isn't found in the list, open just that one (or handle error)
            setLightboxImage({
                src: clickedImageSrc,
                name: clickedImageName,
                currentIndex: 0, // Or -1 if you want to disable nav in this case
                imageList: [{ src: clickedImageSrc, name: clickedImageName }]
            });
            setShowImageLightbox(true);
        }
    };

    const closeImageLightbox = () => {
        setShowImageLightbox(false);
        setLightboxImage({ src: null, name: null, currentIndex: -1, imageList: [] });
    };

    const goToNextImageInLightbox = () => {
        setLightboxImage(prev => {
            if (prev.imageList.length === 0 || prev.currentIndex >= prev.imageList.length - 1) {
                return prev; // No next image or already at the end
            }
            const nextIndex = prev.currentIndex + 1;
            return {
                ...prev,
                src: prev.imageList[nextIndex].src,
                name: prev.imageList[nextIndex].name,
                currentIndex: nextIndex
            };
        });
    };

    const goToPreviousImageInLightbox = () => {
        setLightboxImage(prev => {
            if (prev.imageList.length === 0 || prev.currentIndex <= 0) {
                return prev; // No previous image or already at the start
            }
            const prevIndex = prev.currentIndex - 1;
            return {
                ...prev,
                src: prev.imageList[prevIndex].src,
                name: prev.imageList[prevIndex].name,
                currentIndex: prevIndex
            };
        });
    };

    // Attachment Menu functions
    const toggleAttachmentMenu = (event) => {
        if (event) {
            event.stopPropagation();
            event.preventDefault(); // Prevent default label behavior (opening file dialog)
        }
        
        console.log("Toggle attachment menu", showAttachmentMenu ? "close" : "open");
        
        // Store the current button as reference for positioning
        if (event?.currentTarget) {
            attachmentMenuButtonRef.current = event.currentTarget;
        }
        
        setShowAttachmentMenu(prev => !prev);
    };

    const handleAttachmentOptionClick = (optionType) => {
        setShowAttachmentMenu(false); // Close the menu
    
        if (!fileUploadRef.current) {
            console.error("File input reference is not available");
            return;
        }
    
        // Reset any previous state
        fileUploadRef.current.value = '';

        switch (optionType) {
            case 'media':
                console.log("Configuring for media: setting accept and multiple=true");
                fileUploadRef.current.accept = 'image/*,video/*';
                fileUploadRef.current.multiple = true;
                console.log(`Before click (media) - accept: ${fileUploadRef.current.accept}, multiple: ${fileUploadRef.current.multiple}`);
                fileUploadRef.current.click(); // Trigger file input directly
                break;
            case 'files':
                console.log("Configuring for files: setting accept and multiple=false");
                fileUploadRef.current.accept = '.pdf,.doc,.docx,.txt,.zip,.rar';
                fileUploadRef.current.multiple = true;
                console.log(`Before click (files) - accept: ${fileUploadRef.current.accept}, multiple: ${fileUploadRef.current.multiple}`);
                fileUploadRef.current.click(); // Trigger file input directly
                break;
            case 'poll':
                console.log("Poll creation selected - opening poll creator.");
                // Reiniciar el estado de la encuesta
                setPollData({
                    question: '',
                    options: ['', ''],
                    allowMultipleAnswers: false
                });
                setShowPollModal(true);
                break;
            default:
                break;
        }
    };

    // Funciones para manejar la encuesta
    const handlePollQuestionChange = (e) => {
        setPollData(prev => ({ ...prev, question: e.target.value }));
    };

    const handlePollOptionChange = (index, value) => {
        setPollData(prev => {
            const newOptions = [...prev.options];
            newOptions[index] = value;
            return { ...prev, options: newOptions };
        });
    };

    const addPollOption = () => {
        setPollData(prev => ({ ...prev, options: [...prev.options, ''] }));
    };

    const removePollOption = (index) => {
        if (pollData.options.length <= 2) return; // Mantener al menos 2 opciones
        
        setPollData(prev => {
            const newOptions = prev.options.filter((_, i) => i !== index);
            return { ...prev, options: newOptions };
        });
    };

    const togglePollSetting = (setting) => {
        setPollData(prev => ({ ...prev, [setting]: !prev[setting] }));
    };

    const closePollModal = () => {
        setShowPollModal(false);
    };

    const createPoll = () => {
        // Validar que la encuesta tenga una pregunta y al menos dos opciones válidas
        if (!pollData.question.trim()) {
            alert("Please enter a question");
            return;
        }

        const validOptions = pollData.options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
            alert("Please enter at least two valid options");
            return;
        }

        // Crear el mensaje de tipo encuesta
        const pollMessage = {
            id: `poll-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // ID único
            sender: 'You',
            avatar: currentUser.avatar,
            isPoll: true,
            pollData: {
                ...pollData,
                options: validOptions.map(opt => ({
                    text: opt,
                    votes: [],
                    percentage: 0
                })),
                totalVotes: 0,
                createdAt: new Date().toISOString()
            },
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Añadir la encuesta como un mensaje
        addMessage(pollMessage);
        closePollModal();
    };

    // Manejar voto en una encuesta
    const handlePollVote = (messageId, optionIndex) => {
        setMessages(prevMessages => {
            return prevMessages.map(message => {
                if (message.id === messageId && message.isPoll) {
                    // Crear una copia profunda del mensaje y sus datos de encuesta
                    const updatedPollData = JSON.parse(JSON.stringify(message.pollData));
                    
                    // Comprobar si el usuario ya ha votado en esta opción específica
                    if (!updatedPollData.options[optionIndex].votes) {
                        updatedPollData.options[optionIndex].votes = [];
                    }
                    
                    const userVoteIndex = updatedPollData.options[optionIndex].votes.findIndex(vote => 
                        vote === 'You' || (vote.id && vote.id === 'current_user_id_placeholder'));
                    
                    // Si el usuario ya votó por esta opción específica, quitar su voto (comportamiento toggle)
                    if (userVoteIndex !== -1) {
                        // Eliminar el voto de esta opción
                        updatedPollData.options[optionIndex].votes.splice(userVoteIndex, 1);
                        updatedPollData.totalVotes--;
                        
                        // Actualizar porcentajes
                        updatedPollData.options.forEach(option => {
                            option.percentage = updatedPollData.totalVotes > 0 
                                ? Math.round((option.votes.length / updatedPollData.totalVotes) * 100) 
                                : 0;
                        });
                        
                        return { ...message, pollData: updatedPollData };
                    }
                    
                    // Si la encuesta no permite múltiples respuestas, quitar votos anteriores
                    if (!updatedPollData.allowMultipleAnswers) {
                        let previousVoteRemoved = false;
                        
                        // Buscar y quitar votos en otras opciones
                        updatedPollData.options.forEach((option, idx) => {
                            if (idx !== optionIndex && option.votes) {
                                const voteIndex = option.votes.findIndex(vote => 
                                    vote === 'You' || (vote.id && vote.id === 'current_user_id_placeholder'));
                                
                                if (voteIndex !== -1) {
                                    option.votes.splice(voteIndex, 1);
                                    previousVoteRemoved = true;
                                }
                            }
                        });
                        
                        // Ajustar el total de votos si se quitó un voto anterior
                        if (previousVoteRemoved) {
                            updatedPollData.totalVotes--;
                        }
                    }
                    
                    // Añadir voto a la opción seleccionada
                    updatedPollData.options[optionIndex].votes.push('You');
                    updatedPollData.totalVotes++;
                    
                    // Actualizar porcentajes
                    updatedPollData.options.forEach(option => {
                        option.percentage = updatedPollData.totalVotes > 0 
                            ? Math.round((option.votes.length / updatedPollData.totalVotes) * 100) 
                            : 0;
                    });
                    
                    return { ...message, pollData: updatedPollData };
                }
                return message;
            });
        });
    };

    // Function to clear all staged files
    const clearAllStagedFiles = () => {
        setStagedFiles([]);
        setSelectedStagedImage(null);
        console.log("All staged files cleared.");
    };

    // Función para abrir el popover de votantes de encuestas
    const openPollVotersPopover = useCallback((messageId, anchorElement) => {
        // Buscar el mensaje con la encuesta
        const pollMessage = messages.find(m => m.id === messageId && m.isPoll);
        
        if (!pollMessage) {
            console.error("No se encontró el mensaje de encuesta");
            return;
        }

        // Recopilar todos los votantes de todas las opciones y las opciones disponibles
        const allVoters = [];
        const options = pollMessage.pollData.options || [];
        
        // Crear una copia de las opciones sin los votos (solo texto y metadata)
        const optionsData = options.map((option, index) => ({
            text: option.text,
            index: index,
            voteCount: option.votes?.length || 0
        }));
        
        options.forEach((option, optionIndex) => {
            if (option.votes && Array.isArray(option.votes)) {
                option.votes.forEach(voter => {
                    // Comprobar si es un objeto o una cadena
                    const voterId = typeof voter === 'string' ? voter : voter.id;
                    const voterName = typeof voter === 'string' ? voter : voter.name;
                    const voterAvatar = typeof voter === 'string' ? null : voter.avatar;
                    
                    // Añadir información sobre la opción votada
                    allVoters.push({
                        voter: typeof voter === 'string' ? voter : { id: voter.id, name: voterName, avatar: voterAvatar },
                        voterId, // Guardar el ID para facilitar el filtrado
                        optionText: option.text,
                        optionIndex
                    });
                });
            }
        });

        setPollVotersPopover({
            show: true,
            messageId,
            voters: allVoters,
            options: optionsData,
            activeTab: 'All',
            filteredVoters: allVoters, // Inicialmente, mostrar todos los votantes
            anchorEl: anchorElement
        });
    }, [messages]);

    // Función para manejar el cambio de pestañas en el popover de votantes
    const handlePollVotersTabChange = (tabValue) => {
        setPollVotersPopover(prevState => {
            let filteredVoters;
            
            if (tabValue === 'All') {
                // Si seleccionamos "All", mostrar todos los votantes
                filteredVoters = prevState.voters;
            } else {
                // Si seleccionamos una opción específica, filtrar por el índice de la opción
                const optionIndex = parseInt(tabValue);
                filteredVoters = prevState.voters.filter(voter => voter.optionIndex === optionIndex);
            }
            
            return {
                ...prevState,
                activeTab: tabValue,
                filteredVoters: filteredVoters
            };
        });
    };

    // Función para obtener todas las opciones votadas por un usuario
    const getVotedOptionsByUser = useCallback((messageId, userId) => {
        const message = messages.find(m => m.id === messageId);
        if (!message || !message.isPoll) return [];
        
        const votedOptions = [];
        message.pollData.options.forEach((option, index) => {
            if (option.votes && option.votes.some(vote => 
                vote === userId || (vote.id && vote.id === userId)
            )) {
                votedOptions.push({ text: option.text, index });
            }
        });
        
        return votedOptions;
    }, [messages]);

    // Función para cerrar el popover de votantes de encuestas
    const closePollVotersPopover = () => {
        setPollVotersPopover(prevState => ({ ...prevState, show: false, anchorEl: null }));
    };

    // Function to simulate receiving a new message - this would be replaced with real-time functionality
    const simulateIncomingMessage = (chatId, message) => {
        if (!chatId || !message) return;
        
        // First, add the message to the messages list if the chat is currently open
        if (chatId === currentChat) {
            addMessage(message);
        } else {
            // If the chat is not currently open, update the unread count
            setDirectMessages(prevState => {
                const newDirectMessages = new Map(prevState);
                const chatData = newDirectMessages.get(chatId);
                
                if (chatData) {
                    // Update last message and increment unread count
                    newDirectMessages.set(chatId, {
                        ...chatData,
                        lastMessage: message.content || (message.isFile ? 'Sent a file' : 'New message'),
                        lastTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        unread: (chatData.unread || 0) + 1
                    });
                }
                
                return newDirectMessages;
            });
            
            // Also update originalDirectMessages to keep it in sync
            setOriginalDirectMessages(prevState => {
                const newOriginalMessages = new Map(prevState);
                const chatData = newOriginalMessages.get(chatId);
                
                if (chatData) {
                    newOriginalMessages.set(chatId, {
                        ...chatData,
                        lastMessage: message.content || (message.isFile ? 'Sent a file' : 'New message'),
                        lastTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        unread: (chatData.unread || 0) + 1
                    });
                }
                
                return newOriginalMessages;
            });
        }
    };
    
    // Function to initialize demo notifications for testing
    const initDemoNotifications = () => {
        setTimeout(() => {
            // Only show notification if not currently viewing this chat
            if (currentChat !== 'cs-admin') {
                simulateIncomingMessage('cs-admin', {
                    sender: 'Course Administrator',
                    avatar: 'https://i.pravatar.cc/150?img=25',
                    content: 'Reminder: Final project submission deadline is approaching!',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
            }
        }, 10000); // After 10 seconds
        
        setTimeout(() => {
            if (currentChat !== '1') {
                simulateIncomingMessage('1', {
                    sender: 'John Doe',
                    avatar: 'https://i.pravatar.cc/150?img=1',
                    content: 'Hey, do you have time to meet tomorrow?',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
            }
        }, 15000); // After 15 seconds
        
        setTimeout(() => {
            if (currentChat !== 'math-sections') {
                simulateIncomingMessage('math-sections', {
                    sender: 'Teaching Assistant',
                    avatar: 'https://i.pravatar.cc/150?img=32',
                    content: 'Additional practice problems have been posted for the upcoming exam.',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
            }
        }, 20000); // After 20 seconds
    };
    
    // Initialize demo notifications on first load
    useEffect(() => {
        initDemoNotifications();
    }, []);

    return {
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
        currentUser,            
        pollVotersPopover,      

        // Refs
        messageInputRef,
        messagesContainerRef,
        emojiPickerRef,
        fileUploadRef,
        reactionPopoverRef,
        menuButtonRef,
        messageDropdownRef,
        attachmentMenuButtonRef, 
        attachmentMenuRef,       
        editingMessage, // Expose editingMessage state

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
        // Funciones para encuestas
        handlePollQuestionChange,
        handlePollOptionChange,
        addPollOption,
        removePollOption,
        togglePollSetting,
        closePollModal,
        createPoll,
        handlePollVote,
        // Funciones para el popover de votantes de encuestas
        openPollVotersPopover,
        closePollVotersPopover,
        handlePollVotersTabChange,
        getVotedOptionsByUser,
        togglePinChat,
        // New notification functions
        simulateIncomingMessage,
        setEditingMessage // Expose setEditingMessage function
    };
}