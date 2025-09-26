const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookingsController');
const { auth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { body, param, query } = require('express-validator');

// Legacy imports for backward compatibility
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const TourPackage = require('../models/TourPackage');
const Notification = require('../models/Notification');

// Get all bookings for an organizer
router.get('/organizer/:organizerId', auth, async (req, res) => {
  try {
    const { organizerId } = req.params;
    const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    let query = { organizerId };
    if (status) query.status = status;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const bookings = await Booking.find(query)
      .populate('tourPackageId', 'title location duration price')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
      
    const total = await Booking.countDocuments(query);
    
    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single booking
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('tourPackageId')
      .populate('customerId', 'name email')
      .populate('organizerId', 'name email');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user can access this booking
    if (booking.organizerId.toString() !== req.user.id && 
        booking.customerId?.toString() !== req.user.id && 
        req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'Unauthorized to access this booking' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new booking
router.post('/', async (req, res) => {
  try {
    // Get tour package to validate and get organizer
    const tourPackage = await TourPackage.findById(req.body.tourPackageId);
    if (!tourPackage) {
      return res.status(404).json({ message: 'Tour package not found' });
    }
    
    const bookingData = {
      ...req.body,
      organizerId: tourPackage.organizerId,
      totalAmount: tourPackage.price * req.body.guests
    };
    
    const booking = new Booking(bookingData);
    const savedBooking = await booking.save();
    
    // Update tour package booking count
    await tourPackage.incrementBookings();
    
    // Create notification for organizer
    const notification = new Notification({
      title: 'New Booking Request',
      message: `${req.body.customerName} requested to book "${tourPackage.title}" for ${req.body.guests} guests`,
      type: 'info',
      category: 'business_operations',
      recipients: [{ user: tourPackage.organizerId }],
      createdBy: tourPackage.organizerId,
      context: {
        source: 'booking_system',
        relatedEntity: 'booking',
        relatedEntityId: savedBooking._id
      }
    });
    await notification.save();
    
    res.status(201).json(savedBooking);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Update booking status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, reason } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('tourPackageId', 'title');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user owns this booking
    if (booking.organizerId.toString() !== req.user.id && req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'Unauthorized to update this booking' });
    }
    
    if (status === 'confirmed') {
      await booking.confirm();
    } else if (status === 'cancelled') {
      await booking.cancel(reason, 'organizer');
    } else if (status === 'completed') {
      await booking.complete();
    } else {
      booking.status = status;
      await booking.save();
    }
    
    // Create notification for customer if they have an account
    if (booking.customerId) {
      const notification = new Notification({
        title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your booking for "${booking.tourPackageId.title}" has been ${status}`,
        type: status === 'confirmed' ? 'success' : status === 'cancelled' ? 'warning' : 'info',
        category: 'business_operations',
        recipients: [{ user: booking.customerId }],
        createdBy: req.user.id,
        context: {
          source: 'booking_system',
          relatedEntity: 'booking',
          relatedEntityId: booking._id
        }
      });
      await notification.save();
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Process payment
router.patch('/:id/payment', auth, async (req, res) => {
  try {
    const { amount, method, transactionId } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user owns this booking
    if (booking.organizerId.toString() !== req.user.id && req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'Unauthorized to update this booking' });
    }
    
    await booking.processPayment(amount, method, transactionId);
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending bookings
router.get('/pending/:organizerId', auth, async (req, res) => {
  try {
    const { organizerId } = req.params;
    const bookings = await Booking.findPending(organizerId);
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get upcoming tours
router.get('/upcoming/:organizerId', auth, async (req, res) => {
  try {
    const { organizerId } = req.params;
    const { days = 30 } = req.query;
    
    const bookings = await Booking.findUpcoming(organizerId, parseInt(days));
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get booking statistics
router.get('/stats/:organizerId', auth, async (req, res) => {
  try {
    const { organizerId } = req.params;
    const { startDate, endDate } = req.query;
    
    let matchQuery = { organizerId: mongoose.Types.ObjectId(organizerId) };
    
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const stats = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          pendingBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalRevenue: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$payment.paidAmount' },
          averageBookingValue: { $avg: '$totalAmount' },
          totalGuests: { $sum: '$guests' }
        }
      }
    ]);
    
    // Get upcoming tours count
    const upcomingCount = await Booking.countDocuments({
      organizerId: mongoose.Types.ObjectId(organizerId),
      status: 'confirmed',
      tourDate: { $gte: new Date() }
    });
    
    const result = stats[0] || {
      totalBookings: 0,
      confirmedBookings: 0,
      pendingBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      totalRevenue: 0,
      paidAmount: 0,
      averageBookingValue: 0,
      totalGuests: 0
    };
    
    result.upcomingBookings = upcomingCount;
    result.pendingPayment = result.totalRevenue - result.paidAmount;
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add review to booking
router.patch('/:id/review', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('tourPackageId');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if customer can review (only if booking is completed)
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }
    
    if (booking.customerId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to review this booking' });
    }
    
    await booking.addReview(rating, comment);
    
    // Update tour package rating
    if (booking.tourPackageId) {
      await booking.tourPackageId.updateRating(rating);
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete booking
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user owns this booking
    if (booking.organizerId.toString() !== req.user.id && req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'Unauthorized to delete this booking' });
    }
    
    await Booking.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// New controller-based routes

// POST /api/bookings - Create booking using new controller
router.post('/v2', 
  [
    body('tourPackageId').isMongoId().withMessage('Valid tour package ID is required'),
    body('customerName').notEmpty().withMessage('Customer name is required'),
    body('customerEmail').isEmail().withMessage('Valid email is required'),
    body('guests').isInt({ min: 1 }).withMessage('Number of guests must be at least 1'),
    body('tourDate').isISO8601().withMessage('Valid tour date is required')
  ],
  validateRequest,
  bookingsController.createBooking
);

// GET /api/bookings/v2 - Get all bookings using new controller
router.get('/v2', 
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    query('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed', 'refunded'])
  ],
  validateRequest,
  bookingsController.getAllBookings
);

// GET /api/bookings/v2/:id - Get booking by ID using new controller  
router.get('/v2/:id',
  [param('id').isMongoId().withMessage('Valid booking ID is required')],
  validateRequest,
  auth,
  bookingsController.getBookingById
);

// PATCH /api/bookings/v2/:id/confirm - Confirm booking
router.patch('/v2/:id/confirm',
  [param('id').isMongoId().withMessage('Valid booking ID is required')],
  validateRequest,
  auth,
  bookingsController.confirmBooking
);

// PATCH /api/bookings/v2/:id/cancel - Cancel booking
router.patch('/v2/:id/cancel',
  [
    param('id').isMongoId().withMessage('Valid booking ID is required'),
    body('reason').optional().isString().withMessage('Reason must be a string')
  ],
  validateRequest,
  auth,
  bookingsController.cancelBooking
);

// PATCH /api/bookings/v2/:id/payment - Process payment
router.patch('/v2/:id/payment',
  [
    param('id').isMongoId().withMessage('Valid booking ID is required'),
    body('amount').isNumeric().withMessage('Valid amount is required'),
    body('method').isIn(['credit_card', 'bank_transfer', 'cash', 'mobile_money']),
    body('transactionId').optional().isString()
  ],
  validateRequest,
  auth,
  bookingsController.processPayment
);

// GET /api/bookings/v2/stats - Get booking statistics
router.get('/v2/stats',
  auth,
  bookingsController.getBookingStats
);

module.exports = router;
