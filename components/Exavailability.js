import React, { useEffect, useRef, useState } from 'react';

const useDebounce = (callback, delay, isSaved) => {
  const timeoutRef = useRef(null);
  
  return (...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};

const Availability = ({ meetingId, userId, isSaved }) => {
  // Validate required props
  if (!meetingId) {
    return (
      <div className="alert alert-warning" role="alert">
        Meeting ID is required to display availability.
      </div>
    );
  }
  
  if (!userId) {
    return (
      <div className="alert alert-warning" role="alert">
        User ID is required to submit availability.
      </div>
    );
  }

  const [isMobile, setIsMobile] = useState(false);
  const [visibleDays, setVisibleDays] = useState(7);
  const [startDayIndex, setStartDayIndex] = useState(0);
  const [timeZone, setTimeZone] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [nextSlotId, setNextSlotId] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meetingDuration, setMeetingDuration] = useState(70);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [draggedSlot, setDraggedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDay = now.getDay();
  
  // Constant for the duration of a selected time slot in minutes
  const SELECTED_SLOT_DURATION = 70; // 1 hour and 10 minutes

    useEffect(() => {
        if (isSaved) {
            submitAvailabilityImmediate();
        }
        // eslint-disable-next-line
    }, [isSaved]);

  // External users cannot confirm time slots - removed confirmTimeSlot function
  

  
  
  useEffect(() => {
    const fetchMeetingDetails = async () => {
      if (!meetingId) {
        setError('Meeting ID is required');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // GET /api/meetings/externally/{meetingId}
        const response = await fetch(`http://localhost:8080/api/meetings/externally/${meetingId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          let errorMessage = 'Failed to load meeting details. ';
          if (response.status === 404) {
            errorMessage += 'Meeting not found. Please verify the meeting ID.';
          } else if (response.status === 403) {
            errorMessage += 'You do not have permission to view this meeting.';
          } else if (response.status >= 500) {
            errorMessage += 'Server error. Please try again later.';
          } else {
            errorMessage += `Error ${response.status}. Please try again.`;
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        
        // Validate meeting data
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid meeting data received from server');
        }
        
        // Parse duration with better validation
        let durationMinutes = 60; // default
        if (data.duration) {
          const match = data.duration.match(/(\d+)\s*(hour|minute)s?/i);
          if (match) {
            const value = parseInt(match[1], 10);
            if (isNaN(value) || value <= 0) {
              console.warn('Invalid duration value, using default');
            } else if (/hour/i.test(match[2])) {
              durationMinutes = value * 60;
            } else if (/minute/i.test(match[2])) {
              durationMinutes = value;
            }
          }
        }
        
        setMeetingDuration(durationMinutes);
        
        // Fetch user's own availability
        await fetchUserAvailability();
        setIsLoading(false);
        
      } catch (err) {
        console.error('Error fetching meeting details:', err);
        setError(err.message || 'Failed to load meeting details. Please try again later.');
        setIsLoading(false);
      }
    };

    // Fetch user's own availability
    const fetchUserAvailability = async () => {
      try {
        // GET /api/participant/availability/externally/{userId}/{meetingId}
        const response = await fetch(`http://localhost:8080/api/participant/availability/externally/${userId}/${meetingId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            // No availability yet, that's fine for external users
            return;
          }
          throw new Error(`Failed to fetch user availability: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.timeSlots && Array.isArray(data.timeSlots)) {
          const formattedSlots = data.timeSlots.map((slot, index) => {
            const startDate = new Date(slot.startTime);
            const endDate = new Date(slot.endTime);
            return {
              id: index + 1,
              day: startDate.getDay(),
              dayIndex: startDate.getDay(),
              startTime: formatTimeDisplay(startDate.getHours(), startDate.getMinutes()),
              endTime: formatTimeDisplay(endDate.getHours(), endDate.getMinutes()),
              hour: startDate.getHours(),
              minute: startDate.getMinutes(),
              verticalPosition: (startDate.getHours() + startDate.getMinutes() / 60) * 60,
              endPosition: (endDate.getHours() + endDate.getMinutes() / 60) * 60,
              admin: 1,
              adminName: data.username || 'You'
            };
          });
          setSelectedSlots(formattedSlots);
          setNextSlotId(formattedSlots.length + 1);
        }
      } catch (err) {
        console.error('Error fetching user availability:', err);
        // Don't show error for external users who haven't submitted availability yet
      }
    };

    fetchMeetingDetails();
  }, [meetingId, userId]);
  
 
 
  
  // Submit availability to the server
  const submitAvailabilityImmediate = async () => {
    if (!meetingId || !userId || selectedSlots.length === 0 || submitting) return;
    
    try {
      setSubmitting(true);
      
      // Convert selected slots to the format expected by the API
      const timeSlots = selectedSlots.map(slot => {
        // Convert from display format to ISO format
        const startDate = convertTimeToISO(slot.day, slot.hour, slot.minute);
        
        // Calculate end time based on meeting duration
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + meetingDuration);
        
        return {
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString()
        };
      });
      
      // Create the payload with all required fields
      const payload = {
        userId: userId,
        meetingId: meetingId,
        timeSlots: timeSlots
      };
      
      console.log('Submitting availability with payload:', payload);
      
      // POST /api/availability/externally (try POST first for new submissions)
      let response = await fetch('http://localhost:8080/api/availability/externally', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // PUT /api/availability/externally (if POST fails with 409 Conflict, try PUT for updates)
      if (response.status === 409) {
        console.log('Availability exists, attempting update...');
        response = await fetch('http://localhost:8080/api/availability/externally', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        let errorMessage = "Failed to save your availability. ";
        
        if (response.status === 400) {
          errorMessage += "Please check your input and try again.";
        } else if (response.status === 404) {
          errorMessage += "Meeting not found. Please verify the meeting ID.";
        } else if (response.status === 500) {
          errorMessage += "Server error. Please try again later.";
        } else {
          errorMessage += `Error ${response.status}. Please try again.`;
        }
        
        throw new Error(errorMessage);
      }
      
      // Show success message
      setSuccessMessage("Your availability has been saved successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (err) {
      console.error('Error submitting availability:', err);
      
      let errorMessage = "Failed to save your availability. ";
      if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
        errorMessage += "Please check your internet connection and try again.";
      } else if (err.message.startsWith('Failed to save')) {
        errorMessage = err.message; // Use the specific error message
      } else {
        errorMessage += "Please try again.";
      }
      
      setErrorMessage(errorMessage);
      setShowError(true);
      setTimeout(() => setShowError(false), 5000); // Show error longer for better visibility
    } finally {
      setSubmitting(false);
    }
  };

  // Debounced submit function
  const submitAvailability = useDebounce(submitAvailabilityImmediate, 500);
  
  // Helper function to convert time to ISO format
  const convertTimeToISO = (dayOfWeek, hour, minute) => {
    const now = new Date();
    const currentDay = now.getDay();
    
    // Calculate how many days to add/subtract to get to the specified day
    let daysToAdd = dayOfWeek - currentDay;
    if (daysToAdd < 0) daysToAdd += 7; // Ensure we're looking at the next occurrence
    
    // Create a new date for the target day
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + daysToAdd);
    
    // Set the hour and minute
    targetDate.setHours(hour, minute, 0, 0);
    
    return targetDate;
  };

  const getRoleBanner = () => {
    return (
      <div className="alert alert-info mb-3" role="alert">
        <div className="d-flex align-items-center">
          <svg width="20" height="20" fill="currentColor" className="bi bi-info-circle-fill me-2" viewBox="0 0 16 16">
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
          </svg>
          <div>
            <strong>External Participant:</strong> Click and drag on available time slots to indicate when you're available for this meeting. Your availability will be saved automatically.
          </div>
        </div>
      </div>
    );
  };
  
  // Get user's time zone
  useEffect(() => {
    const getTimeZone = () => {
      try {
        // Get time zone offset in minutes
        const offsetMinutes = -now.getTimezoneOffset(); // Invert the sign as getTimezoneOffset() returns the opposite
        // Convert to hours and minutes
        const offsetHours = Math.abs(Math.floor(offsetMinutes / 60));
        const offsetMins = Math.abs(offsetMinutes % 60);
        // Format as GMT+/-XX:YY
        const sign = offsetMinutes >= 0 ? '+' : '-';
        const formattedOffset = `GMT${sign}${offsetHours}:${offsetMins.toString().padStart(2, '0')}`;
        
        // For India (IST), hardcode to GMT+5:30
        if (offsetHours === 5 && offsetMins === 30) {
          setTimeZone('GMT+5:30');
        } else {
          setTimeZone(formattedOffset);
        }
      } catch (error) {
        setTimeZone('GMT+0:00');
      }
    };
    
    getTimeZone();
  }, []);
  
  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      
      if (width < 576) {
        setVisibleDays(1);
        setStartDayIndex(currentDay); // Show only current day on small screens
      } else if (width < 768) {
        setVisibleDays(3);
        setStartDayIndex(Math.min(4, Math.max(0, currentDay - 1))); // Show 3 days centered around current day
      } else if (width < 992) {
        setVisibleDays(5);
        setStartDayIndex(Math.min(2, Math.max(0, currentDay - 2))); // Show 5 days
      } else {
        setVisibleDays(7);
        setStartDayIndex(0); // Show all days
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentDay]);
  
  // Generate time slots from 12:00 AM to 12:00 PM (updated)
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i; // Start from 0 (12 AM) to 23 (11 PM)
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 || hour === 12 ? 12 : hour % 12;
    return `${displayHour} ${period}`;
  });

  // Week days
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Navigation functions
  const goToPreviousDays = () => {
    setStartDayIndex(Math.max(0, startDayIndex - visibleDays));
  };
  
  const goToNextDays = () => {
    setStartDayIndex(Math.min(7 - visibleDays, startDayIndex + visibleDays));
  };
  
  const goToToday = () => {
    const newStartIndex = Math.max(0, Math.min(7 - visibleDays, currentDay - Math.floor(visibleDays / 2)));
    setStartDayIndex(newStartIndex);
  };
  
  // Visible days
  const visibleDaysArray = days.slice(startDayIndex, startDayIndex + visibleDays);
  
  // Click handler for calendar grid - simplified for external users
  const handleCalendarClick = (e, dayIndex) => {
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const hourHeight = 60;
    
    // Calculate hour based on click position
    const clickHour = clickY / hourHeight;
    const hour = Math.floor(clickHour);
    const minute = Math.floor((clickHour - hour) * 60);
    
    // Calculate end time using the dynamic meetingDuration
    const endHour = hour + Math.floor(meetingDuration / 60);
    const endMinute = minute + (meetingDuration % 60);
    
    // Calculate positions
    const startPosition = clickY;
    const endPosition = startPosition + (meetingDuration / 60) * hourHeight;
    
    // Format start and end times
    const startTime = formatTimeDisplay(hour, minute);
    const endTime = formatTimeDisplay(endHour, endMinute);
    
    // Create a new slot with a unique ID
    const actualDayIndex = (startDayIndex + dayIndex) % 7;
    const newSlot = {
      id: nextSlotId,
      day: actualDayIndex,
      dayIndex: dayIndex,
      startTime: startTime,
      endTime: endTime,
      verticalPosition: startPosition,
      hour: hour,
      minute: minute,
      endPosition: endPosition
    };
    
    // Add the new slot to the existing slots
    setSelectedSlots([...selectedSlots, newSlot]);
    setNextSlotId(nextSlotId + 1);
  };
  
  // Format time for display (7:30am format)
  const formatTimeDisplay = (hour, minute) => {
    let adjustedHour = hour;
    let adjustedMinute = minute;
    
    // Handle minute overflow
    if (adjustedMinute >= 60) {
      adjustedHour += Math.floor(adjustedMinute / 60);
      adjustedMinute = adjustedMinute % 60;
    }
    
    // Handle 24-hour conversion
    if (adjustedHour >= 24) {
      adjustedHour = adjustedHour - 24;
    }
    
    const period = adjustedHour >= 12 ? 'pm' : 'am';
    const displayHour = adjustedHour === 0 ? 12 : adjustedHour > 12 ? adjustedHour - 12 : adjustedHour;
    
    return `${displayHour}:${adjustedMinute.toString().padStart(2, '0')}${period}`;
  };
  
  // Close a specific slot popup by ID
  const closeSelectedSlot = (e, slotId) => {
    e.stopPropagation();
    setSelectedSlots(selectedSlots.filter(slot => slot.id !== slotId));
    
    // Submit updated availability after removing a slot (with debounce)
    submitAvailability();
  };
  
  // Current time indicator - updated for 12am start
  const currentTimePosition = (currentHour + currentMinute / 60) * 60;
  
  // Scroll to current time on load
  const calendarRef = useRef(null);
  const gridContainerRef = useRef(null);

  const calculateTimeFromPosition = (position) => {
    const hourHeight = 60;
    const timeHour = position / hourHeight; // Updated for 12 AM start
    const hour = Math.floor(timeHour);
    const minute = Math.floor((timeHour - hour) * 60);
    
    return { hour, minute };
  };

  const startDragging = (e, slot) => {
    e.stopPropagation();
    
    // Don't start dragging from the close button
    if (e.target.classList.contains('btn-close')) return;
    
    // Add this line to store the scroll position
    const scrollTop = calendarRef.current ? calendarRef.current.scrollTop : 0;
    
    setDraggedSlot({
      id: slot.id,
      startY: e.clientY,
      initialPosition: slot.verticalPosition,
      scrollTop: scrollTop  // Add this line to store the scroll position
    });
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
  };

  const handleDrag = (e) => {
    if (!draggedSlot) return;
    
    // Get current scroll position and calculate scroll delta
    const currentScrollTop = calendarRef.current ? calendarRef.current.scrollTop : 0;
    const scrollDelta = currentScrollTop - draggedSlot.scrollTop;
    
    // Calculate actual deltaY including scroll adjustment
    const deltaY = (e.clientY - draggedSlot.startY) + scrollDelta;
    
    // Update position of the dragged slot
    setSelectedSlots(prevSlots => 
      prevSlots.map(slot => {
        if (slot.id === draggedSlot.id) {
          // Calculate new position with proper bounds checking
          const totalGridHeight = 24 * 60; // Total grid height (24 time slots * 60px)
          const newPosition = Math.max(0, Math.min(totalGridHeight - 1, draggedSlot.initialPosition + deltaY));
          
          // Calculate new time based on position
          const { hour, minute } = calculateTimeFromPosition(newPosition);
          
          // Calculate end time (adding the dynamic duration)
          const endHour = hour + Math.floor(meetingDuration / 60);
          const endMinute = minute + (meetingDuration % 60);
          
          // Calculate end position for validation
          const endPosition = newPosition + (meetingDuration / 60) * 60;
          
          return {
            ...slot,
            verticalPosition: newPosition,
            hour: hour,
            minute: minute,
            startTime: formatTimeDisplay(hour, minute),
            endTime: formatTimeDisplay(endHour, endMinute),
            endPosition: endPosition
          };
        }
        return slot;
      })
    );
  };


  const endDragging = () => {
    if (draggedSlot) {
      const slot = selectedSlots.find(s => s.id === draggedSlot.id);
      
      if (slot) {
        // Submit the updated availability
        submitAvailability();
      }
      
      // Reset dragged slot state
      setDraggedSlot(null);
      document.body.style.userSelect = '';
    }
  };

  // Set up event listeners for dragging
  useEffect(() => {
    const handleMouseMove = (e) => handleDrag(e);
    const handleMouseUp = () => endDragging();
    
    if (draggedSlot) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedSlot]);
  
  useEffect(() => {
    if (calendarRef.current) {
      // Scroll to current time (with some offset)
      calendarRef.current.scrollTop = currentTimePosition - 100;
    }
  }, [currentTimePosition]);
  
  // Define column sizes consistently for headers and content
  const timeColumnWidth = isMobile ? '40px' : '60px';
  const dayColumnWidth = isMobile ? '60px' : '100px';
  
  // Determine if navigation is needed
  const navigationNeeded = visibleDays < 7;

  // Function to calculate the adjusted popup position to ensure it stays in view
  const getPopupPosition = (position, popupHeight = 100) => {
    // The minimum position is 0 (top of the grid) plus half the popup height
    const minPosition = popupHeight / 2;
    
    // Calculate total grid height (24 time slots * 60px per hour)
    const gridHeight = 24 * 60;
    
    // The maximum position is the grid height minus half the popup height
    const maxPosition = gridHeight - popupHeight / 2;
    
    // Ensure the position stays within bounds
    return Math.min(Math.max(position, minPosition), maxPosition);
  };
  
  if (isLoading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '300px' }}>
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="text-muted text-center">
          <p className="mb-1">Loading meeting details...</p>
          <small>Please wait while we fetch the availability information</small>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center" role="alert">
        <div className="me-3">
          <svg width="24" height="24" fill="currentColor" className="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
          </svg>
        </div>
        <div>
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-fluid p-0 position-relative">
      {/* Role Banner */}
      {getRoleBanner()}
      
      {/* Calendar Content */}
      <div className="d-flex border" style={{ backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', width: '100%' }}>
        {/* Scrollable container */}
        <div className="d-flex flex-column" style={{ width: '100%' }}>
          {/* Fixed Header */}
          <div className="d-flex" style={{ position: 'sticky', top: 0, zIndex: 3, backgroundColor: '#ffffff' }}>
            {/* Time Header */}
            <div style={{ width: timeColumnWidth, minWidth: timeColumnWidth, flexShrink: 0 }} className="border-end">
              <div className="text-muted p-2 border-bottom d-flex align-items-center justify-content-center"
                   style={{ height: '50px', fontSize: isMobile ? '10px' : '12px' }}>
                {timeZone}
              </div>
            </div>
            
            {/* Days Headers */}
            {visibleDaysArray.map((day, index) => {
              const dayIndex = (startDayIndex + index) % 7;
              const isCurrentDay = dayIndex === currentDay;
              const date = new Date(now);
              date.setDate(now.getDate() - currentDay + dayIndex);
              
              return (
                <div 
                  key={day} 
                  className={`border-end ${isCurrentDay ? 'bg-primary bg-opacity-10' : ''}`}
                  style={{ 
                    width: `calc(100% / ${visibleDays})`, 
                    minWidth: dayColumnWidth,
                    flex: 1
                  }}
                >
                  <div className="border-bottom p-2 text-center" style={{ height: '50px' }}>
                    <div className={`${isMobile ? 'fs-6' : 'fw-bold'}`}>
                      {day} {date.getDate().toString().padStart(2, '0')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Scrollable Content */}
          <div ref={calendarRef} className="d-flex position-relative"
               style={{ overflowY: 'auto', maxHeight: 'calc(80vh - 50px)', width: '100%', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>
              {`
                ::-webkit-scrollbar {
                  display: none;
                }
                .cell-hover:hover {
                  background-color: rgba(0, 0, 0, 0.03);
                }
              `}
            </style>
            
            {/* Time Column */}
            <div className="time-column border-end" style={{ width: timeColumnWidth, minWidth: timeColumnWidth, flexShrink: 0, position: 'sticky', left: 0, zIndex: 1, backgroundColor: '#ffffff' }}>
              {timeSlots.map((time, i) => (
                <div key={i} className="time-slot d-flex align-items-start justify-content-end text-muted px-2 border-bottom"
                     style={{ height: '60px', fontSize: isMobile ? '10px' : '12px' }}>
                  {time}
                </div>
              ))}
            </div>
            
            {/* Grid Structure */}
            <div ref={gridContainerRef} className="position-relative" style={{ width: '100%' }}>
              <table className="table table-bordered m-0" style={{ tableLayout: 'fixed', width: '100%' }}>
                <tbody>
                  {timeSlots.map((time, timeIndex) => (
                    <tr key={timeIndex} style={{ height: '60px' }}>
                      {visibleDaysArray.map((day, dayIndex) => {
                        const actualDayIndex = (startDayIndex + dayIndex) % 7;
                        const isCurrentDay = actualDayIndex === currentDay;
                        
                        return (
                          <td 
                            key={`${timeIndex}-${dayIndex}`} 
                            className={`position-relative p-0 cell-hover ${isCurrentDay ? 'bg-primary bg-opacity-10' : ''}`}
                            style={{ 
                              height: '60px',
                              width: `${100 / visibleDays}%`,
                              borderBottom: '1px solid #dee2e6',
                              borderRight: dayIndex < visibleDaysArray.length - 1 ? '1px solid #dee2e6' : 'none'
                            }}
                            onClick={(e) => handleCalendarClick(e, dayIndex)}
                          />
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Selected Slots Display */}
              {visibleDaysArray.map((day, dayIndex) => {
                // Get slots for this day
                const daySlotsToDisplay = selectedSlots.filter(slot => slot.dayIndex === dayIndex);
                
                // Calculate the width and left position for this day's column
                const dayWidth = `calc(100% / ${visibleDays})`;
                const dayLeftPosition = `calc(${dayIndex} * 100% / ${visibleDays})`;
                
                // Popup dimensions for positioning calculations
                const popupHeight = 100; // Approximate height of popup in pixels
                
                return (
                  <div key={`slots-${dayIndex}`} className="position-absolute" style={{ 
                    top: 0, 
                    left: dayLeftPosition, 
                    width: dayWidth,
                    height: '100%',
                    pointerEvents: 'none' // Let clicks pass through to the cells
                  }}>
                    {/* Place multiple popups inside the day column */}
                    {daySlotsToDisplay.map((slot, index) => (
                      <div 
                        key={`slot-${slot.id}`}
                        className="position-absolute p-3 rounded shadow-lg bg-white border border-primary"
                        style={{
                          top: `${getPopupPosition(slot.verticalPosition, popupHeight)}px`,
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          zIndex: 10,
                          width: '90%',
                          maxWidth: '180px',
                          pointerEvents: 'auto', // Make this element receive pointer events
                          cursor: 'grab', // Show grab cursor for external participants
                          ...(draggedSlot && draggedSlot.id === slot.id ? { cursor: 'grabbing' } : {})
                        }}
                        onMouseDown={(e) => startDragging(e, slot)}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="m-0">Slot #{selectedSlots.findIndex(s => s.id === slot.id) + 1}</h6>
                          <button 
                            type="button" 
                            className="btn-close"
                            onClick={(e) => closeSelectedSlot(e, slot.id)}
                            aria-label="Close"
                          ></button>
                        </div>
                        <div>
                          {slot.startTime}
                          <br />
                          {slot.endTime}
                          
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
              
              {/* Current Time Indicator */}
              <div className="position-absolute d-flex align-items-center"
                   style={{ 
                     top: `${currentTimePosition}px`, 
                     height: '2px', 
                     backgroundColor: '#1a1aff', 
                     zIndex: 3, 
                     left: '0',
                     right: '0',
                     width: '100%'
                   }}>
                <div className="position-absolute text-white px-1 py-1 rounded-pill fw-bold"
                     style={{ left: '2px', backgroundColor: '#1a1aff', fontSize: isMobile ? '8px' : '12px' }}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Controls - Only shown when needed */}
      {navigationNeeded && (
        <div className="d-flex justify-content-between align-items-center mt-2 px-2">
          <div>
            <button 
              className="btn btn-sm btn-outline-primary me-2" 
              onClick={goToPreviousDays}
              disabled={startDayIndex === 0}
            >
              &lt; Prev
            </button>
            <button 
              className="btn btn-sm btn-outline-primary" 
              onClick={goToToday}
            >
              Today
            </button>
          </div>
          <div>
            <button 
              className="btn btn-sm btn-outline-primary" 
              onClick={goToNextDays}
              disabled={startDayIndex + visibleDays >= 7}
            >
              Next &gt;
            </button>
          </div>
        </div>
      )}
      
      {/* Help Information for External Users */}
      <div className="mt-3 p-3 bg-light rounded border">
        <h6 className="mb-2">📋 How to Use This Availability Calendar</h6>
        <div className="row">
          <div className="col-md-6">
            <ul className="list-unstyled small">
              <li className="mb-1">• Click on highlighted time slots to select your availability</li>
              <li className="mb-1">• Drag selected slots to adjust timing</li>
              <li className="mb-1">• Click ✕ on any selected slot to remove it</li>
            </ul>
          </div>
          <div className="col-md-6">
            <ul className="list-unstyled small">
              <li className="mb-1">• Your selections are saved automatically</li>
              <li className="mb-1">• Meeting duration: {meetingDuration} minutes</li>
              <li className="mb-1">• Timezone: {timeZone}</li>
            </ul>
          </div>
        </div>
      </div>
      
      
      {/* Error Toast */}
      {showError && (
        <div 
          className="position-fixed bottom-0 start-50 translate-middle-x mb-4 p-3 bg-danger text-white rounded shadow"
          style={{ zIndex: 1050, minWidth: '250px', textAlign: 'center' }}
        >
          {errorMessage}
        </div>
      )}
      
      {/* Success Toast */}
      {showSuccess && (
        <div 
          className="position-fixed bottom-0 start-50 translate-middle-x mb-4 p-3 bg-success text-white rounded shadow"
          style={{ zIndex: 1050, minWidth: '250px', textAlign: 'center' }}
        >
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default Availability;