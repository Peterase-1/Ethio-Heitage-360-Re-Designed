const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const LearningProgress = require('../models/LearningProgress');
const Achievement = require('../models/Achievement');
const Certificate = require('../models/Certificate');

// Get all courses
const getCourses = async (req, res) => {
  try {
    const { category, difficulty, limit = 6, includeAdvanced = 'false', organizerOnly = 'true' } = req.query;
    
    // Only show active, published courses by default
    const filter = { isActive: true, status: 'published' };

    // Only show organizer-managed courses on the public education page by default
    if (organizerOnly === 'true') {
      filter.organizerId = { $exists: true };
    }

    // Category filter
    if (category) filter.category = category;

    // Difficulty filter: exclude advanced by default unless explicitly included
    if (difficulty) {
      filter.difficulty = difficulty;
    } else if (includeAdvanced !== 'true') {
      filter.difficulty = { $ne: 'advanced' };
    }
    
    const courses = await Course.find(filter)
      .populate('lessons')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses'
    });
  }
};

// Get course by ID
const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId)
      .populate('lessons')
      .populate('createdBy', 'name email');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    res.json({
      success: true,
      course
    });
  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course'
    });
  }
};

// Get lessons for a course
const getLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const lessons = await Lesson.find({ courseId, isActive: true })
      .sort({ order: 1 });
    
    res.json({
      success: true,
      lessons
    });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lessons'
    });
  }
};

// Get lesson by ID
const getLessonById = async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    const lesson = await Lesson.findById(lessonId)
      .populate('courseId', 'title category')
      .populate('prerequisites', 'title');
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    res.json({
      success: true,
      lesson
    });
  } catch (error) {
    console.error('Get lesson by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson'
    });
  }
};

// Start a lesson
const startLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;
    
    const lesson = await Lesson.findById(lessonId).populate('courseId');
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    // Get or create learning progress
    let progress = await LearningProgress.findOne({ userId });
    if (!progress) {
      progress = new LearningProgress({
        userId,
        courses: [],
        overallStats: {}
      });
    }
    
    // Get or create course progress
    let courseProgress = progress.getCourseProgress(lesson.courseId._id);
    if (!courseProgress) {
      courseProgress = {
        courseId: lesson.courseId._id,
        status: 'not_started',
        progressPercentage: 0,
        lessons: []
      };
      progress.courses.push(courseProgress);
    }
    
    // Get or create lesson progress
    let lessonProgress = courseProgress.lessons.find(l => l.lessonId.toString() === lessonId);
    if (!lessonProgress) {
      lessonProgress = {
        lessonId: lesson._id,
        status: 'not_started',
        timeSpent: 0,
        attempts: 0
      };
      courseProgress.lessons.push(lessonProgress);
    }
    
    // Update lesson progress
    if (lessonProgress.status === 'not_started') {
      lessonProgress.status = 'in_progress';
      lessonProgress.startedAt = new Date();
    }
    lessonProgress.lastAccessedAt = new Date();
    
    // Update course progress if needed
    if (courseProgress.status === 'not_started') {
      courseProgress.status = 'in_progress';
      courseProgress.startedAt = new Date();
    }
    
    await progress.save();
    
    res.json({
      success: true,
      message: 'Lesson started successfully',
      lessonProgress
    });
  } catch (error) {
    console.error('Start lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start lesson'
    });
  }
};

// Complete a lesson - THIS IS THE KEY FUNCTION FOR THE SERVICE FINISH FUNCTIONALITY
const completeLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;
    const { score, timeSpent, answers } = req.body;
    
    const lesson = await Lesson.findById(lessonId).populate('courseId');
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    // Get or create learning progress
    let progress = await LearningProgress.findOne({ userId });
    if (!progress) {
      progress = new LearningProgress({
        userId,
        courses: [],
        overallStats: {}
      });
    }
    
    // Get course progress
    let courseProgress = progress.getCourseProgress(lesson.courseId._id);
    if (!courseProgress) {
      courseProgress = {
        courseId: lesson.courseId._id,
        status: 'in_progress',
        progressPercentage: 0,
        lessons: []
      };
      progress.courses.push(courseProgress);
    }
    
    // Get lesson progress
    let lessonProgress = courseProgress.lessons.find(l => l.lessonId.toString() === lessonId);
    if (!lessonProgress) {
      lessonProgress = {
        lessonId: lesson._id,
        status: 'not_started',
        timeSpent: 0,
        attempts: 0,
        startedAt: new Date()
      };
      courseProgress.lessons.push(lessonProgress);
    }
    
    // Update lesson progress
    lessonProgress.status = 'completed';
    lessonProgress.completedAt = new Date();
    lessonProgress.attempts += 1;
    
    if (timeSpent) {
      lessonProgress.timeSpent += parseInt(timeSpent);
      progress.overallStats.totalTimeSpent += parseInt(timeSpent);
    }
    
    if (score !== undefined) {
      lessonProgress.score = Math.max(lessonProgress.score || 0, parseInt(score));
    }
    
    // Update overall stats
    progress.overallStats.totalLessonsCompleted += 1;
    progress.updateStreak();
    
    // Calculate average score
    const completedLessonsWithScores = [];
    progress.courses.forEach(course => {
      course.lessons.forEach(lesson => {
        if (lesson.status === 'completed' && lesson.score !== undefined) {
          completedLessonsWithScores.push(lesson.score);
        }
      });
    });
    
    if (completedLessonsWithScores.length > 0) {
      progress.overallStats.averageScore = Math.round(
        completedLessonsWithScores.reduce((sum, score) => sum + score, 0) / completedLessonsWithScores.length
      );
    }
    
    // Update course progress
    progress.updateCourseProgress(lesson.courseId._id);
    
    // Add achievements
    const newAchievements = [];
    
    // First lesson completion achievement
    if (progress.overallStats.totalLessonsCompleted === 1) {
      const achievement = {
        achievementId: 'first_lesson_complete',
        type: 'lesson_complete',
        earnedAt: new Date()
      };
      progress.achievements.push(achievement);
      newAchievements.push(achievement);
    }
    
    // Streak achievements
    if (progress.overallStats.currentStreak === 7) {
      const achievement = {
        achievementId: 'week_streak',
        type: 'streak',
        earnedAt: new Date()
      };
      progress.achievements.push(achievement);
      newAchievements.push(achievement);
    }
    
    // Course completion achievement
    if (courseProgress.status === 'completed') {
      const achievement = {
        achievementId: 'course_complete',
        type: 'course_complete',
        earnedAt: new Date()
      };
      progress.achievements.push(achievement);
      newAchievements.push(achievement);
    }
    
    await progress.save();
    
    res.json({
      success: true,
      message: 'Lesson completed successfully',
      data: {
        lessonProgress,
        courseProgress,
        overallStats: progress.overallStats,
        newAchievements
      }
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete lesson'
    });
  }
};

// Get user's learning progress
const getLearningProgress = async (req, res) => {
  try {
    // Require authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access learning progress'
      });
    }

    const userId = req.user.id;
    
    const progress = await LearningProgress.findOne({ userId })
      .populate('courses.courseId', 'title category difficulty image')
      .populate('courses.lessons.lessonId', 'title estimatedDuration');
    
    if (!progress) {
      return res.json({
        success: true,
        progress: {
          courses: [],
          overallStats: {
            totalLessonsCompleted: 0,
            totalTimeSpent: 0,
            currentStreak: 0,
            longestStreak: 0,
            averageScore: 0
          },
          achievements: []
        }
      });
    }
    
    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Get learning progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learning progress'
    });
  }
};

// Get learning achievements
const getLearningAchievements = async (req, res) => {
  try {
    // Require authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access achievements'
      });
    }

    const userId = req.user.id;
    
    const progress = await LearningProgress.findOne({ userId });
    
    if (!progress) {
      return res.json({
        success: true,
        achievements: []
      });
    }
    
    res.json({
      success: true,
      achievements: progress.achievements
    });
  } catch (error) {
    console.error('Get learning achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements'
    });
  }
};

