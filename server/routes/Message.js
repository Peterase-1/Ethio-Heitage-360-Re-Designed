const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

// Get all messages for an organizer
router.get('/organizer/:organizerId', auth, async (req, res) => {
  try {
    const { organizerId } = req.params;
    const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    let query = { organizerId };
    if (status) query.status = status;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const messages = await Message.find(query)
      .populate('relatedBookingId', 'bookingReference tourDate')
      .populate('relatedTourId', 'title')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
      
    const total = await Message.countDocuments(query);
    
    res.json({
      messages,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single message
router.get('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('relatedBookingId')
      .populate('relatedTourId')
      .populate('response.respondedBy', 'name email');
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user can access this message
    if (message.organizerId?.toString() !== req.user.id && req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'Unauthorized to access this message' });
    }
    
    // Mark as read if it's unread
    if (message.status === 'unread') {
      await message.markAsRead();
    }
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new message (from customers)
router.post('/', async (req, res) => {
  try {
    const message = new Message(req.body);
    const savedMessage = await message.save();
    
    res.status(201).json(savedMessage);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Reply to message
router.patch('/:id/reply', auth, async (req, res) => {
  try {
    const { responseMessage } = req.body;
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user can reply to this message
    if (message.organizerId?.toString() !== req.user.id && req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'Unauthorized to reply to this message' });
    }
    
    await message.reply(responseMessage, req.user.id);
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark message as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user can mark this message as read
    if (message.organizerId?.toString() !== req.user.id && req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'Unauthorized to update this message' });
    }
    
    await message.markAsRead();
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Archive message
router.patch('/:id/archive', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user can archive this message
    if (message.organizerId?.toString() !== req.user.id && req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'Unauthorized to archive this message' });
    }
    
    await message.archive();
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unread messages
router.get('/unread/:organizerId', auth, async (req, res) => {
  try {
    const { organizerId } = req.params;
    const messages = await Message.findUnread(organizerId);
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search messages
router.get('/search/:query', auth, async (req, res) => {
  try {
    const { query } = req.params;
    const { organizerId } = req.query;
    
    let searchQuery = {
      $text: { $search: query }
    };
    
    if (organizerId) {
      searchQuery.organizerId = organizerId;
    }
    
    const messages = await Message.find(searchQuery)
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .limit(20);
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete message
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user can delete this message
    if (message.organizerId?.toString() !== req.user.id && req.user.role !== 'superAdmin') {
      return res.status(403).json({ message: 'Unauthorized to delete this message' });
    }
    
    await Message.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
