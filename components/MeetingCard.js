import React, { useState, useEffect } from 'react';
import { FaClock, FaPencilAlt } from 'react-icons/fa';
import Link from 'next/link';

const MeetingCard = ({ meeting }) => {
  const [participantProfiles, setParticipantProfiles] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const [progress, setProgress] = useState(0);

  // Fetch participant profile information
  useEffect(() => {
    const fetchParticipantProfiles = async () => {
      if (!meeting || !meeting.participants || !meeting.participants.length) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Fetch all participant profiles
        const profiles = {};
        
        // Only get up to 3 participants to display
        const participantsToFetch = meeting.participants.slice(0, 3);
        
        for (const participant of participantsToFetch) {
          const username = participant.username;
          
          // Skip if we already have this participant's profile
          if (profiles[username]) continue;
          
          try {
            const response = await fetch(`http://localhost:8080/api/users/${username}`, {
              credentials: 'include',
            });
            
            if (response.ok) {
              const data = await response.json();
              profiles[username] = {
                name: data.name,
                profile_pic: data.profile_pic || '',
              };
            }
          } catch (err) {
            console.error(`Error fetching profile for ${username}:`, err);
          }
        }
        
        setParticipantProfiles(profiles);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch participant profiles:', error);
        setIsLoading(false);
      }
    };
    
    fetchParticipantProfiles();
  }, [meeting]);

  // Calculate time remaining and progress
  useEffect(() => {
    if (!meeting || !meeting.directTimeSlot) return;
    
    const calculateTimeLeft = () => {
      // Get start time from the meeting
      const startTime = new Date(meeting.directTimeSlot.startTime);
      const currentTime = new Date();
      
      // If meeting has already started
      if (currentTime >= startTime) {
        setTimeLeft('In progress');
        setProgress(100);
        return;
      }
      
      // Calculate time difference
      const diffMs = startTime - currentTime;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      // Create display text
      let timeDisplay = '';
      if (diffDays > 0) {
        timeDisplay = `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
      } else if (diffHours > 0) {
        timeDisplay = `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
      } else {
        timeDisplay = `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
      }
      
      setTimeLeft(timeDisplay);
      
      // Calculate progress percentage (inverted - 100% means meeting is about to start)
      // We'll use a 24-hour window for the progress bar
      const totalMsInWindow = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const msUntilStart = diffMs;
      
      // Invert the percentage: 100% when the meeting is about to start
      let progressPercent = 100 - ((msUntilStart / totalMsInWindow) * 100);
      
      // Clamp between 5% and 100%
      progressPercent = Math.min(100, Math.max(5, progressPercent));
      
      setProgress(progressPercent);
    };
    
    // Calculate immediately and set an interval
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, [meeting]);

  // Ensure meeting data exists
  if (!meeting) {
    return <div>No meeting data available</div>;
  }
  
  // Extract relevant information from the meeting object
  const {
    id,
    title,
    location,
    meetingType,
    description,
    createdBy,
    repeat,
    groupDuration,
    participants = []
  } = meeting;

  // Calculate additional display information
  const timeInfo = `${groupDuration || 60} mins`;
  const participantCount = participants.length;
  const pendingCount = participants.filter(p => p.access === "pending").length;
  
  // Get up to 3 participants to display
  const displayProfiles = participants.slice(0, 3);
  const additionalParticipants = Math.max(0, participantCount - 3);
  
  // Determine default profile image
  const defaultProfileImg = "/profile.png";
  
  // Define background colors based on meeting type
  const getBackgroundColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'direct':
        return '#E3F2FD'; // Light blue
      case 'group':
        return '#E8F5E9'; // Light green
      case 'round_robin':
        return '#FFF3E0'; // Light orange
      default:
        return '#F5F5F5'; // Light gray
    }
  };

  const backgroundColor = getBackgroundColor(meetingType);
  
  // Truncate description to 50 characters
  const truncateDescription = (text) => {
    if (!text) return `${meetingType} meeting at ${location}`;
    return text.length > 50 ? text.substring(0, 50) + '...' : text;
  };
  
  const displayDescription = truncateDescription(description);
  
  // Determine time display
  let displayTime = timeLeft;
  let statusText = 'Starts in';
  
  if (!displayTime) {
    // Try to get time from meeting data if available
    if (meeting) {
      if (meeting.meetingType === 'direct' && meeting.directTimeSlot) {
        // For direct meetings with a time slot
        const startTime = new Date(meeting.directTimeSlot.startTime);
        const now = new Date();
        
        if (now >= startTime) {
          displayTime = 'In progress';
          statusText = '';
        } else {
          // Calculate rough estimate
          const diffMs = startTime - now;
          if (diffMs < 3600000) { // Less than an hour
            displayTime = 'Soon';
          } else if (diffMs < 86400000) { // Less than a day
            displayTime = 'Today';
          } else {
            displayTime = '1+ days';
          }
        }
      } else if (meeting.meetingType === 'group' && meeting.groupDuration) {
        // For group meetings, use duration if no direct time
        displayTime = `${meeting.groupDuration} mins when scheduled`;
        statusText = 'Duration:';
      } else {
        // Default fallback
        displayTime = 'Time not set';
      }
    } else {
      displayTime = 'Time not available';
    }
  }
  
  // Status icon color changes based on progress
  const iconColor = progress > 90 ? '#28a745' : 
                   progress > 70 ? '#FF9800' : 
                   progress > 30 ? '#FFC107' : '#3B3BD7';
  
  return (
    <div className="meeting-card rounded-3 shadow-sm p-2">
      <div className="card-content">
        <div className="d-flex justify-content-start">
          <div className="d-flex align-items-center">
            <span className="fw-bold fs-6 mb-0 me-1">{title}:</span>
            <span className="fs-13 text-black mt-1">{timeInfo}</span>
          </div>
        </div>
        
        <p className="text-secondary fs-7">{displayDescription}</p>
        
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div className="position-relative me-2" style={{ height: "20px", minWidth: `${displayProfiles.length * 15 - 5}px` }}>
              {displayProfiles.map((participant, index) => {
                // Get profile picture from our fetched data, or use default if not available
                const participantProfile = participantProfiles[participant.username];
                const profilePic = participantProfile?.profile_pic || defaultProfileImg;
                
                return (
                  <img
                    key={index}
                    src={profilePic}
                    alt={participantProfile?.name || participant.username}
                    className="rounded-circle position-absolute border border-2 border-white"
                    style={{
                        width: "22px",
                        height: "22px",
                        left: `${index * 16}px`,
                        zIndex: displayProfiles.length - index,
                        objectFit: "cover"
                    }}
                  />
                );
              })}
            </div>
            {additionalParticipants > 0 && (
              <span className="ms-3 fs-9">{additionalParticipants}+ others</span>
            )}
          </div>
        </div>
        
        {/* Time Progress Bar - directly integrated */}
        <div className="mt-2 d-flex align-items-center">
          <FaClock 
            className="text-white p-1 rounded-circle" 
            style={{ 
              width: "16px", 
              height: "16px",
              backgroundColor: iconColor
            }} 
          />
          <span className="ms-2 fs-8">
            {statusText} {displayTime}
          </span>
          <div 
            className="progress ms-3 flex-grow-1" 
            style={{ 
              height: "8px", 
              backgroundColor: "#C4C4C4",
            }}
          >
            <div
              className="progress-bar"
              role="progressbar"
              style={{ 
                width: `${progress}%`, 
                backgroundColor: progress < 30 ? '#3B3BD7' : 
                                progress < 70 ? '#FFC107' : 
                                progress < 100 ? '#FF9800' : '#28a745',
                transition: 'width 1s ease-in-out, background-color 1s ease-in-out'
              }}
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>
        
     <div className="ms-auto d-flex align-items-center justify-content-end w-100 mt-2">
         <Link href={`/meetingdetails/${id}`} className="text-decoration-none">
           <button className="btn btn-primary d-flex align-items-center gap-1" style={{ backgroundColor: "#3B3BD7", border: "none", fontSize: "12px" }}>
            Edit <FaPencilAlt style={{ fontSize: "14px" }} />
         </button>
        </Link>
     </div>

      </div>
      
      <style jsx>{`
        .meeting-card {
          width: 100%;
          border: 1px solid #ccc;
          background-color: ${backgroundColor};
          border-radius: 16px !important;
          aspect-ratio: 16/9;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 10px;
        }
        .card-content {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .progress {
          flex-grow: 1;
        }
      `}</style>
    </div>
  );
};

export default MeetingCard;