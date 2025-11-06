import React from 'react';

const Returns = () => {
  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <h1 className="mb-4 bakery-text-brown">Returns & Refunds Policy</h1>
          <p className="lead mb-5">Our policy for returns and refunds to ensure customer satisfaction.</p>

          <div className="card shadow mb-4">
            <div className="card-body p-4">
              <h3 className="bakery-text-gold mb-3">Return Policy</h3>
              <p>We take great pride in the quality of our products. If you're not satisfied with your purchase, please review our return policy:</p>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Returns are only accepted within 24 hours of delivery
                </li>
                <li className="mb-2">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Products must be in their original condition and packaging
                </li>
                <li className="mb-2">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  Please provide the original receipt or order confirmation
                </li>
                <li className="mb-2">
                  <i className="fas fa-times-circle text-danger me-2"></i>
                  Customized or personalized items cannot be returned unless there's a quality issue
                </li>
              </ul>
            </div>
          </div>

          <div className="card shadow mb-4">
            <div className="card-body p-4">
              <h3 className="bakery-text-gold mb-3">Quality Issues</h3>
              <p>If you receive a product with quality issues, please contact us immediately:</p>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <i className="fas fa-phone text-primary me-2"></i>
                  Call us at +91-8866319009
                </li>
                <li className="mb-2">
                  <i className="fas fa-envelope text-primary me-2"></i>
                  Email us at harshcakezone555@gmail.com
                </li>
                <li className="mb-2">
                  <i className="fas fa-camera text-primary me-2"></i>
                  Please provide a photo of the issue if possible
                </li>
              </ul>
              <p>We'll arrange for a replacement or refund based on the nature of the issue.</p>
            </div>
          </div>

          <div className="card shadow mb-4">
            <div className="card-body p-4">
              <h3 className="bakery-text-gold mb-3">Refund Process</h3>
              <p>Refunds are processed according to the following timeline:</p>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <i className="fas fa-rupee-sign text-success me-2"></i>
                  Refunds are typically processed within 5-7 business days
                </li>
                <li className="mb-2">
                  <i className="fas fa-credit-card text-success me-2"></i>
                  Refunds will be issued to the original payment method
                </li>
                <li className="mb-2">
                  <i className="fas fa-receipt text-success me-2"></i>
                  You'll receive an email confirmation once the refund is processed
                </li>
              </ul>
            </div>
          </div>

          <div className="card shadow mb-4">
            <div className="card-body p-4">
              <h3 className="bakery-text-gold mb-3">Exchange Policy</h3>
              <p>For exchanges, please note the following:</p>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <i className="fas fa-exchange-alt text-info me-2"></i>
                  Exchanges are only available for products of equal or lesser value
                </li>
                <li className="mb-2">
                  <i className="fas fa-exchange-alt text-info me-2"></i>
                  You'll need to pay the difference if exchanging for a higher-priced item
                </li>
                <li className="mb-2">
                  <i className="fas fa-exchange-alt text-info me-2"></i>
                  Exchanges must be requested within 24 hours of delivery
                </li>
              </ul>
            </div>
          </div>

          <div className="card shadow mb-4">
            <div className="card-body p-4">
              <h3 className="bakery-text-gold mb-3">Non-Returnable Items</h3>
              <p>The following items cannot be returned or exchanged:</p>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <i className="fas fa-birthday-cake text-warning me-2"></i>
                  Customized cakes with specific designs or messages
                </li>
                <li className="mb-2">
                  <i className="fas fa-birthday-cake text-warning me-2"></i>
                  Perishable items that have been partially consumed
                </li>
                <li className="mb-2">
                  <i className="fas fa-graduation-cap text-warning me-2"></i>
                  Course enrollments (as per our course policy)
                </li>
              </ul>
            </div>
          </div>

          <div className="card shadow">
            <div className="card-body p-4">
              <h3 className="bakery-text-gold mb-3">How to Initiate a Return</h3>
              <p>To initiate a return or exchange, please follow these steps:</p>
              <ol>
                <li className="mb-2">Contact our customer service within 24 hours of delivery</li>
                <li className="mb-2">Provide your order number and reason for return</li>
                <li className="mb-2">Our team will review your request and provide instructions</li>
                <li className="mb-2">Package the item in its original packaging if possible</li>
                <li className="mb-2">Bring the item to our store or arrange for pickup (if available)</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Returns;
