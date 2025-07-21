// Test utility to debug API connection for microservices
import { buildApiUrl, getServiceURL, API_CONFIG } from './apiConfig';

export const testApiConnection = async (serviceName = 'auth') => {
  const serviceURL = getServiceURL(serviceName);
  
  console.log('Testing API connection...');
  console.log(`Service: ${serviceName}`);
  console.log('Service URL:', serviceURL);
  
  try {
    // Try a simple GET request to the service root
    const response = await fetch(serviceURL, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`${serviceName} response status:`, response.status);
    console.log(`${serviceName} response headers:`, [...response.headers.entries()]);
    
    return {
      success: true,
      status: response.status,
      service: serviceName,
      message: 'Connection successful'
    };
  } catch (error) {
    console.error(`${serviceName} connection test failed:`, error);
    return {
      success: false,
      error: error.message,
      service: serviceName,
      message: 'Connection failed'
    };
  }
};

export const testLoginEndpoint = async () => {
  const loginUrl = buildApiUrl('auth', API_CONFIG.endpoints.auth.login);
  
  console.log('Testing login endpoint...');
  console.log('Login URL:', loginUrl);
  
  try {
    // Try OPTIONS request first to check CORS
    const optionsResponse = await fetch(loginUrl, {
      method: 'OPTIONS',
      mode: 'cors',
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('OPTIONS response status:', optionsResponse.status);
    console.log('CORS headers:', [...optionsResponse.headers.entries()]);
    
    return {
      success: optionsResponse.status === 200 || optionsResponse.status === 204,
      status: optionsResponse.status,
      corsHeaders: [...optionsResponse.headers.entries()],
      message: 'CORS preflight check completed'
    };
  } catch (error) {
    console.error('Login endpoint test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'CORS preflight failed'
    };
  }
};

export const testCorsConfiguration = async (serviceName = 'auth') => {
  const serviceURL = getServiceURL(serviceName);
  
  console.log(`Testing CORS configuration for ${serviceName}...`);
  console.log('Service URL:', serviceURL);
  
  try {
    // Test OPTIONS preflight request
    const optionsResponse = await fetch(serviceURL, {
      method: 'OPTIONS',
      mode: 'cors',
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization, Cookie',
        'Origin': 'http://localhost:3000'
      }
    });
    
    console.log(`${serviceName} OPTIONS response status:`, optionsResponse.status);
    
    const corsHeaders = {};
    optionsResponse.headers.forEach((value, key) => {
      if (key.toLowerCase().startsWith('access-control-')) {
        corsHeaders[key] = value;
      }
    });
    
    console.log(`${serviceName} CORS headers:`, corsHeaders);
    
    const allowsCredentials = corsHeaders['access-control-allow-credentials'] === 'true';
    const allowsOrigin = corsHeaders['access-control-allow-origin'] === 'http://localhost:3000' || 
                        corsHeaders['access-control-allow-origin'] === '*';
    const allowsMethods = corsHeaders['access-control-allow-methods']?.includes('POST');
    
    return {
      success: optionsResponse.status === 200 || optionsResponse.status === 204,
      status: optionsResponse.status,
      service: serviceName,
      corsHeaders,
      corsChecks: {
        allowsCredentials,
        allowsOrigin,
        allowsMethods,
        recommendation: !allowsCredentials ? 'Enable "Allow Credentials" in CORS settings' :
                       !allowsOrigin ? 'Add http://localhost:3000 to allowed origins' :
                       !allowsMethods ? 'Add POST to allowed methods' : 'CORS configured correctly'
      },
      message: 'CORS preflight check completed'
    };
  } catch (error) {
    console.error(`${serviceName} CORS test failed:`, error);
    return {
      success: false,
      error: error.message,
      service: serviceName,
      message: 'CORS test failed - likely network or configuration issue'
    };
  }
};

export const testAllServices = async () => {
  const services = ['auth', 'chat', 'community', 'analytics', 'meetings', 'users'];
  const results = {};
  
  console.log('Testing all microservices...');
  
  for (const service of services) {
    results[service] = await testApiConnection(service);
  }
  
  return results;
};

export const quickCorsTest = async () => {
  console.log('Running quick CORS test for login endpoint...');
  
  const loginUrl = buildApiUrl('auth', API_CONFIG.endpoints.auth.login);
  
  try {
    // Test if we can make a simple request without credentials first
    const testResponse = await fetch(loginUrl, {
      method: 'OPTIONS',
      mode: 'cors',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log('Quick CORS test - Status:', testResponse.status);
    
    const corsHeaders = {};
    testResponse.headers.forEach((value, key) => {
      if (key.toLowerCase().includes('access-control')) {
        corsHeaders[key] = value;
      }
    });
    
    console.log('Quick CORS test - Headers:', corsHeaders);
    
    const isWorking = testResponse.status === 200 || testResponse.status === 204;
    const hasCredentials = corsHeaders['access-control-allow-credentials'] === 'true';
    
    return {
      working: isWorking,
      hasCredentials,
      headers: corsHeaders,
      message: isWorking ? 
        (hasCredentials ? 'CORS fully configured!' : 'CORS working but credentials not enabled') :
        'CORS not configured properly'
    };
  } catch (error) {
    console.error('Quick CORS test failed:', error);
    return {
      working: false,
      hasCredentials: false,
      headers: {},
      error: error.message,
      message: 'CORS test failed - check network or configuration'
    };
  }
};

export const testAllCorsConfigurations = async () => {
  const services = ['auth', 'chat', 'community', 'analytics', 'meetings', 'users'];
  const results = {};
  
  console.log('Testing CORS configuration for all microservices...');
  
  for (const service of services) {
    results[service] = await testCorsConfiguration(service);
  }
  
  return results;
};
