const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const LearningProgress = require('../models/LearningProgress');
const { staffUpload, handleUploadErrors, getFileUrl } = require('../config/fileUpload');
const router = express.Router();

// Apply authentication to all routes
router.use(auth);

// GET /api/user/bookings - Get user's bookings
router.get('/bookings', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Try to find actual bookings using Booking model
    let bookings = [];
    try {
      const Booking = require('../models/Booking');
      bookings = await Booking.find({ userId })
        .populate('tourPackage', 'title description price duration')
        .sort({ createdAt: -1 })
        .lean();
    } catch (bookingError) {
      console.log('Booking model not found, returning empty array');
    }
    
    res.json({
      success: true,
      data: bookings.map(booking => ({
        id: booking._id,
        title: booking.tourPackage?.title || 'Tour Booking',
        date: booking.selectedDate,
        status: booking.status || 'pending',
        totalAmount: booking.totalAmount || 0,
        numberOfGuests: booking.numberOfGuests || 1,
        createdAt: booking.createdAt
      })),
      message: 'User bookings retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving bookings',
      error: error.message
    });
  }
});

// GET /api/user/platform/stats - Get platform statistics
router.get('/platform/stats', async (req, res) => {
  try {
    // Get counts from various collections
    const stats = {
      totalCourses: 0,
      totalLearners: 0,
      coursesCompleted: 0,
      successRate: 0,
      totalMuseums: 0,
      totalArtifacts: 0,
      totalUsers: 0,
      totalEvents: 0
    };

    try {
      const Course = require('../models/Course');
      stats.totalCourses = await Course.countDocuments({ isPublished: true });
    } catch (e) { /* Course model not found */ }

    try {
      const User = require('../models/User');
      stats.totalUsers = await User.countDocuments({ isActive: true });
      stats.totalLearners = stats.totalUsers; // For now, assume all users are learners
    } catch (e) { /* Already required above */ }

    try {
      const Museum = require('../models/Museum');
      stats.totalMuseums = await Museum.countDocuments({ isActive: true });
    } catch (e) { /* Museum model not found */ }

    try {
      const Artifact = require('../models/Artifact');
      stats.totalArtifacts = await Artifact.countDocuments({ isActive: true });
    } catch (e) { /* Artifact model not found */ }

    try {
      const Event = require('../models/Event');
      stats.totalEvents = await Event.countDocuments({ isActive: true });
    } catch (e) { /* Event model not found */ }

    // Calculate success rate based on available data
    if (stats.totalCourses > 0 && stats.totalLearners > 0) {
      stats.successRate = Math.round((stats.coursesCompleted / (stats.totalLearners * 0.3)) * 100);
      stats.successRate = Math.min(stats.successRate, 95); // Cap at 95%
    }

    res.json({
      success: true,
      data: stats,
      message: 'Platform statistics retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving platform stats',
      error: error.message
    });
  }
});

