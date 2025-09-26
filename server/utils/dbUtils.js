const mongoose = require('mongoose');

/**
 * Database Utility Functions for EthioHeritage360
 * Contains common database operations and helpers
 */
const dbUtils = {
  /**
   * Check if ObjectId is valid
   * @param {string} id - The ID to validate
   * @returns {boolean} - True if valid ObjectId
   */
  isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  },

  /**
   * Convert string to ObjectId
   * @param {string} id - The ID to convert
   * @returns {mongoose.Types.ObjectId} - ObjectId instance
   */
  toObjectId(id) {
    return new mongoose.Types.ObjectId(id);
  },

  /**
   * Paginate query results
   * @param {Object} query - Mongoose query object
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Items per page
   * @returns {Object} - Paginated results with metadata
   */
  async paginate(query, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [results, total] = await Promise.all([
      query.skip(skip).limit(limit).exec(),
      query.model.countDocuments(query.getFilter())
    ]);

    return {
      data: results,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  },

  /**
   * Build search query for text fields
   * @param {string} searchTerm - Search term
   * @param {Array} fields - Fields to search in
   * @returns {Object} - MongoDB query object
   */
  buildSearchQuery(searchTerm, fields = []) {
    if (!searchTerm) return {};

    const searchRegex = new RegExp(searchTerm, 'i');
    return {
      $or: fields.map(field => ({ [field]: searchRegex }))
    };
  },

  /**
   * Build date range query
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {string} field - Date field name
   * @returns {Object} - MongoDB query object
   */
  buildDateRangeQuery(startDate, endDate, field = 'createdAt') {
    const query = {};
    if (startDate || endDate) {
      query[field] = {};
      if (startDate) query[field].$gte = new Date(startDate);
      if (endDate) query[field].$lte = new Date(endDate);
    }
    return query;
  },

  /**
   * Aggregate pipeline for common statistics
   * @param {string} collection - Collection name
   * @returns {Object} - Statistics object
   */
  async getCollectionStats(collection) {
    try {
      const stats = await mongoose.connection.db.collection(collection).aggregate([
        {
          $group: {
            _id: null,
            totalCount: { $sum: 1 },
            createdThisMonth: {
              $sum: {
                $cond: [
                  {
                    $gte: ['$createdAt', new Date(new Date().getFullYear(), new Date().getMonth(), 1)]
                  },
                  1,
                  0
                ]
              }
            },
            createdThisWeek: {
              $sum: {
                $cond: [
                  {
                    $gte: ['$createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]).toArray();

      return stats[0] || { totalCount: 0, createdThisMonth: 0, createdThisWeek: 0 };
    } catch (error) {
      console.error(`Error getting stats for ${collection}:`, error.message);
      return { totalCount: 0, createdThisMonth: 0, createdThisWeek: 0 };
    }
  },

  /**
   * Soft delete document by ID
   * @param {Object} model - Mongoose model
   * @param {string} id - Document ID
   * @returns {Object} - Updated document
   */
  async softDelete(model, id) {
    return await model.findByIdAndUpdate(
      id,
      { deletedAt: new Date(), isActive: false },
      { new: true }
    );
  },

  /**
   * Restore soft deleted document
   * @param {Object} model - Mongoose model
   * @param {string} id - Document ID
   * @returns {Object} - Updated document
   */
  async restore(model, id) {
    return await model.findByIdAndUpdate(
      id,
      { $unset: { deletedAt: 1 }, isActive: true },
      { new: true }
    );
  },

  /**
   * Bulk operations helper
   * @param {Object} model - Mongoose model
   * @param {Array} operations - Array of bulk operations
   * @returns {Object} - Bulk operation result
   */
  async bulkWrite(model, operations) {
    try {
      return await model.bulkWrite(operations);
    } catch (error) {
      console.error('Bulk write error:', error.message);
      throw error;
    }
  },

  /**
   * Create unique slug from text
   * @param {string} text - Text to convert
   * @param {Object} model - Model to check uniqueness against
   * @param {string} field - Field name for uniqueness check
   * @returns {string} - Unique slug
   */
  async createUniqueSlug(text, model = null, field = 'slug') {
    let slug = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!model) return slug;

    let counter = 0;
    let uniqueSlug = slug;

    while (await model.findOne({ [field]: uniqueSlug })) {
      counter++;
      uniqueSlug = `${slug}-${counter}`;
    }

    return uniqueSlug;
  },

  /**
   * Validate required fields
   * @param {Object} data - Data object to validate
   * @param {Array} requiredFields - Array of required field names
   * @returns {Object} - Validation result
   */
  validateRequired(data, requiredFields) {
    const missing = requiredFields.filter(field => 
      !data[field] || (typeof data[field] === 'string' && data[field].trim() === '')
    );

    return {
      isValid: missing.length === 0,
      missingFields: missing
    };
  },

  /**
   * Clean up empty or null values from object
   * @param {Object} obj - Object to clean
   * @returns {Object} - Cleaned object
   */
  cleanObject(obj) {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'object' && !Array.isArray(value)) {
          const cleanedNested = this.cleanObject(value);
          if (Object.keys(cleanedNested).length > 0) {
            cleaned[key] = cleanedNested;
          }
        } else {
          cleaned[key] = value;
        }
      }
    }
    return cleaned;
  },

  /**
   * Get aggregation pipeline for user activity
   * @param {string} userId - User ID
   * @returns {Array} - Aggregation pipeline
   */
  getUserActivityPipeline(userId) {
    return [
      { $match: { userId: this.toObjectId(userId) } },
      { $sort: { createdAt: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          action: 1,
          target: 1,
          createdAt: 1,
          'user.firstName': 1,
          'user.lastName': 1,
          'user.avatar': 1
        }
      }
    ];
  }
};

module.exports = dbUtils;
