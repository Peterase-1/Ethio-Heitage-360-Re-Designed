// This script should be run from the server directory
// It will add sample audit logs to the database

const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

// Sample audit log data
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
    details: 'Museum registration approved after review',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    status: 'success',
    security: {
      riskLevel: 'medium',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'admin_panel',
      version: '1.0.0'
    }
  },
  {
    action: 'museum_rejected',
    details: 'Museum registration rejected due to incomplete documentation',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    status: 'success',
    security: {
      riskLevel: 'low',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'admin_panel',
      version: '1.0.0'
    }
  },
  {
    action: 'heritage_site_created',
    details: 'New heritage site added to the system',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    status: 'success',
    security: {
      riskLevel: 'low',
      ipAddress: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'admin_panel',
      version: '1.0.0'
    }
  },
  {
    action: 'artifact_approved',
    details: 'Artifact submission approved for public display',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    status: 'success',
    security: {
      riskLevel: 'medium',
      ipAddress: '192.168.1.104',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'admin_panel',
      version: '1.0.0'
    }
  },
  {
    action: 'rental_approved',
    details: 'Rental request approved for artifact loan',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    status: 'success',
    security: {
      riskLevel: 'medium',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'admin_panel',
      version: '1.0.0'
    }
  },
  {
    action: 'rental_rejected',
    details: 'Rental request rejected due to insufficient insurance coverage',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    status: 'success',
    security: {
      riskLevel: 'low',
      ipAddress: '192.168.1.106',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'admin_panel',
      version: '1.0.0'
    }
  },
  {
    action: 'system_setting_changed',
    details: 'System configuration updated - email settings modified',
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    status: 'success',
    security: {
      riskLevel: 'high',
      ipAddress: '192.168.1.107',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'admin_panel',
      version: '1.0.0'
    }
  },
  {
    action: 'bulk_operation',
    details: 'Bulk user verification completed - 25 users verified',
    timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
    status: 'success',
    security: {
      riskLevel: 'medium',
      ipAddress: '192.168.1.108',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'admin_panel',
      version: '1.0.0'
    }
  },
  {
    action: 'export_data',
    details: 'User data exported to CSV for analysis',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    status: 'success',
    security: {
      riskLevel: 'high',
      ipAddress: '192.168.1.109',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'admin_panel',
      version: '1.0.0'
    }
  },
  {
    action: 'user_updated',
    details: 'User profile updated - role changed from visitor to museumAdmin',
    timestamp: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000), // 11 days ago
    status: 'success',
    security: {
      riskLevel: 'medium',
      ipAddress: '192.168.1.110',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'admin_panel',
      version: '1.0.0'
    }
  },
  {
    action: 'login',
    details: 'Super Admin login successful',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    status: 'success',
    security: {
      riskLevel: 'low',
      ipAddress: '192.168.1.111',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'web_app',
      version: '1.0.0'
    }
  },
  {
    action: 'password_changed',
    details: 'User password changed via admin panel',
    timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000), // 13 days ago
    status: 'success',
    security: {
      riskLevel: 'medium',
      ipAddress: '192.168.1.112',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'admin_panel',
      version: '1.0.0'
    }
  },
  {
    action: 'role_changed',
    details: 'User role updated from museumAdmin to superAdmin',
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    status: 'success',
    security: {
      riskLevel: 'high',
      ipAddress: '192.168.1.113',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'admin_panel',
      version: '1.0.0'
    }
  },
  {
    action: 'heritage_site_updated',
    details: 'Heritage site information updated - UNESCO status added',
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    status: 'success',
    security: {
      riskLevel: 'low',
      ipAddress: '192.168.1.114',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    metadata: {
      source: 'admin_panel',
      version: '1.0.0'
    }
  }
];

const addSampleAuditLogs = async () => {
  try {
    console.log('🌱 Adding sample audit logs...');

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

    console.log('\n🎉 Sample audit logs added successfully!');

  } catch (error) {
    console.error('❌ Error adding audit logs:', error);
  }
};

// Run the script
addSampleAuditLogs().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
