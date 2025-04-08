import React, { useEffect, useRef, useState } from 'react';

const Availability = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [visibleDays, setVisibleDays] = useState(7);
  const [startDayIndex, setStartDayIndex] = useState(0);
  const [timeZone, setTimeZone] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]); // Changed to array to store multiple slots
  const [nextSlotId, setNextSlotId] = useState(1); // To generate unique IDs for slots
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDay = now.getDay();
  
  // Constant for the duration of a selected time slot in minutes
  const SELECTED_SLOT_DURATION = 70; // 1 hour and 10 minutes
  
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
  
  // Admin time ranges data
  const adminTimeRanges = [
    // Admin 1 (Light Yellow)
    { adminId: 1, day: 0, startHour: 0, startMinute: 0, endHour: 10, endMinute: 0 },
    { adminId: 1, day: 1, startHour: 8, startMinute: 0, endHour: 12, endMinute: 0 },
    { adminId: 1, day: 2, startHour: 10, startMinute: 0, endHour: 14, endMinute: 0 },
    { adminId: 1, day: 3, startHour: 15, startMinute: 0, endHour: 17, endMinute: 0 },
    { adminId: 1, day: 4, startHour: 12, startMinute: 0, endHour: 16, endMinute: 0 },
    { adminId: 1, day: 5, startHour: 8, startMinute: 0, endHour: 22, endMinute: 0 },
    
    // Admin 2 (Light Orange)
    { adminId: 2, day: 0, startHour: 10, startMinute: 0, endHour: 12, endMinute: 0 },
    { adminId: 2, day: 1, startHour: 12, startMinute: 0, endHour: 16, endMinute: 0 },
    { adminId: 2, day: 2, startHour: 14, startMinute: 0, endHour: 16, endMinute: 0 },
    { adminId: 2, day: 4, startHour: 16, startMinute: 0, endHour: 20, endMinute: 0 },
    
    // Admin 3 (Light Pink)
    { adminId: 3, day: 0, startHour: 12, startMinute: 0, endHour: 14, endMinute: 0 },
    { adminId: 3, day: 0, startHour: 16, startMinute: 0, endHour: 22, endMinute: 0 },
    { adminId: 3, day: 1, startHour: 18, startMinute: 0, endHour: 22, endMinute: 0 },
    { adminId: 3, day: 3, startHour: 8, startMinute: 0, endHour: 14, endMinute: 0 },
    { adminId: 3, day: 3, startHour: 17, startMinute: 0, endHour: 22, endMinute: 0 },
    { adminId: 3, day: 4, startHour: 0, startMinute: 0, endHour: 12, endMinute: 0 },
    { adminId: 3, day: 6, startHour: 0, startMinute: 0, endHour: 22, endMinute: 0 },
    
    // Admin 4 (Light Magenta)
    { adminId: 4, day: 0, startHour: 14, startMinute: 0, endHour: 20, endMinute: 0 },
    { adminId: 4, day: 0, startHour: 18, startMinute: 0, endHour: 22, endMinute: 0 },
    { adminId: 4, day: 1, startHour: 16, startMinute: 0, endHour: 18, endMinute: 0 },
    { adminId: 4, day: 3, startHour: 0, startMinute: 0, endHour: 8, endMinute: 0 },
    { adminId: 4, day: 3, startHour: 14, startMinute: 0, endHour: 15, endMinute: 0 },
  ];
  
  // Function to get color based on adminId
  const getAdminColor = (adminId) => {
    const colors = {
      1: '#ffffcc', // Light Yellow
      2: '#ffe6cc', // Light Orange
      3: '#ffcccc', // Light Pink
      4: '#ffccff'  // Light Magenta
    };
    return colors[adminId] || '#f0f0f0';
  };
  
  // Function to calculate time range position and style - updated for 12am start
  const getTimeRangeStyle = (timeRange) => {
    const hourHeight = 60; // 60px per hour
    // Calculate starting position (adjust for 12 AM start)
    const startOffset = (timeRange.startHour + timeRange.startMinute / 60) * hourHeight;
    // Calculate height based on duration
    const rangeHeight = ((timeRange.endHour - timeRange.startHour) + (timeRange.endMinute - timeRange.startMinute) / 60) * hourHeight;
    
    return {
      top: `${startOffset}px`,
      height: `${rangeHeight}px`,
      backgroundColor: getAdminColor(timeRange.adminId),
      position: 'absolute',
      left: '0',
      right: '0',
      zIndex: 1,
      cursor: 'pointer',
      opacity: 0.8,
      borderRadius: '8px',
      border: '1px solid #000'
    };
  };
  
  // Click handler for time slots
  const handleTimeRangeClick = (e, day, timeRange, dayIndex) => {
    e.stopPropagation();
    
    // Calculate start time from click position
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const hourHeight = 60;
    
    // Calculate hour based on click position
    const clickHour = clickY / hourHeight; // Updated to start from 0 (12 AM)
    const hour = Math.floor(clickHour);
    const minute = Math.floor((clickHour - hour) * 60);
    
    // Calculate end time
    const endHour = hour + Math.floor(SELECTED_SLOT_DURATION / 60);
    const endMinute = minute + (SELECTED_SLOT_DURATION % 60);
    
    // Calculate positions for validation
    const timeRangeTop = parseFloat(getTimeRangeStyle(timeRange).top);
    const startPosition = timeRangeTop + clickY;
    const endPosition = startPosition + (SELECTED_SLOT_DURATION / 60) * hourHeight;
    
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
      startTime: startTime,
      endTime: endTime,
      verticalPosition: startPosition,
      hour: hour,
      minute: minute,
      endPosition: endPosition // Store end position for validation
    };
    
    // Add the new slot to the existing slots
    setSelectedSlots([...selectedSlots, newSlot]);
    
    // Increment the slot ID for the next slot
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
    e.stopPropagation(); // Stop event propagation to prevent triggering parent onClick handlers
    setSelectedSlots(selectedSlots.filter(slot => slot.id !== slotId));
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
  const [draggedSlot, setDraggedSlot] = useState(null); 
  const gridContainerRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

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
          
          // Calculate end time (adding the fixed duration)
          const endHour = hour + Math.floor(SELECTED_SLOT_DURATION / 60);
          const endMinute = minute + (SELECTED_SLOT_DURATION % 60);
          
          // Calculate end position for validation
          const endPosition = newPosition + (SELECTED_SLOT_DURATION / 60) * 60;
          
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
        // Calculate end position based on the slot duration
        const endPosition = slot.verticalPosition + (SELECTED_SLOT_DURATION / 60) * 60;
        
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
        }
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
                    {dayTimeRanges.map((timeRange, rangeIndex) => (
                      <div 
                        key={`range-${rangeIndex}`} 
                        onClick={(e) => handleTimeRangeClick(e, actualDayIndex, timeRange, dayIndex)}
                        style={{
                          ...getTimeRangeStyle(timeRange),
                          pointerEvents: 'auto' // Enable clicks on this element
                        }}
                      />
                    ))}
                    
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
                          cursor: 'grab', // Show grab cursor to indicate draggable
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
      {/* Error Toast */}
      {showError && (
        <div 
          className="position-fixed bottom-0 start-50 translate-middle-x mb-4 p-3 bg-danger text-white rounded shadow"
          style={{ zIndex: 1050, minWidth: '250px', textAlign: 'center' }}
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default Availability;