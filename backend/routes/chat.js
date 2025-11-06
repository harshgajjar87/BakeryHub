const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadChatImage } = require('../middleware/upload');
const {
  getChat,
  sendMessage,
  uploadChatImage: uploadChatImageController,
  getUserChats,
  markMessagesAsRead,
  deactivateChat
} = require('../controllers/chatController');

// All chat routes require authentication
router.use(authenticateToken);

// Get user's chats
router.get('/', getUserChats);

// Get specific chat for an order
router.get('/:orderId', getChat);

// Send message in chat
router.post('/:orderId/messages', sendMessage);

// Upload image for chat
router.post('/:orderId/upload-image', uploadChatImage.single('image'), uploadChatImageController);

// Mark messages as read
router.put('/:orderId/read', markMessagesAsRead);

// Admin route to deactivate chat
router.put('/:orderId/deactivate', requireAdmin, deactivateChat);

module.exports = router;
