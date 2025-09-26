import React, { useState, useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Building2,
  Eye,
  DollarSign,
  BarChart3,
  RefreshCw,
  Download,
  Calendar,
  Zap,
  Shield,
  Database,
  Globe,
  Monitor
} from 'lucide-react';
import api from '../utils/api';

const PerformanceAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    overview: null,
    systemHealth: null,
    userActivity: null,
    museumPerformance: null,
    artifactPerformance: null,
    rentalPerformance: null,
    apiPerformance: null
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
    { id: 'system-health', label: 'System Health', icon: Monitor },
    { id: 'user-activity', label: 'User Activity', icon: Users },
    { id: 'museum-performance', label: 'Museum Performance', icon: Building2 },
    { id: 'artifact-performance', label: 'Artifact Performance', icon: Eye },
    { id: 'rental-performance', label: 'Rental Performance', icon: DollarSign },
    { id: 'api-performance', label: 'API Performance', icon: Globe }
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab, timeRange]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      switch (activeTab) {
        case 'overview':
          response = await api.getPerformanceOverview({ timeRange });
          if (response.success) {
            setData(prev => ({ ...prev, overview: response.data }));
          } else {
            throw new Error(response.message || 'Failed to fetch overview data');
          }
          break;
        case 'system-health':
          response = await api.getSystemHealth({ timeRange });
          if (response.success) {
            setData(prev => ({ ...prev, systemHealth: response.data }));
          } else {
            throw new Error(response.message || 'Failed to fetch system health data');
          }
          break;
        case 'user-activity':
          response = await api.getUserActivityMetrics({ timeRange, groupBy: 'day' });
          if (response.success) {
            setData(prev => ({ ...prev, userActivity: response.data }));
          } else {
            throw new Error(response.message || 'Failed to fetch user activity data');
          }
          break;
        case 'museum-performance':
          response = await api.getMuseumPerformanceMetrics({ timeRange, sortBy: 'revenue' });
          if (response.success) {
            setData(prev => ({ ...prev, museumPerformance: response.data }));
          } else {
            throw new Error(response.message || 'Failed to fetch museum performance data');
          }
          break;
        case 'artifact-performance':
          response = await api.getArtifactPerformanceMetrics({ timeRange, category: 'all' });
          if (response.success) {
            setData(prev => ({ ...prev, artifactPerformance: response.data }));
          } else {
            throw new Error(response.message || 'Failed to fetch artifact performance data');
          }
          break;
        case 'rental-performance':
          response = await api.getRentalPerformanceMetrics({ timeRange });
          if (response.success) {
            setData(prev => ({ ...prev, rentalPerformance: response.data }));
          } else {
            throw new Error(response.message || 'Failed to fetch rental performance data');
          }
          break;
        case 'api-performance':
          response = await api.getApiPerformanceMetrics({ timeRange, endpoint: 'all' });
          if (response.success) {
            setData(prev => ({ ...prev, apiPerformance: response.data }));
          } else {
            throw new Error(response.message || 'Failed to fetch API performance data');
          }
          break;
        default:
          break;
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, change, icon: Icon, color = 'blue', unit = '', status = 'normal' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      red: 'bg-red-50 text-red-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600'
    };

    const statusClasses = {
      normal: 'border-gray-200',
      warning: 'border-yellow-300',
      critical: 'border-red-300',
      excellent: 'border-green-300'
    };

    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${statusClasses[status]}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {typeof value === 'number' ? value.toLocaleString() : value}{unit}
            </p>
            {change !== undefined && (
              <div className="flex items-center">
                {change > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
                <span className="text-sm text-gray-500 ml-1">from last period</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    );
  };

  const HealthIndicator = ({ score, status }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'excellent': return 'text-green-600 bg-green-100';
        case 'good': return 'text-blue-600 bg-blue-100';
        case 'fair': return 'text-yellow-600 bg-yellow-100';
        case 'poor': return 'text-red-600 bg-red-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">System Health Score</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
            {status.toUpperCase()}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${score >= 90 ? 'bg-green-500' :
                  score >= 75 ? 'bg-blue-500' :
                    score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>
          <span className="text-2xl font-bold text-gray-900">{score}/100</span>
        </div>
      </div>
    );
  };

  const renderOverview = () => {
    const overview = data.overview;
    if (!overview) return <div>Loading...</div>;

    return (
      <div className="space-y-6">
        {/* System Health Score */}
        {overview.healthScore && (
          <HealthIndicator
            score={overview.healthScore.score}
            status={overview.healthScore.status}
          />
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Users"
            value={overview.keyMetrics?.totalUsers || 0}
            change={12.5}
            icon={Users}
            color="blue"
          />
          <MetricCard
            title="Active Museums"
            value={overview.keyMetrics?.totalMuseums || 0}
            change={8.3}
            icon={Building2}
            color="green"
          />
          <MetricCard
            title="Total Artifacts"
            value={overview.keyMetrics?.totalArtifacts || 0}
            change={15.2}
            icon={Eye}
            color="purple"
          />
          <MetricCard
            title="Total Revenue"
            value={overview.keyMetrics?.totalRevenue || 0}
            change={35.4}
            icon={DollarSign}
            color="orange"
            unit=" ETB"
          />
        </div>

        {/* Performance Alerts */}
        {overview.alerts && overview.alerts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Alerts</h3>
            <div className="space-y-3">
              {overview.alerts.map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${alert.type === 'critical' ? 'bg-red-50 border-red-400' :
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                    'bg-blue-50 border-blue-400'
                  }`}>
                  <div className="flex items-center">
                    {alert.type === 'critical' ? (
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    ) : alert.type === 'warning' ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                    )}
                    <p className="font-medium text-gray-900">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSystemHealth = () => {
    const systemHealth = data.systemHealth;
    if (!systemHealth) return <div>Loading...</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="CPU Usage"
            value={systemHealth.systemMetrics?.avgCpuUsage || 0}
            icon={Cpu}
            color="blue"
            unit="%"
            status={systemHealth.systemMetrics?.avgCpuUsage > 80 ? 'critical' : 'normal'}
          />
          <MetricCard
            title="Memory Usage"
            value={systemHealth.systemMetrics?.avgMemoryUsage || 0}
            icon={HardDrive}
            color="green"
            unit="%"
            status={systemHealth.systemMetrics?.avgMemoryUsage > 85 ? 'critical' : 'normal'}
          />
          <MetricCard
            title="Network Latency"
            value={systemHealth.systemMetrics?.avgNetworkLatency || 0}
            icon={Wifi}
            color="purple"
            unit="ms"
            status={systemHealth.systemMetrics?.avgNetworkLatency > 200 ? 'warning' : 'normal'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">API Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Response Time</span>
                <span className="font-medium">{systemHealth.apiMetrics?.avgResponseTime || 0}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total API Calls</span>
                <span className="font-medium">{systemHealth.apiMetrics?.totalApiCalls || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Error Rate</span>
                <span className="font-medium">{systemHealth.apiMetrics?.avgErrorRate || 0}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Response Time</span>
                <span className="font-medium">{systemHealth.dbMetrics?.avgResponseTime || 0}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Queries</span>
                <span className="font-medium">{systemHealth.dbMetrics?.totalQueries || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cache Hit Rate</span>
                <span className="font-medium">{systemHealth.dbMetrics?.avgCacheHitRate || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUserActivity = () => {
    const userActivity = data.userActivity;
    if (!userActivity) return <div>Loading...</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Peak Hour"
            value={userActivity.peakHours?.[0]?._id || 0}
            icon={Clock}
            color="blue"
            unit=":00"
          />
          <MetricCard
            title="Active Users"
            value={userActivity.activityTrends?.reduce((sum, day) => sum + day.activeUsers, 0) || 0}
            icon={Users}
            color="green"
          />
          <MetricCard
            title="Page Views"
            value={userActivity.activityTrends?.reduce((sum, day) => sum + day.pageViews, 0) || 0}
            icon={Eye}
            color="purple"
          />
          <MetricCard
            title="New Users"
            value={userActivity.activityTrends?.reduce((sum, day) => sum + day.newUsers, 0) || 0}
            icon={TrendingUp}
            color="orange"
          />
        </div>

        {/* User Demographics */}
        {userActivity.userDemographics && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Demographics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">By Role</h4>
                <div className="space-y-2">
                  {userActivity.userDemographics.map((demo, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{demo._id}</span>
                      <span className="font-medium">{demo.count} ({demo.activeUsers} active)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMuseumPerformance = () => {
    const museumPerformance = data.museumPerformance;
    if (!museumPerformance) return <div>Loading...</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Total Museums"
            value={museumPerformance.museumStats?.reduce((sum, stat) => sum + stat.count, 0) || 0}
            icon={Building2}
            color="blue"
          />
          <MetricCard
            title="Total Revenue"
            value={museumPerformance.performanceTrends?.reduce((sum, trend) => sum + trend.totalRevenue, 0) || 0}
            icon={DollarSign}
            color="green"
            unit=" ETB"
          />
          <MetricCard
            title="Total Visits"
            value={museumPerformance.performanceTrends?.reduce((sum, trend) => sum + trend.totalVisits, 0) || 0}
            icon={Users}
            color="purple"
          />
        </div>

        {/* Top Museums */}
        {museumPerformance.topMuseums && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Museums</h3>
            <div className="space-y-3">
              {museumPerformance.topMuseums.slice(0, 5).map((museum, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{museum.museum?.name || 'Unknown Museum'}</p>
                      <p className="text-sm text-gray-600">{museum.totalVisits} visits</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">ETB {museum.totalRevenue?.toLocaleString() || 0}</p>
                    <p className="text-sm text-gray-600">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderArtifactPerformance = () => {
    const artifactPerformance = data.artifactPerformance;
    if (!artifactPerformance) return <div>Loading...</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Total Views"
            value={artifactPerformance.performanceTrends?.reduce((sum, trend) => sum + trend.totalViews, 0) || 0}
            icon={Eye}
            color="blue"
          />
          <MetricCard
            title="Total Interactions"
            value={artifactPerformance.performanceTrends?.reduce((sum, trend) => sum + trend.totalInteractions, 0) || 0}
            icon={Activity}
            color="green"
          />
          <MetricCard
            title="Total Downloads"
            value={artifactPerformance.performanceTrends?.reduce((sum, trend) => sum + trend.totalDownloads, 0) || 0}
            icon={Download}
            color="purple"
          />
          <MetricCard
            title="Total Shares"
            value={artifactPerformance.performanceTrends?.reduce((sum, trend) => sum + trend.totalShares, 0) || 0}
            icon={Globe}
            color="orange"
          />
        </div>

        {/* Top Artifacts */}
        {artifactPerformance.topArtifacts && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Artifacts</h3>
            <div className="space-y-3">
              {artifactPerformance.topArtifacts.slice(0, 5).map((artifact, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{artifact.artifact?.name || 'Unknown Artifact'}</p>
                      <p className="text-sm text-gray-600">{artifact.totalViews} views</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{artifact.totalInteractions} interactions</p>
                    <p className="text-sm text-gray-600">{artifact.totalDownloads} downloads</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRentalPerformance = () => {
    const rentalPerformance = data.rentalPerformance;
    if (!rentalPerformance) return <div>Loading...</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Total Requests"
            value={rentalPerformance.rentalTrends?.reduce((sum, trend) => sum + trend.totalRequests, 0) || 0}
            icon={Calendar}
            color="blue"
          />
          <MetricCard
            title="Total Revenue"
            value={rentalPerformance.rentalTrends?.reduce((sum, trend) => sum + trend.totalRevenue, 0) || 0}
            icon={DollarSign}
            color="green"
            unit=" ETB"
          />
          <MetricCard
            title="Avg Duration"
            value={rentalPerformance.rentalTrends?.reduce((sum, trend) => sum + trend.avgDuration, 0) / (rentalPerformance.rentalTrends?.length || 1) || 0}
            icon={Clock}
            color="purple"
            unit=" days"
          />
          <MetricCard
            title="Avg Satisfaction"
            value={rentalPerformance.rentalTrends?.reduce((sum, trend) => sum + trend.avgSatisfaction, 0) / (rentalPerformance.rentalTrends?.length || 1) || 0}
            icon={TrendingUp}
            color="orange"
            unit="/5"
          />
        </div>

        {/* Top Rented Items */}
        {rentalPerformance.topRentedItems && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Rented Items</h3>
            <div className="space-y-3">
              {rentalPerformance.topRentedItems.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-orange-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.artifact?.name || 'Unknown Item'}</p>
                      <p className="text-sm text-gray-600">{item.rentalCount} rentals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">ETB {item.totalRevenue?.toLocaleString() || 0}</p>
                    <p className="text-sm text-gray-600">{item.avgDuration?.toFixed(1) || 0} days avg</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderApiPerformance = () => {
    const apiPerformance = data.apiPerformance;
    if (!apiPerformance) return <div>Loading...</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Total API Calls"
            value={apiPerformance.apiTrends?.reduce((sum, trend) => sum + trend.totalCalls, 0) || 0}
            icon={Globe}
            color="blue"
          />
          <MetricCard
            title="Avg Response Time"
            value={apiPerformance.apiTrends?.reduce((sum, trend) => sum + trend.avgResponseTime, 0) / (apiPerformance.apiTrends?.length || 1) || 0}
            icon={Clock}
            color="green"
            unit="ms"
          />
          <MetricCard
            title="Error Rate"
            value={apiPerformance.apiTrends?.reduce((sum, trend) => sum + trend.avgErrorRate, 0) / (apiPerformance.apiTrends?.length || 1) || 0}
            icon={AlertTriangle}
            color="red"
            unit="%"
          />
          <MetricCard
            title="Throughput"
            value={apiPerformance.apiTrends?.reduce((sum, trend) => sum + trend.avgThroughput, 0) / (apiPerformance.apiTrends?.length || 1) || 0}
            icon={Zap}
            color="purple"
            unit=" req/s"
          />
        </div>

        {/* Endpoint Performance */}
        {apiPerformance.endpointPerformance && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Endpoint Performance</h3>
            <div className="space-y-3">
              {apiPerformance.endpointPerformance.slice(0, 10).map((endpoint, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{endpoint._id || 'Unknown Endpoint'}</p>
                      <p className="text-sm text-gray-600">{endpoint.totalCalls} calls</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{endpoint.avgResponseTime?.toFixed(0) || 0}ms</p>
                    <p className="text-sm text-gray-600">{endpoint.avgErrorRate?.toFixed(2) || 0}% error rate</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading performance analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium mb-2">Error loading performance data</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="text-gray-600">Real-time system performance and analytics</p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
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
            onClick={fetchData}
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
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
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
          {activeTab === 'system-health' && renderSystemHealth()}
          {activeTab === 'user-activity' && renderUserActivity()}
          {activeTab === 'museum-performance' && renderMuseumPerformance()}
          {activeTab === 'artifact-performance' && renderArtifactPerformance()}
          {activeTab === 'rental-performance' && renderRentalPerformance()}
          {activeTab === 'api-performance' && renderApiPerformance()}
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
