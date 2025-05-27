'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:8083/api/auth/status', {
          credentials: 'include'
        });
        
        if (response.ok) {
          // If authenticated, redirect to calendar
          router.push('/calendar');
        } else {
          // If not authenticated, redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // On error, redirect to login
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Show loading state while checking auth
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading calendar...</p>
      </div>
    </div>
  );
}