const mongoose = require('mongoose');
const SystemSettings = require('./models/SystemSettings');
const User = require('./models/User');

async function seedSystemSettings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethioheritage360');
    console.log('⚙️ Seeding system settings...');

    // Get a super admin user for createdBy
    const superAdmin = await User.findOne({ role: 'superAdmin' });
    const createdBy = superAdmin ? superAdmin._id : new mongoose.Types.ObjectId();

    // Clear existing system settings
    console.log('🧹 Clearing existing system settings...');
    await SystemSettings.deleteMany({});

    // Create comprehensive system settings
    console.log('⚙️ Creating system settings...');
    const systemSettings = await SystemSettings.create({
      platform: {
        name: 'Ethiopian Heritage 360',
        description: 'Digital platform for Ethiopian cultural heritage management and education',
        version: '1.0.0',
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'am', 'om'],
        maxUploadSize: 50,
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'mp4', 'avi', 'mov']
      },
      rentalSystem: {
        defaultRentalPeriod: 30,
        securityDepositPercentage: 20,
        lateFeePerDay: 100,
        maxRentalDuration: 90,
        autoApprovalThreshold: 7,
        requireInsurance: true
      },
      emailNotifications: {
        newUserRegistrations: true,
        artifactApprovals: true,
        rentalActivities: true,
        weeklyReports: false,
        systemAlerts: true,
        securityAlerts: true,
        maintenanceNotifications: true
      },
      security: {
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        lockoutDuration: 15,
        requireTwoFactor: false,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          maxAge: 90
        }
      },
      apiSettings: {
        rateLimitPerMinute: 100,
        rateLimitPerHour: 1000,
        apiKeyExpiration: 365,
        enableCORS: true,
        allowedOrigins: ['http://localhost:3000', 'http://localhost:5173', 'https://ethioheritage360.com']
      },
      maintenance: {
        enableMaintenanceMode: false,
        maintenanceMessage: 'System is under maintenance. Please try again later.',
        scheduledMaintenance: {
          enabled: false,
          frequency: 'monthly'
        },
        backupSettings: {
          frequency: 'daily',
          retentionDays: 30,
          autoBackup: true
        }
      },
      branding: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        logoUrl: '/assets/logo.png',
        faviconUrl: '/assets/favicon.ico'
      },
      analytics: {
        enableGoogleAnalytics: false,
        enableCustomAnalytics: true,
        trackUserBehavior: true,
        dataRetentionDays: 365
      },
      features: {
        enableVirtualMuseum: true,
        enableRentalSystem: true,
        enableEducationalContent: true,
        enableUserRegistration: true,
        enablePublicAPI: false,
        enableSocialLogin: false
      },
      modifiedBy: createdBy
    });

    console.log('✅ Created system settings');
    console.log('\n🎉 System settings seeding completed!');
    console.log(`⚙️ System Settings: 1`);
    console.log(`📊 Platform: ${systemSettings.platform.name}`);
    console.log(`🌐 Languages: ${systemSettings.platform.supportedLanguages.join(', ')}`);
    console.log(`🔧 Features: Virtual Museum, Rental System, Educational Content`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding system settings:', error);
    process.exit(1);
  }
}

seedSystemSettings();




