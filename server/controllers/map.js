const HeritageSite = require('../models/HeritageSite');
const Museum = require('../models/Museum');

// Comprehensive Ethiopian Heritage Sites Data
const ethiopianHeritageSites = [
  // UNESCO World Heritage Sites
  {
    id: 1,
    name: 'Rock-Hewn Churches of Lalibela',
    lat: 12.0319,
    lng: 39.0406,
    category: 'UNESCO World Heritage',
    type: 'Cultural',
    region: 'Amhara',
    description: 'Eleven medieval churches carved from rock in the 12th and 13th centuries.',
    yearInscribed: 1978,
    significance: 'Outstanding universal value as a masterpiece of human creative genius',
    images: ['/images/lalibela-1.jpg', '/images/lalibela-2.jpg'],
    facilities: ['Guided Tours', 'Museum', 'Restaurant', 'Parking'],
    bestTimeToVisit: 'October to March',
    entryFee: '200 ETB',
    openingHours: '6:00 AM - 6:00 PM'
  },
  {
    id: 2,
    name: 'Fasil Ghebbi, Gondar Region',
    lat: 12.6039,
    lng: 37.4662,
    category: 'UNESCO World Heritage',
    type: 'Cultural',
    region: 'Amhara',
    description: 'Fortress-city of the Emperors of Ethiopia (17th-18th centuries).',
    yearInscribed: 1979,
    significance: 'Royal enclosure with palaces, churches, monasteries, and public buildings',
    images: ['/images/gondar-1.jpg', '/images/gondar-2.jpg'],
    facilities: ['Guided Tours', 'Museum', 'Restaurant', 'Parking'],
    bestTimeToVisit: 'October to March',
    entryFee: '200 ETB',
    openingHours: '8:00 AM - 5:00 PM'
  },
  {
    id: 3,
    name: 'Aksum Obelisks',
    lat: 14.1312,
    lng: 38.7229,
    category: 'UNESCO World Heritage',
    type: 'Cultural',
    region: 'Tigray',
    description: 'Ancient kingdom ruins with towering obelisks and archaeological remains.',
    yearInscribed: 1980,
    significance: 'Capital of the ancient Aksumite Kingdom',
    images: ['/images/aksum-1.jpg', '/images/aksum-2.jpg'],
    facilities: ['Museum', 'Guided Tours', 'Restaurant', 'Hotel'],
    bestTimeToVisit: 'October to March',
    entryFee: '200 ETB',
    openingHours: '7:00 AM - 6:00 PM'
  },
  {
    id: 4,
    name: 'Lower Valley of the Awash',
    lat: 11.1056,
    lng: 40.5817,
    category: 'UNESCO World Heritage',
    type: 'Cultural',
    region: 'Afar',
    description: 'Paleontological site where Lucy and other hominid fossils were discovered.',
    yearInscribed: 1980,
    significance: 'Most important site for the study of human evolution',
    images: ['/images/awash-1.jpg', '/images/awash-2.jpg'],
    facilities: ['Research Center', 'Guided Tours', 'Camping'],
    bestTimeToVisit: 'November to February',
    entryFee: '150 ETB',
    openingHours: '8:00 AM - 5:00 PM'
  },
  {
    id: 5,
    name: 'Lower Valley of the Omo',
    lat: 5.0945,
    lng: 35.9784,
    category: 'UNESCO World Heritage',
    type: 'Cultural',
    region: 'Southern Nations',
    description: 'Prehistoric site crucial to the study of human evolution.',
    yearInscribed: 1980,
    significance: 'Rich fossil deposits spanning 4 million years',
    images: ['/images/omo-1.jpg', '/images/omo-2.jpg'],
    facilities: ['Research Station', 'Guided Tours'],
    bestTimeToVisit: 'November to March',
    entryFee: '150 ETB',
    openingHours: '8:00 AM - 4:00 PM'
  },
  {
    id: 6,
    name: 'Tiya Stone Monuments',
    lat: 8.4500,
    lng: 38.6167,
    category: 'UNESCO World Heritage',
    type: 'Cultural',
    region: 'Southern Nations',
    description: 'Archaeological site with 36 monuments including 32 carved stelae.',
    yearInscribed: 1980,
    significance: 'Outstanding example of Ethiopian stelae tradition',
    images: ['/images/tiya-1.jpg', '/images/tiya-2.jpg'],
    facilities: ['Information Center', 'Guided Tours', 'Parking'],
    bestTimeToVisit: 'October to March',
    entryFee: '50 ETB',
    openingHours: '8:00 AM - 5:00 PM'
  },
  {
    id: 7,
    name: 'Harar Jugol, Fortified Historic Town',
    lat: 9.3111,
    lng: 42.1185,
    category: 'UNESCO World Heritage',
    type: 'Cultural',
    region: 'Harari',
    description: 'Fortified historic town considered the fourth holiest city of Islam.',
    yearInscribed: 2006,
    significance: 'Important center of Islamic culture with unique architecture',
    images: ['/images/harar-1.jpg', '/images/harar-2.jpg'],
    facilities: ['Museums', 'Mosques', 'Markets', 'Hotels', 'Restaurants'],
    bestTimeToVisit: 'October to March',
    entryFee: '100 ETB',
    openingHours: '24/7 (city)'
  },
  {
    id: 8,
    name: 'Konso Cultural Landscape',
    lat: 5.2500,
    lng: 37.4833,
    category: 'UNESCO World Heritage',
    type: 'Cultural',
    region: 'Southern Nations',
    description: 'Living cultural landscape of terraced agriculture and settlements.',
    yearInscribed: 2011,
    significance: 'Outstanding example of sustainable land use',
    images: ['/images/konso-1.jpg', '/images/konso-2.jpg'],
    facilities: ['Cultural Center', 'Guided Tours', 'Homestays'],
    bestTimeToVisit: 'October to March',
    entryFee: '100 ETB',
    openingHours: 'Daylight hours'
  },
  {
    id: 9,
    name: 'Simien Mountains National Park',
    lat: 13.2667,
    lng: 38.0000,
    category: 'UNESCO World Heritage',
    type: 'Natural',
    region: 'Amhara',
    description: 'Dramatic landscape with endemic wildlife including Gelada baboons.',
    yearInscribed: 1978,
    significance: 'Spectacular landscapes and endemic species',
    images: ['/images/simien-1.jpg', '/images/simien-2.jpg'],
    facilities: ['Camping', 'Trekking', 'Lodge', 'Guide Services'],
    bestTimeToVisit: 'October to March',
    entryFee: '90 ETB',
    openingHours: '24/7 (park)'
  },

  // Major Museums and Cultural Sites
  {
    id: 10,
    name: 'National Museum of Ethiopia',
    lat: 9.0192,
    lng: 38.7378,
    category: 'National Museum',
    type: 'Museum',
    region: 'Addis Ababa',
    description: 'Home to Lucy and other important archaeological finds.',
    significance: 'Premier museum showcasing Ethiopian history and culture',
    images: ['/images/national-museum-1.jpg'],
    facilities: ['Exhibitions', 'Gift Shop', 'Library', 'Parking'],
    bestTimeToVisit: 'Year round',
    entryFee: '20 ETB',
    openingHours: '8:30 AM - 5:30 PM'
  },
  {
    id: 11,
    name: 'Ethnological Museum',
    lat: 9.0365,
    lng: 38.7635,
    category: 'Museum',
    type: 'Museum',
    region: 'Addis Ababa',
    description: 'Former palace showcasing Ethiopian cultural diversity.',
    significance: 'Cultural heritage and traditions of Ethiopian peoples',
    images: ['/images/ethnological-museum-1.jpg'],
    facilities: ['Cultural Displays', 'Gardens', 'Cafe', 'Gift Shop'],
    bestTimeToVisit: 'Year round',
    entryFee: '15 ETB',
    openingHours: '8:00 AM - 5:00 PM'
  },
  {
    id: 12,
    name: 'Blue Nile Falls (Tis Issat)',
    lat: 11.5167,
    lng: 37.5833,
    category: 'Natural Heritage',
    type: 'Natural',
    region: 'Amhara',
    description: 'Spectacular waterfall on the Blue Nile River.',
    significance: 'One of Ethiopia\'s most famous natural attractions',
    images: ['/images/blue-nile-falls-1.jpg'],
    facilities: ['Viewpoints', 'Walking Trails', 'Local Guides'],
    bestTimeToVisit: 'September to November',
    entryFee: '50 ETB',
    openingHours: 'Daylight hours'
  },
  {
    id: 13,
    name: 'Danakil Depression',
    lat: 14.2417,
    lng: 40.3000,
    category: 'Natural Heritage',
    type: 'Natural',
    region: 'Afar',
    description: 'One of the lowest and hottest places on Earth with unique geology.',
    significance: 'Unique geological formation and extreme environment',
    images: ['/images/danakil-1.jpg'],
    facilities: ['Guided Tours', 'Specialized Camping'],
    bestTimeToVisit: 'November to March',
    entryFee: '300 ETB',
    openingHours: 'Multi-day tours'
  },
  {
    id: 14,
    name: 'Bale Mountains National Park',
    lat: 7.0000,
    lng: 39.8333,
    category: 'Natural Heritage',
    type: 'Natural',
    region: 'Oromia',
    description: 'High-altitude plateau with endemic wildlife and plant species.',
    significance: 'Important biodiversity hotspot and watershed',
    images: ['/images/bale-mountains-1.jpg'],
    facilities: ['Camping', 'Trekking', 'Wildlife Viewing', 'Lodge'],
    bestTimeToVisit: 'October to March',
    entryFee: '90 ETB',
    openingHours: '24/7 (park)'
  },
  {
    id: 15,
    name: 'Omo Valley Cultural Sites',
    lat: 5.5000,
    lng: 36.0000,
    category: 'Cultural Heritage',
    type: 'Cultural',
    region: 'Southern Nations',
    description: 'Home to diverse indigenous tribes with unique cultures.',
    significance: 'Living cultural heritage and traditional ways of life',
    images: ['/images/omo-valley-1.jpg'],
    facilities: ['Cultural Tours', 'Homestays', 'Local Guides'],
    bestTimeToVisit: 'October to March',
    entryFee: '200 ETB',
    openingHours: 'Daylight hours'
  }
];

