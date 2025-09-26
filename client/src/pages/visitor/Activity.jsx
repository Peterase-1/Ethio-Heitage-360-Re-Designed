import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  FaHistory, 
  FaBook, 
  FaPlay, 
  FaTrophy, 
  FaUsers, 
  FaCalendarAlt,
  FaClock,
  FaFilter
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Activity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('week');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [filter, dateRange, page]);

  const fetchActivities = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('type', filter);
      if (dateRange !== 'all') {
        const endDate = new Date();
        const startDate = new Date();
        
        switch (dateRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(endDate.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(endDate.getMonth() - 1);
            break;
        }
        
        params.append('startDate', startDate.toISOString());
        params.append('endDate', endDate.toISOString());
      }
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/progress/activity?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activity log');
      }

      const data = await response.json();
      
      if (page === 1) {
        setActivities(data.activities || []);
      } else {
        setActivities(prev => [...prev, ...(data.activities || [])]);
      }
      
      setHasMore(data.pagination?.hasNextPage || false);
    } catch (error) {
      console.error('Error fetching activity log:', error);
      toast.error('Failed to load activity log');
      
      // Mock data fallback
      if (page === 1) {
        setActivities([
          {
            _id: '1',
            type: 'course-completion',
            title: 'Completed Ethiopian History Course',
            description: 'Successfully completed the course with 92% score',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            points: 100,
            relatedResource: { type: 'course', name: 'Ethiopian History' }
          },
          {
            _id: '2',
            type: 'museum-visit',
            title: 'Visited National Museum',
            description: 'Explored virtual tour of Ethiopian National Museum',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            points: 25,
            relatedResource: { type: 'museum', name: 'Ethiopian National Museum' }
          },
          {
            _id: '3',
            type: 'achievement-earned',
            title: 'Earned Heritage Explorer Badge',
            description: 'Unlocked by visiting 5 different virtual museums',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            points: 150,
            relatedResource: { type: 'achievement', name: 'Heritage Explorer' }
          },
          {
            _id: '4',
            type: 'quiz-completion',
            title: 'Completed Ancient Artifacts Quiz',
            description: 'Scored 8/10 on the artifacts identification quiz',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            points: 50,
            relatedResource: { type: 'quiz', name: 'Ancient Artifacts Quiz' }
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'course-completion':
      case 'lesson-completion':
        return <FaBook className="h-5 w-5 text-blue-600" />;
      case 'quiz-completion':
        return <FaPlay className="h-5 w-5 text-green-600" />;
      case 'achievement-earned':
        return <FaTrophy className="h-5 w-5 text-yellow-600" />;
      case 'museum-visit':
      case 'artifact-view':
        return <FaUsers className="h-5 w-5 text-purple-600" />;
      case 'login':
        return <FaClock className="h-5 w-5 text-gray-600" />;
      default:
        return <FaHistory className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'course-completion':
      case 'lesson-completion':
        return 'bg-blue-50 border-blue-200';
      case 'quiz-completion':
        return 'bg-green-50 border-green-200';
      case 'achievement-earned':
        return 'bg-yellow-50 border-yellow-200';
      case 'museum-visit':
      case 'artifact-view':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / 60000);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FaHistory className="text-indigo-600" />
                Activity Log
              </h1>
              <p className="text-gray-600 mt-2">Track your learning journey and interactions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{activities.length}</div>
              <div className="text-sm text-gray-600">Activities</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Activities</option>
                <option value="course-completion">Course Completions</option>
                <option value="quiz-completion">Quiz Results</option>
                <option value="achievement-earned">Achievements</option>
                <option value="museum-visit">Museum Visits</option>
                <option value="artifact-view">Artifact Views</option>
                <option value="login">Logins</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-500" />
              <select
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value);
                  setPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        {activities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaHistory className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No activities yet</h3>
            <p className="text-gray-500">Start learning to build your activity history</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  key={activity._id}
                  className={`border-l-4 pl-6 py-4 ${getActivityColor(activity.type)} border-l-opacity-50`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {activity.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaClock className="h-3 w-3" />
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                          {activity.relatedResource && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                              {activity.relatedResource.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {activity.points && (
                      <div className="text-right">
                        <div className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                          +{activity.points} pts
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-6">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;
