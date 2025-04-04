import React from 'react';
import { FaClock, FaPencilAlt } from 'react-icons/fa';
import Link from 'next/link';

// Mock data for demonstration purposes
const demoMeetings = [
  {
    id: "1",
    name: "Event name:",
    timeInfo: "20/34 80:14",
    description: "Sub description about the meeting.",
    participants: 5,
    startsIn: "2 hours",
    progress: 65,
    profiles: ["/profile.png", "/profile.png", "/profile.png"]
  },
  {
    id: "2",
    name: "Weekly Standup:",
    timeInfo: "10:00 - 11:00",
    description: "Team weekly progress discussion.",
    participants: 8,
    startsIn: "1 hour",
    progress: 35,
    profiles: ["/profile.png", "/profile.png", "/profile.png"]
  },
  {
    id: "3",
    name: "Customer Meeting:",
    timeInfo: "14:30 - 15:30",
    description: "Product demonstration for new clients.",
    participants: 4,
    startsIn: "5 hours",
    progress: 20,
    profiles: ["/profile.png", "/profile.png", "/profile.png"]
  }
];

const MeetingCard = ({ meetingId }) => {
  // Find the meeting data by ID or use the first meeting as default
  const meeting = demoMeetings.find(m => m.id === meetingId) || demoMeetings[0];
  
  return (
    <div className="meeting-card rounded-3 shadow-sm p-2">
      <div className="d-flex justify-content-start">
        <div className="d-flex align-items-center">
          <span className="fw-bold fs-6 mb-0 me-1">{meeting.name}</span>
          <span className="fs-13 text-black mt-1">{meeting.timeInfo}</span>
        </div>
      </div>
      
      <p className="text-secondary fs-7">{meeting.description}</p>
      
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <div className="position-relative me-2" style={{ height: "20px", minWidth: `${meeting.profiles.length * 15 - 5}px` }}>
            {meeting.profiles.map((profile, index) => (
              <img
                key={index}
                src={profile}
                alt={`Participant ${index + 1}`}
                className="rounded-circle position-absolute border border-2 border-white"
                style={{
                    width: "22px",
                    height: "22px",
                    left: `${index * 16}px`,
                    zIndex: meeting.profiles.length - index, // Reverse z-index so first profile appears on top
                    objectFit: "cover"
                }}
              />
            ))}
          </div>
          <span className="ms-3 fs-9">2+ others</span>
        </div>
      </div>
      
      <div className="mt-2 d-flex align-items-center">
        <FaClock className="text-white p-1 rounded-circle bg-secondary" style={{ width: "16px", height: "16px" }} />
        <span className="ms-2 fs-8">Starts in {meeting.startsIn}</span>
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
            style={{ width: `${meeting.progress}%` }}
            aria-valuenow={meeting.progress}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>
      <div className="ms-auto d-flex align-items-center justify-content-end w-100">
        <Link href={`/meetingdetails`}>
            <button className="btn btn-primary d-flex align-items-center gap-1" style={{backgroundColor: "#3B3BD7", border: "none", fontSize: "12px"}}>
              Edit <FaPencilAlt style={{fontSize: "14px"}} />
            </button>
        </Link>
      </div>
      
      <style jsx>{`
        .meeting-card {
          max-width: 500px;
          width: 280px;
          border: 1px solid #ccc;
          background-color: #EAEAEA;
          border-radius: 16px !important;
        }
      `}</style>
    </div>
  );
};

export default MeetingCard;
