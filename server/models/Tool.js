import mongoose from 'mongoose';

const tourSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  region: String,
  duration: String,
  price: Number,
  maxGuests: Number,
  images: [String],
  difficulty: String,
  category: String,
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

export default mongoose.model('Tour', tourSchema);
