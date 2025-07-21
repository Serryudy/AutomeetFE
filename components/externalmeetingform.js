/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/global.css';
import SidebarMenu from '@/components/SideMenucollapse';
import ProfileHeader from '@/components/profileHeader';
import Calendar from '@/components/calendar';
import { FaEdit, FaCalendarAlt, FaChevronDown, FaSearch, FaFilter, FaCheckCircle, FaBars, FaTimes } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const MeetingForm = ({ meetingId }) => {
   
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [repeat, setRepeat] = useState('Does not repeat');
    const [status, setStatus] = useState('Confirmed');
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
    const [searchContact, setSearchContact] = useState('');
    const [hosts, setHosts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const [isMobile, setIsMobile] = useState(false);
    const [meetingData, setMeetingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState('');
    const [meetingType, setMeetingType] = useState('');
    const [roundRobinDuration, setRoundRobinDuration] = useState('');
    const [participantsToAdd, setParticipantsToAdd] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [dateError, setDateError] = useState('');
    const [userProfiles, setUserProfiles] = useState({});

    
  
    // Fetch meeting data
    useEffect(() => {
      const fetchMeetingData = async () => {
          
          if (!meetingId) return;
          
          try {
              setLoading(true);
              console.log(meetingId);
              // Updated URL to use the external endpoint
              const response = await fetch(`http://localhost:8080/api/meetings/externally/${meetingId}`, {
                  method: 'GET',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  credentials: 'include', // This ensures cookies are sent with the request
              });
              
              if (!response.ok) {
                  throw new Error(`Error fetching meeting: ${response.status}`);
              }
              
              const data = await response.json();
              console.log('Meeting data received:', data); // Add logging to debug
              setMeetingData(data);
              
              // Update state with fetched data
              setTitle(data.title || '');
              setDescription(data.description || '');
              setLocation(data.location || '');
              setRepeat(data.repeat || 'Does not repeat');
              setMeetingType(data.meetingType || '');
              setRoundRobinDuration(data.roundRobinDuration || '');
              setUserRole(data.role || '');
              
              // Format and set time slots if they exist in userAvailability
              if (data.userAvailability && data.userAvailability.timeSlots) {
                  const formattedTimeSlots = data.userAvailability.timeSlots.map((slot, index) => {
                      // Convert ISO strings to Date objects
                      const startDate = new Date(slot.startTime);
                      const endDate = new Date(slot.endTime);
                      
                      // Format to 12 hour time
                      const formatTime = (date) => {
                          let hours = date.getHours();
                          const minutes = date.getMinutes().toString().padStart(2, '0');
                          const ampm = hours >= 12 ? 'PM' : 'AM';
                          hours = hours % 12;
                          hours = hours ? hours : 12; // the hour '0' should be '12'
                          return `${hours}:${minutes} ${ampm}`;
                      };
                      
                      return {
                          id: index + 1,
                          start: formatTime(startDate),
                          end: formatTime(endDate),
                          startTime: slot.startTime,
                          endTime: slot.endTime,
                          date: startDate.toDateString() // Add the date string for display
                      };
                  });
                  
                  setTimeSlots(formattedTimeSlots);
                  // If there's at least one time slot, set the selected date to the first one
                  if (formattedTimeSlots.length > 0) {
                      setSelectedDate(new Date(formattedTimeSlots[0].startTime));
                  }
              }
              
              // Transform participants data
              if (data.participants) {
                  const formattedParticipants = data.participants.map((participant, index) => ({
                      id: index + 1,
                      name: participant.username,
                      group: `Access: ${participant.access}`,
                      access: participant.access
                  }));
                  setParticipants(formattedParticipants);
                  
                  // Fetch user profile for each participant
                  data.participants.forEach(participant => {
                      fetchUserProfile(participant.username);
                  });
              }
              
              // Transform hosts data
              if (data.hosts) {
                  const formattedHosts = data.hosts.map((host, index) => ({
                      id: index + 1,
                      name: host.username,
                      group: 'Hosts',
                      access: host.access
                  }));
                  setHosts(formattedHosts);
                  
                  // Fetch user profile for each host
                  data.hosts.forEach(host => {
                      fetchUserProfile(host.username);
                  });
              }
              
              setLoading(false);
          } catch (err) {
              console.error('Error fetching meeting data:', err);
              setError(err.message);
              setLoading(false);
          }
      };
      
      fetchMeetingData();
    }, [meetingId]);
    
    // Function to fetch user profile
    const fetchUserProfile = async (username) => {
        try {
            const response = await fetch(`http://localhost:8080/api/users/${username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            
            if (!response.ok) {
                throw new Error(`Error fetching user profile: ${response.status}`);
            }
            
            const userData = await response.json();
            console.log(`User profile for ${username}:`, userData);
            
            // Update user profiles state with the new data
            setUserProfiles(prevProfiles => ({
                ...prevProfiles,
                [username]: userData
            }));
        } catch (err) {
            console.error(`Error fetching profile for ${username}:`, err);
        }
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

    // to update the form
    const handleSaveChanges = async () => {
      try {
        // Prepare the update payload based on form data
        const updatePayload = {
          title,
          description,
          location,
          repeat
        };
    
        // Format time slots if there are any
        if (timeSlots.length > 0) {
          // Transform time slots to the format expected by the API
          const formattedTimeSlots = timeSlots.map(slot => {
            return {
              startTime: slot.startTime,
              endTime: slot.endTime
            };
          });
          
          updatePayload.timeSlots = formattedTimeSlots;
        }
        
        // Add participants to add if any
        if (participantsToAdd.length > 0) {
          updatePayload.addParticipants = participantsToAdd;
        }
        
        // Determine which participants to remove by comparing current list with original
        if (meetingData && meetingData.participants) {
          const originalUsernames = meetingData.participants.map(p => p.username);
          const currentUsernames = participants.map(p => p.name);
          
          const usernamesRemoved = originalUsernames.filter(
            username => !currentUsernames.includes(username)
          );
          
          if (usernamesRemoved.length > 0) {
            updatePayload.removeParticipants = usernamesRemoved;
          }
        }
        
        // Make the API call to update the meeting
        const response = await fetch(`http://localhost:8080/api/meetings/${meetingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload),
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`Error updating meeting: ${response.status}`);
        }
        
        const updatedMeeting = await response.json();
        console.log('Meeting updated successfully:', updatedMeeting);
        
        // Update the local state with the response
        setMeetingData(updatedMeeting);
        
        // Update other related states if needed
        if (updatedMeeting.participants) {
          const formattedParticipants = updatedMeeting.participants.map((participant, index) => ({
            id: index + 1,
            name: participant.username,
            group: `Access: ${participant.access}`,
            access: participant.access
          }));
          setParticipants(formattedParticipants);
          
          // Update user profiles for new participants
          updatedMeeting.participants.forEach(participant => {
            if (!userProfiles[participant.username]) {
              fetchUserProfile(participant.username);
            }
          });
        }
        
        if (updatedMeeting.hosts) {
          const formattedHosts = updatedMeeting.hosts.map((host, index) => ({
            id: index + 1,
            name: host.username,
            group: 'Hosts',
            access: host.access
          }));
          setHosts(formattedHosts);
        }
        
        // Reset participant management states
        setParticipantsToAdd([]);
        
        // Clear time slots or update with the response if available
        if (updatedMeeting.timeSlots) {
          // Format the time slots from the response
          const formattedTimeSlots = updatedMeeting.timeSlots.map((slot, index) => {
            // Convert ISO strings to readable format
            const startDate = new Date(slot.startTime);
            const endDate = new Date(slot.endTime);
            
            // Format to 12 hour time
            const formatTime = (date) => {
              let hours = date.getHours();
              const minutes = date.getMinutes().toString().padStart(2, '0');
              const ampm = hours >= 12 ? 'PM' : 'AM';
              hours = hours % 12;
              hours = hours ? hours : 12; // the hour '0' should be '12'
              return `${hours}:${minutes} ${ampm}`;
            };
            
            return {
              id: index + 1,
              start: formatTime(startDate),
              end: formatTime(endDate),
              startTime: slot.startTime,
              endTime: slot.endTime
            };
          });
          
          setTimeSlots(formattedTimeSlots);
        }
        
        // Exit edit mode
        setIsEditing(false);
        
        // Show success notification
        alert('Meeting updated successfully!');
        
      } catch (err) {
        console.error('Error updating meeting:', err);
        alert(`Failed to update meeting: ${err.message}`);
      }
    };

    //search contacts
    const handleSearchContacts = async (query) => {
      setSearchContact(query);
      
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }
      
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`http://localhost:8080/api/contacts`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`Error searching contacts: ${response.status}`);
        }
        
        const data = await response.json();
        setSearchResults(data);
      } catch (err) {
        console.error('Error searching contacts:', err);
        setSearchResults([]);
      }
    };

    //add participants
    const addParticipant = (contact) => {
      const newParticipant = {
        id: Date.now(),
        name: contact.username,
        group: `Access: pending`,
        access: "pending"
      };
      
      const isDuplicate = participants.some(p => p.name === contact.username);
      
      if (!isDuplicate) {
        setParticipants([...participants, newParticipant]);
        setParticipantsToAdd([...participantsToAdd, contact.username]);
        
        // Also fetch the profile for the new participant
        fetchUserProfile(contact.username);
      }
      
      // Clear search
      setSearchContact('');
      setSearchResults([]);
    };

    // cancel meeting functionality
    const cancelMeeting = async () => {
      // Confirm the cancellation
      const isConfirmed = window.confirm(`Are you sure you want to cancel the meeting "${title}"? This action cannot be undone.`);
      
      if (!isConfirmed) return;
      
      try {
        // Call the deletion API endpoint
        const response = await fetch(`http://localhost:8080/api/meetings/${meetingId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // This ensures cookies are sent with the request
        });
        
        if (!response.ok) {
        // Try to get the error message from the response
        let errorMessage = `Error canceling meeting: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // If response is not JSON, use the default message
        }
        throw new Error(errorMessage);
      }
        
        const result = await response.json();
        console.log('Meeting canceled successfully:', result);
        
        // Show success message
        alert('Meeting has been canceled successfully');
        
        // Redirect to the meetings list page
        window.location.href = '/meeting';
        
      } catch (err) {
        console.error('Error canceling meeting:', err);
        alert(`Failed to cancel meeting: ${err.message}`);
      }
    };
    
    // Add another function to handle participant access changes
    const handleParticipantAccessChange = (participantId, checked) => {
      setParticipants(
        participants.map(participant => 
          participant.id === participantId 
            ? { ...participant, access: checked ? "accepted" : "pending" }
            : participant
        )
      );
    };
    
    const removeParticipant = (id) => {
      setParticipants(participants.filter(participant => participant.id !== id));
    };
    
    // Get profile picture for a user
    const getProfilePicture = (username) => {
      if (userProfiles[username] && userProfiles[username].profile_pic) {
        return userProfiles[username].profile_pic;
      }
      return "/profile.png"; // Default image
    };
    
    // Refs for detecting clicks outside the dropdown
    const startTimeRef = useRef(null);
    const endTimeRef = useRef(null);
    const calendarRef = useRef(null);

    const handleDateSelect = (date) => {
      const newDate = date instanceof Date ? date : new Date(date);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (newDate < today) {
        setDateError('Please select a date from today or in the future');
        return;
      }

      setDateError('');
      setSelectedDate(newDate);
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


    // Convert 12-hour format to ISO format
    const convertToISOFormat = (dateStr, timeStr) => {
      const date = new Date(dateStr);
      const [timePart, period] = timeStr.split(' ');
      let [hours, minutes] = timePart.split(':');
      
      hours = parseInt(hours);
      minutes = parseInt(minutes);

      if (period.toLowerCase() === 'pm' && hours !== 12) {
        hours += 12;
      }
      if (period.toLowerCase() === 'am' && hours === 12) {
        hours = 0;
      }

      date.setHours(hours, minutes, 0, 0);
      return date.toISOString();
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
    
      // Convert to ISO format for API
      const startTimeISO = convertToISOFormat(selectedDate, startTime);
      const endTimeISO = convertToISOFormat(selectedDate, endTime);
    
      const newTimeSlot = {
        id: Date.now(),
        start: startTime,
        end: endTime,
        startTime: startTimeISO,
        endTime: endTimeISO
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
    
    if (loading) return <div className="p-4 text-center">Loading meeting data...</div>;
    if (error) return <div className="p-4 text-center text-danger">Error: {error}</div>;
    if (!meetingData) return <div className="p-4 text-center">No meeting data found</div>;
  
    return (
      <div className="container-fluid p-0">
        <div className="card shadow-sm bg-white rounded-3 p-3 p-md-4">
          <div className="card-body p-0">
            <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4 flex-wrap gap-2">
              <h2 className="fw-bold mb-0 fs-4 fs-md-3">{title || 'Meeting name'}</h2>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-info px-3 py-2 me-2">Role: {userRole}</span>
                <button 
                  className="btn btn-secondary d-flex align-items-center px-3 py-2"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={userRole === 'participant'}
                >
                  <FaEdit className="me-2" /> {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
            </div>
  
            <div className="mb-3 mb-md-4">
              <p className="mb-1 fw-bold">Status</p>
              <span className="badge bg-primary px-3 py-2">Confirmed</span>
            </div>
            
            {meetingType && (
              <div className="mb-3 mb-md-4">
                <p className="mb-1 fw-bold">Meeting Type</p>
                <span className="badge bg-secondary px-3 py-2">{meetingType.replace('_', ' ')}</span>
                {meetingType === 'round_robin' && roundRobinDuration && (
                  <span className="badge bg-info ms-2 px-3 py-2">Duration: {roundRobinDuration} minutes</span>
                )}
              </div>
            )}
  
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
  
            <div className="mb-3 mb-md-4">
              <label className="form-label">Date & Time Range</label>
              <div className="p-2 bg-light rounded">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {/* Date Picker */}
                  <div
                    className="d-flex align-items-center bg-white py-2 px-3 rounded calendar-toggle"
                    style={{ 
                      cursor: "pointer", 
                      minWidth: isMobile ? "100%" : "190px",
                      maxWidth: "250px",
                      flex: "1 1 auto" 
                    }}
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    <div className="text-center flex-grow-1 text-truncate">
                      {selectedDate ? selectedDate.toDateString() : "Select Date"}
                    </div>
                    <div className="ms-2">
                      <FaCalendarAlt />
                    </div>
                  </div>

                  {/* Calendar Popup */}
                  {showCalendar && (
                    <div
                      ref={calendarRef}
                      className="position-absolute shadow rounded bg-white"
                      style={{ 
                        top: isMobile ? "350px" : "350px", 
                        left: isMobile ? "15px" : "30px", 
                        zIndex: 10 
                      }}
                    >
                      <Calendar onDateSelect={handleDateSelect} value={selectedDate} />
                    </div>
                  )}

                  {/* Start Time Input */}
                  <div 
                        className="position-relative" 
                        ref={startTimeRef} 
                        style={{ 
                          flex: "1 1 120px", 
                          maxWidth: isMobile ? "100%" : "150px",
                          width: isMobile ? "100%" : "auto"
                        }}
                    >
                        <input
                        type="text"
                        className="form-control bg-white py-2 px-3 rounded"
                        readOnly={!isEditing}
                        style={{ width: "100%", cursor: "pointer" }}
                        placeholder="HH:MM AM/PM"
                        value={startTime}
                        onChange={(e) => handleTimeChange(e.target.value, "start")}
                        onDoubleClick={() => handleDoubleClick("start")}
                        />
                        {showStartTime && (
                        <div
                            className="position-absolute bg-white shadow p-3 rounded mt-1"
                            style={{ 
                            top: "100%", 
                            left: "0", 
                            zIndex: 10, 
                            maxHeight: "150px", 
                            overflowY: "auto",
                            width: "100%" 
                            }}
                        >
                            {generateTimeOptions().map((time, index) => (
                            <div
                                key={index}
                                className="py-2 px-3 hover-bg-light"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleTimeSelect(time, "start")}
                            >
                                {time}
                            </div>
                            ))}
                        </div>
                        )}
                    </div>

                    {/* End Time Input */}
                    <div 
                        className="position-relative" 
                        ref={endTimeRef} 
                        style={{ 
                          flex: "1 1 120px", 
                          maxWidth: isMobile ? "100%" : "150px",
                          width: isMobile ? "100%" : "auto"
                        }}
                    >
                        <input
                        type="text"
                        className="form-control bg-white py-2 px-3 rounded"
                        readOnly={!isEditing}
                        style={{ width: "100%", cursor: "pointer" }}
                        placeholder="HH:MM AM/PM"
                        value={endTime}
                        onChange={(e) => handleTimeChange(e.target.value, "end")}
                        onDoubleClick={() => handleDoubleClick("end")}
                        />
                        {showEndTime && (
                        <div
                            className="position-absolute bg-white shadow p-3 rounded mt-1"
                            style={{ 
                            top: "100%", 
                            left: "0", 
                            zIndex: 10, 
                            maxHeight: "150px", 
                            overflowY: "auto",
                            width: "100%" 
                            }}
                        >
                            {generateTimeOptions().map((time, index) => (
                            <div
                                key={index}
                                className="py-2 px-3 hover-bg-light"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleTimeSelect(time, "end")}
                            >
                                {time}
                            </div>
                            ))}
                        </div>
                        )}
                    </div>

                    {/* Add Button */}
                    <button
                        type="button"
                        className="btn btn-primary d-flex align-items-center justify-content-center"
                        style={{
                        minWidth: "40px",
                        height: "38px",
                        flexShrink: 0,
                        }}
                        onClick={handleAddTimeSlot}
                        disabled={!isEditing}
                    >
                        <FaCheckCircle />
                    </button>
                  </div>

                  {/* Display date error if any */}
                  {dateError && (
                    <div className="text-danger mt-2 small">
                      {dateError}
                    </div>
                  )}
                  {/* Display time slots */}
                  {timeSlots.length > 0 && (
                    <div className="mt-3">
                      <h6 className="mb-2">Added Time Slots:</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {timeSlots.map((slot) => (
                          <div key={slot.id} className="d-flex align-items-center bg-light p-2 rounded">
                            <div>
                              <span className="fw-bold">{new Date(slot.startTime).toLocaleDateString()}</span>
                              <span className="mx-1">|</span>
                              <span>{slot.start} - {slot.end}</span>
                            </div>
                            {isEditing && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger ms-2"
                                onClick={() => handleRemoveTimeSlot(slot.id)}
                                aria-label="Remove time slot"
                              >
                                <FaTimes />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
  
            <div className="mb-3 mb-md-4">
                <label htmlFor="participants" className="form-label">Participants</label>
                
                {isEditing && (
                  <div className="mb-3 position-relative">
                    <div className="position-relative">
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <FaSearch />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by contact"
                          value={searchContact}
                          onChange={(e) => handleSearchContacts(e.target.value)}
                        />
                        <span className="input-group-text bg-white">
                          <FaChevronDown />
                        </span>
                      </div>
                      
                      {/* Search Results Dropdown */}
                      {searchResults.length > 0 && (
                        <div className="position-absolute w-100 mt-1 shadow-sm bg-white rounded border" style={{zIndex: 1000, maxHeight: '200px', overflowY: 'auto'}}>
                          {searchResults.map(contact => (
                            <div 
                              key={contact.username} 
                              className="p-2 border-bottom d-flex align-items-center hover-bg-light" 
                              style={{cursor: 'pointer'}}
                              onClick={() => addParticipant(contact)}
                            >
                              <img 
                                src={userProfiles[contact.username]?.profile_pic || "/profile.png"} 
                                alt={contact.username} 
                                className="rounded-circle me-2"
                                style={{width: '30px', height: '30px', objectFit: 'cover'}}
                              />
                              <div>
                                <div className="fw-bold">{contact.username}</div>
                                {contact.email && <small className="text-muted">{contact.email}</small>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Display hosts section */}
                {hosts.length > 0 && (
                  <div className="mb-3">
                    <h6 className="text-muted mb-2">Hosts</h6>
                    {hosts.map((host) => (
                      <div key={host.id} className="d-flex flex-column flex-md-row bg-light p-2 p-md-3 rounded mb-2">
                        <div className="d-flex align-items-center mb-2 mb-md-0 me-auto">
                          <img 
                            src={getProfilePicture(host.name)} 
                            alt="host" 
                            className="rounded-circle me-2 me-md-3"
                            style={{width: isMobile ? '30px' : '40px', height: isMobile ? '30px' : '40px', objectFit: 'cover'}}
                          />
                          <div>
                            <div className="fw-bold">{host.name}</div>
                            <small className="text-muted">Host - {host.access}</small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Display participants section */}
                {participants.length > 0 && (
                  <div>
                    <h6 className="text-muted mb-2">Participants</h6>
                    {participants.map((participant) => (
                      <div key={participant.id} className="d-flex flex-column flex-md-row bg-light p-2 p-md-3 rounded mb-2">
                        <div className="d-flex align-items-center mb-2 mb-md-0 me-auto">
                          <img 
                            src={getProfilePicture(participant.name)} 
                            alt="participant" 
                            className="rounded-circle me-2 me-md-3"
                            style={{width: isMobile ? '30px' : '40px', height: isMobile ? '30px' : '40px', objectFit: 'cover'}}
                          />
                          <div>
                            <div className="fw-bold">{participant.name}</div>
                            <small className="text-muted">{participant.group}</small>
                            {userProfiles[participant.name]?.company && (
                              <small className="d-block text-muted">{userProfiles[participant.name].company}</small>
                            )}
                          </div>
                        </div>
                        {isEditing && (
                          <div className="d-flex gap-2 align-items-center mt-2 mt-md-0">
                            <div className="form-check form-switch me-3">
                              <input 
                                className="form-check-input"
                                type="checkbox" 
                                id={`accessSwitch-${participant.id}`}
                                checked={participant.access === "accepted"}
                                onChange={(e) => handleParticipantAccessChange(participant.id, e.target.checked)}
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
                    ))}
                  </div>
                )}
                
                {participants.length === 0 && hosts.length === 0 && (
                  <div className="alert alert-info">No participants or hosts added to this meeting.</div>
                )}
            </div>
  
            <div className="mb-3 mb-md-4">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className="form-control"
                id="description"
                rows="3"
                placeholder="A short description for the meeting"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                readOnly={!isEditing}
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
                  value={repeat}
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
              {isEditing ? (
                <>
                  <button className="btn btn-success me-2" onClick={handleSaveChanges}>Save Changes</button>
                  <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                </>
              ) : (
                <>
                  {/* Show Cancel Meeting button only if user is the creator */}
                  {userRole === 'creator' && (
                    <button className="btn btn-danger me-2" onClick={cancelMeeting}>
                      Cancel Meeting
                    </button>
                  )}
                  <Link href={'/content'}><button className="btn btn-primary me-2">Upload</button></Link>
                  <Link href={'/notes'}><button className="btn btn-primary">Take notes</button></Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
};

export default MeetingForm;