const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

// Load environment variables
dotenv.config();

// Initialize Razorpay
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const courseRoutes = require('./routes/courses');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notifications');
const wishlistRoutes = require('./routes/wishlist');
const contactRoutes = require('./routes/contact_new');

// Import models and utilities for cron jobs
const Order = require('./models/Order');
const User = require('./models/User');
const { sendDeliveryReminderEmail } = require('./utils/email');

const app = express();


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Initialize server
const startServer = async () => {
  await connectDB();

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/wishlist', wishlistRoutes);
app.use('/api/contact', contactRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
  });

  // Set up cron job for delivery reminders
  // Run every hour to check for orders ready for delivery within 12 hours
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Running delivery reminder cron job...');

      // Calculate 12 hours from now
      const twelveHoursFromNow = new Date();
      twelveHoursFromNow.setHours(twelveHoursFromNow.getHours() + 12);

      // Find orders that are ready for delivery, delivery date is within 12 hours,
      // and reminder hasn't been sent yet
      const ordersToRemind = await Order.find({
        status: 'ready_for_delivery',
        deliveryDate: {
          $lte: twelveHoursFromNow,
          $gt: new Date() // delivery date is in the future
        },
        deliveryReminderSent: false
      }).populate('user', 'email name');

      console.log(`Found ${ordersToRemind.length} orders to send reminders for`);

      for (const order of ordersToRemind) {
        try {
          await sendDeliveryReminderEmail(order.user.email, order);
          // Mark reminder as sent
          order.deliveryReminderSent = true;
          await order.save();
          console.log(`Delivery reminder sent for order ${order._id}`);
        } catch (emailError) {
          console.error(`Failed to send delivery reminder for order ${order._id}:`, emailError);
        }
      }
    } catch (error) {
      console.error('Delivery reminder cron job error:', error);
    }
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