// Get learning recommendations
const getRecommendations = async (req, res) => {
  try {
    // For unauthenticated users, provide general beginner recommendations
    if (!req.user || !req.user.id) {
      const beginnerCourses = await Course.find({ 
        difficulty: 'beginner', 
        isActive: true,
        status: 'published'
      })
      .limit(4)
      .select('_id title description image category difficulty');
      
      const recommendations = beginnerCourses.map(course => ({
        id: course._id,
        type: 'course',
        title: course.title,
        description: course.description,
        category: course.category,
        difficulty: course.difficulty,
        image: course.image,
        reason: 'Perfect for getting started with Ethiopian heritage learning'
      }));
      
      return res.json({
        success: true,
        recommendations
      });
    }

    const userId = req.user.id;
    
    // Get user's progress to make personalized recommendations
    const progress = await LearningProgress.findOne({ userId });
    
    let recommendations = [];
    
    // If user has no progress, recommend beginner courses
    if (!progress || progress.courses.length === 0) {
      const beginnerCourses = await Course.find({ 
        difficulty: 'beginner', 
        isActive: true 
      })
      .limit(3)
      .populate('lessons');
      
      recommendations = beginnerCourses.map(course => ({
        id: course._id,
        type: 'course',
        title: course.title,
        description: course.description,
        category: course.category,
        difficulty: course.difficulty,
        image: course.image,
        reason: 'Perfect for getting started with Ethiopian heritage learning'
      }));
    } else {
      // Recommend based on user's interests and progress
      const completedCategories = progress.courses.map(c => c.courseId?.category).filter(Boolean);
      const preferredCategories = progress.preferences?.preferredCategories || [];
      
      // Recommend courses in categories user hasn't completed yet
      const uncompletedCategories = ['history', 'culture', 'archaeology', 'language', 'art', 'traditions']
        .filter(cat => !completedCategories.includes(cat));
      
      if (uncompletedCategories.length > 0) {
        const recommendedCourses = await Course.find({
          category: { $in: uncompletedCategories },
          isActive: true
        }).limit(3);
        
        recommendations = recommendedCourses.map(course => ({
          id: course._id,
          type: 'course',
          title: course.title,
          description: course.description,
          category: course.category,
          difficulty: course.difficulty,
          image: course.image,
          reason: `Based on your learning journey, explore ${course.category}`
        }));
      }
    }
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations'
    });
  }
};

// Submit quiz
const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;
    
    // Find lesson with this quiz
    const lesson = await Lesson.findOne({ 'quiz._id': quizId });
    
    if (!lesson || !lesson.quiz || !lesson.quiz.questions) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    const quiz = lesson.quiz;
    let correctAnswers = 0;
    const results = [];
    
    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) correctAnswers++;
      
      results.push({
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      });
    });
    
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;
    
    res.json({
      success: true,
      results: {
        score,
        totalQuestions: quiz.questions.length,
        correctAnswers,
        passed,
        passingScore: quiz.passingScore,
        details: results
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz'
    });
  }
};

// Enroll in a course
const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    const course = await Course.findById(courseId).populate('lessons');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Get user and check if already enrolled in User model
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if already enrolled in user's learning profile
    const existingUserEnrollment = user.learningProfile?.enrolledCourses?.find(
      enrollment => enrollment.courseId.toString() === courseId
    );
    
    if (existingUserEnrollment) {
      return res.json({
        success: true,
        message: 'Already enrolled in this course',
        enrollment: existingUserEnrollment
      });
    }
    
    // Get or create learning progress
    let progress = await LearningProgress.findOne({ userId });
    if (!progress) {
      progress = new LearningProgress({
        userId,
        courses: [],
        overallStats: {
          totalLessonsCompleted: 0,
          totalTimeSpent: 0,
          currentStreak: 0,
          averageScore: 0
        }
      });
    }
    
    // Check if already enrolled in progress model
    const existingProgressEnrollment = progress.getCourseProgress ? 
      progress.getCourseProgress(courseId) : 
      progress.courses.find(c => c.courseId.toString() === courseId);
      
    if (existingProgressEnrollment) {
      return res.json({
        success: true,
        message: 'Already enrolled in this course',
        courseProgress: existingProgressEnrollment
      });
    }
    
    // Create enrollment timestamp
    const enrollmentDate = new Date();
    
    // Add to User's learning profile
    if (!user.learningProfile) {
      user.learningProfile = {
        enrolledCourses: [],
        learningStats: {
          totalCoursesEnrolled: 0,
          completedCourses: 0,
          totalLessonsCompleted: 0,
          totalTimeSpent: 0,
          averageScore: 0,
          currentStreak: 0,
          longestStreak: 0,
          certificatesEarned: 0,
          achievementsUnlocked: 0
        },
        preferences: {
          learningGoals: [],
          studyReminders: true,
          difficultyPreference: 'mixed',
          studyTimePreference: 'flexible',
          weeklyStudyGoal: 120
        }
      };
    }
    
    const userEnrollment = {
      courseId: course._id,
      enrolledAt: enrollmentDate,
      status: 'enrolled',
      progress: 0,
      lastAccessedAt: enrollmentDate
    };
    
    user.learningProfile.enrolledCourses.push(userEnrollment);
    user.learningProfile.learningStats.totalCoursesEnrolled += 1;
    
    // Create course progress in LearningProgress model with all lessons
    const courseProgress = {
      courseId: course._id,
      status: 'enrolled',
      enrolledAt: enrollmentDate,
      progress: 0,
      progressPercentage: 0,
      lessons: course.lessons.map(lesson => ({
        lessonId: lesson._id,
        status: 'not_started',
        timeSpent: 0,
        attempts: 0,
        score: 0
      }))
    };
    
    progress.courses.push(courseProgress);
    
    // Save both models
    await Promise.all([
      user.save(),
      progress.save()
    ]);
    
    // Log enrollment activity
    await user.logActivity('course_enrollment', {
      courseId: course._id,
      courseTitle: course.title,
      category: course.category
    });
    
    res.json({
      success: true,
      message: 'Successfully enrolled in course',
      enrollment: {
        courseId: course._id,
        courseTitle: course.title,
        enrolledAt: enrollmentDate,
        status: 'enrolled',
        progress: 0,
        totalLessons: course.lessons.length
      }
    });
  } catch (error) {
    console.error('Enroll in course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course'
    });
  }
};

