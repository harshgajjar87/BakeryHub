const Notification = require('../models/Notification');
const User = require('../models/User');

// Create notification
const createNotification = async (userId, type, title, message, redirectUrl = null, priority = 'medium', sender = null, relatedId = null) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      title,
      message,
      redirectUrl,
      priority,
      sender,
      relatedId
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

// Create order-related notification
const createOrderNotification = async (order, type, message, redirectUrl = null) => {
  try {
    let title;
    switch (type) {
      case 'payment_verified':
        title = 'Payment Verified';
        break;
      case 'payment_rejected':
        title = 'Payment Rejected';
        break;
      case 'payment_submitted':
        title = 'Payment Proof Submitted';
        break;
      case 'order_approved':
        title = 'Order Approved';
        break;
      case 'order_rejected':
        title = 'Order Rejected';
        break;
      default:
        title = 'Order Update';
    }

    await createNotification(
      order.user,
      type,
      title,
      message,
      redirectUrl || `/orders/${order._id}`,
      type === 'urgent' ? 'urgent' : 'medium',
      null, // sender
      order._id // relatedId
    );
  } catch (error) {
    console.error('Create order notification error:', error);
    throw error;
  }
};

// Create course-related notification
const createCourseNotification = async (userId, course, type, message) => {
  try {
    const title = type === 'course_purchased' ? 'Course Purchased' :
                 type === 'course_access' ? 'Course Access Granted' :
                 'Course Update';

    await createNotification(
      userId,
      type,
      title,
      message,
      `/courses/${course._id}`,
      'medium',
      null, // sender
      course._id // relatedId
    );
  } catch (error) {
    console.error('Create course notification error:', error);
    throw error;
  }
};

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user: req.user._id })
      .populate('sender', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ user: req.user._id });
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });

    res.json({
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      unreadCount
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get unread notifications count
const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get notification stats (Admin only)
const getNotificationStats = async (req, res) => {
  try {
    const totalNotifications = await Notification.countDocuments();
    const unreadNotifications = await Notification.countDocuments({ isRead: false });
    const todayNotifications = await Notification.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    res.json({
      totalNotifications,
      unreadNotifications,
      todayNotifications
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createNotification,
  createOrderNotification,
  createCourseNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats
};
