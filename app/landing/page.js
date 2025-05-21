/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @next/next/no-img-element */
'use client';
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaGoogle } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FiUser, FiClock, FiEdit2 } from 'react-icons/fi';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
      height: "100vh",
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
    input { color: white !important; }
    footer .position-fixed:hover {
      transform: translateY(-3px);
      transition: transform 0.3s ease;
    }
  `;

  /*const renderNavbar = () => (
    <nav className="navbar navbar-expand-lg navbar-light px-5">
      <a className="navbar-brand" href="#" style={{ width: "22%" }}>
        <img src="/logo.png" alt="Logo" style={styles.navBrand} />
      </a>
      <div className="mx-auto d-flex" style={{ padding: "1% 7% 0 0" }}>
        {["For Whom?", "Product", "Features"].map((item, i) => (
          <a key={i} className="nav-link px-3" href={`#${item.toLowerCase().replace("?", "")}`} style={styles.navLink}>{item}</a>
        ))}
      </div>
      <div>
        <button className="btn btn-outline-primary mx-3" style={{...styles.button, ...styles.buttonOutline}}>Log In</button>
        <button className="btn btn-primary" style={{...styles.button, ...styles.buttonPrimary}}>Get Started</button>
      </div>
    </nav>
  );*/
  const renderNavbar = () => {

    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
      setIsOpen(!isOpen);
    };

    const styles = {
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

      hamburger: {
        width: '30px',
        height: '25px',
        position: 'relative',
        cursor: 'pointer',
        display: 'none', // Hidden by default on desktop
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
        display: 'none', // Hidden by default
        position: 'absolute',
        borderRadius: '8px',
        top: '50px',
        left: '0',
        right: '0',
        backgroundColor: 'white',
        padding: '10px 20px 20px',
        
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
        <style jsx>{`
        @media (max-width: 991px) {
          .desktop-menu { display: none !important; }
          .hamburger { display: block !important; }
          .mobile-menu { display: block !important; }
          .mobile-menu.closed { display: none !important; }
          .nav-brand-container { width: auto !important; }
        }
        
        @media (max-width: 576px) {
          .navbar-container { padding-left: 15px !important; padding-right: 15px !important; }
        }
      `}</style>

        <nav className="navbar navbar-expand-lg navbar-light navbar-container fixed-top px-5" style={{ backgroundColor: "#f0f0f0", height: "15%", zIndex: 1000 }}>
          <div className="d-flex justify-content-between align-items-center w-100">
            <Link href="/" className="navbar-brand nav-brand-container" style={{ width: "22%" }}>
              <Image
                src="/logo.png"
                alt="Logo"
                width={200}
                height={80}
                style={styles.navBrand}
              />
            </Link>

            {/* Desktop menu */}
            <div className="desktop-menu">
              {["Features"].map((item, i) => (
                <Link
                  key={i}
                  className="nav-link px-3"
                  href={`#${item.toLowerCase().replace("?", "")}`}
                  style={styles.navLink}
                >
                  {item}
                </Link>
              ))}
            </div>

            <div className="desktop-menu">
              <button className="btn mx-4" style={{ ...styles.button }}>
                Log In
              </button>
              <button className="btn btn-primary " style={{ ...styles.button  }}>
                Get Started
              </button>
            </div>

            {/* Hamburger icon */}
            <div
              className="hamburger"
              style={styles.hamburger}
              onClick={toggleMenu}
            >
              <span style={{ ...styles.hamburgerLine, top: isOpen ? '11px' : '0', transform: isOpen ? 'rotate(45deg)' : 'none' }}></span>
              <span style={{ ...styles.hamburgerLine, top: '11px', opacity: isOpen ? 0 : 1 }}></span>
              <span style={{ ...styles.hamburgerLine, top: isOpen ? '11px' : '22px', transform: isOpen ? 'rotate(-45deg)' : 'none' }}></span>
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`mobile-menu w-100 ${isOpen ? '' : 'closed'}`} style={styles.mobileMenu}>
            <div style={styles.mobileButtons}>
              <button className="btn btn-outline-primary w-100" style={{ ...styles.button }}>
                Log In
              </button>
              <button className="btn btn-primary w-100" style={{ ...styles.button }}>
                Get Started
              </button>
            </div>
          </div>
        </nav>
      </>
    );
  };

  const renderHero = () => (
    <div style={styles.fullSection}>
      <div className="container h-100 d-flex align-items-center">
        <div className="row align-items-center justify-content-center">
          <div className="col-md-6">
            <h2 className="mt-4 ps-2" style={styles.heading}>Meetings That Run Themselves</h2>
            <p className="mt-4 ps-2" style={styles.subheading}>
              Tired of managing calendars, links, and notes?<br />
              AutoMeet automates organizing, hosting, and <br />
              summarizing your meetings effortlessly.
            </p>
            <div className="row ps-2 text-white">
              {[
                {
                  style: styles.googleButton,
                  icon: <FaGoogle style={styles.icon} />,
                  text: "Sign up with Google"
                },
                {
                  style: styles.emailButton,
                  icon: <MdEmail style={styles.icon} />,
                  text: "Sign up with Email"
                }
              ].map((btn, i) => (
                <div key={i} className="col-md-10 mb-4 mt-4">
                  <button className="btn btn-lg w-100 d-flex align-items-center justify-content-center" style={btn.style}>
                    {btn.icon}
                    <span>{btn.text}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="col-md-6 text-center">
            <img src="/Home1.png" alt="Calendar interface" className="img-fluid" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSeizeDay = () => (
    <section style={styles.fullSection}>
      <div className="container h-100 d-flex align-items-center">
        <div className="row align-items-center justify-content-center">
          <div className="col-lg-6 text-center">
            <img src="/onecalender.png" alt="Calendar demonstration" style={{ width: "110%", backgroundColor: "#000000", height: "100%" }} />
          </div>
          <div className="col-lg-6">
            <h2 style={styles.heading}>Seize the Day,<br /> One Meeting at a Time!</h2>
            <p className="my-4" style={styles.subheading}>
              Dynamic scheduling, seamless collaboration, and smart automation —
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

    const timeRemaining = "2 hours 30 minutes"; // Example time remaining

    return (
      <section className="py-4">
        <div className="container justify-content-center" style={{ width: "90%" }}>
          <div className="row">
            <div className="col-lg-6 " style={{ margin: "0 auto", padding: "0 4%" }}>
              {features.map((feature, i) => (
                <div key={i} className="mb-5">
                  <div className="d-flex align-items-center">
                    <img src={feature.img} alt={feature.title.toLowerCase()} style={{ width: "13%" }} />
                    <h2 className="ms-3 fs-2 fw-bold">{feature.title}</h2>
                  </div>
                  <p className="my-3 fs-5 fw-light">{feature.desc}</p>
                </div>
              ))}
            </div>
            <div className="col-lg-6 ">
              <div className="position-relative mt-1">
                <div className="position-relative" style={{
                  alignItems: "center",
                  width: "75%",
                  height: "450px",
                  backgroundColor: "white",
                  borderRadius: "20px",
                  marginLeft: "10%",
                  boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)",
                  overflow: "hidden",
                  padding: "25px"
                }}>

                  {/* Yellow background shape */}
                  <div className="position-absolute" style={{
                    width: "215px",
                    height: "300px",
                    right: "43%",
                    bottom: "34%", 
                    backgroundColor: "#FFE033",
                    opacity: "0.8",
                    borderRadius: "5%",
                    zIndex: "0"  // Background element
                  }} />

                  {/* Blue circle */}
                  <div className="position-absolute" style={{
                    width: "300px",
                    height: "300px",
                    top: "55%",  // Adjusted position to match image
                    left: "50%",   // Adjusted position to match image
                    backgroundColor: "#0048FF",
                    opacity: "0.6",
                    borderRadius: "50%",
                    zIndex: "0"  // Background element
                  }} />

                  {/* Content card - now positioned in front with higher z-index */}
                  <div className="position-relative shadow-lg p-3" style={{
                    marginTop: "20%",  // Adjusted to center in container
                    backgroundColor: "#CAD9FF",
                    borderRadius: "10px",
                    zIndex: "10",  // Explicitly higher to ensure it's on top
                    maxWidth: "90%",
                    height: "auto"  // Control width to match image
                  }}>
                    <div className="text-left">
                      <h3 className="font-medium text-lg"><b style={{ fontSize: "22px" }}>Event name:</b> <span style={{ fontSize: "17px" }}><b>20/34 80:14</b></span></h3>
                      <p className="text-gray-600 text-sm mt-1" style={{ fontSize: "15px", fontWeight: "350" }}><b>Sub description about the meeting.</b></p>

                      <div className="flex mt-3" style={{ display: "flex", flexDirection: "row" }}>
                        <div className="flex -space-x-2 " style={{ display: "flex", flexDirection: "row" }}>
                          <div className="w-6 h-6 ">
                            <FiUser size={18} className="text-blue-800 mb-1 " />
                          </div>
                          <div className="w-6 h-6 ">
                            <FiUser size={18} className="text-blue-800 mb-1" />
                          </div>
                          <div className="w-6 h-6 ">
                            <FiUser size={18} className="text-blue-800 mb-1" />
                          </div>
                        </div>
                        <div style={{ paddingLeft: "2%", fontSize: "15px" }}>
                          <span className=" text-gray-600 ml-2" style={{ fontSize: "12px" }}>2+ others</span>
                        </div>
                      </div>

                      <div className="flex items-center mt-2">
                        <FiClock size={15} className="text-white-500 pb-1" />
                        <span className="text-sm text-gray-600 ml-2" style={{ fontSize: "14px", paddingLeft: "2%" }}>Starts in {timeRemaining}</span>
                        <div className="ml-2 w-24 h-1 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>

                    <div style={{ marginLeft: "70%", marginTop: "0%" }}>
                      <button
                        className="flex items-center text-white px-3 py-1 mt-2"
                        style={{
                          backgroundColor: "#3B3BD7",
                          borderRadius: "5px",
                          border: "none",
                          outline: "none",
                          boxShadow: "none",
                          fontSize: "14px"
                        }}
                      >
                        Edit&nbsp;&nbsp;
                        <FiEdit2 size={9} className="mb-1" />
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
    <section style={styles.fullSection}>
      <div className="container h-100 d-flex align-items-center">
        <div className="text-center w-100">
          <h2 className="display-4 fw-bold mb-4">
            One platform to schedule, analyze, and run meetings better.
          </h2>
          <h4 className="fs-3 mt-4 mb-5">
            AutoMeet simplifies meeting scheduling with AI, real-time availability, seamless collaboration, smart notifications, content sharing, and analysis even for participants without accounts. Meetings, redefined.</h4>
          <a href="register"><button className="btn btn-lg" style={{ background: "#3B3BD7", color: "white", padding: "10px 40px" }}>Create an Account &nbsp;&nbsp;&gt;</button></a>;
        </div>
      </div>
    </section>
  );



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
        description: "AutoMeet syncs calendars to find the perfect time,no hassle.",
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
      <section style={styles.fullSection}>
        <div className="container h-100 d-flex flex-column justify-content-center">
          <div className="row mb-5">
            <div className="col-lg-6">
              <h2 className="fw-bold" style={{ fontSize: "43px" }}>What holds valuable items with interest</h2>
            </div>
            <div className="col-lg-6">
              <h4 className="fs-3 opacity-75" style={{ padding: "0 25px" }}>
                something instead of nothing features to please your needs some stuff to say that we.
              </h4>
            </div>
          </div>
          <div className="position-relative">
            <div style={styles.featureSliderTrack}>
              {[0, 1].map(setIndex => (
                <div key={setIndex} className="d-flex">
                  {features.map(feature => (
                    <div key={`${setIndex}-${feature.id}`} style={styles.featureItem}>
                      <div className="my-2">
                        <h4 className="mb-4 fw-bold text-center">{feature.title}</h4>
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="img-fluid mb-3"
                        />
                        <p className="mt-2 fw-bold text-center">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderFooter = () => {
    const footerLinks = {
      "Product": ["Features", "Pricing", "Integrations", "Enterprise", "What's New"],
      "Company": ["About Us", "Careers", "Blog", "Press", "Contact"],
      "Resources": ["Help Center", "Documentation", "Tutorials", "Community", "Status"]
    };

    return (
      <footer className="pt-5 pb-3 mt-5" style={{ backgroundColor: "#232342", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="container">
          <div className="row text-white mb-5">
            <div className="col-lg-4 mb-4">
              <div className="mb-4"><img src="/logo.png" alt="AutoMeet Logo" style={{ width: "180px" }} /></div>
              <p className="opacity-75 mb-4">
                AutoMeet transforms your meeting experience with AI-powered scheduling,
                note-taking, and seamless integrations.
              </p>
              <div className="d-flex gap-3">
                {["linkedin", "twitter", "facebook", "instagram"].map(icon => (
                  <a key={icon} href="#" className="text-decoration-none">
                    <div className="bg-white bg-opacity-10 rounded-circle p-2 d-flex align-items-center justify-content-center"
                      style={{ width: "40px", height: "40px" }}>
                      <i className={`bi bi-${icon} text-white`}></i>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="col-lg-2 col-md-4 mb-4">
                <h5 className="fw-bold mb-4">{category}</h5>
                <ul className="list-unstyled">
                  {links.map(link => (
                    <li key={link} className="mb-2">
                      <a href="#" className="text-decoration-none text-white opacity-75 hover-opacity-100">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="col-lg-2 mb-4">
              <h5 className="fw-bold mb-4">Stay Updated</h5>
              <p className="opacity-75 mb-3">Subscribe to our newsletter for the latest updates</p>
              <div className="mb-3 position-relative">
                <input type="email" className="form-control bg-white bg-opacity-10 border-0 text-white"
                  placeholder="Your email" style={{
                    height: "50px", borderRadius: "25px", paddingRight: "50px",
                    backgroundColor: "rgba(255, 255, 255, 0.1)"
                  }} />
                <button className="btn position-absolute end-0 top-0 h-100 d-flex align-items-center justify-content-center"
                  style={{ width: "50px", borderRadius: "0 25px 25px 0" }}>
                  <div className="d-flex align-items-center justify-content-center"
                    style={{ width: "32px", height: "32px", backgroundColor: "#3B3BD7", borderRadius: "50%" }}>
                    <i className="bi bi-arrow-right text-white"></i>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="row text-white py-4 mb-4">
            <div className="col-md-5 d-flex align-items-center">
              <div className="me-4">
                <h5 className="fw-bold mb-0">Get the AutoMeet App</h5>
                <p className="opacity-75 mb-0">Manage your meetings on the go</p>
              </div>
            </div>
            <div className="col-md-7 d-flex align-items-center">
              <div className="d-flex gap-3 flex-wrap">
                {[
                  { icon: "apple", title: "App Store", subtitle: "Download on the" },
                  { icon: "google-play", title: "Google Play", subtitle: "GET IT ON" }
                ].map((store, i) => (
                  <a key={i} href="#" className="text-decoration-none">
                    <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
                      <div style={{ fontSize: "24px" }}><i className={`bi bi-${store.icon} text-white`}></i></div>
                      <div>
                        <div className="text-white opacity-75" style={{ fontSize: "12px" }}>{store.subtitle}</div>
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
              <p className="mb-0 opacity-75">© 2025 AutoMeet. All rights reserved.</p>
            </div>
            <div className="col-md-6">
              <div className="d-flex flex-wrap justify-content-md-end gap-4">
                {["Terms of Service", "Privacy Policy", "Cookies"].map((link, i) => (
                  <a key={i} href="#" className="text-white opacity-75 text-decoration-none hover-opacity-100">{link}</a>
                ))}
              </div>
            </div>
          </div>

          <div className="position-fixed bottom-0 end-0 mb-4 me-4 d-flex align-items-center justify-content-center"
            style={{
              width: "50px", height: "50px", backgroundColor: "#3B3BD7", borderRadius: "50%",
              cursor: "pointer", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)", zIndex: 1000
            }}>
            <i className="bi bi-arrow-up text-white"></i>
          </div>
        </div>

        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" />
        <style jsx global>{animations}</style>
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