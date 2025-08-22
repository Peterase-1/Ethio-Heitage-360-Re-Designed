const express = require('express');
const router = express.Router();
const Tour = require('../models/Tour');
const User = require('../models/User');

// Get all tours
router.get('/', async (req, res) => {
  try {
    const {
      status = 'published',
      type,
      location,
      duration,
      organizer,
      limit = 50,
      page = 1,
      search
    } = req.query;

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (organizer) {
      query.organizer = organizer;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const tours = await Tour.find(query)
      .populate('organizer', 'name email profile')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count for pagination
    const totalCount = await Tour.countDocuments(query);
    
    res.json({
      success: true,
      data: tours,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching tours:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tours',
      error: error.message
    });
  }
});

// Get tour by ID
router.get('/:id', async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)
      .populate('organizer', 'name email profile')
      .populate('reviews.user', 'name email profile');
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }
    
    res.json({
      success: true,
      data: tour
    });
  } catch (error) {
    console.error('Error fetching tour:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tour',
      error: error.message
    });
  }
});

// Create new tour
router.post('/', async (req, res) => {
  try {
    const tourData = {
      ...req.body,
      organizer: req.body.organizer || req.user?.id || 'demo-organizer-id'
    };
    
    const tour = new Tour(tourData);
    await tour.save();
    
    // Populate the created tour
    const populatedTour = await Tour.findById(tour._id)
      .populate('organizer', 'name email profile');
    
    // Emit WebSocket event for real-time updates
    const tourSocket = req.app.get('tourSocket');
    if (tourSocket) {
      tourSocket.broadcastTourCreation(populatedTour.toObject(), req.body.organizer);
    }
    
    res.status(201).json({
      success: true,
      message: 'Tour created successfully',
      data: populatedTour
    });
  } catch (error) {
    console.error('Error creating tour:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating tour',
      error: error.message
    });
  }
});

// Update tour
router.put('/:id', async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('organizer', 'name email profile');
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }
    
    // Emit WebSocket event for real-time updates
    const tourSocket = req.app.get('tourSocket');
    if (tourSocket) {
      tourSocket.broadcastTourUpdate(tour.toObject(), req.user?.id);
    }
    
    res.json({
      success: true,
      message: 'Tour updated successfully',
      data: tour
    });
  } catch (error) {
    console.error('Error updating tour:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating tour',
      error: error.message
    });
  }
});

// Delete tour
router.delete('/:id', async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }
    
    const organizerId = tour.organizer.toString();
    await Tour.findByIdAndDelete(req.params.id);
    
    // Emit WebSocket event for real-time updates
    const tourSocket = req.app.get('tourSocket');
    if (tourSocket) {
      tourSocket.broadcastTourDeletion(req.params.id, organizerId, req.user?.id);
    }
    
    res.json({
      success: true,
      message: 'Tour deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tour:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting tour',
      error: error.message
    });
  }
});

// Get featured tours
router.get('/featured', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const tours = await Tour.find({
      status: 'published',
      'rating.average': { $gte: 4.0 }
    })
      .populate('organizer', 'name email profile')
      .sort({ 'rating.average': -1, totalBookings: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: tours
    });
  } catch (error) {
    console.error('Error fetching featured tours:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured tours',
      error: error.message
    });
  }
});

// Get upcoming tours
router.get('/upcoming', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const tours = await Tour.find({
      status: 'published',
      'schedule.startDate': { $gte: new Date() }
    })
      .populate('organizer', 'name email profile')
      .sort({ 'schedule.startDate': 1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: tours
    });
  } catch (error) {
    console.error('Error fetching upcoming tours:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming tours',
      error: error.message
    });
  }
});

// Get popular tours
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const tours = await Tour.find({
      status: 'published'
    })
      .populate('organizer', 'name email profile')
      .sort({ totalBookings: -1, 'rating.average': -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: tours
    });
  } catch (error) {
    console.error('Error fetching popular tours:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular tours',
      error: error.message
    });
  }
});

// Update tour status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }
    
    const oldStatus = tour.status;
    tour.status = status;
    await tour.save();
    
    // Populate for response
    await tour.populate('organizer', 'name email profile');
    
    // Emit WebSocket event for status change
    const tourSocket = req.app.get('tourSocket');
    if (tourSocket) {
      tourSocket.broadcastTourStatusChange(tour.toObject(), oldStatus, status);
    }
    
    res.json({
      success: true,
      message: 'Tour status updated successfully',
      data: tour
    });
  } catch (error) {
    console.error('Error updating tour status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating tour status',
      error: error.message
    });
  }
});

module.exports = router;

