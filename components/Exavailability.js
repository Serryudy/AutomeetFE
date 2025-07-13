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
  const [isMobile, setIsMobile] = useState(false);
  const [visibleDays, setVisibleDays] = useState(7);
  const [startDayIndex, setStartDayIndex] = useState(0);
  const [timeZone, setTimeZone] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [nextSlotId, setNextSlotId] = useState(1);
  const [adminTimeRanges, setAdminTimeRanges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meetingDuration, setMeetingDuration] = useState(70);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [draggedSlot, setDraggedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [meetingAvailabilities, setMeetingAvailabilities] = useState([]);
  const [bestTimeSlot, setBestTimeSlot] = useState(null);
  const [hasSuggestedTime, setHasSuggestedTime] = useState(false);
  const [hoveredTimeSlot, setHoveredTimeSlot] = useState(null);
  
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

  const confirmTimeSlot = async () => {
    if (!meetingId || !hoveredTimeSlot || !['creator', 'host'].includes(userRole)) return;
    
    try {
      setSubmitting(true);
      
      // Use the existing convertTimeToISO function to create Date objects
      const startDate = convertTimeToISO(
        hoveredTimeSlot.day, 
        hoveredTimeSlot.startHour, 
        hoveredTimeSlot.startMinute
      );
      
      const endDate = convertTimeToISO(
        hoveredTimeSlot.day, 
        hoveredTimeSlot.endHour, 
        hoveredTimeSlot.endMinute
      );
      
      // Create the payload with the time slot in ISO string format
      const payload = {
        timeSlot: {
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString()
        }
      };
      
      console.log('Confirming time slot with payload:', payload);
      
      // Call the confirm endpoint with the payload
      const response = await fetch(`http://localhost:8080/api/meetings/${meetingId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      // Show success message
      setSuccessMessage("Meeting time confirmed successfully!");
      setShowSuccess(true);
      
      // Redirect to meeting details page
      setTimeout(() => {
        window.location.href = `/meetingdetails/${meetingId}`;
      }, 1500);
      
    } catch (err) {
      console.error('Error confirming time slot:', err);
      setErrorMessage("Failed to confirm meeting time. Please try again.");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setSubmitting(false);
    }
  };
  

  
  
  useEffect(() => {
    const fetchMeetingDetails = async () => {
      if (!meetingId) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`http://localhost:8080/api/meetings/externally/${meetingId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Meeting details API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Parse duration (e.g., "1 hour", "90 minutes")
        let durationMinutes = 60; // default
        if (data.duration) {
          const match = data.duration.match(/(\d+)\s*(hour|minute)/i);
          if (match) {
            const value = parseInt(match[1], 10);
            if (/hour/i.test(match[2])) durationMinutes = value * 60;
            else if (/minute/i.test(match[2])) durationMinutes = value;
          }
        }
        setMeetingDuration(durationMinutes);
        setUserRole('participant'); // Always treat as external participant
        
        // Fetch availability ranges for the meeting
        await fetchTimeRanges();
        // Fetch user's own availability
        await fetchUserAvailability();
      } catch (err) {
        console.error('Error fetching meeting details:', err);
        setError('Failed to load meeting details. Please try again later.');
        setIsLoading(false);
      }
    };

    // Fetch time ranges from API
    const fetchTimeRanges = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/availability/${meetingId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform API data to the format our component uses
        const formattedRanges = [];
        let adminId = 1;
        const userMap = {};
        
        data.forEach(item => {
          if (!userMap[item.username]) {
            userMap[item.username] = adminId++;
          }
          item.timeSlots.forEach(slot => {
            const startDate = new Date(slot.startTime);
            const endDate = new Date(slot.endTime);
            
            formattedRanges.push({
              adminId: userMap[item.username],
              day: startDate.getDay(),
              startHour: startDate.getHours(),
              startMinute: startDate.getMinutes(),
              endHour: endDate.getHours(),
              endMinute: endDate.getMinutes(),
              username: item.username
            });
          });
        });
        
        setAdminTimeRanges(formattedRanges);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching availability data:', err);
        setError('Failed to load availability data. Please try again later.');
        setIsLoading(false);
      }
    };

    // Fetch user's own availability
    const fetchUserAvailability = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/participant/availability/externally/${meetingId}?userId=${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          // No availability yet, that's fine
          return;
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
        // No existing availability, that's fine
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
      
      // Try POST first
      let response = await fetch('http://localhost:8080/api/participant/availability/externally', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      // If POST fails with 409, try PUT
      if (response.status === 409) {
        response = await fetch('http://localhost:8080/api/participant/availability/externally', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include'
        });
      }

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      // Show success message
      setSuccessMessage("Your availability has been saved successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (err) {
      console.error('Error submitting availability:', err);
      setErrorMessage("Failed to save your availability. Please try again.");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
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
    if (userRole === 'participant') {
      return (
        <div className="alert alert-info mb-3" role="alert">
          You are a participant in this meeting. Click on available time slots to indicate your availability.
        </div>
      );
    } else if (userRole === 'creator' || userRole === 'host') {
      return (
        <div className="alert alert-secondary mb-3" role="alert">
          You are {userRole === 'creator' ? 'the creator' : 'a host'} of this meeting. You can view availability but cannot select time slots.
        </div>
      );
    }
    return null;
  };
  
  useEffect(() => {
    const fetchMeetingDetails = async () => {
      if (!meetingId) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`http://localhost:8080/api/meetings/externally/${meetingId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Meeting details API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Parse duration (e.g., "1 hour", "90 minutes")
        let durationMinutes = 60; // default
        if (data.duration) {
          const match = data.duration.match(/(\d+)\s*(hour|minute)/i);
          if (match) {
            const value = parseInt(match[1], 10);
            if (/hour/i.test(match[2])) durationMinutes = value * 60;
            else if (/minute/i.test(match[2])) durationMinutes = value;
          }
        }
        setMeetingDuration(durationMinutes);
        setUserRole('participant'); // Always treat as external participant
        
        // Fetch availability ranges for the meeting
        await fetchTimeRanges();
        // Fetch user's own availability
        await fetchUserAvailability();
      } catch (err) {
        console.error('Error fetching meeting details:', err);
        setError('Failed to load meeting details. Please try again later.');
        setIsLoading(false);
      }
    };

    // Fetch time ranges from API
    const fetchTimeRanges = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/availability/${meetingId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform API data to the format our component uses
        const formattedRanges = [];
        let adminId = 1;
        const userMap = {};
        
        data.forEach(item => {
          if (!userMap[item.username]) {
            userMap[item.username] = adminId++;
          }
          item.timeSlots.forEach(slot => {
            const startDate = new Date(slot.startTime);
            const endDate = new Date(slot.endTime);
            
            formattedRanges.push({
              adminId: userMap[item.username],
              day: startDate.getDay(),
              startHour: startDate.getHours(),
              startMinute: startDate.getMinutes(),
              endHour: endDate.getHours(),
              endMinute: endDate.getMinutes(),
              username: item.username
            });
          });
        });
        
        setAdminTimeRanges(formattedRanges);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching availability data:', err);
        setError('Failed to load availability data. Please try again later.');
        setIsLoading(false);
      }
    };

    // Fetch user's own availability
    const fetchUserAvailability = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/participant/availability/externally/${meetingId}?userId=${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          // No availability yet, that's fine
          return;
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
        // No existing availability, that's fine
      }
    };

    fetchMeetingDetails();
  }, [meetingId, userId]);
  
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
  
  // Function to get color based on adminId
  const getAdminColor = (adminId) => {

    if (isBestTimeSlot) {
      return '#9ef0f0'; // Light turquoise for best time slot
    }
    const colors = {
      1: '#ffffcc', // Light Yellow
      2: '#ffe6cc', // Light Orange
      3: '#ffcccc', // Light Pink
      4: '#ffccff',  // Light Magenta
      5: '#ccffcc', // Light Green
      6: '#ccffff', // Light Cyan
      7: '#ccccff', // Light Blue
      8: '#e6ccff', // Light Purple
    };
    return colors[adminId] || '#f0f0f0';
  };

  const isBestTimeSlot = (day, startHour, startMinute, endHour, endMinute) => {
    if (!bestTimeSlot) return false;
    
    const rangeStart = new Date();
    rangeStart.setHours(startHour, startMinute, 0, 0);
    rangeStart.setDate(rangeStart.getDate() - rangeStart.getDay() + day);
    
    const rangeEnd = new Date();
    rangeEnd.setHours(endHour, endMinute, 0, 0);
    rangeEnd.setDate(rangeEnd.getDate() - rangeEnd.getDay() + day);
    
    // Check if there's an overlap
    const bestStart = bestTimeSlot.startTime;
    const bestEnd = bestTimeSlot.endTime;
    
    return (
      (rangeStart >= bestStart && rangeStart < bestEnd) ||
      (rangeEnd > bestStart && rangeEnd <= bestEnd) ||
      (rangeStart <= bestStart && rangeEnd >= bestEnd)
    );
  };
  
  // Function to calculate time range position and style - updated for 12am start
  const getTimeRangeStyle = (timeRange) => {
    const hourHeight = 60; // 60px per hour
    // Calculate starting position (adjust for 12 AM start)
    const startOffset = (timeRange.startHour + timeRange.startMinute / 60) * hourHeight;
    // Calculate height based on duration
    const rangeHeight = ((timeRange.endHour - timeRange.startHour) + (timeRange.endMinute - timeRange.startMinute) / 60) * hourHeight;
    
    // Check if this range is part of the best time slot
    const isBest = isBestTimeSlot(
      timeRange.day, 
      timeRange.startHour, 
      timeRange.startMinute, 
      timeRange.endHour, 
      timeRange.endMinute
    );
    
    return {
      top: `${startOffset}px`,
      height: `${rangeHeight}px`,
      backgroundColor: getAdminColor(timeRange.adminId, isBest),
      position: 'absolute',
      left: '0',
      right: '0',
      zIndex: 1,
      cursor: userRole === 'participant' ? 'pointer' : 'default',
      opacity: 0.8,
      borderRadius: '8px',
      border: isBest ? '2px solid #00bfbf' : '1px solid #000' // Thicker border for best time slot
    };
  };

  const renderBestTimeSlotLegend = () => {
    if (hasSuggestedTime && bestTimeSlot && ['creator', 'host'].includes(userRole)) {
      return (
        <div className="d-flex align-items-center mt-2 px-2">
          <div 
            style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#9ef0f0', 
              borderRadius: '4px', 
              border: '2px solid #00bfbf',
              marginRight: '8px'
            }}
          ></div>
          <div className="small">
            Best Time Slot: {bestTimeSlot.startTime.toLocaleString()} - {bestTimeSlot.endTime.toLocaleString()}
          </div>
        </div>
      );
    }
    return null;
  };
  
   // Click handler for time slots - updated to use dynamic meetingDuration
   const handleTimeRangeClick = (e, day, timeRange, dayIndex) => {
    e.stopPropagation();
    
    if (userRole !== 'participant') {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const hourHeight = 60;
    
    // Calculate hour based on click position
    const clickHour = clickY / hourHeight; // Updated to start from 0 (12 AM)
    const hour = Math.floor(clickHour);
    const minute = Math.floor((clickHour - hour) * 60);
    
    // Calculate end time using the dynamic meetingDuration
    const endHour = hour + Math.floor(meetingDuration / 60);
    const endMinute = minute + (meetingDuration % 60);
    
    // Calculate positions for validation
    const timeRangeTop = parseFloat(getTimeRangeStyle(timeRange).top);
    const startPosition = timeRangeTop + clickY;
    const endPosition = startPosition + (meetingDuration / 60) * hourHeight;
    
    // Validate that the entire slot is within the admin time range
    if (!isSlotWithinAdminTimeRange(day, startPosition, endPosition)) {
      setErrorMessage("The entire time slot must be within the highlighted availability area.");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    
    // Format start and end times
    const startTime = formatTimeDisplay(hour, minute);
    const endTime = formatTimeDisplay(endHour, endMinute);
    
    // Create a new slot with a unique ID
    const newSlot = {
      id: nextSlotId,
      day: day,
      dayIndex: dayIndex,
      admin: timeRange.adminId,
      adminName: timeRange.username || `Admin ${timeRange.adminId}`,
      startTime: startTime,
      endTime: endTime,
      verticalPosition: startPosition,
      hour: hour,
      minute: minute,
      endPosition: endPosition // Store end position for validation
    };
    
    // Add the new slot to the existing slots
    setSelectedSlots([...selectedSlots, newSlot]);
    setNextSlotId(nextSlotId + 1);
    // Do NOT call submitAvailability here
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
    e.stopPropagation(); // Stop event propagation to prevent triggering parent onClick handlers
    if (userRole !== 'participant') {
      return;
    }
    setSelectedSlots(selectedSlots.filter(slot => slot.id !== slotId));
    
    // Submit updated availability after removing a slot (with debounce)
    submitAvailability();
  };
  
  // Function to check if a slot is completely within any admin time range for a given day
  const isSlotWithinAdminTimeRange = (day, startPosition, endPosition) => {
    const startHour = startPosition / 60; // Convert position to hour (0 = 12 AM)
    const endHour = endPosition / 60; // Convert end position to hour
    
    // Get all admin time ranges for this day
    const dayTimeRanges = adminTimeRanges.filter(range => range.day === day);
    
    // Check if the slot falls completely within any of the time ranges
    return dayTimeRanges.some(range => {
      const rangeStartHour = range.startHour + range.startMinute / 60;
      const rangeEndHour = range.endHour + range.endMinute / 60;
      return startHour >= rangeStartHour && endHour <= rangeEndHour;
    });
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

    if (userRole !== 'participant') {
      return;
    }
    
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
        // Calculate end position based on the dynamic slot duration
        const endPosition = slot.verticalPosition + (meetingDuration / 60) * 60;
        
        // Check if the entire slot is within a valid admin time range
        const isValid = isSlotWithinAdminTimeRange(slot.day, slot.verticalPosition, endPosition);
        
        if (!isValid) {
          // Remove the invalid slot
          setSelectedSlots(selectedSlots.filter(s => s.id !== draggedSlot.id));
          
          // Show error message
          setErrorMessage("The entire time slot must be within the highlighted availability area.");
          setShowError(true);
          
          // Hide error after 3 seconds
          setTimeout(() => {
            setShowError(false);
          }, 3000);
        } else {
          // If the slot is valid, submit the updated availability
          submitAvailability();
        }
      }
      
      // Reset dragged slot state
      setDraggedSlot(null);
      document.body.style.userSelect = '';
    }
  };

  const handleTimeRangeMouseEnter = (timeRange) => {
    // Only set hover state for creator/host on best time slots
    if (['creator', 'host'].includes(userRole) && 
        isBestTimeSlot(timeRange.day, timeRange.startHour, timeRange.startMinute, timeRange.endHour, timeRange.endMinute)) {
      setHoveredTimeSlot(timeRange);
    }
  };
  
  const handleTimeRangeMouseLeave = () => {
    setHoveredTimeSlot(null);
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
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }
  
  return (
    <div className="container-fluid p-0 position-relative">
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
                          />
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Admin Time Ranges */}
              {visibleDaysArray.map((day, dayIndex) => {
                const actualDayIndex = (startDayIndex + dayIndex) % 7;
                
                // Get all time ranges for this day
                const dayTimeRanges = adminTimeRanges.filter(range => range.day === actualDayIndex);
                
                // Calculate the width and left position for this day's column
                const dayWidth = `calc(100% / ${visibleDays})`;
                const dayLeftPosition = `calc(${dayIndex} * 100% / ${visibleDays})`;
                
                // Get slots for this day
                const daySlotsToDisplay = selectedSlots.filter(slot => slot.dayIndex === dayIndex);
                
                // Popup dimensions for positioning calculations
                const popupHeight = 100; // Approximate height of popup in pixels
                
                return (
                  <div key={`ranges-${dayIndex}`} className="position-absolute" style={{ 
                    top: 0, 
                    left: dayLeftPosition, 
                    width: dayWidth,
                    height: '100%',
                    pointerEvents: 'none' // Let clicks pass through to the cells
                  }}>
                    {dayTimeRanges.map((timeRange, rangeIndex) => {
                    const isBest = isBestTimeSlot(
                      timeRange.day, 
                      timeRange.startHour, 
                      timeRange.startMinute, 
                      timeRange.endHour, 
                      timeRange.endMinute
                    );
                    
                    const isHovered = hoveredTimeSlot && 
                      hoveredTimeSlot.day === timeRange.day && 
                      hoveredTimeSlot.startHour === timeRange.startHour && 
                      hoveredTimeSlot.startMinute === timeRange.startMinute;
                    
                    return (
                      <div 
                        key={`range-${rangeIndex}`}
                        onClick={(e) => userRole === 'participant' ? handleTimeRangeClick(e, actualDayIndex, timeRange, dayIndex) : null}
                        onMouseEnter={() => handleTimeRangeMouseEnter(timeRange)}
                        onMouseLeave={handleTimeRangeMouseLeave}
                        style={{
                          ...getTimeRangeStyle(timeRange),
                          pointerEvents: 'auto'
                        }}
                      >
                        {/* Username label */}
                        {timeRange.username && (
                          <div style={{ 
                            position: 'absolute', 
                            top: '2px', 
                            left: '5px', 
                            right: '5px',
                            fontSize: '10px',
                            color: '#333',
                            fontWeight: 'bold',
                            textShadow: '0 0 2px white',
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {timeRange.username}
                          </div>
                        )}
                        
                        {/* Confirmation popup */}
                        {isBest && isHovered && ['creator', 'host'].includes(userRole) && (
                          <div className="position-absolute top-50 start-50 translate-middle bg-white p-2 rounded shadow border border-primary"
                              style={{ zIndex: 100, minWidth: '120px', textAlign: 'center' }}>
                            <p className="mb-2 small">Best time slot</p>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={confirmTimeSlot}
                              disabled={submitting}
                            >
                              {submitting ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                  Confirming...
                                </>
                              ) : (
                                'Confirm Time'
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                    
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
                          cursor: userRole === 'participant' ? 'grab' : 'default', // Only show grab cursor for participants
                          ...(draggedSlot && draggedSlot.id === slot.id ? { cursor: 'grabbing' } : {})
                        }}
                        onMouseDown={(e) => startDragging(e, slot)}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="m-0">Slot #{selectedSlots.findIndex(s => s.id === slot.id) + 1}</h6>
                          {userRole === 'participant' && (
                            <button 
                              type="button" 
                              className="btn-close"
                              onClick={(e) => closeSelectedSlot(e, slot.id)}
                              aria-label="Close"
                            ></button>
                          )}
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

      {renderBestTimeSlotLegend()}
      
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