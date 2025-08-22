
const mongoose = require('mongoose');

const artifactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Artifact name is required'],
    trim: true,
    maxlength: [200, 'Name cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'pottery',
      'jewelry',
      'tools',
      'weapons',
      'manuscripts',
      'coins',
      'textiles',
      'sculptures',
      'paintings',
      'religious-items',
      'household-items',
      'musical-instruments',
      'other'
    ]
  },
  period: {
    era: {
      type: String,
      enum: ['prehistoric', 'ancient', 'medieval', 'modern', 'contemporary'],
      required: true
    },
    startYear: {
      type: Number,
      validate: {
        validator: function(v) {
          return v <= new Date().getFullYear();
        },
        message: 'Start year cannot be in the future'
      }
    },
    endYear: {
      type: Number,
      validate: {
        validator: function(v) {
          return !v || v >= this.startYear;
        },
        message: 'End year must be after start year'
      }
    },
    dynasty: String,
    culturalPeriod: String
  },
  origin: {
    region: {
      type: String,
      required: [true, 'Origin region is required']
    },
    specificLocation: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      }
    },
    excavationSite: String,
    discoveryDate: Date,
    discoveredBy: String
  },
  museum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Museum is required']
  },
  accessionNumber: {
    type: String,
    required: [true, 'Accession number is required'],
    unique: true,
    trim: true
  },
  media: {
    images: [{
      url: String,
      caption: String,
      isPrimary: { type: Boolean, default: false },
      uploadedAt: { type: Date, default: Date.now }
    }],
    videos: [{
      url: String,
      title: String,
      description: String,
      duration: Number,
      uploadedAt: { type: Date, default: Date.now }
    }]
  },
  status: {
    type: String,
    enum: ['draft', 'pending-review', 'approved', 'published', 'archived'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'restricted', 'private'],
    default: 'public'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
artifactSchema.index({ name: 'text', description: 'text' });
artifactSchema.index({ category: 1, status: 1 });
artifactSchema.index({ museum: 1, status: 1 });

// Virtual for like count
artifactSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Instance method to increment views
artifactSchema.methods.incrementViews = function() {
  return this.updateOne({ $inc: { views: 1 } });
};

module.exports = mongoose.model('Artifact', artifactSchema);

