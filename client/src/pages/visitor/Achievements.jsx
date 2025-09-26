import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FaTrophy, FaStar, FaLock, FaCalendar, FaMedal, FaAward } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Achievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, earned, available
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchAchievements();
  }, [filter, category]);

  const fetchAchievements = async () => {
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      if (filter === 'earned') params.append('earned', 'true');
      if (filter === 'available') params.append('earned', 'false');

      const response = await fetch(`/api/progress/achievements?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }

      const data = await response.json();
      setAchievements(data.achievements || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Failed to load achievements');
      // Mock data fallback
      setAchievements([
        {
          _id: '1',
          name: 'First Steps',
          description: 'Complete your first course',
          category: 'learning',
          points: 50,
          icon: 'trophy',
          rarity: 'common',
          earned: true,
          earnedAt: new Date().toISOString(),
          progress: { current: 1, required: 1 }
        },
        {
          _id: '2',
          name: 'Heritage Explorer',
          description: 'Visit 10 virtual museums',
          category: 'exploration',
          points: 100,
          icon: 'star',
          rarity: 'uncommon',
          earned: false,
          progress: { current: 3, required: 10 }
        },
        {
          _id: '3',
          name: 'Knowledge Seeker',
          description: 'Score 90%+ on 5 quizzes',
          category: 'learning',
          points: 150,
          icon: 'medal',
          rarity: 'rare',
          earned: false,
          progress: { current: 2, required: 5 }
        },
        {
          _id: '4',
          name: 'Social Butterfly',
          description: 'Join 3 study groups',
          category: 'social',
          points: 75,
          icon: 'award',
          rarity: 'common',
          earned: true,
          earnedAt: new Date().toISOString(),
          progress: { current: 3, required: 3 }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementIcon = (iconType, earned, rarity) => {
    const iconProps = {
      className: `h-8 w-8 ${earned ? getEarnedColor(rarity) : 'text-gray-400'}`
    };

    switch (iconType) {
      case 'trophy': return <FaTrophy {...iconProps} />;
      case 'star': return <FaStar {...iconProps} />;
      case 'medal': return <FaMedal {...iconProps} />;
      case 'award': return <FaAward {...iconProps} />;
      default: return <FaTrophy {...iconProps} />;
    }
  };

  const getEarnedColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-green-600';
      case 'uncommon': return 'text-blue-600';
      case 'rare': return 'text-purple-600';
      case 'epic': return 'text-orange-600';
      case 'legendary': return 'text-yellow-500';
      default: return 'text-gray-600';
    }
  };

  const getRarityBg = (rarity, earned) => {
    if (!earned) return 'bg-gray-100';
    switch (rarity) {
      case 'common': return 'bg-green-50 border-green-200';
      case 'uncommon': return 'bg-blue-50 border-blue-200';
      case 'rare': return 'bg-purple-50 border-purple-200';
      case 'epic': return 'bg-orange-50 border-orange-200';
      case 'legendary': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50';
    }
  };

  const getProgressPercentage = (current, required) => {
    return Math.min((current / required) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  const earnedAchievements = achievements.filter(a => a.earned);
  const totalPoints = earnedAchievements.reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FaTrophy className="text-yellow-600" />
                My Achievements
              </h1>
              <p className="text-gray-600 mt-2">Track your learning milestones and rewards</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{earnedAchievements.length}</div>
                <div className="text-sm text-gray-600">Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{totalPoints}</div>
                <div className="text-sm text-gray-600">Points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({achievements.length})
              </button>
              <button
                onClick={() => setFilter('earned')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'earned'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Earned ({earnedAchievements.length})
              </button>
              <button
                onClick={() => setFilter('available')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'available'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                In Progress ({achievements.filter(a => !a.earned).length})
              </button>
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="all">All Categories</option>
              <option value="learning">Learning</option>
              <option value="exploration">Exploration</option>
              <option value="social">Social</option>
              <option value="milestone">Milestone</option>
              <option value="special">Special</option>
            </select>
          </div>
        </div>

        {/* Achievements Grid */}
        {achievements.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaTrophy className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No achievements found</h3>
            <p className="text-gray-500">Start learning to earn your first achievements!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map(achievement => (
              <div
                key={achievement._id}
                className={`bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg ${
                  achievement.earned ? getRarityBg(achievement.rarity, true) : 'bg-gray-50'
                } border-2 ${achievement.earned ? 'border-opacity-50' : 'border-gray-200'}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {achievement.earned ? (
                        getAchievementIcon(achievement.icon, true, achievement.rarity)
                      ) : (
                        <div className="relative">
                          <FaLock className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className={`font-semibold text-lg ${
                          achievement.earned ? 'text-gray-800' : 'text-gray-500'
                        }`}>
                          {achievement.name}
                        </h3>
                        <p className={`text-sm capitalize px-2 py-1 rounded-full inline-block ${
                          achievement.earned
                            ? `${getRarityBg(achievement.rarity, true)} ${getEarnedColor(achievement.rarity)}`
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {achievement.rarity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        achievement.earned ? 'text-yellow-600' : 'text-gray-400'
                      }`}>
                        {achievement.points} pts
                      </div>
                    </div>
                  </div>

                  <p className={`text-sm mb-4 ${
                    achievement.earned ? 'text-gray-700' : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>

                  {!achievement.earned && achievement.progress && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress.current}/{achievement.progress.required}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${getProgressPercentage(achievement.progress.current, achievement.progress.required)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {achievement.earned && achievement.earnedAt && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaCalendar className="h-4 w-4" />
                      <span>Earned {new Date(achievement.earnedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;
