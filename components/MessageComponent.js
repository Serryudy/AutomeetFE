/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FaPlus, FaSearch, FaTimes, FaCircle, FaArrowLeft, FaPaperclip, FaPaperPlane } from "react-icons/fa";
import { useProfile } from '@/hooks/useProfile';

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
  const chatMessagesRef = useRef(null);
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
  const [timezoneOffset, setTimezoneOffset] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected', 'error'
  const [typingUsers, setTypingUsers] = useState(new Set());
  const typingTimeoutRef = useRef(null);

  // Configuration - Updated ports to match Ballerina backend
  const WEBSOCKET_URL = 'ws://localhost:9090/ws/chat';
  const API_BASE_URL = 'http://localhost:8080/api/chat'; // Updated to use port 9090
  const USER_API_URL = 'http://localhost:8080/api/users'; // Keep existing user API
  const CONTACTS_API_URL = 'http://localhost:8080/api/community/contacts'; // Keep existing contacts API

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  // Function to determine if an item is a contact or a room
  const isContact = (item) => {
    return !item.participants && (item.username || item.email);
  };

  // Add memoized search results with null safety
  const memoizedSearchResults = useMemo(() => {
    return searchResults.filter(item => {
      if (!item) return false;
      
      if (isContact(item)) {
        return item.username || item.email;
      }
      
      return Array.isArray(item.participants);
    });
  }, [searchResults]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (containerRef.current) {
        setContainerWidth(containerRef.current.parentElement.clientWidth);
      }
    };

    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);

      if (containerRef.current) {
        setContainerWidth(containerRef.current.parentElement.clientWidth);
      }

      setTimeout(handleResize, 100);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  // Focus effects
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    if (showChatView && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [showChatView]);

  // Auto-scroll to bottom when messages change or chat view opens
  useEffect(() => {
    if (showChatView && messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [showChatView, messages]);

  // Replace profile fetching with useProfile hook
  const { profile, loading: profileLoading } = useProfile();

  // Update the profile effect
  useEffect(() => {
    if (profile) {
      // Use username consistently with Ballerina backend
      setCurrentUser(profile.username);
      fetchRoomsAndContacts(profile.username);
    }
  }, [profile]);

  // WebSocket connection effect - Updated to handle authentication properly
  useEffect(() => {
    if (!currentUser) {
      console.log('User not authenticated, skipping WebSocket connection');
      return;
    }

    console.log('Establishing WebSocket connection for user:', currentUser);
    setConnectionStatus('connecting');
    
    // Create WebSocket connection - Ballerina expects cookies for authentication
    const ws = new WebSocket(WEBSOCKET_URL);

    let connectionTimeout = setTimeout(() => {
      console.error('WebSocket connection timeout');
      setConnectionStatus('error');
      ws.close();
    }, 10000);

    ws.onopen = () => {
      console.log('✅ WebSocket Connected successfully');
      clearTimeout(connectionTimeout);
      setWebsocket(ws);
      setConnectionStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 WebSocket message received:', data);

        switch (data._type) {
          case 'connected':
            console.log('🔐 WebSocket authentication successful for user:', data.userId);
            break;
            
          case 'new_message':
            console.log('💬 New message received for room:', data.roomId);
            if (selectedMessage && data.roomId === selectedMessage.id) {
              const newMsg = {
                id: data.messageId,
                roomId: data.roomId,
                senderId: data.senderId,
                content: data.content,
                senddate: data.timestamp?.substring(0, 10) || new Date().toISOString().substring(0, 10),
                sendtime: data.timestamp?.substring(11, 19) || new Date().toTimeString().substring(0, 8),
                status: 'received',
                attachments: data.attachments || []
              };
              
              setMessages(prevMessages => {
                // Check if message already exists to prevent duplicates
                const messageExists = prevMessages.some(msg => msg.id === data.messageId);
                if (!messageExists) {
                  // Remove any temporary/optimistic messages with same content
                  const filteredMessages = prevMessages.filter(msg => 
                    !(msg.senderId === currentUser && msg.content === data.content && msg.status === 'sending')
                  );
                  const updatedMessages = [...filteredMessages, newMsg];
                  // Auto-scroll to show new message
                  setTimeout(() => {
                    scrollToBottom();
                  }, 100);
                  return updatedMessages;
                }
                return prevMessages;
              });
            }
            
            // Update the room list to show latest message
            fetchRoomsAndContacts();
            break;
            
          case 'room_joined':
            console.log('🏠 Successfully joined room:', data.roomId);
            break;
            
          case 'room_created':
            console.log('🆕 Room created successfully:', data.roomId);
            if (isCreatingRoom) {
              setIsCreatingRoom(false);
              
              // Create a room object that matches the expected format
              const newRoom = {
                id: data.roomId,
                participants: data.participants || [],
                roomName: data.roomName,
                displayName: data.roomName || getOtherParticipant(data.participants, currentUser) || 'New Chat',
                profile_pic: "/profile.png",
                latestMessage: "",
                latestMessageDate: "",
                latestMessageTime: "",
                isActive: true,
                createdAt: data.timestamp
              };
              
              console.log('Opening newly created room:', newRoom);
              handleMessageClick(newRoom);
              
              // Refresh the rooms list
              setTimeout(() => {
                fetchRoomsAndContacts();
              }, 1000);
            }
            break;
            
          case 'room_invitation':
            console.log('📧 Room invitation received from:', data.creatorId);
            fetchRoomsAndContacts();
            break;
            
          case 'typing':
            console.log('⌨️ User typing in room:', data.roomId);
            // Handle typing indicators
            if (selectedMessage && data.roomId === selectedMessage.id && data.senderId !== currentUser) {
              setTypingUsers(prev => new Set([...prev, data.senderId]));
              
              // Clear typing indicator after 3 seconds
              setTimeout(() => {
                setTypingUsers(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(data.senderId);
                  return newSet;
                });
              }, 3000);
            }
            break;
            
          case 'error':
            console.error('❌ WebSocket error from server:', data.content);
            if (data.content.includes('Unauthorized')) {
              setConnectionStatus('error');
            }
            break;
            
          default:
            console.warn('⚠️ Unknown message type received:', data._type);
        }
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error, event.data);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket Error:', error);
      clearTimeout(connectionTimeout);
      setConnectionStatus('error');
    };

    ws.onclose = (event) => {
      console.log('🔌 WebSocket Disconnected:', event.code, event.reason);
      clearTimeout(connectionTimeout);
      setWebsocket(null);
      setConnectionStatus('disconnected');
      
      // Auto-reconnect for non-authentication failures
      if (event.code !== 1000 && event.code !== 4001 && currentUser) {
        console.log('🔄 Attempting to reconnect in 3 seconds...');
        setTimeout(() => {
          if (currentUser) {
            console.log('🔄 Reconnecting WebSocket...');
          }
        }, 3000);
      }
    };

    return () => {
      clearTimeout(connectionTimeout);
      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log('🧹 Cleaning up WebSocket connection');
        ws.close(1000, 'Component unmounting');
      }
    };
  }, [selectedMessage, isCreatingRoom, currentUser]);

  // Update fetchRoomsAndContacts to use Ballerina API correctly
  const fetchRoomsAndContacts = useCallback(async (currentUsername = currentUser) => {
    if (!currentUsername) return;

    try {
      setIsLoading(true);

      // Fetch chat rooms from Ballerina backend
      const roomsResponse = await fetch(`${API_BASE_URL}/rooms`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!roomsResponse.ok) {
        throw new Error(`Failed to fetch rooms: ${roomsResponse.status}`);
      }

      const roomsData = await roomsResponse.json();
      console.log('Rooms response:', roomsData);

      if (roomsData.success && Array.isArray(roomsData.data)) {
        // Process rooms and get additional info for each
        const updatedRooms = await Promise.all(
          roomsData.data.map(async room => {
            try {
              const otherParticipant = getOtherParticipant(room.participants, currentUsername);

              // Fetch profile for other participant (keep using existing user API)
              let profileData = { name: otherParticipant, profile_pic: "/profile.png" };
              try {
                const profileResponse = await fetch(`${USER_API_URL}/${otherParticipant}`, {
                  credentials: 'include'
                });
                if (profileResponse.ok) {
                  profileData = await profileResponse.json();
                }
              } catch (err) {
                console.warn(`Could not fetch profile for ${otherParticipant}:`, err);
              }

              // Fetch latest message from Ballerina API
              let latestMessage = "";
              let latestMessageDate = "";
              let latestMessageTime = "";
              let latestMessageDateTime = null;

              try {
                const messagesResponse = await fetch(`${API_BASE_URL}/rooms/${room.id}/messages?_limit=1`, {
                  credentials: 'include'
                });
                
                if (messagesResponse.ok) {
                  const messagesData = await messagesResponse.json();
                  if (messagesData.success && messagesData.data.length > 0) {
                    const lastMsg = messagesData.data[0];
                    latestMessage = lastMsg.content;
                    latestMessageDate = lastMsg.senddate;
                    latestMessageTime = lastMsg.sendtime;
                    latestMessageDateTime = new Date(`${lastMsg.senddate}T${lastMsg.sendtime}`);
                  }
                }
              } catch (err) {
                console.warn(`Could not fetch messages for room ${room.id}:`, err);
              }

              return {
                ...room,
                displayName: profileData.name || room.roomName || otherParticipant,
                profile_pic: profileData.profile_pic && profileData.profile_pic !== "" ? profileData.profile_pic : "/profile.png",
                latestMessage,
                latestMessageDate,
                latestMessageTime,
                latestMessageDateTime
              };
            } catch (err) {
              console.error(`Error processing room ${room.id}:`, err);
              return {
                ...room,
                displayName: room.roomName || "Unknown Chat",
                profile_pic: "/profile.png",
                latestMessage: "",
                latestMessageDate: "",
                latestMessageTime: "",
                latestMessageDateTime: null
              };
            }
          })
        );

        // Filter out invalid rooms and sort by latest message
        const validRooms = updatedRooms.filter(room => room != null);
        validRooms.sort((a, b) => {
          if (a.latestMessageDateTime && b.latestMessageDateTime) {
            return b.latestMessageDateTime - a.latestMessageDateTime;
          }
          if (a.latestMessageDateTime) return -1;
          if (b.latestMessageDateTime) return 1;
          return 0;
        });

        setChatRooms(validRooms);

        if (searchQuery.trim() === '') {
          setSearchResults(validRooms);
        }
      } else {
        console.warn('Invalid rooms response:', roomsData);
        setChatRooms([]);
      }

      // Fetch all contacts at once
      try {
        const contactsResponse = await fetch(CONTACTS_API_URL, {
          credentials: 'include'
        });
        
        if (contactsResponse.ok) {
          const contactsData = await contactsResponse.json();

          // Fetch all contacts at once
          const contactsWithProfiles = await Promise.all(
            contactsData.map(async (contact) => {
              try {
                // Use the exact username from the contact object
                const usernameToFetch = contact.username;
                const profileResponse = await fetch(`${USER_API_URL}/${usernameToFetch}`, {
                  credentials: 'include'
                });
                if (profileResponse.ok) {
                  const profileData = await profileResponse.json();
                  return {
                    ...contact,
                    name: profileData.name || contact.username,
                    email: profileData.email || contact.email || contact.username,
                    profile_pic: profileData.profile_pic && profileData.profile_pic !== "" ? profileData.profile_pic : "/profile.png"
                  };
                }
                return {
                  ...contact,
                  name: contact.username,
                  email: contact.email || contact.username,
                  profile_pic: "/profile.png"
                };
              } catch (err) {
                console.error(`Error fetching profile for ${contact.username}:`, err);
                return {
                  ...contact,
                  name: contact.username,
                  email: contact.email || contact.username,
                  profile_pic: "/profile.png"
                };
              }
            })
          );

          const validContacts = contactsWithProfiles.filter(contact => contact != null);
          setContacts(validContacts);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setContacts([]);
      }

    } catch (error) {
      console.error('Error fetching rooms:', error);
      setChatRooms([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, searchQuery, API_BASE_URL]);

  // Fetch data on component load
  useEffect(() => {
    fetchRoomsAndContacts();
  }, [fetchRoomsAndContacts]);

  // Handle message click to load room messages
  const handleMessageClick = async (room) => {
    console.log('Opening room:', room);
    
    // Immediately show chat view and clear search
    setShowSearch(false);
    setSearchQuery('');
    setShowChatView(true);
    setSelectedMessage(room);
    setMessages([]); // Show loading state
    
    try {
      // Join the room via WebSocket if connection is available
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        console.log('Joining room via WebSocket:', room.id);
        websocket.send(JSON.stringify({
          _type: 'join_room',
          roomId: room.id
        }));
      }

      // Fetch room messages from Ballerina API
      console.log('Fetching messages for room:', room.id);
      const messagesResponse = await fetch(`${API_BASE_URL}/rooms/${room.id}/messages?_limit=50&offset=0`, {
        credentials: 'include'
      });
      
      if (!messagesResponse.ok) {
        throw new Error(`Failed to fetch messages: ${messagesResponse.status}`);
      }
      
      const messagesData = await messagesResponse.json();
      console.log('Messages response:', messagesData);

      if (messagesData.success && Array.isArray(messagesData.data)) {
        // Messages are already sorted by newest first, reverse to show oldest first
        setMessages(messagesData.data.reverse());
        console.log('Chat view opened successfully');
      } else {
        console.warn('No messages or invalid response:', messagesData);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error in handleMessageClick:', error);
      // Still keep the chat view open with empty messages
      setMessages([]);
    }
  };

  // Function to handle contact click - Updated for Ballerina backend
  const handleContactClick = async (contact) => {
    console.log('Contact clicked:', contact);

    // Prevent multiple clicks while processing
    if (isCreatingRoom) {
      console.log('Room creation already in progress, ignoring click');
      return;
    }

    // Use username consistently with Ballerina backend
    const currentUsername = currentUser;
    const contactUsername = contact.username;

    // Check if we already have a chat room with this contact
    const existingRoom = chatRooms.find(room => {
      if (room.participants && room.participants.length === 2) {
        // Check if room has both usernames as participants
        const hasCurrentUser = room.participants.includes(currentUsername);
        const hasContact = room.participants.includes(contactUsername);
        return hasCurrentUser && hasContact;
      }
      return false;
    });

    if (existingRoom) {
      console.log('Found existing room with contact:', existingRoom);
      // Immediately show chat view and clear search
      setShowSearch(false);
      setSearchQuery('');
      await handleMessageClick(existingRoom);
    } else {
      console.log('Creating new room with contact:', contact);
      
      // Immediately show chat view with loading state
      setShowSearch(false);
      setSearchQuery('');
      setShowChatView(true);
      setSelectedMessage({
        id: 'creating',
        displayName: contact.name || contact.username,
        profile_pic: contact.profile_pic || "/profile.png",
        participants: [currentUsername, contactUsername]
      });
      setMessages([]);
      
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        setIsCreatingRoom(true);
        
        console.log('Sending create_room request with usernames:', { currentUsername, contactUsername });
        
        // Send create room request with usernames (not emails)
        websocket.send(JSON.stringify({
          _type: 'create_room',
          participants: [contactUsername], // Ballerina will add current user automatically
          roomName: `${currentUsername} & ${contactUsername}`
        }));

        // Timeout for room creation
        setTimeout(() => {
          if (isCreatingRoom) {
            console.error('Room creation timeout');
            setIsCreatingRoom(false);
            // Go back to message list on timeout
            setShowChatView(false);
            setSelectedMessage(null);
          }
        }, 10000);
      } else {
        console.error('WebSocket connection not available');
        // Go back to message list on error
        setShowChatView(false);
        setSelectedMessage(null);
      }
    }
  };

  // Handle sending a new message - Updated to match Ballerina expectations
  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      console.warn('Cannot send empty message');
      return;
    }
    
    if (!selectedMessage || selectedMessage.id === 'creating') {
      console.warn('No valid chat room selected');
      return;
    }
    
    if (!websocket || websocket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket connection not available');
      return;
    }

    try {
      console.log('Sending message via WebSocket:', {
        roomId: selectedMessage.id,
        content: newMessage
      });

      // Send message via WebSocket - format matches Ballerina expectations
      websocket.send(JSON.stringify({
        _type: 'message',
        roomId: selectedMessage.id,
        content: newMessage,
        timestamp: new Date().toISOString()
      }));

      // Add message optimistically to UI
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        roomId: selectedMessage.id,
        senderId: currentUser,
        content: newMessage,
        senddate: new Date().toISOString().substring(0, 10),
        sendtime: new Date().toTimeString().substring(0, 8),
        status: 'sending'
      };

      setMessages(prevMessages => [...prevMessages, optimisticMessage]);

      // Clear input immediately for better UX
      setNewMessage('');

      // Send typing indicator stop
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          _type: 'typing',
          roomId: selectedMessage.id,
          content: 'stopped'
        }));
      }

      // Scroll to bottom to show new message
      setTimeout(() => {
        scrollToBottom();
      }, 50);

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!selectedMessage || !websocket || websocket.readyState !== WebSocket.OPEN) {
      return;
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    websocket.send(JSON.stringify({
      _type: 'typing',
      roomId: selectedMessage.id,
      content: 'typing'
    }));

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          _type: 'typing',
          roomId: selectedMessage.id,
          content: 'stopped'
        }));
      }
    }, 2000);
  };

  // Calculate responsive sizes
  const getResponsiveSizes = () => {
    const isMobile = windowWidth < 768;
    const isSmall = windowWidth < 576;
    const isNarrow = containerWidth < 350;

    return {
      containerHeight: isMobile ? '70vh' : '90vh',
      containerWidth: '100%',
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
      buttonSize1: isNarrow ? '40px' : isSmall ? '40px' : '46px',
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

  // Handle new message click
  const handleNewMessage = async () => {
    if (!showSearch) {
      setShowSearch(true);
    }

    if (contacts.length === 0) {
      try {
        const contactsResponse = await fetch(CONTACTS_API_URL, {
          credentials: 'include'
        });
        if (contactsResponse.ok) {
          const contactsData = await contactsResponse.json();
          setContacts(contactsData);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    }

    setSearchQuery('');
  };

  // Handle back button click in chat view
  const handleBackToList = () => {
    // Leave the room via WebSocket
    if (websocket && websocket.readyState === WebSocket.OPEN && selectedMessage && selectedMessage.id !== 'creating') {
      websocket.send(JSON.stringify({
        _type: 'leave_room',
        roomId: selectedMessage.id
      }));
    }

    setShowChatView(false);
    setSelectedMessage(null);
    setMessages([]);
    setTypingUsers(new Set());
    fetchRoomsAndContacts();
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

  // Handle search input
  const handleSearchInput = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setHasUserTyped(true);
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform search effect
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
        room && (
          room.displayName?.toLowerCase().includes(query) ||
          room.participants?.some(p => p && p.toLowerCase().includes(query)) ||
          (room.roomName && room.roomName.toLowerCase().includes(query))
        )
      );

      const contactResults = contacts.filter(contact =>
        contact && (
          contact.username?.toLowerCase().includes(query) ||
          contact.email?.toLowerCase().includes(query) ||
          contact.name?.toLowerCase().includes(query)
        )
      );

      requestAnimationFrame(() => {
        setSearchResults([...roomResults, ...contactResults]);
        setIsSearching(false);
      });
    };

    performSearch();
  }, [debouncedQuery, chatRooms, contacts]);

  // Timezone effect - Added from first code
  useEffect(() => {
    if (profile && profile.username) {
      getUserTimezoneOffset(profile.username).then(result => {
        setTimezoneOffset(result);
      });
    }
  }, [profile]);

  // Time formatting functions - Updated from first code
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    let [hour, minute] = timeStr.split(':');
    let h = parseInt(hour, 10);
    let m = parseInt(minute, 10);

    // Apply timezone offset if available
    if (timezoneOffset && typeof timezoneOffset.hours === 'number' && typeof timezoneOffset.minutes === 'number') {
      h += timezoneOffset.hours;
      m += timezoneOffset.minutes;

      // Handle minute overflow
      if (m >= 60) {
        h += Math.floor(m / 60);
        m = m % 60;
      } else if (m < 0) {
        h -= Math.ceil(Math.abs(m) / 60);
        m = ((m % 60) + 60) % 60;
      }

      // Handle hour overflow
      if (h >= 24) {
        h = h % 24;
      } else if (h < 0) {
        h = ((h % 24) + 24) % 24;
      }
    }

    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    const displayMinute = m.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${ampm}`;
  };

  const formatMessageDate = (dateStr, timeStr) => {
    if (!dateStr) return '';
    const today = new Date();
    const date = new Date(dateStr);
    // Remove time part for comparison
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diff = (today - date) / (1000 * 60 * 60 * 24);
    const formattedTime = formatTime(timeStr);
    if (diff === 0) return `Today ${formattedTime}`;
    if (diff === 1) return `Yesterday ${formattedTime}`;
    return `${dateStr} ${formattedTime}`;
  };

  // fetch logged-in user details - Added from first code
  const getUserTimezoneOffset = async (username) => {
    // Automatically get username from localStorage
    if (!username) {
      throw new Error('No logged-in user found');
    }

    try {
      // Fetch user profile to get timezone
      const response = await fetch(`${USER_API_URL}/${username}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userData = await response.json();
      const userTimeZone = userData.time_zone ? userData.time_zone : 'UTC';

      // Calculate timezone offset
      const now = new Date();

      // Get local time in UTC minutes
      const localUtcMinutes = now.getTimezoneOffset() * -1;

      // Get user time in UTC minutes
      const userDate = new Date(now.toLocaleString('en-US', { timeZone: userTimeZone }));
      const userUtcMinutes = userDate.getHours() * 60 + userDate.getMinutes() - (now.getHours() * 60 + now.getMinutes()) + localUtcMinutes;

      // Calculate the offset to add to local time to get user time
      const offsetMinutes = userUtcMinutes;

      const hours = Math.floor(offsetMinutes / 60);
      const minutes = offsetMinutes % 60;

      return { hours, minutes };

    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Helper functions
  const getItemDisplayName = (item) => {
    if (!item) return 'Unknown';
    
    if (isContact(item)) {
      return item.name && item.name !== "" ? item.name : item.username || 'Unknown Contact';
    } else {
      return item.displayName || item.roomName || 'Unknown Room';
    }
  };

  const getItemProfilePic = (item) => {
    if (!item) return "/profile.png";
    return item.profile_pic && item.profile_pic !== "" ? item.profile_pic : "/profile.png";
  };

  // Render message list view
  const renderMessageListView = () => {
    return (
      <>
        {/* Header */}
        <div className="message-header d-flex justify-content-between align-items-center p-3 border-bottom"
          style={{ padding: sizes.padding.container }}>
          {showSearch ? (
            <div className="search-container d-flex align-items-center w-100"
              style={{ padding: "1px 0" }}>
              <div className="position-relative w-100">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="form-control border-0 shadow-none ps-4"
                  placeholder="Search people in your contacts ..."
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
              <div className="d-flex align-items-center">
                <span className="m-0 p-1 fw-bold" style={{ fontSize: sizes.fontSize.header }}>Messages</span>
                {/* Connection Status Indicator */}
                <div className="ms-2 d-flex align-items-center">
                  <FaCircle 
                    size={8} 
                    className={`me-1 ${
                      connectionStatus === 'connected' ? 'text-success' : 
                      connectionStatus === 'connecting' ? 'text-warning' : 
                      'text-danger'
                    }`} 
                  />
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                    {connectionStatus === 'connected' ? 'Online' : 
                     connectionStatus === 'connecting' ? 'Connecting...' : 
                     'Offline'}
                  </small>
                </div>
              </div>
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
          {isLoading || profileLoading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : memoizedSearchResults.length > 0 ? (
            memoizedSearchResults.map((item, index) => {
              if (!item) return null;

              const displayName = getItemDisplayName(item);
              const profilePic = getItemProfilePic(item);
              const isContactItem = isContact(item);

              return (
                <div
                  key={`${isContactItem ? 'contact' : 'room'}-${item.id || item.username || index}`}
                  className="message-item d-flex align-items-start border-bottom hover-bg-light"
                  style={{ padding: sizes.padding.item, cursor: 'pointer' }}
                  onClick={async () => {
                    console.log('🔍 Search result clicked:', item);
                    console.log('📋 Is contact item:', isContactItem);
                    
                    // Prevent multiple rapid clicks
                    if (isCreatingRoom) {
                      console.log('⏸️ Room creation in progress, ignoring click');
                      return;
                    }
                    
                    try {
                      if (isContactItem) {
                        console.log('👤 Handling contact click for:', item.username);
                        await handleContactClick(item);
                      } else {
                        console.log('💬 Handling room click for:', item.id);
                        await handleMessageClick(item);
                      }
                      
                      console.log('✅ Navigation completed, chat view should be active');
                    } catch (error) {
                      console.error('❌ Error during navigation:', error);
                    }
                  }}
                >
                  <div className="position-relative me-2 flex-shrink-0">
                    <img
                      src={profilePic}
                      alt={displayName}
                      className="rounded-circle bg-light"
                      style={{
                        width: sizes.avatarSize,
                        height: sizes.avatarSize,
                        objectFit: "cover",
                        marginRight: '5px',
                        border: `2px solid ${isContactItem ? '#28a745' : '#007bff'}`,
                      }}
                      onError={(e) => { e.target.src = "/profile.png"; }}
                    />

                    {isContactItem && (
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
                          highlightText(displayName, searchQuery) :
                          displayName
                        }
                        {isContactItem && <span className="ms-2 badge bg-success">Contact</span>}
                      </div>
                      <div className="message-date text-muted" style={{ fontSize: sizes.fontSize.time }}>
                        {formatMessageDate(item.latestMessageDate || item.date || "")}
                      </div>
                    </div>
                    <div className="d-flex ">
                      <div style={{ flexGrow: 1, minWidth: '0' }}>
                        {item.latestMessage && (
                          <div className="message-preview text-muted text-truncate" style={{
                            fontSize: sizes.fontSize.message1,
                            maxWidth: '90%',
                          }}>
                            {item.latestMessage}
                          </div>
                        )}
                      </div>
                      <div className="message-time text-muted" style={{ fontSize: sizes.fontSize.time, minWidth: '50px', textAlign: 'right' }}>
                        {formatTime(item.latestMessageTime || item.time || "")}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center text-muted h-100 p-4">
              <div className="mb-3">
                <FaSearch size={32} />
              </div>
              <p className="text-center">
                {connectionStatus === 'connected' ? 
                  'No messages or contacts found.' : 
                  'Connecting to chat service...'}
              </p>
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
              backgroundColor: "#0076f5",
              color: "#ffffff",
            }}
            onClick={handleNewMessage}
            onMouseEnter={(e) => (e.target.style.width = sizes.buttonSize1, e.target.style.height = sizes.buttonSize1, e.target.style.backgroundColor = "#004fa3")}
            onMouseLeave={(e) => (e.target.style.width = sizes.buttonSize, e.target.style.height = sizes.buttonSize, e.target.style.backgroundColor = "#0076f5")}
            aria-label="New message"
            disabled={connectionStatus !== 'connected'}
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
              src={selectedMessage.profile_pic || "/profile.png"}
              alt={selectedMessage.displayName || selectedMessage.roomName || "Chat Room"}
              className="rounded-circle bg-light"
              style={{
                width: sizes.avatarSize,
                height: sizes.avatarSize,
                objectFit: "cover",
              }}
              onError={(e) => { e.target.src = "/profile.png" }}
            />
          </div>
          <div className="chat-user-info flex-grow-1 overflow-hidden">
            <div className="fw-bold text-truncate" style={{ fontSize: "1.2rem" }}>
              {selectedMessage.displayName || selectedMessage.roomName || selectedMessage.participants?.join(', ')}
            </div>
            {/* Typing indicator */}
            {typingUsers.size > 0 && (
              <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
              </div>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div 
          ref={chatMessagesRef}
          className="chat-messages flex-grow-1 overflow-auto p-4" 
          style={{ backgroundColor: '#ffffff' }}
        >
          {selectedMessage.id === 'creating' ? (
            <div className="d-flex flex-column align-items-center justify-content-center text-muted h-100">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Creating room...</span>
              </div>
              <p>Creating chat room...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="d-flex flex-column align-items-center justify-content-center text-muted h-100">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isCurrentUser = msg.senderId === currentUser;

              const formatDateWithDay = (dateStr) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const dayName = days[date.getDay()];
                return `${dayName}, ${dateStr}`;
              };

              const isFirstMessageOfDate = index === 0 ||
                (messages[index - 1] && messages[index - 1].senddate !== msg.senddate);

              return (
                <div key={msg.id || index}>
                  {isFirstMessageOfDate && msg.senddate && (
                    <div className="d-flex justify-content-center mb-3">
                      <div
                        className="text-black px-3 py-1"
                        style={{
                          fontSize: sizes.fontSize.time,
                          opacity: 0.8,
                          backgroundColor: '#ebebeb',
                          borderRadius: '8px'
                        }}
                      >
                        {formatDateWithDay(msg.senddate)}
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <div
                      className={`d-flex ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}
                    >
                      <div
                        className="chat-bubble"
                        style={{
                          maxWidth: '80%',
                          width: 'fit-content',
                          minHeight: 'auto',
                          height: 'auto'
                        }}
                      >
                        <div
                          className={`${isCurrentUser ? 'bg-primary text-white' : 'text-dark'}`}
                          style={{
                            backgroundColor: isCurrentUser ? '' : '#ebebeb',
                            borderBottomRightRadius: isCurrentUser ? '0px' : '15px',
                            borderBottomLeftRadius: isCurrentUser ? '15px' : '0px',
                            borderTopRightRadius: '15px',
                            borderTopLeftRadius: '15px',
                            fontSize: sizes.fontSize.chat,
                            padding: '8px 15px',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {msg.content}
                          
                          {/* Show attachments if any */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2">
                              {msg.attachments.map((attachment, idx) => (
                                <div key={idx} className="attachment-item mb-1">
                                  <FaPaperclip className="me-1" />
                                  <a href={attachment.url} target="_blank" rel="noopener noreferrer" 
                                     className={isCurrentUser ? "text-light" : "text-primary"}>
                                    {attachment.name} ({attachment.size} bytes)
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div
                            className="text-end d-flex align-items-center justify-content-end"
                            style={{
                              fontSize: sizes.fontSize.time,
                              opacity: 0.8,
                              marginTop: '4px'
                            }}
                          >
                            <span className="me-1">{formatTime(msg.sendtime)}</span>
                            {isCurrentUser && (
                              <span style={{ fontSize: '0.7rem' }}>
                                {msg.status === 'sending' ? '⏳' : 
                                 msg.status === 'sent' ? '✓' : 
                                 msg.status === 'received' ? '✓✓' : ''}
                              </span>
                            )}
                          </div>
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
          <div className="d-flex align-items-center position-relative">
            <div className="flex-grow-1">
              <input
                ref={messageInputRef}
                type="text"
                className="form-control rounded-pill"
                placeholder={
                  selectedMessage.id === 'creating' ? "Creating room..." :
                  connectionStatus !== 'connected' ? "Connecting... Type your message" : 
                  "Type a message ..."
                }
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  if (e.target.value.trim() && connectionStatus === 'connected') {
                    handleTyping();
                  }
                }}
                onKeyDown={(e) => { 
                  if (e.key === 'Enter' && !e.shiftKey) { 
                    e.preventDefault(); 
                    if (connectionStatus === 'connected' && selectedMessage.id !== 'creating') {
                      handleSendMessage(); 
                    }
                  } 
                }}
                style={{ fontSize: sizes.fontSize.message, paddingRight: '50px', width: '85%' }}
                disabled={selectedMessage.id === 'creating'}
              />
            </div>
            <div>
              <button
                className="btn position-absolute d-flex justify-content-center align-items-center"
                style={{
                  width: '35px',
                  height: '35px',
                  right: '1px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  borderRadius: '40%',
                  backgroundColor: 
                    selectedMessage.id === 'creating' || newMessage.trim() === '' ? '#e9ecef' : '#007bff',
                  color: 
                    selectedMessage.id === 'creating' || newMessage.trim() === '' ? '#6c757d' : '#ffffff'
                }}
                onClick={handleSendMessage}
                aria-label="Send message"
                disabled={selectedMessage.id === 'creating' || newMessage.trim() === '' || connectionStatus !== 'connected'}
                title={
                  selectedMessage.id === 'creating' ? 'Creating room...' :
                  connectionStatus !== 'connected' ? 'Connection required to send messages' : 
                  'Send message'
                }
              >
                <FaPaperPlane size={18} />
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
        height: '90vh',
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