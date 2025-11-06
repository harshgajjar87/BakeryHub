import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

const PublicNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container">
        {/* Logo */}
        <Link className="navbar-brand bakery-text-brown fw-bold fs-4" to="/" onClick={closeMenu}>
          🍰 BakeryHub
        </Link>

        {/* Mobile menu toggle */}
        <button
          className="btn btn-link d-lg-none"
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>

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
          </ul>

          {/* Right side items */}
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="btn bakery-btn-primary" to="/login" onClick={closeMenu}>
                Login
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
