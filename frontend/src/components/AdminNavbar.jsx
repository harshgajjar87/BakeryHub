import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaTachometerAlt, FaBox, FaGraduationCap, FaShoppingCart, FaUsers, FaBell, FaComments, FaFileInvoice } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const adminMenuItems = [
    { path: '/admin', icon: FaTachometerAlt, label: 'Dashboard' },
    { path: '/admin/products', icon: FaBox, label: 'Products' },
    { path: '/admin/courses', icon: FaGraduationCap, label: 'Courses' },
    { path: '/admin/orders', icon: FaShoppingCart, label: 'Orders' },
    { path: '/admin/invoices', icon: FaFileInvoice, label: 'Invoices' },
    { path: '/admin/users', icon: FaUsers, label: 'Users' },
    { path: '/admin/notifications', icon: FaBell, label: 'Notifications' },
    { path: '/admin/chats', icon: FaComments, label: 'Chats' },
  ];

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
        <div className="container">
          {/* Logo */}
          <Link className="navbar-brand text-white fw-bold fs-4" to="/admin" onClick={closeMenu}>
            🍰 Admin Panel
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleMenu}
            aria-controls="navbarNav"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
          >
            {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>

          {/* Desktop menu */}
          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav me-auto">
              {adminMenuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li className="nav-item" key={item.path}>
                    <Link className="nav-link text-white d-flex align-items-center" to={item.path} onClick={closeMenu}>
                      <IconComponent className="me-2" size={16} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Right side items */}
            <ul className="navbar-nav">
              {/* User menu */}
              {user ? (
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle text-white d-flex align-items-center"
                    href="#"
                    id="userDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <FaUser className="me-1" />
                    {user.name} (Admin)
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><Link className="dropdown-item" to="/profile" onClick={closeMenu}>Profile</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item text-danger" onClick={handleLogoutClick}>Logout</button></li>
                  </ul>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </nav>

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
    </>
  );
};

export default AdminNavbar;
