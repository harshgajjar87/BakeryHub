const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllNotifications,
  sendNotification,
  deleteNotification,
  approveNotification,
  rejectNotification,
  getAllChats,
  getChatDetails,
  sendMessage,
  getPublicPaymentQRs
} = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Admin routes
router.get('/dashboard', authenticateToken, requireAdmin, getDashboardStats);
router.get('/users', authenticateToken, requireAdmin, getAllUsers);
router.put('/users/:id/role', authenticateToken, requireAdmin, updateUserRole);
router.delete('/users/:id', authenticateToken, requireAdmin, deleteUser);

// Notification management routes
router.get('/notifications', authenticateToken, requireAdmin, getAllNotifications);
router.post('/notifications', authenticateToken, requireAdmin, sendNotification);
router.put('/notifications/:id/approve', authenticateToken, requireAdmin, approveNotification);
router.put('/notifications/:id/reject', authenticateToken, requireAdmin, rejectNotification);
router.delete('/notifications/:id', authenticateToken, requireAdmin, deleteNotification);

// Chat management routes
router.get('/chats', authenticateToken, requireAdmin, getAllChats);
router.get('/chats/:orderId', authenticateToken, requireAdmin, getChatDetails);
router.post('/chats/:orderId/messages', authenticateToken, requireAdmin, sendMessage);
router.post('/chats/:orderId/upload-image', authenticateToken, requireAdmin, require('../middleware/upload').uploadChatImage.single('image'), require('../controllers/chatController').uploadChatImage);

// Public payment QR routes (no authentication required)
router.get('/public/payment-qrs', getPublicPaymentQRs);

// Payment QR management routes removed - only Razorpay is supported

module.exports = router;
