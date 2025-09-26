import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FaTrophy, FaStar, FaFire, FaMedal, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('monthly');
  const [category, setCategory] = useState('all');
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe, category]);

  const fetchLeaderboard = async () => {
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      params.append('timeframe', timeframe);
      params.append('limit', '50');

      const response = await fetch(`/api/community/leaderboard?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
      setUserRank(data.userRank || null);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
      
      // Mock data fallback
      setLeaderboard([
        {
          _id: '1',
          userId: '1',
          fullName: 'Alemayehu Tesfaye',
          username: 'alemayehu_t',
          avatar: null,
          totalPoints: 2580,
          coursesCompleted: 15,
          achievementsEarned: 12,
          studyStreak: 28,
          position: 1
        },
        {
          _id: '2',
          userId: '2',
          fullName: 'Sara Mohammed',
          username: 'sara_m',
          avatar: null,
          totalPoints: 2340,
          coursesCompleted: 12,
          achievementsEarned: 10,
          studyStreak: 21,
          position: 2
        },
        {
          _id: '3',
          userId: '3',
          fullName: 'Daniel Kebede',
          username: 'daniel_k',
          avatar: null,
          totalPoints: 2150,
          coursesCompleted: 11,
          achievementsEarned: 9,
          studyStreak: 15,
          position: 3
        },
        {
          _id: '4',
          userId: '4',
          fullName: 'Meron Addis',
          username: 'meron_a',
          avatar: null,
          totalPoints: 1980,
          coursesCompleted: 9,
          achievementsEarned: 8,
          studyStreak: 12,
          position: 4
        },
        {
          _id: '5',
          userId: user?._id || '5',
          fullName: user?.name || 'You',
          username: user?.username || 'you',
          avatar: user?.avatar,
          totalPoints: 1750,
          coursesCompleted: 8,
          achievementsEarned: 6,
          studyStreak: 8,
          position: 5
        }
      ]);
      setUserRank({ position: 5, totalPoints: 1750 });
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position) => {
    switch (position) {
      case 1:
        return <FaTrophy className="h-8 w-8 text-yellow-500" />;
      case 2:
        return <FaMedal className="h-8 w-8 text-gray-400" />;
      case 3:
        return <FaMedal className="h-8 w-8 text-orange-600" />;
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-gray-600">{position}</span>
          </div>
        );
    }
  };

  const getRankBadge = (position) => {
    if (position <= 3) {
      return `bg-gradient-to-r ${
        position === 1 
          ? 'from-yellow-50 to-yellow-100 border-yellow-200' 
          : position === 2 
          ? 'from-gray-50 to-gray-100 border-gray-200'
          : 'from-orange-50 to-orange-100 border-orange-200'
      }`;
    }
    return 'bg-white';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FaTrophy className="text-yellow-600" />
                Leaderboard
              </h1>
              <p className="text-gray-600 mt-2">See how you rank among fellow heritage enthusiasts</p>
            </div>
            {userRank && (
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">#{userRank.position}</div>
                <div className="text-sm text-gray-600">Your Rank</div>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Time Period:</span>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
                <option value="yearly">This Year</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="all">All Activities</option>
                <option value="course-completion">Course Completions</option>
                <option value="exploration">Museum Exploration</option>
                <option value="social">Social Engagement</option>
                <option value="knowledge">Knowledge Building</option>
              </select>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="mb-8">
            <div className="flex items-end justify-center gap-4 mb-6">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-6 mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaUser className="h-8 w-8 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-lg">{leaderboard[1].fullName}</h3>
                  <p className="text-gray-600 text-sm">@{leaderboard[1].username}</p>
                  <div className="text-2xl font-bold text-gray-600 mt-2">{leaderboard[1].totalPoints}</div>
                  <div className="text-sm text-gray-500">points</div>
                </div>
                <FaMedal className="h-12 w-12 text-gray-400 mx-auto" />
                <div className="text-lg font-bold text-gray-600">2nd</div>
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-lg p-8 mb-4 transform scale-110">
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUser className="h-10 w-10 text-yellow-600" />
                  </div>
                  <h3 className="font-bold text-xl">{leaderboard[0].fullName}</h3>
                  <p className="text-gray-700 text-sm">@{leaderboard[0].username}</p>
                  <div className="text-3xl font-bold text-yellow-600 mt-3">{leaderboard[0].totalPoints}</div>
                  <div className="text-sm text-yellow-700">points</div>
                </div>
                <FaTrophy className="h-16 w-16 text-yellow-500 mx-auto" />
                <div className="text-xl font-bold text-yellow-600">1st</div>
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-lg p-6 mb-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaUser className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-lg">{leaderboard[2].fullName}</h3>
                  <p className="text-gray-600 text-sm">@{leaderboard[2].username}</p>
                  <div className="text-2xl font-bold text-orange-600 mt-2">{leaderboard[2].totalPoints}</div>
                  <div className="text-sm text-orange-700">points</div>
                </div>
                <FaMedal className="h-12 w-12 text-orange-600 mx-auto" />
                <div className="text-lg font-bold text-orange-600">3rd</div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Full Rankings</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {leaderboard.map((entry, index) => (
              <div
                key={entry._id}
                className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${
                  entry.userId === user?._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                } ${getRankBadge(entry.position)} ${entry.position <= 3 ? 'border-2' : ''}`}
              >
                <div className="flex items-center gap-4 flex-1">
                  {getRankIcon(entry.position)}
                  
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <FaUser className="h-6 w-6 text-gray-600" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {entry.fullName}
                      {entry.userId === user?._id && (
                        <span className="ml-2 text-blue-600 text-sm">(You)</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">@{entry.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-lg text-yellow-600">{entry.totalPoints}</div>
                    <div className="text-gray-500">Points</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{entry.coursesCompleted || 0}</div>
                    <div className="text-gray-500">Courses</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-semibold text-purple-600">{entry.achievementsEarned || 0}</div>
                    <div className="text-gray-500">Badges</div>
                  </div>
                  
                  {entry.studyStreak && (
                    <div className="text-center">
                      <div className="font-semibold text-orange-600 flex items-center gap-1">
                        <FaFire className="h-4 w-4" />
                        {entry.studyStreak}
                      </div>
                      <div className="text-gray-500">Streak</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Your Progress Call to Action */}
        {userRank && userRank.position > 10 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mt-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Want to climb the ranks?</h3>
            <p className="text-blue-700 text-sm mb-4">
              Complete more courses, earn achievements, and maintain your study streak to improve your position!
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => window.location.href = '/courses'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Browse Courses
              </button>
              <button 
                onClick={() => window.location.href = '/visitor/goals'}
                className="bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Set Goals
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
