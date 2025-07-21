/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FaPlus, FaSearch, FaTimes, FaCircle, FaArrowLeft, FaPaperclip, FaPaperPlane, FaUsers, FaUserPlus, FaUserMinus } from "react-icons/fa";
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
  const fetchRoomsRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(450);
  const [messages, setMessages] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [websocket, setWebsocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [roomCreationCountdown, setRoomCreationCountdown] = useState(0);
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [timezoneOffset, setTimezoneOffset] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected', 'error'
  
  // Group creation states
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  
  // Group management states
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showRemoveMember, setShowRemoveMember] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isManagingMembers, setIsManagingMembers] = useState(false);
  const [showMemberManagementMenu, setShowMemberManagementMenu] = useState(false);

  // Popup message states
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success'); // 'success' or 'error'

  // Configuration - Update these URLs to match your Ballerina backend
  const WEBSOCKET_URL = 'ws://localhost:9090/ws/chat';
  const API_BASE_URL = 'http://localhost:8080/api/chat';
  const USER_API_URL = 'http://localhost:8080/api/users'; // Keep existing user API
  const CONTACTS_API_URL = 'http://localhost:8080/api/community/contacts'; // Keep existing contacts API

  // Function to determine if an item is a contact or a room
  const isContact = (item) => {
    return !item.participants && (item.username || item.email);
  };

  // Function to determine if a room is a group (more than 2 participants)
  const isGroupRoom = (room) => {
    return room.participants && room.participants.length > 2;
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

  // Replace profile fetching with useProfile hook
  const { profile, loading: profileLoading } = useProfile();

  // Update the profile effect
  useEffect(() => {
    if (profile) {
      setCurrentUser(profile.username);
      if (fetchRoomsRef.current) {
        fetchRoomsRef.current(profile.username);
      }
    }
  }, [profile]);

  // WebSocket connection effect
  useEffect(() => {
    if (!currentUser) {
      console.log('User not authenticated, skipping WebSocket connection');
      return;
    }

    console.log('Establishing WebSocket connection for user:', currentUser);
    setConnectionStatus('connecting');
    
    // Create WebSocket connection with cookies for authentication
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
                senderName: data.senderName || data.senderId, // Include sender name for group chats
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
                  // Auto-scroll to show new message
                  setTimeout(() => scrollToBottom(), 100);
                  return [...prevMessages, newMsg];
                }
                return prevMessages;
              });
            }
            
            // Update the room list to show latest message
            setTimeout(() => {
              if (fetchRoomsRef.current) {
                fetchRoomsRef.current();
              }
            }, 100);
            break;
            
          case 'room_joined':
            console.log('🏠 Successfully joined room:', data.roomId);
            break;
            
          case 'room_created':
            console.log('🆕 Room created successfully:', data.roomId);
            if (isCreatingRoom || isCreatingGroup) {
              // Start countdown from 6 seconds for groups, 5 for individual
              const countdownTime = isCreatingGroup ? 6 : 5;
              setRoomCreationCountdown(countdownTime);
              
              // Clear any existing countdown
              if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
              }
              
              // Create countdown interval
              countdownIntervalRef.current = setInterval(() => {
                setRoomCreationCountdown(prev => {
                  if (prev <= 1) {
                    if (countdownIntervalRef.current) {
                      clearInterval(countdownIntervalRef.current);
                      countdownIntervalRef.current = null;
                    }
                    return 0;
                  }
                  return prev - 1;
                });
              }, 1000);
              
              console.log('Room created successfully, showing success message');
            }
            break;
            
          case 'room_invitation':
            console.log('📧 Room invitation received from:', data.creatorId || data.invitedBy);
            setTimeout(() => {
              if (fetchRoomsRef.current) {
                fetchRoomsRef.current();
              }
            }, 100);
            break;
            
          case 'members_added':
            console.log('👥 Members added to room:', data.roomId, 'Added:', data.addedMembers);
            // Refresh room list to reflect updated member count
            setTimeout(() => {
              if (fetchRoomsRef.current) {
                fetchRoomsRef.current();
              }
            }, 100);
            break;
            
          case 'members_removed':
            console.log('👤 Members removed from room:', data.roomId, 'Removed:', data.removedMembers);
            // Refresh room list to reflect updated member count
            setTimeout(() => {
              if (fetchRoomsRef.current) {
                fetchRoomsRef.current();
              }
            }, 100);
            break;
            
          case 'removed_from_room':
            console.log('🚪 You were removed from room:', data.roomId, 'By:', data.removedBy);
            // Show notification to user
            alert(`You have been removed from "${data.roomName}" by ${data.removedBy}`);
            
            // If user is currently in the room they were removed from, navigate back to list
            if (selectedMessage && selectedMessage.id === data.roomId) {
              setShowChatView(false);
              setSelectedMessage(null);
              setMessages([]);
            }
            
            // Refresh room list
            setTimeout(() => {
              if (fetchRoomsRef.current) {
                fetchRoomsRef.current();
              }
            }, 100);
            break;
            
          case 'typing':
            console.log('⌨️ User typing in room:', data.roomId);
            // Handle typing indicators here if needed
            break;
            
          case 'error':
            console.error('❌ WebSocket error from server:', data.content);
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
      
      // Clean up countdown interval
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      
      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log('🧹 Cleaning up WebSocket connection');
        ws.close(1000, 'Component unmounting');
      }
    };
  }, [selectedMessage, isCreatingRoom, isCreatingGroup, currentUser]);

  // Update fetchRoomsAndContacts to use Ballerina API
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
                    email: profileData.email || contact.email || contact.username, // Ensure email is available
                    profile_pic: profileData.profile_pic && profileData.profile_pic !== "" ? profileData.profile_pic : "/profile.png"
                  };
                }
                return {
                  ...contact,
                  name: contact.username,
                  email: contact.email || contact.username, // Fallback to username if no email
                  profile_pic: "/profile.png"
                };
              } catch (err) {
                console.error(`Error fetching profile for ${contact.username}:`, err);
                return {
                  ...contact,
                  name: contact.username,
                  email: contact.email || contact.username, // Fallback to username if no email
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

  // Store the function in a ref to avoid dependency issues
  useEffect(() => {
    fetchRoomsRef.current = fetchRoomsAndContacts;
  }, [fetchRoomsAndContacts]);

  // Fetch data on component load
  useEffect(() => {
    fetchRoomsAndContacts();
  }, [fetchRoomsAndContacts]);

  // Handle message click to load room messages
  const handleMessageClick = async (room) => {
    console.log('Opening room:', room);
    
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
      const messagesResponse = await fetch(`${API_BASE_URL}/rooms/${room.id}/messages`, {
        credentials: 'include'
      });
      
      if (!messagesResponse.ok) {
        throw new Error(`Failed to fetch messages: ${messagesResponse.status}`);
      }
      
      const messagesData = await messagesResponse.json();
      console.log('Messages response:', messagesData);

      if (messagesData.success && Array.isArray(messagesData.data)) {
        // For group chats, fetch sender names
        let processedMessages = messagesData.data;
        
        if (isGroupRoom(room)) {
          console.log('Processing group messages to add sender names');
          processedMessages = await Promise.all(
            messagesData.data.map(async (message) => {
              try {
                // For current user, use "You" as sender name
                if (message.senderId === currentUser) {
                  return {
                    ...message,
                    senderName: "You"
                  };
                }
                
                // If senderName already exists and is not just the senderId, use it
                if (message.senderName && message.senderName !== message.senderId) {
                  return message;
                }
                
                // Fetch sender profile to get name
                const senderResponse = await fetch(`${USER_API_URL}/${message.senderId}`, {
                  credentials: 'include'
                });
                
                if (senderResponse.ok) {
                  const senderData = await senderResponse.json();
                  return {
                    ...message,
                    senderName: senderData.name || senderData.username || message.senderId
                  };
                }
              } catch (err) {
                console.warn(`Could not fetch sender name for ${message.senderId}:`, err);
              }
              
              // Fallback to senderId (email/username)
              return {
                ...message,
                senderName: message.senderId
              };
            })
          );
        }

        // Messages are already sorted by newest first, reverse to show oldest first
        setMessages(processedMessages.reverse());
        setSelectedMessage(room);
        setShowChatView(true);
        // Auto-scroll to latest messages after chat view loads - multiple attempts for reliability
        setTimeout(() => scrollToBottom(false), 100);
        setTimeout(() => scrollToBottom(false), 300);
        setTimeout(() => scrollToBottom(false), 500);
        console.log('Chat view opened successfully');
      } else {
        console.warn('No messages or invalid response:', messagesData);
        setMessages([]);
        setSelectedMessage(room);
        setShowChatView(true);
        // Still auto-scroll even with no messages
        setTimeout(() => scrollToBottom(false), 100);
        setTimeout(() => scrollToBottom(false), 300);
      }
    } catch (error) {
      console.error('Error in handleMessageClick:', error);
      // Still try to open the chat view
      setMessages([]);
      setSelectedMessage(room);
      setShowChatView(true);
      // Still auto-scroll even on error - multiple attempts
      setTimeout(() => scrollToBottom(false), 100);
      setTimeout(() => scrollToBottom(false), 300);
      setTimeout(() => scrollToBottom(false), 500);
    }
  };

  // Function to handle contact click
  const handleContactClick = async (contact) => {
    console.log('Contact clicked:', contact);

    // Get current user email from profile
    const currentUserEmail = profile?.email || profile?.username;
    const contactEmail = contact.email || contact.username;

    // Check if we already have a chat room with this contact
    const existingRoom = chatRooms.find(room => {
      if (room.participants && room.participants.length === 2) {
        // Check if room has both user emails as participants
        const hasCurrentUserEmail = room.participants.includes(currentUserEmail);
        const hasContactEmail = room.participants.includes(contactEmail);
        return hasCurrentUserEmail && hasContactEmail;
      }
      return false;
    });

    if (existingRoom) {
      console.log('Found existing room with contact:', existingRoom);
      await handleMessageClick(existingRoom);
    } else {
      console.log('Creating new room with contact:', contact);
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        setIsCreatingRoom(true);
        
        console.log('Sending create_room request with emails:', { currentUserEmail, contactEmail });
        
        websocket.send(JSON.stringify({
          _type: 'create_room',
          participants: [contactEmail],
          roomName: `${currentUserEmail} & ${contactEmail}`
        }));

        // Always navigate back to chat list after 5 seconds regardless of success or failure
        setTimeout(() => {
          console.log('5 seconds elapsed, navigating back to message list regardless of room creation status');
          
          // Clean up countdown interval if it exists
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          
          setIsCreatingRoom(false);
          setRoomCreationCountdown(0);
          
          // Navigate back to message list view and reset search states
          setShowChatView(false);
          setSelectedMessage(null);
          setMessages([]);
          setShowSearch(false);
          setSearchQuery('');
          setSearchResults([]);
          setIsSearching(false);
          setHasUserTyped(false);
          
          // Refresh the rooms list
          if (fetchRoomsRef.current) {
            fetchRoomsRef.current();
          }
        }, 5000); // 5 seconds delay - always execute

      } else {
        console.error('WebSocket connection not available');
        alert('Connection not available. Please refresh the page and try again.');
      }
    }
  };

  // Handle create group button click
  const handleCreateGroup = () => {
    setShowCreateGroup(true);
    setShowSearch(false);
    setGroupName("");
    setSelectedMembers([]);
  };

  // Handle group member selection
  const handleMemberToggle = (contact) => {
    setSelectedMembers(prev => {
      const isSelected = prev.some(member => member.username === contact.username);
      if (isSelected) {
        return prev.filter(member => member.username !== contact.username);
      } else {
        return [...prev, contact];
      }
    });
  };

  // Handle group creation
  const handleCreateGroupRoom = () => {
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }
    
    if (selectedMembers.length === 0) {
      alert('Please select at least one member for the group');
      return;
    }

    if (websocket && websocket.readyState === WebSocket.OPEN) {
      setIsCreatingGroup(true);
      
      // Get participant emails including current user
      const participantEmails = selectedMembers.map(member => member.email || member.username);
      const currentUserEmail = profile?.email || profile?.username;
      
      console.log('Creating group with:', {
        groupName,
        participants: participantEmails,
        creator: currentUserEmail
      });
      
      websocket.send(JSON.stringify({
        _type: 'create_room',
        participants: participantEmails,
        roomName: groupName
      }));

      // Always navigate back to chat list after 6 seconds regardless of success or failure
      setTimeout(() => {
        console.log('6 seconds elapsed, navigating back to message list regardless of group creation status');
        
        // Clean up countdown interval if it exists
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        
        setIsCreatingGroup(false);
        setRoomCreationCountdown(0);
        
        // Navigate back to message list view and reset all states
        setShowChatView(false);
        setSelectedMessage(null);
        setMessages([]);
        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
        setIsSearching(false);
        setHasUserTyped(false);
        setShowCreateGroup(false);
        setGroupName("");
        setSelectedMembers([]);
        
        // Refresh the rooms list
        if (fetchRoomsRef.current) {
          fetchRoomsRef.current();
        }
      }, 6000); // 6 seconds delay - always execute

    } else {
      console.error('WebSocket connection not available');
      alert('Connection not available. Please refresh the page and try again.');
    }
  };

  // Handle canceling group creation
  const handleCancelGroupCreation = () => {
    setShowCreateGroup(false);
    setGroupName("");
    setSelectedMembers([]);
    setShowSearch(true);
  };

  // Show popup message function
  const showPopupMessage = (message, type = 'success') => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    // Auto-hide popup after 3 seconds
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  // Group management functions
  const handleGroupHeaderClick = () => {
    if (isGroupRoom(selectedMessage)) {
      setShowMemberManagementMenu(!showMemberManagementMenu);
    }
  };

  const handleShowGroupInfo = async () => {
    if (!selectedMessage || !isGroupRoom(selectedMessage)) return;
    
    try {
      // Fetch current group members with their details
      const membersWithDetails = await Promise.all(
        selectedMessage.participants.map(async (participantEmail) => {
          try {
            // Find in contacts first
            const contact = contacts.find(c => 
              c.email === participantEmail || c.username === participantEmail
            );
            
            if (contact) {
              return {
                email: participantEmail,
                name: contact.name || contact.username,
                username: contact.username,
                profile_pic: contact.profile_pic || "/profile.png"
              };
            }
            
            // If not in contacts, try to fetch user profile
            const userResponse = await fetch(`${USER_API_URL}/${participantEmail}`, {
              credentials: 'include'
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              return {
                email: participantEmail,
                name: userData.name || userData.username || participantEmail,
                username: userData.username || participantEmail,
                profile_pic: userData.profile_pic || "/profile.png"
              };
            }
            
            // Fallback
            return {
              email: participantEmail,
              name: participantEmail,
              username: participantEmail,
              profile_pic: "/profile.png"
            };
          } catch (error) {
            console.error(`Error fetching details for ${participantEmail}:`, error);
            return {
              email: participantEmail,
              name: participantEmail,
              username: participantEmail,
              profile_pic: "/profile.png"
            };
          }
        })
      );
      
      setGroupMembers(membersWithDetails);
      setShowGroupInfo(true);
      setShowMemberManagementMenu(false);
    } catch (error) {
      console.error('Error fetching group members:', error);
    }
  };

  const handleAddMember = () => {
    setShowAddMember(true);
    setSelectedMembers([]);
    setShowMemberManagementMenu(false);
  };

  const handleConfirmAddMember = async () => {
    if (selectedMembers.length === 0) return;
    
    setIsManagingMembers(true);
    
    try {
      const newMemberEmails = selectedMembers.map(member => member.email || member.username);
      
      // Add members using REST API
      const response = await fetch(`${API_BASE_URL}/rooms/${selectedMessage.id}/members`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          members: newMemberEmails
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Members added successfully:', result.data?.addedMembers);
        
        setShowAddMember(false);
        setSelectedMembers([]);
        setShowGroupInfo(false);
        
        // Show success popup message
        showPopupMessage(`Successfully added ${result.data?.addedMembers?.length || selectedMembers.length} members to the group`, 'success');
        
        // Refresh current chatroom data
        setTimeout(async () => {
          // Refresh room list
          if (fetchRoomsRef.current) {
            fetchRoomsRef.current();
          }
          
          // Refresh current room data if we're in chat view
          if (selectedMessage && selectedMessage.id) {
            try {
              const roomResponse = await fetch(`${API_BASE_URL}/rooms/${selectedMessage.id}`, {
                credentials: 'include'
              });
              
              if (roomResponse.ok) {
                const roomData = await roomResponse.json();
                if (roomData.success && roomData.data) {
                  // Update selectedMessage with new participant data
                  setSelectedMessage(prev => ({
                    ...prev,
                    participants: roomData.data.participants
                  }));
                }
              }
            } catch (error) {
              console.error('Error refreshing current room:', error);
            }
          }
        }, 500);
      } else {
        console.error('Failed to add members:', result.message);
        showPopupMessage(`Failed to add members: ${result.message}`, 'error');
      }
    } catch (error) {
      console.error('Error adding members:', error);
      showPopupMessage('Failed to add members. Please try again.', 'error');
    } finally {
      setIsManagingMembers(false);
    }
  };

  const handleRemoveMember = (member) => {
    setMemberToRemove(member);
    setShowRemoveMember(true);
  };

  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove) return;
    
    setIsManagingMembers(true);
    
    try {
      // Remove member using REST API
      const response = await fetch(`${API_BASE_URL}/rooms/${selectedMessage.id}/members`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          members: [memberToRemove.email]
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Member removed successfully:', result.data?.removedMembers);
        
        setShowRemoveMember(false);
        setMemberToRemove(null);
        setShowGroupInfo(false);
        
        // Show success popup message
        showPopupMessage(`Successfully removed ${memberToRemove.name || memberToRemove.username} from the group`, 'success');
        
        // Refresh current chatroom data
        setTimeout(async () => {
          // Refresh room list
          if (fetchRoomsRef.current) {
            fetchRoomsRef.current();
          }
          
          // Refresh current room data if we're in chat view
          if (selectedMessage && selectedMessage.id) {
            try {
              const roomResponse = await fetch(`${API_BASE_URL}/rooms/${selectedMessage.id}`, {
                credentials: 'include'
              });
              
              if (roomResponse.ok) {
                const roomData = await roomResponse.json();
                if (roomData.success && roomData.data) {
                  // Update selectedMessage with new participant data
                  setSelectedMessage(prev => ({
                    ...prev,
                    participants: roomData.data.participants
                  }));
                }
              }
            } catch (error) {
              console.error('Error refreshing current room:', error);
            }
          }
        }, 500);
      } else {
        console.error('Failed to remove member:', result.message);
        showPopupMessage(`Failed to remove member: ${result.message}`, 'error');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      showPopupMessage('Failed to remove member. Please try again.', 'error');
    } finally {
      setIsManagingMembers(false);
    }
  };

  const handleCancelRemoveMember = () => {
    setShowRemoveMember(false);
    setMemberToRemove(null);
  };

  // Close member management menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMemberManagementMenu && !event.target.closest('.chat-header')) {
        setShowMemberManagementMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMemberManagementMenu]);

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedMessage || !websocket || websocket.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send message:', { 
        hasMessage: !!newMessage.trim(), 
        hasRoom: !!selectedMessage, 
        hasWebsocket: !!websocket,
        wsState: websocket?.readyState 
      });
      return;
    }

    try {
      console.log('Sending message via WebSocket:', {
        roomId: selectedMessage.id,
        content: newMessage
      });

      // Send message via WebSocket
      websocket.send(JSON.stringify({
        _type: 'message',
        roomId: selectedMessage.id,
        content: newMessage
      }));

      // Add message optimistically to UI (it will be updated when we receive the WebSocket response)
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

      // Auto-scroll to show the new message
      setTimeout(() => scrollToBottom(), 100);

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
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
    setShowChatView(false);
    setSelectedMessage(null);
    setMessages([]);
    if (fetchRoomsRef.current) {
      fetchRoomsRef.current();
    }
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

  // Auto-refresh messages every 3 seconds when chat view is active
  useEffect(() => {
    let messageRefreshInterval;

    if (showChatView && selectedMessage && selectedMessage.id) {
      const refreshMessages = async () => {
        try {
          console.log('Auto-refreshing messages for room:', selectedMessage.id);
          const messagesResponse = await fetch(`${API_BASE_URL}/rooms/${selectedMessage.id}/messages`, {
            credentials: 'include'
          });
          
          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json();
            if (messagesData.success && Array.isArray(messagesData.data)) {
              // For group chats, fetch sender names for new messages
              let processedMessages = messagesData.data;
              
              if (isGroupRoom(selectedMessage)) {
                processedMessages = await Promise.all(
                  messagesData.data.map(async (message) => {
                    try {
                      // For current user, use "You" as sender name
                      if (message.senderId === currentUser) {
                        return {
                          ...message,
                          senderName: "You"
                        };
                      }
                      
                      // If senderName already exists and is not just the senderId, use it
                      if (message.senderName && message.senderName !== message.senderId) {
                        return message;
                      }
                      
                      // Fetch sender profile to get name
                      const senderResponse = await fetch(`${USER_API_URL}/${message.senderId}`, {
                        credentials: 'include'
                      });
                      
                      if (senderResponse.ok) {
                        const senderData = await senderResponse.json();
                        return {
                          ...message,
                          senderName: senderData.name || senderData.username || message.senderId
                        };
                      }
                    } catch (err) {
                      console.warn(`Could not fetch sender name for ${message.senderId}:`, err);
                    }
                    
                    // Fallback to senderId (email/username)
                    return {
                      ...message,
                      senderName: message.senderId
                    };
                  })
                );
              }

              // Only update if we have new messages to avoid unnecessary re-renders
              const newMessages = processedMessages.reverse();
              setMessages(prevMessages => {
                // Check if messages have changed
                if (JSON.stringify(prevMessages) !== JSON.stringify(newMessages)) {
                  // Auto-scroll to latest messages when new messages are loaded
                  setTimeout(() => scrollToBottom(), 100);
                  return newMessages;
                }
                return prevMessages;
              });
            }
          }
        } catch (error) {
          console.error('Error auto-refreshing messages:', error);
        }
      };

      // Set up interval for auto-refresh every 2 seconds
      messageRefreshInterval = setInterval(refreshMessages, 2000);
    }

    return () => {
      if (messageRefreshInterval) {
        clearInterval(messageRefreshInterval);
      }
    };
  }, [showChatView, selectedMessage, API_BASE_URL, currentUser]);

  // Auto-scroll when chat view is opened or messages change
  useEffect(() => {
    if (showChatView) {
      // Always scroll to bottom when chat view opens, regardless of message count
      // Multiple timeouts to ensure scrolling works reliably
      setTimeout(() => scrollToBottom(false), 50);
      setTimeout(() => scrollToBottom(false), 200);
      setTimeout(() => scrollToBottom(false), 500);
      setTimeout(() => scrollToBottom(false), 1000);
    }
  }, [showChatView]);

  // Additional scroll effect when messages change
  useEffect(() => {
    if (showChatView && messages.length > 0) {
      // Scroll to bottom when new messages are loaded
      setTimeout(() => scrollToBottom(false), 100);
    }
  }, [showChatView, messages.length]);

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
      // For group rooms (more than 2 participants), show room name
      if (isGroupRoom(item)) {
        return item.roomName || item.displayName || 'Unknown Room';
      } else {
        // For one-to-one chats, show the other participant's name
        if (item.participants && item.participants.length === 2) {
          const currentUserEmail = profile?.email || profile?.username;
          const otherParticipant = item.participants.find(p => p !== currentUserEmail);
          
          // Try to find the other participant's name from contacts
          if (otherParticipant && contacts && contacts.length > 0) {
            const contact = contacts.find(c => 
              c.email === otherParticipant || c.username === otherParticipant
            );
            if (contact && contact.name && contact.name !== "") {
              return contact.name;
            }
            return otherParticipant;
          }
        }
        // Fallback to room name for other cases
        return item.roomName || item.displayName || 'Unknown Room';
      }
    }
  };

  const getItemProfilePic = (item) => {
    if (!item) return "/profile.png";
    return item.profile_pic && item.profile_pic !== "" ? item.profile_pic : "/profile.png";
  };

  // Auto-scroll function to scroll to the bottom of chat messages
  const scrollToBottom = (smooth = true) => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
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

        {/* Create Group Option */}
        {showSearch && !showCreateGroup && (
          <div className="create-group-option p-3 border-bottom bg-light">
            <button
              className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center"
              onClick={handleCreateGroup}
              disabled={connectionStatus !== 'connected'}
            >
              Create Group
            </button>
          </div>
        )}

        {/* Message List */}
        <div className="message-list flex-grow-1 overflow-auto" style={{ marginRight: '10px' }}>
          {showCreateGroup ? (
            /* Group Creation Form */
            <div className="group-creation-form p-4">
              <div className="mb-4">
                <h5 className="mb-3">Create New Group</h5>
                
                {/* Group Name Input */}
                <div className="mb-3">
                  <label className="form-label">Group Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter group name..."
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    maxLength={50}
                    disabled={isCreatingGroup}
                  />
                </div>

                {/* Members Selection */}
                <div className="mb-3">
                  <label className="form-label">Select Members ({selectedMembers.length} selected)</label>
                  {isCreatingGroup ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                      <div className="text-center">
                        <div className="spinner-border text-primary mb-2" role="status">
                          <span className="visually-hidden">Creating...</span>
                        </div>
                        <div className="fw-bold">Creating group...</div>
                        <small className="text-muted">Please wait while we set up your group</small>
                      </div>
                    </div>
                  ) : (
                    <div className="members-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {contacts.map((contact, index) => {
                        const isSelected = selectedMembers.some(member => member.username === contact.username);
                        return (
                          <div
                            key={contact.username || index}
                            className={`d-flex align-items-center p-2 border-bottom cursor-pointer ${isSelected ? 'bg-primary bg-opacity-10' : 'hover-bg-light'}`}
                            onClick={() => handleMemberToggle(contact)}
                            style={{ cursor: 'pointer' }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleMemberToggle(contact)}
                              className="form-check-input me-2"
                            />
                            <img
                              src={contact.profile_pic || "/profile.png"}
                              alt={contact.name || contact.username}
                              className="rounded-circle me-2"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                              onError={(e) => { e.target.src = "/profile.png"; }}
                            />
                            <div>
                              <div className="fw-bold">{contact.name || contact.username}</div>
                              <small className="text-muted">{contact.email || contact.username}</small>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {!isCreatingGroup && (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center"
                      onClick={handleCreateGroupRoom}
                      disabled={!groupName.trim() || selectedMembers.length === 0 || connectionStatus !== 'connected'}
                    >
                      Create Group
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={handleCancelGroupCreation}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : isLoading || profileLoading || isCreatingRoom || isCreatingGroup ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <div className="d-flex flex-column align-items-center">
                {roomCreationCountdown > 0 ? (
                  <>
                    <div className="text-success mb-2" style={{ fontSize: '2rem' }}>
                      ✅
                    </div>
                    <div className="text-success fw-bold mb-2" style={{ fontSize: '1.1rem' }}>
                      {isCreatingGroup ? 'Group Created!' : 'Chat Room Created!'}
                    </div>
                  </>
                ) : (
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                )}
                <small className="text-muted mt-2">
                  {isCreatingRoom ? 
                    (roomCreationCountdown > 0 ? 
                      `Returning to message list in ${roomCreationCountdown}s...` : 
                      'Creating chat room...') : 
                  isCreatingGroup ?
                    (roomCreationCountdown > 0 ?
                      `Returning to message list in ${roomCreationCountdown}s...` :
                      'Creating group...') :
                    'Loading...'}
                </small>
              </div>
            </div>
          ) : memoizedSearchResults.length > 0 ? (
            memoizedSearchResults.map((item, index) => {
              if (!item) return null;

              const displayName = getItemDisplayName(item);
              const profilePic = getItemProfilePic(item);
              const isContactItem = isContact(item);
              const isGroupItem = !isContactItem && isGroupRoom(item);

              return (
                <div
                  key={`${isContactItem ? 'contact' : 'room'}-${item.id || item.username || index}`}
                  className="message-item d-flex align-items-start border-bottom hover-bg-light"
                  style={{ padding: sizes.padding.item, cursor: 'pointer' }}
                  onClick={() => {
                    if (isContactItem) {
                      handleContactClick(item);
                    } else {
                      handleMessageClick(item);
                    }
                  }}
                >
                  <div className="position-relative me-2 flex-shrink-0">
                    <img
                      src={isGroupItem ? "/groupm.jpg" : profilePic}
                      alt={displayName}
                      className="rounded-circle bg-light"
                      style={{
                        width: sizes.avatarSize,
                        height: sizes.avatarSize,
                        objectFit: "cover",
                        marginRight: '5px',
                        border: `2px solid ${isContactItem ? '#28a745' : isGroupItem ? '#6c757d' : '#6c757d'}`,
                      }}
                      onError={(e) => { 
                        e.target.src = isGroupItem ? "/groupm.jpg" : "/profile.png"; 
                      }}
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
                        {isGroupItem && <span className="ms-2 badge bg-primary">Group</span>}
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
        <div className="chat-header d-flex align-items-center p-3 border-bottom position-relative"
          style={{ padding: sizes.padding.container }}>
          <button
            className="btn btn-sm btn-link text-dark me-2"
            onClick={handleBackToList}
            aria-label="Back to messages"
          >
            <FaArrowLeft />
          </button>
          
          {/* Group Header - Clickable for groups */}
          <div 
            className={`d-flex align-items-center flex-grow-1 ${
              isGroupRoom(selectedMessage) ? 'cursor-pointer rounded p-2' : ''
            }`}
            onClick={handleGroupHeaderClick}
            style={{ 
              cursor: isGroupRoom(selectedMessage) ? 'pointer' : 'default',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              if (isGroupRoom(selectedMessage)) {
                e.target.style.backgroundColor = '#f8f9fa';
              }
            }}
            onMouseLeave={(e) => {
              if (isGroupRoom(selectedMessage)) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <div className="position-relative me-3 flex-shrink-0">
              <img
                src={isGroupRoom(selectedMessage) ? "/groupm.jpg" : (selectedMessage.profile_pic || "/profile.png")}
                alt={selectedMessage.roomName || selectedMessage.displayName || "Chat Room"}
                className="rounded-circle bg-light"
                style={{
                  width: sizes.avatarSize,
                  height: sizes.avatarSize,
                  objectFit: "cover",
                  border: `2px solid ${isGroupRoom(selectedMessage) ? '#6c757d' : '#6c757d'}`,
                }}
                onError={(e) => { 
                  e.target.src = isGroupRoom(selectedMessage) ? "/groupm.jpg" : "/profile.png";
                }}
              />
            </div>
            <div className="chat-user-info flex-grow-1 overflow-hidden">
              <div className="fw-bold text-truncate d-flex align-items-center" style={{ fontSize: "1.2rem" }}>
                {getItemDisplayName(selectedMessage)}
                {isGroupRoom(selectedMessage) && (
                  <FaUsers className="ms-2 text-muted" size={16} />
                )}
              </div>
              {isGroupRoom(selectedMessage) && (
                <small className="text-muted">
                  {selectedMessage.participants?.length} members • Click to manage
                </small>
              )}
            </div>
          </div>

          {/* Member Management Dropdown Menu */}
          {showMemberManagementMenu && isGroupRoom(selectedMessage) && (
            <>
              {/* Backdrop overlay */}
              <div 
                className="position-fixed w-100 h-100"
                style={{ 
                  top: 0, 
                  left: 0, 
                  zIndex: 1040,
                  backgroundColor: 'rgba(0,0,0,0.1)'
                }}
                onClick={() => setShowMemberManagementMenu(false)}
              />
              
              {/* Dropdown menu */}
              <div className="position-absolute bg-white border rounded shadow-lg" 
                   style={{ 
                     top: '100%', 
                     right: '10px', 
                     zIndex: 1050,
                     minWidth: '220px',
                     marginTop: '5px',
                     boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                   }}>
                <div className="p-2">
                  <div className="mb-2">
                    <small className="text-muted fw-bold text-uppercase">Member Management</small>
                  </div>
                  
                  <button
                    className="btn btn-sm btn-light w-100 mb-2 d-flex align-items-center justify-content-start text-start"
                    onClick={handleShowGroupInfo}
                    style={{ textAlign: 'left' }}
                  >
                    <FaUsers className="me-3 text-primary" />
                    <div>
                      <div className="fw-semibold">View Members</div>
                      <small className="text-muted">See all group members</small>
                    </div>
                  </button>
                  
                  <button
                    className="btn btn-sm btn-light w-100 mb-2 d-flex align-items-center justify-content-start text-start"
                    onClick={handleAddMember}
                    style={{ textAlign: 'left' }}
                  >
                    <FaUserPlus className="me-3 text-success" />
                    <div>
                      <div className="fw-semibold">Add Members</div>
                      <small className="text-muted">Invite new people to group</small>
                    </div>
                  </button>
                  
                  <button
                    className="btn btn-sm btn-light w-100 d-flex align-items-center justify-content-start text-start"
                    onClick={handleShowGroupInfo}
                    style={{ textAlign: 'left' }}
                  >
                    <FaUserMinus className="me-3 text-danger" />
                    <div>
                      <div className="fw-semibold">Remove Members</div>
                      <small className="text-muted">Remove people from group</small>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Chat Messages */}
        <div 
          ref={chatMessagesRef}
          className="chat-messages flex-grow-1 overflow-auto p-4" 
          style={{ backgroundColor: '#ffffff' }}
        >
          {messages.length === 0 ? (
            <div className="d-flex flex-column align-items-center justify-content-center text-muted h-100">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isCurrentUser = msg.senderId === currentUser;
              const isGroupChat = selectedMessage && isGroupRoom(selectedMessage);
              const showSenderName = isGroupChat; // Show sender names for all messages in group chats

              const formatDateWithDay = (dateStr) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const dayName = days[date.getDay()];
                return `${dayName}, ${dateStr}`;
              };

              const isFirstMessageOfDate = index === 0 ||
                (messages[index - 1] && messages[index - 1].senddate !== msg.senddate);
              
              // Check if this is the first message from this sender (for group name display)
              const isFirstMessageFromSender = showSenderName && (
                index === 0 || 
                messages[index - 1].senderId !== msg.senderId ||
                isFirstMessageOfDate
              );

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
                    {/* Sender Name for Group Chats */}
                    {isFirstMessageFromSender && (
                      <div className={`mb-2 ${isCurrentUser ? 'text-end pe-2' : 'ps-2'}`}>
                        <small 
                          className="text-muted fw-bold d-block" 
                          style={{ 
                            fontSize: '0.75rem',
                            lineHeight: '1.2'
                          }}
                        >
                          {isCurrentUser ? 'You' : (msg.senderName || msg.senderId)}
                        </small>
                      </div>
                    )}
                    
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
                                {msg.status === 'sending' ? ' ✓' : 
                                 msg.status === 'sent' ? ' ✓' : 
                                 msg.status === 'received' ? ' ✓' : ''}
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
                placeholder="Type a message ..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                style={{ fontSize: sizes.fontSize.message, paddingRight: '50px', width: '85%' }}
                disabled={connectionStatus !== 'connected'}
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
                  backgroundColor: newMessage.trim() === '' || connectionStatus !== 'connected' ? '#e9ecef' : '#007bff',
                  color: newMessage.trim() === '' || connectionStatus !== 'connected' ? '#6c757d' : '#ffffff'
                }}
                onClick={handleSendMessage}
                aria-label="Send message"
                disabled={newMessage.trim() === '' || connectionStatus !== 'connected'}
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
      
      {/* Group Management Modals */}
      <>
        {/* Group Members Info Modal */}
        {showGroupInfo && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 1060, backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="bg-white rounded shadow-lg p-4" style={{ maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Group Members</h5>
                <button className="btn btn-sm btn-link text-dark" onClick={() => setShowGroupInfo(false)}>
                  <FaTimes />
                </button>
              </div>
              
              <div className="mb-3">
                <small className="text-muted">
                  {groupMembers.length} {groupMembers.length === 1 ? 'member' : 'members'}
                </small>
              </div>
              
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {groupMembers.map((member, index) => {
                  const isCurrentUser = (profile?.email === member.email) || (profile?.username === member.email);
                  return (
                    <div key={member.email || index} className="d-flex align-items-center justify-content-between p-2 border-bottom">
                      <div className="d-flex align-items-center">
                        <img
                          src={member.profile_pic || "/profile.png"}
                          alt={member.name || member.username}
                          className="rounded-circle me-3"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = "/profile.png"; }}
                        />
                        <div>
                          <div className="fw-bold">
                            {member.name || member.username}
                            {isCurrentUser && <span className="ms-2 badge bg-primary">You</span>}
                          </div>
                          <small className="text-muted">{member.email}</small>
                        </div>
                      </div>
                      {!isCurrentUser && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveMember(member)}
                        >
                          <FaUserMinus size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Add Members Modal */}
        {showAddMember && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 1060, backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="bg-white rounded shadow-lg p-4" style={{ maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Add Members</h5>
                <button className="btn btn-sm btn-link text-dark" onClick={() => setShowAddMember(false)}>
                  <FaTimes />
                </button>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Select Members to Add ({selectedMembers.length} selected)</label>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {contacts.filter(contact => {
                    // Filter out members who are already in the group
                    const currentUserEmail = profile?.email || profile?.username;
                    const contactEmail = contact.email || contact.username;
                    return !selectedMessage.participants.includes(contactEmail) && contactEmail !== currentUserEmail;
                  }).map((contact, index) => {
                    const isSelected = selectedMembers.some(member => member.username === contact.username);
                    return (
                      <div
                        key={contact.username || index}
                        className={`d-flex align-items-center p-2 border-bottom cursor-pointer ${isSelected ? 'bg-primary bg-opacity-10' : 'hover-bg-light'}`}
                        onClick={() => handleMemberToggle(contact)}
                        style={{ cursor: 'pointer' }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleMemberToggle(contact)}
                          className="form-check-input me-2"
                        />
                        <img
                          src={contact.profile_pic || "/profile.png"}
                          alt={contact.name || contact.username}
                          className="rounded-circle me-2"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = "/profile.png"; }}
                        />
                        <div>
                          <div className="fw-bold">{contact.name || contact.username}</div>
                          <small className="text-muted">{contact.email || contact.username}</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-3 d-flex gap-2">
                  <button
                    className="btn btn-primary flex-grow-1"
                    onClick={handleConfirmAddMember}
                    disabled={selectedMembers.length === 0 || isManagingMembers}
                  >
                    {isManagingMembers ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Adding...</span>
                        </div>
                        Adding Members...
                      </>
                    ) : (
                      'Add Selected Members'
                    )}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowAddMember(false)}
                    disabled={isManagingMembers}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remove Member Confirmation Modal */}
        {showRemoveMember && memberToRemove && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 1060, backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="bg-white rounded shadow-lg p-4" style={{ maxWidth: '400px', width: '90%' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Remove Member</h5>
                <button className="btn btn-sm btn-link text-dark" onClick={handleCancelRemoveMember}>
                  <FaTimes />
                </button>
              </div>
              
              <div className="text-center mb-3">
                <img
                  src={memberToRemove.profile_pic || "/profile.png"}
                  alt={memberToRemove.name || memberToRemove.username}
                  className="rounded-circle mb-2"
                  style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = "/profile.png"; }}
                />
                <div>
                  <p className="mb-2">Are you sure you want to remove <strong>{memberToRemove.name}</strong> from this group?</p>
                  <small className="text-muted">This action cannot be undone.</small>
                </div>
              </div>
                
              <div className="d-flex gap-2">
                <button
                  className="btn btn-danger flex-grow-1"
                  onClick={handleConfirmRemoveMember}
                  disabled={isManagingMembers}
                >
                  {isManagingMembers ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Removing...</span>
                      </div>
                      Removing Member...
                    </>
                  ) : (
                    'Remove Member'
                  )}
                </button>
                <button
                  className="btn btn-secondary flex-grow-1"
                  onClick={handleCancelRemoveMember}
                  disabled={isManagingMembers}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Popup Message */}
        {showPopup && (
          <div 
            className="position-fixed d-flex align-items-center justify-content-center" 
            style={{ 
              top: '20px', 
              left: '50%', 
              transform: 'translateX(-50%)',
              zIndex: 1070,
              animation: 'slideDown 0.3s ease-in-out'
            }}
          >
            <div 
              className={`alert d-flex align-items-center shadow-lg border-0 ${
                popupType === 'success' ? 'alert-success' : 'alert-danger'
              }`} 
              style={{ 
                minWidth: '300px',
                maxWidth: '500px',
                borderRadius: '10px',
                fontWeight: '500'
              }}
            >
              <div className="d-flex align-items-center">
                {popupType === 'success' ? (
                  <div className="text-success me-2" style={{ fontSize: '1.2rem' }}>
                    ✅
                  </div>
                ) : (
                  <div className="text-danger me-2" style={{ fontSize: '1.2rem' }}>
                    ❌
                  </div>
                )}
                <span>{popupMessage}</span>
              </div>
              <button
                type="button"
                className="btn-close ms-auto"
                onClick={() => setShowPopup(false)}
                aria-label="Close"
              ></button>
            </div>
          </div>
        )}
      </>
    </div>
  );
};

export default MessageComponent;