const express = require('express');
const router = express.Router();
const {
  getProductWishlist,
  getCourseWishlist,
  addProductToWishlist,
  addCourseToWishlist,
  removeProductFromWishlist,
  removeCourseFromWishlist,
  checkProductWishlistStatus,
  checkCourseWishlistStatus
} = require('../controllers/wishlistController');
const { authenticateToken } = require('../middleware/auth');

// All wishlist routes require authentication
router.use(authenticateToken);

// Product wishlist routes
router.get('/products', getProductWishlist);
router.post('/products', addProductToWishlist);
router.delete('/products/:productId', removeProductFromWishlist);
router.get('/products/check/:productId', checkProductWishlistStatus);

// Course wishlist routes
router.get('/courses', getCourseWishlist);
router.post('/courses', addCourseToWishlist);
router.delete('/courses/:courseId', removeCourseFromWishlist);
router.get('/courses/check/:courseId', checkCourseWishlistStatus);

module.exports = router;
