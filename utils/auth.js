// Create a new auth utility file
export const refreshAccessToken = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Important for sending/receiving cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return true;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};