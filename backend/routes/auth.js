const express = require('express');
const router = express.Router();
const {
  register,
  verifyOTP,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  uploadProfileImage,
  registerValidation
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

// Public routes
router.post('/register', registerValidation, register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/upload-profile-image', authenticateToken, uploadImage.single('profileImage'), uploadProfileImage);

module.exports = router;
