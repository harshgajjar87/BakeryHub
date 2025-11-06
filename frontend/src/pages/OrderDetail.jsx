import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { FaCopy, FaDownload } from 'react-icons/fa';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentQRs, setPaymentQRs] = useState([]);
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [uploading, setUploading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
    fetchPaymentQRs();
  }, [id]);

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
      const response = await axios.get(`/api/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order detail:', error);
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = () => {
    if (order?.chatEnabled) {
      navigate(`/chat/${id}`);
    }
  };

  const handlePaymentProofUpload = async (e) => {
    e.preventDefault();

    if (!paymentProofFile) {
      toast.error('Please select a payment proof file');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('paymentProof', paymentProofFile);
      if (paymentReference.trim()) {
        formData.append('referenceId', paymentReference.trim());
      }

      const response = await axios.post(`/api/orders/${id}/submit-payment-proof`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Payment proof submitted successfully! We will verify your payment shortly.');
      setPaymentProofFile(null);
      setPaymentReference('');
      fetchOrderDetail(); // Refresh order details
    } catch (error) {
      console.error('Error submitting payment proof:', error);
      toast.error(error.response?.data?.message || 'Failed to submit payment proof');
    } finally {
      setUploading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      setProcessingPayment(true);

      // Create Razorpay payment order
      const response = await axios.post('/api/orders/create-payment-order', {
        orderId: id
      });

      const { id: razorpayOrderId, amount, currency, key } = response.data;

      const options = {
        key,
        amount,
        currency,
        name: 'Bakery Platform',
        description: `Payment for Order #${order._id.slice(-8)}`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResponse = await axios.post('/api/orders/verify-razorpay-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            toast.success('Payment successful! Your order is now being processed.');
            fetchOrderDetail(); // Refresh order details
          } catch (verifyError) {
            console.error('Payment verification failed:', verifyError);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: order?.shippingAddress?.phone || ''
        },
        theme: {
          color: '#8B4513'
        },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setProcessingPayment(false);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}/download-invoice`, {
        responseType: 'blob' // Important for handling binary data
      });

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
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

  if (!order) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h2>Order not found</h2>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/orders')}>
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <button className="btn btn-link p-0 text-decoration-none" onClick={() => navigate('/orders')}>
                    My Orders
                  </button>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Order #{order._id.slice(-8)}
                </li>
              </ol>
            </nav>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
                <i className="fas fa-arrow-left me-2"></i>
                Back to Dashboard
              </button>
              {(order.status === 'paid' || order.status === 'in_progress' || order.status === 'ready_for_delivery' || order.status === 'delivered' || order.status === 'completed') && (
                <button
                  className="btn btn-success"
                  onClick={() => handleDownloadInvoice(order._id)}
                >
                  <i className="fas fa-download me-1"></i>
                  Download Invoice
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          {/* Order Status */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Order Status</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-bold">Current Status:</span>
                <span className={`badge ${getStatusBadgeClass(order.status)} fs-6`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>

              {order.chatEnabled && (
                <div className="d-flex justify-content-between align-items-center">
                  <span>Chat with our team:</span>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={handleChatClick}
                  >
                    <i className="fas fa-comments me-2"></i>
                    Open Chat
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Order Items</h5>
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
                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
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

              {order.customizationRequired && (
                <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                  <div>
                    <h6 className="mb-1">Customization charge</h6>
                  </div>
                  <div className="text-end">
                    <div className="fw-bold">{formatCurrency(order.customizationPrice || 0)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Shipping Address</h5>
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
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Customization Details</h5>
              </div>
              <div className="card-body">
                <p>{order.customizationDetails}</p>
              </div>
            </div>
          )}

          {/* Order Notes */}
          {order.notes && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Order Notes</h5>
              </div>
              <div className="card-body">
                <p>{order.notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="col-lg-4">
          {/* Order Summary */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Order Summary</h5>
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
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.originalPrice || 0)}</span>
              </div>
              {order.customizationRequired && (
                <div className="d-flex justify-content-between mb-2">
                  <span>Customization Charge:</span>
                  <span>{formatCurrency(order.customizationPrice || 0)}</span>
                </div>
              )}
              <div className="d-flex justify-content-between">
                <strong>Total:</strong>
                <strong className="price-text">{formatCurrency(order.totalAmount)}</strong>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Payment Information</h5>
            </div>
            <div className="card-body">
              {order.status === 'payment_pending' && (
                <>
                  <div className="alert alert-warning">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Payment is pending. Please complete your payment using Razorpay to proceed with the order.
                  </div>

                  {/* Razorpay Payment Button */}
                  <div className="mt-4">
                    <button
                      className="btn btn-primary w-100"
                      onClick={handleRazorpayPayment}
                      disabled={processingPayment}
                    >
                      {processingPayment ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-credit-card me-2"></i>
                          Pay ₹{order.totalAmount} with Razorpay
                        </>
                      )}
                    </button>
                    <div className="text-center mt-2">
                      <small className="text-muted">
                        Secure payment powered by Razorpay
                      </small>
                    </div>
                  </div>
                </>
              )}

              {order.status === 'approved' && (
                <>
                  <div className="alert alert-success">
                    <i className="fas fa-thumbs-up me-2"></i>
                    Order approved! Complete your payment to proceed.
                  </div>

                  {/* Razorpay Payment Button */}
                  <div className="mt-4">
                    <button
                      className="btn btn-primary w-100"
                      onClick={handleRazorpayPayment}
                      disabled={processingPayment}
                    >
                      {processingPayment ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-credit-card me-2"></i>
                          Pay ₹{order.totalAmount} with Razorpay
                        </>
                      )}
                    </button>
                    <div className="text-center mt-2">
                      <small className="text-muted">
                        Secure payment powered by Razorpay
                      </small>
                    </div>
                  </div>
                </>
              )}

              {order.status === 'paid' && (
                <div className="alert alert-success">
                  <i className="fas fa-check-circle me-2"></i>
                  Payment verified and confirmed. Your order has been received and is being processed for {order.deliveryMethod === 'pickup' ? 'pickup' : 'delivery'}.
                </div>
              )}

              {order.status === 'pending_approval' && (
                <div className="alert alert-info">
                  <i className="fas fa-clock me-2"></i>
                  Your order is pending admin approval.
                </div>
              )}

              {order.status === 'customization_pending' && (
                <div className="alert alert-info">
                  <i className="fas fa-paint-brush me-2"></i>
                  Customization discussion in progress.
                </div>
              )}



              {order.status === 'in_progress' && (
                <div className="alert alert-primary">
                  <i className="fas fa-cog me-2"></i>
                  Your order is being prepared.
                </div>
              )}

              {order.status === 'ready_for_delivery' && (
                <div className="alert alert-success">
                  <i className="fas fa-truck me-2"></i>
                  Your order is ready for delivery/pickup.
                </div>
              )}

              {order.status === 'delivered' && (
                <div className="alert alert-success">
                  <i className="fas fa-check-circle me-2"></i>
                  Order delivered successfully!
                </div>
              )}

              {order.status === 'completed' && (
                <div className="alert alert-success">
                  <i className="fas fa-star me-2"></i>
                  Order completed. Thank you for your business!
                </div>
              )}

              {order.status === 'rejected' && (
                <div className="alert alert-danger">
                  <i className="fas fa-times-circle me-2"></i>
                  Order was rejected. Please contact support.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
