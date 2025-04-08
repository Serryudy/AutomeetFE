import React from 'react';
import Link from 'next/link';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaVideo, 
  FaCog, 
  FaAdjust, 
  FaSignOutAlt 
} from 'react-icons/fa';

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
  const handleLogout = async () => {
    try {
      // Call the server-side logout endpoint
      const response = await fetch('http://localhost:8080/auth/logout', {
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
                <h5 className="mb-0 fw-bold">John_Doe</h5>
                <p className="text-muted mb-0">Jhonathan Doeresami</p>
            </div>
            </div>
            
            <hr className="my-4" />
            
            {/* Account Settings Navigation */}
            <h4 className="mb-4 text-secondary">Account Settings</h4>
            
            <div className="list-group">
              <Link href="/profile" className="border-0 list-group-item list-group-item-action d-flex align-items-center px-3 py-2">
                <FaUser className="me-3" size={22} />
                <span className="fs-6">Your Profile</span>
              </Link>
              <Link href="/calendar" className="border-0 list-group-item list-group-item-action d-flex align-items-center px-3 py-2">
                <FaCalendarAlt className="me-3" size={22} />
                <span className="fs-6">Calendar Sync</span>
              </Link>
              <Link href="/zoom" className="border-0 list-group-item list-group-item-action d-flex align-items-center px-3 py-2">
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