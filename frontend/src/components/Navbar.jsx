import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaBell, FaHeart } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import NotificationDropdown from './NotificationDropdown';
import '../utils/axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
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

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container">
          {/* Logo */}
          <Link className="navbar-brand bakery-text-brown fw-bold fs-4" to="/" onClick={closeMenu}>
            🍰 BakeryHub
          </Link>

          {/* Mobile menu toggle */}
          <div className="d-flex align-items-center d-lg-none">
            {/* Notification dropdown for mobile */}
            {user && <NotificationDropdown />}

            {/* Cart icon for mobile */}
            <Link to="/cart" className="btn btn-link position-relative me-2" onClick={closeMenu}>
              <FaShoppingCart size={20} />
              {cart && cart.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              className="btn btn-link"
              onClick={toggleMenu}
              aria-label="Toggle navigation"
            >
              {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>

          {/* Desktop menu */}
          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/" onClick={closeMenu}>Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/about" onClick={closeMenu}>About</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/shop" onClick={closeMenu}>Shop</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/courses" onClick={closeMenu}>Courses</Link>
              </li>
          

            
              {user?.role === 'admin' && (
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="adminDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Admin
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="adminDropdown">
                    <li><Link className="dropdown-item" to="/admin" onClick={closeMenu}>Dashboard</Link></li>
                    <li><Link className="dropdown-item" to="/admin/products" onClick={closeMenu}>Products</Link></li>
                    <li><Link className="dropdown-item" to="/admin/courses" onClick={closeMenu}>Courses</Link></li>
                    <li><Link className="dropdown-item" to="/admin/orders" onClick={closeMenu}>Orders</Link></li>
                    <li><Link className="dropdown-item" to="/admin/users" onClick={closeMenu}>Users</Link></li>
                  </ul>
                </li>
              )}
            </ul>

            {/* Right side items */}
            <ul className="navbar-nav">
              {/* Cart - Desktop */}
              <li className="nav-item d-none d-lg-block">
                <Link to="/cart" className="btn btn-link position-relative" onClick={closeMenu}>
                  <FaShoppingCart size={20} />
                  {cart && cart.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {cart.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                  )}
                </Link>
              </li>

              {/* Notifications - Desktop */}
              {user && (
                <li className="nav-item d-none d-lg-block">
                  <NotificationDropdown />
                </li>
              )}

              {/* User menu */}
              {user ? (
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle d-flex align-items-center"
                    href="#"
                    id="userDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {user.profile?.profileImage ? (
                      <img
                        src={user.profile.profileImage}
                        alt="Profile"
                        className="rounded-circle me-2"
                        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                      />
                    ) : (
                      <FaUser className="me-1" />
                    )}
                    {user.name}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><Link className="dropdown-item" to="/dashboard" onClick={closeMenu}>Dashboard</Link></li>
                    <li><Link className="dropdown-item" to="/profile" onClick={closeMenu}>Profile</Link></li>
                    <li><Link className="dropdown-item" to="/orders" onClick={closeMenu}>My Orders</Link></li>
                    <li><Link className="dropdown-item" to="/my-courses" onClick={closeMenu}>My Courses</Link></li>
                    <li><Link className="dropdown-item" to="/wishlist" onClick={closeMenu}>
                      <FaHeart className="me-2" />
                      Wishlist
                      {wishlist && wishlist.length > 0 && (
                        <span className="badge bg-danger ms-2">{wishlist.length}</span>
                      )}
                    </Link></li>
                    <li><Link className="dropdown-item" to="/notifications" onClick={closeMenu}>Notifications</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item text-danger" onClick={handleLogoutClick}>Logout</button></li>
                  </ul>
                </li>
              ) : (
                <li className="nav-item">
                  <Link className="btn bakery-btn-primary" to="/login" onClick={closeMenu}>
                    Login
                  </Link>
                </li>
              )}
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
                <p>Are you sure you want to logout?</p>
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

export default Navbar;
