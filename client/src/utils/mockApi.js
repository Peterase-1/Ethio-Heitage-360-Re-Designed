// Mock API service for development without backend
const MOCK_USERS = [
  // Super Administrators (from seed.js)
  {
    id: 1,
    email: 'melkamuwako5@admin.com',
    password: 'melkamuwako5',
    name: 'Melkamu Wako',
    role: 'super_admin',
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    email: 'abdurazakm343@admin.com',
    password: 'THpisvaHUbQNMsbX',
    name: 'Abdurazak M',
    role: 'super_admin',
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    email: 'student.pasegid@admin.com',
    password: 'Fs4HwlXCW4SJvkyN',
    name: 'Student Pasegid',
    role: 'super_admin',
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    email: 'naolaboma@admin.com',
    password: 'QR7ICwI5s6VMgAZD',
    name: 'Naol Aboma',
    role: 'super_admin',
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    email: 'superadmin@ethioheritage360.com',
    password: 'SuperAdmin2024!',
    name: 'Super Administrator',
    role: 'super_admin',
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 6,
    email: 'admin@ethioheritage360.com',
    password: 'AdminPass2024!',
    name: 'System Administrator',
    role: 'admin',
    verified: true,
    createdAt: new Date().toISOString()
  },

  // Museum Administrators (from ADMIN_CREDENTIALS.md)
  {
    id: 7,
    email: 'nationalmuseum@ethioheritage360.com',
    password: 'NatMuseum2024!',
    name: 'National Museum Admin',
    role: 'museum_admin',
    museum: 'National Museum of Ethiopia',
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 8,
    email: 'ethnomuseum@ethioheritage360.com',
    password: 'EthnoAdmin2024!',
    name: 'Ethnological Museum Admin',
    role: 'museum_admin',
    museum: 'Ethnological Museum',
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 9,
    email: 'royalheritage@ethioheritage360.com',
    password: 'RoyalAdmin2024!',
    name: 'Royal Heritage Admin',
    role: 'museum_admin',
    museum: 'Royal Heritage Museum',
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 10,
    email: 'museum.admin@ethioheritage360.com',
    password: 'museum123',
    name: 'National Museum Admin',
    role: 'museum',
    museum: 'National Museum of Ethiopia',
    verified: true,
    createdAt: new Date().toISOString()
  },

  // Tour Organizers
  {
    id: 11,
    email: 'tourguide@ethioheritage360.com',
    password: 'TourGuide2024!',
    name: 'Senior Tour Guide',
    role: 'tour_admin',
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 12,
    email: 'culturaltours@ethioheritage360.com',
    password: 'CulturalTour2024!',
    name: 'Cultural Tour Specialist',
    role: 'tour_admin',
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 13,
    email: 'organizer@heritagetours.et',
    password: 'organizer123',
    name: 'Heritage Tours Ethiopia',
    role: 'organizer',
    verified: true,
    createdAt: new Date().toISOString()
  },

  // Educators
  {
    id: 14,
    email: 'educator@ethioheritage360.com',
    password: 'Educator2024!',
    name: 'Heritage Educator',
    role: 'educator',
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 15,
    email: 'researcher@ethioheritage360.com',
    password: 'Research2024!',
    name: 'Research Scholar',
    role: 'educator',
    verified: true,
    createdAt: new Date().toISOString()
  },

  // Visitors
  {
    id: 16,
    email: 'visitor@ethioheritage360.com',
    password: 'Visitor2024!',
    name: 'General Visitor',
    role: 'visitor',
    verified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 17,
    email: 'enthusiast@ethioheritage360.com',
    password: 'Heritage2024!',
    name: 'Heritage Enthusiast',
    role: 'visitor',
    verified: true,
    createdAt: new Date().toISOString()
  }
];

// Utility function to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generate a mock JWT token
const generateMockToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
  };
  return 'mock_jwt_' + btoa(JSON.stringify(payload));
};

// Parse mock JWT token
const parseMockToken = (token) => {
  if (!token || !token.startsWith('mock_jwt_')) return null;
  try {
    return JSON.parse(atob(token.replace('mock_jwt_', '')));
  } catch {
    return null;
  }
};

// Mock data for Museum Admin and User features
const MOCK_MUSEUM_ARTIFACTS = [
  {
    _id: '1',
    name: 'Ancient Ethiopian Crown',
    description: 'A royal crown from the 15th century Solomonic dynasty',
    category: 'Royal Artifacts',
    period: '15th Century',
    images: ['crown1.jpg'],
    isAvailableForRental: true,
    rentalPrice: 50000,
    status: 'approved',
    museum: 'National Museum of Ethiopia',
    createdAt: new Date('2025-01-10').toISOString()
  },
  {
    _id: '2',
    name: 'Traditional Coffee Set',
    description: 'Complete traditional Ethiopian coffee ceremony set',
    category: 'Cultural Artifacts',
    period: '19th Century',
    images: ['coffee1.jpg'],
    isAvailableForRental: true,
    rentalPrice: 15000,
    status: 'pending',
    museum: 'Ethnological Museum',
    createdAt: new Date('2025-01-08').toISOString()
  },
  {
    _id: '3',
    name: 'Manuscripts Collection',
    description: 'Ancient Ge\'ez manuscripts and religious texts',
    category: 'Documents',
    period: '14th-16th Century',
    images: ['manuscript1.jpg'],
    isAvailableForRental: false,
    rentalPrice: 0,
    status: 'approved',
    museum: 'Trinity Cathedral Museum',
    createdAt: new Date('2025-01-05').toISOString()
  }
];

const MOCK_VIRTUAL_EXHIBITS = [
  {
    _id: '1',
    title: 'Royal Ethiopian Heritage',
    museum: 'National Museum of Ethiopia',
    description: 'Explore the rich royal history of Ethiopia through ancient crowns, ceremonial objects, and manuscripts.',
    artifacts: 25,
    thumbnail: 'royal-heritage.jpg',
    category: 'Royal History',
    rating: 4.8,
    views: 1234,
    isInteractive: true,
    has3D: true,
    status: 'approved',
    createdAt: new Date('2025-01-12').toISOString()
  },
  {
    _id: '2',
    title: 'Coffee Culture Journey',
    museum: 'Ethnological Museum',
    description: 'Discover the birthplace of coffee and its cultural significance in Ethiopian society.',
    artifacts: 18,
    thumbnail: 'coffee-culture.jpg',
    category: 'Cultural Heritage',
    rating: 4.6,
    views: 987,
    isInteractive: true,
    has3D: false,
    status: 'approved',
    createdAt: new Date('2025-01-10').toISOString()
  },
  {
    _id: '3',
    title: 'Ancient Manuscripts',
    museum: 'Trinity Cathedral Museum',
    description: 'Sacred texts and illuminated manuscripts showcasing Ethiopian Orthodox traditions.',
    artifacts: 32,
    thumbnail: 'manuscripts.jpg',
    category: 'Religious Heritage',
    rating: 4.9,
    views: 756,
    isInteractive: false,
    has3D: true,
    status: 'approved',
    createdAt: new Date('2025-01-08').toISOString()
  }
];

const MOCK_HERITAGE_SITES = [
  {
    _id: '1',
    name: 'Lalibela Rock Churches',
    region: 'Amhara',
    description: 'Eleven medieval monolithic churches carved from rock, a UNESCO World Heritage Site.',
    coordinates: { lat: 12.0333, lng: 39.0333 },
    category: 'Religious Site',
    rating: 4.9,
    images: ['lalibela1.jpg', 'lalibela2.jpg'],
    virtualTourAvailable: true,
    audioGuideAvailable: true
  },
  {
    _id: '2',
    name: 'Axum Obelisks',
    region: 'Tigray',
    description: 'Ancient granite stelae marking the heart of the ancient Kingdom of Axum.',
    coordinates: { lat: 14.1333, lng: 38.7167 },
    category: 'Archaeological Site',
    rating: 4.7,
    images: ['axum1.jpg', 'axum2.jpg'],
    virtualTourAvailable: true,
    audioGuideAvailable: true
  },
  {
    _id: '3',
    name: 'Simien Mountains',
    region: 'Amhara',
    description: 'Dramatic mountain landscape with unique wildlife and stunning vistas.',
    coordinates: { lat: 13.2333, lng: 38.0333 },
    category: 'Natural Heritage',
    rating: 4.8,
    images: ['simien1.jpg', 'simien2.jpg'],
    virtualTourAvailable: false,
    audioGuideAvailable: true
  }
];

