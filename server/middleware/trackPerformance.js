const PerformanceMetrics = require('../models/PerformanceMetrics');

const trackPerformance = async (req, res, next) => {
  const start = process.hrtime();
  const requestDate = new Date();

  // Hook into response finish event
  res.on('finish', async () => {
    try {
      const diff = process.hrtime(start);
      const durationInMs = (diff[0] * 1e9 + diff[1]) / 1e6;

      // Skip logging for performance metrics endpoints to avoid Heisenberg effect (though interesting)
      // or keep it to see self-load. Let's keep it.

      const metric = new PerformanceMetrics({
        timestamp: requestDate,
        metricType: 'api_performance',
        category: 'api',
        metrics: {
          apiCalls: 1,
          apiResponseTime: durationInMs,
          errorRate: res.statusCode >= 400 ? 1 : 0,
          apiThroughput: 0 // Calculated later
        },
        metadata: {
          endpoint: req.originalUrl,
          method: req.method,
          statusCode: res.statusCode,
          userId: req.user?._id,
        }
      });

      await metric.save();
    } catch (error) {
      console.error('Error tracking performance:', error);
    }
  });

  next();
};

module.exports = trackPerformance;
