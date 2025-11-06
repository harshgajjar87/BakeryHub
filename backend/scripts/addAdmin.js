const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Add admin user
async function addAdmin() {
  try {
    const adminData = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create new admin user
    const admin = new User(adminData);
    await admin.save();

    console.log('Admin user created successfully');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Main function
async function main() {
  await connectDB();
  await addAdmin();
  await mongoose.connection.close();
  console.log('Database connection closed');
}

main();
