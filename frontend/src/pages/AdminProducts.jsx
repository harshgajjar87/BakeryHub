import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    weight: '',
    isAvailable: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`/api/products?page=${currentPage}&limit=10&search=${searchTerm}`);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      weight: '',
      isAvailable: true
    });
    setImageFile(null);
    setEditingProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      weight: product.weight || '',
      isAvailable: product.isAvailable
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }
    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue < 0) {
      toast.error('Price must be a valid positive number');
      return;
    }
    if (!editingProduct && !imageFile) {
      toast.error('Product image is required');
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
           }
        });
        toast.success('Product updated successfully');
      } else {
        await axios.post('/api/products', data, {
          headers: { 'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
           }
        });
        toast.success('Product created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`/api/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
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

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <h1>Manage Products</h1>
          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="fas fa-plus me-2"></i>Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id}>
                        <td>
                          <img
                            src={product.image}
                            alt={product.name}
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            className="rounded"
                          />
                        </td>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>{formatCurrency(product.price)}</td>
                        <td>
                          <span className={`badge ${product.isAvailable ? 'bg-success' : 'bg-danger'}`}>
                            {product.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => openEditModal(product)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(product._id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-3">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(prev => prev - 1)}
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, index) => (
                      <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(index + 1)}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Description *</label>
                        <textarea
                          className="form-control"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows="3"
                          required
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Price *</label>
                        <input
                          type="number"
                          className="form-control"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Category *</label>
                        <select
                          className="form-control"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="cakes">Cakes</option>
                          <option value="cupcakes">Cupcakes</option>
                          <option value="pastries">Pastries</option>
                          <option value="cookies">Cookies</option>
                          <option value="bread">Bread</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Weight</label>
                        <input
                          type="text"
                          className="form-control"
                          name="weight"
                          value={formData.weight}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Product Image *</label>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={handleImageChange}
                          required={!editingProduct}
                        />
                      </div>
                      <div className="mb-3 form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          name="isAvailable"
                          checked={formData.isAvailable}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label">Available</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingProduct ? 'Update' : 'Create'} Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
