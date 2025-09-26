const Event = require('../models/Event');
const Museum = require('../models/Museum');
const User = require('../models/User');

/**
 * @desc    Get all public events for visitors
 * @route   GET /api/visitor/events
 * @access  Public
 */
const getPublicEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sortBy = 'schedule.startDate',
      sortOrder = 'asc',
      status = 'published',
      type,
      category,
      search,
      museumId,
      city,
      featured,
      upcoming,
      dateRange
    } = req.query;

    // Build query for public events
    const query = {
      status: 'published',
      visibility: { $in: ['public', 'unlisted'] }
    };

    // Filter by event type
    if (type) {
      query.type = type;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by museum
    if (museumId) {
      query.museum = museumId;
    }

    // Filter by featured events
    if (featured === 'true') {
      query.featured = true;
    }

    // Filter upcoming events
    if (upcoming === 'true') {
      query['schedule.startDate'] = { $gte: new Date() };
    }

    // Date range filter
    if (dateRange) {
      const [startDate, endDate] = dateRange.split(',');
      if (startDate && endDate) {
        query['schedule.startDate'] = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // City filter (search within museum locations)
    if (city) {
      const museumsInCity = await Museum.find({
        'location.city': { $regex: city, $options: 'i' }
      }).select('_id');
      
      if (museumsInCity.length > 0) {
        query.museum = { $in: museumsInCity.map(m => m._id) };
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const events = await Event.find(query)
      .populate({
        path: 'museum',
        select: 'name location contact images'
      })
      .populate('organizer', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Event.countDocuments(query);

    // Add computed fields for frontend
    const eventsWithComputedFields = events.map(event => ({
      ...event,
      eventStatus: getEventStatus(event),
      availableSpots: getAvailableSpots(event),
      isFull: getIsFull(event),
      duration: getDuration(event)
    }));

    res.json({
      success: true,
      data: eventsWithComputedFields,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      },
      filters: {
        totalEvents: total,
        appliedFilters: { type, category, search, museumId, city, featured, upcoming }
      }
    });
  } catch (error) {
    console.error('Get public events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

/**
 * @desc    Get event by ID for visitors
 * @route   GET /api/visitor/events/:id
 * @access  Public
 */
const getPublicEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate({
        path: 'museum',
        select: 'name description location contact images website socialMedia'
      })
      .populate('organizer', 'name email')
      .populate({
        path: 'reviews.user',
        select: 'name profileImage'
      })
      .lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is publicly accessible
    if (event.status !== 'published' || !['public', 'unlisted'].includes(event.visibility)) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Increment views
    await Event.findByIdAndUpdate(req.params.id, {
      $inc: { 'statistics.totalViews': 1 }
    });

    // Add computed fields
    const eventWithComputedFields = {
      ...event,
      eventStatus: getEventStatus(event),
      availableSpots: getAvailableSpots(event),
      isFull: getIsFull(event),
      duration: getDuration(event),
      // Check if user is registered (if authenticated)
      isRegistered: req.user ? event.attendees.some(a => 
        a.user.toString() === req.user._id.toString() && a.status !== 'cancelled'
      ) : false
    };

    res.json({
      success: true,
      data: eventWithComputedFields
    });
  } catch (error) {
    console.error('Get public event by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message
    });
  }
};

/**
 * @desc    Get featured events
 * @route   GET /api/visitor/events/featured
 * @access  Public
 */
const getFeaturedEvents = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const events = await Event.find({
      status: 'published',
      visibility: 'public',
      featured: true,
      'schedule.startDate': { $gte: new Date() }
    })
      .populate({
        path: 'museum',
        select: 'name location images'
      })
      .sort({ 'schedule.startDate': 1 })
      .limit(parseInt(limit))
      .lean();

    const eventsWithComputedFields = events.map(event => ({
      ...event,
      eventStatus: getEventStatus(event),
      availableSpots: getAvailableSpots(event),
      isFull: getIsFull(event)
    }));

    res.json({
      success: true,
      data: eventsWithComputedFields
    });
  } catch (error) {
    console.error('Get featured events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured events',
      error: error.message
    });
  }
};

/**
 * @desc    Get upcoming events
 * @route   GET /api/visitor/events/upcoming
 * @access  Public
 */
