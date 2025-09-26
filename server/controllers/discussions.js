const Discussion = require('../models/Discussion');
const Course = require('../models/Course');
const User = require('../models/User');

// Create new discussion
const createDiscussion = async (req, res) => {
  try {
    const {
      title, description, courseId, lessonId, category, tags,
      allowStudentPosts, requireApproval, isLocked
    } = req.body;

    // Validate required fields
    if (!title || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Title and course ID are required'
      });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Create discussion
    const discussion = new Discussion({
      title: title.trim(),
      description: description?.trim() || '',
      courseId,
      lessonId,
      category: category || 'general',
      tags: tags || [],
      settings: {
        allowStudentPosts: allowStudentPosts !== undefined ? allowStudentPosts : true,
        requireApproval: requireApproval !== undefined ? requireApproval : false,
        isLocked: isLocked !== undefined ? isLocked : false
      },
      createdBy: req.user.id
    });

    await discussion.save();

    res.status(201).json({
      success: true,
      message: 'Discussion created successfully',
      discussion
    });
  } catch (error) {
    console.error('Create discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create discussion'
    });
  }
};

// Get all discussions for a course
const getDiscussions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { category, page = 1, limit = 20 } = req.query;

    const filter = { courseId };
    if (category) filter.category = category;

    const discussions = await Discussion.find(filter)
      .populate('createdBy', 'name email')
      .populate('posts.author', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({
      success: true,
      discussions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: discussions.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get discussions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussions'
    });
  }
};

// Get single discussion with posts
const getDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;

    const discussion = await Discussion.findById(discussionId)
      .populate('createdBy', 'name email')
      .populate('posts.author', 'name email')
      .populate('posts.replies.author', 'name email');

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    // Increment view count
    discussion.stats.totalViews += 1;
    discussion.stats.lastActivity = new Date();
    await discussion.save();

    res.json({
      success: true,
      discussion
    });
  } catch (error) {
    console.error('Get discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussion'
    });
  }
};

// Create post in discussion
const createPost = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content, attachments } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Post content is required'
      });
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    // Check if user can post
    if (discussion.settings.isLocked) {
      return res.status(403).json({
        success: false,
        message: 'Discussion is locked'
      });
    }

    if (!discussion.settings.allowStudentPosts && req.user.role === 'user') {
      return res.status(403).json({
        success: false,
        message: 'Students are not allowed to post in this discussion'
      });
    }

    // Create post
    const post = {
      author: req.user.id,
      content: content.trim(),
      attachments: attachments || [],
      likes: [],
      replies: [],
      isPinned: false,
      isAnswer: false
    };

    discussion.posts.push(post);
    discussion.stats.totalPosts += 1;
    discussion.stats.lastActivity = new Date();

    await discussion.save();

    // Populate the new post for response
    const updatedDiscussion = await Discussion.findById(discussionId)
      .populate('posts.author', 'name email');

    const newPost = updatedDiscussion.posts[updatedDiscussion.posts.length - 1];

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: newPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post'
    });
  }
};

