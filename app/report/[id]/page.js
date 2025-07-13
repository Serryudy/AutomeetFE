'use client';

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/global.css';
import SidebarMenu from '@/components/SideMenucollapse';
import ProfileHeader from '@/components/profileHeader';
import { FaBars, FaRobot, FaSpinner } from 'react-icons/fa';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import jsPDF from 'jspdf';

const MeetingReport = () => {
  const params = useParams();
  const meetingId = params.id;
  const [aiReport, setAiReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState(null);

  // Fetch existing AI report
  const fetchAiReport = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/analytics/reports/${meetingId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const reportData = await response.json();
        setAiReport(reportData);
        return true;
      } else if (response.status === 404) {
        // No report exists yet
        return false;
      } else {
        throw new Error(`Failed to fetch AI report: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching AI report:', error);
      return false;
    }
  };

  // Fetch transcript to check if it exists
  const fetchTranscript = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/analytics/transcripts/${meetingId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const transcriptData = await response.json();
        setTranscript(transcriptData);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error fetching transcript:', error);
      return false;
    }
  };

  // Generate new AI report
  const generateAiReport = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8080/api/analytics/transcripts/${meetingId}/generateai`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to generate AI report: ${response.status}`);
      }

      const reportData = await response.json();
      setAiReport(reportData);
    } catch (error) {
      console.error('Error generating AI report:', error);
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!meetingId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      // Check if transcript exists
      const transcriptExists = await fetchTranscript();
      
      if (!transcriptExists) {
        setError('No transcript found for this meeting. Please create a transcript first.');
        setIsLoading(false);
        return;
      }

      // Try to fetch existing AI report
      const reportExists = await fetchAiReport();
      
      if (!reportExists) {
        // No report exists, but transcript is available
        setError(null);
      }

      setIsLoading(false);
    };

    loadData();
  }, [meetingId]);

  // Format the AI report content for display
  const formatReportContent = (content) => {
    if (!content) return [];
    
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const sections = [];
    let currentSection = null;
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Check if line is a header (contains Assessment, Outcomes, etc.)
      if (trimmedLine.includes('Assessment:') || 
          trimmedLine.includes('Key Outcomes:') || 
          trimmedLine.includes('Achievements:') ||
          trimmedLine.includes('Areas for Improvement:') ||
          trimmedLine.includes('Recommendations:') ||
          trimmedLine.includes('Action Items:') ||
          trimmedLine.includes('Next Steps:')) {
        
        if (currentSection) {
          sections.push(currentSection);
        }
        
        currentSection = {
          title: trimmedLine,
          content: []
        };
      } else if (currentSection) {
        // Add content to current section
        if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
          currentSection.content.push({
            type: 'bullet',
            text: trimmedLine.substring(1).trim()
          });
        } else {
          currentSection.content.push({
            type: 'paragraph',
            text: trimmedLine
          });
        }
      } else {
        // No current section, treat as general content
        if (!sections.find(s => s.title === 'Overview')) {
          sections.push({
            title: 'Overview',
            content: []
          });
        }
        const overviewSection = sections.find(s => s.title === 'Overview');
        overviewSection.content.push({
          type: 'paragraph',
          text: trimmedLine
        });
      }
    });
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections;
  };

  // Download report as PDF
  const downloadReportAsPDF = () => {
    if (!aiReport) return;

    const pdf = new jsPDF();
    
    // Set font styles
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    
    // Title
    pdf.text("AI MEETING ANALYSIS REPORT", 105, 20, { align: "center" });
    
    // Meeting ID and date
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Meeting ID: ${meetingId}`, 20, 35);
    pdf.text(`Generated: ${new Date(aiReport.createdAt).toLocaleString()}`, 20, 45);
    pdf.text(`Generated by: ${aiReport.generatedBy}`, 20, 55);
    
    let yPos = 70;
    
    // Content
    const sections = formatReportContent(aiReport.reportContent);
    
    sections.forEach(section => {
      // Section title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      
      // Check if we need a new page
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.text(section.title, 20, yPos);
      yPos += 10;
      
      // Section content
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      
      section.content.forEach(item => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        
        if (item.type === 'bullet') {
          const splitText = pdf.splitTextToSize(`• ${item.text}`, 170);
          pdf.text(splitText, 25, yPos);
          yPos += splitText.length * 5;
        } else {
          const splitText = pdf.splitTextToSize(item.text, 170);
          pdf.text(splitText, 20, yPos);
          yPos += splitText.length * 5;
        }
        yPos += 2; // Small spacing between items
      });
      
      yPos += 10; // Spacing between sections
    });
    
    // Save the PDF
    pdf.save(`ai-meeting-report-${meetingId}.pdf`);
  };

  // Download report as text
  const downloadReportAsText = () => {
    if (!aiReport) return;
    
    const content = `AI MEETING ANALYSIS REPORT\n\nMeeting ID: ${meetingId}\nGenerated: ${new Date(aiReport.createdAt).toLocaleString()}\nGenerated by: ${aiReport.generatedBy}\n\n${aiReport.reportContent}`;
    
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `ai-meeting-report-${meetingId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isLoading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading meeting data...</p>
      </div>
    );
  }

  if (error && !transcript) {
    return (
      <div className="alert alert-danger my-4" role="alert">
        <h4 className="alert-heading">No Transcript Available</h4>
        <p>{error}</p>
        <hr />
        <p className="mb-0">
          <Link href={`/transcript/${meetingId}`} className="alert-link">
            Create a transcript
          </Link> for this meeting to generate an AI analysis report.
        </p>
      </div>
    );
  }

  if (!aiReport) {
    return (
      <div className="text-center my-5">
        <div className="card border-0 shadow-sm" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card-body p-5">
            <div className="mb-4">
              <FaRobot size={48} className="text-primary mb-3" />
              <h4 className="fw-bold">AI Analysis Ready</h4>
              <p className="text-muted">
                Generate an intelligent analysis of your meeting based on the transcript responses.
              </p>
            </div>
            
            {error && (
              <div className="alert alert-warning" role="alert">
                <small>{error}</small>
              </div>
            )}
            
            <button 
              className="btn btn-primary btn-lg px-4"
              onClick={generateAiReport}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <FaSpinner className="fa-spin me-2" />
                  Generating AI Report...
                </>
              ) : (
                <>
                  <FaRobot className="me-2" />
                  Generate AI Report
                </>
              )}
            </button>
            
            <div className="mt-3">
              <small className="text-muted">
                This may take 30-60 seconds for the first generation.
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sections = formatReportContent(aiReport.reportContent);

  return (
    <div className="bg-transparent rounded-3 p-4" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="text-center mb-4">
        <div className="d-flex align-items-center justify-content-center mb-3">
          <FaRobot className="text-primary me-2" size={24} />
          <h1 className="fw-bold mb-0">AI MEETING ANALYSIS</h1>
        </div>
        <div className="text-muted small">
          <p className="mb-1">Meeting ID: {meetingId}</p>
          <p className="mb-1">Generated: {new Date(aiReport.createdAt).toLocaleString()}</p>
          <p className="mb-0">Analyzed by: {aiReport.generatedBy}</p>
        </div>
      </div>
      
      <hr className="border-primary border-2 my-4" />
      
      {/* Regenerate button */}
      <div className="text-center mb-4">
        <button 
          className="btn btn-outline-primary btn-sm me-2"
          onClick={generateAiReport}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <FaSpinner className="fa-spin me-1" />
              Regenerating...
            </>
          ) : (
            'Regenerate Report'
          )}
        </button>
      </div>

      {/* Report Content */}
      {sections.map((section, index) => (
        <div key={index} className="mb-4">
          <h3 className="h5 fw-bold mb-3 text-primary">{section.title}</h3>
          
          {section.content.map((item, itemIndex) => (
            <div key={itemIndex} className="mb-2">
              {item.type === 'bullet' ? (
                <div className="d-flex">
                  <span className="text-primary me-2">•</span>
                  <span>{item.text}</span>
                </div>
              ) : (
                <p className="mb-2">{item.text}</p>
              )}
            </div>
          ))}
        </div>
      ))}
      
      {/* Download buttons */}
      <div className="text-end mt-5 pt-4 border-top">
        <button 
          className="btn btn-outline-primary px-4 me-2" 
          onClick={downloadReportAsText}
        >
          Download as Text
        </button>
        <button 
          className="btn btn-primary px-4" 
          onClick={downloadReportAsPDF}
        >
          Download as PDF
        </button>
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
          <h2 className="mb-1 mb-md-2 font-inter fw-bold">AI Meeting Report</h2>
          <p className="text-muted small">
            AI-powered analysis of your meeting transcript.
          </p>
          {meetingId && (
            <p className="text-muted small">
              Meeting ID: {meetingId} • <Link href={`/transcript/${meetingId}`} className="text-primary">Edit Transcript</Link>
            </p>
          )}
        </div>
        
        <div className='w-100 rounded-3 bg-light p-3 p-md-4'>
          <MeetingReport />
        </div>
      </div>
    </div>
  );
}