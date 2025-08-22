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
  RefreshCw
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
    topMuseums: [],
    popularArtifacts: [],
    regionAnalytics: [],
    userActivity: [],
    rentalAnalytics: []
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
      const response = await api.getAnalytics(timeRange);
      setAnalytics(response.data || getMockData());
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setAnalytics(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = () => ({
    overview: {
      totalUsers: 2847,
      totalMuseums: 42,
      totalArtifacts: 1256,
      totalRevenue: 850000,
      userGrowth: 12.5,
      museumGrowth: 8.3,
      artifactGrowth: 15.2,
      revenueGrowth: 35.4
    },
    userStats: [
      { date: '2025-01-01', count: 2500 },
      { date: '2025-01-15', count: 2650 },
      { date: '2025-02-01', count: 2750 },
      { date: '2025-02-15', count: 2847 }
    ],
    topMuseums: [
      { name: 'National Museum of Ethiopia', visits: 15420, revenue: 320000 },
      { name: 'Ethnological Museum', visits: 12350, revenue: 280000 },
      { name: 'Addis Ababa Museum', visits: 8900, revenue: 180000 },
      { name: 'Red Terror Martyrs Museum', visits: 7200, revenue: 150000 }
    ],
    popularArtifacts: [
      { name: 'Lucy (Dinkinesh)', views: 25600, museum: 'National Museum' },
      { name: 'Ancient Ethiopian Crown', views: 18400, museum: 'National Museum' },
      { name: 'Traditional Coffee Set', views: 15200, museum: 'Ethnological Museum' },
      { name: 'Axumite Stelae Model', views: 12800, museum: 'Axum Museum' }
    ],
    regionAnalytics: [
      { region: 'Addis Ababa', users: 850, museums: 15, percentage: 29.9 },
      { region: 'Amhara', users: 620, museums: 8, percentage: 21.8 },
      { region: 'Oromia', users: 580, museums: 7, percentage: 20.4 },
      { region: 'Tigray', users: 340, museums: 5, percentage: 11.9 },
      { region: 'SNNPR', users: 280, museums: 4, percentage: 9.8 },
      { region: 'Other', users: 177, museums: 3, percentage: 6.2 }
    ],
    userActivity: [
      { hour: 8, users: 45 },
      { hour: 9, users: 120 },
      { hour: 10, users: 180 },
      { hour: 11, users: 220 },
      { hour: 12, users: 190 },
      { hour: 13, users: 160 },
      { hour: 14, users: 210 },
      { hour: 15, users: 250 },
      { hour: 16, users: 280 },
      { hour: 17, users: 230 },
      { hour: 18, users: 180 },
      { hour: 19, users: 120 },
      { hour: 20, users: 80 },
      { hour: 21, users: 60 }
    ],
    rentalAnalytics: {
      totalRentals: 127,
      activeRentals: 89,
      totalRevenue: 285000,
      averageRentalPeriod: 18,
      topRentedItems: [
        { name: 'Ancient Vase Collection', rentals: 23, revenue: 85000 },
        { name: 'Traditional Jewelry', rentals: 18, revenue: 65000 },
        { name: 'Historical Manuscripts', rentals: 15, revenue: 58000 }
      ]
    }
  });

  const StatCard = ({ title, value, growth, icon: Icon, color = 'blue', prefix = '', suffix = '' }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          <div className="flex items-center">
            {growth > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
            )}
            <span className={`text-sm font-medium ${growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growth > 0 ? '+' : ''}{growth}%
            </span>
            <span className="text-sm text-gray-500 ml-1">from last period</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={analytics.overview.totalUsers}
          growth={analytics.overview.userGrowth}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Museums"
          value={analytics.overview.totalMuseums}
          growth={analytics.overview.museumGrowth}
          icon={Building2}
          color="green"
        />
        <StatCard
          title="Artifacts"
          value={analytics.overview.totalArtifacts}
          growth={analytics.overview.artifactGrowth}
          icon={Eye}
          color="purple"
        />
        <StatCard
          title="Revenue"
          value={analytics.overview.totalRevenue}
          growth={analytics.overview.revenueGrowth}
          icon={DollarSign}
          color="orange"
          prefix="ETB "
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Trend</h3>
          <div className="h-64 flex items-center justify-center border border-gray-200 rounded bg-gray-50">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Chart visualization would appear here</p>
              <p className="text-sm text-gray-500">{analytics.overview.userGrowth}% growth</p>
            </div>
          </div>
        </div>

        {/* Top Museums */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Museums</h3>
          <div className="space-y-4">
            {analytics.topMuseums.slice(0, 4).map((museum, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{museum.name}</p>
                    <p className="text-sm text-gray-600">{museum.visits.toLocaleString()} visits</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">ETB {museum.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Artifacts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Artifacts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analytics.popularArtifacts.map((artifact, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-gray-500">{artifact.views.toLocaleString()} views</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{artifact.name}</h4>
              <p className="text-sm text-gray-600">{artifact.museum}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity Heatmap</h3>
          <div className="space-y-2">
            {analytics.userActivity.map((activity, index) => (
              <div key={index} className="flex items-center">
                <span className="text-sm text-gray-600 w-12">{activity.hour}:00</span>
                <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(activity.users / 280) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">{activity.users}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Demographics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">By Role</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Visitors</span>
                  <span className="font-medium">2,340 (82%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Museum Admins</span>
                  <span className="font-medium">285 (10%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Organizers</span>
                  <span className="font-medium">142 (5%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Admins</span>
                  <span className="font-medium">80 (3%)</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Activity Level</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Active</span>
                  <span className="font-medium">1,240</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Weekly Active</span>
                  <span className="font-medium">1,890</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Active</span>
                  <span className="font-medium">2,547</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Inactive</span>
                  <span className="font-medium">300</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGeography = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Distribution</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-4">Users by Region</h4>
            <div className="space-y-3">
              {analytics.regionAnalytics.map((region, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">{region.region}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{region.users.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{region.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-4">Museums by Region</h4>
            <div className="space-y-3">
              {analytics.regionAnalytics.map((region, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900">{region.region}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{region.museums}</p>
                    <p className="text-sm text-gray-600">museums</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRevenue = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Rental Analytics</h3>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Rentals</span>
              <span className="font-semibold">{analytics.rentalAnalytics.totalRentals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Rentals</span>
              <span className="font-semibold">{analytics.rentalAnalytics.activeRentals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Period</span>
              <span className="font-semibold">{analytics.rentalAnalytics.averageRentalPeriod} days</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-semibold text-green-600">ETB {analytics.rentalAnalytics.totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Rented Items</h3>
          <div className="space-y-3">
            {analytics.rentalAnalytics.topRentedItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-orange-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.rentals} rentals</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">ETB {item.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600">Comprehensive performance metrics for the entire system</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'museums' && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Museum analytics coming soon...</p>
            </div>
          )}
          {activeTab === 'artifacts' && (
            <div className="text-center py-12">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
