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
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Zap,
  Shield,
  Database,
  Globe,
  Monitor
} from 'lucide-react';
import api from '../utils/api';

const UnifiedAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
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
    systemHealth: {
      overall: 0,
      database: 0,
      api: 0,
      storage: 0,
      uptime: 0
    },
    performance: {
      responseTime: 0,
      throughput: 0,
      errorRate: 0,
      cpuUsage: 0,
      memoryUsage: 0
    },
    userActivity: [],
    museumStats: [],
    artifactStats: [],
    revenueStats: [],
    topMuseums: [],
    popularArtifacts: [],
    regionAnalytics: [],
    rentalAnalytics: []
  });
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'system', label: 'System Health', icon: Monitor },
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'users', label: 'User Analytics', icon: Users },
    { id: 'museums', label: 'Museum Analytics', icon: Building2 },
    { id: 'artifacts', label: 'Artifact Analytics', icon: Eye },
    { id: 'revenue', label: 'Revenue Analytics', icon: DollarSign }
  ];

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching unified analytics data...');

      // Fetch platform analytics
      const platformRes = await api.getSuperAdminAnalytics({ timeRange });
      console.log('📊 Platform analytics response:', platformRes);

      // Fetch performance metrics
      const performanceRes = await api.getPerformanceOverview({ timeRange });
      console.log('⚡ Performance metrics response:', performanceRes);

      // Combine the data
      const combinedData = {
        overview: platformRes?.analytics?.overview || data.overview,
        systemHealth: performanceRes?.systemHealth || data.systemHealth,
        performance: performanceRes?.performance || data.performance,
        userActivity: platformRes?.analytics?.userActivity || data.userActivity,
        museumStats: platformRes?.analytics?.museumStats || data.museumStats,
        artifactStats: platformRes?.analytics?.artifactStats || data.artifactStats,
        revenueStats: platformRes?.analytics?.revenueStats || data.revenueStats,
        topMuseums: platformRes?.analytics?.topMuseums || data.topMuseums,
        popularArtifacts: platformRes?.analytics?.popularArtifacts || data.popularArtifacts,
        regionAnalytics: platformRes?.analytics?.regionAnalytics || data.regionAnalytics,
        rentalAnalytics: platformRes?.analytics?.rentalAnalytics || data.rentalAnalytics
      };

      setData(combinedData);
      setLastUpdated(new Date());
      console.log('✅ Analytics data loaded successfully');

    } catch (err) {
      console.error('❌ Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalUsers}</p>
              <p className={`text-sm flex items-center ${data.overview.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {data.overview.userGrowth}% from last period
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Museums</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalMuseums}</p>
              <p className={`text-sm flex items-center ${data.overview.museumGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {data.overview.museumGrowth}% from last period
              </p>
            </div>
            <Building2 className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Artifacts</p>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalArtifacts}</p>
              <p className={`text-sm flex items-center ${data.overview.artifactGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {data.overview.artifactGrowth}% from last period
              </p>
            </div>
            <Eye className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${data.overview.totalRevenue}</p>
              <p className={`text-sm flex items-center ${data.overview.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {data.overview.revenueGrowth}% from last period
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.systemHealth.overall}%</div>
            <div className="text-sm text-gray-600">Overall Health</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.systemHealth.uptime}%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{data.performance.responseTime}ms</div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemHealth = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Database Health</h3>
            <Database className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">{data.systemHealth.database}%</div>
          <div className="text-sm text-gray-600">Connection Status: Healthy</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">API Performance</h3>
            <Globe className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">{data.systemHealth.api}%</div>
          <div className="text-sm text-gray-600">Response Rate: Excellent</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Storage</h3>
            <HardDrive className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-yellow-600">{data.systemHealth.storage}%</div>
          <div className="text-sm text-gray-600">Usage: Moderate</div>
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Response Time</h3>
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">{data.performance.responseTime}ms</div>
          <div className="text-sm text-gray-600">Average API Response</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Throughput</h3>
            <Zap className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600">{data.performance.throughput}</div>
          <div className="text-sm text-gray-600">Requests per second</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Error Rate</h3>
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">{data.performance.errorRate}%</div>
          <div className="text-sm text-gray-600">Very Low Error Rate</div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'system':
        return renderSystemHealth();
      case 'performance':
        return renderPerformance();
      case 'users':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">User Analytics</h3>
            <p className="text-gray-600">User analytics data will be displayed here.</p>
          </div>
        );
      case 'museums':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Museum Analytics</h3>
            <p className="text-gray-600">Museum analytics data will be displayed here.</p>
          </div>
        );
      case 'artifacts':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Artifact Analytics</h3>
            <p className="text-gray-600">Artifact analytics data will be displayed here.</p>
          </div>
        );
      case 'revenue':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Revenue Analytics</h3>
            <p className="text-gray-600">Revenue analytics data will be displayed here.</p>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">Error loading analytics: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Unified Analytics</h2>
          <p className="text-gray-600">Platform and performance analytics combined</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <button
            onClick={fetchAnalytics}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {renderTabContent()}

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-sm text-gray-500 text-center">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default UnifiedAnalytics;
