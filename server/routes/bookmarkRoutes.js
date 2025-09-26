const express = require('express');
const router = express.Router();
const {
  getBookmarks,
  getBookmark,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  getBookmarkStats,
  moveToFolder
} = require('../controllers/bookmarkController');
const { auth: protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

/**
 * @desc    Get user bookmarks with filtering and pagination
 * @route   GET /api/bookmarks
 * @access  Private
 * @query   folder, category, priority, resourceType, page, limit, sortBy, sortOrder
 */
router.get('/', getBookmarks);

/**
 * @desc    Get bookmark statistics
 * @route   GET /api/bookmarks/stats
 * @access  Private
 */
router.get('/stats', getBookmarkStats);

/**
 * @desc    Move bookmarks to a folder
 * @route   PUT /api/bookmarks/move-to-folder
 * @access  Private
 * @body    { bookmarkIds: Array, folder: String }
 */
router.put('/move-to-folder', moveToFolder);

/**
 * @desc    Get bookmark by ID
 * @route   GET /api/bookmarks/:id
 * @access  Private
 */
router.get('/:id', getBookmark);

/**
 * @desc    Create new bookmark
 * @route   POST /api/bookmarks
 * @access  Private
 * @body    { resourceType, resourceId, title, description?, imageUrl?, url?, category?, tags?, notes?, isPrivate?, folder?, priority? }
 */
router.post('/', createBookmark);

/**
 * @desc    Update bookmark
 * @route   PUT /api/bookmarks/:id
 * @access  Private
 * @body    { title?, description?, notes?, folder?, priority?, tags?, category?, isPrivate? }
 */
router.put('/:id', updateBookmark);

/**
 * @desc    Delete bookmark
 * @route   DELETE /api/bookmarks/:id
 * @access  Private
 */
router.delete('/:id', deleteBookmark);

module.exports = router;
