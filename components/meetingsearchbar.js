import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaFilter, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock, FaTag, FaExclamationCircle } from 'react-icons/fa';

const SearchBar = ({ 
  onSearch, 
  onFilter,
  onSelectMeeting,
  onSearchResult,
  onSearchStart,
  onSearchError,
  activeTab,
  placeholder,
  className,
  context = 'meetings' // 'meetings' or 'availability' or 'analytics'
}) => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);
  const searchTimeout = useRef(null);
  const initialFetchDone = useRef(false);

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

  // Initial fetch of all meetings when component mounts
  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchAllMeetings();
      initialFetchDone.current = true;
    }
  }, []);

  // Refetch meetings when active tab changes
  useEffect(() => {
    if (initialFetchDone.current && activeTab) {
      fetchAllMeetings();
    }
  }, [activeTab]);

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

  // Filter meetings based on search term - this function searches through all meeting properties
  const filterMeetingsBySearchTerm = (meetings, searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) return meetings;
    
    const term = searchTerm.toLowerCase().trim();
    
    return meetings.filter(meeting => {
      // Check in common text fields
      if (meeting.title && meeting.title.toLowerCase().includes(term)) return true;
      if (meeting.description && meeting.description.toLowerCase().includes(term)) return true;
      if (meeting.location && meeting.location.toLowerCase().includes(term)) return true;
      if (meeting.status && meeting.status.toLowerCase().includes(term)) return true;
      if (meeting.meetingType && meeting.meetingType.toLowerCase().includes(term)) return true;
      if (meeting.repeat && meeting.repeat.toLowerCase().includes(term)) return true;
      if (meeting.role && meeting.role.toLowerCase().includes(term)) return true;
      
      // Check createdBy email
      if (meeting.createdBy && meeting.createdBy.toLowerCase().includes(term)) return true;
      
      // Check in directTimeSlot dates
      if (meeting.directTimeSlot) {
        const startDate = new Date(meeting.directTimeSlot.startTime);
        const endDate = new Date(meeting.directTimeSlot.endTime);
        
        // Format date as string and check
        const startDateStr = startDate.toLocaleDateString();
        const endDateStr = endDate.toLocaleDateString();
        const startTimeStr = startDate.toLocaleTimeString();
        const endTimeStr = endDate.toLocaleTimeString();
        
        if (startDateStr.toLowerCase().includes(term)) return true;
        if (endDateStr.toLowerCase().includes(term)) return true;
        if (startTimeStr.toLowerCase().includes(term)) return true;
        if (endTimeStr.toLowerCase().includes(term)) return true;
      }
      
      // Check in participants
      if (meeting.participants && meeting.participants.length > 0) {
        for (const participant of meeting.participants) {
          if (participant.username && participant.username.toLowerCase().includes(term)) return true;
          if (participant.access && participant.access.toLowerCase().includes(term)) return true;
        }
      }
      
      // Check meeting ID (useful for direct links)
      if (meeting.id && meeting.id.toLowerCase().includes(term)) return true;
      
      return false;
    });
  };

  // Search API call with debounce
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // If search term is empty, return to showing all meetings
    if (!searchTerm.trim()) {
      if (initialFetchDone.current) {
        fetchAllMeetings();
      }
      setShowDropdown(false);
      return;
    }

    // Set new timeout for filtering
    searchTimeout.current = setTimeout(() => {
      // Check if meetings are already loaded
      if (meetings.length > 0) {
        // Filter meetings locally
        const filtered = filterMeetingsBySearchTerm(meetings, searchTerm);
        setFilteredMeetings(filtered.slice(0, 5)); // Show top 5 in dropdown
        setShowDropdown(true);
        
        // Also update the parent component with filtered results
        if (onSearchResult) onSearchResult(filtered);
      } else {
        // Fetch meetings if not already loaded
        searchMeetings(searchTerm);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm, meetings]);

  const fetchAllMeetings = async () => {
    try {
      setIsLoading(true);
      if (onSearchStart) onSearchStart();
      
      // Call the meetings API
      const response = await fetch('http://localhost:8080/api/meetings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This ensures cookies are sent with the request
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching meetings: ${response.status}`);
      }
      
      const data = await response.json();
      // Check if data is an array, if not, create an empty array or extract from the response
      const meetingsArray = Array.isArray(data) ? data : (data.meetings || []);
      
      setMeetings(meetingsArray);
      setFilteredMeetings(meetingsArray.length > 5 ? meetingsArray.slice(0, 5) : meetingsArray); // Show top 5 in dropdown
      
      // Pass data to parent component
      if (onSearchResult) onSearchResult(meetingsArray);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError(err.message);
      
      // Pass error to parent component
      if (onSearchError) onSearchError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const searchMeetings = async (query) => {
    if (!query || query.trim().length < 2) return;
    
    setIsLoading(true);
    if (onSearchStart) onSearchStart();
    setError(null);
    
    try {
      // API endpoint for searching
      const response = await fetch(`http://localhost:8080/api/meetings/search?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This ensures cookies are sent with the request
      });
      
      if (!response.ok) {
        throw new Error(`Error searching meetings: ${response.status}`);
      }
      
      const data = await response.json();
      // Check if data is an array, if not, create an empty array or extract from the response
      const meetingsArray = Array.isArray(data) ? data : (data.meetings || []);
      
      // Filter the meetings based on all properties
      const filteredResults = filterMeetingsBySearchTerm(meetingsArray, query);
      
      setMeetings(filteredResults);
      setFilteredMeetings(filteredResults.length > 5 ? filteredResults.slice(0, 5) : filteredResults); // Show top 5 in dropdown
      setShowDropdown(true);
      
      // Pass search results to parent component
      if (onSearchResult) onSearchResult(filteredResults);
    } catch (err) {
      console.error('Error searching meetings:', err);
      setError(err.message);
      
      // Pass error to parent component
      if (onSearchError) onSearchError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (onSearch) {
      onSearch(value);
    }
    
    // For empty input, close dropdown
    if (!value.trim()) {
      setShowDropdown(false);
    }
  };

  const handleSelectMeeting = (meeting) => {
    // Only call the parent handler and let it decide what to do with the selected meeting
    if (onSelectMeeting) {
      onSelectMeeting(meeting);
    }
    
    // Clear search and close dropdown
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
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getMeetingTypeLabel = (type) => {
    switch(type?.toLowerCase()) {
      case 'direct': return 'Direct Meeting';
      case 'group': return 'Group Meeting';
      case 'round_robin': return 'Round Robin';
      default: return type || 'Unknown Type';
    }
  };

  const getMeetingStatusBadgeClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed': return 'bg-success';
      case 'pending': return 'bg-warning text-dark';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
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
    } else if (context === 'analytics') {
      return windowWidth < 576
        ? "Search meetings..."
        : "Search for meetings to analyze...";
    } else {
      return windowWidth < 576 
        ? "Search meetings..." 
        : "Try searching anything related to meetings";
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
            onClick={() => meetings.length > 0 && setShowDropdown(true)}
          />
          {/* <button 
            className="btn btn-light rounded-pill d-flex align-items-center gap-2 px-2 px-md-3"
            onClick={handleFilterClick}
          >
            
          </button>
        </div>
        
        {/* Search Results Dropdown */}
        {showDropdown && (
          <div className="position-absolute start-0 end-0 mt-1 bg-white rounded-3 shadow-lg z-20 overflow-hidden" 
               style={{ maxHeight: '350px', overflowY: 'auto', zIndex: 1000 }}>
            {isLoading ? (
              <div className="p-3 text-center">
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Searching...
              </div>
            ) : error ? (
              <div className="p-3 text-center text-danger">
                <FaExclamationCircle className="me-2" />
                Error: {error}
              </div>
            ) : filteredMeetings.length > 0 ? (
              <ul className="list-group list-group-flush">
                {filteredMeetings.map(meeting => (
                  <li 
                    key={meeting.id} 
                    className="list-group-item list-group-item-action p-3 cursor-pointer hover-bg-light"
                    onClick={() => handleSelectMeeting(meeting)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="fw-bold">{meeting.title || 'Untitled Meeting'}</div>
                        <span className={`badge ${getMeetingStatusBadgeClass(meeting.status)} ms-2`}>
                          {meeting.status || 'Unknown'}
                        </span>
                      </div>
                      
                      {meeting.description && (
                        <div className="small text-muted mb-1 text-truncate">
                          {meeting.description}
                        </div>
                      )}
                      
                      <div className="d-flex flex-wrap gap-2 mt-1">
                        {meeting.directTimeSlot && (
                          <span className="small d-flex align-items-center">
                            <FaCalendarAlt className="me-1 text-primary" size={12} />
                            {formatDate(meeting.directTimeSlot.startTime)}
                          </span>
                        )}
                        
                        {meeting.location && (
                          <span className="small d-flex align-items-center">
                            <FaMapMarkerAlt className="me-1 text-danger" size={12} />
                            {meeting.location}
                          </span>
                        )}
                        
                        {meeting.meetingType && (
                          <span className="small d-flex align-items-center">
                            <FaTag className="me-1 text-success" size={12} />
                            {getMeetingTypeLabel(meeting.meetingType)}
                          </span>
                        )}
                        
                        {context === 'availability' && (
                          <span className="small d-flex align-items-center">
                            <FaClock className="me-1 text-success" size={12} />
                            Availability: {getAvailabilityStatus(meeting)}
                          </span>
                        )}
                        
                        {meeting.participants && (
                          <span className="small d-flex align-items-center">
                            <FaUsers className="me-1 text-success" size={12} />
                            {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
                {meetings.length > 5 && (
                  <li className="list-group-item text-center text-primary">
                    {meetings.length - 5} more meetings found. Refine your search to see specific results.
                  </li>
                )}
              </ul>
            ) : searchTerm.trim().length >= 2 ? (
              <div className="p-3 text-center text-muted">
                No meetings found matching "{searchTerm}"
              </div>
            ) : (
              <div className="p-3 text-center text-muted">
                {searchTerm.trim() ? "Type at least 2 characters to search" : "Recent meetings"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;