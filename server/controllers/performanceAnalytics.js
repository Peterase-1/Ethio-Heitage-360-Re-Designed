const PerformanceMetrics = require('../models/PerformanceMetrics');
const User = require('../models/User');
const Museum = require('../models/Museum');
const Artifact = require('../models/Artifact');
const Rental = require('../models/Rental');
const AuditLog = require('../models/AuditLog');

// ======================
// PERFORMANCE ANALYTICS CONTROLLER
// ======================

// GET /api/super-admin/performance-analytics/overview
async function getPerformanceOverview(req, res) {
  try {
    const { timeRange = '30d', category = 'all' } = req.query;

    // Calculate date range
    const now = new Date();
    const startDate = new Date(now.getTime() - (parseInt(timeRange.replace('d', '')) * 24 * 60 * 60 * 1000));

    // Get system health score
    const healthScore = await PerformanceMetrics.getSystemHealthScore(startDate, now);

    // Get performance summary
    const performanceSummary = await PerformanceMetrics.getPerformanceSummary(
      startDate,
      now,
      category === 'all' ? null : category
    );

    // Get key metrics
    const keyMetrics = await getKeyMetrics(startDate, now);

    // Get performance trends
    const trends = await PerformanceMetrics.getPerformanceTrends(startDate, now, 'system_performance', 'day');

    // Get alerts and recommendations
    const alerts = await getPerformanceAlerts(healthScore, performanceSummary);

    res.json({
      success: true,
      data: {
        healthScore,
        performanceSummary,
        keyMetrics,
        trends,
        alerts,
        timeRange,
        category
      }
    });
  } catch (error) {
    console.error('Get performance overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance overview',
      error: error.message
    });
  }
}

// GET /api/super-admin/performance-analytics/system-health
async function getSystemHealth(req, res) {
  try {
    const { timeRange = '24h' } = req.query;

    const now = new Date();
    const startDate = new Date(now.getTime() - (parseInt(timeRange.replace('h', '')) * 60 * 60 * 1000));

    // Get detailed system health metrics
    const systemMetrics = await PerformanceMetrics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: now },
          metricType: 'system_performance'
        }
      },
      {
        $group: {
          _id: null,
          avgCpuUsage: { $avg: '$metrics.cpuUsage' },
          maxCpuUsage: { $max: '$metrics.cpuUsage' },
          avgMemoryUsage: { $avg: '$metrics.memoryUsage' },
          maxMemoryUsage: { $max: '$metrics.memoryUsage' },
          avgDiskUsage: { $avg: '$metrics.diskUsage' },
          avgNetworkLatency: { $avg: '$metrics.networkLatency' },
          totalMeasurements: { $sum: 1 }
        }
      }
    ]);

    // Get API performance
    const apiMetrics = await PerformanceMetrics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: now },
          metricType: 'api_performance'
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$metrics.apiResponseTime' },
          maxResponseTime: { $max: '$metrics.apiResponseTime' },
          avgErrorRate: { $avg: '$metrics.apiErrorRate' },
          totalApiCalls: { $sum: '$metrics.apiCalls' },
          avgThroughput: { $avg: '$metrics.apiThroughput' }
        }
      }
    ]);

    // Get database performance
    const dbMetrics = await PerformanceMetrics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: now },
          metricType: 'database_performance'
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$metrics.dbResponseTime' },
          maxResponseTime: { $max: '$metrics.dbResponseTime' },
          totalQueries: { $sum: '$metrics.dbQueries' },
          avgConnections: { $avg: '$metrics.dbConnections' },
          avgCacheHitRate: { $avg: '$metrics.dbCacheHitRate' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        systemMetrics: systemMetrics[0] || {},
        apiMetrics: apiMetrics[0] || {},
        dbMetrics: dbMetrics[0] || {},
        timeRange
      }
    });
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system health',
      error: error.message
    });
  }
}

