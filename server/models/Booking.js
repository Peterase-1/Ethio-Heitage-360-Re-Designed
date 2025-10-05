import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  tourPackageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
  customerName: String,
  customerEmail: String,
  guests: Number,
  tourDate: Date,
  status: { type: String, default: 'pending' },
  totalAmount: Number,
  specialRequests: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Booking', bookingSchema);
