import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaVideo, 
  FaCog, 
  FaAdjust, 
  FaSignOutAlt 
} from 'react-icons/fa';
import { UserProfileContext } from './profileHeader'; 

export const AccountSettings = () => {
  return (
    <div className="container font-inter py-4" style={{ maxWidth: '1000px' }}>
      <div className="d-flex flex-column justify-content-between bg-white rounded-3 p-3 shadow">
        <div>
            <div className="d-flex align-items-center mb-4">
                <div className="position-relative">
                    <img
                    src="/profile.png"
                    alt="Profile"
                    className="rounded-circle bg-light"
                    style={{ width: '60px', height: '60px' }}
                    />
                </div>
                <div className="ms-3">
                    <h4 className="mb-0 fw-bold">Guest<br/>Account</h4>
                </div>
            </div>
            
            <hr className="my-4" />
            
            <div className="list-group">
              <Link href="/register" className="border-0 list-group-item list-group-item-action d-flex align-items-center px-3 py-2">
                <FaUser className="me-3" size={22} />
                <span className="fs-6">Register</span>
              </Link>
              <Link href="/login" className="border-0 list-group-item list-group-item-action d-flex align-items-center p-3">
                <FaSignOutAlt className="me-3" size={22} />
                <span className="fs-6">LogIn</span>
              </Link>
            </div>
            
            <hr className="my-4" />
            
            <div className="list-group">
              <Link href="/theme" className="border-0 list-group-item list-group-item-action d-flex align-items-center justify-content-between px-3 py-2">
                <div className="d-flex align-items-center">
                  <FaAdjust className="me-3" size={22} />
                  <span className="fs-5">Theme</span>
                </div>
                <span>&gt;</span>
              </Link>
            </div>
        </div> 
      </div>
    </div>
  );
};

