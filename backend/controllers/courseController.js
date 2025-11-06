const Course = require('../models/Course');
const User = require('../models/User');

// Get all courses
const getCourses = async (req, res) => {
  try {
    const { type, page = 1, limit = 12, search } = req.query;

    let query = { isActive: true };

    if (type && type !== 'all') {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(query);

    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single course
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user has purchased this course
    let hasAccess = false;
    if (req.user) {
      const user = await User.findById(req.user._id);
      hasAccess = user.purchasedCourses.some(purchase => purchase.course.toString() === course._id.toString());
    }

    res.json({
      ...course.toObject(),
      hasAccess
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create course (Admin only)
const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      instructor,
      price,
      type,
      videoUrl,
      meetLink,
      duration,
      schedule,
      modules,
      materials
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Course thumbnail is required' });
    }

    const course = new Course({
      title,
      description,
      instructor,
      price: parseFloat(price),
      type,
      thumbnail: req.file.path, // Cloudinary URL
      content: {
        videoUrl: type === 'recorded' ? videoUrl : null,
        meetLink: type === 'live' ? meetLink : null,
        duration,
        schedule: type === 'live' ? schedule : null
      },
      modules: modules ? JSON.parse(modules) : [],
      materials: materials || null
    });

    await course.save();

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update course (Admin only)
const updateCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      instructor,
      price,
      type,
      videoUrl,
      meetLink,
      duration,
      schedule,
      modules,
      materials,
      isActive
    } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.instructor = instructor || course.instructor;
    course.price = price ? parseFloat(price) : course.price;
    course.type = type || course.type;
    course.content = {
      videoUrl: type === 'recorded' ? (videoUrl || course.content.videoUrl) : null,
      meetLink: type === 'live' ? (meetLink || course.content.meetLink) : null,
      duration: duration || course.content.duration,
      schedule: type === 'live' ? (schedule || course.content.schedule) : null
    };
    course.modules = modules ? JSON.parse(modules) : course.modules;
    course.materials = materials || course.materials;
    course.isActive = isActive !== undefined ? isActive : course.isActive;

    if (req.file) {
      course.thumbnail = req.file.path; // Update thumbnail if provided
    }

    await course.save();

    res.json({
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete course (Admin only)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's purchased courses
const getPurchasedCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('purchasedCourses.course');

    res.json(user.purchasedCourses);
  } catch (error) {
    console.error('Get purchased courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getPurchasedCourses
};
