const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
});

const chatSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  messages: [messageSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessage: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatSchema.index({ order: 1 });
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessage: -1 });

module.exports = mongoose.model('Chat', chatSchema);
