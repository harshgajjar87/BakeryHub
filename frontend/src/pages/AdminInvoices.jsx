import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { toast } from 'sonner';
import AdminLayout from '../components/AdminLayout';

const AdminInvoices = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, typeFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        status: statusFilter,
        type: typeFilter
      });

      const response = await axios.get(`/api/orders?${params}`);
      setOrders(response.data.orders);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchOrders();
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`/api/orders/search?q=${encodeURIComponent(searchTerm)}`);
      setOrders(response.data.orders);
      setTotalPages(1);
    } catch (error) {
      console.error('Error searching orders:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}/download-invoice`, {
        responseType: 'blob'
      });

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

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
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
      case 'completed': return 'bg-success';
      case 'delivered': return 'bg-success';
      case 'ready_for_delivery': return 'bg-info';
      case 'in_progress': return 'bg-warning';
      case 'paid': return 'bg-primary';
      case 'approved': return 'bg-success';
      case 'pending_approval': return 'bg-secondary';
      case 'cancelled': return 'bg-danger';
      case 'rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  return (
    
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Invoices & Receipts</h2>
        </div>

        {/* Filters */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by Order ID, Customer Name, Email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button className="btn btn-outline-primary" onClick={handleSearch}>
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="in_progress">In Progress</option>
                  <option value="ready_for_delivery">Ready for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="product">Products</option>
                  <option value="course">Courses</option>
                </select>
              </div>
              <div className="col-md-2">
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                    setCurrentPage(1);
                    fetchOrders();
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card">
          <div className="card-body">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-5">
                <h5>No orders found</h5>
                <p className="text-muted">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            <span className="fw-bold">#{order._id.slice(-8)}</span>
                          </td>
                          <td>
                            <div>
                              <div className="fw-bold">{order.user?.name}</div>
                              <small className="text-muted">{order.user?.email}</small>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${order.isCoursePurchase ? 'bg-info' : 'bg-primary'}`}>
                              {order.isCoursePurchase ? 'Course' : 'Product'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                              {order.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="fw-bold">{formatCurrency(order.totalAmount)}</td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => viewOrderDetails(order)}
                                title="View Details"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              {(order.status === 'paid' || order.status === 'in_progress' ||
                                order.status === 'ready_for_delivery' || order.status === 'delivered' ||
                                order.status === 'completed') && (
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => handleDownloadInvoice(order._id)}
                                  title="Download Invoice"
                                >
                                  <i className="fas fa-download"></i>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav aria-label="Orders pagination" className="mt-4">
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
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
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
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

        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Order Details - #{selectedOrder._id.slice(-8)}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <h6>Customer Information</h6>
                      <p><strong>Name:</strong> {selectedOrder.user?.name}</p>
                      <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                      {selectedOrder.shippingAddress && (
                        <>
                          <p><strong>Address:</strong> {selectedOrder.shippingAddress.address}</p>
                          <p><strong>Phone:</strong> {selectedOrder.shippingAddress.phone}</p>
                        </>
                      )}
                    </div>
                    <div className="col-md-6">
                      <h6>Order Information</h6>
                      <p><strong>Status:</strong>
                        <span className={`badge ${getStatusBadgeClass(selectedOrder.status)} ms-2`}>
                          {selectedOrder.status.replace(/_/g, ' ')}
                        </span>
                      </p>
                      <p><strong>Total:</strong> {formatCurrency(selectedOrder.totalAmount)}</p>
                      <p><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                      <p><strong>Type:</strong> {selectedOrder.isCoursePurchase ? 'Course Purchase' : 'Product Order'}</p>
                    </div>
                  </div>

                  <h6>Items</h6>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item, index) => (
                          <tr key={index}>
                            <td>
                              {item.type === 'product'
                                ? (item.product?.name || 'Product')
                                : (item.course?.title || 'Course')
                              }
                            </td>
                            <td>{item.quantity}</td>
                            <td>{formatCurrency(item.price)}</td>
                            <td>{formatCurrency(item.quantity * item.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {selectedOrder.notes && (
                    <div className="mt-3">
                      <h6>Notes</h6>
                      <p>{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  {(selectedOrder.status === 'paid' || selectedOrder.status === 'in_progress' ||
                    selectedOrder.status === 'ready_for_delivery' || selectedOrder.status === 'delivered' ||
                    selectedOrder.status === 'completed') && (
                    <button
                      className="btn btn-success"
                      onClick={() => handleDownloadInvoice(selectedOrder._id)}
                    >
                      <i className="fas fa-download me-2"></i>
                      Download Invoice
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

  );
};

export default AdminInvoices;
