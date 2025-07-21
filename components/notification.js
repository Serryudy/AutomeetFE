import React, { useState, useEffect } from 'react';

const NotificationsComponent = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [userMeetingRoles, setUserMeetingRoles] = useState({});

  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Function to fetch meeting details to determine meeting type and user role
  const fetchMeetingDetails = async (meetingId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/meetings/${meetingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error fetching meeting details: ${response.status}`);
      }

      const data = await response.json();
      return {
        meetingType: data.meetingType, // e.g., 'round_robin', 'group', etc.
        userRole: data.role // e.g., 'host', 'creator', 'participant'
      };
    } catch (err) {
      console.error('Error fetching meeting details:', err);
      return null;
    }
  };

  //fetch notifications - limited to 20 most recent
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8080/api/notifications?limit=20', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for sending cookies
      });

      if (!response.ok) {
        throw new Error(`Error fetching notifications: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the API response to match the component's data structure
      const formattedNotifications = data.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        read: notification.isRead,
        type: notification.notificationType,
        meetingId: notification.meetingId,
        createdAt: notification.createdAt
      }));
      
      // Fetch meeting details for notifications that have meetingId
      const meetingDetailsPromises = formattedNotifications
        .filter(notif => notif.meetingId)
        .map(async (notif) => {
          const details = await fetchMeetingDetails(notif.meetingId);
          return { meetingId: notif.meetingId, details };
        });

      const meetingDetailsResults = await Promise.all(meetingDetailsPromises);
      const meetingRoles = {};
      
      meetingDetailsResults.forEach(result => {
        if (result.details) {
          meetingRoles[result.meetingId] = result.details;
        }
      });

      setUserMeetingRoles(meetingRoles);
      
      // Filter out notifications based on meeting type and user role
      const filteredNotifications = formattedNotifications.filter(notification => {
        // Only filter if we have meeting details
        if (notification.meetingId && meetingRoles[notification.meetingId]) {
          const { meetingType, userRole } = meetingRoles[notification.meetingId];
          
          // Filter out availability_update and best_timeslot_found notifications 
          // for hosts in round-robin meetings to avoid unnecessary notifications
          if (meetingType === 'round_robin' && userRole === 'host') {
            if (notification.type === 'availability_update' || notification.type === 'best_timeslot_found') {
              return false; // Exclude this notification
            }
          }
        }
        return true; // Include all other notifications
      });
      
      // Sort notifications by createdAt (newest first)
      filteredNotifications.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      // Additional client-side limit as a safeguard
      const limitedNotifications = filteredNotifications.slice(0, 20);

      setNotifications(limitedNotifications);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  // Function to mark a notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const notificationToUpdate = notifications.find(n => n.id === notificationId);
      
      if (!notificationToUpdate || notificationToUpdate.read) {
        return; 
      }

      // Update locally first for better UX
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));

      
      
      const response = await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error marking notification as read: ${response.status}`);
        // Revert the local change if API call fails
        setNotifications(prevNotifications => [...prevNotifications]);
      }
      
      
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Function to mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {

      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
      
      const response = await fetch('http://localhost:8080/api/notifications/markallread', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error marking all notifications as read: ${response.status}`);
        // Revert the local change if API call fails
        fetchNotifications();
      }
      
      
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const navigateToMeeting = (meetingId, notificationType) => {
    if (notificationType === 'availability_request' || notificationType === 'availability_update' || notificationType === 'best_timeslot_found') {
      window.location.href = `/availability/${meetingId}`;
    } else {
      window.location.href = `/meetingdetails/${meetingId}`;
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notif.read;
    if (activeTab === 'read') return notif.read;
    return true;
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;

  // Enhanced date formatting function for ISO 8601 dates
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      // Parse ISO 8601 date format (e.g., "2025-07-18T11:13:21.057764800Z")
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateString);
        return 'Invalid date';
      }

      const now = new Date();
      const diffMs = now - date;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      // Handle future dates (shouldn't happen but just in case)
      if (diffMs < 0) {
        return 'Just now';
      }

      // Less than 30 seconds ago
      if (diffSecs < 30) {
        return 'Just now';
      }

      // Less than a minute ago
      if (diffSecs < 60) {
        return `${diffSecs} sec${diffSecs !== 1 ? 's' : ''} ago`;
      }
      
      // Less than an hour ago
      if (diffMins < 60) {
        return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
      }
      
      // Less than 24 hours ago
      if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      }
      
      // Yesterday
      if (diffDays === 1) {
        return 'Yesterday';
      }
      
      // Less than a week ago
      if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      }
      
      // Less than a month ago (show date)
      if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
      }
      
      // More than a month ago - show actual date
      const currentYear = now.getFullYear();
      const dateYear = date.getFullYear();
      
      // If it's the same year, don't show year
      if (dateYear === currentYear) {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      }
      
      // Different year, show full date
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      
    } catch (error) {
      console.error('Error formatting date:', error, 'Input:', dateString);
      return 'Invalid date';
    }
  };

  // Return early if component is not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div className="notifications-container" style={{ maxWidth: '550px', borderRadius: '15px', width: '370px' }}>
      <div className="card shadow" style={{ border: '1px solid #e0e0e0', borderRadius: '15px' }}>
        {/* Header */}
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3" style={{ borderRadius: '15px 15px 0 0' }}>
          <h5 className="mb-0 fw-bold">Notifications</h5>
          <div className="d-flex align-items-center">
            <button
              className="btn btn-link text-primary text-decoration-none me-2"
              onClick={handleMarkAllAsRead}
              style={{ fontSize: '14px' }}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </button>
            <button 
              className="btn-close" 
              aria-label="Close" 
              onClick={handleClose} 
              style={{ fontSize: '12px' }}
            />
          </div>
        </div>

        {/* Body with sticky tabs */}
        <div className="card-body p-0" style={{ height: '350px', overflowY: 'auto' }}>
          {/* Tabs */}
          <ul
            className="nav nav-tabs border-0"
            style={{
              position: 'sticky',
              top: 0,
              backgroundColor: '#fff',
              zIndex: 1,
              margin: 0
            }}
          >
            <li className="nav-item flex-grow-1 text-center">
              <button
                className={`nav-link border-0 rounded-0 w-100 ${activeTab === 'all' ? 'active border-bottom border-primary border-3' : ''}`}
                onClick={() => setActiveTab('all')}
                style={{ 
                  backgroundColor: activeTab === 'all' ? '#fff' : 'transparent',
                  color: activeTab === 'all' ? '#0d6efd' : '#6c757d'
                }}
              >
                All
              </button>
            </li>
            <li className="nav-item flex-grow-1 text-center">
              <button
                className={`nav-link border-0 rounded-0 w-100 ${activeTab === 'unread' ? 'active border-bottom border-primary border-3' : ''}`}
                onClick={() => setActiveTab('unread')}
                style={{ 
                  backgroundColor: activeTab === 'unread' ? '#fff' : 'transparent',
                  color: activeTab === 'unread' ? '#0d6efd' : '#6c757d'
                }}
              >
                Unread {unreadCount > 0 && <span className="badge bg-primary rounded-pill ms-1">{unreadCount}</span>}
              </button>
            </li>
            <li className="nav-item flex-grow-1 text-center">
              <button
                className={`nav-link border-0 rounded-0 w-100 ${activeTab === 'read' ? 'active border-bottom border-primary border-3' : ''}`}
                onClick={() => setActiveTab('read')}
                style={{ 
                  backgroundColor: activeTab === 'read' ? '#fff' : 'transparent',
                  color: activeTab === 'read' ? '#0d6efd' : '#6c757d'
                }}
              >
                Read
              </button>
            </li>
          </ul>

          {/* Notification List */}
          <div className="list-group list-group-flush">
            {isLoading ? (
              <div className="list-group-item text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="list-group-item text-center py-4 text-danger">
                <p>Error: {error}</p>
                <button className="btn btn-sm btn-outline-primary mt-2" onClick={fetchNotifications}>
                  Try Again
                </button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="list-group-item text-center py-4 text-muted">
                {activeTab === 'unread' && 'No unread notifications.'}
                {activeTab === 'read' && 'No read notifications.'}
                {activeTab === 'all' && 'No notifications available.'}
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`list-group-item list-group-item-action ${!notification.read ? 'bg-light' : ''}`}
                  onClick={() => {
                    markNotificationAsRead(notification.id);
                    if (notification.meetingId) {
                      navigateToMeeting(notification.meetingId, notification.type);
                    }
                  }}
                  style={{ 
                    cursor: 'pointer',
                    borderLeft: !notification.read ? '3px solid #0d6efd' : '3px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div className="d-flex w-100 align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <div className="d-flex align-items-center">
                          <h6 className="mb-0 fw-bold" style={{ fontSize: "15px" }}>
                            {notification.title}
                          </h6>
                          {!notification.read && (
                            <div 
                              className="bg-primary rounded-circle ms-2"
                              style={{ width: '8px', height: '8px', minWidth: '8px' }}
                            />
                          )}
                        </div>
                        <small className="text-muted" style={{ fontSize: "12px", whiteSpace: 'nowrap' }}>
                          {formatDate(notification.createdAt)}
                        </small>
                      </div>
                      <p className="mb-0 text-muted" style={{ fontSize: "14px", lineHeight: '1.4' }}>
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="card-footer bg-white text-center py-2" style={{ borderRadius: '0 0 15px 15px' }}>
          <button 
            className="btn btn-link text-primary text-decoration-none"
            onClick={fetchNotifications}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsComponent;