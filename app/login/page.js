'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { refreshAccessToken } from '@/utils/auth';

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Check if the device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Check on resize
    window.addEventListener('resize', checkIfMobile);
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Track mouse position (only on non-mobile)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isMobile) {
        setMousePosition({
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isMobile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

   const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for handling cookies
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      // Store non-sensitive user data
      localStorage.setItem('user', JSON.stringify({
        username: data.username,
        isAdmin: data.isAdmin,
        role: data.role
      }));

      // Set up token refresh
      setupTokenRefresh();

      // Redirect to home page
      router.push('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Setup automatic token refresh
  const setupTokenRefresh = () => {
    // Refresh every 14 minutes (token expires in 15)
    const REFRESH_INTERVAL = 14 * 60 * 1000;
    
    const refreshInterval = setInterval(async () => {
      const success = await refreshAccessToken();
      if (!success) {
        clearInterval(refreshInterval);
        localStorage.removeItem('user');
        router.push('/login');
      }
    }, REFRESH_INTERVAL);

    // Store interval ID for cleanup
    window.refreshTokenInterval = refreshInterval;

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      clearInterval(window.refreshTokenInterval);
    });
  };

  // Initial token refresh check
  useEffect(() => {
    const checkAuth = async () => {
      const success = await refreshAccessToken();
      if (success) {
        router.push('/');
      }
    };

    if (localStorage.getItem('user')) {
      checkAuth();
    }
  }, [router]);

  // Google Sign-In handler
  const handleGoogleSignIn = () => {
    window.location.href = 'http://localhost:8080/api/auth/google';
  };

  return (
    <>
      <Head>
        <title>Login | AUTOMEET</title>
        <meta name="description" content="Login to your AUTOMEET account" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <div className="container-fluid p-0 min-vh-100">
        <div className="row g-0 min-vh-100">
          {/* Left Side - Blue Section */}
          <div 
            className={`col-md-7 d-flex flex-column ${isMobile ? 'order-2' : ''}`} 
            style={{
              background: 'linear-gradient(180deg, #3B3BD7 0%, #1F1F71 100%)',
              minHeight: isMobile ? '40vh' : 'auto'
            }}
          >
            <div className="d-flex flex-column flex-grow-1 justify-content-center">
              <div className={`mt-4 px-4 py-4 ${isMobile ? 'mx-3 rounded-4' : 'px-5'}`} style={{background: '#5F67FF'}}>
                <h1 className={`text-white fw-bold ${isMobile ? 'fs-2' : 'fs-1'}`}>AUTOMEET</h1>
                <p className={`text-white ${isMobile ? 'fs-6' : 'fs-5'} mt-3`}>
                  THE easiest way to schedule anything collaboratively.
                </p>
                
                <div className="mt-4 mb-2">
                  <Link href="landing">
                    <button className="btn btn-outline-light rounded-pill px-4 py-2">
                      Read More
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Side - Login Form */}
          <div 
            className={`col-md-5 d-flex align-items-center justify-content-center position-relative ${isMobile ? 'order-1' : ''}`} 
            style={{
              backgroundImage: 'url("/icons/background.png")',
              backgroundSize: 'cover',
              backgroundPosition: isMobile ? 'center' : `calc(50% + ${mousePosition.x * 20}px) calc(50% + ${mousePosition.y * 20}px)`,
              transition: 'background-position 0.3s ease-out',
              backgroundRepeat: 'no-repeat',
              minHeight: isMobile ? '60vh' : 'auto'
            }}
          >
            <div 
              className="bg-white shadow-lg rounded-4 p-4 m-3 position-relative" 
              style={{ 
                width: '100%', 
                maxWidth: '450px', 
                zIndex: 10 
              }}
            >
              <h2 className="fw-bold mb-1">Welcome Back!</h2>
              <p className="text-muted mb-4">Sign in to your account</p>
              
              {error && <div className="alert alert-danger py-2">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <div className="input-group text-secondary bg-white rounded-pill px-3" 
                      style={{ border: "2px solid #dee2e6" }}>
                      <span className="input-group-text text-secondary bg-transparent border-0">
                      <FaEnvelope />
                      </span>
                      <input 
                      type="text" 
                      className="form-control bg-transparent border-0" 
                      placeholder="Username or Email"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      style={{
                          height: "50px",
                      }}
                      />
                  </div>
                </div>

                <div className="mb-3">
                  <div className="input-group text-secondary bg-white rounded-pill px-3" 
                      style={{ border: "2px solid #dee2e6" }}>
                      <span className="input-group-text text-secondary bg-transparent border-0">
                      <FaLock />
                      </span>
                      <input 
                      type="password" 
                      className="form-control bg-transparent border-0" 
                      placeholder="Password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      style={{
                          height: "50px",
                      }}
                      />
                  </div>
                </div>
               
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2 mb-3 rounded-pill"
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
                
                <div className="d-flex align-items-center mb-3">
                  <div className="flex-grow-1 border-bottom"></div>
                  <span className="mx-3 text-muted">or</span>
                  <div className="flex-grow-1 border-bottom"></div>
                </div>
                
                <button 
                  type="button" 
                  className="btn btn-outline-secondary w-100 py-2 mb-3 rounded-pill"
                  onClick={handleGoogleSignIn}
                >
                  <span className="bi bi-google me-2"></span>
                  Sign in with Google
                </button>
                
                <p className="text-center mb-0">
                  Don&apos;t have an account? <Link href="/register" className="text-decoration-none">Register</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;