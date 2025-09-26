const express = require('express');
const router = express.Router();
const Flashcard = require('../models/Flashcard');
const { auth, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

/**
 * @desc    Get published flashcards for visitors
 * @route   GET /api/flashcards
 * @access  Public (authenticated visitors)
 */
router.get('/', auth, async (req, res) => {
  try {
    const {
      category,
      difficulty,
      tags,
      page = 1,
      limit = 20,
      search
    } = req.query;

    let query = { isPublished: true };

    // Apply filters
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (tags) query.tags = { $in: tags.split(',') };

    // Search in content
    if (search) {
      query.$or = [
        { 'front.content': { $regex: search, $options: 'i' } },
        { 'back.content': { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;
    const flashcards = await Flashcard.find(query)
      .populate('createdBy', 'name')
      .populate('relatedCourse', 'title')
      .populate('relatedMuseum', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Flashcard.countDocuments(query);

    res.json({
      success: true,
      data: {
        flashcards,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve flashcards',
      error: error.message
    });
  }
});

/**
 * @desc    Get flashcard by ID (for study)
 * @route   GET /api/flashcards/:id
 * @access  Public (authenticated visitors)
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      isPublished: true
    })
      .populate('createdBy', 'name')
      .populate('relatedCourse', 'title')
      .populate('relatedMuseum', 'name');

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    // Increment study count
    flashcard.studyCount += 1;
    await flashcard.save();

    res.json({
      success: true,
      data: flashcard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve flashcard',
      error: error.message
    });
  }
});

// Admin routes - require super-admin authorization
router.use(auth, authorize('super-admin'));

/**
 * @desc    Get all flashcards for admin management
 * @route   GET /api/flashcards/admin/all
 * @access  Super Admin
 */
router.get('/admin/all', async (req, res) => {
  try {
    const {
      category,
      difficulty,
      isPublished,
      page = 1,
      limit = 20,
      search
    } = req.query;

    let query = {};

    // Apply filters
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';

    // Search in content
    if (search) {
      query.$or = [
        { 'front.content': { $regex: search, $options: 'i' } },
        { 'back.content': { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;
    const flashcards = await Flashcard.find(query)
      .populate('createdBy', 'name email')
      .populate('relatedCourse', 'title')
      .populate('relatedMuseum', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Flashcard.countDocuments(query);

    // Get statistics
    const stats = await Flashcard.aggregate([
      {
        $group: {
          _id: null,
          totalFlashcards: { $sum: 1 },
          publishedCount: { $sum: { $cond: ['$isPublished', 1, 0] } },
          unpublishedCount: { $sum: { $cond: ['$isPublished', 0, 1] } },
          totalStudyCount: { $sum: '$studyCount' },
          avgRating: { $avg: '$averageRating' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        flashcards,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        stats: stats[0] || {
          totalFlashcards: 0,
          publishedCount: 0,
          unpublishedCount: 0,
          totalStudyCount: 0,
          avgRating: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve flashcards',
      error: error.message
    });
  }
});

/**
 * @desc    Create new flashcard
 * @route   POST /api/flashcards/admin
 * @access  Super Admin
 */
router.post('/admin', [
  body('front.content').notEmpty().withMessage('Front content is required'),
  body('back.content').notEmpty().withMessage('Back content is required'),
  body('category').optional().isIn(['heritage', 'history', 'culture', 'artifacts', 'geography', 'language', 'general']),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  body('tags').optional().isArray(),
  body('relatedCourse').optional().isMongoId(),
  body('relatedMuseum').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      front,
      back,
      category = 'heritage',
      difficulty = 'medium',
      tags = [],
      relatedCourse,
      relatedMuseum,
      isPublished = false
    } = req.body;

    const flashcard = await Flashcard.create({
      front,
      back,
      category,
      difficulty,
      tags,
      relatedCourse,
      relatedMuseum,
      createdBy: req.user.id,
      isPublished
    });

    await flashcard.populate([
      { path: 'createdBy', select: 'name' },
      { path: 'relatedCourse', select: 'title' },
      { path: 'relatedMuseum', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      data: flashcard,
      message: 'Flashcard created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create flashcard',
      error: error.message
    });
  }
});

/**
 * @desc    Get flashcard by ID for admin
 * @route   GET /api/flashcards/admin/:id
 * @access  Super Admin
 */
router.get('/admin/:id', async (req, res) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('relatedCourse', 'title')
      .populate('relatedMuseum', 'name');

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    res.json({
      success: true,
      data: flashcard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve flashcard',
      error: error.message
    });
  }
});

/**
 * @desc    Update flashcard
 * @route   PUT /api/flashcards/admin/:id
 * @access  Super Admin
 */
router.put('/admin/:id', [
  body('front.content').optional().notEmpty().withMessage('Front content cannot be empty'),
  body('back.content').optional().notEmpty().withMessage('Back content cannot be empty'),
  body('category').optional().isIn(['heritage', 'history', 'culture', 'artifacts', 'geography', 'language', 'general']),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  body('tags').optional().isArray(),
  body('relatedCourse').optional().isMongoId(),
  body('relatedMuseum').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const flashcard = await Flashcard.findById(req.params.id);

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    // Update fields
    const allowedUpdates = ['front', 'back', 'category', 'difficulty', 'tags', 'relatedCourse', 'relatedMuseum', 'isPublished'];
    const updates = req.body;

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        flashcard[key] = updates[key];
      }
    });

    await flashcard.save();

    await flashcard.populate([
      { path: 'createdBy', select: 'name' },
      { path: 'relatedCourse', select: 'title' },
      { path: 'relatedMuseum', select: 'name' }
    ]);

    res.json({
      success: true,
      data: flashcard,
      message: 'Flashcard updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update flashcard',
      error: error.message
    });
  }
});

/**
 * @desc    Toggle flashcard publish status
 * @route   PUT /api/flashcards/admin/:id/toggle-publish
 * @access  Super Admin
 */
router.put('/admin/:id/toggle-publish', async (req, res) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id);

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    flashcard.isPublished = !flashcard.isPublished;
    await flashcard.save();

    res.json({
      success: true,
      data: flashcard,
      message: `Flashcard ${flashcard.isPublished ? 'published' : 'unpublished'} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle flashcard status',
      error: error.message
    });
  }
});

/**
 * @desc    Delete flashcard
 * @route   DELETE /api/flashcards/admin/:id
 * @access  Super Admin
 */
router.delete('/admin/:id', async (req, res) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id);

    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found'
      });
    }

    await flashcard.deleteOne();

    res.json({
      success: true,
      message: 'Flashcard deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete flashcard',
      error: error.message
    });
  }
});

/**
 * @desc    Bulk operations on flashcards
 * @route   POST /api/flashcards/admin/bulk
 * @access  Super Admin
 */
router.post('/admin/bulk', [
  body('action').isIn(['publish', 'unpublish', 'delete']).withMessage('Invalid bulk action'),
  body('flashcardIds').isArray({ min: 1 }).withMessage('Flashcard IDs array is required'),
  body('flashcardIds.*').isMongoId().withMessage('Invalid flashcard ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { action, flashcardIds } = req.body;

    let result;
    switch (action) {
      case 'publish':
        result = await Flashcard.updateMany(
          { _id: { $in: flashcardIds } },
          { isPublished: true }
        );
        break;
      case 'unpublish':
        result = await Flashcard.updateMany(
          { _id: { $in: flashcardIds } },
          { isPublished: false }
        );
        break;
      case 'delete':
        result = await Flashcard.deleteMany(
          { _id: { $in: flashcardIds } }
        );
        break;
    }

    res.json({
      success: true,
      data: result,
      message: `Bulk ${action} operation completed successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk operation',
      error: error.message
    });
  }
});

module.exports = router;
