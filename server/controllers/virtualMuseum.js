const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Booking = require('../models/Booking');

// Mock data for virtual museum artifacts
const mockArtifacts = [
  {
    id: 1,
    name: 'Ancient Ethiopian Cross',
    description: 'A beautifully crafted cross from the 12th century, representing the rich Christian heritage of Ethiopia.',
    image: '/api/placeholder/300/200',
    category: 'Religious Artifacts',
    period: '12th Century',
    origin: 'Lalibela',
    museum: 'National Museum of Ethiopia',
    has3DModel: true,
    views: 1250,
    likes: 89,
    rating: 4.8,
    isFavorited: false
  },
  {
    id: 2,
    name: 'Traditional Coffee Ceremony Set',
    description: 'Complete set used in traditional Ethiopian coffee ceremonies, showcasing the cultural significance of coffee.',
    image: '/api/placeholder/300/200',
    category: 'Cultural Artifacts',
    period: '19th Century',
    origin: 'Kaffa Region',
    museum: 'Ethnological Museum',
    has3DModel: true,
    views: 980,
    likes: 67,
    rating: 4.6,
    isFavorited: false
  },
  {
    id: 3,
    name: 'Ancient Manuscript',
    description: 'Rare illuminated manuscript written in Ge\'ez, containing religious texts and historical records.',
    image: '/api/placeholder/300/200',
    category: 'Manuscripts',
    period: '15th Century',
    origin: 'Gondar',
    museum: 'Institute of Ethiopian Studies',
    has3DModel: false,
    views: 756,
    likes: 45,
    rating: 4.9,
    isFavorited: false
  },
  {
    id: 4,
    name: 'Royal Crown of Menelik II',
    description: 'Ornate crown worn by Emperor Menelik II, symbolizing the imperial power of Ethiopia.',
    image: '/api/placeholder/300/200',
    category: 'Royal Artifacts',
    period: '19th Century',
    origin: 'Addis Ababa',
    museum: 'National Museum of Ethiopia',
    has3DModel: true,
    views: 2100,
    likes: 156,
    rating: 4.9,
    isFavorited: false
  },
  {
    id: 5,
    name: 'Ancient Stone Tablet',
    description: 'Stone tablet with inscriptions in ancient Ethiopian script, providing insights into early civilization.',
    image: '/api/placeholder/300/200',
    category: 'Archaeological',
    period: '8th Century',
    origin: 'Axum',
    museum: 'Axum Museum',
    has3DModel: true,
    views: 834,
    likes: 72,
    rating: 4.7,
    isFavorited: false
  },
  {
    id: 6,
    name: 'Traditional Weaving Tools',
    description: 'Set of traditional tools used for weaving Ethiopian textiles, showcasing ancient craftsmanship.',
    image: '/api/placeholder/300/200',
    category: 'Tools & Crafts',
    period: '18th Century',
    origin: 'Dorze',
    museum: 'Cultural Heritage Museum',
    has3DModel: false,
    views: 567,
    likes: 38,
    rating: 4.4,
    isFavorited: false
  }
];

// Mock virtual tours data
const mockVirtualTours = [
  {
    id: 1,
    title: "Ancient Ethiopia: Aksum to Lalibela",
    description: "Journey through 3000 years of Ethiopian civilization",
    duration: "45 minutes",
    price: 15,
    maxParticipants: 20,
    rating: 4.9,
    image: '/api/placeholder/300/200',
    features: ['3D Artifacts', 'Expert Guide', 'Interactive Q&A']
  },
  {
    id: 2,
    title: "Royal Treasures of Ethiopia",
    description: "Explore the imperial collections and royal regalia",
    duration: "30 minutes", 
    price: 20,
    maxParticipants: 15,
    rating: 4.8,
    image: '/api/placeholder/300/200',
    features: ['3D Crown Viewing', 'Historical Context', 'Royal Stories']
  }
];

