import { choreoFetch, API_CONFIG } from './apiConfig';

// Auth utility for Choreo auth service
export const refreshAccessToken = async () => {
  try {
    console.log('Attempting to refresh token...');
    console.log('Current cookies:', document.cookie);
    
    const response = await choreoFetch('auth', API_CONFIG.endpoints.auth.refresh, {
      method: 'POST'
    });

    console.log('Refresh response status:', response.status);

    if (!response.ok) {
      console.error('Token refresh failed with status:', response.status);
      
      // If refresh fails, the user needs to login again
      if (response.status === 400 || response.status === 401) {
        localStorage.removeItem('user');
        return false;
      }
      
      throw new Error('Token refresh failed');
    }

    console.log('Token refreshed successfully');
    return true;
  } catch (error) {
    console.error('Error refreshing token:', error);
    localStorage.removeItem('user'); // Clear user data on refresh failure
    return false;
  }
};