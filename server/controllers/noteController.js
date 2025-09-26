const asyncHandler = require('express-async-handler');
const UserNote = require('../models/UserNote');
const VisitorActivity = require('../models/VisitorActivity');

// @desc    Get user notes
// @route   GET /api/notes
// @access  Private
const getNotes = asyncHandler(async (req, res) => {
  const { category, folder, tags, isPinned, page = 1, limit = 10, sortBy = 'lastModified', sortOrder = -1, search } = req.query;
  const userId = req.user.id;

  let query = { user: userId };

  // Apply filters
  if (category) query.category = category;
  if (folder) query.folder = folder;
  if (tags) query.tags = { $in: tags.split(',') };
  if (isPinned !== undefined) query.isPinned = isPinned === 'true';

  // Search functionality
  if (search) {
    query.$text = { $search: search };
  }

  const skip = (page - 1) * limit;
  const sort = search ? { score: { $meta: 'textScore' } } : { [sortBy]: parseInt(sortOrder) };

  try {
    const [notes, total, folders, categories] = await Promise.all([
      UserNote.find(query, search ? { score: { $meta: 'textScore' } } : {})
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      UserNote.countDocuments(query),
      UserNote.distinct('folder', { user: userId }),
      UserNote.distinct('category', { user: userId })
    ]);

    res.json({
      success: true,
      data: {
        notes,
        folders,
        categories,
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
      message: 'Failed to retrieve notes',
      error: error.message
    });
  }
});

// @desc    Get note by ID
// @route   GET /api/notes/:id
// @access  Private
const getNote = asyncHandler(async (req, res) => {
  const note = await UserNote.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!note) {
    return res.status(404).json({
      success: false,
      message: 'Note not found'
    });
  }

  res.json({
    success: true,
    data: note
  });
});

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
const createNote = asyncHandler(async (req, res) => {
  const {
    title,
    content,
    category,
    tags,
    relatedResource,
    folder,
    priority,
    isPrivate,
    isPinned,
    reminderDate,
    attachments
  } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: 'Title and content are required'
    });
  }

  try {
    const note = await UserNote.create({
      user: req.user.id,
      title,
      content,
      category: category || 'general',
      tags: tags || [],
      relatedResource,
      folder: folder || 'My Notes',
      priority: priority || 3,
      isPrivate: isPrivate !== undefined ? isPrivate : true,
      isPinned: isPinned || false,
      reminderDate,
      attachments: attachments || []
    });

    // Log activity
    await VisitorActivity.logActivity({
      userId: req.user.id,
      sessionId: req.sessionID || 'note',
      activityType: 'profile_updated',
      activityData: {
        entityType: 'note',
        entityName: title,
        metadata: { action: 'created', category, wordCount: note.wordCount }
      },
      pointsEarned: 10
    });

    res.status(201).json({
      success: true,
      data: note,
      message: 'Note created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create note',
      error: error.message
    });
  }
});

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = asyncHandler(async (req, res) => {
  const note = await UserNote.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!note) {
    return res.status(404).json({
      success: false,
      message: 'Note not found'
    });
  }

  const updates = req.body;
  const allowedUpdates = [
    'title', 'content', 'category', 'tags', 'relatedResource',
    'folder', 'priority', 'isPrivate', 'isPinned', 'reminderDate', 'attachments'
  ];
  
  // Only update allowed fields
  Object.keys(updates).forEach(key => {
    if (allowedUpdates.includes(key)) {
      note[key] = updates[key];
    }
  });

  try {
    await note.save();

    // Log activity
    await VisitorActivity.logActivity({
      userId: req.user.id,
      sessionId: req.sessionID || 'note',
      activityType: 'profile_updated',
      activityData: {
        entityType: 'note',
        entityName: note.title,
        metadata: { action: 'updated', updatedFields: Object.keys(updates) }
      },
      pointsEarned: 5
    });

    res.json({
      success: true,
      data: note,
      message: 'Note updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update note',
      error: error.message
    });
  }
});

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = asyncHandler(async (req, res) => {
  const note = await UserNote.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!note) {
    return res.status(404).json({
      success: false,
      message: 'Note not found'
    });
  }

  try {
    await note.deleteOne();

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete note',
      error: error.message
    });
  }
});

// @desc    Get note statistics
// @route   GET /api/notes/stats
// @access  Private
const getNoteStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    const stats = await UserNote.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalWords: { $sum: '$wordCount' },
          pinned: { $sum: { $cond: ['$isPinned', 1, 0] } },
          withReminders: { $sum: { $cond: [{ $ne: ['$reminderDate', null] }, 1, 0] } },
          byCategory: {
            $push: {
              category: '$category',
              count: { $sum: 1 },
              words: { $sum: '$wordCount' }
            }
          },
          byFolder: {
            $push: {
              folder: '$folder',
              count: { $sum: 1 }
            }
          },
          avgWordCount: { $avg: '$wordCount' },
          lastCreated: { $max: '$createdAt' },
          lastModified: { $max: '$lastModified' }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      totalWords: 0,
      pinned: 0,
      withReminders: 0,
      byCategory: [],
      byFolder: [],
      avgWordCount: 0,
      lastCreated: null,
      lastModified: null
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get note statistics',
      error: error.message
    });
  }
});

// @desc    Toggle note pin status
// @route   PUT /api/notes/:id/pin
// @access  Private
const togglePin = asyncHandler(async (req, res) => {
  const note = await UserNote.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!note) {
    return res.status(404).json({
      success: false,
      message: 'Note not found'
    });
  }

  note.isPinned = !note.isPinned;
  await note.save();

  res.json({
    success: true,
    data: note,
    message: `Note ${note.isPinned ? 'pinned' : 'unpinned'} successfully`
  });
});

// @desc    Get notes with upcoming reminders
// @route   GET /api/notes/reminders
// @access  Private
const getUpcomingReminders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { days = 7 } = req.query;

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + parseInt(days));

  try {
    const notes = await UserNote.find({
      user: userId,
      reminderDate: {
        $gte: new Date(),
        $lte: futureDate
      }
    })
      .sort({ reminderDate: 1 })
      .lean();

    res.json({
      success: true,
      data: notes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get upcoming reminders',
      error: error.message
    });
  }
});

// @desc    Export notes
// @route   GET /api/notes/export
// @access  Private
const exportNotes = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { format = 'json', category, folder } = req.query;

  let query = { user: userId };
  if (category) query.category = category;
  if (folder) query.folder = folder;

  try {
    const notes = await UserNote.find(query)
      .sort({ lastModified: -1 })
      .lean();

    if (format === 'json') {
      res.json({
        success: true,
        data: notes,
        exportedAt: new Date().toISOString(),
        totalNotes: notes.length
      });
    } else {
      // For other formats, could implement CSV, Markdown, etc.
      res.status(400).json({
        success: false,
        message: 'Only JSON format is currently supported'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export notes',
      error: error.message
    });
  }
});

module.exports = {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  getNoteStats,
  togglePin,
  getUpcomingReminders,
  exportNotes
};
