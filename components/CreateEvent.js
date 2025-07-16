'use client';
import React, { useState, useEffect, useRef } from 'react';
import {  FaCalendarAlt,FaUsers } from 'react-icons/fa';
import { RiMovie2Line } from 'react-icons/ri';
import DirectScheduleForm from './Directmeeting';

import 'react-datepicker/dist/react-datepicker.css';
import GroupMeetingForm from './groupmeeting';
import RoundRobinForm from './Roundrobinmeeting';

// Complete CreateEvent component
const CreateEvent = () => {
  const [selectedType, setSelectedType] = useState('direct');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < 768);
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

    const meetingTypes = [
    {
      id: 'direct',
      title: 'Direct scheduling',
      description: "A single meeting between two individuals, ideal for one-on-one discussions, quick check-ins, or interviews.",
      icon: <FaCalendarAlt size={isMobile ? 20 : 24} />,
      color: '#6366F1'
    },
    {
      id: 'group',
      title: 'Group',
      description: 'A meeting involving multiple participants, suitable for team meetings, brainstorming sessions, or workshops.',
      icon: <FaUsers size={isMobile ? 20 : 24} />,
      color: '#2D31A6'
    },
    {
      id: 'round-robin',
      title: 'Round robin',
      description: 'Sequential one-on-one meetings where each participant takes turns, commonly used for interviews, support calls, or customer appointments.',
      icon: <RiMovie2Line size={isMobile ? 20 : 24} />,
      color: '#2D31A6'
    }
  ];
    
  
 


  const renderForm = () => {
    switch (selectedType) {
      case 'direct': return <DirectScheduleForm />;
      case 'group': return <GroupMeetingForm />;
      case 'round-robin': return <RoundRobinForm />;
      default: return <DirectScheduleForm />;
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="card my-3" style={{ 
        maxWidth: '1000px',
        height: isMobile ? 'auto' : '600px',
        borderRadius: '16px', 
        overflow: 'hidden', 
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }}>
        {isMobile ? (
          // Mobile Layout (Column)
          <div className="d-flex flex-column">
            {/* Mobile Options Bar */}
            <div className="w-100 d-flex justify-content-between px-2 py-3" style={{ 
              backgroundColor: '#2D31A6',
              background: 'linear-gradient(135deg, #2D31A6 0%, #6366F1 100%)'
            }}>
              {meetingTypes.map((type) => (
                <div 
                  key={type.id}
                  className="p-2 text-center"
                  onClick={() => setSelectedType(type.id)}
                  style={{ 
                    backgroundColor: type.id === selectedType ? 'rgba(255,255,255,0.1)' : 'transparent', 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    borderRadius: '8px',
                    flex: '1 1 auto',
                    margin: '0 3px'
                  }}
                >
                  <div className="d-flex flex-column align-items-center text-white">
                    <div className="icon-container mb-1">{type.icon}</div>
                    <h6 className="mb-0 text-white" style={{ fontSize: '0.8rem' }}>{type.title}</h6>
                  </div>
                </div>
              ))}
            </div>
            {/* Mobile Form */}
            <div style={{ padding: '20px', height: '500px', overflow: 'auto' }}>
              <div className="overflow-auto py-2">
                {renderForm()}
              </div>
            </div>
          </div>
        ) : (
          // Desktop Layout (Row)
          <div className="row g-0 h-100">
            {/* Left Sidebar */}
            <div className="col-lg-5 col-md-5 d-flex flex-column py-3" style={{ 
              backgroundColor: '#2D31A6',
              background: 'linear-gradient(135deg, #2D31A6 0%, #6366F1 100%)',
            }}>
              <div className="d-flex flex-column py-3 w-100">
                {meetingTypes.map((type) => (
                  <div 
                    key={type.id}
                    className="p-3 p-md-4 my-2"
                    onClick={() => setSelectedType(type.id)}
                    style={{ 
                      backgroundColor: type.id === selectedType ? 'rgba(255,255,255,0.1)' : 'transparent', 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      borderRadius: '8px'
                    }}
                  >
                    <div className='hover-effect ps-2 ps-md-3'>
                      <div className="d-flex align-items-center mb-2 text-white">
                        <div className="icon-container">{type.icon}</div>
                        <h5 className="ms-2 ms-md-3 mb-0 fs-6 fs-md-5">{type.title}</h5>
                      </div>
                      <p className="text-white small mb-0 opacity-75">
                        {type.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Form Area */}
            <div className="col-lg-7 col-md-7" style={{ 
              backgroundColor: 'transparent',
              height: '90%',
              overflowY: 'auto',
              padding: '50px',
            }}>
              {renderForm()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEvent;

