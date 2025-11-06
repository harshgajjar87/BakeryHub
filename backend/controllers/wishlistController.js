const User = require('../models/User');
const Product = require('../models/Product');
const Course = require('../models/Course');

// Get user's product wishlist
const getProductWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'productWishlist.product',
        model: 'Product'
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out any items that might have been deleted
    const validWishlist = user.productWishlist.filter(item => item.product !== null);

    res.json({
      wishlist: validWishlist,
      count: validWishlist.length
    });
  } catch (error) {
    console.error('Get product wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's course wishlist
const getCourseWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'courseWishlist.course',
        model: 'Course'
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out any items that might have been deleted
    const validWishlist = user.courseWishlist.filter(item => item.course !== null);

    res.json({
      wishlist: validWishlist,
      count: validWishlist.length
    });
  } catch (error) {
    console.error('Get course wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add product to wishlist
const addProductToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const item = await Product.findById(productId);
    if (!item) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if item is already in wishlist
    const existingItem = user.productWishlist.find(wishlistItem =>
      wishlistItem.product && wishlistItem.product.toString() === productId
    );

    if (existingItem) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    // Add item to wishlist
    const wishlistItem = {
      product: productId,
      addedAt: new Date()
    };

    user.productWishlist.push(wishlistItem);
    await user.save();

    res.json({
      message: 'Product added to wishlist',
      wishlistItem: {
        product: item,
        addedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Add product to wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add course to wishlist
const addCourseToWishlist = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const item = await Course.findById(courseId);
    if (!item) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if item is already in wishlist
    const existingItem = user.courseWishlist.find(wishlistItem =>
      wishlistItem.course && wishlistItem.course.toString() === courseId
    );

    if (existingItem) {
      return res.status(400).json({ message: 'Course already in wishlist' });
    }

    // Add item to wishlist
    const wishlistItem = {
      course: courseId,
      addedAt: new Date()
    };

    user.courseWishlist.push(wishlistItem);
    await user.save();

    res.json({
      message: 'Course added to wishlist',
      wishlistItem: {
        course: item,
        addedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Add course to wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove product from wishlist
const removeProductFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find and remove the item from product wishlist
    const itemIndex = user.productWishlist.findIndex(item =>
      item.product && item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }

    user.productWishlist.splice(itemIndex, 1);
    await user.save();

    res.json({ message: 'Product removed from wishlist' });
  } catch (error) {
    console.error('Remove product from wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove course from wishlist
const removeCourseFromWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find and remove the item from course wishlist
    const itemIndex = user.courseWishlist.findIndex(item =>
      item.course && item.course.toString() === courseId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Course not found in wishlist' });
    }

    user.courseWishlist.splice(itemIndex, 1);
    await user.save();

    res.json({ message: 'Course removed from wishlist' });
  } catch (error) {
    console.error('Remove course from wishlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if product is in wishlist
const checkProductWishlistStatus = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isInWishlist = user.productWishlist.some(item =>
      item.product && item.product.toString() === productId
    );

    res.json({ isInWishlist });
  } catch (error) {
    console.error('Check product wishlist status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if course is in wishlist
const checkCourseWishlistStatus = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isInWishlist = user.courseWishlist.some(item =>
      item.course && item.course.toString() === courseId
    );

    res.json({ isInWishlist });
  } catch (error) {
    console.error('Check course wishlist status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProductWishlist,
  getCourseWishlist,
  addProductToWishlist,
  addCourseToWishlist,
  removeProductFromWishlist,
  removeCourseFromWishlist,
  checkProductWishlistStatus,
  checkCourseWishlistStatus
};
