import api from '../utils/api';

// ======================
// EVENT MANAGEMENT SERVICE
// ======================

/**
 * Get all events with filtering, pagination, and sorting
 */
export const getAllEvents = async (params = {}) => {
  try {
    const response = await api.get('/events', { params });
    return response.data; // Return the events array
  } catch (error) {
    console.error('Get all events error:', error);
    throw error;
  }
};

/**
 * Get event by ID
 */
export const getEventById = async (id) => {
  try {
    const response = await api.get(`/events/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get event by ID error:', error);
    throw error;
  }
};

/**
 * Create new event
 */
export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/events', eventData);
    return response.data;
  } catch (error) {
    console.error('Create event error:', error);
    throw error;
  }
};

/**
 * Update event
 */
export const updateEvent = async (id, eventData) => {
  try {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  } catch (error) {
    console.error('Update event error:', error);
    throw error;
  }
};

/**
 * Delete event
 */
export const deleteEvent = async (id) => {
  try {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete event error:', error);
    throw error;
  }
};

/**
 * Get event statistics
 */
export const getEventStats = async (params = {}) => {
  try {
    const response = await api.get('/events/stats', { params });
    return response.data; // Return the stats data object
  } catch (error) {
    console.error('Get event stats error:', error);
    throw error;
  }
};

/**
 * Get event types and categories
 */
export const getEventTypesAndCategories = async () => {
  try {
    const response = await api.get('/events/types-categories');
    return response.data.data; // Return the nested data object
  } catch (error) {
    console.error('Get event types and categories error:', error);
    throw error;
  }
};

/**
 * Register user for event
 */
export const registerForEvent = async (eventId, registrationData = {}) => {
  try {
    const response = await api.post(`/events/${eventId}/register`, registrationData);
    return response.data;
  } catch (error) {
    console.error('Register for event error:', error);
    throw error;
  }
};

/**
 * Cancel event registration
 */
export const cancelEventRegistration = async (eventId) => {
  try {
    const response = await api.delete(`/events/${eventId}/register`);
    return response.data;
  } catch (error) {
    console.error('Cancel event registration error:', error);
    throw error;
  }
};

/**
 * Add event review
 */
export const addEventReview = async (eventId, reviewData) => {
  try {
    const response = await api.post(`/events/${eventId}/review`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Add event review error:', error);
    throw error;
  }
};

/**
 * Bulk update event status
 */
export const bulkUpdateEventStatus = async (eventIds, status) => {
  try {
    const response = await api.put('/events/bulk/status', { eventIds, status });
    return response.data;
  } catch (error) {
    console.error('Bulk update event status error:', error);
    throw error;
  }
};

/**
 * Duplicate event
 */
export const duplicateEvent = async (eventId) => {
  try {
    const response = await api.post(`/events/${eventId}/duplicate`);
    return response.data;
  } catch (error) {
    console.error('Duplicate event error:', error);
    throw error;
  }
};

/**
 * Get event analytics
 */
export const getEventAnalytics = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}/analytics`);
    return response.data;
  } catch (error) {
    console.error('Get event analytics error:', error);
    throw error;
  }
};

/**
 * Export event attendees
 */
