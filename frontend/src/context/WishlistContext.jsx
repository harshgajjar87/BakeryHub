import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axios';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [productWishlist, setProductWishlist] = useState([]);
  const [courseWishlist, setCourseWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Fetch wishlists when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProductWishlist();
      fetchCourseWishlist();
    } else {
      setProductWishlist([]);
      setCourseWishlist([]);
    }
  }, [isAuthenticated, user]);

  const fetchProductWishlist = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/wishlist/products');
      setProductWishlist(response.data.wishlist || []);
    } catch (error) {
      console.error('Error fetching product wishlist:', error);
      toast.error('Failed to load product wishlist');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseWishlist = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/wishlist/courses');
      setCourseWishlist(response.data.wishlist || []);
    } catch (error) {
      console.error('Error fetching course wishlist:', error);
      toast.error('Failed to load course wishlist');
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (itemId, itemType = 'product') => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return false;
    }

    try {
      setLoading(true);
      let response;
      if (itemType === 'course') {
        response = await axios.post('/api/wishlist/courses', { courseId: itemId });
        setCourseWishlist(prev => [...prev, response.data.wishlistItem]);
      } else {
        response = await axios.post('/api/wishlist/products', { productId: itemId });
        setProductWishlist(prev => [...prev, response.data.wishlistItem]);
      }

      toast.success(`${itemType === 'course' ? 'Course' : 'Product'} added to wishlist!`);
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      const message = error.response?.data?.message || 'Failed to add to wishlist';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      setLoading(true);
      // Try to remove from product wishlist first
      try {
        await axios.delete(`/api/wishlist/products/${itemId}`);
        setProductWishlist(prev => prev.filter(item => item.product._id !== itemId));
      } catch (productError) {
        // If not found in product wishlist, try course wishlist
        await axios.delete(`/api/wishlist/courses/${itemId}`);
        setCourseWishlist(prev => prev.filter(item => item.course._id !== itemId));
      }

      toast.success('Item removed from wishlist');
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (itemId, type = 'product') => {
    if (type === 'product') {
      return productWishlist.some(item => item.product._id === itemId);
    } else if (type === 'course') {
      return courseWishlist.some(item => item.course._id === itemId);
    }
    return false;
  };

  const checkWishlistStatus = async (itemId, type = 'product') => {
    if (!isAuthenticated) return false;

    try {
      if (type === 'product') {
        const response = await axios.get(`/api/wishlist/products/check/${itemId}`);
        return response.data.isInWishlist;
      } else if (type === 'course') {
        const response = await axios.get(`/api/wishlist/courses/check/${itemId}`);
        return response.data.isInWishlist;
      }
      return false;
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      return false;
    }
  };

  // Combined wishlist for backward compatibility
  const wishlist = [...productWishlist, ...courseWishlist];

  const value = {
    wishlist,
    productWishlist,
    courseWishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    checkWishlistStatus,
    fetchProductWishlist,
    fetchCourseWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
