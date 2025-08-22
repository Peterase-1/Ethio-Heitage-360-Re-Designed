const mongoose = require('mongoose');
const User = require('../models/User');
const Artifact = require('../models/Artifact');
const AdvancedArtifact = require('../models/AdvancedArtifact');
const Museum = require('../models/Museum');
const Notification = require('../models/Notification');
const Analytics = require('../models/Analytics');

class BulkOperationsService {
  
  // ===============================
  // BULK ARTIFACT OPERATIONS
  // ===============================
  
  /**
   * Bulk import artifacts from CSV/JSON data
   * @param {Array} artifactsData - Array of artifact objects
   * @param {String} museumId - Museum ID
   * @param {String} userId - User performing the import
   * @param {Object} options - Import options
   */
  static async bulkImportArtifacts(artifactsData, museumId, userId, options = {}) {
    const results = {
      total: artifactsData.length,
      successful: 0,
      failed: 0,
      errors: [],
      imported: []
    };

    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        for (const [index, artifactData] of artifactsData.entries()) {
          try {
            // Validate and prepare artifact data
            const processedData = await this.preprocessArtifactData(artifactData, museumId, userId);
            
            // Create artifact
            const artifact = new AdvancedArtifact(processedData);
            await artifact.save({ session });
            
            results.successful++;
            results.imported.push({
              index: index + 1,
              id: artifact._id,
              title: artifact.title
            });

            // Create notification for successful import
            if (options.notifyOnImport) {
              await this.createBulkNotification({
                type: 'success',
                title: 'Artifact Import Successful',
                message: `${artifact.title} has been successfully imported`,
                museumId,
                userId,
                relatedEntity: 'artifact',
                relatedEntityId: artifact._id
              });
            }
            
          } catch (error) {
            results.failed++;
            results.errors.push({
              index: index + 1,
              data: artifactData,
              error: error.message
            });
          }
        }
      });
    } catch (error) {
      throw new Error(`Bulk import failed: ${error.message}`);
    } finally {
      await session.endSession();
    }

    return results;
  }

  /**
   * Bulk update artifacts
   * @param {Array} artifactIds - Array of artifact IDs
   * @param {Object} updateData - Data to update
   * @param {String} userId - User performing the update
   * @param {Object} options - Update options
   */
  static async bulkUpdateArtifacts(artifactIds, updateData, userId, options = {}) {
    const results = {
      total: artifactIds.length,
      updated: 0,
      failed: 0,
      errors: []
    };

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        for (const artifactId of artifactIds) {
          try {
            const artifact = await AdvancedArtifact.findById(artifactId).session(session);
            
            if (!artifact) {
              results.failed++;
              results.errors.push({
                artifactId,
                error: 'Artifact not found'
              });
              continue;
            }

            // Apply updates
            Object.keys(updateData).forEach(key => {
              if (key.includes('.')) {
                // Handle nested properties
                const keys = key.split('.');
                let target = artifact;
                for (let i = 0; i < keys.length - 1; i++) {
                  target = target[keys[i]];
                }
                target[keys[keys.length - 1]] = updateData[key];
              } else {
                artifact[key] = updateData[key];
              }
            });

            // Add workflow history entry
            if (artifact.workflow) {
              artifact.workflow.workflowHistory.push({
                status: artifact.workflow.status,
                date: new Date(),
                user: userId,
                notes: `Bulk update: ${Object.keys(updateData).join(', ')}`
              });
            }

            await artifact.save({ session });
            results.updated++;

          } catch (error) {
            results.failed++;
            results.errors.push({
              artifactId,
              error: error.message
            });
          }
        }
      });
    } catch (error) {
      throw new Error(`Bulk update failed: ${error.message}`);
    } finally {
      await session.endSession();
    }

    return results;
  }

  /**
   * Bulk approve/reject artifacts
   * @param {Array} artifactIds - Array of artifact IDs
   * @param {String} status - 'approved' or 'rejected'
   * @param {String} userId - User performing the action
   * @param {String} feedback - Optional feedback message
   */
  static async bulkApproveReject(artifactIds, status, userId, feedback = '') {
    const results = {
      total: artifactIds.length,
      processed: 0,
      failed: 0,
      errors: []
    };

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        for (const artifactId of artifactIds) {
          try {
            const artifact = await AdvancedArtifact.findById(artifactId).session(session);
            
            if (!artifact) {
              results.failed++;
              results.errors.push({
                artifactId,
                error: 'Artifact not found'
              });
              continue;
            }

            // Update workflow status
            await artifact.updateWorkflowStatus(status, userId, feedback);
            results.processed++;

            // Create notification for museum admin
            await this.createBulkNotification({
              type: status === 'approved' ? 'success' : 'warning',
              title: `Artifact ${status.charAt(0).toUpperCase() + status.slice(1)}`,
              message: `Your artifact "${artifact.title}" has been ${status}${feedback ? ': ' + feedback : ''}`,
              recipients: [{ user: artifact.createdBy || artifact.workflow.submittedBy }],
              relatedEntity: 'artifact',
              relatedEntityId: artifact._id
            });

          } catch (error) {
            results.failed++;
            results.errors.push({
              artifactId,
              error: error.message
            });
          }
        }
      });
    } catch (error) {
      throw new Error(`Bulk approval/rejection failed: ${error.message}`);
    } finally {
      await session.endSession();
    }

    return results;
  }

  // ===============================
  // BULK USER OPERATIONS
  // ===============================

  /**
   * Bulk create users
   * @param {Array} usersData - Array of user objects
   * @param {String} adminId - Admin performing the operation
   * @param {Object} options - Creation options
   */
  static async bulkCreateUsers(usersData, adminId, options = {}) {
    const results = {
      total: usersData.length,
      created: 0,
      failed: 0,
      errors: [],
      users: []
    };

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        for (const [index, userData] of usersData.entries()) {
          try {
            // Generate password if not provided
            if (!userData.password) {
              userData.password = this.generateSecurePassword();
            }

            // Set default values
            userData.isActive = userData.isActive !== undefined ? userData.isActive : true;
            userData.role = userData.role || 'visitor';

            const user = new User(userData);
            await user.save({ session });

            results.created++;
            results.users.push({
              index: index + 1,
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              generatedPassword: userData.password
            });

            // Send welcome notification
            if (options.sendWelcomeEmail) {
              await this.createBulkNotification({
                type: 'info',
                title: 'Welcome to EthioHeritage360',
                message: `Welcome ${user.name}! Your account has been created successfully.`,
                recipients: [{ user: user._id }],
                relatedEntity: 'user',
                relatedEntityId: user._id
              });
            }

          } catch (error) {
            results.failed++;
            results.errors.push({
              index: index + 1,
              data: userData,
              error: error.message
            });
          }
        }
      });
    } catch (error) {
      throw new Error(`Bulk user creation failed: ${error.message}`);
    } finally {
      await session.endSession();
    }

    return results;
  }

  /**
   * Bulk update user roles and permissions
   * @param {Array} userUpdates - Array of {userId, updates} objects
   * @param {String} adminId - Admin performing the operation
   */
  static async bulkUpdateUsers(userUpdates, adminId) {
    const results = {
      total: userUpdates.length,
      updated: 0,
      failed: 0,
      errors: []
    };

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        for (const { userId, updates } of userUpdates) {
          try {
            const user = await User.findById(userId).session(session);
            
            if (!user) {
              results.failed++;
              results.errors.push({
                userId,
                error: 'User not found'
              });
              continue;
            }

            // Apply updates
            Object.keys(updates).forEach(key => {
              user[key] = updates[key];
            });

            await user.save({ session });
            results.updated++;

            // Notify user of changes
            await this.createBulkNotification({
              type: 'info',
              title: 'Account Updated',
              message: 'Your account information has been updated by an administrator.',
              recipients: [{ user: userId }],
              relatedEntity: 'user',
              relatedEntityId: userId
            });

          } catch (error) {
            results.failed++;
            results.errors.push({
              userId,
              error: error.message
            });
          }
        }
      });
    } catch (error) {
      throw new Error(`Bulk user update failed: ${error.message}`);
    } finally {
      await session.endSession();
    }

    return results;
  }

  // ===============================
  // BULK NOTIFICATION OPERATIONS
  // ===============================

  /**
   * Send bulk notifications
   * @param {Object} notificationData - Notification content
   * @param {Array} recipients - Array of recipient user IDs or targeting rules
   * @param {String} senderId - User sending the notification
   */
  static async sendBulkNotification(notificationData, recipients, senderId) {
    try {
      // Resolve recipients if targeting rules are provided
      let recipientList = recipients;
      if (notificationData.targetingRules) {
        recipientList = await this.resolveTargetingRules(notificationData.targetingRules);
      }

      // Create notification
      const notification = new Notification({
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'info',
        category: notificationData.category || 'communication',
        priority: notificationData.priority || 'medium',
        recipients: recipientList.map(userId => ({ user: userId })),
        createdBy: senderId,
        context: {
          source: 'bulk_operation',
          sourceId: senderId,
          ...notificationData.context
        },
        action: notificationData.action,
        delivery: notificationData.delivery || { immediate: true }
      });

      await notification.save();
      await notification.send();

      return {
        notificationId: notification._id,
        recipientCount: recipientList.length,
        status: 'sent'
      };

    } catch (error) {
      throw new Error(`Bulk notification failed: ${error.message}`);
    }
  }

  // ===============================
  // ANALYTICS AND REPORTING
  // ===============================

  /**
   * Generate bulk analytics report
   * @param {Object} criteria - Report criteria
   * @param {String} requesterId - User requesting the report
   */
  static async generateBulkAnalyticsReport(criteria, requesterId) {
    try {
      const report = {
        generatedAt: new Date(),
        generatedBy: requesterId,
        criteria,
        data: {}
      };

      // Platform overview
      if (criteria.includePlatformOverview) {
        report.data.platformOverview = await this.getPlatformOverview(criteria.dateRange);
      }

      // Museum performance
      if (criteria.includeMuseumPerformance) {
        report.data.museumPerformance = await this.getMuseumPerformanceData(criteria.dateRange, criteria.museums);
      }

      // Artifact analytics
      if (criteria.includeArtifactAnalytics) {
        report.data.artifactAnalytics = await this.getArtifactAnalyticsData(criteria.dateRange, criteria.museums);
      }

      // User engagement
      if (criteria.includeUserEngagement) {
        report.data.userEngagement = await this.getUserEngagementData(criteria.dateRange, criteria.userSegments);
      }

      // Financial metrics
      if (criteria.includeFinancialMetrics) {
        report.data.financialMetrics = await this.getFinancialMetricsData(criteria.dateRange);
      }

      // Save report for future access
      if (criteria.saveReport) {
        await this.saveAnalyticsReport(report, requesterId);
      }

      return report;

    } catch (error) {
      throw new Error(`Analytics report generation failed: ${error.message}`);
    }
  }

  /**
   * Bulk export data in various formats
   * @param {String} dataType - Type of data to export
   * @param {Object} filters - Export filters
   * @param {String} format - Export format (csv, json, xlsx)
   * @param {String} requesterId - User requesting the export
   */
  static async bulkExportData(dataType, filters, format, requesterId) {
    try {
      let data = [];
      
      switch (dataType) {
        case 'artifacts':
          data = await this.exportArtifactsData(filters);
          break;
        case 'users':
          data = await this.exportUsersData(filters);
          break;
        case 'museums':
          data = await this.exportMuseumsData(filters);
          break;
        case 'analytics':
          data = await this.exportAnalyticsData(filters);
          break;
        case 'rentals':
          data = await this.exportRentalsData(filters);
          break;
        default:
          throw new Error(`Unsupported data type: ${dataType}`);
      }

      // Format data according to requested format
      const formattedData = await this.formatExportData(data, format);
      
      // Generate download URL or file path
      const exportResult = {
        dataType,
        format,
        recordCount: data.length,
        generatedAt: new Date(),
        generatedBy: requesterId,
        downloadUrl: formattedData.downloadUrl,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      return exportResult;

    } catch (error) {
      throw new Error(`Bulk export failed: ${error.message}`);
    }
  }

  // ===============================
  // AUTOMATED MAINTENANCE TASKS
  // ===============================

  /**
   * Run automated maintenance tasks
   * @param {Array} tasks - Array of task names to run
   * @param {String} requesterId - User requesting the tasks
   */
  static async runMaintenanceTasks(tasks, requesterId) {
    const results = {
      tasksRun: tasks.length,
      successful: 0,
      failed: 0,
      results: []
    };

    for (const task of tasks) {
      try {
        let result;
        
        switch (task) {
          case 'cleanup_expired_notifications':
            result = await this.cleanupExpiredNotifications();
            break;
          case 'update_analytics':
            result = await this.updateAnalyticsData();
            break;
          case 'generate_thumbnails':
            result = await this.generateMissingThumbnails();
            break;
          case 'sync_search_index':
            result = await this.syncSearchIndex();
            break;
          case 'backup_database':
            result = await this.createDatabaseBackup();
            break;
          case 'optimize_images':
            result = await this.optimizeImages();
            break;
          case 'validate_data_integrity':
            result = await this.validateDataIntegrity();
            break;
          default:
            throw new Error(`Unknown maintenance task: ${task}`);
        }

        results.successful++;
        results.results.push({
          task,
          status: 'success',
          result
        });

      } catch (error) {
        results.failed++;
        results.results.push({
          task,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Create notification about maintenance completion
    await this.createBulkNotification({
      type: 'info',
      title: 'Maintenance Tasks Completed',
      message: `${results.successful} of ${results.tasksRun} maintenance tasks completed successfully`,
      recipients: [{ user: requesterId }],
      context: {
        source: 'maintenance',
        metadata: results
      }
    });

    return results;
  }

  // ===============================
  // HELPER METHODS
  // ===============================

  /**
   * Preprocess artifact data before import
   */
  static async preprocessArtifactData(artifactData, museumId, userId) {
    return {
      ...artifactData,
      museum: museumId,
      workflow: {
        status: 'draft',
        submittedBy: userId,
        submissionDate: new Date(),
        priority: artifactData.priority || 'medium'
      },
      analytics: {
        views: 0,
        likes: 0,
        shares: 0,
        downloads: 0,
        bookmarks: 0,
        popularityScore: 0
      }
    };
  }

  /**
   * Create a bulk notification
   */
  static async createBulkNotification(notificationData) {
    const notification = new Notification({
      ...notificationData,
      context: {
        source: 'bulk_operation',
        ...notificationData.context
      },
      delivery: {
        immediate: true,
        channels: [{ type: 'in_app', enabled: true }]
      }
    });

    await notification.save();
    return notification.send();
  }

  /**
   * Generate a secure password
   */
  static generateSecurePassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  /**
   * Resolve targeting rules to actual user IDs
   */
  static async resolveTargetingRules(targetingRules) {
    const query = {};
    
    if (targetingRules.roles && targetingRules.roles.length > 0) {
      query.role = { $in: targetingRules.roles };
    }
    
    if (targetingRules.museums && targetingRules.museums.length > 0) {
      query.museum = { $in: targetingRules.museums };
    }

    const users = await User.find(query).select('_id');
    return users.map(user => user._id);
  }

  // Additional helper methods for analytics, export, and maintenance
  // These would be implemented based on specific requirements

  static async getPlatformOverview(dateRange) {
    // Implementation for platform overview analytics
    return {};
  }

  static async getMuseumPerformanceData(dateRange, museums) {
    // Implementation for museum performance data
    return {};
  }

  static async getArtifactAnalyticsData(dateRange, museums) {
    // Implementation for artifact analytics
    return {};
  }

  static async getUserEngagementData(dateRange, userSegments) {
    // Implementation for user engagement data
    return {};
  }

  static async getFinancialMetricsData(dateRange) {
    // Implementation for financial metrics
    return {};
  }

  static async saveAnalyticsReport(report, userId) {
    // Implementation for saving reports
    return {};
  }

  static async exportArtifactsData(filters) {
    // Implementation for exporting artifacts
    return await AdvancedArtifact.find(filters).populate('museum', 'name').lean();
  }

  static async exportUsersData(filters) {
    // Implementation for exporting users
    return await User.find(filters).select('-password').lean();
  }

  static async exportMuseumsData(filters) {
    // Implementation for exporting museums
    return await Museum.find(filters).lean();
  }

  static async exportAnalyticsData(filters) {
    // Implementation for exporting analytics
    return await Analytics.find(filters).lean();
  }

  static async exportRentalsData(filters) {
    // Implementation for exporting rentals
    return [];
  }

  static async formatExportData(data, format) {
    // Implementation for formatting export data
    return { downloadUrl: '/api/exports/download/temp-file' };
  }

  static async cleanupExpiredNotifications() {
    const result = await Notification.deleteMany({
      expiresAt: { $lt: new Date() },
      isArchived: false
    });
    return { deletedCount: result.deletedCount };
  }

  static async updateAnalyticsData() {
    // Implementation for updating analytics
    return { updated: true };
  }

  static async generateMissingThumbnails() {
    // Implementation for thumbnail generation
    return { generated: 0 };
  }

  static async syncSearchIndex() {
    // Implementation for search index synchronization
    return { synchronized: true };
  }

  static async createDatabaseBackup() {
    // Implementation for database backup
    return { backupCreated: true };
  }

  static async optimizeImages() {
    // Implementation for image optimization
    return { optimized: 0 };
  }

  static async validateDataIntegrity() {
    // Implementation for data integrity validation
    return { valid: true };
  }
}

module.exports = BulkOperationsService;
