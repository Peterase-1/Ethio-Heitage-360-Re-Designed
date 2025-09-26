const express = require('express');
const router = express.Router();
const {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  getNoteStats,
  togglePin,
  getUpcomingReminders,
  exportNotes
} = require('../controllers/noteController');
const { auth: protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

/**
 * @desc    Get user notes with filtering, search and pagination
 * @route   GET /api/notes
 * @access  Private
 * @query   category, folder, tags, isPinned, page, limit, sortBy, sortOrder, search
 */
router.get('/', getNotes);

/**
 * @desc    Get note statistics
 * @route   GET /api/notes/stats
 * @access  Private
 */
router.get('/stats', getNoteStats);

/**
 * @desc    Get notes with upcoming reminders
 * @route   GET /api/notes/reminders
 * @access  Private
 * @query   days (number of days to look ahead, default: 7)
 */
router.get('/reminders', getUpcomingReminders);

/**
 * @desc    Export notes
 * @route   GET /api/notes/export
 * @access  Private
 * @query   format (json), category?, folder?
 */
router.get('/export', exportNotes);

/**
 * @desc    Get note by ID
 * @route   GET /api/notes/:id
 * @access  Private
 */
router.get('/:id', getNote);

/**
 * @desc    Create new note
 * @route   POST /api/notes
 * @access  Private
 * @body    { title, content, category?, tags?, relatedResource?, folder?, priority?, isPrivate?, isPinned?, reminderDate?, attachments? }
 */
router.post('/', createNote);

/**
 * @desc    Update note
 * @route   PUT /api/notes/:id
 * @access  Private
 * @body    { title?, content?, category?, tags?, relatedResource?, folder?, priority?, isPrivate?, isPinned?, reminderDate?, attachments? }
 */
router.put('/:id', updateNote);

/**
 * @desc    Delete note
 * @route   DELETE /api/notes/:id
 * @access  Private
 */
router.delete('/:id', deleteNote);

/**
 * @desc    Toggle note pin status
 * @route   PUT /api/notes/:id/pin
 * @access  Private
 */
router.put('/:id/pin', togglePin);

module.exports = router;
