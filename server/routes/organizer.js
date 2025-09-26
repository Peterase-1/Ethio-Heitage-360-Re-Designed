const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { auth, authorize } = require('../middleware/auth');

// Import existing models (keep existing functionality)
const TourPackage = require('../models/TourPackage');
const Booking = require('../models/Booking');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Import educational tour management functions
const {
  getDashboardData,
  // Educational Tours
  getEducationalTours,
  getEducationalTour,
  createEducationalTour,
  updateEducationalTour,
  deleteEducationalTour,
  submitTourForApproval,
  getTourEnrollments,
  updateEnrollmentStatus
} = require('../controllers/organizer');

// Get comprehensive dashboard data
router.get('/dashboard/:organizerId', async (req, res) => {
  try {
    const { organizerId } = req.params;
    
    // Skip auth verification for testing
    
    // Get user info
    const user = await User.findById(organizerId).select('name email avatar role');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get dashboard statistics
    const [tourStats, bookingStats, messageStats, recentActivities, upcomingTours] = await Promise.all([
      // Tour package statistics
      TourPackage.aggregate([
        { $match: { organizerId: new mongoose.Types.ObjectId(organizerId) } },
        {
          $group: {
            _id: null,
            totalTours: { $sum: 1 },
            activeTours: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            totalViews: { $sum: '$stats.views' },
            averageRating: { $avg: '$stats.rating' }
          }
        }
      ]),
      
      // Booking statistics
      Booking.aggregate([
        { $match: { organizerId: new mongoose.Types.ObjectId(organizerId) } },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            confirmedBookings: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
            pendingBookings: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            completedBookings: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            totalRevenue: { $sum: '$totalAmount' },
            paidAmount: { $sum: '$payment.paidAmount' }
          }
        }
      ]),
      
      // Message statistics
      Message.aggregate([
        { $match: { organizerId: new mongoose.Types.ObjectId(organizerId) } },
        {
          $group: {
            _id: null,
            totalMessages: { $sum: 1 },
            unreadMessages: { $sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] } },
            repliedMessages: { $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] } }
          }
        }
      ]),
      
      // Recent activities (bookings, messages)
      Promise.all([
        Booking.find({ organizerId })
          .populate('tourPackageId', 'title')
          .sort({ createdAt: -1 })
          .limit(5)
          .select('customerName status tourDate createdAt tourPackageId totalAmount'),
        Message.find({ organizerId })
          .sort({ createdAt: -1 })
          .limit(3)
          .select('customerName subject status createdAt')
      ]),
      
      // Upcoming tours
      Booking.find({
        organizerId: new mongoose.Types.ObjectId(organizerId),
        status: 'confirmed',
        tourDate: { $gte: new Date() }
      })
        .populate('tourPackageId', 'title location')
        .sort({ tourDate: 1 })
        .limit(4)
        .select('customerName guests tourDate tourPackageId')
    ]);
    
    // Process the results
    const dashboardStats = {
      totalTours: tourStats[0]?.totalTours || 0,
      activeTours: tourStats[0]?.activeTours || 0,
      totalViews: tourStats[0]?.totalViews || 0,
      averageRating: tourStats[0]?.averageRating || 0,
      
      totalBookings: bookingStats[0]?.totalBookings || 0,
      confirmedBookings: bookingStats[0]?.confirmedBookings || 0,
      pendingBookings: bookingStats[0]?.pendingBookings || 0,
      completedBookings: bookingStats[0]?.completedBookings || 0,
      totalRevenue: bookingStats[0]?.totalRevenue || 0,
      paidAmount: bookingStats[0]?.paidAmount || 0,
      pendingPayment: (bookingStats[0]?.totalRevenue || 0) - (bookingStats[0]?.paidAmount || 0),
      
      totalMessages: messageStats[0]?.totalMessages || 0,
      unreadMessages: messageStats[0]?.unreadMessages || 0,
      repliedMessages: messageStats[0]?.repliedMessages || 0
    };
    
    // Format recent activities
    const [recentBookings, recentMessages] = recentActivities;
    const activities = [];
    
    // Add booking activities
    recentBookings.forEach(booking => {
      activities.push({
        id: booking._id,
        type: 'booking',
        title: getBookingActivityTitle(booking),
        description: `${booking.customerName} - ${booking.tourPackageId?.title || 'Tour'} - $${booking.totalAmount}`,
        time: formatRelativeTime(booking.createdAt),
        user: booking.customerName,
        status: booking.status,
        relatedId: booking._id
      });
    });
    
    // Add message activities
    recentMessages.forEach(message => {
      activities.push({
        id: message._id,
        type: 'message',
        title: 'Customer message received',
        description: `${message.customerName} - "${message.subject}"`,
        time: formatRelativeTime(message.createdAt),
        user: message.customerName,
        status: message.status,
        relatedId: message._id
      });
    });
    
    // Sort activities by date
    activities.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    
    const dashboardData = {
      user: {
        id: user._id,
        name: user.name || user.fullName,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      },
      stats: dashboardStats,
      recentActivities: activities.slice(0, 10),
      upcomingTours: upcomingTours.map(tour => ({
        id: tour._id,
        customerName: tour.customerName,
        tourTitle: tour.tourPackageId?.title || 'Unknown Tour',
        location: tour.tourPackageId?.location || 'Unknown Location',
        guests: tour.guests,
        tourDate: tour.tourDate
      }))
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get activity feed
router.get('/activities/:organizerId', async (req, res) => {
  try {
    const { organizerId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    // Get recent bookings and messages
    const [bookings, messages] = await Promise.all([
      Booking.find({ organizerId })
        .populate('tourPackageId', 'title')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit),
      Message.find({ organizerId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
    ]);
    
    const activities = [];
    
    bookings.forEach(booking => {
      activities.push({
        id: booking._id,
        type: 'booking',
        title: getBookingActivityTitle(booking),
        description: `${booking.customerName} - ${booking.tourPackageId?.title}`,
        time: formatRelativeTime(booking.createdAt),
        user: booking.customerName,
        status: booking.status,
        relatedId: booking._id,
        createdAt: booking.createdAt
      });
    });
    
    messages.forEach(message => {
      activities.push({
        id: message._id,
        type: 'message',
        title: 'Customer message',
        description: `${message.customerName} - "${message.subject}"`,
        time: formatRelativeTime(message.createdAt),
        user: message.customerName,
        status: message.status,
        relatedId: message._id,
        createdAt: message.createdAt
      });
    });
    
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get notifications for organizer
router.get('/notifications/:organizerId', async (req, res) => {
  try {
    const { organizerId } = req.params;
    const { unreadOnly = false, limit = 10 } = req.query;
    
    const notifications = await Notification.getForUser(organizerId, {
      unreadOnly: unreadOnly === 'true',
      limit: parseInt(limit)
    });
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.patch('/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { organizerId } = req.body; // Get organizerId from body
    
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    await notification.markAsRead(organizerId);
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper functions
function getBookingActivityTitle(booking) {
  const statusTitles = {
    'pending': 'New booking request',
    'confirmed': 'Booking confirmed',
    'cancelled': 'Booking cancelled',
    'completed': 'Tour completed',
    'refunded': 'Booking refunded'
  };
  return statusTitles[booking.status] || 'Booking updated';
}

function formatRelativeTime(date) {
  const now = new Date();
  const diffTime = Math.abs(now - new Date(date));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}


// ===== EDUCATIONAL TOURS MANAGEMENT USING CONTROLLER =====

// Get all educational tours for organizer (from controller)
router.get('/educational-tours', auth, authorize(['organizer']), getEducationalTours);

// Get single educational tour (from controller)
router.get('/educational-tours/:id', auth, authorize(['organizer']), getEducationalTour);

// Create educational tour (from controller)
router.post('/educational-tours', auth, authorize(['organizer']), createEducationalTour);

// Update educational tour (from controller)
router.put('/educational-tours/:id', auth, authorize(['organizer']), updateEducationalTour);

// Delete educational tour (from controller)
router.delete('/educational-tours/:id', auth, authorize(['organizer']), deleteEducationalTour);

// Submit tour for approval (from controller)
router.post('/educational-tours/:id/submit-for-approval', auth, authorize(['organizer']), submitTourForApproval);

// Get tour enrollments (from controller)
router.get('/educational-tours/:id/enrollments', auth, authorize(['organizer']), getTourEnrollments);

// Update enrollment status (from controller)
router.put('/educational-tours/:tourId/enrollments/:userId', auth, authorize(['organizer']), updateEnrollmentStatus);

// Dashboard data using controller
router.get('/dashboard', auth, authorize(['organizer']), getDashboardData);


module.exports = router;
