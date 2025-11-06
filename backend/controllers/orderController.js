const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Course = require('../models/Course');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Notification = require('../models/Notification');
const { createOrderNotification } = require('./notificationController');
const { sendPaymentConfirmationEmail, sendCustomerReceiptEmail, sendAdminReceiptEmail, sendOrderDeliveredEmail } = require('../utils/email');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const Razorpay = require('razorpay');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Get all orders for a user
const getUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user._id, isCoursePurchase: { $ne: true } })
      .populate('items.product', 'name price images')
      .populate('items.course', 'title price image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ user: req.user._id, isCoursePurchase: { $ne: true } });

    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single order
const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('items.product', 'name price images')
      .populate('items.course', 'title price image');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create order
const createOrder = async (req, res) => {
  try {
    const { items, deliveryMethod, shippingAddress, notes, shippingFee, deliveryDate, customizationRequired, customizationDetails } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // Calculate total
    let calculatedTotal = 0;
    const orderItems = [];
    let isCoursePurchase = false;

    for (const item of items) {
      if (item.type === 'product') {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ message: `Product ${item.product} not found` });
        }

        orderItems.push({
          product: item.product,
          quantity: item.quantity,
          price: product.price,
          type: 'product'
        });

        calculatedTotal += product.price * item.quantity;
      } else if (item.type === 'course') {
        const course = await Course.findById(item.course);
        if (!course) {
          return res.status(404).json({ message: `Course ${item.course} not found` });
        }

        orderItems.push({
          course: item.course,
          quantity: item.quantity,
          price: course.price,
          type: 'course'
        });

        calculatedTotal += course.price * item.quantity;
        isCoursePurchase = true;
      }
    }

    // Add shipping fee to total (only for product orders)
    if (!isCoursePurchase) {
      calculatedTotal += parseFloat(shippingFee) || 0;
    }

    // Create order with appropriate status - always use Razorpay
    const orderStatus = 'pending_approval'; // Start with pending_approval for admin review

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount: calculatedTotal,
      deliveryMethod: isCoursePurchase ? 'digital' : deliveryMethod,
      shippingAddress: isCoursePurchase ? null : shippingAddress,
      notes,
      shippingFee: isCoursePurchase ? 0 : shippingFee,
      deliveryDate: isCoursePurchase ? null : new Date(deliveryDate),
      customizationRequired: isCoursePurchase ? false : customizationRequired,
      customizationDetails: isCoursePurchase ? null : customizationDetails,
      status: orderStatus,
      paymentMethod: 'razorpay', // Always Razorpay
      isCoursePurchase
    });

    await order.save();
    await order.populate('items.product', 'name price images');
    await order.populate('items.course', 'title price image');

    // Send order placement email
    try {
      const { sendOrderPlacementEmail } = require('../utils/email');
      if (req.user.email) {
        await sendOrderPlacementEmail(req.user.email, order);
      } else {
        console.error('User email not available for order placement email');
      }
    } catch (emailError) {
      console.error('Error sending order placement email:', emailError);
      // Continue without failing the request
    }

    // Create notification for order placement
    const notificationMessage = isCoursePurchase
      ? 'Your course purchase request has been submitted and is pending admin approval.'
      : 'Your order has been placed and is pending admin approval.';
    await createOrderNotification(order, 'order_status', notificationMessage);

    // Create admin notification for new order
    const adminUsers = await User.find({ role: 'admin' });
    for (const admin of adminUsers) {
      const adminNotification = new Notification({
        user: admin._id,
        type: 'new_order',
        title: isCoursePurchase ? 'New Course Purchase Request' : 'New Order Received',
        message: isCoursePurchase
          ? `A new course purchase request #${order._id} has been submitted and requires approval.`
          : `A new order #${order._id} has been placed and requires approval.`,
        relatedId: order._id
      });
      await adminNotification.save();
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create course purchase order (separate endpoint) - Updated for Razorpay
const createCoursePurchase = async (req, res) => {
  try {
    const {
      courseId,
      customerName,
      customerEmail,
      customerPhone,
      validationDate
    } = req.body;

    // Validate course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user already has access to this course
    const user = await User.findById(req.user._id);
    const existingPurchase = user.purchasedCourses.find(p => p.course.toString() === courseId && p.accessExpiry > new Date());
    if (existingPurchase) {
      return res.status(400).json({ message: 'You already have access to this course' });
    }

    // Create course purchase order with Razorpay payment
    const order = new Order({
      user: req.user._id,
      items: [{
        course: courseId,
        quantity: 1,
        price: course.price,
        type: 'course'
      }],
      totalAmount: course.price,
      deliveryMethod: 'digital',
      status: 'pending_approval', // Start with pending_approval for admin review
      paymentMethod: 'razorpay', // Always Razorpay
      mobileNumber: customerPhone,
      isCoursePurchase: true,
      courseAccessExpiry: validationDate ? new Date(validationDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year
      shippingAddress: {
        name: customerName,
        phone: customerPhone,
        address: 'Digital Course Access',
        city: 'Digital',
        state: 'Digital',
        zipCode: '000000'
      }
    });

    await order.save();
    await order.populate('items.course', 'title price image');

    // Send course purchase email with receipt
    try {
      const { sendCoursePurchaseReceiptEmail } = require('../utils/email');
      if (req.user.email) {
        await sendCoursePurchaseReceiptEmail(req.user.email, order, {
          customerName,
          customerEmail,
          customerPhone,
          validationDate: order.courseAccessExpiry
        });
      }
    } catch (emailError) {
      console.error('Error sending course purchase receipt email:', emailError);
    }

    // Create notification
    await createOrderNotification(order, 'order_status', 'Your course purchase request has been submitted and is pending admin approval.');

    // Create admin notification
    const adminUsers = await User.find({ role: 'admin' });
    for (const admin of adminUsers) {
      const adminNotification = new Notification({
        user: admin._id,
        type: 'new_order',
        title: 'New Course Purchase Request',
        message: `A new course purchase request #${order._id} has been submitted and requires approval.`,
        relatedId: order._id
      });
      await adminNotification.save();
    }

    res.status(201).json({ order });
  } catch (error) {
    console.error('Create course purchase error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin approve order
const approveOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const oldStatus = order.status;
    order.adminNotes = req.body.adminNotes || '';
    
    // For product orders, check if customization is required
    if (!order.isCoursePurchase && order.customizationRequired) {
      order.status = 'customization_pending';
    } else {
      order.status = 'approved';
    }

    // Handle course purchases differently
    if (order.isCoursePurchase) {
      // For course purchases, directly mark as completed and grant access
      order.status = 'completed';

      // Grant course access to user
      const user = await User.findById(order.user);
      const courseItem = order.items.find(item => item.type === 'course');
      if (courseItem && courseItem.course) {
        // Check if user already has this course
        const existingCourseIndex = user.purchasedCourses.findIndex(p => p.course.toString() === courseItem.course.toString());
        if (existingCourseIndex >= 0) {
          // Update existing course access expiry
          user.purchasedCourses[existingCourseIndex].accessExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
          user.purchasedCourses[existingCourseIndex].purchaseDate = new Date();
        } else {
          // Add new course purchase
          user.purchasedCourses.push({
            course: courseItem.course,
            purchaseDate: new Date(),
            accessExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
          });
        }
        await user.save();

        // Increment enrolled count for the course
        await Course.findByIdAndUpdate(courseItem.course, { $inc: { enrolledCount: 1 } });
      }

      // Send course approval email
      try {
        const { sendCourseApprovalEmail } = require('../utils/email');
        if (order.user && order.user.email) {
          await sendCourseApprovalEmail(order.user.email, order);
        }
      } catch (emailError) {
        console.error('Error sending course approval email:', emailError);
      }

      // Create notification for course approval
      await createOrderNotification(order, 'order_approved', 'Your course purchase has been approved! You now have access to the course for 1 year.');
    } else {
      // Handle product orders as before
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
        // For non-customized orders, move to approved for Razorpay payment
        order.status = 'approved';
      }

      // Send order approval email
      try {
        const { sendOrderApprovalEmail } = require('../utils/email');
        if (order.user && order.user.email) {
          await sendOrderApprovalEmail(order.user.email, order);
        }
      } catch (emailError) {
        console.error('Error sending order approval email:', emailError);
      }

      // Create notification
      const message = order.customizationRequired
        ? 'Your order has been approved! Chat with our baker to discuss customization details.'
        : 'Your order has been approved! Please complete your payment to proceed.';

      await createOrderNotification(order, 'order_approved', message);
    }

    order.updatedAt = new Date();
    await order.save();
    await order.populate('user', 'name email');
    await order.populate('items.product', 'name price images');
    await order.populate('items.course', 'title price image');

    res.json(order);
  } catch (error) {
    console.error('Approve order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin reject order
const rejectOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
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

    // Note: Stock restoration removed as stock field no longer exists

    // Send order rejection email
    try {
      const { sendOrderRejectionEmail } = require('../utils/email');
      if (order.user && order.user.email) {
        await sendOrderRejectionEmail(order.user.email, order);
      } else {
        console.error('User email not available for order rejection email');
      }
    } catch (emailError) {
      console.error('Error sending order rejection email:', emailError);
      // Continue without failing the request
    }

    // Create notification
    await createOrderNotification(order, 'order_rejected', 'Your order has been rejected. Please contact support for more information.');

    res.json(order);
  } catch (error) {
    console.error('Reject order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Request payment for customized order (after customization discussion)
const requestPayment = async (req, res) => {
  try {
    const { customizationPrice } = req.body;

    if (!customizationPrice || customizationPrice < 0) {
      return res.status(400).json({ message: 'Valid customization price is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.customizationRequired || order.status !== 'customization_pending') {
      return res.status(400).json({ message: 'Invalid order status for payment request' });
    }

    // Store original price and set customization price
    order.originalPrice = order.totalAmount;
    order.customizationPrice = parseFloat(customizationPrice);
    order.totalAmount = order.originalPrice + order.customizationPrice;
    order.status = 'payment_pending';
    order.updatedAt = new Date();

    await order.save();
    await order.populate('user', 'name email');
    await order.populate('items.product', 'name price images');
    await order.populate('items.course', 'title price image');

    // Create notification
    try {
      await createOrderNotification(order, 'payment_requested', `Customization discussion completed! Your total amount is now ₹${order.totalAmount} (Original: ₹${order.originalPrice} + Customization: ₹${order.customizationPrice}). Please complete your payment to proceed with the order.`);
    } catch (notificationError) {
      console.error('Error creating payment request notification:', notificationError);
      // Continue without failing the request
    }

    // Send email notification
    try {
      const { sendPaymentRequestEmail } = require('../utils/email');
      if (order.user && order.user.email) {
        await sendPaymentRequestEmail(order.user.email, order);
      } else {
        console.error('User email not available for payment request email');
      }
    } catch (emailError) {
      console.error('Error sending payment request email:', emailError);
      // Continue without failing the request
    }

    res.json(order);
  } catch (error) {
    console.error('Request payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status (Admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const oldStatus = order.status;
    order.status = status;
    if (notes) order.adminNotes = notes;
    order.updatedAt = new Date();

    // Deactivate chat when order is delivered or completed
    if (status === 'delivered' || status === 'completed') {
      order.chatEnabled = false;
      if (order.chatId) {
        await Chat.findByIdAndUpdate(order.chatId, { isActive: false });
      }
    }

    await order.save();
    await order.populate('user', 'name email');
    await order.populate('items.product', 'name price images');
    await order.populate('items.course', 'title price image');

    // Create notification based on status change
    let notificationType, message;

    switch (status) {
      case 'order_received':
        notificationType = 'payment_verified';
        message = `Your payment has been verified. Order #${order._id} has been placed successfully!`;
        break;
      case 'in_progress':
        notificationType = 'order_status';
        message = `Your order #${order._id} is now being prepared.`;
        break;
      case 'ready_for_delivery':
        notificationType = 'order_status';
        message = `Your order #${order._id} is ready for delivery/pickup.`;
        // Reset delivery reminder flag when order becomes ready for delivery
        order.deliveryReminderSent = false;
        break;
      case 'delivered':
        notificationType = 'order_status';
        message = `Your order #${order._id} has been delivered successfully.`;
        
        // Send order delivered email
        try {
          if (order.user && order.user.email) {
            await sendOrderDeliveredEmail(order.user.email, order);
          }
        } catch (emailError) {
          console.error('Error sending order delivered email:', emailError);
        }
        break;
      case 'completed':
        notificationType = 'order_status';
        message = `Your order #${order._id} has been completed. Thank you for your business!`;
        break;
      default:
        notificationType = 'order_status';
        message = `Your order #${order._id} status has been updated to ${status.replace(/_/g, ' ')}.`;
    }

    await createOrderNotification(order, notificationType, message);

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Manual payment functions removed - only Razorpay is supported

// Get all orders (Admin only)
const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = status && status !== 'all' ? { status } : {};

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name price images')
      .populate('items.course', 'title price image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if user has pending payment orders for specific products or courses
const checkPendingPayments = async (req, res) => {
  try {
    const { productIds, courseIds } = req.query; // comma-separated IDs

    if (!productIds && !courseIds) {
      return res.status(400).json({ message: 'Product IDs or Course IDs are required' });
    }

    const pendingItems = [];

    // Check for pending products
    if (productIds) {
      const productIdArray = productIds.split(',').map(id => new mongoose.Types.ObjectId(id.trim()));
      const pendingProductOrders = await Order.find({
        user: req.user._id,
        status: { $in: ['payment_pending', 'approved'] },
        'items.product': { $in: productIdArray },
        'items.type': 'product'
      }).populate('items.product', 'name');

      pendingProductOrders.forEach(order => {
        order.items.forEach(item => {
          if (item.type === 'product' && item.product && productIdArray.some(id => id.equals(item.product._id))) {
            pendingItems.push({
              itemId: item.product._id,
              itemName: item.product.name,
              itemType: 'product',
              orderId: order._id,
              orderStatus: order.status
            });
          }
        });
      });
    }

    // Check for pending courses
    if (courseIds) {
      const courseIdArray = courseIds.split(',').map(id => new mongoose.Types.ObjectId(id.trim()));
      const pendingCourseOrders = await Order.find({
        user: req.user._id,
        status: { $in: ['payment_pending', 'approved'] },
        'items.course': { $in: courseIdArray },
        'items.type': 'course'
      }).populate('items.course', 'title');

      pendingCourseOrders.forEach(order => {
        order.items.forEach(item => {
          if (item.type === 'course' && item.course && courseIdArray.some(id => id.equals(item.course._id))) {
            pendingItems.push({
              itemId: item.course._id,
              itemName: item.course.title,
              itemType: 'course',
              orderId: order._id,
              orderStatus: order.status
            });
          }
        });
      });
    }

    res.json({
      hasPendingPayments: pendingItems.length > 0,
      pendingItems
    });
  } catch (error) {
    console.error('Check pending payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin verify payment
const verifyPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'payment_submitted') {
      return res.status(400).json({ message: 'Payment can only be verified for orders with submitted payment proof' });
    }

    order.status = 'order_received';
    order.adminNotes = req.body.adminNotes || '';
    order.updatedAt = new Date();

    await order.save();
    await order.populate('user', 'name email');
    await order.populate('items.product', 'name price images');
    await order.populate('items.course', 'title price image');

    // Update stock when payment is verified
    await order.updateStock();

    // Send payment confirmation email
    await sendPaymentConfirmationEmail(order.user.email, order);

    // Create notification
    await createOrderNotification(order, 'payment_verified', 'Your payment has been verified! Order placed successfully!');

    res.json(order);
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create Razorpay payment order
const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'payment_pending' && order.status !== 'approved' && order.status !== 'pending_approval') {
      return res.status(400).json({ message: 'Payment can only be initiated for orders pending payment or approval' });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(order.totalAmount * 100), // Amount in paisa
      currency: 'INR',
      receipt: `order_${order._id}`,
      payment_capture: 1, // Auto capture
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Update order with Razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;
    order.paymentMethod = 'razorpay';
    await order.save();

    res.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
};

// Verify Razorpay payment
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Find order by Razorpay order ID
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify payment signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Update order status
    order.status = 'order_received';
    order.razorpayPaymentId = razorpay_payment_id;
    order.updatedAt = new Date();

    // Handle course purchases differently - grant immediate access
    if (order.isCoursePurchase) {
      order.status = 'completed';

      // Grant course access to user
      const user = await User.findById(order.user);
      const courseItem = order.items.find(item => item.type === 'course');
      if (courseItem && courseItem.course) {
        // Check if user already has this course
        const existingCourseIndex = user.purchasedCourses.findIndex(p => p.course.toString() === courseItem.course.toString());
        if (existingCourseIndex >= 0) {
          // Update existing course access expiry
          user.purchasedCourses[existingCourseIndex].accessExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
          user.purchasedCourses[existingCourseIndex].purchaseDate = new Date();
        } else {
          // Add new course purchase
          user.purchasedCourses.push({
            course: courseItem.course,
            purchaseDate: new Date(),
            accessExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
          });
        }
        await user.save();

        // Increment enrolled count for the course
        await Course.findByIdAndUpdate(courseItem.course, { $inc: { enrolledCount: 1 } });
      }
    }

    await order.save();
    await order.populate('user', 'name email');
    await order.populate('items.product', 'name price images');
    await order.populate('items.course', 'title price image');

    // Update stock when payment is verified (only for product orders)
    if (!order.isCoursePurchase) {
      await order.updateStock();
    }

    // Send payment confirmation email
    try {
      await sendPaymentConfirmationEmail(order.user.email, order);
    } catch (emailError) {
      console.error('Error sending payment confirmation email:', emailError);
    }

    // Send detailed receipt emails
    try {
      // Send customer receipt email
      await sendCustomerReceiptEmail(order.user.email, order);

      // Send admin receipt email
      const adminUsers = await User.find({ role: 'admin' });
      for (const admin of adminUsers) {
        if (admin.email) {
          await sendAdminReceiptEmail(admin.email, order, {
            customerName: order.user.name,
            customerEmail: order.user.email,
            customerPhone: order.shippingAddress?.phone || order.mobileNumber
          });
        }
      }
    } catch (receiptError) {
      console.error('Error sending receipt emails:', receiptError);
      // Continue without failing the request
    }

    // Create notification
    await createOrderNotification(order, 'payment_verified', 'Your payment has been verified! Order placed successfully!');

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};

// Download invoice PDF
const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('user', 'name email')
      .populate('items.product', 'name price images')
      .populate('items.course', 'title price image');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow download for paid orders
    if (order.status !== 'order_received' && order.status !== 'in_progress' && order.status !== 'ready_for_delivery' && order.status !== 'delivered' && order.status !== 'completed') {
      return res.status(400).json({ message: 'Invoice is only available for paid orders' });
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(order);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send the PDF buffer
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download invoice error:', error);
    res.status(500).json({ message: 'Failed to generate invoice' });
  }
};

// Mark order as delivered
const markOrderDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order status to delivered
    order.status = 'delivered';
    order.updatedAt = new Date();
    await order.save();
    
    // Populate user and items for email
    await order.populate('user', 'name email');
    await order.populate('items.product', 'name price images');
    await order.populate('items.course', 'title price image');
    
    // Send delivery confirmation email
    try {
      await sendOrderDeliveredEmail(order.user.email, order);
    } catch (emailError) {
      console.error('Error sending order delivered email:', emailError);
    }
    
    // Create notification for delivery
    await createOrderNotification(order, 'order_delivered', 'Your order has been delivered successfully! Thank you for shopping with us.');
    
    res.json({ success: true, message: 'Order marked as delivered successfully' });
  } catch (error) {
    console.error('Error marking order as delivered:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserOrders,
  getOrder,
  createOrder,
  createCoursePurchase,
  approveOrder,
  rejectOrder,
  requestPayment,
  updateOrderStatus,
  verifyPayment,
  getAllOrders,
  checkPendingPayments,
  createPaymentOrder,
  verifyRazorpayPayment,
  downloadInvoice,
  markOrderDelivered
};
