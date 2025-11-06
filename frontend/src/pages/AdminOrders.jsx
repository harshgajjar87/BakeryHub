import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import ChatButton from '../components/ChatButton';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', notes: '' });
  const [customizationPrice, setCustomizationPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`/api/orders?page=${currentPage}&limit=10&status=${statusFilter}&search=${searchTerm}`);
      setOrders(response.data.orders);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await axios.put(`/api/orders/${selectedOrder._id}/status`, statusUpdate);
      toast.success('Order status updated successfully');
      setShowStatusModal(false);
      setSelectedOrder(null);
      setStatusUpdate({ status: '', notes: '' });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleApproveOrder = async (order) => {
    try {
      await axios.put(`/api/orders/${order._id}/approve`, {});
      
      // Determine if payment is required
      const requiresPayment = order.customizationRequired && order.customizationPrice > 0;
      
      // Send approval email to customer with payment information
      await axios.post(`/api/orders/${order._id}/send-approval-email`, {
        customerEmail: order.user?.email,
        customerName: order.user?.name,
        orderId: order._id,
        requiresPayment: requiresPayment,
        customizationPrice: requiresPayment ? order.customizationPrice : 0
      });
      
      const message = requiresPayment 
        ? 'Order approved successfully and payment notification sent to customer'
        : 'Order approved successfully and notification sent to customer';
      
      toast.success(message);
      fetchOrders();
    } catch (error) {
      console.error('Error approving order:', error);
      toast.error('Failed to approve order');
    }
  };

  const handleRejectOrder = async (order) => {
    try {
      await axios.put(`/api/orders/${order._id}/reject`, {});
      toast.success('Order rejected successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast.error('Failed to reject order');
    }
  };

  const handleRequestPayment = (order) => {
    setSelectedOrder(order);
    setCustomizationPrice('');
    setShowPaymentModal(true);
  };

  const handleSubmitPaymentRequest = async () => {
    if (!customizationPrice || parseFloat(customizationPrice) < 0) {
      toast.error('Please enter a valid customization price');
      return;
    }

    try {
      await axios.put(`/api/orders/${selectedOrder._id}/request-payment`, {
        customizationPrice: parseFloat(customizationPrice)
      });
      toast.success('Payment requested successfully with customization pricing');
      setShowPaymentModal(false);
      setSelectedOrder(null);
      setCustomizationPrice('');
      fetchOrders();
    } catch (error) {
      console.error('Error requesting payment:', error);
      toast.error('Failed to request payment');
    }
  };

  const handleVerifyPayment = async (order) => {
    try {
      await axios.put(`/api/orders/${order._id}/verify-payment`, {});
      toast.success('Payment verified successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment');
    }
  };

  const handleMarkAsDelivered = async (order) => {
    try {
      await axios.put(`/api/orders/${order._id}/mark-delivered`, {});
      toast.success('Order marked as delivered successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      toast.error('Failed to mark order as delivered');
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setStatusUpdate({ status: order.status, notes: order.notes || '' });
    setShowStatusModal(true);
  };

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'delivered': return 'bg-success';
      case 'shipped': return 'bg-info';
      case 'processing': return 'bg-warning';
      case 'paid': return 'bg-primary';
      case 'payment_pending': return 'bg-warning';
      case 'payment_submitted': return 'bg-info';
      case 'customization_pending': return 'bg-info';
      case 'approved': return 'bg-success';
      case 'pending_approval': return 'bg-secondary';
      case 'cancelled': return 'bg-danger';
      case 'rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col-12">
          <h1>Manage Orders</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="customization_pending">Customization Pending</option>
            <option value="payment_pending">Payment Pending</option>
            <option value="payment_submitted">Payment Submitted</option>
            <option value="paid">Paid</option>
            <option value="in_progress">In Progress</option>
            <option value="ready_for_delivery">Ready for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td>#{order._id.slice(-8)}</td>
                        <td>{order.user?.name || 'N/A'}</td>
                        <td>{formatCurrency(order.totalAmount)}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-info me-1"
                              onClick={() => openDetailsModal(order)}
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-primary me-1"
                              onClick={() => openStatusModal(order)}
                              title="Update Status"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            {order.status === 'pending_approval' && (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-success me-1"
                                  onClick={() => handleApproveOrder(order)}
                                  title="Approve Order"
                                >
                                  <i className="fas fa-check"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger me-1"
                                  onClick={() => handleRejectOrder(order)}
                                  title="Reject Order"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </>
                            )}
                            {order.status === 'customization_pending' && (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-warning me-1"
                                  onClick={() => handleRequestPayment(order)}
                                  title="Request Payment"
                                >
                                  <i className="fas fa-credit-card"></i>
                                </button>
                                <ChatButton 
                                  orderId={order._id} 
                                  userId={order.user?._id} 
                                  size="sm" 
                                />
                              </>
                            )}
                            {order.status === 'payment_submitted' && (
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => handleVerifyPayment(order)}
                                title="Verify Payment"
                              >
                                <i className="fas fa-check-circle"></i>
                              </button>
                            )}
                            {(order.status === 'approved' || order.status === 'in_progress') && (
                              <ChatButton
                                orderId={order._id}
                                userId={order.user?._id}
                                size="sm"
                              />
                            )}
                            {order.status === 'paid' && (
                              <button
                                className="btn btn-sm btn-outline-success me-1"
                                onClick={() => handleMarkAsDelivered(order)}
                                title="Mark as Delivered"
                              >
                                <i className="fas fa-truck"></i> Delivered
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-3">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(prev => prev - 1)}
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, index) => (
                      <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(index + 1)}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Order Status</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowStatusModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={statusUpdate.status}
                    onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="pending_approval">Pending Approval</option>
                    <option value="approved">Approved</option>
                    <option value="customization_pending">Customization Pending</option>
                    <option value="payment_pending">Payment Pending</option>
                    <option value="payment_submitted">Payment Submitted</option>
                    <option value="paid">Paid</option>
                    <option value="in_progress">In Progress</option>
                    <option value="ready_for_delivery">Ready for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={statusUpdate.notes}
                    onChange={(e) => setStatusUpdate(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Optional notes..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowStatusModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleStatusUpdate}
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Order Details - #{selectedOrder._id.slice(-8)}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <h6>Customer Information</h6>
                    <p><strong>Name:</strong> {selectedOrder.user?.name}</p>
                    <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                    <p><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Order Information</h6>
                    <p><strong>Status:</strong> <span className={`badge ${getStatusBadgeClass(selectedOrder.status)}`}>{selectedOrder.status.replace(/_/g, ' ')}</span></p>
                    <p><strong>Total:</strong> {formatCurrency(selectedOrder.totalAmount)}</p>
                    {selectedOrder.customizationPrice > 0 && (
                      <>
                        <p><strong>Original Price:</strong> {formatCurrency(selectedOrder.originalPrice)}</p>
                        <p><strong>Customization Price:</strong> {formatCurrency(selectedOrder.customizationPrice)}</p>
                      </>
                    )}
                    <p><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                    <p><strong>Delivery Date:</strong> {formatDate(selectedOrder.deliveryDate)}</p>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-12">
                    <h6>Shipping Address</h6>
                    <p>
                      {selectedOrder.deliveryMethod === 'pickup' ? (
                        'Pickup'
                      ) : (
                        <>
                          {selectedOrder.shippingAddress?.name}<br />
                          {selectedOrder.shippingAddress?.address}<br />
                          {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}<br />
                          Phone: {selectedOrder.shippingAddress?.phone}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {selectedOrder.customizationRequired && (
                  <div className="row mb-3">
                    <div className="col-12">
                      <h6>Customization Details</h6>
                      <p>{selectedOrder.customizationDetails}</p>
                    </div>
                  </div>
                )}

                {selectedOrder.notes && (
                  <div className="row mb-3">
                    <div className="col-12">
                      <h6>Order Notes</h6>
                      <p>{selectedOrder.notes}</p>
                    </div>
                  </div>
                )}

                {(selectedOrder.paymentProof || selectedOrder.paymentReferenceId) && (
                  <div className="row mb-3">
                    <div className="col-12">
                      <h6>Payment Information</h6>
                      {selectedOrder.paymentProof && (
                        <div className="mb-3">
                          <p><strong>Payment Screenshot:</strong></p>
                          <img
                            src={selectedOrder.paymentProof}
                            alt="Payment Proof"
                            className="img-fluid"
                            style={{ maxWidth: '300px', maxHeight: '300px' }}
                          />
                        </div>
                      )}
                      {selectedOrder.paymentReferenceId && (
                        <p><strong>Reference ID:</strong> {selectedOrder.paymentReferenceId}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="row">
                  <div className="col-12">
                    <h6>Items</h6>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.items.map((item, index) => (
                            <tr key={index}>
                              <td>{item.product?.name || item.course?.title || 'Item'}</td>
                              <td>{item.quantity}</td>
                              <td>{formatCurrency(item.price)}</td>
                              <td>{formatCurrency(item.quantity * item.price)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Request Modal */}
      {showPaymentModal && selectedOrder && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Request Payment for Customized Order</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPaymentModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <p><strong>Order ID:</strong> #{selectedOrder._id.slice(-8)}</p>
                  <p><strong>Customer:</strong> {selectedOrder.user?.name}</p>
                  <p><strong>Original Total:</strong> {formatCurrency(selectedOrder.totalAmount)}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label">Customization Price (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={customizationPrice}
                    onChange={(e) => setCustomizationPrice(e.target.value)}
                    placeholder="Enter customization price"
                    min="0"
                    step="0.01"
                  />
                  <small className="form-text text-muted">
                    New total will be: {formatCurrency((selectedOrder.totalAmount || 0) + parseFloat(customizationPrice || 0))}
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmitPaymentRequest}
                >
                  Request Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
