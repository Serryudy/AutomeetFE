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
  const [activeTab, setActiveTab] = useState('meeting'); // Default to meeting tab
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

  // Handler for meeting selection from search
  const handleSelectMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    console.log('Selected meeting:', meeting);
  };

  // Handler for filter button click
  const handleFilter = () => {
    console.log('Filter button clicked');
    // Implement your filter functionality here
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

        {/* Tabs and rest of the content */}
        <div className='container bg-white p-4 rounded-4 shadow'>
          {/* Existing tabs and tab content */}
          <div className="mb-4">
            <div className="d-flex">
              <button 
                className={`btn ${activeTab === 'meeting' ? 'btn-primary' : 'btn-secondary'} rounded-pill px-4 py-2 me-2`}
                onClick={() => setActiveTab('meeting')}
              >
                Meeting
              </button>
              <button 
                className={`btn ${activeTab === 'your' ? 'btn-primary' : 'btn-secondary'} rounded-pill px-4 py-2`}
                onClick={() => setActiveTab('your')}
              >
                Your
              </button>
            </div>
          </div>
          
          {/* Conditional rendering based on active tab */}
          {activeTab === 'meeting' ? (
            <MeetingTab 
              selectedMeeting={selectedMeeting} 
            />
          ) : (
            <YourTab />
          )}
        </div>
      </div>
    </div>
  );
}

