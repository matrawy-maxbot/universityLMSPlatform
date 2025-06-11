// Announcements - can be modified here
export const announcements = [
  {
    id: 1,
    title: "Welcome to the New Student Management System!",
    description: "We've launched a completely redesigned version of the system with advanced features to enhance user experience. The new system offers an easy-to-use interface and more comprehensive detailed reports.\n\nNew features include: ability to track request status, real-time updates for class schedules, and instant notifications for tasks and exams. You can now also view statistical reports about your academic performance with illustrative charts.\n\nWe've launched a completely redesigned version of the system with advanced features to enhance user experience. The new system offers an easy-to-use interface and more comprehensive detailed reports.\n\nNew features include: ability to track request status, real-time updates for class schedules, and instant notifications for tasks and exams. You can now also view statistical reports about your academic performance with illustrative charts.",
    imageUrl: "/images/announcements/o6u.jpg", // Using existing image
    link: "/tutorial",
    linkText: "Explore Now",
    publishDate: "2023-09-15"
  },
  {
    id: 2,
    title: "Updated Class Schedule",
    description: "Class schedules for the upcoming semester have been updated with several new courses added. Updates include important changes to lecture times, practical exercises, and final exam dates.\n\nPlease review the schedule carefully and ensure there are no time conflicts. The system has implemented a comprehensive schedule update based on student surveys and faculty suggestions. A new feature has also been added allowing you to export the schedule to your personal calendar.\n\nWe've launched a completely redesigned version of the system with advanced features to enhance user experience. The new system offers an easy-to-use interface and more comprehensive detailed reports.\n\nNew features include: ability to track request status, real-time updates for class schedules, and instant notifications for tasks and exams. You can now also view statistical reports about your academic performance with illustrative charts.",
    imageUrl: "/images/shadcn.jpg", // Using existing image
    link: "/students/scheduling",
    linkText: "View Schedule",
    publishDate: "2023-09-20"
  }
];

// Check if announcements should be shown
function shouldShowAnnouncements() {
  // Always show announcements (check for previous viewing removed)
  return true;
}

// Save the date when announcements were shown
function markAnnouncementsAsShown() {
  try {
    localStorage.setItem('lastAnnouncementShown', new Date().toDateString());
  } catch (e) {
    console.error("Error saving announcement viewing date:", e);
  }
}