// Get all heritage sites
const getHeritageSites = async (req, res) => {
  try {
    const { category, region, type, designation } = req.query;

    // Build query
    const query = { status: 'active', verified: true };

    if (category) {
      query.category = category;
    }

    if (region) {
      query['location.region'] = region;
    }

    if (type) {
      query.type = type;
    }

    if (designation) {
      query.designation = designation;
    }

    // Fetch from database
    const sites = await HeritageSite.find(query)
      .select('name description location coordinates type category designation significance media.coverImage')
      .sort({ featured: -1, 'tourism.annualVisitors': -1 })
      .limit(100);

    // Transform data for frontend compatibility
    const transformedSites = sites.map(site => ({
      id: site._id,
      name: site.name,
      description: site.description,
      region: site.location.region,
      category: site.designation,
      lat: site.location.coordinates.latitude,
      lng: site.location.coordinates.longitude,
      type: site.type,
      designation: site.designation,
      significance: site.significance,
      coverImage: site.media?.coverImage
    }));

    res.json({
      success: true,
      data: transformedSites,
      total: transformedSites.length
    });
  } catch (error) {
    console.error('Error fetching heritage sites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch heritage sites'
    });
  }
};

// Get single heritage site
const getHeritageSite = async (req, res) => {
  try {
    const { id } = req.params;
    const site = ethiopianHeritageSites.find(s => s.id === parseInt(id));

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Heritage site not found'
      });
    }

    res.json({
      success: true,
      data: site
    });
  } catch (error) {
    console.error('Error fetching heritage site:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch heritage site'
    });
  }
};

