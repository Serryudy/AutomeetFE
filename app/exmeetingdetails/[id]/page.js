'use client';

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/global.css';
import SidebarMenu from '@/components/ExSidemenu';      
import ExternalProfileHeader from '@/components/ExternalProfileHeader';
import { useState, useEffect, useRef } from 'react';
import SearchBar from '@/components/meetingsearchbar';
import MeetingForm from '@/components/externalmeetingform';
import { useParams } from 'next/navigation';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function Details() {
  const params = useParams();
  const meetingId = params.id; // Extract the meeting ID from the URL parameters
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setShowMobileMenu(false);
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  // Add this handler function for date selection
  const handleDateSelect = (date) => {
    // Handle date selection if needed
    console.log('Date selected:', date);
  };

  // Add this handler function in the Details component
  const handleMeetingSelect = (meeting) => {
    if (meeting && meeting.id) {
      window.location.href = `/meetingdetails/${meeting.id}`;
    }
  };

  return (
    <div className="d-flex page-background font-inter" style={{ minHeight: '100vh' }}>  
      {/* Mobile Menu Button */}
      {isMobile && (
        <button 
          className="btn btn-primary position-fixed d-flex align-items-center justify-content-center" 
          style={{ top: '10px', left: '10px', zIndex: 1100, width: '40px', height: '40px' }}
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <FaTimes /> : <FaBars />}
        </button>
      )}
      
      {/* Sidebar */}
      <div style={{ 
        position: 'fixed', 
        left: 10, 
        top: 10, 
        bottom: 0, 
        zIndex: 1000,
        display: isMobile ? (showMobileMenu ? 'block' : 'none') : 'block'
      }}>
        <SidebarMenu 
          showmenuicon={true} 
          onToggle={handleSidebarToggle}
          onDateSelect={handleDateSelect}
          uid={null} // External users don't have a specific uid in this context
          mid={meetingId}
        />
      </div>
      
      {/* Mobile Overlay */}
      {isMobile && showMobileMenu && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" 
          style={{ zIndex: 999 }}
          onClick={() => setShowMobileMenu(false)}
        >
        </div>
      )}
      
      {/* Main content */}
      <div 
        className="flex-grow-1 p-3 p-md-4" 
        style={{
          marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '90px' : '340px'),
          maxWidth: isMobile ? '100%' : (isSidebarCollapsed ? 'calc(100% - 120px)' : 'calc(100% - 360px)'),
          transition: 'margin-left 0.3s ease-in-out, max-width 0.3s ease-in-out',
          paddingTop: isMobile ? '60px' : '0'
        }}
      >
        {/* Profile Header */}
        <div className="mb-3 mb-md-4">
          <ExternalProfileHeader />
        </div>

        {/* Calendar Header */}
        <div className="mb-3 mb-md-4">
          <h1 className="h3 h2-md mb-1 mb-md-2 font-inter fw-bold">Meeting Details</h1>
          <p className="text-muted small">
            Dive into the details and make every meeting count.
          </p>
        </div>
        
        {/* Search Bar Component */}
        <SearchBar 
          onSelectMeeting={handleMeetingSelect}
          placeholder="Search meetings..."
          className="mb-3 mb-md-4"
          context="meetings"
        />
        
        <div>
            <MeetingForm meetingId={meetingId}/>
        </div>
      </div>
    </div>
  );
}