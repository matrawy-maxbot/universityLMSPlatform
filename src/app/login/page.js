"use client";

import './styles/page.css'; // Import the CSS file
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { loginUser } from './components/script';
import { useRouter } from 'next/navigation';
import { setCookie } from 'cookies-next';
import { mockCredentials } from '../mockData';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isChecking, setIsChecking] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isVideoTransitioning, setIsVideoTransitioning] = useState(false);
  const videoRef = useRef(null);
  const router = useRouter();
  
  // Array of video sources
  const videoSources = [
    '/videos/1.mp4',
    '/videos/2.mp4',
    '/videos/3.mp4',
    '/videos/4.mp4',
    '/videos/5.mp4'
  ];
  
  // Array of overlay content for each video
  const videoOverlayContent = [
    {
      title: "Welcome to 6 October University",
      text: "Your gateway to academic excellence"
    },
    {
      title: "Student Resources",
      text: "Access our libraries, labs and online learning platforms"
    },
    {
      title: "Campus Life",
      text: "Join clubs, activities and events to enrich your university experience"
    },
    {
      title: "Academic Programs",
      text: "Discover our diverse range of undergraduate and graduate programs"
    },
    {
      title: "Career Development",
      text: "Prepare for your future with internships and career counseling services"
    }
  ];
  
  // Function to handle video transition
  const handleVideoTransition = () => {
    if (!isVideoTransitioning) {
      setIsVideoTransitioning(true);
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videoSources.length);
      
      // Reset transitioning flag after transition completes
      setTimeout(() => {
        setIsVideoTransitioning(false);
      }, 500);
    }
  };
  
  // Fallback timer to check video progress and detect end
  useEffect(() => {
    let progressTimer;
    const checkVideoProgress = () => {
      const video = videoRef.current;
      if (video && video.duration > 0 && !isVideoTransitioning) {
        // If video is within 0.5 seconds of ending, consider it ended
        if (video.currentTime > 0 && video.duration - video.currentTime < 0.5) {
          handleVideoTransition();
        }
      }
    };
    
    if (videoRef.current) {
      // Check every 1 second
      progressTimer = setInterval(checkVideoProgress, 1000);
    }
    
    return () => {
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [videoSources.length, isVideoTransitioning]);
  
  // Handle video ended event to play the next video
  useEffect(() => {
    const handleVideoEnded = () => {
      handleVideoTransition();
    };
    
    // Additional handler for timeupdate event to check if video is at the end
    const handleTimeUpdate = () => {
      const video = videoRef.current;
      if (video && video.duration > 0 && !isVideoTransitioning) {
        // If video is at 99% of its duration, consider it ended
        if (video.currentTime / video.duration > 0.99) {
          handleVideoTransition();
        }
      }
    };
    
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('ended', handleVideoEnded);
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      
      // Initial play
      videoElement.play().catch(error => {
        console.error("Initial video play failed:", error);
        // Some browsers require user interaction before playing video
        // In this case, we can handle it gracefully
        if (error.name === 'NotAllowedError') {
          // We can add a play button or other alternative here if needed
          console.log("Autoplay not allowed. Waiting for user interaction.");
        }
      });
      
      return () => {
        videoElement.removeEventListener('ended', handleVideoEnded);
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [videoSources.length, isVideoTransitioning]);

  // Update video source when currentVideoIndex changes
  useEffect(() => {
    if (videoRef.current) {
      // Use directly set source attribute instead of src property
      const videoElement = videoRef.current;
      
      // Create and append new source element
      const source = document.createElement('source');
      source.src = videoSources[currentVideoIndex];
      source.type = 'video/mp4';
      
      // Preload the video before showing it
      const nextVideo = document.createElement('video');
      nextVideo.style.display = 'none';
      nextVideo.src = videoSources[currentVideoIndex];
      nextVideo.preload = 'auto';
      
      nextVideo.onloadeddata = () => {
        // Remove previous source elements
        while (videoElement.firstChild) {
          videoElement.removeChild(videoElement.firstChild);
        }
        
        // Add the new source
        videoElement.appendChild(source);
        
        // Reset and load
        videoElement.load();
        videoElement.play().catch(error => {
          console.error("Video play failed:", error);
        });
        
        // Remove the preload element
        if (nextVideo.parentNode) {
          nextVideo.parentNode.removeChild(nextVideo);
        }
      };
      
      // Add the preload video to the DOM temporarily
      document.body.appendChild(nextVideo);
      
      return () => {
        // Clean up preload video if component unmounts
        if (nextVideo.parentNode) {
          nextVideo.parentNode.removeChild(nextVideo);
        }
      };
    }
  }, [currentVideoIndex]);
  
  // Add additional event listener to ensure video plays
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const ensureVideoPlays = () => {
        if (videoElement.paused) {
          videoElement.play().catch(err => console.error("Failed to ensure video plays:", err));
        }
      };
      
      // Try to ensure video plays when document becomes visible
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          ensureVideoPlays();
        }
      });
      
      // Try to play video every 2 seconds if it's paused
      const playTimer = setInterval(() => {
        if (videoElement.paused && !isVideoTransitioning) {
          ensureVideoPlays();
        }
      }, 2000);
      
      return () => {
        clearInterval(playTimer);
      };
    }
  }, [isVideoTransitioning]);
  
  // Check if user is already logged in
  useEffect(() => {
    // تجنب التحقق إذا كان قد تم التحقق بالفعل في هذه الجلسة
    if (sessionStorage.getItem('auth_checked') === 'true') {
      setIsChecking(false);
      return;
    }
    
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        try {
          const userData = JSON.parse(user);
          if (userData && userData.type !== undefined) {
            // Set a flag in session storage to prevent rechecking on reload
            sessionStorage.setItem('auth_checked', 'true');
            // Redirect based on user type using window.location.href instead of router
            redirectUser(userData.type);
          } else {
            setIsChecking(false);
          }
        } catch (err) {
          console.error('Error parsing user data:', err);
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsChecking(false);
        }
      } else {
        // Set the flag even if not logged in to prevent rechecking
        sessionStorage.setItem('auth_checked', 'true');
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); // Clear previous errors
    
    try {
      // Try to login with ID as email
      let result = await loginUser({ email: userId, password });
      console.log('Login result:', result);
      
      if (!result.success) {
        setError(result.message);
        setIsLoading(false);
        return;
      }
      
      // Extract user data
      const userData = result.data.user;
      
      // Show success message
      setSuccess(`Welcome ${userData.firstname}! Redirecting...`);
      
      // Save token and user data in both localStorage and cookies
      localStorage.setItem('token', result.data.accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set cookies for middleware
      setCookie('access_token', result.data.accessToken, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
      setCookie('refresh_token', result.data.refreshToken, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
      setCookie('user_type', userData.type.toString(), {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });

      // Reset the auth_checked flag so redirection works properly on the target page
      sessionStorage.removeItem('auth_checked');
      
      // Add a small delay before redirecting for better UX
      setTimeout(() => {
        redirectUser(userData.type);
      }, 1000);
    } catch (err) {
      console.error('Error in login submit handler:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };
  
  // Helper function to redirect based on user type
  const redirectUser = (userType) => {
    // استخدم window.location.href بدلاً من router.push لضمان حذف ملفات صفحة تسجيل الدخول
    switch (parseInt(userType)) {
      case 0: // Student
        window.location.href = '/students/scheduling';
        break;
      case 1: // Assistant
        window.location.href = '/teachers/assistants/scheduling';
        break;
      case 2: // Doctor
        window.location.href = '/teachers/doctors/scheduling';
        break;
      case 3: // Admin
        window.location.href = '/admins/statics';
        break;
      case 4: // Department head (Doctor admin)
        window.location.href = '/teachers/doctors/scheduling';
        break;
      default:
        window.location.href = '/404';
    }
  };
  
  // Helper function to fill in example credentials
  const fillCredentials = (example) => {
    setUserId(example.email);
    setPassword(example.password);
  };

  // Show loading indicator while checking authentication
  if (isChecking) {
    return (
      <div className="login-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-form-section">
        <div className="logo-container">
          <Image src="/images/logo.png" alt="Logo" width={50} height={50} />
          <div className="logo-text-details">
            <span className="logo-line-1">6 October</span>
            <span className="logo-line-2">University</span>
          </div>
        </div>
        <h1 className="title">Sign in to College Platform</h1>
        <p className="subtitle">Access your courses and resources</p>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <div className="form-group">
            <label htmlFor="userId">Email</label>
            <div className="input-wrapper">
              <input 
                type="email" 
                id="userId" 
                name="userId" 
                placeholder="email@university.edu" 
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required 
                disabled={isLoading || success}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                disabled={isLoading || success}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="signin-button" 
            disabled={isLoading || success}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        <a href="#" className="forgot-password-link">Forgot password?</a>
        
        <div className="demo-credentials">
          <h3>Demo Login Credentials:</h3>
          <div className="credential-buttons">
            {mockCredentials.map((cred, index) => (
              <button 
                key={index} 
                className="credential-button" 
                onClick={() => fillCredentials(cred)}
                disabled={isLoading || success}
              >
                {cred.type}
              </button>
            ))}
          </div>
          <p className="demo-note">
            Click any button above to auto-fill demo login credentials.
            <br />
            <small>Note: All data is fictional for demonstration purposes only.</small>
          </p>
        </div>
        
        <div className="footer-note">
          <p>Need help? <a href="#">Contact IT Support</a></p>
        </div>
      </div>
      
      <div className="login-image-section">
        <video 
          ref={videoRef}
          className="campus-video"
          muted
          autoPlay
          playsInline
          loop={false}
          preload="auto"
          onEnded={handleVideoTransition}
          onError={(e) => {
            console.error("Video error:", e);
            // Try to recover by moving to next video after error
            setTimeout(() => handleVideoTransition(), 2000);
          }}
          style={{ opacity: isVideoTransitioning ? 0.5 : 1, transition: "opacity 0.5s ease" }}
        >
          <source src={videoSources[currentVideoIndex]} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="video-fullOverlay"></div>
        
        <div className="video-overlay">
          <h2>{videoOverlayContent[currentVideoIndex].title}</h2>
          <p>{videoOverlayContent[currentVideoIndex].text}</p>
          
          <div className="video-navigation">
            <button 
              className="nav-button"
              onClick={() => setCurrentVideoIndex((prevIndex) => 
                prevIndex === 0 ? videoSources.length - 1 : prevIndex - 1
              )}
            >
              &lt;
            </button>
            <div className="video-indicators">
              {videoSources.map((_, index) => (
                <span 
                  key={index} 
                  className={`video-indicator ${index === currentVideoIndex ? 'active' : ''}`}
                  onClick={() => setCurrentVideoIndex(index)}
                ></span>
              ))}
            </div>
            <button 
              className="nav-button"
              onClick={() => setCurrentVideoIndex((prevIndex) => 
                (prevIndex + 1) % videoSources.length
              )}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
