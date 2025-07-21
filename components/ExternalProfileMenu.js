/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { 
  FaUser, 
  FaSignInAlt,
  FaAdjust,
  FaEnvelope,
  FaLock
} from 'react-icons/fa';

const ExternalProfileMenu = () => {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password
        })
      });

      if (!response.ok) {
        let errorMsg = 'Login failed';
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMsg = errorData.error;
          }
        } catch {
          // Fallback to default error message
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      // Store non-sensitive user data
      localStorage.setItem('user', JSON.stringify({
        username: data.username,
        isAdmin: data.isAdmin,
        role: data.role
      }));

      // Close modal and redirect
      setShowLoginModal(false);
      router.push('/');
      
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form data
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        username: registerData.email,
        password: registerData.password,
        isadmin: false,
        role: "", 
        phone_number: "",
        profile_pic: ""
      };
      
      const response = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        mode: 'cors',
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('An account with this email already exists.');
        } else {
          throw new Error('Registration failed. Please try again.');
        }
      }
      
      // Registration successful - close modal and show login
      setShowRegisterModal(false);
      setShowLoginModal(true);
      setError('Registration successful! Please log in.');
      
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = 'http://localhost:8080/api/auth/google';
  };
  return (
    <>
      <div className="container font-inter py-3" style={{ maxWidth: '800px' }}>
        <div className="d-flex flex-column justify-content-between bg-white rounded-3 p-3 shadow">
          <div>
            <div className="d-flex align-items-center mb-3">
              <div className="position-relative">
                <img
                  src="/profile.png"
                  alt="Profile"
                  className="rounded-circle bg-light"
                  style={{ width: '56px', height: '56px' }}
                />
              </div>
              <div className="ms-3">
                <h5 className="mb-0 fw-bold">Guest<br/>Account</h5>
              </div>
            </div>
            
            <hr className="my-3" />
            
            <div className="list-group mb-3">
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="border-0 list-group-item list-group-item-action d-flex align-items-center px-3 py-2 bg-transparent"
                style={{ cursor: 'pointer' }}
              >
                <FaUser className="me-3" size={18} />
                <span className="fs-6">Register</span>
              </button>
              <button 
                onClick={() => setShowLoginModal(true)}
                className="border-0 list-group-item list-group-item-action d-flex align-items-center px-3 py-2 bg-transparent"
                style={{ cursor: 'pointer' }}
              >
                <FaSignInAlt className="me-3" size={18} />
                <span className="fs-6">Log in</span>
              </button>
            </div>
            
            <hr className="my-3" />
            
            <div className="list-group">
              <Link href="/theme" className="border-0 list-group-item list-group-item-action d-flex align-items-center justify-content-between px-3 py-2">
                <div className="d-flex align-items-center">
                  <FaAdjust className="me-3" size={18} />
                  <span className="fs-6">Theme</span>
                </div>
                <span>&gt;</span>
              </Link>
            </div>
          </div> 
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Welcome Back!</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowLoginModal(false);
                    setError('');
                    setLoginData({ username: '', password: '' });
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger py-2">{error}</div>}
                
                <form onSubmit={handleLoginSubmit}>
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
                        value={loginData.username}
                        onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                        required
                        style={{ height: "50px" }}
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
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        required
                        style={{ height: "50px" }}
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
                    Don&apos;t have an account? 
                    <button 
                      type="button"
                      className="btn btn-link text-decoration-none p-0 ms-1"
                      onClick={() => {
                        setShowLoginModal(false);
                        setShowRegisterModal(true);
                        setError('');
                      }}
                    >
                      Register
                    </button>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Hello There!</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowRegisterModal(false);
                    setError('');
                    setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger py-2">{error}</div>}
                
                <form onSubmit={handleRegisterSubmit}>
                  <div className="mb-3">
                    <div className="input-group text-secondary bg-white rounded-pill px-3" 
                        style={{ border: "2px solid #dee2e6" }}>
                        <span className="input-group-text text-secondary bg-transparent border-0">
                        <FaUser />
                        </span>
                        <input 
                        type="text" 
                        className="form-control bg-transparent border-0" 
                        placeholder="Full Name"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                        required
                        style={{ height: "50px" }}
                        />
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="input-group text-secondary bg-white rounded-pill px-3" 
                        style={{ border: "2px solid #dee2e6" }}>
                        <span className="input-group-text text-secondary bg-transparent border-0">
                        <FaEnvelope />
                        </span>
                        <input 
                        type="email" 
                        className="form-control bg-transparent border-0" 
                        placeholder="Email Address"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                        required
                        style={{ height: "50px" }}
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
                        value={registerData.password}
                        onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                        required
                        style={{ height: "50px" }}
                        />
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="input-group text-secondary bg-white rounded-pill px-3" 
                        style={{ border: "2px solid #dee2e6" }}>
                        <span className="input-group-text text-secondary bg-transparent border-0">
                        <FaLock />
                        </span>
                        <input 
                        type="password" 
                        className="form-control bg-transparent border-0" 
                        placeholder="Confirm Password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                        required
                        style={{ height: "50px" }}
                        />
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 py-2 mb-3 rounded-pill"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Register'}
                  </button>
                  
                  <p className="text-center mb-0">
                    Already have an account? 
                    <button 
                      type="button"
                      className="btn btn-link text-decoration-none p-0 ms-1"
                      onClick={() => {
                        setShowRegisterModal(false);
                        setShowLoginModal(true);
                        setError('');
                      }}
                    >
                      Login
                    </button>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExternalProfileMenu;