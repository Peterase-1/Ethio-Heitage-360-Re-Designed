const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import models
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Assignment = require('../models/Assignment');
const LearningProgress = require('../models/LearningProgress');
const Discussion = require('../models/Discussion');
const Feedback = require('../models/Feedback');

// ===== MAIN STUDENT DASHBOARD =====

// Get comprehensive student dashboard data
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user profile with learning data
    const user = await User.findById(userId)
      .populate('bookmarkedArtifacts')
      .populate('favoriteMuseums')
      .lean();
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Get learning progress
    const learningProgress = await LearningProgress.findOne({ userId })
      .populate({
        path: 'courses.courseId',
        select: 'title description category difficulty image instructor price duration averageRating'
      })
      .lean();
    
    // Initialize dashboard data
    const dashboardData = {
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        avatar: user.avatar || user.profile?.avatar,
        bio: user.bio || user.profile?.bio,
        interests: user.interests || [],
        memberSince: user.createdAt,
        lastLogin: user.lastLogin,
        profileViews: user.social?.profileViews || 0
      },
      learningStats: {
        totalCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        totalLessonsCompleted: 0,
        totalTimeSpent: 0, // in minutes
        currentStreak: 0,
        longestStreak: 0,
        averageScore: 0,
        totalAchievements: 0,
        learningLevel: 1,
        nextLevelProgress: 0
      },
      recentActivity: {
        courses: [],
        achievements: [],
        completedLessons: []
      },
      currentCourses: [],
      upcomingDeadlines: [],
      recommendations: {
        courses: [],
        topics: []
      },
      achievements: [],
      weeklyGoals: {
        lessonsTarget: 5,
        lessonsCompleted: 0,
        timeTarget: 180, // 3 hours in minutes
        timeSpent: 0,
        progressPercentage: 0
      }
    };
    
    if (learningProgress) {
      // Calculate learning statistics
      const enrolledCourses = learningProgress.courses.length;
      const completedCourses = learningProgress.courses.filter(c => c.status === 'completed').length;
      const inProgressCourses = learningProgress.courses.filter(c => c.status === 'in_progress').length;
      
      dashboardData.learningStats = {
        totalCourses: enrolledCourses,
        completedCourses: completedCourses,
        inProgressCourses: inProgressCourses,
        totalLessonsCompleted: learningProgress.overallStats.totalLessonsCompleted || 0,
        totalTimeSpent: learningProgress.overallStats.totalTimeSpent || 0,
        currentStreak: learningProgress.overallStats.currentStreak || 0,
        longestStreak: learningProgress.overallStats.longestStreak || 0,
        averageScore: learningProgress.overallStats.averageScore || 0,
        totalAchievements: learningProgress.achievements?.length || 0,
        learningLevel: Math.floor((learningProgress.overallStats.totalLessonsCompleted || 0) / 10) + 1,
        nextLevelProgress: ((learningProgress.overallStats.totalLessonsCompleted || 0) % 10) * 10
      };
      
      // Current courses with progress
      dashboardData.currentCourses = learningProgress.courses
        .filter(c => c.status === 'in_progress' || c.status === 'enrolled')
        .slice(0, 6)
        .map(courseProgress => ({
          id: courseProgress.courseId._id,
          title: courseProgress.courseId.title,
          description: courseProgress.courseId.description,
          category: courseProgress.courseId.category,
          difficulty: courseProgress.courseId.difficulty,
          image: courseProgress.courseId.image,
          instructor: courseProgress.courseId.instructor,
          progress: courseProgress.progressPercentage,
          status: courseProgress.status,
          enrolledAt: courseProgress.enrolledAt,
          lastAccessed: courseProgress.lessons?.reduce((latest, lesson) => 
            lesson.lastAccessedAt > latest ? lesson.lastAccessedAt : latest, 
            courseProgress.enrolledAt
          ),
          nextLesson: courseProgress.lessons?.find(l => l.status === 'not_started')?.lessonId || null,
          completedLessons: courseProgress.lessons?.filter(l => l.status === 'completed').length || 0,
          totalLessons: courseProgress.lessons?.length || 0,
          estimatedTimeToComplete: Math.max(0, (courseProgress.courseId.duration || 4) * 60 - (courseProgress.lessons?.reduce((sum, l) => sum + (l.timeSpent || 0), 0) || 0))
        }));
      
      // Recent activity
      const recentCompletedLessons = [];
      learningProgress.courses.forEach(course => {
        course.lessons?.forEach(lesson => {
          if (lesson.status === 'completed' && lesson.completedAt) {
            recentCompletedLessons.push({
              lessonId: lesson.lessonId,
              courseId: course.courseId._id,
              courseTitle: course.courseId.title,
              completedAt: lesson.completedAt,
              score: lesson.score,
              timeSpent: lesson.timeSpent
            });
          }
        });
      });
      
      dashboardData.recentActivity = {
        courses: learningProgress.courses
          .filter(c => c.enrolledAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          .slice(0, 5)
          .map(course => ({
            id: course.courseId._id,
            title: course.courseId.title,
            action: 'enrolled',
            date: course.enrolledAt,
            progress: course.progressPercentage
          })),
        achievements: learningProgress.achievements?.slice(-5).reverse() || [],
        completedLessons: recentCompletedLessons
          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
          .slice(0, 10)
      };
      
      // Weekly goals calculation
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weeklyLessons = recentCompletedLessons.filter(
        lesson => new Date(lesson.completedAt) >= weekStart
      ).length;
      
      const weeklyTime = recentCompletedLessons.filter(
        lesson => new Date(lesson.completedAt) >= weekStart
      ).reduce((sum, lesson) => sum + (lesson.timeSpent || 0), 0);
      
      dashboardData.weeklyGoals = {
        lessonsTarget: user.learningProfile?.preferences?.weeklyStudyGoal ? Math.floor(user.learningProfile.preferences.weeklyStudyGoal / 30) : 5,
        lessonsCompleted: weeklyLessons,
        timeTarget: user.learningProfile?.preferences?.weeklyStudyGoal || 180,
        timeSpent: weeklyTime,
        progressPercentage: Math.min(100, Math.round(
          ((weeklyLessons / 5) * 50 + (weeklyTime / 180) * 50)
        ))
      };
      
      dashboardData.achievements = learningProgress.achievements || [];
    }
    
    // Get upcoming assignment deadlines
    if (learningProgress) {
      const enrolledCourseIds = learningProgress.courses.map(c => c.courseId._id);
      const assignments = await Assignment.find({
        courseId: { $in: enrolledCourseIds },
        dueDate: { $gte: new Date() },
        isActive: true
      })
      .populate('courseId', 'title')
      .sort({ dueDate: 1 })
      .limit(5)
      .lean();
      
      dashboardData.upcomingDeadlines = assignments.map(assignment => ({
        id: assignment._id,
        title: assignment.title,
        courseTitle: assignment.courseId.title,
        dueDate: assignment.dueDate,
        type: assignment.type,
        points: assignment.totalPoints,
        daysUntilDue: Math.ceil((assignment.dueDate - new Date()) / (1000 * 60 * 60 * 24)),
        isSubmitted: assignment.submissions.some(sub => 
          sub.studentId.toString() === userId.toString()
        )
      }));
    }
    
    // Get course recommendations based on interests and progress
    const userInterests = user.interests || [];
    if (userInterests.length > 0) {
      const categoryMap = {
        'Ancient History': 'history',
        'Art & Culture': 'art',
        'Archaeology': 'archaeology',
        'Religious Heritage': 'history',
        'Traditional Crafts': 'art'
      };
      
      const preferredCategories = userInterests
        .map(interest => categoryMap[interest])
        .filter(Boolean);
      
      if (preferredCategories.length > 0) {
        const recommendedCourses = await Course.find({
          category: { $in: preferredCategories },
          isActive: true,
          status: 'published',
          _id: { $nin: learningProgress?.courses.map(c => c.courseId) || [] }
        })
        .sort({ averageRating: -1, enrollmentCount: -1 })
        .limit(6)
        .lean();
        
        dashboardData.recommendations.courses = recommendedCourses.map(course => ({
          id: course._id,
          title: course.title,
          description: course.description.substring(0, 100) + '...',
          category: course.category,
          difficulty: course.difficulty,
          image: course.image,
          instructor: course.instructor,
          rating: course.averageRating || 0,
          enrollmentCount: course.enrollmentCount || 0,
          estimatedDuration: course.estimatedDuration || 240,
          price: course.price || 0,
          matchReason: `Based on your interest in ${userInterests.find(i => categoryMap[i] === course.category) || course.category}`
        }));
        
        dashboardData.recommendations.topics = preferredCategories.slice(0, 3);
      }
    }
    
    res.json({
      success: true,
      data: dashboardData
    });
    
  } catch (error) {
    console.error('Get student dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== LEARNING ANALYTICS =====

// Get detailed learning analytics for a student
router.get('/analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = '30d' } = req.query; // 7d, 30d, 90d, 1y
    
    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    
    const days = periodDays[period] || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const learningProgress = await LearningProgress.findOne({ userId })
      .populate('courses.courseId', 'title category difficulty')
      .lean();
    
    if (!learningProgress) {
      return res.json({
        success: true,
        data: {
          overview: { totalTime: 0, completedLessons: 0, averageScore: 0, activeStreak: 0 },
          timeSpent: { daily: [], weekly: [], monthly: [] },
          performance: { byCategory: [], byDifficulty: [], trends: [] },
          engagement: { loginDays: [], studyDays: [], averageSessionTime: 0 },
          progress: { coursesCompleted: 0, lessonsCompleted: 0, certificatesEarned: 0 }
        }
      });
    }
    
    // Calculate analytics
    const analytics = {
      overview: {
        totalTime: learningProgress.overallStats.totalTimeSpent || 0,
        completedLessons: learningProgress.overallStats.totalLessonsCompleted || 0,
        averageScore: learningProgress.overallStats.averageScore || 0,
        activeStreak: learningProgress.overallStats.currentStreak || 0,
        totalCourses: learningProgress.courses.length,
        completedCourses: learningProgress.courses.filter(c => c.status === 'completed').length,
        inProgressCourses: learningProgress.courses.filter(c => c.status === 'in_progress').length
      },
      timeSpent: {
        daily: [],
        weekly: [],
        categories: {}
      },
      performance: {
        byCategory: {},
        byDifficulty: {},
        scoreHistory: []
      },
      engagement: {
        studyDays: 0,
        averageSessionTime: 0,
        mostActiveHour: null,
        consistencyScore: 0
      },
      courses: learningProgress.courses.map(course => ({
        id: course.courseId._id,
        title: course.courseId.title,
        category: course.courseId.category,
        difficulty: course.courseId.difficulty,
        progress: course.progressPercentage,
        status: course.status,
        timeSpent: course.lessons.reduce((sum, lesson) => sum + (lesson.timeSpent || 0), 0),
        averageScore: course.lessons.length > 0 ? 
          course.lessons.reduce((sum, lesson) => sum + (lesson.score || 0), 0) / course.lessons.length : 0,
        completedLessons: course.lessons.filter(l => l.status === 'completed').length,
        totalLessons: course.lessons.length
      }))
    };
    
    // Calculate performance by category and difficulty
    learningProgress.courses.forEach(course => {
      const category = course.courseId.category;
      const difficulty = course.courseId.difficulty;
      const courseTime = course.lessons.reduce((sum, lesson) => sum + (lesson.timeSpent || 0), 0);
      const courseScore = course.lessons.length > 0 ? 
        course.lessons.reduce((sum, lesson) => sum + (lesson.score || 0), 0) / course.lessons.length : 0;
      
      if (!analytics.performance.byCategory[category]) {
        analytics.performance.byCategory[category] = { timeSpent: 0, averageScore: 0, courses: 0, completedLessons: 0 };
      }
      if (!analytics.performance.byDifficulty[difficulty]) {
        analytics.performance.byDifficulty[difficulty] = { timeSpent: 0, averageScore: 0, courses: 0, completedLessons: 0 };
      }
      
      analytics.performance.byCategory[category].timeSpent += courseTime;
      analytics.performance.byCategory[category].courses += 1;
      analytics.performance.byCategory[category].completedLessons += course.lessons.filter(l => l.status === 'completed').length;
      
      analytics.performance.byDifficulty[difficulty].timeSpent += courseTime;
      analytics.performance.byDifficulty[difficulty].courses += 1;
      analytics.performance.byDifficulty[difficulty].completedLessons += course.lessons.filter(l => l.status === 'completed').length;
      
      if (courseScore > 0) {
        analytics.performance.byCategory[category].averageScore = 
          (analytics.performance.byCategory[category].averageScore + courseScore) / 2;
        analytics.performance.byDifficulty[difficulty].averageScore = 
          (analytics.performance.byDifficulty[difficulty].averageScore + courseScore) / 2;
      }
    });
    
    // Generate time-based data (simplified for demo)
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Simulate daily study time (in real app, you'd track actual daily activity)
      const dailyTime = Math.floor(Math.random() * 60) + 10; // 10-70 minutes
      analytics.timeSpent.daily.push({
        date: dateStr,
        timeSpent: dailyTime,
        lessonsCompleted: Math.floor(dailyTime / 30)
      });
    }
    
    res.json({ success: true, data: analytics });
    
  } catch (error) {
    console.error('Get learning analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== STUDENT PROFILE ENHANCEMENT =====

// Get enhanced student profile with learning integration
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const learningProgress = await LearningProgress.findOne({ userId })
      .populate('courses.courseId', 'title category image')
      .lean();
    
    // Enhanced profile with learning data
    const enhancedProfile = {
      personal: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar || user.profile?.avatar,
        bio: user.bio || user.profile?.bio,
        dateOfBirth: user.dateOfBirth,
        nationality: user.nationality,
        languages: user.languages || [],
        interests: user.interests || [],
        memberSince: user.createdAt,
        lastLogin: user.lastLogin
      },
      learning: {
        stats: {
          totalCourses: learningProgress?.courses.length || 0,
          completedCourses: learningProgress?.courses.filter(c => c.status === 'completed').length || 0,
          inProgressCourses: learningProgress?.courses.filter(c => c.status === 'in_progress').length || 0,
          totalLessonsCompleted: learningProgress?.overallStats.totalLessonsCompleted || 0,
          totalTimeSpent: learningProgress?.overallStats.totalTimeSpent || 0,
          averageScore: learningProgress?.overallStats.averageScore || 0,
          currentStreak: learningProgress?.overallStats.currentStreak || 0,
          longestStreak: learningProgress?.overallStats.longestStreak || 0,
          level: Math.floor((learningProgress?.overallStats.totalLessonsCompleted || 0) / 10) + 1
        },
        preferences: {
          preferredCategories: learningProgress?.preferences.preferredCategories || [],
          difficulty: learningProgress?.preferences.difficulty || 'beginner',
          studyReminders: user.learningProfile?.preferences?.studyReminders !== false,
          weeklyGoal: user.learningProfile?.preferences?.weeklyStudyGoal || 180
        },
        recentCourses: learningProgress?.courses.slice(-3).map(course => ({
          id: course.courseId._id,
          title: course.courseId.title,
          category: course.courseId.category,
          image: course.courseId.image,
          progress: course.progressPercentage,
          status: course.status,
          enrolledAt: course.enrolledAt
        })) || [],
        achievements: learningProgress?.achievements.slice(-5) || []
      },
      social: {
        profileViews: user.social?.profileViews || 0,
        followers: user.social?.followers.length || 0,
        following: user.social?.following.length || 0,
        isPublicProfile: user.social?.isPublicProfile !== false
      },
      preferences: {
        language: user.preferences?.language || 'en',
        timezone: user.preferences?.timezone || 'Africa/Addis_Ababa',
        notifications: {
          email: user.preferences?.notifications.email !== false,
          push: user.preferences?.notifications.push !== false,
          reminders: user.preferences?.notifications.reminders !== false
        },
        privacy: {
          profileVisibility: user.preferences?.privacy.profileVisibility || 'public',
          showEmail: user.preferences?.privacy.showEmail === true,
          showPhone: user.preferences?.privacy.showPhone === true
        },
        dashboard: {
          theme: user.preferences?.dashboard.theme || 'light',
          defaultView: user.preferences?.dashboard.defaultView || 'grid'
        }
      }
    };
    
    res.json({ success: true, data: enhancedProfile });
    
  } catch (error) {
    console.error('Get enhanced profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update student learning preferences
router.put('/profile/:userId/learning-preferences', async (req, res) => {
  try {
    const { userId } = req.params;
    const { preferredCategories, difficulty, weeklyGoal, studyReminders, notifications } = req.body;
    
    // Update learning progress preferences
    const learningProgress = await LearningProgress.findOne({ userId });
    if (learningProgress) {
      if (preferredCategories) learningProgress.preferences.preferredCategories = preferredCategories;
      if (difficulty) learningProgress.preferences.difficulty = difficulty;
      if (notifications !== undefined) learningProgress.preferences.notifications = notifications;
      
      await learningProgress.save();
    }
    
    // Update user profile learning preferences
    const updateData = {};
    if (weeklyGoal) updateData['learningProfile.preferences.weeklyStudyGoal'] = weeklyGoal;
    if (studyReminders !== undefined) updateData['learningProfile.preferences.studyReminders'] = studyReminders;
    
    if (Object.keys(updateData).length > 0) {
      await User.findByIdAndUpdate(userId, { $set: updateData });
    }
    
    res.json({ success: true, message: 'Learning preferences updated successfully' });
    
  } catch (error) {
    console.error('Update learning preferences error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== ACHIEVEMENTS AND GAMIFICATION =====

// Get student achievements and badges
router.get('/achievements/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const learningProgress = await LearningProgress.findOne({ userId }).lean();
    const user = await User.findById(userId).select('gamification stats').lean();
    
    const achievements = {
      learning: learningProgress?.achievements || [],
      platform: user?.gamification?.badges || [],
      stats: {
        totalAchievements: (learningProgress?.achievements?.length || 0) + (user?.gamification?.badges?.length || 0),
        recentAchievements: [],
        categories: {
          learning: learningProgress?.achievements?.length || 0,
          social: user?.gamification?.badges?.filter(b => b.category === 'social').length || 0,
          exploration: user?.gamification?.badges?.filter(b => b.category === 'exploration').length || 0,
          achievement: user?.gamification?.badges?.filter(b => b.category === 'achievement').length || 0
        }
      },
      progress: {
        nextMilestones: [
          {
            type: 'lessons',
            current: learningProgress?.overallStats.totalLessonsCompleted || 0,
            target: Math.ceil(((learningProgress?.overallStats.totalLessonsCompleted || 0) + 1) / 10) * 10,
            reward: 'Level Up Badge'
          },
          {
            type: 'courses',
            current: learningProgress?.courses?.filter(c => c.status === 'completed').length || 0,
            target: Math.ceil(((learningProgress?.courses?.filter(c => c.status === 'completed').length || 0) + 1) / 5) * 5,
            reward: 'Course Master Badge'
          }
        ]
      }
    };
    
    // Combine and sort recent achievements
    const allAchievements = [
      ...(learningProgress?.achievements || []).map(a => ({ ...a, source: 'learning' })),
      ...(user?.gamification?.badges || []).map(b => ({ ...b, source: 'platform', earnedAt: b.earnedAt }))
    ].sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt));
    
    achievements.stats.recentAchievements = allAchievements.slice(0, 10);
    
    res.json({ success: true, data: achievements });
    
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== STUDY PLANNER =====

// Get personalized study plan
router.get('/study-plan/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const learningProgress = await LearningProgress.findOne({ userId })
      .populate('courses.courseId', 'title category difficulty estimatedDuration')
      .lean();
    
    const user = await User.findById(userId).select('learningProfile interests').lean();
    
    if (!learningProgress) {
      return res.json({
        success: true,
        data: {
          weeklyPlan: [],
          recommendations: {
            action: 'enroll',
            message: 'Start your learning journey by enrolling in your first course!'
          }
        }
      });
    }
    
    const weeklyGoal = user?.learningProfile?.preferences?.weeklyStudyGoal || 180; // 3 hours
    const dailyGoal = Math.floor(weeklyGoal / 7);
    
    // Generate weekly study plan
    const weeklyPlan = [];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    const inProgressCourses = learningProgress.courses.filter(c => 
      c.status === 'in_progress' || c.status === 'enrolled'
    );
    
    daysOfWeek.forEach((day, index) => {
      const course = inProgressCourses[index % inProgressCourses.length];
      if (course) {
        const nextLesson = course.lessons?.find(l => l.status === 'not_started' || l.status === 'in_progress');
        
        weeklyPlan.push({
          day: day,
          course: {
            id: course.courseId._id,
            title: course.courseId.title,
            category: course.courseId.category
          },
          suggestedDuration: dailyGoal,
          tasks: [
            nextLesson ? `Continue with next lesson` : 'Review completed lessons',
            'Complete practice exercises',
            'Participate in discussions'
          ],
          priority: course.status === 'enrolled' ? 'high' : 'medium'
        });
      }
    });
    
    const studyPlan = {
      weeklyPlan: weeklyPlan,
      goals: {
        weekly: {
          timeGoal: weeklyGoal,
          lessonsGoal: Math.floor(weeklyGoal / 30),
          coursesToFocus: Math.min(3, inProgressCourses.length)
        },
        progress: {
          completedThisWeek: 0, // Would calculate from actual data
          timeSpentThisWeek: 0,  // Would calculate from actual data
          onTrack: true
        }
      },
      recommendations: {
        action: inProgressCourses.length === 0 ? 'enroll' : 'continue',
        message: inProgressCourses.length === 0 ? 
          'Enroll in a course to start your personalized study plan' :
          `Focus on ${inProgressCourses.length} course${inProgressCourses.length > 1 ? 's' : ''} this week`,
        suggestedCourses: [], // Would populate with recommendations
        studyTips: [
          'Set a consistent study schedule',
          'Take breaks every 25-30 minutes',
          'Review previous lessons before starting new ones',
          'Engage with course discussions and community'
        ]
      }
    };
    
    res.json({ success: true, data: studyPlan });
    
  } catch (error) {
    console.error('Get study plan error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
