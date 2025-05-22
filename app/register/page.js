'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";


const Register = () => {
  
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
  
    // Validate form data
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
  
    try {
      // Create the user object to send to the API
      const userData = {
        username: formData.email,
        password: formData.password,
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
        // Add these options to help with CORS issues
        mode: 'cors',
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        if (response.status === 409) {
          throw new Error('An account with this email already exists.');
        } else {
          throw new Error('Registration failed. Please try again.');
        }
      }
      
      // Registration successful
      console.log('Registration successful');
      
      // Redirect to login page
      router.push('/login');
    } catch (err) {
      console.error('Full error object:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Register | AUTOMEET</title>
        <meta name="description" content="Create an account on AUTOMEET" />
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
                  <Link href="/landing">
                    <button className="btn btn-outline-light rounded-pill px-4 py-2">
                      Read More
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Side - Registration Form */}
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
              <h2 className="fw-bold mb-1">Hello There!</h2>
              <p className="text-muted mb-4">Create Your Account</p>
              
              {error && <div className="alert alert-danger py-2">{error}</div>}
              
              <form onSubmit={handleSubmit}>
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
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
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
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
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
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
                  Already have an account? <Link href="/login" className="text-decoration-none">Login</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;