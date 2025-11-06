import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/auth/profile');
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;

      console.log('Login successful, token:', newToken ? 'exists' : 'missing');
      console.log('Token value:', newToken);
      localStorage.setItem('token', newToken);
      console.log('Token saved to localStorage');
      setToken(newToken);
      console.log('Token state updated');
      setUser(userData);

      return { success: true, redirect: userData.role === 'admin' ? '/admin' : '/dashboard' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('/api/auth/register', { name, email, password });
      return {
        success: true,
        message: response.data.message,
        userId: response.data.userId
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await axios.post('/api/auth/verify-otp', { email, otp });
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);

      return { success: true, redirect: userData.role === 'admin' ? '/admin' : '/dashboard' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'OTP verification failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/auth/profile', profileData);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed'
      };
    }
  };

  const uploadProfileImage = async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('profileImage', imageFile);

      const response = await axios.post('/api/auth/upload-profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update user state with new profile image
      setUser(prevUser => ({
        ...prevUser,
        profile: {
          ...prevUser.profile,
          profileImage: response.data.profileImage
        }
      }));

      return { success: true, profileImage: response.data.profileImage };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Image upload failed'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    verifyOTP,
    logout,
    updateProfile,
    uploadProfileImage,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
