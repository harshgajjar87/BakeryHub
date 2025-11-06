const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['product', 'course'],
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  customizationPrice: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending_approval', 'approved', 'customization_pending', 'payment_pending', 'payment_submitted', 'paid', 'order_received', 'in_progress', 'ready_for_delivery', 'delivered', 'completed', 'rejected'],
    default: 'pending_approval'
  },
  paymentProof: {
    type: String, // Cloudinary URL for uploaded payment screenshot
    default: null
  },
  paymentReferenceId: {
    type: String, // UPI reference ID
    default: null
  },
  razorpayOrderId: {
    type: String,
    default: null
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay'],
    default: 'razorpay'
  },
  shippingAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  notes: String,
  adminNotes: String,
  deliveryDate: {
    type: Date,
    required: function() {
      return !this.isCoursePurchase;
    }
  },
  deliveryMethod: {
    type: String,
    enum: ['pickup', 'delivery', 'digital'],
    required: true
  },
  deliveryReminderSent: {
    type: Boolean,
    default: false
  },
  customizationRequired: {
    type: Boolean,
    default: false
  },
  customizationDetails: String,
  chatEnabled: {
    type: Boolean,
    default: false
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  },
  mobileNumber: {
    type: String,
    default: null
  },
  isCoursePurchase: {
    type: Boolean,
    default: false
  },
  courseAccessExpiry: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Update product stock when order is marked as paid
orderSchema.methods.updateStock = async function() {
  for (const item of this.items) {
    if (item.type === 'product') {
      const Product = mongoose.model('Product');
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }
  }
};

module.exports = mongoose.model('Order', orderSchema);
