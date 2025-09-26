import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { 
  FaChartBar, 
  FaTrophy, 
  FaCalendar, 
  FaBullseye,
  FaArrowUp,
  FaChartLine,
  FaEye,
  FaBookmark,
  FaGraduationCap,
  FaClock,
  FaStar,
  FaFire
} from 'react-icons/fa';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('month'); // week, month, year
  const [stats, setStats] = useState({});
  const [progressData, setProgressData] = useState({});
  const [detailedStats, setDetailedStats] = useState({});

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch overview stats
      const overviewResponse = await fetch(`/api/progress/overview?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json();
        setStats(overviewData);
      }

      // Fetch detailed stats
      const detailedResponse = await fetch(`/api/progress/detailed-stats?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (detailedResponse.ok) {
        const detailed = await detailedResponse.json();
        setDetailedStats(detailed);
        setProgressData(detailed.progressData || {});
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
      
      // Fallback mock data
      setStats({
        totalPoints: 2450,
        level: 8,
        completedCourses: 12,
        activitiesThisMonth: 45,
        studyTimeMinutes: 890,
        streakDays: 15,
        averageScore: 88,
        favoritesCount: 23
      });
      
      setProgressData({
        weeklyProgress: [120, 190, 300, 250],
        weeklyStudyTime: [5, 8, 12, 10],
        activityDistribution: [35, 20, 15, 18, 12],
        subjectPerformance: [92, 88, 75, 85, 90]
      });
      
      setDetailedStats({
        achievements: [
          { name: 'Heritage Expert', description: 'Complete 10 courses', earned: true },
          { name: 'Quiz Master', description: 'Score 90%+ on 5 quizzes', earned: true },
          { name: 'Social Learner', description: 'Join 3 study groups', earned: false },
          { name: 'Streak Hero', description: '30-day study streak', earned: false }
        ],
        rank: 47,
        bestStudyDay: '2h 45m'
      });
    } finally {
      setLoading(false);
    }
  };

  // Chart data
  const getTimeLabels = () => {
    switch (timeframe) {
      case 'week':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case 'month':
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      case 'year':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      default:
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    }
  };

  const learningProgressData = {
    labels: getTimeLabels(),
    datasets: [
      {
        label: 'Points Earned',
        data: progressData.weeklyProgress || [120, 190, 300, 250],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Study Time (hours)',
        data: progressData.weeklyStudyTime || [5, 8, 12, 10],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      }
    ]
  };

  const activityDistributionData = {
    labels: ['Course Study', 'Virtual Tours', 'Quizzes', 'Discussions', 'Reading'],
    datasets: [
      {
        data: progressData.activityDistribution || [35, 20, 15, 18, 12],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#8B5CF6',
          '#EF4444'
        ]
      }
    ]
  };

  const subjectPerformanceData = {
    labels: ['History', 'Culture', 'Language', 'Art', 'Geography'],
    datasets: [
      {
        label: 'Score (%)',
        data: progressData.subjectPerformance || [92, 88, 75, 85, 90],
        backgroundColor: 'rgba(59, 130, 246, 0.8)'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FaChartBar className="text-blue-600" />
                Learning Analytics
              </h1>
              <p className="text-gray-600 mt-2">Track your progress and insights</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Points</p>
                <p className="text-2xl font-bold text-blue-600">{(stats.totalPoints || 0).toLocaleString()}</p>
              </div>
              <FaTrophy className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Current Level</p>
                <p className="text-2xl font-bold text-green-600">{stats.level || 0}</p>
              </div>
              <FaStar className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Study Streak</p>
                <p className="text-2xl font-bold text-orange-600">{stats.streakDays || 0} days</p>
              </div>
              <FaFire className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Average Score</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageScore || 0}%</p>
              </div>
              <FaBullseye className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Learning Progress Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaChartLine className="text-blue-500" />
              Learning Progress
            </h3>
            <div className="h-64">
              <Line data={learningProgressData} options={chartOptions} />
            </div>
          </div>

          {/* Activity Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaChartBar className="text-green-500" />
              Activity Distribution
            </h3>
            <div className="h-64">
              <Doughnut data={activityDistributionData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Subject Performance */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaGraduationCap className="text-purple-500" />
            Subject Performance
          </h3>
          <div className="h-64">
            <Bar data={subjectPerformanceData} options={chartOptions} />
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Study Time */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaClock className="text-indigo-500" />
              Study Time
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">This Month</span>
                <span className="font-semibold">{Math.floor((stats.studyTimeMinutes || 0) / 60)}h {(stats.studyTimeMinutes || 0) % 60}m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Daily Average</span>
                <span className="font-semibold">{Math.floor((stats.studyTimeMinutes || 0) / 30 / 60)}h {Math.floor(((stats.studyTimeMinutes || 0) / 30) % 60)}m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Best Day</span>
                <span className="font-semibold text-green-600">{detailedStats.bestStudyDay || '2h 45m'}</span>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaTrophy className="text-yellow-500" />
              Recent Achievements
            </h3>
            <div className="space-y-3">
              {(detailedStats.achievements || [
                { name: 'Heritage Expert', description: 'Complete 10 courses', earned: true },
                { name: 'Quiz Master', description: 'Score 90%+ on 5 quizzes', earned: true },
                { name: 'Social Learner', description: 'Join 3 study groups', earned: false },
                { name: 'Streak Hero', description: '30-day study streak', earned: false }
              ]).map((achievement, index) => (
                <div key={index} className={`flex items-center gap-3 p-2 rounded-lg ${achievement.earned ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${achievement.earned ? 'bg-yellow-500' : 'bg-gray-300'}`}>
                    <FaTrophy className={`h-4 w-4 ${achievement.earned ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${achievement.earned ? 'text-gray-800' : 'text-gray-500'}`}>
                      {achievement.name}
                    </p>
                    <p className="text-xs text-gray-500">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaEye className="text-green-500" />
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed Courses</span>
                <span className="font-semibold">{stats.completedCourses || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Favorites</span>
                <span className="font-semibold">{stats.favoritesCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Activities This Month</span>
                <span className="font-semibold">{stats.activitiesThisMonth || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Rank</span>
                <span className="font-semibold text-blue-600">#{detailedStats.rank || 47}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
