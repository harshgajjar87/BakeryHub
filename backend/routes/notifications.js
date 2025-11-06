const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

// All notification routes require authentication
router.use(authenticateToken);

// Get notifications with pagination
router.get('/', getUserNotifications);

// Get unread notifications count
router.get('/unread-count', getUnreadCount);

// Mark single notification as read
router.put('/:id/read', markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Create notification (for internal use)
router.post('/', (req, res) => {
  // This route is for creating notifications from frontend
  // In a real app, this might be restricted or handled differently
  res.status(404).json({ message: 'Not found' });
});

// Create notification for checkout (special route)
router.post('/checkout', authenticateToken, async (req, res) => {
  try {
    const { title, message, type, recipient } = req.body;
    const { createNotification } = require('../controllers/notificationController');

    // If recipient is null, it's an admin notification
    if (!recipient) {
      // Get all admin users
      const User = require('../models/User');
      const admins = await User.find({ role: 'admin' });

      // Send to all admins
      const notifications = [];
      for (const admin of admins) {
        const notification = await createNotification(
          admin._id,
          type,
          title,
          message,
          null,
          'high'
        );
        notifications.push(notification);
      }

      res.json({ message: 'Admin notifications sent', notifications });
    } else {
      // Send to specific user
      const notification = await createNotification(
        recipient,
        type,
        title,
        message,
        null,
        'medium'
      );
      res.json({ message: 'Notification sent', notification });
    }
  } catch (error) {
    console.error('Create checkout notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
