import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import AdminNavbar from './AdminNavbar';
import Footer from './Footer';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="admin-layout">
      <AdminNavbar />
      {/* Main Content */}
      <div className="admin-main">
        <div className="container-fluid py-4">
          {children}
        </div>
      </div>
      <Footer />

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Logout</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cancelLogout}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to logout from the admin panel?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelLogout}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmLogout}
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .admin-main {
          margin-top: 76px;
          min-height: calc(100vh - 76px - 60px);
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
