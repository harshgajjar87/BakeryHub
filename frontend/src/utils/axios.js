import axios from 'axios';
import { toast } from 'sonner';

// Use relative URLs to leverage Vite proxy
axios.defaults.baseURL = '';

// Apply token from localStorage if exists
const existingToken = localStorage.getItem('token');
if (existingToken) {
  axios.defaults.headers.common.Authorization = `Bearer ${existingToken}`;
}

// Request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = config.headers.Authorization?.replace('Bearer ', '') || localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common.Authorization;
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      toast.error('Your session has expired. Please log in again.');
    }
    return Promise.reject(error);
  }
);

// Helper for setting/removing token programmatically
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common.Authorization;
  }
};

export default axios;
