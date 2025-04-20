import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaFilter, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock } from 'react-icons/fa';

const SearchBar = ({ 
  meetings = [],
  onSearch, 
  onFilter,
  onSelectMeeting,
  placeholder,
  className,
  context = 'meetings' // New prop to specify context ('meetings' or 'availability')
}) => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  useEffect(() => {
    // Handle clicks outside the search component to close dropdown
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Filter meetings based on search term
    if (searchTerm.trim()) {
      const filtered = meetings.filter(meeting => 
        (meeting.title && meeting.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (meeting.description && meeting.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (meeting.location && meeting.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredMeetings(filtered);
      setShowDropdown(true);
    } else {
      setFilteredMeetings([]);
      setShowDropdown(false);
    }
  }, [searchTerm, meetings]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const handleSelectMeeting = (meeting) => {
    if (onSelectMeeting) {
      onSelectMeeting(meeting);
    }
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleFilterClick = () => {
    if (onFilter) {
      onFilter();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const getAvailabilityStatus = (meeting) => {
    // This is a placeholder - you would determine availability status based on your data
    if (!meeting.availabilityStatus) return 'Not set';
    return meeting.availabilityStatus;
  };

  const getDefaultPlaceholder = () => {
    if (context === 'availability') {
      return windowWidth < 576 
        ? "Search meetings..." 
        : "Search for meetings to set availability...";
    } else {
      return windowWidth < 576 
        ? "Search meetings..." 
        : "Try searching anything related to the meeting";
    }
  };

  const defaultPlaceholder = getDefaultPlaceholder();

  return (
    <div ref={searchRef} className={`d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mb-md-4 gap-2 ${className || ''}`}>
      <div className="position-relative w-100">
        <div className="input-group bg-white rounded-pill" style={{ height: windowWidth < 576 ? '40px' : '48px', border: '2px solid #ccc' }}>
          <span className="input-group-text bg-transparent border-0">
            <FaSearch className="text-muted" />
          </span>
          <input 
            type="text" 
            className="form-control border-0" 
            placeholder={placeholder || defaultPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
            onClick={() => searchTerm.trim() && setShowDropdown(true)}
          />
          <button 
            className="btn btn-light rounded-pill d-flex align-items-center gap-2 px-2 px-md-3"
            onClick={handleFilterClick}
          >
            {windowWidth < 576 ? <FaFilter /> : <>Filter <FaFilter /></>}
          </button>
        </div>
        
        {/* Search Results Dropdown */}
        {showDropdown && (
          <div className="position-absolute start-0 end-0 mt-1 bg-white rounded-3 shadow-lg z-20 overflow-hidden" 
               style={{ maxHeight: '350px', overflowY: 'auto', zIndex: 1000 }}>
            {filteredMeetings.length > 0 ? (
              <ul className="list-group list-group-flush">
                {filteredMeetings.map(meeting => (
                  <li 
                    key={meeting.id} 
                    className="list-group-item list-group-item-action p-3 cursor-pointer hover-bg-light"
                    onClick={() => handleSelectMeeting(meeting)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex flex-column">
                      <div className="fw-bold">{meeting.title}</div>
                      {meeting.description && (
                        <div className="small text-muted mb-1 text-truncate">{meeting.description}</div>
                      )}
                      <div className="d-flex flex-wrap gap-2 mt-1">
                        {meeting.startTime && (
                          <span className="small d-flex align-items-center">
                            <FaCalendarAlt className="me-1 text-primary" size={12} />
                            {formatDate(meeting.startTime)}
                          </span>
                        )}
                        {meeting.location && (
                          <span className="small d-flex align-items-center">
                            <FaMapMarkerAlt className="me-1 text-danger" size={12} />
                            {meeting.location}
                          </span>
                        )}
                        {context === 'availability' && (
                          <span className="small d-flex align-items-center">
                            <FaClock className="me-1 text-success" size={12} />
                            Availability: {getAvailabilityStatus(meeting)}
                          </span>
                        )}
                        {meeting.attendees && (
                          <span className="small d-flex align-items-center">
                            <FaUsers className="me-1 text-success" size={12} />
                            {typeof meeting.attendees === 'number' ? 
                              `${meeting.attendees} attendees` : 
                              Array.isArray(meeting.attendees) ? 
                                `${meeting.attendees.length} attendees` : 'Multiple attendees'}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-3 text-center text-muted">
                No meetings found matching "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;