import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import VisitorSidebar from '../../components/dashboard/VisitorSidebar';
import { 
  FaMapMarkerAlt, 
  FaGlobe, 
  FaCalendarAlt, 
  FaLaptop,
  FaMobile,
  FaTools,
  FaLanguage,
  FaCalculator,
  FaBook,
  FaGamepad,
  FaDownload,
  FaExternalLinkAlt,
  FaSpinner,
  FaStar,
  FaUsers,
  FaEye,
  FaArrowRight
} from 'react-icons/fa';
import { toast } from 'sonner';
import educationService from '../../services/educationService';

const Tools = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [educationalStats, setEducationalStats] = useState({});

  useEffect(() => {
    loadEducationalStats();
  }, []);

  const loadEducationalStats = async () => {
    try {
      const stats = await educationService.getLearningStats();
      if (stats.success) {
        setEducationalStats(stats.stats);
      }
    } catch (error) {
      console.error('Error loading educational stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const toolCategories = [
    {
      title: 'Educational Tools',
      tools: [
        {
          name: 'Interactive Flashcards',
          description: 'Study Ethiopian heritage with spaced repetition flashcards',
          icon: FaBook,
          path: '/education?section=flashcards',
          color: 'bg-purple-500',
          available: true
        },
        {
          name: 'Practice Quizzes',
          description: 'Test your knowledge with interactive quizzes',
          icon: FaGamepad,
          path: '/education?section=quizzes',
          color: 'bg-green-500',
          available: true
        },
        {
          name: 'Educational Games',
          description: 'Learn through fun and engaging games',
          icon: FaGamepad,
          path: '/visitor/games',
          color: 'bg-red-500',
          available: true
        }
      ]
    },
    {
      title: 'Navigation & Geography',
      tools: [
        {
          name: 'Heritage Map',
          description: 'Interactive map of Ethiopian heritage sites and museums',
          icon: FaMapMarkerAlt,
          path: '/map',
          color: 'bg-blue-500',
          available: true
        }
      ]
    },
    {
      title: 'Language & Culture',
      tools: [
        {
          name: 'Language Guide',
          description: 'Learn basic Amharic phrases and cultural etiquette',
          icon: FaLanguage,
          path: '/visitor/language',
          color: 'bg-green-500',
          available: false
        },
        {
          name: 'Cultural Calendar',
          description: 'Ethiopian holidays, festivals, and important dates',
          icon: FaCalendarAlt,
          path: '/visitor/cultural-calendar',
          color: 'bg-purple-500',
          available: false
        }
      ]
    },
    {
      title: 'Utilities & Converters',
      tools: [
        {
          name: 'Ethiopian Calendar',
          description: 'Convert between Ethiopian and Gregorian calendars',
          icon: FaCalculator,
          path: '/visitor/converters',
          color: 'bg-orange-500',
          available: false
        }
      ]
    },
    {
      title: 'Mobile & Apps',
      tools: [
        {
          name: 'Mobile App',
          description: 'Download our mobile app for on-the-go learning',
          icon: FaMobile,
          path: '/visitor/mobile',
          color: 'bg-pink-500',
          available: false
        }
      ]
    }
  ];

  const handleToolClick = (tool) => {
    if (tool.available) {
      navigate(tool.path);
    } else {
      // Show coming soon message
      alert(`${tool.name} is coming soon! We're working hard to bring you this feature.`);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <VisitorSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FaTools className="text-blue-600" />
                Tools & Resources
              </h1>
              <p className="text-gray-600 mt-2">Helpful utilities to enhance your heritage learning experience</p>
            </div>
          </div>
        </div>

        {/* Tool Categories */}
        <div className="space-y-8">
          {toolCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{category.title}</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.tools.map((tool, toolIndex) => (
                  <div
                    key={toolIndex}
                    onClick={() => handleToolClick(tool)}
                    className={`relative p-6 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                      tool.available 
                        ? 'hover:scale-105 border-2 border-transparent hover:border-blue-300' 
                        : 'opacity-75 cursor-not-allowed'
                    }`}
                    style={{
                      background: tool.available 
                        ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                        : 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)'
                    }}
                  >
                    {!tool.available && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                        Soon
                      </div>
                    )}
                    
                    <div className="flex items-start gap-4">
                      <div className={`${tool.color} p-3 rounded-full ${!tool.available && 'opacity-60'}`}>
                        <tool.icon className="h-6 w-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={`font-semibold text-lg mb-2 ${
                          tool.available ? 'text-gray-800' : 'text-gray-600'
                        }`}>
                          {tool.name}
                        </h3>
                        <p className={`text-sm ${
                          tool.available ? 'text-gray-600' : 'text-gray-500'
                        }`}>
                          {tool.description}
                        </p>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            tool.available 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {tool.available ? 'Available' : 'Coming Soon'}
                          </span>
                          
                          {tool.available && (
                            <span className="text-blue-600 text-sm font-medium hover:text-blue-800">
                              Open →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Access Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaGlobe className="text-green-500" />
            Quick Access
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={() => navigate('/map')}
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
            >
              <FaMapMarkerAlt className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Heritage Map</span>
            </div>
            
            <div 
              onClick={() => navigate('/courses')}
              className="flex items-center gap-3 p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
            >
              <FaLaptop className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Browse Courses</span>
            </div>
            
            <div 
              onClick={() => navigate('/virtual-museum')}
              className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
            >
              <FaLaptop className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-800">Virtual Museum</span>
            </div>
            
            <div 
              onClick={() => navigate('/support')}
              className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
            >
              <FaTools className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-800">Get Support</span>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mt-8 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 Pro Tips</h3>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• Use the Heritage Map to plan your virtual museum visits</li>
            <li>• Bookmark your favorite tools for quick access</li>
            <li>• Check back regularly for new tools and updates</li>
            <li>• Contact support if you need help with any tool</li>
          </ul>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Tools;
