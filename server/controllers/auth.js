const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const config = require('../config/env');
const { sendEmail } = require('../utils/email');
const dbUtils = require('../utils/dbUtils');
const { dbUtils: connectionUtils } = require('../config/database');

// Generate JWT Token
const generateToken = (userId, role, museumId = null) => {
  const payload = {
    user: {
      id: userId,
      role: role,
      museumId: museumId
    }
  };

  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Generate Refresh Token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || config.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    console.log('🟢 BACKEND REGISTER: Registration request received');
    console.log('📋 BACKEND REGISTER: Request body:', {
      ...req.body,
      password: '[HIDDEN]'
    });

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ BACKEND REGISTER: Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, firstName, lastName, email, password, role, museumName, organizerCompany } = req.body;
    console.log('📝 BACKEND REGISTER: Extracted data:', {
      name,
      firstName,
      lastName,
      email,
      role,
      password: '[HIDDEN]',
      museumName,
      organizerCompany
    });

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Normalize role to match model enum
    const roleMap = {
      visitor: 'user',
      user: 'user',
      admin: 'museumAdmin',
      museum: 'museumAdmin',
      museum_admin: 'museumAdmin',
      super_admin: 'superAdmin',
      superAdmin: 'superAdmin',
      museumAdmin: 'museumAdmin',
      tour_admin: 'organizer',
      organizer: 'organizer'
    };
    const normalizedRole = roleMap[(role || '').toString()] || 'user';
    console.log('🔄 BACKEND REGISTER: Role mapping:', {
      originalRole: role,
      normalizedRole,
      roleMap
    });

    // Derive first/last name from single name if needed
    let fName = firstName;
    let lName = lastName;
    if ((!fName || !lName) && name) {
      const parts = name.trim().split(/\s+/);
      fName = fName || parts[0];
      lName = lName || (parts.slice(1).join(' ') || '');
    }

    // If still missing, return 400 with helpful message
    if (!fName || !lName) {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required',
        hint: 'Provide firstName and lastName, or a single name that includes both.'
      });
    }

    // Create user data object aligned with schema
    const userData = {
      firstName: fName,
      lastName: lName,
      name: name || `${fName} ${lName}`,
      email,
      password,
      role: normalizedRole
    };

    // Optional: role-specific info from legacy clients (ignored by schema if unknown)
    if (role === 'museum' && museumName) {
      userData.museumInfo = { name: museumName };
    }
    if (role === 'organizer' && organizerCompany) {
      userData.organizerInfo = { company: organizerCompany };
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    await user.save();

    // Generate JWT token and refresh token
    const token = generateToken(user._id, user.role, user.museumId);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in user record
    user.refreshToken = refreshToken;
    await user.save();

    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.emailVerificationToken;
    delete userResponse.refreshToken;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      refreshToken,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Handle validation errors cleanly
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.keys(error.errors).map((key) => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email and include password
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts. Try again later.'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment login attempts
      await user.incLoginAttempts();

      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token and refresh token
    const token = generateToken(user._id, user.role, user.museumId);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in user record
    user.refreshToken = refreshToken;
    await user.save();

    // Get learning profile data
    let learningProfileData = null;
    try {
      const LearningProgress = require('../models/LearningProgress');
      const Certificate = require('../models/Certificate');
      
      const [progress, certificates] = await Promise.all([
        LearningProgress.findOne({ userId: user._id }).lean(),
        Certificate.countDocuments({ userId: user._id, isValid: true })
      ]);
      
      learningProfileData = {
        enrolledCourses: user.learningProfile?.enrolledCourses?.length || 0,
        completedCourses: user.learningProfile?.learningStats?.completedCourses || 0,
        totalLessonsCompleted: progress?.overallStats?.totalLessonsCompleted || 0,
        totalTimeSpent: progress?.overallStats?.totalTimeSpent || 0,
        currentStreak: progress?.overallStats?.currentStreak || 0,
        averageScore: progress?.overallStats?.averageScore || 0,
        certificates,
        achievements: progress?.achievements?.length || 0,
        lastActivityDate: progress?.updatedAt || null
      };
    } catch (error) {
      console.log('Error fetching learning profile during login:', error.message);
      // Continue without learning data
    }

    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.loginAttempts;
    delete userResponse.lockUntil;
    delete userResponse.emailVerificationToken;
    delete userResponse.passwordResetToken;
    delete userResponse.passwordResetExpires;
    delete userResponse.refreshToken;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      refreshToken,
      user: userResponse,
      learningProfile: learningProfileData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -loginAttempts -lockUntil -emailVerificationToken -passwordResetToken -passwordResetExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    const userId = req.user?.id;

    // Clear refresh token from user record
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $unset: { refreshToken: 1 },
        lastLogout: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// @desc    Refresh authentication tokens
// @route   POST /api/auth/refresh
// @access  Public (requires valid refresh token)
const refreshTokens = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || config.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Find user with this refresh token
    const user = await User.findOne({
      _id: decoded.id,
      refreshToken: refreshToken,
      isActive: true
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token or user not found'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    // Update user's refresh token and last login
    user.refreshToken = newRefreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.loginAttempts;
    delete userResponse.lockUntil;
    delete userResponse.emailVerificationToken;
    delete userResponse.passwordResetToken;
    delete userResponse.passwordResetExpires;
    delete userResponse.refreshToken;

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      token: newToken,
      refreshToken: newRefreshToken,
      user: userResponse
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      error: error.message
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // In a real application, you would send an email here
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Password reset email sent (if email exists in our system)'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    // Set new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // Reset login attempts
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, address, preferences } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update basic fields
    if (name) user.name = name;
    if (phone) user.profile.phone = phone;
    if (bio) user.profile.bio = bio;
    if (address) user.profile.address = { ...user.profile.address, ...address };
    if (preferences) user.profile.preferences = { ...user.profile.preferences, ...preferences };

    await user.save();

    // Remove sensitive data
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.loginAttempts;
    delete userResponse.lockUntil;
    delete userResponse.emailVerificationToken;
    delete userResponse.passwordResetToken;
    delete userResponse.passwordResetExpires;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// =============== ADVANCED USER FEATURES ===============

// @desc    Get user statistics and analytics
// @route   GET /api/auth/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('profile.stats profile.gamification profile.activity');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Default stats structure
    const defaultStats = {
      totalPoints: 0,
      level: 1,
      streakDays: 0,
      artifactsViewed: 0,
      toursCompleted: 0,
      eventsAttended: 0,
      averageRating: 0
    };

    const stats = {
      ...defaultStats,
      ...user.profile?.stats,
      ...user.profile?.gamification
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user preferences
// @route   PUT /api/auth/preferences
// @access  Private
const updatePreferences = async (req, res) => {
  try {
    const { language, timezone, currency, notifications } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update preferences
    if (!user.profile) user.profile = {};
    if (!user.profile.preferences) user.profile.preferences = {};

    if (language) user.profile.preferences.language = language;
    if (timezone) user.profile.preferences.timezone = timezone;
    if (currency) user.profile.preferences.currency = currency;
    if (notifications) user.profile.preferences.notifications = { ...user.profile.preferences.notifications, ...notifications };

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.profile.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Follow another user
// @route   POST /api/auth/follow/:userId
// @access  Private
const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(userId)
    ]);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize social arrays if they don't exist
    if (!currentUser.profile) currentUser.profile = {};
    if (!currentUser.profile.social) currentUser.profile.social = {};
    if (!currentUser.profile.social.following) currentUser.profile.social.following = [];
    
    if (!targetUser.profile) targetUser.profile = {};
    if (!targetUser.profile.social) targetUser.profile.social = {};
    if (!targetUser.profile.social.followers) targetUser.profile.social.followers = [];

    // Check if already following
    if (currentUser.profile.social.following.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user'
      });
    }

    // Add to following/followers lists
    currentUser.profile.social.following.push(userId);
    targetUser.profile.social.followers.push(currentUserId);

    await Promise.all([
      currentUser.save(),
      targetUser.save()
    ]);

    res.json({
      success: true,
      message: 'User followed successfully'
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/auth/follow/:userId
// @access  Private
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(userId)
    ]);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove from following/followers lists
    if (currentUser.profile?.social?.following) {
      currentUser.profile.social.following = currentUser.profile.social.following.filter(
        id => id.toString() !== userId
      );
    }

    if (targetUser.profile?.social?.followers) {
      targetUser.profile.social.followers = targetUser.profile.social.followers.filter(
        id => id.toString() !== currentUserId
      );
    }

    await Promise.all([
      currentUser.save(),
      targetUser.save()
    ]);

    res.json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user activity log
// @route   GET /api/auth/activity
// @access  Private
const getUserActivity = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('profile.activity');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const activity = user.profile?.activity?.feed || [];

    res.json({
      success: true,
      activity: activity.slice(0, 50) // Limit to last 50 activities
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get personalized recommendations
// @route   GET /api/auth/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('profile.interests profile.social');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get users with similar interests (simplified algorithm)
    const currentFollowing = user.profile?.social?.following || [];
    const userInterests = user.profile?.interests || [];

    let recommendedUsers = [];
    if (userInterests.length > 0) {
      recommendedUsers = await User.find({
        _id: { $ne: req.user.id, $nin: currentFollowing },
        'profile.interests': { $in: userInterests },
        isActive: true
      })
      .select('firstName lastName email profile.interests profile.avatar')
      .limit(10);
    }

    // Mock recommendations for other content types
    const recommendations = {
      users: recommendedUsers,
      artifacts: [], // Would be populated from artifact service
      events: [],    // Would be populated from events service
      tours: []      // Would be populated from tours service
    };

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Award badge to user (admin only)
// @route   POST /api/auth/badge
// @access  Private (admin)
const earnBadge = async (req, res) => {
  try {
    const { userId, badgeId, name, description, icon, category } = req.body;

    // Check if current user is admin
    if (req.user.role !== 'superAdmin' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize badges array if it doesn't exist
    if (!user.profile) user.profile = {};
    if (!user.profile.gamification) user.profile.gamification = {};
    if (!user.profile.gamification.badges) user.profile.gamification.badges = [];

    // Check if badge already exists
    const existingBadge = user.profile.gamification.badges.find(b => b.badgeId === badgeId);
    if (existingBadge) {
      return res.status(400).json({
        success: false,
        message: 'User already has this badge'
      });
    }

    // Add new badge
    const newBadge = {
      badgeId,
      name,
      description,
      icon,
      category,
      earnedAt: new Date()
    };

    user.profile.gamification.badges.push(newBadge);

    // Update points (optional)
    if (!user.profile.gamification.totalPoints) user.profile.gamification.totalPoints = 0;
    user.profile.gamification.totalPoints += 100; // Award 100 points for badge

    await user.save();

    res.json({
      success: true,
      message: 'Badge awarded successfully',
      badge: newBadge
    });
  } catch (error) {
    console.error('Earn badge error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update weekly goals
// @route   PUT /api/auth/weekly-goals
// @access  Private
const updateWeeklyGoals = async (req, res) => {
  try {
    const { artifactsToView, toursToBook, eventsToAttend } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize goals structure if it doesn't exist
    if (!user.profile) user.profile = {};
    if (!user.profile.gamification) user.profile.gamification = {};
    if (!user.profile.gamification.weeklyGoals) user.profile.gamification.weeklyGoals = {};

    // Update goals
    if (artifactsToView !== undefined) user.profile.gamification.weeklyGoals.artifactsToView = artifactsToView;
    if (toursToBook !== undefined) user.profile.gamification.weeklyGoals.toursToBook = toursToBook;
    if (eventsToAttend !== undefined) user.profile.gamification.weeklyGoals.eventsToAttend = eventsToAttend;

    // Set week start if not set
    if (!user.profile.gamification.weeklyGoals.weekStart) {
      user.profile.gamification.weeklyGoals.weekStart = new Date();
    }

    await user.save();

    res.json({
      success: true,
      message: 'Weekly goals updated successfully',
      goals: user.profile.gamification.weeklyGoals
    });
  } catch (error) {
    console.error('Update weekly goals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  getUserStats,
  updatePreferences,
  followUser,
  unfollowUser,
  getUserActivity,
  getRecommendations,
  earnBadge,
  updateWeeklyGoals
};
