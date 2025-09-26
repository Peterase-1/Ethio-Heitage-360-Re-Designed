const express = require('express');
const router = express.Router();
const {
  createDiscussion,
  getDiscussions,
  getDiscussion,
  createPost,
  createReply,
  togglePostLike,
  togglePostPin,
  markAsAnswer,
  updateDiscussionSettings,
  deleteDiscussion,
  getDiscussionStats
} = require('../controllers/discussions');
const { auth: authenticate } = require('../middleware/auth');

// Discussion management routes
router.post('/', authenticate, createDiscussion);
router.get('/course/:courseId', getDiscussions);
router.get('/:discussionId', getDiscussion);
router.put('/:discussionId/settings', authenticate, updateDiscussionSettings);
router.delete('/:discussionId', authenticate, deleteDiscussion);
router.get('/:discussionId/stats', authenticate, getDiscussionStats);

// Post management routes
router.post('/:discussionId/posts', authenticate, createPost);
router.post('/:discussionId/posts/:postId/replies', authenticate, createReply);
router.post('/:discussionId/posts/:postId/like', authenticate, togglePostLike);
router.post('/:discussionId/posts/:postId/pin', authenticate, togglePostPin);
router.post('/:discussionId/posts/:postId/answer', authenticate, markAsAnswer);

module.exports = router;