// GET /api/user/profile - Get comprehensive user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .select('-password')
      .populate('bookmarkedArtifacts', 'title description image')
      .populate('favoriteMuseums', 'name location description')
      .lean();
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Get learning progress if available
    const learningProgress = await LearningProgress.findOne({ userId })
      .populate('courses.courseId', 'title category image difficulty instructor averageRating')
      .lean();
    
    // Calculate profile completion percentage
    const profileFields = [
      user.firstName, user.lastName, user.email, user.phone, user.bio,
      user.dateOfBirth, user.nationality, user.interests?.length > 0,
      user.avatar, user.languages?.length > 0
    ];
    const completedFields = profileFields.filter(field => field && field !== '').length;
    const profileCompletionPercentage = Math.round((completedFields / profileFields.length) * 100);
    
    const enhancedProfile = {
      personal: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
        dateOfBirth: user.dateOfBirth,
        age: user.dateOfBirth ? Math.floor((new Date() - new Date(user.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
        nationality: user.nationality,
        languages: user.languages || [],
        interests: user.interests || [],
        location: user.location,
        occupation: user.occupation,
        education: user.education,
        memberSince: user.createdAt,
        lastLogin: user.lastLogin,
        isVerified: user.isVerified,
        role: user.role
      },
      profileStats: {
        completionPercentage: profileCompletionPercentage,
        profileViews: user.social?.profileViews || 0,
        totalBookmarks: user.bookmarkedArtifacts?.length || 0,
        totalFavorites: user.favoriteMuseums?.length || 0,
        joinedDaysAgo: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
      },
      learning: learningProgress ? {
        stats: {
          totalCourses: learningProgress.courses.length,
          completedCourses: learningProgress.courses.filter(c => c.status === 'completed').length,
          inProgressCourses: learningProgress.courses.filter(c => c.status === 'in_progress').length,
          totalLessonsCompleted: learningProgress.overallStats.totalLessonsCompleted || 0,
          totalTimeSpent: learningProgress.overallStats.totalTimeSpent || 0,
          averageScore: learningProgress.overallStats.averageScore || 0,
          currentStreak: learningProgress.overallStats.currentStreak || 0,
          longestStreak: learningProgress.overallStats.longestStreak || 0,
          level: Math.floor((learningProgress.overallStats.totalLessonsCompleted || 0) / 10) + 1,
          nextLevelProgress: ((learningProgress.overallStats.totalLessonsCompleted || 0) % 10) * 10
        },
        preferences: {
          preferredCategories: learningProgress.preferences?.preferredCategories || [],
          difficulty: learningProgress.preferences?.difficulty || 'beginner',
          studyReminders: learningProgress.preferences?.studyReminders !== false,
          weeklyGoal: learningProgress.preferences?.weeklyStudyGoal || 180
        },
        recentCourses: learningProgress.courses.slice(-3).map(course => ({
          id: course.courseId._id,
          title: course.courseId.title,
          category: course.courseId.category,
          image: course.courseId.image,
          difficulty: course.courseId.difficulty,
          instructor: course.courseId.instructor,
          rating: course.courseId.averageRating || 0,
          progress: course.progressPercentage,
          status: course.status,
          enrolledAt: course.enrolledAt,
          lastAccessed: course.lastAccessedAt
        })),
        achievements: learningProgress.achievements?.slice(-5) || [],
        categoryProgress: {}
      } : {
        stats: {
          totalCourses: 0,
          completedCourses: 0,
          inProgressCourses: 0,
          totalLessonsCompleted: 0,
          totalTimeSpent: 0,
          averageScore: 0,
          currentStreak: 0,
          longestStreak: 0,
          level: 1,
          nextLevelProgress: 0
        },
        preferences: {
          preferredCategories: [],
          difficulty: 'beginner',
          studyReminders: true,
          weeklyGoal: 180
        },
        recentCourses: [],
        achievements: [],
        categoryProgress: {}
      },
      bookmarks: {
        artifacts: user.bookmarkedArtifacts?.slice(0, 5) || [],
        totalArtifacts: user.bookmarkedArtifacts?.length || 0
      },
      favorites: {
        museums: user.favoriteMuseums?.slice(0, 5) || [],
        totalMuseums: user.favoriteMuseums?.length || 0
      },
      social: {
        profileViews: user.social?.profileViews || 0,
        followers: user.social?.followers?.length || 0,
        following: user.social?.following?.length || 0,
        isPublicProfile: user.social?.isPublicProfile !== false,
        socialLinks: user.social?.socialLinks || {}
      },
      preferences: {
        language: user.preferences?.language || 'en',
        timezone: user.preferences?.timezone || 'Africa/Addis_Ababa',
        theme: user.preferences?.theme || 'light',
        notifications: {
          email: user.preferences?.notifications?.email !== false,
          push: user.preferences?.notifications?.push !== false,
          reminders: user.preferences?.notifications?.reminders !== false,
          marketing: user.preferences?.notifications?.marketing === true
        },
        privacy: {
          profileVisibility: user.preferences?.privacy?.profileVisibility || 'public',
          showEmail: user.preferences?.privacy?.showEmail === true,
          showPhone: user.preferences?.privacy?.showPhone === true,
          showActivity: user.preferences?.privacy?.showActivity !== false
        },
        dashboard: {
          defaultView: user.preferences?.dashboard?.defaultView || 'overview',
          showProgress: user.preferences?.dashboard?.showProgress !== false,
          showRecommendations: user.preferences?.dashboard?.showRecommendations !== false
        }
      },
      activity: {
        lastLoginFormatted: user.lastLogin ? 
          new Date(user.lastLogin).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
          }) : 'Never',
        memberSinceFormatted: new Date(user.createdAt).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        }),
        isOnline: user.lastLogin && (new Date() - new Date(user.lastLogin)) < 15 * 60 * 1000, // 15 minutes
        recentActivity: [] // Can be populated with actual activity data
      }
    };
    
    // Calculate category progress if learning data exists
    if (learningProgress) {
      const categoryStats = {};
      learningProgress.courses.forEach(course => {
        const category = course.courseId.category;
        if (!categoryStats[category]) {
          categoryStats[category] = {
            totalCourses: 0,
            completedCourses: 0,
            totalLessons: 0,
            completedLessons: 0,
            totalTime: 0,
            averageScore: 0
          };
        }
        categoryStats[category].totalCourses++;
        if (course.status === 'completed') categoryStats[category].completedCourses++;
        categoryStats[category].totalLessons += course.lessons?.length || 0;
        categoryStats[category].completedLessons += course.lessons?.filter(l => l.status === 'completed').length || 0;
        categoryStats[category].totalTime += course.lessons?.reduce((sum, l) => sum + (l.timeSpent || 0), 0) || 0;
        
        const courseAvgScore = course.lessons?.length > 0 ?
          course.lessons.reduce((sum, l) => sum + (l.score || 0), 0) / course.lessons.length : 0;
        categoryStats[category].averageScore = 
          (categoryStats[category].averageScore + courseAvgScore) / 2;
      });
      enhancedProfile.learning.categoryProgress = categoryStats;
    }
    
    res.json({
      success: true,
      data: enhancedProfile,
      message: 'Comprehensive profile retrieved successfully'
    });
  } catch (error) {
    console.error('Get comprehensive profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving profile',
      error: error.message
    });
  }
});

