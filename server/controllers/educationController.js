const mongoose = require('mongoose');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const Flashcard = require('../models/Flashcard');
const LiveSession = require('../models/LiveSession');
const StudyGuide = require('../models/StudyGuide');
const Certificate = require('../models/Certificate');
const LearningProgress = require('../models/LearningProgress');
const QuizAttempt = require('../models/QuizAttempt');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// ===== COURSES =====
const getCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      difficulty,
      sort = 'createdAt',
      search
    } = req.query;

    const query = { isActive: true };
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' }},
        { description: { $regex: search, $options: 'i' }}
      ];
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name email profileImage')
      .populate('museum', 'name location')
      .sort({ [sort]: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: courses,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCourse = async (req, res) => {
    try {
      const course = await Course.findById(req.params.id)
        .populate('instructor', 'name email profileImage bio')
        .populate('museum', 'name location description')
        .populate('lessons');

      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      // Check if user is enrolled
      let enrollmentStatus = null;
      if (req.user) {
        const enrollment = await Enrollment.findOne({
          student: req.user.id,
          course: course._id
        });
        enrollmentStatus = enrollment ? enrollment.status : null;
      }

      res.json({
        success: true,
        data: {
          ...course.toObject(),
          enrollmentStatus
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

const enrollInCourse = async (req, res) => {
    try {
      const courseId = req.params.id;
      const userId = req.user.id;

      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({
        student: userId,
        course: courseId
      });

      if (existingEnrollment) {
        return res.status(400).json({
          success: false,
          message: 'Already enrolled in this course'
        });
      }

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      const enrollment = new Enrollment({
        student: userId,
        course: courseId,
        progress: {
          totalLessons: course.lessonCount || 0
        }
      });

      await enrollment.save();

      // Update course enrollment count
      course.enrollmentCount = (course.enrollmentCount || 0) + 1;
      await course.save();

      res.status(201).json({
        success: true,
        data: enrollment,
        message: 'Successfully enrolled in course'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

const getMyEnrollments = async (req, res) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      
      const query = { student: req.user.id, isActive: true };
      if (status) query.status = status;

      const enrollments = await Enrollment.find(query)
        .populate({
          path: 'course',
          populate: {
            path: 'instructor',
            select: 'name profileImage'
          }
        })
        .sort({ enrollmentDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Enrollment.countDocuments(query);

      res.json({
        success: true,
        data: enrollments,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

// Quizzes
const getQuizzes = async (req, res) => {
    try {
      const { category, difficulty, page = 1, limit = 10 } = req.query;
      
      const query = { isPublished: true };
      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;

      const quizzes = await Quiz.find(query)
        .populate('createdBy', 'name')
        .populate('relatedCourse', 'title')
        .populate('relatedMuseum', 'name')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Quiz.countDocuments(query);

      res.json({
        success: true,
        data: quizzes,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

const getQuiz = async (req, res) => {
    try {
      const quiz = await Quiz.findById(req.params.id)
        .populate('createdBy', 'name')
        .populate('relatedCourse', 'title')
        .populate('relatedMuseum', 'name');

      if (!quiz || !quiz.isPublished) {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
      }

      // Get user's previous attempts
      let attempts = [];
      if (req.user) {
        attempts = await QuizAttempt.find({
          user: req.user.id,
          quiz: quiz._id
        }).sort({ createdAt: -1 });
      }

      res.json({
        success: true,
        data: {
          quiz,
          attempts: attempts.length,
          maxAttempts: quiz.settings.attemptsAllowed,
          canAttempt: attempts.length < quiz.settings.attemptsAllowed
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

const startQuizAttempt = async (req, res) => {
    try {
      const quizId = req.params.id;
      const userId = req.user.id;

      const quiz = await Quiz.findById(quizId);
      if (!quiz || !quiz.isPublished) {
        return res.status(404).json({ success: false, message: 'Quiz not found' });
      }

      // Check attempt limits
      const previousAttempts = await QuizAttempt.countDocuments({
        user: userId,
        quiz: quizId
      });

      if (previousAttempts >= quiz.settings.attemptsAllowed) {
        return res.status(400).json({
          success: false,
          message: 'Maximum attempts reached'
        });
      }

      // Create new attempt
      const attempt = new QuizAttempt({
        user: userId,
        quiz: quizId,
        attemptNumber: previousAttempts + 1
      });

      await attempt.save();

      res.status(201).json({
        success: true,
        data: attempt
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

const submitQuizAttempt = async (req, res) => {
    try {
      const { answers } = req.body;
      const attemptId = req.params.attemptId;

      const attempt = await QuizAttempt.findById(attemptId)
        .populate('quiz');

      if (!attempt || attempt.user.toString() !== req.user.id) {
        return res.status(404).json({ success: false, message: 'Attempt not found' });
      }

      if (attempt.status === 'submitted') {
        return res.status(400).json({ success: false, message: 'Already submitted' });
      }

      // Calculate score
      const result = attempt.calculateFinalScore(attempt.quiz);
      
      // Update attempt
      attempt.answers = answers.map((answer, index) => ({
        questionId: attempt.quiz.questions[index]._id,
        answer,
        timeSpent: 0 // Could be tracked from frontend
      }));
      
      attempt.submittedAt = new Date();
      attempt.status = 'submitted';
      attempt.timeSpent = Math.floor((attempt.submittedAt - attempt.startedAt) / 1000);

      await attempt.save();

      // Update quiz statistics
      attempt.quiz.timesAttempted += 1;
      const allAttempts = await QuizAttempt.find({ quiz: attempt.quiz._id, status: 'submitted' });
      const avgScore = allAttempts.reduce((sum, att) => sum + att.percentage, 0) / allAttempts.length;
      attempt.quiz.averageScore = Math.round(avgScore * 100) / 100;
      await attempt.quiz.save();

      res.json({
        success: true,
        data: {
          attempt,
          result
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

// Flashcards
const getFlashcards = async (req, res) => {
    try {
      const { category, difficulty, page = 1, limit = 20 } = req.query;
      
      const query = { isPublished: true };
      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;

      const flashcards = await Flashcard.find(query)
        .populate('createdBy', 'name')
        .populate('relatedCourse', 'title')
        .populate('relatedMuseum', 'name')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Flashcard.countDocuments(query);

      res.json({
        success: true,
        data: flashcards,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

// Live Sessions
const getLiveSessions = async (req, res) => {
    try {
      const { category, status = 'scheduled', page = 1, limit = 10 } = req.query;
      
      const query = { status };
      if (category) query.category = category;

      const sessions = await LiveSession.find(query)
        .populate('instructor', 'name profileImage')
        .populate('relatedCourse', 'title')
        .populate('relatedMuseum', 'name')
        .sort({ scheduledAt: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await LiveSession.countDocuments(query);

      res.json({
        success: true,
        data: sessions,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

const registerForLiveSession = async (req, res) => {
    try {
      const sessionId = req.params.id;
      const userId = req.user.id;

      const session = await LiveSession.findById(sessionId);
      if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
      }

      await session.registerParticipant(userId);

      res.json({
        success: true,
        message: 'Successfully registered for live session'
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

// Study Guides
const getStudyGuides = async (req, res) => {
    try {
      const { category, page = 1, limit = 10 } = req.query;
      
      const query = { isActive: true };
      if (category) query.category = category;

      const guides = await StudyGuide.find(query)
        .populate('createdBy', 'name')
        .populate('course', 'title')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await StudyGuide.countDocuments(query);

      res.json({
        success: true,
        data: guides,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

// Certificates
const getMyCertificates = async (req, res) => {
    try {
      const certificates = await Certificate.find({
        recipient: req.user.id,
        isActive: true
      })
      .populate('course', 'title description')
      .populate('issuedBy', 'name')
      .sort({ issuedAt: -1 });

      res.json({
        success: true,
        data: certificates
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

// Platform stats endpoint for visitor dashboard
const getPlatformStats = async (req, res) => {
  try {
    // Get platform-wide statistics
    const [totalCourses, totalLearners, completedEnrollments] = await Promise.all([
      Course.countDocuments({ isActive: true }),
      User.countDocuments({ role: { $in: ['visitor', 'student'] } }),
      Enrollment.countDocuments({ status: 'completed' })
    ]);

    // Calculate success rate
    const totalEnrollments = await Enrollment.countDocuments();
    const successRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

    // Get featured courses
    const featuredCourses = await Course.find({ 
      isActive: true, 
      featured: true 
    })
    .populate('instructor', 'name')
    .sort({ enrollmentCount: -1 })
    .limit(6);

    // Get categories with course counts
    const categories = await Course.aggregate([
      { $match: { isActive: true } },
      { 
        $group: {
          _id: '$category',
          coursesCount: { $sum: 1 },
          description: { $first: '$categoryDescription' }
        }
      },
      { $sort: { coursesCount: -1 } },
      { 
        $project: {
          name: '$_id',
          coursesCount: 1,
          description: { $ifNull: ['$description', 'Explore this category'] },
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalCourses,
        totalLearners,
        coursesCompleted: completedEnrollments,
        successRate
      },
      featured: {
        courses: featuredCourses
      },
      categories,
      message: 'Platform statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting platform stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get platform statistics',
      error: error.message 
    });
  }
};

module.exports = {
  getCourses,
  getCourse,
  enrollInCourse,
  getMyEnrollments,
  getQuizzes,
  getQuiz,
  startQuizAttempt,
  submitQuizAttempt,
  getFlashcards,
  getLiveSessions,
  registerForLiveSession,
  getStudyGuides,
  getMyCertificates,
  getPlatformStats
};
