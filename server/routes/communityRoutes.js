const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const communityController = require('../controllers/communityController');
const { auth: authenticate } = require('../middleware/auth');

// Middleware to ensure user is authenticated
router.use(authenticate);

// Forum routes
router.get('/forums/topics',
  [
    query('category').optional().isIn(['general', 'heritage-discussion', 'learning-help', 'museums', 'events', 'artifacts', 'culture', 'announcements']),
    query('search').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sort').optional().isIn(['lastActivity', 'createdAt', 'views', 'title'])
  ],
  communityController.getForumTopics
);

router.post('/forums/topics',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional().isString(),
    body('category').optional().isIn(['general', 'heritage-discussion', 'learning-help', 'museums', 'events', 'artifacts', 'culture', 'announcements']),
    body('tags').optional().isArray(),
    body('relatedResource').optional().isObject()
  ],
  communityController.createForumTopic
);

router.get('/forums/topics/:id',
  [param('id').isMongoId()],
  communityController.getForumTopic
);

router.post('/forums/topics/:id/posts',
  [
    param('id').isMongoId(),
    body('content').notEmpty().withMessage('Content is required'),
    body('attachments').optional().isArray()
  ],
  communityController.addForumPost
);

router.post('/forums/topics/:topicId/posts/:postId/like',
  [
    param('topicId').isMongoId(),
    param('postId').isMongoId()
  ],
  communityController.likeForumPost
);

router.post('/forums/topics/:id/subscribe',
  [param('id').isMongoId()],
  communityController.subscribeToTopic
);

// Study Group routes
router.get('/study-groups',
  [
    query('category').optional().isIn(['heritage', 'history', 'culture', 'artifacts', 'language', 'general']),
    query('search').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sort').optional().isIn(['lastActivity', 'createdAt', 'memberCount', 'name'])
  ],
  communityController.getStudyGroups
);

router.post('/study-groups',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').optional().isString(),
    body('category').optional().isIn(['heritage', 'history', 'culture', 'artifacts', 'language', 'general']),
    body('tags').optional().isArray(),
    body('relatedCourse').optional().isMongoId(),
    body('maxMembers').optional().isInt({ min: 2, max: 100 }),
    body('isPrivate').optional().isBoolean(),
    body('requiresApproval').optional().isBoolean(),
    body('settings').optional().isObject()
  ],
  communityController.createStudyGroup
);

router.get('/study-groups/:id',
  [param('id').isMongoId()],
  communityController.getStudyGroup
);

router.post('/study-groups/:id/join',
  [
    param('id').isMongoId(),
    body('inviteCode').optional().isString()
  ],
  communityController.joinStudyGroup
);

router.post('/study-groups/:id/leave',
  [param('id').isMongoId()],
  communityController.leaveStudyGroup
);

router.get('/my-study-groups',
  [
    query('role').optional().isIn(['owner', 'moderator', 'member']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  communityController.getMyStudyGroups
);

// Social features
router.get('/leaderboard',
  [
    query('category').optional().isIn(['course-completion', 'skill-building', 'knowledge', 'certification', 'exploration', 'social', 'habit', 'custom']),
    query('timeframe').optional().isIn(['weekly', 'monthly', 'yearly']),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  communityController.getLeaderboard
);

router.post('/share-progress',
  [
    body('goalId').optional().isMongoId(),
    body('achievementId').optional().isMongoId(),
    body('activityType').optional().isIn(['course_completed', 'quiz_passed', 'artifact_discovered', 'museum_visited', 'heritage_explored']),
    body('message').optional().isString().isLength({ max: 500 }),
    body('platforms').optional().isArray(),
    body('privacy').optional().isIn(['public', 'followers', 'private'])
  ],
  communityController.shareProgress
);

// Enhanced Friend System
router.get('/find-friends',
  [
    query('search').notEmpty().withMessage('Search term is required'),
    query('filter').optional().isIn(['all', 'following', 'followers', 'mutual', 'suggested']),
    query('sortBy').optional().isIn(['recent', 'name', 'activity']),
    query('interests').optional().isString(),
    query('location').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  communityController.findUsers
);

router.get('/users/suggested',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  communityController.getSuggestedFriends
);

router.get('/users/:userId/profile',
  [param('userId').isMongoId()],
  communityController.getUserProfile
);

router.get('/users/connections',
  [
    query('userId').optional().isMongoId(),
    query('type').optional().isIn(['followers', 'following']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  communityController.getConnections
);

// Enhanced Posts System
router.get('/posts',
  [
    query('category').optional().isIn(['general', 'artifacts', 'history', 'culture', 'heritage-sites', 'museums', 'events']),
    query('sortBy').optional().isIn(['recent', 'popular', 'trending']),
    query('search').optional().isString(),
    query('tags').optional().isString(),
    query('author').optional().isMongoId(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  communityController.getPosts
);

router.post('/posts',
  [
    body('title').isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
    body('content').isLength({ min: 10, max: 5000 }).withMessage('Content must be between 10 and 5000 characters'),
    body('category').optional().isIn(['general', 'artifacts', 'history', 'culture', 'heritage-sites', 'museums', 'events']),
    body('tags').optional().isArray()
  ],
  communityController.createPost
);

router.post('/posts/:id/like',
  [param('id').isMongoId()],
  communityController.toggleLikePost
);

router.post('/posts/:id/comments',
  [
    param('id').isMongoId(),
    body('content').isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters')
  ],
  communityController.addComment
);

// Social Features
router.post('/users/:userId/follow',
  [param('userId').isMongoId()],
  communityController.toggleFollow
);

router.get('/activity',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('userId').optional().isMongoId()
  ],
  communityController.getActivityFeed
);

// Community statistics
router.get('/stats',
  communityController.getCommunityStats
);

module.exports = router;
