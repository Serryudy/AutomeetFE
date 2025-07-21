/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import ExternalProfileMenu from './ExternalProfileMenu';

const ExternalProfileHeader = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  // Close the menu when clicking outside
  const handleClickOutside = (e) => {
    if (profileRef.current && !profileRef.current.contains(e.target)) {
      setShowProfileMenu(false);
    }
  };

  // Add event listener when menu is open
  useEffect(() => {
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '0px',
        width: '100%',
        height: '48.64px',
        flex: 'none',
        order: 0,
        alignSelf: 'stretch',
        flexGrow: 0
      }}
    >
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
          {/* Default guest profile image */}
          <Image
            src="/icons/profile.png"
            alt="Profile"
            width={48}
            height={48}
            style={{
              objectFit: 'cover',
              objectPosition: 'center'
            }}
            priority={true}
          />
        </button>

        {/* Profile Menu Popup */}
        {showProfileMenu && (
          <div className="position-absolute end-0" style={{ zIndex: 1000, width: '450px' }}>
            <ExternalProfileMenu />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExternalProfileHeader;