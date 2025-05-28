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
    const response = await fetch('http://localhost:8080/api/users/profile', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const profile = await response.json();
    storeProfile(profile);
    return profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

export const clearStoredProfile = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(USER_PROFILE_KEY);
};