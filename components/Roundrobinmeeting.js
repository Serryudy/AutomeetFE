'use client';
import React, { useState, useEffect, useRef } from 'react';
import { FaCalendarAlt, FaCheckCircle, FaSearch, FaChevronDown } from 'react-icons/fa';
import Calendar from './calendar';
import 'react-datepicker/dist/react-datepicker.css';
import FormStepNavigator from './formstepnav';
import SuccessStep from './sucessstep';
import axios from 'axios';

// Complete RoundRobinForm component
const RoundRobinForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("10:00 AM");
  const [timeSlots, setTimeSlots] = useState([]);
  const [timeError, setTimeError] = useState('');
  const [dateError, setDateError] = useState('');
  const [participants, setParticipants] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [searchContact, setSearchContact] = useState('');
  const [searchHost, setSearchHost] = useState('');
  const [contacts, setContacts] = useState([]);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [showHostDropdown, setShowHostDropdown] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [repeat, setRepeat] = useState('none');
  const [duration, setDuration] = useState('60');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUserHosts, setCurrentUserHosts] = useState([]);
  const [titleError, setTitleError] = useState('');
  const [participantError, setParticipantError] = useState('');
  const [hostError, setHostError] = useState(''); // New error state for hosts

  // Refs
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);
  const contactDropdownRef = useRef(null);
  const hostDropdownRef = useRef(null);

  // Fetch contacts and hosts
  useEffect(() => {
    const fetchContactsAndHosts = async () => {
      try {        
        // Fetch participants (contacts)
        const participantsResponse = await axios.get('http://localhost:8080/api/community/contacts', {
          withCredentials: true
        });
        setContacts(Array.isArray(participantsResponse.data) ? participantsResponse.data : (participantsResponse.data.contacts || []));

        // Fetch current user's hosts
        const hostsResponse = await axios.get('http://localhost:8080/api/community/contact/users', {
          withCredentials: true
        });
        const fetchedHosts = Array.isArray(hostsResponse.data) ? hostsResponse.data : (hostsResponse.data.users || []);
        
        // Add a unique key to each host
        const hostsWithKey = fetchedHosts.map(host => ({
          ...host,
          uniqueKey: `host-${host.username}`
        }));

        setCurrentUserHosts(hostsWithKey);
      } catch (error) {
        console.error('Error fetching contacts and hosts:', error);
        setError('Failed to load contacts and hosts');
      }
    };

    fetchContactsAndHosts();

    const handleClickOutside = (event) => {
      if (contactDropdownRef.current && !contactDropdownRef.current.contains(event.target)) {
        setShowContactDropdown(false);
      }
      if (hostDropdownRef.current && !hostDropdownRef.current.contains(event.target)) {
        setShowHostDropdown(false);
      }
      if (startTimeRef.current && !startTimeRef.current.contains(event.target)) {
        setShowStartTime(false);
      }
      if (endTimeRef.current && !endTimeRef.current.contains(event.target)) {
        setShowEndTime(false);
      }
      if (!event.target.closest('.calendar-container')) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Date selection handler
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

  // Time selection handlers
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

  // Time slot management
  const handleRemoveTimeSlot = (id) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  const generateTimeOptions = () => {
    const times = [];
    let hour = 12;
    let period = "AM";

    for (let i = 0; i < 24; i++) {
      times.push(`${hour}:00 ${period}`);
      times.push(`${hour}:30 ${period}`);
      hour = hour === 12 ? 1 : hour + 1;
      if (hour === 12) period = period === "AM" ? "PM" : "AM";
    }
    return times;
  };

  const validateTimeFormat = (time) => /^(1[0-2]|0?[1-9]):([0-5][0-9]) (AM|PM)$/i.test(time);

  const convertTo24HourFormat = (time) => {
    const [timePart, period] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  // Add validation for selected time slots
  const handleAddTimeSlot = () => {
    setTimeError('');
    setDateError('');

    if (!selectedDate) {
      setDateError('Please select a date');
      return;
    }

    if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
      setTimeError('Invalid time format. Use HH:MM AM/PM');
      return;
    }

    const startMinutes = convertTo24HourFormat(startTime);
    const endMinutes = convertTo24HourFormat(endTime);

    if (endMinutes < startMinutes) {
      setTimeError('End time must be later than start time');
      return;
    } else if (startMinutes === endMinutes) {
      setTimeError('Start time and end time cannot be the same');
      return;
    }

    // Check for duplicate time slots
    const newTimeSlot = {
      id: Date.now(),
      date: selectedDate,
      startTime,
      endTime
    };

    if (timeSlots.some(slot => 
      slot.date.toDateString() === newTimeSlot.date.toDateString() &&
      slot.startTime === newTimeSlot.startTime && 
      slot.endTime === newTimeSlot.endTime
    )) {
      setTimeError('This time slot already exists');
      return;
    }

    setTimeSlots([...timeSlots, newTimeSlot]);
    setStartTime("09:00 AM");
    setEndTime("10:00 AM");
  };

  // Participants and hosts management
  const handleRemoveHost = (uniqueKey) => {
    const updatedHosts = hosts.filter(host => host.uniqueKey !== uniqueKey);
    setHosts(updatedHosts);
    // Set error if all hosts are removed
    if (updatedHosts.length === 0) {
      setHostError('Please add at least one host');
    }
  };

  const filteredContacts = contacts.filter(contact => 
    (contact.username?.toLowerCase().includes(searchContact.toLowerCase()) ||
    (contact.name?.toLowerCase().includes(searchContact.toLowerCase())))
  );

  const filteredHosts = currentUserHosts.filter(host => 
    (host.username?.toLowerCase().includes(searchHost.toLowerCase()) ||
    (host.name?.toLowerCase().includes(searchHost.toLowerCase())))
  );

  const handleAddParticipant = (contact) => {
    if (!participants.some(p => p.id === contact.id)) {
      setParticipants([...participants, contact]);
      setShowContactDropdown(false);
      setSearchContact('');
      setParticipantError(''); // Clear error
    }
  };

  const handleAddHost = (host) => {
    // Add a unique key when adding a host
    const newHost = {
      ...host,
      uniqueKey: `host-${host.username}-${Date.now()}`
    };

    if (!hosts.some(h => h.username === host.username)) {
      setHosts([...hosts, newHost]);
      setShowHostDropdown(false);
      setSearchHost('');
    }
  };

  // Rendering helpers
  const renderDateDisplay = () => {
    if (dateError) return <div className="text-danger">{dateError}</div>;
    return selectedDate ? selectedDate.toLocaleDateString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric' 
    }) : "Select Date";
  };

  const formatTimeSlotDisplay = (slot) => {
    return `${slot.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} | ${slot.startTime} - ${slot.endTime}`;
  };

  // Create round robin meeting
  const handleCreateRoundRobin = async () => {
    if (!timeSlots.length || !hosts.length) {
      setError('Please add at least one time slot and host');
      return;
    }
  
    setIsLoading(true);
    setError('');
  
    try {  
      const formatTimeToUTC = (date, time) => {
        const [timeStr, period] = time.split(' ');
        let [hours, minutes] = timeStr.split(':').map(Number);
        
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
  
        const meetingDateTime = new Date(date);
        meetingDateTime.setHours(hours, minutes, 0, 0);
        return meetingDateTime.toISOString();
      };
  
      // Ensure host IDs are extracted correctly
      const hostIds = hosts.map(h => h.username).filter(username => username != null);
      
      // Ensure participant IDs are extracted correctly
      const participantIds = participants.map(p => p.id).filter(id => id != null);
  
      const payload = {
        title: title || 'Untitled Meeting',
        location: location || '',
        description: description || '',
        roundRobinTimeSlots: timeSlots.map(slot => ({
          startTime: formatTimeToUTC(slot.date, slot.startTime),
          endTime: formatTimeToUTC(slot.date, slot.endTime),
          hostIds: hostIds // Ensure host IDs are included for each time slot
        })),
        roundRobinDuration: duration || '60',
        hostIds: hostIds,
        participantIds: participantIds,
        repeat: repeat || 'none'
      };
  
      const response = await axios.post('http://localhost:8080/api/roundrobin/meetings', payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
  
      setCurrentStep(3);
    } catch (error) {
      console.error('Error creating round robin:', error);
      
      if (error.response) {
        setError(error.response.data?.message || 'Failed to create round robin. Please check your input.');
      } else if (error.request) {
        setError('No response received from server. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Calendar redirect handler
  const handleToCalendar = () => {
    console.log('Redirecting to calendar');
    // Add actual redirect logic here
  };

  // Update the handleNext function to include validations
  const handleNext = () => {
    if (currentStep === 1) {
      // Validate title
      if (!title.trim()) {
        setTitleError('Please enter a meeting title');
        const titleInput = document.querySelector('input[placeholder="Meeting title"]');
        titleInput?.scrollIntoView({ behavior: 'smooth' });
        titleInput?.focus();
        return;
      }

      // Validate time slots
      if (timeSlots.length === 0) {
        setTimeError('Please add at least one time slot for the meeting');
        const timeSlotSection = document.querySelector('.time-slot-section');
        timeSlotSection?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      // Clear errors and proceed
      setTitleError('');
      setTimeError('');
      setParticipantError('');
      setHostError('');
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 2) {
      // Validate hosts
      if (hosts.length === 0) {
        setHostError('Please add at least one host');
        const hostSection = document.querySelector('.host-section');
        hostSection?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      // Validate participants
      if (participants.length === 0) {
        setParticipantError('Please add at least one participant');
        const participantSection = document.querySelector('.participant-section');
        participantSection?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      // Clear errors and proceed
      setHostError('');
      setParticipantError('');
      handleCreateRoundRobin();
    }
  };

  return (
    <div className="h-100 font-inter d-flex flex-column">
      {currentStep !== 3 && (
        <h3 className="mb-4 fw-bold">
          Create Round Robin <br /> Meeting
        </h3>
      )}

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <form className="flex-grow-1">
        {currentStep === 1 && (
          <div className="animate-fade-in">
            <div className="mb-4 fs-6">
              <label className="form-label fw-medium">Title</label>
              <input
                type="text"
                className={`form-control form-control-lg ${titleError ? 'is-invalid' : ''}`}
                placeholder="Meeting title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (e.target.value.trim()) {
                    setTitleError('');
                  }
                }}
              />
              {titleError && (
                <div className="invalid-feedback">
                  {titleError}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium">Time slot</label>
              <div className="p-2 bg-light rounded position-relative">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="d-flex align-items-center bg-white py-2 px-3 rounded"
                    style={{ cursor: "pointer", minWidth: "190px" }}
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    <div className="text-center flex-grow-1">
                      {renderDateDisplay()}
                    </div>
                    <div className="ms-2">
                      <FaCalendarAlt />
                    </div>
                  </div>

                  {showCalendar && (
                    <div className="position-absolute shadow rounded calendar-container" style={{ top: "60px", left: "10px", zIndex: 10 }}>
                      <Calendar onDateSelect={handleDateSelect} value={selectedDate} />
                    </div>
                  )}

                  <div className="position-relative" ref={startTimeRef}>
                    <input
                      type="text"
                      className="form-control bg-white py-2 px-3 rounded"
                      style={{ minWidth: "100px", cursor: "pointer" }}
                      placeholder="HH:MM AM/PM"
                      value={startTime}
                      onChange={(e) => handleTimeChange(e.target.value, "start")}
                      onDoubleClick={() => handleDoubleClick("start")}
                    />
                    {showStartTime && (
                      <div className="position-absolute bg-white shadow p-3 rounded mt-1" style={{ top: "100%", left: "0", zIndex: 10, maxHeight: "200px", overflowY: "auto" }}>
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

                  <div className="position-relative" ref={endTimeRef}>
                    <input
                      type="text"
                      className="form-control bg-white py-2 px-3 rounded"
                      style={{ minWidth: "100px", cursor: "pointer" }}
                      placeholder="HH:MM AM/PM"
                      value={endTime}
                      onChange={(e) => handleTimeChange(e.target.value, "end")}
                      onDoubleClick={() => handleDoubleClick("end")}
                    />
                    {showEndTime && (
                      <div className="position-absolute bg-white shadow p-3 rounded mt-1" style={{ top: "100%", left: "0", zIndex: 10, maxHeight: "200px", overflowY: "auto" }}>
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

                  <button
                    type="button"
                    className="btn btn-primary d-flex align-items-center"
                    style={{ minWidth: "40px", height: "38px", flexShrink: 0 }}
                    onClick={handleAddTimeSlot}
                  >
                    <FaCheckCircle />
                  </button>
                </div>

                {timeError && <div className="text-danger mt-2 small">{timeError}</div>}

                {timeSlots.length > 0 && (
                  <div className="mt-3">
                    <h6 className="text-muted mb-2">Added Time Slots</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {timeSlots.map((slot) => (
                        <div key={slot.id} className="badge bg-white text-dark d-flex align-items-center gap-2 p-2">
                          {formatTimeSlotDisplay(slot)}
                          <button 
                            type="button" 
                            // Continuing the RoundRobinForm's return JSX from where it was cut off
                            className="btn btn-sm btn-outline-danger p-0 ms-2"
                            onClick={() => handleRemoveTimeSlot(slot.id)}
                            style={{ width: '20px', height: '20px' }}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium">Duration</label>
              <select 
                className="form-select"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium">Description</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Meeting description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium">Location</label>
              <select 
                className="form-select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">Choose location</option>
                <option value="Conference Room">Conference Room</option>
                <option value="Virtual Meeting">Virtual Meeting</option>
                <option value="Office">Office</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium">Repeat</label>
              <select 
                className="form-select"
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
                <option value="weekday">Every weekday</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="animate-fade-in">
            <div className="mb-4 host-section">
              <h4 className="form-label fw-medium mb-3">Add Hosts</h4>
              
              <div className="mb-3 position-relative" ref={hostDropdownRef}>
                <div className={`input-group ${hostError ? 'is-invalid' : ''}`}>
                  <input
                    type="text"
                    className={`form-control ${hostError ? 'is-invalid' : ''}`}
                    placeholder="Search hosts"
                    value={searchHost}
                    onChange={(e) => {
                      setSearchHost(e.target.value);
                      setShowHostDropdown(true);
                    }}
                    onFocus={() => setShowHostDropdown(true)}
                  />
                    <button
                      type="button"
                      className={`btn btn-outline-secondary ${hostError ? 'btn-outline-danger' : ''}`}
                      onClick={() => setShowHostDropdown(!showHostDropdown)}
                    >
                      <FaChevronDown />
                    </button>
                </div>
                {hostError && (
                  <div className="invalid-feedback d-block">
                    {hostError}
                  </div>
                )}
                {showHostDropdown && (
                  <div className="position-absolute w-100 bg-white shadow rounded mt-1" style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}>
                    {filteredHosts.length > 0 ? (
                      filteredHosts.map(host => (
                        <div 
                          key={host.username} 
                          className={`p-3 border-bottom hover-bg-light cursor-pointer d-flex align-items-center ${hosts.some(h => h.username === host.username) ? 'bg-light' : ''}`}
                          onClick={() => handleAddHost(host)}
                        >
                          <div className="flex-shrink-0 me-3">
                            <img 
                              src={host.profileImage || '/profile.png'} 
                              alt="host" 
                              className="rounded-circle"
                              style={{width: '40px', height: '40px', objectFit: 'cover'}}
                              onError={(e) => { e.target.onerror = null; e.target.src = '/profile.png'; }}
                            />
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-bold">{host.name || host.username}</div>
                            <small className="text-muted">{host.email || 'No email'}</small>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-muted">No hosts found</div>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-4">
                {hosts.length > 0 ? (
                  <div className="border rounded">
                    {hosts.map((host) => (
                      <div 
                        key={host.uniqueKey} 
                        className="d-flex align-items-center p-3 border-bottom last-child-border-bottom-0"
                      >
                        <div className="flex-shrink-0 me-3">
                          <img 
                            src={host.profileImage || '/profile.png'} 
                            alt="host" 
                            className="rounded-circle"
                            style={{width: '40px', height: '40px', objectFit: 'cover'}}
                            onError={(e) => { e.target.onerror = null; e.target.src = '/profile.png'; }}
                          />
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-bold">{host.name || host.username}</div>
                          <small className="text-muted">{host.email || 'No email'}</small>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleRemoveHost(host.uniqueKey)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted border rounded">No hosts added yet</div>
                )}
              </div>

  <div className="mb-4">
                <h4 className="form-label fw-medium mb-3">Add participants</h4>
                
                <div className="mb-3 position-relative" ref={contactDropdownRef}>
                  <div className={`input-group ${participantError && participants.length === 0 ? 'is-invalid' : ''}`}>
                    <input
                      type="text"
                      className={`form-control ${participantError && participants.length === 0 ? 'is-invalid' : ''}`}
                      placeholder="Search contacts"
                      value={searchContact}
                      onChange={(e) => {
                        setSearchContact(e.target.value);
                        setShowContactDropdown(true);
                        // Remove error as soon as a participant is added
                        if (participants.length > 0) setParticipantError('');
                      }}
                      onFocus={() => setShowContactDropdown(true)}
                    />
                    <button
                      type="button"
                      className={`btn btn-outline-secondary ${participantError && participants.length === 0 ? 'btn-outline-danger' : ''}`}
                      onClick={() => setShowContactDropdown(!showContactDropdown)}
                    >
                      <FaChevronDown />
                    </button>
                  </div>
                  
                  {/* Only show error if no participants */}
                  {participantError && participants.length === 0 && (
                    <div className="invalid-feedback d-block">
                      {participantError}
                    </div>
                  )}
  
                  {/* Move dropdown inside the container */}
                  {showContactDropdown && (
                    <div 
                      className="position-absolute bg-white shadow rounded mt-1 w-100"
                      style={{ 
                        zIndex: 1000, 
                        maxHeight: '200px', 
                        overflowY: 'auto'
                      }}
                    >
                      {filteredContacts.length > 0 ? (
                        filteredContacts.map(contact => (
                          <div
                            key={contact.id}
                            className="d-flex align-items-center p-2 hover-bg-light"
                            onClick={() => handleAddParticipant(contact)}
                            style={{ cursor: 'pointer' }}
                          >
                            <img 
                              src={contact.profileImage || '/profile.png'} 
                              alt={contact.username}
                              className="rounded-circle me-2"
                              style={{ width: '30px', height: '30px' }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/profile.png';
                              }}
                            />
                            <div>
                              <div className="fw-medium">{contact.name || contact.username}</div>
                              <small className="text-muted">{contact.email}</small>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-muted">
                          No contacts found
                        </div>
                      )}
                    </div>
                  )}
                </div>
  
                {participants.length > 0 ? (
                  participants.map((participant) => (
                    <div 
                      key={participant.id} 
                      className="d-flex align-items-center bg-light p-3 rounded mb-2"
                    >
                      <div className="me-auto d-flex align-items-center">
                        <img 
                          src={participant.profileImage || '/profile.png'} 
                          alt="participant" 
                          className="rounded-circle me-3"
                          style={{width: '40px', height: '40px'}}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/profile.png';
                          }}
                        />
                        <div>
                          <div className="fw-bold">{participant.name || participant.username}</div>
                          <small className="text-muted">{participant.role || participant.email || 'No details'}</small>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-outline-danger"
                        onClick={() => handleRemoveParticipant(participant.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted">
                    No participants added yet
                  </div>
                )}
              </div>
          </div>
          /</div>
        )}

        {currentStep === 3 && (
          <SuccessStep 
            onToCalendar={handleToCalendar}
            message="Round robin meeting created successfully!"
          />
        )}

        {currentStep !== 3 && (
          <FormStepNavigator 
            currentStep={currentStep} 
            totalSteps={3} 
            onNext={handleNext}
            onBack={() => setCurrentStep(c => c - 1)}
            isLoading={isLoading}
            nextDisabled={
              (currentStep === 1 && (!title.trim() || timeSlots.length === 0)) ||
              (currentStep === 2 && (hosts.length === 0 || participants.length === 0))
            }
            nextLabel={currentStep === 2 ? "Create Round Robin" : "Next"}
          />
        )}
      </form>
    </div>
  );
};
export default RoundRobinForm;

