const Product = require('../models/Product');

// Get all products
const getProducts = async (req, res) => {
  try {
    const { category, page = 1, limit = 12, search } = req.query;

    let query = { isAvailable: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single product
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create product (Admin only)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, weight, isAvailable } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'Name, description, price, and category are required' });
    }

    // Validate category enum
    const validCategories = ['cakes', 'cupcakes', 'pastries', 'cookies', 'bread', 'other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Validate price
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ message: 'Invalid price' });
    }

    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      category,
      image: req.file.path, // Cloudinary URL
      weight: weight ? weight.trim() : undefined,
      isAvailable: isAvailable !== undefined ? isAvailable === 'true' || isAvailable === true : true
    });

    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error: ' + error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Update product (Admin only)
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, weight, isAvailable } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price ? parseFloat(price) : product.price;
    product.category = category || product.category;
    product.weight = weight || product.weight;
    product.isAvailable = isAvailable !== undefined ? isAvailable : product.isAvailable;

    if (req.file) {
      product.image = req.file.path; // Update image if provided
    }

    await product.save();

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete product (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get product categories
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
};
