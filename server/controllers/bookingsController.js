const Booking = require('../models/Booking');
const TourPackage = require('../models/TourPackage');
const User = require('../models/User');
const mongoose = require('mongoose');

// Create new booking
exports.createBooking = async (req, res) => {
  try {
    const {
      tourPackageId,
      customerName,
      customerEmail,
      customerPhone,
      guests,
      tourDate,
      specialRequests,
      guestDetails,
      organizerId
    } = req.body;

    // Validate tour package exists
    const tourPackage = await TourPackage.findById(tourPackageId);
    if (!tourPackage) {
      return res.status(404).json({
        success: false,
        message: 'Tour package not found'
      });
    }

const Booking = require('../models/Booking');
const TourPackage = require('../models/TourPackage');
const User = require('../models/User');
const mongoose = require('mongoose');

// Create new booking
exports.createBooking = async (req, res) => {
  try {
    const {
      tourPackageId,
      customerName,
      customerEmail,
      customerPhone,
      guests,
      tourDate,
      specialRequests,
      guestDetails,
      organizerId
    } = req.body;

    // Validate tour package exists
    const tourPackage = await TourPackage.findById(tourPackageId);
    if (!tourPackage) {
      return res.status(404).json({
        success: false,
        message: 'Tour package not found'
      });
    }

    // Calculate total amount
    const totalAmount = tourPackage.price * guests;

    // Create booking
    const bookingData = {
      tourPackageId,
      customerId: req.user ? req.user._id : null,
      customerName,
      customerEmail,
      customerPhone,
      guests,
      tourDate: new Date(tourDate),
      totalAmount,
      specialRequests,
      guestDetails: guestDetails || [],
      organizerId: organizerId || tourPackage.organizerId
    };

    const booking = new Booking(bookingData);
    await booking.save();

    await booking.populate([
      { path: 'tourPackageId', select: 'title location duration price' },
      { path: 'organizerId', select: 'name email phone' },
      { path: 'customerId', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

// Get all bookings with filters
exports.getAllBookings = async (req, res) => {
  try {
    const {
      status,
      organizerId,
      customerId,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (organizerId) filter.organizerId = organizerId;
    if (customerId) filter.customerId = customerId;

    // Role-based access control
    if (req.user) {
      if (req.user.role === 'organizer') {
        filter.organizerId = req.user._id;
      } else if (req.user.role === 'visitor') {
        filter.customerId = req.user._id;
      }
    }

    const skip = (page - 1) * limit;
    
    const bookings = await Booking.find(filter)
      .populate('tourPackageId', 'title location duration price')
      .populate('organizerId', 'name email phone')
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: bookings.length,
        totalRecords: total
      }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// Confirm booking
exports.confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be confirmed'
      });
    }

    await booking.confirm();
    if (notes) {
      booking.notes = notes;
      await booking.save();
    }

    await booking.populate([
      { path: 'tourPackageId', select: 'title location duration price' },
      { path: 'organizerId', select: 'name email phone' }
    ]);

    res.json({
      success: true,
      message: 'Booking confirmed successfully',
      data: booking
    });

  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm booking',
      error: error.message
    });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    let cancelledBy = 'admin';
    if (req.user) {
      if (booking.organizerId.equals(req.user._id)) {
        cancelledBy = 'organizer';
      } else if (booking.customerId?.equals(req.user._id)) {
        cancelledBy = 'customer';
      }
    }

    await booking.cancel(reason || 'No reason provided', cancelledBy);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
};

// Process payment
exports.processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, method, transactionId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment amount is required'
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    await booking.processPayment(amount, method, transactionId);

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: booking
    });

  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error.message
    });
  }
};

    // Check if tour date is available
    const existingBooking = await Booking.findOne({
      tourPackageId,
      tourDate: new Date(tourDate),
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking && (existingBooking.guests + guests) > tourPackage.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Not enough available spots for this tour date'
      });
    }

    // Calculate total amount
    const totalAmount = tourPackage.price * guests;

    // Create booking
    const bookingData = {
      tourPackageId,
      customerId: req.user ? req.user._id : null,
      customerName,
      customerEmail,
      customerPhone,
      guests,
      tourDate: new Date(tourDate),
      totalAmount,
      specialRequests,
      guestDetails: guestDetails || [],
      organizerId: organizerId || tourPackage.organizerId
    };

    const booking = new Booking(bookingData);
    await booking.save();

    // Populate references for response
    await booking.populate([
      { path: 'tourPackageId', select: 'title location duration price' },
      { path: 'organizerId', select: 'name email phone' },
      { path: 'customerId', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

// Get all bookings with filters
exports.getAllBookings = async (req, res) => {
  try {
    const {
      status,
      organizerId,
      customerId,
      tourPackageId,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (organizerId) filter.organizerId = organizerId;
    if (customerId) filter.customerId = customerId;
    if (tourPackageId) filter.tourPackageId = tourPackageId;

    // Date range filter
    if (startDate || endDate) {
      filter.tourDate = {};
      if (startDate) filter.tourDate.$gte = new Date(startDate);
      if (endDate) filter.tourDate.$lte = new Date(endDate);
    }

    // Role-based access control
    if (req.user) {
      if (req.user.role === 'organizer') {
        filter.organizerId = req.user._id;
      } else if (req.user.role === 'visitor') {
        filter.customerId = req.user._id;
      }
      // Admin and super_admin can see all bookings
    }

    const skip = (page - 1) * limit;
    
    const bookings = await Booking.find(filter)
      .populate('tourPackageId', 'title location duration price images')
      .populate('organizerId', 'name email phone')
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: bookings.length,
        totalRecords: total
      }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const booking = await Booking.findById(id)
      .populate('tourPackageId')
      .populate('organizerId', 'name email phone')
      .populate('customerId', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check access permissions
    if (req.user && !['admin', 'super_admin'].includes(req.user.role)) {
      if (req.user.role === 'organizer' && !booking.organizerId.equals(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      if (req.user.role === 'visitor' && !booking.customerId?.equals(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

// Update booking
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions
    if (req.user && !['admin', 'super_admin'].includes(req.user.role)) {
      if (req.user.role === 'organizer' && !booking.organizerId.equals(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      if (req.user.role === 'visitor' && !booking.customerId?.equals(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Prevent updating certain fields based on status
    if (booking.status === 'completed' && !['admin', 'super_admin'].includes(req.user?.role)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify completed booking'
      });
    }

    // Update booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate([
      { path: 'tourPackageId', select: 'title location duration price' },
      { path: 'organizerId', select: 'name email phone' },
      { path: 'customerId', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking
    });

  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking',
      error: error.message
    });
  }
};

// Confirm booking
exports.confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions (only organizer or admin can confirm)
    if (req.user && !['admin', 'super_admin'].includes(req.user.role)) {
      if (req.user.role !== 'organizer' || !booking.organizerId.equals(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Only the tour organizer or admin can confirm bookings'
        });
      }
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be confirmed'
      });
    }

    // Confirm booking
    await booking.confirm();
    if (notes) {
      booking.notes = notes;
      await booking.save();
    }

    await booking.populate([
      { path: 'tourPackageId', select: 'title location duration price' },
      { path: 'organizerId', select: 'name email phone' },
      { path: 'customerId', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Booking confirmed successfully',
      data: booking
    });

  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm booking',
      error: error.message
    });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Determine who is cancelling
    let cancelledBy = 'admin';
    if (req.user) {
      if (booking.organizerId.equals(req.user._id)) {
        cancelledBy = 'organizer';
      } else if (booking.customerId?.equals(req.user._id)) {
        cancelledBy = 'customer';
      }
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    // Cancel booking
    await booking.cancel(reason || 'No reason provided', cancelledBy);

    await booking.populate([
      { path: 'tourPackageId', select: 'title location duration price' },
      { path: 'organizerId', select: 'name email phone' },
      { path: 'customerId', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
};

// Complete booking
exports.completeBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions (only organizer or admin can complete)
    if (req.user && !['admin', 'super_admin'].includes(req.user.role)) {
      if (req.user.role !== 'organizer' || !booking.organizerId.equals(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Only the tour organizer or admin can complete bookings'
        });
      }
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed bookings can be completed'
      });
    }

    // Complete booking
    await booking.complete();

    await booking.populate([
      { path: 'tourPackageId', select: 'title location duration price' },
      { path: 'organizerId', select: 'name email phone' },
      { path: 'customerId', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Booking completed successfully',
      data: booking
    });

  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete booking',
      error: error.message
    });
  }
};

// Process payment
exports.processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, method, transactionId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment amount is required'
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot process payment for cancelled booking'
      });
    }

    // Process payment
    await booking.processPayment(amount, method, transactionId);

    await booking.populate([
      { path: 'tourPackageId', select: 'title location duration price' },
      { path: 'organizerId', select: 'name email phone' },
      { path: 'customerId', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: booking
    });

  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error.message
    });
  }
};

