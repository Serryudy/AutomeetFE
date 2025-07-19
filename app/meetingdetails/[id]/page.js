'use client';

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/global.css';
import SidebarMenu from '@/components/SideMenucollapse';
import ProfileHeader from '@/components/profileHeader';
import Calendar from '@/components/calendar';
import { FaEdit, FaCalendarAlt, FaChevronDown, FaSearch, FaFilter, FaCheckCircle, FaBars, FaTimes } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import SearchBar from '@/components/meetingsearchbar';

const MeetingForm = () => {
    const params = useParams();
    const meetingId = params?.id;
    
    const [title, setTitle] = useState('');
    const [originalTitle, setOriginalTitle] = useState(''); // Store original title
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [repeat, setRepeat] = useState('Does not repeat');
    const [status, setStatus] = useState('Confirmed');
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [showStartTime, setShowStartTime] = useState(false);
    const [showEndTime, setShowEndTime] = useState(false);
    const [startTime, setStartTime] = useState("09:00 AM");
    const [endTime, setEndTime] = useState("10:00 AM");
    const [timeSlots, setTimeSlots] = useState([]);
    const [timeError, setTimeError] = useState('');
    const [participants, setParticipants] = useState([]);
    const [searchContact, setSearchContact] = useState('');
    const [hosts, setHosts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const [isMobile, setIsMobile] = useState(false);
    const [meetingData, setMeetingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState('');
    const [meetingType, setMeetingType] = useState('');
    const [roundRobinDuration, setRoundRobinDuration] = useState('');
    const [participantsToAdd, setParticipantsToAdd] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [dateError, setDateError] = useState('');
    const [userProfiles, setUserProfiles] = useState({});
    const [uploadedContent, setUploadedContent] = useState([]);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [allContacts, setAllContacts] = useState([]);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [showRepeatDropdown, setShowRepeatDropdown] = useState(false);
    const [showDurationDropdown, setShowDurationDropdown] = useState(false);
    const [participantError, setParticipantError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [isUploadProcessing, setIsUploadProcessing] = useState(false);
    const [isTakeNotesProcessing, setIsTakeNotesProcessing] = useState(false);
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    
    // New states for host availability management (from first file)
    const [hasSubmittedAvailability, setHasSubmittedAvailability] = useState(false);
    const [availabilitySubmissionLoading, setAvailabilitySubmissionLoading] = useState(false);

    useEffect(() => {
      console.log("Params object:", params);
      console.log("Meeting ID:", meetingId);
      console.log("URL path:", window.location.pathname);
    }, [params, meetingId]);

    // Function to get current username (from first file)
    const getCurrentUsername = () => {
      // This should return the current logged-in user's username
      // You might get this from context, localStorage, or decode from JWT
      // Adjust this based on your auth implementation
      return localStorage.getItem('username') || sessionStorage.getItem('username') || ''; 
    };

    // Function to check if host has submitted availability (from first file)
    const checkHostAvailabilityStatus = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/participant/availability/${meetingId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (response.ok) {
          const availabilityData = await response.json();
          // Check if current user has submitted availability
          const currentUser = getCurrentUsername();
          const userHasSubmitted = Array.isArray(availabilityData) && 
            availabilityData.some(avail => avail.username === currentUser);
          setHasSubmittedAvailability(userHasSubmitted);
          
          // If user has submitted, load their time slots
          if (userHasSubmitted) {
            const userAvailability = availabilityData.find(avail => avail.username === currentUser);
            if (userAvailability && userAvailability.timeSlots) {
              const formattedTimeSlots = userAvailability.timeSlots.map((slot, index) => {
                const startDate = new Date(slot.startTime);
                const endDate = new Date(slot.endTime);
                
                const formatTime = (date) => {
                  let hours = date.getHours();
                  const minutes = date.getMinutes().toString().padStart(2, '0');
                  const ampm = hours >= 12 ? 'PM' : 'AM';
                  hours = hours % 12;
                  hours = hours ? hours : 12;
                  return `${hours}:${minutes} ${ampm}`;
                };
                
                return {
                  id: index + 1,
                  start: formatTime(startDate),
                  end: formatTime(endDate),
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  date: startDate.toDateString()
                };
              });
              
              setTimeSlots(formattedTimeSlots);
              if (formattedTimeSlots.length > 0) {
                setSelectedDate(new Date(formattedTimeSlots[0].startTime));
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking availability status:', error);
      }
    };

    // Function to submit host availability (from first file)
const submitHostAvailability = async () => {
  if (timeSlots.length === 0) {
    alert('Please add at least one time slot before submitting availability.');
    return;
  }

  // Show confirmation modal instead of directly submitting
  setShowSubmissionModal(true);
};

// Add new function to perform actual submission
const performSubmitAvailability = async () => {
  setAvailabilitySubmissionLoading(true);
  setShowSubmissionModal(false);
  
  try {
    // Format time slots for API submission
    const formattedTimeSlots = timeSlots.map(slot => ({
      startTime: slot.startTime,
      endTime: slot.endTime
    }));

    const availabilityPayload = {
      id: '', // Will be generated by backend
      username: getCurrentUsername(),
      meetingId: meetingId,
      timeSlots: formattedTimeSlots,
      submittedAt: new Date().toISOString()
    };

    const response = await fetch('http://localhost:8080/api/participant/availability', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(availabilityPayload),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error submitting availability: ${response.status}`);
    }

    const result = await response.json();
    console.log('Availability submitted successfully:', result);
    
    setHasSubmittedAvailability(true);
    showSuccessMessage('Your availability has been submitted successfully! Participants will be notified when all hosts have submitted their availability.');
    
    // Disable editing after successful submission
    setIsEditing(false);
    
  } catch (error) {
    console.error('Error submitting availability:', error);
    alert(`Failed to submit availability: ${error.message}`);
  } finally {
    setAvailabilitySubmissionLoading(false);
  }
};

    // Check if the user can edit the meeting based on status and role
    const canEdit = () => {
      // If meeting is canceled, no one can edit
      if (meetingData?.status === 'canceled') {
        return false;
      }
      
      // Round robin hosts can edit their availability
      if (userRole === 'host' && meetingData.meetingType === 'round_robin' && !hasSubmittedAvailability) {
        return true;
      }
      
      // If meeting is confirmed, only creator can edit
      if (meetingData?.status === 'confirmed') {
        return userRole === 'creator';
      }
      
      // For other statuses, creator can edit
      return userRole === 'creator';
    };

    // Check if user can cancel meeting based on meeting type and role
    const canCancelMeeting = () => {
      // If meeting is canceled, no one can cancel
      if (meetingData?.status === 'canceled') {
        return false;
      }
      
      // If meeting is confirmed
      if (meetingData?.status === 'confirmed') {
        if (meetingType === 'round_robin') {
          // Round robin: creator and hosts can cancel
          return userRole === 'creator' || userRole === 'host';
        } else if (meetingType === 'group') {
          // Group: only creator can cancel
          return userRole === 'creator';
        } else if (meetingType === 'direct') {
          // Direct: creator can cancel
          return userRole === 'creator';
        }
      }
      
      // For other statuses, only creator can cancel
      return userRole === 'creator';
    };

    // Check if user can upload/take notes (these are always available unless canceled)
    const canUploadOrTakeNotes = () => {
      return meetingData?.status !== 'canceled';
    };
  
    // Fetch meeting data
    useEffect(() => {
      const fetchMeetingData = async () => {
          
          if (!meetingId) return;
          
          try {
              setLoading(true);
              console.log(meetingId);
              // Fixed URL to properly access the endpoint
              const response = await fetch(`http://localhost:8080/api/meetings/${meetingId}`, {
                  method: 'GET',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  credentials: 'include', // This ensures cookies are sent with the request
              });
              
              if (!response.ok) {
                  throw new Error(`Error fetching meeting: ${response.status}`);
              }
              
              const data = await response.json();
              console.log('Meeting data received:', data); // Add logging to debug
              console.log('Full API response structure:', JSON.stringify(data, null, 2)); // Detailed log
              setMeetingData(data);
              
              // Update state with fetched data
              setTitle(data.title || '');
              setOriginalTitle(data.title || ''); // Store original title
              setDescription(data.description || '');
              setLocation(data.location || '');
              setRepeat(data.repeat || 'Does not repeat');
              setMeetingType(data.meetingType || '');
              setRoundRobinDuration(data.roundRobinDuration || '');
              setUserRole(data.role || '');
              
              // Check if current user (if host) has submitted availability for round robin meetings
              if (data.role === 'host' && data.meetingType === 'round_robin') {
                await checkHostAvailabilityStatus();
              } else {
                // Format and set time slots - handle different meeting types
                let timeSlotData = null;
                
                console.log('Meeting Type:', data.meetingType); // Debug meeting type
                console.log('Checking for time slots based on meeting type...'); // Debug log
                
                // Handle different meeting types with different data structures
                if (data.meetingType === 'direct' && data.directTimeSlot) {
                    console.log('Found directTimeSlot for direct meeting:', data.directTimeSlot);
                    // Convert single directTimeSlot object to array format
                    timeSlotData = [data.directTimeSlot];
                } else if (data.directTimeSlot && data.status === 'confirmed') {
                    // Handle confirmed meetings (group/round_robin) that now have a directTimeSlot
                    console.log('Found confirmed directTimeSlot for group/round_robin meeting:', data.directTimeSlot);
                    timeSlotData = [data.directTimeSlot];
                } else if ((data.meetingType === 'group' || data.meetingType === 'round_robin') && data.userAvailability && data.userAvailability.timeSlots) {
                    console.log('Found timeSlots in userAvailability for group/round_robin meeting:', data.userAvailability.timeSlots);
                    timeSlotData = data.userAvailability.timeSlots;
                } else {
                    // Fallback: check other possible locations
                    if (data.timeSlots) {
                        console.log('Found timeSlots in root:', data.timeSlots);
                        timeSlotData = data.timeSlots;
                    } else if (data.scheduledTimes) {
                        console.log('Found scheduledTimes:', data.scheduledTimes);
                        timeSlotData = data.scheduledTimes;
                    } else if (data.availability) {
                        console.log('Found availability:', data.availability);
                        timeSlotData = data.availability;
                    } else if (data.meeting_times) {
                        console.log('Found meeting_times:', data.meeting_times);
                        timeSlotData = data.meeting_times;
                    } else if (data.schedule) {
                        console.log('Found schedule:', data.schedule);
                        timeSlotData = data.schedule;
                    }
                }
                
                console.log('Final timeSlotData:', timeSlotData); // Debug log
                
                if (timeSlotData && Array.isArray(timeSlotData) && timeSlotData.length > 0) {
                    const formattedTimeSlots = timeSlotData.map((slot, index) => {
                        console.log('Processing slot:', slot); // Debug each slot
                        
                        // Handle different possible date formats
                        let startDate, endDate;
                        
                        if (slot.startTime && slot.endTime) {
                            startDate = new Date(slot.startTime);
                            endDate = new Date(slot.endTime);
                        } else if (slot.start_time && slot.end_time) {
                            startDate = new Date(slot.start_time);
                            endDate = new Date(slot.end_time);
                        } else if (slot.date && slot.startTime && slot.endTime) {
                            startDate = new Date(`${slot.date} ${slot.startTime}`);
                            endDate = new Date(`${slot.date} ${slot.endTime}`);
                        } else if (slot.date && slot.start && slot.end) {
                            startDate = new Date(`${slot.date} ${slot.start}`);
                            endDate = new Date(`${slot.date} ${slot.end}`);
                        } else {
                            console.warn('Invalid time slot format:', slot);
                            return null;
                        }
                        
                        // Validate dates
                        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                            console.warn('Invalid date in time slot:', slot);
                            return null;
                        }
                        
                        console.log('Processed dates:', { startDate, endDate }); // Debug dates
                        
                        // Format to 12 hour time
                        const formatTime = (date) => {
                            let hours = date.getHours();
                            const minutes = date.getMinutes().toString().padStart(2, '0');
                            const ampm = hours >= 12 ? 'PM' : 'AM';
                            hours = hours % 12;
                            hours = hours ? hours : 12; // the hour '0' should be '12'
                            return `${hours}:${minutes} ${ampm}`;
                        };
                        
                        return {
                            id: slot.id || index + 1,
                            start: formatTime(startDate),
                            end: formatTime(endDate),
                            startTime: slot.startTime || slot.start_time || startDate.toISOString(),
                            endTime: slot.endTime || slot.end_time || endDate.toISOString(),
                            date: startDate.toDateString() // Add the date string for display
                        };
                    }).filter(slot => slot !== null); // Remove invalid slots
                    
                    console.log('Formatted time slots:', formattedTimeSlots); // Debug log
                    
                    setTimeSlots(formattedTimeSlots);
                    // If there's at least one time slot, set the selected date to the first one
                    if (formattedTimeSlots.length > 0) {
                        setSelectedDate(new Date(formattedTimeSlots[0].startTime));
                    }
                } else {
                    console.log('No valid time slots found in meeting data'); // Debug log
                    console.log('Available keys in data:', Object.keys(data)); // Show all available keys
                    setTimeSlots([]);
                }
              }
              
              // Transform participants data
              if (data.participants) {
                  const formattedParticipants = data.participants.map((participant, index) => ({
                      id: index + 1,
                      name: participant.username,
                      group: `Access: ${participant.access}`,
                      access: participant.access,
                      phone: participant.phone || '',
                      email: participant.email || ''
                  }));
                  setParticipants(formattedParticipants);
                  
                  // Fetch user profile for each participant
                  data.participants.forEach(participant => {
                      fetchUserProfile(participant.username);
                  });
              }
              
              // Transform hosts data
              if (data.hosts) {
                  const formattedHosts = data.hosts.map((host, index) => ({
                      id: index + 1,
                      name: host.username,
                      group: 'Hosts',
                      access: host.access
                  }));
                  setHosts(formattedHosts);
                  
                  // Fetch user profile for each host
                  data.hosts.forEach(host => {
                      fetchUserProfile(host.username);
                  });
              }
              
              setLoading(false);
          } catch (err) {
              console.error('Error fetching meeting data:', err);
              setError(err.message);
              setLoading(false);
          }
      };
      
      fetchMeetingData();
    }, [meetingId]);
    
    // Function to fetch user profile
    const fetchUserProfile = async (username) => {
        try {
            const response = await fetch(`http://localhost:8080/api/users/${username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            
            if (!response.ok) {
                throw new Error(`Error fetching user profile: ${response.status}`);
            }
            
            const userData = await response.json();
            console.log(`User profile for ${username}:`, userData);
            
            // Update user profiles state with the new data
            setUserProfiles(prevProfiles => ({
                ...prevProfiles,
                [username]: userData
            }));
        } catch (err) {
            console.error(`Error fetching profile for ${username}:`, err);
        }
    };
    
    // Track window width for responsive design
    useEffect(() => {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
        setIsMobile(window.innerWidth < 768);
      };
      
      handleResize(); // Initial check
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

// Function to detect what has changed
const getChanges = () => {
  const changes = [];
  
  if (meetingData) {
    // Check title change
    if (title !== (meetingData.title || '')) {
      changes.push(`Title:  ${title}`);
    }
    
    // Check description change
    if (description !== (meetingData.description || '')) {
      changes.push(`Description:  ${description}`);
    }
    
    // Check location change
    if (location !== (meetingData.location || '')) {
      changes.push(`Location:  ${location}`);
    }
    
    // Check repeat change
    if (repeat !== (meetingData.repeat || 'Does not repeat')) {
      changes.push(`Repeat: ${repeat}`);
    }
    
    // Check duration change for group/round_robin
    if ((meetingType === 'group' || meetingType === 'round_robin') && 
        roundRobinDuration !== (meetingData.roundRobinDuration || '')) {
      changes.push(`Duration:  ${roundRobinDuration}`);
    }
    
    // Check participants changes
    if (participantsToAdd.length > 0) {
      changes.push(`Added participants: ${participantsToAdd.join(', ')}`);
    }
    
    // Check for removed participants
    if (meetingData.participants) {
      const originalUsernames = meetingData.participants.map(p => p.username);
      const currentUsernames = participants.map(p => p.name);
      const removedParticipants = originalUsernames.filter(
        username => !currentUsernames.includes(username)
      );
      
      if (removedParticipants.length > 0) {
        changes.push(`Removed participants: ${removedParticipants.join(', ')}`);
      }
    }
    
    // Check time slots changes for direct meetings
    if (meetingType === 'direct') {
      const hasOriginalTimeSlots = meetingData.directTimeSlot;
      const hasCurrentTimeSlots = timeSlots.length > 0;
      
      if (!hasOriginalTimeSlots && hasCurrentTimeSlots) {
        changes.push(`Added time slot: ${timeSlots[0].start} - ${timeSlots[0].end}`);
      } else if (hasOriginalTimeSlots && !hasCurrentTimeSlots) {
        changes.push(`Removed time slot`);
      } else if (hasOriginalTimeSlots && hasCurrentTimeSlots) {
        // Compare existing time slot
        const originalStart = new Date(meetingData.directTimeSlot.startTime);
        const originalEnd = new Date(meetingData.directTimeSlot.endTime);
        const currentStart = new Date(timeSlots[0].startTime);
        const currentEnd = new Date(timeSlots[0].endTime);
        
        if (originalStart.getTime() !== currentStart.getTime() || 
            originalEnd.getTime() !== currentEnd.getTime()) {
          changes.push(`Modified time slot: ${timeSlots[0].start} - ${timeSlots[0].end}`);
        }
      }
    }
  }
  
  return changes;
};

const validateForm = () => {
  let isValid = true;
  
  // Check if title is provided
  if (!title.trim()) {
    showErrorMessage('Please enter a meeting title');
    return false;
  }
  
  // Only require participants for direct meetings
  if (meetingType === 'direct' && participants.length === 0) {
    setParticipantError('At least one participant must be added to direct meetings');
    return false;
  }
  
  // Validate phone numbers for all participants
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  for (let participant of participants) {
    if (participant.phone && !phoneRegex.test(participant.phone.replace(/[\s\-\(\)]/g, ''))) {
      setPhoneError(`Invalid phone number for ${participant.name}`);
      return false;
    }
  }
  
  return true;
};

    // to update the form with validation
const handleSaveChanges = async () => {
  // For round robin hosts, handle availability submission
  if (userRole === 'host' && meetingData.meetingType === 'round_robin') {
    await submitHostAvailability();
    return;
  }
  
  // Validate form first for other types
  if (!validateForm()) {
    return;
  }
  
  setShowSaveModal(true);
};

// Actual save function
const performSaveChanges = async () => {
  try {
    setIsSaving(true);
    setShowSaveModal(false);
    
    // Prepare the update payload based on form data
    const updatePayload = {
      title,
      description,
      location,
      repeat
    };

    // Add duration for group and round_robin meetings
    if ((meetingType === 'group' || meetingType === 'round_robin') && roundRobinDuration) {
      updatePayload.duration = roundRobinDuration;
    }

    // Format time slots if there are any
    if (timeSlots.length > 0) {
      const formattedTimeSlots = timeSlots.map(slot => {
        return {
          startTime: slot.startTime,
          endTime: slot.endTime
        };
      });
      
      // For direct meetings, use directTimeSlot format
      if (meetingType === 'direct') {
        updatePayload.directTimeSlot = formattedTimeSlots[0]; // Only one slot for direct
      } else {
        updatePayload.timeSlots = formattedTimeSlots;
      }
    }
    
    // Add participants to add if any
    if (participantsToAdd.length > 0) {
      updatePayload.addParticipants = participantsToAdd;
    }
    
    // Determine which participants to remove by comparing current list with original
    if (meetingData && meetingData.participants) {
      const originalUsernames = meetingData.participants.map(p => p.username);
      const currentUsernames = participants.map(p => p.name);
      
      const usernamesRemoved = originalUsernames.filter(
        username => !currentUsernames.includes(username)
      );
      
      if (usernamesRemoved.length > 0) {
        updatePayload.removeParticipants = usernamesRemoved;
      }
    }
    
    // Make the API call to update the meeting
    const response = await fetch(`http://localhost:8080/api/meetings/${meetingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Error updating meeting: ${response.status}`);
    }
    
    const updatedMeeting = await response.json();
    console.log('Meeting updated successfully:', updatedMeeting);
    
    // Update the local state with the response
    setMeetingData(updatedMeeting);
    
    // Update original title after successful save
    setOriginalTitle(updatedMeeting.title || title);
    
    // Update other related states if needed
    if (updatedMeeting.participants) {
      const formattedParticipants = updatedMeeting.participants.map((participant, index) => ({
        id: index + 1,
        name: participant.username,
        group: `Access: ${participant.access}`,
        access: participant.access
      }));
      setParticipants(formattedParticipants);
      
      // Update user profiles for new participants
      updatedMeeting.participants.forEach(participant => {
        if (!userProfiles[participant.username]) {
          fetchUserProfile(participant.username);
        }
      });
    }
    
    if (updatedMeeting.hosts) {
      const formattedHosts = updatedMeeting.hosts.map((host, index) => ({
        id: index + 1,
        name: host.username,
        group: 'Hosts',
        access: host.access
      }));
      setHosts(formattedHosts);
    }
    
    // Reset participant management states
    setParticipantsToAdd([]);
    
    // Clear time slots or update with the response if available
    if (updatedMeeting.timeSlots) {
      const formattedTimeSlots = updatedMeeting.timeSlots.map((slot, index) => {
        const startDate = new Date(slot.startTime);
        const endDate = new Date(slot.endTime);
        
        const formatTime = (date) => {
          let hours = date.getHours();
          const minutes = date.getMinutes().toString().padStart(2, '0');
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12;
          hours = hours ? hours : 12;
          return `${hours}:${minutes} ${ampm}`;
        };
        
        return {
          id: index + 1,
          start: formatTime(startDate),
          end: formatTime(endDate),
          startTime: slot.startTime,
          endTime: slot.endTime
        };
      });
      
      setTimeSlots(formattedTimeSlots);
    }
    
    // Exit edit mode
    setIsEditing(false);
    
    // Show success notification
    showSuccessMessage('Meeting updated successfully!');
    
    // Refresh page after 3 seconds
    setTimeout(() => {
      window.location.reload();
    }, 3000);
    
  } catch (err) {
    console.error('Error updating meeting:', err);
    showErrorMessage(`Failed to update meeting: ${err.message}`);
  } finally {
    setIsSaving(false);
  }
};

    const locationOptions = [
  'Conference Room',
  'Virtual Meeting',
  'Office',
  'Other'
];

const repeatOptions = [
  'Does not repeat',
  'Daily',
  'Weekly',
  'Monthly',
  'Annually',
  'Every weekday (Mon-Fri)',
  'Custom'
];
const durationOptions = [
  '30 minutes',
  '45 minutes',
  '1 hour',
  '1.5 hours',
  '2 hours'
];

//Fetch all contacts when editing starts
useEffect(() => {
  const fetchAllContacts = async () => {
    if (isEditing) {
      try {
        const response = await fetch(`http://localhost:8080/api/contacts`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setAllContacts(data);
        }
      } catch (err) {
        console.error('Error fetching contacts:', err);
      }
    }
  };
  
  fetchAllContacts();
}, [isEditing]);

    //search contacts - Fixed to work properly
   const handleSearchContacts = async (query) => {
  setSearchContact(query);
  
  if (query.length === 0) {
    setSearchResults([]);
    return;
  }
  
  if (query.length < 1) {
    setSearchResults([]);
    return;
  }
  
  try {
    // Make API call to search contacts
    const response = await fetch(`http://localhost:8080/api/contacts/search?q=${encodeURIComponent(query)}`, {
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      setSearchResults(data);
    } else {
      // Fallback to filtering local contacts if API doesn't exist
      const filtered = allContacts.filter(contact => 
        contact.username.toLowerCase().includes(query.toLowerCase()) ||
        (contact.email && contact.email.toLowerCase().includes(query.toLowerCase())) ||
        (contact.phone && contact.phone.includes(query))
      );
      setSearchResults(filtered);
    }
  } catch (error) {
    console.error('Error searching contacts:', error);
    // Fallback to local filtering
    const filtered = allContacts.filter(contact => 
      contact.username.toLowerCase().includes(query.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(query.toLowerCase())) ||
      (contact.phone && contact.phone.includes(query))
    );
    setSearchResults(filtered);
  }
};

//Check if participant is already added

const isParticipantAdded = (username) => {
  return participants.some(p => p.name === username) || 
         hosts.some(h => h.name === username);
};
    //add participants with validation
    const addParticipant = (contact) => {
      // Phone validation
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (contact.phone && !phoneRegex.test(contact.phone.replace(/[\s\-\(\)]/g, ''))) {
        setPhoneError(`Invalid phone number for ${contact.username}`);
        return;
      }
      
      const newParticipant = {
        id: Date.now(),
        name: contact.username,
        group: `Access: pending`,
        access: "pending",
        phone: contact.phone || '',
        email: contact.email || ''
      };
      
      const isDuplicate = participants.some(p => p.name === contact.username);
      
      if (!isDuplicate) {
        setParticipants([...participants, newParticipant]);
        setParticipantsToAdd([...participantsToAdd, contact.username]);
        
        // Clear any participant error since we now have participants
        setParticipantError('');
        setPhoneError('');
        
        // Also fetch the profile for the new participant
        fetchUserProfile(contact.username);
      }
      
      // Clear search
      setSearchContact('');
      setSearchResults([]);
    };

    // cancel meeting functionality with modal

const cancelMeeting = () => {
  setShowDeleteModal(true);
};

// FIXED: Cancel meeting function with single popup message
const performCancelMeeting = async () => {
  // Disable the button immediately
  setIsCancelling(true);
  setShowDeleteModal(false);
  
  try {
    // Call the deletion API endpoint
    const response = await fetch(`http://localhost:8080/api/meetings/${meetingId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // This ensures cookies are sent with the request
    });
    
    if (!response.ok) {
      throw new Error(`Error canceling meeting: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Meeting canceled successfully:', result);
    
    // Set the deleted state to true to show redirect message
    setIsDeleted(true);
    
    // Show success popup message - ONLY THIS ONE
    showSuccessMessage('Meeting deleted successfully!');
    
    // Redirect to meetings page after 5 seconds
    setTimeout(() => {
      window.location.href = '/meeting';
    }, 5000);
    
  } catch (err) {
    console.error('Error canceling meeting:', err);
    showErrorMessage(`Failed to cancel meeting: ${err.message}`);
    // Re-enable the button if there's an error
    setIsCancelling(false);
  }
};

// Message functions
const showSuccessMessage = (message) => {
  // Create and show success popup
  const popup = document.createElement('div');
  popup.className = 'alert alert-success position-fixed';
  popup.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  popup.innerHTML = `
  ${message}
    <button type="button" class="btn-close float-end" onclick="this.parentElement.remove()"></button>
  `;
  document.body.appendChild(popup);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (popup.parentElement) {
      popup.remove();
    }
  }, 5000);
};

const showErrorMessage = (message) => {
  // Create and show error popup
  const popup = document.createElement('div');
  popup.className = 'alert alert-danger position-fixed';
  popup.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  popup.innerHTML = `
    <strong>Error!</strong> ${message}
    <button type="button" class="btn-close float-end" onclick="this.parentElement.remove()"></button>
  `;
  document.body.appendChild(popup);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (popup.parentElement) {
      popup.remove();
    }
  }, 5000);
};
    
    // Add another function to handle participant access changes
    const handleParticipantAccessChange = (participantId, checked) => {
      setParticipants(
        participants.map(participant => 
          participant.id === participantId 
            ? { ...participant, access: checked ? "accepted" : "pending" }
            : participant
        )
      );
    };
    
    const removeParticipant = (id) => {
      setParticipants(participants.filter(participant => participant.id !== id));
    };
    
    // Get profile picture for a user
    const getProfilePicture = (username) => {
      if (userProfiles[username] && userProfiles[username].profile_pic) {
        return userProfiles[username].profile_pic;
      }
      return "/profile.png"; // Default image
    };
    

    // Refs for detecting clicks outside the dropdown
    const startTimeRef = useRef(null);
    const endTimeRef = useRef(null);
    const calendarRef = useRef(null);

    const handleDateSelect = (date) => {
      const newDate = date instanceof Date ? date : new Date(date);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (newDate < today) {
        setDateError('Please select a date from today or in the future');
        return;
      }

      setDateError('');
      setSelectedDate(newDate);
      setShowCalendar(false);
    };

    const generateTimeOptions = () => {
      const times = [];
      let hour = 12;
      let period = "AM";

      for (let i = 0; i < 24; i++) {
          times.push(`${hour}:00 ${period}`);
          hour = hour === 12 ? 1 : hour + 1;
          if (hour === 12) period = period === "AM" ? "PM" : "AM";
      }
      return times;
    };

    // Time validation function
    const validateTimeFormat = (time) => {
      const timeRegex = /^(1[0-2]|0?[1-9]):([0-5][0-9]) (AM|PM)$/i;
      return timeRegex.test(time);
    };


    // Convert 12-hour format to ISO format
    const convertToISOFormat = (dateStr, timeStr) => {
      const date = new Date(dateStr);
      const [timePart, period] = timeStr.split(' ');
      let [hours, minutes] = timePart.split(':');
      
      hours = parseInt(hours);
      minutes = parseInt(minutes);

      if (period.toLowerCase() === 'pm' && hours !== 12) {
        hours += 12;
      }
      if (period.toLowerCase() === 'am' && hours === 12) {
        hours = 0;
      }

      date.setHours(hours, minutes, 0, 0);
      return date.toISOString();
    };

    // Convert time to 24-hour format for comparison
    const convertTo24HourFormat = (time) => {
      const [timePart, period] = time.split(' ');
      let [hours, minutes] = timePart.split(':');
      
      hours = parseInt(hours);
      minutes = parseInt(minutes);

      if (period.toLowerCase() === 'pm' && hours !== 12) {
          hours += 12;
      }
      if (period.toLowerCase() === 'am' && hours === 12) {
          hours = 0;
      }

      return hours * 60 + minutes;
    };

    const handleAddTimeSlot = () => {
      setTimeError('');

      if (!validateTimeFormat(startTime)) {
        setTimeError('Invalid start time format. Use HH:MM AM/PM');
        return;
      }

      if (!validateTimeFormat(endTime)) {
        setTimeError('Invalid end time format. Use HH:MM AM/PM');
        return;
      }

      const startMinutes = convertTo24HourFormat(startTime);
      const endMinutes = convertTo24HourFormat(endTime);

      if (endMinutes <= startMinutes) {
        setTimeError('End time must be later than start time');
        return;
      }

      // Convert to ISO format for API
      const startTimeISO = convertToISOFormat(selectedDate, startTime);
      const endTimeISO = convertToISOFormat(selectedDate, endTime);

      const newTimeSlot = {
        id: Date.now().toString(), // Convert to string to ensure consistent ID type
        start: startTime,
        end: endTime,
        startTime: startTimeISO,
        endTime: endTimeISO
      };

      // Add null check before accessing timeSlots
      const currentTimeSlots = Array.isArray(timeSlots) ? timeSlots : [];
      
      // For direct meetings, replace the existing time slot instead of adding multiple
      if (meetingType === 'direct') {
        // Replace any existing time slot with the new one
        setTimeSlots([newTimeSlot]);
        console.log('Direct meeting: Replaced time slot with new one');
      } else if (userRole === 'host' && meetingType === 'round_robin') {
        // For round robin hosts adding availability
        const isDuplicate = currentTimeSlots.some(
          slot => slot?.start === newTimeSlot.start && slot?.end === newTimeSlot.end
        );

        if (isDuplicate) {
          setTimeError('This time slot has already been added');
          return;
        }

        setTimeSlots([...currentTimeSlots, newTimeSlot]);
        console.log('Round robin host: Added availability time slot');
      } else {
        // For other meeting types, check for duplicates before adding
        const isDuplicate = currentTimeSlots.some(
          slot => slot?.start === newTimeSlot.start && slot?.end === newTimeSlot.end
        );

        if (isDuplicate) {
          setTimeError('This time slot has already been added');
          return;
        }

        setTimeSlots([...currentTimeSlots, newTimeSlot]);
        console.log('Added new time slot to existing slots');
      }
    };

    const handleRemoveTimeSlot = (id) => {
      if (!Array.isArray(timeSlots) || !id) return;
      
      setTimeSlots(prevSlots => 
        prevSlots.filter(slot => slot?.id !== id)
      );
    };

    const handleTimeSelect = (time, type) => {
      if (type === "start") {
          setStartTime(time);
          setShowStartTime(false);
      } else if (type === "end") {
          setEndTime(time);
          setShowEndTime(false);
      }
    };

    const handleTimeChange = (value, type) => {
      if (type === "start") {
          setStartTime(value);
      } else {
          setEndTime(value);
      }
    };

    const handleDoubleClick = (type) => {
      if (type === "start") {
          setShowStartTime(true);
      } else if (type === "end") {
          setShowEndTime(true);
      }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
          if (startTimeRef.current && !startTimeRef.current.contains(event.target)) {
            setShowStartTime(false);
          }
          if (endTimeRef.current && !endTimeRef.current.contains(event.target)) {
            setShowEndTime(false);
          }
          if (calendarRef.current && !calendarRef.current.contains(event.target) && 
              !event.target.closest('.calendar-toggle')) {
            setShowCalendar(false);
          }
      };

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
          document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
    
    // Fetch uploaded content
    useEffect(() => {
      const fetchContent = async () => {
        if (!meetingId) return;

        try {
          const response = await fetch(`http://localhost:8080/api/meetings/${meetingId}/content`, {
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error('Failed to fetch content');
          }

          const data = await response.json();
          setUploadedContent(data.content || []);
        } catch (error) {
          console.error('Error fetching content:', error);
        }
      };

      fetchContent();
    }, [meetingId]);

if (loading) return <div className="p-4 text-center"><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Loading meeting data...</div>;
if (error) return <div className="p-4 text-center text-danger">Error: {error}</div>;
//if (isDeleted) return <div className="p-4 text-center text-success fs-2">Redirecting to meetings page...</div>;
if (!meetingData) return <div className="p-4 text-center">No meeting data found</div>;
  
    return (
      <div className="container-fluid p-0">
        <div className="card shadow-sm bg-white rounded-3 p-3 p-md-4">
          <div className="card-body p-0">
            <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4 flex-wrap gap-2">
              <h2 className="fw-bold mb-0 fs-4 fs-md-3">{originalTitle || 'Meeting name'}</h2>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-info px-3 py-2 me-2">Role: {userRole}</span>
                {userRole === 'host' && meetingData.meetingType === 'round_robin' && (
                  <span className={`badge px-3 py-2 me-2 ${hasSubmittedAvailability ? 'bg-success' : 'bg-warning'}`}>
                    Availability: {hasSubmittedAvailability ? 'Submitted' : 'Pending'}
                  </span>
                )}
                {canEdit() ? (
                  <button 
                    className="btn btn-secondary d-flex align-items-center px-3 py-2"
                    onClick={() => setIsEditing(!isEditing)}
                    disabled={isCancelling}
                  >
                    <FaEdit className="me-2" /> {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                ) : (
                  <span className="badge bg-secondary px-3 py-2">
                    {userRole === 'host' && hasSubmittedAvailability ? 'Availability Submitted' : 'No editing allowed'}
                  </span>
                )}
              </div>
            </div>
  
            <div className="mb-3 mb-md-4">
              <p className="mb-1 fw-bold">Status</p>
              <span className={`badge ${
                (meetingType === 'direct' && meetingData.status !== 'canceled') ? 'bg-success' : 
                meetingData.status === 'confirmed' ? 'bg-success' : 
                meetingData.status === 'canceled' ? 'bg-danger' : 
                meetingData.status === 'pending' ? 'bg-warning' :
                'bg-primary'
              } px-3 py-2`}>
                {meetingData.status === 'canceled' ? 'Canceled' :
                 meetingType === 'direct' ? 'Confirmed' :
                 meetingData.status === 'confirmed' ? 'Confirmed' : 
                 meetingData.status === 'pending' ? 'Pending' :
                 meetingData.status || 'Unknown'}
              </span>
            </div>
            
            {meetingType && (
              <div className="mb-3 mb-md-4">
                <p className="mb-1 fw-bold">Meeting Type</p>
                <span className="badge bg-secondary px-3 py-2">
                  {meetingType === 'round_robin' ? 'Round Robin' : 
                   meetingType === 'group' ? 'Group' : 
                   meetingType === 'direct' ? 'Direct' : 
                   meetingType}
                </span>
                {(meetingType === 'round_robin' || meetingType === 'group') && roundRobinDuration && (
                  <span className="badge bg-info ms-2 px-3 py-2">Duration: {roundRobinDuration}</span>
                )}
              </div>
            )}
  
            <div className="mb-3 mb-md-4">
              <label htmlFor="title" className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                readOnly={!isEditing || (meetingType === 'direct' && participants.length === 0) || meetingData.status === 'canceled'}
                id="title"
                value={isEditing ? title : originalTitle}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  backgroundColor: (!isEditing || (meetingType === 'direct' && participants.length === 0) || meetingData.status === 'canceled') ? '#f8f9fa' : 'white'
                }}
              />
              {meetingType === 'direct' && participants.length === 0 && meetingData.status !== 'canceled' && (
                <small className="text-muted">
                  <strong>Note:</strong> Title can only be edited after adding at least one participant for direct meetings.
                </small>
              )}
            </div>
  
            {/* Date & Time Range section - Enhanced for round robin hosts */}
            {isEditing && ((meetingType === 'direct') || (userRole === 'host' && meetingType === 'round_robin' && !hasSubmittedAvailability)) && meetingData.status !== 'canceled' && (
              <div className="mb-3 mb-md-4">
                <label className="form-label">
                  {userRole === 'host' && meetingType === 'round_robin' ? 'Your Available Time Slots' : 'Date & Time Range'}
                </label>
                <div className="p-2 bg-light rounded">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    {/* Date Picker */}
                    <div
                      className="d-flex align-items-center bg-white py-2 px-3 rounded calendar-toggle"
                      style={{ 
                        cursor: "pointer", 
                        minWidth: isMobile ? "100%" : "190px",
                        maxWidth: "250px",
                        flex: "1 1 auto" 
                      }}
                      onClick={() => setShowCalendar(!showCalendar)}
                    >
                      <div className="text-center flex-grow-1 text-truncate">
                        {selectedDate ? selectedDate.toDateString() : "Select Date"}
                      </div>
                      <div className="ms-2">
                        <FaCalendarAlt />
                      </div>
                    </div>

                    {/* Calendar Popup */}
                    {showCalendar && (
                      <div
                        ref={calendarRef}
                        className="position-absolute shadow rounded bg-white"
                        style={{ 
                          top: isMobile ? "350px" : "350px", 
                          left: isMobile ? "15px" : "30px", 
                          zIndex: 10 
                        }}
                      >
                        <Calendar onDateSelect={handleDateSelect} value={selectedDate} />
                      </div>
                    )}

                    {/* Start Time Input */}
                    <div 
                      className="position-relative" 
                      ref={startTimeRef} 
                      style={{ 
                        flex: "1 1 120px", 
                        maxWidth: isMobile ? "100%" : "150px",
                        width: isMobile ? "100%" : "auto"
                      }}
                    >
                      <input
                        type="text"
                        className="form-control bg-white py-2 px-3 rounded"
                        readOnly={false}
                        style={{ width: "100%", cursor: "pointer" }}
                        placeholder="HH:MM AM/PM"
                        value={startTime}
                        onChange={(e) => handleTimeChange(e.target.value, "start")}
                        onDoubleClick={() => handleDoubleClick("start")}
                      />
                      {showStartTime && (
                        <div
                          className="position-absolute bg-white shadow p-3 rounded mt-1"
                          style={{ 
                            top: "100%", 
                            left: "0", 
                            zIndex: 10, 
                            maxHeight: "150px", 
                            overflowY: "auto",
                            width: "100%" 
                          }}
                        >
                          {generateTimeOptions().map((time, index) => (
                            <div
                              key={index}
                              className="py-2 px-3 hover-bg-light"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleTimeSelect(time, "start")}
                            >
                              {time}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* End Time Input */}
                    <div 
                      className="position-relative" 
                      ref={endTimeRef} 
                      style={{ 
                        flex: "1 1 120px", 
                        maxWidth: isMobile ? "100%" : "150px",
                        width: isMobile ? "100%" : "auto"
                      }}
                    >
                      <input
                        type="text"
                        className="form-control bg-white py-2 px-3 rounded"
                        readOnly={false}
                        style={{ width: "100%", cursor: "pointer" }}
                        placeholder="HH:MM AM/PM"
                        value={endTime}
                        onChange={(e) => handleTimeChange(e.target.value, "end")}
                        onDoubleClick={() => handleDoubleClick("end")}
                      />
                      {showEndTime && (
                        <div
                          className="position-absolute bg-white shadow p-3 rounded mt-1"
                          style={{ 
                            top: "100%", 
                            left: "0", 
                            zIndex: 10, 
                            maxHeight: "150px", 
                            overflowY: "auto",
                            width: "100%" 
                          }}
                        >
                          {generateTimeOptions().map((time, index) => (
                            <div
                              key={index}
                              className="py-2 px-3 hover-bg-light"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleTimeSelect(time, "end")}
                            >
                              {time}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add Button */}
                    <button
                      type="button"
                      className="btn btn-primary d-flex align-items-center justify-content-center"
                      style={{
                        minWidth: "40px",
                        height: "38px",
                        flexShrink: 0,
                      }}
                      onClick={handleAddTimeSlot}
                      disabled={false}
                    >
                      <FaCheckCircle />
                    </button>
                  </div>

                  {/* Display date error if any */}
                  {dateError && (
                    <div className="text-danger mt-2 small">
                      {dateError}
                    </div>
                  )}

                  {/* Display time error if any */}
                  {timeError && (
                    <div className="text-danger mt-2 small">
                      {timeError}
                    </div>
                  )}

                  {/* Instructional alert for round robin hosts */}
                  {userRole === 'host' && meetingData.meetingType === 'round_robin' && !hasSubmittedAvailability && isEditing && (
                    <div className="alert alert-info mt-3">
                      <strong>Host Instructions:</strong> Add your available time slots below. Once you submit your availability, 
                      participants will be notified when all hosts have submitted their schedules.
                    </div>
                  )}

                  {/* Validation message for round robin hosts */}
                  {userRole === 'host' && meetingData.meetingType === 'round_robin' && isEditing && timeSlots.length === 0 && (
                    <div className="alert alert-warning mt-3">
                      <strong>Note:</strong> You need to add at least one time slot before you can submit your availability.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Show message for non-direct meetings when editing (except round robin hosts) */}
            {isEditing && meetingType !== 'direct' && !(userRole === 'host' && meetingType === 'round_robin') && meetingData.status !== 'canceled' && (
              <div className="mb-3 mb-md-4">
                <label className="form-label">Date & Time Range</label>
                <div className="alert alert-warning">
                  <strong>Note:</strong> 
                  This meeting is of type "{meetingType === 'round_robin' ? 'Round Robin' : meetingType === 'group' ? 'Group' : meetingType}" and its schedule can't be changed here.
                </div>
              </div>
            )}

            {/* Always show scheduled time information from database */}
            {Array.isArray(timeSlots) && timeSlots.length > 0 && (
              <div className="mb-3 mb-md-4">
                <label className="form-label">
                  {userRole === 'host' && meetingType === 'round_robin' && !hasSubmittedAvailability ? 'Your Available Time Slots' : 'Scheduled Time'}
                </label>
                
                {/* Show status message for group/round_robin meetings */}
                {(meetingType === 'group' || meetingType === 'round_robin') && meetingData?.status === 'confirmed' && !(userRole === 'host' && !hasSubmittedAvailability) && (
                  <div className="alert alert-success mb-2">
                    <strong>Meeting Confirmed!</strong> The final schedule has been set based on participant availability.
                  </div>
                )}
                
                {/* Check if participant should see pending message for group/round_robin */}
                {(meetingType === 'round_robin' && meetingData?.status === 'pending' && userRole === 'participant') ? (
                  <div className="alert alert-warning">
                    <strong>Schedule Time Pending</strong>
                    <p className="mb-0 mt-2">This Round Robin meeting is waiting for participants to submit their availability. 
                    Once all participants provide their time preferences, the best meeting time will be automatically selected and displayed here.</p>
                  </div>
                ) : (meetingType === 'group' && meetingData?.status === 'pending' && userRole === 'participant') ? (
                  <div className="alert alert-warning">
                    <strong>Schedule Time Pending</strong>
                    <p className="mb-0 mt-2">This Group meeting is waiting for participants to submit their availability. 
                    Once all participants provide their time preferences, the best meeting time will be automatically selected and displayed here.</p>
                  </div>
                ) : (
                  <div className="p-2 bg-light rounded">
                    {meetingType === 'direct' ? (
                      // Direct Meeting Display
                      <div className="bg-light p-3 rounded">
                        <div className="fw-bold mb-2">Direct Meeting</div>
                        {timeSlots.map((slot) => (
                          <div key={slot?.id || Math.random()} 
                               className="d-flex align-items-center mb-2 p-2 bg-white rounded">
                            <div className="flex-grow-1">
                              <div className="fw-bold">
                                {new Date(slot.startTime).toLocaleDateString()}
                              </div>
                              <div>Direct Meeting: {slot?.start || ''} - {slot?.end || ''}</div>
                              <div className="text-muted">
                                All participants will join at this time
                              </div>
                            </div>
                            {isEditing && canEdit() && meetingType === 'direct' && meetingData.status !== 'canceled' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger ms-2"
                                onClick={() => handleRemoveTimeSlot(slot?.id)}
                                aria-label="Remove time slot"
                              >
                                <FaTimes />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : meetingType === 'round_robin' ? (
                      // Round Robin Display
                      <div className="bg-light p-3 rounded">
                        <div className="fw-bold mb-2">
                          {userRole === 'host' && !hasSubmittedAvailability ? 'Your Available Time Slots' :
                           meetingData?.status === 'pending' ? 'Round Robin Schedule' : 'Round Robin Sessions'}
                          {meetingData?.status === 'confirmed' && !(userRole === 'host' && !hasSubmittedAvailability) && (
                            <span className="badge bg-success ms-2">Confirmed</span>
                          )}
                        </div>
                        {timeSlots.map((slot, index) => (
                          <div key={slot?.id || Math.random()} 
                               className="d-flex align-items-center mb-2 p-2 bg-white rounded">
                            {userRole === 'host' && !hasSubmittedAvailability ? (
                              <div className="me-3">
                                <span className="badge bg-warning">Your Availability</span>
                              </div>
                            ) : meetingData?.status === 'pending' ? (
                              <div className="me-3">
                                <span className="badge bg-info">Available Time</span>
                              </div>
                            ) : meetingData?.status === 'confirmed' ? (
                              <div className="me-3">
                                <span className="badge bg-success">Confirmed Time</span>
                              </div>
                            ) : null}
                            <div className="flex-grow-1">
                              <div className="fw-bold">
                                {new Date(slot.startTime).toLocaleDateString()}
                              </div>
                              <div>{slot?.start || ''} - {slot?.end || ''}</div>
                              {roundRobinDuration && (
                                <small className="text-muted">
                                  {meetingData?.status === 'confirmed' ? 
                                    `Duration: ${roundRobinDuration} per participant` : 
                                    `Duration: ${roundRobinDuration} per participant`
                                  }
                                </small>
                              )}
                              {meetingData?.status === 'confirmed' && !(userRole === 'host' && !hasSubmittedAvailability) && (
                                <div className="text-success small">
                                  <strong>Final meeting time confirmed!</strong>
                                </div>
                              )}
                            </div>
                            {isEditing && userRole === 'host' && meetingType === 'round_robin' && !hasSubmittedAvailability && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger ms-2"
                                onClick={() => handleRemoveTimeSlot(slot?.id)}
                                aria-label="Remove time slot"
                              >
                                <FaTimes />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : meetingType === 'group' ? (
                      // Group Meeting Display
                      <div className="bg-light p-3 rounded">
                        <div className="fw-bold mb-2">
                          {meetingData?.status === 'pending' ? 'Group Schedule' : 'Group Sessions'}
                          {meetingData?.status === 'confirmed' && (
                            <span className="badge bg-success ms-2">Confirmed</span>
                          )}
                        </div>
                        {timeSlots.map((slot) => (
                          <div key={slot?.id || Math.random()} 
                               className="d-flex align-items-center mb-2 p-2 bg-white rounded">
                            {meetingData?.status === 'pending' && (
                              <div className="me-3">
                                <span className="badge bg-info">Available Time</span>
                              </div>
                            )}
                            {meetingData?.status === 'confirmed' && (
                              <div className="me-3">
                                <span className="badge bg-success">Confirmed Time</span>
                              </div>
                            )}
                            <div className="flex-grow-1">
                              <div className="fw-bold">
                                {new Date(slot.startTime).toLocaleDateString()}
                              </div>
                              <div>Group Meeting: {slot?.start || ''} - {slot?.end || ''}</div>
                              {meetingData?.status === 'pending' && roundRobinDuration && (
                                <small className="text-muted">
                                  Duration: {roundRobinDuration}
                                </small>
                              )}
                              {meetingData?.status === 'confirmed' && (
                                <div className="text-success small">
                                  <strong>All participants will join at this confirmed time</strong>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Regular Meeting Display
                      <div className="d-flex flex-wrap gap-2">
                        {timeSlots.map((slot) => (
                          <div key={slot?.id || Math.random()} 
                               className="d-flex align-items-center bg-white p-2 rounded border">
                            <div>
                              <span className="fw-bold">
                                {new Date(slot.startTime).toLocaleDateString()}
                              </span>
                              <span className="mx-1">|</span>
                              <span>{slot?.start || ''} - {slot?.end || ''}</span>
                            </div>
                            {isEditing && canEdit() && meetingType === 'direct' && meetingData.status !== 'canceled' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger ms-2"
                                onClick={() => handleRemoveTimeSlot(slot?.id)}
                                aria-label="Remove time slot"
                              >
                                <FaTimes />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Show different messages based on meeting type and status when no scheduled time exists */}
            {(!Array.isArray(timeSlots) || timeSlots.length === 0) && !isEditing && (
              <div className="mb-3 mb-md-4">
                <label className="form-label">Scheduled Time</label>
                {(meetingType === 'group' || meetingType === 'round_robin') ? (
                  meetingData?.status === 'pending' ? (
                    <div className="alert alert-warning">
                      <strong>Schedule Time Pending</strong>
                      <p className="mb-0 mt-2">This {meetingType === 'round_robin' ? 'Round Robin' : 'Group'} meeting is waiting for participants to submit their availability. 
                      Once all participants provide their time preferences, the best meeting time will be automatically selected and displayed here.</p>
                    </div>
                  ) : meetingData?.status === 'confirmed' ? (
                    <div className="alert alert-success">
                      <strong>Meeting Confirmed</strong>
                      <p className="mb-0 mt-2">This {meetingType === 'round_robin' ? 'Round Robin' : 'Group'} meeting has been confirmed but the scheduled time is not currently available.</p>
                    </div>
                  ) : (
                    <div className="alert alert-info">
                      <strong>Schedule Status:</strong> {meetingData?.status || 'Unknown'}
                      <p className="mb-0 mt-2">No scheduled time available for this {meetingType === 'round_robin' ? 'Round Robin' : 'Group'} meeting.</p>
                    </div>
                  )
                ) : (
                  <div className="alert alert-info">
                    No scheduled time available for this meeting.
                  </div>
                )}
              </div>
            )}

            {/* Special message for round robin hosts who haven't submitted availability */}
            {userRole === 'host' && meetingType === 'round_robin' && !hasSubmittedAvailability && !isEditing && (
              <div className="mb-3 mb-md-4">
                <label className="form-label">Your Availability</label>
                <div className="alert alert-warning">
                  <strong>Action Required:</strong> As a host, you need to submit your available time slots for this Round Robin meeting.
                  <p className="mb-0 mt-2">Click "Edit" to add your availability and help finalize the meeting schedule.</p>
                </div>
              </div>
            )}
  
            <div className="mb-3 mb-md-4">
              <label htmlFor="participants" className="form-label">Participants</label>
              
              {/* Show participant error */}
              {participantError && meetingData.status !== 'canceled' && (
                <div className="alert alert-danger mb-2">
                  {participantError}
                </div>
              )}
              
              {/* Show phone error */}
              {phoneError && meetingData.status !== 'canceled' && (
                <div className="alert alert-warning mb-2">
                  {phoneError}
                </div>
              )}

              {/* Show restriction message for non-direct meetings */}
              {isEditing && (meetingType === 'group' || meetingType === 'round_robin') && meetingData.status !== 'canceled' && !(userRole === 'host' && meetingType === 'round_robin') && (
                <div className="alert alert-info mb-3">
                  <strong>Note:</strong> Participants cannot be modified for {meetingType === 'round_robin' ? 'Round Robin' : 'Group'} meetings.
                </div>
              )}

              {/* Only show participant search for direct meetings */}
              {isEditing && meetingType === 'direct' && meetingData.status !== 'canceled' && (
                <div className="mb-3 position-relative">
                  <div className="position-relative">
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <FaSearch />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name, email, or phone"
                        value={searchContact}
                        onChange={(e) => handleSearchContacts(e.target.value)}
                        onFocus={() => {
                          if (allContacts.length > 0) {
                            setSearchResults(allContacts.slice(0, 20)); // Show first 20 contacts
                          }
                        }}
                        disabled={isSaving}
                      />
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => setSearchResults(searchResults.length > 0 ? [] : allContacts.slice(0, 20))}
                        disabled={isSaving}
                      >
                        <FaChevronDown />
                      </button>
                    </div>
                    
                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                      <div className="position-absolute w-100 mt-1 shadow-sm bg-white rounded border" style={{zIndex: 1000, maxHeight: '200px', overflowY: 'auto'}}>
                        {searchResults.map(contact => (
                          <div 
                            key={contact.username} 
                            className="p-2 border-bottom d-flex align-items-center justify-content-between hover-bg-light"
                            style={{cursor: 'pointer'}}
                          >
                            <div className="d-flex align-items-center flex-grow-1">
                              <img 
                                src={userProfiles[contact.username]?.profile_pic || "/profile.png"} 
                                alt={contact.username} 
                                className="rounded-circle me-2"
                                style={{width: '30px', height: '30px', objectFit: 'cover'}}
                              />
                              <div className="flex-grow-1">
                                <div className="fw-bold">{contact.username}</div>
                                {contact.email && <small className="text-muted d-block">{contact.email}</small>}
                                {contact.phone && <small className="text-muted d-block">{contact.phone}</small>}
                              </div>
                            </div>
                            {isParticipantAdded(contact.username) ? (
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Remove participant logic
                                  const participantToRemove = participants.find(p => p.name === contact.username);
                                  if (participantToRemove) {
                                    removeParticipant(participantToRemove.id);
                                  }
                                }}
                                disabled={isSaving}
                              >
                                Remove
                              </button>
                            ) : (
                              <button 
                                className="btn btn-sm btn-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addParticipant(contact);
                                }}
                                disabled={isSaving}
                              >
                                Add
                              </button>
                            )}
                          </div>
                        ))}
                        
                        {searchContact.length >= 1 && searchResults.length === 0 && (
                          <div className="p-3 text-center text-muted">
                            No contacts found matching "{searchContact}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Display hosts section */}
              {hosts.length > 0 && (
                <div className="mb-3">
                  <h6 className="text-muted mb-2">Hosts</h6>
                  {hosts.map((host) => (
                    <div key={host.id} className="d-flex flex-column flex-md-row bg-light p-2 p-md-3 rounded mb-2">
                      <div className="d-flex align-items-center mb-2 mb-md-0 me-auto">
                        <img 
                          src={getProfilePicture(host.name)} 
                          alt="host" 
                          className="rounded-circle me-2 me-md-3"
                          style={{width: isMobile ? '30px' : '40px', height: isMobile ? '30px' : '40px', objectFit: 'cover'}}
                        />
                        <div>
                          <div className="fw-bold">{host.name}</div>
                          <small className="text-muted">Host - {host.access}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Display participants section */}
              {participants.length > 0 && (
                <div>
                  {participants.map((participant) => (
                    <div key={participant.id} className="d-flex flex-column flex-md-row bg-light p-2 p-md-3 rounded mb-2">
                      <div className="d-flex align-items-center mb-2 mb-md-0 me-auto">
                        <img 
                          src={getProfilePicture(participant.name)} 
                          alt="participant" 
                          className="rounded-circle me-2 me-md-3"
                          style={{width: isMobile ? '30px' : '40px', height: isMobile ? '30px' : '40px', objectFit: 'cover'}}
                        />
                        <div>
                          <div className="fw-bold">{participant.name}</div>
                          <small className="text-muted">{participant.group}</small>
                          {userProfiles[participant.name]?.company && (
                            <small className="d-block text-muted">{userProfiles[participant.name].company}</small>
                          )}
                        </div>
                      </div>
                      {/* Show access controls for direct meetings or remove button */}
                      {isEditing && meetingType === 'direct' && meetingData.status !== 'canceled' && (
                        <div className="d-flex gap-2 align-items-center mt-2 mt-md-0">
                          <div className="form-check form-switch me-3">
                            <input 
                              className="form-check-input"
                              type="checkbox" 
                              id={`accessSwitch-${participant.id}`}
                              checked={participant.access === "accepted"}
                              onChange={(e) => handleParticipantAccessChange(participant.id, e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor={`accessSwitch-${participant.id}`}>
                              Give access
                            </label>
                          </div>
                          <button 
                            type="button" 
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => removeParticipant(participant.id)}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {participants.length === 0 && hosts.length === 0 && (
                <div className="alert alert-info">No participants or hosts added to this meeting.</div>
              )}
            </div>
  
            <div className="mb-3 mb-md-4">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className="form-control"
                id="description"
                rows="3"
                placeholder="A short description for the meeting"
                value={isEditing ? description : (meetingData?.description || '')}
                onChange={(e) => setDescription(e.target.value)}
                readOnly={!isEditing || meetingData.status === 'canceled' || (userRole === 'host' && meetingType === 'round_robin')}
                style={{
                  backgroundColor: (!isEditing || meetingData.status === 'canceled' || (userRole === 'host' && meetingType === 'round_robin')) ? '#f8f9fa' : 'white'
                }}
              ></textarea>
            </div>
  
            {/* Location Input */}
            <div className="mb-3 mb-md-4">
              <label htmlFor="location" className="form-label">Location</label>
              <div className="input-group position-relative">
                <input
                  type="text"
                  className="form-control"
                  readOnly={!isEditing || meetingData.status === 'canceled' || (userRole === 'host' && meetingType === 'round_robin')}
                  placeholder="Choose a place for the meeting"
                  value={isEditing ? location : (meetingData?.location || '')}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={isSaving || meetingData.status === 'canceled' || (userRole === 'host' && meetingType === 'round_robin')}
                  style={{
                    backgroundColor: (!isEditing || meetingData.status === 'canceled' || (userRole === 'host' && meetingType === 'round_robin')) ? '#f8f9fa' : 'white'
                  }}
                />
                {isEditing && meetingData.status !== 'canceled' && !(userRole === 'host' && meetingType === 'round_robin') && (
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                    disabled={isSaving}
                  >
                    <FaChevronDown />
                  </button>
                )}
                
                {/* Location Dropdown */}
                {showLocationDropdown && isEditing && meetingData.status !== 'canceled' && !(userRole === 'host' && meetingType === 'round_robin') && (
                  <div className="position-absolute w-100 mt-1 shadow-sm bg-white rounded border" style={{top: '100%', zIndex: 1000}}>
                    {locationOptions.map(option => (
                      <div 
                        key={option}
                        className="p-2 border-bottom hover-bg-light"
                        style={{cursor: 'pointer'}}
                        onClick={() => {
                          setLocation(option);
                          setShowLocationDropdown(false);
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
  
            {/*Repeat input section*/}
            <div className="mb-4">
              <label htmlFor="repeat" className="form-label">Repeat</label>
              <div className="input-group position-relative">
                <input
                  type="text"
                  className="form-control"
                  readOnly={!isEditing || meetingData.status === 'canceled' || (userRole === 'host' && meetingType === 'round_robin')}
                  placeholder="Does not repeat"
                  value={isEditing ? repeat : (meetingData?.repeat || 'Does not repeat')}
                  onChange={(e) => setRepeat(e.target.value)}
                  disabled={isSaving || meetingData.status === 'canceled' || (userRole === 'host' && meetingType === 'round_robin')}
                  style={{
                    backgroundColor: (!isEditing || meetingData.status === 'canceled' || (userRole === 'host' && meetingType === 'round_robin')) ? '#f8f9fa' : 'white'
                  }}
                />
                {isEditing && meetingData.status !== 'canceled' && !(userRole === 'host' && meetingType === 'round_robin') && (
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={() => setShowRepeatDropdown(!showRepeatDropdown)}
                    disabled={isSaving}
                  >
                    <FaChevronDown />
                  </button>
                )}
                
                {/* Repeat Dropdown */}
                {showRepeatDropdown && isEditing && meetingData.status !== 'canceled' && !(userRole === 'host' && meetingType === 'round_robin') && (
                  <div className="position-absolute w-100 mt-1 shadow-sm bg-white rounded border" style={{top: '100%', zIndex: 1000}}>
                    {repeatOptions.map(option => (
                      <div 
                        key={option}
                        className="p-2 border-bottom hover-bg-light"
                        style={{cursor: 'pointer'}}
                        onClick={() => {
                          setRepeat(option);
                          setShowRepeatDropdown(false);
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/*Add Duration section for group and round_robin meetings*/}
            {(meetingType === 'group' || meetingType === 'round_robin') && (
              <div className="mb-4">
                <label htmlFor="duration" className="form-label">Duration</label>
                <div className="input-group position-relative">
                  <input
                    type="text"
                    className="form-control"
                    readOnly={!isEditing || (timeSlots && timeSlots.length > 0) || meetingData.status === 'canceled' || (userRole === 'host' && meetingType === 'round_robin')}
                    placeholder="Select duration"
                    value={isEditing ? roundRobinDuration : (meetingData?.roundRobinDuration || '')}
                    onChange={(e) => setRoundRobinDuration(e.target.value)}
                    disabled={isSaving || meetingData.status === 'canceled' || (userRole === 'host' && meetingType === 'round_robin')}
                    style={{
                      backgroundColor: (!isEditing || (timeSlots && timeSlots.length > 0) || meetingData.status === 'canceled' || (userRole === 'host' && meetingType === 'round_robin')) ? '#f8f9fa' : 'white'
                    }}
                  />
                  {isEditing && (!timeSlots || timeSlots.length === 0) && meetingData.status !== 'canceled' && !(userRole === 'host' && meetingType === 'round_robin') && (
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={() => setShowDurationDropdown(!showDurationDropdown)}
                      disabled={isSaving}
                    >
                      <FaChevronDown />
                    </button>
                  )}
                  
                  {/* Duration Dropdown */}
                  {showDurationDropdown && isEditing && (!timeSlots || timeSlots.length === 0) && meetingData.status !== 'canceled' && !(userRole === 'host' && meetingType === 'round_robin') && (
                    <div className="position-absolute w-100 mt-1 shadow-sm bg-white rounded border" style={{top: '100%', zIndex: 1000}}>
                      {durationOptions.map(option => (
                        <div 
                          key={option}
                          className="p-2 border-bottom hover-bg-light"
                          style={{cursor: 'pointer'}}
                          onClick={() => {
                            setRoundRobinDuration(option);
                            setShowDurationDropdown(false);
                          }}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Show information message when duration is locked */}
                {isEditing && timeSlots && timeSlots.length > 0 && meetingData.status !== 'canceled' && !(userRole === 'host' && meetingType === 'round_robin') && (
                  <small className="text-muted mt-1 d-block">
                    <strong>Note:</strong> Duration cannot be changed as this meeting already has scheduled availability from participants.
                  </small>
                )}
                
                {/* Show canceled message */}
                {meetingData.status === 'canceled' && (
                  <small className="text-danger mt-1 d-block">
                    <strong>Note:</strong> This meeting has been canceled and cannot be modified.
                  </small>
                )}
              </div>
            )}
  
            <div className="d-flex flex-wrap gap-2 mt-4">
              {meetingData.status === 'canceled' ? (
                /* Show message when meeting is canceled */
                <div className="alert alert-danger w-100 text-center">
                  <strong>This meeting has been canceled.</strong> No actions are available.
                </div>
              ) : isEditing ? (
                <>
                  {userRole === 'host' && meetingData.meetingType === 'round_robin' ? (
                    <>
                      <button 
                        className="btn btn-success me-2" 
                        onClick={submitHostAvailability}
                        disabled={availabilitySubmissionLoading || timeSlots.length === 0}
                      >
                        {availabilitySubmissionLoading ? 'Submitting...' : 'Submit Availability'}
                      </button>
                      <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className="btn btn-success me-2" 
                        onClick={handleSaveChanges}
                        disabled={isSaving || isCancelling}
                      >
                        {isSaving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => {
                          setIsEditing(false);
                          // Reset title to original when canceling edit
                          setTitle(originalTitle);
                          // Reset other fields to original values
                          setDescription(meetingData?.description || '');
                          setLocation(meetingData?.location || '');
                          setRepeat(meetingData?.repeat || 'Does not repeat');
                          setRoundRobinDuration(meetingData?.roundRobinDuration || '');
                          // Reset participants to original
                          if (meetingData?.participants) {
                            const formattedParticipants = meetingData.participants.map((participant, index) => ({
                              id: index + 1,
                              name: participant.username,
                              group: `Access: ${participant.access}`,
                              access: participant.access,
                              phone: participant.phone || '',
                              email: participant.email || ''
                            }));
                            setParticipants(formattedParticipants);
                          }
                          // Clear errors
                          setParticipantError('');
                          setPhoneError('');
                          setTimeError('');
                          setDateError('');
                        }}
                        disabled={isSaving || isCancelling}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Cancel Meeting Button - conditional based on role and meeting type */}
                  {canCancelMeeting() && (
                    <button 
                      className="btn btn-danger me-2" 
                      onClick={cancelMeeting}
                      disabled={isCancelling || isSaving || isUploadProcessing || isTakeNotesProcessing}
                    >
                      {isCancelling ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Processing...
                        </>
                      ) : (
                        'Cancel Meeting'
                      )}
                    </button>
                  )}
                  
                  {/* Mark Availability Button for round robin hosts */}
                  {userRole === 'host' && meetingData.meetingType === 'round_robin' && !hasSubmittedAvailability && (
                    <button 
                      className="btn btn-warning me-2" 
                      onClick={() => setIsEditing(true)}
                      disabled={isCancelling || isSaving || isUploadProcessing || isTakeNotesProcessing}
                    >
                      Mark Your Availability
                    </button>
                  )}
                  
                  {/* Upload Button - available to all unless canceled */}
                  <button 
                    className={`btn btn-primary me-2 ${!canUploadOrTakeNotes() ? 'opacity-50' : ''}`}
                    onClick={() => {
                      if (canUploadOrTakeNotes()) {
                        setIsUploadProcessing(true);
                        // Simulate processing or redirect
                        setTimeout(() => {
                          window.location.href = `/content/${meetingId}`;
                        }, 500);
                      }
                    }}
                    disabled={!canUploadOrTakeNotes() || isCancelling || isSaving || isUploadProcessing || isTakeNotesProcessing}
                    style={{ 
                      cursor: !canUploadOrTakeNotes() ? 'not-allowed' : 'pointer',
                      transition: 'opacity 0.2s ease'
                    }}
                  >
                    {!canUploadOrTakeNotes() ? (
                      'Upload (Canceled)'
                    ) : isUploadProcessing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : (
                      'Upload'
                    )}
                  </button>
                  
                  {/* Take Notes Button - available to all unless canceled */}
                  <button 
                    className={`btn btn-primary ${!canUploadOrTakeNotes() ? 'opacity-50' : ''}`}
                    onClick={() => {
                      if (canUploadOrTakeNotes()) {
                        setIsTakeNotesProcessing(true);
                        // Simulate processing or redirect
                        setTimeout(() => {
                          window.location.href = `/notes/${meetingId}`;
                        }, 500);
                      }
                    }}
                    disabled={!canUploadOrTakeNotes() || isCancelling || isSaving || isUploadProcessing || isTakeNotesProcessing}
                    style={{ 
                      cursor: !canUploadOrTakeNotes() ? 'not-allowed' : 'pointer',
                      transition: 'opacity 0.2s ease'
                    }}
                  >
                    {!canUploadOrTakeNotes() ? (
                      'Take notes (Canceled)'
                    ) : isTakeNotesProcessing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : (
                      'Take notes'
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Save Confirmation Modal */}
            {showSaveModal && (
              <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Confirm Changes</h5>
                      <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setShowSaveModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <p>Are you sure you want to save these changes to the meeting?</p>
                      {(() => {
                        const changes = getChanges();
                        if (changes.length > 0) {
                          return (
                            <div>
                              <strong>Changes:</strong>
                              <ul className="mb-0 mt-2">
                                {changes.map((change, index) => (
                                  <li key={index}>{change}</li>
                                ))}
                              </ul>
                            </div>
                          );
                        } else {
                          return <p className="text-muted">No changes detected.</p>;
                        }
                      })()}
                    </div>
                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => setShowSaveModal(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-success" 
                        onClick={performSaveChanges}
                      >
                        Yes, Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Submission Confirmation Modal */}
{showSubmissionModal && (
  <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Finalize Submission</h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setShowSubmissionModal(false)}
          ></button>
        </div>
        <div className="modal-body">
          <p>Your availability has been submitted successfully!</p>
        </div>
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => setShowSubmissionModal(false)}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-success" 
            onClick={performSubmitAvailability}
          >
            Yes, Save
          </button>
        </div>
      </div>
    </div>
  </div>
)}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
              <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Cancel Meeting</h5>
                      <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setShowDeleteModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <p>Are you sure you want to cancel the meeting <strong>"{originalTitle}"</strong>?</p>
                    </div>
                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => setShowDeleteModal(false)}
                      >
                        No, Keep Meeting
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-danger" 
                        onClick={performCancelMeeting}
                      >
                        Yes, Cancel Meeting
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success/Error Messages will be shown by JavaScript functions */}
          </div>
        </div>
      </div>
    );
};

export default function Details() {
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
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  // Add this handler function in the Details component
  const handleMeetingSelect = (meeting) => {
    if (meeting && meeting.id) {
      window.location.href = `/meetingdetails/${meeting.id}`;
    }
  };

  return (
    <div className="d-flex page-background font-inter" style={{ minHeight: '100vh' }}>  
      {/* Mobile Menu Button */}
      {isMobile && (
        <button 
          className="btn btn-primary position-fixed d-flex align-items-center justify-content-center" 
          style={{ top: '10px', left: '10px', zIndex: 1100, width: '40px', height: '40px' }}
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <FaTimes /> : <FaBars />}
        </button>
      )}
      
      {/* Sidebar */}
      <div style={{ 
        position: 'fixed', 
        left: 10, 
        top: 10, 
        bottom: 0, 
        zIndex: 1000,
        display: isMobile ? (showMobileMenu ? 'block' : 'none') : 'block'
      }}>
        <SidebarMenu 
          showmenuicon={true} 
          onToggle={handleSidebarToggle}
        />
      </div>
      
      {/* Mobile Overlay */}
      {isMobile && showMobileMenu && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" 
          style={{ zIndex: 999 }}
          onClick={() => setShowMobileMenu(false)}
        >
        </div>
      )}
      
      {/* Main content */}
      <div 
        className="flex-grow-1 p-3 p-md-4" 
        style={{
          marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '90px' : '340px'),
          maxWidth: isMobile ? '100%' : (isSidebarCollapsed ? 'calc(100% - 120px)' : 'calc(100% - 360px)'),
          transition: 'margin-left 0.3s ease-in-out, max-width 0.3s ease-in-out',
          paddingTop: isMobile ? '60px' : '0'
        }}
      >
        {/* Profile Header */}
        <div className="mb-3 mb-md-4">
          <ProfileHeader />
        </div>

        {/* Calendar Header */}
        <div className="mb-3 mb-md-4">
          <h1 className="h3 h2-md mb-1 mb-md-2 font-inter fw-bold">Meeting Details</h1>
          <p className="text-muted small">
            Dive into the details and make every meeting count.
          </p>
        </div>
        
        {/* Search Bar Component */}
        <SearchBar 
          onSelectMeeting={handleMeetingSelect}
          placeholder="Search meetings..."
          className="mb-3 mb-md-4"
          context="meetings"
        />
        
        <div>
            <MeetingForm />
        </div>
      </div>
    </div>
  );
}