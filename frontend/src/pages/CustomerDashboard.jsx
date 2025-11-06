import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingBag, FaBox, FaHeart, FaUser, FaClock, FaEye, FaShoppingCart } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import axios from '../utils/axios';
import CoursePurchaseForm from '../components/CoursePurchaseForm';

const CustomerDashboard = () => {
  const { user, token, isAuthenticated } = useAuth();
  const { cart, addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);

  useEffect(() => {
    // Don't fetch data if user is not authenticated
    console.log('CustomerDashboard: user', user ? 'exists' : 'missing', ', token', token ? 'exists' : 'missing');
    if (!user || !token) {
      setLoading(false);
      setProductsLoading(false);
      setCoursesLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        // Fetch recent orders
        console.log('Making request with default axios headers');
        console.log('Current default headers:', axios.defaults.headers.common);
        const ordersResponse = await axios.get('/api/orders/user?limit=5');
        setRecentOrders(ordersResponse.data.orders);

        // Fetch all products
        const productsResponse = await axios.get('/api/products?limit=100');
        setProducts(productsResponse.data.products);

        // Fetch all courses
        const coursesResponse = await axios.get('/api/courses?limit=100');
        setCourses(coursesResponse.data.courses);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
          console.error('Response headers:', error.response.headers);
        }
        if (error.response && error.response.status === 403) {
          console.error('Authentication error: Token might be invalid or expired');
          // Redirect to login page
          navigate('/login');
        }
      } finally {
        setLoading(false);
        setProductsLoading(false);
        setCoursesLoading(false);
      }
    };

    fetchData();
  }, [user, token]);

  const handleAddToCart = (item, type) => {
    addToCart({
      id: item._id,
      name: item.name || item.title,
      price: item.price,
      image: item.image || item.thumbnail,
      type: type,
      quantity: 1
    });
  };

  const groupByCategory = (items, categoryKey) => {
    return items.reduce((acc, item) => {
      const category = item[categoryKey];
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  };

  const productsByCategory = groupByCategory(products, 'category');
  const coursesByType = groupByCategory(courses, 'type');

  return (
    <div className="container py-4">
      <h1 className="mb-4">Welcome, {user?.name}!</h1>

      {/* Products Section */}
      <div className="mb-5">
        <h2 className="mb-4 bakery-text-brown fw-bold">Our Bakery Products</h2>
        {productsLoading ? (
          <div className="text-center py-3">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading products...</span>
            </div>
          </div>
        ) : (
          Object.keys(productsByCategory).map(category => (
            <div key={category} className="mb-4">
              <h3 className="mb-3 text-capitalize bakery-text-brown">{category}</h3>
              <div className="row">
                {productsByCategory[category].slice(0, 4).map(product => (
                  <div key={product._id} className="col-lg-3 col-md-6 mb-4">
                    <div className="card product-card h-100 shadow-sm">
                      <img
                        src={product.image}
                        className="card-img-top"
                        alt={product.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                      <div className="card-body d-flex flex-column">
                        <h6 className="card-title">{product.name}</h6>
                        <p className="card-text text-muted small flex-grow-1">
                          {product.description.substring(0, 60)}...
                        </p>
                        <div className="mt-auto">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="price-text fw-bold">₹{product.price}</span>
                            <div className="d-flex align-items-center gap-2">
                              {product.stock > 0 && (
                                <small className="text-success">In Stock</small>
                              )}
                              {isAuthenticated && (
                                <button
                                  className={`btn btn-sm ${isInWishlist(product._id) ? 'btn-danger' : 'btn-outline-danger'} p-1`}
                                  onClick={() => isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product._id)}
                                  disabled={wishlistLoading}
                                  title={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                                >
                                  <FaHeart size={14} className={isInWishlist(product._id) ? 'text-white' : ''} />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="d-flex gap-1">
                            <Link
                              to={`/shop/${product._id}`}
                              className="btn btn-outline-primary btn-sm flex-fill"
                            >
                              <FaEye className="me-1" />
                              View
                            </Link>
                            <button
                              className="btn bakery-btn-primary btn-sm flex-fill"
                              onClick={() => handleAddToCart(product, 'product')}
                              disabled={!product.isAvailable || product.stock === 0}
                            >
                              <FaShoppingCart className="me-1" />
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {productsByCategory[category].length > 4 && (
                <div className="text-center">
                  <Link to="/shop" className="btn btn-outline-primary">
                    View All {category}
                  </Link>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Courses Section */}
      <div className="mb-5">
        <h2 className="mb-4 bakery-text-brown fw-bold">Our Baking Courses</h2>
        {coursesLoading ? (
          <div className="text-center py-3">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading courses...</span>
            </div>
          </div>
        ) : (
          Object.keys(coursesByType).map(type => (
            <div key={type} className="mb-4">
              <h3 className="mb-3 text-capitalize bakery-text-brown">{type} Courses</h3>
              <div className="row">
                {coursesByType[type].slice(0, 4).map(course => (
                  <div key={course._id} className="col-lg-3 col-md-6 mb-4">
                    <div className="card course-card h-100 shadow-sm">
                      <img
                        src={course.thumbnail}
                        className="card-img-top"
                        alt={course.title}
                        style={{ height: '200px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                      <div className="card-body d-flex flex-column">
                        <h6 className="card-title">{course.title}</h6>
                        <p className="card-text text-muted small flex-grow-1">
                          {course.description.substring(0, 60)}...
                        </p>
                        <div className="mt-auto">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="price-text fw-bold">₹{course.price}</span>
                            <small className="text-muted">{course.content.duration}</small>
                          </div>
                          <div className="d-flex gap-1">
                            {user?.purchasedCourses?.some(p => p.course.toString() === course._id.toString()) ? (
                              <Link
                                to={`/courses/${course._id}`}
                                className="btn bakery-btn-primary btn-sm w-100"
                              >
                                Get Started
                              </Link>
                            ) : (
                              <>
                                <Link
                                  to={`/courses/${course._id}`}
                                  className="btn btn-outline-primary btn-sm flex-fill"
                                >
                                  <FaEye className="me-1" />
                                  View
                                </Link>
                                <button
                                  className="btn bakery-btn-primary btn-sm flex-fill"
                                  onClick={() => {
                                    setSelectedCourse(course);
                                    setShowPurchaseForm(true);
                                  }}
                                >
                                  Buy
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {coursesByType[type].length > 4 && (
                <div className="text-center">
                  <Link to="/courses" className="btn btn-outline-primary">
                    View All {type} Courses
                  </Link>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Recent Orders Section */}
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Recent Orders</h5>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-3">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order._id}>
                      <td>{order._id}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>{order.items.length}</td>
                      <td>Rs.{order.totalAmount.toFixed(2)}</td>
                      <td>
                        <span className={`badge bg-${order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'primary'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/orders/${order._id}`} className="btn btn-sm btn-outline-primary">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-3">
              <p>You haven't placed any orders yet.</p>
              <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
            </div>
          )}
        </div>
      </div>

      {/* Course Purchase Form Modal */}
      {showPurchaseForm && selectedCourse && (
        <CoursePurchaseForm
          course={selectedCourse}
          onClose={() => {
            setShowPurchaseForm(false);
            setSelectedCourse(null);
          }}
          onSuccess={(order) => {
            setShowPurchaseForm(false);
            setSelectedCourse(null);
            navigate(`/orders/${order._id}`);
          }}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
