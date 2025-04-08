import React from 'react';
import { FaClock, FaPencilAlt } from 'react-icons/fa';
import Link from 'next/link';

const MeetingCard = ({ meeting }) => {
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
  
  // For demonstration - in a real app you would use real profile images
  const displayProfiles = participants.slice(0, 3).map(() => "/profile.png");
  const additionalParticipants = Math.max(0, participantCount - 3);
  
  // Mock progress for display purposes - in a real app this would be calculated
  const progress = 50;
  
  // Mock start time - in a real app this would be calculated
  const startsIn = "1 hour";
  
  // Define background colors based on meeting type
  const getBackgroundColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'direct':
        return '#E3F2FD'; // Light blue
      case 'group':
        return '#E8F5E9'; // Light green
      case 'round_robin':
        return '#FFF3E0'; // Light orange
    }
  };

  const backgroundColor = getBackgroundColor(meetingType);
  
  // Truncate description to 50 characters
  const truncateDescription = (text) => {
    if (!text) return `${meetingType} meeting at ${location}`;
    return text.length > 50 ? text.substring(0, 50) + '...' : text;
  };
  
  const displayDescription = truncateDescription(description);
  
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
              {displayProfiles.map((profile, index) => (
                <img
                  key={index}
                  src={profile}
                  alt={`Participant ${index + 1}`}
                  className="rounded-circle position-absolute border border-2 border-white"
                  style={{
                      width: "22px",
                      height: "22px",
                      left: `${index * 16}px`,
                      zIndex: displayProfiles.length - index,
                      objectFit: "cover"
                  }}
                />
              ))}
            </div>
            {additionalParticipants > 0 && (
              <span className="ms-3 fs-9">{additionalParticipants}+ others</span>
            )}
          </div>
        </div>
        
        <div className="mt-2 d-flex align-items-center">
          <FaClock className="text-white p-1 rounded-circle bg-secondary" style={{ width: "16px", height: "16px" }} />
          <span className="ms-2 fs-8">Starts in {startsIn}</span>
          <div 
            className="progress ms-3 flex-grow-1" 
            style={{ 
              height: "8px", 
              backgroundColor: "#C4C4C4",
            }}
          >
            <div
              className="progress-bar bg-white"
              role="progressbar"
              style={{ width: `${progress}%` }}
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>
        
        <div className="ms-auto d-flex align-items-center justify-content-end w-100 mt-2">
          <Link href={`/meetingdetails/${id}`}>
              <button className="btn btn-primary d-flex align-items-center gap-1" style={{backgroundColor: "#3B3BD7", border: "none", fontSize: "12px"}}>
                Edit <FaPencilAlt style={{fontSize: "14px"}} />
              </button>
          </Link>
        </div>
      </div>
      
      <style jsx>{`
        .meeting-card {
          width: 350px;
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

<<<<<<< HEAD
export default MeetingCard;
=======
export default MeetingCard;
>>>>>>> 141813c8e18e4565549a7cc206213c131bcd2df7
