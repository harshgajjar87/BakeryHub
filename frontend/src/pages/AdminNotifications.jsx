import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { FaPlus, FaSearch, FaEye, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import OrderDetailModal from './OrderDetailModal';
import ChatButton from '../components/ChatButton';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  // Filters
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [isRead, setIsRead] = useState('');

  // Send notification form
  const [sendForm, setSendForm] = useState({
    recipientId: '',
    title: '',
    message: '',
    type: 'admin_action',
    redirectUrl: ''
  });

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, [pagination.currentPage, search, type, isRead]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 20
      });

      if (search) params.append('search', search);
      if (type) params.append('type', type);
      if (isRead !== '') params.append('isRead', isRead);

      const response = await axios.get(`/api/admin/notifications?${params}`);
      setNotifications(response.data.notifications);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users?limit=1000');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleApproveNotification = async (notification) => {
    try {
      await axios.put(`/api/admin/notifications/${notification._id}/approve`, {
        adminNotes: ''
      });
      toast.success('Notification approved successfully');
      fetchNotifications();
    } catch (error) {
      console.error('Error approving notification:', error);
      toast.error('Failed to approve notification');
    }
  };

  const handleRejectNotification = async (notification) => {
    try {
      await axios.put(`/api/admin/notifications/${notification._id}/reject`, {
        adminNotes: 'Rejected by admin'
      });
      toast.success('Notification rejected successfully');
      fetchNotifications();
    } catch (error) {
      console.error('Error rejecting notification:', error);
      toast.error('Failed to reject notification');
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/notifications', sendForm);
      toast.success('Notification sent successfully');
      setShowSendModal(false);
      setSendForm({
        recipientId: '',
        title: '',
        message: '',
        type: 'admin_action',
        redirectUrl: ''
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const handleDeleteNotification = async () => {
    try {
      await axios.delete(`/api/admin/notifications/${selectedNotification._id}`);
      toast.success('Notification deleted successfully');
      setShowDeleteModal(false);
      setSelectedNotification(null);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeBadge = (type) => {
    const badges = {
      order_status: 'badge bg-primary',
      payment_verified: 'badge bg-success',
      payment_rejected: 'badge bg-danger',
      course_purchased: 'badge bg-info',
      course_access: 'badge bg-success',
      new_message: 'badge bg-warning',
      admin_action: 'badge bg-secondary',
      system: 'badge bg-dark',
      request_access: 'badge bg-info',
      new_order: 'badge bg-warning',
      checkout_request: 'badge bg-info'
    };
    return badges[type] || 'badge bg-secondary';
  };

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mb-0">Notification Management</h1>
            <button
              className="btn btn-primary"
              onClick={() => setShowSendModal(true)}
            >
              <FaPlus className="me-2" />
              Send Notification
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="order_status">Order Status</option>
            <option value="payment_verified">Payment Verified</option>
            <option value="payment_rejected">Payment Rejected</option>
            <option value="course_purchased">Course Purchased</option>
            <option value="course_access">Course Access</option>
            <option value="new_message">New Message</option>
            <option value="admin_action">Admin Action</option>
            <option value="system">System</option>
            <option value="request_access">Request Access</option>
            <option value="new_order">New Order</option>
            <option value="checkout_request">Checkout Request</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={isRead}
            onChange={(e) => setIsRead(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="false">Unread</option>
            <option value="true">Read</option>
          </select>
        </div>
        <div className="col-md-2">
          <button
            className="btn btn-outline-secondary w-100"
            onClick={() => {
              setSearch('');
              setType('');
              setIsRead('');
              setPagination(prev => ({ ...prev, currentPage: 1 }));
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">No notifications found.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Recipient</th>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.map((notification) => (
                        <tr key={notification._id}>
                          <td>{notification.user?.name || 'N/A'}</td>
                          <td>
                            <div className="fw-bold">{notification.title}</div>
                            <small className="text-muted">
                              {notification.message.length > 50
                                ? `${notification.message.substring(0, 50)}...`
                                : notification.message}
                            </small>
                          </td>
                          <td>
                            <span className={getTypeBadge(notification.type)}>
                              {notification.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            {notification.isRead ? (
                              <span className="badge bg-success">
                                <FaCheck className="me-1" />
                                Read
                              </span>
                            ) : (
                              <span className="badge bg-warning">
                                <FaTimes className="me-1" />
                                Unread
                              </span>
                            )}
                          </td>
                          <td>{formatDate(notification.createdAt)}</td>
                          <td>
                            {(notification.type === 'new_order' || notification.type === 'request_access') && !notification.isRead && (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-success me-2"
                                  onClick={() => handleApproveNotification(notification)}
                                  title="Approve"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger me-2"
                                  onClick={() => handleRejectNotification(notification)}
                                  title="Reject"
                                >
                                  <FaTimes />
                                </button>
                              </>
                            )}
                            {notification.relatedId && notification.relatedModel === 'Order' && (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-primary me-2"
                                  onClick={() => {
                                    setSelectedNotification(notification);
                                    setShowOrderModal(true);
                                  }}
                                  title="View Order Details"
                                >
                                  <FaEye />
                                </button>
                                <ChatButton 
                                  orderId={notification.relatedId} 
                                  userId={notification.user?._id} 
                                  size="sm" 
                                />
                              </>
                            )}
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                setSelectedNotification(notification);
                                setShowDeleteModal(true);
                              }}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <nav>
                    <ul className="pagination">
                      <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                        >
                          Previous
                        </button>
                      </li>
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <li key={page} className={`page-item ${page === pagination.currentPage ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                          >
                            {page}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Send Notification</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSendModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <form onSubmit={handleSendNotification}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Recipient</label>
                      <select
                        className="form-select"
                        value={sendForm.recipientId}
                        onChange={(e) => setSendForm({ ...sendForm, recipientId: e.target.value })}
                        required
                      >
                        <option value="">Select a user</option>
                        {users.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Type</label>
                      <select
                        className="form-select"
                        value={sendForm.type}
                        onChange={(e) => setSendForm({ ...sendForm, type: e.target.value })}
                      >
                        <option value="admin_action">Admin Action</option>
                        <option value="system">System</option>
                        <option value="order_status">Order Status</option>
                        <option value="course_access">Course Access</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={sendForm.title}
                      onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={sendForm.message}
                      onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                      required
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Redirect URL (Optional)</label>
                    <input
                      type="url"
                      className="form-control"
                      value={sendForm.redirectUrl}
                      onChange={(e) => setSendForm({ ...sendForm, redirectUrl: e.target.value })}
                      placeholder="e.g., /orders/123"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowSendModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Send Notification
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedNotification && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Notification</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this notification?</p>
                <div className="alert alert-warning">
                  <strong>Title:</strong> {selectedNotification.title}<br />
                  <strong>Recipient:</strong> {selectedNotification.user?.name || 'N/A'}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteNotification}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showOrderModal && selectedNotification && (
        <OrderDetailModal
          orderId={selectedNotification.relatedId}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedNotification(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminNotifications;
