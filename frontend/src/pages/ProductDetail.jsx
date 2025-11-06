import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { FaArrowLeft, FaShoppingCart, FaStar, FaWeight, FaHeart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, checkoutInProgress } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
        // Redirect to shop page if product not found
        if (error.response?.status === 404) {
          navigate('/shop');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate, checkoutInProgress]);

  const handleQuantityChange = (newQuantity) => {
    setQuantity(Math.max(1, Math.min(product.stock, newQuantity)));
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (!product.isAvailable || product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    setAddingToCart(true);

    try {
      // Check for pending payments for this product
      const response = await axios.get('/api/orders/check-pending-payments', {
        params: { productIds: product._id }
      });

      if (response.data.hasPendingPayments) {
        const pendingProduct = response.data.pendingProducts[0];
        toast.error(`You have a pending payment for this product. Please complete your payment first.`);
        navigate(`/orders/${pendingProduct.orderId}`);
        return;
      }

      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        type: 'product',
        quantity: quantity
      });

      toast.success(`${quantity} x ${product.name} added to cart!`);
      setQuantity(1); // Reset quantity after adding
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    if (isInWishlist(product._id)) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="loading-spinner mx-auto"></div>
        <p className="mt-3">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <h3>Product not found</h3>
        <Link to="/shop" className="btn bakery-btn-primary mt-3">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <Link to="/shop" className="btn btn-outline-secondary mb-4 d-inline-flex align-items-center">
        <FaArrowLeft className="me-2" /> Back to Shop
      </Link>
      
      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card border-0 shadow-sm">
            <img
              src={product.image}
              className="card-img-top product-detail-image"
              alt={product.name}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x600?text=No+Image';
              }}
            />
          </div>
        </div>
        
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h2 className="card-title bakery-text-brown fw-bold mb-3">{product.name}</h2>
              
              <div className="d-flex align-items-center mb-3">
                <div className="me-3">
                  <span className="h4 price-text mb-0 d-block">₹{product.price}</span>
                </div>
                <div className="me-3">
                  <span className={`badge ${product.isAvailable ? 'bg-success' : 'bg-danger'}`}>
                    {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                {product.stock > 0 && (
                  <div>
                    <small className="text-muted">Available: {product.stock} units</small>
                  </div>
                )}
              </div>
              
              <div className="mb-3">
                <span className="badge bg-light text-dark me-2">{product.category}</span>
                {product.weight && (
                  <span className="text-muted me-2">
                    <FaWeight className="me-1" />
                    {product.weight}
                  </span>
                )}
                {isAuthenticated && (
                  <button
                    className={`btn btn-sm ms-2 ${isInWishlist(product._id) ? 'btn-danger' : 'btn-outline-danger'}`}
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    title={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <FaHeart className={isInWishlist(product._id) ? 'text-white' : ''} />
                  </button>
                )}
              </div>
              
              <div className="mb-4">
                <h5>Description</h5>
                <p className="text-muted">{product.description}</p>
              </div>
              
              {product.isAvailable && product.stock > 0 && (
                <div className="mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <label className="form-label me-3 fw-bold">Quantity:</label>
                    <div className="input-group" style={{ width: '150px' }}>
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="form-control text-center"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                        min="1"
                        max={product.stock}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= product.stock}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <button
                    className="btn bakery-btn-primary w-100 py-2"
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                  >
                    {addingToCart ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Adding...
                      </>
                    ) : (
                      <>
                        <FaShoppingCart className="me-2" />
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              )}
              
              <div className="mt-4 pt-3 border-top">
                <small className="text-muted d-block mb-2">
                  Product ID: {product._id}
                </small>
                <small className="text-muted d-block">
                  Added on: {new Date(product.createdAt).toLocaleDateString()}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mt-5">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h4 className="bakery-text-brown fw-bold mb-3">Product Details</h4>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <h6>Category</h6>
                  <p className="text-capitalize">{product.category}</p>
                </div>
                {product.weight && (
                  <div className="col-md-6 mb-3">
                    <h6>Weight</h6>
                    <p>{product.weight}</p>
                  </div>
                )}
                <div className="col-md-6 mb-3">
                  <h6>Availability</h6>
                  <p>{product.isAvailable ? 'In Stock' : 'Out of Stock'}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <h6>Stock Quantity</h6>
                  <p>{product.stock} units</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