// Reply to a post
const createReply = async (req, res) => {
  try {
    const { discussionId, postId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    const post = discussion.posts.id(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user can reply
    if (discussion.settings.isLocked) {
      return res.status(403).json({
        success: false,
        message: 'Discussion is locked'
      });
    }

    // Create reply
    const reply = {
      author: req.user.id,
      content: content.trim(),
      likes: []
    };

    post.replies.push(reply);
    discussion.stats.lastActivity = new Date();

    await discussion.save();

    // Populate the new reply for response
    const updatedDiscussion = await Discussion.findById(discussionId)
      .populate('posts.replies.author', 'name email');

    const updatedPost = updatedDiscussion.posts.id(postId);
    const newReply = updatedPost.replies[updatedPost.replies.length - 1];

    res.status(201).json({
      success: true,
      message: 'Reply created successfully',
      reply: newReply
    });
  } catch (error) {
    console.error('Create reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reply'
    });
  }
};

// Like/unlike a post
const togglePostLike = async (req, res) => {
  try {
    const { discussionId, postId } = req.params;
    const userId = req.user.id;

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    const post = discussion.posts.id(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user already liked this post
    const existingLike = post.likes.find(like => like.user.toString() === userId);

    if (existingLike) {
      // Remove like
      post.likes = post.likes.filter(like => like.user.toString() !== userId);
    } else {
      // Add like
      post.likes.push({ user: userId });
    }

    await discussion.save();

    res.json({
      success: true,
      message: existingLike ? 'Post unliked' : 'Post liked',
      liked: !existingLike,
      likeCount: post.likes.length
    });
  } catch (error) {
    console.error('Toggle post like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    });
  }
};

// Pin/unpin a post (instructors only)
const togglePostPin = async (req, res) => {
  try {
    const { discussionId, postId } = req.params;

    // Only allow instructors and admins to pin posts
    if (!['admin', 'super_admin', 'museum_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only instructors can pin posts'
      });
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    const post = discussion.posts.id(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.isPinned = !post.isPinned;
    await discussion.save();

    res.json({
      success: true,
      message: post.isPinned ? 'Post pinned' : 'Post unpinned',
      isPinned: post.isPinned
    });
  } catch (error) {
    console.error('Toggle post pin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle pin'
    });
  }
};

// Mark post as answer (instructors only)
const markAsAnswer = async (req, res) => {
  try {
    const { discussionId, postId } = req.params;

    // Only allow instructors and admins to mark answers
    if (!['admin', 'super_admin', 'museum_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only instructors can mark answers'
      });
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    const post = discussion.posts.id(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Remove answer mark from other posts if this is being marked as answer
    if (!post.isAnswer) {
      discussion.posts.forEach(p => {
        if (p._id.toString() !== postId) {
          p.isAnswer = false;
        }
      });
    }

    post.isAnswer = !post.isAnswer;
    await discussion.save();

    res.json({
      success: true,
      message: post.isAnswer ? 'Post marked as answer' : 'Answer mark removed',
      isAnswer: post.isAnswer
    });
  } catch (error) {
    console.error('Mark as answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark as answer'
    });
  }
};

// Update discussion settings (instructors only)
const updateDiscussionSettings = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { allowStudentPosts, requireApproval, isLocked } = req.body;

    // Only allow instructors and admins to update settings
    if (!['admin', 'super_admin', 'museum_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only instructors can update discussion settings'
      });
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    // Update settings
    if (allowStudentPosts !== undefined) {
      discussion.settings.allowStudentPosts = allowStudentPosts;
    }
    if (requireApproval !== undefined) {
      discussion.settings.requireApproval = requireApproval;
    }
    if (isLocked !== undefined) {
      discussion.settings.isLocked = isLocked;
    }

    await discussion.save();

    res.json({
      success: true,
      message: 'Discussion settings updated successfully',
      settings: discussion.settings
    });
  } catch (error) {
    console.error('Update discussion settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update discussion settings'
    });
  }
};

// Delete discussion (admins only)
const deleteDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;

    // Only allow admins to delete discussions
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can delete discussions'
      });
    }

    const discussion = await Discussion.findByIdAndDelete(discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    res.json({
      success: true,
      message: 'Discussion deleted successfully'
    });
  } catch (error) {
    console.error('Delete discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete discussion'
    });
  }
};

// Get discussion statistics (for super admin)
const getDiscussionStats = async (req, res) => {
  try {
    const { discussionId } = req.params;

    const discussion = await Discussion.findById(discussionId)
      .populate('posts.author', 'name email')
      .populate('posts.replies.author', 'name email');

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    const stats = {
      basic: {
        totalPosts: discussion.stats.totalPosts,
        totalViews: discussion.stats.totalViews,
        lastActivity: discussion.stats.lastActivity,
        participantCount: [...new Set(discussion.posts.map(p => p.author._id.toString()))].length
      },
      engagement: {
        totalLikes: discussion.posts.reduce((sum, post) => sum + post.likes.length, 0),
        totalReplies: discussion.posts.reduce((sum, post) => sum + post.replies.length, 0),
        averagePostLength: discussion.posts.length > 0 ? 
          Math.round(discussion.posts.reduce((sum, post) => sum + post.content.length, 0) / discussion.posts.length) : 0
      },
      content: {
        pinnedPosts: discussion.posts.filter(p => p.isPinned).length,
        answeredQuestions: discussion.posts.filter(p => p.isAnswer).length,
        attachments: discussion.posts.reduce((sum, post) => sum + post.attachments.length, 0)
      }
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get discussion stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussion statistics'
    });
  }
};

module.exports = {
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
};
