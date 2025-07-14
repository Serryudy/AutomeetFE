/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FiUser, FiClock, FiEdit2 } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import emailjs from '@emailjs/browser';

const HomePage = () => {
  const styles = {
    home: { backgroundColor: "#f0f0f0", padding: "1.5%", fontFamily: "sans-serif" },
    navBrand: { width: "60%", height: "60%" },
    navLink: { fontWeight: 600, fontSize: "1.2rem" },
    button: { fontWeight: 600, padding: "10px 20px", borderRadius: "10px", transition: "all 0.3s ease-in-out", hover: "ba" },
    buttonPrimary: { backgroundColor: "#3B3BD7", borderColor: "#3B3BD7", color: "white" },
    buttonOutline: { borderColor: "#EBEBEB", color: "#000" },
    googleButton: { backgroundColor: "#3B3BD7", borderColor: "#3B3BD7", color: "white", fontWeight: "900pt" },
    emailButton: { backgroundColor: "#323268", borderColor: "#323268", color: "white" },
    heading: { fontWeight: 700, fontSize: "2.8rem" },
    subheading: { fontWeight: 500, fontSize: "1.4rem" },
    featureItem: {
      flex: "0 0 auto", width: "300px", padding: "20px", margin: "0 15px",
      background: "#fff", borderRadius: "10px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
    },
    featureSliderTrack: { display: "flex", animation: "slideFeatures 30s linear infinite" },
    fullSection: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    }
  };

  const animations = `
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); }
    }
    @keyframes floatCard {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-10px) rotate(1deg); }
    }
    @keyframes floatDelayed {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    @keyframes floatCardDelayed {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-8px) rotate(-1deg); }
    }
    @keyframes scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes slideFeatures {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    .feature-carousel-container {
      overflow: hidden;
      position: relative;
    }

    .feature-slider-track {
      display: flex;
      animation: slideFeatures 30s linear infinite;
      width: 200%;
    }

    .feature-item {
      flex: 0 0 auto;
      padding: 20px;
      background: #fff;
      border-radius: 15px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      min-height: 350px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .feature-item:hover {
      transform: translateY(-10px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    }

    .feature-slider-track:hover {
      animation-play-state: paused;
    }

    .feature-carousel-container::before,
    .feature-carousel-container::after {
      content: '';
      position: absolute;
      top: 0;
      width: 100px;
      height: 100%;
      z-index: 10;
      pointer-events: none;
    }

    .feature-carousel-container::before {
      left: 0;
      background: linear-gradient(to right, #f0f0f0, transparent);
    }

    .feature-carousel-container::after {
      right: 0;
      background: linear-gradient(to left, #f0f0f0, transparent);
    }

    @media (max-width: 768px) {
      .feature-item {
        width: 250px !important;
        margin: 0 10px !important;
        min-height: 320px;
      }
    }

    @media (min-width: 769px) {
      .feature-item {
        width: 300px !important;
        margin: 0 15px !important;
      }
    }

    .hover-opacity-100:hover {
      opacity: 1 !important;
      transition: opacity 0.3s ease;
    }
    footer a:hover {
      color: white !important;
      opacity: 1 !important;
      transition: all 0.3s ease;
    }
    input::placeholder { color: rgba(255, 255, 255, 0.6) !important; }
    textarea::placeholder { color: rgba(255, 255, 255, 0.6) !important; }
    input { color: white !important; }
    textarea { color: white !important; }
    footer .position-fixed:hover {
      transform: translateY(-3px);
      transition: transform 0.3s ease;
    }

    /* Responsive Typography */
    @media (max-width: 1200px) {
      .responsive-heading {
        font-size: 2.5rem !important;
      }
      .responsive-subheading {
        font-size: 1.3rem !important;
      }
      .responsive-display {
        font-size: 2.5rem !important;
      }
    }

    @media (max-width: 992px) {
      .responsive-heading {
        font-size: 2.2rem !important;
      }
      .responsive-subheading {
        font-size: 1.2rem !important;
      }
      .responsive-display {
        font-size: 2.2rem !important;
      }
      .mobile-text-center {
        text-align: center !important;
      }
      .mobile-mb-4 {
        margin-bottom: 2rem !important;
      }
    }

    @media (max-width: 768px) {
      .responsive-heading {
        font-size: 1.8rem !important;
        line-height: 1.3 !important;
      }
      .responsive-subheading {
        font-size: 1.1rem !important;
        line-height: 1.4 !important;
      }
      .responsive-display {
        font-size: 1.8rem !important;
        line-height: 1.3 !important;
      }
      .mobile-padding {
        padding: 0 15px !important;
      }
      .mobile-section-padding {
        padding: 2rem 0 !important;
      }
      .mobile-hide {
        display: none !important;
      }
    }

    @media (max-width: 576px) {
      .responsive-heading {
        font-size: 1.5rem !important;
      }
      .responsive-subheading {
        font-size: 1rem !important;
      }
      .responsive-display {
        font-size: 1.5rem !important;
      }
      .small-mobile-padding {
        padding: 0 10px !important;
      }
      .full-section {
        min-height: auto !important;
        padding: 3rem 0 !important;
      }
    }

    /* Additional responsive utilities */
    @media (max-width: 991px) {
      .desktop-menu { display: none !important; }
      .hamburger { display: block !important; }
      .mobile-menu { display: block !important; }
      .mobile-menu.closed { display: none !important; }
      .nav-brand-container { width: auto !important; }
      .mobile-menu .nav-link { text-align: center !important; }
    }
    
    @media (max-width: 576px) {
      .navbar-container { padding-left: 15px !important; padding-right: 15px !important; }
      .mobile-menu .nav-link { text-align: center !important; }
    }

    .login-btn:hover {
      background-color: #3B3BD7 !important;
      color: white !important;
      transform: translateY(-2px);
    }

    .get-started-btn:hover {
      background-color: #2A2AA0 !important;
      border-color: #2A2AA0 !important;
      transform: translateY(-2px);
    }
    .mobile-menu a:hover {
      background-color: #f0f0f0 !important;
      color: #3B3BD7 !important;
    }

    .error-message {
      color: #ff6b6b;
      font-size: 12px;
      margin-top: 5px;
      display: block;
    }

    .input-error {
      border: 1px solid #ff6b6b !important;
      box-shadow: 0 0 0 0.2rem rgba(255, 107, 107, 0.25) !important;
    }

    .success-message {
      color: #51cf66;
      font-size: 14px;
      margin-top: 10px;
      margin-bottom: 10px; 
      padding: 10px;
      background-color: rgba(81, 207, 102, 0.1);
      border-radius: 5px;
      border-left: 3px solid #51cf66;
    }
  `;

  // ALL HOOKS AT COMPONENT LEVEL
  const featuresRef = useRef(null);
  const form = useRef();

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    message: ''
  });

  const [formErrors, setFormErrors] = useState({
    fullName: '',
    email: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Carousel state - MOVED TO COMPONENT LEVEL
  const [isMobile, setIsMobile] = useState(false);

  // Auto-clear success message
  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess]);

  // Handle responsive behavior - MOVED TO COMPONENT LEVEL
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll to Features Section
  const scrollToFeatures = (e) => {
    e.preventDefault();
    if (featuresRef.current) {
      const elementPosition = featuresRef.current.offsetTop;

      window.scrollTo({
        top: 2400,
        behavior: "smooth"
      });
    }
  };

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation function
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Full Name validation
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
      isValid = false;
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters long';
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Message validation
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
      isValid = false;
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters long';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear success message when user starts editing
    if (submitSuccess) {
      setSubmitSuccess(false);
    }
  };

  // Submit handler with proper validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // IMPORTANT: Validate form BEFORE proceeding
    if (!validateForm()) {
      console.log('Form validation failed:', formErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Sending email with data:', formData);
      
      // Send email using EmailJS
      const result = await emailjs.sendForm(
        "service_64qxpe8", 
        "template_zf8j137", 
        form.current, 
        "aXIH89B0VxmHZEaO8"
      );

      console.log('EmailJS result:', result);

      if (result.text === "OK") {
        // Reset form on success
        setFormData({
          fullName: '',
          email: '',
          message: ''
        });
        setFormErrors({});
        setSubmitSuccess(true);
        console.log('Email sent successfully!');
      }
      
    } catch (error) {
      console.error('EmailJS Error:', error);
      setFormErrors({ 
        submit: 'Failed to send message. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
      setIsOpen(!isOpen);
    };

    const navStyles = {
      navBrand: {
        maxWidth: '100%',
        height: 'auto',
      },
      navLink: {
        color: '#333',
        fontWeight: '700',
        fontSize: '18px'
      },
      button: {
        borderRadius: '8px',
        padding: '8px 16px',
        fontWeight: '700',
        transition: 'all 0.3s ease',
        fontSize: '17px'
      },
      loginButton: {
        borderRadius: '8px',
        padding: '8px 16px',
        fontWeight: '700',
        transition: 'all 0.3s ease',
        fontSize: '17px',
        backgroundColor: 'transparent',
        color: '#000000',
      },
      getStartedButton: {
        borderRadius: '8px',
        padding: '8px 16px',
        fontWeight: '700',
        transition: 'all 0.3s ease',
        fontSize: '17px',
        backgroundColor: '#3B3BD7',
        border: '2px solid #3B3BD7',
        color: 'white'
      },
      hamburger: {
        width: '30px',
        height: '25px',
        position: 'relative',
        cursor: 'pointer',
        display: 'none',
      },
      hamburgerLine: {
        width: '90%',
        height: '3px',
        backgroundColor: '#333',
        position: 'absolute',
        borderRadius: '3px',
        transition: 'all 0.3s ease',
      },
      mobileMenu: {
        display: 'none',
        position: 'absolute',
        borderRadius: '8px',
        top: '70px',
        right: '20px',
        width: '250px',
        backgroundColor: 'white',
        padding: '20px',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        zIndex: '999',
      },
      mobileLink: {
        padding: '12px 0',
        borderBottom: '1px solid #eee',
        display: 'block',
        color: '#333',
        textDecoration: 'none',
        fontWeight: '500',
      },
      mobileButtons: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginTop: '15px',
      },
    };

    return (
      <>
        <nav className="navbar navbar-expand-lg navbar-light navbar-container fixed-top px-3 px-md-5" style={{ backgroundColor: "#f0f0f0", height: "auto", minHeight: "80px", zIndex: 1000 }}>
          <div className="d-flex justify-content-between align-items-center w-100">
            <Link href="/" className="navbar-brand nav-brand-container">
              <Image
                src="/logo.png"
                alt="Logo"
                width={180}
                height={60}
                style={navStyles.navBrand}
                className="d-block"
              />
            </Link>

            <div className="desktop-menu d-flex align-items-center" style={{ gap: '40px' }}>
              <a
                href="#features"
                className="nav-link"
                onClick={scrollToFeatures}
                style={navStyles.navLink}
              >
                Features
              </a>
              <a href="login">
                <button className="btn login-btn" style={navStyles.loginButton}>
                Log In
              </button>
              </a>
              <a href="register">
                <button className="btn get-started-btn" style={navStyles.getStartedButton}>
                Get Started
              </button>
              </a>
            </div>

            <div
              className="hamburger"
              style={navStyles.hamburger}
              onClick={toggleMenu}
            >
              <span style={{ ...navStyles.hamburgerLine, top: isOpen ? '10px' : '0', transform: isOpen ? 'rotate(45deg)' : 'none' }}></span>
              <span style={{ ...navStyles.hamburgerLine, top: '10px', opacity: isOpen ? 0 : 1 }}></span>
              <span style={{ ...navStyles.hamburgerLine, top: isOpen ? '10px' : '22px', transform: isOpen ? 'rotate(-45deg)' : 'none' }}></span>
            </div>
          </div>

          <div className={`mobile-menu ${isOpen ? '' : 'closed'}`} style={navStyles.mobileMenu}>
            <a
              href="#features"
              className="nav-link px-3"
              onClick={(e) => {
                scrollToFeatures(e);
                setIsOpen(false);
              }}
              style={navStyles.navLink}
            >
              Features
            </a>
            <div style={navStyles.mobileButtons}>
              <button className="btn login-btn w-100" style={navStyles.loginButton}>
                Log In
              </button>
              <button className="btn get-started-btn w-100" style={navStyles.getStartedButton}>
                Get Started
              </button>
            </div>
          </div>
        </nav>
      </>
    );
  };

  const renderHero = () => (
    <div className="full-section" style={{ ...styles.fullSection, paddingTop: "10px" }}>
      <div className="container h-100 d-flex align-items-center mobile-padding">
        <div className="row align-items-center justify-content-center w-100">
          <div className="col-lg-6 col-md-12 mobile-text-center mobile-mb-4">
            <h2 className="mt-4 pt-2 ps-2 responsive-heading" style={styles.heading}>
              Meetings That Run Themselves
            </h2>
            <p className="mt-4 ps-2 responsive-subheading" style={styles.subheading}>
              Tired of managing calendars, links, and notes? AutoMeet automates organizing, hosting, and
              summarizing your meetings effortlessly.
            </p>
            <a href="register" style={{ textDecoration: "none" }}>
              <div className="row ps-2 text-white">
                {[
                  {
                    style: styles.googleButton,
                    icon: <img src="/gmail.png" style={{ width: '30px', marginRight: '30px' }} />,
                    text: "Sign up with Google"
                  },
                  {
                    style: styles.emailButton,
                    icon: <img src="/email.png" style={{ width: '30px', marginRight: '40px' }} />,
                    text: "Sign up with Email"
                  }
                ].map((btn, i) => (
                  <div key={i} className="col-lg-10 col-md-8 col-12 mb-2 mt-3 " >
                    <button className="btn btn-lg w-100 d-flex align-items-center justify-content-center" style={btn.style}>
                      {btn.icon}
                      <span>{btn.text}</span>
                    </button>
                  </div>
                ))}
              </div>
            </a>
          </div>
          <div className="col-lg-6 col-md-12 d-none d-lg-block">
            <img src="/Home1.png" alt="Calendar interface" className="img-fluid" style={{ maxWidth: '100%', height: 'auto', paddingTop: "10px" }} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSeizeDay = () => (
    <section className="full-section mobile-section-padding" style={styles.fullSection}>
      <div className="container d-flex align-items-center mobile-padding">
        <div className="row align-items-center justify-content-center w-100">
          <div className="col-lg-6 col-md-12 text-center order-2 order-lg-1 mobile">
            <img
              src="/onecalender.png"
              alt="Calendar demonstration"
              className="img-fluid"
              style={{ width: "110%", height: "auto", maxWidth: "600px" }}
            />
          </div>
          <div className="col-lg-6 col-md-12 mb-5 pb-5 order-1 order-lg-2 mobile-text-center">
            <h2 className="responsive-heading" style={styles.heading}>
              Seize the Day,<br /> One Meeting at a Time!
            </h2>
            <p className="my-4 responsive-subheading" style={styles.subheading}>
              Dynamic scheduling, seamless collaboration, and smart automation
              your meetings, redefined.
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  const renderFeatures = () => {
    const features = [
      { img: "/notes.png", title: "Take your own notes", desc: "Capture ideas seamlessly during ongoing discussions." },
      { img: "/ai.png", title: "AI help to keep track", desc: "Instant meeting summaries at your fingertips." },
      { img: "/event.png", title: "Event customization", desc: "Keep a hold of your schedule with standalone customization." }
    ];

    const timeRemaining = "2 hours 30 minutes";

    return (
      <section ref={featuresRef} id="features" className="py-4 mobile-section-padding">
        <div className="container justify-content-center mobile-padding" style={{ width: "90%" }}>
          <div className="row">
            <div className="col-lg-6 col-md-12 mobile-mb-4" style={{ margin: "0 auto", padding: "0 4%" }}>
              {features.map((feature, i) => (
                <div key={i} className="mb-5 mobile-text-center">
                  <div className="d-flex align-items-center justify-content-center justify-content-lg-start">
                    <img
                      src={feature.img}
                      alt={feature.title.toLowerCase()}
                      style={{ width: "60px", height: "60px" }}
                      className="flex-shrink-0"
                    />
                    <h2 className="ms-3 responsive-heading" style={{ fontSize: "1.8rem", fontWeight: "bold" }}>
                      {feature.title}
                    </h2>
                  </div>
                  <p className="my-3 responsive-subheading" style={{ fontSize: "1.1rem", fontWeight: "300" }}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
            <div className="col-lg-5 col-md-12 d-flex" >
              <div className="position-relative" >
                <div className="position-relative" style={{
                  width: "125%",
                  maxWidth: "500px",
                  minHeight: "400px",
                  backgroundColor: "white",
                  borderRadius: "20px",
                  boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)",
                  overflow: "hidden",
                  padding: "25px"
                }}>

                  <div className="position-absolute" style={{
                    width: "70%",
                    height: "60%",
                    right: "25%",
                    bottom: "40%",
                    backgroundColor: "#FFE033",
                    opacity: "0.8",
                    borderRadius: "5%",
                    zIndex: "0"
                  }} />

                  <div className="position-absolute" style={{
                    width: "200px",
                    height: "200px",
                    top: "59%",
                    left: "50%",
                    backgroundColor: "#0048FF",
                    opacity: "0.6",
                    borderRadius: "50%",
                    zIndex: "0"
                  }} />

                  <div className="position-relative shadow-lg p-3" style={{
                    marginTop: "20%",
                    backgroundColor: "#CAD9FF",
                    borderRadius: "10px",
                    zIndex: "10",
                    width: "100%"
                  }}>
                    <div className="text-left">
                      <h3 className="font-medium" style={{ fontSize: "18px" }}>
                        <b>Event name:</b> <span style={{ fontSize: "14px" }}><b>20/34 80:14</b></span>
                      </h3>
                      <p className="text-gray-600 mt-1" style={{ fontSize: "13px", fontWeight: "350" }}>
                        <b>Sub description about the meeting.</b>
                      </p>

                      <div className="d-flex mt-3 align-items-center">
                        <div className="d-flex" style={{ gap: '2px' }}>
                          <FiUser size={16} className="text-blue-800" />
                          <FiUser size={16} className="text-blue-800" />
                          <FiUser size={16} className="text-blue-800" />
                        </div>
                        <span className="text-gray-600 ms-2" style={{ fontSize: "11px" }}>2+ others</span>
                      </div>

                      <div className="d-flex align-items-center mt-2">
                        <FiClock size={14} />
                        <span className="text-gray-600 ms-2" style={{ fontSize: "12px" }}>
                          Starts in {timeRemaining}
                        </span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-end mt-2">
                      <button
                        className="d-flex align-items-center text-white px-3 py-1"
                        style={{
                          backgroundColor: "#3B3BD7",
                          borderRadius: "5px",
                          border: "none",
                          fontSize: "12px"
                        }}
                      >
                        Edit&nbsp;&nbsp;
                        <FiEdit2 size={9} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderCTA = () => (
    <section className="full-section mobile-section-padding" style={styles.fullSection}>
      <div className="container h-100 d-flex align-items-center mobile-padding">
        <div className="text-center w-100">
          <h2 className="responsive-display fw-bold mb-4" style={{ fontSize: "3.3rem" }}>
            One platform to schedule, analyze, and run meetings better.
          </h2>
          <h4 className="responsive-subheading mt-4 mb-5" style={{ fontSize: "1.5rem" }}>
            AutoMeet simplifies meeting scheduling with AI, real-time availability, seamless collaboration, smart notifications, content sharing, and analysis even for participants without accounts. Meetings, redefined.
          </h4>
          <a href="register" style={{ textDecoration: "none" }}>
            <button className="btn btn-lg d-flex align-items-center justify-content-center mx-auto"
              style={{ fontSize: "1.3rem", background: "#3B3BD7", color: "white", padding: "12px 24px", borderRadius: "8px", textDecoration: "none" }}>
              Create an Account
              <svg width="25" height="25" viewBox="0 0 28 24" fill="currentColor" className="ms-1">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
              </svg>
            </button>
          </a>
        </div>
      </div>
    </section>
  );

  // FIXED: Feature Carousel without hooks inside function
  const renderFeatureCarousel = () => {
    const features = [
      {
        id: 1,
        title: "Instant Meeting Links",
        description: "Generate and share meeting links with a single click.",
        image: "/feature 1.png"
      },
      {
        id: 2,
        title: "Smart Integrations",
        description: "Connect email, calendars, and messaging apps effortlessly.",
        image: "/feature 2.png"
      },
      {
        id: 3,
        title: "Seamless Scheduling",
        description: "AutoMeet syncs calendars to find the perfect time, no hassle.",
        image: "/feature 3.png"
      },
      {
        id: 4,
        title: "Automated Notes",
        description: "Get AI-powered notes and summaries automatically.",
        image: "/feature 4.png"
      },
      {
        id: 5,
        title: "Smart Reminders",
        description: "Stay on track with automatic reminders and follow-ups.",
        image: "/feature 5.png"
      }
    ];

    return (
      <section className="full-section mobile-section-padding" style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: "#f0f0f0",
        padding: "4rem 0"
      }}>
        <div className="container h-100 d-flex flex-column justify-content-center mobile-padding">
          <div className="row mb-5">
            <div className="col-lg-6 col-md-12 mobile-text-center mobile-mb-4">
              <h2 className="fw-bold responsive-heading" style={{ fontSize: "2.5rem", color: "#333" }}>
                Features That Do the Work for You
              </h2>
            </div>
            <div className="col-lg-6 col-md-12 mobile-text-center mt-2">
              <h4 className="responsive-subheading opacity-75" style={{ fontSize: "1.4rem", color: "#666" }}>
                Let AutoMeet handle the details so you can focus on the conversation, not the coordination
              </h4>
            </div>
          </div>

          <div className="feature-carousel-container pt-2">
            <div className="feature-slider-track">
              {/* First set of features */}
              <div className="d-flex">
                {features.map(feature => (
                  <div 
                    key={`first-${feature.id}`} 
                    className="feature-item"
                    style={{
                      width: isMobile ? "250px" : "300px",
                      margin: isMobile ? "0 10px" : "0 15px"
                    }}
                  >
                    <div className="text-center">
                      <h4 className="mb-3 fw-bold" style={{ fontSize: "1.3rem", color: "#333" }}>
                        {feature.title}
                      </h4>
                      <div className="mb-1 d-flex justify-content-center">
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="img-fluid"
                          style={{ 
                            width: "80%", 
                            height: "200px", 
                            objectFit: "contain",
                            borderRadius: "10px"
                          }}
                        />
                      </div>
                      <p className="fw-500" style={{ fontSize: "0.95rem", color: "#555" }}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Second set for seamless loop */}
              <div className="d-flex">
                {features.map(feature => (
                  <div 
                    key={`second-${feature.id}`} 
                    className="feature-item"
                    style={{
                      width: isMobile ? "250px" : "300px",
                      margin: isMobile ? "0 10px" : "0 15px"
                    }}
                  >
                    <div className="text-center">
                      <h4 className="mb-3 fw-bold" style={{ fontSize: "1.2rem", color: "#333" }}>
                        {feature.title}
                      </h4>
                      <div className="mb-3 d-flex justify-content-center">
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="img-fluid"
                          style={{ 
                            width: "80%", 
                            height: "200px", 
                            objectFit: "contain",
                            borderRadius: "10px"
                          }}
                        />
                      </div>
                      <p className="fw-500" style={{ fontSize: "0.95rem", color: "#555" }}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Three set for seamless loop */}
              <div className="d-flex">
                {features.map(feature => (
                  <div 
                    key={`third-${feature.id}`} 
                    className="feature-item"
                    style={{
                      width: isMobile ? "250px" : "300px",
                      margin: isMobile ? "0 10px" : "0 15px"
                    }}
                  >
                    <div className="text-center">
                      <h4 className="mb-3 fw-bold" style={{ fontSize: "1.2rem", color: "#333" }}>
                        {feature.title}
                      </h4>
                      <div className="mb-3 d-flex justify-content-center">
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="img-fluid"
                          style={{ 
                            width: "80%", 
                            height: "200px", 
                            objectFit: "contain",
                            borderRadius: "10px"
                          }}
                        />
                      </div>
                      <p className="fw-500" style={{ fontSize: "0.95rem", color: "#555" }}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Footer with working validation and EmailJS
  const renderFooter = () => {
    return (
      <footer
        className="pt-5 pb-3 mt-5"
        style={{
          backgroundColor: "#232342",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div className="container">
          <div className="row text-white mb-5">
            <div className="col-lg-5 mb-4 ">
              <div className="mb-4">
                <img
                  src="/logo.png"
                  alt="AutoMeet Logo"
                  style={{ width: "180px" }}
                />
              </div>
              <p className="opacity-75 mb-4" style={{ width: "85%" }}>
                AutoMeet transforms your meeting experience with AI-powered
                scheduling, note-taking, and seamless integrations.
              </p>
              <div className="d-flex gap-3">
                {["linkedin", "twitter", "facebook", "instagram"].map(
                  (icon) => (
                    <a key={icon} href="#" className="text-decoration-none">
                      <div
                        className="bg-white bg-opacity-10 rounded-circle p-2 d-flex align-items-center justify-content-center"
                        style={{ width: "40px", height: "40px" }}
                      >
                        <i className={`bi bi-${icon} text-white`}></i>
                      </div>
                    </a>
                  )
                )}
              </div>
            </div>

            {/* Contact Form Section with FIXED Validation */}
            <div className="col-lg-7 mb-4">
              <h5 className="fw-bold mb-4">Contact Us</h5>
              {submitSuccess && (
                <div className="success-message">
                  ✅ Thank you! Your message has been sent successfully. We will get back to you soon.
                </div>
              )}
              
              <form ref={form} onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`form-control text-white border-0 ${
                        formErrors.fullName ? "input-error" : ""
                      }`}
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        height: "45px",
                        borderRadius: "8px",
                      }}
                    />
                    {formErrors.fullName && (
                      <span className="error-message">
                        {formErrors.fullName}
                      </span>
                    )}
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`form-control text-white border-0 ${
                        formErrors.email ? "input-error" : ""
                      }`}
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        height: "45px",
                        borderRadius: "8px",
                      }}
                    />
                    {formErrors.email && (
                      <span className="error-message">{formErrors.email}</span>
                    )}
                  </div>
                  
                  <div className="col-12 mb-3">
                    <textarea
                      name="message"
                      placeholder="Type your message here..."
                      rows="4"
                      value={formData.message}
                      onChange={handleInputChange}
                      className={`form-control text-white border-0 ${
                        formErrors.message ? "input-error" : ""
                      }`}
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        resize: "vertical",
                      }}
                    ></textarea>
                    {formErrors.message && (
                      <span className="error-message">
                        {formErrors.message}
                      </span>
                    )}
                  </div>
                  
                  <div className="col-12">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn text-white fw-bold px-4 py-2"
                      style={{
                        backgroundColor: isSubmitting ? "#666" : "#3B3BD7",
                        border: "none",
                        borderRadius: "8px",
                        transition: "all 0.3s ease",
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </button>
                    {formErrors.submit && (
                      <div className="error-message mt-2">
                        {formErrors.submit}
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Rest of footer */}
          <div className="row text-white py-4 mb-4">
            <div className="col-md-5 d-flex align-items-center">
              <div className="me-4">
                <h5 className="fw-bold mb-0">Get the AutoMeet Products</h5>
                <p className="opacity-75 mb-0">
                  Manage your meetings on the go
                </p>
              </div>
            </div>
            <div className="col-md-7 d-flex align-items-center">
              <div className="d-flex gap-3 flex-wrap">
                {[
                  {
                    icon: "apple",
                    title: "App Store",
                    subtitle: "Download on the",
                  },
                  {
                    icon: "google-play",
                    title: "Google Play",
                    subtitle: "GET IT ON",
                  },
                  {
                    icon: "download",
                    title: "Browser Extension",
                    subtitle: "Add to Browser",
                  },
                ].map((store, i) => (
                  <a key={i} href="#" className="text-decoration-none">
                    <div
                      className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                    >
                      <div style={{ fontSize: "24px" }}>
                        <i className={`bi bi-${store.icon} text-white`}></i>
                      </div>
                      <div>
                        <div
                          className="text-white opacity-75"
                          style={{ fontSize: "12px" }}
                        >
                          {store.subtitle}
                        </div>
                        <div className="text-white fw-bold">{store.title}</div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-white opacity-10 my-4" />

          <div className="row text-white">
            <div className="col-md-6 mb-3 mb-md-0">
              <p className="mb-0 opacity-75">
                © 2025 AutoMeet. All rights reserved.
              </p>
            </div>
            <div className="col-md-6">
              <div className="d-flex flex-wrap justify-content-md-end gap-4">
                {["Terms of Service", "Privacy Policy", "Cookies"].map(
                  (link, i) => (
                    <a
                      key={i}
                      href="#"
                      className="text-white opacity-75 text-decoration-none hover-opacity-100"
                    >
                      {link}
                    </a>
                  )
                )}
              </div>
            </div>
          </div>

          <div
            className="position-fixed bottom-0 end-0 mb-4 me-4 d-flex align-items-center justify-content-center"
            style={{
              width: "50px",
              height: "50px",
              backgroundColor: "#3B3BD7",
              borderRadius: "50%",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
              zIndex: 1000,
            }}
            onClick={function () {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <i className="bi bi-arrow-up text-white"></i>
          </div>
        </div>

        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
        />
        <style jsx global>
          {animations}
        </style>
      </footer>
    );
  };

  return (
    <div style={styles.home}>
      {renderNavbar()}
      {renderHero()}
      {renderSeizeDay()}
      {renderFeatures()}
      {renderCTA()}
      {renderFeatureCarousel()}
      {renderFooter()}
    </div>
  );
};

export default HomePage;