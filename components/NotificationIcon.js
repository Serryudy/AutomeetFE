import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import axios from 'axios';

const NotificationIcon = ({ onClick }) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications from the server
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/create/notifications', {
        withCredentials: true // Important to include cookies for authentication
      });
      
      // Count only unread notifications
      const unreadCount = response.data.filter(notification => !notification.isRead).length;
      setNotificationCount(unreadCount);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Set up polling interval to check for new notifications
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Check every 30 seconds

    // Clean up on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="position-relative">
      {/* Notification icon with badge */}
      <FaBell
        size="1.5em"
        style={{
          cursor: 'pointer',
          color: notificationCount > 0 ? 'red' : 'black',
          opacity: loading ? 0.7 : 1,
        }}
        onClick={onClick}
        aria-label={`${notificationCount} unread notifications`}
      />
      
      {/* Notification count badge */}
      {notificationCount > 0 && (
        <span
          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
          style={{ fontSize: '0.75rem', color: 'white' }}
        >
          {notificationCount > 99 ? '99+' : notificationCount}
        </span>
      )}
    </div>
  );
};

export default NotificationIcon;