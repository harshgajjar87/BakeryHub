import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { FaKey, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pre-fill email if provided in URL params
  React.useEffect(() => {
    const email = searchParams.get('email');
    if (email) {
      setFormData(prev => ({ ...prev, email }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!formData.otp.trim()) {
      toast.error('OTP is required');
      return false;
    }
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/reset-password', {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });

      if (response.data.message) {
        setPasswordReset(true);
        toast.success('Password reset successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (passwordReset) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-6">
            <div className="card shadow">
              <div className="card-body p-5 text-center">
                <div className="mb-4">
                  <FaCheck size={48} className="text-success mb-3" />
                  <h3 className="bakery-text-brown fw-bold">Password Reset Successful!</h3>
                  <p className="text-muted">
                    Your password has been successfully reset. You can now log in with your new password.
                  </p>
                </div>

                <div className="mt-4">
                  <Link to="/login" className="btn bakery-btn-primary btn-lg">
                    <FaKey className="me-2" />
                    Go to Login
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
                <h2 className="mb-3 fw-bold">Reset Password</h2>
                <p className="mb-0 opacity-75">
                  Enter the OTP from your email and your new password
                </p>
              </div>

              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="mb-4">
                    <i className="fas fa-lock bakery-text-gold" style={{ fontSize: '4rem' }}></i>
                  </div>
                </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-semibold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="otp" className="form-label fw-semibold">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="otp"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    required
                  />
                  <div className="form-text">
                    Check your email for the OTP code
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label fw-semibold">
                    New Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <div className="form-text">
                    Password must be at least 6 characters
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label fw-semibold">
                    Confirm New Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn bakery-btn-primary w-100 btn-lg mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner me-2"></span>
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <FaKey className="me-2" />
                      Reset Password
                    </>
                  )}
                </button>
              </form>

              <div className="text-center">
                <Link to="/forgot-password" className="text-decoration-none me-3">
                  Resend OTP
                </Link>
                <Link to="/login" className="text-decoration-none">
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

export default ResetPassword;
