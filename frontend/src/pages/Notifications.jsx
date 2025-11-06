import React, { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaTrash, FaEye, FaClock, FaFilter } from 'react-icons/fa';
import { useNotifications } from '../context/NotificationContext';
import { toast } from 'sonner';

const Notifications = () => {
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

  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'read':
        return notification.isRead;
      default:
        return true;
    }
  });

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return notificationDate.toLocaleDateString();
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
        return 'border-danger bg-danger-subtle';
      case 'high':
        return 'border-warning bg-warning-subtle';
      case 'medium':
        return 'border-info bg-info-subtle';
      default:
        return 'border-secondary bg-light';
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n._id));
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      for (const id of selectedNotifications) {
        await markAsRead(id);
      }
      setSelectedNotifications([]);
      toast.success(`${selectedNotifications.length} notifications marked as read`);
    } catch (error) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) return;

    if (!window.confirm(`Delete ${selectedNotifications.length} notifications?`)) return;

    try {
      for (const id of selectedNotifications) {
        await deleteNotification(id);
      }
      setSelectedNotifications([]);
      toast.success(`${selectedNotifications.length} notifications deleted`);
    } catch (error) {
      toast.error('Failed to delete notifications');
    }
  };

  return (
    <>
    <div className="bakery-bg py-5">
      <div className="container">
        <div className="row">
          <div className="col-lg-10 mx-auto">
            <div className="card shadow-lg border-0" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              <div className="card-header text-white position-relative" style={{
                background: 'linear-gradient(135deg, var(--bakery-brown) 0%, var(--bakery-brown-dark) 100%)',
                borderBottom: 'none',
                padding: '2rem'
              }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="mb-2 fw-bold">
                      <FaBell className="me-3" />
                      Notifications
                      {unreadCount > 0 && (
                        <span className="badge bg-danger ms-3 fs-6">{unreadCount}</span>
                      )}
                    </h2>
                    <p className="mb-0 opacity-75">Stay updated with your latest activities</p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      className="btn btn-light btn-lg px-4"
                      onClick={markAllAsRead}
                      style={{ transition: 'all 0.3s ease' }}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      <FaCheck className="me-2" />
                      Mark All Read
                    </button>
                )}

              </div>
            </div>

            <div className="card-body">
              {/* Filters */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="btn-group" role="group">
                  <input
                    type="radio"
                    className="btn-check"
                    name="filter"
                    id="all"
                    checked={filter === 'all'}
                    onChange={() => setFilter('all')}
                  />
                  <label className="btn btn-outline-secondary btn-sm" htmlFor="all">
                    All ({notifications.length})
                  </label>

                  <input
                    type="radio"
                    className="btn-check"
                    name="filter"
                    id="unread"
                    checked={filter === 'unread'}
                    onChange={() => setFilter('unread')}
                  />
                  <label className="btn btn-outline-secondary btn-sm" htmlFor="unread">
                    Unread ({unreadCount})
                  </label>

                  <input
                    type="radio"
                    className="btn-check"
                    name="filter"
                    id="read"
                    checked={filter === 'read'}
                    onChange={() => setFilter('read')}
                  />
                  <label className="btn btn-outline-secondary btn-sm" htmlFor="read">
                    Read ({notifications.length - unreadCount})
                  </label>
                </div>

                {selectedNotifications.length > 0 && (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={handleBulkMarkAsRead}
                    >
                      <FaCheck className="me-1" />
                      Mark Selected Read ({selectedNotifications.length})
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={handleBulkDelete}
                    >
                      <FaTrash className="me-1" />
                      Delete Selected ({selectedNotifications.length})
                    </button>
                  </div>
                )}
              </div>

              {/* Bulk Select All */}
              {filteredNotifications.length > 0 && (
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="selectAll"
                      checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                      onChange={handleSelectAll}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="selectAll">
                      Select All ({filteredNotifications.length})
                    </label>
                  </div>
                </div>
              )}

              {/* Notifications List */}
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-5">
                  <FaBell size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No notifications found</h5>
                  <p className="text-muted">
                    {filter === 'unread' ? 'You have no unread notifications.' :
                     filter === 'read' ? 'You have no read notifications.' :
                     'You have no notifications yet.'}
                  </p>
                </div>
              ) : (
                <div className="notifications-list">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`notification-item card mb-3 cursor-pointer border-start ${
                        getPriorityColor(notification.priority)
                      } ${!notification.isRead ? 'shadow-sm' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-body p-3">
                        <div className="d-flex align-items-start">
                          <div className="me-3">
                            <input
                              type="checkbox"
                              className="form-check-input mt-1"
                              checked={selectedNotifications.includes(notification._id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSelectNotification(notification._id);
                              }}
                            />
                          </div>

                          <div className="me-3">
                            <i className={`${getNotificationIcon(notification.type)} text-primary fa-2x`}></i>
                          </div>

                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <h6 className="mb-1 fw-semibold">
                                  {notification.title}
                                  {!notification.isRead && (
                                    <span className="badge bg-primary ms-2">New</span>
                                  )}
                                </h6>
                                <p className="mb-2 text-muted small">
                                  {notification.message}
                                </p>
                                <div className="d-flex align-items-center text-muted small">
                                  <FaClock className="me-1" />
                                  {formatTimeAgo(notification.createdAt)}
                                  {notification.sender && (
                                    <>
                                      <span className="mx-2">•</span>
                                      From: {notification.sender.name}
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="d-flex align-items-center gap-2">
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationClick(notification);
                                  }}
                                  title="View Details"
                                >
                                  <FaEye />
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification._id);
                                  }}
                                  title="Delete"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Load More */}
                  {hasMore && (
                    <div className="text-center mt-4">
                      <button
                        className="btn btn-outline-primary"
                        onClick={loadMore}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Loading...
                          </>
                        ) : (
                          'Load More Notifications'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Notifications;
