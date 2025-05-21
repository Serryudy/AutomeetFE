'use client';

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/global.css';
import SidebarMenu from '@/components/SideMenucollapse';
import ProfileHeader from '@/components/profileHeader';
import { FaBars, FaPlus, FaTrash, FaVideo } from 'react-icons/fa';
import { Toast, ToastContainer } from 'react-bootstrap';

export default function VideoIntegration() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState([
    { 
      id: 1, 
      provider: 'Zoom', 
      email: 'user@example.com', 
      logo: '/zoom.png' 
    }
  ]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Provider logo mapping
  const providerLogos = {
    Zoom: '/zoom.png',
    Meet: '/meet.png',
    Teams: '/teams.png'
  };

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

  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  const handleRemoveAccount = (id) => {
    setConnectedAccounts(connectedAccounts.filter(account => account.id !== id));
    setToastMessage('Video conferencing account successfully removed');
    setShowToast(true);
  };

  const handleConnectAccount = (provider) => {
    // In a real application, this would initiate OAuth flow
    const newAccount = {
      id: Date.now(),
      provider,
      email: `user${Math.floor(Math.random() * 1000)}@example.com`,
      logo: providerLogos[provider]
    };
    
    setConnectedAccounts([...connectedAccounts, newAccount]);
    setShowConnectModal(false);
    setToastMessage(`Successfully connected to ${provider}`);
    setShowToast(true);
  };

  // Modal for connecting new accounts
  const ConnectModal = () => (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
      <div className="bg-white rounded-3 p-4 shadow" style={{ maxWidth: '500px', width: '90%' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0 fw-bold">Connect Video Conferencing</h5>
          <button className="btn-close" onClick={() => setShowConnectModal(false)}></button>
        </div>
        
        <div className="d-grid gap-3">
          <button className="btn btn-outline-primary d-flex align-items-center p-3" onClick={() => handleConnectAccount('Zoom')}>
            <div className="me-3" style={{ width: '32px', height: '32px' }}>
              <img src={providerLogos.Zoom} alt="Zoom" className="img-fluid" />
            </div>
            <div className="text-start">
              <div className="fw-bold">Zoom</div>
              <small className="text-muted">Connect with your Zoom account</small>
            </div>
          </button>
          
          <button className="btn btn-outline-primary d-flex align-items-center p-3" onClick={() => handleConnectAccount('Meet')}>
            <div className="me-3" style={{ width: '32px', height: '32px' }}>
              <img src={providerLogos.Meet} alt="Google Meet" className="img-fluid" />
            </div>
            <div className="text-start">
              <div className="fw-bold">Google Meet</div>
              <small className="text-muted">Connect with your Google account</small>
            </div>
          </button>
          
          <button className="btn btn-outline-primary d-flex align-items-center p-3" onClick={() => handleConnectAccount('Teams')}>
            <div className="me-3" style={{ width: '32px', height: '32px' }}>
              <img src={providerLogos.Teams} alt="Microsoft Teams" className="img-fluid" />
            </div>
            <div className="text-start">
              <div className="fw-bold">Microsoft Teams</div>
              <small className="text-muted">Connect with your Microsoft account</small>
            </div>
          </button>
        </div>
      </div>
    </div>
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
            <FaVideo className="me-2" />
            <strong className="me-auto">Video Integration</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Connect Modal */}
      {showConnectModal && <ConnectModal />}

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
          <h1 className=" mb-1 mb-md-2 font-inter fw-bold">Integration</h1>
          <p className="text-muted small">
            Seamlessly integrate your Zoom meetings for effortless scheduling.
          </p>
        </div>
        
        <div className='w-50 rounded-3 bg-light p-3 p-md-4'>
          {/* Video Conferencing Accounts Section */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h5 fw-bold m-0">Video Accounts</h2>
            <button 
              className="btn btn-primary d-flex align-items-center" 
              onClick={() => setShowConnectModal(true)}
            >
              <FaPlus className="me-2" /> Add
            </button>
          </div>

          {/* Connected Accounts List */}
          <div className="card">
            <div className="card-body p-0">
              {connectedAccounts.length > 0 ? (
                connectedAccounts.map(account => (
                  <div key={account.id} className="d-flex justify-content-between align-items-center p-3 border-bottom">
                    <div className="d-flex align-items-center">
                      <div className="me-3" style={{ width: '40px', height: '40px' }}>
                        <img src={account.logo} alt={`${account.provider}`} className="img-fluid" />
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">{account.provider}</h6>
                        <p className="small text-muted mb-0">{account.email}</p>
                      </div>
                    </div>
                    <button 
                      className="btn btn-light btn-sm"
                      onClick={() => handleRemoveAccount(account.id)}
                    >
                      <FaTrash className="text-danger" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center p-4">
                  <FaVideo size={40} className="text-muted mb-3" />
                  <h6>No Video Conferencing Accounts Connected</h6>
                  <p className="small text-muted">Connect your preferred video platforms to schedule and join meetings seamlessly</p>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setShowConnectModal(true)}
                  >
                    Connect Video Platform
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}