const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const TourPackage = require('../models/TourPackage');
const { auth } = require('../middleware/auth');

// Get all tour packages for an organizer
router.get('/organizer/:organizerId', async (req, res) => {
  try {
    const { organizerId } = req.params;
    const { status, page = 1, limit = 10, search } = req.query;
    
    let query = { organizerId };
    if (status) query.status = status;
    
    let tourQuery = TourPackage.find(query);
    
    if (search) {
      tourQuery = tourQuery.find({
        $text: { $search: search }
      });
    }
    
    const tours = await tourQuery
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
      
    const total = await TourPackage.countDocuments(query);
    
    res.json({
      tours,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single tour package
router.get('/:id', async (req, res) => {
  try {
    const tour = await TourPackage.findById(req.params.id)
      .populate('organizerId', 'name email');
    
    if (!tour) {
      return res.status(404).json({ message: 'Tour package not found' });
    }
    
    // Increment views
    await tour.incrementViews();
    
    res.json(tour);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new tour package
router.post('/', auth, async (req, res) => {
  try {
    const tourData = {
      ...req.body,
      organizerId: req.user.id
    };
    
    const tour = new TourPackage(tourData);
    const savedTour = await tour.save();
    
    res.status(201).json(savedTour);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Update tour package
router.put('/:id', auth, async (req, res) => {
  try {
    const tour = await TourPackage.findById(req.params.id);
    
    if (!tour) {
      return res.status(404).json({ message: 'Tour package not found' });
    }
    
    // Check if user owns this tour
    if (tour.organizerId.toString() !== req.user.id && req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'Unauthorized to update this tour' });
    }
    
    Object.assign(tour, req.body);
    const updatedTour = await tour.save();
    
    res.json(updatedTour);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Delete tour package
router.delete('/:id', auth, async (req, res) => {
  try {
    const tour = await TourPackage.findById(req.params.id);
    
    if (!tour) {
      return res.status(404).json({ message: 'Tour package not found' });
    }
    
    // Check if user owns this tour
    if (tour.organizerId.toString() !== req.user.id && req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'Unauthorized to delete this tour' });
    }
    
    await TourPackage.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Tour package deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tour package statistics
router.get('/stats/:organizerId', async (req, res) => {
  try {
    const { organizerId } = req.params;
    
    const stats = await TourPackage.aggregate([
      { $match: { organizerId: mongoose.Types.ObjectId(organizerId) } },
      {
        $group: {
          _id: null,
          totalTours: { $sum: 1 },
          activeTours: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalViews: { $sum: '$stats.views' },
          totalBookings: { $sum: '$stats.bookings' },
          averageRating: { $avg: '$stats.rating' },
          averagePrice: { $avg: '$price' }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalTours: 0,
      activeTours: 0,
      totalViews: 0,
      totalBookings: 0,
      averageRating: 0,
      averagePrice: 0
    };
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get featured tours
router.get('/featured/list', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const tours = await TourPackage.findFeatured()
      .limit(parseInt(limit))
      .populate('organizerId', 'name');
    
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search tours
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { category, region, minPrice, maxPrice, difficulty, limit = 10 } = req.query;
    
    let searchQuery = {
      status: 'active',
      $text: { $search: query }
    };
    
    if (category) searchQuery.category = category;
    if (region) searchQuery.region = region;
    if (difficulty) searchQuery.difficulty = difficulty;
    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice);
    }
    
    const tours = await TourPackage.find(searchQuery)
      .limit(parseInt(limit))
      .sort({ score: { $meta: 'textScore' }, 'stats.rating': -1 })
      .populate('organizerId', 'name');
    
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