// PUT /api/user/profile - Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated through this endpoint
    delete updateData.password;
    delete updateData.role;
    delete updateData.isVerified;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// GET /api/user/statistics - Get detailed user statistics
router.get('/statistics', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .populate('bookmarkedArtifacts')
      .populate('favoriteMuseums')
      .lean();
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const learningProgress = await LearningProgress.findOne({ userId }).lean();
    
    // Calculate various user statistics
    const membershipDuration = Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
    const yearsSinceMembership = Math.floor(membershipDuration / 365);
    const monthsSinceMembership = Math.floor((membershipDuration % 365) / 30);
    
    const statistics = {
      overview: {
        membershipDuration: {
          days: membershipDuration,
          years: yearsSinceMembership,
          months: monthsSinceMembership,
          formatted: yearsSinceMembership > 0 ? 
            `${yearsSinceMembership} year${yearsSinceMembership > 1 ? 's' : ''}${monthsSinceMembership > 0 ? `, ${monthsSinceMembership} month${monthsSinceMembership > 1 ? 's' : ''}` : ''}` :
            `${monthsSinceMembership} month${monthsSinceMembership > 1 ? 's' : ''}`
        },
        profileViews: user.social?.profileViews || 0,
        isVerified: user.isVerified,
        lastActive: user.lastLogin,
        accountStatus: 'Active'
      },
      engagement: {
        bookmarks: {
          total: user.bookmarkedArtifacts?.length || 0,
          categories: {}
        },
        favorites: {
          total: user.favoriteMuseums?.length || 0,
          museums: user.favoriteMuseums?.map(m => ({
            id: m._id,
            name: m.name,
            location: m.location
          })) || []
        },
        social: {
          followers: user.social?.followers?.length || 0,
          following: user.social?.following?.length || 0,
          profileViews: user.social?.profileViews || 0
        }
      },
      learning: learningProgress ? {
        totalTimeSpent: learningProgress.overallStats.totalTimeSpent || 0,
        timeSpentFormatted: `${Math.floor((learningProgress.overallStats.totalTimeSpent || 0) / 60)}h ${(learningProgress.overallStats.totalTimeSpent || 0) % 60}m`,
        coursesEnrolled: learningProgress.courses.length,
        coursesCompleted: learningProgress.courses.filter(c => c.status === 'completed').length,
        coursesInProgress: learningProgress.courses.filter(c => c.status === 'in_progress').length,
        lessonsCompleted: learningProgress.overallStats.totalLessonsCompleted || 0,
        averageScore: learningProgress.overallStats.averageScore || 0,
        currentStreak: learningProgress.overallStats.currentStreak || 0,
        longestStreak: learningProgress.overallStats.longestStreak || 0,
        learningLevel: Math.floor((learningProgress.overallStats.totalLessonsCompleted || 0) / 10) + 1,
        achievementsEarned: learningProgress.achievements?.length || 0,
        favoriteCategory: null, // Will calculate below
        studyConsistency: 0 // Will calculate below
      } : null,
      preferences: {
        language: user.preferences?.language || 'en',
        timezone: user.preferences?.timezone || 'Africa/Addis_Ababa',
        theme: user.preferences?.theme || 'light',
        notificationsEnabled: user.preferences?.notifications?.email !== false
      }
    };
    
    // Calculate bookmark categories if bookmarks exist
    if (user.bookmarkedArtifacts?.length > 0) {
      const categoryCount = {};
      user.bookmarkedArtifacts.forEach(artifact => {
        const category = artifact.category || 'Other';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
      statistics.engagement.bookmarks.categories = categoryCount;
    }
    
    // Calculate learning insights if learning data exists
    if (learningProgress) {
      // Find favorite category
      const categoryTime = {};
      learningProgress.courses.forEach(course => {
        const category = course.courseId?.category || 'Other';
        const courseTime = course.lessons?.reduce((sum, lesson) => sum + (lesson.timeSpent || 0), 0) || 0;
        categoryTime[category] = (categoryTime[category] || 0) + courseTime;
      });
      
      if (Object.keys(categoryTime).length > 0) {
        statistics.learning.favoriteCategory = Object.keys(categoryTime).reduce((a, b) => 
          categoryTime[a] > categoryTime[b] ? a : b
        );
      }
      
      // Calculate study consistency (simplified)
      const daysWithActivity = learningProgress.courses.reduce((count, course) => {
        const activeDays = new Set();
        course.lessons?.forEach(lesson => {
          if (lesson.completedAt) {
            activeDays.add(lesson.completedAt.toDateString());
          }
        });
        return count + activeDays.size;
      }, 0);
      
      statistics.learning.studyConsistency = Math.min(100, Math.round((daysWithActivity / membershipDuration) * 100));
    }
    
    res.json({
      success: true,
      data: statistics,
      message: 'User statistics retrieved successfully'
    });
    
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user statistics',
      error: error.message
    });
  }
});

