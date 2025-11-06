const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  otp: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profile: {
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    profileImage: String // Cloudinary URL for profile image
  },
  purchasedCourses: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    purchaseDate: {
      type: Date,
      default: Date.now
    },
    accessExpiry: {
      type: Date,
      default: function() {
        // Set expiry to 1 year from purchase date
        const expiryDate = new Date(this.purchaseDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        return expiryDate;
      }
    }
  }],
  productWishlist: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  courseWishlist: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
