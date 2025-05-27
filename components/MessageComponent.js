/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FaPlus, FaSearch, FaTimes, FaCircle, FaArrowLeft, FaPaperclip, FaPaperPlane } from "react-icons/fa";

// Add debounce utility at the top of the file after imports
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Add this helper function after the imports
const getOtherParticipant = (participants, currentUser) => {
  return participants.find(p => p !== currentUser) || participants[0];
};

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
  const [messages, setMessages] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [websocket, setWebsocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

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

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/users/profile', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData.username);
          
          // After getting user profile, fetch rooms and contacts
          fetchRoomsAndContacts(userData.username);
        } else {
          console.error('Failed to fetch user profile:', response.status);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  // WebSocket connection
  useEffect(() => {
    // Establish WebSocket connection
    const ws = new WebSocket(`ws://localhost:9091/ws/chat`);

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setWebsocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Handle different types of WebSocket messages
      switch(data._type) {
        case 'new_message':
          // Add new message to current conversation if in the right room
          if (selectedMessage && data.roomId === selectedMessage.id) {
            setMessages(prevMessages => [...prevMessages, data]);
          }
          break;
        case 'room_joined':
          console.log('Joined room:', data.roomId);
          break;
        case 'room_created':
          console.log('Room created:', data.roomId);
          // Handle new room creation response
          if (isCreatingRoom) {
            setIsCreatingRoom(false);
            // Fetch the newly created room details and navigate to it
            handleMessageClick({
              id: data.roomId,
              participants: data.participants,
              roomName: data.roomName
            });
            
            // Refresh chat rooms list
            fetchRoomsAndContacts();
          }
          break;
        case 'connected':
          console.log('WebSocket connection established');
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
    };

    return () => {
      if (ws) ws.close();
    };
  }, [selectedMessage, isCreatingRoom]);

  // Update the fetchRoomsAndContacts function
  const fetchRoomsAndContacts = useCallback(async (currentUsername = currentUser) => {
    if (!currentUsername) return;
    
    try {
      setIsLoading(true);
      
      // Fetch chat rooms
      const roomsResponse = await fetch('http://localhost:9092/api/chat/rooms', {
        credentials: 'include'
      });
      const roomsData = await roomsResponse.json();

      if (roomsData.success) {
        // Update room names to show other participant's name
        const updatedRooms = roomsData.data.map(room => ({
          ...room,
          displayName: getOtherParticipant(room.participants, currentUsername)
        }));
        
        setChatRooms(updatedRooms);
        
        if (searchQuery.trim() === '') {
          setSearchResults(updatedRooms);
        }
      }

      // Fetch all contacts at once
      const contactsResponse = await fetch('http://localhost:8080/api/contacts', {
        credentials: 'include'
      });
      const contactsData = await contactsResponse.json();
      setContacts(contactsData);

    } catch (error) {
      console.error('Error fetching rooms or contacts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, searchQuery]);

  // Add memoized search results
  const memoizedSearchResults = useMemo(() => {
    return searchResults;
  }, [searchResults]);

  // Fetch chat rooms and contacts on component load
  useEffect(() => {
    fetchRoomsAndContacts();
  }, [fetchRoomsAndContacts]);

  // Handle message click to load room messages
  const handleMessageClick = async (room) => {
    try {
      // Join the room via WebSocket
      if (websocket) {
        websocket.send(JSON.stringify({
          _type: 'join_room',
          roomId: room.id
        }));
      }

      // Fetch room messages
      const messagesResponse = await fetch(`http://localhost:9092/api/chat/rooms/${room.id}/messages`, {
        credentials: 'include'
      });
      const messagesData = await messagesResponse.json();

      if (messagesData.success) {
        // Reverse to show newest messages at bottom
        setMessages(messagesData.data.reverse());
        setSelectedMessage(room);
        setShowChatView(true);
      }
    } catch (error) {
      console.error('Error fetching room messages:', error);
    }
  };

  // Function to handle contact click
  const handleContactClick = async (contact) => {
    console.log('Contact clicked:', contact);
    
    // First, check if we already have a chat room with this contact
    const existingRoom = chatRooms.find(room => {
      // Check if this is a direct message room with exactly 2 participants
      // and one of them is the clicked contact
      if (room.participants.length === 2) {
        const hasCurrentUser = room.participants.includes(currentUser);
        const hasContact = room.participants.includes(contact.username || contact.email);
        return hasCurrentUser && hasContact;
      }
      return false;
    });

    if (existingRoom) {
      console.log('Found existing room with contact:', existingRoom);
      // If we found an existing room, just open it
      await handleMessageClick(existingRoom);
    } else {
      console.log('Creating new room with contact:', contact);
      // No existing room found, we need to create a new one
      if (websocket) {
        setIsCreatingRoom(true);
        // Use the contact's username or email as the participant
        const participantId = contact.username || contact.email;
        
        // Create room request to the websocket
        websocket.send(JSON.stringify({
          _type: 'create_room',
          participants: [participantId],
          roomName: `${participantId}`
        }));
      } else {
        console.error('WebSocket connection not available');
      }
    }
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedMessage || !websocket) return;

    try {
      // Send message via WebSocket
      websocket.send(JSON.stringify({
        _type: 'message',
        roomId: selectedMessage.id,
        content: newMessage
      }));

      // Clear input immediately for better UX
      setNewMessage('');

      // Fetch updated messages
      const messagesResponse = await fetch(`http://localhost:9092/api/chat/rooms/${selectedMessage.id}/messages`, {
        credentials: 'include'
      });
      
      const messagesData = await messagesResponse.json();

      if (messagesData.success) {
        // Update messages state with newest messages
        setMessages(messagesData.data.reverse());
      } else {
        console.error('Failed to fetch updated messages');
      }
    } catch (error) {
      console.error('Error sending/fetching messages:', error);
    }
  };

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
  const handleNewMessage = async () => {
    // If search is not visible, show it
    if (!showSearch) {
      setShowSearch(true);
      // Focus will be handled by the useEffect that watches showSearch
    }

    // Try to fetch contacts if not already loaded
    if (contacts.length === 0) {
      try {
        const contactsResponse = await fetch('http://localhost:8080/api/contacts', {
          credentials: 'include'
        });
        const contactsData = await contactsResponse.json();
        setContacts(contactsData);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    }

    // Clear any existing search query to start fresh
    setSearchQuery('');
  };

  // Handle back button click in chat view
  const handleBackToList = () => {
    setShowChatView(false);
    setSelectedMessage(null);
    setMessages([]);
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

  // Function to determine if an item is a contact or a room
  const isContact = (item) => {
    return !item.participants && (item.username || item.email);
  };

  // Update the handleSearchInput function to be simpler
  const handleSearchInput = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setHasUserTyped(true);
  }, []);

  // Add useEffect for debouncing search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Add useEffect for performing search
  useEffect(() => {
    const performSearch = () => {
      if (!debouncedQuery.trim()) {
        setSearchResults(chatRooms);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const query = debouncedQuery.toLowerCase().trim();

      const roomResults = chatRooms.filter(room => 
        room.displayName?.toLowerCase().includes(query) ||
        room.participants?.some(p => p.toLowerCase().includes(query)) ||
        (room.roomName && room.roomName.toLowerCase().includes(query))
      );

      const contactResults = contacts.filter(contact => 
        contact.username?.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query)
      );

      requestAnimationFrame(() => {
        setSearchResults([...roomResults, ...contactResults]);
        setIsSearching(false);
      });
    };

    performSearch();
  }, [debouncedQuery, chatRooms, contacts]);

  // Render message list view
  const renderMessageListView = () => {
    const sizes = getResponsiveSizes();

    return (
      <>
        {/* Header */}
        <div className="message-header d-flex justify-content-between align-items-center p-3 border-bottom"
          style={{ padding: sizes.padding.container }}>
          {showSearch ? (
            <div className="search-container d-flex align-items-center w-100"
            style={{padding:"1px 0"}}>
              <div className="position-relative w-100">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="form-control border-0 shadow-none ps-4"
                  placeholder="Search for people or messages..."
                  value={searchQuery}
                  onChange={handleSearchInput}
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
          {isLoading || isCreatingRoom ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">
                  {isCreatingRoom ? 'Creating chat room...' : 'Loading...'}
                </span>
              </div>
            </div>
          ) : memoizedSearchResults.length > 0 ? (
            memoizedSearchResults.map((item, index) => (
              <div
                key={index}
                className="message-item d-flex align-items-start border-bottom hover-bg-light"
                style={{ padding: sizes.padding.item, cursor: 'pointer' }}
                onClick={() => {
                  // Check if it's a contact or a chat room
                  if (isContact(item)) {
                    handleContactClick(item);
                  } else {
                    // It's a room, handle message click
                    handleMessageClick(item);
                  }
                }}
              >
                <div className="position-relative me-2 flex-shrink-0">
                  <img
                    src={item.profileimg || "/profile.png"}
                    alt={item.username || item.roomName || "User"}
                    className="rounded-circle bg-light"
                    style={{
                      width: sizes.avatarSize,
                      height: sizes.avatarSize,
                      objectFit: "cover",
                      marginRight: '5px',
                      border: `2px solid ${isContact(item) ? '#28a745' : '#007bff'}`,
                    }}
                    onError={(e) => { e.target.src = "/avatars/placeholder.jpg" }}
                  />
                  {isContact(item) && (
                    <span className="position-absolute bottom-0 end-0 p-1 bg-success rounded-circle"
                      style={{ width: '12px', height: '12px', border: '2px solid white' }}>
                    </span>
                  )}
                </div>

                <div className="message-content flex-grow-1 overflow-hidden">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="sender-name fw-bold text-truncate" style={{
                      fontSize: sizes.fontSize.name,
                      maxWidth: containerWidth < 400 ? '60%' : '70%'
                    }}>
                      {searchQuery ? 
                        highlightText(isContact(item) ? 
                          (item.username || item.email) : 
                          item.displayName, 
                        searchQuery) : 
                        (isContact(item) ? 
                          (item.username || item.email) : 
                          item.displayName)
                      }
                      {isContact(item) && <span className="ms-2 badge bg-success">Contact</span>}
                    </div>
                    <div className="message-time text-muted ms-1 flex-shrink-0" style={{
                      fontSize: sizes.fontSize.time,
                    }}>
                      {item.time || item.createdAt}
                    </div>
                  </div>
                  {item.participants && (
                    <div className="message-preview text-muted text-truncate " style={{
                      fontSize: sizes.fontSize.message1,
                      maxWidth: '88%',
                    }}>
                      {item.participants.join(', ')}
                    </div>
                  )}
                  {isContact(item) && (
                    <div className="message-preview text-muted text-truncate " style={{
                      fontSize: sizes.fontSize.message1,
                      maxWidth: '88%',
                    }}>
                      {item.email || "Click to start chatting"}
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
              <p className="text-center">No messages or contacts found.</p>
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

  // Render chat view
  const renderChatView = () => {
    if (!selectedMessage) return null;

    const sizes = getResponsiveSizes();

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
              src={selectedMessage.avatar || "/profile.png"}
              alt={selectedMessage.roomName || "Chat Room"}
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
              {selectedMessage.roomName || selectedMessage.participants?.join(', ')}
            </div>
            <div className="text-muted text-truncate" style={{ fontSize: sizes.fontSize.time }}>
              {selectedMessage.participants?.length} participants
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="chat-messages flex-grow-1 overflow-auto p-4" style={{ backgroundColor: '#ffffff' }}>
          {messages.length === 0 ? (
            <div className="d-flex flex-column align-items-center justify-content-center text-muted h-100">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              // Check if this message is from the current user
              const isCurrentUser = msg.senderId === currentUser;
              
              return (
                <div key={index} className="mb-3">
                  <div 
                    className={`d-flex ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}
                  >
                    <div
                      className="chat-bubble"
                      style={{ 
                        maxWidth: '70%', 
                        width: 'fit-content'
                      }}
                    >
                      <div
                        className={`shadow-sm rounded-3 ${isCurrentUser ? 'bg-primary text-white' : 'bg-light'}`}
                        style={{
                          borderBottomRightRadius: isCurrentUser ? '0px' : '15px',
                          borderBottomLeftRadius: isCurrentUser ? '15px' : '0px',
                          borderTopRightRadius: '15px',
                          borderTopLeftRadius: '15px',
                          fontSize: sizes.fontSize.chat,
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          padding: '8px 15px',
                        }}
                      >
                        {msg.content}
                        <div 
                          className="text-end" 
                          style={{ 
                            fontSize: sizes.fontSize.time,
                            opacity: 0.8
                          }}
                        >
                          {`${msg.senddate} ${msg.sendtime}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
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
                className="btn position-absolute d-flex justify-content-center align-items-center"
                style={{
                  width: '36px',
                  height: '36px',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  borderRadius: '50%',
                  backgroundColor: newMessage.trim() === '' ? '#e9ecef' : '#007bff',
                  color: newMessage.trim() === '' ? '#6c757d' : '#ffffff'
                }}
                onClick={handleSendMessage}
                aria-label="Send message"
                disabled={newMessage.trim() === ''}
              >
                <FaPaperPlane size={14} />
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Render method
  return (
    <div
      ref={containerRef}
      className="position-relative bg-white font-inter shadow-sm d-flex flex-column"
      style={{
        height: '90vh', // Adjust as needed
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