const mongoose = require('mongoose');

const tourPackageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tour title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Tour description is required'],
    maxLength: [1000, 'Description cannot exceed 1000 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    maxLength: [100, 'Location cannot exceed 100 characters']
  },
  region: {
    type: String,
    required: [true, 'Region is required'],
    enum: ['Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Dire Dawa', 'Gambela', 'Harari', 'Oromia', 'SNNPR', 'Somali', 'Tigray']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  maxGuests: {
    type: Number,
    required: [true, 'Maximum guests is required'],
    min: [1, 'Maximum guests must be at least 1'],
    max: [50, 'Maximum guests cannot exceed 50']
  },
  images: {
    type: [String],
    default: []
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: ['easy', 'moderate', 'hard']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Religious & Historical',
      'Adventure & Nature',
      'Cultural & Tribal',
      'Historical & Nature',
      'Cultural',
      'Nature & Wildlife',
      'Urban & Modern',
      'Photography',
      'Spiritual'
    ]
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer ID is required']
  },
  // Additional tour details
  inclusions: {
    type: [String],
    default: []
  },
  exclusions: {
    type: [String],
    default: []
  },
  requirements: {
    type: [String],
    default: []
  },
  itinerary: [{
    day: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    activities: [String]
  }],
  // SEO and search optimization
  tags: {
    type: [String],
    default: []
  },
  featured: {
    type: Boolean,
    default: false
  },
  // Statistics
  stats: {
    views: {
      type: Number,
      default: 0
    },
    bookings: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
tourPackageSchema.index({ organizerId: 1 });
tourPackageSchema.index({ status: 1 });
tourPackageSchema.index({ category: 1 });
tourPackageSchema.index({ region: 1 });
tourPackageSchema.index({ featured: 1 });
tourPackageSchema.index({ price: 1 });
tourPackageSchema.index({ createdAt: -1 });

// Text index for search
tourPackageSchema.index({
  title: 'text',
  description: 'text',
  location: 'text',
  tags: 'text'
});

// Virtual for average price per person
tourPackageSchema.virtual('pricePerPerson').get(function() {
  return this.price;
});

// Virtual for duration in days
tourPackageSchema.virtual('durationInDays').get(function() {
  const match = this.duration.match(/\d+/);
  return match ? parseInt(match[0]) : 1;
});

// Static method to find active tours
tourPackageSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

// Static method to find by organizer
tourPackageSchema.statics.findByOrganizer = function(organizerId) {
  return this.find({ organizerId, status: { $ne: 'draft' } });
};

// Static method to find featured tours
tourPackageSchema.statics.findFeatured = function() {
  return this.find({ status: 'active', featured: true });
};

// Instance method to increment views
tourPackageSchema.methods.incrementViews = async function() {
  this.stats.views += 1;
  return await this.save();
};

// Instance method to increment bookings
tourPackageSchema.methods.incrementBookings = async function() {
  this.stats.bookings += 1;
  return await this.save();
};

// Instance method to update rating
tourPackageSchema.methods.updateRating = async function(rating) {
  const currentTotal = this.stats.rating * this.stats.reviewCount;
  const newTotal = currentTotal + rating;
  this.stats.reviewCount += 1;
  this.stats.rating = newTotal / this.stats.reviewCount;
  return await this.save();
};

module.exports = mongoose.model('TourPackage', tourPackageSchema);
