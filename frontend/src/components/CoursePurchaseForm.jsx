import React, { useState } from 'react';
import { toast } from 'sonner';
import axios from '../utils/axios';

const CoursePurchaseForm = ({ course, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    validationDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRazorpayPayment = async () => {
    // Validation
    if (!formData.customerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    if (!formData.customerEmail.trim() || !/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!formData.customerPhone.trim() || !/^\d{10}$/.test(formData.customerPhone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    if (!formData.validationDate) {
      toast.error('Please select validation date');
      return;
    }

    setLoading(true);

    try {
      // Create course purchase order first
      const orderResponse = await axios.post('/api/orders/course-purchase', {
        courseId: course._id,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        validationDate: formData.validationDate
      });

      const order = orderResponse.data.order;

      // Create Razorpay payment order
      const paymentResponse = await axios.post('/api/orders/create-payment-order', {
        orderId: order._id
      });

      const { id, amount, currency, key } = paymentResponse.data;

      // Initialize Razorpay
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'Bakery Platform',
        description: `Course Purchase: ${course.title}`,
        order_id: id,
        handler: async function (response) {
          try {
            // Verify payment
            await axios.post('/api/orders/verify-razorpay-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            toast.success('Payment successful! Course access granted.');
            onSuccess && onSuccess(order);
            onClose();
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: formData.customerName,
          email: formData.customerEmail,
          contact: formData.customerPhone
        },
        theme: {
          color: '#007bff'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Error initiating payment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to initiate payment';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Purchase Course: {course.title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="row mb-4">
              <div className="col-md-4">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="img-fluid rounded"
                  style={{ maxHeight: '200px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                  }}
                />
              </div>
              <div className="col-md-8">
                <h6>{course.title}</h6>
                <p className="text-muted">{course.description}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="h5 price-text mb-0">₹{course.price}</span>
                  <span className="badge bg-primary">{course.type === 'recorded' ? 'Recorded Course' : 'Live Course'}</span>
                </div>
              </div>
            </div>


              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    placeholder="Enter 10-digit phone number"
                    pattern="[0-9]{10}"
                    required
                  />
                  <small className="form-text text-muted">Enter 10-digit mobile number</small>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Validation Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    name="validationDate"
                    value={formData.validationDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <small className="form-text text-muted">Date when validation was done</small>
                </div>
              </div>



              <div className="alert alert-info">
                <strong>Note:</strong> Click "Pay with Razorpay" to complete your course purchase securely. Payment will be processed instantly and you'll get immediate access to the course.
              </div>

          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleRazorpayPayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-credit-card me-2"></i>
                  Pay with Razorpay - ₹{course.price}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePurchaseForm;
