const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
} = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);

// Admin routes with error handling for file uploads
const handleUpload = (req, res, next) => {
  uploadImage.single('image')(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).json({ message: 'File upload error: ' + err.message });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(400).json({ message: err.message });
    }
    // Everything went fine.
    next();
  });
};

router.post('/', authenticateToken, requireAdmin, handleUpload, createProduct);
router.put('/:id', authenticateToken, requireAdmin, handleUpload, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

module.exports = router;
