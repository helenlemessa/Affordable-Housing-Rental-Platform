export const checkAuth = async () => {
  try {
    // 1. Get token from all possible sources
    const token = localStorage.getItem('token') || 
                 document.cookie.split('; ')
                   .find(row => row.startsWith('token='))
                   ?.split('=')[1];

    if (!token) {
      console.error('No token found');
      return null;
    }

    // 2. Verify token with backend
    const response = await fetch('http://localhost:5000/api/auth/verify', {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // 3. Handle response
    if (!response.ok) {
      console.error('Verify failed:', response.status);
      return null;
    }

    return await response.json();
  } catch (err) {
    console.error('Auth check error:', err);
    return null;
  }
};