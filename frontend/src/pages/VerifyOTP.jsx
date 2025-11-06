import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const { verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const userId = location.state?.userId;

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    // Countdown timer for resend OTP
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await verifyOTP(email, otp);

      if (result.success) {
        toast.success('Email verified successfully!');
        // Use setTimeout to ensure state updates are applied before navigation
        setTimeout(() => {
          navigate(result.redirect || '/');
        }, 100);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setResendLoading(true);

    try {
      // This would typically call a resend OTP API
      // For now, we'll just show a message
      toast.info('OTP resent to your email');
      setCountdown(60);
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return null;
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
                <h2 className="mb-3 fw-bold">Verify Your Email</h2>
                <p className="mb-0 opacity-75">
                  We've sent a 6-digit OTP to <strong>{email}</strong>
                </p>
              </div>

              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="mb-4">
                    <i className="fas fa-envelope-open-text bakery-text-gold" style={{ fontSize: '4rem' }}></i>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="otp" className="form-label">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      className="form-control text-center fs-4"
                      id="otp"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 6) {
                          setOtp(value);
                        }
                      }}
                      placeholder="000000"
                      maxLength="6"
                      required
                    />
                    <div className="form-text text-center">
                      Enter the 6-digit code sent to your email
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn bakery-btn-primary w-100 mb-3"
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? (
                      <>
                        <span className="loading-spinner me-2"></span>
                        Verifying...
                      </>
                    ) : (
                      'Verify Email'
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <p className="mb-2">Didn't receive the code?</p>
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || resendLoading}
                  >
                    {resendLoading ? (
                      <>
                        <span className="loading-spinner me-2"></span>
                        Resending...
                      </>
                    ) : countdown > 0 ? (
                      `Resend OTP in ${countdown}s`
                    ) : (
                      'Resend OTP'
                    )}
                  </button>
                </div>

                <div className="text-center mt-3">
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    onClick={() => navigate('/register')}
                  >
                    Change Email Address
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
