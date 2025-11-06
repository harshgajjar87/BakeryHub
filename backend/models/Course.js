const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    required: true,
    enum: ['recorded', 'live']
  },
  thumbnail: {
    type: String, // Cloudinary URL
    required: true
  },
  content: {
    videoUrl: String, // For recorded courses (Cloudinary URL)
    meetLink: String, // For live courses
    duration: String, // e.g., "2 hours", "3 sessions"
    schedule: String // For live courses
  },
  modules: [{
    title: String,
    link: String, // Google Drive link
    duration: String
  }],
  materials: String, // Google Drive link for materials
  isActive: {
    type: Boolean,
    default: true
  },
  enrolledCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
