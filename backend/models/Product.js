const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['cakes', 'cupcakes', 'pastries', 'cookies', 'bread', 'other']
  },
  image: {
    type: String, // Cloudinary URL
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  weight: String // e.g., "500g", "1kg"
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
