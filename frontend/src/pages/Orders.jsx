import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, pagination.currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/orders/user?page=${pagination.currentPage}&limit=10`);
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}/download-invoice`, {
        responseType: 'blob' // Important for handling binary data
      });

      // Create a blob URL and trigger download
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
      case 'delivered': return 'bg-success';
      case 'ready_for_delivery': return 'bg-info';
      case 'in_progress': return 'bg-warning';
      case 'paid': return 'bg-primary';
      case 'payment_pending': return 'bg-warning';
      case 'customization_pending': return 'bg-info';
      case 'approved': return 'bg-success';
      case 'pending_approval': return 'bg-secondary';
      case 'cancelled': return 'bg-danger';
      case 'rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getOrderItemsSummary = (items) => {
    const productCount = items.filter(item => item.type === 'product').length;
    const courseCount = items.filter(item => item.type === 'course').length;

    const parts = [];
    if (productCount > 0) {
      parts.push(`${productCount} product${productCount > 1 ? 's' : ''}`);
    }
    if (courseCount > 0) {
      parts.push(`${courseCount} course${courseCount > 1 ? 's' : ''}`);
    }

    return parts.join(', ');
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
        <div className="col-12">
          <h1>My Orders</h1>
          <p className="text-muted">Track and manage your bakery orders</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="row">
          <div className="col-12">
            <div className="text-center py-5">
              <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
              <h4 className="text-muted">No orders yet</h4>
              <p className="text-muted">When you place your first order, it will appear here.</p>
              <button
                className="btn btn-primary mt-3"
                onClick={() => navigate('/shop')}
              >
                Start Shopping
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Orders Table */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order._id}>
                            <td>
                              <strong>#{order._id.slice(-8)}</strong>
                            </td>
                            <td>{formatDate(order.createdAt)}</td>
                            <td>
                              <small className="text-muted">
                                {getOrderItemsSummary(order.items)}
                              </small>
                            </td>
                            <td>
                              <strong>{formatCurrency(order.totalAmount)}</strong>
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                                {order.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => navigate(`/orders/${order._id}`)}
                                >
                                  <i className="fas fa-eye me-1"></i>
                                  View Details
                                </button>
                                {(order.status === 'paid' || order.status === 'in_progress' || order.status === 'ready_for_delivery' || order.status === 'delivered' || order.status === 'completed') && (
                                  <button
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => handleDownloadInvoice(order._id)}
                                  >
                                    <i className="fas fa-download me-1"></i>
                                    Download Bill
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="row mt-4">
              <div className="col-12">
                <nav>
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${!pagination.hasPrev ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrev}
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(pagination.totalPages)].map((_, index) => (
                      <li key={index} className={`page-item ${pagination.currentPage === index + 1 ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(index + 1)}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${!pagination.hasNext ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNext}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
                <p className="text-center text-muted mt-2">
                  Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalOrders} total orders)
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;
