const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const Chat = require('../models/Chat');
const PaymentQR = require('../models/PaymentQR');
const { createNotification } = require('./notificationController');

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalProducts = await Product.countDocuments();
    const totalCourses = await Course.countDocuments();

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalProducts,
        totalCourses
      },
      recentOrders
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -otp -otpExpires')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['customer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all notifications (Admin only)
const getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, type, isRead } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const notifications = await Notification.find(query)
      .populate('user', 'name email')
      .populate('sender', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get all notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send notification (Admin only)
const sendNotification = async (req, res) => {
  try {
    const { recipientId, title, message, type = 'admin_action', redirectUrl } = req.body;

    if (!recipientId || !title || !message) {
      return res.status(400).json({ message: 'Recipient, title, and message are required' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const notification = await createNotification(
      recipientId,
      type,
      title,
      message,
      redirectUrl,
      'medium',
      req.user._id // sender
    );

    await notification.populate('user', 'name email');
    await notification.populate('sender', 'name email');

    res.status(201).json({
      message: 'Notification sent successfully',
      notification
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete notification (Admin only)
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve notification (Admin only)
const approveNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Handle different notification types
    if (notification.type === 'new_order') {
      // Approve order
      const order = await Order.findById(notification.relatedId);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Use the existing approveOrder logic
      const oldStatus = order.status;
      order.adminNotes = req.body.adminNotes || '';

      // If order requires customization, enable chat and set status to customization_pending
      if (order.customizationRequired) {
        order.chatEnabled = true;
        order.status = 'customization_pending';

        // Create chat for customization
        const chat = new Chat({
          order: order._id,
          participants: [order.user, req.user._id], // customer and admin
          isActive: true
        });
        await chat.save();
        order.chatId = chat._id;
      } else {
        // For non-customized orders, move to payment_pending
        order.status = 'payment_pending';
      }

      order.updatedAt = new Date();
      await order.save();
      await order.populate('user', 'name email');
      await order.populate('items.product', 'name price images');
      await order.populate('items.course', 'title price image');

      // Create notification for user
      const { createOrderNotification } = require('./notificationController');
      const message = order.customizationRequired
        ? 'Your order has been approved! Chat with our baker to discuss customization details.'
        : 'Your order has been approved! Please complete your payment to proceed.';

      await createOrderNotification(order, 'order_approved', message);

      // Mark notification as read
      notification.isRead = true;
      await notification.save();

      res.json({
        message: 'Order approved successfully',
        order,
        notification
      });
    } else if (notification.type === 'request_access') {
      // Approve access request
      // Mark notification as read
      notification.isRead = true;
      await notification.save();

      // Send notification to user about approval
      await createNotification(
        notification.user,
        'admin_action',
        'Access Request Approved',
        'Your access request has been approved by an administrator.',
        null,
        'medium',
        req.user._id
      );

      res.json({
        message: 'Access request approved successfully',
        notification
      });
    } else {
      return res.status(400).json({ message: 'Notification type not supported for approval' });
    }
  } catch (error) {
    console.error('Approve notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject notification (Admin only)
const rejectNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Handle different notification types
    if (notification.type === 'new_order') {
      // Reject order
      const order = await Order.findById(notification.relatedId);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      order.status = 'rejected';
      order.adminNotes = req.body.adminNotes || '';
      order.updatedAt = new Date();

      await order.save();
      await order.populate('user', 'name email');
      await order.populate('items.product', 'name price images');
      await order.populate('items.course', 'title price image');

      // Create notification for user
      const { createOrderNotification } = require('./notificationController');
      await createOrderNotification(order, 'order_rejected', 'Your order has been rejected. Please contact support for more information.');

      // Mark notification as read
      notification.isRead = true;
      await notification.save();

      res.json({
        message: 'Order rejected successfully',
        order,
        notification
      });
    } else if (notification.type === 'request_access') {
      // Reject access request
      // Mark notification as read
      notification.isRead = true;
      await notification.save();

      // Send notification to user about rejection
      await createNotification(
        notification.user,
        'admin_action',
        'Access Request Rejected',
        'Your access request has been rejected by an administrator.',
        null,
        'medium',
        req.user._id
      );

      res.json({
        message: 'Access request rejected successfully',
        notification
      });
    } else {
      return res.status(400).json({ message: 'Notification type not supported for rejection' });
    }
  } catch (error) {
    console.error('Reject notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all chats (Admin only)
const getAllChats = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;

    let query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const chats = await Chat.find(query)
      .populate('order', 'status deliveryDate totalAmount')
      .populate('participants', 'name email')
      .sort({ lastMessage: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter by search if provided
    let filteredChats = chats;
    if (search) {
      filteredChats = chats.filter(chat =>
        chat.participants.some(participant =>
          participant.name.toLowerCase().includes(search.toLowerCase()) ||
          participant.email.toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    const total = await Chat.countDocuments(query);

    res.json({
      chats: filteredChats,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get all chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get chat details (Admin only)
const getChatDetails = async (req, res) => {
  try {
    const chat = await Chat.findOne({ order: req.params.orderId })
      .populate('order', 'status deliveryDate totalAmount')
      .populate('participants', 'name email profile.profileImage')
      .populate('messages.sender', 'name email profile.profileImage');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    console.error('Get chat details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send message in chat (Admin only)
const sendMessage = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { content, messageType = 'text' } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const chat = await Chat.findOne({ order: orderId });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const newMessage = {
      sender: req.user._id,
      content: content.trim(),
      messageType,
      timestamp: new Date()
    };

    chat.messages.push(newMessage);
    chat.lastMessage = new Date();
    await chat.save();

    await chat.populate('messages.sender', 'name email profile.profileImage');

    const addedMessage = chat.messages[chat.messages.length - 1];

    res.status(201).json({
      message: 'Message sent successfully',
      message: addedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all payment QR codes (Admin only)
const getAllPaymentQRs = async (req, res) => {
  try {
    const qrCodes = await PaymentQR.find()
      .sort({ displayOrder: 1, createdAt: -1 });

    res.json(qrCodes);
  } catch (error) {
    console.error('Get all payment QR codes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get public payment QR codes (for customers during checkout)
const getPublicPaymentQRs = async (req, res) => {
  try {
    const qrCodes = await PaymentQR.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 });

    // Map fields to match frontend expectations
    const mappedQRCodes = qrCodes.map(qr => ({
      _id: qr._id,
      name: qr.paymentMethod,
      imageUrl: qr.qrImage,
      accountNumber: qr.accountDetails
    }));

    res.json(mappedQRCodes);
  } catch (error) {
    console.error('Get public payment QR codes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload payment QR code (Admin only)
const uploadPaymentQR = async (req, res) => {
  try {
    const { paymentMethod, accountDetails, displayOrder, notes } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'QR code image is required' });
    }

    if (!paymentMethod || !accountDetails) {
      return res.status(400).json({ message: 'Payment method and account details are required' });
    }

    const qrCode = new PaymentQR({
      paymentMethod,
      qrImage: req.file.path,
      accountDetails,
      displayOrder: displayOrder || 0,
      notes: notes || ''
    });

    await qrCode.save();

    res.status(201).json({
      message: 'Payment QR code uploaded successfully',
      qrCode
    });
  } catch (error) {
    console.error('Upload payment QR error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update payment QR code (Admin only)
const updatePaymentQR = async (req, res) => {
  try {
    const { paymentMethod, accountDetails, isActive, displayOrder, notes } = req.body;

    const qrCode = await PaymentQR.findById(req.params.id);
    if (!qrCode) {
      return res.status(404).json({ message: 'Payment QR code not found' });
    }

    if (paymentMethod) qrCode.paymentMethod = paymentMethod;
    if (accountDetails) qrCode.accountDetails = accountDetails;
    if (isActive !== undefined) qrCode.isActive = isActive;
    if (displayOrder !== undefined) qrCode.displayOrder = displayOrder;
    if (notes !== undefined) qrCode.notes = notes;

    await qrCode.save();

    res.json({
      message: 'Payment QR code updated successfully',
      qrCode
    });
  } catch (error) {
    console.error('Update payment QR error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete payment QR code (Admin only)
const deletePaymentQR = async (req, res) => {
  try {
    const qrCode = await PaymentQR.findByIdAndDelete(req.params.id);

    if (!qrCode) {
      return res.status(404).json({ message: 'Payment QR code not found' });
    }

    res.json({ message: 'Payment QR code deleted successfully' });
  } catch (error) {
    console.error('Delete payment QR error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
  getAllPaymentQRs,
  getPublicPaymentQRs,
  uploadPaymentQR,
  updatePaymentQR,
  deletePaymentQR
};
