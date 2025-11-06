const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getPurchasedCourses
} = require('../controllers/courseController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

// Public routes
router.get('/', getCourses);
router.get('/:id', authenticateToken, getCourse);

// Protected routes
router.get('/user/purchased', authenticateToken, getPurchasedCourses);

// Admin routes
router.post('/', authenticateToken, requireAdmin, uploadImage.single('thumbnail'), createCourse);
router.put('/:id', authenticateToken, requireAdmin, uploadImage.single('thumbnail'), updateCourse);
router.delete('/:id', authenticateToken, requireAdmin, deleteCourse);

module.exports = router;
