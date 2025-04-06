'use client';
import React, { useState, useEffect, useRef } from 'react';
import { FaUsers, FaCalendarAlt, FaCheckCircle, FaSearch, FaChevronDown } from 'react-icons/fa';
import { RiMovie2Line } from 'react-icons/ri';
import Calendar from './calendar';
import 'react-datepicker/dist/react-datepicker.css';
import Link from 'next/link';

const FormStepNavigator = ({ currentStep, totalSteps, onNext }) => {
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
      <button 
        type="button" 
        className="btn btn-primary btn-lg"
        style={{ marginLeft: 'auto' }}
        onClick={onNext}
      >
        {currentStep === totalSteps ? 'Create Event' : 'Next'}
      </button>
    </div>
  );
};

const SuccessStep = ({ onToCalendar }) => {
  return (
    <div className="animate-fade-in  font-inter d-flex flex-column align-items-start justify-content-center h-100">
      <div className='d-flex flex-row align-items-center justify-content-start gap-5'>
        <h2 className="mb-3 fs-1  fw-bold">Success</h2>
        <img
          src="/success.png"
          alt="Success"
          className="mb-4"
          style={{ width: '100px', height: 'auto' }}
        />
      </div>
      <p className="mb-4 text-muted font-inter fw-semibold fs-3">
        Your meeting is on your<br />calendar now
      </p>
      <Link href={"/"	}>
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("10:00 AM");
  const [timeSlots, setTimeSlots] = useState([]);
  const [timeError, setTimeError] = useState('');
  const [participants, setParticipants] = useState([
    { id: 1, name: 'John_doe', group: 'Group name if any' }
  ]);
  const [searchContact, setSearchContact] = useState('');

  // Refs for detecting clicks outside the dropdown
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

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

  const handleRemoveParticipant = (id) => {
    setParticipants(participants.filter(participant => participant.id !== id));
  };

  const handleToCalendar = () => {
    console.log('Redirecting to calendar');
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
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="h-100 font-inter d-flex flex-column">
      {currentStep !== 3 && (
        <h3 className="mb-4 fw-bold">
          Direct Schedule <br /> A Meeting
        </h3>
      )}

      <form className="flex-grow-1">
        {currentStep === 1 && (
          <div className="animate-fade-in">
            <div className="mb-4 fs-6">
              <label className="form-label fw-medium">Title</label>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="John Doe"
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
                      {selectedDate ? selectedDate.toDateString() : "Select Date"}
                    </div>
                    <div className="ms-2">
                      <FaCalendarAlt />
                    </div>
                  </div>

                  {showCalendar && (
                    <div
                      className="position-absolute shadow rounded"
                      style={{ top: "60px", left: "10px", zIndex: 10 }}
                    >
                      <Calendar onChange={handleDateSelect} value={selectedDate} />
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
                        style={{ top: "100%", left: "0", zIndex: 10, maxHeight: "150px", overflowY: "auto" }}
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
                        style={{ top: "100%", left: "0", zIndex: 10, maxHeight: "150px", overflowY: "auto" }}
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

                {timeSlots.length > 0 && (
                  <div className="mt-3">
                    <h6 className="text-muted mb-2">Added Time Slots</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {timeSlots.map((slot) => (
                        <div 
                          key={slot.id} 
                          className="badge bg-white text-dark d-flex align-items-center gap-2 p-2"
                        >
                          {slot.start} - {slot.end}
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
              <label className="form-label fw-medium">Description</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="A short description for the meeting"
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium">Location</label>
              <select className="form-select">
                <option>Choose a place for the meeting</option>
                <option>Conference Room</option>
                <option>Virtual Meeting</option>
                <option>Office</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium">Repeat</label>
              <select className="form-select">
                <option>Does not repeat</option>
                <option>Daily</option>
                <option>Weekly on the Day</option>
                <option>Monthly on which Day</option>
                <option>Annually on exact Day</option>
                <option>Every weekday</option>
                <option>Custom</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="animate-fade-in">
            <div className="mb-4">
              <h4 className="form-label fw-medium mb-3">Add participants</h4>
              
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

              {participants.map((participant) => (
                <div 
                  key={participant.id} 
                  className="d-flex align-items-center bg-light p-3 rounded mb-2"
                >
                  <div className="me-auto d-flex align-items-center">
                    <img 
                      src="/profile.png" 
                      alt="participant" 
                      className="rounded-circle me-3"
                      style={{width: '40px', height: '40px'}}
                    />
                    <div>
                      <div className="fw-bold">{participant.name}</div>
                      <small className="text-muted">{participant.group}</small>
                    </div>
                  </div>
                  <div className="form-check form-switch me-3">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="accessSwitch"
                    />
                    <label className="form-check-label" htmlFor="accessSwitch">
                      Give access
                    </label>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-outline-danger"
                    onClick={() => handleRemoveParticipant(participant.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <SuccessStep onToCalendar={handleToCalendar} />
        )}

        {currentStep !== 3 && (
          <FormStepNavigator 
            currentStep={currentStep} 
            totalSteps={3} 
            onNext={handleNext} 
          />
        )}
      </form>
    </div>
  );
};


const GroupMeetingForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("10:00 AM");
  const [timeSlots, setTimeSlots] = useState([]);
  const [timeError, setTimeError] = useState('');
  const [participants, setParticipants] = useState([
    { id: 1, name: 'John_doe', group: 'Group name if any' }
  ]);
  const [searchContact, setSearchContact] = useState('');

  // Refs for detecting clicks outside the dropdown
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

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

  const handleRemoveParticipant = (id) => {
    setParticipants(participants.filter(participant => participant.id !== id));
  };

  const handleToCalendar = () => {
    console.log('Redirecting to calendar');
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
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="h-100 font-inter d-flex flex-column">
      {currentStep !== 3 && (
        <h3 className="mb-4 fw-bold">
          Create Group <br /> Meeting
        </h3>
      )}

      <form className="flex-grow-1">
        {currentStep === 1 && (
          <div className="animate-fade-in">
            <div className="mb-4 fs-6">
              <label className="form-label fw-medium">Title</label>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="John Doe"
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
                      {selectedDate ? selectedDate.toDateString() : "Select Date"}
                    </div>
                    <div className="ms-2">
                      <FaCalendarAlt />
                    </div>
                  </div>

                  {showCalendar && (
                    <div
                      className="position-absolute shadow rounded"
                      style={{ top: "60px", left: "10px", zIndex: 10 }}
                    >
                      <Calendar onChange={handleDateSelect} value={selectedDate} />
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
                        style={{ top: "100%", left: "0", zIndex: 10, maxHeight: "150px", overflowY: "auto" }}
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
                        style={{ top: "100%", left: "0", zIndex: 10, maxHeight: "150px", overflowY: "auto" }}
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

                {timeSlots.length > 0 && (
                  <div className="mt-3">
                    <h6 className="text-muted mb-2">Added Time Slots</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {timeSlots.map((slot) => (
                        <div 
                          key={slot.id} 
                          className="badge bg-white text-dark d-flex align-items-center gap-2 p-2"
                        >
                          {slot.start} - {slot.end}
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
              <label className="form-label fw-medium">Description</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="A short description for the meeting"
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium">Location</label>
              <select className="form-select">
                <option>Choose a place for the meeting</option>
                <option>Conference Room</option>
                <option>Virtual Meeting</option>
                <option>Office</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium">Repeat</label>
              <select className="form-select">
                <option>Does not repeat</option>
                <option>Daily</option>
                <option>Weekly on the Day</option>
                <option>Monthly on which Day</option>
                <option>Annually on exact Day</option>
                <option>Every weekday</option>
                <option>Custom</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="animate-fade-in">
            <div className="mb-4">
              <h4 className="form-label fw-medium mb-3">Add participants</h4>
              
              {/* Search Contact Dropdown */}
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

              {/* Participants List */}
              {participants.map((participant) => (
                <div 
                  key={participant.id} 
                  className="d-flex align-items-center bg-light p-3 rounded mb-2"
                >
                  <div className="me-auto d-flex align-items-center">
                    <img 
                      src="/profile.png" 
                      alt="participant" 
                      className="rounded-circle me-3"
                      style={{width: '40px', height: '40px'}}
                    />
                    <div>
                      <div className="fw-bold">{participant.name}</div>
                      <small className="text-muted">{participant.group}</small>
                    </div>
                  </div>
                  <div className="form-check form-switch me-3">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="accessSwitch"
                    />
                    <label className="form-check-label" htmlFor="accessSwitch">
                      Give access
                    </label>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-outline-danger"
                    onClick={() => handleRemoveParticipant(participant.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <SuccessStep onToCalendar={handleToCalendar} />
        )}

        {/* Navigation */}
        {currentStep !== 3 && (
          <FormStepNavigator 
            currentStep={currentStep}
            totalSteps={3}
            onNext={handleNext}
          />
        )}
      </form>
    </div>
  );
};

const RoundRobinForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("10:00 AM");
  const [timeSlots, setTimeSlots] = useState([]);
  const [timeError, setTimeError] = useState('');
  const [participants, setParticipants] = useState([
    { id: 1, name: 'John_doe', group: 'Group name if any' }
  ]);
  const [searchContact, setSearchContact] = useState('');
  const [hosts, setHosts] = useState([
    { id: 1, name: 'organizer_user', group: 'Organizers' }
  ]);
  const [searchHost, setSearchHost] = useState('');

  // Refs for detecting clicks outside the dropdown
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

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

  const handleRemoveParticipant = (id) => {
    setParticipants(participants.filter(participant => participant.id !== id));
  };

  const handleToCalendar = () => {
    console.log('Redirecting to calendar');
  };

  const handleRemoveHost = (id) => {
    setHosts(hosts.filter(host => host.id !== id));
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
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="h-100 font-inter d-flex flex-column">
      {currentStep !== 3 && (
        <h3 className="mb-4 fw-bold">
          Create Round Robin <br /> Meeting
        </h3>
      )}

      <form className="flex-grow-1">
        {currentStep === 1 && (
          <div className="animate-fade-in">
            <div className="mb-4 fs-6">
              <label className="form-label fw-medium">Title</label>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="John Doe"
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
                      {selectedDate ? selectedDate.toDateString() : "Select Date"}
                    </div>
                    <div className="ms-2">
                      <FaCalendarAlt />
                    </div>
                  </div>

                  {showCalendar && (
                    <div
                      className="position-absolute shadow rounded"
                      style={{ top: "60px", left: "10px", zIndex: 10 }}
                    >
                      <Calendar onChange={handleDateSelect} value={selectedDate} />
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
                        style={{ top: "100%", left: "0", zIndex: 10, maxHeight: "150px", overflowY: "auto" }}
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
                        style={{ top: "100%", left: "0", zIndex: 10, maxHeight: "150px", overflowY: "auto" }}
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

                {timeSlots.length > 0 && (
                  <div className="mt-3">
                    <h6 className="text-muted mb-2">Added Time Slots</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {timeSlots.map((slot) => (
                        <div 
                          key={slot.id} 
                          className="badge bg-white text-dark d-flex align-items-center gap-2 p-2"
                        >
                          {slot.start} - {slot.end}
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
              <label className="form-label fw-medium">Description</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="A short description for the meeting"
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium">Location</label>
              <select className="form-select">
                <option>Choose a place for the meeting</option>
                <option>Conference Room</option>
                <option>Virtual Meeting</option>
                <option>Office</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium">Repeat</label>
              <select className="form-select">
                <option>Does not repeat</option>
                <option>Daily</option>
                <option>Weekly on the Day</option>
                <option>Monthly on which Day</option>
                <option>Annually on exact Day</option>
                <option>Every weekday</option>
                <option>Custom</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="animate-fade-in">
            <div className="mb-4">
              <span className="form-label fw-medium mb-3 fs-5 text-muted">Add participants</span>
              {/* Search Contact Dropdown */}
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
              {/* Participants List */}
              {participants.map((participant) => (
                <div 
                  key={participant.id} 
                  className="d-flex align-items-center bg-light p-3 rounded mb-2"
                >
                  <div className="me-auto d-flex align-items-center">
                    <img 
                      src="/profile.png" 
                      alt="participant" 
                      className="rounded-circle me-3"
                      style={{width: '40px', height: '40px'}}
                    />
                    <div>
                      <div className="fw-bold">{participant.name}</div>
                      <small className="text-muted">{participant.group}</small>
                    </div>
                  </div>
                  <div className="form-check form-switch me-3">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="accessSwitch"
                    />
                    <label className="form-check-label" htmlFor="accessSwitch">
                      Give access
                    </label>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-outline-danger"
                    onClick={() => handleRemoveParticipant(participant.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <span className="form-label fw-medium mb-3 fs-5 text-muted">Add hosts</span>
              <div className="mb-3 position-relative">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <FaSearch />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by contact"
                    value={searchHost}
                    onChange={(e) => setSearchHost(e.target.value)}
                  />
                  <span className="input-group-text bg-white">
                    <FaChevronDown />
                  </span>
                </div>
              </div>
              {hosts.map((host) => (
                <div 
                  key={host.id} 
                  className="d-flex align-items-center bg-light p-3 rounded mb-2"
                >
                  <div className="me-auto d-flex align-items-center">
                    <img 
                      src="/profile.png" 
                      alt="host" 
                      className="rounded-circle me-3"
                      style={{width: '40px', height: '40px'}}
                    />
                    <div>
                      <div className="fw-bold">{host.name}</div>
                      <small className="text-muted">{host.group}</small>
                    </div>
                  </div>
                  <div className="form-check form-switch me-3">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="hostAccessSwitch"
                      defaultChecked
                    />
                    <label className="form-check-label" htmlFor="hostAccessSwitch">
                      Give access
                    </label>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-outline-danger"
                    onClick={() => handleRemoveHost(host.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <SuccessStep onToCalendar={handleToCalendar} />
        )}

        {/* Navigation */}
        {currentStep !== 3 && (
          <FormStepNavigator 
            currentStep={currentStep}
            totalSteps={3}
            onNext={handleNext}
          />
        )}
      </form>
    </div>
  );
};

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