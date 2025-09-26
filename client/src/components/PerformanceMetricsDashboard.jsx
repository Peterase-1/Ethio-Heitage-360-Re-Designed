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
  Monitor,
  Server,
  MemoryStick,
  Network
} from 'lucide-react';
import api from '../utils/api';

const PerformanceMetricsDashboard = () => {
  const [metrics, setMetrics] = useState({
    system: null,
    performance: null,
    alerts: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchMetrics();

    // Auto-refresh every 30 seconds if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchMetrics, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewResponse, systemHealthResponse] = await Promise.all([
        api.getPerformanceOverview({ timeRange: '1h' }),
        api.getSystemHealth({ timeRange: '1h' })
      ]);

      if (overviewResponse.success && systemHealthResponse.success) {
        setMetrics({
          system: systemHealthResponse.data,
          performance: overviewResponse.data,
          alerts: overviewResponse.data?.alerts || []
        });
        setLastUpdated(new Date());
      } else {
        throw new Error('Failed to fetch performance metrics');
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, change, icon: Icon, color = 'blue', unit = '', status = 'normal', description = '' }) => {
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
                <span className="text-sm text-gray-500 ml-1">from last hour</span>
              </div>
            )}
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    );
  };

  const AlertCard = ({ alert, index }) => {
    const alertColors = {
      critical: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    return (
      <div key={index} className={`p-4 rounded-lg border ${alertColors[alert.type] || alertColors.info}`}>
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">{alert.message}</p>
            {alert.details && (
              <p className="text-sm mt-1 opacity-80">{alert.details}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const SystemHealthIndicator = ({ score, status }) => {
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
          <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
            {status.toUpperCase()}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${score >= 90 ? 'bg-green-500' :
                    score >= 75 ? 'bg-blue-500' :
                      score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>
          <span className="text-2xl font-bold text-gray-900">{score}/100</span>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          {score >= 90 && "System is running optimally"}
          {score >= 75 && score < 90 && "System performance is good"}
          {score >= 60 && score < 75 && "System performance needs attention"}
          {score < 60 && "System performance is critical"}
        </div>
      </div>
    );
  };

  if (loading && !metrics.system) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading performance metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium mb-2">Error loading metrics</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchMetrics}
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
          <h1 className="text-2xl font-bold text-gray-900">Performance Metrics</h1>
          <p className="text-gray-600">Real-time system performance monitoring</p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Auto-refresh</span>
          </label>
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* System Health Score */}
      {metrics.performance?.healthScore && (
        <SystemHealthIndicator
          score={metrics.performance.healthScore.score}
          status={metrics.performance.healthScore.status}
        />
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="CPU Usage"
          value={metrics.system?.systemMetrics?.avgCpuUsage || 0}
          icon={Cpu}
          color="blue"
          unit="%"
          status={metrics.system?.systemMetrics?.avgCpuUsage > 80 ? 'critical' : 'normal'}
          description="Average CPU utilization"
        />
        <MetricCard
          title="Memory Usage"
          value={metrics.system?.systemMetrics?.avgMemoryUsage || 0}
          icon={HardDrive}
          color="green"
          unit="%"
          status={metrics.system?.systemMetrics?.avgMemoryUsage > 85 ? 'critical' : 'normal'}
          description="Average memory utilization"
        />
        <MetricCard
          title="API Response Time"
          value={metrics.system?.apiMetrics?.avgResponseTime || 0}
          icon={Globe}
          color="purple"
          unit="ms"
          status={metrics.system?.apiMetrics?.avgResponseTime > 1000 ? 'warning' : 'normal'}
          description="Average API response time"
        />
        <MetricCard
          title="Database Queries"
          value={metrics.system?.dbMetrics?.totalQueries || 0}
          icon={Database}
          color="orange"
          status="normal"
          description="Total database queries"
        />
      </div>

      {/* Performance Alerts */}
      {metrics.alerts && metrics.alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Alerts</h3>
            <span className="px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
              {metrics.alerts.length} Alert{metrics.alerts.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-3">
            {metrics.alerts.map((alert, index) => (
              <AlertCard key={index} alert={alert} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* System Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Resources</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                <span className="text-sm text-gray-900">{metrics.system?.systemMetrics?.avgCpuUsage || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${(metrics.system?.systemMetrics?.avgCpuUsage || 0) > 80 ? 'bg-red-500' :
                      (metrics.system?.systemMetrics?.avgCpuUsage || 0) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                  style={{ width: `${Math.min(metrics.system?.systemMetrics?.avgCpuUsage || 0, 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                <span className="text-sm text-gray-900">{metrics.system?.systemMetrics?.avgMemoryUsage || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${(metrics.system?.systemMetrics?.avgMemoryUsage || 0) > 85 ? 'bg-red-500' :
                      (metrics.system?.systemMetrics?.avgMemoryUsage || 0) > 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                  style={{ width: `${Math.min(metrics.system?.systemMetrics?.avgMemoryUsage || 0, 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Network Latency</span>
                <span className="text-sm text-gray-900">{metrics.system?.systemMetrics?.avgNetworkLatency || 0}ms</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${(metrics.system?.systemMetrics?.avgNetworkLatency || 0) > 200 ? 'bg-red-500' :
                      (metrics.system?.systemMetrics?.avgNetworkLatency || 0) > 100 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                  style={{ width: `${Math.min((metrics.system?.systemMetrics?.avgNetworkLatency || 0) / 2, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total API Calls</span>
              <span className="font-medium">{metrics.system?.apiMetrics?.totalApiCalls || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg Response Time</span>
              <span className="font-medium">{metrics.system?.apiMetrics?.avgResponseTime || 0}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Error Rate</span>
              <span className="font-medium">{metrics.system?.apiMetrics?.avgErrorRate || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Throughput</span>
              <span className="font-medium">{metrics.system?.apiMetrics?.avgThroughput || 0} req/s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetricsDashboard;