// GET /api/super-admin/performance-analytics/user-activity
async function getUserActivityMetrics(req, res) {
  try {
    const { timeRange = '7d', groupBy = 'day' } = req.query;

    const now = new Date();
    const startDate = new Date(now.getTime() - (parseInt(timeRange.replace('d', '')) * 24 * 60 * 60 * 1000));

    // Get user activity trends
    const activityTrends = await PerformanceMetrics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: now },
          metricType: 'user_activity'
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          activeUsers: { $sum: '$metrics.activeUsers' },
          newUsers: { $sum: '$metrics.newUsers' },
          pageViews: { $sum: '$metrics.pageViews' },
          uniqueVisitors: { $sum: '$metrics.uniqueVisitors' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Get user demographics
    const userDemographics = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          activeUsers: {
            $sum: {
              $cond: [
                { $gte: ['$lastLogin', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Get peak activity hours
    const peakHours = await PerformanceMetrics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: now },
          metricType: 'user_activity'
        }
      },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          avgActivity: { $avg: '$metrics.activeUsers' }
        }
      },
      {
        $sort: { avgActivity: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.json({
      success: true,
      data: {
        activityTrends,
        userDemographics,
        peakHours,
        timeRange,
        groupBy
      }
    });
  } catch (error) {
    console.error('Get user activity metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity metrics',
      error: error.message
    });
  }
}

// GET /api/super-admin/performance-analytics/museum-performance
async function getMuseumPerformanceMetrics(req, res) {
  try {
    const { timeRange = '30d', sortBy = 'revenue' } = req.query;

    const now = new Date();
    const startDate = new Date(now.getTime() - (parseInt(timeRange.replace('d', '')) * 24 * 60 * 60 * 1000));

    // Get top performing museums
    const topMuseums = await PerformanceMetrics.getTopPerformers(startDate, now, 'museums', 10);

    // Get museum performance trends
    const performanceTrends = await PerformanceMetrics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: now },
          metricType: 'museum_performance'
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          totalVisits: { $sum: '$metrics.museumVisits' },
          totalRevenue: { $sum: '$metrics.museumRevenue' },
          avgRating: { $avg: '$metrics.museumRating' },
          totalEngagement: { $sum: '$metrics.museumEngagement' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Get museum statistics
    const museumStats = await Museum.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get regional distribution
    const regionalDistribution = await Museum.aggregate([
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$revenue' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        topMuseums,
        performanceTrends,
        museumStats,
        regionalDistribution,
        timeRange,
        sortBy
      }
    });
  } catch (error) {
    console.error('Get museum performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch museum performance metrics',
      error: error.message
    });
  }
}

// GET /api/super-admin/performance-analytics/artifact-performance
async function getArtifactPerformanceMetrics(req, res) {
  try {
    const { timeRange = '30d', category = 'all' } = req.query;

    const now = new Date();
    const startDate = new Date(now.getTime() - (parseInt(timeRange.replace('d', '')) * 24 * 60 * 60 * 1000));

    // Get artifact performance trends
    const performanceTrends = await PerformanceMetrics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: now },
          metricType: 'artifact_performance'
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          totalViews: { $sum: '$metrics.artifactViews' },
          totalInteractions: { $sum: '$metrics.artifactInteractions' },
          totalDownloads: { $sum: '$metrics.artifactDownloads' },
          totalShares: { $sum: '$metrics.artifactShares' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Get top performing artifacts
    const topArtifacts = await PerformanceMetrics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: now },
          metricType: 'artifact_performance'
        }
      },
      {
        $group: {
          _id: '$metadata.artifactId',
          totalViews: { $sum: '$metrics.artifactViews' },
          totalInteractions: { $sum: '$metrics.artifactInteractions' },
          totalDownloads: { $sum: '$metrics.artifactDownloads' },
          totalShares: { $sum: '$metrics.artifactShares' }
        }
      },
      {
        $lookup: {
          from: 'artifacts',
          localField: '_id',
          foreignField: '_id',
          as: 'artifact'
        }
      },
      {
        $unwind: '$artifact'
      },
      {
        $sort: { totalViews: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get artifact categories performance
    const categoryPerformance = await Artifact.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          avgRating: { $avg: '$rating' }
        }
      },
      {
        $sort: { totalViews: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        performanceTrends,
        topArtifacts,
        categoryPerformance,
        timeRange,
        category
      }
    });
  } catch (error) {
    console.error('Get artifact performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artifact performance metrics',
      error: error.message
    });
  }
}

// GET /api/super-admin/performance-analytics/rental-performance
async function getRentalPerformanceMetrics(req, res) {
  try {
    const { timeRange = '30d' } = req.query;

    const now = new Date();
    const startDate = new Date(now.getTime() - (parseInt(timeRange.replace('d', '')) * 24 * 60 * 60 * 1000));

    // Get rental performance trends
    const rentalTrends = await PerformanceMetrics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: now },
          metricType: 'rental_performance'
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          totalRequests: { $sum: '$metrics.rentalRequests' },
          totalRevenue: { $sum: '$metrics.rentalRevenue' },
          avgDuration: { $avg: '$metrics.rentalDuration' },
          avgSatisfaction: { $avg: '$metrics.rentalSatisfaction' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Get rental statistics
    const rentalStats = await Rental.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalCost' }
        }
      }
    ]);

    // Get top rented items
    const topRentedItems = await Rental.aggregate([
      {
        $group: {
          _id: '$artifact',
          rentalCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalCost' },
          avgDuration: { $avg: { $divide: [{ $subtract: ['$endDate', '$startDate'] }, 1000 * 60 * 60 * 24] } }
        }
      },
      {
        $lookup: {
          from: 'artifacts',
          localField: '_id',
          foreignField: '_id',
          as: 'artifact'
        }
      },
      {
        $unwind: '$artifact'
      },
      {
        $sort: { rentalCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        rentalTrends,
        rentalStats,
        topRentedItems,
        timeRange
      }
    });
  } catch (error) {
    console.error('Get rental performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rental performance metrics',
      error: error.message
    });
  }
}

