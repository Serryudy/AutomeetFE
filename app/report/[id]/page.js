'use client';

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/global.css';
import SidebarMenu from '@/components/SideMenucollapse';
import ProfileHeader from '@/components/profileHeader';
import { FaBars } from 'react-icons/fa';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import jsPDF from 'jspdf';

// Helper function to parse the report text
const parseReport = (reportText) => {
  if (!reportText) return null;
  
  const lines = reportText.split('\n');
  let result = {
    meetingName: '',
    meetingDate: '',
    meetingTime: '',
    location: '',
    purpose: '',
    agenda: [],
    participation: '',
    openingRemarks: [],
    agendaDiscussion: [],
    taskAssignments: [],
    actionItems: [],
    agendaCoverage: '',
    uncoveredTopics: '',
    keyDecisions: [],
    actionPlan: []
  };
  
  let currentSection = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Get meeting name (line after "MEETING REPORT")
    if (line === "MEETING REPORT" && i + 1 < lines.length) {
      result.meetingName = lines[i + 1].trim();
      continue;
    }
    
    // Get date, time, location
    if (line === "Date" && i + 1 < lines.length) {
      result.meetingDate = lines[i + 1].trim();
      continue;
    }
    
    if (line === "Time" && i + 1 < lines.length) {
      result.meetingTime = lines[i + 1].trim();
      continue;
    }
    
    if (line === "Location" && i + 1 < lines.length) {
      result.location = lines[i + 1].trim();
      continue;
    }
    
    // Identify sections
    if (line === "Meeting Overview") {
      currentSection = "overview";
      continue;
    } else if (line === "Meeting Minutes") {
      currentSection = "minutes";
      continue;
    } else if (line === "Opening Remarks:") {
      currentSection = "openingRemarks";
      continue;
    } else if (line === "Agenda Discussion:") {
      currentSection = "agendaDiscussion";
      continue;
    } else if (line === "Task Assignments:") {
      currentSection = "taskAssignments";
      continue;
    } else if (line === "Actionable Items:") {
      currentSection = "actionItems";
      continue;
    } else if (line === "Agenda Coverage") {
      currentSection = "agendaCoverage";
      continue;
    } else if (line === "Key Decisions") {
      currentSection = "keyDecisions";
      continue;
    } else if (line === "Action Plan") {
      currentSection = "actionPlan";
      continue;
    }
    
    // Process lines based on current section
    if (currentSection === "overview") {
      if (line.startsWith("Purpose of the Meeting:")) {
        result.purpose = line.substring("Purpose of the Meeting:".length).trim();
      } else if (line === "Agenda:") {
        // Skip, will catch agenda items in next iterations
      } else if (line.startsWith("* ") && currentSection === "overview") {
        result.agenda.push(line);
      } else if (line.startsWith("Participants Contributed:")) {
        result.participation = line;
      }
    } else if (currentSection === "openingRemarks" && line.startsWith("* ")) {
      result.openingRemarks.push(line);
    } else if (currentSection === "agendaDiscussion" && line.startsWith("* ")) {
      result.agendaDiscussion.push(line);
    } else if (currentSection === "taskAssignments" && line.startsWith("* ")) {
      result.taskAssignments.push(line);
    } else if (currentSection === "actionItems" && line.startsWith("* ")) {
      result.actionItems.push(line);
    } else if (currentSection === "agendaCoverage") {
      if (line.startsWith("* Covered:")) {
        result.agendaCoverage = line.substring("* Covered:".length).trim();
      } else if (line.startsWith("* Uncovered Topics:")) {
        result.uncoveredTopics = line.substring("* Uncovered Topics:".length).trim();
      }
    } else if (currentSection === "keyDecisions" && line.startsWith("* ")) {
      result.keyDecisions.push(line);
    } else if (currentSection === "actionPlan" && line.startsWith("* ")) {
      result.actionPlan.push(line);
    }
  }
  
  return result;
};

