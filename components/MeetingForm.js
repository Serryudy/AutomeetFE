import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaRegCopy } from 'react-icons/fa';
import { BsCameraVideo } from 'react-icons/bs';

const MeetingForm = ({ meetingId }) => {
  const [meetingData, setMeetingData] = useState(null);
  const [userProfiles, setUserProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch meeting data
  useEffect(() => {
    const fetchMeetingData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/meetings/externally/${meetingId}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch meeting details');
        }

        const data = await response.json();
        setMeetingData(data);

        // Fetch profiles for creator and participants
        await fetchUserProfile(data.createdBy);
        if (data.participants) {
          await Promise.all(data.participants.map(p => fetchUserProfile(p.username)));
        }
        // Fetch host profiles if they exist
        if (data.hosts) {
          await Promise.all(data.hosts.map(host => fetchUserProfile(host)));
        }

        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    if (meetingId) {
      fetchMeetingData();
    }
  }, [meetingId]);

  // Function to fetch user profile
  const fetchUserProfile = async (username) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${username}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userData = await response.json();
      setUserProfiles(prev => ({
        ...prev,
        [username]: userData
      }));
    } catch (error) {
      console.error(`Error fetching profile for ${username}:`, error);
    }
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    // Optionally add a toast/notification to show copy success
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
      <div className="spinner-border text-primary" role="status">
      </div>
    </div>
  );
  if (error) return <div>Error: {error}</div>;
  if (!meetingData) return <div>No meeting data found</div>;

  return (
    <div className="rounded-4 shadow p-4 p-md-5" style={{ backgroundColor: '#F5F5F5' }}>
      {/* Meeting Title Section */}
      <div className="mb-4">
        <h1 className="h3 mb-1">{meetingData.title}</h1>
      </div>

      {/* Participants Section */}
      <div className="mb-4">
        <h2 className="h6 mb-2">Participants</h2>
        <div className="d-flex flex-wrap gap-4 mb-2 bg-white rounded-4 p-3 shadow-lg">
          {meetingData.participants && meetingData.participants.map((participant, index) => {
            const profile = userProfiles[participant.username];
            return (
              <div key={index} className="d-flex align-items-center">
                <div className="me-2">
                  <div className="rounded-circle overflow-hidden" style={{ width: '40px', height: '40px' }}>
                    <img
                      src={profile?.profile_pic || '/profile.png'}
                      alt={profile?.name || participant.username}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                </div>
                <div>
                  <div className="small fw-medium">{profile?.name || participant.username}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {profile?.company || 'Group name if any'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Admins/Hosts Section */}
      <div className="mb-5">
        <h2 className="h6 mb-2">Admins</h2>
        <div className="d-flex flex-wrap gap-4 mb-2 bg-white rounded-4 p-3 shadow-lg">
          {[meetingData.createdBy, ...(meetingData.hosts || [])].map((username, index) => {
            const profile = userProfiles[username];
            return (
              <div key={index} className="d-flex align-items-center">
                <div className="me-2">
                  <div className="rounded-circle overflow-hidden" style={{ width: '40px', height: '40px' }}>
                    <img
                      src={profile?.profile_pic || '/default-avatar.png'}
                      alt={profile?.name || username}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                </div>
                <div>
                  <div className="small fw-medium">{profile?.name || username}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {profile?.company || 'Group name if any'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Description Section */}
      <div className="mb-4">
        <h2 className="h6 mb-3">Description</h2>
        <div className='bg-white rounded-4 p-3'>
          <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
            {meetingData.description}
          </p>
        </div>
      </div>

      {/* Location Section */}
      <div className="mb-4">
        <h2 className="h6 mb-3">Location</h2>
        <div className="d-flex align-items-center bg-light rounded-4 p-3">
          <div className="d-flex align-items-center flex-grow-1">
            <img src="/zoom.png" alt="Location Icon" className="me-3" style={{ width: '24px', height: '24px' }} />
            <div className="text-muted bg-white rounded-4 small me-3 flex-grow-1">
              {meetingData.location}
            </div>
            <button 
              className="btn btn-link text-dark p-0"
              onClick={() => handleCopyLink(meetingData.location)}
            >
              <FaRegCopy size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-end gap-3">
        <button className="btn btn-primary px-4">
          Upload Document
        </button>
        <button className="btn btn-primary px-4">
          Take Notes
        </button>
      </div>
    </div>
  );
};

export default MeetingForm;