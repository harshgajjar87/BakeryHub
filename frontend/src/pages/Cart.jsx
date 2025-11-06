import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Cart = () => {
  const { cart, productCart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [bulkQuantity, setBulkQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'products', 'courses'

  const handleQuantityChange = (itemId, type, newQuantity) => {
    updateQuantity(itemId, type, newQuantity);
  };

  const handleRemoveItem = (itemId, type) => {
    removeFromCart(itemId, type);
    toast.success('Item removed from cart');
  };

  const handleClearCart = () => {
    clearCart();
    toast.success('Cart cleared');
  };

  const handleSelectItem = (itemId, type) => {
    const itemKey = `${type}-${itemId}`;
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemKey)) {
      newSelected.delete(itemKey);
    } else {
      newSelected.add(itemKey);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === cart.length) {
      setSelectedItems(new Set());
    } else {
      const allItems = new Set(cart.map(item => `${item.type}-${item.id}`));
      setSelectedItems(allItems);
    }
  };

  const handleBulkRemove = () => {
    selectedItems.forEach(itemKey => {
      const [type, id] = itemKey.split('-');
      removeFromCart(id, type);
    });
    setSelectedItems(new Set());
    toast.success(`${selectedItems.size} items removed from cart`);
  };

  const handleBulkQuantityUpdate = () => {
    selectedItems.forEach(itemKey => {
      const [type, id] = itemKey.split('-');
      updateQuantity(id, type, bulkQuantity);
    });
    toast.success(`Quantity updated for ${selectedItems.size} items`);
  };

  if (cart.length === 0) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="text-center">
              <i className="bi bi-cart-x fs-1 text-muted mb-3"></i>
              <h3 className="bakery-text-brown fw-bold">Your Cart is Empty</h3>
              <p className="text-muted mb-4">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link to="/shop" className="btn bakery-btn-primary">
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get current cart items based on active tab
  const getCurrentCartItems = () => {
    switch (activeTab) {
      case 'products':
        return productCart;
      // Remove courses tab
      // case 'courses':
      //   return courseCart;
      default:
        return cart;
    }
  };

  const currentCartItems = getCurrentCartItems();

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="bakery-text-brown fw-bold mb-0">Shopping Cart</h4>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </button>
              </div>

              {/* Tab Navigation */}
              <ul className="nav nav-tabs">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                  >
                    All ({cart.length})
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                    onClick={() => setActiveTab('products')}
                  >
                    Products ({productCart.length})
                  </button>
                </li>
                {/* Remove courses tab */}
                {/* <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'courses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('courses')}
                  >
                    Courses ({courseCart.length})
                  </button>
                </li> */}
              </ul>

              {/* Bulk Operations */}
              {cart.length > 1 && (
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="selectAll"
                        checked={selectedItems.size === cart.length}
                        onChange={handleSelectAll}
                      />
                      <label className="form-check-label small fw-bold" htmlFor="selectAll">
                        Select All ({cart.length} items)
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    {selectedItems.size > 0 && (
                      <div className="d-flex gap-2 align-items-center">
                        <div className="input-group input-group-sm" style={{ width: '120px' }}>
                          <span className="input-group-text">Qty</span>
                          <input
                            type="number"
                            className="form-control"
                            value={bulkQuantity}
                            onChange={(e) => setBulkQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            min="1"
                          />
                        </div>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={handleBulkQuantityUpdate}
                        >
                          Update Qty
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={handleBulkRemove}
                        >
                          Remove ({selectedItems.size})
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="card-body">
              {currentCartItems.map((item) => (
                <div key={`${item.type}-${item.id}`} className="row mb-3 align-items-center">
                  <div className="col-md-1">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedItems.has(`${item.type}-${item.id}`)}
                      onChange={() => handleSelectItem(item.id, item.type)}
                    />
                  </div>
                  <div className="col-md-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="img-fluid rounded"
                      style={{ maxHeight: '80px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="col-md-3">
                    <h6 className="mb-1">{item.name}</h6>
                    <small className="text-muted">
                      {item.type === 'product' ? 'Product' : 'Course'}
                    </small>
                  </div>
                  <div className="col-md-2">
                    <span className="price-text">₹{item.price}</span>
                  </div>
                  <div className="col-md-2">
                    <div className="input-group input-group-sm">
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => handleQuantityChange(item.id, item.type, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="form-control text-center"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, item.type, parseInt(e.target.value) || 1)}
                        min="1"
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => handleQuantityChange(item.id, item.type, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="col-md-2 text-end">
                    <div className="mb-2">
                      <strong>₹{item.price * item.quantity}</strong>
                    </div>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleRemoveItem(item.id, item.type)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="bakery-text-brown fw-bold mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-3">
                <span>Subtotal ({cart.length} items)</span>
                <span>₹{getCartTotal()}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Shipping</span>
                <span className="text-success">Free for pickup, ₹200 for delivery (orders ₹1000+)</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Total</strong>
                <strong className="price-text">₹{getCartTotal()}</strong>
              </div>

              {isAuthenticated ? (
                <button
                  className="btn bakery-btn-primary w-100"
                  onClick={() => {
                    // Simply navigate to checkout page without sending any requests
                    navigate('/checkout');
                  }}
                >
                  Proceed to Checkout
                </button>
              ) : (
                <div>
                  <Link to="/login" className="btn bakery-btn-primary w-100 mb-2">
                    Login to Checkout
                  </Link>
                  <small className="text-muted d-block text-center">
                    You need to be logged in to place an order
                  </small>
                </div>
              )}
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-body">
              <h6 className="card-title bakery-text-brown fw-bold">Secure Checkout</h6>
              <ul className="list-unstyled small">
                <li className="mb-2">
                  <i className="bi bi-shield-check text-success me-2"></i>
                  SSL Encrypted Payment
                </li>
                <li className="mb-2">
                  <i className="bi bi-truck text-primary me-2"></i>
                  Free Shipping on Pickup Orders, ₹200 for Delivery (Orders ₹1000+)
                </li>
                <li className="mb-0">
                  <i className="bi bi-arrow-clockwise text-info me-2"></i>
                  Easy Returns & Exchanges
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
