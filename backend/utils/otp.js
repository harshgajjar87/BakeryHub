const crypto = require('crypto');

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Generate OTP expiry time (10 minutes from now)
const getOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

module.exports = {
  generateOTP,
  getOTPExpiry
};
