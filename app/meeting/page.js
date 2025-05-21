'use client';

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/global.css';
import SidebarMenu from '../../components/SideMenucollapse';
import ProfileHeader from '@/components/profileHeader';
import MeetingCard from '@/components/MeetingCard';
import { FaCalendarAlt, FaBars } from 'react-icons/fa';
import SearchBar from '@/components/meetingsearchbar';

export default function Meeting() {
  const [activeTab, setActiveTab] = useState("all");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [cardsPerRow, setCardsPerRow] = useState(3);
  const [meetings, setMeetings] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  // Update filtered meetings whenever activeTab or meetings changes
  useEffect(() => {
    if (meetings.length > 0) {
      const filtered = filterMeetingsByTab(meetings, activeTab);
      setFilteredMeetings(filtered);
      setIsLoading(false);
    }
  }, [activeTab, meetings]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < 768);
      
      // Dynamically adjust cards per row based on screen size and sidebar state
      if (width < 576) {
        setCardsPerRow(1); // Mobile: 1 card per row
      } else if (width < 992) {
        setCardsPerRow(2); // Tablet: 2 cards per row
      } else if (width < 1400 || isSidebarCollapsed) {
        setCardsPerRow(3); // Desktop: 3 cards per row
      } else {
        setCardsPerRow(3); // Large desktop: 3 cards per row
      }
      
      if (width >= 768) setShowMobileMenu(false);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarCollapsed]);

  // Update cards per row when sidebar collapses
  useEffect(() => {
    const width = windowWidth;
    if (width >= 992 && width < 1400) {
      // Adjust cards only in desktop range
      setCardsPerRow(isSidebarCollapsed ? 3 : 2);
    }
  }, [isSidebarCollapsed, windowWidth]);

  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  // Filter meetings based on active tab
  const filterMeetingsByTab = (meetings, tab) => {
    let filtered = meetings;
    
    // First filter by tab
    switch(tab) {
      case 'all':
        filtered = meetings;
        break;
      case 'created':
        filtered = meetings.filter(meeting => meeting.role === 'creator');
        break;
      case 'participating':
        filtered = meetings.filter(meeting => meeting.role === 'participant');
        break;
      case 'hosting':
        filtered = meetings.filter(meeting => meeting.role === 'host');
        break;
      case 'pending':
        filtered = meetings.filter(meeting => meeting.status === 'pending');
        break;
      default:
        filtered = meetings;
    }
    
    return filtered;
  };

  const handleSearchResult = (receivedMeetings) => {
    // Update meetings state with the search results
    if (Array.isArray(receivedMeetings)) {
      setMeetings(receivedMeetings);
      // Immediately filter by active tab
      const filtered = filterMeetingsByTab(receivedMeetings, activeTab);
      setFilteredMeetings(filtered);
    } else {
      console.error('Received non-array meetings:', receivedMeetings);
      setMeetings([]);
      setFilteredMeetings([]);
    }
    setIsLoading(false);
    setError(null);
  };

  const handleSearchStart = () => {
    // Set loading state when search starts
    setIsLoading(true);
  };

  const handleSearchError = (errorMessage) => {
    // Handle search errors
    setError(errorMessage);
    setIsLoading(false);
  };

  const handleFilter = () => {
    console.log('Filter button clicked');
    // Implement filter modal or dropdown
  };
  
  const handleSelectMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    
    // Instead of redirecting, scroll to and highlight the meeting
    setTimeout(() => {
      const meetingElement = document.getElementById(`meeting-${meeting.id}`);
      if (meetingElement) {
        meetingElement.scrollIntoView({ behavior: 'smooth' });
        // Add a highlight effect
        meetingElement.classList.add('highlight-meeting');
        setTimeout(() => {
          meetingElement.classList.remove('highlight-meeting');
        }, 2000);
      }
    }, 100);
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

        {/* Page Header */}
        <div className="mb-3 mb-md-4">
          <h1 className="h3 h2-md mb-1 mb-md-2 font-inter fw-bold">Meetings</h1>
          <p className="text-muted small">
            Stay on track with this upcoming/past session.
          </p>
        </div>

        {/* Search and Filter */}
        <SearchBar 
          onFilter={handleFilter} 
          onSelectMeeting={handleSelectMeeting}
          onSearchResult={handleSearchResult}
          onSearchStart={handleSearchStart}
          onSearchError={handleSearchError}
          activeTab={activeTab}
        />

        {/* Meeting tabs */}
        <div className='w-100 d-flex flex-column bg-white py-2 py-md-3 rounded-3 rounded-md-4 shadow-sm'>
          <div className="border-bottom border-1 border-dark px-2 px-md-4 overflow-auto">
            <ul className="list-unstyled d-flex gap-3 gap-md-4 mb-0 flex-nowrap">
              {["all", "created", "participating", "hosting", "pending"].map((tab) => (
                <li key={tab}>
                  <div
                    className={`text-black fw-semibold pb-2 pb-md-3 text-nowrap ${activeTab === tab ? "border-bottom border-3 border-primary" : ""}`}
                    onClick={() => setActiveTab(tab)}
                    style={{ cursor: "pointer", fontSize: windowWidth < 576 ? '0.875rem' : '1rem' }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </div>
                </li>
              ))}
              <li className="ms-auto">
                <div className="d-flex align-items-center text-black text-nowrap" style={{ fontSize: windowWidth < 576 ? '0.875rem' : '1rem' }}>
                  {windowWidth >= 576 ? 'Date range ' : ''}<FaCalendarAlt className={windowWidth >= 576 ? 'ms-2' : ''} />
                </div>
              </li>
            </ul>
          </div>
          
          <div className="px-2 px-md-4 py-3">
            {/* Loading state */}
            {isLoading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading meetings...</p>
              </div>
            )}
            
            {/* Error state */}
            {!isLoading && error && (
              <div className="alert alert-danger" role="alert">
                <p className="mb-0">Failed to load meetings: {error}</p>
                <p className="small mb-0 mt-2">Please check your internet connection or try again later.</p>
              </div>
            )}
            
            {/* No meetings state */}
            {!isLoading && !error && filteredMeetings.length === 0 && (
              <div className="text-center py-5">
                <p className="mb-0">No {activeTab} meetings found.</p>
              </div>
            )}
            
            {/* Meetings grid - Using a flex container instead of Bootstrap grid for better control */}
            {!isLoading && !error && filteredMeetings.length > 0 && (
              <div className="d-flex flex-wrap" style={{ margin: '-8px' }}>
                {filteredMeetings.map((meeting) => (
                  <div 
                    key={meeting.id} 
                    id={`meeting-${meeting.id}`}
                    className="p-2"
                    style={{
                      width: cardsPerRow === 1 ? '100%' : 
                             cardsPerRow === 2 ? '50%' : '33.333%',
                      transition: 'width 0.3s ease-in-out'
                    }}
                  >
                    {/* Use the enhanced MeetingCard with integrated time progress */}
                    <MeetingCard 
                      meeting={meeting} 
                      isHighlighted={selectedMeeting && selectedMeeting.id === meeting.id}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .highlight-meeting {
          animation: highlight 2s ease;
        }
        
        @keyframes highlight {
          0% { transform: scale(1); box-shadow: 0 0 0 rgba(59, 59, 215, 0); }
          25% { transform: scale(1.05); box-shadow: 0 0 15px rgba(59, 59, 215, 0.5); }
          50% { transform: scale(1.03); box-shadow: 0 0 10px rgba(59, 59, 215, 0.3); }
          100% { transform: scale(1); box-shadow: 0 0 0 rgba(59, 59, 215, 0); }
        }
      `}</style>
    </div>
  );
}