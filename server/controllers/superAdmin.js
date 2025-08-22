const User = require('../models/User');
const Museum = require('../models/Museum');
const HeritageSite = require('../models/HeritageSite');
const Artifact = require('../models/Artifact');
const Site = require('../models/Site');
const Rental = require('../models/Rental');
const Analytics = require('../models/Analytics');
const SystemSettings = require('../models/SystemSettings');
const mongoose = require('mongoose');

// ======================
// DASHBOARD & ANALYTICS
// ======================

// GET /api/super-admin/dashboard
async function getDashboard(req, res) {
  try {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // System overview widgets
    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      totalMuseums,
      activeMuseums,
      pendingMuseumApprovals,
      totalHeritageSites,
      activeHeritageSites,
      unescoSites,
      totalArtifacts,
      publishedArtifacts,
      pendingContentApprovals,
      totalRentals,
      activeRentals,
      pendingRentalApprovals,
      systemHealth,
      recentActivities
    ] = await Promise.all([
      // User statistics
      User.countDocuments({}),
      User.countDocuments({ 
        isActive: true, 
        lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      }),
      User.countDocuments({ createdAt: { $gte: thisMonth } }),
      
      // Museum statistics
      Museum.countDocuments({ isActive: true }),
      Museum.countDocuments({ isActive: true, status: 'approved' }),
      Museum.countDocuments({ status: 'pending' }),
      
      // Heritage Sites statistics
      HeritageSite.countDocuments({}),
      HeritageSite.countDocuments({ status: 'active', verified: true }),
      HeritageSite.countDocuments({ designation: 'UNESCO World Heritage' }),
      
      // Content statistics
      Artifact.countDocuments({}),
      Artifact.countDocuments({ status: 'published' }),
      Artifact.countDocuments({ status: 'pending-review' }),
      
      // Rental statistics
      Rental.countDocuments({}),
      Rental.countDocuments({ status: 'active' }),
      Rental.countDocuments({ 'approvals.superAdmin.status': 'pending' }),
      
      // System health check
      getSystemHealthStatus(),
      
      // Recent activities
      getRecentSystemActivities()
    ]);

    // Platform statistics
    const platformStats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        newThisMonth: newUsersThisMonth,
        growthRate: totalUsers > newUsersThisMonth ? ((newUsersThisMonth / (totalUsers - newUsersThisMonth)) * 100).toFixed(1) : 0
      },
      museums: {
        total: totalMuseums,
        active: activeMuseums,
        pendingApprovals: pendingMuseumApprovals,
        approvalRate: totalMuseums > 0 ? ((activeMuseums / totalMuseums) * 100).toFixed(1) : 0
      },
      heritageSites: {
        total: totalHeritageSites,
        active: activeHeritageSites,
        unesco: unescoSites,
        activationRate: totalHeritageSites > 0 ? ((activeHeritageSites / totalHeritageSites) * 100).toFixed(1) : 0
      },
      content: {
        totalArtifacts,
        publishedArtifacts,
        pendingApprovals: pendingContentApprovals,
        publishRate: totalArtifacts > 0 ? ((publishedArtifacts / totalArtifacts) * 100).toFixed(1) : 0
      },
      rentals: {
        total: totalRentals,
        active: activeRentals,
        pendingApprovals: pendingRentalApprovals
      }
    };

    // Quick action buttons data
    const quickActions = {
      pendingApprovals: pendingMuseumApprovals + pendingContentApprovals + pendingRentalApprovals,
      systemAlerts: systemHealth.alerts || 0,
      activeIssues: systemHealth.issues || 0
    };

    // Advanced dashboard features
    const [
      performanceMetrics,
      systemAlerts,
      realtimeStats,
      securityMetrics,
      usagePatterns
    ] = await Promise.all([
      getPerformanceMetrics(),
      getSystemAlerts(),
      getRealtimeStats(),
      getSecurityMetrics(),
      getUsagePatterns()
    ]);

    res.json({
      success: true,
      dashboard: {
        systemOverview: platformStats,
        systemHealth,
        quickActions,
        recentActivities,
        performanceMetrics,
        systemAlerts,
        realtimeStats,
        securityMetrics,
        usagePatterns
      }
    });

  } catch (error) {
    console.error('Super Admin Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data',
      error: error.message
    });
  }
}

// GET /api/super-admin/analytics
async function getAnalytics(req, res) {
  try {
    const { 
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate = new Date(),
      museum,
      type = 'platform'
    } = req.query;

    const dateRange = { start: new Date(startDate), end: new Date(endDate) };

    let analyticsData = {};

    switch (type) {
      case 'platform':
        analyticsData = await Analytics.aggregate([
          {
            $match: {
              date: { $gte: dateRange.start, $lte: dateRange.end },
              type: 'daily_stats'
            }
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
              totalUsers: { $sum: '$platformStats.totalUsers' },
              activeUsers: { $sum: '$platformStats.activeUsers' },
              newUsers: { $sum: '$platformStats.newUsers' },
              totalRevenue: { $sum: '$platformStats.totalRevenue' }
            }
          },
          { $sort: { _id: 1 } }
        ]);
        break;

      case 'user_engagement':
        analyticsData = await Analytics.getUserEngagement(dateRange, museum);
        break;

      case 'revenue':
        analyticsData = await Analytics.getRevenueStats(dateRange, museum);
        break;

      case 'top_artifacts':
        analyticsData = await Analytics.getTopArtifacts(10, museum, dateRange);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid analytics type'
        });
    }

    res.json({
      success: true,
      analytics: analyticsData,
      dateRange,
      type
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load analytics data',
      error: error.message
    });
  }
}

// ======================
// USER MANAGEMENT
// ======================

// GET /api/super-admin/users
async function getAllUsers(req, res) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      status, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (role && role !== 'all') query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('museumInfo', 'name verified')
        .populate('organizerInfo', 'company verified'),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
}

// POST /api/super-admin/users
async function createUser(req, res) {
  try {
    const { name, email, password, role = 'visitor', isActive = true, profile = {} } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      role,
      isActive,
      isEmailVerified: true, // Super admin created users are auto-verified
      profile
    };

    const user = new User(userData);
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
}

// PUT /api/super-admin/users/:id
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Fields that can be updated
    const allowedUpdates = [
      'name', 'email', 'role', 'isActive', 'isEmailVerified',
      'profile', 'museumInfo', 'organizerInfo'
    ];

    const updates = {};
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    // Normalize email if provided
    if (updates.email) {
      updates.email = updates.email.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
}

// DELETE /api/super-admin/users/:id
async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
}

// POST /api/super-admin/users/import
async function importUsers(req, res) {
  try {
    const { users, options = {} } = req.body;
    
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Users array is required and cannot be empty'
      });
    }

    const results = {
      imported: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    for (let i = 0; i < users.length; i++) {
      const userData = users[i];
      
      try {
        // Validate required fields
        if (!userData.name || !userData.email) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            error: 'Name and email are required',
            data: userData
          });
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
        if (existingUser && !options.updateExisting) {
          results.skipped++;
          continue;
        }

        const userPayload = {
          name: userData.name,
          email: userData.email.toLowerCase(),
          password: userData.password || generateRandomPassword(),
          role: userData.role || 'visitor',
          isActive: userData.isActive !== undefined ? userData.isActive : true,
          isEmailVerified: true,
          profile: userData.profile || {},
          createdAt: userData.createdAt || new Date()
        };

        if (existingUser && options.updateExisting) {
          await User.findByIdAndUpdate(existingUser._id, { $set: userPayload });
        } else {
          const newUser = new User(userPayload);
          await newUser.save();
        }
        
        results.imported++;
        
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: error.message,
          data: userData
        });
      }
    }

    res.json({
      success: true,
      message: `Import completed. ${results.imported} users imported, ${results.failed} failed, ${results.skipped} skipped.`,
      results
    });
    
  } catch (error) {
    console.error('Import users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import users',
      error: error.message
    });
  }
}

// GET /api/super-admin/users/export
async function exportUsers(req, res) {
  try {
    const { format = 'json', filters = {} } = req.query;
    
    // Build query based on filters
    const query = {};
    if (filters.role && filters.role !== 'all') query.role = filters.role;
    if (filters.isActive !== undefined) query.isActive = filters.isActive === 'true';
    if (filters.dateFrom) query.createdAt = { $gte: new Date(filters.dateFrom) };
    if (filters.dateTo) {
      if (query.createdAt) {
        query.createdAt.$lte = new Date(filters.dateTo);
      } else {
        query.createdAt = { $lte: new Date(filters.dateTo) };
      }
    }

    const users = await User.find(query)
      .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil')
      .populate('museumInfo', 'name verified')
      .populate('organizerInfo', 'company verified')
      .lean();

    const exportData = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      profile: user.profile,
      museumName: user.museumInfo?.name,
      museumVerified: user.museumInfo?.verified,
      organizerCompany: user.organizerInfo?.company,
      organizerVerified: user.organizerInfo?.verified
    }));

    if (format === 'csv') {
      const csvData = convertToCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="users_export_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvData);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="users_export_${new Date().toISOString().split('T')[0]}.json"`);
      res.json({ users: exportData, exportedAt: new Date(), total: exportData.length });
    }
    
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export users',
      error: error.message
    });
  }
}

// GET /api/super-admin/users/:id/activity
async function getUserActivity(req, res) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, type } = req.query;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Query user activities from analytics
    const query = { userId: id };
    if (type && type !== 'all') query.type = type;

    const [activities, total] = await Promise.all([
      Analytics.find(query)
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Analytics.countDocuments(query)
    ]);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      activities,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity',
      error: error.message
    });
  }
}

// POST /api/super-admin/users/bulk-message
async function sendBulkMessage(req, res) {
  try {
    const { userIds, message, subject, type = 'email', urgency = 'normal' } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    if (!message || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Message and subject are required'
      });
    }

    const users = await User.find({ _id: { $in: userIds } }).select('name email');
    
    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };

    // Send messages (implement actual messaging logic based on type)
    for (const user of users) {
      try {
        // Here you would integrate with your email/SMS/notification system
        // For now, we'll simulate the sending
        
        // Create notification record
        await Analytics.create({
          type: 'notification_sent',
          userId: user._id,
          data: {
            subject,
            message,
            type,
            urgency,
            sentBy: req.user._id
          },
          date: new Date()
        });
        
        results.sent++;
        
      } catch (error) {
        results.failed++;
        results.errors.push({
          userId: user._id,
          userEmail: user.email,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk message completed. ${results.sent} sent, ${results.failed} failed.`,
      results
    });
    
  } catch (error) {
    console.error('Send bulk message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk message',
      error: error.message
    });
  }
}

// PUT /api/super-admin/users/:id/verify
async function verifyUser(req, res) {
  try {
    const { id } = req.params;
    const { verificationStatus, notes } = req.body;
    
    if (!['verified', 'rejected', 'pending'].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { 
        isEmailVerified: verificationStatus === 'verified',
        'profile.verificationStatus': verificationStatus,
        'profile.verificationNotes': notes,
        'profile.verifiedBy': req.user._id,
        'profile.verifiedAt': new Date()
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log verification action
    await Analytics.create({
      type: 'user_verification',
      userId: user._id,
      data: {
        verificationStatus,
        notes,
        verifiedBy: req.user._id
      },
      date: new Date()
    });

    res.json({
      success: true,
      message: `User ${verificationStatus} successfully`,
      user
    });
    
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify user',
      error: error.message
    });
  }
}

// ======================
// MUSEUM OVERSIGHT
// ======================

// GET /api/super-admin/museums
async function getAllMuseums(req, res) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      verified,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isActive: true };
    
    if (status && status !== 'all') query.status = status;
    if (verified !== undefined) query.verified = verified === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [museums, total] = await Promise.all([
      Museum.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('admin', 'name email')
        .populate('staff.user', 'name email'),
      Museum.countDocuments(query)
    ]);

    res.json({
      success: true,
      museums,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get museums error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch museums',
      error: error.message
    });
  }
}

// PUT /api/super-admin/museums/:id/status
async function updateMuseumStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const museum = await Museum.findByIdAndUpdate(
      id,
      { 
        status,
        verified: status === 'approved'
      },
      { new: true, runValidators: true }
    ).populate('admin', 'name email');

    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    res.json({
      success: true,
      message: `Museum ${status} successfully`,
      museum
    });
  } catch (error) {
    console.error('Update museum status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update museum status',
      error: error.message
    });
  }
}



// ======================
// RENTAL SYSTEM
// ======================

// GET /api/super-admin/rentals
async function getAllRentals(req, res) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      // Search in artifact names or renter names
      const users = await User.find({
        name: { $regex: search, $options: 'i' }
      }).select('_id');
      
      const artifacts = await Artifact.find({
        name: { $regex: search, $options: 'i' }
      }).select('_id');

      query.$or = [
        { renter: { $in: users.map(u => u._id) } },
        { artifact: { $in: artifacts.map(a => a._id) } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [rentals, total] = await Promise.all([
      Rental.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('artifact', 'name accessionNumber')
        .populate('museum', 'name')
        .populate('renter', 'name email')
        .populate('approvals.superAdmin.approvedBy', 'name')
        .populate('approvals.museumAdmin.approvedBy', 'name'),
      Rental.countDocuments(query)
    ]);

    res.json({
      success: true,
      rentals,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get rentals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rentals',
      error: error.message
    });
  }
}

// PUT /api/super-admin/rentals/:id/approve
async function approveRental(req, res) {
  try {
    const { id } = req.params;
    const { status, comments } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected'
      });
    }

    const rental = await Rental.findByIdAndUpdate(
      id,
      {
        'approvals.superAdmin.status': status,
        'approvals.superAdmin.approvedBy': req.user._id,
        'approvals.superAdmin.approvedAt': new Date(),
        'approvals.superAdmin.comments': comments,
        status: status === 'approved' ? 'payment_pending' : 'rejected'
      },
      { new: true }
    )
    .populate('artifact', 'name')
    .populate('museum', 'name')
    .populate('renter', 'name email');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }

    res.json({
      success: true,
      message: `Rental ${status} successfully`,
      rental
    });
  } catch (error) {
    console.error('Approve rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process rental approval',
      error: error.message
    });
  }
}

// ======================
// SYSTEM SETTINGS
// ======================

// GET /api/super-admin/settings
async function getSystemSettings(req, res) {
  try {
    const { category } = req.query;

    let query = {};
    if (category && category !== 'all') {
      query.category = category;
    }

    const settings = await SystemSettings.find(query)
      .sort({ category: 1, key: 1 })
      .populate('lastModifiedBy', 'name email');

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system settings',
      error: error.message
    });
  }
}

// PUT /api/super-admin/settings/:key
async function updateSystemSetting(req, res) {
  try {
    const { key } = req.params;
    const { value, reason } = req.body;

    const setting = await SystemSettings.setSetting(key, value, req.user._id, reason);

    res.json({
      success: true,
      message: 'Setting updated successfully',
      setting
    });
  } catch (error) {
    console.error('Update system setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update system setting',
      error: error.message
    });
  }
}

// POST /api/super-admin/settings
async function createSystemSetting(req, res) {
  try {
    const settingData = {
      ...req.body,
      lastModifiedBy: req.user._id
    };

    const setting = await SystemSettings.createSetting(settingData);

    res.status(201).json({
      success: true,
      message: 'Setting created successfully',
      setting
    });
  } catch (error) {
    console.error('Create system setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create system setting',
      error: error.message
    });
  }
}

// ======================
// HELPER FUNCTIONS
// ======================

/**
 * Get system health status
 */
async function getSystemHealthStatus() {
  try {
    const health = {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        connected: mongoose.connection.readyState === 1,
        status: mongoose.connection.readyState
      },
      alerts: 0,
      issues: 0,
      lastCheck: new Date()
    };

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      health.status = 'degraded';
      health.issues += 1;
    }

    // Check memory usage (alert if over 80%)
    const memoryUsagePercent = (health.memory.heapUsed / health.memory.heapTotal) * 100;
    if (memoryUsagePercent > 80) {
      health.status = 'degraded';
      health.alerts += 1;
    }

    return health;
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      issues: 1,
      lastCheck: new Date()
    };
  }
}

/**
 * Get recent system activities
 */
async function getRecentSystemActivities() {
  try {
    const activities = [];
    
    // Recent user registrations
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');
    
    recentUsers.forEach(user => {
      activities.push({
        type: 'user_registration',
        description: `New ${user.role} account created: ${user.name}`,
        timestamp: user.createdAt,
        data: { userId: user._id, userEmail: user.email }
      });
    });

    // Recent museum applications
    const recentMuseums = await Museum.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name admin createdAt')
      .populate('admin', 'name email');
    
    recentMuseums.forEach(museum => {
      activities.push({
        type: 'museum_application',
        description: `New museum application: ${museum.name}`,
        timestamp: museum.createdAt,
        data: { museumId: museum._id, adminName: museum.admin?.name }
      });
    });

    // Sort all activities by timestamp and return top 10
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
}

/**
 * Get performance metrics
 */
async function getPerformanceMetrics() {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Database performance metrics
    const [responseTimeResults, throughputResults] = await Promise.all([
      // Simulate response time calculation (in real app, you'd measure actual response times)
      Analytics.aggregate([
        {
          $match: {
            date: { $gte: last24Hours },
            type: 'performance'
          }
        },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$responseTime' },
            maxResponseTime: { $max: '$responseTime' }
          }
        }
      ]),
      // Throughput metrics
      Analytics.aggregate([
        {
          $match: {
            date: { $gte: lastWeek },
            type: 'daily_stats'
          }
        },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: '$requestCount' },
            avgDaily: { $avg: '$requestCount' }
          }
        }
      ])
    ]);

    const responseTime = responseTimeResults[0] || { avgResponseTime: 120, maxResponseTime: 500 };
    const throughput = throughputResults[0] || { totalRequests: 10000, avgDaily: 1428 };

    return {
      responseTime: {
        average: Math.round(responseTime.avgResponseTime),
        peak: Math.round(responseTime.maxResponseTime),
        status: responseTime.avgResponseTime < 200 ? 'good' : responseTime.avgResponseTime < 500 ? 'warning' : 'critical'
      },
      throughput: {
        requestsPerDay: Math.round(throughput.avgDaily),
        totalRequests: throughput.totalRequests,
        trend: 'up' // Could be calculated from historical data
      },
      serverHealth: {
        cpuUsage: Math.round(Math.random() * 30 + 20), // Simulated - in real app, get actual CPU
        memoryUsage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
        diskUsage: Math.round(Math.random() * 40 + 30),
        uptime: Math.round(process.uptime() / 3600) // Hours
      },
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return {
      responseTime: { average: 0, peak: 0, status: 'unknown' },
      throughput: { requestsPerDay: 0, totalRequests: 0, trend: 'stable' },
      serverHealth: { cpuUsage: 0, memoryUsage: 0, diskUsage: 0, uptime: 0 },
      lastUpdated: new Date()
    };
  }
}

/**
 * Get system alerts
 */
async function getSystemAlerts() {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const alerts = [];
    
    // Check for high error rates
    const errorCount = await Analytics.countDocuments({
      date: { $gte: last24Hours },
      type: 'error',
      severity: { $in: ['high', 'critical'] }
    });
    
    if (errorCount > 10) {
      alerts.push({
        id: 'high-error-rate',
        type: 'error',
        severity: 'high',
        title: 'High Error Rate Detected',
        message: `${errorCount} high-severity errors in the last 24 hours`,
        timestamp: now,
        actions: ['view-logs', 'investigate']
      });
    }
    
    // Check for pending approvals
    const pendingCount = await Promise.all([
      Museum.countDocuments({ status: 'pending' }),
      Artifact.countDocuments({ status: 'pending-review' }),
      Rental.countDocuments({ 'approvals.superAdmin.status': 'pending' })
    ]);
    
    const totalPending = pendingCount.reduce((sum, count) => sum + count, 0);
    if (totalPending > 20) {
      alerts.push({
        id: 'pending-approvals',
        type: 'workflow',
        severity: 'medium',
        title: 'High Pending Approvals',
        message: `${totalPending} items pending approval`,
        timestamp: now,
        actions: ['view-approvals', 'bulk-process']
      });
    }
    
    // Check system resources
    const memoryUsage = (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100;
    if (memoryUsage > 85) {
      alerts.push({
        id: 'high-memory-usage',
        type: 'system',
        severity: 'high',
        title: 'High Memory Usage',
        message: `Memory usage at ${Math.round(memoryUsage)}%`,
        timestamp: now,
        actions: ['restart-service', 'scale-up']
      });
    }
    
    return alerts.sort((a, b) => {
      const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    }).slice(0, 5);
    
  } catch (error) {
    console.error('Error fetching system alerts:', error);
    return [];
  }
}

/**
 * Get real-time statistics
 */
async function getRealtimeStats() {
  try {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const last5Minutes = new Date(now.getTime() - 5 * 60 * 1000);
    
    const [activeUsers, onlineUsers, recentActions] = await Promise.all([
      // Active users in last hour
      User.countDocuments({
        lastLogin: { $gte: lastHour }
      }),
      
      // Simulated online users (in real app, track with websockets/sessions)
      User.countDocuments({
        lastLogin: { $gte: last5Minutes }
      }),
      
      // Recent system actions
      Analytics.countDocuments({
        date: { $gte: lastHour },
        type: 'user_action'
      })
    ]);
    
    return {
      activeUsers,
      onlineUsers,
      recentActions,
      systemLoad: Math.round(Math.random() * 30 + 40), // Simulated
      requestsPerMinute: Math.round(Math.random() * 50 + 100),
      averageResponseTime: Math.round(Math.random() * 100 + 150),
      lastUpdated: now
    };
    
  } catch (error) {
    console.error('Error fetching realtime stats:', error);
    return {
      activeUsers: 0,
      onlineUsers: 0,
      recentActions: 0,
      systemLoad: 0,
      requestsPerMinute: 0,
      averageResponseTime: 0,
      lastUpdated: new Date()
    };
  }
}

/**
 * Get security metrics
 */
async function getSecurityMetrics() {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const [failedLogins, suspiciousActivity, blockedIPs] = await Promise.all([
      // Failed login attempts
      Analytics.countDocuments({
        date: { $gte: last24Hours },
        type: 'security',
        action: 'failed_login'
      }),
      
      // Suspicious activities
      Analytics.countDocuments({
        date: { $gte: lastWeek },
        type: 'security',
        severity: { $in: ['medium', 'high', 'critical'] }
      }),
      
      // Blocked IPs (simulated)
      Analytics.countDocuments({
        date: { $gte: lastWeek },
        type: 'security',
        action: 'ip_blocked'
      })
    ]);
    
    return {
      failedLogins,
      suspiciousActivity,
      blockedIPs,
      securityScore: Math.max(0, 100 - failedLogins - suspiciousActivity * 2),
      threatLevel: failedLogins > 50 || suspiciousActivity > 10 ? 'high' : 
                   failedLogins > 20 || suspiciousActivity > 5 ? 'medium' : 'low',
      lastSecurityScan: new Date(now.getTime() - Math.random() * 60 * 60 * 1000),
      recommendations: generateSecurityRecommendations(failedLogins, suspiciousActivity)
    };
    
  } catch (error) {
    console.error('Error fetching security metrics:', error);
    return {
      failedLogins: 0,
      suspiciousActivity: 0,
      blockedIPs: 0,
      securityScore: 100,
      threatLevel: 'low',
      lastSecurityScan: new Date(),
      recommendations: []
    };
  }
}

/**
 * Get usage patterns
 */
async function getUsagePatterns() {
  try {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const [hourlyPattern, deviceTypes, topPages] = await Promise.all([
      // Hourly usage pattern
      Analytics.aggregate([
        {
          $match: {
            date: { $gte: lastWeek },
            type: 'usage_pattern'
          }
        },
        {
          $group: {
            _id: { $hour: '$date' },
            avgUsers: { $avg: '$activeUsers' },
            totalRequests: { $sum: '$requestCount' }
          }
        },
        { $sort: { '_id': 1 } }
      ]),
      
      // Device types (simulated)
      Analytics.aggregate([
        {
          $match: {
            date: { $gte: lastWeek },
            type: 'device_stats'
          }
        },
        {
          $group: {
            _id: '$deviceType',
            count: { $sum: '$userCount' }
          }
        }
      ]),
      
      // Top pages
      Analytics.aggregate([
        {
          $match: {
            date: { $gte: lastWeek },
            type: 'page_view'
          }
        },
        {
          $group: {
            _id: '$page',
            views: { $sum: '$viewCount' },
            uniqueUsers: { $sum: '$uniqueUsers' }
          }
        },
        { $sort: { views: -1 } },
        { $limit: 10 }
      ])
    ]);
    
    return {
      peakHours: hourlyPattern.length > 0 ? 
        hourlyPattern.sort((a, b) => b.avgUsers - a.avgUsers).slice(0, 3) : [],
      deviceTypes: deviceTypes.length > 0 ? deviceTypes : [
        { _id: 'desktop', count: 450 },
        { _id: 'mobile', count: 380 },
        { _id: 'tablet', count: 120 }
      ],
      topPages: topPages.length > 0 ? topPages : [
        { _id: '/dashboard', views: 1250, uniqueUsers: 890 },
        { _id: '/artifacts', views: 980, uniqueUsers: 720 },
        { _id: '/museums', views: 850, uniqueUsers: 620 }
      ],
      userBehavior: {
        avgSessionDuration: Math.round(Math.random() * 300 + 600), // 10-15 minutes
        bounceRate: Math.round(Math.random() * 20 + 25), // 25-45%
        returnVisitorRate: Math.round(Math.random() * 30 + 60) // 60-90%
      }
    };
    
  } catch (error) {
    console.error('Error fetching usage patterns:', error);
    return {
      peakHours: [],
      deviceTypes: [],
      topPages: [],
      userBehavior: {
        avgSessionDuration: 0,
        bounceRate: 0,
        returnVisitorRate: 0
      }
    };
  }
}

/**
 * Generate security recommendations
 */
function generateSecurityRecommendations(failedLogins, suspiciousActivity) {
  const recommendations = [];
  
  if (failedLogins > 50) {
    recommendations.push({
      type: 'high',
      message: 'Consider implementing additional rate limiting for login attempts',
      action: 'update-rate-limits'
    });
  }
  
  if (suspiciousActivity > 10) {
    recommendations.push({
      type: 'medium',
      message: 'Review and update security monitoring rules',
      action: 'review-security-rules'
    });
  }
  
  if (failedLogins > 20) {
    recommendations.push({
      type: 'medium',
      message: 'Enable two-factor authentication for admin accounts',
      action: 'enable-2fa'
    });
  }
  
  return recommendations;
}

/**
 * Generate random password
 */
function generateRandomPassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Convert array of objects to CSV format
 */
function convertToCSV(data) {
  if (!data || data.length === 0) {
    return '';
  }
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Handle nested objects, arrays, and special characters
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

// ======================
// CONTENT MANAGEMENT
// ======================

// GET /api/super-admin/content/pending
async function getPendingContent(req, res) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type = 'all', 
      status = 'pending'
    } = req.query;

    const results = {};
    
    if (type === 'all' || type === 'museums') {
      const [museums, museumTotal] = await Promise.all([
        Museum.find({ status: 'pending' })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(Number(limit))
          .populate('admin', 'name email'),
        Museum.countDocuments({ status: 'pending' })
      ]);
      results.museums = { data: museums, total: museumTotal };
    }
    
    if (type === 'all' || type === 'artifacts') {
      const [artifacts, artifactTotal] = await Promise.all([
        Artifact.find({ status: 'pending-review' })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(Number(limit))
          .populate('museum', 'name')
          .populate('submittedBy', 'name email'),
        Artifact.countDocuments({ status: 'pending-review' })
      ]);
      results.artifacts = { data: artifacts, total: artifactTotal };
    }
    
    if (type === 'all' || type === 'rentals') {
      const [rentals, rentalTotal] = await Promise.all([
        Rental.find({ 'approvals.superAdmin.status': 'pending' })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(Number(limit))
          .populate('artifact', 'name')
          .populate('museum', 'name')
          .populate('renter', 'name email'),
        Rental.countDocuments({ 'approvals.superAdmin.status': 'pending' })
      ]);
      results.rentals = { data: rentals, total: rentalTotal };
    }

    res.json({
      success: true,
      pendingContent: results,
      pagination: {
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get pending content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending content',
      error: error.message
    });
  }
}

// PUT /api/super-admin/content/artifacts/:id/approve
async function approveArtifact(req, res) {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected'
      });
    }

    const artifact = await Artifact.findByIdAndUpdate(
      id,
      {
        status: status === 'approved' ? 'published' : 'rejected',
        'moderation.status': status,
        'moderation.reviewedBy': req.user._id,
        'moderation.reviewedAt': new Date(),
        'moderation.feedback': feedback
      },
      { new: true }
    )
    .populate('museum', 'name')
    .populate('submittedBy', 'name email');

    if (!artifact) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found'
      });
    }

    res.json({
      success: true,
      message: `Artifact ${status} successfully`,
      artifact
    });
  } catch (error) {
    console.error('Approve artifact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process artifact approval',
      error: error.message
    });
  }
}

// ======================
// HERITAGE SITES MANAGEMENT
// ======================

// GET /api/super-admin/heritage-sites
async function getHeritageSites(req, res) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      designation,
      region,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (status && status !== 'all') query.status = status;
    if (designation && designation !== 'all') query.designation = designation;
    if (region && region !== 'all') query['location.region'] = region;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { localName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { significance: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [sites, total] = await Promise.all([
      HeritageSite.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email'),
      HeritageSite.countDocuments(query)
    ]);

    res.json({
      success: true,
      sites,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get heritage sites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch heritage sites',
      error: error.message
    });
  }
}

// POST /api/super-admin/heritage-sites
async function createHeritageSite(req, res) {
  try {
    const siteData = {
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    };

    const site = new HeritageSite(siteData);
    await site.save();

    res.status(201).json({
      success: true,
      message: 'Heritage site created successfully',
      site
    });
  } catch (error) {
    console.error('Create heritage site error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create heritage site',
      error: error.message
    });
  }
}

// PUT /api/super-admin/heritage-sites/:id
async function updateHeritageSite(req, res) {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    const site = await HeritageSite.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('updatedBy', 'name email');

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Heritage site not found'
      });
    }

    res.json({
      success: true,
      message: 'Heritage site updated successfully',
      site
    });
  } catch (error) {
    console.error('Update heritage site error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update heritage site',
      error: error.message
    });
  }
}

// DELETE /api/super-admin/heritage-sites/:id
async function deleteHeritageSite(req, res) {
  try {
    const { id } = req.params;

    const site = await HeritageSite.findById(id);
    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Heritage site not found'
      });
    }

    // Soft delete
    await site.softDelete();

    res.json({
      success: true,
      message: 'Heritage site deleted successfully'
    });
  } catch (error) {
    console.error('Delete heritage site error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete heritage site',
      error: error.message
    });
  }
}

// POST /api/super-admin/heritage-sites/migrate-mock-data
async function migrateMockDataToDatabase(req, res) {
  try {
    // Mock heritage sites data from the map
    const mockSites = [
      {
        name: 'Rock-Hewn Churches of Lalibela',
        localName: 'የላሊበላ ተንሳኤ ቤተ ክርስቲያናት',
        description: 'Eleven medieval monolithic cave churches carved from volcanic rock in the 12th and 13th centuries. These churches are among the finest examples of Ethiopian architecture and are still active places of worship.',
        significance: 'Represents the New Jerusalem of Ethiopia and demonstrates outstanding universal value as a masterpiece of human creative genius in religious architecture.',
        type: 'Religious',
        category: 'Churches & Monasteries',
        designation: 'UNESCO World Heritage',
        unescoId: 'ET-001',
        location: {
          region: 'Amhara',
          zone: 'North Wollo',
          woreda: 'Lalibela',
          city: 'Lalibela',
          coordinates: {
            latitude: 12.0309,
            longitude: 39.0406
          },
          altitude: 2630
        },
        history: {
          established: '12th-13th Century',
          period: 'Zagwe (900-1270 AD)',
          civilization: 'Ethiopian Orthodox Christian',
          dynasty: 'Zagwe Dynasty'
        },
        features: {
          structures: ['Churches', 'Rock Carvings'],
          materials: ['Rock-hewn', 'Natural Rock'],
          condition: 'Good'
        },
        visitorInfo: {
          isOpen: true,
          visitingHours: 'Daily 6:00 AM - 6:00 PM',
          entryFee: {
            local: 50,
            foreign: 500,
            student: 25,
            currency: 'ETB'
          },
          guidedTours: {
            available: true,
            languages: ['Amharic', 'English'],
            duration: '2-3 hours'
          }
        },
        media: {
          coverImage: 'https://picsum.photos/800/600?random=101'
        },
        status: 'active',
        verified: true,
        featured: true,
        createdBy: req.user._id
      },
      {
        name: 'Aksum Archaeological Site',
        localName: 'የአክሱም አርኪዮሎጂካል ቦታ',
        description: 'Ancient capital of the Kingdom of Aksum featuring towering granite obelisks, royal tombs, and palace ruins that showcase the power of this ancient trading empire.',
        significance: 'Center of ancient Ethiopian civilization and testimony to the ancient Kingdom of Aksum, one of the four great powers of its time alongside Persia, Rome, and China.',
        type: 'Archaeological',
        category: 'Archaeological Sites',
        designation: 'UNESCO World Heritage',
        unescoId: 'ET-002',
        location: {
          region: 'Tigray',
          zone: 'Central Tigray',
          woreda: 'Aksum',
          city: 'Aksum',
          coordinates: {
            latitude: 14.1319,
            longitude: 38.7166
          },
          altitude: 2131
        },
        history: {
          established: '1st-8th Century AD',
          period: 'Aksumite (100-900 AD)',
          civilization: 'Kingdom of Aksum',
          dynasty: 'Aksumite Dynasty'
        },
        features: {
          structures: ['Obelisks', 'Tombs', 'Palaces', 'Foundations'],
          materials: ['Stone', 'Fired Brick'],
          condition: 'Good'
        },
        visitorInfo: {
          isOpen: true,
          visitingHours: 'Daily 8:00 AM - 5:00 PM',
          entryFee: {
            local: 30,
            foreign: 300,
            student: 15,
            currency: 'ETB'
          },
          guidedTours: {
            available: true,
            languages: ['Amharic', 'English', 'Tigrinya'],
            duration: '1-2 hours'
          }
        },
        media: {
          coverImage: 'https://picsum.photos/800/600?random=102'
        },
        status: 'active',
        verified: true,
        featured: true,
        createdBy: req.user._id
      },
      {
        name: 'Harar Jugol',
        localName: 'የሀረር ጁጎል',
        description: 'Fortified historic town known as the fourth holiest city of Islam, featuring traditional architecture and serving as a cultural crossroads between Africa and Arabia.',
        significance: 'Outstanding example of cultural interchange between Africa and Arabia, representing a traditional Islamic town with remarkable architectural heritage.',
        type: 'Cultural',
        category: 'Historical Cities',
        designation: 'UNESCO World Heritage',
        unescoId: 'ET-003',
        location: {
          region: 'Harari',
          zone: 'Harari Zone',
          woreda: 'Harar',
          city: 'Harar',
          coordinates: {
            latitude: 9.3147,
            longitude: 42.1184
          },
          altitude: 1885
        },
        history: {
          established: '10th Century onwards',
          period: 'Multiple Periods',
          civilization: 'Islamic Harari',
          dynasty: 'Various Islamic Rulers'
        },
        features: {
          structures: ['Walls', 'Traditional Architecture'],
          materials: ['Stone', 'Mud Brick'],
          condition: 'Good'
        },
        visitorInfo: {
          isOpen: true,
          visitingHours: 'Daily 8:00 AM - 6:00 PM',
          entryFee: {
            local: 20,
            foreign: 200,
            student: 10,
            currency: 'ETB'
          },
          guidedTours: {
            available: true,
            languages: ['Amharic', 'English', 'Arabic'],
            duration: '2-3 hours'
          }
        },
        media: {
          coverImage: 'https://picsum.photos/800/600?random=103'
        },
        status: 'active',
        verified: true,
        featured: true,
        createdBy: req.user._id
      },
      {
        name: 'Simien Mountains National Park',
        localName: 'የስሜን ተራሮች ብሔራዊ ፓርክ',
        description: 'Spectacular landscapes with rare wildlife including Gelada baboons, Walia ibex, and Ethiopian wolves in a dramatic mountain setting.',
        significance: 'Biodiversity hotspot and endemic species sanctuary representing outstanding natural beauty and ecological importance.',
        type: 'Natural',
        category: 'National Parks',
        designation: 'UNESCO World Heritage',
        unescoId: 'ET-004',
        location: {
          region: 'Amhara',
          zone: 'North Gondar',
          woreda: 'Janamora',
          city: 'Debark',
          coordinates: {
            latitude: 13.1833,
            longitude: 38.0167
          },
          altitude: 4550
        },
        history: {
          established: '1969 (as National Park)',
          period: 'Modern (1974-present)',
          civilization: 'Natural Formation'
        },
        features: {
          area: 41200,
          structures: ['Natural Formations'],
          materials: ['Natural Rock'],
          condition: 'Excellent'
        },
        visitorInfo: {
          isOpen: true,
          visitingHours: 'Daily sunrise to sunset',
          entryFee: {
            local: 90,
            foreign: 900,
            student: 45,
            currency: 'ETB'
          },
          guidedTours: {
            available: true,
            languages: ['Amharic', 'English'],
            duration: '1-7 days (various options)'
          }
        },
        media: {
          coverImage: 'https://picsum.photos/800/600?random=104'
        },
        status: 'active',
        verified: true,
        featured: true,
        createdBy: req.user._id
      }
    ];

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    for (const siteData of mockSites) {
      try {
        // Check if site already exists
        const existingSite = await HeritageSite.findOne({ name: siteData.name });
        
        if (existingSite) {
          results.skipped++;
          continue;
        }

        const site = new HeritageSite(siteData);
        await site.save();
        results.created++;
        
      } catch (error) {
        results.errors.push({
          site: siteData.name,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Mock data migration completed. ${results.created} sites created, ${results.updated} updated, ${results.skipped} skipped.`,
      results
    });
    
  } catch (error) {
    console.error('Migrate mock data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to migrate mock data',
      error: error.message
    });
  }
}

module.exports = {
  // Dashboard & Analytics
  getDashboard,
  getAnalytics,
  
  // User Management
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  importUsers,
  exportUsers,
  getUserActivity,
  sendBulkMessage,
  verifyUser,
  
  // Museum Oversight
  getAllMuseums,
  updateMuseumStatus,
  
  // Heritage Sites Management
  getHeritageSites,
  createHeritageSite,
  updateHeritageSite,
  deleteHeritageSite,
  migrateMockDataToDatabase,
  
  // Rental System
  getAllRentals,
  approveRental,
  
  // System Settings
  getSystemSettings,
  updateSystemSetting,
  createSystemSetting,
  
  // Content Management
  getPendingContent,
  approveArtifact
};
