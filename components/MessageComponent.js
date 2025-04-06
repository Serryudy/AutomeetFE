/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaSearch, FaTimes, FaCircle, FaArrowLeft, FaPaperclip, FaPaperPlane } from "react-icons/fa";
import Link from 'next/link';

const MessageComponent = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showChatView, setShowChatView] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const searchInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(450);
  const [hover, setHover] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Update container width based on parent element
      if (containerRef.current) {
        setContainerWidth(containerRef.current.parentElement.clientWidth);
      }
    };

    // Initialize with current width
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);

      // Initial measurement of container width
      if (containerRef.current) {
        setContainerWidth(containerRef.current.parentElement.clientWidth);
      }

      // Set a timeout to ensure proper measurement after initial render
      setTimeout(handleResize, 100);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  // Focus search input when search is shown
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Focus message input when chat view is shown
  useEffect(() => {
    if (showChatView && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [showChatView]);

  // Sample message data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const messages = [
    {
      id: 1,
      sender: "David Miler",
      avatar: "/profile.png",
      message: "Are you free 2024/11/10 at 10.00AM to discuss the project?",
      time: "10:30 AM",
      repeat: true,
      keywords: ["meeting", "schedule", "project", "discuss"],
      conversation: [
        { sender: "David Miler", message: "Hey, did you hear about the meeting tomorrow?", time: "Nov 30 10:25 AM", isSelf: false },
        { sender: "You", message: "Yup. We're supposed to bring our ideas.", time: "Nov 30 10:27 AM", isSelf: true },
        { sender: "David Miler", message: "Yeah, it's about the class project, right?", time: "Nov 30 10:28 AM", isSelf: false },
        { sender: "You", message: "Yup. We're supposed to bring our ideas.", time: "Nov 30 10:29 AM", isSelf: true },
        { sender: "David Miler", message: "I've been thinking about a Web project.", time: "Nov 30 10:29 AM", isSelf: false },
        { sender: "You", message: "That's a great idea!", time: "Nov 30 10:30 AM", isSelf: true },
        { sender: "David Miler", message: "Hmm, both ideas are cool. Maybe we can combine them!", time: "Nov 30 10:30 AM", isSelf: false },
        { sender: "You", message: "See you tomorrow!", time: "Nov 30 10:31 AM", isSelf: true },
        { sender: "David Miler", message: "Sure", time: "Nov 30 10:31 AM", isSelf: false },
      ]
    },
    {
      id: 2,
      sender: "John Smith",
      avatar: "/profile.png",
      message: "I can join the video call tomorrow. Should I prepare slides?",
      time: "Yesterday",
      repeat: true,
      keywords: ["call", "video", "slides", "meeting", "join"],
      conversation: [
        { sender: "John Smith", message: "Hi there! Just checking about tomorrow's call", time: "Yesterday", isSelf: false },
        { sender: "You", message: "Yes, we're still on for 2pm", time: "Yesterday", isSelf: true },
        { sender: "John Smith", message: "I can join the video call tomorrow. Should I prepare slides?", time: "Yesterday", isSelf: false },
      ]
    },
    {
      id: 3,
      sender: "Team shodan",
      avatar: "/profile.png",
      message: "I am free. Let's chat about the requirements document.",
      time: "Nov 10",
      isTeam: true,
      keywords: ["chat", "document", "requirements", "free"],
      conversation: [
        { sender: "Alex (Team shodan)", message: "When can we discuss the requirements?", time: "Nov 10", isSelf: false },
        { sender: "You", message: "I'm available tomorrow afternoon", time: "Nov 10", isSelf: true },
        { sender: "Team shodan", message: "I am free. Let's chat about the requirements document.", time: "Nov 10", isSelf: false },
      ]
    },
    {
      id: 4,
      sender: "Kara Shiyam",
      avatar: "/profile.png",
      message: "Are you free for a quick voice call to discuss the design?",
      time: "Nov 9",
      keywords: ["call", "voice", "design", "discuss", "free"],
      conversation: [
        { sender: "Kara Shiyam", message: "Hey! How's the design coming along?", time: "Nov 9", isSelf: false },
        { sender: "You", message: "Making progress, but I have some questions", time: "Nov 9", isSelf: true },
        { sender: "Kara Shiyam", message: "Are you free for a quick voice call to discuss the design?", time: "Nov 9", isSelf: false },
      ]
    },
    {
      id: 5,
      sender: "Shan Devol",
      avatar: "/profile.png",
      message: "Sure, I'll send you that file attachment right away.",
      time: "Nov 8",
      keywords: ["file", "attachment", "send"],
      conversation: [
        { sender: "You", message: "Do you have that presentation from last week?", time: "Nov 8", isSelf: true },
        { sender: "Shan Devol", message: "Yes, I can send it over", time: "Nov 8", isSelf: false },
        { sender: "You", message: "Great, thanks!", time: "Nov 8", isSelf: true },
        { sender: "Shan Devol", message: "Sure, I'll send you that file attachment right away.", time: "Nov 8", isSelf: false },
      ]
    },
    {
      id: 6,
      sender: "Batch 22",
      avatar: "/profile.png",
      message: "Sure, I can join that time. Should we invite the client too?",
      time: "Nov 5",
      isTeam: true,
      keywords: ["join", "invite", "client", "meeting"],
      conversation: [
        { sender: "You", message: "We need to schedule a review for the project", time: "Nov 5", isSelf: true },
        { sender: "Batch 22", message: "How about Friday at 3pm?", time: "Nov 5", isSelf: false },
        { sender: "You", message: "Works for me", time: "Nov 5", isSelf: true },
        { sender: "Batch 22", message: "Sure, I can join that time. Should we invite the client too?", time: "Nov 5", isSelf: false },
      ]
    }
  ];

  // Enhanced search function with keyword matching
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults(messages);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Simulate a slightly delayed search for a more realistic feel
    const timer = setTimeout(() => {
      const query = searchQuery.toLowerCase();

      const results = messages.filter(message => {
        // Check sender name
        if (message.sender.toLowerCase().includes(query)) return true;

        // Check message content
        if (message.message.toLowerCase().includes(query)) return true;

        // Check keywords
        if (message.keywords && message.keywords.some(keyword => keyword.toLowerCase().includes(query))) return true;

        return false;
      });

      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [messages, searchQuery]);

  // Calculate responsive sizes based on viewport and container
  const getResponsiveSizes = () => {
    const isMobile = windowWidth < 768;
    const isSmall = windowWidth < 576;
    const isNarrow = containerWidth < 350;

    return {
      containerHeight: isMobile ? '70vh' : '90vh',
      containerWidth: '100%', // Use 100% to fit parent
      avatarSize: isNarrow ? '40px' : isSmall ? '40px' : '50px',
      chatAvatarSize: isNarrow ? '30px' : isSmall ? '35px' : '45px',
      fontSize: {
        header: isNarrow ? '0.9rem' : isSmall ? '1rem' : '1.2rem',
        name: isNarrow ? '0.75rem' : isSmall ? '0.85rem' : '0.95rem',
        message: isNarrow ? '0.65rem' : isSmall ? '0.75rem' : '0.84rem',
        message1: isNarrow ? '0.65rem' : isSmall ? '0.7rem' : '0.74rem',
        time: isNarrow ? '0.6rem' : isSmall ? '0.6rem' : '0.65rem',
        chat: isNarrow ? '0.85rem' : isSmall ? '0.7rem' : '0.84rem'
      },
      padding: {
        container: isNarrow ? '0.5rem' : isSmall ? '0.7rem' : '1rem',
        item: isNarrow ? '0.5rem' : isSmall ? '0.5rem 0.75rem' : '0.75rem 1rem',
        chat: isNarrow ? '0.4rem' : isSmall ? '0.5rem' : '0.75rem'
      },
      buttonSize: isNarrow ? '40px' : isSmall ? '40px' : '46px',
      buttonSize1: isNarrow ? '41px' : isSmall ? '41px' : '47px',
      sendButtonSize: isNarrow ? '36px' : isSmall ? '40px' : '50px'
    };
  };

  const sizes = getResponsiveSizes();

  // Toggle search field visibility
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery('');
    }
  };

  // Handle new message click - Updated to show search view
  const handleNewMessage = () => {
    console.log('Create new message - showing search view');
    // Show search bar if it's not already visible
    if (!showSearch) {
      setShowSearch(true);
      // Focus will be handled by the useEffect that watches showSearch
    } else {
      // If search is already showing, just focus on it
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
    // Clear any existing search query to start fresh
    setSearchQuery('');
  };

  // Handle message click
  const handleMessageClick = (id) => {
    const message = messages.find(msg => msg.id === id);
    if (message) {
      setSelectedMessage(message);
      setShowChatView(true);
    }
  };

  // Handle back button click in chat view
  const handleBackToList = () => {
    setShowChatView(false);
    setSelectedMessage(null);
  };

  // Handle sending a new message
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    console.log('Sending message:', newMessage);
    // Here you would normally update the messages state with the new message
    // For this example, we'll just clear the input
    setNewMessage('');
  };

  // Function to highlight matched text
  const highlightText = (text, query) => {
    if (!query.trim() || !text) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ?
        <span key={i} className="bg-warning bg-opacity-50 fw-bold">{part}</span> :
        part
    );
  };

  // Function to get recommended search queries
  const getRecommendedQueries = () => {
    const commonTerms = ['meeting', 'call', 'document', 'file', 'video', 'chat', 'join'];
    return commonTerms.filter(term => !searchQuery.toLowerCase().includes(term));
  };

  // Function to render message list view
  const renderMessageListView = () => {
    return (
      <>
        {/* Header */}
        <div className="message-header d-flex justify-content-between align-items-center p-3 border-bottom"
          style={{ padding: sizes.padding.container }}>
          {showSearch ? (
            <div className="search-container d-flex align-items-center w-100 "
            style={{padding:"1px 0"}}>
              <div className="position-relative w-100">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="form-control border-0 shadow-none ps-4"
                  placeholder="Search for people or messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: sizes.fontSize.message }}
                />
                <FaSearch className="position-absolute text-muted px-2" style={{ top: '50%', transform: 'translateY(-50%)', left: '8px' }} />
                {isSearching && <div className="spinner-border spinner-border-sm text-primary position-absolute" style={{ top: '50%', transform: 'translateY(-50%)', right: '8px' }} role="status"></div>}
              </div>
              <button
                className="btn btn-sm btn-link text-dark"
                onClick={toggleSearch}
                aria-label="Close search"
                style={{ fontSize: '17px' }}
              >
                <FaTimes />
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center justify-content-between w-100">
              <span className="m-0 p-1 fw-bold" style={{ fontSize: sizes.fontSize.header }}>Messages</span>
              <div className="d-flex align-items-center">
                <div className="d-flex">
                  <button
                    className="btn btn-sm btn-link text-dark me-3"
                    onClick={toggleSearch}
                    aria-label="Search messages"
                    style={{ fontSize: '17px' }}
                  >
                    <FaSearch />
                  </button>
                  <button
                    className="btn btn-sm btn-link text-dark"
                    onClick={onClose}
                    aria-label="Close messages"
                    style={{ fontSize: '17px' }}
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search recommendations */}
        {showSearch && searchQuery && searchResults.length === 0 && !isSearching && (
          <div className="search-recommendations p-3 border-bottom bg-light">
            <p className="mb-2 text-muted" style={{ fontSize: sizes.fontSize.message }}>Try searching for:</p>
            <div className="d-flex flex-wrap gap-2">
              {getRecommendedQueries().slice(0, 3).map((term, idx) => (
                <button
                  key={idx}
                  className="btn btn-sm btn-outline-secondary rounded-pill"
                  onClick={() => setSearchQuery(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search stats */}
        {showSearch && searchQuery && !isSearching && (
          <div className="search-stats px-3 py-2 border-bottom bg-light">
            <small className="text-muted">
              {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for &quot;{searchQuery}&quot;
            </small>
          </div>
        )}

        {/* Message List */}
        <div className="message-list flex-grow-1 overflow-auto" style={{ marginRight: '10px' }}>
          {isSearching ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Searching...</span>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((message, index) => (
              <div
                key={index}
                className="message-item d-flex align-items-start border-bottom hover-bg-light"
                style={{ padding: sizes.padding.item, cursor: 'pointer' }}
                onClick={() => handleMessageClick(message.id)}
              >
                <div className="position-relative me-2 flex-shrink-0">
                  <img
                    src={message.avatar}
                    alt={message.sender}
                    className="rounded-circle bg-light"
                    style={{
                      width: sizes.avatarSize,
                      height: sizes.avatarSize,
                      objectFit: "cover",
                      marginRight: '5px',
                      border: message.isTeam ? '2px solid #007bff' : '2px solid #007bff',
                    }}
                    onError={(e) => { e.target.src = "/avatars/placeholder.jpg" }}
                  />
                </div>

                <div className="message-content flex-grow-1 overflow-hidden">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="sender-name fw-bold text-truncate" style={{
                      fontSize: sizes.fontSize.name,
                      maxWidth: containerWidth < 400 ? '60%' : '70%'
                    }}>
                      {searchQuery ? highlightText(message.sender, searchQuery) : message.sender}
                    </div>
                    <div className="message-time text-muted ms-1 flex-shrink-0" style={{
                      fontSize: sizes.fontSize.time,
                    }}>
                      {message.time}
                    </div>
                  </div>
                  <div className="message-preview text-muted text-truncate " style={{
                    fontSize: sizes.fontSize.message1,
                    maxWidth: '88%',
                  }}>
                    {searchQuery ? highlightText(message.message, searchQuery) : message.message}
                  </div>

                  {/* Show matching keywords if any */}
                  {searchQuery && message.keywords && message.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())) && (
                    <div className="matching-keywords mt-1 text-truncate">
                      <small className="text-primary">
                        <FaCircle size={8} className="me-1" />
                        Matches: {message.keywords
                          .filter(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
                          .slice(0, 2)
                          .join(', ')}
                      </small>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center text-muted h-100 p-4">
              <div className="mb-3">
                <FaSearch size={32} />
              </div>
              <p className="text-center">No messages found matching &quot;{searchQuery}&quot;</p>
              <p className="text-center small">Try different keywords like &quot;meeting&quot;, &quot;call&quot;, or &quot;file&quot;</p>
            </div>
          )}
        </div>

        {/* New Message Button */}
        <div className="new-message-btn position-absolute bottom-0 end-0 m-4">
          <button
            className="btn rounded-5 d-flex justify-content-center align-items-center"
            style={{
              width: sizes.buttonSize,
              height: sizes.buttonSize,
              backgroundColor: "#007bff",
              color: "#ffffff",
            }}
            onClick={handleNewMessage}
            onMouseEnter={(e) => (e.target.style.width = sizes.buttonSize1, e.target.style.height = sizes.buttonSize1)}
            onMouseLeave={(e) => (e.target.style.width = sizes.buttonSize, e.target.style.height = sizes.buttonSize)}
            aria-label="New message"
          >
            <FaPlus size={windowWidth < 576 ? 16 : 20} />
          </button>
        </div>
      </>
    );
  };

  // Function to render chat view
  const renderChatView = () => {
    if (!selectedMessage) return null;

    let lastDate = null; // Track the last displayed date

    return (
      <>
        {/* Chat Header */}
        <div className="chat-header d-flex align-items-center p-3 border-bottom"
          style={{ padding: sizes.padding.container }}>
          <button
            className="btn btn-sm btn-link text-dark me-2"
            onClick={handleBackToList}
            aria-label="Back to messages"
          >
            <FaArrowLeft />
          </button>
          <div className="position-relative me-3 flex-shrink-0">
            <img
              src={selectedMessage.avatar}
              alt={selectedMessage.sender}
              className="rounded-circle bg-light"
              style={{
                width: sizes.avatarSize,
                height: sizes.avatarSize,
                objectFit: "cover",
              }}
              onError={(e) => { e.target.src = "/avatars/placeholder.jpg" }}
            />
            {selectedMessage.isTeam && (
              <span className="position-absolute bottom-0 end-0 p-1 bg-primary rounded-circle"
                style={{ width: '15px', height: '15px', border: '2px solid white' }}>
              </span>
            )}
          </div>
          <div className="chat-user-info flex-grow-1 overflow-hidden">
            <div className="fw-bold text-truncate" style={{ fontSize: sizes.fontSize.name }}>
              {selectedMessage.sender}
            </div>
            <div className="text-muted text-truncate" style={{ fontSize: sizes.fontSize.time }}>
              {selectedMessage.isTeam ? 'Team Chat' : 'Active Now'}
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="chat-messages flex-grow-1 overflow-auto p-4" style={{ backgroundColor: '#ffffff' }}>
          {selectedMessage.conversation.map((msg, index) => {

            return (
              <div key={index}>

                <div className={`chat-bubble mb-3 ${msg.isSelf ? 'ms-auto' : 'me-auto'}`}
                  style={{ maxWidth: '70%', width: 'fit-content' }}>
                  <div
                    className={`shadow-sm ${msg.isSelf ? 'bg-primary text-white' : ''}`}
                    style={{
                      backgroundColor: msg.isSelf ? '' : '#e9ecef',
                      borderBottomRightRadius: msg.isSelf ? '0px' : '15px',
                      borderBottomLeftRadius: msg.isSelf ? '15px' : '0px',
                      borderTopRightRadius: '15px',
                      borderTopLeftRadius: '15px',
                      fontSize: sizes.fontSize.chat,
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      padding: '8px 15px',
                    }}
                  >
                    {msg.message}
                    <div className={`${msg.isSelf ? 'bg-primary text-white' : ''} text-end`}
                      style={{ fontSize: sizes.fontSize.time }}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Input */}
        <div className="chat-input p-3 border-top bg-white">
          <div className="d-flex align-items-center">
            <button
              className="btn btn-link text-muted me-2 flex-shrink-0"
              aria-label="Attach file"
            >
              <FaPaperclip />
            </button>
            <div className="position-relative flex-grow-1">
              <input
                ref={messageInputRef}
                type="text"
                className="form-control rounded-pill"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage() }}
                style={{ fontSize: sizes.fontSize.message, paddingRight: '50px' }}
              />
              <button
                className="btn btn-primary-black rounded-circle position-absolute d-flex justify-content-center align-items-center bg-transparent border-0"
                style={{
                  width: '50px',
                  height: '50px',
                  right: '5px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
                onClick={handleSendMessage}
                aria-label="Send message"
                disabled={newMessage.trim() === ''}
              >
                <FaPaperPlane size={12} />
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };


  return (
    <div
      ref={containerRef}
      className="position-relative bg-white font-inter shadow-sm d-flex flex-column"
      style={{
        height: sizes.containerHeight,
        borderRadius: "15px",
        width: "100%",
        overflow: "hidden",
        transition: "all 0.3s ease"
      }}
    >
      {showChatView ? renderChatView() : renderMessageListView()}
    </div>
  );
};

export default MessageComponent;