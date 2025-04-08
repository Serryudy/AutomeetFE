'use client';

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/global.css';
import SidebarMenu from '@/components/SideMenucollapse';
import ProfileHeader from '@/components/profileHeader';
import { FaBars, FaTrashAlt, FaBell, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';


export default function NotificationPage() {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  
  // Sample notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'availability',
      title: 'Mark Your Availability for the Meeting!',
      message: 'Choose your preferred time slots open 24 hours before the meeting, with timely reminders to keep you on track.',
      date: 'Today',
      time: '10:22 AM',
      read: false,
      from: 'David Miller',
      details: {
        meetingTitle: 'Project Planning Discussion',
        organizer: 'Sarah Thompson',
        date: 'September 15, 2025',
        actionButton: 'Select Time Slots',
        actionUrl: '/schedule/select-slots',
        footer: 'Stay updated with timely reminders to ensure you don\'t miss it!'
      }
    },
    {
      id: 2,
      type: 'reminder',
      title: 'Meeting Reminder',
      message: 'Your meeting titled "Quarterly Business Review" is scheduled for January 11, 2025, at 2:00 PM. Duration: 45min',
      date: 'Today',
      time: '07:25 AM',
      read: false,
      from: 'Meeting System',
      details: {
        meetingTitle: 'Quarterly Business Review',
        organizer: 'Michael Johnson',
        date: 'January 11, 2025, 2:00 PM',
        actionButton: 'View Meeting Details',
        actionUrl: '/meetings/details',
        footer: 'Meeting duration: 45 minutes'
      }
    },
    {
      id: 3,
      type: 'cancellation',
      title: 'Meeting Cancellation',
      message: 'The meeting titled "Team Strategy Review" scheduled for January 10, 2025, at 3:00 PM has been canceled.',
      date: 'Today',
      time: '02:41 AM',
      read: false,
      from: 'Meeting System',
      details: {
        meetingTitle: 'Team Strategy Review',
        organizer: 'Jennifer Williams',
        date: 'January 10, 2025, 3:00 PM (Canceled)',
        actionButton: 'Acknowledge',
        actionUrl: '/meetings/canceled',
        footer: 'This meeting has been removed from your calendar'
      }
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Meeting Reminder',
      message: 'Your meeting titled "Quarterly Business Review" is scheduled for January 11, 2025, at 2:00 PM. Duration: 45min',
      date: 'Yesterday',
      time: '13:44 PM',
      read: true,
      from: 'Meeting System',
      details: {
        meetingTitle: 'Quarterly Business Review',
        organizer: 'Michael Johnson',
        date: 'January 11, 2025, 2:00 PM',
        actionButton: 'View Meeting Details',
        actionUrl: '/meetings/details',
        footer: 'Meeting duration: 45 minutes'
      }
    },
    {
      id: 5,
      type: 'cancellation',
      title: 'Meeting Cancellation',
      message: 'The meeting titled "Team Strategy Review" scheduled for January 10, 2025, at 3:00 PM has been canceled.',
      date: 'Yesterday',
      time: '09:31 AM',
      read: true,
      from: 'Meeting System',
      details: {
        meetingTitle: 'Team Strategy Review',
        organizer: 'Jennifer Williams',
        date: 'January 10, 2025, 3:00 PM (Canceled)',
        actionButton: 'Acknowledge',
        actionUrl: '/meetings/canceled',
        footer: 'This meeting has been removed from your calendar'
      }
    },
    {
      id: 6,
      type: 'cancellation',
      title: 'Meeting Cancellation',
      message: 'The meeting titled "Team Strategy Review" scheduled for January 10, 2025, at 3:00 PM has been canceled.',
      date: '2024.11.13',
      time: '11:15 AM',
      read: true,
      from: 'Meeting System',
      details: {
        meetingTitle: 'Team Strategy Review',
        organizer: 'Jennifer Williams',
        date: 'January 10, 2025, 3:00 PM (Canceled)',
        actionButton: 'Acknowledge',
        actionUrl: '/meetings/canceled',
        footer: 'This meeting has been removed from your calendar'
      }
    }
  ]);

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

  const deleteNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? {...notification, read: true} : notification
    ));
  };

  const handleNotificationClick = (id) => {
    markAsRead(id);
    setSelectedNotificationId(id);
  };

  const handleBackToList = () => {
    setSelectedNotificationId(null);
  };

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    if (!groups[notification.date]) {
      groups[notification.date] = [];
    }
    groups[notification.date].push(notification);
    return groups;
  }, {});

  const filteredNotifications = () => {
    if (activeTab === 'unread') {
      return Object.entries(groupedNotifications).reduce((acc, [date, items]) => {
        const filtered = items.filter(item => !item.read);
        if (filtered.length > 0) {
          acc[date] = filtered;
        }
        return acc;
      }, {});
    } else if (activeTab === 'read') {
      return Object.entries(groupedNotifications).reduce((acc, [date, items]) => {
        const filtered = items.filter(item => item.read);
        if (filtered.length > 0) {
          acc[date] = filtered;
        }
        return acc;
      }, {});
    }
    return groupedNotifications;
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  const getSelectedNotification = () => {
    return notifications.find(notification => notification.id === selectedNotificationId);
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

        {selectedNotificationId ? (
          // Notification Detail View
          <div>
            <div className="d-flex align-items-center mb-4">
              <button
                className="btn btn-outline-secondary border-0"
                onClick={handleBackToList}
              >
                <FaArrowLeft />
              </button>
              <h1 className="h3 mb-0 fw-bold">Notifications</h1>
            </div>
            
            <div className="card border-0 bg-light rounded-4 shadow-sm">
              {/* Header with sender and timestamp */}
              <div className="card-header bg-transparent border-bottom py-3 px-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <span className="fw-medium">from </span>
                    <span className="fw-bold ms-2">{getSelectedNotification().from}</span>
                  </div>
                  <div className="text-muted">
                    {getSelectedNotification().date}, {getSelectedNotification().time}
                  </div>
                </div>
              </div>
              
              {/* Main content */}
              <div className="card-body p-4 p-md-5">
                {/* Title */}
                <h2 className="text-center fw-bold mb-4">{getSelectedNotification().title}</h2>
                
                {/* Main message */}
                <p className="mx-5 px-5 mb-5">{getSelectedNotification().message}</p>
                
                {/* Meeting details */}
                <div className="m-5 px-5">
                  <div className="mb-1">
                    <span className="fw-medium">Meeting: </span>
                    <span className="fw-bold">{getSelectedNotification().details.meetingTitle}</span>
                  </div>
                  <div className="mb-1">
                    <span className="fw-medium">Organizer: </span>
                    <span className="fw-bold">{getSelectedNotification().details.organizer}</span>
                  </div>
                  <div className="mb-1">
                    <span className="fw-medium">Date: </span>
                    <span className="fw-bold">{getSelectedNotification().details.date}</span>
                  </div>
                </div>
                
                {/* Action button */}
                <div className=" m-5 mb-4 px-5">
                  <button 
                    className="btn btn-primary px-4 py-2"
                    onClick={() => router.push(getSelectedNotification().details.actionUrl)}
                  >
                    {getSelectedNotification().details.actionButton}
                  </button>
                </div>
                
                {/* Footer message */}
                <p className="text-center text-muted mt-5">{getSelectedNotification().details.footer}</p>
              </div>
            </div>
          </div>
        ) : (
          // Notifications List View
          <>
            {/* Content Header */}
            <div className="mb-3 mb-md-4">
              <h1 className="h3 h2-md mb-1 mb-md-2 font-inter fw-bold">Notifications</h1>
              <p className="text-muted small">
                Stay up to date and respond quickly for important updates.
              </p>
            </div>
            
            <div className='w-100 rounded-3 bg-light p-3 p-md-4'>
              {/* Notification Tabs */}
              <nav className="nav nav-tabs border-0 mb-4">
                <div 
                  className={`p-3 ${activeTab === 'all' ? 'active fw-bold border-bottom border-5 border-primary' : 'border-0'} cursor-pointer`}
                  onClick={() => setActiveTab('all')}
                  style={{ cursor: 'pointer' }}
                >
                  All
                  {getUnreadCount() > 0 && (
                    <span className="badge bg-primary rounded-pill ms-2">{getUnreadCount()}</span>
                  )}
                </div>
                <div 
                  className={`p-3 ${activeTab === 'unread' ? 'active fw-bold border-bottom border-5 border-primary' : 'border-0'} cursor-pointer`}
                  onClick={() => setActiveTab('unread')}
                  style={{ cursor: 'pointer' }}
                >
                  Unread
                </div>
                <div 
                  className={`p-3 ${activeTab === 'read' ? 'active fw-bold border-bottom border-5 border-primary' : 'border-0'} cursor-pointer`}
                  onClick={() => setActiveTab('read')}
                  style={{ cursor: 'pointer' }}
                >
                  Read
                </div>
              </nav>

              {/* Notifications List */}
              <div className="notifications-list">
                {Object.keys(filteredNotifications()).length === 0 ? (
                  <div className="text-center py-5">
                    <FaBell className="text-muted mb-3" size={32} />
                    <h5>No notifications</h5>
                    <p className="text-muted">You don't have any {activeTab === 'unread' ? 'unread' : activeTab === 'read' ? 'read' : ''} notifications.</p>
                  </div>
                ) : (
                  Object.entries(filteredNotifications()).map(([date, items]) => (
                    <div key={date} className="mb-4">
                      <h6 className="text-uppercase text-muted mb-3 fw-bold small">{date}</h6>
                      {items.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`card mb-3 notification-card border-0 ${!notification.read ? 'bg-light-blue' : 'bg-white'}`}
                          style={{ 
                            borderLeft: !notification.read ? '4px solid #0d6efd' : 'none',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            borderRadius: '8px',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <div className="card-body p-3">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="fw-bold mb-2">{notification.title}</h6>
                                <p className="mb-0 text-muted">{notification.message}</p>
                              </div>
                              <div className="d-flex flex-column align-items-end">
                                <small className="text-muted">{notification.time}</small>
                                <button 
                                  className="btn btn-sm text-danger mt-2 p-0"
                                  onClick={(e) => deleteNotification(notification.id, e)}
                                >
                                  <FaTrashAlt size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}