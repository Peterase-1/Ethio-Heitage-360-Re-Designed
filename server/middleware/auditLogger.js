const AuditLog = require('../models/AuditLog');

/**
 * Audit Logger Middleware
 * Automatically logs all Super Admin actions for compliance and security
 */

const auditLogger = (action, options = {}) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.send;
    const originalJson = res.json;

    // Capture request information
    const requestInfo = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      method: req.method,
      timestamp: new Date()
    };

    // Capture response data
    let responseData = null;
    let statusCode = 200;
    let success = true;
    let errorMessage = null;

    // Override res.json to capture response
    res.json = function (data) {
      responseData = data;
      statusCode = res.statusCode;
      success = res.statusCode < 400;
      if (!success && data.message) {
        errorMessage = data.message;
      }
      return originalJson.call(this, data);
    };

    // Override res.send to capture response
    res.send = function (data) {
      responseData = data;
      statusCode = res.statusCode;
      success = res.statusCode < 400;
      return originalSend.call(this, data);
    };

    // Continue with the request
    next();

    // Log after response is sent
    res.on('finish', async () => {
      try {
        const responseTime = Date.now() - startTime;

        // Determine target entity from request
        let targetEntity = null;
        if (req.params.id) {
          targetEntity = {
            id: req.params.id,
            type: options.targetType || 'unknown'
          };
        }

        // Extract entity name if possible
        if (responseData && responseData.user) {
          targetEntity.name = responseData.user.name || responseData.user.email;
        } else if (responseData && responseData.museum) {
          targetEntity.name = responseData.museum.name;
        } else if (responseData && responseData.site) {
          targetEntity.name = responseData.site.name;
        }

        // Create audit log entry
        const auditEntry = new AuditLog({
          action: action,
          performedBy: req.user?._id,
          targetEntity: targetEntity,
          details: {
            description: options.description || `${action} performed via ${req.method} ${req.originalUrl}`,
            changes: options.changes || null,
            reason: req.body?.reason || options.reason || null,
            metadata: {
              requestBody: options.includeRequestBody ? req.body : null,
              queryParams: req.query,
              ...options.metadata
            }
          },
          requestInfo: requestInfo,
          result: {
            success: success,
            errorMessage: errorMessage,
            responseTime: responseTime,
            statusCode: statusCode
          },
          security: {
            riskLevel: options.riskLevel || 'low',
            requiresReview: options.requiresReview || false,
            complianceFlags: options.complianceFlags || []
          },
          context: {
            sessionId: req.sessionID,
            correlationId: req.get('X-Correlation-ID'),
            tags: options.tags || [],
            notes: options.notes || null
          }
        });

        await auditEntry.save();

      } catch (error) {
        console.error('Audit logging error:', error);
        // Don't throw error to avoid breaking the main request
      }
    });
  };
};

/**
 * Specific audit loggers for common Super Admin actions
 */

// User management audit loggers
const auditUserCreation = auditLogger('user_created', {
  description: 'New user account created',
  targetType: 'user',
  riskLevel: 'medium'
});

const auditUserUpdate = auditLogger('user_updated', {
  description: 'User account updated',
  targetType: 'user',
  riskLevel: 'medium',
  includeRequestBody: true
});

const auditUserDeletion = auditLogger('user_deleted', {
  description: 'User account deleted',
  targetType: 'user',
  riskLevel: 'high',
  requiresReview: true
});

const auditUserVerification = auditLogger('user_verified', {
  description: 'User account verification status changed',
  targetType: 'user',
  riskLevel: 'medium'
});

// Museum management audit loggers
const auditMuseumApproval = auditLogger('museum_approved', {
  description: 'Museum registration approved',
  targetType: 'museum',
  riskLevel: 'medium'
});

const auditMuseumRejection = auditLogger('museum_rejected', {
  description: 'Museum registration rejected',
  targetType: 'museum',
  riskLevel: 'medium'
});

const auditMuseumSuspension = auditLogger('museum_suspended', {
  description: 'Museum account suspended',
  targetType: 'museum',
  riskLevel: 'high',
  requiresReview: true
});

// Heritage sites audit loggers
const auditHeritageSiteCreation = auditLogger('heritage_site_created', {
  description: 'Heritage site created',
  targetType: 'heritage_site',
  riskLevel: 'low'
});

const auditHeritageSiteUpdate = auditLogger('heritage_site_updated', {
  description: 'Heritage site updated',
  targetType: 'heritage_site',
  riskLevel: 'low'
});

const auditHeritageSiteDeletion = auditLogger('heritage_site_deleted', {
  description: 'Heritage site deleted',
  targetType: 'heritage_site',
  riskLevel: 'high',
  requiresReview: true
});

// Content moderation audit loggers
const auditArtifactApproval = auditLogger('artifact_approved', {
  description: 'Artifact approved for publication',
  targetType: 'artifact',
  riskLevel: 'low'
});

const auditArtifactRejection = auditLogger('artifact_rejected', {
  description: 'Artifact rejected',
  targetType: 'artifact',
  riskLevel: 'low'
});

// Rental system audit loggers
const auditRentalApproval = auditLogger('rental_approved', {
  description: 'Artifact rental approved',
  targetType: 'rental',
  riskLevel: 'medium'
});

const auditRentalRejection = auditLogger('rental_rejected', {
  description: 'Artifact rental rejected',
  targetType: 'rental',
  riskLevel: 'medium'
});

// System settings audit logger
const auditSystemSettingChange = auditLogger('system_setting_changed', {
  description: 'System setting modified',
  targetType: 'system_setting',
  riskLevel: 'high',
  requiresReview: true,
  complianceFlags: ['system_change']
});

// Bulk operations audit logger
const auditBulkOperation = auditLogger('bulk_operation', {
  description: 'Bulk operation performed',
  targetType: 'bulk_operation',
  riskLevel: 'medium',
  requiresReview: true
});

// Data export/import audit loggers
const auditDataExport = auditLogger('export_data', {
  description: 'Data exported',
  targetType: 'bulk_operation',
  riskLevel: 'medium',
  complianceFlags: ['data_export']
});

const auditDataImport = auditLogger('import_data', {
  description: 'Data imported',
  targetType: 'bulk_operation',
  riskLevel: 'medium',
  requiresReview: true,
  complianceFlags: ['data_import']
});

module.exports = {
  auditLogger,
  auditUserCreation,
  auditUserUpdate,
  auditUserDeletion,
  auditUserVerification,
  auditMuseumApproval,
  auditMuseumRejection,
  auditMuseumSuspension,
  auditHeritageSiteCreation,
  auditHeritageSiteUpdate,
  auditHeritageSiteDeletion,
  auditArtifactApproval,
  auditArtifactRejection,
  auditRentalApproval,
  auditRentalRejection,
  auditSystemSettingChange,
  auditBulkOperation,
  auditDataExport,
  auditDataImport
};
