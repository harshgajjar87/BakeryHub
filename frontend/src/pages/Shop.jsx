import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { FaHeart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [quantities, setQuantities] = useState({});

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();

  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (category !== 'all') params.append('category', category);
        if (search) params.append('search', search);
        params.append('page', page);

        const response = await axios.get(`/api/products?${params}`);
        setProducts(response.data.products);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          total: response.data.total
        });
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, search, page]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/products/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (newCategory) => {
    const params = new URLSearchParams(searchParams);
    if (newCategory === 'all') {
      params.delete('category');
    } else {
      params.set('category', newCategory);
    }
    params.delete('page'); // Reset to page 1
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = e.target.search.value.trim();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    params.delete('page'); // Reset to page 1
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
  };

  const handleQuantityChange = (productId, quantity) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, quantity)
    }));
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    const quantity = quantities[product._id] || 1;
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      type: 'product',
      quantity: quantity
    });
    toast.success(`${quantity} x ${product.name} added to cart!`);
    // Reset quantity after adding
    setQuantities(prev => ({
      ...prev,
      [product._id]: 1
    }));
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="loading-spinner mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title bakery-text-brown fw-bold">Categories</h5>
              <div className="list-group list-group-flush">
                <button
                  className={`list-group-item list-group-item-action ${category === 'all' ? 'active' : ''}`}
                  onClick={() => handleCategoryChange('all')}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`list-group-item list-group-item-action ${category === cat ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(cat)}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-9">
          {/* Search Bar */}
          <div className="mb-4">
            <form onSubmit={handleSearch} className="d-flex">
              <input
                type="text"
                name="search"
                className="form-control me-2"
                placeholder="Search products..."
                defaultValue={search}
              />
              <button type="submit" className="btn bakery-btn-primary">
                Search
              </button>
            </form>
          </div>

          {/* Results Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="bakery-text-brown fw-bold mb-0">
              {category === 'all' ? 'All Products' : `${category.charAt(0).toUpperCase() + category.slice(1)}`}
              {search && ` - "${search}"`}
            </h2>
            <span className="text-muted">{pagination.total} products found</span>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-search fs-1 text-muted mb-3"></i>
              <h4>No products found</h4>
              <p className="text-muted">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <>
              <div className="row">
                {products.map((product) => (
                  <div key={product._id} className="col-lg-4 col-md-6 mb-4">
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
                        {isAuthenticated && (
                          <button
                            className={`btn position-absolute top-0 end-0 m-2 ${isInWishlist(product._id) ? 'btn-danger' : 'btn-outline-danger'} btn-sm`}
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
                        <div className="mt-auto">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="price-text">₹{product.price}</span>
                          </div>
                          {product.stock > 0 && (
                            <div className="mb-2">
                              <label className="form-label small fw-bold">Quantity:</label>
                              <div className="input-group input-group-sm">
                                <button
                                  className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={() => handleQuantityChange(product._id, (quantities[product._id] || 1) - 1)}
                                  disabled={(quantities[product._id] || 1) <= 1}
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  className="form-control text-center"
                                  value={quantities[product._id] || 1}
                                  onChange={(e) => handleQuantityChange(product._id, parseInt(e.target.value) || 1)}
                                  min="1"
                                  max={product.stock}
                                />
                                <button
                                  className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={() => handleQuantityChange(product._id, (quantities[product._id] || 1) + 1)}
                                  disabled={(quantities[product._id] || 1) >= product.stock}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          )}
                          <div className="d-flex gap-1">
                            <Link
                              to={`/shop/${product._id}`}
                              className="btn btn-outline-primary btn-sm flex-fill"
                            >
                              View
                            </Link>
                            <button
                              className="btn bakery-btn-primary btn-sm flex-fill"
                              onClick={() => handleAddToCart(product)}
                              disabled={!product.isAvailable || product.stock === 0}
                            >
                              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <nav aria-label="Product pagination" className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>

                    {[...Array(pagination.totalPages)].map((_, index) => (
                      <li
                        key={index + 1}
                        className={`page-item ${pagination.currentPage === index + 1 ? 'active' : ''}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(index + 1)}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