// GET /api/user/activity - Get user activity history
router.get('/activity', async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, page = 1 } = req.query;
    
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const learningProgress = await LearningProgress.findOne({ userId })
      .populate('courses.courseId', 'title category image')
      .lean();
    
    const activities = [];
    
    // Add learning activities
    if (learningProgress) {
      // Course enrollments
      learningProgress.courses.forEach(course => {
        activities.push({
          id: `enrollment-${course.courseId._id}`,
          type: 'course_enrollment',
          title: 'Course Enrolled',
          description: `Enrolled in ${course.courseId.title}`,
          category: course.courseId.category,
          timestamp: course.enrolledAt,
          metadata: {
            courseId: course.courseId._id,
            courseTitle: course.courseId.title,
            courseImage: course.courseId.image
          }
        });
        
        // Course completions
        if (course.status === 'completed' && course.completedAt) {
          activities.push({
            id: `completion-${course.courseId._id}`,
            type: 'course_completion',
            title: 'Course Completed',
            description: `Completed ${course.courseId.title}`,
            category: course.courseId.category,
            timestamp: course.completedAt,
            metadata: {
              courseId: course.courseId._id,
              courseTitle: course.courseId.title,
              progress: course.progressPercentage
            }
          });
        }
        
        // Recent lesson completions
        if (course.lessons) {
          course.lessons
            .filter(lesson => lesson.status === 'completed' && lesson.completedAt)
            .slice(-3) // Last 3 lessons per course
            .forEach(lesson => {
              activities.push({
                id: `lesson-${lesson.lessonId}`,
                type: 'lesson_completion',
                title: 'Lesson Completed',
                description: `Completed a lesson in ${course.courseId.title}`,
                category: course.courseId.category,
                timestamp: lesson.completedAt,
                metadata: {
                  courseId: course.courseId._id,
                  courseTitle: course.courseId.title,
                  lessonId: lesson.lessonId,
                  score: lesson.score,
                  timeSpent: lesson.timeSpent
                }
              });
            });
        }
      });
      
      // Achievements
      if (learningProgress.achievements) {
        learningProgress.achievements.forEach(achievement => {
          activities.push({
            id: `achievement-${achievement.type}-${achievement.earnedAt}`,
            type: 'achievement_earned',
            title: 'Achievement Earned',
            description: achievement.title,
            category: 'achievement',
            timestamp: achievement.earnedAt,
            metadata: {
              achievementType: achievement.type,
              achievementTitle: achievement.title,
              achievementDescription: achievement.description
            }
          });
        });
      }
    }
    
    // Add profile activities
    activities.push({
      id: `profile-created-${user.createdAt}`,
      type: 'profile_created',
      title: 'Profile Created',
      description: 'Joined EthioHeritage360',
      category: 'profile',
      timestamp: user.createdAt,
      metadata: {}
    });
    
    if (user.lastLogin) {
      activities.push({
        id: `login-${user.lastLogin}`,
        type: 'login',
        title: 'Last Login',
        description: 'Logged into the platform',
        category: 'auth',
        timestamp: user.lastLogin,
        metadata: {}
      });
    }
    
    // Sort activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Paginate results
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedActivities = activities.slice(startIndex, endIndex);
    
    // Group activities by date for better display
    const groupedActivities = {};
    paginatedActivities.forEach(activity => {
      const date = new Date(activity.timestamp).toDateString();
      if (!groupedActivities[date]) {
        groupedActivities[date] = [];
      }
      groupedActivities[date].push(activity);
    });
    
    res.json({
      success: true,
      data: {
        activities: paginatedActivities,
        groupedActivities: groupedActivities,
        pagination: {
          currentPage: parseInt(page),
          totalItems: activities.length,
          totalPages: Math.ceil(activities.length / parseInt(limit)),
          itemsPerPage: parseInt(limit),
          hasNextPage: endIndex < activities.length,
          hasPreviousPage: startIndex > 0
        },
        summary: {
          totalActivities: activities.length,
          activityTypes: {
            courseEnrollments: activities.filter(a => a.type === 'course_enrollment').length,
            courseCompletions: activities.filter(a => a.type === 'course_completion').length,
            lessonCompletions: activities.filter(a => a.type === 'lesson_completion').length,
            achievementsEarned: activities.filter(a => a.type === 'achievement_earned').length
          }
        }
      },
      message: 'User activity retrieved successfully'
    });
    
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user activity',
      error: error.message
    });
  }
});

