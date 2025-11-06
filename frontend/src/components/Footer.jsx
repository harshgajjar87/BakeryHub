import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-5 mt-5">
      <div className="container">
        <div className="row">
          {/* Company Info */}
          <div className="col-lg-4 col-md-6 mb-4">
            <h5 className="bakery-text-gold fw-bold mb-3">🍰 BakeryHub</h5>
            <p className="mb-3">
              Your ultimate destination for premium bakery products and professional baking education.
              Fresh, authentic, and made with love.
            </p>
            <div className="social-links">
              <a href="#" className="text-light me-3 fs-5">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="text-light me-3 fs-5">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-light me-3 fs-5">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-light fs-5">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-light text-decoration-none">
                  <i className="fas fa-home me-2"></i>Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-light text-decoration-none">
                  <i className="fas fa-info-circle me-2"></i>About Us
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/shop" className="text-light text-decoration-none">
                  <i className="fas fa-store me-2"></i>Shop
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/courses" className="text-light text-decoration-none">
                  <i className="fas fa-graduation-cap me-2"></i>Courses
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="fw-bold mb-3">Customer Service</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/contact" className="text-light text-decoration-none">
                  <i className="fas fa-envelope me-2"></i>Contact Us
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/faq" className="text-light text-decoration-none">
                  <i className="fas fa-question-circle me-2"></i>FAQ
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/shipping" className="text-light text-decoration-none">
                  <i className="fas fa-truck me-2"></i>Shipping Info
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/returns" className="text-light text-decoration-none">
                  <i className="fas fa-undo me-2"></i>Returns
                </Link>
              </li>
            </ul>
            <div className="mt-3 p-2 bg-warning text-dark rounded small">
              <i className="fas fa-info-circle me-1"></i>
              <strong>Delivery:</strong> Ahmedabad only
            </div>
          </div>

          {/* Contact Info */}
          <div className="col-lg-4 col-md-6 mb-4">
            <h6 className="fw-bold mb-3">Get in Touch</h6>
            <div className="contact-info">
              <p className="mb-2">
                <i className="fas fa-map-marker-alt me-2 bakery-text-gold"></i>
                Harsh Cake Zone, D-101, Skybell Apartment, Vastral, Ahmedabad - 382418
              </p>
              <p className="mb-2">
                <i className="fas fa-phone me-2 bakery-text-gold"></i>
                +91-8866319009
              </p>
              <p className="mb-2">
                <i className="fas fa-envelope me-2 bakery-text-gold"></i>
                harshcakezone555@gmail.com
              </p>
              <p className="mb-2">
                <i className="fas fa-clock me-2 bakery-text-gold"></i>
                Mon-Fri: 8AM-8PM, Sat-Sun: 9AM-6PM
              </p>
            </div>
          </div>
        </div>

        

        {/* Bottom Bar */}
        <hr className="my-4" />
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="mb-0">
              &copy; 2024 BakeryHub. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <Link to="/privacy" className="text-light text-decoration-none me-3">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-light text-decoration-none">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
