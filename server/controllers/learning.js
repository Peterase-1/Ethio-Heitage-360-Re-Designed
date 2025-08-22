const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const LearningProgress = require('../models/LearningProgress');

// Get all courses
const getCourses = async (req, res) => {
  try {
    const { category, difficulty, limit = 20 } = req.query;
    
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    
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
    // If no authentication, return mock progress
    if (!req.user || !req.user.id) {
      return res.json({
        success: true,
        progress: {
          courses: [],
          overallStats: {
            totalLessonsCompleted: 5,
            totalTimeSpent: 120,
            currentStreak: 3,
            longestStreak: 7,
            averageScore: 85
          },
          achievements: [
            {
              achievementId: 'first_lesson_complete',
              type: 'lesson_complete',
              earnedAt: new Date('2024-01-15T10:00:00Z')
            }
          ]
        }
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
    // If no authentication, return mock achievements
    if (!req.user || !req.user.id) {
      return res.json({
        success: true,
        achievements: [
          {
            id: 1,
            name: 'First Lesson',
            description: 'Completed your first learning lesson',
            icon: 'star',
            earnedAt: '2024-01-15T10:00:00Z',
            points: 10
          },
          {
            id: 2,
            name: 'History Explorer',
            description: 'Completed 5 history lessons',
            icon: 'book',
            earnedAt: '2024-01-20T14:30:00Z',
            points: 50
          },
          {
            id: 3,
            name: 'Cultural Ambassador',
            description: 'Completed 3 cultural courses',
            icon: 'globe',
            earnedAt: '2024-02-01T11:00:00Z',
            points: 100
          }
        ]
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
    // If no authentication, return mock recommendations
    if (!req.user || !req.user.id) {
      return res.json({
        success: true,
        recommendations: [
          {
            id: 1,
            type: 'lesson',
            title: 'Queen of Sheba Legend',
            reason: 'Based on your interest in Ethiopian history',
            image: '/assets/Ethiopian History Fundamentals.jpg'
          },
          {
            id: 2,
            type: 'course',
            title: 'Ethiopian Orthodox Christianity',
            reason: 'Continue your religious artifacts exploration',
            image: '/assets/orthodox-church.jpg'
          },
          {
            id: 3,
            type: 'course',
            title: 'Ethiopian Coffee Culture',
            reason: 'Explore the birthplace of coffee traditions',
            image: '/assets/coffee-ceremony.jpg'
          },
          {
            id: 4,
            type: 'resource',
            title: 'Traditional Music Collection',
            reason: 'Discover Ethiopian musical heritage',
            image: '/assets/traditional-instruments.jpg'
          }
        ]
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
  submitQuiz
};
