import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { FaHeart } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ products: 0, courses: 0, customers: 0 });

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const [productsRes, coursesRes] = await Promise.all([
          axios.get('/api/products?page=1&limit=4'),
          axios.get('/api/courses?page=1&limit=4')
        ]);

        setFeaturedProducts(productsRes.data.products);
        setFeaturedCourses(coursesRes.data.courses);

        // Mock stats - in real app, fetch from API
        setStats({
          products: productsRes.data.total || 50,
          courses: coursesRes.data.total || 25,
          customers: 1000
        });
      } catch (error) {
        console.error('Error fetching featured items:', error);
        toast.error('Failed to load featured items');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="loading-spinner mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section text-center text-white">
        <div className="container">
          <h1 className="display-4 fw-bold mb-4">
            Welcome to Our Bakery Platform
          </h1>
          <p className="lead mb-4">
            Discover delicious bakery products and learn professional baking skills
            with our comprehensive courses. Fresh, authentic, and made with love.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/shop" className="btn bakery-btn-primary btn-lg">
              <i className="fas fa-shopping-cart me-2"></i>
              Shop Now
            </Link>
            <Link to="/courses" className="btn btn-outline-light btn-lg">
              <i className="fas fa-graduation-cap me-2"></i>
              Explore Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row text-center">
            <div className="col-lg-4 col-md-4 mb-4">
              <div className="stat-item">
                <i className="fas fa-birthday-cake fs-1 bakery-text-gold mb-3"></i>
                <h3 className="bakery-text-brown fw-bold">{stats.products}+</h3>
                <p className="text-muted">Fresh Products</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-4 mb-4">
              <div className="stat-item">
                <i className="fas fa-users fs-1 bakery-text-gold mb-3"></i>
                <h3 className="bakery-text-brown fw-bold">{stats.customers}+</h3>
                <p className="text-muted">Happy Customers</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-4 mb-4">
              <div className="stat-item">
                <i className="fas fa-book-open fs-1 bakery-text-gold mb-3"></i>
                <h3 className="bakery-text-brown fw-bold">{stats.courses}+</h3>
                <p className="text-muted">Expert Courses</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-5">
        <div className="container">
          <div className="row mb-4">
            <div className="col-12 text-center">
              <h2 className="bakery-text-brown fw-bold">Featured Products</h2>
              <p className="text-muted">Fresh baked goods made with premium ingredients</p>
            </div>
          </div>

          <div className="row">
            {featuredProducts.map((product) => (
              <div key={product._id} className="col-lg-3 col-md-6 mb-4">
                <div className="card product-card h-100">
                  <div className="position-relative">
                    <img
                      src={product.image}
                      className="card-img-top"
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                    <div className="position-absolute top-0 end-0 m-2">
                      <span className="badge bg-warning text-dark">
                        <i className="fas fa-star"></i> Featured
                      </span>
                    </div>
                    {isAuthenticated && (
                      <button
                        className={`btn position-absolute top-0 start-0 m-2 ${isInWishlist(product._id) ? 'btn-danger' : 'btn-outline-danger'} btn-sm`}
                        onClick={() => isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product._id)}
                        disabled={wishlistLoading}
                        title={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <FaHeart className={isInWishlist(product._id) ? 'text-white' : ''} />
                      </button>
                    )}
                  </div>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text text-muted flex-grow-1">
                      {product.description.substring(0, 100)}...
                    </p>
                    <div className="d-flex gap-1 mt-auto">
                      <span className="price-text me-auto">₹{product.price}</span>
                      <Link
                        to={`/shop/${product._id}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        <i className="fas fa-eye me-1"></i>
                        View
                      </Link>
                      <button
                        className="btn bakery-btn-primary btn-sm"
                        onClick={() => {
                          if (!isAuthenticated) {
                            toast.error('Please login to add items to cart');
                            navigate('/login');
                            return;
                          }
                          addToCart({
                            id: product._id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                            type: 'product',
                            quantity: 1
                          });
                          toast.success(`${product.name} added to cart!`);
                        }}
                        disabled={!product.isAvailable || product.stock === 0}
                      >
                        <i className="fas fa-shopping-cart me-1"></i>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-4">
            <Link to="/shop" className="btn bakery-btn-outline">
              <i className="fas fa-arrow-right me-2"></i>
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row mb-4">
            <div className="col-12 text-center">
              <h2 className="bakery-text-brown fw-bold">Popular Courses</h2>
              <p className="text-muted">Learn from professional bakers and master your skills</p>
            </div>
          </div>

          <div className="row">
            {featuredCourses.map((course) => (
              <div key={course._id} className="col-lg-3 col-md-6 mb-4">
                <div className="card course-card h-100">
                  <div className="position-relative">
                    <img
                      src={course.thumbnail}
                      className="card-img-top"
                      alt={course.title}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                    <div className="position-absolute top-0 end-0 m-2">
                      <span className="badge bg-success">
                        <i className="fas fa-play-circle"></i> Course
                      </span>
                    </div>
                  </div>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{course.title}</h5>
                    <p className="card-text text-muted flex-grow-1">
                      {course.description.substring(0, 100)}...
                    </p>
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <span className="price-text">₹{course.price}</span>
                      <Link
                        to={`/courses/${course._id}`}
                        className="btn bakery-btn-primary btn-sm"
                      >
                        <i className="fas fa-graduation-cap me-1"></i>
                        Learn
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-4">
            <Link to="/courses" className="btn bakery-btn-outline">
              <i className="fas fa-arrow-right me-2"></i>
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-5">
        <div className="container">
          <div className="row mb-5">
            <div className="col-12 text-center">
              <h2 className="bakery-text-brown fw-bold">Why Choose Us?</h2>
              <p className="text-muted">Experience the difference with our premium bakery services</p>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="text-center h-100">
                <div className="feature-icon mb-3">
                  <i className="fas fa-crown fs-1 bakery-text-gold"></i>
                </div>
                <h5 className="bakery-text-brown fw-bold">Premium Quality</h5>
                <p className="text-muted">
                  We use only the finest ingredients and traditional baking methods
                  to ensure every product meets our high standards.
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="text-center h-100">
                <div className="feature-icon mb-3">
                  <i className="fas fa-chalkboard-teacher fs-1 bakery-text-gold"></i>
                </div>
                <h5 className="bakery-text-brown fw-bold">Expert Instruction</h5>
                <p className="text-muted">
                  Learn from professional bakers with years of experience.
                  Our courses cover everything from basics to advanced techniques.
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="text-center h-100">
                <div className="feature-icon mb-3">
                  <i className="fas fa-shipping-fast fs-1 bakery-text-gold"></i>
                </div>
                <h5 className="bakery-text-brown fw-bold">Fast Delivery</h5>
                <p className="text-muted">
                  Quick and reliable delivery service. Your orders are carefully
                  packaged to arrive fresh and in perfect condition.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-5 bg-gradient">
        <div className="container text-center">
          <h2 className="bakery-text-brown fw-bold mb-3">Ready to Get Started?</h2>
          <p className="text-muted mb-4">Join thousands of satisfied customers and start your baking journey today</p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/register" className="btn bakery-btn-primary btn-lg">
              <i className="fas fa-user-plus me-2"></i>
              Join Now
            </Link>
            <Link to="/contact" className="btn bakery-btn-outline btn-lg">
              <i className="fas fa-envelope me-2"></i>
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
