'use client';

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/global.css';
import SidebarMenu from '@/components/SideMenucollapse';
import ProfileHeader from '@/components/profileHeader';
import { FaBars, FaPlus, FaTrash, FaCalendarAlt, FaSync } from 'react-icons/fa';
import { Toast, ToastContainer, Modal, Button } from 'react-bootstrap';

// API URL - change to match your API deployment
const API_URL = 'http://localhost:8080';

export default function CalendarSync() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [accountToRemove, setAccountToRemove] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Provider logo mapping
  const providerLogos = {
    Google: '/googleC.png',
    Microsoft: '/microsoftC.png',
    Apple: '/appleC.png'
  };

  // Fetch connected accounts on component mount
  useEffect(() => {
    fetchConnectedAccounts();
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setShowMobileMenu(false);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check URL parameters on component mount for connection status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('calendar') === 'connected') {
        setToastMessage('Calendar successfully connected!');
        setShowToast(true);
        fetchConnectedAccounts(); // Refresh accounts list
        
        // Clean up URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Fetch connected calendar accounts from API
  const fetchConnectedAccounts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current user's calendar status
      const response = await fetch(`${API_URL}/api/auth/calendarStatus`, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch calendar status');
      }
      
      const data = await response.json();
      
      // If calendar is connected, add it to the accounts list
      if (data.connected) {
        // Get the current user info from localStorage (assuming you store it there after login)
        let userInfo = {};
        if (typeof window !== 'undefined') {
          const storedUserInfo = localStorage.getItem('userInfo');
          if (storedUserInfo) {
            userInfo = JSON.parse(storedUserInfo);
          }
        }
        
        setConnectedAccounts([{
          id: 1,
          provider: 'Google',
          email: userInfo.username || 'Your Google Account',
          logo: providerLogos.Google
        }]);
      } else {
        setConnectedAccounts([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch calendar status');
      console.error('Error fetching calendar status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  // Open confirmation modal before removing account
  const confirmRemoveAccount = (account) => {
    setAccountToRemove(account);
    setShowConfirmModal(true);
  };

  // Remove an account by disconnecting from Google Calendar
  const handleRemoveAccount = async () => {
    if (!accountToRemove) return;
    
    setShowConfirmModal(false);
    setIsLoading(true);
    
    try {
      // Call the API endpoint to disconnect the calendar
      const response = await fetch(`${API_URL}/api/auth/disconnectCalendar`, {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect calendar');
      }
      
      // Successfully disconnected
      setConnectedAccounts([]);
      setToastMessage('Calendar account successfully removed');
      setShowToast(true);
    } catch (err) {
      setError(err.message || 'Failed to remove calendar account');
      console.error('Error removing calendar account:', err);
    } finally {
      setIsLoading(false);
      setAccountToRemove(null);
    }
  };

  // Initiate Google Calendar connection by redirecting to the API endpoint
  const connectGoogleCalendar = () => {
    window.location.href = `${API_URL}/api/auth/connectCalendar`;
  };

  // Modal for connecting new accounts
  const ConnectModal = () => (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
      <div className="bg-white rounded-3 p-4 shadow" style={{ maxWidth: '500px', width: '90%' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0 fw-bold">Connect Calendar</h5>
          <button className="btn-close" onClick={() => setShowConnectModal(false)}></button>
        </div>
        
        <div className="d-grid gap-3">
          <button 
            className="btn btn-outline-primary d-flex align-items-center p-3" 
            onClick={() => {
              connectGoogleCalendar();
              setShowConnectModal(false);
            }}
          >
            <div className="me-3" style={{ width: '32px', height: '32px' }}>
              <img src={providerLogos.Google} alt="Google Calendar" className="img-fluid" />
            </div>
            <div className="text-start">
              <div className="fw-bold">Google Calendar</div>
              <small className="text-muted">Connect with your Google account</small>
            </div>
          </button>
          
          <button className="btn btn-outline-secondary d-flex align-items-center p-3" disabled>
            <div className="me-3" style={{ width: '32px', height: '32px' }}>
              <img src={providerLogos.Microsoft} alt="Microsoft Calendar" className="img-fluid" />
            </div>
            <div className="text-start">
              <div className="fw-bold">Microsoft Calendar</div>
              <small className="text-muted">Connect with your Outlook or Office 365 account (Coming soon)</small>
            </div>
          </button>
          
          <button className="btn btn-outline-secondary d-flex align-items-center p-3" disabled>
            <div className="me-3" style={{ width: '32px', height: '32px' }}>
              <img src={providerLogos.Apple} alt="Apple Calendar" className="img-fluid" />
            </div>
            <div className="text-start">
              <div className="fw-bold">Apple Calendar</div>
              <small className="text-muted">Connect with your iCloud account (Coming soon)</small>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  // Confirmation Modal for removing accounts
  const ConfirmRemovalModal = () => (
    <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Removal</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to disconnect your Google Calendar? This will remove access to your calendar events and availability.</p>
        <p className="mb-0 text-danger">This action cannot be undone.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleRemoveAccount}>
          Disconnect Calendar
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <div className="d-flex page-background font-inter" style={{ minHeight: '100vh' }}>  
      {/* Mobile Menu Button */}
      {isMobile && (
        <button 
          className="btn btn-light position-fixed rounded-circle p-2"
          style={{ zIndex: 1001, top: '1rem', left: '1rem' }}
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <FaBars size={20} />
        </button>
      )}

      {/* Sidebar Menu */}
      <div 
        style={{ 
          position: 'fixed', 
          left: 10, 
          top: 10, 
          bottom: 0, 
          zIndex: 1000,
          transform: isMobile ? `translateX(${showMobileMenu ? '0' : '-100%'})` : 'none',
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        <SidebarMenu 
          showmenuicon={true} 
          onToggle={handleSidebarToggle}
        />
      </div>

      {/* Mobile Overlay */}
      {isMobile && showMobileMenu && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 999,
            transition: 'opacity 0.3s'
          }}
          onClick={() => setShowMobileMenu(false)}
        ></div>
      )}

      {/* Toast notifications */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1060 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
          <Toast.Header>
            <FaCalendarAlt className="me-2" />
            <strong className="me-auto">Calendar Integration</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Connect Modal */}
      {showConnectModal && <ConnectModal />}
      
      {/* Confirm Removal Modal */}
      <ConfirmRemovalModal />

      {/* Main content */}
      <div 
        className="flex-grow-1 p-3 p-md-4"
        style={{
          marginLeft: isMobile ? 0 : (isSidebarCollapsed ? '90px' : '340px'),
          maxWidth: isMobile ? '100%' : (isSidebarCollapsed ? 'calc(100% - 120px)' : 'calc(100% - 360px)'),
          transition: 'margin-left 0.3s ease-in-out, max-width 0.3s ease-in-out'
        }}
      >
        {/* Profile Header */}
        <div className="mb-3 mb-md-4">
          <ProfileHeader />
        </div>

        {/* Content Header */}
        <div className="mb-3 mb-md-4">
          <h1 className="mb-1 mb-md-2 font-inter fw-bold">Calendar Sync</h1>
          <p className="text-muted small">
            Tailor Your Schedule: Seamlessly Sync and Customize Your Meetings
          </p>
        </div>
        
        <div className="rounded-3 bg-light p-3 p-md-4" style={{ maxWidth: '600px' }}>
          {/* Calendar Accounts Section */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h5 fw-bold m-0">Calendar Accounts</h2>
            <button 
              className="btn btn-primary d-flex align-items-center" 
              onClick={() => setShowConnectModal(true)}
              disabled={isLoading}
            >
              <FaPlus className="me-2" /> Add
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading calendar accounts...</p>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="alert alert-danger" role="alert">
              <p className="mb-0">{error}</p>
              <button 
                className="btn btn-outline-danger mt-2 d-flex align-items-center"
                onClick={fetchConnectedAccounts}
              >
                <FaSync className="me-2" /> Try Again
              </button>
            </div>
          )}

          {/* Connected Accounts List */}
          {!isLoading && !error && (
            <div className="p-0">
              {connectedAccounts.length > 0 ? (
                connectedAccounts.map(account => (
                  <div key={account.id} className="d-flex justify-content-between align-items-center p-3 border rounded mb-2">
                    <div className="d-flex align-items-center">
                      <div className="me-3" style={{ width: '40px', height: '40px' }}>
                        <img src={account.logo} alt={`${account.provider} Calendar`} className="img-fluid" />
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">{account.provider}</h6>
                        <p className="small text-muted mb-0">{account.email}</p>
                      </div>
                    </div>
                    <button 
                      className="btn btn-light btn-sm"
                      onClick={() => confirmRemoveAccount(account)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center p-4">
                  <FaCalendarAlt size={40} className="text-muted mb-3" />
                  <h6>No Calendar Accounts Connected</h6>
                  <p className="small text-muted">Connect your calendar to manage your meetings efficiently</p>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setShowConnectModal(true)}
                  >
                    Connect Calendar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Information Section */}
          <div className="mt-4 pt-3 border-top">
            <h3 className="h6 fw-bold">Calendar Integration Benefits</h3>
            <ul className="small text-muted">
              <li className="mb-1">Automatically sync your meeting schedules</li>
              <li className="mb-1">Check availability when scheduling new meetings</li>
              <li className="mb-1">Receive calendar notifications for upcoming meetings</li>
              <li className="mb-1">Manage all your calendar events in one place</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}