export const exportEventAttendees = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}/export/attendees`);
    return response.data;
  } catch (error) {
    console.error('Export event attendees error:', error);
    throw error;
  }
};

/**
 * Get upcoming events
 */
export const getUpcomingEvents = async (limit = 5) => {
  try {
    const response = await api.get('/events/upcoming', { params: { limit } });
    return response.data;
  } catch (error) {
    console.error('Get upcoming events error:', error);
    throw error;
  }
};

/**
 * Validate event data
 */
export const validateEventData = (eventData) => {
  const errors = {};

  // Required fields
  if (!eventData.title || eventData.title.trim().length === 0) {
    errors.title = 'Event title is required';
  } else if (eventData.title.length > 200) {
    errors.title = 'Title cannot exceed 200 characters';
  }

  if (!eventData.description || eventData.description.trim().length === 0) {
    errors.description = 'Event description is required';
  } else if (eventData.description.length > 2000) {
    errors.description = 'Description cannot exceed 2000 characters';
  }

  if (!eventData.type) {
    errors.type = 'Event type is required';
  }

  if (!eventData.category) {
    errors.category = 'Event category is required';
  }

  // Schedule validation
  if (!eventData.schedule) {
    errors.schedule = 'Event schedule is required';
  } else {
    if (!eventData.schedule.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!eventData.schedule.endDate) {
      errors.endDate = 'End date is required';
    } else if (eventData.schedule.startDate && new Date(eventData.schedule.endDate) < new Date(eventData.schedule.startDate)) {
      errors.endDate = 'End date must be after start date';
    }

    if (!eventData.schedule.startTime) {
      errors.startTime = 'Start time is required';
    } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(eventData.schedule.startTime)) {
      errors.startTime = 'Invalid start time format (HH:MM)';
    }

    if (!eventData.schedule.endTime) {
      errors.endTime = 'End time is required';
    } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(eventData.schedule.endTime)) {
      errors.endTime = 'Invalid end time format (HH:MM)';
    }
  }

  // Location validation
  if (!eventData.location) {
    errors.location = 'Event location is required';
  } else {
    if (!eventData.location.type) {
      errors.locationType = 'Location type is required';
    }

    if (eventData.location.type === 'physical' && !eventData.location.venue) {
      errors.venue = 'Venue is required for physical events';
    }

    if (eventData.location.type === 'virtual' && !eventData.location.virtualLink) {
      errors.virtualLink = 'Virtual link is required for virtual events';
    }
  }

  // Registration validation
  if (eventData.registration && eventData.registration.required) {
    if (!eventData.registration.capacity || eventData.registration.capacity < 1) {
      errors.capacity = 'Capacity must be at least 1 if registration is required';
    }
  }

  // Fee validation
  if (eventData.registration && eventData.registration.fees) {
    const fees = eventData.registration.fees;
    if (fees.adult && fees.adult < 0) {
      errors.adultFee = 'Adult fee cannot be negative';
    }
    if (fees.child && fees.child < 0) {
      errors.childFee = 'Child fee cannot be negative';
    }
    if (fees.student && fees.student < 0) {
      errors.studentFee = 'Student fee cannot be negative';
    }
    if (fees.member && fees.member < 0) {
      errors.memberFee = 'Member fee cannot be negative';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Format event data for API
 */
export const formatEventData = (formData) => {
  return {
    title: formData.title?.trim(),
    description: formData.description?.trim(),
    type: formData.type,
    category: formData.category,
    schedule: {
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      startTime: formData.startTime,
      endTime: formData.endTime,
      timezone: formData.timezone || 'Africa/Addis_Ababa'
    },
    location: {
      type: formData.locationType || 'physical',
      venue: formData.venue,
      address: formData.address,
      room: formData.room,
      virtualLink: formData.virtualLink,
      virtualPlatform: formData.virtualPlatform,
      ...(formData.coordinates && formData.coordinates.length === 2 && {
        coordinates: {
          type: 'Point',
          coordinates: formData.coordinates
        }
      })
    },
    registration: {
      required: formData.registrationRequired || false,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      registrationDeadline: formData.registrationDeadline,
      fees: {
        adult: formData.adultFee ? parseFloat(formData.adultFee) : 0,
        child: formData.childFee ? parseFloat(formData.childFee) : 0,
        student: formData.studentFee ? parseFloat(formData.studentFee) : 0,
        member: formData.memberFee ? parseFloat(formData.memberFee) : 0
      },
      currency: formData.currency || 'ETB'
    },
    media: {
      images: formData.images || [],
      videos: formData.videos || [],
      documents: formData.documents || []
    },
    speakers: formData.speakers || [],
    sponsors: formData.sponsors || [],
    tags: formData.tags || [],
    visibility: formData.visibility || 'public',
    featured: formData.featured || false,
    requirements: formData.requirements || {},
    contact: formData.contact || {},
    notes: formData.notes || {}
  };
};

/**
 * Format event data for display
 */
export const formatEventForDisplay = (event) => {
  if (!event || !event._id) {
    console.warn('formatEventForDisplay called with invalid event:', event);
    return null;
  }

  return {
    id: event._id,
    title: event.title,
    description: event.description,
    type: event.type,
    category: event.category,
    date: event.schedule?.startDate ? new Date(event.schedule.startDate).toISOString().split('T')[0] : '',
    endDate: event.schedule?.endDate ? new Date(event.schedule.endDate).toISOString().split('T')[0] : '',
    time: event.schedule?.startTime && event.schedule?.endTime ?
      `${event.schedule.startTime}-${event.schedule.endTime}` : '',
    location: event.location?.venue || event.location?.virtualLink || '',
    capacity: event.registration?.capacity || 0,
    registrations: event.registration?.currentRegistrations || 0,
    status: event.status,
    ticketPrice: event.registration?.fees?.adult || 0,
    featured: event.featured,
    visibility: event.visibility,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt
  };
};

export default {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventStats,
  getEventTypesAndCategories,
  registerForEvent,
  cancelEventRegistration,
  addEventReview,
  bulkUpdateEventStatus,
  duplicateEvent,
  getEventAnalytics,
  exportEventAttendees,
  getUpcomingEvents,
  validateEventData,
  formatEventData,
  formatEventForDisplay
};
