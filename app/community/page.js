'use client';

import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/global.css';
import SidebarMenu from '../../components/SideMenucollapse';
import ProfileHeader from '@/components/profileHeader';
import MessageComponent from '@/components/MessageComponent';
import { FaBars, FaSearch, FaFilter, FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import axios from 'axios';

export default function Community() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [viewMode, setViewMode] = useState('clients');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  // Add state for showing the MessageComponent
  const [showMessageComponent, setShowMessageComponent] = useState(false);
  // State for animation
  const [messageAnimationState, setMessageAnimationState] = useState('hidden'); // 'hidden', 'animating', 'visible'
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [jwtToken, setJwtToken] = useState(''); 
   
  // Ref for handling clicks outside popup
  const contactModalRef = useRef(null);
  const groupModalRef = useRef(null);
  const messageComponentRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contactRes = await axios.get('http://localhost:8080/api/community/contacts', {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        setContacts(contactRes.data);

        const groupRes = await axios.get('http://localhost:8080/api/community/groups', {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        setGroups(groupRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [jwtToken]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < 768);
      if (width >= 768) setShowMobileMenu(false);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Add click outside handler for modals
    const handleClickOutside = (event) => {
      // Handle contact modal clicks
      if (contactModalRef.current && 
          !contactModalRef.current.contains(event.target) && 
          !event.target.closest('.contact-modal-trigger')) {
        setShowContactModal(false);
      }
      
      // Handle group modal clicks
      if (groupModalRef.current && 
          !groupModalRef.current.contains(event.target) && 
          !event.target.closest('.group-modal-trigger')) {
        setShowGroupModal(false);
      }
      
      // Handle message component clicks
      if (messageAnimationState === 'visible' && 
          messageComponentRef.current && 
          !messageComponentRef.current.contains(event.target) && 
          !event.target.closest('.message-component-trigger')) {
        closeMessageComponent();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [messageAnimationState]);

  // Function to create a new contact
  const createContact = async (newContact) => {
    try {
      const response = await axios.post('http://localhost:8080/api/community/contacts', newContact, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setContacts([...contacts, response.data]);
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  };

  // Function to create a new group
  const createGroup = async (newGroup) => {
    try {
      const response = await axios.post('http://localhost:8080/api/community/groups', newGroup, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setGroups([...groups, response.data]);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };


  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };
  
  // Handle group button click
  const handleGroupButtonClick = () => {
    if(viewMode === 'groups') {
      setShowGroupModal(true);
    } else {
      setViewMode('groups');
    }
  };

  const handleContactButtonClick = () => {
    if(viewMode === 'clients') {
      setShowContactModal(true);
    } else {
      setViewMode('clients');
    }
  };

  // Updated message component toggle with animation
  const toggleMessageComponent = () => {
    if (messageAnimationState === 'hidden') {
      // Open the message component
      setShowMessageComponent(true);
      // Start opening animation after a small delay to allow state to update
      setTimeout(() => {
        setMessageAnimationState('animating');
        // After animation completes, set to fully visible
        setTimeout(() => {
          setMessageAnimationState('visible');
        }, 300); // Match this time to your CSS transition time
      }, 10);
    } else {
      closeMessageComponent();
    }
  };
  
  // Function to close message component with animation
  const closeMessageComponent = () => {
    setMessageAnimationState('animating-out');
    // Wait for animation to complete before hiding component
    setTimeout(() => {
      setMessageAnimationState('hidden');
      setShowMessageComponent(false);
    }, 300); // Match this time to your CSS transition time
  };

  return (
    <div className="d-flex page-background font-inter" style={{ minHeight: '100vh', position: 'relative' }}>  
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
        <div className="mb-3 mb-md-4" style={{ marginTop: isMobile ? '50px' : '0' }}>
          <ProfileHeader />
        </div>

        {/* Content Header */}
        <div className="mb-3 mb-md-4">
          <h1 className="h3 h2-md mb-1 mb-md-2 font-inter fw-bold">Community</h1>
          <p className="text-muted small">
            Stay Connected and On Track
          </p>
        </div>

        {/* Search and Filter with New Group and New Contact Buttons */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mb-md-4 gap-3 ">
          <div className="position-relative" style={{ flex: '1' }}>
            <div className="input-group bg-white rounded-pill" style={{ height: windowWidth < 576 ? '40px' : '48px', border: '1px solid #e0e0e0' }}>
              <span className="input-group-text bg-transparent border-0">
                <FaSearch className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-0 shadow-none"
                placeholder={viewMode === 'clients' 
                  ? "Looking for someone? Search by name, email, or details!" 
                  : "Search for groups by name or description"}
              />
              <button className="btn btn-outline-secondary rounded-pill d-flex align-items-center gap-2 px-3 border-0">
                Filter <FaFilter />
              </button>
            </div>
          </div>
          
          {/* New Group Button */}
          <button 
            className={`btn btn-${viewMode === 'groups' ? 'primary' : 'secondary'} rounded-pill d-flex align-items-center gap-2 px-3 group-modal-trigger`} 
            style={{height: windowWidth < 576 ? '40px' : '48px'}} 
            onClick={handleGroupButtonClick}
          >
            <FaPlus /> New Group
          </button>
          
          {/* New Contact Button */}
          <button 
            className={`btn btn-${viewMode === 'clients' ? 'primary' : 'secondary'} rounded-pill d-flex align-items-center gap-2 px-3 contact-modal-trigger`} 
            style={{height: windowWidth < 576 ? '40px' : '48px'}} 
            onClick={handleContactButtonClick}
          >
            <FaPlus /> New Contact
          </button>
        </div>
        
        <div className='w-100 rounded-3 bg-white p-2 p-md-4 shadow-sm'>
          {/* Conditional rendering based on viewMode */}
          {viewMode === 'clients' && 
            <Contacts 
              setShowContactModal={setShowContactModal} 
              setEditingContact={setEditingContact} 
            />
          }
          {viewMode === 'groups' && 
            <Groups 
              setShowGroupModal={setShowGroupModal}
              setEditingGroup={setEditingGroup}
            />
          }
        </div>
        
      </div>

      {/* Conditionally render contact modal */}
      {showContactModal && viewMode === 'clients' && (
        <NewContact 
          setShowContactModal={setShowContactModal} 
          contactModalRef={contactModalRef}
          editingContact={editingContact}
          setEditingContact={setEditingContact}
        />
      )}
      
      {/* Conditionally render group modal */}
      {showGroupModal && viewMode === 'groups' && (
        <NewGroup 
          setShowGroupModal={setShowGroupModal} 
          groupModalRef={groupModalRef}
          editingGroup={editingGroup}
          setEditingGroup={setEditingGroup}
        />
      )}

      {/* Chat Button - Fixed to bottom right corner */}
      <button 
        className='position-fixed d-flex bg-transparent justify-content-center align-items-center rounded-circle border-0 message-component-trigger'
        style={{
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          zIndex: 1002,
          cursor: 'pointer'
        }}
        onClick={toggleMessageComponent}
      >
        <img 
          src='/chat.png' 
          alt="Chat" 
          style={{
            width: '40px', 
            height: '40px',
            objectFit: 'contain'
          }}
        />
      </button>
      
      {/* Dark Overlay - animates when message component is shown */}
      {showMessageComponent && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{
            backgroundColor: messageAnimationState === 'hidden' ? 'rgba(0,0,0,0)' : 
                             messageAnimationState === 'animating-out' ? 'rgba(0,0,0,0)' :
                             'rgba(0,0,0,0.5)',
            opacity: messageAnimationState === 'animating' || messageAnimationState === 'visible' ? 1 : 0,
            zIndex: 1001,
            transition: 'opacity 0.3s ease-in-out',
            pointerEvents: messageAnimationState === 'visible' ? 'auto' : 'none'
          }}
          onClick={closeMessageComponent}
        ></div>
      )}
      
      {/* Conditionally render MessageComponent with animation */}
      {showMessageComponent && (
        <div 
          className="position-fixed rounded-3 h-100 d-flex align-items-center justify-content-center" 
          style={{
            
            right: messageAnimationState === 'hidden' ? '-420px' : 
                  messageAnimationState === 'animating-out' ? '-420px' : '2rem',
            width: isMobile ? '90vw' : '400px',
            zIndex: 1002,
            transition: 'right 0.3s ease-in-out',
            overflow: 'hidden'
          }}
          ref={messageComponentRef}
        >
          <MessageComponent />
        </div>
      )}
    </div>
  );
}

const Contacts = ({ setShowContactModal, setEditingContact }) => {
  const [activePopup, setActivePopup] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch contacts on component mount
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/community/contacts', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch contacts');
        }
        
        const data = await response.json();
        setClients(data);
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const handleDelete = async (clientId) => {
  try {
    // Get token from localStorage or your auth context
    const token = localStorage.getItem('token');
    
    const response = await fetch(`http://localhost:8080/api/community/contacts/${clientId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    // Handle different response status codes
    if (response.status === 404) {
      throw new Error('Contact not found');
    }

    if (response.status === 401) {
      throw new Error('Unauthorized - Please login again');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete contact');
    }

    // Update UI only after successful deletion
    setClients(prevClients => prevClients.filter(client => client.id !== clientId));
    setActivePopup(null);
  } catch (err) {
    console.error('Error deleting contact:', err);
    alert(err.message || 'Failed to delete contact');
  }
};





  const togglePopup = (itemId, action) => {
  if (action === 'edit') {
    setActivePopup(null);
    const contactToEdit = clients.find(client => client.id === itemId);
    if (contactToEdit) {
      // Set the contact data for editing
      setEditingContact({
        id: contactToEdit.id,
        username: contactToEdit.username,
        email: contactToEdit.email,
        phone: contactToEdit.phone,
        profileimg: contactToEdit.profileimg
      });
      setShowContactModal(true);
    }
  } else {
    setActivePopup(activePopup === itemId ? null : itemId);
  }
};

  if (loading) {
    return <div className="text-center py-4">Loading contacts...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-danger">{error}</div>;
  }

  return (
    <div className="client-list">
      {/* Table Header - Hidden on mobile */}
      <div className="d-none d-md-flex row border-bottom pb-3 fw-bold">
        <div className="col-md-3 ps-md-4">Name</div>
        <div className="col-md-3">Email</div>
        <div className="col-md-3">Phone</div>
        <div className="col-md-2">Created By</div>
        <div className="col-md-1"></div>
      </div>
      
      {/* Table Body - Responsive */}
      {clients.map(client => (
        <div key={client.id} className="pt-3 pb-3 border-bottom position-relative">
          {/* Desktop View */}
          <div className="d-none d-md-flex row align-items-center">
            {/* Name column with avatar */}
            <div className="col-md-3 d-flex align-items-center">
              <div className="avatar-circle bg-light text-secondary me-3 d-flex align-items-center justify-content-center" 
                style={{ width: 60, height: 60, borderRadius: '50%', fontSize: '1.5rem' }}>
                {client.username ? client.username.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <div className="fw-bold">{client.username}</div>
                <div className="text-muted small">{client.email}</div>
              </div>
            </div>
            
            {/* Email */}
            <div className="col-md-3">
              <div className="text-muted">{client.email}</div>
            </div>
            
            {/* Phone */}
            <div className="col-md-3">
              <div className="text-muted">{client.phone || 'No phone'}</div>
            </div>
            
            {/* Created By */}
            <div className="col-md-2">
              <div className="text-muted">{client.createdBy}</div>
            </div>
            
            {/* Actions with popup */}
            <div className="col-md-1 text-end position-relative">
              <button 
                className="btn btn-link text-dark"
                onClick={() => togglePopup(client.id)}
              >
                <BsThreeDotsVertical />
              </button>
              
              {activePopup === client.id && (
                <div 
                  className="position-absolute bg-white shadow rounded-3 py-2 px-0"
                  style={{ 
                    right: 0, 
                    top: '100%', 
                    zIndex: 1000, 
                    width: 150,
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}
                >
                  <button 
                    className="btn btn-link text-dark d-flex align-items-center gap-2 px-3 py-2 w-100 text-start" 
                    style={{ textDecoration: 'none' }}
                    onClick={() => togglePopup(client.id, 'edit')}
                  >
                    <FaEdit size={16} /> Edit
                  </button>
                  <button 
                    className="btn btn-link text-danger d-flex align-items-center gap-2 px-3 py-2 w-100 text-start" 
                    style={{ textDecoration: 'none' }}
                    onClick={() => handleDelete(client.id)}
                  >
                    <FaTrash size={16} /> Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile View */}
          <div className="d-flex d-md-none position-relative">
            <div className="avatar-circle bg-light text-secondary me-3 d-flex align-items-center justify-content-center" 
              style={{ width: 50, height: 50, borderRadius: '50%', fontSize: '1.25rem', flexShrink: 0 }}>
              {client.username ? client.username.charAt(0).toUpperCase() : '?'}
            </div>
            
            <div className="flex-grow-1">
              <div className="fw-bold">{client.username}</div>
              <div className="text-muted small mb-1">{client.email}</div>
              
              <div className="d-flex flex-wrap gap-2 mt-2">
                <div className="bg-light rounded-pill px-2 py-1 small">
                  <span className="fw-semibold">Phone:</span> {client.phone || 'No phone'}
                </div>
                <div className="bg-light rounded-pill px-2 py-1 small">
                  <span className="fw-semibold">Created by:</span> {client.createdBy}
                </div>
              </div>
            </div>
            
            {/* Actions button with popup for mobile */}
            <div className="position-absolute" style={{ top: 0, right: 0 }}>
              <button 
                className="btn btn-link text-dark"
                onClick={() => togglePopup(client.id)}
              >
                <BsThreeDotsVertical />
              </button>
              
              {activePopup === client.id && (
                <div 
                  className="position-absolute bg-white shadow rounded-3 py-2 px-0"
                  style={{ 
                    right: 0, 
                    top: '100%', 
                    zIndex: 1000, 
                    width: 150,
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}
                >
                  <button 
                    className="btn btn-link text-dark d-flex align-items-center gap-2 px-3 py-2 w-100 text-start" 
                    style={{ textDecoration: 'none' }}
                    onClick={() => togglePopup(client.id, 'edit')}
                  >
                    <FaEdit size={16} /> Edit
                  </button>
                  <button className="btn btn-link text-danger d-flex align-items-center gap-2 px-3 py-2 w-100 text-start" style={{ textDecoration: 'none' }}>
                    <FaTrash size={16} /> Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Groups = ({ setShowGroupModal, setEditingGroup }) => {
  const [activePopup, setActivePopup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/community/groups', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch groups');
        }
        
        const data = await response.json();
        setGroups(data);
      } catch (err) {
        console.error('Error fetching groups:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleDelete = async (groupId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/community/groups/${groupId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete group');
      }

      setGroups(groups.filter(group => group._id !== groupId));
      setActivePopup(null);
    } catch (err) {
      console.error('Error deleting group:', err);
      alert('Failed to delete group');
    }
  };

  const togglePopup = (itemId, action) => {
    if (action === 'edit') {
      setActivePopup(null);
      const groupId = parseInt(itemId.split('-')[1]);
      const groupToEdit = groups.find(group => group.id === groupId);
      if (groupToEdit) {
        setEditingGroup(groupToEdit);
        setShowGroupModal(true);
      }
    } else {
      setActivePopup(activePopup === itemId ? null : itemId);
    }
  };
  

  return(
    <div className="group-list">
      {/* Table Header - Hidden on mobile */}
      <div className="d-none d-md-flex row border-bottom pb-3 fw-bold">
        <div className="col-md-4 ps-md-4">Name</div>
        <div className="col-md-4">Next Meeting</div>
        <div className="col-md-3">Last Meeting</div>
        <div className="col-md-1"></div>
      </div>
      
      {/* Table Body - Responsive */}
      {groups.map(group => (
        <div key={group.id} className="pt-3 pb-3 border-bottom position-relative">
          {/* Desktop View */}
          <div className="d-none d-md-flex row align-items-center">
            {/* Name column with avatar */}
            <div className="col-md-4 d-flex align-items-center">
              <div className="avatar-circle bg-light text-secondary me-3 d-flex align-items-center justify-content-center" 
                style={{ width: 60, height: 60, borderRadius: '50%', fontSize: '1.5rem' }}>
                {group.name ? group.name.charAt(0) : '?'}
              </div>
              <div>
                <div className="fw-bold">{group.name}</div>
                <div className="text-muted small">{group.members?.length || 0} members</div>
              </div>
            </div>
            
            {/* Next Meeting */}
            <div className="col-md-4">
              {group.nextMeeting ? (
                <>
                  <div>{group.nextMeeting.type}</div>
                  <div className="text-muted">{group.nextMeeting.date}</div>
                </>
              ) : (
                <div className="text-muted">No upcoming meetings</div>
              )}
            </div>
            
            {/* Last Meeting */}
            <div className="col-md-3">
              {group.lastMeeting ? (
                <>
                  <div>{group.lastMeeting.type}</div>
                  <div className="text-muted">{group.lastMeeting.date}</div>
                </>
              ) : (
                <div className="text-muted">No previous meetings</div>
              )}
            </div>
            
            {/* Actions with popup */}
            <div className="col-md-1 text-end position-relative">
              <button 
                className="btn btn-link text-dark"
                onClick={() => togglePopup(`group-${group.id}`)}
              >
                <BsThreeDotsVertical />
              </button>
              
              {activePopup === `group-${group.id}` && (
                <div 
                  className="position-absolute bg-white shadow rounded-3 py-2 px-0"
                  style={{ 
                    right: 0, 
                    top: '100%', 
                    zIndex: 1000, 
                    width: 150,
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}
                >
                  <button 
                    className="btn btn-link text-dark d-flex align-items-center gap-2 px-3 py-2 w-100 text-start" 
                    style={{ textDecoration: 'none' }}
                    onClick={() => togglePopup(`group-${group.id}`, 'edit')}
                  >
                    <FaEdit size={16} /> Edit
                  </button>
                  <button 
                    className="btn btn-link text-danger d-flex align-items-center gap-2 px-3 py-2 w-100 text-start" 
                    style={{ textDecoration: 'none' }}
                    onClick={() => handleDelete(group.id)}
                  >
                    <FaTrash size={16} /> Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile View */}
          <div className="d-flex d-md-none position-relative">
            <div className="avatar-circle bg-light text-secondary me-3 d-flex align-items-center justify-content-center" 
              style={{ width: 50, height: 50, borderRadius: '50%', fontSize: '1.25rem', flexShrink: 0 }}>
              {group.name ? group.name.charAt(0) : '?'}
            </div>
            
            <div className="flex-grow-1">
              <div className="fw-bold">{group.name}</div>
              <div className="text-muted small mb-1">{group.members?.length || 0} members</div>
              
              <div className="d-flex flex-wrap gap-2 mt-2">
                <div className="bg-light rounded-pill px-2 py-1 small">
                  <span className="fw-semibold">Next:</span> {
                    group.nextMeeting?.date || 'No upcoming meetings'
                  }
                </div>
                <div className="bg-light rounded-pill px-2 py-1 small">
                  <span className="fw-semibold">Last:</span> {
                    group.lastMeeting?.date || 'No previous meetings'
                  }
                </div>
              </div>
            </div>
            
            {/* Actions button with popup for mobile */}
            <div className="position-absolute" style={{ top: 0, right: 0 }}>
              <button 
                className="btn btn-link text-dark"
                onClick={() => togglePopup(`group-${group.id}`)}
              >
                <BsThreeDotsVertical />
              </button>
              
              {activePopup === `group-${group.id}` && (
                <div 
                  className="position-absolute bg-white shadow rounded-3 py-2 px-0"
                  style={{ 
                    right: 0, 
                    top: '100%', 
                    zIndex: 1000, 
                    width: 150,
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}
                >
                  <button 
                    className="btn btn-link text-dark d-flex align-items-center gap-2 px-3 py-2 w-100 text-start" 
                    style={{ textDecoration: 'none' }}
                    onClick={() => togglePopup(`group-${group.id}`, 'edit')}
                  >
                    <FaEdit size={16} /> Edit
                  </button>
                  <button className="btn btn-link text-danger d-flex align-items-center gap-2 px-3 py-2 w-100 text-start" style={{ textDecoration: 'none' }}>
                    <FaTrash size={16} /> Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {groups.length === 0 && (
        <div className="text-center py-4 text-muted">
          No groups found. Create a new group to get started.
        </div>
      )}
    </div>
  );
};

const NewContact = ({ setShowContactModal, contactModalRef, editingContact, setEditingContact }) => {
  const [formData, setFormData] = useState({
    name: editingContact ? editingContact.username : '',
    email: editingContact ? editingContact.email : '',
    phone: editingContact ? editingContact.phone : '',
    profileimg: editingContact ? editingContact.profileimg : ''
  });

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const url = editingContact 
      ? `http://localhost:8080/api/community/contacts/${editingContact.id}`
      : 'http://localhost:8080/api/community/contacts';
      
    const method = editingContact ? 'PUT' : 'POST';
    const token = localStorage.getItem('token');

    // Prepare the request body
    const contactData = {
      username: formData.name,
      email: formData.email,
      phone: formData.phone,
      profileimg: formData.profileimg || 'https://example.com/default-profile.jpg'
    };

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify(contactData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save contact');
    }

    // Close modal and reset state
    setShowContactModal(false);
    setEditingContact(null);
    
    // Refresh the contacts list
    window.location.reload();
  } catch (err) {
    console.error('Error saving contact:', err);
    alert(err.message || 'Failed to save contact');
  }
};

  // Handle form input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  // Handle modal close
  const handleClose = () => {
    setShowContactModal(false);
    setEditingContact(null);
  };

  return(
    <div 
      className="position-fixed top-0 start-0 w-100 h-100" 
      style={{ 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        zIndex: 1050,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {/* Modal Content */}
      <div 
        ref={contactModalRef}
        className="bg-white rounded-3 shadow position-relative"
        style={{ 
          maxWidth: '500px', 
          width: '90%',
          animation: 'fadeIn 0.3s'
        }}
      >
        {/* Close button */}
        <button 
          className="btn btn-link position-absolute"
          style={{ top: '15px', right: '15px', color: '#555' }}
          onClick={handleClose}
        >
          <FaTimes size={20} />
        </button>
        
        {/* Modal Header */}
        <div className="p-4 pb-2">
          <h2 className="h4 mb-1">{editingContact ? 'Edit Contact' : 'Add New Contact'}</h2>
        </div>
        
        {/* Form Content */}
        <form className="p-4 pt-2" onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="mb-3">
            <label htmlFor="name" className="form-label fw-bold">
              Name <span className="text-danger">*</span>
            </label>
            <input 
              type="text" 
              className="form-control rounded-3" 
              id="name" 
              placeholder="Enter name" 
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          
          {/* Email Field */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-bold">
              Email <span className="text-danger">*</span>
            </label>
            <input 
              type="email" 
              className="form-control rounded-3" 
              id="email" 
              placeholder="Enter email" 
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          {/* Time Zone Field */}
          <div className="mb-3">
            <label htmlFor="timezone" className="form-label fw-bold">
              Time Zone
            </label>
            <select 
              className="form-select rounded-3" 
              id="timezone"
              value={formData.timezone}
              onChange={handleChange}
            >
              <option value="">Select time zone</option>
              <option value="EST">Eastern Time (EST)</option>
              <option value="CST">Central Time (CST)</option>
              <option value="MST">Mountain Time (MST)</option>
              <option value="PST">Pacific Time (PST)</option>
              <option value="IST">India Standard Time (IST)</option>
            </select>
          </div>
          
          {/* Phone Number Field */}
          <div className="mb-4">
            <label htmlFor="phone" className="form-label fw-bold">
              Phone Number
            </label>
            <input 
              type="tel" 
              className="form-control rounded-3" 
              id="phone" 
              placeholder="Enter phone Number" 
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="d-flex justify-content-between pt-2">
            <button 
              type="button" 
              className="btn btn-light rounded-pill px-4" 
              onClick={handleClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary rounded-pill px-4"
            >
              {editingContact ? 'Update contact' : 'Save contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const NewGroup = ({ setShowGroupModal, groupModalRef, editingGroup, setEditingGroup }) => {
  const [formData, setFormData] = useState({
    name: editingGroup ? editingGroup.name : '',
    contactIds: editingGroup ? editingGroup.contactIds || [] : []
  });

  const [availableContacts, setAvailableContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch available contacts when modal opens
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/community/contacts', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch contacts');
        }
        
        const data = await response.json();
        setAvailableContacts(data);
      } catch (err) {
        console.error('Error fetching contacts:', err);
      }
    };

    fetchContacts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingGroup 
        ? `http://localhost:8080/api/community/groups/${editingGroup._id}`
        : 'http://localhost:8080/api/community/groups';
        
      const method = editingGroup ? 'PUT' : 'POST';
      
      // Filter out any empty strings or undefined values from contactIds
      const validContactIds = formData.contactIds.filter(id => id && id.trim() !== '');
      
      const requestBody = {
        name: formData.name,
        contactIds: validContactIds // Make sure these are strings
      };

      console.log('Sending request:', requestBody); // Debug log
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save group');
      }

      setShowGroupModal(false);
      setEditingGroup(null);
      window.location.reload();
    } catch (err) {
      console.error('Error saving group:', err);
      alert('Failed to save group: ' + err.message);
    }
  };

  const handleContactSelect = (contactId) => {
    if (!contactId) return; // Prevent adding empty IDs
    
    setFormData(prev => ({
      ...prev,
      contactIds: prev.contactIds.includes(contactId)
        ? prev.contactIds.filter(id => id !== contactId)
        : [...prev.contactIds, contactId]
    }));
  };

  // Add this JSX in the form, replacing the previous members input
  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100" 
      style={{ 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        zIndex: 1050,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {/* Modal Content */}
      <div 
        ref={groupModalRef}
        className="bg-white rounded-3 shadow position-relative"
        style={{ 
          maxWidth: '500px', 
          width: '90%',
          animation: 'fadeIn 0.3s'
        }}
      >
        {/* Close button */}
        <button 
          className="btn btn-link position-absolute"
          style={{ top: '15px', right: '15px', color: '#555' }}
          onClick={() => setShowGroupModal(false)}
        >
          <FaTimes size={20} />
        </button>
        
        {/* Modal Header */}
        <div className="p-4 pb-2">
          <h2 className="h4 mb-1">{editingGroup ? 'Edit Group' : 'Create New Group'}</h2>
        </div>
        
        {/* Form Content */}
        <form className="p-4 pt-2" onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="mb-3">
            <label htmlFor="name" className="form-label fw-bold">
              Name <span className="text-danger">*</span>
            </label>
            <input 
              type="text" 
              className="form-control rounded-3" 
              id="name" 
              placeholder="Enter group name" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          {/* Members Selection */}
          <div className="mb-4">
            <label className="form-label fw-bold">
              Add Members <span className="text-danger">*</span>
            </label>
            <input 
              type="text" 
              className="form-control rounded-3 mb-2" 
              placeholder="Search contacts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <div className="border rounded-3 p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {availableContacts
                .filter(contact => 
                  contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  contact.username?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(contact => (
                  <div 
                    key={contact.id} // Use contact.id instead of _id
                    className="form-check d-flex align-items-center py-2"
                  >
                    <input
                      type="checkbox"
                      className="form-check-input me-2"
                      checked={formData.contactIds.includes(contact.id)}
                      onChange={() => handleContactSelect(contact.id)}
                    />
                    <label className="form-check-label">
                      {contact.username || contact.email}
                    </label>
                  </div>
                ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-between pt-2">
            <button 
              type="button" 
              className="btn btn-light rounded-pill px-4" 
              onClick={() => setShowGroupModal(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary rounded-pill px-4"
              disabled={!formData.name || formData.contactIds.length === 0}
            >
              {editingGroup ? 'Update Group' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

