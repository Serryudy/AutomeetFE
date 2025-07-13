'use client';

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/global.css';
import SidebarMenu from '../../components/SideMenucollapse';
import ProfileHeader from '@/components/profileHeader';
import { FaBars } from 'react-icons/fa';
import Link from 'next/link';
import SearchBar from '@/components/meetingsearchbar'; // Import the SearchBar component

// Import react-chartjs-2 components
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler,
  ArcElement,
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler,
  ArcElement,
  RadialLinearScale,
  ChartDataLabels
);

// Common chart options to maintain consistent styling
const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    datalabels: {
      display: false
    }
  }
};

export default function MeetingInsights() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  
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

  // Handle meeting selection from search
  const handleSelectMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    console.log('Selected meeting:', meeting);
  };

  // Add filter handler
  const handleFilter = (filters) => {
    // You can implement filtering logic here if needed
    console.log('Filters applied:', filters);
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
          <h1 className="h2 mb-1 mb-md-2 font-inter fw-bold">Analytics</h1>
          <p className="text-muted small">
            Unlock insights to drive smarter meetings.
          </p>
        </div>

        {/* SearchBar Component */}
        <SearchBar 
          onSelectMeeting={handleSelectMeeting}
          onFilter={handleFilter}
          placeholder="Search for meetings to analyze"
          context="analytics"
        />

        {/* Meeting Analytics Content */}
        <div className='container bg-white p-4 rounded-4 shadow'>
          <MeetingTab 
            selectedMeeting={selectedMeeting} 
          />
        </div>
      </div>
    </div>
  );
}

