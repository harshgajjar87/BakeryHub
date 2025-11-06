const mongoose = require('mongoose');

const paymentQRSchema = new mongoose.Schema({
  paymentMethod: {
    type: String,
    required: true,
    trim: true
  },
  qrImage: {
    type: String,
    required: true // Cloudinary URL or file path
  },
  accountDetails: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PaymentQR', paymentQRSchema);
