// src/components/AdminRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
const AdminRoute = ({ children }) => {
  const [authState, setAuthState] = useState({ 
    status: 'loading',
    error: null
  });
  const location = useLocation();

  useEffect(() => {
    const verifyAdmin = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      throw new Error('No admin token found');
    }

   const response = await fetch(API_ENDPOINTS.ADMIN_VERIFY, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      // Try to get detailed error message
      let errorMsg = 'Verification failed';
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorData.message || errorMsg;
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    if (!data.valid) {
      throw new Error('Invalid admin credentials');
    }

    setAuthState({ status: 'authenticated', error: null });
  } catch (err) {
    console.error('Admin verification error:', err);
    localStorage.removeItem('adminToken');
    setAuthState({ 
      status: 'unauthenticated',
      error: err.message.includes('token') ? 'Session expired' : err.message
    });
  }
};
    verifyAdmin();
  }, [location]);

  if (authState.status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
          <p className="mt-2 text-gray-600">Verifying admin privileges...</p>
        </div>
      </div>
    );
  }

  if (authState.status === 'unauthenticated') {
    return (
      <Navigate 
        to="/admin/login" 
        state={{ 
          from: location,
          error: authState.error 
        }} 
        replace
      />
    );
  }

  return children;
};

export default AdminRoute;