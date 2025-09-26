import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  FaTrophy, 
  FaMedal, 
  FaAward, 
  FaCrown,
  FaFire, 
  FaStar,
  FaUsers,
  FaChartBar,
  FaCalendarAlt,
  FaFilter,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaGamepad,
  FaBook,
  FaTools,
  FaGem
} from 'react-icons/fa';
import { toast } from 'sonner';

const CommunityLeaderboard = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [stats, setStats] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('overall');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [anonymized, setAnonymized] = useState(false);

  const categories = [
    { value: 'overall', label: 'Overall', icon: FaTrophy },
    { value: 'games', label: 'Games', icon: FaGamepad },
    { value: 'quizzes', label: 'Quizzes', icon: FaBook },
    { value: 'courses', label: 'Courses', icon: FaBook },
    { value: 'tools', label: 'Tools', icon: FaTools },
    { value: 'collections', label: 'Collections', icon: FaGem }
  ];

  const timeframes = [
    { value: 'all', label: 'All Time' },
    { value: 'year', label: 'This Year' },
    { value: 'month', label: 'This Month' },
    { value: 'week', label: 'This Week' }
  ];

  useEffect(() => {
    loadLeaderboard();
  }, [selectedCategory, selectedTimeframe]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        category: selectedCategory,
        timeframe: selectedTimeframe,
        anonymized: anonymized.toString()
      });

      const [leaderboardResponse, positionResponse, statsResponse] = await Promise.all([
        fetch(`/api/leaderboard?${params}`),
        user ? fetch(`/api/leaderboard/my-position?${params}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }) : null,
        fetch(`/api/leaderboard/stats?${params}`)
      ]);

      if (leaderboardResponse.ok) {
        const data = await leaderboardResponse.json();
        setLeaderboardData(data.leaderboard || []);
      }

      if (positionResponse?.ok) {
        const posData = await positionResponse.json();
        setUserPosition(posData);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats || {});
      }

    } catch (error) {
      console.error('Error loading leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position) => {
    if (position === 1) return <FaCrown className="text-yellow-500" />;
    if (position === 2) return <FaMedal className="text-gray-400" />;
    if (position === 3) return <FaAward className="text-orange-500" />;
    return <span className="font-bold text-blue-600">#{position}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaTrophy className="text-yellow-500" />
            Community Leaderboard
          </h1>
          <p className="text-gray-600 mt-2">See how you rank among fellow learners</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon />
                    {category.label}
                  </button>
                );
              })}
            </div>
            
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeframes.map(timeframe => (
                <option key={timeframe.value} value={timeframe.value}>
                  {timeframe.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setAnonymized(!anonymized)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                anonymized ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {anonymized ? <FaEyeSlash /> : <FaEye />}
              {anonymized ? 'Anonymous' : 'Show Names'}
            </button>
          </div>
        </div>

        {/* Your Position */}
        {user && userPosition && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Your Position</h3>
                <div className="flex items-center gap-3 mt-2">
                  {getRankIcon(userPosition.position)}
                  <span className="text-2xl font-bold">#{userPosition.position}</span>
                  <span className="text-lg">{userPosition.points} points</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-80">Points to next rank</div>
                <div className="text-xl font-bold">{userPosition.pointsToNext || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Podium */}
        {leaderboardData.length >= 3 && (
          <div className="mb-8">
            <div className="flex justify-center items-end gap-4">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="w-24 h-32 bg-gradient-to-br from-gray-300 to-gray-500 rounded-lg flex items-center justify-center mb-3">
                  <FaMedal className="text-4xl text-white" />
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <div className="font-semibold">
                    {anonymized ? `User ${leaderboardData[1]?.userId?.slice(-4)}` : leaderboardData[1]?.username}
                  </div>
                  <div className="text-gray-600">{leaderboardData[1]?.points} pts</div>
                </div>
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <div className="w-28 h-40 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mb-3">
                  <FaCrown className="text-5xl text-white" />
                </div>
                <div className="bg-white rounded-lg p-4 shadow-lg border-2 border-yellow-400">
                  <div className="font-bold text-lg">
                    {anonymized ? `User ${leaderboardData[0]?.userId?.slice(-4)}` : leaderboardData[0]?.username}
                  </div>
                  <div className="text-yellow-600 font-semibold">{leaderboardData[0]?.points} pts</div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div className="w-24 h-28 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center mb-3">
                  <FaAward className="text-4xl text-white" />
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <div className="font-semibold">
                    {anonymized ? `User ${leaderboardData[2]?.userId?.slice(-4)}` : leaderboardData[2]?.username}
                  </div>
                  <div className="text-gray-600">{leaderboardData[2]?.points} pts</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold">Full Rankings</h3>
          </div>
          
          <div className="divide-y">
            {leaderboardData.map((entry, index) => (
              <div 
                key={entry.userId}
                className={`p-4 flex items-center justify-between hover:bg-gray-50 ${
                  entry.isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 text-center">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-blue-600">
                      {anonymized ? 'U' : (entry.username?.charAt(0) || 'U')}
                    </span>
                  </div>
                  
                  <div>
                    <div className="font-semibold">
                      {entry.isCurrentUser ? 'You' : 
                       anonymized ? `User ${entry.userId?.slice(-4)}` : entry.username}
                    </div>
                    <div className="text-sm text-gray-500">
                      Level {entry.level || 1}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-lg">{entry.points}</div>
                  <div className="text-sm text-gray-500">points</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FaUsers className="text-3xl text-blue-500 mb-4 mx-auto" />
            <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
            <div className="text-gray-500">Total Participants</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FaStar className="text-3xl text-yellow-500 mb-4 mx-auto" />
            <div className="text-2xl font-bold">{stats.averagePoints || 0}</div>
            <div className="text-gray-500">Average Points</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FaFire className="text-3xl text-orange-500 mb-4 mx-auto" />
            <div className="text-2xl font-bold">{stats.topScore || 0}</div>
            <div className="text-gray-500">Highest Score</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityLeaderboard;
