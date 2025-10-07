import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  Database,
  Globe,
  Settings
} from 'lucide-react';
import api from '../utils/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    startDate: '',
    endDate: '',
    riskLevel: '',
    page: 1,
    limit: 50
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    pages: 0
  });
  const [summary, setSummary] = useState(null);

  const actionTypes = [
    'user_login',
    'user_logout',
    'user_created',
    'user_updated',
    'user_deleted',
    'museum_created',
    'museum_updated',
    'museum_approved',
    'museum_rejected',
    'artifact_created',
    'artifact_updated',
    'artifact_deleted',
    'rental_created',
    'rental_approved',
    'rental_rejected',
    'system_settings_updated',
    'audit_log_viewed'
  ];

  const riskLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-red-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-800' }
  ];

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching audit logs...');
      const response = await api.getAuditLogs(filters);

      if (response.success) {
        setLogs(response.logs || []);
        setPagination(response.pagination || {});
        console.log('✅ Audit logs loaded:', response.logs?.length || 0, 'logs');
      } else {
        throw new Error(response.message || 'Failed to fetch audit logs');
      }
    } catch (err) {
      console.error('❌ Error fetching audit logs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditSummary = async () => {
    try {
      console.log('🔄 Fetching audit summary...');
      const response = await api.getAuditLogsSummary({
        startDate: filters.startDate,
        endDate: filters.endDate
      });

      if (response.success) {
        setSummary(response.summary);
        console.log('✅ Audit summary loaded');
      }
    } catch (err) {
      console.error('❌ Error fetching audit summary:', err);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    fetchAuditSummary();
  }, [filters.page, filters.limit]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleSearch = () => {
    fetchAuditLogs();
    fetchAuditSummary();
  };

  const handleClearFilters = () => {
    setFilters({
      action: '',
      userId: '',
      startDate: '',
      endDate: '',
      riskLevel: '',
      page: 1,
      limit: 50
    });
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'user_login':
      case 'user_logout':
        return <User className="w-4 h-4" />;
      case 'user_created':
      case 'user_updated':
      case 'user_deleted':
        return <User className="w-4 h-4" />;
      case 'museum_created':
      case 'museum_updated':
      case 'museum_approved':
      case 'museum_rejected':
        return <Database className="w-4 h-4" />;
      case 'artifact_created':
      case 'artifact_updated':
      case 'artifact_deleted':
        return <FileText className="w-4 h-4" />;
      case 'rental_created':
      case 'rental_approved':
      case 'rental_rejected':
        return <Globe className="w-4 h-4" />;
      case 'system_settings_updated':
        return <Settings className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getRiskLevelBadge = (riskLevel) => {
    const level = riskLevels.find(r => r.value === riskLevel);
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${riskLevel === 'low' ? 'bg-green-100 text-green-800' :
          riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            riskLevel === 'high' ? 'bg-red-100 text-red-800' :
              'bg-red-200 text-red-900'
        }`}>
        {level?.label || riskLevel}
      </span>
    );
  };

  const renderSummary = () => {
    if (!summary) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalEvents || 0}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Risk Events</p>
              <p className="text-2xl font-bold text-red-600">{summary.highRiskEvents || 0}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Users</p>
              <p className="text-2xl font-bold text-gray-900">{summary.uniqueUsers || 0}</p>
            </div>
            <User className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Last 24 Hours</p>
              <p className="text-2xl font-bold text-gray-900">{summary.last24Hours || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>
    );
  };

  const renderFilters = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
          <select
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Actions</option>
            {actionTypes.map(action => (
              <option key={action} value={action}>
                {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
          <input
            type="text"
            value={filters.userId}
            onChange={(e) => handleFilterChange('userId', e.target.value)}
            placeholder="Enter user ID"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
          <select
            value={filters.riskLevel}
            onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Risk Levels</option>
            {riskLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSearch}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
          <button
            onClick={handleClearFilters}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchAuditLogs}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Audit Logs</h3>
        <p className="text-sm text-gray-600">
          Showing {logs.length} of {pagination.total} logs
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log, index) => (
              <tr key={log._id || index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getActionIcon(log.action)}
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {log.action?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {log.performedBy?.name || 'System'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {log.performedBy?.email || 'system@ethioheritage360.com'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.targetEntity?.type || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRiskLevelBadge(log.security?.riskLevel || 'low')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-blue-600 hover:text-blue-900 text-sm">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleFilterChange('page', Math.max(1, pagination.page - 1))}
                disabled={pagination.page <= 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handleFilterChange('page', Math.min(pagination.pages, pagination.page + 1))}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading audit logs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">Error loading audit logs: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
          <p className="text-gray-600">Track all system activities and security events</p>
        </div>
      </div>

      {/* Summary */}
      {renderSummary()}

      {/* Filters */}
      {renderFilters()}

      {/* Logs */}
      {renderLogs()}
    </div>
  );
};

export default AuditLogs;
