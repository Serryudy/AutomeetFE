'use client';
import React, { useState, useEffect, useRef } from 'react';
import { FaCalendarAlt, FaCheckCircle, FaSearch, FaChevronDown } from 'react-icons/fa';
import Calendar from './calendar';
import 'react-datepicker/dist/react-datepicker.css';
import FormStepNavigator from './formstepnav';
import SuccessStep from './sucessstep';
import axios from 'axios';

const DirectScheduleForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("10:00 AM");
  const [timeSlot, setTimeSlot] = useState(null);
  const [timeError, setTimeError] = useState('');
  const [dateError, setDateError] = useState('');
  const [participants, setParticipants] = useState([]);
  const [searchContact, setSearchContact] = useState('');
  const [contacts, setContacts] = useState([]); 
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [repeat, setRepeat] = useState('none');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [titleError, setTitleError] = useState(''); // New state for title error
  const [participantError, setParticipantError] = useState(''); // New state for participant error

  // Refs for detecting clicks outside the dropdown
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);
  const contactDropdownRef = useRef(null);

  // Fetch contacts when component mounts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/community/contacts', {
          withCredentials: true
        });

        // Ensure response.data is an array
        const contactsData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.contacts || []); // Handle different response structures

        setContacts(contactsData);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setError('Failed to load contacts');
        setContacts([]); // Ensure contacts is always an array
      }
    };

    fetchContacts();

    // Updated click outside handler
    const handleClickOutside = (event) => {
      // For contact dropdown
      if (contactDropdownRef.current && !contactDropdownRef.current.contains(event.target)) {
        setShowContactDropdown(false);
      }

      // For start time dropdown
      if (startTimeRef.current && !startTimeRef.current.contains(event.target)) {
        setTimeout(() => {
          if (!startTimeRef.current?.contains(document.activeElement)) {
            setShowStartTime(false);
          }
        }, 0);
      }

      // For end time dropdown
      if (endTimeRef.current && !endTimeRef.current.contains(event.target)) {
        setTimeout(() => {
          if (!endTimeRef.current?.contains(document.activeElement)) {
            setShowEndTime(false);
          }
        }, 0);
      }

      // For calendar
      if (!event.target.closest('.calendar-container')) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle creating a meeting
  const handleCreateMeeting = async () => {
    // Validate required fields
    if (!selectedDate || !startTime || !endTime || participants.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Convert local time to UTC ISO string
      const formatTimeToUTC = (date, time) => {
        const [timeStr, period] = time.split(' ');
        const [hours, minutes] = timeStr.split(':').map(Number);
        
        // Adjust hours for 12-hour format
        let adjustedHours = hours;
        if (period === 'PM' && hours !== 12) {
          adjustedHours += 12;
        }
        if (period === 'AM' && hours === 12) {
          adjustedHours = 0;
        }

        const meetingDateTime = new Date(date);
        meetingDateTime.setHours(adjustedHours, minutes, 0, 0);

        return meetingDateTime.toISOString();
      };

      const meetingPayload = {
        title,
        location,
        description,
        directTimeSlot: {
          startTime: formatTimeToUTC(selectedDate, startTime),
          endTime: formatTimeToUTC(selectedDate, endTime)
        },
        participantIds: participants.map(p => p.id),
        repeat
      };
      console.log(meetingPayload);
      const response = await axios.post('http://localhost:8080/api/direct/meetings', meetingPayload, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      // Move to success step
      setCurrentStep(3);
    } catch (error) {
      console.error('Error creating meeting:', error);
      setError('Failed to create meeting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Time-related utility functions
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

  const handleAddTimeSlot = () => {
    setTimeError('');
    setDateError('');

    if (!selectedDate) {
      setDateError('Please select a date');
      return;
    }

    const validateTimeFormat = (time) => {
      const timeRegex = /^(1[0-2]|0?[1-9]):([0-5][0-9]) (AM|PM)$/i;
      return timeRegex.test(time);
    };

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

    if (endMinutes < startMinutes) {
      setTimeError('End time must be later than start time');
      return;
    }else if (startMinutes === endMinutes) {
      setTimeError('Start time and end time cannot be the same');
      return

    }

    const newTimeSlot = {
      date: selectedDate,
      startTime: startTime,
      endTime: endTime
    };

    setTimeSlot(newTimeSlot);
  };

  // Handlers for time selection and navigation
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

      // Validate time slot
      if (!timeSlot) {
        setTimeError('Please select a time slot for the meeting');
        const timeSlotSection = document.querySelector('.time-slot-section');
        timeSlotSection?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      // Clear errors and proceed
      setTitleError('');
      setTimeError('');
      setParticipantError(''); // Clear participant error when moving to step 2
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 2) {
      // Validate participants
      if (participants.length === 0) {
        setParticipantError('Please add at least one participant');
        const participantSection = document.querySelector('.participant-section');
        participantSection?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      setParticipantError('');
      handleCreateMeeting();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // Clear error messages when going back
      setParticipantError('');
      setTitleError('');
      setTimeError('');
      setCurrentStep(currentStep - 1);
    }
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

  const handleAddParticipant = (contact) => {
    if (!participants.some(p => p.id === contact.id)) {
      setParticipants([...participants, contact]);
      setShowContactDropdown(false);
      setSearchContact('');
      // Clear participant error when a participant is added
      setParticipantError('');
    }
  };

  const handleRemoveParticipant = (id) => {
    const updatedParticipants = participants.filter(participant => participant.id !== id);
    setParticipants(updatedParticipants);
    // Set error if all participants are removed
    if (updatedParticipants.length === 0) {
      setParticipantError('Please add at least one participant');
    }
  };

  // Filtered contacts for search functionality
  const filteredContacts = contacts.filter(contact => 
    contact.username.toLowerCase().includes(searchContact.toLowerCase()) ||
    (contact.name && contact.name.toLowerCase().includes(searchContact.toLowerCase()))
  );

  // Render date and time slot display
  const renderDateDisplay = () => {
    if (dateError) {
      return <div className="text-danger">{dateError}</div>;
    }
    return selectedDate ? selectedDate.toLocaleDateString() : "Select Date";
  };

  const formatTimeSlotDisplay = () => {
    if (!timeSlot) return null;
    return `${timeSlot.date.toLocaleDateString()} | ${timeSlot.startTime} - ${timeSlot.endTime}`;
  };

  return (
    <div className="h-100 font-inter d-flex flex-column">
      {currentStep !== 3 && (
        <h3 className="mb-4 fw-bold">
          Direct Schedule <br /> A Meeting
        </h3>
      )}
      

      {error && (
        <div className="alert alert-danger mb-3">
          {error}
        </div>
      )}
  

      <form className="flex-grow-1">
        {/* Step 1: Meeting Details */}
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
            
            

            {/* Time Slot Selection */}
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
                    <div
                      className="position-absolute shadow rounded calendar-container"
                      style={{ top: "60px", left: "10px", zIndex: 10 }}
                    >
                      <Calendar 
                        onDateSelect={handleDateSelect} 
                        value={selectedDate} 
                      />
                    </div>
                  )}

                  {/* Start Time Selection */}
                  <div className="position-relative" ref={startTimeRef}>
                    <input
                      type="text"
                      className="form-control bg-white py-2 px-3 rounded"
                      style={{ minWidth: "100px", cursor: "pointer" }}
                      placeholder="HH:MM AM/PM"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      onFocus={() => setShowStartTime(true)}
                      onDoubleClick={() => setShowStartTime(true)}
                    />
                    {showStartTime && (
                      <div
                        className="position-absolute bg-white shadow p-3 rounded mt-1"
                        style={{ top: "100%", left: "0", zIndex: 10, maxHeight: "200px", overflowY: "auto" }}
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

                  {/* End Time Selection */}
                  <div className="position-relative" ref={endTimeRef}>
                    <input
                      type="text"
                      className="form-control bg-white py-2 px-3 rounded"
                      style={{ minWidth: "100px", cursor: "pointer" }}
                      placeholder="HH:MM AM/PM"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      onFocus={() => setShowEndTime(true)}
                      onDoubleClick={() => setShowEndTime(true)}
                    />
                    {showEndTime && (
                      <div
                        className="position-absolute bg-white shadow p-3 rounded mt-1"
                        style={{ top: "100%", left: "0", zIndex: 10, maxHeight: "200px", overflowY: "auto" }}
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

                  <button
                    type="button"
                    className="btn btn-primary d-flex align-items-center"
                    style={{
                      minWidth: "40px",
                      height: "38px",
                      flexShrink: 0,
                    }}
                    onClick={handleAddTimeSlot}
                  >
                    <FaCheckCircle />
                  </button>
                </div>

                {timeError && (
                  <div className="text-danger mt-2 small">
                    {timeError}
                  </div>
                )}

                {timeSlot && (
                  <div className="mt-3">
                    <h6 className="text-muted mb-2">Selected Time Slot</h6>
                    <div className="badge bg-white text-dark d-flex align-items-center gap-2 p-2">
                      {formatTimeSlotDisplay()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description and Other Details */}
            <div className="mb-4">
              <label className="form-label fw-medium">Description</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="A short description for the meeting"
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
                <option value="">Choose a place for the meeting</option>
                <option value="Conference Room">Conference Room</option>
                <option value="Virtual Meeting">Virtual Meeting</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
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
                <option value="weekday">Every weekday (Mon-Fri)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Add Participants */}
        {currentStep === 2 && (
          <div className="animate-fade-in participant-section">
            <div className="mb-4">
              <h4 className="form-label fw-medium mb-4">Add participants</h4>
              
              <div className="mb-3 position-relative" ref={contactDropdownRef}>
                <div className={`input-group ${participantError ? 'is-invalid' : ''}`}>
                  <input
                    type="text"
                    className={`form-control ${participantError ? 'is-invalid' : ''}`}
                    placeholder="Search contacts"
                    value={searchContact}
                    onChange={(e) => {
                      setSearchContact(e.target.value);
                      setShowContactDropdown(true);
                    }}
                    onFocus={() => setShowContactDropdown(true)}
                  />
                  <button
                    type="button"
                    className={`btn btn-outline-secondary ${participantError ? 'btn-outline-danger' : ''}`}
                    onClick={() => setShowContactDropdown(!showContactDropdown)}
                  >
                    <FaChevronDown />
                  </button>
                </div>
                
                {/* Add this error message display */}
                {participantError && (
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
        )}

        {/* Success Step */}
        {currentStep === 3 && (
          <SuccessStep onToCalendar={() => console.log('Redirecting to calendar')} />
        )}

        {/* Step Navigator */}
        {currentStep !== 3 && (
          <FormStepNavigator 
            currentStep={currentStep} 
            totalSteps={3} 
            onNext={handleNext}
            onBack={handleBack}
            isLoading={isLoading}
            nextLabel={currentStep === 2 ? "Create Meeting" : "Next"}
          />
        )}
      </form>
    </div>
  );
};

export default DirectScheduleForm;