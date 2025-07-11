/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { HiChatAlt2 } from 'react-icons/hi';
import NotificationIcon from './NotificationIcon';
import ProfileMenu from './profilemenu'; 
import NotificationsComponent from './notification';
import MessageComponent from './MessageComponent';
import { useProfile } from '@/hooks/useProfile';


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

        const { profile, loading: profileLoading } = useProfile();

        const data = profile;
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
  const [showChat, setShowChat] = useState(false);
  const [messageAnimationState, setMessageAnimationState] = useState('hidden'); // 'hidden', 'entering', 'visible', 'exiting'
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const chatRef = useRef(null);

  // State for user profile if not using context
  const [localUserProfile, setLocalUserProfile] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);

  // Message component size and position state
  const [messageComponentSize, setMessageComponentSize] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messageComponent_size');
      return saved ? JSON.parse(saved) : { width: 450, height: 600 };
    }
    return { width: 450, height: 600 };
  });

  const [messageComponentPosition, setMessageComponentPosition] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('messageComponent_position');
      return saved ? JSON.parse(saved) : { x: 100, y: 100 };
    }
    return { x: 100, y: 100 };
  });

  // Save size and position to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('messageComponent_size', JSON.stringify(messageComponentSize));
    }
  }, [messageComponentSize]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('messageComponent_position', JSON.stringify(messageComponentPosition));
    }
  }, [messageComponentPosition]);

  // Try to use context if available
  const userProfileContext = React.useContext(UserProfileContext);
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
    closeMessageComponent(); // Close chat when opening profile menu
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowProfileMenu(false); // Close profile menu when opening notifications
    closeMessageComponent(); // Close chat when opening notifications
  };

  const toggleChat = () => {
    if (messageAnimationState === 'hidden') {
      openMessageComponent();
    } else {
      closeMessageComponent();
    }
    setShowProfileMenu(false); // Close profile menu when opening chat
    setShowNotifications(false); // Close notifications when opening chat
  };

  // Function to open message component with animation
  const openMessageComponent = () => {
    setShowChat(true);
    setMessageAnimationState('entering');
    // After a small delay, transition to visible state
    setTimeout(() => {
      setMessageAnimationState('visible');
    }, 50); // Small delay to ensure the DOM is updated
  };

  // Function to close message component with animation
  const closeMessageComponent = () => {
    if (messageAnimationState === 'hidden') return;
    
    setMessageAnimationState('exiting');
    // Wait for animation to complete before hiding component
    setTimeout(() => {
      setMessageAnimationState('hidden');
      setShowChat(false);
    }, 300); // Match this time to your CSS transition time
  };

  // Close the menus when clicking outside
  const handleClickOutside = (e) => {
    if (profileRef.current && !profileRef.current.contains(e.target)) {
      setShowProfileMenu(false);
    }
    if (notificationRef.current && !notificationRef.current.contains(e.target)) {
      setShowNotifications(false);
    }
    if (chatRef.current && !chatRef.current.contains(e.target)) {
      closeMessageComponent();
    }
  };

  // Add event listener when any menu is open
  useEffect(() => {
    if (showProfileMenu || showNotifications || showChat) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showProfileMenu, showNotifications, showChat]);

  // Handle message component close
  const handleMessageComponentClose = () => {
    closeMessageComponent();
  };

  // Handle message component resize
  const handleMessageComponentResize = (newSize) => {
    setMessageComponentSize(newSize);
  };

  // Handle message component move
  const handleMessageComponentMove = (newPosition) => {
    setMessageComponentPosition(newPosition);
  };

  // Get transform style based on animation state
  const getMessageTransformStyle = () => {
    switch (messageAnimationState) {
      case 'entering':
        return 'translateX(100%)'; // Start from right (off-screen)
      case 'visible':
        return 'translateX(0)'; // Slide to final position
      case 'exiting':
        return 'translateX(100%)'; // Slide back to right (off-screen)
      default:
        return 'translateX(100%)'; // Hidden state
    }
  };

  // Get opacity based on animation state
  const getMessageOpacity = () => {
    switch (messageAnimationState) {
      case 'entering':
        return 0.3;
      case 'visible':
        return 1;
      case 'exiting':
        return 0.3;
      default:
        return 0;
    }
  };

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

      {/* Real-time Chat Icon */}
      <div className="position-relative" ref={chatRef}>
        <button className="btn btn-link p-2" onClick={toggleChat}>
          <HiChatAlt2 size={24} color="#292D32" />
        </button>

        {/* Chat Popup/Component - Now with smooth sliding animation */}
        {showChat && (
          <div
            className="position-fixed"
            style={{
              zIndex: 9999,
              left: `68%`,
              top: `5%`,
              width: `30%`,
              height: `90%`,
              backgroundColor: 'white',
              borderRadius: '15px',
              boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5)',
              border: '1px solid #e0e0e0',
              overflow: 'hidden',
              transform: getMessageTransformStyle(),
              opacity: getMessageOpacity(),
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Smooth easing
              willChange: 'transform, opacity', // Optimize for animation
            }}
          >
            <MessageComponent
              onClose={handleMessageComponentClose}
              onResize={handleMessageComponentResize}
              onMove={handleMessageComponentMove}
              initialSize={messageComponentSize}
              initialPosition={messageComponentPosition}
            />

            {/* Resize Handle */}
            <div
              className="position-absolute"
              style={{
                bottom: 0,
                right: 0,
                width: '20px',
                height: '20px',
                cursor: 'se-resize',
                backgroundColor: 'transparent'
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = messageComponentSize.width;
                const startHeight = messageComponentSize.height;

                const handleMouseMove = (e) => {
                  const newWidth = Math.max(300, startWidth + (e.clientX - startX));
                  const newHeight = Math.max(400, startHeight + (e.clientY - startY));

                  const maxWidth = window.innerWidth - messageComponentPosition.x;
                  const maxHeight = window.innerHeight - messageComponentPosition.y;

                  setMessageComponentSize({
                    width: Math.min(newWidth, maxWidth),
                    height: Math.min(newHeight, maxHeight)
                  });
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '12px',
                  height: '12px',
                  background: 'linear-gradient(-45deg, transparent 30%, #ccc 30%, #ccc 40%, transparent 40%, transparent 60%, #ccc 60%, #ccc 70%, transparent 70%)',
                  borderRadius: '2px'
                }}
              />
            </div>
          </div>
        )}
      </div>

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