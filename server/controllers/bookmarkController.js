const asyncHandler = require('express-async-handler');
const Bookmark = require('../models/Bookmark');
const VisitorActivity = require('../models/VisitorActivity');

// @desc    Get user bookmarks
// @route   GET /api/bookmarks
// @access  Private
const getBookmarks = asyncHandler(async (req, res) => {
  const { folder, category, priority, resourceType, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1 } = req.query;
  const userId = req.user.id;

  const query = { user: userId };

  // Apply filters
  if (folder) query.folder = folder;
  if (category) query.category = new RegExp(category, 'i');
  if (priority) query.priority = priority;
  if (resourceType) query.resourceType = resourceType;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: parseInt(sortOrder) };

  try {
    const [bookmarks, total, folders] = await Promise.all([
      Bookmark.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Bookmark.countDocuments(query),
      Bookmark.distinct('folder', { user: userId })
    ]);

    res.json({
      success: true,
      data: {
        bookmarks,
        folders,
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
      message: 'Failed to retrieve bookmarks',
      error: error.message
    });
  }
});

// @desc    Get bookmark by ID
// @route   GET /api/bookmarks/:id
// @access  Private
const getBookmark = asyncHandler(async (req, res) => {
  const bookmark = await Bookmark.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!bookmark) {
    return res.status(404).json({
      success: false,
      message: 'Bookmark not found'
    });
  }

  // Update access info
  await bookmark.updateAccess();

  res.json({
    success: true,
    data: bookmark
  });
});

// @desc    Create new bookmark
// @route   POST /api/bookmarks
// @access  Private
const createBookmark = asyncHandler(async (req, res) => {
  const {
    resourceType,
    resourceId,
    title,
    description,
    imageUrl,
    url,
    category,
    tags,
    notes,
    isPrivate,
    folder,
    priority
  } = req.body;

  // Check if bookmark already exists
  const existingBookmark = await Bookmark.findOne({
    user: req.user.id,
    resourceType,
    resourceId
  });

  if (existingBookmark) {
    return res.status(400).json({
      success: false,
      message: 'Resource already bookmarked'
    });
  }

  try {
    const bookmark = await Bookmark.create({
      user: req.user.id,
      resourceType,
      resourceId,
      title,
      description,
      imageUrl,
      url,
      category,
      tags,
      notes,
      isPrivate: isPrivate !== undefined ? isPrivate : true,
      folder: folder || 'General',
      priority: priority || 3
    });

    // Log activity
    await VisitorActivity.logActivity({
      userId: req.user.id,
      sessionId: req.sessionID || 'bookmark',
      activityType: 'favorite_added',
      activityData: {
        entityId: resourceId,
        entityType: resourceType,
        entityName: title,
        metadata: { folder, priority }
      },
      pointsEarned: 5
    });

    res.status(201).json({
      success: true,
      data: bookmark,
      message: 'Bookmark created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create bookmark',
      error: error.message
    });
  }
});

// @desc    Update bookmark
// @route   PUT /api/bookmarks/:id
// @access  Private
const updateBookmark = asyncHandler(async (req, res) => {
  const bookmark = await Bookmark.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!bookmark) {
    return res.status(404).json({
      success: false,
      message: 'Bookmark not found'
    });
  }

  const updates = req.body;
  const allowedUpdates = ['title', 'description', 'notes', 'folder', 'priority', 'tags', 'category', 'isPrivate'];
  
  // Only update allowed fields
  Object.keys(updates).forEach(key => {
    if (allowedUpdates.includes(key)) {
      bookmark[key] = updates[key];
    }
  });

  try {
    await bookmark.save();

    res.json({
      success: true,
      data: bookmark,
      message: 'Bookmark updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update bookmark',
      error: error.message
    });
  }
});

// @desc    Delete bookmark
// @route   DELETE /api/bookmarks/:id
// @access  Private
const deleteBookmark = asyncHandler(async (req, res) => {
  const bookmark = await Bookmark.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!bookmark) {
    return res.status(404).json({
      success: false,
      message: 'Bookmark not found'
    });
  }

  try {
    await bookmark.deleteOne();

    // Log activity
    await VisitorActivity.logActivity({
      userId: req.user.id,
      sessionId: req.sessionID || 'bookmark',
      activityType: 'favorite_removed',
      activityData: {
        entityId: bookmark.resourceId,
        entityType: bookmark.resourceType,
        entityName: bookmark.title
      },
      pointsEarned: 0
    });

    res.json({
      success: true,
      message: 'Bookmark deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete bookmark',
      error: error.message
    });
  }
});

// @desc    Get bookmark statistics
// @route   GET /api/bookmarks/stats
// @access  Private
const getBookmarkStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    const stats = await Bookmark.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byResourceType: {
            $push: {
              resourceType: '$resourceType',
              count: { $sum: 1 }
            }
          },
          byFolder: {
            $push: {
              folder: '$folder',
              count: { $sum: 1 }
            }
          },
          byPriority: {
            $push: {
              priority: '$priority',
              count: { $sum: 1 }
            }
          },
          mostAccessedResource: { $max: '$accessCount' },
          totalAccess: { $sum: '$accessCount' },
          lastBookmarked: { $max: '$createdAt' }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      byResourceType: [],
      byFolder: [],
      byPriority: [],
      mostAccessedResource: 0,
      totalAccess: 0,
      lastBookmarked: null
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get bookmark statistics',
      error: error.message
    });
  }
});

// @desc    Move bookmarks to folder
// @route   PUT /api/bookmarks/move-to-folder
// @access  Private
const moveToFolder = asyncHandler(async (req, res) => {
  const { bookmarkIds, folder } = req.body;

  if (!bookmarkIds || !Array.isArray(bookmarkIds) || !folder) {
    return res.status(400).json({
      success: false,
      message: 'Bookmark IDs array and folder name are required'
    });
  }

  try {
    const result = await Bookmark.updateMany(
      {
        _id: { $in: bookmarkIds },
        user: req.user.id
      },
      { folder }
    );

    res.json({
      success: true,
      data: {
        updatedCount: result.nModified
      },
      message: `${result.nModified} bookmark(s) moved to ${folder}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to move bookmarks',
      error: error.message
    });
  }
});

module.exports = {
  getBookmarks,
  getBookmark,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  getBookmarkStats,
  moveToFolder
};
