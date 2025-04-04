import React from 'react';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaVideo, 
  FaCog, 
  FaAdjust, 
  FaSignOutAlt 
} from 'react-icons/fa';

const AccountSettings = () => {
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
            
            <div className="list-group ">
            <a href="#profile" className="border-0 list-group-item list-group-item-action d-flex align-items-center px-3 py-2">
                <FaUser className="me-3" size={22} />
                <span className="fs-6">Register</span>
            </a>
            <a href="#logout" className="border-0 list-group-item list-group-item-action d-flex align-items-center p-3">
                <FaSignOutAlt className="me-3" size={22} />
                <span className="fs-5=6">LogIn</span>
            </a>
            </div>
            
            <hr className="my-4" />
            
            <div className="list-group">
            <a href="#theme" className="border-0 list-group-item list-group-item-action d-flex align-items-center justify-content-between px-3 py-2">
                <div className="d-flex align-items-center">
                <FaAdjust className="me-3" size={22} />
                <span className="fs-5">Theme</span>
                </div>
                <span>&gt;</span>
            </a>
            </div>
        </div> 
      </div>
    </div>
  );
};

const ProfileMenu = () => {
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
            
            <div className="list-group ">
            <a href="#profile" className="border-0 list-group-item list-group-item-action d-flex align-items-center px-3 py-2">
                <FaUser className="me-3" size={22} />
                <span className="fs-5=6">Your Profile</span>
            </a>
            <a href="#calendar" className="border-0 list-group-item list-group-item-action d-flex align-items-center px-3 py-2">
                <FaCalendarAlt className="me-3" size={22} />
                <span className="fs-5=6">Calendar Sync</span>
            </a>
            <a href="#zoom" className="border-0 list-group-item list-group-item-action d-flex align-items-center px-3 py-2">
                <FaVideo className="me-3" size={22} />
                <span className="fs-6">Configure Zoom/Meet</span>
            </a>
            </div>
            
            <hr className="my-4" />
            
            <div className="list-group">
            <a href="#settings" className="border-0 list-group-item list-group-item-action d-flex align-items-center px-3 py-2">
                <FaCog className="me-3" size={22} />
                <span className="fs-6">Settings</span>
            </a>
            
            <a href="#theme" className="border-0 list-group-item list-group-item-action d-flex align-items-center justify-content-between px-3 py-2">
                <div className="d-flex align-items-center">
                <FaAdjust className="me-3" size={22} />
                <span className="fs-6">Theme</span>
                </div>
                <span>&gt;</span>
            </a>
            </div>
            
            <hr className="my-4" />
        </div>
        
        <div className="list-group mb-4">
        <a href="#logout" className="border-0 list-group-item list-group-item-action d-flex align-items-center p-3">
            <FaSignOutAlt className="me-3" size={22} />
            <span className="fs-6">Logout</span>
        </a>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;