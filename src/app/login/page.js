"use client";

import './styles/page.css'; // Import the CSS file
import Image from 'next/image';
import { useState, useEffect } from 'react';
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
  const router = useRouter();
  
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
        <Image 
          src="/images/university-campus.jpg" 
          alt="University Campus" 
          width={700} 
          height={900} 
          className="campus-image"
        />
      </div>
    </div>
  );
}
