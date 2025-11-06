import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Home from '../pages/Home';

const HomeRoute = () => {
  const { isAuthenticated, user } = useAuth();

  // If user is authenticated and is admin, redirect to admin dashboard
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // If user is authenticated and is a customer, redirect to customer dashboard
  if (isAuthenticated && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, show the home page
  return <Home />;
};

export default HomeRoute;
