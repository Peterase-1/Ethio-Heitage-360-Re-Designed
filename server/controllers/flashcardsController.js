const Flashcard = require('../models/Flashcard');
const { validationResult } = require('express-validator');

class FlashcardsController {
  // ===============================
  // VISITOR ENDPOINTS
  // ===============================

  // Get published flashcards for visitors
  async getPublishedFlashcards(req, res) {
    try {
      const {
        category,
        difficulty,
        tags,
        search,
        page = 1,
        limit = 20,
        sort = 'createdAt'
      } = req.query;

      let query = {
        isPublished: true
      };

      // Add filters
      if (category && category !== 'all') {
        query.category = category;
      }
      
      if (difficulty && difficulty !== 'all') {
        query.difficulty = difficulty;
      }

      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        query.tags = { $in: tagArray };
      }

      if (search) {
        query.$or = [
          { 'front.content': { $regex: search, $options: 'i' }},
          { 'back.content': { $regex: search, $options: 'i' }},
          { tags: { $in: [new RegExp(search, 'i')] }}
        ];
      }

      const flashcards = await Flashcard.find(query)
        .populate('createdBy', 'name')
        .populate('relatedCourse', 'title')
        .populate('relatedMuseum', 'name')
        .sort({ [sort]: sort === 'createdAt' ? -1 : 1 })
        .limit(parseInt(limit))
        .skip((page - 1) * limit);

      const total = await Flashcard.countDocuments(query);

      res.json({
        success: true,
        data: flashcards,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching flashcards',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get flashcard by ID
  async getFlashcardById(req, res) {
    try {
      const { id } = req.params;
      
      const flashcard = await Flashcard.findOne({
        _id: id,
        isPublished: true
      })
        .populate('createdBy', 'name profileImage')
        .populate('relatedCourse', 'title description')
        .populate('relatedMuseum', 'name description');

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
        message: 'Error fetching flashcard',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get flashcards by category
  async getFlashcardsByCategory(req, res) {
    try {
      const categories = await Flashcard.aggregate([
        { $match: { isPublished: true } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgRating: { $avg: '$averageRating' },
            avgStudyCount: { $avg: '$studyCount' },
            flashcards: { 
              $push: {
                _id: '$_id',
                front: '$front',
                back: '$back',
                difficulty: '$difficulty',
                tags: '$tags',
                averageRating: '$averageRating',
                studyCount: '$studyCount'
              }
            }
          }
        },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching flashcards by category',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Study flashcard (increment study count)
  async studyFlashcard(req, res) {
    try {
      const { id } = req.params;
      const { difficulty, timeSpent, isCorrect } = req.body;

      const flashcard = await Flashcard.findById(id);
      if (!flashcard) {
        return res.status(404).json({
          success: false,
          message: 'Flashcard not found'
        });
      }

      // Increment study count
      flashcard.studyCount += 1;

      // Save study session data if user is authenticated
      if (req.user) {
        // Here you would typically save to a separate StudySession model
        // For now, we'll just increment the count
        
        // You could expand this to track individual user progress:
        // - Save user study history
        // - Implement spaced repetition algorithm
        // - Track learning progress over time
      }

      await flashcard.save();

      res.json({
        success: true,
        message: 'Study session recorded',
        data: {
          studyCount: flashcard.studyCount,
          studySessionRecorded: !!req.user
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error recording study session',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get random flashcards for quick study
  async getRandomFlashcards(req, res) {
    try {
      const { category, difficulty, count = 10 } = req.query;
      
      let matchStage = { isPublished: true };
      
      if (category && category !== 'all') {
        matchStage.category = category;
      }
      
      if (difficulty && difficulty !== 'all') {
        matchStage.difficulty = difficulty;
      }

      const flashcards = await Flashcard.aggregate([
        { $match: matchStage },
        { $sample: { size: parseInt(count) } },
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'createdBy',
            pipeline: [{ $project: { name: 1 } }]
          }
        },
        { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } }
      ]);

      res.json({
        success: true,
        data: flashcards,
        count: flashcards.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching random flashcards',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // ===============================
  // SUPER ADMIN ENDPOINTS
  // ===============================

  // Get all flashcards for admin management
  async getAllFlashcards(req, res) {
    try {
      const {
        category,
        difficulty,
        isPublished,
        createdBy,
        search,
        page = 1,
        limit = 20,
        sort = 'createdAt'
      } = req.query;

      let query = {};
      
      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;
      if (isPublished !== undefined) query.isPublished = isPublished === 'true';
      if (createdBy) query.createdBy = createdBy;
      
      if (search) {
        query.$or = [
          { 'front.content': { $regex: search, $options: 'i' }},
          { 'back.content': { $regex: search, $options: 'i' }},
          { tags: { $in: [new RegExp(search, 'i')] }}
        ];
      }

      const flashcards = await Flashcard.find(query)
        .populate('createdBy', 'name email')
        .populate('relatedCourse', 'title')
        .populate('relatedMuseum', 'name')
        .sort({ [sort]: -1 })
        .limit(parseInt(limit))
        .skip((page - 1) * limit);

      const total = await Flashcard.countDocuments(query);

      // Get statistics
      const stats = await Flashcard.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            published: { $sum: { $cond: ['$isPublished', 1, 0] } },
            unpublished: { $sum: { $cond: ['$isPublished', 0, 1] } },
            avgRating: { $avg: '$averageRating' },
            totalStudies: { $sum: '$studyCount' }
          }
        }
      ]);

      res.json({
        success: true,
        data: flashcards,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        },
        stats: stats[0] || {
          total: 0,
          published: 0,
          unpublished: 0,
          avgRating: 0,
          totalStudies: 0
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching flashcards for admin',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Create new flashcard
  async createFlashcard(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const flashcardData = {
        ...req.body,
        createdBy: req.user.id
      };

      const flashcard = new Flashcard(flashcardData);
      await flashcard.save();

      const populatedFlashcard = await Flashcard.findById(flashcard._id)
        .populate('createdBy', 'name email')
        .populate('relatedCourse', 'title')
        .populate('relatedMuseum', 'name');

      res.status(201).json({
        success: true,
        data: populatedFlashcard,
        message: 'Flashcard created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating flashcard',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update flashcard
  async updateFlashcard(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const updates = req.body;

      const flashcard = await Flashcard.findById(id);
      if (!flashcard) {
        return res.status(404).json({
          success: false,
          message: 'Flashcard not found'
        });
      }

      // Update fields
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          flashcard[key] = updates[key];
        }
      });

      await flashcard.save();

      const populatedFlashcard = await Flashcard.findById(flashcard._id)
        .populate('createdBy', 'name email')
        .populate('relatedCourse', 'title')
        .populate('relatedMuseum', 'name');

      res.json({
        success: true,
        data: populatedFlashcard,
        message: 'Flashcard updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating flashcard',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete flashcard
  async deleteFlashcard(req, res) {
    try {
      const { id } = req.params;

      const flashcard = await Flashcard.findById(id);
      if (!flashcard) {
        return res.status(404).json({
          success: false,
          message: 'Flashcard not found'
        });
      }

      await Flashcard.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Flashcard deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting flashcard',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Publish/unpublish flashcard
  async togglePublishStatus(req, res) {
    try {
      const { id } = req.params;
      const { isPublished } = req.body;

      const flashcard = await Flashcard.findById(id);
      if (!flashcard) {
        return res.status(404).json({
          success: false,
          message: 'Flashcard not found'
        });
      }

      flashcard.isPublished = isPublished;
      await flashcard.save();

      res.json({
        success: true,
        data: flashcard,
        message: `Flashcard ${isPublished ? 'published' : 'unpublished'} successfully`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating publish status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Bulk operations
  async bulkCreateFlashcards(req, res) {
    try {
      const { flashcards } = req.body;

      if (!Array.isArray(flashcards) || flashcards.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Flashcards array is required and cannot be empty'
        });
      }

      // Add createdBy to each flashcard
      const flashcardsWithCreator = flashcards.map(card => ({
        ...card,
        createdBy: req.user.id
      }));

      const createdFlashcards = await Flashcard.insertMany(flashcardsWithCreator);

      res.status(201).json({
        success: true,
        data: createdFlashcards,
        message: `${createdFlashcards.length} flashcards created successfully`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating flashcards in bulk',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get flashcard analytics
  async getFlashcardAnalytics(req, res) {
    try {
      const { id } = req.params;

      const flashcard = await Flashcard.findById(id);
      if (!flashcard) {
        return res.status(404).json({
          success: false,
          message: 'Flashcard not found'
        });
      }

      // For now, return basic analytics
      // In a full implementation, you would query separate StudySession collections
      const analytics = {
        overview: {
          studyCount: flashcard.studyCount,
          averageRating: flashcard.averageRating,
          difficulty: flashcard.difficulty,
          category: flashcard.category,
          isPublished: flashcard.isPublished
        },
        engagement: {
          totalViews: flashcard.studyCount,
          // Additional engagement metrics would come from StudySession model
          completionRate: 85, // Placeholder
          averageTimeSpent: 30 // Placeholder - seconds
        }
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching flashcard analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get dashboard summary
  async getDashboardSummary(req, res) {
    try {
      const summary = await Flashcard.aggregate([
        {
          $facet: {
            overview: [
              {
                $group: {
                  _id: null,
                  totalFlashcards: { $sum: 1 },
                  publishedFlashcards: { $sum: { $cond: ['$isPublished', 1, 0] } },
                  totalStudies: { $sum: '$studyCount' },
                  averageRating: { $avg: '$averageRating' }
                }
              }
            ],
            categoryBreakdown: [
              {
                $group: {
                  _id: '$category',
                  count: { $sum: 1 },
                  published: { $sum: { $cond: ['$isPublished', 1, 0] } },
                  avgRating: { $avg: '$averageRating' }
                }
              },
              { $sort: { count: -1 } }
            ],
            topStudiedFlashcards: [
              { $match: { isPublished: true } },
              { $sort: { studyCount: -1 } },
              { $limit: 5 },
              {
                $project: {
                  _id: 1,
                  'front.content': 1,
                  category: 1,
                  studyCount: 1,
                  averageRating: 1
                }
              }
            ],
            recentFlashcards: [
              { $sort: { createdAt: -1 } },
              { $limit: 5 },
              {
                $lookup: {
                  from: 'users',
                  localField: 'createdBy',
                  foreignField: '_id',
                  as: 'createdBy',
                  pipeline: [{ $project: { name: 1 } }]
                }
              },
              { $unwind: '$createdBy' },
              {
                $project: {
                  _id: 1,
                  'front.content': 1,
                  category: 1,
                  isPublished: 1,
                  createdAt: 1,
                  'createdBy.name': 1
                }
              }
            ]
          }
        }
      ]);

      res.json({
        success: true,
        data: summary[0]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard summary',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new FlashcardsController();