// Fetch meeting analytics function
const fetchMeetingAnalytics = async (meetingId) => {
  try {
    const response = await fetch(`http://localhost:8080/api/analytics/meetings/${meetingId}/analytics`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch analytics');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

// MeetingTab component
function MeetingTab({ selectedMeeting }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedMeeting?.id || selectedMeeting?._id) {
      setIsLoading(true);
      setError(null);
      
      fetchMeetingAnalytics(selectedMeeting.id || selectedMeeting._id)
        .then(data => {
          setAnalyticsData(data);
        })
        .catch(err => {
          setError(err.message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [selectedMeeting]);

  if (!selectedMeeting) {
    return (
      <div className="text-center p-5 bg-light rounded-3">
        <h3 className="text-muted">Please select a meeting to view analytics</h3>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Failed to load analytics: {error}
      </div>
    );
  }

  // Update chart data with API response
  const rescheduleChartData = {
    labels: analyticsData?.reschedulingFrequency.map(item => item.day.substring(0, 3).toUpperCase()) || [],
    datasets: [{
      label: 'Continuity',
      data: analyticsData?.reschedulingFrequency.map(item => item.frequency) || [],
      borderColor: '#2E9AFE',
      backgroundColor: 'rgba(46, 154, 254, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#2E9AFE',
      pointBorderColor: '#FFFFFF',
      pointBorderWidth: 2,
      pointHoverRadius: 6
    }]
  };

  const schedulingChartData = {
    labels: analyticsData?.schedulingAccuracy.map(item => item.day.substring(0, 1)) || [],
    datasets: [{
      data: analyticsData?.schedulingAccuracy.map(item => item.accuracy * 100) || [],
      backgroundColor: (context) => {
        const index = context.dataIndex;
        const value = context.dataset.data[index];
        return value > 80 ? '#4B49FF' : '#D0D0D0';
      },
      borderRadius: 5,
      barThickness: 20
    }]
  };

  // Update engagement metrics with API data
  const engagementData = analyticsData?.engagement || {
    speakingTime: 0,
    participantEngagement: 0,
    chatEngagement: 0
  };

  // Chart options for rescheduling frequency
  const rescheduleChartOptions = {
    ...commonChartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f0f0f0'
        },
        ticks: {
          font: { size: 10 },
          callback: function(value) {
            if (value >= 1000) {
              return value / 1000 + 'k';
            }
            return value;
          }
        }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } }
      }
    },
    plugins: {
      ...commonChartOptions.plugins,
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Continuity: ${context.raw}`;
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };
  
  // Chart options for scheduling accuracy
  const schedulingChartOptions = {
    ...commonChartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: false },
        ticks: { display: false }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } }
      }
    },
    plugins: {
      ...commonChartOptions.plugins,
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        callbacks: {
          title: function(context) {
            return 'Slot ' + context[0].label;
          },
          label: function(context) {
            return `Accuracy: ${context.raw}%`;
          }
        }
      },
      datalabels: {
        display: true,
        color: '#fff',
        anchor: 'end',
        align: 'top',
        offset: -5,
        formatter: function(value) {
          return value + '%';
        },
        font: {
          weight: 'bold',
          size: 10
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeOutQuart'
    }
  };

  // Chart data for engagement metrics - now using API data
  const engagementDataPrepared = {
    speakingTime: engagementData.speakingTime || 0,
    participantEngagement: engagementData.participantEngagement || 0,
    chatEngagement: engagementData.chatEngagement || 0
  };

  return (
    <>
      {/* Charts Row */}
      <div className="row mb-4 g-3">
        {/* Rescheduling Frequency */}
        <div className="col-12 col-md-4">
          <div className={`card shadow-sm rounded-4 h-100 ${analyticsData?.reschedulingFrequency === "not enough data" ? "bg-dark text-white" : ""}`}>
            <div className="card-body p-3 p-md-4">
              <h5 className="fw-bold mb-3">Rescheduling Frequency</h5>
              <div className="text-muted small mb-2">— CONTINUITY</div>
              <div style={{ height: '200px' }}>
                {analyticsData?.reschedulingFrequency === "not enough data" ? (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <span className="fw-bold">Not enough data</span>
                  </div>
                ) : (
                  <Line data={rescheduleChartData} options={rescheduleChartOptions} />
                )}
              </div>
            </div>
          </div>
        </div>
      
        {/* Scheduling Accuracy */}
        <div className="col-12 col-md-4">
          <div className={`card shadow-sm rounded-4 h-100 ${analyticsData?.schedulingAccuracy === "not enough data" ? "bg-dark text-white" : ""}`}>
            <div className="card-body p-3 p-md-4">
              <h5 className="fw-bold mb-3">Scheduling Accuracy</h5>
              <div className="text-muted mb-2">Expectation redundancy</div>
              <div style={{ height: '200px' }}>
                {analyticsData?.schedulingAccuracy === "not enough data" ? (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <span className="fw-bold">Not enough data</span>
                  </div>
                ) : (
                  <Bar data={schedulingChartData} options={schedulingChartOptions} />
                )}
              </div>
              <div className="mt-3">
                <h6 className="fw-bold">Second most suitable slot</h6>
                <p className="text-muted small">Users preference accurate 80%</p>
              </div>
            </div>
          </div>
        </div>
      
        {/* Engagement Analytics */}
        <div className="col-12 col-md-4">
          <div className={`card shadow-sm rounded-4 h-100 ${analyticsData?.engagement === "not enough data" ? "bg-dark text-white" : ""}`}>
            <div className="card-body p-3 p-md-4">
              <h5 className="fw-bold mb-3">Engagement Analytics</h5>
      
              {analyticsData?.engagement === "not enough data" ? (
                <div className="d-flex align-items-center justify-content-center h-100">
                  <span className="fw-bold">Not enough data</span>
                </div>
              ) : (
                <>
                  <EngagementMetric 
                    title="Speaking Time Distribution"
                    subtitle="percent is given to the Host"
                    value={engagementDataPrepared.speakingTime}
                    color="#00D8FF"
                  />
                  
                  <EngagementMetric 
                    title="Participant engagement"
                    subtitle="Shows an average percentage of engagement"
                    value={engagementDataPrepared.participantEngagement}
                    color="#FF9F40"
                  />
                  
                  <EngagementMetric 
                    title="Chat engagement"
                    subtitle="Chats conducted on the topic of this meeting"
                    value={engagementDataPrepared.chatEngagement}
                    color="#FF5EAA"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Post-Meeting Insights Section */}
      <h3 className="fw-bold mb-4">Post-Meeting Insights</h3>
      
      <div className="row g-4">
        {/* Meeting Transcript */}
        <div className="col-12 col-lg-6">
          <div className="mb-3">
            <h4 className="fw-bold">Meeting Transcript</h4>
            <button 
              className="btn btn-primary rounded-pill px-4 py-2 mb-3"
              disabled={!selectedMeeting}
              onClick={() => {
                if (selectedMeeting) {
                  window.location.href = `/transcript/${selectedMeeting._id || selectedMeeting.id}`;
                } else {
                  alert('Please select a meeting first');
                }
              }}
            >
              Submit Transcript
            </button>
            <p>
              Submit a transcript of your meeting to generate AI-powered insights and
              a comprehensive report.
            </p>
            <p>
              Gain valuable takeaways, identify action items, and understand engagement trends for improved
              future meetings.
            </p>
          </div>
        </div>
      
        {/* Meeting Report */} 
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm rounded-4 cursor-pointer" 
            onClick={() => {
              if (selectedMeeting) {
                window.location.href = `/report/${selectedMeeting._id || selectedMeeting.id}`;
              } else {
                alert('Please select a meeting first');
              }
            }}
            style={{ cursor: selectedMeeting ? 'pointer' : 'not-allowed', 
                     opacity: selectedMeeting ? 1 : 0.6 }}
          >
            <div className="card-body p-4 text-dark">
              <h3 className="fw-bold">Meeting Report</h3>
              <h6 className="text-muted mb-3">Report subheading</h6>
              <div className="mb-3">
                {selectedMeeting ? (
                  <>
                    <p className="mb-1">Date: {selectedMeeting.date || 'N/A'}</p>
                    <p className="mb-1">Time: {selectedMeeting.time || 'N/A'}</p>
                    <p className="mb-1">Admin: {typeof selectedMeeting.admin === 'object' ? 
                      selectedMeeting.admin.username || 'N/A' : 
                      selectedMeeting.admin || 'N/A'}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mb-1">Date: 12/22/2024</p>
                    <p className="mb-1">Time: 10:00 AM - 11:00 AM</p>
                    <p className="mb-1">Admin: Sarah Johnson</p>
                  </>
                )}
                <p className="mb-0">Participants:</p>
                <ul className="list-unstyled ps-3 mb-0">
                  {selectedMeeting?.participants ? (
                    selectedMeeting.participants.map((participant, index) => (
                      <li key={index}>• {typeof participant === 'object' ? 
                        participant.username || participant.email || 'N/A' : 
                        participant}
                      </li>
                    ))
                  ) : (
                    <>
                      <li>• John Doe (Project Manager)</li>
                      <li>• Alice Smith (Developer)</li>
                      <li>• Mark Lee (Designer)</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// EngagementMetric component for displaying circular progress indicators
function EngagementMetric({ title, subtitle, value, color }) {
  const dashOffset = 100 - value;
  
  return (
    <div className="d-flex align-items-center mb-3">
      <div className="position-relative me-3">
        <div className="position-relative" style={{ width: '60px', height: '60px' }}>
          <svg viewBox="0 0 36 36" width="60" height="60">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e6e6e6" strokeWidth="2.8"></circle>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeDasharray="100, 100" strokeDashoffset={dashOffset} strokeWidth="2.8"></circle>
          </svg>
          <div className="position-absolute top-50 start-50 translate-middle fw-bold" style={{ fontSize: '14px' }}>{value}%</div>
        </div>
      </div>
      <div>
        <div className="fw-bold">{title}</div>
        <div className="text-muted small">{subtitle}</div>
      </div>
    </div>
  );
}