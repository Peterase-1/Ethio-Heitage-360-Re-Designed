const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: { type: [Number], index: '2dsphere' },
    address: String,
    region: String,
    country: { type: String, default: 'Ethiopia' }
  },
  images: [{ url: String, caption: String }],
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Site', siteSchema);
