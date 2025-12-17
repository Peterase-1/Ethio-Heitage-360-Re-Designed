import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Eye,
  Download,
  Calendar,
  MapPin,
  Star,
  DollarSign,
  Clock,
  Activity,
  RefreshCw,
  Monitor
} from 'lucide-react';
import api from '../utils/api';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState({
    overview: {
      totalUsers: 0,
      totalMuseums: 0,
      totalArtifacts: 0,
      totalRevenue: 0,
      userGrowth: 0,
      museumGrowth: 0,
      artifactGrowth: 0,
      revenueGrowth: 0
    },
    userStats: [],
    museumStats: [],
    artifactStats: [],
    revenueStats: [],
    userEngagement: [],
    topMuseums: [],
    topArtifacts: [],
    regionalStats: [],
    rentalAnalytics: {
      totalRentals: 0,
      activeRentals: 0,
      averageRentalPeriod: 0,
      totalRevenue: 0,
      topRentedItems: []
    },
    performanceMetrics: null
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'museums', label: 'Museums', icon: Building2 },
    { id: 'artifacts', label: 'Artifacts', icon: Eye },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'geography', label: 'Geography', icon: MapPin }
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching enhanced analytics data...');
      const analyticsResponse = await api.getSuperAdminAnalytics({ timeRange });

      if (analyticsResponse.success && analyticsResponse.data) {
        console.log('✅ Analytics data loaded:', analyticsResponse.data);
        setAnalytics(analyticsResponse.data);
      } else {
        console.error('⚠️ Failed to load analytics data:', analyticsResponse.message);
        // Do not fallback to mock data
      }
    } catch (error) {
      console.error('❌ Failed to fetch analytics:', error);
      // Do not fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-blue-600">
                {analytics.overview?.totalUsers?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                {analytics.overview?.userGrowth || 0}%
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Museums</p>
              <p className="text-2xl font-bold text-green-600">
                {analytics.overview?.totalMuseums?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                {analytics.overview?.museumGrowth || 0}%
              </p>
            </div>
            <Building2 className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Artifacts</p>
              <p className="text-2xl font-bold text-purple-600">
                {analytics.overview?.totalArtifacts?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                {analytics.overview?.artifactGrowth || 0}%
              </p>
            </div>
            <Eye className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-orange-600">
                ETB {analytics.overview?.totalRevenue?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                {analytics.overview?.revenueGrowth || 0}%
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Popular Artifacts (Real Data) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Artifacts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(analytics.topArtifacts || []).slice(0, 6).map((artifact, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{artifact.name}</h4>
                <span className="text-sm text-gray-500">{artifact.category}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{artifact.museum}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600">{artifact.views} views</span>
                <span className="text-sm text-green-600">{artifact.likes} likes</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regional Distribution */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(analytics.regionalStats || []).map((region, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{region._id}</h4>
                <span className="text-sm text-gray-500">{region.museumCount} museums</span>
              </div>
              <p className="text-sm text-gray-600">{region.totalArtifacts} artifacts</p>
            </div>
          ))}
        </div>
      </div>

      {/* User Engagement by Role */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement by Role</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(analytics.userEngagement || []).map((engagement, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 capitalize">{engagement._id}</h4>
                <span className="text-sm text-gray-500">{engagement.count} users</span>
              </div>
              <p className="text-sm text-gray-600">{engagement.avgSessionTime || 0} min avg session</p>
              <p className="text-sm text-blue-600">{engagement.totalLogins || 0} total logins</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Users</span>
              <span className="font-semibold">{analytics.overview?.totalUsers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Growth Rate</span>
              <span className="font-semibold text-green-600">{analytics.overview?.userGrowth || 0}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
          <div className="space-y-3">
            {(analytics.userActivity || []).map((activity, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-600">{activity.date}</span>
                <span className="font-semibold">{activity.users} users</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement</h3>
          <div className="space-y-3">
            {(analytics.userEngagement || []).map((engagement, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-600 capitalize">{engagement._id}</span>
                <span className="font-semibold">{engagement.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMuseums = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Museum Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Museums</span>
              <span className="font-semibold">{analytics.overview?.totalMuseums || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Growth Rate</span>
              <span className="font-semibold text-green-600">{analytics.overview?.museumGrowth || 0}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Museums</h3>
          <div className="space-y-3">
            {(analytics.topMuseums || []).slice(0, 5).map((museum, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-600">{museum.name}</span>
                <span className="font-semibold">{museum.artifactCount} artifacts</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Museum Revenue</h3>
          <div className="space-y-3">
            {(analytics.topMuseums || []).slice(0, 5).map((museum, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-600">{museum.name}</span>
                <span className="font-semibold">ETB {(museum.revenue || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderArtifacts = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Artifact Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Artifacts</span>
              <span className="font-semibold">{analytics.overview?.totalArtifacts || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Growth Rate</span>
              <span className="font-semibold text-green-600">{analytics.overview?.artifactGrowth || 0}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Artifacts</h3>
          <div className="space-y-3">
            {(analytics.topArtifacts || []).slice(0, 5).map((artifact, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-600">{artifact.name}</span>
                <span className="font-semibold">{artifact.views} views</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Artifact Categories</h3>
          <div className="space-y-3">
            {(analytics.topArtifacts || []).slice(0, 5).map((artifact, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-600">{artifact.category}</span>
                <span className="font-semibold">{artifact.likes} likes</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderRevenue = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-semibold">ETB {analytics.overview?.totalRevenue?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Growth Rate</span>
              <span className="font-semibold text-green-600">{analytics.overview?.revenueGrowth || 0}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Analytics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Rentals</span>
              <span className="font-semibold">{analytics.rentalAnalytics?.totalRentals || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Rentals</span>
              <span className="font-semibold">{analytics.rentalAnalytics?.activeRentals || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Period</span>
              <span className="font-semibold">{analytics.rentalAnalytics?.averageRentalPeriod || 0} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rental Revenue</span>
              <span className="font-semibold text-green-600">ETB {(analytics.rentalAnalytics?.totalRevenue || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Rented Items</h3>
          <div className="space-y-3">
            {(analytics.rentalAnalytics?.topRentedItems || []).map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-600">{item.name}</span>
                <span className="font-semibold">ETB {(item.revenue || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderGeography = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(analytics.regionalStats || []).map((region, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{region._id}</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Museums</span>
                <span className="font-semibold">{region.museumCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Artifacts</span>
                <span className="font-semibold">{region.totalArtifacts}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive analytics and insights for your platform</p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <button
            onClick={fetchAnalytics}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'museums' && renderMuseums()}
          {activeTab === 'artifacts' && (
            <div className="text-center py-12">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Artifact Analytics</h3>
              <p className="text-gray-600">Artifact analytics coming soon...</p>
            </div>
          )}
          {activeTab === 'revenue' && renderRevenue()}
          {activeTab === 'geography' && renderGeography()}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
