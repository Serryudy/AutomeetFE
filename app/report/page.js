'use client';

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/global.css';
import SidebarMenu from '../../components/SideMenucollapse';
import ProfileHeader from '@/components/profileHeader';
import { FaBars } from 'react-icons/fa';


const MeetingReport = () => {
    return (
      <div className="bg-transparent rounded-3 p-4" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="text-center mb-2">
          <h1 className="fw-bold mb-1">MEETING REPORT</h1>
          <p className="text-muted mb-3">Example meeting name</p>
        </div>
        
        <hr className="border-primary border-2 my-3" />
        
        <div className="row mb-4">
          <div className="col-md-3 fw-bold">Date</div>
          <div className="col-md-9">12/23/2024</div>
        </div>
        
        <div className="row mb-4">
          <div className="col-md-3 fw-bold">Time</div>
          <div className="col-md-9">12.45pm</div>
        </div>
        
        <div className="row mb-4">
          <div className="col-md-3 fw-bold">Location</div>
          <div className="col-md-9">
            <a href="#" className="text-primary text-decoration-none">Zoom</a>
          </div>
        </div>
        
        <hr className="border-primary border-2 my-3" />
        
        <div className="mb-4">
          <h2 className="h5 fw-bold mb-3">Meeting Overview</h2>
          <p className="mb-2">Purpose of the Meeting: To align cross-functional teams on the project milestones for Q2.</p>
          <p className="mb-2">Agenda:</p>
          <ul className="mb-3">
            <li>Review Q1 progress.</li>
            <li>Finalize deliverables for Q2.</li>
            <li>Assign responsibilities for upcoming tasks.</li>
          </ul>
          <p>Participants Contributed: 12 out of 15 attendees actively participated.</p>
        </div>
        
        <div className="mb-4">
          <h2 className="h5 fw-bold mb-3">Meeting Minutes</h2>
          <p className="mb-2">Opening Remarks:</p>
          <ul className="mb-3">
            <li>Discussed the progress achieved in Q1.</li>
            <li>Highlighted key successes and challenges.</li>
          </ul>
          
          <p className="mb-2">Agenda Discussion:</p>
          <ul className="mb-3">
            <li>Finalized three major deliverables for Q2.</li>
            <li>Set tentative deadlines for each deliverable.</li>
          </ul>
          
          <p className="mb-2">Task Assignments:</p>
          <ul className="mb-3">
            <li>Delegated responsibilities to team leads for specific tasks.</li>
          </ul>
          
          <p className="mb-2">Actionable Items:</p>
          <ul className="mb-3">
            <li>Prepare a detailed timeline for Q2 deliverables.</li>
            <li>Follow up on unresolved Q1 issues in the next meeting.</li>
          </ul>
        </div>
        
        <div className="mb-4">
          <h2 className="h5 fw-bold mb-3">Agenda Coverage</h2>
          <ul className="mb-3">
            <li>Covered: 90% of the planned agenda was discussed.</li>
            <li>Uncovered Topics: Resource allocation for Deliverable 3 was postponed due to time constraints.</li>
          </ul>
        </div>
        
        <div className="mb-4">
          <h2 className="h5 fw-bold mb-3">Key Decisions</h2>
          <ul className="mb-3">
            <li>Approved the updated project timeline for Q2.</li>
            <li>Decided to onboard additional resources for deliverable 2.</li>
            <li>Scheduled the next meeting to finalize resource allocation.</li>
          </ul>
        </div>
        
        <div className="mb-4">
          <h2 className="h5 fw-bold mb-3">Action Plan</h2>
          <ul className="mb-3">
            <li>Schedule a follow-up meeting to resolve resource and budget issues.</li>
            <li>Distribute the finalized project timeline by the end of the week.</li>
            <li>Gather additional feedback on participant concerns for improvement.</li>
          </ul>
        </div>
        
        <div className="text-end mt-4">
          <button className="btn btn-primary px-4">Download</button>
        </div>
      </div>
    );
};

export default function Content() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setShowMobileMenu(false);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };



  return (
    <div className="d-flex page-background font-inter" style={{ minHeight: '100vh' }}>  
      {/* Mobile Menu Button */}
      {isMobile && (
        <button 
          className="btn btn-light position-fixed rounded-circle p-2"
          style={{ zIndex: 1001, top: '1rem', left: '1rem' }}
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <FaBars size={20} />
        </button>
      )}

      {/* Sidebar Menu */}
      <div 
        style={{ 
          position: 'fixed', 
          left: 10, 
          top: 10, 
          bottom: 0, 
          zIndex: 1000,
          transform: isMobile ? `translateX(${showMobileMenu ? '0' : '-100%'})` : 'none',
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        <SidebarMenu 
          showmenuicon={true} 
          onToggle={handleSidebarToggle}
        />
      </div>

      {/* Mobile Overlay */}
      {isMobile && showMobileMenu && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 999,
            transition: 'opacity 0.3s'
          }}
          onClick={() => setShowMobileMenu(false)}
        ></div>
      )}

      {/* Main content */}
      <div 
        className="flex-grow-1 p-3 p-md-4"
        style={{
          marginLeft: isMobile ? 0 : (isSidebarCollapsed ? '90px' : '340px'),
          maxWidth: isMobile ? '100%' : (isSidebarCollapsed ? 'calc(100% - 120px)' : 'calc(100% - 360px)'),
          transition: 'margin-left 0.3s ease-in-out, max-width 0.3s ease-in-out'
        }}
      >
        {/* Profile Header */}
        <div className="mb-3 mb-md-4">
          <ProfileHeader />
        </div>

        {/* Content Header */}
        <div className="mb-3 mb-md-4">
          <h2 className="mb-1 mb-md-2 font-inter fw-bold">Meeting Report</h2>
          <p className="text-muted small">
            Turn meeting data into meaningful reports.
          </p>
        </div>
        
        <div className='w-100 rounded-3 bg-light p-3 p-md-4'>
            {/* Content */}
            <MeetingReport />
        </div>
      </div>
    </div>
  );
}