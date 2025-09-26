const mongoose = require('mongoose');

const performanceMetricsSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  metricType: {
    type: String,
    required: true,
    enum: [
      'system_performance',
      'user_activity',
      'museum_performance',
      'artifact_performance',
      'rental_performance',
      'api_performance',
      'database_performance',
      'response_time',
      'error_rate',
      'throughput'
    ]
  },
  category: {
    type: String,
    required: true,
    enum: [
      'overview',
      'users',
      'museums',
      'artifacts',
      'rentals',
      'api',
      'database',
      'system'
    ]
  },
  metrics: {
    // System Performance
    cpuUsage: Number,
    memoryUsage: Number,
    diskUsage: Number,
    networkLatency: Number,

    // User Activity
    activeUsers: Number,
    newUsers: Number,
    userSessions: Number,
    pageViews: Number,
    uniqueVisitors: Number,

    // Museum Performance
    museumVisits: Number,
    museumRevenue: Number,
    museumEngagement: Number,
    museumRating: Number,

    // Artifact Performance
    artifactViews: Number,
    artifactInteractions: Number,
    artifactDownloads: Number,
    artifactShares: Number,

    // Rental Performance
    rentalRequests: Number,
    rentalRevenue: Number,
    rentalDuration: Number,
    rentalSatisfaction: Number,

    // API Performance
    apiCalls: Number,
    apiResponseTime: Number,
    apiErrorRate: Number,
    apiThroughput: Number,

    // Database Performance
    dbQueries: Number,
    dbResponseTime: Number,
    dbConnections: Number,
    dbCacheHitRate: Number,

    // Response Time Metrics
    avgResponseTime: Number,
    p95ResponseTime: Number,
    p99ResponseTime: Number,
    maxResponseTime: Number,

    // Error Metrics
    errorCount: Number,
    errorRate: Number,
    criticalErrors: Number,
    warningCount: Number,

    // Throughput Metrics
    requestsPerSecond: Number,
    transactionsPerSecond: Number,
    dataProcessed: Number,
    bandwidthUsed: Number
  },
  metadata: {
    source: String, // 'system', 'user_action', 'api_call', etc.
    endpoint: String, // For API metrics
    userAgent: String,
    ipAddress: String,
    sessionId: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    museumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Museum'
    },
    artifactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artifact'
    }
  },
  tags: [String], // For filtering and categorization
  environment: {
    type: String,
    enum: ['development', 'staging', 'production'],
    default: 'production'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
performanceMetricsSchema.index({ timestamp: 1, metricType: 1 });
performanceMetricsSchema.index({ category: 1, timestamp: 1 });
performanceMetricsSchema.index({ 'metadata.userId': 1, timestamp: 1 });
performanceMetricsSchema.index({ 'metadata.museumId': 1, timestamp: 1 });

// Static method to get performance summary
performanceMetricsSchema.statics.getPerformanceSummary = async function (startDate, endDate, category = null) {
  const matchStage = {
    timestamp: { $gte: startDate, $lte: endDate }
  };

  if (category) {
    matchStage.category = category;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$metricType',
        count: { $sum: 1 },
        avgCpuUsage: { $avg: '$metrics.cpuUsage' },
        avgMemoryUsage: { $avg: '$metrics.memoryUsage' },
        avgResponseTime: { $avg: '$metrics.avgResponseTime' },
        avgErrorRate: { $avg: '$metrics.errorRate' },
        totalApiCalls: { $sum: '$metrics.apiCalls' },
        totalUsers: { $sum: '$metrics.activeUsers' },
        totalRevenue: { $sum: '$metrics.museumRevenue' },
        totalViews: { $sum: '$metrics.artifactViews' },
        totalRentals: { $sum: '$metrics.rentalRequests' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to get performance trends
performanceMetricsSchema.statics.getPerformanceTrends = async function (startDate, endDate, metricType, interval = 'hour') {
  const intervalMap = {
    'hour': { $hour: '$timestamp' },
    'day': { $dayOfYear: '$timestamp' },
    'week': { $week: '$timestamp' },
    'month': { $month: '$timestamp' }
  };

  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate },
        metricType: metricType
      }
    },
    {
      $group: {
        _id: {
          interval: intervalMap[interval],
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
        },
        avgValue: { $avg: '$metrics.avgResponseTime' },
        maxValue: { $max: '$metrics.maxResponseTime' },
        minValue: { $min: '$metrics.avgResponseTime' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);
};

// Static method to get top performers
performanceMetricsSchema.statics.getTopPerformers = async function (startDate, endDate, category, limit = 10) {
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate },
        category: category
      }
    },
    {
      $group: {
        _id: '$metadata.museumId',
        totalVisits: { $sum: '$metrics.museumVisits' },
        totalRevenue: { $sum: '$metrics.museumRevenue' },
        avgRating: { $avg: '$metrics.museumRating' },
        totalEngagement: { $sum: '$metrics.museumEngagement' }
      }
    },
    {
      $lookup: {
        from: 'museums',
        localField: '_id',
        foreignField: '_id',
        as: 'museum'
      }
    },
    {
      $unwind: '$museum'
    },
    {
      $sort: { totalRevenue: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

// Static method to get system health score
performanceMetricsSchema.statics.getSystemHealthScore = async function (startDate, endDate) {
  const metrics = await this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        avgCpuUsage: { $avg: '$metrics.cpuUsage' },
        avgMemoryUsage: { $avg: '$metrics.memoryUsage' },
        avgResponseTime: { $avg: '$metrics.avgResponseTime' },
        avgErrorRate: { $avg: '$metrics.errorRate' },
        avgApiResponseTime: { $avg: '$metrics.apiResponseTime' },
        avgDbResponseTime: { $avg: '$metrics.dbResponseTime' }
      }
    }
  ]);

  if (metrics.length === 0) return { score: 0, status: 'unknown' };

  const data = metrics[0];

  // Calculate health score (0-100)
  let score = 100;

  // CPU usage penalty
  if (data.avgCpuUsage > 80) score -= 20;
  else if (data.avgCpuUsage > 60) score -= 10;

  // Memory usage penalty
  if (data.avgMemoryUsage > 85) score -= 20;
  else if (data.avgMemoryUsage > 70) score -= 10;

  // Response time penalty
  if (data.avgResponseTime > 2000) score -= 25;
  else if (data.avgResponseTime > 1000) score -= 15;
  else if (data.avgResponseTime > 500) score -= 5;

  // Error rate penalty
  if (data.avgErrorRate > 5) score -= 30;
  else if (data.avgErrorRate > 2) score -= 15;
  else if (data.avgErrorRate > 1) score -= 5;

  // API response time penalty
  if (data.avgApiResponseTime > 1000) score -= 15;
  else if (data.avgApiResponseTime > 500) score -= 10;

  // Database response time penalty
  if (data.avgDbResponseTime > 500) score -= 15;
  else if (data.avgDbResponseTime > 200) score -= 10;

  score = Math.max(0, score);

  let status = 'excellent';
  if (score < 60) status = 'poor';
  else if (score < 75) status = 'fair';
  else if (score < 90) status = 'good';

  return {
    score: Math.round(score),
    status,
    metrics: data
  };
};

const PerformanceMetrics = mongoose.model('PerformanceMetrics', performanceMetricsSchema);

module.exports = PerformanceMetrics;