// GET /api/super-admin/performance-analytics/api-performance
async function getApiPerformanceMetrics(req, res) {
  try {
    const { timeRange = '24h', endpoint = 'all' } = req.query;

    const now = new Date();
    const startDate = new Date(now.getTime() - (parseInt(timeRange.replace('h', '')) * 60 * 60 * 1000));

    // Get API performance trends
    const apiTrends = await PerformanceMetrics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: now },
          metricType: 'api_performance',
          ...(endpoint !== 'all' && { 'metadata.endpoint': endpoint })
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$timestamp' },
            endpoint: '$metadata.endpoint'
          },
          avgResponseTime: { $avg: '$metrics.apiResponseTime' },
          maxResponseTime: { $max: '$metrics.apiResponseTime' },
          totalCalls: { $sum: '$metrics.apiCalls' },
          avgErrorRate: { $avg: '$metrics.apiErrorRate' },
          avgThroughput: { $avg: '$metrics.apiThroughput' }
        }
      },
      {
        $sort: { '_id.hour': 1 }
      }
    ]);

    // Get endpoint performance
    const endpointPerformance = await PerformanceMetrics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: now },
          metricType: 'api_performance'
        }
      },
      {
        $group: {
          _id: '$metadata.endpoint',
          avgResponseTime: { $avg: '$metrics.apiResponseTime' },
          maxResponseTime: { $max: '$metrics.apiResponseTime' },
          totalCalls: { $sum: '$metrics.apiCalls' },
          avgErrorRate: { $avg: '$metrics.apiErrorRate' },
          avgThroughput: { $avg: '$metrics.apiThroughput' }
        }
      },
      {
        $sort: { avgResponseTime: 1 }
      }
    ]);

    // Get error analysis
    const errorAnalysis = await PerformanceMetrics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: now },
          metricType: 'api_performance',
          'metrics.apiErrorRate': { $gt: 0 }
        }
      },
      {
        $group: {
          _id: '$metadata.endpoint',
          errorCount: { $sum: '$metrics.apiCalls' },
          avgErrorRate: { $avg: '$metrics.apiErrorRate' },
          maxErrorRate: { $max: '$metrics.apiErrorRate' }
        }
      },
      {
        $sort: { avgErrorRate: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        apiTrends,
        endpointPerformance,
        errorAnalysis,
        timeRange,
        endpoint
      }
    });
  } catch (error) {
    console.error('Get API performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch API performance metrics',
      error: error.message
    });
  }
}

// Helper function to get key metrics
async function getKeyMetrics(startDate, endDate) {
  const [
    totalUsers,
    totalMuseums,
    totalArtifacts,
    totalRentals,
    totalRevenue
  ] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: startDate } }),
    Museum.countDocuments({ createdAt: { $gte: startDate } }),
    Artifact.countDocuments({ createdAt: { $gte: startDate } }),
    Rental.countDocuments({ createdAt: { $gte: startDate } }),
    Rental.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$totalCost' } } }
    ])
  ]);

  return {
    totalUsers,
    totalMuseums,
    totalArtifacts,
    totalRentals,
    totalRevenue: totalRevenue[0]?.total || 0
  };
}

// Helper function to get performance alerts
async function getPerformanceAlerts(healthScore, performanceSummary) {
  const alerts = [];

  if (healthScore.score < 70) {
    alerts.push({
      type: 'critical',
      message: 'System health is below optimal levels',
      score: healthScore.score
    });
  }

  if (healthScore.score < 85) {
    alerts.push({
      type: 'warning',
      message: 'System performance could be improved',
      score: healthScore.score
    });
  }

  // Check for high error rates
  const highErrorRate = performanceSummary.find(p => p.avgErrorRate > 5);
  if (highErrorRate) {
    alerts.push({
      type: 'warning',
      message: 'High error rate detected in API calls',
      details: highErrorRate
    });
  }

  // Check for slow response times
  const slowResponse = performanceSummary.find(p => p.avgResponseTime > 2000);
  if (slowResponse) {
    alerts.push({
      type: 'info',
      message: 'Some API endpoints are experiencing slow response times',
      details: slowResponse
    });
  }

  return alerts;
}

module.exports = {
  getPerformanceOverview,
  getSystemHealth,
  getUserActivityMetrics,
  getMuseumPerformanceMetrics,
  getArtifactPerformanceMetrics,
  getRentalPerformanceMetrics,
  getApiPerformanceMetrics
};
