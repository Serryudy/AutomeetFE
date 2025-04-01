import React, { useEffect, useRef, useState } from 'react';

const WeeklyCalendar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [visibleDays, setVisibleDays] = useState(7);
  const [startDayIndex, setStartDayIndex] = useState(0);
  const [timeZone, setTimeZone] = useState('');
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDay = now.getDay();
  
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
  
  // Generate time slots from 6:00 AM to 5:00 AM (24-hour format)
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = (i + 6) % 24; // Start from 6 AM and cycle back
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
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
  
  // Dummy events data
  const events = [
    { title: 'Basic terms Meeting', day: 1, startHour: 10, startMinute: 0, endHour: 11, endMinute: 45, color: '#ffb3b3' },
    { title: 'SRS stat Meeting', day: 1, startHour: 14, startMinute: 0, endHour: 20, endMinute: 0, color: '#b3e0ff' },
    { title: 'Team Standup', day: 2, startHour: 9, startMinute: 30, endHour: 10, endMinute: 0, color: '#b3ffb3' },
    { title: 'Client Call', day: 2, startHour: 15, startMinute: 0, endHour: 16, endMinute: 0, color: '#ffdf80' },
    { title: 'Code Review Session', day: 3, startHour: 11, startMinute: 0, endHour: 12, endMinute: 30, color: '#d9b3ff' },
    { title: 'Sprint Planning', day: 3, startHour: 14, startMinute: 30, endHour: 16, endMinute: 0, color: '#ff9999' },
    { title: 'Design Review', day: 4, startHour: 10, startMinute: 0, endHour: 11, endMinute: 30, color: '#80ccff' },
    { title: 'Backend Sync-up', day: 4, startHour: 13, startMinute: 0, endHour: 14, endMinute: 0, color: '#99ff99' },
    { title: 'Product Demo', day: 5, startHour: 16, startMinute: 0, endHour: 17, endMinute: 0, color: '#ffcc99' },
    { title: 'Retrospective Meeting', day: 5, startHour: 17, startMinute: 30, endHour: 18, endMinute: 30, color: '#ff8080' }
  ];

  // Function to calculate event position
  const getEventStyle = (event) => {
    const hourHeight = 60; // 60px per hour
    const startOffset = ((event.startHour + event.startMinute / 60) - 6) * hourHeight; // Adjust for 6 AM start
    const eventHeight = ((event.endHour - event.startHour) + (event.endMinute - event.startMinute) / 60) * hourHeight;
    
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
      zIndex: 2
    };
  };

  // Current time indicator
  const currentTimePosition = ((currentHour + currentMinute / 60) - 6) * 60; // Adjust for 6 AM start

  // Scroll to current time on load
  const calendarRef = useRef(null);
  const gridContainerRef = useRef(null);
  
  useEffect(() => {
    if (calendarRef.current) {
      // Scroll to current time (with some offset) if it's between 6 AM and 5 AM next day
      if (currentHour >= 6 && currentHour <= 23) {
        calendarRef.current.scrollTop = currentTimePosition - 100;
      } else {
        calendarRef.current.scrollTop = 0; // Default to 6 AM
      }
    }
  }, [currentTimePosition]);

  // Define column sizes consistently for headers and content
  const timeColumnWidth = isMobile ? '40px' : '60px';
  const dayColumnWidth = isMobile ? '60px' : '100px';

  // Determine if navigation is needed
  const navigationNeeded = visibleDays < 7;

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
                      {day} {date.getDate()}
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
                        
                        // Get events that start in this cell
                        const cellEvents = events.filter(event => 
                          event.day === actualDayIndex && 
                          Math.floor(event.startHour) === ((timeIndex + 6) % 24)
                        );
                        
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
                          >
                            {/* Cell Content */}
                            {cellEvents.map((event, eventIndex) => (
                              <div key={eventIndex} className="event" style={getEventStyle(event)}>
                                <div className="fw-bold text-truncate">{event.title}</div>
                                {!isMobile && (
                                  <div className="text-truncate">
                                    {`${event.startHour}:${event.startMinute.toString().padStart(2, '0')} - 
                                      ${event.endHour}:${event.endMinute.toString().padStart(2, '0')}`}
                                  </div>
                                )}
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Current Time Indicator */}
              {(currentHour >= 6 || currentHour < 6) && (
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
    </div>
  );
};

export default WeeklyCalendar;