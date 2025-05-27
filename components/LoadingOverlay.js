'use client';

import { useLoading } from '@/context/LoadingContext';

const LoadingOverlay = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999,
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className="text-center">
        <div className="spinner-border text-primary mb-2" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="text-primary">Loading page...</div>
      </div>
    </div>
  );
};

export default LoadingOverlay;