// GET /api/user/heritage-sites - Get heritage sites
router.get('/heritage-sites', async (req, res) => {
  try {
    // For now, return empty array - implement with actual heritage sites logic
    res.json({
      success: true,
      data: [],
      message: 'Heritage sites retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving heritage sites',
      error: error.message
    });
  }
});

// GET /api/user/dashboard - Get user dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .select('-password')
      .lean();
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Get learning progress for dashboard stats
    const learningProgress = await LearningProgress.findOne({ userId }).lean();
    
    const dashboardData = {
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        memberSince: user.createdAt
      },
      stats: {
        totalBookings: 0, // Museum bookings
        activeBookings: 0,
        completedTours: 0,
        // Learning stats if available
        ...(learningProgress && {
          totalCourses: learningProgress.courses.length,
          completedCourses: learningProgress.courses.filter(c => c.status === 'completed').length,
          learningLevel: Math.floor((learningProgress.overallStats.totalLessonsCompleted || 0) / 10) + 1
        })
      },
      recentActivity: [],
      hasLearningData: !!learningProgress
    };
    
    res.json({
      success: true,
      data: dashboardData,
      message: 'User dashboard data retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving dashboard data',
      error: error.message
    });
  }
});

// POST /api/user/avatar - Upload profile picture/avatar
router.post('/avatar', staffUpload.single('avatar'), handleUploadErrors, async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Generate the full URL for the uploaded file
    const avatarUrl = getFileUrl(req.file.filename, 'staffAvatars');
    
    // Update user avatar in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        avatar: avatarUrl,
        // Also store just the filename for easier file management
        avatarFilename: req.file.filename 
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        avatar: avatarUrl,
        filename: req.file.filename,
        size: req.file.size,
        user: {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          avatar: updatedUser.avatar
        }
      }
    });
    
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile picture',
      error: error.message
    });
  }
});

module.exports = router;
