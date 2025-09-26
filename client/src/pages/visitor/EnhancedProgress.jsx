import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  TrendingUp,
  EmojiEvents,
  Star,
  LocalFireDepartment,
  ShowChart,
  CalendarToday,
  Schedule,
  MilitaryTech,
  RocketLaunch,
  Diamond,
  TrendingUp as LevelUp,
  PlayArrow,
  MenuBook,
  SportsEsports,
  Build,
  HelpOutline,
  Visibility,
  Refresh,
  Add,
  Edit,
  Delete,
  Check,
  Close,
  KeyboardArrowUp,
  KeyboardArrowDown,
  GpsFixed,
  EventAvailable,
  History,
  FilterList,
  Search,
  Download,
  Share,
  Info,
  Warning,
  CheckCircle,
  Cancel,
  Settings,
  BarChart,
  PieChart as PieChartIcon,
  Timeline
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EnhancedProgress = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [progressData, setProgressData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [goals, setGoals] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [pointsOverview, setPointsOverview] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [streaks, setStreaks] = useState(null);

  // Filters and search
  const [activityFilter, setActivityFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('week');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false);
  const [showEditGoalModal, setShowEditGoalModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [goalFormData, setGoalFormData] = useState({
    title: '',
    description: '',
    category: 'learning',
    targetValue: 1,
    targetMetric: 'completion',
    deadline: '',
    isPublic: false
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ShowChart },
    { id: 'goals', label: 'Goals', icon: GpsFixed },
    { id: 'achievements', label: 'Achievements', icon: EmojiEvents },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'activity', label: 'Activity Log', icon: History }
  ];

  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'quiz', label: 'Quizzes' },
    { value: 'game', label: 'Games' },
    { value: 'course', label: 'Courses' },
    { value: 'tool', label: 'Tools' },
    { value: 'achievement', label: 'Achievements' },
    { value: 'goal', label: 'Goals' },
    { value: 'social', label: 'Social' }
  ];

  const timeRanges = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' }
  ];

  const goalCategories = [
    { value: 'learning', label: 'Learning', icon: MenuBook },
    { value: 'games', label: 'Games', icon: SportsEsports },
    { value: 'tools', label: 'Tools', icon: Build },
    { value: 'social', label: 'Social', icon: Star },
    { value: 'achievements', label: 'Achievements', icon: EmojiEvents },
    { value: 'points', label: 'Points', icon: Diamond },
    { value: 'streaks', label: 'Streaks', icon: LocalFireDepartment }
  ];

  const levelThresholds = [
    { level: 1, points: 0, title: 'Novice Explorer' },
    { level: 2, points: 100, title: 'Curious Learner' },
    { level: 3, points: 300, title: 'Knowledge Seeker' },
    { level: 4, points: 600, title: 'Heritage Enthusiast' },
    { level: 5, points: 1000, title: 'Cultural Scholar' },
    { level: 6, points: 1500, title: 'Heritage Expert' },
    { level: 7, points: 2200, title: 'Master Historian' },
    { level: 8, points: 3000, title: 'Cultural Ambassador' },
    { level: 9, points: 4000, title: 'Heritage Guardian' },
    { level: 10, points: 5500, title: 'Legendary Scholar' }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadProgressData();
  }, [user, timeRange]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      
      // Load all progress data
      const [
        pointsResponse,
        analyticsResponse,
        goalsResponse,
        activityResponse,
        milestonesResponse
      ] = await Promise.all([
        fetch('/api/progress-enhanced/points', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/progress-enhanced/analytics/detailed?timeRange=${timeRange}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/progress/goals', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/progress/activity?limit=50&timeRange=${timeRange}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/progress-enhanced/milestones', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json();
        setPointsOverview(pointsData);
        setProgressData({
          totalPoints: pointsData.totalPoints,
          level: pointsData.level,
          levelProgress: pointsData.levelProgress,
          nextLevelPoints: pointsData.nextLevelPoints,
          pointsToNextLevel: pointsData.pointsToNextLevel
        });
      }

      if (analyticsResponse.ok) {
        const analyticsResult = await analyticsResponse.json();
        setAnalyticsData(analyticsResult);
        setStreaks(analyticsResult.streaks);
      }

      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json();
        setGoals(goalsData.goals || []);
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setActivityLog(activityData.activities || []);
      }

      if (milestonesResponse.ok) {
        const milestonesData = await milestonesResponse.json();
        setMilestones(milestonesData.milestones || []);
      }

      // Load achievements
      loadAchievements();

    } catch (error) {
      console.error('Error loading progress data:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const loadAchievements = async () => {
    try {
      const response = await fetch('/api/achievements', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements || []);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      
      const response = await fetch('/api/progress/goals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(goalFormData)
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(prev => [data.goal, ...prev]);
        setShowCreateGoalModal(false);
        resetGoalForm();
        toast.success('Goal created successfully!');
      } else {
        throw new Error('Failed to create goal');
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteGoal = async (goalId) => {
    try {
      setActionLoading(true);
      
      const response = await fetch(`/api/progress-enhanced/goals/${goalId}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(prev => prev.map(g => g._id === goalId ? { ...g, isCompleted: true, completedAt: new Date() } : g));
        
        if (data.pointsAwarded) {
          toast.success(`Goal completed! +${data.pointsAwarded} points earned!`);
        } else {
          toast.success('Goal completed!');
        }
        
        // Reload progress data to reflect new points
        loadProgressData();
      } else {
        throw new Error('Failed to complete goal');
      }
    } catch (error) {
      console.error('Error completing goal:', error);
      toast.error('Failed to complete goal');
    } finally {
      setActionLoading(false);
    }
  };

  const resetGoalForm = () => {
    setGoalFormData({
      title: '',
      description: '',
      category: 'learning',
      targetValue: 1,
      targetMetric: 'completion',
      deadline: '',
      isPublic: false
    });
  };

  const getCurrentLevel = () => {
    const userPoints = progressData?.totalPoints || 0;
    for (let i = levelThresholds.length - 1; i >= 0; i--) {
      if (userPoints >= levelThresholds[i].points) {
        return levelThresholds[i];
      }
    }
    return levelThresholds[0];
  };

  const getNextLevel = () => {
    const currentLevel = getCurrentLevel();
    const nextLevelIndex = levelThresholds.findIndex(l => l.level === currentLevel.level) + 1;
    return nextLevelIndex < levelThresholds.length ? levelThresholds[nextLevelIndex] : null;
  };

  const getAchievementIcon = (category) => {
    const icons = {
      learning: MenuBook,
      exploration: RocketLaunch,
      social: Star,
      milestone: MilitaryTech,
      special: Diamond
    };
    return icons[category] || EmojiEvents;
  };

  const getActivityIcon = (type) => {
    const icons = {
      quiz: HelpOutline,
      game: SportsEsports,
      course: MenuBook,
      tool: Build,
      achievement: EmojiEvents,
      goal: GpsFixed,
      social: Star
    };
    return icons[type] || PlayArrow;
  };

  const filteredActivityLog = activityLog.filter(activity => {
    const matchesType = activityFilter === 'all' || activity.activityType === activityFilter;
    const matchesSearch = activity.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Refresh className="animate-spin text-4xl text-blue-600 mb-4 mx-auto" />
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <ShowChart className="text-blue-600" />
                Your Learning Progress
              </h1>
              <p className="text-gray-600 mt-2">
                Track your achievements, goals, and learning journey
              </p>
            </div>

            {/* Level & Points Display */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  Level {currentLevel.level}
                </div>
                <div className="text-sm text-gray-500">{currentLevel.title}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {progressData?.totalPoints || 0}
                </div>
                <div className="text-sm text-gray-500">Total Points</div>
              </div>
              {streaks?.currentStreak && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 flex items-center gap-1">
                    <LocalFireDepartment />
                    {streaks.currentStreak}
                  </div>
                  <div className="text-sm text-gray-500">Day Streak</div>
                </div>
              )}
            </div>
          </div>

          {/* Level Progress Bar */}
          {nextLevel && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progress to Level {nextLevel.level}
                </span>
                <span className="text-sm text-gray-500">
                  {progressData?.pointsToNextLevel || 0} points needed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (progressData?.levelProgress || 0) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="text-lg" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Learning Stats</h3>
                    <MenuBook className="text-blue-500 text-xl" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Courses Completed:</span>
                      <span className="font-semibold">{analyticsData?.courseStats?.completed || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quizzes Taken:</span>
                      <span className="font-semibold">{analyticsData?.quizStats?.completed || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Study Time:</span>
                      <span className="font-semibold">{analyticsData?.totalStudyTime || '0h'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Gaming Stats</h3>
                    <SportsEsports className="text-purple-500 text-xl" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Games Played:</span>
                      <span className="font-semibold">{analyticsData?.gameStats?.played || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Best Score:</span>
                      <span className="font-semibold">{analyticsData?.gameStats?.bestScore || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tools Used:</span>
                      <span className="font-semibold">{analyticsData?.toolStats?.used || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Achievements</h3>
                    <EmojiEvents className="text-yellow-500 text-xl" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Earned:</span>
                      <span className="font-semibold">{achievements.filter(a => a.isEarned).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available:</span>
                      <span className="font-semibold">{achievements.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completion:</span>
                      <span className="font-semibold">
                        {achievements.length > 0 
                          ? Math.round((achievements.filter(a => a.isEarned).length / achievements.length) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Goals Progress</h3>
                    <GpsFixed className="text-green-500 text-xl" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Active Goals:</span>
                      <span className="font-semibold">{goals.filter(g => !g.isCompleted).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span className="font-semibold">{goals.filter(g => g.isCompleted).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-semibold">
                        {goals.length > 0 
                          ? Math.round((goals.filter(g => g.isCompleted).length / goals.length) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity & Milestones */}
              <div className="space-y-6">
                {/* Recent Achievements */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Achievements</h3>
                  <div className="space-y-3">
                    {achievements.filter(a => a.isEarned).slice(0, 5).map((achievement, index) => {
                      const Icon = getAchievementIcon(achievement.category);
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Icon className="text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{achievement.name}</h4>
                            <p className="text-xs text-gray-500">
                              {achievement.earnedAt ? new Date(achievement.earnedAt).toLocaleDateString() : 'Recently'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    
                    {achievements.filter(a => a.isEarned).length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No achievements yet. Keep learning to unlock your first achievement!
                      </p>
                    )}
                  </div>
                </div>

                {/* Upcoming Milestones */}
                {milestones.length > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">Upcoming Milestones</h3>
                    <div className="space-y-3">
                      {milestones.slice(0, 5).map((milestone, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <RocketLaunch className="text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{milestone.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all"
                                  style={{ width: `${Math.min(100, milestone.progress)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">
                                {milestone.progress.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              {/* Goals Header */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">My Goals</h2>
                  <button
                    onClick={() => setShowCreateGoalModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Add />
                    Create Goal
                  </button>
                </div>
              </div>

              {/* Goals Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal) => {
                  const categoryData = goalCategories.find(c => c.value === goal.category);
                  const Icon = categoryData?.icon || GpsFixed;
                  const progress = Math.min(100, (goal.currentProgress / goal.targetValue) * 100);

                  return (
                    <div
                      key={goal._id}
                      className={`bg-white rounded-lg shadow-md p-6 transition-all ${
                        goal.isCompleted 
                          ? 'border-2 border-green-200 bg-green-50' 
                          : 'hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            goal.isCompleted ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            {goal.isCompleted ? (
                              <CheckCircle className="text-green-600" />
                            ) : (
                              <Icon className="text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{goal.title}</h3>
                            <p className="text-sm text-gray-500 capitalize">{goal.category}</p>
                          </div>
                        </div>
                        
                        {!goal.isCompleted && (
                          <button
                            onClick={() => handleCompleteGoal(goal._id)}
                            disabled={actionLoading}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Mark as Complete"
                          >
                            <Check />
                          </button>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm mb-4">{goal.description}</p>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{goal.currentProgress || 0} / {goal.targetValue} {goal.targetMetric}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              goal.isCompleted 
                                ? 'bg-green-500' 
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                          {goal.deadline ? (
                            <>Due: {new Date(goal.deadline).toLocaleDateString()}</>
                          ) : (
                            'No deadline'
                          )}
                        </span>
                        {goal.isCompleted && (
                          <span className="text-green-600 font-medium">
                            Completed!
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {goals.length === 0 && (
                  <div className="col-span-full bg-white rounded-lg shadow-md p-12 text-center">
                    <GpsFixed className="text-6xl text-gray-300 mb-4 mx-auto" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Goals Yet</h3>
                    <p className="text-gray-500 mb-4">
                      Set your first learning goal to track your progress and stay motivated!
                    </p>
                    <button
                      onClick={() => setShowCreateGoalModal(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Create Your First Goal
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              {/* Achievements Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {achievements.map((achievement) => {
                  const Icon = getAchievementIcon(achievement.category);
                  
                  return (
                    <div
                      key={achievement._id}
                      className={`bg-white rounded-lg shadow-md p-6 transition-all ${
                        achievement.isEarned 
                          ? 'border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50' 
                          : 'opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                          achievement.isEarned 
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg' 
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          <Icon className="text-2xl" />
                        </div>
                        
                        <h3 className={`font-semibold mb-2 ${
                          achievement.isEarned ? 'text-gray-800' : 'text-gray-600'
                        }`}>
                          {achievement.name}
                        </h3>
                        
                        <p className={`text-sm mb-4 ${
                          achievement.isEarned ? 'text-gray-600' : 'text-gray-500'
                        }`}>
                          {achievement.description}
                        </p>

                        <div className={`text-xs font-medium px-3 py-1 rounded-full ${
                          achievement.isEarned 
                            ? 'bg-yellow-200 text-yellow-800' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {achievement.isEarned ? (
                            <>
                              <CheckCircle className="inline mr-1" />
                              Earned {achievement.earnedAt ? new Date(achievement.earnedAt).toLocaleDateString() : ''}
                            </>
                          ) : (
                            <>
                              <Cancel className="inline mr-1" />
                              {achievement.points} points
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {achievements.length === 0 && (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <EmojiEvents className="text-6xl text-gray-300 mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Achievements Available</h3>
                  <p className="text-gray-500">
                    Achievements will appear here as you engage with learning activities.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && analyticsData && (
            <div className="space-y-6">
              {/* Analytics Header */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Learning Analytics</h2>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeRanges.map(range => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Points Over Time */}
                {analyticsData.pointsOverTime && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">Points Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analyticsData.pointsOverTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="points" 
                          stroke="#3B82F6" 
                          fill="url(#pointsGradient)" 
                        />
                        <defs>
                          <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Activity Distribution */}
                {analyticsData.activityDistribution && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">Activity Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analyticsData.activityDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analyticsData.activityDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={[
                              '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'
                            ][index % 6]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Performance Metrics */}
                {analyticsData.performanceMetrics && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analyticsData.performanceMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="accuracy" 
                          stroke="#10B981" 
                          name="Accuracy %" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="completion" 
                          stroke="#3B82F6" 
                          name="Completion Rate %" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Study Time Analysis */}
                {analyticsData.studyTimeAnalysis && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">Study Time by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsBarChart data={analyticsData.studyTimeAnalysis}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} hours`, 'Study Time']} />
                        <Bar dataKey="hours" fill="#8B5CF6" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Summary Statistics */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Summary Statistics</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {analyticsData.totalActivities || 0}
                    </div>
                    <div className="text-sm text-gray-500">Total Activities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {analyticsData.averageScore || 0}%
                    </div>
                    <div className="text-sm text-gray-500">Average Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {analyticsData.totalStudyTime || '0h'}
                    </div>
                    <div className="text-sm text-gray-500">Study Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {streaks?.longestStreak || 0}
                    </div>
                    <div className="text-sm text-gray-500">Longest Streak</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity Log Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              {/* Activity Filters */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search activities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <select
                    value={activityFilter}
                    onChange={(e) => setActivityFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {activityTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeRanges.map(range => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-6">Activity Timeline</h3>
                
                {filteredActivityLog.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="text-6xl text-gray-300 mb-4 mx-auto" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Activities Found</h3>
                    <p className="text-gray-500">
                      {searchQuery || activityFilter !== 'all' 
                        ? 'Try adjusting your search filters' 
                        : 'Start learning to see your activity history here!'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredActivityLog.map((activity, index) => {
                      const Icon = getActivityIcon(activity.activityType);
                      
                      return (
                        <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.activityType === 'achievement' ? 'bg-yellow-100' :
                            activity.activityType === 'goal' ? 'bg-green-100' :
                            activity.activityType === 'quiz' ? 'bg-blue-100' :
                            activity.activityType === 'game' ? 'bg-purple-100' :
                            activity.activityType === 'course' ? 'bg-indigo-100' :
                            'bg-gray-100'
                          }`}>
                            <Icon className={`${
                              activity.activityType === 'achievement' ? 'text-yellow-600' :
                              activity.activityType === 'goal' ? 'text-green-600' :
                              activity.activityType === 'quiz' ? 'text-blue-600' :
                              activity.activityType === 'game' ? 'text-purple-600' :
                              activity.activityType === 'course' ? 'text-indigo-600' :
                              'text-gray-600'
                            }`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">{activity.title}</h4>
                                {activity.description && (
                                  <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                  <span className="capitalize">{activity.activityType}</span>
                                  <span>{new Date(activity.timestamp).toLocaleString()}</span>
                                  {activity.pointsEarned && (
                                    <span className="text-green-600 font-medium">
                                      +{activity.pointsEarned} points
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {activity.metadata && (
                                <div className="text-right text-sm text-gray-500">
                                  {activity.metadata.score && (
                                    <div>Score: {activity.metadata.score}</div>
                                  )}
                                  {activity.metadata.duration && (
                                    <div>Duration: {activity.metadata.duration}</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Create Goal Modal */}
        {showCreateGoalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Create New Goal</h2>
              
              <form onSubmit={handleCreateGoal}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    value={goalFormData.title}
                    onChange={(e) => setGoalFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your goal"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={goalFormData.description}
                    onChange={(e) => setGoalFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe your goal..."
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={goalFormData.category}
                    onChange={(e) => setGoalFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {goalCategories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Value
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={goalFormData.targetValue}
                      onChange={(e) => setGoalFormData(prev => ({ ...prev, targetValue: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Metric
                    </label>
                    <select
                      value={goalFormData.targetMetric}
                      onChange={(e) => setGoalFormData(prev => ({ ...prev, targetMetric: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="completion">Completions</option>
                      <option value="points">Points</option>
                      <option value="hours">Hours</option>
                      <option value="score">Score</option>
                      <option value="streak">Streak Days</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    value={goalFormData.deadline}
                    onChange={(e) => setGoalFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateGoalModal(false);
                      resetGoalForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !goalFormData.title.trim()}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <>
                        <Refresh className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Goal'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedProgress;