// Get nearby sites
const getNearbyHeritageSites = async (req, res) => {
  try {
    const { lat, lng, radius = 100 } = req.query; // radius in km

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    // Calculate distance using Haversine formula
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const nearbySites = ethiopianHeritageSites
      .map(site => ({
        ...site,
        distance: calculateDistance(userLat, userLng, site.lat, site.lng)
      }))
      .filter(site => site.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      data: nearbySites,
      total: nearbySites.length
    });
  } catch (error) {
    console.error('Error fetching nearby sites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby sites'
    });
  }
};

// Get site categories and regions for filters
const getSiteFilters = async (req, res) => {
  try {
    const categories = [...new Set(ethiopianHeritageSites.map(site => site.category))];
    const regions = [...new Set(ethiopianHeritageSites.map(site => site.region))];
    const types = [...new Set(ethiopianHeritageSites.map(site => site.type))];

    res.json({
      success: true,
      data: {
        categories,
        regions,
        types
      }
    });
  } catch (error) {
    console.error('Error fetching site filters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch site filters'
    });
  }
};

// Search heritage sites
const searchHeritageSites = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchTerm = query.toLowerCase();
    const results = ethiopianHeritageSites.filter(site =>
      site.name.toLowerCase().includes(searchTerm) ||
      site.description.toLowerCase().includes(searchTerm) ||
      site.region.toLowerCase().includes(searchTerm) ||
      site.category.toLowerCase().includes(searchTerm)
    );

    res.json({
      success: true,
      data: results,
      total: results.length,
      query: query
    });
  } catch (error) {
    console.error('Error searching heritage sites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search heritage sites'
    });
  }
};

module.exports = {
  getHeritageSites,
  getHeritageSite,
  getNearbyHeritageSites,
  getSiteFilters,
  searchHeritageSites
};