// Get all artifacts
const getArtifacts = async (req, res) => {
  try {
    const { search, category, period, origin, museum, has3D } = req.query;
    
    let artifacts = [...mockArtifacts];
    
    // Apply filters
    if (search) {
      artifacts = artifacts.filter(artifact => 
        artifact.name.toLowerCase().includes(search.toLowerCase()) ||
        artifact.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (category) {
      artifacts = artifacts.filter(artifact => artifact.category === category);
    }
    
    if (period) {
      artifacts = artifacts.filter(artifact => artifact.period === period);
    }
    
    if (origin) {
      artifacts = artifacts.filter(artifact => artifact.origin === origin);
    }
    
    if (museum) {
      artifacts = artifacts.filter(artifact => artifact.museum === museum);
    }
    
    if (has3D === 'true') {
      artifacts = artifacts.filter(artifact => artifact.has3DModel === true);
    }
    
    res.json({
      success: true,
      data: artifacts,
      total: artifacts.length
    });
  } catch (error) {
    console.error('Error fetching artifacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artifacts'
    });
  }
};

// Get single artifact
const getArtifact = async (req, res) => {
  try {
    const { id } = req.params;
    const artifact = mockArtifacts.find(a => a.id === parseInt(id));
    
    if (!artifact) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found'
      });
    }
    
    // Increment view count (in a real app, this would update the database)
    artifact.views += 1;
    
    res.json({
      success: true,
      data: artifact
    });
  } catch (error) {
    console.error('Error fetching artifact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artifact'
    });
  }
};

// Get virtual tours
const getVirtualTours = async (req, res) => {
  try {
    res.json({
      success: true,
      data: mockVirtualTours
    });
  } catch (error) {
    console.error('Error fetching virtual tours:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch virtual tours'
    });
  }
};

// Book virtual tour
const bookVirtualTour = async (req, res) => {
  try {
    const { tourId, date, time, participants, phone, specialRequests } = req.body;
    const userId = req.user.id;
    
    // Find the tour
    const tour = mockVirtualTours.find(t => t.id === parseInt(tourId));
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Virtual tour not found'
      });
    }
    
    // Validate participants count
    if (participants > tour.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${tour.maxParticipants} participants allowed for this tour`
      });
    }
    
    // Calculate total price
    const totalPrice = tour.price * participants;
    
    // Create booking
    const bookingData = {
      user: userId,
      tourId: tourId,
      tourTitle: tour.title,
      date: new Date(date + 'T' + time),
      participants: participants,
      phone: phone,
      specialRequests: specialRequests,
      totalPrice: totalPrice,
      status: 'confirmed',
      bookingType: 'virtual_tour'
    };
    
    // In a real app, save to database
    // const booking = new Booking(bookingData);
    // await booking.save();
    
    // Mock booking response
    const booking = {
      id: Date.now(), // Mock ID
      ...bookingData,
      createdAt: new Date(),
      confirmationNumber: `VT${Date.now()}`
    };
    
    res.status(201).json({
      success: true,
      message: 'Virtual tour booked successfully',
      data: {
        booking,
        tour
      }
    });
  } catch (error) {
    console.error('Error booking virtual tour:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book virtual tour'
    });
  }
};

// Get user bookings
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch actual user bookings from database
    const bookings = await Booking.find({ 
      $or: [
        { customerId: userId },
        { user: userId }
      ]
    })
    .populate('tourPackageId', 'title description price images')
    .populate('organizerId', 'firstName lastName email')
    .sort({ createdAt: -1 });
    
    // Calculate booking statistics
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length
    };
    
    res.json({
      success: true,
      data: {
        bookings,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};

// Toggle favorite artifact
const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const artifact = mockArtifacts.find(a => a.id === parseInt(id));
    if (!artifact) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found'
      });
    }
    
    // In a real app, toggle favorite in user's profile or favorites collection
    // For now, just toggle the mock property
    artifact.isFavorited = !artifact.isFavorited;
    
    if (artifact.isFavorited) {
      artifact.likes += 1;
    } else {
      artifact.likes -= 1;
    }
    
    res.json({
      success: true,
      message: artifact.isFavorited ? 'Added to favorites' : 'Removed from favorites',
      data: {
        artifactId: artifact.id,
        isFavorited: artifact.isFavorited,
        totalLikes: artifact.likes
      }
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update favorite status'
    });
  }
};

// Get artifact categories (for filters)
const getArtifactCategories = async (req, res) => {
  try {
    const categories = [...new Set(mockArtifacts.map(artifact => artifact.category))];
    const periods = [...new Set(mockArtifacts.map(artifact => artifact.period))];
    const origins = [...new Set(mockArtifacts.map(artifact => artifact.origin))];
    const museums = [...new Set(mockArtifacts.map(artifact => artifact.museum))];
    
    res.json({
      success: true,
      data: {
        categories,
        periods,
        origins,
        museums
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

module.exports = {
  getArtifacts,
  getArtifact,
  getVirtualTours,
  bookVirtualTour,
  getUserBookings,
  toggleFavorite,
  getArtifactCategories
};