// Add review to booking
exports.addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is the customer who made the booking
    if (req.user && !booking.customerId?.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the booking customer can add a review'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      });
    }

    if (booking.review && booking.review.rating) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this booking'
      });
    }

    // Add review
    await booking.addReview(rating, comment);

    await booking.populate([
      { path: 'tourPackageId', select: 'title location duration price' },
      { path: 'organizerId', select: 'name email phone' },
      { path: 'customerId', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Review added successfully',
      data: booking
    });

  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review',
      error: error.message
    });
  }
};

// Get booking statistics
exports.getBookingStats = async (req, res) => {
  try {
    const { organizerId, startDate, endDate } = req.query;

    // Build match criteria
    const matchCriteria = {};
    if (organizerId) matchCriteria.organizerId = new mongoose.Types.ObjectId(organizerId);
    if (req.user?.role === 'organizer') {
      matchCriteria.organizerId = new mongoose.Types.ObjectId(req.user._id);
    }

    // Date range filter
    if (startDate || endDate) {
      matchCriteria.createdAt = {};
      if (startDate) matchCriteria.createdAt.$gte = new Date(startDate);
      if (endDate) matchCriteria.createdAt.$lte = new Date(endDate);
    }

    const stats = await Booking.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          pendingBookings: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          confirmedBookings: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
          completedBookings: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelledBookings: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          totalRevenue: { $sum: '$totalAmount' },
          totalGuests: { $sum: '$guests' },
          averageBookingValue: { $avg: '$totalAmount' },
          averageGuests: { $avg: '$guests' }
        }
      }
    ]);

    const result = stats[0] || {
      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      totalRevenue: 0,
      totalGuests: 0,
      averageBookingValue: 0,
      averageGuests: 0
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking statistics',
      error: error.message
    });
  }
};

// Get upcoming bookings
exports.getUpcomingBookings = async (req, res) => {
  try {
    const { days = 30, organizerId } = req.query;
    
    let queryOrganizerId = organizerId;
    if (req.user?.role === 'organizer') {
      queryOrganizerId = req.user._id;
    }

    const upcomingBookings = await Booking.findUpcoming(queryOrganizerId, parseInt(days));

    res.json({
      success: true,
      data: upcomingBookings,
      count: upcomingBookings.length
    });

  } catch (error) {
    console.error('Get upcoming bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming bookings',
      error: error.message
    });
  }
};

// Delete booking (admin only)
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Only admin and super_admin can delete bookings
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });

  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking',
      error: error.message
    });
  }
};
