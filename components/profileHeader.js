import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { MdGroupAdd } from 'react-icons/md';
import NotificationIcon from './NotificationIcon';
import ProfileMenu from './profilemenu';
import NotificationsComponent from './notification';

const ProfileHeader = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
    setShowNotifications(false); // Close notifications when opening profile menu
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowProfileMenu(false); // Close profile menu when opening notifications
  };

  // Close the menus when clicking outside
  const handleClickOutside = (e) => {
    if (profileRef.current && !profileRef.current.contains(e.target)) {
      setShowProfileMenu(false);
    }
    if (notificationRef.current && !notificationRef.current.contains(e.target)) {
      setShowNotifications(false);
    }
  };

  // Add event listener when any menu is open
  React.useEffect(() => {
    if (showProfileMenu || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu, showNotifications]);

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '0px',
        gap: '8.73px',
        width: '100%',
        height: '48.64px',
        flex: 'none',
        order: 0,
        alignSelf: 'stretch',
        flexGrow: 0
      }}
    >
      {/* Add Contact Icon */}
      <button className="btn btn-link p-2">
        <MdGroupAdd size={24} color="#292D32" />
      </button>

      {/* Notification Icon */}
      <div className="position-relative" ref={notificationRef}>
        <button className="btn btn-link p-2" onClick={toggleNotifications}>
          <NotificationIcon />
        </button>
        
        {/* Notifications Popup */}
        {showNotifications && (
          <div className="position-absolute end-0" style={{ zIndex: 1000, width: '350px' }}>
            <NotificationsComponent />
          </div>
        )}
      </div>

      {/* Profile Image with Menu */}
      <div className="position-relative" ref={profileRef}>
        <button 
          className="btn p-0 rounded-circle overflow-hidden" 
          onClick={toggleProfileMenu}
          aria-label="Open profile menu"
        >
          <Image
            src="/icons/profile.png"
            alt="Profile"
            width={48}
            height={48}
            className="object-fit-cover"
          />
        </button>
        
        {/* Profile Menu Popup */}
        {showProfileMenu && (
          <div className="position-absolute end-0" style={{ zIndex: 1000, width: '450px' }}>
            <ProfileMenu />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;