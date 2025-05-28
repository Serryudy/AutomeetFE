import { useState, useEffect } from 'react';
import { getStoredProfile, fetchAndStoreProfile } from '@/utils/profileManager';

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // First check sessionStorage
        let profileData = getStoredProfile();
        
        // If no stored profile, fetch it
        if (!profileData) {
          profileData = await fetchAndStoreProfile();
        }
        
        setProfile(profileData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  return { profile, loading, error };
};