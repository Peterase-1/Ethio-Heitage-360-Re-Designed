// This script creates audit logs without requiring a database connection
const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');

// Simple audit log data with all required fields
const sampleAuditLogs = [
  {
    action: 'user_created',
    performedBy: null, // No user reference
    targetEntity: {
      type: 'user',
      id: null,
      name: 'New User'
    },
    details: {
      description: 'New user account created via admin panel',
      changes: { status: 'created' },
      reason: 'Admin panel user creation',
      metadata: { source: 'admin_panel' }
    },
    requestInfo: {
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      endpoint: '/api/admin/users',
      method: 'POST'
    },
    result: {
      success: true,
      message: 'User created successfully',
      statusCode: 201
    },
    security: {
      riskLevel: 'low',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'admin_panel',
      version: '1.0.0'
    },
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    action: 'museum_approved',
    performedBy: null,
    targetEntity: {
      type: 'museum',
      id: null,
      name: 'Ethiopian National Museum'
    },
    details: {
      description: 'Museum registration approved after review',
      changes: { status: 'approved' },
      reason: 'Complete documentation provided',
      metadata: { source: 'admin_panel' }
    },
    requestInfo: {
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      endpoint: '/api/admin/museums',
      method: 'PUT'
    },
    result: {
      success: true,
      message: 'Museum approved successfully',
      statusCode: 200
    },
    security: {
      riskLevel: 'medium',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'admin_panel',
      version: '1.0.0'
    },
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    action: 'museum_rejected',
    performedBy: null,
    targetEntity: {
      type: 'museum',
      id: null,
      name: 'Incomplete Museum Application'
    },
    details: {
      description: 'Museum registration rejected due to incomplete documentation',
      changes: { status: 'rejected' },
      reason: 'Missing required documents',
      metadata: { source: 'admin_panel' }
    },
    requestInfo: {
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      endpoint: '/api/admin/museums',
      method: 'PUT'
    },
    result: {
      success: true,
      message: 'Museum rejected successfully',
      statusCode: 200
    },
    security: {
      riskLevel: 'low',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'admin_panel',
      version: '1.0.0'
    },
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  },
  {
    action: 'heritage_site_created',
    performedBy: null,
    targetEntity: {
      type: 'heritage_site',
      id: null,
      name: 'Lalibela Rock Churches'
    },
    details: {
      description: 'New heritage site added to the system',
      changes: { status: 'created' },
      reason: 'UNESCO World Heritage Site',
      metadata: { source: 'admin_panel' }
    },
    requestInfo: {
      ipAddress: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      endpoint: '/api/admin/heritage-sites',
      method: 'POST'
    },
    result: {
      success: true,
      message: 'Heritage site created successfully',
      statusCode: 201
    },
    security: {
      riskLevel: 'low',
      ipAddress: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'admin_panel',
      version: '1.0.0'
    },
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
  },
  {
    action: 'artifact_approved',
    performedBy: null,
    targetEntity: {
      type: 'artifact',
      id: null,
      name: 'Lucy Fossil'
    },
    details: {
      description: 'Artifact submission approved for public display',
      changes: { status: 'approved' },
      reason: 'Authentic historical artifact',
      metadata: { source: 'admin_panel' }
    },
    requestInfo: {
      ipAddress: '192.168.1.104',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      endpoint: '/api/admin/artifacts',
      method: 'PUT'
    },
    result: {
      success: true,
      message: 'Artifact approved successfully',
      statusCode: 200
    },
    security: {
      riskLevel: 'medium',
      ipAddress: '192.168.1.104',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'admin_panel',
      version: '1.0.0'
    },
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  },
  {
    action: 'rental_approved',
    performedBy: null,
    targetEntity: {
      type: 'rental',
      id: null,
      name: 'Artifact Rental Request'
    },
    details: {
      description: 'Rental request approved for artifact loan',
      changes: { status: 'approved' },
      reason: 'Insurance coverage verified',
      metadata: { source: 'admin_panel' }
    },
    requestInfo: {
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      endpoint: '/api/admin/rentals',
      method: 'PUT'
    },
    result: {
      success: true,
      message: 'Rental approved successfully',
      statusCode: 200
    },
    security: {
      riskLevel: 'medium',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'admin_panel',
      version: '1.0.0'
    },
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
  },
  {
    action: 'rental_rejected',
    performedBy: null,
    targetEntity: {
      type: 'rental',
      id: null,
      name: 'Artifact Rental Request'
    },
    details: {
      description: 'Rental request rejected due to insufficient insurance coverage',
      changes: { status: 'rejected' },
      reason: 'Insurance coverage insufficient',
      metadata: { source: 'admin_panel' }
    },
    requestInfo: {
      ipAddress: '192.168.1.106',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      endpoint: '/api/admin/rentals',
      method: 'PUT'
    },
    result: {
      success: true,
      message: 'Rental rejected successfully',
      statusCode: 200
    },
    security: {
      riskLevel: 'low',
      ipAddress: '192.168.1.106',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'admin_panel',
      version: '1.0.0'
    },
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
  },
  {
    action: 'system_setting_changed',
    performedBy: null,
    targetEntity: {
      type: 'system_setting',
      id: null,
      name: 'Email Configuration'
    },
    details: {
      description: 'System configuration updated - email settings modified',
      changes: { setting: 'email_config' },
      reason: 'System maintenance',
      metadata: { source: 'admin_panel' }
    },
    requestInfo: {
      ipAddress: '192.168.1.107',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      endpoint: '/api/admin/settings',
      method: 'PUT'
    },
    result: {
      success: true,
      message: 'Settings updated successfully',
      statusCode: 200
    },
    security: {
      riskLevel: 'high',
      ipAddress: '192.168.1.107',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'admin_panel',
      version: '1.0.0'
    },
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
  },
  {
    action: 'bulk_operation',
    performedBy: null,
    targetEntity: {
      type: 'bulk_operation',
      id: null,
      name: 'Bulk User Verification'
    },
    details: {
      description: 'Bulk user verification completed - 25 users verified',
      changes: { count: 25 },
      reason: 'Regular verification process',
      metadata: { source: 'admin_panel' }
    },
    requestInfo: {
      ipAddress: '192.168.1.108',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      endpoint: '/api/admin/users/bulk',
      method: 'POST'
    },
    result: {
      success: true,
      message: 'Bulk operation completed successfully',
      statusCode: 200
    },
    security: {
      riskLevel: 'medium',
      ipAddress: '192.168.1.108',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'admin_panel',
      version: '1.0.0'
    },
    timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) // 9 days ago
  },
  {
    action: 'export_data',
    performedBy: null,
    targetEntity: {
      type: 'bulk_operation',
      id: null,
      name: 'Data Export'
    },
    details: {
      description: 'User data exported to CSV for analysis',
      changes: { format: 'CSV' },
      reason: 'Data analysis request',
      metadata: { source: 'admin_panel' }
    },
    requestInfo: {
      ipAddress: '192.168.1.109',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      endpoint: '/api/admin/export',
      method: 'GET'
    },
    result: {
      success: true,
      message: 'Data exported successfully',
      statusCode: 200
    },
    security: {
      riskLevel: 'high',
      ipAddress: '192.168.1.109',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'admin_panel',
      version: '1.0.0'
    },
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
  }
];

const createSimpleAuditLogs = async () => {
  try {
    console.log('🌱 Creating simple audit logs...');

    // Create audit logs
    const createdLogs = await AuditLog.insertMany(sampleAuditLogs);
    console.log(`✅ Created ${createdLogs.length} audit logs`);

    // Display summary
    const actionCounts = {};
    createdLogs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });

    console.log('\n📊 Audit Logs Summary:');
    Object.entries(actionCounts).forEach(([action, count]) => {
      console.log(`  ${action}: ${count}`);
    });

    console.log('\n🎉 Simple audit logs created successfully!');

  } catch (error) {
    console.error('❌ Error creating audit logs:', error);
  }
};

// Run the script
createSimpleAuditLogs().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});