const MeetingReport = () => {
  const params = useParams();
  const meetingId = params.id;
  const [report, setReport] = useState(null);
  const [parsedReport, setParsedReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!meetingId) {
        setIsLoading(false);
        return;
      }

      try {
        // First try to fetch the transcript
        const transcriptResponse = await fetch(`http://localhost:8080/api/analytics/transcripts/${meetingId}`, {
          credentials: 'include'
        });

        if (!transcriptResponse.ok) {
          throw new Error(`Failed to fetch transcript: ${transcriptResponse.status}`);
        }

        // Then generate or fetch the report
        const reportResponse = await fetch(`http://localhost:8080/api/analytics/transcripts/${meetingId}/generatereport`, {
          method: 'POST',
          credentials: 'include'
        });

        if (!reportResponse.ok) {
          throw new Error(`Failed to generate report: ${reportResponse.status}`);
        }

        const reportData = await reportResponse.json();
        setReport(reportData);
        
        // Parse the report text
        if (reportData.report) {
          const parsed = parseReport(reportData.report);
          setParsedReport(parsed);
        }
      } catch (error) {
        console.error('Error fetching report:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [meetingId]);

  if (isLoading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading meeting report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger my-4" role="alert">
        <h4 className="alert-heading">Error Loading Report</h4>
        <p>{error}</p>
        <hr />
        <p className="mb-0">
          <Link href={`/transcript/${meetingId}`} className="alert-link">
            Submit a transcript
          </Link> for this meeting to generate a report.
        </p>
      </div>
    );
  }

  if (!report || !parsedReport) {
    return (
      <div className="alert alert-info my-4" role="alert">
        <h4 className="alert-heading">No Report Available</h4>
        <p>There is no report available for this meeting yet.</p>
        <hr />
        <p className="mb-0">
          <Link href={`/transcript/${meetingId}`} className="alert-link">
            Submit a transcript
          </Link> for this meeting to generate a report.
        </p>
      </div>
    );
  }

  // Function to format and download the report as a PDF file
  const downloadReportAsPDF = () => {
    const { report } = report;
    
    const pdf = new jsPDF();
    
    // Set font styles
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    
    // Title
    pdf.text("MEETING REPORT", 105, 20, { align: "center" });
    
    // Meeting name
    pdf.setFontSize(14);
    pdf.text(parsedReport.meetingName, 105, 30, { align: "center" });
    
    // Basic info
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("Date:", 20, 45);
    pdf.setFont("helvetica", "normal");
    pdf.text(parsedReport.meetingDate, 50, 45);
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Time:", 20, 55);
    pdf.setFont("helvetica", "normal");
    pdf.text(parsedReport.meetingTime, 50, 55);
    
    pdf.setFont("helvetica", "bold");
    pdf.text("Location:", 20, 65);
    pdf.setFont("helvetica", "normal");
    pdf.text(parsedReport.location, 50, 65);
    
    // Meeting Overview
    let yPos = 80;
    pdf.setFont("helvetica", "bold");
    pdf.text("Meeting Overview", 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(10);
    pdf.text("Purpose of the Meeting:", 20, yPos);
    
    // Handle purpose text wrapping
    const splitPurpose = pdf.splitTextToSize(parsedReport.purpose, 170);
    pdf.setFont("helvetica", "normal");
    pdf.text(splitPurpose, 20, yPos + 5);
    
    yPos += 10 + (splitPurpose.length * 5);
    
    // Agenda
    pdf.setFont("helvetica", "bold");
    pdf.text("Agenda:", 20, yPos);
    yPos += 5;
    
    pdf.setFont("helvetica", "normal");
    parsedReport.agenda.forEach(item => {
      const splitItem = pdf.splitTextToSize(item, 170);
      pdf.text(splitItem, 20, yPos);
      yPos += splitItem.length * 5;
    });
    
    // Participation
    yPos += 5;
    pdf.setFont("helvetica", "normal");
    pdf.text(parsedReport.participation, 20, yPos);
    
    // Meeting Minutes
    yPos += 15;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("Meeting Minutes", 20, yPos);
    yPos += 10;
    
    // Opening Remarks
    pdf.setFontSize(10);
    pdf.text("Opening Remarks:", 20, yPos);
    yPos += 5;
    
    pdf.setFont("helvetica", "normal");
    parsedReport.openingRemarks.forEach(item => {
      const splitItem = pdf.splitTextToSize(item, 170);
      pdf.text(splitItem, 20, yPos);
      yPos += splitItem.length * 5;
    });
    
    // Check if we need a new page
    if (yPos > 250) {
      pdf.addPage();
      yPos = 20;
    }
    
    // Agenda Discussion
    yPos += 5;
    pdf.setFont("helvetica", "bold");
    pdf.text("Agenda Discussion:", 20, yPos);
    yPos += 5;
    
    pdf.setFont("helvetica", "normal");
    parsedReport.agendaDiscussion.forEach(item => {
      const splitItem = pdf.splitTextToSize(item, 170);
      pdf.text(splitItem, 20, yPos);
      yPos += splitItem.length * 5;
    });
    
    // Check if we need a new page
    if (yPos > 250) {
      pdf.addPage();
      yPos = 20;
    }
    
    // Task Assignments
    yPos += 5;
    pdf.setFont("helvetica", "bold");
    pdf.text("Task Assignments:", 20, yPos);
    yPos += 5;
    
    pdf.setFont("helvetica", "normal");
    parsedReport.taskAssignments.forEach(item => {
      const splitItem = pdf.splitTextToSize(item, 170);
      pdf.text(splitItem, 20, yPos);
      yPos += splitItem.length * 5;
    });
    
    // Actionable Items
    yPos += 5;
    pdf.setFont("helvetica", "bold");
    pdf.text("Actionable Items:", 20, yPos);
    yPos += 5;
    
    pdf.setFont("helvetica", "normal");
    parsedReport.actionItems.forEach(item => {
      const splitItem = pdf.splitTextToSize(item, 170);
      pdf.text(splitItem, 20, yPos);
      yPos += splitItem.length * 5;
    });
    
    // Check if we need a new page
    if (yPos > 220) {
      pdf.addPage();
      yPos = 20;
    }
    
    // Agenda Coverage
    yPos += 10;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("Agenda Coverage", 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("Covered: " + parsedReport.agendaCoverage, 20, yPos);
    yPos += 5;
    
    const splitUncovered = pdf.splitTextToSize("Uncovered Topics: " + parsedReport.uncoveredTopics, 170);
    pdf.text(splitUncovered, 20, yPos);
    yPos += splitUncovered.length * 5;
    
    // Key Decisions
    yPos += 10;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("Key Decisions", 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    parsedReport.keyDecisions.forEach(item => {
      const splitItem = pdf.splitTextToSize(item, 170);
      pdf.text(splitItem, 20, yPos);
      yPos += splitItem.length * 5;
    });
    
    // Check if we need a new page
    if (yPos > 230) {
      pdf.addPage();
      yPos = 20;
    }
    
    // Action Plan
    yPos += 10;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("Action Plan", 20, yPos);
    yPos += 10;
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    parsedReport.actionPlan.forEach(item => {
      const splitItem = pdf.splitTextToSize(item, 170);
      pdf.text(splitItem, 20, yPos);
      yPos += splitItem.length * 5;
    });
    
    // Save the PDF
    pdf.save(`meeting-report-${meetingId}.pdf`);
  };

  // Function to format and download the report as a text file
  const downloadReportAsText = () => {
    const element = document.createElement("a");
    const file = new Blob([report.report], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `meeting-report-${meetingId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-transparent rounded-3 p-4" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="text-center mb-2">
        <h1 className="fw-bold mb-1">MEETING REPORT</h1>
        <p className="text-muted mb-3">{parsedReport.meetingName}</p>
      </div>
      
      <hr className="border-primary border-2 my-3" />
      
      <div className="row mb-4">
        <div className="col-md-3 fw-bold">Date</div>
        <div className="col-md-9">{parsedReport.meetingDate}</div>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-3 fw-bold">Time</div>
        <div className="col-md-9">{parsedReport.meetingTime}</div>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-3 fw-bold">Location</div>
        <div className="col-md-9">{parsedReport.location}</div>
      </div>
      
      <hr className="border-primary border-2 my-3" />
      
      <div className="mb-4">
        <h2 className="h5 fw-bold mb-3">Meeting Overview</h2>
        <p className="mb-2"><strong>Purpose of the Meeting:</strong> {parsedReport.purpose}</p>
        
        <p className="mb-1"><strong>Agenda:</strong></p>
        <ul className="mb-3">
          {parsedReport.agenda.map((item, index) => (
            <li key={index}>{item.replace('* ', '')}</li>
          ))}
        </ul>
        
        <p className="mb-2">{parsedReport.participation}</p>
      </div>
      
      <div className="mb-4">
        <h2 className="h5 fw-bold mb-3">Meeting Minutes</h2>
        
        <p className="mb-1"><strong>Opening Remarks:</strong></p>
        <ul className="mb-3">
          {parsedReport.openingRemarks.map((item, index) => (
            <li key={index}>{item.replace('* ', '')}</li>
          ))}
        </ul>
        
        <p className="mb-1"><strong>Agenda Discussion:</strong></p>
        <ul className="mb-3">
          {parsedReport.agendaDiscussion.map((item, index) => (
            <li key={index}>{item.replace('* ', '')}</li>
          ))}
        </ul>
        
        <p className="mb-1"><strong>Task Assignments:</strong></p>
        <ul className="mb-3">
          {parsedReport.taskAssignments.map((item, index) => (
            <li key={index}>{item.replace('* ', '')}</li>
          ))}
        </ul>
        
        <p className="mb-1"><strong>Actionable Items:</strong></p>
        <ul className="mb-3">
          {parsedReport.actionItems.map((item, index) => (
            <li key={index}>{item.replace('* ', '')}</li>
          ))}
        </ul>
      </div>
      
      <div className="mb-4">
        <h2 className="h5 fw-bold mb-3">Agenda Coverage</h2>
        <p className="mb-2"><strong>Covered:</strong> {parsedReport.agendaCoverage}</p>
        <p className="mb-2"><strong>Uncovered Topics:</strong> {parsedReport.uncoveredTopics}</p>
      </div>
      
      <div className="mb-4">
        <h2 className="h5 fw-bold mb-3">Key Decisions</h2>
        <ul className="mb-3">
          {parsedReport.keyDecisions.map((item, index) => (
            <li key={index}>{item.replace('* ', '')}</li>
          ))}
        </ul>
      </div>
      
      <div className="mb-4">
        <h2 className="h5 fw-bold mb-3">Action Plan</h2>
        <ul className="mb-3">
          {parsedReport.actionPlan.map((item, index) => (
            <li key={index}>{item.replace('* ', '')}</li>
          ))}
        </ul>
      </div>
      
      <div className="text-end mt-4">
        <button className="btn btn-outline-primary px-4 me-2" onClick={downloadReportAsText}>Download as Text</button>
        <button className="btn btn-primary px-4" onClick={downloadReportAsPDF}>Download as PDF</button>
      </div>
    </div>
  );
};

export default function ReportPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const params = useParams();
  const meetingId = params.id;

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
          {meetingId && (
            <p className="text-muted small">
              Meeting ID: {meetingId} • <Link href={`/transcript/${meetingId}`} className="text-primary">Edit Transcript</Link>
            </p>
          )}
        </div>
        
        <div className='w-100 rounded-3 bg-light p-3 p-md-4'>
          {/* Content */}
          <MeetingReport />
        </div>
      </div>
    </div>
  );
}