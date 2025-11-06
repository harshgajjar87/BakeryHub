const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage for product/course images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bakery/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});

// Storage for payment proofs
const paymentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bakery/payments',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});

// Storage for course videos
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bakery/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv']
  }
});

// Storage for payment QR codes
const qrStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bakery/qr-codes',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

// Storage for chat images
const chatImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bakery/chat-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});

// Multer upload instances
const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const uploadPayment = multer({
  storage: paymentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image or PDF files are allowed!'), false);
    }
  }
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

const uploadQR = multer({
  storage: qrStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const uploadChatImage = multer({
  storage: chatImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

module.exports = {
  uploadImage,
  uploadPayment,
  uploadVideo,
  uploadQR,
  uploadChatImage
};
