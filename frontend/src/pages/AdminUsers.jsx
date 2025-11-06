import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`/api/admin/users?page=${currentPage}&limit=20&search=${searchTerm}`);
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    try {
      await axios.put(`/api/admin/users/${selectedUser._id}/role`, { role: newRole });
      toast.success('User role updated successfully');
      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole('');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`/api/admin/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
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
          <h1>Manage Users</h1>
        </div>
      </div>

      {/* Search */}
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => openRoleModal(user)}
                          >
                            <i className="fas fa-user-edit"></i> Change Role
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteUser(user._id, user.name)}
                            >
                              <i className="fas fa-trash"></i> Delete
                            </button>
                          )}
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

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Change User Role</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRoleModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <p><strong>User:</strong> {selectedUser.name} ({selectedUser.email})</p>
                </div>
                <div className="mb-3">
                  <label className="form-label">New Role</label>
                  <select
                    className="form-control"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {newRole === 'admin' && (
                  <div className="alert alert-warning">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Granting admin privileges gives this user full access to the admin panel.
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRoleModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleRoleChange}
                  disabled={newRole === selectedUser.role}
                >
                  Update Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
