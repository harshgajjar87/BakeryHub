import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { toast } from 'sonner';
import { FaCopy, FaDownload } from 'react-icons/fa';

const OrderDetailModal = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentQRs, setPaymentQRs] = useState([]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
      fetchPaymentQRs();
    }
  }, [orderId]);

  const fetchPaymentQRs = async () => {
    try {
      const response = await axios.get('/api/admin/public/payment-qrs');
      setPaymentQRs(response.data);
    } catch (error) {
      console.error('Error fetching payment QRs:', error);
    }
  };

  const fetchOrderDetail = async () => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order detail:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
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
      case 'ready_for_delivery': return 'bg-info';
      case 'in_progress': return 'bg-warning';
      case 'paid': return 'bg-primary';
      case 'payment_pending': return 'bg-warning';
      case 'customization_pending': return 'bg-info';
      case 'approved': return 'bg-success';
      case 'pending_approval': return 'bg-secondary';
      case 'cancelled': return 'bg-danger';
      case 'rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  if (!orderId) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Order Details #{orderId.slice(-8)}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : order ? (
              <div className="row">
                <div className="col-lg-8">
                  {/* Order Status */}
                  <div className="card mb-3">
                    <div className="card-header">
                      <h6 className="mb-0">Order Status</h6>
                    </div>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold">Current Status:</span>
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="card mb-3">
                    <div className="card-header">
                      <h6 className="mb-0">Order Items</h6>
                    </div>
                    <div className="card-body">
                      {order.items.map((item, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                          <div className="d-flex align-items-center">
                            {item.product?.images?.[0] && (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="rounded me-3"
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                              />
                            )}
                            <div>
                              <h6 className="mb-1">{item.product?.name || item.course?.title || 'Item'}</h6>
                              <small className="text-muted">Quantity: {item.quantity}</small>
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold">{formatCurrency(item.quantity * item.price)}</div>
                            <small className="text-muted">{formatCurrency(item.price)} each</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="card mb-3">
                    <div className="card-header">
                      <h6 className="mb-0">Shipping Address</h6>
                    </div>
                    <div className="card-body">
                      <p className="mb-1"><strong>{order.shippingAddress?.name}</strong></p>
                      <p className="mb-1">{order.shippingAddress?.address}</p>
                      <p className="mb-1">
                        {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                      </p>
                      <p className="mb-0">Phone: {order.shippingAddress?.phone}</p>
                    </div>
                  </div>

                  {/* Customization Details */}
                  {order.customizationRequired && (
                    <div className="card mb-3">
                      <div className="card-header">
                        <h6 className="mb-0">Customization Details</h6>
                      </div>
                      <div className="card-body">
                        <p>{order.customizationDetails}</p>
                      </div>
                    </div>
                  )}

                  {/* Order Notes */}
                  {order.notes && (
                    <div className="card mb-3">
                      <div className="card-header">
                        <h6 className="mb-0">Order Notes</h6>
                      </div>
                      <div className="card-body">
                        <p>{order.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="col-lg-4">
                  {/* Order Summary */}
                  <div className="card mb-3">
                    <div className="card-header">
                      <h6 className="mb-0">Order Summary</h6>
                    </div>
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Order ID:</span>
                        <span className="text-muted">#{order._id.slice(-8)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Order Date:</span>
                        <span className="text-muted">{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Delivery Date:</span>
                        <span className="text-muted">{formatDate(order.deliveryDate)}</span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <strong>Total:</strong>
                        <strong className="price-text">{formatCurrency(order.totalAmount)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0">Payment Information</h6>
                    </div>
                    <div className="card-body">
                      {order.status === 'paid' && (
                        <div className="alert alert-success">
                          <i className="fas fa-check-circle me-2"></i>
                          Payment verified and confirmed.
                        </div>
                      )}

                      {order.status === 'payment_pending' && (
                        <div className="alert alert-warning">
                          <i className="fas fa-exclamation-triangle me-2"></i>
                          Payment pending.
                        </div>
                      )}

                      {order.status === 'pending_approval' && (
                        <div className="alert alert-info">
                          <i className="fas fa-clock me-2"></i>
                          Pending admin approval.
                        </div>
                      )}

                      {order.status === 'approved' && (
                        <div className="alert alert-success">
                          <i className="fas fa-thumbs-up me-2"></i>
                          Order approved!
                        </div>
                      )}

                      {order.status === 'in_progress' && (
                        <div className="alert alert-primary">
                          <i className="fas fa-cog me-2"></i>
                          Order in progress.
                        </div>
                      )}

                      {order.status === 'ready_for_delivery' && (
                        <div className="alert alert-success">
                          <i className="fas fa-truck me-2"></i>
                          Ready for delivery.
                        </div>
                      )}

                      {order.status === 'delivered' && (
                        <div className="alert alert-success">
                          <i className="fas fa-check-circle me-2"></i>
                          Order delivered.
                        </div>
                      )}

                      {order.status === 'completed' && (
                        <div className="alert alert-success">
                          <i className="fas fa-star me-2"></i>
                          Order completed.
                        </div>
                      )}

                      {order.status === 'rejected' && (
                        <div className="alert alert-danger">
                          <i className="fas fa-times-circle me-2"></i>
                          Order rejected.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-5">
                <p>Order not found</p>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
