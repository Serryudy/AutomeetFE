import React, { useEffect, useRef, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
const WeeklyCalendar = ({ selectedDate }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [visibleDays, setVisibleDays] = useState(7);
  const [viewStartDate, setViewStartDate] = useState(null);
  const [timeZone, setTimeZone] = useState('');
  const [processedEvents, setProcessedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get current date and time
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDay = now.getDay();
  const calendarRef = useRef(null);
  const gridContainerRef = useRef(null);
  
  // Function to get first day (Sunday) of the week for a given date
  const getFirstDayOfWeek = (date) => {
    const tempDate = new Date(date);
    const day = tempDate.getDay(); // 0 is Sunday, 6 is Saturday
    const diff = tempDate.getDate() - day;
    return new Date(tempDate.setDate(diff));
  };
  
  // Initialize calendar to show current week or the week containing selectedDate
  useEffect(() => {
    let targetDate;
    
    if (selectedDate && selectedDate !== '') {
      // If selectedDate is a string, convert to Date object
      targetDate = typeof selectedDate === 'string' 
        ? new Date(selectedDate) 
        : new Date(selectedDate);
      
      // Check if valid date
      if (isNaN(targetDate.getTime())) {
        targetDate = new Date(); // Fallback to current date if invalid
      }
    } else {
      targetDate = new Date(); // Default to current date
    }
    
    // Set view to start from first day of the week containing targetDate
    setViewStartDate(getFirstDayOfWeek(targetDate));
  }, [selectedDate]);
  
  // Fetch confirmed meetings from API
  useEffect(() => {
    const fetchConfirmedMeetings = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('http://localhost:8080/api/confirmed/meetings', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch meetings: ${response.status}`);
        }
        
        const meetings = await response.json();
        processEventData(meetings);
      } catch (err) {
        console.error('Error fetching meetings:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConfirmedMeetings();
  }, []);
  
  // Process events from API response
  const processEventData = (events) => {
    if (events && events.length > 0) {
      const processed = events.map(event => {
        // Parse the start and end times
        const startDate = new Date(event.directTimeSlot.startTime);
        const endDate = new Date(event.directTimeSlot.endTime);
        
        // Get day of week (0-6, where 0 is Sunday)
        const day = startDate.getDay();
        
        // Get hours and minutes
        const startHour = startDate.getHours();
        const startMinute = startDate.getMinutes();
        const endHour = endDate.getHours();
        const endMinute = endDate.getMinutes();
        
        // Set visual identifiers for different meeting states and types
        let color = '#b3e0ff'; // Default calendar event color
        
        if (event.status === 'pending') {
          color = '#ffb3b3'; // Red-ish
        } else if (event.status === 'confirmed') {
          color = '#b3ffb3'; // Green-ish 
        }
        
        if (event.meetingType === 'direct') {
          color = '#ffdf80'; // Yellow-ish 
        } else if (event.meetingType === 'group') {
          color = '#d9b3ff'; // Purple-ish
        }
        
        return {
          id: event.id,
          title: event.title,
          description: event.description || '',
          location: event.location || '',
          day,
          startHour,
          startMinute,
          endHour,
          endMinute,
          color,
          status: event.status,
          meetingType: event.meetingType,
          startDate: new Date(event.directTimeSlot.startTime), // Store the original date objects
          endDate: new Date(event.directTimeSlot.endTime),
          role: event.role || 'participant',
          participants: event.participants || []
        };
      });
      
      setProcessedEvents(processed);
    }
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
        setVisibleDays(1); // Show only one day on small screens
      } else if (width < 768) {
        setVisibleDays(3); // Show 3 days on medium screens
      } else if (width < 992) {
        setVisibleDays(5); // Show 5 days on larger screens
      } else {
        setVisibleDays(7); // Show all days on large screens
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Scroll to current time on load
  useEffect(() => {
    if (calendarRef.current) {
      const currentTimePosition = (currentHour + currentMinute / 60) * 60; // Remove 6 AM offset
      calendarRef.current.scrollTop = currentTimePosition - 100;
    }
  }, [currentHour, currentMinute]);
  
  // Replace userProfile state and fetch with useProfile hook
  const { profile, loading: profileLoading } = useProfile();

  // Update timezone when profile changes
  useEffect(() => {
    if (profile?.time_zone) {
      const gmtOffset = getGMTOffset(profile.time_zone);
      setTimeZone(gmtOffset);
    }
  }, [profile]);

  const getGMTOffset = (timeZone) => {
  try {
    // Create a date in the specified timezone
    const date = new Date();
    const options = { timeZone, timeZoneName: 'short' };
    
    // Get the timezone offset in minutes
    const offsetInMinutes = -new Date(date.toLocaleString('en-US', options)).getTimezoneOffset();
    
    // Convert to hours and minutes
    const hours = Math.floor(Math.abs(offsetInMinutes) / 60);
    const minutes = Math.abs(offsetInMinutes) % 60;
    
    // Format as GMT±HH:MM
    const sign = offsetInMinutes >= 0 ? '+' : '-';
    return `GMT${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error converting timezone:', error);
    return 'GMT+0:00';
  }
};

  // Update timeSlots generation to show 12 AM to 11 PM
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i; // Start from 0 (12 AM)
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return {
      hour,
      displayText: `${displayHour} ${period}`
    };
  });
  
  // Update event position calculation
  const getEventStyle = (event, dayDate) => {
    // Check if the event falls on this day
    const eventDate = event.startDate;
    const isSameDay = eventDate.getDate() === dayDate.getDate() && 
                     eventDate.getMonth() === dayDate.getMonth() && 
                     eventDate.getFullYear() === dayDate.getFullYear();
    
    if (!isSameDay) return null;
    
    const hourHeight = 60; // 60px per hour
    
    // Calculate position without 6am offset
    const startOffset = (event.startHour + (event.startMinute / 60)) * hourHeight;
    
    // Calculate event height
    let eventDuration;
    if (event.endHour < event.startHour) {
      // Handle events that cross midnight
      eventDuration = (24 - event.startHour + event.endHour) + (event.endMinute - event.startMinute) / 60;
    } else {
      eventDuration = (event.endHour - event.startHour) + (event.endMinute - event.startMinute) / 60;
    }
    
    const eventHeight = eventDuration * hourHeight;
    
    return {
      top: `${startOffset}px`,
      height: `${eventHeight}px`,
      backgroundColor: event.color,
      left: '2px',
      right: '2px',
      position: 'absolute',
      borderRadius: '4px',
      padding: '4px',
      fontSize: isMobile ? '10px' : '12px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      zIndex: 2,
      cursor: 'pointer'
    };
  };

  // Update scroll to current time logic
  useEffect(() => {
    if (calendarRef.current) {
      const currentTimePosition = (currentHour + currentMinute / 60) * 60; // Remove 6 AM offset
      calendarRef.current.scrollTop = currentTimePosition - 100;
    }
  }, [currentHour, currentMinute]);

  // Update current time indicator position calculation
  const currentTimePosition = (currentHour + currentMinute / 60) * 60; // Remove 6 AM offset

  // Define column sizes consistently for headers and content
  const timeColumnWidth = isMobile ? '40px' : '60px';
  const dayColumnWidth = isMobile ? '60px' : '100px';
  
  // Generate array of dates for the current view
  const getDaysArray = () => {
    if (!viewStartDate) return [];
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(viewStartDate);
      date.setDate(viewStartDate.getDate() + i);
      return {
        dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        date: date,
        dayOfMonth: date.getDate(),
        isToday: date.toDateString() === new Date().toDateString(),
        isInSelectedWeek: true,
      };
    });
  };
  
  const daysArray = getDaysArray();
  
  // Filter visible days based on screen size
  const visibleDaysArray = visibleDays === 7 
    ? daysArray 
    : daysArray.slice(0, visibleDays);
  

  // Handle event click
  const handleEventClick = (event) => {
    console.log('Event clicked:', event);
    // You can add functionality to show event details or navigate to a detailed view
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error loading meetings: {error}
      </div>
    );
  }

  // Calculate total grid height
  const totalGridHeight = timeSlots.length * 60; // 24 hours * 60px per hour

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
            {visibleDaysArray.map((dayInfo, index) => {
              return (
                <div 
                  key={index} 
                  className={`border-end ${dayInfo.isToday ? 'bg-primary bg-opacity-10' : ''}`}
                  style={{ 
                    width: `calc(100% / ${visibleDaysArray.length})`, 
                    minWidth: dayColumnWidth,
                    flex: 1
                  }}
                >
                  <div className="border-bottom p-2 text-center" style={{ height: '50px' }}>
                    <div className={`${isMobile ? 'fs-6' : 'fw-bold'}`}>
                      {dayInfo.dayName} {dayInfo.dayOfMonth}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scrollable Content */}
          <div ref={calendarRef} className="position-relative"
               style={{ overflowY: 'auto', maxHeight: 'calc(80vh - 50px)', width: '100%', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>
              {`
                ::-webkit-scrollbar {
                  display: none;
                }
                .cell-hover:hover {
                  background-color: rgba(0, 0, 0, 0.03);
                }
                .day-column {
                  border-right: 1px solid #dee2e6;
                }
                .day-column:last-child {
                  border-right: none;
                }
              `}
            </style>
            
            {/* Main Content Area with Grid */}
            <div className="d-flex" style={{ position: 'relative', minHeight: `${totalGridHeight}px` }}>
              {/* Time Column */}
              <div className="time-column border-end" 
                   style={{ 
                     width: timeColumnWidth, 
                     minWidth: timeColumnWidth, 
                     flexShrink: 0, 
                     position: 'sticky', 
                     left: 0, 
                     zIndex: 1, 
                     backgroundColor: '#ffffff' 
                   }}>
                {timeSlots.map((timeSlot, i) => (
                  <div key={i} 
                       className="time-slot d-flex align-items-start justify-content-end text-muted px-2 border-bottom"
                       style={{ height: '60px', fontSize: isMobile ? '10px' : '12px' }}>
                    {timeSlot.displayText}
                  </div>
                ))}
              </div>
              
              {/* Grid Structure */}
              <div ref={gridContainerRef} className="d-flex flex-grow-1" style={{ position: 'relative' }}>
                {/* Day Columns with Vertical Dividers */}
                {visibleDaysArray.map((dayInfo, dayIndex) => (
                  <div 
                    key={dayIndex}
                    className={`day-column ${dayInfo.isToday ? 'bg-primary bg-opacity-10' : ''}`}
                    style={{ 
                      width: `${100 / visibleDaysArray.length}%`,
                      minWidth: dayColumnWidth,
                      position: 'relative'
                    }}
                  >
                    {/* Time Cells */}
                    {timeSlots.map((timeSlot, timeIndex) => (
                      <div 
                        key={timeIndex}
                        className="position-relative cell-hover"
                        style={{ 
                          height: '60px',
                          borderBottom: '1px solid #dee2e6'
                        }}
                      />
                    ))}
                    
                    {/* Events overlay for this day */}
                    {processedEvents.map((event, eventIndex) => {
                      const eventStyle = getEventStyle(event, dayInfo.date);
                      if (!eventStyle) return null;
                      
                      return (
                        <div 
                          key={eventIndex} 
                          className="event" 
                          style={eventStyle}
                          onClick={() => handleEventClick(event)}
                        >
                          <div className="fw-bold text-truncate">{event.title}</div>
                          {!isMobile && (
                            <div className="text-truncate small">
                              {`${event.startHour.toString().padStart(2, '0')}:${event.startMinute.toString().padStart(2, '0')} - 
                                ${event.endHour.toString().padStart(2, '0')}:${event.endMinute.toString().padStart(2, '0')}`}
                            </div>
                          )}
                          {!isMobile && event.location && (
                            <div className="text-truncate small">
                              {event.location}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
                
                {/* Current Time Indicator - Only show if the current day is visible */}
                {daysArray.some(day => day.isToday) && (
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;