// Create announcement elements
export function createAnnouncementDialog() {
  // If the announcement was already shown today, don't show it again
  if (!shouldShowAnnouncements()) {
    return;
  }

  let currentIndex = 0;

  // Create HTML elements
  const overlayElement = document.createElement('div');
  overlayElement.className = 'announcement-overlay';
  
  // Create container
  const dialogContainer = document.createElement('div');
  dialogContainer.className = 'announcement-container';
  
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.className = 'announcement-close';
  closeButton.textContent = '×';
  closeButton.onclick = closeDialog;
  
  // Create scrollable wrapper for content and image
  const scrollWrapper = document.createElement('div');
  scrollWrapper.className = 'announcement-scroll-wrapper';
  
  // Create image container
  const imageContainer = document.createElement('div');
  imageContainer.className = 'announcement-image-container';
  
  const image = document.createElement('img');
  image.className = 'announcement-image';
  image.src = announcements[currentIndex].imageUrl;
  image.alt = announcements[currentIndex].title;

  imageContainer.appendChild(image);

  const overlay = document.createElement('div');
  overlay.className = 'announcement-image-overlay';

  imageContainer.appendChild(overlay);
  
  // Create content
  const contentContainer = document.createElement('div');
  contentContainer.className = 'announcement-content';
  
  const title = document.createElement('h2');
  title.className = 'announcement-title';
  title.textContent = announcements[currentIndex].title;
  
  const description = document.createElement('p');
  description.className = 'announcement-description';
  description.textContent = announcements[currentIndex].description;
  
  const actionButton = document.createElement('button');
  actionButton.className = 'announcement-action';
  actionButton.textContent = announcements[currentIndex].linkText;
  actionButton.onclick = () => {
    window.location.href = announcements[currentIndex].link;
    closeDialog();
  };
  
  // Add all elements to content
  contentContainer.appendChild(title);
  contentContainer.appendChild(description);
  contentContainer.appendChild(actionButton);
  
  // Add image and content to the scroll wrapper
  scrollWrapper.appendChild(imageContainer);
  scrollWrapper.appendChild(contentContainer);
  
  // Create navigation buttons
  const navigationContainer = document.createElement('div');
  navigationContainer.className = 'announcement-navigation';
  
  const prevButton = document.createElement('button');
  prevButton.className = 'announcement-nav-button';
  prevButton.textContent = 'Previous';
  prevButton.disabled = true; // Disable on first announcement
  prevButton.onclick = () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateContent();
    }
  };
  
  const indicatorsContainer = document.createElement('div');
  indicatorsContainer.className = 'announcement-indicators';
  
  for (let i = 0; i < announcements.length; i++) {
    const indicator = document.createElement('span');
    indicator.className = i === 0 ? 'announcement-indicator active' : 'announcement-indicator';
    indicator.onclick = () => {
      currentIndex = i;
      updateContent();
    };
    indicatorsContainer.appendChild(indicator);
  }
  
  const nextButton = document.createElement('button');
  nextButton.className = 'announcement-nav-button';
  nextButton.textContent = 'Next';
  nextButton.onclick = () => {
    if (currentIndex < announcements.length - 1) {
      currentIndex++;
      updateContent();
    } else {
      closeDialog();
    }
  };
  
  // Add navigation buttons to navigation container
  navigationContainer.appendChild(prevButton);
  navigationContainer.appendChild(indicatorsContainer);
  navigationContainer.appendChild(nextButton);
  
  // Add all elements to main container
  dialogContainer.appendChild(closeButton);
  dialogContainer.appendChild(scrollWrapper);
  dialogContainer.appendChild(navigationContainer);
  
  overlayElement.appendChild(dialogContainer);
  
  // Add container to the body
  document.body.appendChild(overlayElement);
  
  // Add scroll handler to manually control image scale for browsers without scroll timeline support
  scrollWrapper.addEventListener('scroll', () => {
    document.documentElement.style.setProperty('--scroll-position', 
      `${Math.min(1, scrollWrapper.scrollTop / 150)}`);
  });
  
  // Update content when navigating between announcements
  function updateContent() {
    image.src = announcements[currentIndex].imageUrl;
    image.alt = announcements[currentIndex].title;
    title.textContent = announcements[currentIndex].title;
    description.textContent = announcements[currentIndex].description;
    actionButton.textContent = announcements[currentIndex].linkText;
    actionButton.onclick = () => {
      window.location.href = announcements[currentIndex].link;
      closeDialog();
    };
    
    // Update indicators
    const indicatorElements = indicatorsContainer.getElementsByClassName('announcement-indicator');
    for (let i = 0; i < indicatorElements.length; i++) {
      if (i === currentIndex) {
        indicatorElements[i].classList.add('active');
      } else {
        indicatorElements[i].classList.remove('active');
      }
    }
    
    // Update button states
    prevButton.disabled = currentIndex === 0;
    nextButton.textContent = currentIndex < announcements.length - 1 ? 'Next' : 'Close';
    
    // Reset scroll position when changing announcements
    scrollWrapper.scrollTop = 0;
    document.documentElement.style.setProperty('--scroll-position', '0');
  }
  
  // Close the announcement
  function closeDialog() {
    overlayElement.classList.add('announcement-closing');
    setTimeout(() => {
      document.body.removeChild(overlayElement);
      markAnnouncementsAsShown(); // Record that announcements were shown
    }, 300);
  }
}

// Start the process after page load - used in client.js
export function initAnnouncements() {
  // Show announcements immediately without delay
  createAnnouncementDialog();
} 