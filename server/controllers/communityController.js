const ForumTopic = require('../models/Forum');
const StudyGroup = require('../models/StudyGroup');
const UserGoal = require('../models/UserGoal');
const { Post, Follow, Activity, CommunityStats } = require('../models/Community');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

class CommunityController {
  // Forum Topics
  async getForumTopics(req, res) {
    try {
      const {
        category,
        search,
        page = 1,
        limit = 20,
        sort = 'lastActivity'
      } = req.query;

      const query = {};
      
      if (category) query.category = category;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' }},
          { description: { $regex: search, $options: 'i' }}
        ];
      }

      const topics = await ForumTopic.find(query)
        .populate('author', 'name profileImage')
        .populate('lastPost.author', 'name profileImage')
        .sort({ isPinned: -1, [sort]: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await ForumTopic.countDocuments(query);

      // Get category statistics
      const categoryStats = await ForumTopic.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        data: topics,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        },
        categories: categoryStats
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createForumTopic(req, res) {
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
        title,
        description,
        category = 'general',
        tags = [],
        relatedResource
      } = req.body;

      const topic = new ForumTopic({
        title,
        description,
        category,
        author: req.user.id,
        tags,
        relatedResource,
        posts: []
      });

      await topic.save();

      const populatedTopic = await ForumTopic.findById(topic._id)
        .populate('author', 'name profileImage');

      res.status(201).json({
        success: true,
        data: populatedTopic,
        message: 'Forum topic created successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getForumTopic(req, res) {
    try {
      const topic = await ForumTopic.findById(req.params.id)
        .populate('author', 'name profileImage bio')
        .populate('posts.author', 'name profileImage')
        .populate('posts.likes.user', 'name profileImage');

      if (!topic) {
        return res.status(404).json({ success: false, message: 'Topic not found' });
      }

      // Increment views
      await topic.incrementViews();

      res.json({
        success: true,
        data: topic
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async addForumPost(req, res) {
    try {
      const { content, attachments = [] } = req.body;
      const topicId = req.params.id;

      const topic = await ForumTopic.findById(topicId);
      if (!topic) {
        return res.status(404).json({ success: false, message: 'Topic not found' });
      }

      if (topic.isLocked) {
        return res.status(403).json({ success: false, message: 'Topic is locked' });
      }

      await topic.addPost(req.user.id, content, attachments);

      const updatedTopic = await ForumTopic.findById(topicId)
        .populate('posts.author', 'name profileImage')
        .select('posts');

      const newPost = updatedTopic.posts[updatedTopic.posts.length - 1];

      res.status(201).json({
        success: true,
        data: newPost,
        message: 'Post added successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async likeForumPost(req, res) {
    try {
      const { topicId, postId } = req.params;
      const userId = req.user.id;

      const topic = await ForumTopic.findById(topicId);
      if (!topic) {
        return res.status(404).json({ success: false, message: 'Topic not found' });
      }

      const post = topic.posts.id(postId);
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }

      const existingLike = post.likes.find(like => 
        like.user.toString() === userId.toString()
      );

      if (existingLike) {
        // Remove like
        post.likes = post.likes.filter(like => 
          like.user.toString() !== userId.toString()
        );
      } else {
        // Add like
        post.likes.push({ user: userId });
      }

      await topic.save();

      res.json({
        success: true,
        data: {
          liked: !existingLike,
          likeCount: post.likes.length
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async subscribeToTopic(req, res) {
    try {
      const topicId = req.params.id;
      const userId = req.user.id;

      const topic = await ForumTopic.findById(topicId);
      if (!topic) {
        return res.status(404).json({ success: false, message: 'Topic not found' });
      }

      await topic.subscribe(userId);

      res.json({
        success: true,
        message: 'Subscribed to topic'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Study Groups
  async getStudyGroups(req, res) {
    try {
      const {
        category,
        search,
        page = 1,
        limit = 20,
        sort = 'lastActivity'
      } = req.query;

      const query = { 
        status: 'active',
        $or: [
          { isPrivate: false },
          { 'members.user': req.user.id, 'members.isActive': true }
        ]
      };
      
      if (category) query.category = category;
      if (search) {
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { name: { $regex: search, $options: 'i' }},
            { description: { $regex: search, $options: 'i' }}
          ]
        });
      }

      const groups = await StudyGroup.find(query)
        .populate('creator', 'name profileImage')
        .populate('members.user', 'name profileImage')
        .populate('relatedCourse', 'title')
        .sort({ [sort]: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await StudyGroup.countDocuments(query);

      res.json({
        success: true,
        data: groups,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createStudyGroup(req, res) {
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
        name,
        description,
        category = 'heritage',
        tags = [],
        relatedCourse,
        maxMembers = 20,
        isPrivate = false,
        requiresApproval = false,
        settings = {}
      } = req.body;

      const group = new StudyGroup({
        name,
        description,
        creator: req.user.id,
        category,
        tags,
        relatedCourse,
        maxMembers,
        isPrivate,
        requiresApproval,
        settings: {
          allowInvites: settings.allowInvites !== false,
          allowFileSharing: settings.allowFileSharing !== false,
          enableNotifications: settings.enableNotifications !== false
        },
        members: [{
          user: req.user.id,
          role: 'owner'
        }]
      });

      await group.save();

      if (isPrivate) {
        await group.generateInviteCode();
      }

      const populatedGroup = await StudyGroup.findById(group._id)
        .populate('creator', 'name profileImage')
        .populate('members.user', 'name profileImage')
        .populate('relatedCourse', 'title');

      res.status(201).json({
        success: true,
        data: populatedGroup,
        message: 'Study group created successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getStudyGroup(req, res) {
    try {
      const group = await StudyGroup.findById(req.params.id)
        .populate('creator', 'name profileImage bio')
        .populate('members.user', 'name profileImage')
        .populate('relatedCourse', 'title description')
        .populate('discussions.author', 'name profileImage')
        .populate('discussions.replies.author', 'name profileImage');

      if (!group) {
        return res.status(404).json({ success: false, message: 'Study group not found' });
      }

      // Check if user is a member
      const isMember = group.members.some(member => 
        member.user._id.toString() === req.user.id && member.isActive
      );

      if (group.isPrivate && !isMember) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      res.json({
        success: true,
        data: {
          ...group.toObject(),
          isMember,
          userRole: isMember ? 
            group.members.find(m => m.user._id.toString() === req.user.id).role : null
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async joinStudyGroup(req, res) {
    try {
      const groupId = req.params.id;
      const userId = req.user.id;
      const { inviteCode } = req.body;

      const group = await StudyGroup.findById(groupId);
      if (!group) {
        return res.status(404).json({ success: false, message: 'Study group not found' });
      }

      if (group.isPrivate && group.inviteCode !== inviteCode) {
        return res.status(403).json({ success: false, message: 'Invalid invite code' });
      }

      await group.addMember(userId);

      res.json({
        success: true,
        message: 'Successfully joined study group'
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async leaveStudyGroup(req, res) {
    try {
      const groupId = req.params.id;
      const userId = req.user.id;

      const group = await StudyGroup.findById(groupId);
      if (!group) {
        return res.status(404).json({ success: false, message: 'Study group not found' });
      }

      await group.removeMember(userId);

      res.json({
        success: true,
        message: 'Left study group successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMyStudyGroups(req, res) {
    try {
      const { role, page = 1, limit = 10 } = req.query;

      const query = {
        'members.user': req.user.id,
        'members.isActive': true,
        status: 'active'
      };

      if (role) {
        query['members.role'] = role;
      }

      const groups = await StudyGroup.find(query)
        .populate('creator', 'name profileImage')
        .populate('members.user', 'name profileImage')
        .populate('relatedCourse', 'title')
        .sort({ lastActivity: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await StudyGroup.countDocuments(query);

      res.json({
        success: true,
        data: groups,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // User Goals (Social Goals)
  async getLeaderboard(req, res) {
    try {
      const { category, timeframe = 'monthly', limit = 50 } = req.query;

      let dateFilter = {};
      const now = new Date();
      
      switch (timeframe) {
        case 'weekly':
          dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
          break;
        case 'monthly':
          dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } };
          break;
        case 'yearly':
          dateFilter = { createdAt: { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) } };
          break;
      }

      const matchQuery = {
        status: 'completed',
        isPublic: true,
        ...dateFilter
      };

      if (category) {
        matchQuery.category = category;
      }

      const leaderboard = await UserGoal.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$user',
            completedGoals: { $sum: 1 },
            totalProgress: { $sum: '$progress' },
            points: { $sum: { $multiply: ['$current', 10] } } // 10 points per unit
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: 0,
            user: {
              id: '$user._id',
              name: '$user.name',
              profileImage: '$user.profileImage'
            },
            completedGoals: 1,
            totalProgress: 1,
            points: 1,
            score: { $add: ['$points', { $multiply: ['$completedGoals', 50] }] }
          }
        },
        { $sort: { score: -1 } },
        { $limit: limit * 1 }
      ]);

      res.json({
        success: true,
        data: leaderboard,
        timeframe,
        category: category || 'all'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async shareProgress(req, res) {
    try {
      const { 
        goalId, 
        achievementId,
        activityType,
        message, 
        platforms = ['internal'],
        privacy = 'public'
      } = req.body;

      let shareData = {};
      let shareTitle = '';
      let shareContent = '';

      // Handle different types of progress sharing
      if (goalId) {
        const goal = await UserGoal.findOne({
          _id: goalId,
          user: req.user.id
        });

        if (!goal) {
          return res.status(404).json({ success: false, message: 'Goal not found' });
        }

        shareData = goal;
        shareTitle = `🎯 Progress Update: ${goal.title}`;
        shareContent = message || `I'm making progress on my goal: ${goal.title}! Current progress: ${goal.progress}%`;
        
        if (goal.status === 'completed') {
          shareTitle = `🎉 Goal Achieved: ${goal.title}`;
          shareContent = message || `I just completed my goal: ${goal.title}!`;
        }
      } else if (achievementId) {
        // Handle achievement sharing (you can expand this based on your achievement system)
        shareTitle = `🏆 Achievement Unlocked!`;
        shareContent = message || `I just earned a new achievement!`;
      } else if (activityType) {
        // Handle general activity sharing
        const activityMessages = {
          course_completed: 'I just completed a course!',
          quiz_passed: 'I aced a quiz!',
          artifact_discovered: 'I discovered an interesting artifact!',
          museum_visited: 'I visited a new museum!',
          heritage_explored: 'I explored Ethiopian heritage!'
        };
        
        shareTitle = `✨ Learning Update`;
        shareContent = message || activityMessages[activityType] || 'I made some progress on my learning journey!';
      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'Must specify goalId, achievementId, or activityType' 
        });
      }

      const sharedActivities = [];

      // Share internally (create community post)
      if (platforms.includes('internal')) {
        try {
          // Create a community post
          const { Post } = require('../models/Community');
          const post = new Post({
            title: shareTitle,
            content: shareContent,
            category: 'general',
            author: req.user.id,
            tags: ['progress-share', 'achievement']
          });

          await post.save();
          await post.populate('author', 'name profileImage');

          // Create activity entry
          const activity = new Activity({
            user: req.user.id,
            type: 'progress_shared',
            entityType: 'post',
            entityId: post._id,
            entityName: shareTitle,
            metadata: {
              platforms: platforms,
              originalType: goalId ? 'goal' : achievementId ? 'achievement' : 'activity'
            },
            isPublic: privacy === 'public'
          });

          await activity.save();
          sharedActivities.push({ platform: 'internal', success: true, postId: post._id });
        } catch (error) {
          console.error('Error creating internal post:', error);
          sharedActivities.push({ platform: 'internal', success: false, error: error.message });
        }
      }

      // Generate social media sharing links
      const socialLinks = {};
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const shareUrl = `${baseUrl}/visitor/progress`;
      
      if (platforms.includes('twitter')) {
        const twitterText = encodeURIComponent(`${shareContent} #EthiopianHeritage #Learning`);
        socialLinks.twitter = `https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(shareUrl)}`;
      }

      if (platforms.includes('facebook')) {
        socialLinks.facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareContent)}`;
      }

      if (platforms.includes('linkedin')) {
        socialLinks.linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}&summary=${encodeURIComponent(shareContent)}`;
      }

      if (platforms.includes('whatsapp')) {
        const whatsappText = encodeURIComponent(`${shareContent} ${shareUrl}`);
        socialLinks.whatsapp = `https://wa.me/?text=${whatsappText}`;
      }

      // Send notifications to followers if sharing publicly
      if (privacy === 'public') {
        try {
          const followers = await Follow.find({ following: req.user.id });
          
          // You could send notifications here
          // For now, we'll just log the count
          console.log(`Progress shared with ${followers.length} followers`);
        } catch (error) {
          console.error('Error notifying followers:', error);
        }
      }

      res.json({
        success: true,
        message: 'Progress shared successfully',
        data: {
          sharedActivities,
          socialLinks,
          shareContent: {
            title: shareTitle,
            content: shareContent,
            privacy
          }
        }
      });
    } catch (error) {
      console.error('Error sharing progress:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // ========== ENHANCED FRIEND SYSTEM ==========

  /**
   * Find users with enhanced filtering and relationship status
   */
  async findUsers(req, res) {
    try {
      const { 
        search, 
        page = 1, 
        limit = 20, 
        filter = 'all',
        sortBy = 'recent',
        interests,
        location
      } = req.query;

      if (!search || search.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search term must be at least 2 characters'
        });
      }

      const currentUserId = req.user.id;
      const query = {
        $and: [
          {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
              { bio: { $regex: search, $options: 'i' } }
            ]
          },
          { _id: { $ne: currentUserId } },
          { role: 'visitor' },
          { isActive: true }
        ]
      };

      // Add interest filtering
      if (interests) {
        const interestArray = Array.isArray(interests) ? interests : interests.split(',');
        query['preferences.interests'] = { $in: interestArray };
      }

      // Add location filtering
      if (location) {
        query['profile.location'] = { $regex: location, $options: 'i' };
      }

      let sortOptions = {};
      switch (sortBy) {
        case 'name':
          sortOptions = { name: 1 };
          break;
        case 'activity':
          sortOptions = { lastActivity: -1 };
          break;
        case 'recent':
        default:
          sortOptions = { createdAt: -1 };
          break;
      }

      const users = await User.find(query)
        .select('name email profileImage bio createdAt lastActivity preferences profile')
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      // Get relationship status for each user
      const usersWithStatus = await Promise.all(
        users.map(async (user) => {
          const isFollowing = await Follow.findOne({
            follower: currentUserId,
            following: user._id
          });

          const isFollowedBy = await Follow.findOne({
            follower: user._id,
            following: currentUserId
          });

          const followerCount = await Follow.countDocuments({ following: user._id });
          const followingCount = await Follow.countDocuments({ follower: user._id });

          // Get mutual connections
          const userFollowing = await Follow.find({ follower: user._id }).select('following');
          const currentUserFollowing = await Follow.find({ follower: currentUserId }).select('following');
          
          const userFollowingIds = userFollowing.map(f => f.following.toString());
          const currentUserFollowingIds = currentUserFollowing.map(f => f.following.toString());
          const mutualConnections = userFollowingIds.filter(id => currentUserFollowingIds.includes(id));

          return {
            ...user.toObject(),
            relationshipStatus: {
              isFollowing: !!isFollowing,
              isFollowedBy: !!isFollowedBy,
              isMutual: !!isFollowing && !!isFollowedBy,
              followerCount,
              followingCount,
              mutualConnectionsCount: mutualConnections.length
            }
          };
        })
      );

      // Apply relationship filter
      let filteredUsers = usersWithStatus;
      switch (filter) {
        case 'following':
          filteredUsers = usersWithStatus.filter(u => u.relationshipStatus.isFollowing);
          break;
        case 'followers':
          filteredUsers = usersWithStatus.filter(u => u.relationshipStatus.isFollowedBy);
          break;
        case 'mutual':
          filteredUsers = usersWithStatus.filter(u => u.relationshipStatus.isMutual);
          break;
        case 'suggested':
          // Users with mutual connections but not following
          filteredUsers = usersWithStatus.filter(u => 
            u.relationshipStatus.mutualConnectionsCount > 0 && 
            !u.relationshipStatus.isFollowing
          );
          break;
        case 'all':
        default:
          break;
      }

      const total = await User.countDocuments(query);

      res.json({
        success: true,
        data: filteredUsers,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total: filteredUsers.length
        },
        filters: {
          applied: filter,
          available: ['all', 'following', 'followers', 'mutual', 'suggested']
        }
      });
    } catch (error) {
      console.error('Error finding users:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get user's social connections (followers/following)
   */
  async getConnections(req, res) {
    try {
      const { userId, type = 'followers', page = 1, limit = 20 } = req.query;
      const targetUserId = userId || req.user.id;

      let query = {};
      let populateField = '';
      
      if (type === 'followers') {
        query = { following: targetUserId };
        populateField = 'follower';
      } else if (type === 'following') {
        query = { follower: targetUserId };
        populateField = 'following';
      } else {
        return res.status(400).json({
          success: false,
          message: 'Type must be either "followers" or "following"'
        });
      }

      const connections = await Follow.find(query)
        .populate(populateField, 'name profileImage bio lastActivity')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Follow.countDocuments(query);

      // Check mutual connections if viewing someone else's profile
      let connectionsWithStatus = connections;
      if (userId && userId !== req.user.id) {
        connectionsWithStatus = await Promise.all(
          connections.map(async (connection) => {
            const user = connection[populateField];
            const isMutual = await Follow.findOne({
              follower: req.user.id,
              following: user._id
            });

            return {
              ...connection.toObject(),
              [populateField]: {
                ...user.toObject(),
                isMutualConnection: !!isMutual
              }
            };
          })
        );
      }

      res.json({
        success: true,
        data: connectionsWithStatus,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        },
        meta: {
          type,
          userId: targetUserId
        }
      });
    } catch (error) {
      console.error('Error fetching connections:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get suggested friends based on mutual connections and interests
   */
  async getSuggestedFriends(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const currentUserId = req.user.id;

      // Get current user's following list
      const currentUserFollowing = await Follow.find({ follower: currentUserId }).select('following');
      const followingIds = currentUserFollowing.map(f => f.following.toString());
      followingIds.push(currentUserId); // Exclude self

      // Get users who are followed by people the current user follows (mutual connections)
      const mutualConnectionSuggestions = await Follow.aggregate([
        { $match: { follower: { $in: followingIds.slice(0, -1) } } }, // Exclude self from this query
        { $group: { _id: '$following', mutualCount: { $sum: 1 } } },
        { $match: { _id: { $nin: followingIds.map(id => new mongoose.Types.ObjectId(id)) } } },
        { $sort: { mutualCount: -1 } },
        { $limit: limit * 2 } // Get more to account for filtering
      ]);

      const suggestedUserIds = mutualConnectionSuggestions.map(s => s._id);

      // Get user details and additional suggestions based on interests
      const currentUser = await User.findById(currentUserId).select('preferences.interests');
      const userInterests = currentUser?.preferences?.interests || [];

      let interestBasedQuery = {};
      if (userInterests.length > 0) {
        interestBasedQuery = {
          'preferences.interests': { $in: userInterests },
          _id: { $nin: followingIds.map(id => new mongoose.Types.ObjectId(id)) },
          role: 'visitor',
          isActive: true
        };
      }

      const [mutualUsers, interestUsers] = await Promise.all([
        User.find({ _id: { $in: suggestedUserIds } })
          .select('name profileImage bio preferences lastActivity')
          .limit(Math.ceil(limit / 2)),
        userInterests.length > 0 
          ? User.find(interestBasedQuery)
              .select('name profileImage bio preferences lastActivity')
              .limit(Math.ceil(limit / 2))
          : []
      ]);

      // Combine suggestions and add metadata
      const allSuggestions = [...mutualUsers, ...interestUsers];
      const uniqueSuggestions = allSuggestions.filter((user, index, self) => 
        index === self.findIndex(u => u._id.toString() === user._id.toString())
      ).slice(0, limit);

      // Add suggestion reasons and mutual connection count
      const suggestionsWithMeta = await Promise.all(
        uniqueSuggestions.map(async (user) => {
          const mutualConnections = await Follow.find({
            follower: { $in: followingIds.slice(0, -1) },
            following: user._id
          }).populate('follower', 'name profileImage');

          const commonInterests = userInterests.filter(interest => 
            user.preferences?.interests?.includes(interest)
          );

          let suggestionReason = [];
          if (mutualConnections.length > 0) {
            suggestionReason.push(`${mutualConnections.length} mutual connection${mutualConnections.length > 1 ? 's' : ''}`);
          }
          if (commonInterests.length > 0) {
            suggestionReason.push(`${commonInterests.length} shared interest${commonInterests.length > 1 ? 's' : ''}`);
          }

          return {
            ...user.toObject(),
            suggestionMeta: {
              mutualConnections: mutualConnections.map(mc => ({
                id: mc.follower._id,
                name: mc.follower.name,
                profileImage: mc.follower.profileImage
              })),
              commonInterests,
              reason: suggestionReason.join(' • ') || 'Active user'
            }
          };
        })
      );

      res.json({
        success: true,
        data: suggestionsWithMeta,
        pagination: {
          current: page,
          hasMore: suggestionsWithMeta.length === limit,
          total: suggestionsWithMeta.length
        }
      });
    } catch (error) {
      console.error('Error getting suggested friends:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get user profile with social stats
   */
  async getUserProfile(req, res) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;

      const user = await User.findById(userId)
        .select('name email profileImage bio preferences profile createdAt lastActivity');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get social stats
      const [followerCount, followingCount, isFollowing, isFollowedBy] = await Promise.all([
        Follow.countDocuments({ following: userId }),
        Follow.countDocuments({ follower: userId }),
        Follow.findOne({ follower: currentUserId, following: userId }),
        Follow.findOne({ follower: userId, following: currentUserId })
      ]);

      // Get mutual connections
      const userFollowing = await Follow.find({ follower: userId }).select('following');
      const currentUserFollowing = await Follow.find({ follower: currentUserId }).select('following');
      
      const userFollowingIds = userFollowing.map(f => f.following.toString());
      const currentUserFollowingIds = currentUserFollowing.map(f => f.following.toString());
      const mutualConnectionIds = userFollowingIds.filter(id => currentUserFollowingIds.includes(id));
      
      const mutualConnections = await User.find({ _id: { $in: mutualConnectionIds } })
        .select('name profileImage')
        .limit(5);

      // Get recent activity
      const recentActivity = await Activity.find({ 
        user: userId, 
        isPublic: true 
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('type entityName createdAt');

      // Get posts count
      const postsCount = await Post.countDocuments({ author: userId, status: 'active' });

      res.json({
        success: true,
        data: {
          ...user.toObject(),
          socialStats: {
            followerCount,
            followingCount,
            postsCount,
            mutualConnectionsCount: mutualConnections.length
          },
          relationshipStatus: {
            isFollowing: !!isFollowing,
            isFollowedBy: !!isFollowedBy,
            isMutual: !!isFollowing && !!isFollowedBy
          },
          mutualConnections,
          recentActivity,
          isOwnProfile: userId === currentUserId
        }
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Community Statistics
  async getCommunityStats(req, res) {
    try {
      const today = new Date();
      const oneDayAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get current stats
      const totalPosts = await Post.countDocuments({ status: 'active' });
      const totalComments = await Post.aggregate([
        { $match: { status: 'active' } },
        { $project: { commentsCount: { $size: '$comments' } } },
        { $group: { _id: null, total: { $sum: '$commentsCount' } } }
      ]);

      const totalUsers = await User.countDocuments({ role: 'user' });
      const activeUsersToday = await Activity.distinct('user', {
        createdAt: { $gte: oneDayAgo }
      });

      const totalGroups = await StudyGroup.countDocuments({ status: 'active' });
      const activeGroups = await StudyGroup.countDocuments({ 
        status: 'active',
        'members.1': { $exists: true } // Groups with at least 2 members
      });

      res.json({
        success: true,
        data: {
          totalMembers: totalUsers,
          activeDiscussions: totalPosts,
          studyGroups: totalGroups,
          onlineUsers: activeUsersToday.length,
          totalPosts,
          totalComments: totalComments[0]?.total || 0,
          activeGroups
        }
      });
    } catch (error) {
      console.error('Error fetching community stats:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // ========== ENHANCED POSTS SYSTEM ==========
  
  /**
   * Get all community posts with pagination and filters
   */
  async getPosts(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        sortBy = 'recent',
        search,
        tags,
        author
      } = req.query;

      const query = { status: 'active' };
      
      if (category && category !== 'all') {
        query.category = category;
      }
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : tags.split(',');
        query.tags = { $in: tagArray };
      }
      
      if (author) {
        query.author = author;
      }

      let sortOptions = {};
      switch (sortBy) {
        case 'popular':
          sortOptions = { views: -1, createdAt: -1 };
          break;
        case 'trending':
          sortOptions = { updatedAt: -1, views: -1 };
          break;
        case 'recent':
        default:
          sortOptions = { createdAt: -1 };
          break;
      }

      const posts = await Post.find(query)
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('author', 'name email avatar role')
        .populate('comments.user', 'name avatar')
        .populate('likes.user', 'name avatar')
        .exec();

      const total = await Post.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          posts: posts.map(post => ({
            ...post.toObject(),
            likesCount: post.likes.length,
            commentsCount: post.comments.length,
            isLiked: req.user ? post.likes.some(like => like.user.toString() === req.user.id) : false
          })),
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch posts'
      });
    }
  }

  /**
   * Create a new community post
   */
  async createPost(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { title, content, category, tags } = req.body;
      const userId = req.user.id;

      const post = new Post({
        title,
        content,
        category: category || 'general',
        tags: tags || [],
        author: userId
      });

      await post.save();
      await post.populate('author', 'name email avatar role');

      // Create activity entry
      await new Activity({
        user: userId,
        type: 'post_created',
        entityType: 'post',
        entityId: post._id,
        entityName: post.title,
        metadata: { category: post.category }
      }).save();

      // Emit real-time event if socket.io is available
      if (req.io) {
        req.io.emit('new_post', {
          post: post.toObject(),
          author: post.author
        });
      }

      res.status(201).json({
        success: true,
        data: post,
        message: 'Post created successfully'
      });
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create post'
      });
    }
  }

  /**
   * Toggle like on a community post
   */
  async toggleLikePost(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          error: 'Post not found'
        });
      }

      const existingLikeIndex = post.likes.findIndex(
        like => like.user.toString() === userId
      );

      let isLiked;
      if (existingLikeIndex > -1) {
        post.likes.splice(existingLikeIndex, 1);
        isLiked = false;
      } else {
        post.likes.push({ user: userId, createdAt: new Date() });
        isLiked = true;

        await new Activity({
          user: userId,
          type: 'post_liked',
          entityType: 'post',
          entityId: post._id,
          entityName: post.title
        }).save();
      }

      await post.save();

      if (req.io) {
        req.io.emit('post_liked', {
          postId: id,
          userId,
          isLiked,
          likesCount: post.likes.length
        });
      }

      res.status(200).json({
        success: true,
        data: {
          isLiked,
          likesCount: post.likes.length
        },
        message: isLiked ? 'Post liked' : 'Post unliked'
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to toggle like'
      });
    }
  }

  /**
   * Add comment to a community post
   */
  async addComment(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Comment content is required'
        });
      }

      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          error: 'Post not found'
        });
      }

      const newComment = {
        user: userId,
        content: content.trim(),
        createdAt: new Date()
      };

      post.comments.push(newComment);
      await post.save();

      await post.populate('comments.user', 'name avatar');
      const addedComment = post.comments[post.comments.length - 1];

      await new Activity({
        user: userId,
        type: 'comment_added',
        entityType: 'post',
        entityId: post._id,
        entityName: post.title
      }).save();

      if (req.io) {
        req.io.emit('new_comment', {
          postId: id,
          comment: addedComment,
          commentsCount: post.comments.length
        });
      }

      res.status(201).json({
        success: true,
        data: addedComment,
        message: 'Comment added successfully'
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add comment'
      });
    }
  }

  // ========== SOCIAL FEATURES ==========

  /**
   * Follow/Unfollow a user
   */
  async toggleFollow(req, res) {
    try {
      const { userId } = req.params;
      const followerId = req.user.id;

      if (userId === followerId) {
        return res.status(400).json({
          success: false,
          error: 'Cannot follow yourself'
        });
      }

      const userToFollow = await User.findById(userId);
      if (!userToFollow) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const existingFollow = await Follow.findOne({
        follower: followerId,
        following: userId
      });

      let isFollowing;
      if (existingFollow) {
        await Follow.findByIdAndDelete(existingFollow._id);
        isFollowing = false;
      } else {
        await new Follow({
          follower: followerId,
          following: userId
        }).save();
        isFollowing = true;

        await new Activity({
          user: followerId,
          type: 'user_followed',
          entityType: 'user',
          entityId: userId,
          entityName: userToFollow.name
        }).save();
      }

      const followerCount = await Follow.countDocuments({ following: userId });
      const followingCount = await Follow.countDocuments({ follower: userId });

      res.status(200).json({
        success: true,
        data: {
          isFollowing,
          followerCount,
          followingCount
        },
        message: isFollowing ? 'User followed' : 'User unfollowed'
      });
    } catch (error) {
      console.error('Error toggling follow:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to toggle follow'
      });
    }
  }

  /**
   * Get activity feed
   */
  async getActivityFeed(req, res) {
    try {
      const { page = 1, limit = 20, userId } = req.query;
      const currentUserId = req.user.id;

      let query = { isPublic: true };
      
      if (userId) {
        query.user = userId;
      } else {
        const following = await Follow.find({ follower: currentUserId }).select('following');
        const followingIds = following.map(f => f.following);
        followingIds.push(currentUserId);
        
        query.user = { $in: followingIds };
      }

      const activities = await Activity.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('user', 'name avatar')
        .exec();

      const total = await Activity.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          activities,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch activity feed'
      });
    }
  }
}

module.exports = new CommunityController();
