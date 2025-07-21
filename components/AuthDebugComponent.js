'use client';
import React, { useState, useEffect } from 'react';
import { refreshAccessToken } from '@/utils/auth';
import { fetchAndStoreProfile, getStoredProfile } from '@/utils/profileManager';

const AuthDebugComponent = () => {
  const [authState, setAuthState] = useState({
    cookies: '',
    localStorage: null,
    profile: null,
    refreshStatus: null
  });

  const updateAuthState = () => {
    setAuthState({
      cookies: document.cookie,
      localStorage: localStorage.getItem('user'),
      profile: getStoredProfile(),
      refreshStatus: null
    });
  };

  useEffect(() => {
    updateAuthState();
  }, []);

  const testRefresh = async () => {
    const success = await refreshAccessToken();
    setAuthState(prev => ({
      ...prev,
      refreshStatus: success ? 'Success' : 'Failed',
      cookies: document.cookie
    }));
  };

  const testProfileFetch = async () => {
    const profile = await fetchAndStoreProfile();
    updateAuthState();
  };

  return (
    <div className="container mt-4">
      <h3>Authentication Debug Info</h3>
      
      <div className="card mb-3">
        <div className="card-header">
          <h5>Current Cookies</h5>
        </div>
        <div className="card-body">
          <code>{authState.cookies || 'No cookies found'}</code>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <h5>LocalStorage User Data</h5>
        </div>
        <div className="card-body">
          <pre>{authState.localStorage || 'No user data in localStorage'}</pre>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <h5>Session Profile Data</h5>
        </div>
        <div className="card-body">
          <pre>{JSON.stringify(authState.profile, null, 2) || 'No profile data in session'}</pre>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <h5>Token Refresh Status</h5>
        </div>
        <div className="card-body">
          <p>{authState.refreshStatus || 'Not tested'}</p>
          <button className="btn btn-primary me-2" onClick={testRefresh}>
            Test Token Refresh
          </button>
          <button className="btn btn-secondary me-2" onClick={testProfileFetch}>
            Test Profile Fetch
          </button>
          <button className="btn btn-info" onClick={updateAuthState}>
            Refresh Debug Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthDebugComponent;
