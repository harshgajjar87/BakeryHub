import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from '../utils/axios';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Notification sound - play on user interaction only
  const playNotificationSound = useCallback(() => {
    // Only play sound when user interacts (e.g., clicks notification bell)
    // This avoids browser autoplay restrictions
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch(e => {
        // Silently fail if audio can't play
        console.log('Notification sound could not play:', e);
      });
    } catch (error) {
      console.log('Audio not supported');
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await axios.get(`/api/notifications?page=${pageNum}&limit=20`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (append) {
        setNotifications(prev => [...prev, ...response.data.notifications]);
      } else {
        setNotifications(response.data.notifications);
      }

      setUnreadCount(response.data.unreadCount);
      setHasMore(response.data.pagination.hasNext);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch unread count only
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const response = await axios.get('/api/notifications/unread-count', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await axios.put('/api/notifications/mark-all-read', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );

      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  }, []);

  // Handle notification click and redirect
  const handleNotificationClick = useCallback(async (notification) => {
    // Mark as read if not already
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // Redirect based on notification type and redirectUrl
    if (notification.redirectUrl) {
      window.location.href = notification.redirectUrl;
    } else {
      // Fallback redirects based on type
      switch (notification.type) {
        case 'order_status':
        case 'payment_verified':
        case 'payment_rejected':
          if (notification.relatedId) {
            window.location.href = `/orders/${notification.relatedId}`;
          }
          break;
        case 'course_purchased':
        case 'course_access':
          if (notification.relatedId) {
            window.location.href = `/courses/${notification.relatedId}`;
          }
          break;
        case 'new_message':
          window.location.href = '/chat';
          break;
        case 'request_access':
          window.location.href = '/profile';
          break;
        default:
          // Stay on current page
          break;
      }
    }
  }, [markAsRead]);

  // Load more notifications
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchNotifications(page + 1, true);
    }
  }, [hasMore, loading, page, fetchNotifications]);

  // Real-time notification updates (polling for now, can be upgraded to WebSocket)
  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchNotifications(1, false);

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, fetchNotifications, fetchUnreadCount]);

  // Removed automatic sound playing to avoid browser autoplay restrictions
  // Sound will only play on user interaction (e.g., clicking notification bell)

  const value = {
    notifications,
    unreadCount,
    loading,
    hasMore,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    handleNotificationClick,
    loadMore
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
