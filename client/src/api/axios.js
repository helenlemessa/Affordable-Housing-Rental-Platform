// src/api/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('🔄 Axios Interceptor - Token:', token); // DEBUG
  console.log('🔄 Axios Interceptor - Config URL:', config.url); // DEBUG
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ Axios Interceptor - Authorization header set'); // DEBUG
  } else {
    console.log('❌ Axios Interceptor - No token found'); // DEBUG
  }
  
  console.log('🔄 Axios Interceptor - Final headers:', config.headers); // DEBUG
  return config;
}, (error) => {
  console.error('❌ Axios Interceptor Error:', error);
  return Promise.reject(error);
});

export default instance;