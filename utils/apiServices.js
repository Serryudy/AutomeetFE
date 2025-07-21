// Comprehensive API service for all Choreo microservices
import { buildApiUrl, choreoFetch, API_CONFIG } from './apiConfig';

// Auth Service
export const authService = {
  login: async (username, password) => {
    return await choreoFetch('auth', API_CONFIG.endpoints.auth.login, {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },
  
  register: async (userData) => {
    return await choreoFetch('auth', API_CONFIG.endpoints.auth.register, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  refreshToken: async () => {
    return await choreoFetch('auth', API_CONFIG.endpoints.auth.refresh, {
      method: 'POST'
    });
  },
  
  logout: async () => {
    return await choreoFetch('auth', API_CONFIG.endpoints.auth.logout, {
      method: 'POST'
    });
  }
};

// Users Service
export const usersService = {
  getProfile: async () => {
    return await choreoFetch('users', API_CONFIG.endpoints.users.profile, {
      method: 'GET'
    });
  },
  
  updateProfile: async (profileData) => {
    return await choreoFetch('users', API_CONFIG.endpoints.users.update, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },
  
  getUsers: async () => {
    return await choreoFetch('users', API_CONFIG.endpoints.users.list, {
      method: 'GET'
    });
  }
};

// Meetings Service (from main API)
export const meetingsService = {
  createMeeting: async (meetingData) => {
    return await choreoFetch('meetings', API_CONFIG.endpoints.meetings.create, {
      method: 'POST',
      body: JSON.stringify(meetingData)
    });
  },
  
  getMeetings: async () => {
    return await choreoFetch('meetings', API_CONFIG.endpoints.meetings.list, {
      method: 'GET'
    });
  },
  
  getMeetingDetails: async (meetingId) => {
    return await choreoFetch('meetings', `${API_CONFIG.endpoints.meetings.details}/${meetingId}`, {
      method: 'GET'
    });
  },
  
  updateMeeting: async (meetingId, meetingData) => {
    return await choreoFetch('meetings', `${API_CONFIG.endpoints.meetings.update}/${meetingId}`, {
      method: 'PUT',
      body: JSON.stringify(meetingData)
    });
  },
  
  deleteMeeting: async (meetingId) => {
    return await choreoFetch('meetings', `${API_CONFIG.endpoints.meetings.delete}/${meetingId}`, {
      method: 'DELETE'
    });
  }
};

// Availability Service (from main API)
export const availabilityService = {
  getAvailability: async (userId) => {
    return await choreoFetch('availability', `${API_CONFIG.endpoints.availability.get}/${userId}`, {
      method: 'GET'
    });
  },
  
  updateAvailability: async (availabilityData) => {
    return await choreoFetch('availability', API_CONFIG.endpoints.availability.update, {
      method: 'PUT',
      body: JSON.stringify(availabilityData)
    });
  },
  
  checkAvailability: async (userIds, timeRange) => {
    return await choreoFetch('availability', API_CONFIG.endpoints.availability.check, {
      method: 'POST',
      body: JSON.stringify({ userIds, timeRange })
    });
  }
};

// Groups Service (from main API)
export const groupsService = {
  createGroup: async (groupData) => {
    return await choreoFetch('groups', API_CONFIG.endpoints.groups.create, {
      method: 'POST',
      body: JSON.stringify(groupData)
    });
  },
  
  getGroups: async () => {
    return await choreoFetch('groups', API_CONFIG.endpoints.groups.list, {
      method: 'GET'
    });
  },
  
  joinGroup: async (groupId) => {
    return await choreoFetch('groups', `${API_CONFIG.endpoints.groups.join}/${groupId}`, {
      method: 'POST'
    });
  },
  
  leaveGroup: async (groupId) => {
    return await choreoFetch('groups', `${API_CONFIG.endpoints.groups.leave}/${groupId}`, {
      method: 'POST'
    });
  }
};

// Notifications Service (from main API)
export const notificationsService = {
  getNotifications: async () => {
    return await choreoFetch('notifications', API_CONFIG.endpoints.notifications.get, {
      method: 'GET'
    });
  },
  
  markAsRead: async (notificationId) => {
    return await choreoFetch('notifications', `${API_CONFIG.endpoints.notifications.mark_read}/${notificationId}`, {
      method: 'PUT'
    });
  },
  
  updateSettings: async (settings) => {
    return await choreoFetch('notifications', API_CONFIG.endpoints.notifications.settings, {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }
};

// Chat Service
export const chatService = {
  getMessages: async (roomId) => {
    return await choreoFetch('chat', `${API_CONFIG.endpoints.chat.messages}/${roomId}`, {
      method: 'GET'
    });
  },
  
  sendMessage: async (messageData) => {
    return await choreoFetch('chat', API_CONFIG.endpoints.chat.send, {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  },
  
  getChatHistory: async (userId) => {
    return await choreoFetch('chat', `${API_CONFIG.endpoints.chat.history}/${userId}`, {
      method: 'GET'
    });
  }
};

// Community Service
export const communityService = {
  getPosts: async () => {
    return await choreoFetch('community', API_CONFIG.endpoints.community.posts, {
      method: 'GET'
    });
  },
  
  createPost: async (postData) => {
    return await choreoFetch('community', API_CONFIG.endpoints.community.create, {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  },
  
  getComments: async (postId) => {
    return await choreoFetch('community', `${API_CONFIG.endpoints.community.comments}/${postId}`, {
      method: 'GET'
    });
  }
};

// Analytics Service
export const analyticsService = {
  getDashboard: async () => {
    return await choreoFetch('analytics', API_CONFIG.endpoints.analytics.dashboard, {
      method: 'GET'
    });
  },
  
  getReports: async (reportType) => {
    return await choreoFetch('analytics', `${API_CONFIG.endpoints.analytics.reports}/${reportType}`, {
      method: 'GET'
    });
  },
  
  getMetrics: async (metricType) => {
    return await choreoFetch('analytics', `${API_CONFIG.endpoints.analytics.metrics}/${metricType}`, {
      method: 'GET'
    });
  }
};