const MOCK_EVENTS = [
  {
    _id: '1',
    title: 'Ethiopian Coffee Ceremony Workshop',
    museum: 'Ethnological Museum',
    date: '2025-02-15',
    time: '14:00',
    duration: '2 hours',
    price: 25,
    capacity: 20,
    registered: 15,
    category: 'Workshop',
    description: 'Learn the traditional Ethiopian coffee ceremony from expert practitioners.',
    status: 'upcoming'
  },
  {
    _id: '2',
    title: 'Ancient Manuscripts Exhibition Opening',
    museum: 'Trinity Cathedral Museum',
    date: '2025-02-20',
    time: '18:00',
    duration: '3 hours',
    price: 0,
    capacity: 100,
    registered: 67,
    category: 'Exhibition',
    description: 'Grand opening of our new manuscripts collection with guided tours.',
    status: 'upcoming'
  },
  {
    _id: '3',
    title: 'Virtual Reality Heritage Tour',
    museum: 'National Museum',
    date: '2025-02-25',
    time: '10:00',
    duration: '1 hour',
    price: 15,
    capacity: 12,
    registered: 8,
    category: 'VR Experience',
    description: 'Immersive VR journey through Ethiopian historical sites.',
    status: 'upcoming'
  }
];

const MOCK_USER_BOOKINGS = [
  {
    id: '1',
    type: 'ticket',
    museum: 'National Museum of Ethiopia',
    date: '2025-01-10',
    status: 'completed',
    price: 20,
    visitors: 2
  },
  {
    id: '2',
    type: 'event',
    title: 'Coffee Workshop',
    museum: 'Ethnological Museum',
    date: '2025-01-15',
    status: 'completed',
    price: 25,
    visitors: 1
  },
  {
    id: '3',
    type: 'rental',
    artifactName: 'Traditional Coffee Set',
    museum: 'Ethnological Museum',
    date: '2025-02-01',
    status: 'upcoming',
    price: 15000,
    duration: '7 days'
  }
];