// Get enrolled courses for current user
const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const User = require('../models/User');
    const user = await User.findById(userId)
      .populate('learningProfile.enrolledCourses.courseId', 'title description image category difficulty estimatedDuration lessons')
      .lean();
      
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const enrolledCourses = user.learningProfile?.enrolledCourses || [];
    
    // Get additional progress details from LearningProgress model
    const progress = await LearningProgress.findOne({ userId }).lean();
    const progressMap = {};
    
    if (progress && progress.courses) {
      progress.courses.forEach(courseProgress => {
        progressMap[courseProgress.courseId.toString()] = courseProgress;
      });
    }
    
    // Merge user enrollment data with progress data
    const enrichedEnrollments = enrolledCourses.map(enrollment => {
      const courseProgress = progressMap[enrollment.courseId._id.toString()];
      const course = enrollment.courseId;
      
      return {
        _id: enrollment._id,
        course: {
          _id: course._id,
          title: course.title,
          description: course.description,
          image: course.image,
          category: course.category,
          difficulty: course.difficulty,
          estimatedDuration: course.estimatedDuration,
          totalLessons: course.lessons?.length || 0
        },
        enrolledAt: enrollment.enrolledAt,
        status: enrollment.status,
        progress: enrollment.progress,
        lastAccessedAt: enrollment.lastAccessedAt,
        detailedProgress: courseProgress ? {
          lessonsCompleted: courseProgress.lessons?.filter(l => l.status === 'completed').length || 0,
          totalTimeSpent: courseProgress.lessons?.reduce((sum, l) => sum + (l.timeSpent || 0), 0) || 0,
          averageScore: courseProgress.lessons?.length > 0 ? 
            Math.round(courseProgress.lessons.reduce((sum, l) => sum + (l.score || 0), 0) / courseProgress.lessons.length) : 0
        } : null
      };
    });
    
    res.json({
      success: true,
      enrollments: enrichedEnrollments,
      stats: user.learningProfile?.learningStats || {
        totalCoursesEnrolled: 0,
        completedCourses: 0,
        totalLessonsCompleted: 0,
        totalTimeSpent: 0,
        averageScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        certificatesEarned: 0,
        achievementsUnlocked: 0
      }
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrolled courses'
    });
  }
};

// Unenroll from a course
const unenrollFromCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove from User's learning profile
    if (user.learningProfile?.enrolledCourses) {
      const enrollmentIndex = user.learningProfile.enrolledCourses.findIndex(
        enrollment => enrollment.courseId.toString() === courseId
      );
      
      if (enrollmentIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Course enrollment not found'
        });
      }
      
      user.learningProfile.enrolledCourses.splice(enrollmentIndex, 1);
      user.learningProfile.learningStats.totalCoursesEnrolled = Math.max(0, user.learningProfile.learningStats.totalCoursesEnrolled - 1);
    }
    
    // Remove from LearningProgress model
    const progress = await LearningProgress.findOne({ userId });
    if (progress) {
      const progressIndex = progress.courses.findIndex(
        course => course.courseId.toString() === courseId
      );
      
      if (progressIndex > -1) {
        progress.courses.splice(progressIndex, 1);
        await progress.save();
      }
    }
    
    await user.save();
    
    // Log unenrollment activity
    await user.logActivity('course_unenrollment', { courseId });
    
    res.json({
      success: true,
      message: 'Successfully unenrolled from course'
    });
  } catch (error) {
    console.error('Unenroll from course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unenroll from course'
    });
  }
};

