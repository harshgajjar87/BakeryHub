const Chat = require('../models/Chat');
const Order = require('../models/Order');

// Get chat for an order
const getChat = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Verify user has access to this order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!order.chatEnabled) {
      return res.status(400).json({ message: 'Chat is not enabled for this order' });
    }

    let chat = await Chat.findOne({ order: orderId })
      .populate('participants', 'name email profile.profileImage')
      .populate('messages.sender', 'name email profile.profileImage');

    if (!chat) {
      // Create chat if order has chat enabled but no chat exists
      if (order.chatEnabled) {
        const newChat = new Chat({
          order: orderId,
          participants: [order.user], // Add customer as participant
          isActive: true
        });
        await newChat.save();

        // Update order with chatId
        order.chatId = newChat._id;
        await order.save();

        // Populate and return the new chat
        await newChat.populate('participants', 'name email profile.profileImage');
        await newChat.populate('messages.sender', 'name email profile.profileImage');
        return res.json(newChat);
      } else {
        return res.status(404).json({ message: 'Chat not found' });
      }
    }

    res.json(chat);
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send message in chat
const sendMessage = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { content, messageType = 'text' } = req.body;

    // For image messages, content is the image URL from upload
    if (messageType === 'text' && (!content || !content.trim())) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Verify user has access to this order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!order.chatEnabled) {
      return res.status(400).json({ message: 'Chat is not enabled for this order' });
    }

    let chat = await Chat.findOne({ order: orderId });
    if (!chat) {
      // Create chat if order has chat enabled but no chat exists
      if (order.chatEnabled) {
        const newChat = new Chat({
          order: orderId,
          participants: [order.user], // Add customer as participant
          isActive: true
        });
        await newChat.save();

        // Update order with chatId
        order.chatId = newChat._id;
        await order.save();

        chat = newChat;
      } else {
        return res.status(404).json({ message: 'Chat not found' });
      }
    }

    // Add message to chat
    const newMessage = {
      sender: req.user._id,
      content: messageType === 'text' ? content.trim() : content,
      messageType,
      timestamp: new Date()
    };

    chat.messages.push(newMessage);
    chat.lastMessage = new Date();
    await chat.save();

    // Populate the new message for response
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

// Upload image for chat
const uploadChatImage = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Verify user has access to this order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!order.chatEnabled) {
      return res.status(400).json({ message: 'Chat is not enabled for this order' });
    }

    // Send message with image URL
    const imageUrl = req.file.path; // Cloudinary URL

    const response = await sendMessage({
      params: { orderId },
      body: { content: imageUrl, messageType: 'image' },
      user: req.user
    }, res);

  } catch (error) {
    console.error('Upload chat image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's chats
const getUserChats = async (req, res) => {
  try {
    let chats;

    if (req.user.role === 'admin') {
      // Admin sees all chats
      chats = await Chat.find({ isActive: true })
        .populate('order', 'status deliveryDate totalAmount')
        .populate('participants', 'name email profile.profileImage')
        .sort({ lastMessage: -1 });
    } else {
      // Customer sees only their chats
      const orders = await Order.find({
        user: req.user._id,
        chatEnabled: true
      }).select('_id');

      const orderIds = orders.map(order => order._id);

      chats = await Chat.find({
        order: { $in: orderIds },
        isActive: true
      })
        .populate('order', 'status deliveryDate totalAmount')
        .populate('participants', 'name email profile.profileImage')
        .sort({ lastMessage: -1 });
    }

    res.json(chats);
  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
  try {
    const { orderId } = req.params;

    const chat = await Chat.findOne({ order: orderId });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Mark messages not sent by current user as read
    chat.messages.forEach(message => {
      if (message.sender.toString() !== req.user._id.toString()) {
        message.read = true;
      }
    });

    await chat.save();

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Deactivate chat (Admin only)
const deactivateChat = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order to disable chat
    order.chatEnabled = false;
    await order.save();

    // Update chat to inactive
    const chat = await Chat.findOneAndUpdate(
      { order: orderId },
      { isActive: false },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json({ message: 'Chat deactivated successfully' });
  } catch (error) {
    console.error('Deactivate chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getChat,
  sendMessage,
  uploadChatImage,
  getUserChats,
  markMessagesAsRead,
  deactivateChat
};
