import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/forgot-password', { email });

      if (response.data.message) {
        setEmailSent(true);
        toast.success('Password reset OTP sent to your email!');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-6">
            <div className="card shadow">
              <div className="card-body p-5 text-center">
                <div className="mb-4">
                  <FaEnvelope size={48} className="bakery-text-gold mb-3" />
                  <h3 className="bakery-text-brown fw-bold">Check Your Email</h3>
                  <p className="text-muted">
                    We've sent a password reset OTP to <strong>{email}</strong>
                  </p>
                </div>

                <div className="alert alert-info">
                  <small>
                    Didn't receive the email? Check your spam folder or{' '}
                    <button
                      className="btn btn-link p-0 text-decoration-none"
                      onClick={() => setEmailSent(false)}
                    >
                      try again
                    </button>
                  </small>
                </div>

                <div className="mt-4">
                  <Link to="/login" className="btn bakery-btn-outline me-2">
                    <FaArrowLeft className="me-2" />
                    Back to Login
                  </Link>
                  <Link to="/reset-password" className="btn bakery-btn-primary">
                    Enter OTP
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bakery-bg py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="card shadow-lg border-0" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              <div className="card-header text-white text-center" style={{
                background: 'linear-gradient(135deg, var(--bakery-brown) 0%, var(--bakery-brown-dark) 100%)',
                borderBottom: 'none',
                padding: '2rem 2rem 3rem'
              }}>
                <h2 className="mb-3 fw-bold">Forgot Password</h2>
                <p className="mb-0 opacity-75">
                  Enter your email address and we'll send you an OTP to reset your password
                </p>
              </div>

              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="mb-4">
                    <i className="fas fa-key bakery-text-gold" style={{ fontSize: '4rem' }}></i>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                    <div className="form-text">
                      We'll send a reset OTP to this email address
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn bakery-btn-primary w-100 btn-lg mb-3"
                    disabled={loading || !email.trim()}
                  >
                    {loading ? (
                      <>
                        <span className="loading-spinner me-2"></span>
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <FaEnvelope className="me-2" />
                        Send Reset OTP
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <Link to="/login" className="text-decoration-none">
                    <FaArrowLeft className="me-2" />
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
