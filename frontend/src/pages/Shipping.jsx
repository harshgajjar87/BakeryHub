import React from 'react';

const Shipping = () => {
  return (
    <div className="bakery-bg py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow-lg border-0" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              <div className="card-header text-white text-center" style={{
                background: 'linear-gradient(135deg, var(--bakery-brown) 0%, var(--bakery-brown-dark) 100%)',
                borderBottom: 'none',
                padding: '2rem 2rem 3rem'
              }}>
                <h2 className="mb-3 fw-bold">
                  <i className="fas fa-truck me-3"></i>
                  Shipping & Delivery Policy
                </h2>
                <p className="mb-0 opacity-75">Learn about our delivery options and policies</p>
              </div>
            <div className="card-body">
              <div className="mb-4">
                <h4 className="bakery-text-gold fw-bold mb-3">
                  <i className="fas fa-truck me-2"></i>Delivery Information
                </h4>
                <div className="alert alert-info">
                  <h5 className="alert-heading">
                    <i className="fas fa-map-marker-alt me-2"></i>Service Area
                  </h5>
                  <p className="mb-0">
                    <strong>Delivery is only available within Ahmedabad city limits.</strong>
                  </p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-4">
                  <div className="card h-100 border-success">
                    <div className="card-header bg-success text-white">
                      <h5 className="mb-0">
                        <i className="fas fa-check-circle me-2"></i>Home Delivery
                      </h5>
                    </div>
                    <div className="card-body">
                      <p className="card-text">
                        Available only for customers within Ahmedabad city.
                      </p>
                      <ul className="list-unstyled">
                        <li><i className="fas fa-check text-success me-2"></i>₹200 delivery charge</li>
                        <li><i className="fas fa-check text-success me-2"></i>Available for orders above ₹1000</li>
                        <li><i className="fas fa-check text-success me-2"></i>Standard delivery within 24-48 hours</li>
                        <li><i className="fas fa-check text-success me-2"></i>Express delivery available (additional charges)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-4">
                  <div className="card h-100 border-primary">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">
                        <i className="fas fa-store me-2"></i>Self Pickup
                      </h5>
                    </div>
                    <div className="card-body">
                      <p className="card-text">
                        Available for all customers, including those outside Ahmedabad.
                      </p>
                      <ul className="list-unstyled">
                        <li><i className="fas fa-check text-primary me-2"></i>Free of charge</li>
                        <li><i className="fas fa-check text-primary me-2"></i>Ready for pickup within 24 hours</li>
                        <li><i className="fas fa-check text-primary me-2"></i>Convenient store location</li>
                        <li><i className="fas fa-check text-primary me-2"></i>No minimum order requirement</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="bakery-text-gold fw-bold mb-3">
                  <i className="fas fa-info-circle me-2"></i>Important Notes
                </h4>
                <div className="alert alert-warning">
                  <h6 className="alert-heading">
                    <i className="fas fa-exclamation-triangle me-2"></i>Outside Ahmedabad?
                  </h6>
                  <p className="mb-2">
                    If you are located outside Ahmedabad city, delivery service is not available.
                    You must arrange self-pickup from our store location.
                  </p>
                  <p className="mb-0">
                    <strong>Store Address:</strong> Harsh Cake Zone, D-101, Skybell Apartment, Opp. Crystal Internation Public School, Vastral, Ahmedabad - 382418
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="bakery-text-gold fw-bold mb-3">
                  <i className="fas fa-clock me-2"></i>Delivery Timings
                </h4>
                <div className="row">
                  <div className="col-md-6">
                    <h6>Standard Delivery</h6>
                    <p>24-48 hours from order confirmation</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Express Delivery</h6>
                    <p>Same-day delivery (subject to availability)</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="bakery-text-gold fw-bold mb-3">
                  <i className="fas fa-shield-alt me-2"></i>Order Tracking
                </h4>
                <p>
                  Once your order is confirmed and payment is verified, you'll receive tracking updates
                  via email and SMS. For self-pickup orders, you'll be notified when your order is ready.
                </p>
              </div>

              <div className="text-center">
                <p className="text-muted">
                  Have questions about shipping? <a href="/contact" className="text-decoration-none">Contact us</a>
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default Shipping;