const ProfileMenu = () => {
  // Use the shared user profile context if available, otherwise fall back to local state
  const userProfileContext = React.useContext(UserProfileContext);
  
  const [localUserProfile, setLocalUserProfile] = useState({
    username: '',
    name: '',
    profile_pic: '',
    calendar_connected: false,
  });
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState(null);

  // Determine if we should use context or local state
  const useContextData = userProfileContext && userProfileContext.userProfile !== null;
  
  const userProfile = useContextData ? userProfileContext.userProfile : localUserProfile;
  const loading = useContextData ? userProfileContext.loading : localLoading;
  const error = useContextData ? userProfileContext.error : localError;

  // Only fetch data locally if context is not available
  useEffect(() => {
    const fetchUserProfile = async () => {
      // If context has data, don't fetch again
      if (useContextData) {
        return;
      }
      
      try {
        setLocalLoading(true);
        
        // Try to get data from localStorage first to avoid flash
        const cachedProfile = localStorage.getItem('userProfile');
        if (cachedProfile) {
          setLocalUserProfile(JSON.parse(cachedProfile));
          setLocalLoading(false);
        }
        
        // Then fetch fresh data
        const response = await fetch('http://localhost:8080/api/users/profile', {
          method: 'GET',
          credentials: 'include', // Important to include cookies for authentication
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        setLocalUserProfile(data);
        setLocalLoading(false);
        
        // Cache the data
        localStorage.setItem('userProfile', JSON.stringify(data));
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setLocalError(err.message);
        setLocalLoading(false);
      }
    };

    fetchUserProfile();
  }, [useContextData]);

  const handleLogout = async () => {
    try {
      // Call the server-side logout endpoint
      const response = await fetch('http://localhost:8080/api/auth/logout', {
        method: 'GET',
        credentials: 'include', // Important to include cookies
      });

      if (response.ok) {
        // Redirect to login page after successful logout
        window.location.href = '/login';
      } else {
        console.error('Logout failed:', await response.json());
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Display a loading state
  if (loading) {
    return (
      <div className="container font-inter py-4" style={{ maxWidth: '1000px' }}>
        <div className="d-flex flex-column justify-content-between bg-white rounded-3 p-3 shadow">
          <div>
            <div className="d-flex align-items-center mb-4">
              <div className="position-relative">
                <img
                  src="/profile.png"
                  alt="Profile"
                  className="rounded-circle bg-light"
                  style={{ 
                    width: '60px', 
                    height: '60px',
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                />
              </div>
              <div className="ms-3">
                <h4 className="mb-0 fw-bold">Loading...</h4>
              </div>
            </div>
            
            <hr className="my-4" />
          </div>
        </div>
      </div>
    );
  }
  
  // Handle error state by showing default UI with placeholder data
  const defaultProfile = {
    username: 'Guest',
    name: 'Guest Account',
    profile_pic: '',
    calendar_connected: false
  };
  
  // Use default profile if there's an error or no data
  const displayProfile = error || !userProfile ? defaultProfile : userProfile;

  // Get display name (use username if name is not available)
  const displayName = displayProfile.name || displayProfile.username.split('@')[0];
  
  // Determine if we should show full email or just username part
  const usernameDisplay = displayProfile.username.includes('@') 
    ? displayProfile.username 
    : `${displayProfile.username}`;

  return (
    <div className="container font-inter py-4" style={{ maxWidth: '1000px' }}>
      <div className="d-flex flex-column justify-content-between bg-white rounded-3 p-3 shadow">
        <div>
            <div className="d-flex align-items-center mb-4">
            <div className="position-relative">
              <img 
                src={displayProfile.profile_pic || "/profile.png"} 
                alt="Profile" 
                className="rounded-circle bg-light"
                style={{ 
                  width: '60px', 
                  height: '60px',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/profile.png"; // Fallback image if profile_pic URL fails
                }}
              />
            </div>
            <div className="ms-3">
                <h5 className="mb-0 fw-bold">{displayName}</h5>
                <p className="text-muted mb-0">{usernameDisplay}</p>
            </div>
            </div>
            
            <hr className="my-4" />
            
            {/* Account Settings Navigation */}
            <h4 className="mb-4 text-secondary">Account Settings</h4>
            
            <div className="list-group">
              <Link href="/settings/profile" className="border-0 list-group-item list-group-item-action d-flex align-items-center px-3 py-2">
                <FaUser className="me-3" size={22} />
                <span className="fs-6">Your Profile</span>
              </Link>
              <Link href="/settings/calendarSync" className="border-0 list-group-item list-group-item-action d-flex align-items-center px-3 py-2">
                <FaCalendarAlt className="me-3" size={22} />
                <span className="fs-6">Calendar Sync</span>
                {displayProfile.calendar_connected && (
                  <span className="badge bg-success rounded-pill ms-2">Connected</span>
                )}
              </Link>
              <Link href="/settings/integration" className="border-0 list-group-item list-group-item-action d-flex align-items-center px-3 py-2">
                <FaVideo className="me-3" size={22} />
                <span className="fs-6">Configure Zoom/Meet</span>
              </Link>
            </div>
            
            <hr className="my-4" />
            
            <div className="list-group">
              <Link href="/settings" className="border-0 list-group-item list-group-item-action d-flex align-items-center px-3 py-2">
                <FaCog className="me-3" size={22} />
                <span className="fs-6">Settings</span>
              </Link>
              
              <Link href="/theme" className="border-0 list-group-item list-group-item-action d-flex align-items-center justify-content-between px-3 py-2">
                <div className="d-flex align-items-center">
                  <FaAdjust className="me-3" size={22} />
                  <span className="fs-6">Theme</span>
                </div>
                <span>&gt;</span>
              </Link>
            </div>
            
            <hr className="my-4" />
        </div>
        
        <div className="list-group mb-4">
          {/* We can't use Link for logout since we need to call an API */}
          <a 
            href="#logout" 
            className="border-0 list-group-item list-group-item-action d-flex align-items-center p-3"
            onClick={(e) => { e.preventDefault(); handleLogout(); }}
          >
            <FaSignOutAlt className="me-3" size={22} />
            <span className="fs-6">Logout</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProfileMenu;