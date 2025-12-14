const mongoose = require('mongoose');
const SecurityEvent = require('./models/SecurityEvent');
const UserSession = require('./models/UserSession');
const SecuritySettings = require('./models/SecuritySettings');
const User = require('./models/User');

async function seedSecurityData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethioheritage360');
    console.log('🔒 Seeding security data...');

    // Get a super admin user for createdBy
    const superAdmin = await User.findOne({ role: 'superAdmin' });
    const createdBy = superAdmin ? superAdmin._id : new mongoose.Types.ObjectId();

    // Clear existing security data
    console.log('🧹 Clearing existing security data...');
    await SecurityEvent.deleteMany({});
    await UserSession.deleteMany({});
    await SecuritySettings.deleteMany({});

    // Create security settings
    console.log('⚙️ Creating security settings...');
    const securitySettings = await SecuritySettings.create({
      twoFactorAuth: {
        enabled: true,
        requiredForAdmins: true,
        requiredForUsers: false
      },
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90,
        preventReuse: 5
      },
      sessionManagement: {
        timeout: 30,
        maxConcurrentSessions: 3,
        extendOnActivity: true
      },
      ipSecurity: {
        whitelist: [
          {
            ip: '192.168.1.0/24',
            description: 'Internal network',
            addedBy: createdBy
          }
        ],
        blacklist: [],
        maxFailedAttempts: 5,
        lockoutDuration: 15
      },
      apiSecurity: {
        rateLimiting: {
          enabled: true,
          requestsPerMinute: 100,
          requestsPerHour: 1000
        },
        apiKeyExpiration: 365,
        requireApiKeyForSensitive: true
      },
      dataSecurity: {
        encryption: {
          enabled: true,
          algorithm: 'AES-256-GCM'
        },
        backupFrequency: 'daily',
        backupRetention: 30,
        dataAnonymization: {
          enabled: false,
          retentionPeriod: 2555
        }
      },
      monitoring: {
        enableSecurityAlerts: true,
        alertThresholds: {
          failedLogins: 5,
          suspiciousActivity: 3,
          apiAbuse: 10
        },
        notificationChannels: [
          {
            type: 'email',
            config: { email: 'admin@ethioheritage360.com' }
          }
        ]
      },
      systemStatus: {
        sslCertificate: {
          valid: true,
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          lastChecked: new Date()
        },
        databaseEncryption: {
          enabled: true,
          lastVerified: new Date()
        },
        lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        nextBackup: new Date(Date.now() + 22 * 60 * 60 * 1000) // 22 hours from now
      },
      modifiedBy: createdBy
    });
    console.log('✅ Created security settings');

    // Create sample security events
    console.log('📊 Creating security events...');
    const securityEvents = [
      {
        eventType: 'login_failed',
        userEmail: 'unknown@user.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: { country: 'Ethiopia', city: 'Addis Ababa', region: 'Addis Ababa' },
        severity: 'medium',
        status: 'blocked',
        description: 'Failed login attempt with invalid credentials',
        metadata: { attempts: 3, lockoutDuration: 15 }
      },
      {
        eventType: 'login_success',
        userId: createdBy,
        ipAddress: '203.0.113.45',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        location: { country: 'Ethiopia', city: 'Addis Ababa', region: 'Addis Ababa' },
        severity: 'low',
        status: 'success',
        description: 'Successful admin login',
        metadata: { loginMethod: 'password', twoFactorUsed: true }
      },
      {
        eventType: 'suspicious_activity',
        userEmail: 'suspicious@example.com',
        ipAddress: '198.51.100.42',
        userAgent: 'curl/7.68.0',
        location: { country: 'Unknown', city: 'Unknown', region: 'Unknown' },
        severity: 'high',
        status: 'blocked',
        description: 'Multiple rapid API requests detected',
        metadata: { requestCount: 150, timeWindow: '1 minute' }
      },
      {
        eventType: 'api_rate_limit_exceeded',
        userEmail: 'api.user@example.com',
        ipAddress: '203.0.113.100',
        userAgent: 'Python-requests/2.25.1',
        location: { country: 'Ethiopia', city: 'Addis Ababa', region: 'Addis Ababa' },
        severity: 'medium',
        status: 'blocked',
        description: 'API rate limit exceeded',
        metadata: { requestsPerMinute: 120, limit: 100 }
      },
      {
        eventType: 'configuration_change',
        userId: createdBy,
        ipAddress: '203.0.113.45',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        location: { country: 'Ethiopia', city: 'Addis Ababa', region: 'Addis Ababa' },
        severity: 'medium',
        status: 'success',
        description: 'Security settings updated',
        metadata: { changes: ['passwordPolicy', 'sessionManagement'] }
      },
      {
        eventType: 'system_backup',
        ipAddress: '127.0.0.1',
        userAgent: 'System/Backup',
        location: { country: 'Ethiopia', city: 'Addis Ababa', region: 'Addis Ababa' },
        severity: 'low',
        status: 'success',
        description: 'Automated system backup completed',
        metadata: { backupSize: '2.5GB', duration: '15 minutes' }
      },
      {
        eventType: 'unauthorized_access',
        userEmail: 'hacker@example.com',
        ipAddress: '198.51.100.99',
        userAgent: 'Mozilla/5.0 (compatible; Bot/1.0)',
        location: { country: 'Unknown', city: 'Unknown', region: 'Unknown' },
        severity: 'critical',
        status: 'blocked',
        description: 'Attempted unauthorized access to admin panel',
        metadata: { targetEndpoint: '/api/admin/users', blockedBy: 'IP_WHITELIST' }
      },
      {
        eventType: 'password_change',
        userId: createdBy,
        ipAddress: '203.0.113.45',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        location: { country: 'Ethiopia', city: 'Addis Ababa', region: 'Addis Ababa' },
        severity: 'low',
        status: 'success',
        description: 'Password changed successfully',
        metadata: { passwordStrength: 'strong', twoFactorUsed: true }
      }
    ];

    // Create events with different timestamps
    const now = new Date();
    for (let i = 0; i < securityEvents.length; i++) {
      const event = securityEvents[i];
      const eventDate = new Date(now.getTime() - (i * 2 * 60 * 60 * 1000)); // 2 hours apart
      await SecurityEvent.create({
        ...event,
        createdAt: eventDate,
        updatedAt: eventDate
      });
    }
    console.log(`✅ Created ${securityEvents.length} security events`);

    // Create sample user sessions
    console.log('👥 Creating user sessions...');
    const users = await User.find({}).limit(5);
    const sessions = [];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const sessionCount = Math.floor(Math.random() * 3) + 1; // 1-3 sessions per user

      for (let j = 0; j < sessionCount; j++) {
        const session = await UserSession.create({
          userId: user._id,
          sessionId: `session_${user._id}_${j}_${Date.now()}`,
          ipAddress: `192.168.1.${100 + i}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: {
            country: 'Ethiopia',
            city: 'Addis Ababa',
            region: 'Addis Ababa',
            coordinates: { lat: 9.1450, lng: 38.7667 }
          },
          deviceInfo: {
            type: j === 0 ? 'Desktop' : 'Mobile',
            browser: 'Chrome',
            os: 'Windows 10',
            isMobile: j > 0
          },
          isActive: Math.random() > 0.2, // 80% active sessions
          lastActivity: new Date(Date.now() - Math.random() * 60 * 60 * 1000), // Random in last hour
          expiresAt: new Date(Date.now() + (30 + Math.random() * 30) * 60 * 1000), // 30-60 minutes from now
          loginMethod: 'password',
          metadata: { loginTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) }
        });
        sessions.push(session);
      }
    }
    console.log(`✅ Created ${sessions.length} user sessions`);

    console.log('\n🎉 Security data seeding completed!');
    console.log(`⚙️ Security Settings: 1`);
    console.log(`📊 Security Events: ${securityEvents.length}`);
    console.log(`👥 User Sessions: ${sessions.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding security data:', error);
    process.exit(1);
  }
}

seedSecurityData();




