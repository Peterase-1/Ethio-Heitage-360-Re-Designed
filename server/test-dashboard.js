const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const TourPackage = require('./models/TourPackage');
const Booking = require('./models/Booking');
const Message = require('./models/Message');

// Connect to MongoDB
const connectDB = require('./config/database');

async function testDashboard() {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Create a test organizer user
    const testOrganizer = await User.findOneAndUpdate(
      { email: 'test.organizer@ethioheritage360.com' },
      {
        name: 'Test Organizer',
        email: 'test.organizer@ethioheritage360.com',
        role: 'organizer',
        isActive: true,
        isVerified: true,
        password: 'testpassword123' // This will be hashed by the model
      },
      { upsert: true, new: true }
    );
    console.log('✅ Test organizer created/found:', testOrganizer.name);

    // Create a test tour package
    const testTour = await TourPackage.findOneAndUpdate(
      { title: 'Test Lalibela Tour', organizerId: testOrganizer._id },
      {
        title: 'Test Lalibela Tour',
        description: 'A test tour package for the dashboard demo',
        location: 'Lalibela, Amhara',
        region: 'Amhara',
        duration: '3 days',
        price: 450,
        maxGuests: 12,
        difficulty: 'moderate',
        category: 'Religious & Historical',
        organizerId: testOrganizer._id,
        status: 'active',
        images: ['https://example.com/test-image.jpg'],
        stats: {
          views: 150,
          bookings: 8,
          rating: 4.5,
          reviewCount: 12
        }
      },
      { upsert: true, new: true }
    );
    console.log('✅ Test tour package created/found:', testTour.title);

    // Create test bookings
    const date1 = new Date();
    const ref1 = `EH${date1.getFullYear().toString().slice(-2)}${(date1.getMonth() + 1).toString().padStart(2, '0')}${date1.getDate().toString().padStart(2, '0')}${Date.now().toString().slice(-6)}`;
    
    const testBooking = await Booking.findOneAndUpdate(
      { 
        customerEmail: 'test.customer@example.com'
      },
      {
        tourPackageId: testTour._id,
        organizerId: testOrganizer._id,
        customerName: 'Test Customer',
        customerEmail: 'test.customer@example.com',
        customerPhone: '+251911123456',
        guests: 2,
        tourDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'confirmed',
        totalAmount: 900,
        specialRequests: 'Vegetarian meals preferred',
        bookingReference: ref1,
        payment: {
          status: 'completed',
          method: 'credit_card',
          paidAmount: 900,
          paymentDate: new Date()
        }
      },
      { upsert: true, new: true }
    );
    console.log('✅ Test booking created/found:', testBooking.customerName);

    // Create a pending booking
    const date2 = new Date();
    const ref2 = `EH${date2.getFullYear().toString().slice(-2)}${(date2.getMonth() + 1).toString().padStart(2, '0')}${date2.getDate().toString().padStart(2, '0')}${(Date.now() + 1000).toString().slice(-6)}`;
    
    const pendingBooking = await Booking.findOneAndUpdate(
      { 
        customerEmail: 'pending.customer@example.com'
      },
      {
        tourPackageId: testTour._id,
        organizerId: testOrganizer._id,
        customerName: 'Pending Customer',
        customerEmail: 'pending.customer@example.com',
        guests: 4,
        tourDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        status: 'pending',
        totalAmount: 1800,
        bookingReference: ref2,
        payment: {
          status: 'pending'
        }
      },
      { upsert: true, new: true }
    );
    console.log('✅ Test pending booking created/found:', pendingBooking.customerName);

    // Create test message
    const testMessage = await Message.findOneAndUpdate(
      { customerEmail: 'message.customer@example.com' },
      {
        organizerId: testOrganizer._id,
        customerName: 'Message Customer',
        customerEmail: 'message.customer@example.com',
        subject: 'Question about Lalibela Tour',
        message: 'Hi, I would like to know more details about the Lalibela tour itinerary and what is included in the package.',
        status: 'unread',
        category: 'tour_information',
        priority: 'normal'
      },
      { upsert: true, new: true }
    );
    console.log('✅ Test message created/found from:', testMessage.customerName);

    // Test aggregation queries (similar to what the dashboard uses)
    console.log('\n📊 Dashboard Statistics:');
    
    // Tour stats
    const tourStats = await TourPackage.aggregate([
      { $match: { organizerId: testOrganizer._id } },
      {
        $group: {
          _id: null,
          totalTours: { $sum: 1 },
          activeTours: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          totalViews: { $sum: '$stats.views' },
          averageRating: { $avg: '$stats.rating' }
        }
      }
    ]);
    console.log('Tours:', tourStats[0] || { totalTours: 0, activeTours: 0 });

    // Booking stats
    const bookingStats = await Booking.aggregate([
      { $match: { organizerId: testOrganizer._id } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          confirmedBookings: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
          pendingBookings: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          totalRevenue: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$payment.paidAmount' }
        }
      }
    ]);
    console.log('Bookings:', bookingStats[0] || { totalBookings: 0, confirmedBookings: 0 });

    // Message stats
    const messageStats = await Message.aggregate([
      { $match: { organizerId: testOrganizer._id } },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          unreadMessages: { $sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] } }
        }
      }
    ]);
    console.log('Messages:', messageStats[0] || { totalMessages: 0, unreadMessages: 0 });

    // Get upcoming tours
    const upcomingTours = await Booking.find({
      organizerId: testOrganizer._id,
      status: 'confirmed',
      tourDate: { $gte: new Date() }
    })
      .populate('tourPackageId', 'title location')
      .sort({ tourDate: 1 })
      .limit(4);
    
    console.log('Upcoming Tours:', upcomingTours.length);

    console.log('\n✅ All tests passed! Dashboard data is ready.');
    console.log('\n📝 Test Organizer Details:');
    console.log(`ID: ${testOrganizer._id}`);
    console.log(`Name: ${testOrganizer.name}`);
    console.log(`Email: ${testOrganizer.email}`);
    console.log('\n🔗 You can use this organizer ID in the frontend for testing.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔐 Database connection closed');
  }
}

// Run the test
testDashboard();
