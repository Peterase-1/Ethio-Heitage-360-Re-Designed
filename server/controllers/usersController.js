const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Museum = require('../models/Museum');
const { validationResult } = require('express-validator');
const dbUtils = require('../utils/dbUtils');
const { dbUtils: connectionUtils } = require('../config/database');

/**
 * User Controller - Database Operations for EthioHeritage360
 * Handles all user-related database operations with enhanced functionality
 */

// @desc    Get all users with pagination and filtering
// @route   GET /api/users
// @access  Private (SuperAdmin/MuseumAdmin)
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      isActive,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query filters
    let query = User.find();
    
    // Role filter
    if (role && role !== 'all') {
      query = query.where('role', role);
    }
    
    // Active status filter
    if (isActive !== undefined) {
      query = query.where('isActive', isActive === 'true');
    }
    
    // Search functionality
    if (search) {
      const searchQuery = dbUtils.buildSearchQuery(search, [
        'firstName', 'lastName', 'email', 'name'
      ]);
      query = query.where(searchQuery);
    }
    
    // Sorting
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
    query = query.sort(sortObj);
    
    // Pagination
    const paginatedResult = await dbUtils.paginate(
      query, 
      parseInt(page), 
      parseInt(limit)
    );
    
    // Remove sensitive data from response
    paginatedResult.data = paginatedResult.data.map(user => {
      const userObj = user.toObject();
      delete userObj.password;
      delete userObj.refreshToken;
      delete userObj.emailVerificationToken;
      delete userObj.passwordResetToken;
      return userObj;
    });
    
    res.json({
      success: true,
      message: 'Users retrieved successfully',
      ...paginatedResult
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!dbUtils.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    const user = await User.findById(id)
      .populate('museumId', 'name location')
      .populate('favoriteMuseums', 'name location')
      .select('-password -refreshToken -emailVerificationToken -passwordResetToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: user
    });
    
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate ObjectId
    if (!dbUtils.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    // Remove sensitive fields from update
    const sensitiveFields = [
      'password', 'refreshToken', 'emailVerificationToken', 
      'passwordResetToken', 'role', 'permissions'
    ];
    sensitiveFields.forEach(field => delete updateData[field]);
    
    // Clean empty values
    const cleanedData = dbUtils.cleanObject(updateData);
    
    const user = await User.findByIdAndUpdate(
      id,
      { ...cleanedData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -emailVerificationToken -passwordResetToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
    
  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (SuperAdmin/MuseumAdmin)
const getUserStats = async (req, res) => {
  try {
    // Get platform statistics from User model
    const platformStats = await User.getPlatformStats();
    
    // Get collection statistics
    const collectionStats = await dbUtils.getCollectionStats('users');
    
    res.json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: {
        platform: platformStats,
        collection: collectionStats
      }
    });
    
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create stub functions for missing route handlers
const createUser = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Create user functionality not implemented yet'
  });
};

const deleteUser = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Delete user functionality not implemented yet'
  });
};

const getUsersByMuseum = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Get users by museum functionality not implemented yet'
  });
};

const activateUser = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Activate user functionality not implemented yet'
  });
};

const deactivateUser = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Deactivate user functionality not implemented yet'
  });
};

const changeUserRole = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Change user role functionality not implemented yet'
  });
};

const updateUserPermissions = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Update user permissions functionality not implemented yet'
  });
};

const assignUserToMuseum = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Assign user to museum functionality not implemented yet'
  });
};

const getUserActivity = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Get user activity functionality not implemented yet'
  });
};

const getUserBookmarks = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Get user bookmarks functionality not implemented yet'
  });
};

const addBookmark = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Add bookmark functionality not implemented yet'
  });
};

const removeBookmark = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Remove bookmark functionality not implemented yet'
  });
};

const getFavoriteMuseums = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Get favorite museums functionality not implemented yet'
  });
};

const addFavoriteMuseum = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Add favorite museum functionality not implemented yet'
  });
};

const removeFavoriteMuseum = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Remove favorite museum functionality not implemented yet'
  });
};

const updateUserPreferences = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Update user preferences functionality not implemented yet'
  });
};

module.exports = {
  getAllUsers: getUsers,
  getUser: getUserById,
  updateUser,
  getUserStats,
  getUsersByMuseum,
  createUser,
  deleteUser,
  activateUser,
  deactivateUser,
  changeUserRole,
  updateUserPermissions,
  assignUserToMuseum,
  getUserActivity,
  getUserBookmarks,
  addBookmark,
  removeBookmark,
  getFavoriteMuseums,
  addFavoriteMuseum,
  removeFavoriteMuseum,
  updateUserPreferences
};
