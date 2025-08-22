const http = require('http');
const url = require('url');

// Mock learning data
const mockLearningData = {
  progress: [
    { id: 1, courseId: 1, userId: 1, progress: 75, completed: false, lastAccessed: new Date() },
    { id: 2, courseId: 2, userId: 1, progress: 100, completed: true, lastAccessed: new Date() },
    { id: 3, courseId: 3, userId: 1, progress: 25, completed: false, lastAccessed: new Date() }
  ],
  achievements: [
    { id: 1, title: 'First Course Completed', description: 'Complete your first course', earned: true, earnedDate: new Date() },
    { id: 2, title: 'Ethiopian Heritage Expert', description: 'Complete all heritage courses', earned: false, earnedDate: null },
    { id: 3, title: 'Cultural Ambassador', description: 'Share knowledge with 10 students', earned: true, earnedDate: new Date() }
  ],
  courses: [
    {
      id: 1,
      title: 'Ethiopian Ancient History',
      description: 'Explore the rich ancient history of Ethiopia',
      category: 'History',
      difficulty: 'Intermediate',
      duration: '12 weeks',
      lessons: 24,
      enrolled: 120,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
    },
    {
      id: 2,
      title: 'Traditional Coffee Culture',
      description: 'Learn about Ethiopian coffee traditions and ceremony',
      category: 'Culture',
      difficulty: 'Beginner',
      duration: '8 weeks',
      lessons: 16,
      enrolled: 85,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800'
    },
    {
      id: 3,
      title: 'Lalibela Rock Churches',
      description: 'Study the architectural marvels of Lalibela',
      category: 'Architecture',
      difficulty: 'Advanced',
      duration: '16 weeks',
      lessons: 32,
      enrolled: 95,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
    }
  ],
  recommendations: [
    {
      id: 1,
      title: 'Axum Civilization',
      description: 'Discover the ancient kingdom of Axum',
      category: 'History',
      difficulty: 'Intermediate',
      recommendationReason: 'Based on your interest in ancient history'
    },
    {
      id: 2,
      title: 'Ethiopian Cuisine Culture',
      description: 'Learn about traditional Ethiopian cooking',
      category: 'Culture',
      difficulty: 'Beginner',
      recommendationReason: 'Complements your coffee culture knowledge'
    }
  ]
};

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  try {
    if (path === '/api/learning/progress') {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: mockLearningData.progress
      }));
    } else if (path === '/api/learning/achievements') {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: mockLearningData.achievements
      }));
    } else if (path === '/api/learning/courses') {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: mockLearningData.courses
      }));
    } else if (path === '/api/learning/recommendations') {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: mockLearningData.recommendations
      }));
    } else if (path === '/api/map/heritage-sites') {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: [
          {
            id: 1,
            name: 'Lalibela Rock Churches',
            latitude: 12.0323,
            longitude: 39.0411,
            type: 'Religious Site',
            description: 'Medieval monolithic churches'
          },
          {
            id: 2,
            name: 'Axum Stelae',
            latitude: 14.1312,
            longitude: 38.7206,
            type: 'Archaeological Site',
            description: 'Ancient obelisks and ruins'
          },
          {
            id: 3,
            name: 'Simien Mountains',
            latitude: 13.1833,
            longitude: 38.0833,
            type: 'Natural Heritage',
            description: 'UNESCO World Heritage national park'
          }
        ]
      }));
    } else if (path === '/api/health') {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'OK',
        message: 'EthioHeritage360 Server is running',
        timestamp: new Date().toISOString()
      }));
    } else if (path === '/') {
      res.writeHead(200);
      res.end(JSON.stringify({
        message: 'Welcome to EthioHeritage360 API - Ethiopian Museum Platform',
        version: '1.0.0',
        description: 'Simple server with learning and cultural education features',
        features: [
          'Learning Progress Tracking',
          'Achievement System',
          'Cultural Courses',
          'Personalized Recommendations',
          'Heritage Site Mapping'
        ],
        endpoints: {
          health: '/api/health',
          learning: {
            progress: '/api/learning/progress',
            achievements: '/api/learning/achievements',
            courses: '/api/learning/courses',
            recommendations: '/api/learning/recommendations'
          },
          map: {
            heritageSites: '/api/map/heritage-sites'
          }
        }
      }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({
        success: false,
        message: 'Route not found'
      }));
    }
  } catch (error) {
    res.writeHead(500);
    res.end(JSON.stringify({
      success: false,
      message: 'Internal server error',
      error: error.message
    }));
  }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🇪🇹 EthioHeritage360 Server running on port ${PORT}`);
  console.log(`📚 Learning endpoints available`);
  console.log(`🗺️  Heritage site mapping available`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 CORS enabled for frontend connections`);
});

module.exports = server;
