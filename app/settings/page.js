'use client';

import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/global.css';
import SidebarMenu from '../../components/SideMenucollapse';
import ProfileHeader from '@/components/profileHeader';
import { FaBars } from 'react-icons/fa';

export default function Content() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Notification settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  
  // Privacy settings state
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [messagePermission, setMessagePermission] = useState('everyone');

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setShowMobileMenu(false);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle handlers
  const handleNotificationsToggle = () => setNotificationsEnabled(!notificationsEnabled);
  const handleEmailToggle = () => setEmailNotifications(!emailNotifications);
  const handleSmsToggle = () => setSmsNotifications(!smsNotifications);

  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  // Handle form submission
  const handleSaveSettings = (e) => {
    e.preventDefault();
    // Logic to save settings to backend would go here
    alert('Settings saved successfully!');
  };

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
          <h1 className=" mb-1 mb-md-2 font-inter fw-bold">Settings</h1>
          <p className="text-muted small">
            Customize the way you arrange your meetings
          </p>
        </div>
        
        <div className='w-50 rounded-3 bg-light p-3 p-md-4'>
          <form onSubmit={handleSaveSettings}>
            {/* Notification Settings Section */}
            <div className="mb-4">
              <h2 className="h4 mb-3 font-inter fw-bold">Notification settings</h2>
              
              <div className="d-flex justify-content-between align-items-center mb-3">
                <label htmlFor="enableNotification" className="form-label mb-0">Enable / Disable Notification</label>
                <Form.Check 
                  type="switch"
                  id="enableNotification"
                  checked={notificationsEnabled}
                  onChange={handleNotificationsToggle}
                  className="fs-4"
                />
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-3">
                <label htmlFor="emailNotification" className="form-label mb-0">Send E-mail notifications</label>
                <Form.Check 
                  type="switch"
                  id="emailNotification"
                  checked={emailNotifications}
                  onChange={handleEmailToggle}
                  disabled={!notificationsEnabled}
                  className="fs-4"
                />
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-3">
                <label htmlFor="smsNotification" className="form-label mb-0">Send SMS notification</label>
                <Form.Check 
                  type="switch"
                  id="smsNotification"
                  checked={smsNotifications}
                  onChange={handleSmsToggle}
                  disabled={!notificationsEnabled}
                  className="fs-4"
                />
              </div>
            </div>
            
            {/* Privacy Settings Section */}
            <div className="mb-4">
              <h2 className="h4 mb-3 font-inter fw-bold">Privacy settings</h2>
              
              <div className="mb-3">
                <label htmlFor="profileVisibility" className="form-label mb-2">Manage profile visibility</label>
                <Form.Select 
                  id="profileVisibility"
                  value={profileVisibility}
                  onChange={(e) => setProfileVisibility(e.target.value)}
                  className="form-select form-select-md"
                  aria-label="Profile visibility"
                >
                  <option value="public">Public - Everyone can see your profile</option>
                  <option value="contacts">Contacts only - Only your contacts can see your profile</option>
                  <option value="private">Private - No one can see your profile</option>
                </Form.Select>
              </div>
              
              <div className="mb-3">
                <label htmlFor="messagePermission" className="form-label mb-2">Control who can message you</label>
                <Form.Select 
                  id="messagePermission"
                  value={messagePermission}
                  onChange={(e) => setMessagePermission(e.target.value)}
                  className="form-select form-select-md"
                  aria-label="Message permission"
                >
                  <option value="everyone">Everyone</option>
                  <option value="contacts">Contacts only</option>
                  <option value="nobody">Nobody</option>
                </Form.Select>
              </div>
            </div>
            
            {/* Save Button */}
            <div className="mt-4">
              <button 
                type="submit" 
                className="btn btn-primary btn-lg px-4 py-2 fw-medium"
                style={{ 
                  backgroundColor: '#4747ED',
                  borderColor: '#4747ED',
                  borderRadius: '30px'
                }}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}