const getUpcomingEvents = async (req, res) => {
  try {
    const { limit = 12, museumId } = req.query;
    
    const query = {
      status: 'published',
      visibility: 'public',
      'schedule.startDate': { $gte: new Date() }
    };

    if (museumId) {
      query.museum = museumId;
    }

    const events = await Event.find(query)
      .populate({
        path: 'museum',
        select: 'name location images'
      })
      .sort({ 'schedule.startDate': 1 })
      .limit(parseInt(limit))
      .lean();

    const eventsWithComputedFields = events.map(event => ({
      ...event,
      eventStatus: getEventStatus(event),
      availableSpots: getAvailableSpots(event),
      isFull: getIsFull(event)
    }));

    res.json({
      success: true,
      data: eventsWithComputedFields
    });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming events',
      error: error.message
    });
  }
};

/**
 * @desc    Get events by category
 * @route   GET /api/visitor/events/by-category
 * @access  Public
 */
const getEventsByCategory = async (req, res) => {
  try {
    const categories = ['art', 'history', 'culture', 'archaeology', 'science', 'education', 'entertainment', 'community'];
    
    const eventsByCategory = await Promise.all(
      categories.map(async (category) => {
        const events = await Event.find({
          status: 'published',
          visibility: 'public',
          category,
          'schedule.startDate': { $gte: new Date() }
        })
          .populate('museum', 'name location')
          .sort({ 'schedule.startDate': 1 })
          .limit(4)
          .lean();

        return {
          category,
          events: events.map(event => ({
            ...event,
            eventStatus: getEventStatus(event),
            availableSpots: getAvailableSpots(event),
            isFull: getIsFull(event)
          }))
        };
      })
    );

    res.json({
      success: true,
      data: eventsByCategory.filter(cat => cat.events.length > 0)
    });
  } catch (error) {
    console.error('Get events by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events by category',
      error: error.message
    });
  }
};

/**
 * @desc    Get event types and categories for filters
 * @route   GET /api/visitor/events/filters
 * @access  Public
 */
const getEventFilters = async (req, res) => {
  try {
    const eventTypes = [
      { value: 'exhibition', label: 'Exhibition' },
      { value: 'workshop', label: 'Workshop' },
      { value: 'lecture', label: 'Lecture' },
      { value: 'tour', label: 'Tour' },
      { value: 'conference', label: 'Conference' },
      { value: 'cultural_event', label: 'Cultural Event' },
      { value: 'educational_program', label: 'Educational Program' },
      { value: 'special_exhibition', label: 'Special Exhibition' },
      { value: 'community_event', label: 'Community Event' },
      { value: 'virtual_event', label: 'Virtual Event' }
    ];

    const categories = [
      { value: 'art', label: 'Art' },
      { value: 'history', label: 'History' },
      { value: 'culture', label: 'Culture' },
      { value: 'archaeology', label: 'Archaeology' },
      { value: 'science', label: 'Science' },
      { value: 'education', label: 'Education' },
      { value: 'entertainment', label: 'Entertainment' },
      { value: 'community', label: 'Community' },
      { value: 'research', label: 'Research' },
      { value: 'preservation', label: 'Preservation' }
    ];

    // Get available museums with events
    const museumsWithEvents = await Event.aggregate([
      {
        $match: {
          status: 'published',
          visibility: 'public'
        }
      },
      {
        $group: {
          _id: '$museum'
        }
      },
      {
        $lookup: {
          from: 'museums',
          localField: '_id',
          foreignField: '_id',
          as: 'museum'
        }
      },
      {
        $unwind: '$museum'
      },
      {
        $project: {
          _id: '$museum._id',
          name: '$museum.name',
          city: '$museum.location.city'
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);

    // Get unique cities
    const cities = [...new Set(museumsWithEvents.map(m => m.city).filter(Boolean))];

    res.json({
      success: true,
      data: {
        types: eventTypes,
        categories: categories,
        museums: museumsWithEvents,
        cities: cities.sort()
      }
    });
  } catch (error) {
    console.error('Get event filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event filters',
      error: error.message
    });
  }
};

/**
 * @desc    Register for public event
 * @route   POST /api/visitor/events/:id/register
 * @access  Authenticated
 */
const registerForPublicEvent = async (req, res) => {
  try {
    const { ticketType = 'adult', specialRequirements } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is publicly accessible and allows registration
    if (event.status !== 'published' || !['public', 'unlisted'].includes(event.visibility)) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!event.registration.required) {
      return res.status(400).json({
        success: false,
        message: 'This event does not require registration'
      });
    }

    if (getIsFull(event)) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    // Check if user is already registered
    const existingAttendee = event.attendees.find(
      a => a.user.toString() === req.user._id.toString() && a.status !== 'cancelled'
    );

    if (existingAttendee) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Add attendee
    event.attendees.push({
      user: req.user._id,
      ticketType,
      specialRequirements,
      status: 'registered',
      paymentStatus: event.registration.fees[ticketType] > 0 ? 'pending' : 'waived'
    });

    event.registration.currentRegistrations += 1;
    event.statistics.totalRegistrations += 1;
    
    await event.save();

    res.json({
      success: true,
      message: 'Successfully registered for event',
      data: {
        eventId: event._id,
        registrationId: event.attendees[event.attendees.length - 1]._id,
        ticketType,
        paymentRequired: event.registration.fees[ticketType] > 0,
        fee: event.registration.fees[ticketType] || 0,
        currency: event.registration.currency
      }
    });
  } catch (error) {
    console.error('Register for public event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register for event',
      error: error.message
    });
  }
};

/**
 * @desc    Cancel event registration
 * @route   DELETE /api/visitor/events/:id/register
 * @access  Authenticated
 */
const cancelEventRegistration = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const attendeeIndex = event.attendees.findIndex(
      a => a.user.toString() === req.user._id.toString() && a.status !== 'cancelled'
    );

    if (attendeeIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You are not registered for this event'
      });
    }

    // Update attendee status instead of removing
    event.attendees[attendeeIndex].status = 'cancelled';
    event.registration.currentRegistrations = Math.max(
      0,
      event.registration.currentRegistrations - 1
    );

    await event.save();

    res.json({
      success: true,
      message: 'Successfully cancelled event registration'
    });
  } catch (error) {
    console.error('Cancel event registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel event registration',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's registered events
 * @route   GET /api/visitor/events/my-registrations
 * @access  Authenticated
 */
const getMyEventRegistrations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;

    const matchQuery = {
      'attendees.user': req.user._id
    };

    if (status !== 'all') {
      matchQuery['attendees.status'] = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const events = await Event.find(matchQuery)
      .populate('museum', 'name location')
      .populate('organizer', 'name')
      .sort({ 'schedule.startDate': 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Filter to only include the user's registration details
    const userEvents = events.map(event => {
      const userAttendee = event.attendees.find(a => 
        a.user.toString() === req.user._id.toString()
      );
      
      return {
        ...event,
        userRegistration: userAttendee,
        eventStatus: getEventStatus(event),
        availableSpots: getAvailableSpots(event),
        isFull: getIsFull(event)
      };
    }).filter(event => 
      status === 'all' || event.userRegistration.status === status
    );

    const total = userEvents.length;

    res.json({
      success: true,
      data: userEvents,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get my event registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your event registrations',
      error: error.message
    });
  }
};

// Helper functions
function getEventStatus(event) {
  const now = new Date();
  if (event.status === 'cancelled') return 'cancelled';
  if (now < new Date(event.schedule.startDate)) return 'upcoming';
  if (now >= new Date(event.schedule.startDate) && now <= new Date(event.schedule.endDate)) return 'ongoing';
  return 'completed';
}

function getAvailableSpots(event) {
  if (!event.registration.required || !event.registration.capacity) return null;
  return Math.max(0, event.registration.capacity - event.registration.currentRegistrations);
}

function getIsFull(event) {
  if (!event.registration.required || !event.registration.capacity) return false;
  return event.registration.currentRegistrations >= event.registration.capacity;
}

function getDuration(event) {
  try {
    const start = new Date(`2000-01-01 ${event.schedule.startTime}`);
    const end = new Date(`2000-01-01 ${event.schedule.endTime}`);
    return Math.abs(end - start) / (1000 * 60 * 60); // in hours
  } catch {
    return 0;
  }
}

module.exports = {
  getPublicEvents,
  getPublicEventById,
  getFeaturedEvents,
  getUpcomingEvents,
  getEventsByCategory,
  getEventFilters,
  registerForPublicEvent,
  cancelEventRegistration,
  getMyEventRegistrations
};
