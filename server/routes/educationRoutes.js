const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const educationController = require('../controllers/educationController');
const { auth: authenticate, authorize } = require('../middleware/auth');

// Middleware to ensure user is authenticated
router.use(authenticate);

// Course routes
router.get('/courses', 
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('category').optional().isIn(['heritage', 'history', 'culture', 'artifacts', 'language', 'general']),
    query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
    query('sort').optional().isIn(['createdAt', 'enrollmentCount', 'rating', 'title'])
  ],
  educationController.getCourses
);

router.get('/courses/:id',
  [param('id').isMongoId()],
  educationController.getCourse
);

router.post('/courses/:id/enroll',
  [param('id').isMongoId()],
  educationController.enrollInCourse
);

router.get('/my-enrollments',
  [
    query('status').optional().isIn(['enrolled', 'in-progress', 'completed', 'dropped', 'paused']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  educationController.getMyEnrollments
);

// Quiz routes
router.get('/quizzes',
  [
    query('category').optional().isIn(['heritage', 'history', 'culture', 'artifacts', 'geography', 'general']),
    query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  educationController.getQuizzes
);

router.get('/quizzes/:id',
  [param('id').isMongoId()],
  educationController.getQuiz
);

router.post('/quizzes/:id/attempt',
  [param('id').isMongoId()],
  educationController.startQuizAttempt
);

router.post('/quiz-attempts/:attemptId/submit',
  [
    param('attemptId').isMongoId(),
    body('answers').isArray().withMessage('Answers must be an array')
  ],
  educationController.submitQuizAttempt
);

// Flashcard routes
router.get('/flashcards',
  [
    query('category').optional().isIn(['heritage', 'history', 'culture', 'artifacts', 'geography', 'language', 'general']),
    query('difficulty').optional().isIn(['easy', 'medium', 'hard']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  educationController.getFlashcards
);

// Live session routes
router.get('/live-sessions',
  [
    query('category').optional().isIn(['heritage', 'history', 'culture', 'artifacts', 'geography', 'guided-tour', 'workshop']),
    query('status').optional().isIn(['scheduled', 'live', 'completed', 'cancelled']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  educationController.getLiveSessions
);

router.post('/live-sessions/:id/register',
  [param('id').isMongoId()],
  educationController.registerForLiveSession
);

// Study guide routes
router.get('/study-guides',
  [
    query('category').optional().isIn(['heritage', 'history', 'culture', 'artifacts', 'language', 'general']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  educationController.getStudyGuides
);

// Certificate routes
router.get('/certificates',
  educationController.getMyCertificates
);

// Admin routes for quiz and flashcard creation (super admin only)
const Quiz = require('../models/Quiz');
const Flashcard = require('../models/Flashcard');
const LiveSession = require('../models/LiveSession');

// Quiz management (Super Admin only)
router.post('/quizzes',
  authorize(['super-admin']),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional().isString(),
    body('category').isIn(['heritage', 'history', 'culture', 'artifacts', 'geography', 'general']),
    body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
    body('difficulty').isIn(['beginner', 'intermediate', 'advanced']),
    body('settings.timeLimit').optional().isInt({ min: 5, max: 180 }),
    body('settings.attemptsAllowed').optional().isInt({ min: 1, max: 10 }),
    body('settings.passingScore').optional().isInt({ min: 0, max: 100 })
  ],
  async (req, res) => {
    try {
      const {
        title,
        description,
        instructions,
        category,
        questions,
        settings,
        difficulty,
        tags,
        relatedCourse,
        relatedMuseum
      } = req.body;

      const quiz = new Quiz({
        title,
        description,
        instructions,
        category,
        questions,
        settings,
        difficulty,
        tags,
        relatedCourse,
        relatedMuseum,
        createdBy: req.user.id
      });

      await quiz.save();

      res.status(201).json({
        success: true,
        data: quiz,
        message: 'Quiz created successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Flashcard management (Admin only)
router.post('/flashcards',
  authorize(['super-admin', 'admin', 'museum-admin']),
  [
    body('front.content').notEmpty().withMessage('Front content is required'),
    body('back.content').notEmpty().withMessage('Back content is required'),
    body('category').isIn(['heritage', 'history', 'culture', 'artifacts', 'geography', 'language', 'general']),
    body('difficulty').isIn(['easy', 'medium', 'hard'])
  ],
  async (req, res) => {
    try {
      const {
        front,
        back,
        category,
        difficulty,
        tags,
        relatedCourse,
        relatedMuseum
      } = req.body;

      const flashcard = new Flashcard({
        front,
        back,
        category,
        difficulty,
        tags,
        relatedCourse,
        relatedMuseum,
        createdBy: req.user.id
      });

      await flashcard.save();

      res.status(201).json({
        success: true,
        data: flashcard,
        message: 'Flashcard created successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Live session management (Staff only)
router.post('/live-sessions',
  authorize(['super-admin', 'admin', 'museum-admin', 'staff']),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional().isString(),
    body('scheduledAt').isISO8601().withMessage('Valid scheduled date is required'),
    body('duration').isInt({ min: 15, max: 300 }).withMessage('Duration must be between 15 and 300 minutes'),
    body('maxParticipants').optional().isInt({ min: 1, max: 1000 }),
    body('category').isIn(['heritage', 'history', 'culture', 'artifacts', 'geography', 'guided-tour', 'workshop'])
  ],
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        scheduledAt,
        duration,
        maxParticipants,
        tags,
        relatedCourse,
        relatedMuseum,
        language,
        isRecorded,
        chatEnabled,
        requiresRegistration
      } = req.body;

      const session = new LiveSession({
        title,
        description,
        instructor: req.user.id,
        category,
        scheduledAt: new Date(scheduledAt),
        duration,
        maxParticipants,
        tags,
        relatedCourse,
        relatedMuseum,
        language,
        isRecorded,
        chatEnabled,
        requiresRegistration
      });

      await session.save();

      const populatedSession = await LiveSession.findById(session._id)
        .populate('instructor', 'name email profileImage');

      res.status(201).json({
        success: true,
        data: populatedSession,
        message: 'Live session created successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
