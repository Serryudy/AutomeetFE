'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/global.css';
import SidebarMenu from '@/components/SideMenucollapse';
import ProfileHeader from '@/components/profileHeader';
import { FaBars, FaInstagram, FaTwitter, FaLinkedin, FaFacebook } from 'react-icons/fa';
import ReactCountryFlag from 'react-country-flag';
import countries from 'country-telephone-data';
import moment from 'moment-timezone';



export default function Content() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [timezones, setTimezones] = useState([]);

  // Cloudinary states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Profile form states
  const [profileImage, setProfileImage] = useState('/profile.png');
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: '+94',
    timezone: 'Asia/Colombo',
    socialMedia: '',
    industry: '',
    company: '',
    profileImageUrl: '' // Will store Cloudinary URL
  });

  // Initialize selected country with a default value
  useEffect(() => {
    const defaultCountry = countries.allCountries.find(c => c.iso2 === 'LK');
    setSelectedCountry(defaultCountry);
  }, []);

  // Load all timezones
  useEffect(() => {
    const allTimezones = moment.tz.names();
    setTimezones(allTimezones);
  }, []);

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/users/profile', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error fetching profile:', errorData);
          return;
        }

        const userData = await response.json();
        
        // Update form data with user profile information
        setFormData({
          name: userData.name || '',
          bio: userData.bio || '',
          phone: userData.mobile_no || '+94',
          timezone: userData.time_zone || 'Asia/Colombo',
          socialMedia: userData.social_media || '',
          industry: userData.industry || '',
          company: userData.company || '',
          profileImageUrl: userData.profile_pic || ''
        });

        // Update profile image if it exists
        if (userData.profile_pic) {
          setProfileImage(userData.profile_pic);
        }

        // Update selected country based on phone number
        if (userData.mobile_no) {
          const dialCode = userData.mobile_no.split('+')[1]?.substring(0, 2) || '94';
          const country = countries.allCountries.find(c => c.dialCode === dialCode);
          if (country) {
            setSelectedCountry(country);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setShowMobileMenu(false);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File size validation (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit');
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImage(e.target.result);
    };
    reader.readAsDataURL(file);

    // Reset error state
    setUploadError(null);
    
    // Start upload to Cloudinary
    try {
      setIsUploading(true);
      
      // Cloudinary configuration
      const cloudName = 'duocpqb1j'; // Replace with your cloud name
      const uploadPreset = 'profile_uploads'; // Replace with your upload preset
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Cloudinary Error:', errorData);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Upload successful:', data);
      
      // Store the Cloudinary URL in form data
      setFormData(prev => ({
        ...prev,
        profileImageUrl: data.secure_url
      }));
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload image. Please try again.');
      // Keep the local preview even if upload fails
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setFormData({
      ...formData,
      phone: `+${country.dialCode}`
    });
    setShowCountryDropdown(false);
  };

  const validateSocialMediaLink = (url) => {
    const socialMediaPatterns = {
        instagram: /^(https?:\/\/)?(www\.)?instagram\.com(\/.*)?$/,
        twitter: /^(https?:\/\/)?(www\.)?twitter\.com(\/.*)?$/,
        linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com(\/.*)?$/,
        facebook: /^(https?:\/\/)?(www\.)?facebook\.com(\/.*)?$/,
        youtube: /^(https?:\/\/)?(www\.)?youtube\.com(\/.*)?$/
    };

    for (const [platform, pattern] of Object.entries(socialMediaPatterns)) {
      if (pattern.test(url)) {
        return platform;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate social media link if provided
    if (formData.socialMedia && !validateSocialMediaLink(formData.socialMedia)) {
      alert('Please enter a valid social media link');
      return;
    }
    
    // Reset status states
    setSaveSuccess(false);
    setSaveError(null);
    setIsSaving(true);
    
    try {
      // Prepare the data to send to the backend
      const updateData = {
        name: formData.name,
        bio: formData.bio,
        mobile_no: formData.phone,
        time_zone: formData.timezone,
        social_media: formData.socialMedia,
        industry: formData.industry,
        company: formData.company
      };
      
      // Only include profileImageUrl if it was updated
      if (formData.profileImageUrl) {
        updateData.profile_pic = formData.profileImageUrl;
      }
      
      // Send PUT request to update user profile
      const response = await fetch('http://localhost:8080/api/users/edit', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const updatedUser = await response.json();
      console.log('Profile updated successfully:', updatedUser);
      
      // Show success message
      setSaveSuccess(true);
      
      // Update profileImage if it was changed
      if (updatedUser.profile_pic) {
        setProfileImage(updatedUser.profile_pic);
      }
      
      // Success message will disappear after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveError(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Account deletion requested');
      // Implement account deletion logic here
    }
  };

  return (
    <div className="d-flex page-background font-inter" style={{ minHeight: '100vh' }}>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          className="btn btn-light position-fixed rounded-circle p-2"
          style={{ zIndex: 1001, top: '1rem', left: '1rem' }}
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <FaBars size={20} />
        </button>
      )}

      {/* Sidebar Menu */}
      <div
        style={{
          position: 'fixed',
          left: 10,
          top: 10,
          bottom: 0,
          zIndex: 1000,
          transform: isMobile ? `translateX(${showMobileMenu ? '0' : '-100%'})` : 'none',
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        <SidebarMenu
          showmenuicon={true}
          onToggle={handleSidebarToggle}
        />
      </div>

      {/* Mobile Overlay */}
      {isMobile && showMobileMenu && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 999,
            transition: 'opacity 0.3s'
          }}
          onClick={() => setShowMobileMenu(false)}
        ></div>
      )}

      {/* Main content */}
      <div
        className="flex-grow-1 p-3 p-md-4"
        style={{
          marginLeft: isMobile ? 0 : (isSidebarCollapsed ? '90px' : '340px'),
          maxWidth: isMobile ? '100%' : (isSidebarCollapsed ? 'calc(100% - 120px)' : 'calc(100% - 360px)'),
          transition: 'margin-left 0.3s ease-in-out, max-width 0.3s ease-in-out'
        }}
      >
        {/* Profile Header */}
        <div className="mb-3 mb-md-4">
          <ProfileHeader />
        </div>

        {/* Content Header */}
        <div className="mb-3 mb-md-4">
          <h1 className="mb-1 mb-md-2 font-inter fw-bold">Profile</h1>
          <p className="text-muted small">
            Complete your profile to start creating your own schedules.
          </p>
        </div>

        <div className='w-75 rounded-3 bg-light p-3 p-md-4'>
          {/* Status messages */}
          {saveSuccess && (
            <div className="alert alert-success mb-3" role="alert">
              Profile updated successfully!
            </div>
          )}
          
          {saveError && (
            <div className="alert alert-danger mb-3" role="alert">
              {saveError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Profile Image Upload */}
            <div className="d-flex flex-row align-items-center mb-4">
              <div
                className="rounded-circle bg-light-blue d-flex justify-content-center align-items-center overflow-hidden"
                style={{ width: '120px', height: '120px', position: 'relative' }}
              >
                <img
                  src={profileImage}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {isUploading && (
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-light bg-opacity-75">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className='d-flex flex-column ms-3'>
                <label
                  htmlFor="profilePicture"
                  className="btn btn-outline-dark mt-3 py-2 col-md-8"
                  style={{ borderRadius: '25px' }}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload picture'}
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/jpeg, image/png, image/gif"
                  className="d-none"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                <small className="text-muted mt-1">JPG, GIF or PNG. Max size of 5MB.</small>
                {uploadError && <small className="text-danger mt-1">{uploadError}</small>}
                {formData.profileImageUrl && (
                  <small className="text-success mt-1">Image uploaded successfully!</small>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="mb-3">
              <label htmlFor="name" className="form-label fw-bold">Name</label>
              <input
                type="text"
                className="form-control rounded-3"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            {/* Bio */}
            <div className="mb-3">
              <label htmlFor="bio" className="form-label fw-bold">Bio</label>
              <textarea
                className="form-control rounded-3"
                id="bio"
                name="bio"
                rows="4"
                value={formData.bio}
                onChange={handleInputChange}
              />
            </div>

            {/* Mobile No */}
            <div className="mb-3">
              <label htmlFor="phone" className="form-label fw-bold">Mobile No:</label>
              <div className="input-group">
                <div className="input-group-prepend">
                  <button
                    className="btn btn-outline-secondary dropdown-toggle"
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  >
                    {selectedCountry && (
                      <>
                        <ReactCountryFlag
                          countryCode={selectedCountry.iso2}
                          svg
                          style={{ width: '1.5em', height: '1.5em' }}
                        />
                        &nbsp;+{selectedCountry.dialCode}
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="tel"
                  className="form-control rounded-end-3"
                  id="phone"
                  name="phone"
                  value={formData.phone.replace(`+${selectedCountry?.dialCode || '94'}`, '')}
                  onChange={(e) => handleInputChange({
                    target: {
                      name: 'phone',
                      value: `+${selectedCountry?.dialCode || '94'}${e.target.value}`
                    }
                  })}
                />
              </div>
              {showCountryDropdown && (
                <div className="position-absolute bg-white border rounded mt-1" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                  {countries.allCountries.map((country) => (
                    <div
                      key={country.iso2}
                      className="d-flex align-items-center p-2 cursor-pointer"
                      onClick={() => handleCountrySelect(country)}
                    >
                      <ReactCountryFlag
                        countryCode={country.iso2}
                        svg
                        style={{ width: '1.5em', height: '1.5em', marginRight: '8px' }}
                      />
                      <span>{country.name} (+{country.dialCode})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Time zone */}
            <div className="mb-3">
              <label htmlFor="timezone" className="form-label fw-bold">Time zone</label>
              <select
                className="form-select rounded-3"
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            {/* Social media */}
            <div className="mb-3">
              <label htmlFor="socialMedia" className="form-label fw-bold">Social media</label>
              <input
                type="text"
                className="form-control rounded-3"
                id="socialMedia"
                name="socialMedia"
                value={formData.socialMedia}
                onChange={handleInputChange}
                placeholder="Enter social media link (e.g., Instagram, Twitter, LinkedIn)"
              />
              {formData.socialMedia && (
                <div className="mt-2">
                  {validateSocialMediaLink(formData.socialMedia) ? (
                    <span className="text-success">Valid {validateSocialMediaLink(formData.socialMedia)} link</span>
                  ) : (
                    <span className="text-danger">Invalid social media link</span>
                  )}
                </div>
              )}
            </div>

            {/* Industry */}
            <div className="mb-3">
              <label htmlFor="industry" className="form-label fw-bold">Industry</label>
              <input
                type="text"
                className="form-control rounded-3"
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
              />
            </div>

            {/* Company */}
            <div className="mb-4">
              <label htmlFor="company" className="form-label fw-bold">Company</label>
              <input
                type="text"
                className="form-control rounded-3"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
              />
            </div>

            {/* Action buttons */}
            <div className="d-flex flex-wrap gap-2">
              <button
                type="submit"
                className="btn btn-primary px-4 py-2 rounded-pill"
                style={{ backgroundColor: '#4737FF' }}
                disabled={isUploading || isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : 'Save changes'}
              </button>
              <button
                type="button"
                className="btn btn-danger px-4 py-2 rounded-pill"
                onClick={handleDeleteAccount}
                disabled={isUploading || isSaving}
              >
                Delete account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}