import React, { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  Target, 
  Brain, 
  Star, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Download,
  Play,
  Lightbulb,
  Coffee,
  Trophy,
  Calendar,
  Users,
  Zap,
  Heart,
  Shield,
  Map,
  Sparkles,
  Rocket,
  BookMarked,
  GraduationCap,
  Award,
  Timer
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const StudyGuides = ({ darkMode, toggleDarkMode }) => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [completedTips, setCompletedTips] = useState(new Set());

  const studyCategories = [
    { id: 'general', name: 'General Study Tips', icon: '📚', color: 'blue' },
    { id: 'memorization', name: 'Memory Techniques', icon: '🧠', color: 'purple' },
    { id: 'time-management', name: 'Time Management', icon: '⏰', color: 'green' },
    { id: 'exam-prep', name: 'Exam Preparation', icon: '🎯', color: 'orange' },
    { id: 'cultural-learning', name: 'Cultural Learning', icon: '🎭', color: 'pink' },
    { id: 'language-learning', name: 'Language Tips', icon: '🗣️', color: 'indigo' }
  ];

  const studyTips = {
    general: [
      {
        id: 1,
        title: 'Create a Dedicated Study Space',
        description: 'Set up a quiet, organized area specifically for learning about Ethiopian heritage.',
        details: 'Choose a space with good lighting, minimal distractions, and all necessary materials within reach. Keep Ethiopian cultural elements like photos or artifacts nearby for inspiration.',
        difficulty: 'Easy',
        timeRequired: '30 minutes setup',
        effectiveness: 85,
        tips: [
          'Remove all distractions like phones or TV',
          'Ensure good lighting and comfortable seating',
          'Keep study materials organized and accessible',
          'Add cultural elements for motivation'
        ]
      },
      {
        id: 2,
        title: 'Set SMART Learning Goals',
        description: 'Define Specific, Measurable, Achievable, Relevant, and Time-bound learning objectives.',
        details: 'Instead of "learn Ethiopian history," set goals like "complete the Aksumite Kingdom course by the end of this week."',
        difficulty: 'Medium',
        timeRequired: '15 minutes',
        effectiveness: 90,
        tips: [
          'Write down specific learning objectives',
          'Set deadlines for each course or topic',
          'Track your progress regularly',
          'Celebrate small victories'
        ]
      },
      {
        id: 3,
        title: 'Use Active Recall Techniques',
        description: 'Test yourself regularly instead of just re-reading materials.',
        details: 'After studying about Ethiopian festivals, close your notes and try to explain Timkat celebration from memory.',
        difficulty: 'Medium',
        timeRequired: '20-30 minutes',
        effectiveness: 95,
        tips: [
          'Quiz yourself after each lesson',
          'Explain concepts out loud',
          'Create flashcards for key terms',
          'Teach others what you\'ve learned'
        ]
      },
      {
        id: 4,
        title: 'Practice Spaced Repetition',
        description: 'Review material at increasing intervals to improve long-term retention.',
        details: 'Review new Ethiopian historical facts after 1 day, then 3 days, then a week, then a month.',
        difficulty: 'Medium',
        timeRequired: 'Ongoing',
        effectiveness: 92,
        tips: [
          'Review material the next day',
          'Review again after 3 days',
          'Review once more after a week',
          'Final review after a month'
        ]
      },
      {
        id: 5,
        title: 'Connect New Information to Prior Knowledge',
        description: 'Link Ethiopian heritage concepts to things you already know.',
        details: 'Connect Ethiopian coffee culture to your own experiences with coffee, or compare Ethiopian architecture to buildings you\'ve seen.',
        difficulty: 'Easy',
        timeRequired: '10-15 minutes',
        effectiveness: 88,
        tips: [
          'Find similarities with your own culture',
          'Compare to historical events you know',
          'Create personal connections',
          'Use analogies and metaphors'
        ]
      }
    ],
    memorization: [
      {
        id: 6,
        title: 'Create Visual Memory Palaces',
        description: 'Use familiar locations to remember Ethiopian historical events and facts.',
        details: 'Imagine walking through your house and placing Ethiopian kingdoms in different rooms - Aksum in the living room, Zagwe dynasty in the kitchen.',
        difficulty: 'Hard',
        timeRequired: '45-60 minutes',
        effectiveness: 93,
        tips: [
          'Choose a familiar location',
          'Create a logical walking path',
          'Place vivid images at each stop',
          'Practice the journey regularly'
        ]
      },
      {
        id: 7,
        title: 'Use Mnemonic Devices',
        description: 'Create memorable phrases to remember lists and sequences.',
        details: 'Remember Ethiopian festival order: "Timkat Makes Everyone Genna" (Timkat, Meskel, Epiphany, Genna).',
        difficulty: 'Medium',
        timeRequired: '20-30 minutes',
        effectiveness: 87,
        tips: [
          'Create funny or meaningful phrases',
          'Use first letters of words to remember lists',
          'Make it personal and memorable',
          'Practice saying it out loud'
        ]
      },
      {
        id: 8,
        title: 'Tell Stories with Facts',
        description: 'Turn historical facts into memorable narratives.',
        details: 'Instead of memorizing dates, create a story about Lucy (Dinkinesh) and her discovery, making it a personal journey.',
        difficulty: 'Medium',
        timeRequired: '30-40 minutes',
        effectiveness: 91,
        tips: [
          'Create characters and plots',
          'Include emotional elements',
          'Make it dramatic or humorous',
          'Connect events chronologically'
        ]
      }
    ],
    'time-management': [
      {
        id: 9,
        title: 'Use the Pomodoro Technique',
        description: 'Study in focused 25-minute intervals with 5-minute breaks.',
        details: 'Set a timer for 25 minutes to study Ethiopian traditional music, then take a 5-minute break. Repeat 4 times, then take a longer break.',
        difficulty: 'Easy',
        timeRequired: '25 minutes + breaks',
        effectiveness: 89,
        tips: [
          'Set timer for 25 minutes',
          'Focus completely during work time',
          'Take 5-minute breaks between sessions',
          'Take longer break after 4 cycles'
        ]
      },
      {
        id: 10,
        title: 'Time Blocking for Deep Learning',
        description: 'Schedule specific times for different Ethiopian heritage topics.',
        details: 'Monday: History (1-2 PM), Wednesday: Culture (1-2 PM), Friday: Language (1-2 PM). Consistency helps build routine.',
        difficulty: 'Medium',
        timeRequired: 'Planning: 15 minutes',
        effectiveness: 86,
        tips: [
          'Block specific times in calendar',
          'Assign different subjects to different days',
          'Stick to the schedule consistently',
          'Adjust based on what works'
        ]
      }
    ],
    'exam-prep': [
      {
        id: 11,
        title: 'Practice with Mock Quizzes',
        description: 'Regularly test yourself with practice questions on Ethiopian heritage.',
        details: 'After completing each course module, take the quiz multiple times until you can score 90% or higher consistently.',
        difficulty: 'Medium',
        timeRequired: '20-30 minutes',
        effectiveness: 94,
        tips: [
          'Take quizzes immediately after learning',
          'Retake until you score 90%+',
          'Focus on areas where you scored poorly',
          'Time yourself for real exam conditions'
        ]
      },
      {
        id: 12,
        title: 'Create Summary Sheets',
        description: 'Condense key information into one-page summaries for quick review.',
        details: 'Create a single page summary for each Ethiopian kingdom with key dates, rulers, achievements, and cultural contributions.',
        difficulty: 'Medium',
        timeRequired: '30-45 minutes',
        effectiveness: 88,
        tips: [
          'Use bullet points and short phrases',
          'Include visual elements like timelines',
          'Focus on most important information',
          'Review summary sheets before exams'
        ]
      }
    ],
    'cultural-learning': [
      {
        id: 13,
        title: 'Immerse Yourself in Ethiopian Media',
        description: 'Listen to Ethiopian music, watch documentaries, and explore art.',
        details: 'Listen to traditional Ethiopian music while studying, watch Ethiopian films, and explore Ethiopian art online to deepen cultural understanding.',
        difficulty: 'Easy',
        timeRequired: 'Ongoing',
        effectiveness: 85,
        tips: [
          'Listen to traditional Ethiopian music',
          'Watch Ethiopian documentaries and films',
          'Explore Ethiopian art and photography',
          'Follow Ethiopian cultural accounts online'
        ]
      },
      {
        id: 14,
        title: 'Connect with Ethiopian Communities',
        description: 'Engage with Ethiopian cultural centers or online communities.',
        details: 'Join online Ethiopian heritage groups, attend cultural events, or visit Ethiopian restaurants to practice what you\'ve learned.',
        difficulty: 'Medium',
        timeRequired: 'Variable',
        effectiveness: 92,
        tips: [
          'Join online Ethiopian heritage groups',
          'Attend cultural events in your area',
          'Visit Ethiopian restaurants or coffee shops',
          'Practice speaking Amharic or other Ethiopian languages'
        ]
      }
    ],
    'language-learning': [
      {
        id: 15,
        title: 'Learn Key Ethiopian Phrases',
        description: 'Start with basic greetings and cultural terms in Amharic.',
        details: 'Learn "Selam" (hello), "Ameseginalehu" (thank you), and cultural terms like "injera" and "berbere" to enhance your cultural learning.',
        difficulty: 'Medium',
        timeRequired: '15-20 minutes daily',
        effectiveness: 87,
        tips: [
          'Start with basic greetings',
          'Learn cultural food terms',
          'Practice pronunciation daily',
          'Use terms in context while studying'
        ]
      },
      {
        id: 16,
        title: 'Study Ge\'ez Script Basics',
        description: 'Learn to recognize basic Ge\'ez characters and their meanings.',
        details: 'Start with the Ethiopian alphabet (fidel) and practice writing your name in Ge\'ez script.',
        difficulty: 'Hard',
        timeRequired: '30-45 minutes',
        effectiveness: 83,
        tips: [
          'Learn the alphabet systematically',
          'Practice writing characters daily',
          'Start with your own name',
          'Use online Ge\'ez learning tools'
        ]
      }
    ]
  };

  const learningResources = [
    {
      id: 1,
      title: 'Ethiopian Heritage Study Planner',
      description: 'Weekly planner template for organizing your Ethiopian heritage studies',
      type: 'PDF Template',
      downloadCount: '2.3K',
      rating: 4.8,
      icon: Calendar,
      color: 'blue'
    },
    {
      id: 2,
      title: 'Cultural Learning Checklist',
      description: 'Comprehensive checklist of Ethiopian cultural elements to explore',
      type: 'Interactive List',
      downloadCount: '1.9K',
      rating: 4.9,
      icon: CheckCircle,
      color: 'green'
    },
    {
      id: 3,
      title: 'Historical Timeline Worksheet',
      description: 'Interactive timeline of major Ethiopian historical events',
      type: 'Worksheet',
      downloadCount: '3.1K',
      rating: 4.7,
      icon: Map,
      color: 'orange'
    },
    {
      id: 4,
      title: 'Language Learning Cards',
      description: 'Printable flashcards for Ethiopian languages and cultural terms',
      type: 'Printable Cards',
      downloadCount: '1.5K',
      rating: 4.6,
      icon: BookMarked,
      color: 'purple'
    }
  ];

  const quickTips = [
    {
      title: 'Study in the Morning',
      description: 'Your brain is most receptive to new information after rest',
      icon: '🌅'
    },
    {
      title: 'Take Regular Breaks',
      description: 'Short breaks help consolidate memories and prevent fatigue',
      icon: '☕'
    },
    {
      title: 'Stay Hydrated',
      description: 'Proper hydration improves concentration and memory',
      icon: '💧'
    },
    {
      title: 'Get Enough Sleep',
      description: 'Sleep is crucial for memory consolidation and learning',
      icon: '😴'
    },
    {
      title: 'Exercise Regularly',
      description: 'Physical activity boosts brain function and memory',
      icon: '🏃‍♂️'
    },
    {
      title: 'Eat Brain Foods',
      description: 'Nuts, berries, and fish support cognitive function',
      icon: '🥜'
    }
  ];

  const toggleTipCompletion = (tipId) => {
    const newCompleted = new Set(completedTips);
    if (newCompleted.has(tipId)) {
      newCompleted.delete(tipId);
    } else {
      newCompleted.add(tipId);
    }
    setCompletedTips(newCompleted);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffectivenessColor = (effectiveness) => {
    if (effectiveness >= 90) return 'text-green-600';
    if (effectiveness >= 80) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getCategoryColor = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      green: 'bg-green-500',
      orange: 'bg-orange-500',
      pink: 'bg-pink-500',
      indigo: 'bg-indigo-500'
    };
    return colors[color] || colors.blue;
  };

  const activeTips = studyTips[activeCategory] || [];

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
                <Brain className="w-5 h-5 mr-2" />
                <span className="text-sm font-semibold">Smart Learning Strategies</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Master Ethiopian Heritage with Proven Study Techniques
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                Discover science-backed study methods, memory techniques, and learning strategies 
                to accelerate your understanding of Ethiopian culture and history.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center">
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Learning Smarter
                </button>
                <button className="px-8 py-4 bg-indigo-500/30 border border-white/20 text-white rounded-lg font-semibold hover:bg-indigo-500/50 transition-colors flex items-center justify-center">
                  <Download className="w-5 h-5 mr-2" />
                  Download Study Guide
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Tips Banner */}
        <section className="bg-white py-8 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickTips.map((tip, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl mb-2">{tip.icon}</div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">{tip.title}</h3>
                  <p className="text-xs text-gray-600">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Study Categories */}
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-4">
              {studyCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    activeCategory === category.id
                      ? `${getCategoryColor(category.color)} text-white shadow-lg transform scale-105`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Study Tips Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {studyCategories.find(c => c.id === activeCategory)?.name} Strategies
              </h2>
              <p className="text-xl text-gray-600">
                Evidence-based techniques to maximize your Ethiopian heritage learning
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {activeTips.map(tip => (
                <div key={tip.id} className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <h3 className="text-xl font-bold text-gray-900 mr-4">{tip.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(tip.difficulty)}`}>
                          {tip.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{tip.description}</p>
                    </div>
                    <button
                      onClick={() => toggleTipCompletion(tip.id)}
                      className={`ml-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        completedTips.has(tip.id)
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {completedTips.has(tip.id) && <CheckCircle className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-700 italic">{tip.details}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center">
                      <Timer className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">{tip.timeRequired}</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 text-gray-500 mr-2" />
                      <span className={`text-sm font-medium ${getEffectivenessColor(tip.effectiveness)}`}>
                        {tip.effectiveness}% effective
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Key Steps:</h4>
                    <ul className="space-y-2">
                      {tip.tips.map((stepTip, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{stepTip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Resources */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Study Resources & Templates</h2>
              <p className="text-xl text-gray-600">
                Downloadable materials to organize and enhance your learning journey
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {learningResources.map(resource => {
                const Icon = resource.icon;
                return (
                  <div key={resource.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className={`w-12 h-12 ${getCategoryColor(resource.color)} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="font-bold text-gray-900 mb-2">{resource.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{resource.type}</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{resource.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{resource.downloadCount} downloads</span>
                      <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Progress Tracking */}
        <section className="py-12 bg-gradient-to-r from-green-50 to-teal-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
                <Trophy className="w-5 h-5 mr-2 text-green-600" />
                <span className="text-sm font-semibold text-gray-800">Learning Progress</span>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Track Your Study Success</h2>
              <p className="text-xl text-gray-600 mb-8">
                You've completed {completedTips.size} out of {Object.values(studyTips).flat().length} study techniques
              </p>
              
              <div className="max-w-md mx-auto mb-8">
                <div className="bg-white rounded-full p-2">
                  <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-green-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(completedTips.size / Object.values(studyTips).flat().length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {Math.round((completedTips.size / Object.values(studyTips).flat().length) * 100)}% Complete
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Set Goals</h3>
                  <p className="text-sm text-gray-600">Define what you want to learn</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Practice Daily</h3>
                  <p className="text-sm text-gray-600">Consistency is key to success</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Track Progress</h3>
                  <p className="text-sm text-gray-600">Celebrate your achievements</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default StudyGuides;
