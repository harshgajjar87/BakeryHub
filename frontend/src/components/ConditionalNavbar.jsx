import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import PublicNavbar from './PublicNavbar';

const ConditionalNavbar = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Navbar /> : <PublicNavbar />;
};

export default ConditionalNavbar;
