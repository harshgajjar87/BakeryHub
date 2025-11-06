import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCourses: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setStats(response.data.stats);
      setRecentOrders(response.data.recentOrders);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
      day: 'numeric'
    });
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
          <h1 className="mb-4">Admin Dashboard</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-2 col-sm-6 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Total Users</h5>
              <h3>{stats.totalUsers}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-2 col-sm-6 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Total Orders</h5>
              <h3>{stats.totalOrders}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-2 col-sm-6 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Revenue</h5>
              <h3>{formatCurrency(stats.totalRevenue)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <h5 className="card-title">Total Products</h5>
              <h3>{stats.totalProducts}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card bg-secondary text-white">
            <div className="card-body">
              <h5 className="card-title">Total Courses</h5>
              <h3>{stats.totalCourses}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Recent Orders</h5>
            </div>
            <div className="card-body">
              {recentOrders.length === 0 ? (
                <p className="text-muted">No recent orders found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td>#{order._id.slice(-8)}</td>
                          <td>{order.user?.name || 'N/A'}</td>
                          <td>{formatCurrency(order.totalAmount)}</td>
                          <td>
                            <span className={`badge ${
                              order.status === 'delivered' ? 'bg-success' :
                              order.status === 'shipped' ? 'bg-info' :
                              order.status === 'processing' ? 'bg-warning' :
                              order.status === 'pending' ? 'bg-secondary' :
                              'bg-danger'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td>{formatDate(order.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
