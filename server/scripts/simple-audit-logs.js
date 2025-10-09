// This script adds simple audit logs with all required fields
const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

// Simple audit log data with all required fields
const sampleAuditLogs = [
  {
    action: 'user_created',
    performedBy: null, // Will be set to a real user ID
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
  }
];

const addSimpleAuditLogs = async () => {
  try {
    console.log('🌱 Adding simple audit logs...');

    // Get a super admin user to use as performedBy
    const superAdmin = await User.findOne({ role: 'superAdmin' });
    if (!superAdmin) {
      console.log('⚠️ No super admin user found, creating audit logs without user reference');
    }

    // Update sample data with real user ID
    const auditLogsToCreate = sampleAuditLogs.map(log => ({
      ...log,
      performedBy: superAdmin ? superAdmin._id : null
    }));

    // Create audit logs
    const createdLogs = await AuditLog.insertMany(auditLogsToCreate);
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

    console.log('\n🎉 Simple audit logs added successfully!');

  } catch (error) {
    console.error('❌ Error adding audit logs:', error);
  }
};

// Run the script
addSimpleAuditLogs().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});




