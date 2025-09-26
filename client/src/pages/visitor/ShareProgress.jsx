import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  FaShare, 
  FaTrophy, 
  FaMedal, 
  FaStar,
  FaCertificate,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaCopy,
  FaCheck,
  FaSpinner,
  FaEye,
  FaHeart,
  FaComment,
  FaCalendarAlt,
  FaChartLine,
  FaFire,
  FaGem,
  FaBookmark,
  FaDownload,
  FaImage,
  FaPaperPlane,
  FaGlobe,
  FaUsers,
  FaHistory
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const ShareProgress = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const [goals, setGoals] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [shareMessage, setShareMessage] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['internal']);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [activeTab, setActiveTab] = useState('achievements'); // achievements, goals, shared
  const [sharedPosts, setSharedPosts] = useState([]);

  const socialPlatforms = [
    { id: 'internal', name: 'Community Feed', icon: FaUsers, color: 'bg-blue-500', enabled: true },
    { id: 'facebook', name: 'Facebook', icon: FaFacebook, color: 'bg-blue-600', enabled: true },
    { id: 'twitter', name: 'Twitter', icon: FaTwitter, color: 'bg-blue-400', enabled: true },
    { id: 'linkedin', name: 'LinkedIn', icon: FaLinkedin, color: 'bg-blue-700', enabled: true },
    { id: 'instagram', name: 'Instagram', icon: FaInstagram, color: 'bg-pink-600', enabled: false }
  ];

  useEffect(() => {
    loadUserProgress();
    loadSharedPosts();
  }, []);

  const loadUserProgress = async () => {
    try {
      setLoading(true);

      // Load achievements and goals
      const [achievementsResponse, goalsResponse] = await Promise.all([
        fetch('/api/progress/achievements', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/progress/goals', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (achievementsResponse.ok) {
        const achievementsData = await achievementsResponse.json();
        setAchievements(achievementsData.achievements || []);
      }

      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json();
        setGoals(goalsData.goals || []);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      toast.error('Failed to load your progress');
      
      // Mock data fallback
      setAchievements([
        {
          _id: '1',
          title: 'Heritage Explorer',
          description: 'Visited 10 different heritage sites',
          icon: 'star',
          category: 'exploration',
          earnedAt: new Date(Date.now() - 86400000 * 2),
          points: 100,
          rarity: 'common',
          progress: { current: 10, target: 10 }
        },
        {
          _id: '2',
          title: 'Knowledge Seeker',
          description: 'Completed 5 courses successfully',
          icon: 'book',
          category: 'learning',
          earnedAt: new Date(Date.now() - 86400000 * 7),
          points: 250,
          rarity: 'rare',
          progress: { current: 5, target: 5 }
        },
        {
          _id: '3',
          title: 'Community Champion',
          description: 'Helped 20 fellow learners',
          icon: 'heart',
          category: 'social',
          earnedAt: new Date(Date.now() - 86400000 * 14),
          points: 150,
          rarity: 'uncommon',
          progress: { current: 20, target: 20 }
        }
      ]);

      setGoals([
        {
          _id: '1',
          title: 'Master Ethiopian History',
          description: 'Complete all history courses and quizzes',
          category: 'learning',
          status: 'completed',
          progress: 100,
          target: 12,
          current: 12,
          completedAt: new Date(Date.now() - 86400000),
          points: 500
        },
        {
          _id: '2',
          title: 'Museum Marathon',
          description: 'Visit 15 museums this year',
          category: 'exploration',
          status: 'active',
          progress: 80,
          target: 15,
          current: 12,
          deadline: new Date(Date.now() + 86400000 * 90),
          points: 300
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadSharedPosts = async () => {
    try {
      const response = await fetch('/api/community/my-shared-progress', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSharedPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error loading shared posts:', error);
      
      // Mock data fallback
      setSharedPosts([
        {
          _id: '1',
          type: 'achievement',
          item: {
            title: 'Heritage Explorer',
            description: 'Visited 10 different heritage sites'
          },
          message: 'Just unlocked my Heritage Explorer badge! 🏛️ Loving the journey through Ethiopian cultural sites.',
          platforms: ['internal', 'facebook'],
          sharedAt: new Date(Date.now() - 86400000),
          interactions: {
            views: 45,
            likes: 12,
            comments: 3
          }
        }
      ]);
    }
  };

  const shareProgress = async () => {
    if (!selectedItem) return;

    const platforms = selectedPlatforms.filter(p => p !== 'internal');
    const message = shareMessage || generateDefaultMessage(selectedItem);

    try {
      const response = await fetch('/api/community/share-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          goalId: selectedItem._id,
          message,
          platforms: selectedPlatforms
        })
      });

      if (!response.ok) {
        throw new Error('Failed to share progress');
      }

      toast.success('Progress shared successfully!');
      setShowShareModal(false);
      setShareMessage('');
      setSelectedPlatforms(['internal']);
      loadSharedPosts();
    } catch (error) {
      console.error('Error sharing progress:', error);
      toast.error('Failed to share progress');
    }
  };

  const generateDefaultMessage = (item) => {
    if (item.title && item.description) {
      return `🎉 Just achieved "${item.title}"! ${item.description}`;
    } else if (item.title) {
      return `🎯 Completed my goal: "${item.title}"! #EthiopianHeritage`;
    }
    return 'Made great progress on my heritage learning journey!';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedText(''), 2000);
    });
  };

  const generateShareableLink = (item) => {
    return `${window.location.origin}/achievement/${item._id}`;
  };

  const getAchievementIcon = (iconName) => {
    const icons = {
      star: FaStar,
      trophy: FaTrophy,
      medal: FaMedal,
      certificate: FaCertificate,
      book: FaBookmark,
      heart: FaHeart,
      fire: FaFire,
      gem: FaGem
    };
    return icons[iconName] || FaStar;
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'bg-gray-100 text-gray-700 border-gray-200',
      uncommon: 'bg-green-100 text-green-700 border-green-200',
      rare: 'bg-blue-100 text-blue-700 border-blue-200',
      epic: 'bg-purple-100 text-purple-700 border-purple-200',
      legendary: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };
    return colors[rarity] || colors.common;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return format(new Date(date), 'MMM dd, yyyy');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-purple-600 mb-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaShare className="text-purple-600" />
            Share Your Progress
          </h1>
          <p className="text-gray-600 mt-2">Celebrate your achievements and inspire others</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'achievements'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <FaTrophy className="inline mr-2" />
              Achievements
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'goals'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <FaChartLine className="inline mr-2" />
              Completed Goals
            </button>
            <button
              onClick={() => setActiveTab('shared')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'shared'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <FaHistory className="inline mr-2" />
              Previously Shared
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'achievements' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => {
              const IconComponent = getAchievementIcon(achievement.icon);
              
              return (
                <div
                  key={achievement._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      achievement.rarity === 'legendary' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                      achievement.rarity === 'epic' ? 'bg-gradient-to-br from-purple-400 to-pink-500' :
                      achievement.rarity === 'rare' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                      achievement.rarity === 'uncommon' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                      'bg-gradient-to-br from-gray-400 to-gray-600'
                    }`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    
                    <span className={`px-2 py-1 rounded-full text-xs border ${getRarityColor(achievement.rarity)}`}>
                      {achievement.rarity}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">{achievement.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{achievement.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt />
                      {formatTimeAgo(achievement.earnedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaStar className="text-yellow-500" />
                      {achievement.points} pts
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedItem(achievement);
                      setShowShareModal(true);
                    }}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <FaShare />
                    Share Achievement
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="grid md:grid-cols-2 gap-6">
            {goals.filter(goal => goal.status === 'completed').map((goal) => (
              <div
                key={goal._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2">{goal.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{goal.description}</p>
                  </div>
                  
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FaCheck className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                
                <div className="bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{goal.current}/{goal.target} completed</span>
                  <span className="flex items-center gap-1">
                    <FaStar className="text-yellow-500" />
                    {goal.points} pts
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt />
                    Completed {formatTimeAgo(goal.completedAt)}
                  </span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                    {goal.category}
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    setSelectedItem(goal);
                    setShowShareModal(true);
                  }}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <FaShare />
                  Share Goal Completion
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'shared' && (
          <div className="space-y-6">
            {sharedPosts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <FaShare className="h-6 w-6 text-purple-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-800">{post.item.title}</span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(post.sharedAt)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{post.message}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <FaEye />
                        {post.interactions.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <FaHeart />
                        {post.interactions.likes} likes
                      </span>
                      <span className="flex items-center gap-1">
                        <FaComment />
                        {post.interactions.comments} comments
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      {post.platforms.map(platform => {
                        const platformData = socialPlatforms.find(p => p.id === platform);
                        if (!platformData) return null;
                        
                        const IconComponent = platformData.icon;
                        return (
                          <div
                            key={platform}
                            className={`${platformData.color} text-white px-2 py-1 rounded text-xs flex items-center gap-1`}
                          >
                            <IconComponent className="h-3 w-3" />
                            {platformData.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {sharedPosts.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                <FaShare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No shared progress yet</p>
                <p>Start sharing your achievements to inspire others!</p>
              </div>
            )}
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Share Your Progress</h2>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>

                {/* Item Preview */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      {selectedItem.icon ? (
                        React.createElement(getAchievementIcon(selectedItem.icon), {
                          className: "h-6 w-6 text-purple-600"
                        })
                      ) : (
                        <FaChartLine className="h-6 w-6 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{selectedItem.title}</h3>
                      <p className="text-sm text-gray-600">{selectedItem.description}</p>
                    </div>
                  </div>
                </div>

                {/* Message Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Share Message
                  </label>
                  <textarea
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                    placeholder={generateDefaultMessage(selectedItem)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none h-32"
                  />
                </div>

                {/* Platform Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Share to Platforms
                  </label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {socialPlatforms.map(platform => {
                      const IconComponent = platform.icon;
                      const isSelected = selectedPlatforms.includes(platform.id);
                      
                      return (
                        <label
                          key={platform.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${!platform.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (!platform.enabled) return;
                              
                              if (e.target.checked) {
                                setSelectedPlatforms([...selectedPlatforms, platform.id]);
                              } else {
                                setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.id));
                              }
                            }}
                            disabled={!platform.enabled}
                            className="h-4 w-4 text-purple-600 rounded"
                          />
                          <div className={`w-8 h-8 ${platform.color} rounded-full flex items-center justify-center`}>
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-medium">{platform.name}</span>
                          {!platform.enabled && (
                            <span className="text-xs text-gray-500 ml-auto">Coming Soon</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Share Options */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Additional Options
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => copyToClipboard(generateShareableLink(selectedItem))}
                      className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors"
                    >
                      {copiedText === generateShareableLink(selectedItem) ? <FaCheck /> : <FaCopy />}
                      Copy Shareable Link
                    </button>
                    
                    <button className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors">
                      <FaDownload />
                      Download Achievement Certificate
                    </button>
                    
                    <button className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors">
                      <FaImage />
                      Create Social Media Image
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={shareProgress}
                    disabled={selectedPlatforms.length === 0}
                    className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    <FaPaperPlane />
                    Share Progress
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareProgress;
