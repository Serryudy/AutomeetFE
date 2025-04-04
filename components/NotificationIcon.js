import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';

const NotificationIcon = () => {
  const [notificationCount, setNotificationCount] = useState(0); // State to keep track of notifications

  // Simulate notification arrival for demonstration purposes
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setNotificationCount((prevCount) => prevCount + 1); // Increment notification count
//     }, 5000); // For demo, increment every 5 seconds

//     return () => clearInterval(interval); // Cleanup interval on component unmount
//   }, []);

  return (
    <div className="position-relative">
      {/* Notification icon with badge */}
      <FaBell
        size="1.5em"
        style={{
          cursor: 'pointer',
          color: notificationCount > 0 ? 'red' : 'black', // Change color to red when notifications are present
        }}
      />
      {/* Notification count */}
      {notificationCount > 0 && (
        <span
          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
          style={{ fontSize: '0.75rem', color: 'white' }}
        >
          {notificationCount}
        </span>
      )}
    </div>
  );
};

export default NotificationIcon;
