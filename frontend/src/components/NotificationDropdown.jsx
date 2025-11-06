import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaCheck, FaTrash, FaEye, FaClock } from 'react-icons/fa';
import { useNotifications } from '../context/NotificationContext';

const NotificationDropdown = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    handleNotificationClick,
    loadMore,
    hasMore
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_status':
      case 'payment_verified':
      case 'payment_rejected':
        return 'fas fa-shopping-cart';
      case 'course_purchased':
      case 'course_access':
        return 'fas fa-graduation-cap';
      case 'new_message':
        return 'fas fa-envelope';
      case 'admin_action':
        return 'fas fa-user-shield';
      case 'request_access':
        return 'fas fa-key';
      default:
        return 'fas fa-bell';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-danger';
      case 'high':
        return 'border-warning';
      case 'medium':
        return 'border-info';
      default:
        return 'border-secondary';
    }
  };

  return (
    <div className="dropdown position-relative" ref={dropdownRef}>
      <button
        className="btn btn-link position-relative p-0 text-decoration-none"
        onClick={() => {
          setIsOpen(!isOpen);
          // Play notification sound on user interaction
          if (unreadCount > 0) {
            try {
              const audio = new Audio('/notification-sound.mp3');
              audio.volume = 0.3;
              audio.play().catch(e => {
                console.log('Notification sound could not play:', e);
              });
            } catch (error) {
              console.log('Audio not supported');
            }
          }
        }}
        title="Notifications"
      >
        <FaBell size={20} className="text-white" />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount > 99 ? '99+' : unreadCount}
            <span className="visually-hidden">unread notifications</span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="dropdown-menu dropdown-menu-end show shadow-lg"
             style={{
               width: '400px',
               maxHeight: '500px',
               right: 0,
               left: 'auto'
             }}>
          {/* Header */}
          <div className="dropdown-header d-flex justify-content-between align-items-center p-3 border-bottom">
            <h6 className="mb-0 fw-bold">Notifications</h6>
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                <FaCheck className="me-1" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="notification-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <FaBell size={32} className="mb-2 opacity-50" />
                <p className="mb-0">No notifications yet</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`notification-item p-3 border-bottom cursor-pointer ${
                      !notification.isRead ? 'bg-light' : ''
                    } ${getPriorityColor(notification.priority)}`}
                    style={{ borderLeft: !notification.isRead ? '3px solid' : 'none' }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="d-flex align-items-start">
                      <div className="me-3">
                        <i className={`${getNotificationIcon(notification.type)} text-primary`} style={{ fontSize: '18px' }}></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <h6 className="mb-1 fw-semibold" style={{ fontSize: '14px' }}>
                            {notification.title}
                          </h6>
                          <div className="d-flex align-items-center">
                            {!notification.isRead && (
                              <span className="badge bg-primary rounded-pill me-2" style={{ fontSize: '10px' }}>
                                New
                              </span>
                            )}
                            <button
                              className="btn btn-sm btn-link text-muted p-0 me-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification._id);
                              }}
                              title="Delete notification"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </div>
                        <p className="mb-1 text-muted" style={{ fontSize: '13px' }}>
                          {notification.message}
                        </p>
                        <div className="d-flex align-items-center text-muted" style={{ fontSize: '11px' }}>
                          <FaClock className="me-1" />
                          {formatTimeAgo(notification.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center p-2">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={loadMore}
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="dropdown-footer p-2 border-top">
            <Link
              to="/notifications"
              className="btn btn-sm btn-link w-100 text-decoration-none"
              onClick={() => setIsOpen(false)}
            >
              <FaEye className="me-1" />
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
