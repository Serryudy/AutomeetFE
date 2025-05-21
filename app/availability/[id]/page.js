'use client';

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/global.css';
import SidebarMenu from '@/components/SideMenucollapse';
import ProfileHeader from '@/components/profileHeader';
import Availability from '@/components/Availability';
import { FaBars } from 'react-icons/fa';
import { useParams } from 'next/navigation';

export default function AvailabilityPage() {
  const params = useParams();
  const meetingId = params.id;
  const [selectedDate, setSelectedDate] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [showEventCards, setShowEventCards] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

  useEffect(() => {
    // Only show event cards if sidebar is collapsed AND window is wide enough
    setShowEventCards(isSidebarCollapsed && windowWidth >= 1200);
  }, [isSidebarCollapsed, windowWidth]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
    
    // Show event cards only when sidebar is collapsed AND not in mobile view
    if (!isMobile) {
      if (collapsed) {
        setTimeout(() => setShowEventCards(true), 150);
      } else {
        // Hide event cards immediately when sidebar expands
        setShowEventCards(false);
      }
    }
  };

  // Text size classes using Bootstrap instead of clamp
  const textStyles = {
    title: {
      fontSize: '1.25rem',
      fontWeight: 'normal',
      color: '#000'
    },
    eventTitle: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#000'
    },
    eventDays: {
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#000'
    },
    location: {
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#000'
    },
    locationValue: {
      fontSize: '0.75rem',
      color: '#000'
    },
    description: {
      fontSize: '0.625rem',
      fontWeight: '600',
      color: '#000'
    }
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
          onDateSelect={handleDateSelect}
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
          maxWidth: isMobile ? '100%' : (isSidebarCollapsed ? 'calc(100% - 90px)' : 'calc(100% - 340px)'),
          transition: 'margin-left 0.3s ease-in-out, max-width 0.3s ease-in-out'
        }}
      >
        {/* Profile Header */}
        <div className="mb-3 mb-md-4">
          <ProfileHeader />
        </div>

        {/* Content Header */}
        <div className="mb-3 mb-md-4">
          <h1 className="h3 h2-md mb-1 mb-md-2 font-inter fw-bold">Mark Your Availability</h1>
          <p className="text-muted small">
            Stay ahead of your schedule and make every moment<br />
            count with your weekly planner.
          </p>
        </div>
        
        {/* Main content area - responsive layout */}
        <div className="d-flex flex-column flex-lg-row gap-4">
          {/* Calendar component */}
          <div className="flex-grow-1">
            <Availability
              meetingId={meetingId} 
              selectedDate={selectedDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}