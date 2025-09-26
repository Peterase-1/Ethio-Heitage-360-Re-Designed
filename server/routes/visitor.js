const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Museum = require('../models/Museum');
const Event = require('../models/Event');
const Artifact = require('../models/Artifact');
const TourPackage = require('../models/TourPackage');

// GET /api/visitor/dashboard - Public visitor dashboard (no auth required)
router.get('/dashboard', async (req, res) => {
  try {
    // Get featured content for visitors
    const featuredCourses = await Course.find({ 
      isActive: true, 
      status: 'published',
      featured: true 
    })
    .select('title description category difficulty image instructor averageRating enrollmentCount price estimatedDuration')
    .sort({ averageRating: -1, enrollmentCount: -1 })
    .limit(6)
    .lean();

    // Get popular courses (fallback if no featured courses)
    const popularCourses = await Course.find({ 
      isActive: true, 
      status: 'published' 
    })
    .select('title description category difficulty image instructor averageRating enrollmentCount price estimatedDuration')
    .sort({ enrollmentCount: -1, averageRating: -1 })
    .limit(8)
    .lean();

    // Get featured museums
    const featuredMuseums = await Museum.find({ 
      isActive: true,
      featured: true 
    })
    .select('name description location image contactInfo openingHours rating')
    .sort({ rating: -1 })
    .limit(4)
    .lean();

    // Get upcoming events
    const upcomingEvents = await Event.find({
      isActive: true,
      startDate: { $gte: new Date() },
      registrationDeadline: { $gte: new Date() }
    })
    .select('title description startDate endDate location image price maxParticipants currentParticipants category')
    .sort({ startDate: 1 })
    .limit(6)
    .lean();

    // Get featured artifacts
    const featuredArtifacts = await Artifact.find({
      isActive: true,
      featured: true,
      status: 'approved'
    })
    .populate('museumId', 'name location')
    .select('name description category origin dateAcquired image historicalSignificance')
    .limit(6)
    .lean();

    // Get popular tour packages
    const popularTours = await TourPackage.find({
      isActive: true,
      status: 'active'
    })
    .select('title description duration price difficulty highlights images rating bookingCount')
    .sort({ rating: -1, bookingCount: -1 })
    .limit(4)
    .lean();

    // Get platform statistics
    const stats = {
      totalCourses: await Course.countDocuments({ isActive: true, status: 'published' }),
      totalMuseums: await Museum.countDocuments({ isActive: true }),
      totalEvents: await Event.countDocuments({ isActive: true, startDate: { $gte: new Date() } }),
      totalArtifacts: await Artifact.countDocuments({ isActive: true, status: 'approved' })
    };

    // Categories for exploration
    const categories = [
      { 
        name: 'History', 
        description: 'Explore Ethiopia\'s rich historical heritage',
        icon: 'history',
        coursesCount: await Course.countDocuments({ category: 'history', isActive: true, status: 'published' })
      },
      { 
        name: 'Art & Culture', 
        description: 'Discover traditional and contemporary art',
        icon: 'palette',
        coursesCount: await Course.countDocuments({ category: 'art', isActive: true, status: 'published' })
      },
      { 
        name: 'Archaeology', 
        description: 'Uncover ancient civilizations and discoveries',
        icon: 'archaeology',
        coursesCount: await Course.countDocuments({ category: 'archaeology', isActive: true, status: 'published' })
      },
      { 
        name: 'Architecture', 
        description: 'Learn about traditional and modern architecture',
        icon: 'building',
        coursesCount: await Course.countDocuments({ category: 'architecture', isActive: true, status: 'published' })
      }
    ];

    const dashboardData = {
      welcome: {
        title: 'Welcome to EthioHeritage360',
        subtitle: 'Discover Ethiopia\'s Rich Cultural Heritage',
        description: 'Explore museums, learn through interactive courses, and immerse yourself in the fascinating history and culture of Ethiopia.',
        callToAction: {
          primary: {
            text: 'Start Learning Today',
            action: 'browse_courses'
          },
          secondary: {
            text: 'Explore Museums',
            action: 'browse_museums'
          }
        }
      },
      featured: {
        courses: featuredCourses.length > 0 ? featuredCourses : popularCourses.slice(0, 6),
        museums: featuredMuseums,
        artifacts: featuredArtifacts,
        tours: popularTours
      },
      upcoming: {
        events: upcomingEvents.map(event => ({
          ...event,
          daysUntilStart: Math.ceil((new Date(event.startDate) - new Date()) / (1000 * 60 * 60 * 24)),
          spotsRemaining: event.maxParticipants - event.currentParticipants
        }))
      },
      categories: categories,
      stats: {
        ...stats,
        totalLearners: 1250, // This would come from user count in a real scenario
        coursesCompleted: 3420,
        successRate: 94
      },
      quickActions: [
        { 
          title: 'Browse Courses', 
          description: 'Explore our educational content',
          icon: 'book',
          action: 'browse_courses',
          color: 'blue'
        },
        { 
          title: 'Find Museums', 
          description: 'Locate museums near you',
          icon: 'map',
          action: 'find_museums',
          color: 'green'
        },
        { 
          title: 'Virtual Tours', 
          description: 'Take virtual museum tours',
          icon: 'virtual_reality',
          action: 'virtual_tours',
          color: 'purple'
        },
        { 
          title: 'Join Events', 
          description: 'Participate in cultural events',
          icon: 'calendar',
          action: 'browse_events',
          color: 'orange'
        }
      ],
      testimonials: [
        {
          name: 'Sarah Ahmed',
          role: 'History Student',
          content: 'The courses on EthioHeritage360 have deepened my understanding of Ethiopian culture immensely.',
          rating: 5,
          avatar: null
        },
        {
          name: 'Dr. Michael Tesfaye',
          role: 'Cultural Researcher',
          content: 'An excellent platform for anyone interested in Ethiopian heritage and history.',
          rating: 5,
          avatar: null
        },
        {
          name: 'Almaz Bekele',
          role: 'Art Enthusiast',
          content: 'I love the virtual museum tours and the detailed artifact descriptions.',
          rating: 5,
          avatar: null
        }
      ]
    };

    res.json({
      success: true,
      data: dashboardData,
      message: 'Visitor dashboard data retrieved successfully'
    });

  } catch (error) {
    console.error('Visitor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving visitor dashboard data',
      error: error.message
    });
  }
});

