'use client';
import React, { useState, useEffect, useRef } from 'react';
import { FaUsers, FaCalendarAlt, FaCheckCircle, FaSearch, FaChevronDown } from 'react-icons/fa';
import { RiMovie2Line } from 'react-icons/ri';
import Calendar from './calendar';
import 'react-datepicker/dist/react-datepicker.css';
import Link from 'next/link';
import axios from 'axios';

const FormStepNavigator = ({ 
  currentStep, 
  totalSteps, 
  onNext, 
  onBack, 
  isLoading = false, 
  nextDisabled = false,
  nextLabel = 'Next'
}) => {
  return (
    <div className="d-flex justify-content-between align-items-center mt-4">
      <div className="d-flex gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: currentStep === index + 1 ? '#2D31A6' : '#ddd',
            }}
          />
        ))}
      </div>
      <div className="d-flex gap-2">
        {currentStep > 1 && (
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onBack}
            disabled={isLoading}
          >
            Back
          </button>
        )}
        <button 
          type="button" 
          className="btn btn-primary btn-lg"
          onClick={onNext}
          disabled={isLoading || nextDisabled}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
};

const SuccessStep = ({ onToCalendar, message }) => {
  return (
    <div className="animate-fade-in font-inter d-flex flex-column align-items-start justify-content-center h-100">
      <div className='d-flex flex-row align-items-center justify-content-start gap-5'>
        <h2 className="mb-3 fs-1 fw-bold">Success</h2>
        <img
          src="/success.png"
          alt="Success"
          className="mb-4"
          style={{ width: '100px', height: 'auto' }}
        />
      </div>
      <p className="mb-4 text-muted font-inter fw-semibold fs-3">
        {message || "Your meeting is on your calendar now"}
      </p>
      <Link href={"/"}>
        <button
          type="button"
          className="btn btn-primary btn-lg px-4 mt-4"
          onClick={onToCalendar}
        >
          To my calendar
        </button>
      </Link>
    </div>
  );
};

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

    // Click outside handler for contact dropdown
    const handleClickOutside = (event) => {
      if (contactDropdownRef.current && 
          !contactDropdownRef.current.contains(event.target)) {
        setShowContactDropdown(false);
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

    if (endMinutes <= startMinutes) {
      setTimeError('End time must be later than start time');
      return;
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
    if (currentStep === 2) {
      handleCreateMeeting();
    } else if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
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
      setSearchContact(''); // Reset search
    }
  };

  const handleRemoveParticipant = (id) => {
    setParticipants(participants.filter(participant => participant.id !== id));
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
                className="form-control form-control-lg"
                placeholder="Meeting title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
        

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
          <div className="animate-fade-in">
            <div className="mb-4">
              <h4 className="form-label fw-medium mb-4">Add participants</h4>
              
              <div className="mb-3 position-relative" ref={contactDropdownRef}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
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
                    className="btn btn-outline-secondary"
                    onClick={() => setShowContactDropdown(!showContactDropdown)}
                  >
                    <FaChevronDown />
                  </button>
                </div>

                {showContactDropdown && filteredContacts.length > 0 && (
                  <div 
                    className="position-absolute w-100 bg-white shadow rounded mt-1"
                    style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}
                  >
                    {filteredContacts.map(contact => (
                      <div 
                        key={contact.id} 
                        className={`p-2 hover-bg-light cursor-pointer ${
                          participants.some(p => p.id === contact.id) ? 'bg-light' : ''
                        }`}
                        onClick={() => handleAddParticipant(contact)}
                      >
                        <div className="d-flex align-items-center">
                          <img 
                            src={contact.profileImage || '/profile.png'} 
                            alt="participant" 
                            className="rounded-circle me-3"
                            style={{width: '30px', height: '30px'}}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/profile.png';
                            }}
                          />
                          <div>
                            <div className="fw-bold">{contact.name || contact.username}</div>
                            <small className="text-muted">{contact.role || contact.email || 'No details'}</small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showContactDropdown && filteredContacts.length === 0 && (
                  <div 
                    className="position-absolute w-100 bg-white shadow rounded mt-1 p-2"
                    style={{ zIndex: 1000 }}
                  >
                    <div className="text-muted">No contacts found</div>
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
            nextDisabled={
              (currentStep === 1 && (!title.trim() || !timeSlot)) ||
              (currentStep === 2 && participants.length === 0)
            }
            nextLabel={currentStep === 2 ? "Create Meeting" : "Next"}
          />
        )}
      </form>
    </div>
  );
};

const GroupMeetingForm = () => {
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
  const [searchContact, setSearchContact] = useState('');
  const [contacts, setContacts] = useState([]);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [repeat, setRepeat] = useState('none');
  const [duration, setDuration] = useState('60');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

        const contactsData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.contacts || []);
        setContacts(contactsData);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setError('Failed to load contacts');
        setContacts([]);
      }
    };

    fetchContacts();

    // Click outside handler for all dropdowns
    const handleClickOutside = (event) => {
      if (contactDropdownRef.current && !contactDropdownRef.current.contains(event.target)) {
        setShowContactDropdown(false);
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCreateGroupMeeting = async () => {
    if (!timeSlots.length || participants.length === 0) {
      setError('Please add at least one time slot and participant');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a meeting title');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formatTimeToUTC = (date, time) => {
        const [timeStr, period] = time.split(' ');
        const [hours, minutes] = timeStr.split(':').map(Number);
        
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

      const formattedTimeSlots = timeSlots.map(slot => ({
        startTime: formatTimeToUTC(slot.date, slot.startTime),
        endTime: formatTimeToUTC(slot.date, slot.endTime)
      }));

      const meetingPayload = {
        title: title.trim(),
        location,
        description,
        groupTimeSlots: formattedTimeSlots,
        groupDuration: duration,
        participantIds: participants.map(p => p.id),
        repeat
      };

      await axios.post('http://localhost:8080/api/group/meetings', meetingPayload, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      setCurrentStep(3);
    } catch (error) {
      console.error('Error creating group meeting:', error);
      setError(error.response?.data?.message || 'Failed to create group meeting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 2) {
      handleCreateGroupMeeting();
    } else if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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

  const handleAddTimeSlot = () => {
    setTimeError('');
    setDateError('');

    if (!selectedDate) {
      setDateError('Please select a date');
      return;
    }

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
      date: selectedDate,
      startTime: startTime,
      endTime: endTime
    };

    const isDuplicate = timeSlots.some(
      slot => 
        slot.date.toDateString() === newTimeSlot.date.toDateString() &&
        slot.startTime === newTimeSlot.startTime && 
        slot.endTime === newTimeSlot.endTime
    );

    if (isDuplicate) {
      setTimeError('This time slot has already been added');
      return;
    }

    setTimeSlots([...timeSlots, newTimeSlot]);
    // Reset times for next slot
    setStartTime("09:00 AM");
    setEndTime("10:00 AM");
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

  const filteredContacts = contacts.filter(contact => 
    (contact.username && contact.username.toLowerCase().includes(searchContact.toLowerCase())) ||
    (contact.name && contact.name.toLowerCase().includes(searchContact.toLowerCase()))
  );

  const handleAddParticipant = (contact) => {
    if (!participants.some(p => p.id === contact.id)) {
      setParticipants([...participants, contact]);
      setShowContactDropdown(false);
      setSearchContact('');
    }
  };

  const handleRemoveParticipant = (id) => {
    setParticipants(participants.filter(participant => participant.id !== id));
  };

  const renderDateDisplay = () => {
    if (dateError) {
      return <div className="text-danger">{dateError}</div>;
    }
    return selectedDate ? selectedDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }) : "Select Date";
  };

  const formatTimeSlotDisplay = (slot) => {
    return `${slot.date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })} | ${slot.startTime} - ${slot.endTime}`;
  };

  const handleToCalendar = () => {
    console.log('Redirecting to calendar');
    // Implementation for actual redirection
  };

  return (
    <div className="h-100 font-inter d-flex flex-column">
      {currentStep !== 3 && (
        <h3 className="mb-4 fw-bold">
          Create Group <br /> Meeting
        </h3>
      )}

      {error && (
        <div className="alert alert-danger mb-3">
          {error}
        </div>
      )}

      <form className="flex-grow-1">
        {currentStep === 1 && (
          <div className="animate-fade-in">
            <div className="mb-4 fs-6">
              <label className="form-label fw-medium">Title</label>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Meeting title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
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
                    disabled={!selectedDate}
                  >
                    <FaCheckCircle />
                  </button>
                </div>

                {timeError && (
                  <div className="text-danger mt-2 small">
                    {timeError}
                  </div>
                )}

                {timeSlots.length > 0 && (
                  <div className="mt-3">
                    <h6 className="text-muted mb-2">Added Time Slots</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {timeSlots.map((slot) => (
                        <div 
                          key={slot.id} 
                          className="badge bg-white text-dark d-flex align-items-center gap-2 p-2"
                        >
                          {formatTimeSlotDisplay(slot)}
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger p-0 ms-2"
                            onClick={() => handleRemoveTimeSlot(slot.id)}
                            style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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

        {currentStep === 2 && (
          <div className="animate-fade-in">
            <div className="mb-4">
              <h4 className="form-label fw-medium mb-3">Add participants*</h4>
              
              <div className="mb-3 position-relative" ref={contactDropdownRef}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
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
                    className="btn btn-outline-secondary"
                    onClick={() => setShowContactDropdown(!showContactDropdown)}
                  >
                    <FaChevronDown />
                  </button>
                </div>

                {showContactDropdown && filteredContacts.length > 0 && (
                  <div 
                    className="position-absolute w-100 bg-white shadow rounded mt-1"
                    style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}
                  >
                    {filteredContacts.map(contact => (
                      <div 
                        key={contact.id} 
                        className={`p-2 hover-bg-light cursor-pointer ${
                          participants.some(p => p.id === contact.id) ? 'bg-light' : ''
                        }`}
                        onClick={() => handleAddParticipant(contact)}
                      >
                        <div className="d-flex align-items-center">
                          <img 
                            src={contact.profileImage || '/profile.png'} 
                            alt="participant" 
                            className="rounded-circle me-3"
                            style={{width: '30px', height: '30px'}}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/profile.png';
                            }}
                          />
                          <div>
                            <div className="fw-bold">{contact.name || contact.username}</div>
                            <small className="text-muted">{contact.role || contact.email || 'No details'}</small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showContactDropdown && filteredContacts.length === 0 && (
                  <div 
                    className="position-absolute w-100 bg-white shadow rounded mt-1 p-2"
                    style={{ zIndex: 1000 }}
                  >
                    <div className="text-muted">No contacts found</div>
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

        {currentStep === 3 && (
          <SuccessStep 
            onToCalendar={handleToCalendar}
            message="Your group meeting has been successfully created!"
          />
        )}

        {currentStep !== 3 && (
          <FormStepNavigator 
            currentStep={currentStep} 
            totalSteps={3} 
            onNext={handleNext}
            onBack={handleBack}
            isLoading={isLoading}
            nextDisabled={
              (currentStep === 1 && (!title.trim() || timeSlots.length === 0)) ||
              (currentStep === 2 && participants.length === 0)
            }
            nextLabel={currentStep === 2 ? "Create Meeting" : "Next"}
          />
        )}
      </form>
    </div>
  );
};


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

    if (endMinutes <= startMinutes) {
      setTimeError('End time must be later than start time');
      return;
    }

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
  const handleRemoveParticipant = (id) => {
    setParticipants(participants.filter(participant => participant.id !== id));
  };

  const handleRemoveHost = (uniqueKey) => {
    // Remove host using the unique key
    setHosts(hosts.filter(host => host.uniqueKey !== uniqueKey));
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
                className="form-control form-control-lg"
                placeholder="Meeting title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
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
                    disabled={!selectedDate}
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
            <div className="mb-4">
              <h4 className="form-label fw-medium mb-3">Add Hosts</h4>
              
              <div className="mb-3 position-relative" ref={hostDropdownRef}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search hosts"
                    value={searchHost}
                    onChange={(e) => {
                      setSearchHost(e.target.value);
                      setShowHostDropdown(true);
                    }}
                    onFocus={() => setShowHostDropdown(true)}
                  />
                </div>

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

              <h4 className="form-label fw-medium mb-3">Add Participants</h4>
              
              <div className="mb-3 position-relative" ref={contactDropdownRef}>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FaSearch />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search participants"
                    value={searchContact}
                    onChange={(e) => {
                      setSearchContact(e.target.value);
                      setShowContactDropdown(true);
                    }}
                    onFocus={() => setShowContactDropdown(true)}
                  />
                </div>

                {showContactDropdown && (
                  <div className="position-absolute w-100 bg-white shadow rounded mt-1" style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}>
                    {filteredContacts.length > 0 ? (
                      filteredContacts.map(contact => (
                        <div 
                          key={contact.id} 
                          className={`p-3 border-bottom hover-bg-light cursor-pointer d-flex align-items-center ${participants.some(p => p.id === contact.id) ? 'bg-light' : ''}`}
                          onClick={() => handleAddParticipant(contact)}
                        >
                          <div className="flex-shrink-0 me-3">
                            <img 
                              src={contact.profileImage || '/profile.png'} 
                              alt="participant" 
                              className="rounded-circle"
                              style={{width: '40px', height: '40px', objectFit: 'cover'}}
                              onError={(e) => { e.target.onerror = null; e.target.src = '/profile.png'; }}
                            />
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-bold">{contact.name || contact.username}</div>
                            <small className="text-muted">{contact.email || 'No email'}</small>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-muted">No participants found</div>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-4">
                {participants.length > 0 ? (
                  <div className="border rounded">
                    {participants.map((participant) => (
                      <div 
                        key={participant.id} 
                        className="d-flex align-items-center p-3 border-bottom last-child-border-bottom-0"
                      >
                        <div className="flex-shrink-0 me-3">
                          <img 
                            src={participant.profileImage || '/profile.png'} 
                            alt="participant" 
                            className="rounded-circle"
                            style={{width: '40px', height: '40px', objectFit: 'cover'}}
                            onError={(e) => { e.target.onerror = null; e.target.src = '/profile.png'; }}
                          />
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-bold">{participant.name || participant.username}</div>
                          <small className="text-muted">{participant.email || 'No email'}</small>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleRemoveParticipant(participant.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted border rounded">No participants added yet</div>
                )}
              </div>
            </div>
          </div>
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
            onNext={currentStep === 2 ? handleCreateRoundRobin : () => setCurrentStep(c => c + 1)}
            onBack={() => setCurrentStep(c => c - 1)}
            isLoading={isLoading}
            nextDisabled={
              (currentStep === 1 && (!title.trim() || timeSlots.length === 0)) ||
              (currentStep === 2 && hosts.length === 0)
            }
            nextLabel={currentStep === 2 ? "Create Round Robin" : "Next"}
          />
        )}
      </form>
    </div>
  );
};

// Complete CreateEvent component
const CreateEvent = () => {
  const [selectedType, setSelectedType] = useState('direct');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < 768);
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const meetingTypes = [
    {
      id: 'direct',
      title: 'Direct scheduling',
      description: "A single meeting between two individuals, ideal for one-on-one discussions, quick check-ins, or interviews.",
      icon: <FaCalendarAlt size={isMobile ? 20 : 24} />,
      color: '#6366F1'
    },
    {
      id: 'group',
      title: 'Group',
      description: 'A meeting involving multiple participants, suitable for team meetings, brainstorming sessions, or workshops.',
      icon: <FaUsers size={isMobile ? 20 : 24} />,
      color: '#2D31A6'
    },
    {
      id: 'round-robin',
      title: 'Round robin',
      description: 'Sequential one-on-one meetings where each participant takes turns, commonly used for interviews, support calls, or customer appointments.',
      icon: <RiMovie2Line size={isMobile ? 20 : 24} />,
      color: '#2D31A6'
    }
  ];

  const renderForm = () => {
    switch (selectedType) {
      case 'direct': return <DirectScheduleForm />;
      case 'group': return <GroupMeetingForm />;
      case 'round-robin': return <RoundRobinForm />;
      default: return <DirectScheduleForm />;
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="card my-3" style={{ 
        maxWidth: '1000px',
        height: isMobile ? 'auto' : '600px',
        borderRadius: '16px', 
        overflow: 'hidden', 
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }}>
        {isMobile ? (
          // Mobile Layout (Column)
          <div className="d-flex flex-column">
            {/* Mobile Options Bar */}
            <div className="w-100 d-flex justify-content-between px-2 py-3" style={{ 
              backgroundColor: '#2D31A6',
              background: 'linear-gradient(135deg, #2D31A6 0%, #6366F1 100%)'
            }}>
              {meetingTypes.map((type) => (
                <div 
                  key={type.id}
                  className="p-2 text-center"
                  onClick={() => setSelectedType(type.id)}
                  style={{ 
                    backgroundColor: type.id === selectedType ? 'rgba(255,255,255,0.1)' : 'transparent', 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    borderRadius: '8px',
                    flex: '1 1 auto',
                    margin: '0 3px'
                  }}
                >
                  <div className="d-flex flex-column align-items-center text-white">
                    <div className="icon-container mb-1">{type.icon}</div>
                    <h6 className="mb-0 text-white" style={{ fontSize: '0.8rem' }}>{type.title}</h6>
                  </div>
                </div>
              ))}
            </div>
            {/* Mobile Form */}
            <div style={{ padding: '20px', height: '500px', overflow: 'auto' }}>
              <div className="overflow-auto py-2">
                {renderForm()}
              </div>
            </div>
          </div>
        ) : (
          // Desktop Layout (Row)
          <div className="row g-0 h-100">
            {/* Left Sidebar */}
            <div className="col-lg-5 col-md-5 d-flex flex-column py-3" style={{ 
              backgroundColor: '#2D31A6',
              background: 'linear-gradient(135deg, #2D31A6 0%, #6366F1 100%)',
            }}>
              <div className="d-flex flex-column py-3 w-100">
                {meetingTypes.map((type) => (
                  <div 
                    key={type.id}
                    className="p-3 p-md-4 my-2"
                    onClick={() => setSelectedType(type.id)}
                    style={{ 
                      backgroundColor: type.id === selectedType ? 'rgba(255,255,255,0.1)' : 'transparent', 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      borderRadius: '8px'
                    }}
                  >
                    <div className='hover-effect ps-2 ps-md-3'>
                      <div className="d-flex align-items-center mb-2 text-white">
                        <div className="icon-container">{type.icon}</div>
                        <h5 className="ms-2 ms-md-3 mb-0 fs-6 fs-md-5">{type.title}</h5>
                      </div>
                      <p className="text-white small mb-0 opacity-75">
                        {type.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Form Area */}
            <div className="col-lg-7 col-md-7" style={{ 
              backgroundColor: 'transparent',
              height: '90%',
              overflowY: 'auto',
              padding: '50px',
            }}>
              {renderForm()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEvent;