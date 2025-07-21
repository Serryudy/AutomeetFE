import { choreoFetch, API_CONFIG } from './apiConfig';

export const USER_PROFILE_KEY = 'userProfile';

export const getStoredProfile = () => {
  if (typeof window === 'undefined') return null;
  const storedProfile = sessionStorage.getItem(USER_PROFILE_KEY);
  return storedProfile ? JSON.parse(storedProfile) : null;
};

export const storeProfile = (profile) => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
};

export const fetchAndStoreProfile = async () => {
  try {
    console.log('Fetching user profile...');
    console.log('Current cookies:', document.cookie);
    
    const response = await choreoFetch('users', API_CONFIG.endpoints.users.profile, {
      method: 'GET'
    });

    if (!response.ok) {
      console.error('Profile fetch failed with status:', response.status);
      if (response.status === 401) {
        throw new Error('Authentication failed - please login again');
      }
      throw new Error('Failed to fetch profile');
    }

    const profile = await response.json();
    console.log('Profile fetched successfully:', profile);
    storeProfile(profile);
    return profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    
    // If it's an auth error, clear local storage
    if (error.message.includes('Authentication failed')) {
      localStorage.removeItem('user');
      clearStoredProfile();
    }
    
    return null;
  }
};

export const clearStoredProfile = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(USER_PROFILE_KEY);
};