import React from 'react';

const Privacy = () => {
  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <h1 className="mb-4 bakery-text-brown">Privacy Policy</h1>
          <p className="lead mb-5">Your privacy is important to us. This policy explains how we collect, use, and protect your information.</p>

          <div className="card shadow mb-4">
            <div className="card-body p-4">
              <h3 className="bakery-text-gold mb-3">Information We Collect</h3>
              <p>When you use our website or services, we may collect the following information:</p>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <i className="fas fa-user text-primary me-2"></i>
                  <strong>Personal Information:</strong> Name, email address, phone number, delivery address
                </li>
                <li className="mb-2">
                  <i className="fas fa-shopping-cart text-primary me-2"></i>
                  <strong>Order Information:</strong> Products purchased, payment details, delivery preferences
                </li>
                <li className="mb-2">
                  <i className="fas fa-laptop text-primary me-2"></i>
                  <strong>Technical Information:</strong> IP address, browser type, device information
                </li>
                <li className="mb-2">
                  <i className="fas fa-cookie text-primary me-2"></i>
                  <strong>Cookies:</strong> Information stored on your device for improved experience
                </li>
              </ul>
            </div>
          </div>

          <div className="card shadow mb-4">
            <div className="card-body p-4">
              <h3 className="bakery-text-gold mb-3">How We Use Your Information</h3>
              <p>We use your information to provide and improve our services:</p>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <i className="fas fa-box text-success me-2"></i>
                  <strong>Order Processing:</strong> To process and deliver your orders
                </li>
                <li className="mb-2">
                  <i className="fas fa-bell text-success me-2"></i>
                  <strong>Communication:</strong> To send order updates and promotional messages
                </li>
                <li className="mb-2">
                  <i className="fas fa-chart-line text-success me-2"></i>
                  <strong>Improvement:</strong> To analyze usage patterns and improve our services
                </li>
                <li className="mb-2">
                  <i className="fas fa-shield-alt text-success me-2"></i>
                  <strong>Security:</strong> To protect against fraud and ensure secure transactions
                </li>
              </ul>
            </div>
          </div>

          <div className="card shadow mb-4">
            <div className="card-body p-4">
              <h3 className="bakery-text-gold mb-3">Information Sharing</h3>
              <p>We respect your privacy and only share information in specific circumstances:</p>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <i className="fas fa-check-circle text-info me-2"></i>
                  <strong>Service Providers:</strong> With delivery partners for order fulfillment
                </li>
                <li className="mb-2">
                  <i className="fas fa-check-circle text-info me-2"></i>
                  <strong>Legal Requirements:</strong> When required by law or to protect our rights
                </li>
                <li className="mb-2">
                  <i className="fas fa-times-circle text-warning me-2"></i>
                  <strong>Never Sold:</strong> We never sell your personal information to third parties
                </li>
              </ul>
            </div>
          </div>

          <div className="card shadow mb-4">
            <div className="card-body p-4">
              <h3 className="bakery-text-gold mb-3">Data Security</h3>
              <p>We implement appropriate security measures to protect your information:</p>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <i className="fas fa-lock text-warning me-2"></i>
                  <strong>Encryption:</strong> Secure encryption for sensitive data transmission
                </li>
                <li className="mb-2">
                  <i className="fas fa-lock text-warning me-2"></i>
                  <strong>Access Control:</strong> Limited access to your personal information
                </li>
                <li className="mb-2">
                  <i className="fas fa-lock text-warning me-2"></i>
                  <strong>Regular Updates:</strong> Continuous security system updates
                </li>
              </ul>
            </div>
          </div>

          <div className="card shadow mb-4">
            <div className="card-body p-4">
              <h3 className="bakery-text-gold mb-3">Your Rights</h3>
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <i className="fas fa-eye text-secondary me-2"></i>
                  <strong>Access:</strong> Request a copy of your personal information
                </li>
                <li className="mb-2">
                  <i className="fas fa-edit text-secondary me-2"></i>
                  <strong>Correction:</strong> Request correction of inaccurate information
                </li>
                <li className="mb-2">
                  <i className="fas fa-trash text-secondary me-2"></i>
                  <strong>Deletion:</strong> Request deletion of your personal information
                </li>
                <li className="mb-2">
                  <i className="fas fa-ban text-secondary me-2"></i>
                  <strong>Opt-out:</strong> Decline marketing communications
                </li>
              </ul>
            </div>
          </div>

          <div className="card shadow mb-4">
            <div className="card-body p-4">
              <h3 className="bakery-text-gold mb-3">Cookies Policy</h3>
              <p>Our website uses cookies to enhance your experience:</p>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <i className="fas fa-cookie-bite text-primary me-2"></i>
                  <strong>Essential Cookies:</strong> Required for basic website functionality
                </li>
                <li className="mb-2">
                  <i className="fas fa-cookie-bite text-primary me-2"></i>
                  <strong>Performance Cookies:</strong> Help us understand how you use our website
                </li>
                <li className="mb-2">
                  <i className="fas fa-cookie-bite text-primary me-2"></i>
                  <strong>Functional Cookies:</strong> Remember your preferences and settings
                </li>
              </ul>
              <p>You can control cookies through your browser settings.</p>
            </div>
          </div>

          <div className="card shadow">
            <div className="card-body p-4">
              <h3 className="bakery-text-gold mb-3">Changes to This Policy</h3>
              <p>We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date.</p>
              <p>We encourage you to review this policy periodically to stay informed about how we protect your information.</p>

              <div className="alert alert-info mt-3">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Last Updated:</strong> January 2024
              </div>
            </div>
          </div>

          <div className="text-center mt-5">
            <h4 className="bakery-text-brown mb-3">Questions About Your Privacy?</h4>
            <p className="mb-4">If you have any questions about this privacy policy, please contact us.</p>
            <a href="/contact" className="btn bakery-btn-primary">Contact Us</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
