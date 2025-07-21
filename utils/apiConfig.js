// API configuration utility for multiple microservices
const API_CONFIG = {
  // Individual service URLs
  authURL: process.env.NEXT_PUBLIC_API_AUTH_URL || 'https://3a098ee1-d32d-4afd-9ad3-5fcbb939b60e-dev.e1-us-east-azure.choreoapis.dev/default/avi/api-auth-2d5/v1.0',
  chatURL: process.env.NEXT_PUBLIC_API_CHAT_URL || 'https://3a098ee1-d32d-4afd-9ad3-5fcbb939b60e-dev.e1-us-east-azure.choreoapis.dev/default/avi/api-chat-e56/v1.0',
  communityURL: process.env.NEXT_PUBLIC_API_COMMUNITY_URL || 'https://3a098ee1-d32d-4afd-9ad3-5fcbb939b60e-dev.e1-us-east-azure.choreoapis.dev/default/avi/api-community-298/v1.0',
  analyticsURL: process.env.NEXT_PUBLIC_API_ANALYTICS_URL || 'https://3a098ee1-d32d-4afd-9ad3-5fcbb939b60e-dev.e1-us-east-azure.choreoapis.dev/default/avi/v1.0',
  mainURL: process.env.NEXT_PUBLIC_API_MAIN_URL || 'https://3a098ee1-d32d-4afd-9ad3-5fcbb939b60e-dev.e1-us-east-azure.choreoapis.dev/default/avi/api-858/v1.0',
  usersURL: process.env.NEXT_PUBLIC_API_USERS_URL || 'https://3a098ee1-d32d-4afd-9ad3-5fcbb939b60e-dev.e1-us-east-azure.choreoapis.dev/default/avi/api-users-f95/v1.0',
  
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT) || 10000,
  
  // Service mapping for endpoints
  services: {
    auth: 'authURL',
    chat: 'chatURL', 
    community: 'communityURL',
    analytics: 'analyticsURL',
    meetings: 'mainURL',
    groups: 'mainURL',
    notifications: 'mainURL',
    availability: 'mainURL',
    users: 'usersURL'
  },
  
  endpoints: {
    auth: {
      login: '/login',
      register: '/register',
      refresh: '/refresh',
      google: '/google',
      logout: '/logout'
    },
    users: {
      profile: '/profile',
      update: '/update',
      list: '/users'
    },
    meetings: {
      create: '/meetings',
      list: '/meetings',
      details: '/meetings',
      update: '/meetings',
      delete: '/meetings'
    },
    groups: {
      create: '/groups',
      list: '/groups',
      join: '/groups/join',
      leave: '/groups/leave'
    },
    availability: {
      get: '/availability',
      update: '/availability',
      check: '/availability/check'
    },
    notifications: {
      get: '/notifications',
      mark_read: '/notifications/read',
      settings: '/notifications/settings'
    },
    chat: {
      messages: '/messages',
      send: '/messages/send',
      history: '/messages/history'
    },
    community: {
      posts: '/posts',
      create: '/posts/create',
      comments: '/posts/comments'
    },
    analytics: {
      dashboard: '/dashboard',
      reports: '/reports',
      metrics: '/metrics'
    }
  }
};

// Helper function to get the correct base URL for a service
export const getServiceURL = (serviceName) => {
  const serviceKey = API_CONFIG.services[serviceName];
  return API_CONFIG[serviceKey];
};

// Helper function to build full URLs for specific services
export const buildApiUrl = (serviceName, endpoint) => {
  const baseURL = getServiceURL(serviceName);
  return `${baseURL}${endpoint}`;
};

// Simple fetch wrapper for Choreo APIs
export const choreoFetch = async (serviceName, endpoint, options = {}) => {
  const url = buildApiUrl(serviceName, endpoint);
  
  console.log('Choreo API Request:', {
    service: serviceName,
    url,
    method: options.method || 'GET',
    headers: options.headers
  });

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'include', // This is crucial for cookies
      ...options
    });

    console.log('Choreo API Response:', {
      service: serviceName,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      cookies: document.cookie // Log current cookies
    });

    return response;
  } catch (error) {
    console.error(`Choreo API Error (${serviceName}):`, error);
    throw error;
  }
};

// Helper function to make API calls with consistent configuration
export const apiRequest = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // Add CORS headers for Choreo
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...options.headers
    },
    credentials: 'include', // Important for cookies
    mode: 'cors', // Explicitly set CORS mode
    ...options
  };

  try {
    console.log('Making API request to:', url);
    console.log('Request options:', defaultOptions);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    
    const response = await fetch(url, {
      ...defaultOptions,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      let errorMsg = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.log('Error response data:', errorData);
        if (errorData && errorData.message) {
          errorMsg = errorData.message;
        } else if (errorData && errorData.error) {
          errorMsg = errorData.error;
        }
      } catch (parseError) {
        console.log('Failed to parse error response:', parseError);
        // Use default error message if JSON parsing fails
      }
      throw new Error(errorMsg);
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    if (error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.');
    }
    throw error;
  }
};

export { API_CONFIG };
export default API_CONFIG;
