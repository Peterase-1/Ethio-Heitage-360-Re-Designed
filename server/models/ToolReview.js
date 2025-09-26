const mongoose = require('mongoose');

const toolReviewSchema = new mongoose.Schema({
  toolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tool',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 1000,
    trim: true
  },
  recommend: {
    type: Boolean,
    default: true
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  helpfulVotes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    helpful: Boolean, // true for helpful, false for not helpful
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  verified: {
    type: Boolean,
    default: false // Set to true if user actually used the tool
  },
  response: {
    message: {
      type: String,
      maxlength: 500
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  flagged: {
    type: Boolean,
    default: false
  },
  flagReason: {
    type: String,
    enum: ['spam', 'inappropriate', 'fake', 'offensive', 'other'],
    required: false
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound indexes
toolReviewSchema.index({ toolId: 1, userId: 1 }, { unique: true }); // One review per user per tool
toolReviewSchema.index({ toolId: 1, rating: -1 });
toolReviewSchema.index({ toolId: 1, createdAt: -1 });
toolReviewSchema.index({ userId: 1, createdAt: -1 });

// Static method to get review statistics for a tool
toolReviewSchema.statics.getToolReviewStats = function(toolId) {
  return this.aggregate([
    { $match: { toolId: new mongoose.Types.ObjectId(toolId), isActive: true } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        },
        recommendCount: {
          $sum: { $cond: ['$recommend', 1, 0] }
        }
      }
    },
    {
      $project: {
        totalReviews: 1,
        averageRating: { $round: ['$averageRating', 1] },
        recommendationRate: {
          $round: [
            { $multiply: [{ $divide: ['$recommendCount', '$totalReviews'] }, 100] },
            1
          ]
        },
        ratingDistribution: {
          $arrayToObject: {
            $map: {
              input: [1, 2, 3, 4, 5],
              as: 'rating',
              in: {
                k: { $toString: '$$rating' },
                v: {
                  $size: {
                    $filter: {
                      input: '$ratingDistribution',
                      cond: { $eq: ['$$this', '$$rating'] }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  ]);
};

// Static method to get recent reviews for a tool
toolReviewSchema.statics.getRecentReviews = function(toolId, limit = 10) {
  return this.find({ toolId: toolId, isActive: true })
    .populate('userId', 'firstName lastName profileImage')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Static method to get user's review for a tool
toolReviewSchema.statics.getUserReview = function(toolId, userId) {
  return this.findOne({ toolId: toolId, userId: userId, isActive: true })
    .populate('response.respondedBy', 'firstName lastName')
    .lean();
};

// Instance method to vote helpful/not helpful
toolReviewSchema.methods.addHelpfulVote = function(userId, helpful) {
  // Remove existing vote from this user
  this.helpfulVotes = this.helpfulVotes.filter(vote => 
    vote.userId.toString() !== userId.toString()
  );
  
  // Add new vote
  this.helpfulVotes.push({
    userId: userId,
    helpful: helpful,
    votedAt: new Date()
  });
  
  // Update helpful count
  this.helpfulCount = this.helpfulVotes.filter(vote => vote.helpful).length;
  
  return this.save();
};

// Instance method to add response from tool creator/admin
toolReviewSchema.methods.addResponse = function(responderId, message) {
  this.response = {
    message: message,
    respondedBy: responderId,
    respondedAt: new Date()
  };
  
  return this.save();
};

// Instance method to flag review
toolReviewSchema.methods.flag = function(reason) {
  this.flagged = true;
  this.flagReason = reason;
  
  return this.save();
};

// Instance method to moderate review
toolReviewSchema.methods.moderate = function(moderatorId, approved) {
  this.isActive = approved;
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  
  if (!approved) {
    this.flagged = true;
  }
  
  return this.save();
};

// Pre-save middleware to update tool's average rating
toolReviewSchema.post('save', async function(doc) {
  try {
    const Tool = mongoose.model('Tool');
    const tool = await Tool.findById(doc.toolId);
    if (tool) {
      await tool.updateAverageRating();
    }
  } catch (error) {
    console.error('Error updating tool average rating:', error);
  }
});

// Pre-remove middleware to update tool's average rating when review is deleted
toolReviewSchema.post('remove', async function(doc) {
  try {
    const Tool = mongoose.model('Tool');
    const tool = await Tool.findById(doc.toolId);
    if (tool) {
      await tool.updateAverageRating();
    }
  } catch (error) {
    console.error('Error updating tool average rating after deletion:', error);
  }
});

// Virtual for helpful percentage
toolReviewSchema.virtual('helpfulPercentage').get(function() {
  if (this.helpfulVotes.length === 0) return 0;
  return Math.round((this.helpfulCount / this.helpfulVotes.length) * 100);
});

// Virtual for formatted rating display
toolReviewSchema.virtual('ratingDisplay').get(function() {
  return '★'.repeat(this.rating) + '☆'.repeat(5 - this.rating);
});

// Transform function for JSON output
toolReviewSchema.methods.toJSON = function() {
  const obj = this.toObject();
  obj.helpfulPercentage = this.helpfulPercentage;
  obj.ratingDisplay = this.ratingDisplay;
  return obj;
};

module.exports = mongoose.model('ToolReview', toolReviewSchema);