// Mock courses data for education
const MOCK_COURSES = [
  {
    _id: 'course-1',
    id: 'course-1',
    title: 'Ethiopian History Fundamentals',
    description: 'Explore the rich history of Ethiopia from ancient civilizations to modern day. Learn about the Kingdom of Aksum, medieval dynasties, and the formation of modern Ethiopia.',
    category: 'history',
    difficulty: 'beginner',
    estimatedDuration: 240, // 4 hours in minutes
    instructor: 'Dr. Abebe Kebede',
    tags: ['history', 'ancient civilizations', 'kingdoms', 'culture'],
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
    rating: 4.8,
    enrolled: 1250,
    lessons: 8,
    objectives: [
      'Understand the major historical periods of Ethiopian history',
      'Identify the unique aspects of Ethiopian cultural heritage',
      'Recognize the influence of different religions on Ethiopian society',
      'Appreciate the diversity of Ethiopian traditional arts and crafts'
    ],
    requirements: [
      'No prior knowledge required',
      'Interest in cultural heritage and history',
      'Basic English proficiency'
    ],
    topics: ['Ancient Kingdoms', 'Religious Sites', 'Cultural Practices', 'Traditional Arts'],
    createdAt: new Date('2025-01-10').toISOString(),
    status: 'published'
  },
  {
    _id: 'course-2',
    id: 'course-2',
    title: 'Rock-Hewn Churches of Lalibela',
    description: 'Dive deep into the architectural marvels of Lalibela and other rock-hewn churches. Understand their construction techniques, spiritual significance, and UNESCO World Heritage status.',
    category: 'archaeology',
    difficulty: 'intermediate',
    estimatedDuration: 480, // 8 hours
    instructor: 'Dr. Meron Teshome',
    tags: ['architecture', 'religious sites', 'UNESCO', 'medieval', 'Christianity'],
    image: 'https://images.unsplash.com/photo-1571419654798-3d7d9c8a5e9e?w=600&h=400&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1571419654798-3d7d9c8a5e9e?w=300&h=200&fit=crop',
    rating: 4.9,
    enrolled: 850,
    lessons: 12,
    objectives: [
      'Analyze the architectural techniques used in rock-hewn construction',
      'Understand the religious and cultural context of these churches',
      'Evaluate the preservation challenges and conservation efforts',
      'Appreciate the artistic and symbolic elements in church design'
    ],
    requirements: [
      'Basic knowledge of Ethiopian history recommended',
      'Interest in architecture and archaeology',
      'Understanding of religious symbolism helpful'
    ],
    topics: ['Medieval Architecture', 'Religious Art', 'Construction Techniques', 'Pilgrimage Sites'],
    createdAt: new Date('2025-01-08').toISOString(),
    status: 'published'
  },
  {
    _id: 'course-3',
    id: 'course-3',
    title: 'Ethiopian Cultural Traditions',
    description: 'Discover the diverse cultural practices and traditions across Ethiopian regions. Learn about festivals, ceremonies, music, dance, and traditional customs that define Ethiopian identity.',
    category: 'culture',
    difficulty: 'beginner',
    estimatedDuration: 180, // 3 hours
    instructor: 'Professor Almaz Haile',
    tags: ['culture', 'traditions', 'festivals', 'music', 'dance', 'ceremonies'],
    image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=600&h=400&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop',
    rating: 4.7,
    enrolled: 1100,
    lessons: 6,
    objectives: [
      'Identify major Ethiopian festivals and their significance',
      'Understand regional variations in cultural practices',
      'Recognize traditional music and dance forms',
      'Appreciate the role of customs in community life'
    ],
    requirements: [
      'Open mind and cultural curiosity',
      'No prior knowledge required',
      'Interest in anthropology or sociology helpful'
    ],
    topics: ['Festivals', 'Ceremonies', 'Music & Dance', 'Regional Customs'],
    createdAt: new Date('2025-01-05').toISOString(),
    status: 'published'
  },
  {
    _id: 'course-4',
    id: 'course-4',
    title: 'Kingdom of Aksum: Ancient Ethiopian Empire',
    description: 'Explore the powerful Kingdom of Aksum, one of the great civilizations of the ancient world. Study its trade networks, monumental architecture, and lasting cultural impact.',
    category: 'history',
    difficulty: 'intermediate',
    estimatedDuration: 360, // 6 hours
    instructor: 'Dr. Tekle Hagos',
    tags: ['ancient history', 'Aksum', 'trade routes', 'obelisks', 'archaeology'],
    image: 'https://images.unsplash.com/photo-1571419654798-3d7d9c8a5e9e?w=600&h=400&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1571419654798-3d7d9c8a5e9e?w=300&h=200&fit=crop',
    rating: 4.8,
    enrolled: 720,
    lessons: 10,
    objectives: [
      'Trace the rise and expansion of the Aksumite Empire',
      'Analyze the kingdom\'s role in ancient trade networks',
      'Examine archaeological evidence from Aksum',
      'Understand the kingdom\'s influence on modern Ethiopia'
    ],
    requirements: [
      'Basic knowledge of ancient history helpful',
      'Interest in archaeology and trade history',
      'Understanding of geographical concepts'
    ],
    topics: ['Ancient Trade', 'Monumental Architecture', 'Royal Tombs', 'International Relations'],
    createdAt: new Date('2025-01-12').toISOString(),
    status: 'published'
  },
  {
    _id: 'course-5',
    id: 'course-5',
    title: 'Ethiopian Coffee Culture and Heritage',
    description: 'Learn about Ethiopia as the birthplace of coffee and explore the deep cultural significance of coffee in Ethiopian society. Understand traditional preparation methods and ceremonial practices.',
    category: 'culture',
    difficulty: 'beginner',
    estimatedDuration: 150, // 2.5 hours
    instructor: 'Ato Girma Wolde',
    tags: ['coffee', 'culture', 'ceremonies', 'agriculture', 'traditions'],
    image: 'https://images.unsplash.com/photo-1595881823069-64ba5e3cf738?w=600&h=400&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1595881823069-64ba5e3cf738?w=300&h=200&fit=crop',
    rating: 4.6,
    enrolled: 980,
    lessons: 5,
    objectives: [
      'Understand the historical origins of coffee cultivation',
      'Learn traditional coffee preparation methods',
      'Appreciate the cultural and social aspects of coffee ceremonies',
      'Recognize the economic importance of coffee to Ethiopia'
    ],
    requirements: [
      'Interest in food culture and traditions',
      'No prior knowledge required',
      'Curiosity about agricultural practices'
    ],
    topics: ['Coffee Origins', 'Traditional Ceremonies', 'Agricultural Practices', 'Cultural Significance'],
    createdAt: new Date('2025-01-15').toISOString(),
    status: 'published'
  },
  {
    _id: 'course-6',
    id: 'course-6',
    title: 'Ethiopian Languages and Scripts',
    description: 'Explore the linguistic diversity of Ethiopia and learn about the ancient Ge\'ez script. Understand the role of language in preserving cultural heritage and religious texts.',
    category: 'language',
    difficulty: 'advanced',
    estimatedDuration: 600, // 10 hours
    instructor: 'Dr. Berhane Meskel',
    tags: ['languages', 'scripts', 'Geez', 'linguistics', 'manuscripts'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
    rating: 4.9,
    enrolled: 450,
    lessons: 15,
    objectives: [
      'Identify major Ethiopian languages and their families',
      'Read and understand basic Ge\'ez script',
      'Appreciate the role of languages in cultural preservation',
      'Analyze historical manuscripts and inscriptions'
    ],
    requirements: [
      'Strong interest in linguistics or languages',
      'Basic understanding of writing systems',
      'Patience for detailed study'
    ],
    topics: ['Language Families', 'Ge\'ez Script', 'Historical Manuscripts', 'Modern Languages'],
    createdAt: new Date('2025-01-18').toISOString(),
    status: 'published'
  }
];

// Mock tours data
const MOCK_TOURS = [
  {
    _id: '1',
    id: '1',
    title: 'Lalibela Rock Churches Historical Tour',
    description: 'Experience the wonder of Lalibela\'s 11 medieval rock-hewn churches, a UNESCO World Heritage Site. This comprehensive tour covers the history, architecture, and religious significance of these magnificent structures.',
    organizer: {
      _id: '11',
      name: 'Senior Tour Guide',
      email: 'tourguide@ethioheritage360.com',
      profile: { company: 'Heritage Tours Ethiopia' }
    },
    type: 'religious',
    duration: {
      days: 3,
      hours: 0
    },
    groupSize: {
      min: 4,
      max: 15
    },
    pricing: {
      adult: 2500,
      child: 1500,
      currency: 'ETB'
    },
    schedule: [{
      startDate: new Date('2025-02-15T09:00:00Z'),
      endDate: new Date('2025-02-17T18:00:00Z'),
      availableSpots: 12,
      bookedSpots: 3
    }],
    media: {
      images: [{
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
        caption: 'Church of St. George at Lalibela',
        isPrimary: true
      }]
    },
    rating: {
      average: 4.8,
      count: 24
    },
    status: 'published',
    totalBookings: 156,
    location: 'Lalibela, Amhara Region',
    createdAt: new Date('2025-01-10T08:00:00Z').toISOString(),
    updatedAt: new Date('2025-01-12T10:30:00Z').toISOString()
  },
  {
    _id: '2',
    id: '2',
    title: 'Axum Ancient Kingdom Archaeological Tour',
    description: 'Discover the ancient Kingdom of Axum, exploring the famous obelisks, Queen of Sheba\'s palace ruins, and archaeological treasures that tell the story of one of Africa\'s greatest civilizations.',
    organizer: {
      _id: '12',
      name: 'Cultural Tour Specialist',
      email: 'culturaltours@ethioheritage360.com',
      profile: { company: 'Ethiopian Cultural Heritage Tours' }
    },
    type: 'archaeological',
    duration: {
      days: 2,
      hours: 0
    },
    groupSize: {
      min: 6,
      max: 20
    },
    pricing: {
      adult: 1800,
      child: 1200,
      currency: 'ETB'
    },
    schedule: [{
      startDate: new Date('2025-02-20T08:00:00Z'),
      endDate: new Date('2025-02-21T17:00:00Z'),
      availableSpots: 18,
      bookedSpots: 7
    }],
    media: {
      images: [{
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
        caption: 'Axum Obelisk',
        isPrimary: true
      }]
    },
    rating: {
      average: 4.6,
      count: 18
    },
    status: 'published',
    totalBookings: 89,
    location: 'Axum, Tigray Region',
    createdAt: new Date('2025-01-08T14:20:00Z').toISOString(),
    updatedAt: new Date('2025-01-11T16:45:00Z').toISOString()
  },
  {
    _id: '3',
    id: '3',
    title: 'Addis Ababa City Heritage Walk',
    description: 'Explore Ethiopia\'s capital city through its historical landmarks, museums, and cultural sites. Visit the National Museum, Ethnological Museum, and traditional markets.',
    organizer: {
      _id: '13',
      name: 'Heritage Tours Ethiopia',
      email: 'organizer@heritagetours.et',
      profile: { company: 'Heritage Tours Ethiopia' }
    },
    type: 'cultural',
    duration: {
      days: 1,
      hours: 6
    },
    groupSize: {
      min: 2,
      max: 12
    },
    pricing: {
      adult: 800,
      child: 500,
      currency: 'ETB'
    },
    schedule: [{
      startDate: new Date('2025-02-10T09:00:00Z'),
      endDate: new Date('2025-02-10T15:00:00Z'),
      availableSpots: 10,
      bookedSpots: 2
    }],
    media: {
      images: [{
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
        caption: 'National Museum of Ethiopia',
        isPrimary: true
      }]
    },
    rating: {
      average: 4.4,
      count: 31
    },
    status: 'published',
    totalBookings: 203,
    location: 'Addis Ababa',
    createdAt: new Date('2025-01-05T11:15:00Z').toISOString(),
    updatedAt: new Date('2025-01-09T09:30:00Z').toISOString()
  },
  {
    _id: '4',
    id: '4',
    title: 'Harar Historic City Cultural Experience',
    description: 'Immerse yourself in the ancient walled city of Harar, exploring traditional coffee culture, colorful markets, and historic mosques in this UNESCO World Heritage Site.',
    organizer: {
      _id: '11',
      name: 'Senior Tour Guide',
      email: 'tourguide@ethioheritage360.com',
      profile: { company: 'Heritage Tours Ethiopia' }
    },
    type: 'cultural',
    duration: {
      days: 2,
      hours: 0
    },
    groupSize: {
      min: 4,
      max: 16
    },
    pricing: {
      adult: 2200,
      child: 1400,
      currency: 'ETB'
    },
    schedule: [{
      startDate: new Date('2025-03-01T08:00:00Z'),
      endDate: new Date('2025-03-02T18:00:00Z'),
      availableSpots: 14,
      bookedSpots: 6
    }],
    media: {
      images: [{
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
        caption: 'Harar Old Town',
        isPrimary: true
      }]
    },
    rating: {
      average: 4.7,
      count: 15
    },
    status: 'published',
    totalBookings: 67,
    location: 'Harar, Eastern Ethiopia',
    createdAt: new Date('2025-01-12T13:40:00Z').toISOString(),
    updatedAt: new Date('2025-01-13T15:20:00Z').toISOString()
  },
  {
    _id: '5',
    id: '5',
    title: 'Simien Mountains Adventure & Heritage Tour',
    description: 'Combine natural beauty with cultural heritage in this adventure tour through the Simien Mountains, visiting local villages and learning about highland Ethiopian culture.',
    organizer: {
      _id: '12',
      name: 'Cultural Tour Specialist',
      email: 'culturaltours@ethioheritage360.com',
      profile: { company: 'Ethiopian Cultural Heritage Tours' }
    },
    type: 'adventure',
    duration: {
      days: 4,
      hours: 0
    },
    groupSize: {
      min: 6,
      max: 12
    },
    pricing: {
      adult: 3500,
      child: 2500,
      currency: 'ETB'
    },
    schedule: [{
      startDate: new Date('2025-03-15T07:00:00Z'),
      endDate: new Date('2025-03-18T17:00:00Z'),
      availableSpots: 10,
      bookedSpots: 4
    }],
    media: {
      images: [{
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
        caption: 'Simien Mountains Landscape',
        isPrimary: true
      }]
    },
    rating: {
      average: 4.9,
      count: 12
    },
    status: 'published',
    totalBookings: 45,
    location: 'Simien Mountains, Amhara Region',
    createdAt: new Date('2025-01-14T16:00:00Z').toISOString(),
    updatedAt: new Date('2025-01-14T16:00:00Z').toISOString()
  },
  {
    _id: '6',
    id: '6',
    title: 'Gondar Castle Complex Historical Tour',
    description: 'Step back in time to explore the royal enclosure of Gondar, featuring 17th and 18th-century castles and palaces of Ethiopian emperors.',
    organizer: {
      _id: '13',
      name: 'Heritage Tours Ethiopia',
      email: 'organizer@heritagetours.et',
      profile: { company: 'Heritage Tours Ethiopia' }
    },
    type: 'historical',
    duration: {
      days: 1,
      hours: 4
    },
    groupSize: {
      min: 3,
      max: 20
    },
    pricing: {
      adult: 1200,
      child: 800,
      currency: 'ETB'
    },
    schedule: [{
      startDate: new Date('2025-02-25T10:00:00Z'),
      endDate: new Date('2025-02-25T14:00:00Z'),
      availableSpots: 15,
      bookedSpots: 8
    }],
    media: {
      images: [{
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
        caption: 'Gondar Castle',
        isPrimary: true
      }]
    },
    rating: {
      average: 4.5,
      count: 22
    },
    status: 'published',
    totalBookings: 134,
    location: 'Gondar, Amhara Region',
    createdAt: new Date('2025-01-11T12:20:00Z').toISOString(),
    updatedAt: new Date('2025-01-13T14:10:00Z').toISOString()
  }
];

// Mixed content store for moderation demo
const MOCK_CONTENT = [
  {
    _id: '1',
    name: 'Ancient Ethiopian Crown',
    museum: 'National Museum',
    submittedAt: '2025-01-12',
    status: 'pending',
    type: 'artifact',
    description: 'A royal crown from the 15th century',
    category: 'Royal Artifacts'
  },
  {
    _id: '2',
    name: 'Ethiopian Heritage Virtual Tour',
    museum: 'National Museum',
    submittedAt: '2025-01-11',
    status: 'pending',
    type: 'virtualMuseum',
    description: '360-degree virtual tour of main exhibition halls',
    artifacts: 25
  },
  {
    _id: '3',
    name: 'Coffee Ceremony Workshop',
    museum: 'Ethnological Museum',
    submittedAt: '2025-01-10',
    status: 'rejected',
    type: 'event',
    date: '2025-02-15',
    feedback: 'Event date conflicts with national holiday. Please select alternative date.'
  },
  {
    _id: '4',
    artifactName: 'Ceremonial Sword',
    name: 'Ceremonial Sword',
    museum: 'National Museum',
    renter: 'University of Addis Ababa',
    submittedAt: '2025-01-09',
    status: 'pending',
    type: 'rental',
    duration: '30 days',
    fee: '₹20,000'
  },
  {
    _id: '5',
    name: 'Traditional Coffee Set',
    museum: 'Ethnological Museum',
    submittedAt: '2025-01-08',
    status: 'approved',
    type: 'artifact',
    description: 'Complete traditional Ethiopian coffee ceremony set'
  }
]

class MockApiClient {
  constructor() {
    this.baseURL = '/api';
  }

  async request(endpoint, options = {}) {
    // Simulate network delay
    await delay(300);

    const token = localStorage.getItem('token');
    const user = token ? this.getUserFromToken(token) : null;

    // Handle authentication endpoints
    if (endpoint === '/auth/login' && options.method === 'POST') {
      return this.login(JSON.parse(options.body));
    }

    if (endpoint === '/auth/register' && options.method === 'POST') {
      return this.register(JSON.parse(options.body));
    }

    if (endpoint === '/auth/logout' && options.method === 'POST') {
      return this.logout();
    }

    if (endpoint === '/auth/me') {
      return this.getCurrentUser(token);
    }

    // Handle education/course endpoints
    if (endpoint.startsWith('/education/public/courses') || endpoint.startsWith('/learning/courses')) {
      return this.getCourses(endpoint, options);
    }

    if (endpoint.match(/^\/learning\/courses\/([^/]+)$/)) {
      const courseId = endpoint.match(/^\/learning\/courses\/([^/]+)$/)[1];
      return this.getCourseById(courseId);
    }

    if (endpoint.match(/^\/learning\/courses\/([^/]+)\/lessons$/)) {
      const courseId = endpoint.match(/^\/learning\/courses\/([^/]+)\/lessons$/)[1];
      return this.getCourseLessons(courseId);
    }

    // For other endpoints, return mock success
    return { success: true, message: 'Mock API response' };
  }

  async login(credentials) {
    const { email, password } = credentials;

    // Find user by email and password
    const user = MOCK_USERS.find(u =>
      u.email === email && u.password === password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = generateMockToken(user);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword
    };
  }

  async register(userData) {
    const { email, name, password, role = 'visitor' } = userData;

    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create new user
    const newUser = {
      id: MOCK_USERS.length + 1,
      email,
      name,
      password,
      role,
      verified: false,
      createdAt: new Date().toISOString()
    };

    MOCK_USERS.push(newUser);

    // Generate token
    const token = generateMockToken(newUser);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser;

    return {
      token,
      user: userWithoutPassword
    };
  }

  async logout() {
    return { success: true, message: 'Logged out successfully' };
  }

  async getCurrentUser(token) {
    if (!token) {
      throw new Error('No token provided');
    }

    const tokenData = parseMockToken(token);
    if (!tokenData) {
      throw new Error('Invalid token');
    }

    const user = MOCK_USERS.find(u => u.id === tokenData.id);
    if (!user) {
      throw new Error('User not found');
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword
    };
  }

  getUserFromToken(token) {
    const tokenData = parseMockToken(token);
    if (!tokenData) return null;

    const user = MOCK_USERS.find(u => u.id === tokenData.id);
    if (!user) return null;

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Mock other API methods
  async getMuseums() {
    return { museums: [] };
  }

  async getArtifacts() {
    return { artifacts: [] };
  }

  async getTours() {
    // Normalize tour data to match what the frontend components expect
    const normalizedTours = MOCK_TOURS.map(tour => {
      return {
        ...tour,
        // Ensure all required fields are present
        price: tour.pricing?.adult || 1000,
        duration: tour.duration?.days ? `${tour.duration.days} days` : '1 day',
        maxGuests: tour.groupSize?.max || 10,
        images: tour.media?.images?.map(img => img.url) || [
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop'
        ],
        category: this.mapTourTypeToCategory(tour.type),
        difficulty: this.mapTourTypeToDifficulty(tour.type),
        region: this.extractRegionFromLocation(tour.location),
        status: 'active', // Ensure all mock tours are active
        createdAt: tour.createdAt || new Date().toISOString()
      };
    });

    return {
      success: true,
      data: normalizedTours,
      tours: normalizedTours,
      pagination: {
        page: 1,
        limit: 50,
        total: normalizedTours.length,
        pages: 1
      }
    };
  }

  // Helper methods for tour data normalization
  mapTourTypeToCategory(type) {
    const categoryMap = {
      'religious': 'Religious & Historical',
      'archaeological': 'Religious & Historical',
      'historical': 'Religious & Historical',
      'cultural': 'Cultural & Tribal',
      'adventure': 'Adventure & Nature',
      'nature': 'Adventure & Nature',
      'wildlife': 'Wildlife & Safari'
    };
    return categoryMap[type] || 'Cultural & Tribal';
  }

  mapTourTypeToDifficulty(type) {
    const difficultyMap = {
      'religious': 'easy',
      'archaeological': 'moderate',
      'historical': 'easy',
      'cultural': 'easy',
      'adventure': 'hard',
      'nature': 'moderate',
      'wildlife': 'moderate'
    };
    return difficultyMap[type] || 'moderate';
  }

  extractRegionFromLocation(location) {
    if (!location) return 'amhara';
    const locationLower = location.toLowerCase();
    if (locationLower.includes('tigray') || locationLower.includes('axum')) return 'tigray';
    if (locationLower.includes('afar')) return 'afar';
    if (locationLower.includes('snnpr') || locationLower.includes('southern')) return 'snnpr';
    if (locationLower.includes('oromia')) return 'oromia';
    return 'amhara'; // default
  }

  async createTour(tourData) {
    await delay(500);

    const newTour = {
      ...tourData,
      _id: (MOCK_TOURS.length + 1).toString(),
      id: (MOCK_TOURS.length + 1).toString(),
      status: 'published',
      totalBookings: 0,
      rating: {
        average: 0,
        count: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Ensure organizer is populated
      organizer: {
        _id: tourData.organizer || '13',
        name: 'Heritage Tours Ethiopia',
        email: 'organizer@heritagetours.et',
        profile: { company: 'Heritage Tours Ethiopia' }
      },
      // Add default media if not provided
      media: tourData.media || {
        images: [{
          url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
          caption: 'Tour Image',
          isPrimary: true
        }]
      }
    };

    MOCK_TOURS.push(newTour);

    return {
      success: true,
      message: 'Tour created successfully',
      data: newTour,
      tour: newTour
    };
  }

  async getSites() {
    return { sites: [] };
  }

  async getUsers() {
    const users = MOCK_USERS.map(({ password: _, ...user }) => user);
    return { users };
  }

  async getSystemStats() {
    return {
      stats: {
        totalUsers: MOCK_USERS.length,
        totalMuseums: 12,
        totalArtifacts: 487,
        totalTours: 23,
        recentActivity: []
      }
    };
  }

  // Enhanced user management for Super Admin
  async listUsers({ page = 1, limit = 20, role } = {}) {
    let filteredUsers = MOCK_USERS;
    if (role) {
      filteredUsers = MOCK_USERS.filter(user => user.role === role);
    }

    const startIndex = (page - 1) * limit;
    const items = filteredUsers
      .slice(startIndex, startIndex + limit)
      .map(({ password: _, ...user }) => user);

    return {
      items,
      total: filteredUsers.length,
      page,
      limit
    };
  }

  async createUser(userData) {
    const { email, name, password, role = 'visitor', isActive = true } = userData;

    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const newUser = {
      _id: (MOCK_USERS.length + 1).toString(),
      id: MOCK_USERS.length + 1,
      email,
      name,
      password,
      role,
      isActive,
      verified: role !== 'visitor',
      createdAt: new Date().toISOString()
    };

    MOCK_USERS.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword };
  }

  async updateUser(userId, userData) {
    const userIndex = MOCK_USERS.findIndex(u => u._id === userId || u.id.toString() === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Don't update password if it's empty
    if (userData.password && userData.password.trim() === '') {
      delete userData.password;
    }

    MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...userData };
    const { password: _, ...userWithoutPassword } = MOCK_USERS[userIndex];
    return { user: userWithoutPassword };
  }

  async deleteUser(userId) {
    const userIndex = MOCK_USERS.findIndex(u => u._id === userId || u.id.toString() === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    MOCK_USERS.splice(userIndex, 1);
    return { success: true, message: 'User deleted successfully' };
  }

  async setUserRole(userId, role) {
    const userIndex = MOCK_USERS.findIndex(u => u._id === userId || u.id.toString() === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    MOCK_USERS[userIndex].role = role;
    const { password: _, ...userWithoutPassword } = MOCK_USERS[userIndex];
    return { user: userWithoutPassword };
  }

  // Museum management
  async listMuseums({ page = 1, limit = 20 } = {}) {
    const mockMuseums = [
      {
        _id: '1',
        name: 'National Museum of Ethiopia',
        email: 'nationalmuseum@ethioheritage360.com',
        museumInfo: {
          name: 'National Museum of Ethiopia',
          verified: true,
          location: 'Addis Ababa',
          description: 'The premier museum of Ethiopia'
        },
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        name: 'Ethnological Museum',
        email: 'ethnomuseum@ethioheritage360.com',
        museumInfo: {
          name: 'Ethnological Museum',
          verified: true,
          location: 'Addis Ababa',
          description: 'Showcasing Ethiopian cultures'
        },
        createdAt: new Date().toISOString()
      },
      {
        _id: '3',
        name: 'Regional Heritage Center',
        email: 'heritage@center.com',
        museumInfo: {
          name: 'Regional Heritage Center',
          verified: false,
          location: 'Bahir Dar',
          description: 'Local heritage preservation'
        },
        createdAt: new Date().toISOString()
      }
    ];

    const startIndex = (page - 1) * limit;
    const items = mockMuseums.slice(startIndex, startIndex + limit);

    return {
      items,
      total: mockMuseums.length,
      page,
      limit
    };
  }

  async setMuseumVerified(museumId, verified) {
    // Mock implementation - in real app would update database
    return { success: true, message: `Museum ${verified ? 'verified' : 'unverified'} successfully` };
  }

  // Content moderation (multi-type)
  async listContent({ page = 1, limit = 20, status, type, museum, q } = {}) {
    // Filter
    let items = [...MOCK_CONTENT]
    if (status) items = items.filter(i => i.status === status)
    if (type) items = items.filter(i => i.type === type)
    if (museum) items = items.filter(i => i.museum === museum)
    if (q) {
      const qq = q.toLowerCase()
      items = items.filter(i => (i.name || i.artifactName || '').toLowerCase().includes(qq) || (i.museum || '').toLowerCase().includes(qq))
    }
    const total = items.length
    const start = (page - 1) * limit
    const paged = items.slice(start, start + limit)
    return { items: paged, total, page, limit }
  }

  async approveContent(id, type) {
    const idx = MOCK_CONTENT.findIndex(i => i._id === id && (!type || i.type === type))
    if (idx === -1) throw new Error('Content not found')
    MOCK_CONTENT[idx] = { ...MOCK_CONTENT[idx], status: 'approved', feedback: undefined }
    return { success: true, item: MOCK_CONTENT[idx] }
  }

  async rejectContent(id, type, reason = '') {
    const idx = MOCK_CONTENT.findIndex(i => i._id === id && (!type || i.type === type))
    if (idx === -1) throw new Error('Content not found')
    MOCK_CONTENT[idx] = { ...MOCK_CONTENT[idx], status: 'rejected', feedback: reason }
    return { success: true, item: MOCK_CONTENT[idx] }
  }

  // Artifacts management
  async listArtifacts({ page = 1, limit = 20, status } = {}) {
    const mockArtifacts = [
      {
        _id: '1',
        name: 'Ancient Ethiopian Crown',
        museum: 'National Museum',
        category: 'Jewelry',
        status: 'pending',
        submittedBy: 'museum@example.com',
        period: 'Ancient',
        condition: 'Excellent',
        dateSubmitted: '2025-08-12',
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        name: 'Traditional Coffee Set',
        museum: 'Ethnological Museum',
        category: 'Pottery',
        status: 'approved',
        submittedBy: 'ethno@example.com',
        period: 'Medieval',
        condition: 'Good',
        dateSubmitted: '2025-08-11',
        createdAt: new Date().toISOString()
      },
      {
        _id: '3',
        name: 'Historical Manuscript',
        museum: 'Heritage Center',
        category: 'Manuscripts',
        status: 'rejected',
        submittedBy: 'heritage@example.com',
        period: 'Medieval',
        condition: 'Fair',
        dateSubmitted: '2025-08-10',
        createdAt: new Date().toISOString()
      }
    ];

    let filteredArtifacts = mockArtifacts;
    if (status) {
      filteredArtifacts = mockArtifacts.filter(artifact => artifact.status === status);
    }

    const startIndex = (page - 1) * limit;
    const items = filteredArtifacts.slice(startIndex, startIndex + limit);

    return {
      items,
      total: filteredArtifacts.length,
      page,
      limit
    };
  }

  async approveArtifact(artifactId) {
    return { success: true, message: 'Artifact approved successfully' };
  }

  async rejectArtifact(artifactId, reason) {
    return { success: true, message: 'Artifact rejected successfully' };
  }

  // System management
  async getSystemSettings() {
    return {
      settings: {
        platformName: 'Ethiopian Heritage 360',
        defaultLanguage: 'en',
        maxUploadSize: 50,
        defaultRentalPeriod: 30,
        securityDeposit: 20,
        lateFee: 100,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        notifications: {
          newUsers: true,
          artifactApprovals: true,
          rentalActivities: true,
          weeklyReports: false
        }
      }
    };
  }

  async updateSystemSettings(settings) {
    // Mock implementation - in real app would save to database
    return { success: true, message: 'Settings updated successfully', settings };
  }

  // System monitoring
  async getSystemHealth() {
    return {
      health: {
        status: 'operational',
        uptime: '99.8%',
        responseTime: '245ms',
        services: {
          database: 'operational',
          authentication: 'operational',
          fileStorage: 'degraded',
          emailService: 'operational'
        },
        lastChecked: new Date().toISOString()
      }
    };
  }

  async getActivityLogs({ page = 1, limit = 50 } = {}) {
    const mockLogs = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        activity: 'User login',
        user: 'user@example.com',
        type: 'authentication',
        details: 'Successful login from IP: 192.168.1.1'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        activity: 'Artifact uploaded',
        user: 'museum@example.com',
        type: 'content',
        details: 'New artifact "Ancient Vase" uploaded'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        activity: 'Museum verified',
        user: 'admin@heritage360.et',
        type: 'administration',
        details: 'Heritage Center museum verified'
      }
    ];

    const startIndex = (page - 1) * limit;
    const items = mockLogs.slice(startIndex, startIndex + limit);

    return {
      logs: items,
      total: mockLogs.length,
      page,
      limit
    };
  }

  // Analytics
  async getAnalytics(timeRange = 'month') {
    const mockAnalytics = {
      timeRange,
      metrics: {
        users: {
          total: MOCK_USERS.length,
          active: Math.floor(MOCK_USERS.length * 0.7),
          growth: 12.5
        },
        museums: {
          total: 45,
          verified: 42,
          growth: 8.3
        },
        artifacts: {
          total: 1256,
          approved: 1180,
          pending: 76,
          growth: 15.2
        },
        revenue: {
          total: 285400,
          growth: 22.7
        }
      },
      charts: {
        userGrowth: Array.from({ length: 12 }, (_, i) => ({
          month: new Date(2024, i, 1).toLocaleString('default', { month: 'short' }),
          users: Math.floor(Math.random() * 200) + 50,
          museums: Math.floor(Math.random() * 10) + 2
        })),
        popularMuseums: [
          { name: 'National Museum', visits: 4500 },
          { name: 'Ethnological Museum', visits: 2800 },
          { name: 'Heritage Center', visits: 1500 }
        ]
      }
    };

    return mockAnalytics;
  }

  // Backup and maintenance
  async createBackup() {
    await delay(2000); // Simulate backup time
    return {
      success: true,
      backupId: `backup_${Date.now()}`,
      timestamp: new Date().toISOString(),
      size: '125.4 MB',
      message: 'Database backup created successfully'
    };
  }

  // File upload mock
  async uploadFile(file, type = 'image') {
    await delay(1000);
    return {
      url: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop&crop=center',
      filename: file.name,
      type
    };
  }

  // Museum Admin endpoints
  async getMuseumProfile() {
    return {
      museum: {
        name: 'National Museum of Ethiopia',
        description: 'The premier cultural institution showcasing Ethiopian heritage.',
        address: 'King George VI St, Addis Ababa, Ethiopia',
        phone: '+251-11-117-150',
        email: 'info@nationalmuseum.et',
        website: 'https://nationalmuseum.ethiopia.gov.et',
        openingHours: {
          monday: { open: '09:00', close: '17:00', closed: false },
          tuesday: { open: '09:00', close: '17:00', closed: false },
          wednesday: { open: '09:00', close: '17:00', closed: false },
          thursday: { open: '09:00', close: '17:00', closed: false },
          friday: { open: '09:00', close: '17:00', closed: false },
          saturday: { open: '10:00', close: '16:00', closed: false },
          sunday: { open: '10:00', close: '16:00', closed: true }
        },
        socialMedia: {
          facebook: 'https://facebook.com/nationalmuseumethiopia',
          twitter: 'https://twitter.com/nationalmuseumet',
          instagram: 'https://instagram.com/nationalmuseumethiopia'
        }
      }
    };
  }

  async updateMuseumProfile(profileData) {
    await delay(500);
    return { success: true, message: 'Museum profile updated successfully' };
  }

  async uploadMuseumLogo(logoFile) {
    await delay(1000);
    return {
      success: true,
      message: 'Logo uploaded successfully',
      logo: {
        url: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop&crop=center',
        filename: logoFile.name,
        uploadedAt: new Date().toISOString()
      }
    };
  }

  async getMuseumArtifacts({ page = 1, limit = 20, category, search } = {}) {
    let filteredArtifacts = [...MOCK_MUSEUM_ARTIFACTS];

    if (category) {
      filteredArtifacts = filteredArtifacts.filter(artifact => artifact.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredArtifacts = filteredArtifacts.filter(artifact =>
        artifact.name.toLowerCase().includes(searchLower) ||
        artifact.description.toLowerCase().includes(searchLower)
      );
    }

    const startIndex = (page - 1) * limit;
    const items = filteredArtifacts.slice(startIndex, startIndex + limit);

    return {
      items,
      total: filteredArtifacts.length,
      page,
      limit
    };
  }

  async createMuseumArtifact(artifactData) {
    const newArtifact = {
      ...artifactData,
      _id: (MOCK_MUSEUM_ARTIFACTS.length + 1).toString(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    MOCK_MUSEUM_ARTIFACTS.push(newArtifact);
    return { artifact: newArtifact };
  }

  async updateMuseumArtifact(id, artifactData) {
    const index = MOCK_MUSEUM_ARTIFACTS.findIndex(a => a._id === id);
    if (index === -1) throw new Error('Artifact not found');

    MOCK_MUSEUM_ARTIFACTS[index] = { ...MOCK_MUSEUM_ARTIFACTS[index], ...artifactData };
    return { artifact: MOCK_MUSEUM_ARTIFACTS[index] };
  }

  async deleteMuseumArtifact(id) {
    const index = MOCK_MUSEUM_ARTIFACTS.findIndex(a => a._id === id);
    if (index === -1) throw new Error('Artifact not found');

    MOCK_MUSEUM_ARTIFACTS.splice(index, 1);
    return { success: true, message: 'Artifact deleted successfully' };
  }

  async getMuseumAnalytics() {
    return {
      analytics: {
        visitors: { total: 12543, growth: 15.2 },
        artifacts: {
          total: 247,
          popular: [
            { name: 'Ancient Ethiopian Crown', views: 1234 },
            { name: 'Traditional Coffee Set', views: 987 },
            { name: 'Manuscripts Collection', views: 765 }
          ]
        },
        revenue: { total: 450000, growth: 22.8 },
        events: { upcoming: 3, total: 28 }
      }
    };
  }

  async submitVirtualMuseum(submissionData) {
    await delay(1000);
    return { success: true, message: 'Virtual museum submission sent for approval' };
  }

  async getVirtualSubmissions({ page = 1, limit = 20, status } = {}) {
    const mockSubmissions = [
      {
        _id: '1',
        title: 'Ethiopian Heritage Virtual Tour',
        description: '360-degree virtual tour of main exhibition halls',
        artifacts: 25,
        status: 'pending',
        submittedAt: new Date('2025-01-11').toISOString()
      },
      {
        _id: '2',
        title: 'Royal Artifacts Showcase',
        description: 'Collection of royal Ethiopian artifacts',
        artifacts: 12,
        status: 'rejected',
        feedback: 'Images need better resolution',
        submittedAt: new Date('2025-01-08').toISOString()
      }
    ];

    let filtered = status ? mockSubmissions.filter(s => s.status === status) : mockSubmissions;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return { items, total: filtered.length, page, limit };
  }

  // User/Visitor endpoints
  async getUserProfile() {
    return {
      profile: {
        name: 'Heritage Explorer',
        email: 'explorer@example.com',
        preferences: {
          favoriteCategories: ['Royal History', 'Cultural Heritage'],
          notifications: true,
          language: 'en'
        },
        bookingHistory: MOCK_USER_BOOKINGS,
        favorites: ['1', '3'],
        reviews: []
      }
    };
  }

  async updateUserProfile(profileData) {
    await delay(500);
    return { success: true, message: 'Profile updated successfully' };
  }

  async getVirtualExhibits({ search, category, museum } = {}) {
    let filtered = [...MOCK_VIRTUAL_EXHIBITS];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(exhibit =>
        exhibit.title.toLowerCase().includes(searchLower) ||
        exhibit.description.toLowerCase().includes(searchLower)
      );
    }

    if (category) {
      filtered = filtered.filter(exhibit => exhibit.category === category);
    }

    if (museum) {
      filtered = filtered.filter(exhibit => exhibit.museum === museum);
    }

    return { exhibits: filtered };
  }

  async getHeritageSites({ search, region } = {}) {
    let filtered = [...MOCK_HERITAGE_SITES];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(site =>
        site.name.toLowerCase().includes(searchLower) ||
        site.description.toLowerCase().includes(searchLower)
      );
    }

    if (region) {
      filtered = filtered.filter(site => site.region === region);
    }

    return { sites: filtered };
  }

  async getUserArtifacts({ page = 1, limit = 20, search, category, museum } = {}) {
    let filtered = [...MOCK_MUSEUM_ARTIFACTS.filter(a => a.status === 'approved')];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(artifact =>
        artifact.name.toLowerCase().includes(searchLower) ||
        artifact.description.toLowerCase().includes(searchLower)
      );
    }

    if (category) {
      filtered = filtered.filter(artifact => artifact.category === category);
    }

    if (museum) {
      filtered = filtered.filter(artifact => artifact.museum === museum);
    }

    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return { items, total: filtered.length, page, limit };
  }

  async getUpcomingEvents({ search, date, museum } = {}) {
    let filtered = [...MOCK_EVENTS];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower)
      );
    }

    if (date) {
      filtered = filtered.filter(event => event.date === date);
    }

    if (museum) {
      filtered = filtered.filter(event => event.museum === museum);
    }

    return { events: filtered };
  }

  async bookTicket(bookingData) {
    await delay(500);
    const newBooking = {
      id: (MOCK_USER_BOOKINGS.length + 1).toString(),
      ...bookingData,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    MOCK_USER_BOOKINGS.push(newBooking);
    return { booking: newBooking };
  }

  async registerForEvent(eventId, registrationData) {
    await delay(500);
    const newRegistration = {
      id: (MOCK_USER_BOOKINGS.length + 1).toString(),
      type: 'event',
      eventId,
      ...registrationData,
      status: 'registered',
      createdAt: new Date().toISOString()
    };
    MOCK_USER_BOOKINGS.push(newRegistration);
    return { registration: newRegistration };
  }

  async requestArtifactRental(artifactId, rentalData) {
    await delay(500);
    const newRental = {
      id: (MOCK_USER_BOOKINGS.length + 1).toString(),
      type: 'rental',
      artifactId,
      ...rentalData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    MOCK_USER_BOOKINGS.push(newRental);
    return { rental: newRental };
  }

  async getUserBookings({ page = 1, limit = 20, status } = {}) {
    let filtered = status ? MOCK_USER_BOOKINGS.filter(b => b.status === status) : MOCK_USER_BOOKINGS;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);
    return { items, total: filtered.length, page, limit };
  }

  async addToFavorites(itemId, itemType) {
    await delay(200);
    return { success: true, message: 'Added to favorites' };
  }

  async removeFromFavorites(itemId) {
    await delay(200);
    return { success: true, message: 'Removed from favorites' };
  }

  async getUserFavorites() {
    return {
      favorites: [
        { id: '1', type: 'exhibit', item: MOCK_VIRTUAL_EXHIBITS[0] },
        { id: '3', type: 'artifact', item: MOCK_MUSEUM_ARTIFACTS[2] }
      ]
    };
  }

  async submitReview(itemId, itemType, reviewData) {
    await delay(500);
    return { success: true, message: 'Review submitted successfully' };
  }

  async getUserReviews() {
    return {
      reviews: [
        {
          id: '1',
          itemId: '1',
          itemType: 'exhibit',
          itemTitle: 'Royal Ethiopian Heritage',
          rating: 5,
          comment: 'Amazing virtual tour!',
          createdAt: new Date('2025-01-10').toISOString()
        }
      ]
    };
  }

  // Heritage Site CRUD Operations
  async createHeritageSite(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newSite = {
          id: Date.now(),
          ...data,
          createdAt: new Date().toISOString(),
          status: 'active',
          verified: true
        };
        resolve({
          success: true,
          message: 'Heritage site created successfully',
          data: newSite
        });
      }, 1000);
    });
  }

  async updateHeritageSite(siteId, data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Heritage site updated successfully',
          data: { id: siteId, ...data }
        });
      }, 1000);
    });
  }

  async deleteHeritageSite(siteId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Heritage site deleted successfully'
        });
      }, 1000);
    });
  }

  async getHeritageSite(siteId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            id: siteId,
            name: 'Sample Heritage Site',
            description: 'A sample heritage site',
            status: 'active',
            verified: true
          }
        });
      }, 1000);
    });
  }

  // Course-specific methods
  async getCourses(endpoint, options = {}) {
    await delay(300);

    // Parse query parameters from endpoint if present
    const url = new URL(endpoint, 'http://localhost');
    const category = url.searchParams.get('category');
    const difficulty = url.searchParams.get('difficulty');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;

    let filteredCourses = [...MOCK_COURSES];

    // Apply filters
    if (category && category !== 'all') {
      filteredCourses = filteredCourses.filter(course => course.category === category);
    }

    if (difficulty && difficulty !== 'all') {
      filteredCourses = filteredCourses.filter(course => course.difficulty === difficulty);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredCourses = filteredCourses.filter(course =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.instructor.toLowerCase().includes(searchLower) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedCourses = filteredCourses.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: paginatedCourses,
      courses: paginatedCourses,
      pagination: {
        page,
        limit,
        total: filteredCourses.length,
        pages: Math.ceil(filteredCourses.length / limit),
        hasNext: page < Math.ceil(filteredCourses.length / limit),
        hasPrev: page > 1
      },
      filters: {
        categories: ['history', 'culture', 'archaeology', 'language'],
        difficulties: ['beginner', 'intermediate', 'advanced']
      }
    };
  }

  async getCourseById(courseId) {
    await delay(300);

    const course = MOCK_COURSES.find(c => c._id === courseId || c.id === courseId);

    if (!course) {
      throw new Error('Course not found');
    }

    // Return course with additional details that might be needed for course detail page
    const enrichedCourse = {
      ...course,
      // Add some computed fields
      completionRate: Math.floor(Math.random() * 30) + 70, // Random completion rate between 70-100%
      prerequisites: course.requirements || [],
      syllabus: course.topics || [],
      // Mock lesson structure
      lessons: Array.from({ length: course.lessons }, (_, i) => ({
        id: `lesson-${i + 1}`,
        title: `${course.topics[i % course.topics.length]} - Part ${Math.floor(i / course.topics.length) + 1}`,
        duration: Math.floor(course.estimatedDuration / course.lessons),
        type: i % 3 === 0 ? 'video' : i % 3 === 1 ? 'reading' : 'quiz',
        completed: false
      })),
      // Mock instructor details
      instructorDetails: {
        name: course.instructor,
        bio: `Expert in ${course.category} with over 10 years of experience in Ethiopian heritage studies.`,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        credentials: ['PhD in Ethiopian Studies', 'Published Researcher', 'Heritage Consultant']
      },
      // Mock reviews
      reviews: [
        {
          id: '1',
          user: 'Sarah M.',
          rating: 5,
          comment: 'Excellent course! Very informative and well-structured.',
          date: new Date('2025-01-15').toISOString()
        },
        {
          id: '2',
          user: 'Ahmed K.',
          rating: 4,
          comment: 'Great content, learned a lot about Ethiopian culture.',
          date: new Date('2025-01-12').toISOString()
        }
      ]
    };

    return {
      success: true,
      data: enrichedCourse,
      course: enrichedCourse
    };
  }

  async getCourseLessons(courseId) {
    await delay(300);

    const course = MOCK_COURSES.find(c => c._id === courseId || c.id === courseId);

    if (!course) {
      throw new Error('Course not found');
    }

    // Generate detailed lessons based on course topics
    const lessons = course.topics.flatMap((topic, topicIndex) => {
      const lessonsPerTopic = Math.ceil(course.lessons / course.topics.length);
      return Array.from({ length: lessonsPerTopic }, (_, lessonIndex) => {
        const globalIndex = topicIndex * lessonsPerTopic + lessonIndex;
        if (globalIndex >= course.lessons) return null;

        return {
          id: `lesson-${globalIndex + 1}`,
          courseId: course._id,
          title: `${topic} - Part ${lessonIndex + 1}`,
          description: `Detailed exploration of ${topic.toLowerCase()} in Ethiopian heritage.`,
          duration: Math.floor(course.estimatedDuration / course.lessons),
          type: globalIndex % 3 === 0 ? 'video' : globalIndex % 3 === 1 ? 'reading' : 'quiz',
          order: globalIndex + 1,
          content: {
            videoUrl: globalIndex % 3 === 0 ? 'https://example.com/video.mp4' : null,
            readingMaterial: globalIndex % 3 === 1 ? 'Sample reading content...' : null,
            quizQuestions: globalIndex % 3 === 2 ? [
              {
                id: 'q1',
                question: `What is the significance of ${topic}?`,
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: 0
              }
            ] : null
          },
          completed: false,
          accessible: globalIndex < 3 // First 3 lessons are accessible
        };
      }).filter(Boolean);
    });

    return {
      success: true,
      data: lessons,
      lessons,
      course: {
        id: course._id,
        title: course.title,
        totalLessons: lessons.length
      }
    };
  }

  // Course enrollment and progress tracking
  async enrollInCourse(courseId) {
    await delay(500);

    const course = MOCK_COURSES.find(c => c._id === courseId || c.id === courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    return {
      success: true,
      message: 'Successfully enrolled in course',
      enrollment: {
        courseId,
        enrolledAt: new Date().toISOString(),
        progress: 0,
        completed: false
      }
    };
  }

  async getCourseProgress(courseId) {
    await delay(200);

    return {
      success: true,
      progress: {
        courseId,
        completedLessons: 2,
        totalLessons: 8,
        percentage: 25,
        lastAccessed: new Date().toISOString(),
        timeSpent: 120 // minutes
      }
    };
  }

  async updateLessonProgress(courseId, lessonId, completed = true) {
    await delay(300);

    return {
      success: true,
      message: 'Lesson progress updated',
      progress: {
        lessonId,
        completed,
        completedAt: completed ? new Date().toISOString() : null
      }
    };
  }

  // Course management for educators
  async createCourse(courseData) {
    await delay(1000);

    const newCourse = {
      ...courseData,
      _id: `course-${MOCK_COURSES.length + 1}`,
      id: `course-${MOCK_COURSES.length + 1}`,
      status: 'draft',
      enrolled: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    MOCK_COURSES.push(newCourse);

    return {
      success: true,
      message: 'Course created successfully',
      data: newCourse,
      course: newCourse
    };
  }

  async updateCourse(courseId, courseData) {
    await delay(500);

    const courseIndex = MOCK_COURSES.findIndex(c => c._id === courseId || c.id === courseId);
    if (courseIndex === -1) {
      throw new Error('Course not found');
    }

    MOCK_COURSES[courseIndex] = {
      ...MOCK_COURSES[courseIndex],
      ...courseData,
      updatedAt: new Date().toISOString()
    };

    return {
      success: true,
      message: 'Course updated successfully',
      data: MOCK_COURSES[courseIndex],
      course: MOCK_COURSES[courseIndex]
    };
  }

  async deleteCourse(courseId) {
    await delay(500);

    const courseIndex = MOCK_COURSES.findIndex(c => c._id === courseId || c.id === courseId);
    if (courseIndex === -1) {
      throw new Error('Course not found');
    }

    const deletedCourse = MOCK_COURSES.splice(courseIndex, 1)[0];

    return {
      success: true,
      message: 'Course deleted successfully',
      course: deletedCourse
    };
  }

  // Rental Request Functions
  async getAllRentalRequests(params = {}) {
    console.log('🔍 Mock API: getAllRentalRequests called with params:', params);

    // Mock rental requests data
    const mockRentalRequests = [
      {
        _id: 'rental_001',
        requestId: 'REQ-2024-001',
        requestType: 'museum_to_super',
        status: 'pending',
        artifact: {
          _id: 'artifact_001',
          name: 'Ancient Ethiopian Cross',
          category: 'Religious Artifacts',
          images: ['cross1.jpg']
        },
        museum: {
          _id: 'museum_001',
          name: 'National Museum of Ethiopia',
          location: { city: 'Addis Ababa', country: 'Ethiopia' }
        },
        requestedBy: {
          _id: 'user_001',
          name: 'Museum Admin',
          email: 'admin@museum.com',
          role: 'museum_admin'
        },
        rentalDetails: {
          duration: 30,
          startDate: '2024-10-01',
          endDate: '2024-10-31',
          rentalFee: 50000,
          currency: 'ETB'
        },
        description: 'Request for temporary display of ancient cross',
        specialRequirements: 'Climate controlled environment required',
        createdAt: '2024-09-25T10:00:00Z',
        approvals: []
      },
      {
        _id: 'rental_002',
        requestId: 'REQ-2024-002',
        requestType: 'super_to_museum',
        status: 'approved',
        artifact: {
          _id: 'artifact_002',
          name: 'Lalibela Rock Church Model',
          category: 'Architectural Models',
          images: ['lalibela1.jpg']
        },
        museum: {
          _id: 'museum_002',
          name: 'Lalibela Heritage Museum',
          location: { city: 'Lalibela', country: 'Ethiopia' }
        },
        requestedBy: {
          _id: 'user_002',
          name: 'Super Admin',
          email: 'super@admin.com',
          role: 'super_admin'
        },
        rentalDetails: {
          duration: 60,
          startDate: '2024-11-01',
          endDate: '2024-12-31',
          rentalFee: 75000,
          currency: 'ETB'
        },
        description: 'Request for educational display',
        specialRequirements: 'Educational materials included',
        createdAt: '2024-09-20T14:30:00Z',
        approvals: [
          {
            approver: 'user_003',
            role: 'museum_admin',
            status: 'approved',
            comments: 'Approved for educational purposes',
            approvedAt: '2024-09-22T09:15:00Z'
          }
        ]
      }
    ];

    // Apply filters
    let filteredRequests = [...mockRentalRequests];

    if (params.status && params.status !== 'all' && params.status !== 'undefined') {
      filteredRequests = filteredRequests.filter(req => req.status === params.status);
    }

    if (params.requestType && params.requestType !== 'all' && params.requestType !== 'undefined') {
      filteredRequests = filteredRequests.filter(req => req.requestType === params.requestType);
    }

    if (params.search && params.search.trim()) {
      const searchTerm = params.search.toLowerCase();
      filteredRequests = filteredRequests.filter(req =>
        req.requestId.toLowerCase().includes(searchTerm) ||
        req.description.toLowerCase().includes(searchTerm) ||
        req.artifact.name.toLowerCase().includes(searchTerm)
      );
    }

    console.log('📋 Mock API: Returning', filteredRequests.length, 'rental requests');
    return {
      success: true,
      data: filteredRequests,
      total: filteredRequests.length
    };
  }

  async getRentalRequestById(id) {
    console.log('🔍 Mock API: getRentalRequestById called with id:', id);

    const mockRequest = {
      _id: id,
      requestId: 'REQ-2024-001',
      requestType: 'museum_to_super',
      status: 'pending',
      artifact: {
        _id: 'artifact_001',
        name: 'Ancient Ethiopian Cross',
        category: 'Religious Artifacts',
        images: ['cross1.jpg']
      },
      museum: {
        _id: 'museum_001',
        name: 'National Museum of Ethiopia',
        location: { city: 'Addis Ababa', country: 'Ethiopia' }
      },
      requestedBy: {
        _id: 'user_001',
        name: 'Museum Admin',
        email: 'admin@museum.com',
        role: 'museum_admin'
      },
      rentalDetails: {
        duration: 30,
        startDate: '2024-10-01',
        endDate: '2024-10-31',
        rentalFee: 50000,
        currency: 'ETB'
      },
      description: 'Request for temporary display of ancient cross',
      specialRequirements: 'Climate controlled environment required',
      createdAt: '2024-09-25T10:00:00Z',
      approvals: []
    };

    return {
      success: true,
      data: mockRequest
    };
  }

  async createRentalRequest(requestData) {
    console.log('🔍 Mock API: createRentalRequest called with data:', requestData);

    const newRequest = {
      _id: 'rental_' + Date.now(),
      requestId: 'REQ-2024-' + Math.floor(Math.random() * 1000),
      ...requestData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      approvals: []
    };

    return {
      success: true,
      data: newRequest,
      message: 'Rental request created successfully'
    };
  }

  async updateRentalRequestStatus(id, statusData) {
    console.log('🔍 Mock API: updateRentalRequestStatus called with id:', id, 'data:', statusData);

    return {
      success: true,
      data: {
        _id: id,
        status: statusData.status,
        ...statusData
      },
      message: `Rental request ${statusData.status} successfully`
    };
  }

  async getRentalStatistics() {
    console.log('🔍 Mock API: getRentalStatistics called');

    return {
      success: true,
      data: {
        totalRequests: 15,
        pendingRequests: 5,
        approvedRequests: 8,
        rejectedRequests: 2,
        totalRevenue: 450000,
        revenueByMonth: [
          { month: 'September', revenue: 150000 },
          { month: 'October', revenue: 200000 },
          { month: 'November', revenue: 100000 }
        ],
        requestsByStatus: {
          pending: 5,
          approved: 8,
          rejected: 2,
          completed: 0
        }
      }
    };
  }

  // Rental Artifacts Functions
  async getRentalArtifacts() {
    console.log('🔍 Mock API: getRentalArtifacts called');

    // Mock artifacts available for rental
    const mockRentalArtifacts = [
      {
        _id: 'artifact_001',
        name: 'Ancient Ethiopian Cross',
        description: 'A beautifully crafted cross from the 12th century',
        category: 'Religious Artifacts',
        images: ['cross1.jpg', 'cross2.jpg'],
        status: 'available',
        museum: {
          _id: 'museum_001',
          name: 'National Museum of Ethiopia',
          location: { city: 'Addis Ababa', country: 'Ethiopia' }
        },
        rentalPrice: 50000,
        isAvailableForRental: true
      },
      {
        _id: 'artifact_002',
        name: 'Lalibela Rock Church Model',
        description: 'Detailed model of the famous rock-hewn churches',
        category: 'Architectural Models',
        images: ['lalibela1.jpg', 'lalibela2.jpg'],
        status: 'available',
        museum: {
          _id: 'museum_002',
          name: 'Lalibela Heritage Museum',
          location: { city: 'Lalibela', country: 'Ethiopia' }
        },
        rentalPrice: 75000,
        isAvailableForRental: true
      },
      {
        _id: 'artifact_003',
        name: 'Aksum Obelisk Replica',
        description: 'Replica of the famous Aksumite obelisk',
        category: 'Monuments',
        images: ['obelisk1.jpg', 'obelisk2.jpg'],
        status: 'available',
        museum: {
          _id: 'museum_003',
          name: 'Aksum Museum',
          location: { city: 'Aksum', country: 'Ethiopia' }
        },
        rentalPrice: 60000,
        isAvailableForRental: true
      },
      {
        _id: 'artifact_004',
        name: 'Ethiopian Manuscript',
        description: 'Ancient Ge\'ez manuscript from the 14th century',
        category: 'Manuscripts',
        images: ['manuscript1.jpg', 'manuscript2.jpg'],
        status: 'available',
        museum: {
          _id: 'museum_001',
          name: 'National Museum of Ethiopia',
          location: { city: 'Addis Ababa', country: 'Ethiopia' }
        },
        rentalPrice: 40000,
        isAvailableForRental: true
      },
      {
        _id: 'artifact_005',
        name: 'Traditional Ethiopian Pottery',
        description: 'Collection of traditional pottery from different regions',
        category: 'Pottery',
        images: ['pottery1.jpg', 'pottery2.jpg'],
        status: 'available',
        museum: {
          _id: 'museum_004',
          name: 'Ethnographic Museum',
          location: { city: 'Addis Ababa', country: 'Ethiopia' }
        },
        rentalPrice: 30000,
        isAvailableForRental: true
      }
    ];

    console.log('📋 Mock API: Returning', mockRentalArtifacts.length, 'rental artifacts');
    return {
      success: true,
      data: mockRentalArtifacts
    };
  }
}

export const mockApi = new MockApiClient();
export default mockApi;
