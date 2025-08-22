// Organizer Controller
// Handles organizer-specific functionality

// Mock data for organizers
const mockOrganizers = [
  {
    id: '68a39e26bd680dcb7ee5e296',
    name: 'Ethiopian Heritage Foundation',
    email: 'foundation@ethiopianheritage.org',
    organization: 'Heritage Foundation',
    verified: true,
    events: [
      {
        id: 'event-1',
        title: 'Lalibela Heritage Festival',
        date: '2024-12-25',
        location: 'Lalibela, Ethiopia',
        attendees: 250,
        status: 'confirmed'
      }
    ],
    totalEvents: 12,
    totalAttendees: 3500,
    rating: 4.8,
    joinedDate: '2023-01-15'
  }
];

// Get organizer dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    const organizerId = req.params.organizerId;
    
    // Find organizer in mock data
    const organizer = mockOrganizers.find(org => org.id === organizerId);
    
    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: 'Organizer not found'
      });
    }

    // Return dashboard data
    res.json({
      success: true,
      data: {
        organizer: {
          id: organizer.id,
          name: organizer.name,
          email: organizer.email,
          organization: organizer.organization,
          verified: organizer.verified,
          rating: organizer.rating,
          joinedDate: organizer.joinedDate
        },
        stats: {
          totalEvents: organizer.totalEvents,
          totalAttendees: organizer.totalAttendees,
          upcomingEvents: organizer.events.length,
          averageRating: organizer.rating
        },
        recentEvents: organizer.events,
        notifications: [
          {
            id: 'notif-1',
            type: 'success',
            message: 'Your event "Lalibela Heritage Festival" has been approved',
            date: new Date().toISOString(),
            read: false
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching organizer dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};

// Get organizer events
exports.getEvents = async (req, res) => {
  try {
    const organizerId = req.params.organizerId;
    
    const organizer = mockOrganizers.find(org => org.id === organizerId);
    
    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: 'Organizer not found'
      });
    }

    res.json({
      success: true,
      data: organizer.events
    });
  } catch (error) {
    console.error('Error fetching organizer events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

// Create new event
exports.createEvent = async (req, res) => {
  try {
    const organizerId = req.params.organizerId;
    const eventData = req.body;
    
    const organizer = mockOrganizers.find(org => org.id === organizerId);
    
    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: 'Organizer not found'
      });
    }

    const newEvent = {
      id: 'event-' + Date.now(),
      ...eventData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    organizer.events.push(newEvent);
    organizer.totalEvents += 1;

    res.status(201).json({
      success: true,
      data: newEvent,
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const { organizerId, eventId } = req.params;
    const updateData = req.body;
    
    const organizer = mockOrganizers.find(org => org.id === organizerId);
    
    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: 'Organizer not found'
      });
    }

    const eventIndex = organizer.events.findIndex(event => event.id === eventId);
    
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    organizer.events[eventIndex] = {
      ...organizer.events[eventIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: organizer.events[eventIndex],
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const { organizerId, eventId } = req.params;
    
    const organizer = mockOrganizers.find(org => org.id === organizerId);
    
    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: 'Organizer not found'
      });
    }

    const eventIndex = organizer.events.findIndex(event => event.id === eventId);
    
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    organizer.events.splice(eventIndex, 1);
    organizer.totalEvents = Math.max(0, organizer.totalEvents - 1);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
};
