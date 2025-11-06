import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'sonner';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Wishlist.css';

const Wishlist = () => {
  const { wishlist = [], productWishlist = [], courseWishlist = [], loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [removingItems, setRemovingItems] = useState(new Set());
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'products', 'courses'

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view your wishlist');
    }
  }, [isAuthenticated]);

  const handleRemoveFromWishlist = async (productId) => {
    setRemovingItems(prev => new Set(prev).add(productId));

    const success = await removeFromWishlist(productId);

    if (success) {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleAddToCart = async (product) => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      type: 'product',
      quantity: 1
    });

    toast.success(`${product.name} added to cart!`);
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center">
        <h3>Please login to view your wishlist</h3>
        <Link to="/login" className="btn bakery-btn-primary mt-3">
          Login
        </Link>
      </div>
    );
  }

  if (loading && (!wishlist || wishlist.length === 0)) {
    return (
      <div className="container py-5 text-center">
        <div className="loading-spinner mx-auto"></div>
        <p className="mt-3">Loading your wishlist...</p>
      </div>
    );
  }

  // Get current wishlist items based on active tab
  const getCurrentWishlistItems = () => {
    switch (activeTab) {
      case 'products':
        return productWishlist || [];
      case 'courses':
        return courseWishlist || [];
      default:
        return wishlist || [];
    }
  };

  const currentWishlistItems = getCurrentWishlistItems();

  return (
    <div className="container py-5">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center">
          <Link to="/shop" className="btn btn-outline-secondary me-3">
            <FaArrowLeft className="me-2" /> Back to Shop
          </Link>
          <h2 className="bakery-text-brown fw-bold mb-0">
            <FaHeart className="me-2 text-danger" />
            My Wishlist ({wishlist ? wishlist.length : 0})
          </h2>
        </div>
      </div>

      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All ({wishlist ? wishlist.length : 0})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products ({productWishlist ? productWishlist.length : 0})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            Courses ({courseWishlist ? courseWishlist.length : 0})
          </button>
        </li>
      </ul>

      {currentWishlistItems.length === 0 ? (
        <div className="text-center py-5">
          <FaHeart size={64} className="text-muted mb-3" />
          <h4 className="text-muted">Your wishlist is empty</h4>
          <p className="text-muted mb-4">Add products you love to your wishlist</p>
          <Link to="/shop" className="btn bakery-btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="row">
          {(currentWishlistItems || []).map((item) => (
            <div key={item.product._id} className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 shadow-sm wishlist-card">
                <div className="position-relative">
                  <Link to={`/shop/${item.product._id}`}>
                    <img
                      src={item.product.image}
                      className="card-img-top wishlist-image"
                      alt={item.product.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                      }}
                    />
                  </Link>
                  <button
                    className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2 wishlist-remove-btn"
                    onClick={() => handleRemoveFromWishlist(item.product._id)}
                    disabled={removingItems.has(item.product._id)}
                    title="Remove from wishlist"
                  >
                    {removingItems.has(item.product._id) ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      <FaTrash />
                    )}
                  </button>
                </div>

                <div className="card-body d-flex flex-column">
                  <Link to={`/shop/${item.product._id}`} className="text-decoration-none">
                    <h6 className="card-title bakery-text-brown fw-bold mb-2 text-truncate">
                      {item.product.name}
                    </h6>
                  </Link>

                  <p className="card-text text-muted small mb-2 flex-grow-1">
                    {item.product.description.length > 100
                      ? `${item.product.description.substring(0, 100)}...`
                      : item.product.description
                    }
                  </p>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="h5 price-text mb-0">₹{item.product.price}</span>
                    <span className={`badge ${item.product.isAvailable ? 'bg-success' : 'bg-danger'}`}>
                      {item.product.isAvailable ? 'Available' : 'Out of Stock'}
                    </span>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn bakery-btn-primary flex-fill"
                      onClick={() => handleAddToCart(item.product)}
                      disabled={!item.product.isAvailable}
                    >
                      <FaShoppingCart className="me-1" />
                      Add to Cart
                    </button>
                    <Link
                      to={`/shop/${item.product._id}`}
                      className="btn btn-outline-secondary"
                    >
                      View
                    </Link>
                  </div>

                  <small className="text-muted mt-2 d-block">
                    Added on: {new Date(item.addedAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
