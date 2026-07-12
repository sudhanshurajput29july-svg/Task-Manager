import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please fill in all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Create user strictly as employee
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: 'employee',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please fill in all fields');
    }

    // Check for user email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all employees
// @route   GET /api/auth/employees
// @access  Private (Admin or Authenticated)
const getEmployees = async (req, res, next) => {
  try {
    const employees = await User.find({ _id: { $ne: req.user._id } }).select('name email role avatar');
    res.json(employees);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new employee (Admin only)
// @route   POST /api/auth/employees
// @access  Private (Admin)
const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please fill in all fields');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('Employee already exists with this email');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'employee',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400);
      throw new Error('Invalid employee data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.avatar !== undefined) {
        user.avatar = req.body.avatar;
      }
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar || '',
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Upload avatar
// @route   POST /api/auth/profile/upload
// @access  Private
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload an image file');
    }

    if (isCloudinaryConfigured) {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'task_manager_avatars' },
        async (error, result) => {
          if (error) {
            return next(error);
          }
          res.json({ url: result.secure_url });
        }
      );
      stream.end(req.file.buffer);
    } else {
      // Fallback to Base64 data URI
      const base64Image = req.file.buffer.toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;
      res.json({ url: dataURI });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee role (Admin only)
// @route   PUT /api/auth/employees/:id/role
// @access  Private (Admin)
const updateEmployeeRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['employee', 'admin'].includes(role)) {
      res.status(400);
      throw new Error('Please provide a valid role (employee or admin)');
    }

    const employee = await User.findById(req.params.id);

    if (!employee) {
      res.status(404);
      throw new Error('User not found');
    }

    employee.role = role;
    await employee.save();

    res.json({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

export { registerUser, loginUser, getEmployees, createEmployee, updateProfile, uploadAvatar, updateEmployeeRole, getUserProfile };
