'use client';

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../../styles/global.css';
import SidebarMenu from '../../../components/SideMenucollapse';
import ProfileHeader from '@/components/profileHeader';
import Calendar from '@/components/calendar';
import { FaEdit, FaCalendarAlt, FaChevronDown, FaSearch, FaFilter, FaCheckCircle, FaBars, FaTimes } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const MeetingForm = ({ meetingId }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [repeat, setRepeat] = useState('Does not repeat');
    const [status, setStatus] = useState('Confirmed');
    const [meetingType, setMeetingType] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [showStartTime, setShowStartTime] = useState(false);
    const [showEndTime, setShowEndTime] = useState(false);
    const [startTime, setStartTime] = useState("09:00 AM");
    const [endTime, setEndTime] = useState("10:00 AM");
    const [timeSlots, setTimeSlots] = useState([]);
    const [timeError, setTimeError] = useState('');
    const [participants, setParticipants] = useState([]);
    const [hosts, setHosts] = useState([]);
    const [duration, setDuration] = useState('');
    const [searchContact, setSearchContact] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const [isMobile, setIsMobile] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Use the meeting ID for data fetching
    useEffect(() => {
      const fetchMeetingDetails = async () => {
          setIsLoading(true);
          try {  
             const response = await fetch(`http://localhost:8080/create/meetings/${meetingId}`, {
                  method: 'GET',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  credentials: 'include'
              });
              
              if (!response.ok) {
                  throw new Error('Failed to fetch meeting details');
              }
              
              const data = await response.json();
              console.log('Meeting data:', data);
              
              // Set common fields
              setTitle(data.title || '');
              setDescription(data.description || '');
              setLocation(data.location || '');
              setMeetingType(data.meetingType || '');
              setRepeat(data.repeat || 'Does not repeat');
              
              // Parse participants
              if (data.participants && Array.isArray(data.participants)) {
                  const formattedParticipants = data.participants.map((p, index) => ({
                      id: index + 1,
                      name: p.username || 'Unknown',
                      group: `Access: ${p.access || 'unknown'}`
                  }));
                  setParticipants(formattedParticipants);
              }
              
              // Handle meeting type specific data
              if (data.meetingType === 'direct' && data.directTimeSlot) {
                  // Format direct meeting time slots
                  const startDate = new Date(data.directTimeSlot.startTime);
                  const endDate = new Date(data.directTimeSlot.endTime);
                  
                  setSelectedDate(startDate);
                  setStartTime(formatTimeString(startDate));
                  setEndTime(formatTimeString(endDate));
                  
                  // Add as a time slot
                  setTimeSlots([{
                      id: Date.now(),
                      start: formatTimeString(startDate),
                      end: formatTimeString(endDate)
                  }]);
              } 
              else if (data.meetingType === 'group') {
                  setDuration(data.groupDuration || '60');
              }
              else if (data.meetingType === 'round_robin') {
                  setDuration(data.roundRobinDuration || '60');
                  
                  // Format hosts
                  if (data.hosts && Array.isArray(data.hosts)) {
                      const formattedHosts = data.hosts.map((h, index) => ({
                          id: index + 1,
                          name: h.username || 'Unknown Host',
                          group: `Access: ${h.access || 'unknown'}`
                      }));
                      setHosts(formattedHosts);
                  }
              }
              
          } catch (error) {
              console.error("Error fetching meeting details:", error);
              setError(error.message);
          } finally {
              setIsLoading(false);
          }
      };
      
      if (meetingId) {
          fetchMeetingDetails();
      }
  }, [meetingId]);

  // Function to format date objects to time strings
  const formatTimeString = (date) => {
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      hours = hours % 12;
      hours = hours ? hours : 12; // Convert 0 to 12
      
      return `${hours}:${minutes} ${ampm}`;
  };
  
    // Track window width for responsive design
    useEffect(() => {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
        setIsMobile(window.innerWidth < 768);
      };
      
      handleResize(); // Initial check
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const removeParticipant = (id) => {
      setParticipants(participants.filter(participant => participant.id !== id));
    };
    
    // Refs for detecting clicks outside the dropdown
    const startTimeRef = useRef(null);
    const endTimeRef = useRef(null);
    const calendarRef = useRef(null);

    const handleNext = () => {
      if (currentStep < 3) setCurrentStep(currentStep + 1);
    };

    const handleDateSelect = (date) => {
      setSelectedDate(date);
      setShowCalendar(false);
    };

    const generateTimeOptions = () => {
      const times = [];
      let hour = 12;
      let period = "AM";

      for (let i = 0; i < 24; i++) {
          times.push(`${hour}:00 ${period}`);
          hour = hour === 12 ? 1 : hour + 1;
          if (hour === 12) period = period === "AM" ? "PM" : "AM";
      }
      return times;
    };

    // Time validation function
    const validateTimeFormat = (time) => {
      const timeRegex = /^(1[0-2]|0?[1-9]):([0-5][0-9]) (AM|PM)$/i;
      return timeRegex.test(time);
    };

    // Convert time to 24-hour format for comparison
    const convertTo24HourFormat = (time) => {
      const [timePart, period] = time.split(' ');
      let [hours, minutes] = timePart.split(':');
      
      hours = parseInt(hours);
      minutes = parseInt(minutes);

      if (period.toLowerCase() === 'pm' && hours !== 12) {
          hours += 12;
      }
      if (period.toLowerCase() === 'am' && hours === 12) {
          hours = 0;
      }

      return hours * 60 + minutes;
    };

    const handleAddTimeSlot = () => {
      setTimeError('');

      if (!validateTimeFormat(startTime)) {
          setTimeError('Invalid start time format. Use HH:MM AM/PM');
          return;
      }

      if (!validateTimeFormat(endTime)) {
          setTimeError('Invalid end time format. Use HH:MM AM/PM');
          return;
      }

      const startMinutes = convertTo24HourFormat(startTime);
      const endMinutes = convertTo24HourFormat(endTime);

      if (endMinutes <= startMinutes) {
          setTimeError('End time must be later than start time');
          return;
      }

      const newTimeSlot = {
          id: Date.now(),
          start: startTime,
          end: endTime
      };

      const isDuplicate = timeSlots.some(
          slot => slot.start === newTimeSlot.start && slot.end === newTimeSlot.end
      );

      if (isDuplicate) {
          setTimeError('This time slot has already been added');
          return;
      }

      setTimeSlots([...timeSlots, newTimeSlot]);
    };

    const handleRemoveTimeSlot = (id) => {
      setTimeSlots(timeSlots.filter(slot => slot.id !== id));
    };

    const handleTimeSelect = (time, type) => {
      if (type === "start") {
          setStartTime(time);
          setShowStartTime(false);
      } else if (type === "end") {
          setEndTime(time);
          setShowEndTime(false);
      }
    };

    const handleTimeChange = (value, type) => {
      if (type === "start") {
          setStartTime(value);
      } else {
          setEndTime(value);
      }
    };

    const handleDoubleClick = (type) => {
      if (type === "start") {
          setShowStartTime(true);
      } else if (type === "end") {
          setShowEndTime(true);
      }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
          if (startTimeRef.current && !startTimeRef.current.contains(event.target)) {
            setShowStartTime(false);
          }
          if (endTimeRef.current && !endTimeRef.current.contains(event.target)) {
            setShowEndTime(false);
          }
          if (calendarRef.current && !calendarRef.current.contains(event.target) && 
              !event.target.closest('.calendar-toggle')) {
            setShowCalendar(false);
          }
      };

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
          document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
  
    return (
      <div className="container-fluid p-0">
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center" style={{height: '300px'}}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger">
            Error loading meeting details: {error}
          </div>
        ) : (
          <div className="card shadow-sm bg-white rounded-3 p-3 p-md-4">
            <div className="card-body p-0">
              <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4 flex-wrap gap-2">
                <h2 className="fw-bold mb-0 fs-4 fs-md-3">{title || 'Meeting name'}</h2>
                <button 
                  className="btn btn-secondary d-flex align-items-center px-3 py-2"
                  onClick={() => setIsEditing(!isEditing)}
                  >
                  <FaEdit className="me-2" /> {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
    
              <div className="mb-3 mb-md-4">
                <p className="mb-1 fw-bold">Meeting Type</p>
                <span className="badge bg-info px-3 py-2 text-capitalize">
                  {meetingType.replace('_', ' ')}
                </span>
              </div>
              
              <div className="mb-3 mb-md-4">
                <p className="mb-1 fw-bold">Status</p>
                <span className="badge bg-primary px-3 py-2">Confirmed</span>
              </div>
    
              <div className="mb-3 mb-md-4">
                <label htmlFor="title" className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  readOnly={!isEditing}
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
    
              {/* Meeting Type Specific Fields */}
              {meetingType === 'direct' && (
                <div className="mb-3 mb-md-4">
                  <label className="form-label">Date & Time</label>
                  <div className="p-2 bg-light rounded">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      {/* Date Display */}
                      <div className="d-flex align-items-center bg-white py-2 px-3 rounded calendar-toggle"
                        style={{ 
                          cursor: isEditing ? "pointer" : "default", 
                          minWidth: isMobile ? "100%" : "190px",
                          maxWidth: "250px",
                          flex: "1 1 auto" 
                        }}
                        onClick={() => isEditing && setShowCalendar(!showCalendar)}
                      >
                        <div className="text-center flex-grow-1 text-truncate">
                          {selectedDate ? selectedDate.toDateString() : "Select Date"}
                        </div>
                        {isEditing && (
                          <div className="ms-2">
                            <FaCalendarAlt />
                          </div>
                        )}
                      </div>
  
                      {/* Calendar Popup */}
                      {showCalendar && isEditing && (
                        <div
                          ref={calendarRef}
                          className="position-absolute shadow rounded bg-white"
                          style={{ 
                            top: isMobile ? "350px" : "350px", 
                            left: isMobile ? "15px" : "30px", 
                            zIndex: 10 
                          }}
                        >
                          <Calendar onChange={handleDateSelect} value={selectedDate} />
                        </div>
                      )}
  
                      {/* Time Slots Display */}
                      <div className="d-flex align-items-center gap-2 bg-white py-2 px-3 rounded" style={{flex: "1"}}>
                        {timeSlots.length > 0 ? `${timeSlots[0].start} - ${timeSlots[0].end}` : "No time set"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
  
              {(meetingType === 'group' || meetingType === 'round_robin') && (
                <div className="mb-3 mb-md-4">
                  <label className="form-label">Duration</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      readOnly={!isEditing}
                      value={`${duration} minutes`}
                      onChange={(e) => setDuration(e.target.value.replace(/\D/g, ''))}
                    />
                    {isEditing && (
                      <button className="btn btn-outline-secondary" type="button">
                        <FaChevronDown />
                      </button>
                    )}
                  </div>
                </div>
              )}
  
              {/* Hosts Section for Round Robin */}
              {meetingType === 'round_robin' && hosts.length > 0 && (
                <div className="mb-3 mb-md-4">
                  <label className="form-label">Hosts</label>
                  {hosts.map((host) => (
                    <div key={host.id} className="d-flex flex-column flex-md-row bg-light p-2 p-md-3 rounded mb-2">
                      <div className="d-flex align-items-center mb-2 mb-md-0 me-auto">
                        <img 
                          src="/profile.png" 
                          alt="host" 
                          className="rounded-circle me-2 me-md-3"
                          style={{width: isMobile ? '30px' : '40px', height: isMobile ? '30px' : '40px'}}
                        />
                        <div>
                          <div className="fw-bold">{host.name}</div>
                          <small className="text-muted">{host.group}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
    
              <div className="mb-3 mb-md-4">
                <label htmlFor="participants" className="form-label">Participants</label>
                
                {isEditing && (
                  <div className="mb-3 position-relative">
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <FaSearch />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by contact"
                        value={searchContact}
                        onChange={(e) => setSearchContact(e.target.value)}
                      />
                      <span className="input-group-text bg-white">
                        <FaChevronDown />
                      </span>
                    </div>
                  </div>
                )}
  
                {participants.length > 0 ? participants.map((participant) => (
                  <div key={participant.id} className="d-flex flex-column flex-md-row bg-light p-2 p-md-3 rounded mb-2">
                    <div className="d-flex align-items-center mb-2 mb-md-0 me-auto">
                      <img 
                        src="/profile.png" 
                        alt="participant" 
                        className="rounded-circle me-2 me-md-3"
                        style={{width: isMobile ? '30px' : '40px', height: isMobile ? '30px' : '40px'}}
                      />
                      <div>
                        <div className="fw-bold">{participant.name}</div>
                        <small className="text-muted">{participant.group}</small>
                      </div>
                    </div>
                    {isEditing && (
                      <div className="d-flex gap-2 align-items-center mt-2 mt-md-0">
                        <div className="form-check form-switch me-3">
                          <input 
                            className="form-check-input"
                            type="checkbox" 
                            id={`accessSwitch-${participant.id}`}
                          />
                          <label className="form-check-label" htmlFor={`accessSwitch-${participant.id}`}>
                            Give access
                          </label>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeParticipant(participant.id)}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="alert alert-info">
                    No participants have been added to this meeting.
                  </div>
                )}
              </div>
    
              <div className="mb-3 mb-md-4">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  rows="3"
                  readOnly={!isEditing}
                  placeholder="A short description for the meeting"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
    
              <div className="mb-3 mb-md-4">
                <label htmlFor="location" className="form-label">Location</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    readOnly={!isEditing}
                    placeholder="Choose a place for the meeting"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  {isEditing && (
                    <button className="btn btn-outline-secondary" type="button">
                      <FaChevronDown />
                    </button>
                  )}
                </div>
              </div>
    
              <div className="mb-4">
                <label htmlFor="repeat" className="form-label">Repeat</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    readOnly={!isEditing}
                    placeholder="Does not repeat"
                    value={repeat || 'Does not repeat'}
                    onChange={(e) => setRepeat(e.target.value)}
                  />
                  {isEditing && (
                    <button className="btn btn-outline-secondary" type="button">
                      <FaChevronDown />
                    </button>
                  )}
                </div>
              </div>
    
              <div className="d-flex flex-wrap gap-2 mt-4">
                <Link href={'/content'}><button className="btn btn-primary me-2">Upload</button></Link>
                <Link href={'/notes'}><button className="btn btn-primary">Take notes</button></Link>
                {isEditing && (
                  <button className="btn btn-success ms-auto">Save Changes</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
};

export default function Details() {
  const params = useParams();
  const meetingId = params.id;
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setShowMobileMenu(false);
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <div className="d-flex page-background font-inter" style={{ minHeight: '100vh' }}>  
      {/* Mobile Menu Button */}
      {isMobile && (
        <button 
          className="btn btn-primary position-fixed d-flex align-items-center justify-content-center" 
          style={{ top: '10px', left: '10px', zIndex: 1100, width: '40px', height: '40px' }}
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <FaTimes /> : <FaBars />}
        </button>
      )}
      
      {/* Sidebar */}
      <div style={{ 
        position: 'fixed', 
        left: 10, 
        top: 10, 
        bottom: 0, 
        zIndex: 1000,
        display: isMobile ? (showMobileMenu ? 'block' : 'none') : 'block'
      }}>
        <SidebarMenu 
          showmenuicon={true} 
          onToggle={handleSidebarToggle}
        />
      </div>
      
      {/* Mobile Overlay */}
      {isMobile && showMobileMenu && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" 
          style={{ zIndex: 999 }}
          onClick={() => setShowMobileMenu(false)}
        >
        </div>
      )}
      
      {/* Main content */}
      <div 
        className="flex-grow-1 p-3 p-md-4" 
        style={{
          marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '90px' : '340px'),
          maxWidth: isMobile ? '100%' : (isSidebarCollapsed ? 'calc(100% - 120px)' : 'calc(100% - 360px)'),
          transition: 'margin-left 0.3s ease-in-out, max-width 0.3s ease-in-out',
          paddingTop: isMobile ? '60px' : '0'
        }}
      >
        {/* Profile Header */}
        <div className="mb-3 mb-md-4">
          <ProfileHeader />
        </div>

        {/* Calendar Header */}
        <div className="mb-3 mb-md-4">
          <h1 className="h3 h2-md mb-1 mb-md-2 font-inter fw-bold">Meeting Details</h1>
          <p className="text-muted small">
            Dive into the details and make every meeting count.
          </p>
        </div>
        
        <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4">
            <div className="position-relative flex-grow-1 me-3">
                <div className="input-group bg-white rounded-pill" style={{ height: isMobile ? '40px' : '48px', border: '2px solid #ccc' }}>
                    <span className="input-group-text bg-transparent border-0">
                        <FaSearch className="text-muted" />
                    </span>
                    <input 
                    type="text" 
                    className="form-control border-0"
                    placeholder={isMobile ? "Search..." : "Try searching anything related to the meeting"}
                    />
                    <button className="btn btn-light rounded-pill d-flex align-items-center gap-2">
                        {isMobile ? <FaFilter /> : <>Filter <FaFilter /></>}
                    </button>
                </div>
            </div>
        </div>
        
        <div>
            <MeetingForm meetingId={meetingId} />
        </div>
      </div>
    </div>
  );
}