// MeetingTab component modifications
function MeetingTab({ selectedMeeting }) {
  // Chart data for rescheduling frequency
  const rescheduleChartData = {
    labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    datasets: [{
      label: 'Continuity',
      data: [1000, 1800, 4500, 1800, 2000, 4000, 3500],
      borderColor: '#2E9AFE',
      backgroundColor: 'rgba(46, 154, 254, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#2E9AFE',
      pointBorderColor: '#FFFFFF',
      pointBorderWidth: 2,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#2E9AFE',
      pointHoverBorderColor: '#FFFFFF',
      pointHoverBorderWidth: 2
    }]
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
  
  // Chart data for scheduling accuracy
  const schedulingChartData = {
    labels: ['S', 'T', 'M', 'Th', 'W', 'St', 'S'],
    datasets: [{
      data: [30, 50, 25, 65, 40, 20, 35],
      backgroundColor: (context) => {
        return context.dataIndex === 3 ? '#4B49FF' : '#D0D0D0';
      },
      borderRadius: 5,
      barThickness: 20,
      hoverBackgroundColor: (context) => {
        return context.dataIndex === 3 ? '#3f3de0' : '#b8b8b8';
      }
    }]
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

  // Chart data for engagement metrics
  const engagementData = {
    speakingTime: 92,
    participantEngagement: 68,
    chatEngagement: 10
  };

  return (
    <>
      {/* Charts Row */}
      <div className="row mb-4 g-3">
        {/* Rescheduling Frequency */}
        <div className="col-12 col-md-4">
          <div className="card shadow-sm rounded-4 h-100">
            <div className="card-body p-3 p-md-4">
              <h5 className="fw-bold mb-3">Rescheduling Frequency</h5>
              <div className="text-muted small mb-2">— CONTINUITY</div>
              <div style={{ height: '200px' }}>
                <Line data={rescheduleChartData} options={rescheduleChartOptions} />
              </div>
            </div>
          </div>
        </div>
      
        {/* Scheduling Accuracy */}
        <div className="col-12 col-md-4">
          <div className="card shadow-sm rounded-4 h-100">
            <div className="card-body p-3 p-md-4">
              <h5 className="fw-bold mb-3">Scheduling Accuracy</h5>
              <div className="text-muted mb-2">Expectation redundancy</div>
              <div style={{ height: '200px' }}>
                <Bar data={schedulingChartData} options={schedulingChartOptions} />
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
          <div className="card shadow-sm rounded-4 h-100">
            <div className="card-body p-3 p-md-4">
              <h5 className="fw-bold mb-3">Engagement Analytics</h5>
      
              <EngagementMetric 
                title="Speaking Time Distribution"
                subtitle="percent is given to the Host"
                value={engagementData.speakingTime}
                color="#00D8FF"
              />
              
              <EngagementMetric 
                title="Participant engagement"
                subtitle="Shows an average percentage of engagement"
                value={engagementData.participantEngagement}
                color="#FF9F40"
              />
              
              <EngagementMetric 
                title="Chat engagement"
                subtitle="Chats conducted on the topic of this meeting"
                value={engagementData.chatEngagement}
                color="#FF5EAA"
              />
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

// YourTab Component
function YourTab() {
  // Chart data for meeting span
  const meetingSpanData = {
    labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
    datasets: [{
      label: 'Continuity',
      data: [1500, 2000, 4000, 2000, 2500, 4000, 3500],
      borderColor: '#36A2EB',
      backgroundColor: 'rgba(54, 162, 235, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#36A2EB',
      pointBorderColor: '#FFFFFF',
      pointBorderWidth: 2,
      pointHoverRadius: 6
    }]
  };

  // Chart options for meeting span
  const meetingSpanOptions = {
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
        displayColors: false
      }
    }
  };

  // Availability data for doughnut chart
  const availabilityData = {
    labels: ['Available', 'Unavailable', 'Tendency'],
    datasets: [{
      data: [60, 20, 20],
      backgroundColor: ['#4361EE', '#FF8FA3', '#FEB95F'],
      borderWidth: 0,
      cutout: '60%',
      
    }]
  };

  // Options for doughnut chart
  const availabilityOptions = {
    ...commonChartOptions,
    cutout: '60%',
    plugins: {
      ...commonChartOptions.plugins,
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}%`;
          }
        }
      }
    }
  };

  // Participation data for radar chart (could be used as an alternative visualization)
  const participationData = {
    labels: ['Engagement', 'Punctuality', 'Contribution', 'Preparation', 'Follow-up'],
    datasets: [{
      data: [34, 30, 28, 32, 29],
      backgroundColor: 'rgba(67, 97, 238, 0.2)',
      borderColor: '#4361EE',
      pointBackgroundColor: '#4361EE',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#4361EE'
    }]
  };

  return (
    <>
      <div className="row g-4 mb-4">
        {/* Availability Card */}
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <h5 className="fw-bold text-center mb-4">Availability</h5>
              
              <div className="d-flex justify-content-center mb-4" style={{ height: '180px' }}>
                <Doughnut data={availabilityData} options={availabilityOptions} />
              </div>
              
              <div className="row text-center">
                <div className="d-flex align-items-center mb-2 w-100 justify-content-between">
                  <div className="d-flex align-items-center mb-2">
                    <div className="rounded-circle me-2" style={{ width: '10px', height: '10px', backgroundColor: '#4361EE' }}></div>
                    <div className="text-start">{availabilityData.labels[0]}</div>
                  </div>
                  <div className="fw-bold">{availabilityData.datasets[0].data[0]}</div>
                </div>
                <div className="d-flex align-items-center mb-2 w-100 justify-content-between">
                  <div className="d-flex align-items-center mb-2">
                    <div className="rounded-circle me-2" style={{ width: '10px', height: '10px', backgroundColor: '#FF8FA3' }}></div>
                    <div className="text-start">{availabilityData.labels[1]}</div>
                  </div>
                  <div className="fw-bold">{availabilityData.datasets[0].data[1]}</div>
                </div>
                <div className="d-flex align-items-center mb-2 w-100 justify-content-between">
                  <div className="d-flex align-items-center mb-2">
                    <div className="rounded-circle me-2" style={{ width: '10px', height: '10px', backgroundColor: '#FEB95F' }}></div>
                    <div className="text-start">{availabilityData.labels[2]}</div>
                  </div>
                  <div className="fw-bold">{availabilityData.datasets[0].data[2]}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Participation Card */}
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <h5 className="fw-bold text-center mb-4">Participation</h5>
              
              <div className="d-flex justify-content-center align-items-center mb-4" style={{ height: '180px' }}>
                <GaugeChart value={10} maxValue={50} label="Excellent" />
              </div>
              
              <div className="text-center">
                <button className="btn btn-light btn-sm rounded-pill px-4">Details</button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Meeting Span Card */}
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Meeting Span</h5>
                <div className="text-muted small">— CONTINUITY</div>
              </div>
              
              <div style={{ height: '220px' }}>
                <Line data={meetingSpanData} options={meetingSpanOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* User Reviews Section */}
      <h3 className="fw-bold mb-4">User reviews</h3>
      
      <div className="row g-4">
        {/* User 1 Review */}
        <div className="col-12">
          <div className="d-flex mb-4 w-75">
            <div className="flex-shrink-0 me-3">
              <img src="/profile.png" alt="User 1" className="rounded-circle" style={{ width: '60px', height: '60px' }} />
            </div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between mb-2">
                <h5 className="fw-bold mb-0">User 1</h5>
                <div className="text-muted small">12/01/24</div>
              </div>
              <p>
                Sarah was an excellent collaborator during our recent project meeting.
                She came well-prepared, contributed thoughtful insights, and kept the
                discussion focused and productive. Her ability to summarize complex
                ideas clearly was particularly impressive. Looking forward to working
                with her again!
              </p>
            </div>
          </div>
          
          {/* User 2 Review */}
          <div className="d-flex mb-4 w-75">
            <div className="flex-shrink-0 me-3">
                <img src="/profile.png" alt="User 1" className="rounded-circle" style={{ width: '60px', height: '60px' }} />
            </div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between mb-2">
                <h5 className="fw-bold mb-0">User 2</h5>
                <div className="text-muted small">12/01/24</div>
              </div>
              <p>
                Sarah was an excellent collaborator during our recent project meeting.
                She came well-prepared, contributed thoughtful insights, and kept the
                discussion focused and productive. Her ability to summarize complex
                ideas clearly was particularly impressive. Looking forward to working
                with her again!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Custom GaugeChart component
const GaugeChart = ({ value, maxValue = 50, label = "" }) => {
  // Calculate the percentage (0-100)
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  
  // Data for the doughnut chart
  const data = {
    datasets: [
      {
        data: [percentage, 100 - percentage], // Value and remaining space
        backgroundColor: ['#4361EE', '#EFEFEF'],
        borderWidth: 0,
        circumference: 270, // 270 degree arc (not complete circle, leaves bottom open)
        rotation: 225, // Rotated to start from bottom-left
        weight: 0.5, // Make the gauge thicker
      },
    ],
  };

  // Chart options
  const options = {
    cutout: '70%', // How large the hole in the middle is
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
      tooltip: {
        enabled: false, // Disable tooltips
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <div className="relative w-48 h-48">
      <div className="w-full h-full">
        <Doughnut data={data} options={options} />
      </div>
      
      {/* Center with user icon */}
      
      
      {/* Score display */}
      {label && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center">
          <h2 className="font-bold text-xl mb-0">{value}</h2>
          <div className="text-gray-500 text-sm">{label}</div>
        </div>
      )}
    </div>
  );
}