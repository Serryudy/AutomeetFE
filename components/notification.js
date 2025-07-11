import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const NotificationsComponent = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications();
  }, []);

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
      
      // Sort notifications by createdAt (newest first)
      formattedNotifications.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      // Additional client-side limit as a safeguard
      const limitedNotifications = formattedNotifications.slice(0, 20);

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
    if (notificationType === 'availability_request') {
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

  // Format date to a readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Return early if component is not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div className="notifications-container" style={{ maxWidth: '550px', borderRadius: '15px', width: '370px' }}>
      <div className="card shadow">
        {/* Header */}
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
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
            <button className="btn-close" aria-label="Close" onClick={handleClose} style={{ fontSize: '12px' }}></button>
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
              zIndex: 1
            }}
          >
            <li className="nav-item flex-grow-1 text-center">
              <button
                className={`nav-link border-0 rounded-0 w-100 ${activeTab === 'all' ? 'active border-bottom border-primary border-3' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All
              </button>
            </li>
            <li className="nav-item flex-grow-1 text-center">
              <button
                className={`nav-link border-0 rounded-0 w-100 ${activeTab === 'unread' ? 'active border-bottom border-primary border-3' : ''}`}
                onClick={() => setActiveTab('unread')}
              >
                Unread {unreadCount > 0 && <span className="badge bg-primary rounded-pill ms-1">{unreadCount}</span>}
              </button>
            </li>
            <li className="nav-item flex-grow-1 text-center">
              <button
                className={`nav-link border-0 rounded-0 w-100 ${activeTab === 'read' ? 'active border-bottom border-primary border-3' : ''}`}
                onClick={() => setActiveTab('read')}
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
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex w-100 align-items-center">
                    <div className="flex-grow-1">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div>
                          <h6 className="mb-1 fw-bold" style={{ fontSize: "15px" }}>{notification.title}</h6>
                        </div>
                        {!notification.read && (
                          <div className="me-2" style={{ width: '20px', height: '20px' }}>
                            <div
                              className="bg-primary rounded-circle"
                              style={{ width: '10px', height: '10px', margin: '2px 0 0 10px' }}
                            ></div>
                          </div>
                        )}
                      </div>
                      <p className="mb-1" style={{ fontSize: "14px" }}>{notification.message}</p>
                      <small className="text-muted" style={{ fontSize: "12px" }}>
                        {notification.createdAt ? formatDate(notification.createdAt) : ''}
                      </small>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="card-footer bg-white text-center py-2">
          <button 
            className="btn btn-link text-primary text-decoration-none"
            onClick={() => {
              fetchNotifications();
            }}
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsComponent;