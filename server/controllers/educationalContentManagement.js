const Achievement = require('../models/Achievement');
const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const LearningProgress = require('../models/LearningProgress');

// ===== ACHIEVEMENT MANAGEMENT =====

// Get all achievements with admin details
const getAllAchievementsAdmin = async (req, res) => {
  try {
    const { 
      category, 
      difficulty, 
      type,
      status, 
      page = 1, 
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    // Apply filters
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (type) filter.type = type;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    
    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [achievements, totalCount] = await Promise.all([
      Achievement.find(filter)
        .populate('createdBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Achievement.countDocuments(filter)
    ]);

    // Get usage stats for each achievement
    const achievementsWithStats = await Promise.all(
      achievements.map(async (achievement) => {
        const earnedCount = await LearningProgress.countDocuments({
          'achievements.achievementId': achievement._id
        });

        return {
          ...achievement.toObject(),
          stats: {
            totalEarned: earnedCount,
            isPopular: earnedCount > 10
          }
        };
      })
    );

    res.json({
      success: true,
      achievements: achievementsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalAchievements: totalCount,
        hasNextPage: skip + achievements.length < totalCount,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get all achievements admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements'
    });
  }
};

// Create new achievement
const createAchievement = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      category,
      difficulty,
      criteria,
      reward,
      icon,
      badge
    } = req.body;

    // Validate required fields
    if (!title || !description || !type || !criteria) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, type, criteria'
      });
    }

    // Check if achievement with same title already exists
    const existingAchievement = await Achievement.findOne({ title });
    if (existingAchievement) {
      return res.status(409).json({
        success: false,
        message: 'Achievement with this title already exists'
      });
    }

    const achievementData = {
      title: title.trim(),
      description: description.trim(),
      type,
      category: category || 'general',
      difficulty: difficulty || 'beginner',
      criteria: criteria,
      reward: reward || { points: 10, badge: title },
      icon: icon || `https://api.dicebear.com/7.x/shapes/svg?seed=${title}`,
      badge: badge || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${title}`,
      createdBy: req.user.id,
      isActive: true
    };

    const achievement = new Achievement(achievementData);
    await achievement.save();

    res.status(201).json({
      success: true,
      message: 'Achievement created successfully',
      achievement
    });
  } catch (error) {
    console.error('Create achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create achievement'
    });
  }
};

// Update achievement
const updateAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params;
    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.createdBy;
    
    updateData.updatedAt = new Date();

    const achievement = await Achievement.findByIdAndUpdate(
      achievementId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    res.json({
      success: true,
      message: 'Achievement updated successfully',
      achievement
    });
  } catch (error) {
    console.error('Update achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update achievement'
    });
  }
};

// Delete achievement
const deleteAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params;
    const { permanent } = req.query;

    const achievement = await Achievement.findById(achievementId);
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    if (permanent === 'true') {
      // Permanently delete achievement and remove from user progress
      await Promise.all([
        Achievement.findByIdAndDelete(achievementId),
        LearningProgress.updateMany(
          {},
          { $pull: { achievements: { achievementId } } }
        )
      ]);

      res.json({
        success: true,
        message: 'Achievement permanently deleted'
      });
    } else {
      // Soft delete
      achievement.isActive = false;
      achievement.updatedAt = new Date();
      await achievement.save();

      res.json({
        success: true,
        message: 'Achievement deactivated'
      });
    }
  } catch (error) {
    console.error('Delete achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete achievement'
    });
  }
};

// ===== CERTIFICATE MANAGEMENT =====

// Get all certificates with admin details
const getAllCertificatesAdmin = async (req, res) => {
  try {
    const { 
      userId,
      courseId,
      status,
      issuedDate,
      page = 1, 
      limit = 20,
      search,
      sortBy = 'issuedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build aggregation pipeline
    const pipeline = [];

    // Match stage
    const matchConditions = {};
    if (userId) matchConditions.userId = userId;
    if (courseId) matchConditions.courseId = courseId;
    if (status) matchConditions.status = status;
    
    if (issuedDate) {
      const date = new Date(issuedDate);
      const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      matchConditions.issuedAt = {
        $gte: date,
        $lt: nextDay
      };
    }

    pipeline.push({ $match: matchConditions });

    // Lookup user details
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userDetails'
      }
    });

    // Lookup course details
    pipeline.push({
      $lookup: {
        from: 'courses',
        localField: 'courseId',
        foreignField: '_id',
        as: 'courseDetails'
      }
    });

    // Add user and course info
    pipeline.push({
      $addFields: {
        user: { $arrayElemAt: ['$userDetails', 0] },
        course: { $arrayElemAt: ['$courseDetails', 0] }
      }
    });

    // Search functionality
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'user.name': { $regex: search, $options: 'i' } },
            { 'user.email': { $regex: search, $options: 'i' } },
            { 'course.title': { $regex: search, $options: 'i' } },
            { certificateId: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Project final structure
    pipeline.push({
      $project: {
        certificateId: 1,
        userId: 1,
        courseId: 1,
        status: 1,
        issuedAt: 1,
        verificationHash: 1,
        metadata: 1,
        user: {
          _id: '$user._id',
          name: '$user.name',
          email: '$user.email'
        },
        course: {
          _id: '$course._id',
          title: '$course.title',
          category: '$course.category',
          instructor: '$course.instructor'
        }
      }
    });

    // Get total count
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: 'total' });
    const totalResult = await Certificate.aggregate(countPipeline);
    const totalCount = totalResult[0]?.total || 0;

    // Sort and paginate
    const sortStage = {};
    sortStage[sortBy] = sortOrder === 'asc' ? 1 : -1;
    pipeline.push({ $sort: sortStage });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    const certificates = await Certificate.aggregate(pipeline);

    res.json({
      success: true,
      certificates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCertificates: totalCount,
        hasNextPage: skip + certificates.length < totalCount,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get all certificates admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificates'
    });
  }
};

// Revoke certificate
const revokeCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const { reason } = req.body;

    const certificate = await Certificate.findById(certificateId);
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    certificate.status = 'revoked';
    certificate.metadata = {
      ...certificate.metadata,
      revokedAt: new Date(),
      revokedBy: req.user.id,
      revokeReason: reason || 'No reason provided'
    };

    await certificate.save();

    res.json({
      success: true,
      message: 'Certificate revoked successfully',
      certificate
    });
  } catch (error) {
    console.error('Revoke certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke certificate'
    });
  }
};

// Regenerate certificate
const regenerateCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findById(certificateId);
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Generate new verification hash
    const crypto = require('crypto');
    const newVerificationHash = crypto.randomBytes(32).toString('hex');

    certificate.verificationHash = newVerificationHash;
    certificate.status = 'active';
    certificate.metadata = {
      ...certificate.metadata,
      regeneratedAt: new Date(),
      regeneratedBy: req.user.id,
      previousHash: certificate.verificationHash
    };

    await certificate.save();

    res.json({
      success: true,
      message: 'Certificate regenerated successfully',
      certificate
    });
  } catch (error) {
    console.error('Regenerate certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate certificate'
    });
  }
};

// ===== CATEGORY MANAGEMENT =====

// Get category statistics and management
const getCategoryManagement = async (req, res) => {
  try {
    // Get course categories with stats
    const courseCategories = await Course.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          totalCourses: { $sum: 1 },
          averageDifficulty: {
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ['$difficulty', 'beginner'] }, then: 1 },
                  { case: { $eq: ['$difficulty', 'intermediate'] }, then: 2 },
                  { case: { $eq: ['$difficulty', 'advanced'] }, then: 3 }
                ],
                default: 1
              }
            }
          },
          averageDuration: { $avg: '$estimatedDuration' }
        }
      },
      { $sort: { totalCourses: -1 } }
    ]);

    // Get enrollment stats by category
    const enrollmentsByCategory = await LearningProgress.aggregate([
      { $unwind: '$courses' },
      {
        $lookup: {
          from: 'courses',
          localField: 'courses.courseId',
          foreignField: '_id',
          as: 'courseInfo'
        }
      },
      {
        $group: {
          _id: { $arrayElemAt: ['$courseInfo.category', 0] },
          totalEnrollments: { $sum: 1 },
          completions: {
            $sum: {
              $cond: [{ $eq: ['$courses.status', 'completed'] }, 1, 0]
            }
          }
        }
      },
      {
        $addFields: {
          completionRate: {
            $multiply: [
              { $divide: ['$completions', '$totalEnrollments'] },
              100
            ]
          }
        }
      }
    ]);

    // Get achievement categories
    const achievementCategories = await Achievement.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          totalAchievements: { $sum: 1 },
          averageDifficulty: {
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ['$difficulty', 'beginner'] }, then: 1 },
                  { case: { $eq: ['$difficulty', 'intermediate'] }, then: 2 },
                  { case: { $eq: ['$difficulty', 'advanced'] }, then: 3 }
                ],
                default: 1
              }
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      categories: {
        courses: courseCategories,
        enrollments: enrollmentsByCategory,
        achievements: achievementCategories
      }
    });
  } catch (error) {
    console.error('Get category management error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category management data'
    });
  }
};

// Export functions
module.exports = {
  getAllAchievementsAdmin,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  getAllCertificatesAdmin,
  revokeCertificate,
  regenerateCertificate,
  getCategoryManagement
};
