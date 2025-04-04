'use client';

import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/global.css';
import SidebarMenu from '../../components/SideMenucollapse';
import ProfileHeader from '@/components/profileHeader';
import MessageComponent from '@/components/MessageComponent';
import { FaBars, FaSearch, FaFilter, FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';


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
   
  // Ref for handling clicks outside popup
  const contactModalRef = useRef(null);
  const groupModalRef = useRef(null);
  const messageComponentRef = useRef(null);

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
        className="flex-grow-1 p-2 p-md-4"
        style={{
          marginLeft: isMobile ? 0 : (isSidebarCollapsed ? '90px' : '340px'),
          maxWidth: isMobile ? '100%' : (isSidebarCollapsed ? 'calc(100% - 90px)' : 'calc(100% - 340px)'),
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
  const [clients, setClients] = useState([
    {
      id: 1,
      name: 'David Miller',
      email: 'davidmiller@gmail.com',
      nextMeeting: {
        type: '30 Minute Meeting',
        date: 'Mon, Dec. 24'
      },
      lastMeeting: {
        type: '30 Minute Meeting',
        date: 'Mon, Dec. 24'
      },
      groups: ['Gujarat', 'Shodan']
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'janesmith@gmail.com',
      nextMeeting: {
        type: '45 Minute Meeting',
        date: 'Tue, Dec. 25'
      },
      lastMeeting: {
        type: '15 Minute Call',
        date: 'Fri, Dec. 20'
      },
      groups: ['Marketing', 'VIP']
    }
  ]);


  const handleDelete = (clientId) => {
    setClients(clients.filter(client => client.id !== clientId));
    setActivePopup(null); // Close popup after deletion
  };


  const togglePopup = (itemId, action) => {
    if (action === 'edit') {
      setActivePopup(null);
      const clientId = parseInt(itemId.split('-')[1]);
      const clientToEdit = clients.find(client => client.id === clientId);
      if (clientToEdit) {
        setEditingContact(clientToEdit);
        setShowContactModal(true);
      }
    } else {
      setActivePopup(activePopup === itemId ? null : itemId);
    }
  };

  return (
    <div className="client-list">
      {/* Table Header - Hidden on mobile */}
      <div className="d-none d-md-flex row border-bottom pb-3 fw-bold">
        <div className="col-md-3 ps-md-4">Name</div>
        <div className="col-md-3">Next Meeting</div>
        <div className="col-md-3">Last Meeting</div>
        <div className="col-md-2">Group</div>
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
                {client.name.charAt(0)}
              </div>
              <div>
                <div className="fw-bold">{client.name}</div>
                <div className="text-muted small">{client.email}</div>
              </div>
            </div>
            
            {/* Next Meeting */}
            <div className="col-md-3">
              <div>{client.nextMeeting.type}</div>
              <div className="text-muted">{client.nextMeeting.date}</div>
            </div>
            
            {/* Last Meeting */}
            <div className="col-md-3">
              <div>{client.lastMeeting.type}</div>
              <div className="text-muted">{client.lastMeeting.date}</div>
            </div>
            
            {/* Group */}
            <div className="col-md-2">
              {client.groups.join(', ')}
              {client.groups.length > 2 ? '....' : ''}
            </div>
            
            {/* Actions with popup */}
            <div className="col-md-1 text-end position-relative">
              <button 
                className="btn btn-link text-dark"
                onClick={() => togglePopup(`client-${client.id}`)}
              >
                <BsThreeDotsVertical />
              </button>
              
              {activePopup === `client-${client.id}` && (
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
                    onClick={() => togglePopup(`client-${client.id}`, 'edit')}
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
              {client.name.charAt(0)}
            </div>
            
            <div className="flex-grow-1">
              <div className="fw-bold">{client.name}</div>
              <div className="text-muted small mb-1">{client.email}</div>
              
              <div className="d-flex flex-wrap gap-2 mt-2">
                <div className="bg-light rounded-pill px-2 py-1 small">
                  <span className="fw-semibold">Next:</span> {client.nextMeeting.date}
                </div>
                <div className="bg-light rounded-pill px-2 py-1 small">
                  <span className="fw-semibold">Last:</span> {client.lastMeeting.date}
                </div>
                {client.groups.map((group, idx) => (
                  <div key={idx} className="bg-light rounded-pill px-2 py-1 small text-secondary">
                    {group}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Actions button with popup for mobile */}
            <div className="position-absolute" style={{ top: 0, right: 0 }}>
              <button 
                className="btn btn-link text-dark"
                onClick={() => togglePopup(`client-${client.id}`)}
              >
                <BsThreeDotsVertical />
              </button>
              
              {activePopup === `client-${client.id}` && (
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
                    onClick={() => togglePopup(`client-${client.id}`, 'edit')}
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
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: 'Team shodan',
      email: 'davidmiller@gmail.com',
      nextMeeting: {
        type: '30 Minute Meeting',
        date: 'Mon, Dec. 24'
      },
      lastMeeting: {
        type: '30 Minute Meeting',
        date: 'Mon, Dec. 24'
      }
    }
  ]);

  const handleDelete = (groupId) => {
    setGroups(groups.filter(group => group.id !== groupId));
    setActivePopup(null); // Close popup after deletion
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
                {group.name.charAt(0)}
              </div>
              <div>
                <div className="fw-bold">{group.name}</div>
                <div className="text-muted small">{group.email}</div>
              </div>
            </div>
            
            {/* Next Meeting */}
            <div className="col-md-4">
              <div>{group.nextMeeting.type}</div>
              <div className="text-muted">{group.nextMeeting.date}</div>
            </div>
            
            {/* Last Meeting */}
            <div className="col-md-3">
              <div>{group.lastMeeting.type}</div>
              <div className="text-muted">{group.lastMeeting.date}</div>
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
              {group.name.charAt(0)}
            </div>
            
            <div className="flex-grow-1">
              <div className="fw-bold">{group.name}</div>
              <div className="text-muted small mb-1">{group.email}</div>
              
              <div className="d-flex flex-wrap gap-2 mt-2">
                <div className="bg-light rounded-pill px-2 py-1 small">
                  <span className="fw-semibold">Next:</span> {group.nextMeeting.date}
                </div>
                <div className="bg-light rounded-pill px-2 py-1 small">
                  <span className="fw-semibold">Last:</span> {group.lastMeeting.date}
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
    </div>
  );
};

const NewContact = ({ setShowContactModal, contactModalRef, editingContact, setEditingContact }) => {
  // Initialize form state with editing data or empty values
  const [formData, setFormData] = useState({
    name: editingContact ? editingContact.name : '',
    email: editingContact ? editingContact.email : '',
    timezone: editingContact ? editingContact.timezone || '' : '',
    phone: editingContact ? editingContact.phone || '' : ''
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Process form data here
    // If editing, update the existing contact
    // If new, add a new contact
    
    // Close modal and reset editing state
    setShowContactModal(false);
    setEditingContact(null);
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
  // Initialize form state with editing data or empty values
  const [formData, setFormData] = useState({
    groupName: editingGroup ? editingGroup.name : '',
    groupEmail: editingGroup ? editingGroup.email : '',
    members: '',
    description: editingGroup ? editingGroup.description || '' : ''
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Process form data here
    // If editing, update the existing group
    // If new, add a new group
    
    // Close modal and reset editing state
    setShowGroupModal(false);
    setEditingGroup(null);
  };

  // Handle modal close
  const handleClose = () => {
    setShowGroupModal(false);
    setEditingGroup(null);
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
          onClick={handleClose}
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
            <label htmlFor="groupName" className="form-label fw-bold">
              Name <span className="text-danger">*</span>
            </label>
            <input 
              type="text" 
              className="form-control rounded-3" 
              id="groupName" 
              placeholder="Enter group name" 
              required
              value={formData.groupName}
              onChange={handleChange}
            />
          </div>
          
          {/* Email Field */}
          <div className="mb-3">
            <label htmlFor="groupEmail" className="form-label fw-bold">
              Email <span className="text-danger">*</span>
            </label>
            <input 
              type="email" 
              className="form-control rounded-3" 
              id="groupEmail" 
              placeholder="Enter group email" 
              required
              value={formData.groupEmail}
              onChange={handleChange}
            />
          </div>
          
          {/* Add Members Field */}
          <div className="mb-4">
            <label htmlFor="members" className="form-label fw-bold">
              Add members
            </label>
            <div className="position-relative">
              <input 
                type="text" 
                className="form-control rounded-3" 
                id="members" 
                placeholder="Search by contact" 
                value={formData.members}
                onChange={handleChange}
              />
              <button 
                type="button"
                className="btn position-absolute" 
                style={{ right: '5px', top: '50%', transform: 'translateY(-50%)' }}
              >
                <FaSearch className="text-muted" />
              </button>
            </div>
          </div>
          
          {/* Description Field */}
          <div className="mb-4">
            <label htmlFor="description" className="form-label fw-bold">
              Description
            </label>
            <textarea 
              className="form-control rounded-3" 
              id="description" 
              placeholder="Enter group description" 
              rows="3"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
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
              {editingGroup ? 'Update group' : 'Create group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

