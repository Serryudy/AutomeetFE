'use client';

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/global.css';
import SidebarMenu from '@/components/SideMenucollapse';
import ProfileHeader from '@/components/profileHeader';
import { FaBars, FaTrashAlt, FaBell, FaArrowLeft, FaArrowUp } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function NotificationPage() {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoadingState] = useState(true);
  const [error, setError] = useState(null);
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [meetingFetchError, setMeetingFetchError] = useState(null);
  const [currentView, setCurrentView] = useState('list');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    fetchNotifications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to fetch notifications from the API
  const fetchNotifications = async () => {
    try {
      setIsLoadingState(true);
      setError(null);
      
      const response = await fetch('http://localhost:8080/api/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error fetching notifications: ${response.status}`);
      }
      console.log(response);
      const data = await response.json();
      
      // Transform the API response to match the component's data structure
      const formattedNotifications = data.map(notification => ({
        id: notification.id,
        type: notification.notificationType,
        title: notification.title,
        message: notification.message,
        date: formatDate(notification.createdAt),
        time: new Date(notification.createdAt).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        read: notification.isRead,
        from: notification.from || 'Meeting System',
        createdAt: notification.createdAt, // Keep original timestamp for sorting
        details: {
          meetingTitle: notification.meetingTitle,
          organizer: notification.organizer,
          date: notification.meetingDate,
          actionButton: getActionButton(notification.notificationType),
          actionUrl: getActionUrl(notification.meetingId, notification.notificationType),
          footer: notification.footer || ''
        }
      }))
      // Simple reverse (if API returns in chronological order)
      .reverse();

      setNotifications(formattedNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setIsLoadingState(false);
    }
  };

  // Function to mark a notification as read
  const markAsRead = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error marking notification as read: ${response.status}`);
      }

      setNotifications(notifications.map(notification => 
        notification.id === id ? {...notification, read: true} : notification
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Function to delete a notification
  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      const response = await fetch(`http://localhost:8080/api/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error deleting notification: ${response.status}`);
      }

      setNotifications(notifications.filter(notification => notification.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.setHours(0,0,0,0) - date.setHours(0,0,0,0);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    let dateLabel;
    if (diffDays === 0) dateLabel = 'Today';
    else if (diffDays === 1) dateLabel = 'Yesterday';
    else dateLabel = date.toLocaleDateString();

    const timeLabel = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return `${dateLabel}, ${timeLabel}`;
  };

  // Helper function to get action button text
  const getActionButton = (type) => {
    switch (type) {
      case 'availability_request':
        return 'Select Time Slots';
      case 'reminder':
        return 'View Meeting Details';
      case 'cancellation':
        return 'Acknowledge';
      default:
        return 'View Details';
    }
  };

  // Helper function to get action
  const getActionUrl = (meetingId, type) => {
    switch (type) {
      case 'availability_request':
        return `/availability/${meetingId}`;
      case 'reminder':
        return `/meetingdetails/${meetingId}`;
      case 'cancellation':
        return `/meetingdetails/${meetingId}`;
      default:
        return `/meetingdetails/${meetingId}`;
    }
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

  // Handle notification click to fetch meeting details
  const handleNotificationClick = async (id) => {
  try {
    await markAsRead(id);
    
    setSelectedNotificationId(id);
    setMeetingFetchError(null);
    
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;

    const meetingId = notification.details.actionUrl.split('/').pop();
    
    const response = await fetch(`http://localhost:8080/api/meetings/${meetingId}`, {
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        setMeetingFetchError('This meeting is no longer available.');
      } else {
        setMeetingFetchError('Unable to load meeting details at this time.');
      }
      setMeetingDetails(null);
      return;
    }

    setMeetingDetails(data);
  } catch (error) {
    setMeetingFetchError('Unable to load meeting details at this time.');
    setMeetingDetails(null);
  }
};

  const handleBackToList = () => {
    setSelectedNotificationId(null);
  };

  // Update the filtered Notifications related page
  const filteredNotifications = () => {
    if (isLoading) return {};
    if (error) return {};

    return notifications.reduce((groups, notification) => {
      const date = notification.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      if (activeTab === 'all' ||
          (activeTab === 'unread' && !notification.read) ||
          (activeTab === 'read' && notification.read)) {
        groups[date].push(notification);
      }
      return groups;
    }, {});
  };

  //get unread count
  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  const getSelectedNotification = () => {
    return notifications.find(notification => notification.id === selectedNotificationId);
  };

  // Update the navigation handler
  const handleNavigation = (url) => {
    router.push(url);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    // Remove time part for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    const diffDays = (today - compareDate) / (1000 * 60 * 60 * 24);

    let dateLabel;
    if (diffDays === 0) dateLabel = 'Today';
    else if (diffDays === 1) dateLabel = 'Yesterday';
    else dateLabel = date.toLocaleDateString();

    const timeLabel = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return `${dateLabel}, ${timeLabel}`;
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

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          className="btn btn-primary position-fixed rounded-circle p-2 shadow-lg"
          style={{
            bottom: '2rem',
            right: '2rem',
            zIndex: 1000,
            width: '45px',
            height: '45px',
            border: 'none',
            transition: 'all 0.3s ease',
            opacity: showScrollTop ? 1 : 0,
            transform: showScrollTop ? 'scale(1)' : 'scale(0)'
          }}
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <FaArrowUp size={15} />
        </button>
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
              <div className="card-header bg-transparent border-bottom py-3 px-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <span className="fw-medium">from </span>
                    <span className="fw-bold ms-2">{getSelectedNotification().from}</span>
                  </div>
                  <div className="text-muted">
                    {getSelectedNotification().date.split(',')[0]}, {getSelectedNotification().time}
                  </div>
                </div>
              </div>
              
              {/* Main content */}
              <div className="card-body p-4 p-md-5">

                <h2 className="text-center fw-bold mb-4">{getSelectedNotification().title}</h2>
                <p className="mx-5 px-5 mb-5">{getSelectedNotification().message}</p>

                {meetingFetchError ? (
                  <div className="alert alert-info m-5 px-5 text-center">
                    <p className="mb-0">{meetingFetchError}</p>
                  </div>
                ) : meetingDetails && (
                  <div className="m-5 px-5">
                    <div className="mb-3">
                      <span className="fw-medium">Meeting Title: </span>
                      <span className="fw-bold">{meetingDetails.title}</span>
                    </div>
                    <div className="mb-3">
                      <span className="fw-medium">Date & Time: </span>
                      <span className="fw-bold">
                        {meetingDetails.directTimeSlot ? (
                          <>
                            {new Date(meetingDetails.directTimeSlot.startTime).toLocaleString()} - {' '}
                            {new Date(meetingDetails.directTimeSlot.endTime).toLocaleTimeString()}
                          </>
                        ) : meetingDetails.proposedTimeSlots ? (
                          <div className="mt-2">
                            {meetingDetails.proposedTimeSlots.map((slot, index) => (
                              <div key={index} className="mb-1">
                                Option {index + 1}: {new Date(slot.startTime).toLocaleString()} - {' '}
                                {new Date(slot.endTime).toLocaleTimeString()}
                              </div>
                            ))}
                          </div>
                        ) : (
                          'Time not specified'
                        )}
                      </span>
                    </div>
                    <div className="mb-3">
                      <span className="fw-medium">Location: </span>
                      <span className="fw-bold">{meetingDetails.location || 'Not specified'}</span>
                    </div>
                    <div className="mb-3">
                      <span className="fw-medium">Status: </span>
                      <span className="fw-bold text-capitalize">{meetingDetails.status}</span>
                    </div>
                    {meetingDetails.description && (
                      <div className="mb-3">
                        <span className="fw-medium">Description: </span>
                        <span className="fw-bold">{meetingDetails.description}</span>
                      </div>
                    )}
                    
                  </div>
                )}

                <div className="m-5 mb-4 px-5">
                  <button 
                    className="btn btn-primary px-4 py-2"
                    onClick={() => handleNavigation(getSelectedNotification().details.actionUrl)}
                  >
                    {getSelectedNotification().details.actionButton}
                  </button>
                </div>
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
                  
                </div>
                <div 
                  className={`p-3 ${activeTab === 'unread' ? 'active fw-bold border-bottom border-5 border-primary' : 'border-0'} cursor-pointer`}
                  onClick={() => setActiveTab('unread')}
                  style={{ cursor: 'pointer' }}
                >
                  Unread
                  {getUnreadCount() > 0 && (
                    <span className="badge bg-primary rounded-pill ms-2">{getUnreadCount()}</span>
                  )}
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
                {isLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading notifications...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-5">
                    <div className="alert alert-danger" role="alert">
                      <h5 className="alert-heading">Error loading notifications</h5>
                      <p className="mb-0">{error}</p>
                      <hr />
                      <button 
                        className="btn btn-outline-danger btn-sm"
                        onClick={fetchNotifications}
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                ) : Object.values(filteredNotifications()).flat().length === 0 ? (
                  <div className="text-center py-5">
                    <FaBell className="text-muted mb-3" size={32} />
                    <h5>No notifications</h5>
                    <p className="text-muted">You don&apos;t have any {activeTab === 'unread' ? 'unread' : activeTab === 'read' ? 'read' : ''} notifications.</p>
                  </div>
                ) : (
                  Object.entries(filteredNotifications()).map(([date, items]) => (
                    <div key={date} className="mb-4">
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
                                <p className="mb-0 text-muted" style={{fontSize: '0.875rem'}}>{notification.message}</p>
                              </div>
                              <div className="d-flex flex-column align-items-end" style={{ minWidth: '150px' }}>
                                <small className="text-muted">{formatDateTime(notification.createdAt)}</small>
                                
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