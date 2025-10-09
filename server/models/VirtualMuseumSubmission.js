const mongoose = require('mongoose');

const virtualMuseumSubmissionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Exhibition title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  type: {
    type: String,
    required: [true, 'Exhibition type is required'],
    enum: ['Exhibition', '3D Experience', 'Gallery', 'Digital Archive', 'Interactive Tour'],
    default: 'Exhibition'
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  artifacts: [{
    artifactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artifact',
      required: true
    },
    artifactName: {
      type: String,
      required: true,
      trim: true
    },
    accessionNumber: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    media: {
      images: [{
        url: String,
        caption: String,
        isPrimary: Boolean
      }],
      videos: [{
        url: String,
        caption: String,
        duration: Number
      }],
      documents: [{
        url: String,
        title: String,
        type: String
      }]
    }
  }],
  layout: {
    type: String,
    enum: ['grid', 'timeline', 'story', '3d_gallery'],
    default: 'grid'
  },
  accessibility: {
    audioDescriptions: {
      type: Boolean,
      default: false
    },
    subtitles: {
      type: Boolean,
      default: false
    },
    highContrast: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'resubmitted'],
    default: 'pending'
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  museumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Museum',
    required: true
  },
  museumName: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  source: {
    type: String,
    enum: ['manual', 'rental_approval', 'import'],
    default: 'manual'
  },
  rentalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rental'
  },
  review: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    feedback: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  metrics: {
    views: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      min: 1,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    lastViewed: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  featured: {
    type: Boolean,
    default: false
  },
  published: {
    type: Boolean,
    default: false
  },
  publishedAt: Date
}, {
  timestamps: true
});

// Indexes for better performance
virtualMuseumSubmissionSchema.index({ title: 'text', description: 'text' });
virtualMuseumSubmissionSchema.index({ status: 1, submissionDate: -1 });
virtualMuseumSubmissionSchema.index({ museumId: 1, status: 1 });
virtualMuseumSubmissionSchema.index({ createdBy: 1 });
virtualMuseumSubmissionSchema.index({ 'artifacts.artifactId': 1 });
virtualMuseumSubmissionSchema.index({ source: 1, rentalId: 1 });

// Virtual for artifact count
virtualMuseumSubmissionSchema.virtual('artifactCount').get(function () {
  return this.artifacts.length;
});

// Method to add artifact
virtualMuseumSubmissionSchema.methods.addArtifact = function (artifactData) {
  this.artifacts.push(artifactData);
  return this.save();
};

// Method to remove artifact
virtualMuseumSubmissionSchema.methods.removeArtifact = function (artifactId) {
  this.artifacts = this.artifacts.filter(artifact =>
    artifact.artifactId.toString() !== artifactId.toString()
  );
  return this.save();
};

// Static method to get approved submissions
virtualMuseumSubmissionSchema.statics.getApprovedSubmissions = function () {
  return this.find({ status: 'approved' })
    .populate('artifacts.artifactId', 'name accessionNumber media category description')
    .populate('museumId', 'name')
    .populate('createdBy', 'name email')
    .sort({ submissionDate: -1 });
};

// Static method to get submissions by museum
virtualMuseumSubmissionSchema.statics.getByMuseum = function (museumId) {
  return this.find({ museumId })
    .populate('artifacts.artifactId', 'name accessionNumber media category description')
    .populate('createdBy', 'name email')
    .sort({ submissionDate: -1 });
};

// Static method to get rental-based submissions
virtualMuseumSubmissionSchema.statics.getRentalSubmissions = function () {
  return this.find({ source: 'rental_approval' })
    .populate('artifacts.artifactId', 'name accessionNumber media category description')
    .populate('rentalId', 'status startDate endDate')
    .populate('museumId', 'name')
    .populate('createdBy', 'name email')
    .sort({ submissionDate: -1 });
};

module.exports = mongoose.model('VirtualMuseumSubmission', virtualMuseumSubmissionSchema);