// GET /api/visitor/explore - Get exploration data
router.get('/explore', async (req, res) => {
  try {
    const { category, type = 'all', limit = 12 } = req.query;

    let query = { isActive: true };
    if (category && category !== 'all') {
      query.category = category;
    }

    const results = {};

    if (type === 'all' || type === 'courses') {
      results.courses = await Course.find({ ...query, status: 'published' })
        .select('title description category difficulty image instructor averageRating enrollmentCount price estimatedDuration')
        .sort({ averageRating: -1, enrollmentCount: -1 })
        .limit(parseInt(limit))
        .lean();
    }

    if (type === 'all' || type === 'museums') {
      results.museums = await Museum.find(query)
        .select('name description location image contactInfo openingHours rating')
        .sort({ rating: -1 })
        .limit(parseInt(limit))
        .lean();
    }

    if (type === 'all' || type === 'artifacts') {
      results.artifacts = await Artifact.find({ ...query, status: 'approved' })
        .populate('museumId', 'name location')
        .select('name description category origin dateAcquired image historicalSignificance')
        .limit(parseInt(limit))
        .lean();
    }

    if (type === 'all' || type === 'events') {
      results.events = await Event.find({ ...query, startDate: { $gte: new Date() } })
        .select('title description startDate endDate location image price maxParticipants currentParticipants category')
        .sort({ startDate: 1 })
        .limit(parseInt(limit))
        .lean();
    }

    res.json({
      success: true,
      data: results,
      filters: { category, type },
      message: 'Exploration data retrieved successfully'
    });

  } catch (error) {
    console.error('Visitor explore error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving exploration data',
      error: error.message
    });
  }
});

// GET /api/visitor/search - Search across all content
router.get('/search', async (req, res) => {
  try {
    const { q, category, type = 'all', page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchRegex = new RegExp(q, 'i');
    let baseQuery = {
      isActive: true,
      $or: [
        { title: searchRegex },
        { name: searchRegex },
        { description: searchRegex }
      ]
    };

    if (category && category !== 'all') {
      baseQuery.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const results = { total: 0, results: [] };

    if (type === 'all' || type === 'courses') {
      const courses = await Course.find({ ...baseQuery, status: 'published' })
        .select('title description category difficulty image instructor averageRating enrollmentCount')
        .skip(skip)
        .limit(parseInt(limit))
        .lean();
      
      results.results = results.results.concat(
        courses.map(course => ({ ...course, resultType: 'course' }))
      );
      results.total += courses.length;
    }

    if (type === 'all' || type === 'museums') {
      const museums = await Museum.find(baseQuery)
        .select('name description location image rating')
        .skip(skip)
        .limit(parseInt(limit))
        .lean();
      
      results.results = results.results.concat(
        museums.map(museum => ({ ...museum, resultType: 'museum' }))
      );
      results.total += museums.length;
    }

    if (type === 'all' || type === 'artifacts') {
      const artifacts = await Artifact.find({ ...baseQuery, status: 'approved' })
        .populate('museumId', 'name')
        .select('name description category image')
        .skip(skip)
        .limit(parseInt(limit))
        .lean();
      
      results.results = results.results.concat(
        artifacts.map(artifact => ({ ...artifact, resultType: 'artifact' }))
      );
      results.total += artifacts.length;
    }

    res.json({
      success: true,
      data: {
        ...results,
        query: q,
        filters: { category, type },
        pagination: {
          currentPage: parseInt(page),
          totalResults: results.total,
          hasMore: results.total === parseInt(limit)
        }
      },
      message: 'Search completed successfully'
    });

  } catch (error) {
    console.error('Visitor search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing search',
      error: error.message
    });
  }
});

// GET /api/visitor/featured - Get featured content
router.get('/featured', async (req, res) => {
  try {
    const { type = 'all' } = req.query;
    const featured = {};

    if (type === 'all' || type === 'courses') {
      featured.courses = await Course.find({ 
        isActive: true, 
        status: 'published',
        featured: true 
      })
      .select('title description category difficulty image instructor averageRating enrollmentCount')
      .sort({ averageRating: -1 })
      .limit(6)
      .lean();
    }

    if (type === 'all' || type === 'museums') {
      featured.museums = await Museum.find({ 
        isActive: true,
        featured: true 
      })
      .select('name description location image rating')
      .sort({ rating: -1 })
      .limit(4)
      .lean();
    }

    if (type === 'all' || type === 'artifacts') {
      featured.artifacts = await Artifact.find({
        isActive: true,
        featured: true,
        status: 'approved'
      })
      .populate('museumId', 'name')
      .select('name description category image')
      .limit(6)
      .lean();
    }

    res.json({
      success: true,
      data: featured,
      message: 'Featured content retrieved successfully'
    });

  } catch (error) {
    console.error('Visitor featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving featured content',
      error: error.message
    });
  }
});

module.exports = router;

