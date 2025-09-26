const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const flashcardsController = require('../controllers/flashcardsController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Validation middleware
const validateFlashcardCreation = [
  body('front.content').isLength({ min: 1, max: 500 }).trim().withMessage('Front content is required (1-500 characters)'),
  body('back.content').isLength({ min: 1, max: 1000 }).trim().withMessage('Back content is required (1-1000 characters)'),
  body('category').isIn(['heritage', 'history', 'culture', 'artifacts', 'geography', 'language', 'general']).withMessage('Invalid category'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('front.media.type').optional().isIn(['image', 'video', 'audio']).withMessage('Invalid front media type'),
  body('back.media.type').optional().isIn(['image', 'video', 'audio']).withMessage('Invalid back media type'),
  body('front.media.url').optional().isURL().withMessage('Front media URL must be valid'),
  body('back.media.url').optional().isURL().withMessage('Back media URL must be valid')
];

const validateStudySession = [
  body('difficulty').optional().isIn(['again', 'hard', 'good', 'easy']).withMessage('Invalid difficulty rating'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be a positive number'),
  body('isCorrect').optional().isBoolean().withMessage('isCorrect must be a boolean')
];

// ===============================
// PUBLIC/VISITOR ROUTES
// ===============================

// Get published flashcards
router.get('/public', flashcardsController.getPublishedFlashcards);

// Get flashcard by ID
router.get('/public/:id', flashcardsController.getFlashcardById);

// Get flashcards by category
router.get('/public/categories', flashcardsController.getFlashcardsByCategory);

// Get random flashcards for study
router.get('/public/random', flashcardsController.getRandomFlashcards);

// Record study session (can be anonymous or authenticated)
router.post('/:id/study', validateStudySession, flashcardsController.studyFlashcard);

// ===============================
// SUPER ADMIN ROUTES
// ===============================

// Get all flashcards for admin management
router.get('/admin/all', auth, roleAuth(['superAdmin']), flashcardsController.getAllFlashcards);

// Create new flashcard
router.post('/admin/create', auth, roleAuth(['superAdmin']), validateFlashcardCreation, flashcardsController.createFlashcard);

// Bulk create flashcards
router.post('/admin/bulk-create', auth, roleAuth(['superAdmin']), flashcardsController.bulkCreateFlashcards);

// Update flashcard
router.put('/admin/:id', auth, roleAuth(['superAdmin']), validateFlashcardCreation, flashcardsController.updateFlashcard);

// Delete flashcard
router.delete('/admin/:id', auth, roleAuth(['superAdmin']), flashcardsController.deleteFlashcard);

// Toggle publish status
router.patch('/admin/:id/publish', auth, roleAuth(['superAdmin']), flashcardsController.togglePublishStatus);

// Get flashcard analytics
router.get('/admin/:id/analytics', auth, roleAuth(['superAdmin']), flashcardsController.getFlashcardAnalytics);

// Get dashboard summary
router.get('/admin/dashboard/summary', auth, roleAuth(['superAdmin']), flashcardsController.getDashboardSummary);

module.exports = router;
