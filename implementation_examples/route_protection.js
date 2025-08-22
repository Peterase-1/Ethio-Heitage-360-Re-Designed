// Route Protection Middleware Examples
// Ethiopian Heritage 360 Platform

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Museum = require('../models/Museum');

// Base authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or deactivated account.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token is not valid.'
    });
  }
};

// Super Admin only middleware
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super Admin privileges required.',
      userRole: req.user.role,
      requiredRole: 'super_admin'
    });
  }
  next();
};

// Museum Admin only middleware
const requireMuseumAdmin = (req, res, next) => {
  if (req.user.role !== 'museum_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Museum Admin privileges required.',
      userRole: req.user.role,
      requiredRole: 'museum_admin'
    });
  }
  next();
};

// Multi-role middleware
const requireAnyRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`,
        userRole: req.user.role,
        requiredRoles: roles
      });
    }
    next();
  };
};

// Museum ownership middleware (for Museum Admins)
const requireMuseumOwnership = async (req, res, next) => {
  try {
    if (req.user.role === 'super_admin') {
      // Super admins can access any museum
      return next();
    }

    if (req.user.role !== 'museum_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Museum Admin privileges required.'
      });
    }

    // Check if museum admin owns the museum
    const museumId = req.params.museumId || req.body.museumId || req.query.museumId;
    
    if (!museumId) {
      return res.status(400).json({
        success: false,
        message: 'Museum ID is required.'
      });
    }

    const museum = await Museum.findById(museumId);
    
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found.'
      });
    }

    if (museum.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only manage your own museum.',
        yourMuseum: req.user.museumId,
        requestedMuseum: museumId
      });
    }

    req.museum = museum;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during authorization.',
      error: error.message
    });
  }
};

// Artifact ownership middleware
const requireArtifactOwnership = async (req, res, next) => {
  try {
    const { artifactId } = req.params;
    const Artifact = require('../models/Artifact');
    
    const artifact = await Artifact.findById(artifactId).populate('museum');
    
    if (!artifact) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found.'
      });
    }

    // Super Admin can access any artifact
    if (req.user.role === 'super_admin') {
      req.artifact = artifact;
      return next();
    }

    // Museum Admin can only access their museum's artifacts
    if (req.user.role === 'museum_admin') {
      const userMuseum = await Museum.findOne({ admin: req.user._id });
      
      if (!userMuseum || artifact.museum._id.toString() !== userMuseum._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only manage artifacts from your museum.',
          artifactMuseum: artifact.museum.name,
          yourMuseum: userMuseum?.name || 'None'
        });
      }
    }

    req.artifact = artifact;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during artifact authorization.',
      error: error.message
    });
  }
};

// Examples of protected routes

// SUPER ADMIN ROUTES - Platform Management
const superAdminRoutes = (router) => {
  // Apply authentication and super admin check to all routes
  router.use(authenticate);
  router.use(requireSuperAdmin);

  // User management - Super Admin only
  router.get('/users', async (req, res) => {
    try {
      // Super Admin can see ALL users
      const users = await User.find({})
        .select('-password')
        .populate('museumInfo', 'name verified');
      
      res.json({
        success: true,
        message: 'Super Admin: Retrieved all platform users',
        count: users.length,
        users
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Create user with any role - Super Admin only
  router.post('/users', async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      
      // Super Admin can create users with ANY role
      const user = new User({
        name,
        email,
        password,
        role: role || 'visitor',
        isEmailVerified: true, // Super admin created users are auto-verified
        createdBy: req.user._id
      });

      await user.save();
      
      res.status(201).json({
        success: true,
        message: `Super Admin: Created user with role '${role}'`,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  // Museum approval - Super Admin only
  router.put('/museums/:id/approve', async (req, res) => {
    try {
      const { id } = req.params;
      const { approved, reason } = req.body;
      
      const museum = await Museum.findByIdAndUpdate(
        id,
        {
          verified: approved,
          status: approved ? 'approved' : 'rejected',
          approvalHistory: {
            approvedBy: req.user._id,
            approvedAt: new Date(),
            reason: reason || (approved ? 'Approved by Super Admin' : 'Rejected by Super Admin')
          }
        },
        { new: true }
      ).populate('admin', 'name email');

      res.json({
        success: true,
        message: `Super Admin: Museum ${approved ? 'approved' : 'rejected'}`,
        museum
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Final artifact approval - Super Admin only
  router.put('/artifacts/:artifactId/approve', requireArtifactOwnership, async (req, res) => {
    try {
      const { status, feedback } = req.body; // 'approved' or 'rejected'
      
      req.artifact.status = status === 'approved' ? 'published' : 'rejected';
      req.artifact.reviews.push({
        reviewer: req.user._id,
        status,
        feedback,
        reviewedAt: new Date(),
        level: 'final'
      });

      await req.artifact.save();
      
      res.json({
        success: true,
        message: `Super Admin: Artifact ${status} (FINAL APPROVAL)`,
        artifact: req.artifact
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

// MUSEUM ADMIN ROUTES - Museum-specific Management
const museumAdminRoutes = (router) => {
  // Apply authentication and museum admin check
  router.use(authenticate);
  router.use(requireMuseumAdmin);

  // Get museum profile - Museum Admin (their museum only)
  router.get('/profile', async (req, res) => {
    try {
      // Museum Admin can only see THEIR museum
      const museum = await Museum.findOne({ admin: req.user._id })
        .populate('admin', 'name email')
        .populate('staff.user', 'name email');

      if (!museum) {
        return res.status(404).json({
          success: false,
          message: 'Museum not found for this admin'
        });
      }

      res.json({
        success: true,
        message: 'Museum Admin: Retrieved your museum profile',
        museum
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Get artifacts - Museum Admin (their artifacts only)
  router.get('/artifacts', async (req, res) => {
    try {
      const museum = await Museum.findOne({ admin: req.user._id });
      
      if (!museum) {
        return res.status(404).json({
          success: false,
          message: 'Museum not found'
        });
      }

      const Artifact = require('../models/Artifact');
      
      // Museum Admin can only see THEIR artifacts
      const artifacts = await Artifact.find({ museum: museum._id })
        .populate('createdBy', 'name email');

      res.json({
        success: true,
        message: 'Museum Admin: Retrieved your museum artifacts',
        count: artifacts.length,
        museumName: museum.name,
        artifacts
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // First-level artifact approval - Museum Admin
  router.put('/artifacts/:artifactId/approve', requireArtifactOwnership, async (req, res) => {
    try {
      const { status, feedback } = req.body; // 'approved' or 'rejected'
      
      if (status === 'approved') {
        // Museum Admin approval sends to Super Admin
        req.artifact.status = 'pending-review'; // Goes to Super Admin
      } else {
        // Museum Admin can reject staff submissions
        req.artifact.status = 'rejected';
      }

      req.artifact.reviews.push({
        reviewer: req.user._id,
        status,
        feedback,
        reviewedAt: new Date(),
        level: 'museum_admin'
      });

      await req.artifact.save();
      
      res.json({
        success: true,
        message: status === 'approved' 
          ? 'Museum Admin: Artifact approved and sent to Super Admin for final review'
          : 'Museum Admin: Artifact rejected',
        artifact: req.artifact,
        nextStep: status === 'approved' ? 'Awaiting Super Admin approval' : 'Rejected'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Staff management - Museum Admin (their staff only)
  router.get('/staff', async (req, res) => {
    try {
      const museum = await Museum.findOne({ admin: req.user._id })
        .populate('staff.user', 'name email profile isActive');

      if (!museum) {
        return res.status(404).json({
          success: false,
          message: 'Museum not found'
        });
      }

      res.json({
        success: true,
        message: 'Museum Admin: Retrieved your museum staff',
        museumName: museum.name,
        staffCount: museum.staff.length,
        staff: museum.staff
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

// MIXED ACCESS ROUTES - Different behavior based on role
const mixedAccessRoutes = (router) => {
  router.use(authenticate);
  
  // Analytics endpoint - Different data based on role
  router.get('/analytics', async (req, res) => {
    try {
      if (req.user.role === 'super_admin') {
        // Super Admin gets GLOBAL analytics
        const Analytics = require('../models/Analytics');
        
        const analytics = await Analytics.aggregate([
          {
            $group: {
              _id: null,
              totalUsers: { $sum: '$platformStats.totalUsers' },
              totalMuseums: { $sum: '$platformStats.totalMuseums' },
              totalArtifacts: { $sum: '$platformStats.totalArtifacts' },
              totalRevenue: { $sum: '$platformStats.totalRevenue' }
            }
          }
        ]);

        res.json({
          success: true,
          message: 'Super Admin: Global platform analytics',
          scope: 'PLATFORM-WIDE',
          analytics: analytics[0] || {}
        });

      } else if (req.user.role === 'museum_admin') {
        // Museum Admin gets MUSEUM-SPECIFIC analytics
        const museum = await Museum.findOne({ admin: req.user._id });
        
        if (!museum) {
          return res.status(404).json({
            success: false,
            message: 'Museum not found'
          });
        }

        const Analytics = require('../models/Analytics');
        
        const analytics = await Analytics.aggregate([
          {
            $match: { museum: museum._id }
          },
          {
            $group: {
              _id: null,
              totalVisitors: { $sum: '$museumMetrics.visits' },
              totalArtifacts: { $sum: '$museumMetrics.artifacts' },
              revenue: { $sum: '$museumMetrics.revenue' }
            }
          }
        ]);

        res.json({
          success: true,
          message: 'Museum Admin: Your museum analytics',
          scope: 'MUSEUM-SPECIFIC',
          museumName: museum.name,
          analytics: analytics[0] || {}
        });

      } else {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Analytics not available for your role.',
          userRole: req.user.role
        });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

// Example Express app setup
const setupRoutes = (app) => {
  const express = require('express');
  
  // Super Admin routes
  const superAdminRouter = express.Router();
  superAdminRoutes(superAdminRouter);
  app.use('/api/super-admin', superAdminRouter);
  
  // Museum Admin routes
  const museumAdminRouter = express.Router();
  museumAdminRoutes(museumAdminRouter);
  app.use('/api/museum-admin', museumAdminRouter);
  
  // Mixed access routes
  const mixedRouter = express.Router();
  mixedAccessRoutes(mixedRouter);
  app.use('/api/dashboard', mixedRouter);
};

module.exports = {
  authenticate,
  requireSuperAdmin,
  requireMuseumAdmin,
  requireAnyRole,
  requireMuseumOwnership,
  requireArtifactOwnership,
  setupRoutes
};
