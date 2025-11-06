import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaTruck, FaStore } from 'react-icons/fa';
import OrderConfirmationModal from '../components/OrderConfirmationModal';

const Checkout = () => {
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [customizationRequired, setCustomizationRequired] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [orderData, setOrderData] = useState({
    shippingAddress: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    notes: '',
    deliveryDate: '',
    customizationRequired: false,
    customizationDetails: ''
  });
  const [shippingFee, setShippingFee] = useState(0);
  const { cart, productCart, getCartTotal } = useCart();
  const paymentMethod = 'razorpay'; // Only Razorpay is supported
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const hasOnlyProducts = cart.every(item => item.type === 'product');
  // Remove hasOnlyCourses since courses are no longer supported
  // const hasOnlyCourses = cart.every(item => item.type === 'course');

  useEffect(() => {
    calculateShippingFee();
  }, [cart, deliveryMethod]);

  const calculateShippingFee = () => {
    const total = getCartTotal();
    if (total < 1000) {
      setShippingFee(0);
    } else {
      setShippingFee(deliveryMethod === 'delivery' ? 200 : 0);
    }
  };

  const handleDeliveryMethodChange = (method) => {
    setDeliveryMethod(method);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: value
    }));
  };



  const handleOrder = async () => {
    // Show confirmation modal instead of directly placing order
    setShowConfirmationModal(true);
  };

  const confirmOrder = async () => {
    try {
      // Check if cart has only products (cakes)
      const hasOnlyProducts = cart.every(item => item.type === 'product');

      if (!hasOnlyProducts) {
        toast.error('Cart contains items that cannot be ordered. Only products (cakes) are supported.');
        return;
      }

      // Prepare order data
      const finalOrderData = {
        items: cart.map(item => {
          const mappedItem = { ...item };
          if (item.type === 'product') {
            mappedItem.product = item.id;
          }
          return mappedItem;
        }),
        totalAmount: getCartTotal() + shippingFee,
        deliveryMethod,
        shippingAddress: deliveryMethod === 'delivery' ? {
          address: orderData.shippingAddress,
          city: orderData.city,
          state: orderData.state,
          zipCode: orderData.zipCode,
          phone: orderData.phone
        } : null,
        notes: orderData.notes,
        shippingFee,
        deliveryDate: orderData.deliveryDate,
        customizationRequired: orderData.customizationRequired,
        customizationDetails: orderData.customizationRequired ? orderData.customizationDetails : '',
        paymentMethod
      };

      // Create order with pending_approval status (no immediate payment)
      const orderResponse = await axios.post('/api/orders', finalOrderData);

      clearCart();
      toast.success('Order request sent successfully! Our baker will review your order and notify you once it\'s approved.');
      navigate('/orders');
    } catch (error) {
      toast.error('Something went wrong while placing your order.');
      console.error(error);
    }
  };



  return (
    <div className="checkout-page container py-5">
      <h2 className="text-center mb-4">Checkout</h2>

      <div className="row">
          <div className="col-lg-8">
            {hasOnlyProducts && (
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Delivery Method</h5>
                </div>
                <div className="card-body">
                  <div className="alert alert-info mb-4">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Important:</strong> For orders below ₹1000, you must pick up your cakes from our shop.
                    For orders of ₹1000 or more, you can choose pickup or delivery (₹200 shipping fee).
                  </div>

                  <div className="d-flex gap-3 mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="pickup"
                        name="deliveryMethod"
                        value="pickup"
                        checked={deliveryMethod === 'pickup'}
                        onChange={() => handleDeliveryMethodChange('pickup')}
                      />
                      <label className="form-check-label" htmlFor="pickup">
                        <FaStore className="me-2" />
                        Store Pickup
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="delivery"
                        name="deliveryMethod"
                        value="delivery"
                        checked={deliveryMethod === 'delivery'}
                        onChange={() => handleDeliveryMethodChange('delivery')}
                        disabled={getCartTotal() < 1000}
                      />
                      <label className="form-check-label" htmlFor="delivery">
                        <FaTruck className="me-2" />
                        Home Delivery {getCartTotal() >= 1000 && <span className="text-muted">(₹200)</span>}
                      </label>
                      {getCartTotal() < 1000 && (
                        <small className="form-text text-muted d-block">Available for orders of ₹1000 or more</small>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {deliveryMethod === 'pickup' && hasOnlyProducts && (
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Pickup Address</h5>
                </div>
                <div className="card-body">
                  <div className="alert alert-info">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    <strong>Pickup Location:</strong><br />
                    Harsh Cake Zone<br />
                    D-101, Skybell Apartment<br />
                    Opp. Crystal Internation Public School<br />
                    Vastral, Ahmedabad - 382418
                  </div>
                </div>
              </div>
            )}

            {deliveryMethod === 'delivery' && hasOnlyProducts && (
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Delivery Address</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <textarea
                      className="form-control"
                      name="shippingAddress"
                      value={orderData.shippingAddress}
                      onChange={handleInputChange}
                      rows="3"
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        name="city"
                        value={orderData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-control"
                        name="state"
                        value={orderData.state}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Zip Code</label>
                      <input
                        type="text"
                        className="form-control"
                        name="zipCode"
                        value={orderData.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={orderData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Order Notes (Optional)</label>
                    <textarea
                      className="form-control"
                      name="notes"
                      value={orderData.notes}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>
                </div>
              </div>
            )}
            


            {hasOnlyProducts && (
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Delivery & Customization</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Delivery Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      name="deliveryDate"
                      value={orderData.deliveryDate}
                      onChange={handleInputChange}
                      min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      max={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      required
                    />
                    <small className="form-text text-muted">
                      Orders can be scheduled from tomorrow up to 2 months in advance.
                    </small>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="customizationRequired"
                        name="customizationRequired"
                        checked={orderData.customizationRequired}
                        onChange={(e) => setOrderData(prev => ({
                          ...prev,
                          customizationRequired: e.target.checked
                        }))}
                      />
                      <label className="form-check-label" htmlFor="customizationRequired">
                        I need customization for this order
                      </label>
                    </div>
                  </div>

                  {orderData.customizationRequired && (
                    <div className="mb-3">
                      <label className="form-label">Customization Details</label>
                      <textarea
                        className="form-control"
                        name="customizationDetails"
                        value={orderData.customizationDetails}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Please describe your customization requirements..."
                        required
                      />
                      <small className="form-text text-muted">
                        Just describe your customization theme or request. After accepting your order, a chat option will appear where you can chat with your baker and share images of your desire.
                      </small>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Order Summary</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={`${item.type}-${item.id}`}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="me-2 rounded"
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
                                }}
                              />
                              <span>{item.name}</span>
                            </div>
                          </td>
                          <td>₹{item.price}</td>
                          <td>{item.quantity}</td>
                          <td>₹{item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="d-flex justify-content-between mt-3 pt-3 border-top">
                  <div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span>₹{getCartTotal()}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Shipping:</span>
                      <span>{shippingFee > 0 ? `₹${shippingFee}` : 'Free'}</span>
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between">
                      <strong>Total:</strong>
                      <strong className="price-text">₹{getCartTotal() + shippingFee}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Complete Order</h5>
              </div>
              <div className="card-body">
                <button
                  className="btn btn-outline-secondary w-100 mb-2"
                  onClick={() => navigate('/cart')}
                >
                  Back to Cart
                </button>
                <button
                  className="btn bakery-btn-primary w-100 mb-3"
                  onClick={handleOrder}
                >
                  Place Order
                </button>

                <div className="alert alert-info small">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Important:</strong> Cakes must be picked up from our store.
                  For orders of ₹1000 or more, delivery option is available with a ₹200 shipping fee.
                </div>
              </div>
            </div>
          </div>
        </div>
      
    
    
      {/* Add checkout form or summary UI here */}
      
      {/* Order Confirmation Modal */}
      <OrderConfirmationModal 
        show={showConfirmationModal}
        onHide={() => setShowConfirmationModal(false)}
        onConfirm={confirmOrder}
      />
    </div>
  );
};

export default Checkout;
