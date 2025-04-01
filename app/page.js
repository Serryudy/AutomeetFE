'use client'
import React, { useState, useEffect } from 'react'
import SidebarMenu from '../components/SideMenucollapse'
import WeeklyCalendar from '../components/WeeklyCalendar'
import ProfileHeader from '@/components/profileHeader'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/global.css'
import { FaBars } from 'react-icons/fa'

const CalendarPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [showEventCards, setShowEventCards] = useState(false)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Handle initial window sizing and resizing
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth
      setWindowWidth(newWidth)
      setIsMobile(newWidth < 768)
      if (newWidth >= 768) {
        setShowMobileMenu(false)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, []) // Keep empty dependency array for resize listener

  // Separate effect to handle event cards visibility based on sidebar state and window width
  useEffect(() => {
    // Only show event cards if sidebar is collapsed AND window is wide enough
    setShowEventCards(isSidebarCollapsed && windowWidth >= 1200)
  }, [isSidebarCollapsed, windowWidth])

  // Handle sidebar state change
  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed)
    
    // Show event cards only when sidebar is collapsed AND not in mobile view
    if (!isMobile) {
      if (collapsed) {
        setTimeout(() => setShowEventCards(true), 150)
      } else {
        // Hide event cards immediately when sidebar expands
        setShowEventCards(false)
      }
    }
  }

  const eventData = [
    { title: 'Basic terms Meeting', days: 'Tue, Sat', location: 'Zoom - http://sortenedurl.com', color: '#ff8585' },
    { title: 'Featureless abs meeting', days: 'Wed, Thu', location: 'Main conference hall', color: '#fff585' },
    { title: 'Featureless abs meeting', days: 'Tue, Wed, Sat', location: 'Grand aven... http://maps.com', color: '#85ceff' }
  ]

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

      {/* Main Content */}
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

        {/* Calendar Header */}
        <div className="mb-3 mb-md-4">
          <h1 className="h3 h2-md mb-1 mb-md-2 font-inter fw-bold">Calendar</h1>
          <p className="text-muted small">
            Stay ahead of your schedule and make every moment count with your weekly planner.
          </p>
        </div>

        {/* Calendar Section */}
        <div className="d-flex flex-column flex-lg-row gap-3 w-100">
          {/* Weekly Calendar */}
          <div
            className="bg-white rounded shadow-sm"
            style={{
              flex: '1 1 100%',
              minWidth: isMobile ? '100%' : '600px',
              maxWidth: '100%',
              transition: 'min-width 0.3s ease-in-out'
            }}
          >
            <WeeklyCalendar />
          </div>

          {/* Event Description Cards - Now with proper handling */}
          {(showEventCards || isMobile) && (
            <div
              className={`d-flex flex-column mt-3 mt-lg-0 ${isMobile ? 'w-100' : ''}`}
              style={{
                flex: isMobile ? '1 1 100%' : '0 0 auto',
                width: isMobile ? '100%' : '300px',
                minWidth: isMobile ? '100%' : '250px',
                maxWidth: isMobile ? '100%' : '350px',
                gap: '20px',
                backgroundColor: '#ffffff',
                padding: '21px 17px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                opacity: 1,
                transform: 'translateX(0)',
                transition: 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out',
              }}
            >
              <span style={{ fontSize: 'clamp(16px, 2vw, 21px)', fontWeight: 'normal', color: '#000' }}>
                Event description
              </span>

              {eventData.map((event, index) => (
                <div
                  key={index}
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '7px',
                    backgroundColor: event.color,
                    padding: '8px',
                    borderRadius: '6px'
                  }}
                >
                  <span style={{ fontSize: 'clamp(12px, 1.5vw, 14px)', fontWeight: '600', color: '#000' }}>
                    {event.title}
                  </span>
                  <span style={{ fontSize: 'clamp(10px, 1.2vw, 12px)', fontWeight: '600', color: '#000' }}>{event.days}</span>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px' }}>
                    <span style={{ fontSize: 'clamp(10px, 1.2vw, 12px)', fontWeight: '600', color: '#000' }}>Location</span>
                    <img src="/location-icon.png" alt="Location Icon" style={{ width: '10px', height: '10px', objectFit: 'cover' }} />
                    <span style={{ fontSize: 'clamp(10px, 1.2vw, 12px)', color: '#000' }}>{event.location}</span>
                  </div>
                  <span style={{ fontSize: 'clamp(8px, 1vw, 10px)', fontWeight: '600', color: '#000' }}>
                    This meeting is about this thing where these things will be discussed. This meeting is this
                    much relevant to you.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CalendarPage