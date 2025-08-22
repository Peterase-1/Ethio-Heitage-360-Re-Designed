
const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tour title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer is required']
  },
  type: {
    type: String,
    enum: ['cultural', 'historical', 'archaeological', 'religious', 'adventure', 'educational'],
    required: true
  },
  duration: {
    days: {
      type: Number,
      required: true,
      min: 1
    },
    hours: {
      type: Number,
      min: 0,
      max: 23
    }
  },
  groupSize: {
    min: {
      type: Number,
      required: true,
      min: 1
    },
    max: {
      type: Number,
      required: true,
      min: 1
    }
  },
  pricing: {
    adult: {
      type: Number,
      required: true,
      min: 0
    },
    child: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'ETB'
    }
  },
  schedule: [{
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    availableSpots: {
      type: Number,
      required: true
    },
    bookedSpots: {
      type: Number,
      default: 0
    }
  }],
  media: {
    images: [{
      url: String,
      caption: String,
      isPrimary: { type: Boolean, default: false }
    }]
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'suspended', 'archived'],
    default: 'draft'
  },
  totalBookings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
tourSchema.index({ title: 'text', description: 'text' });
tourSchema.index({ organizer: 1, status: 1 });
tourSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('Tour', tourSchema);

