// src/config/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  "https://affordable-housing-backend.onrender.com/api";

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_VERIFY: `${API_BASE_URL}/auth/verify`,
  AUTH_ADMIN_LOGIN: `${API_BASE_URL}/auth/admin/login`,
  
  // Listings
  LISTINGS_ADD: `${API_BASE_URL}/listings/add`,
  LISTINGS_APPROVED: `${API_BASE_URL}/listings/approved`,
  LISTINGS_PENDING: `${API_BASE_URL}/admin/pending-listings`,
  LISTINGS_APPROVE: (id) => `${API_BASE_URL}/admin/approve-listing/${id}`,
  LISTINGS_REJECT: (id) => `${API_BASE_URL}/admin/reject-listing/${id}`,
  
  // Admin
  ADMIN_STATS: `${API_BASE_URL}/admin/stats`,
  ADMIN_USERS: `${API_BASE_URL}/admin/users`,
  ADMIN_NEW_USERS: `${API_BASE_URL}/admin/users/new`,
  ADMIN_VERIFY: `${API_BASE_URL}/admin/verify`,
  ADMIN_APPROVE_LISTING: (id) => `${API_BASE_URL}/admin/approve-listing/${id}`,
  ADMIN_REJECT_LISTING: (id) => `${API_BASE_URL}/admin/reject-listing/${id}`,
 
  // WebSocket
  WS_NOTIFICATIONS: `${API_BASE_URL.replace('http', 'ws').replace('/api', '')}/ws/notifications`
};

export default API_BASE_URL;