// Generate certificate for completed course
const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    const course = await Course.findById(courseId).populate('lessons');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    const progress = await LearningProgress.findOne({ userId });
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Learning progress not found'
      });
    }
    
    const courseProgress = progress.getCourseProgress(courseId);
    if (!courseProgress || courseProgress.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Course must be completed to generate certificate'
      });
    }
    
    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({ userId, courseId });
    if (existingCertificate) {
      return res.json({
        success: true,
        certificate: existingCertificate
      });
    }
    
    // Calculate final score and completion stats
    const completedLessons = courseProgress.lessons.filter(l => l.status === 'completed');
    const totalTimeSpent = courseProgress.lessons.reduce((sum, lesson) => sum + lesson.timeSpent, 0);
    const averageScore = completedLessons.length > 0 ? 
      Math.round(completedLessons.reduce((sum, lesson) => sum + (lesson.score || 0), 0) / completedLessons.length) : 0;
    
    // Create certificate
    const certificate = new Certificate({
      userId,
      courseId,
      title: course.title,
      description: `This certifies that the learner has successfully completed the course "${course.title}" and demonstrated proficiency in Ethiopian heritage studies.`,
      completionDate: courseProgress.completedAt,
      finalScore: averageScore,
      timeSpent: totalTimeSpent,
      lessonsCompleted: completedLessons.length,
      totalLessons: course.lessons.length,
      instructor: course.instructor,
      category: course.category,
      difficulty: course.difficulty,
      metadata: {
        courseVersion: '1.0',
        completionPercentage: courseProgress.progressPercentage,
        averageQuizScore: averageScore,
        skillsAcquired: course.tags,
        recognitions: ['Course Completion', 'Heritage Knowledge']
      }
    });
    
    await certificate.save();
    
    res.json({
      success: true,
      message: 'Certificate generated successfully',
      certificate
    });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate certificate'
    });
  }
};

// Get user's certificates
const getCertificates = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const certificates = await Certificate.find({ userId, isValid: true })
      .populate('courseId', 'title category difficulty image')
      .sort({ completionDate: -1 });
    
    res.json({
      success: true,
      certificates
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificates'
    });
  }
};

// Verify certificate
const verifyCertificate = async (req, res) => {
  try {
    const { verificationCode } = req.params;
    
    const certificate = await Certificate.findOne({ 
      verificationCode, 
      isValid: true 
    })
    .populate('userId', 'name email')
    .populate('courseId', 'title category difficulty');
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or invalid'
      });
    }
    
    res.json({
      success: true,
      certificate: {
        certificateId: certificate.certificateId,
        title: certificate.title,
        completionDate: certificate.completionDate,
        finalScore: certificate.finalScore,
        learnerName: certificate.userId.name,
        course: certificate.courseId,
        instructor: certificate.instructor,
        isValid: certificate.isValid
      }
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify certificate'
    });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      // Return mock stats for unauthenticated users
      return res.json({
        success: true,
        stats: {
          totalCourses: 10,
          enrolledCourses: 0,
          completedCourses: 0,
          totalLessons: 45,
          completedLessons: 0,
          certificates: 0,
          currentStreak: 0,
          totalTimeSpent: 0,
          averageScore: 0,
          achievements: 0
        }
      });
    }
    
    const [totalCourses, progress, certificates] = await Promise.all([
      Course.countDocuments({ isActive: true }),
      LearningProgress.findOne({ userId }),
      Certificate.countDocuments({ userId, isValid: true })
    ]);
    
    const totalLessons = await Lesson.countDocuments({ isActive: true });
    
    let stats = {
      totalCourses,
      totalLessons,
      certificates,
      enrolledCourses: 0,
      completedCourses: 0,
      completedLessons: 0,
      currentStreak: 0,
      totalTimeSpent: 0,
      averageScore: 0,
      achievements: 0
    };
    
    if (progress) {
      stats.enrolledCourses = progress.courses.length;
      stats.completedCourses = progress.courses.filter(c => c.status === 'completed').length;
      stats.completedLessons = progress.overallStats.totalLessonsCompleted || 0;
      stats.currentStreak = progress.overallStats.currentStreak || 0;
      stats.totalTimeSpent = progress.overallStats.totalTimeSpent || 0;
      stats.averageScore = progress.overallStats.averageScore || 0;
      stats.achievements = progress.achievements?.length || 0;
    }
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

module.exports = {
  getCourses,
  getCourseById,
  getLessons,
  getLessonById,
  startLesson,
  completeLesson,
  getLearningProgress,
  getLearningAchievements,
  getRecommendations,
  submitQuiz,
  enrollInCourse,
  getEnrolledCourses,
  unenrollFromCourse,
  generateCertificate,
  getCertificates,
  verifyCertificate,
  getDashboardStats
};
