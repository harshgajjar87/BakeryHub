import React, { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send email to harshcakezone555@gmail.com
      const response = await axios.post('/api/contact', {
        ...formData,
        to: 'harshcakezone555@gmail.com'
      });

      toast.success('Your message has been sent successfully!');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending contact form:', error);
      toast.error('Failed to send your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="text-center mb-4 bakery-text-brown">Contact Us</h2>

              <div className="row mb-4">
                <div className="col-md-4 text-center mb-3">
                  <div className="p-3">
                    <i className="fas fa-map-marker-alt fa-2x bakery-text-gold mb-3"></i>
                    <h5 className="bakery-text-brown">Visit Us</h5>
                    <p>Harsh Cake Zone, D-101, Skybell Apartment, Vastral, Ahmedabad - 382418</p>
                  </div>
                </div>
                <div className="col-md-4 text-center mb-3">
                  <div className="p-3">
                    <i className="fas fa-phone fa-2x bakery-text-gold mb-3"></i>
                    <h5 className="bakery-text-brown">Call Us</h5>
                    <p>+91-8866319009</p>
                  </div>
                </div>
                <div className="col-md-4 text-center mb-3">
                  <div className="p-3">
                    <i className="fas fa-envelope fa-2x bakery-text-gold mb-3"></i>
                    <h5 className="bakery-text-brown">Email Us</h5>
                    <p>harshcakezone555@gmail.com</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="name" className="form-label">Your Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">Your Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="subject" className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="message" className="form-label">Message</label>
                  <textarea
                    className="form-control"
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="btn bakery-btn-primary px-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
