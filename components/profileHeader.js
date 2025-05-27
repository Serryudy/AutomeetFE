import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { MdGroupAdd } from 'react-icons/md';
import NotificationIcon from './NotificationIcon';
import ProfileMenu from './profilemenu'; // This now imports just the ProfileMenu component
import NotificationsComponent from './notification';

// Create a user profile context to share between components
export const UserProfileContext = React.createContext({
  userProfile: null,
  loading: true,
  error: null
});

// Create a custom hook to use the user profile context
export const useUserProfile = () => React.useContext(UserProfileContext);

// Profile provider component to fetch and provide user data globally
export const UserProfileProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const cachedProfile = localStorage.getItem('userProfile');
        
        // Use cached profile initially if available
        if (cachedProfile) {
          setUserProfile(JSON.parse(cachedProfile));
          setLoading(false);
        }
        
        // Always fetch fresh data
        const response = await fetch('http://localhost:8080/api/users/profile', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        setUserProfile(data);
        setLoading(false);
        
        // Cache the profile
        localStorage.setItem('userProfile', JSON.stringify(data));
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);
  
  return (
    <UserProfileContext.Provider value={{ userProfile, loading, error }}>
      {children}
    </UserProfileContext.Provider>
  );
};

const ProfileHeader = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  
  // State for user profile if not using context
  const [localUserProfile, setLocalUserProfile] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);
  
  // Try to use context if available
  const userProfileContext = React.useContext(UserProfileContext);
  
  // Check if we should use context data
  const useContextData = userProfileContext && userProfileContext.userProfile !== null;
  
  // Determine which data source to use
  const userProfile = useContextData ? userProfileContext.userProfile : localUserProfile;
  const loading = useContextData ? userProfileContext.loading : localLoading;

  // Fetch user profile if context is not available
  useEffect(() => {
    const fetchUserProfile = async () => {
      // Skip if using context data
      if (useContextData) return;
      
      try {
        // Try to use cached profile first
        const cachedProfile = localStorage.getItem('userProfile');
        if (cachedProfile) {
          setLocalUserProfile(JSON.parse(cachedProfile));
          setLocalLoading(false);
        }
        
        // Then fetch fresh data
        const response = await fetch('http://localhost:8080/api/users/profile', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        setLocalUserProfile(data);
        setLocalLoading(false);
        
        // Cache for future use
        localStorage.setItem('userProfile', JSON.stringify(data));
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setLocalLoading(false);
      }
    };

    fetchUserProfile();
  }, [useContextData]);

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
  useEffect(() => {
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
          style={{
            width: '48px',
            height: '48px',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {!loading && userProfile && userProfile.profile_pic ? (
            // If we have a profile picture from API, use it
            <img
              src={userProfile.profile_pic}
              alt="Profile"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/icons/profile.png"; // Fallback image
              }}
            />
          ) : (
            // Otherwise use Next.js Image component with default image
            <Image
              src="/icons/profile.png"
              alt="Profile"
              width={48}
              height={48}
              style={{
                objectFit: 'cover',
                objectPosition: 'center'
              }}
              priority={true} // Prioritize loading this image
            />
          )}
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
