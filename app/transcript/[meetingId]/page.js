'use client';

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/global.css';
import SidebarMenu from '@/components/SideMenucollapse';
import ProfileHeader from '@/components/profileHeader';
import { FaBars } from 'react-icons/fa';
import { useParams } from 'next/navigation';
import axios from 'axios';

const TranscriptForm = () => {
  const params = useParams();
  const meetingId = params.meetingId;
  const [standardQuestions, setStandardQuestions] = useState([]);
  const [formData, setFormData] = useState({
    purpose: '',
    agenda: '',
    participants: '',
    fullyCovered: '',
    missedTopics: '',
    onTime: '',
    timeDeviation: '',
    timeUnit: 'Minutes',
    decisions: '',
    unresolvedIssues: '',
    satisfaction: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch standard questions
  useEffect(() => {
    const fetchStandardQuestions = async () => {
      try {
        const response = await fetch('http://localhost:8081/api/standard/questions', {
          credentials: 'include'
        });
        const data = await response.json();
        setStandardQuestions(data.questions);
      } catch (err) {
        console.error('Failed to fetch standard questions', err);
        setError('Failed to load standard questions');
      }
    };

    fetchStandardQuestions();
  }, []);

  // Fetch existing transcript if it exists
  useEffect(() => {
    const fetchTranscript = async () => {
      if (!meetingId) return;

      try {
        const response = await fetch(`http://localhost:8081/api/transcripts/${meetingId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch transcript');
        }
        
        const data = await response.json();

        if (data.questionAnswers) {
          const qaMap = {};
          data.questionAnswers.forEach((qa, index) => {
            switch(index) {
              case 0: qaMap.purpose = qa.answer; break;
              case 1: qaMap.agenda = qa.answer; break;
              case 2: qaMap.participants = qa.answer; break;
              case 3: qaMap.fullyCovered = qa.answer; break;
              case 4: qaMap.missedTopics = qa.answer; break;
              case 5: qaMap.onTime = qa.answer; break;
              case 6: 
                const timeParts = qa.answer.split(' ');
                qaMap.timeDeviation = timeParts[0];
                qaMap.timeUnit = timeParts[1];
                break;
              case 7: qaMap.decisions = qa.answer; break;
              case 8: qaMap.unresolvedIssues = qa.answer; break;
              case 9: qaMap.satisfaction = qa.answer; break;
            }
          });
          setFormData(prevData => ({ ...prevData, ...qaMap }));
        }
      } catch (err) {
        console.log('No existing transcript found');
      }
    };

    if (standardQuestions.length > 0) {
      fetchTranscript();
    }
  }, [meetingId, standardQuestions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Transform form data into question-answer pairs
      const questionAnswers = [
        { question: standardQuestions[0], answer: formData.purpose },
        { question: standardQuestions[1], answer: formData.agenda },
        { question: standardQuestions[2], answer: formData.participants },
        { question: standardQuestions[3], answer: formData.fullyCovered },
        { question: standardQuestions[4], answer: formData.missedTopics },
        { question: standardQuestions[5], answer: formData.onTime },
        { 
          question: standardQuestions[6], 
          answer: `${formData.timeDeviation} ${formData.timeUnit}`
        },
        { question: standardQuestions[7], answer: formData.decisions },
        { question: standardQuestions[8], answer: formData.unresolvedIssues },
        { question: standardQuestions[9], answer: formData.satisfaction }
      ];

      const response = await fetch('http://localhost:8081/api/transcripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          meetingId,
          questionAnswers
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit transcript');
      }

      setSuccess(true);
    } catch (err) {
      console.error('Failed to submit transcript', err);
      setError('Failed to submit transcript. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate report
  const handleGenerateReport = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/transcripts/${meetingId}/generatereport`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `meeting_transcript_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate report', err);
      setError('Failed to generate report. Please try again.');
    }
  };

  return (
    <div className="bg-transparent rounded-3 p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 fw-bold m-0">Transcript</h2>
        <button 
          className="btn btn-primary px-4"
          onClick={handleGenerateReport}
          disabled={isLoading}
        >
          Generate Report
        </button>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          Transcript saved successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="form-label fw-medium mb-2">What was the purpose of the meeting?</label>
          <textarea 
            className="form-control p-3" 
            rows="3" 
            placeholder="Write in your words"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label className="form-label fw-medium mb-2">What was the primary agenda of the meeting?</label>
          <textarea 
            className="form-control p-3" 
            rows="3" 
            placeholder="Write in your words"
            name="agenda"
            value={formData.agenda}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label className="form-label fw-medium mb-2">Around How many participants actually contributed?</label>
          <input 
            type="text" 
            className="form-control p-3" 
            name="participants"
            value={formData.participants}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="form-label fw-medium mb-2">Was the agenda fully covered? (Yes/No)</label>
          <input 
            type="text" 
            className="form-control p-3"
            name="fullyCovered"
            value={formData.fullyCovered}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="form-label fw-medium mb-2">If not, what topics were left out and why?</label>
          <textarea 
            className="form-control p-3" 
            rows="3" 
            placeholder="Write in your words"
            name="missedTopics"
            value={formData.missedTopics}
            onChange={handleChange}
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label className="form-label fw-medium mb-2">Was the meeting conducted within the scheduled time? (Yes/No)</label>
          <input 
            type="text" 
            className="form-control p-3"
            name="onTime"
            value={formData.onTime}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="form-label fw-medium mb-2">If not, by how much time did it exceed or finish early?</label>
          <div className="d-flex gap-2">
            <input 
              type="number" 
              className="form-control p-3" 
              placeholder="Number"
              name="timeDeviation"
              value={formData.timeDeviation}
              onChange={handleChange}
            />
            <select 
              className="form-select p-3" 
              style={{ width: '150px' }}
              name="timeUnit"
              value={formData.timeUnit}
              onChange={handleChange}
            >
              <option value="Minutes">Minutes</option>
              <option value="Hours">Hours</option>
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="form-label fw-medium mb-2">What were the key decisions made?</label>
          <textarea 
            className="form-control p-3" 
            rows="3" 
            placeholder="Write in your words"
            name="decisions"
            value={formData.decisions}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label className="form-label fw-medium mb-2">Were there any unresolved issues?</label>
          <textarea 
            className="form-control p-3" 
            rows="3" 
            placeholder="Write in your words"
            name="unresolvedIssues"
            value={formData.unresolvedIssues}
            onChange={handleChange}
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label className="form-label fw-medium mb-2">Did participants express satisfaction or dissatisfaction with the meeting's outcomes?</label>
          <textarea 
            className="form-control p-3" 
            rows="3" 
            placeholder="Write in your words"
            name="satisfaction"
            value={formData.satisfaction}
            onChange={handleChange}
          ></textarea>
        </div>
        
        <div className="d-flex justify-content-end">
          <button 
            type="submit" 
            className="btn btn-primary px-4"
            disabled={isLoading || standardQuestions.length === 0}
          >
            {isLoading ? 'Saving...' : 'Save Transcript'}
          </button>
        </div>
      </form>
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
          <h2 className=" mb-1 mb-md-2 font-inter fw-bold">Transcript</h2>
          <p className="text-muted small">
            Transform your transcript into actionable insights
          </p>
        </div>
        
        <div className='w-100 rounded-3 bg-light p-md-4'>
            {/* Content */}
            <TranscriptForm />
        </div>
      </div>
    </div>
  );
}