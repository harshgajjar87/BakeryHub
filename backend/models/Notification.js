const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'order_status',      // Order status updates
      'order_approved',    // Order approval notifications
      'order_rejected',    // Order rejection notifications
      'payment_verified',  // Payment verification
      'payment_rejected',  // Payment rejection
      'payment_submitted', // Payment proof submitted
      'course_purchased',  // Course purchase confirmation
      'course_access',     // Course access granted
      'new_message',       // New chat message
      'admin_action',      // Admin actions
      'system',           // System notifications
      'request_access',    // Access requests
      'checkout_request',  // Checkout notifications
      'new_order'          // New order notifications for admin
    ],
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    // Can reference Order, Course, or other models
  },
  relatedModel: {
    type: String,
    enum: ['Order', 'Course', 'Product', 'User']
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    // Deprecated, but kept for backward compatibility
  },
  redirectUrl: {
    type: String,
    // URL to redirect when notification is clicked
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Removed deprecated 'data' field - using 'relatedId' instead
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();

  // Populate sender info if exists
  if (data.sender) {
    await notification.populate('sender', 'name email');
  }

  return notification;
};

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);
