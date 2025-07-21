'use client';
import React, { useState } from 'react';
import { testAllServices, testAllCorsConfigurations } from '@/utils/testApi';
import { getServiceURL } from '@/utils/apiConfig';

const ApiTestComponent = () => {
  const [testResults, setTestResults] = useState(null);
  const [corsResults, setCorsResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    try {
      const results = await testAllServices();
      setTestResults(results);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runCorsTests = async () => {
    setIsLoading(true);
    try {
      const results = await testAllCorsConfigurations();
      setCorsResults(results);
    } catch (error) {
      console.error('CORS test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getServiceUrls = () => {
    const services = ['auth', 'chat', 'community', 'analytics', 'meetings', 'users'];
    return services.map(service => ({
      name: service,
      url: getServiceURL(service)
    }));
  };

  return (
    <div className="container mt-4">
      <h2>API Connection Tester</h2>
      
      <div className="mb-4">
        <h4>Configured Service URLs:</h4>
        <div className="row">
          {getServiceUrls().map(service => (
            <div key={service.name} className="col-md-6 mb-2">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title text-capitalize">{service.name}</h6>
                  <small className="text-muted">{service.url}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={runTests} 
        disabled={isLoading}
        className="btn btn-primary mb-2 me-2"
      >
        {isLoading ? 'Testing...' : 'Test All Services'}
      </button>

      <button 
        onClick={runCorsTests} 
        disabled={isLoading}
        className="btn btn-warning mb-4"
      >
        {isLoading ? 'Testing...' : 'Test CORS Configuration'}
      </button>

      {testResults && (
        <div>
          <h4>Connection Test Results:</h4>
          {Object.entries(testResults).map(([service, result]) => (
            <div key={service} className="mb-3">
              <div className={`alert ${result.success ? 'alert-success' : 'alert-danger'}`}>
                <h6 className="text-capitalize">{service} Service</h6>
                <p><strong>Status:</strong> {result.status || 'N/A'}</p>
                <p><strong>Message:</strong> {result.message}</p>
                {result.error && <p><strong>Error:</strong> {result.error}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {corsResults && (
        <div>
          <h4>CORS Configuration Test Results:</h4>
          {Object.entries(corsResults).map(([service, result]) => (
            <div key={service} className="mb-3">
              <div className={`alert ${result.success ? 'alert-success' : 'alert-danger'}`}>
                <h6 className="text-capitalize">{service} Service CORS</h6>
                <p><strong>Status:</strong> {result.status || 'N/A'}</p>
                <p><strong>Message:</strong> {result.message}</p>
                {result.corsChecks && (
                  <div>
                    <p><strong>CORS Checks:</strong></p>
                    <ul>
                      <li>Allows Credentials: {result.corsChecks.allowsCredentials ? '✅' : '❌'}</li>
                      <li>Allows Origin: {result.corsChecks.allowsOrigin ? '✅' : '❌'}</li>
                      <li>Allows POST Methods: {result.corsChecks.allowsMethods ? '✅' : '❌'}</li>
                    </ul>
                    <p><strong>Recommendation:</strong> {result.corsChecks.recommendation}</p>
                  </div>
                )}
                {result.corsHeaders && (
                  <details>
                    <summary>CORS Headers</summary>
                    <pre>{JSON.stringify(result.corsHeaders, null, 2)}</pre>
                  </details>
                )}
                {result.error && <p><strong>Error:</strong> {result.error}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApiTestComponent;
