const express = require('express');
const router = express.Router();
const {
  createOrder,
  createCoursePurchase,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders,
  approveOrder,
  rejectOrder,
  requestPayment,
  checkPendingPayments,
  verifyPayment,
  createPaymentOrder,
  verifyRazorpayPayment,
  downloadInvoice,
  markOrderDelivered
} = require('../controllers/orderController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadPayment } = require('../middleware/upload');

// Protected routes
router.post('/', authenticateToken, createOrder);
router.post('/course-purchase', authenticateToken, createCoursePurchase);
router.post('/create-payment-order', authenticateToken, createPaymentOrder);
router.post('/verify-razorpay-payment', authenticateToken, verifyRazorpayPayment);
router.get('/user', authenticateToken, getUserOrders);
router.get('/:id', authenticateToken, getOrder);
router.get('/:id/download-invoice', authenticateToken, downloadInvoice);
router.get('/check-pending-payments', authenticateToken, checkPendingPayments);

// Admin routes
router.get('/', authenticateToken, requireAdmin, getAllOrders);
router.get('/:id/admin', authenticateToken, requireAdmin, getOrder); // Admin can view any order
router.put('/:id/status', authenticateToken, requireAdmin, updateOrderStatus);
router.put('/:id/approve', authenticateToken, requireAdmin, approveOrder);
router.put('/:id/reject', authenticateToken, requireAdmin, rejectOrder);
router.put('/:id/request-payment', authenticateToken, requireAdmin, requestPayment);
router.put('/:id/mark-delivered', authenticateToken, requireAdmin, markOrderDelivered);

module.exports = router;
