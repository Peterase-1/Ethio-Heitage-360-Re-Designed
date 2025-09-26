const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const SystemSettings = require('../models/SystemSettings');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethioheritage360', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const defaultSettings = [
  // General Settings
  {
    category: 'general',
    key: 'platform_name',
    value: 'EthioHeritage360',
    dataType: 'string',
    description: 'Platform name displayed throughout the application',
    isPublic: true
  },
  {
    category: 'general',
    key: 'platform_description',
    value: 'Discover and preserve Ethiopian cultural heritage through virtual museum experiences',
    dataType: 'string',
    description: 'Platform description for SEO and marketing',
    isPublic: true
  },
  {
    category: 'general',
    key: 'default_language',
    value: 'en',
    dataType: 'string',
    description: 'Default language for the platform',
    validation: {
      options: ['en', 'am', 'or', 'ti']
    },
    isPublic: true
  },
  {
    category: 'general',
    key: 'supported_languages',
    value: ['en', 'am', 'or', 'ti'],
    dataType: 'array',
    description: 'List of supported languages',
    isPublic: true
  },
  {
    category: 'general',
    key: 'timezone',
    value: 'Africa/Addis_Ababa',
    dataType: 'string',
    description: 'Default timezone for the platform',
    isPublic: false
  },

  // Branding Settings
  {
    category: 'branding',
    key: 'logo_url',
    value: '/assets/logo.png',
    dataType: 'string',
    description: 'URL to the platform logo',
    isPublic: true
  },
  {
    category: 'branding',
    key: 'favicon_url',
    value: '/assets/favicon.ico',
    dataType: 'string',
    description: 'URL to the platform favicon',
    isPublic: true
  },
  {
    category: 'branding',
    key: 'primary_color',
    value: '#2D5A87',
    dataType: 'string',
    description: 'Primary brand color (hex)',
    validation: {
      pattern: '^#[0-9A-Fa-f]{6}$'
    },
    isPublic: true
  },
  {
    category: 'branding',
    key: 'secondary_color',
    value: '#F4A261',
    dataType: 'string',
    description: 'Secondary brand color (hex)',
    validation: {
      pattern: '^#[0-9A-Fa-f]{6}$'
    },
    isPublic: true
  },
  {
    category: 'branding',
    key: 'accent_color',
    value: '#E76F51',
    dataType: 'string',
    description: 'Accent brand color (hex)',
    validation: {
      pattern: '^#[0-9A-Fa-f]{6}$'
    },
    isPublic: true
  },

  // Security Settings
  {
    category: 'security',
    key: 'password_min_length',
    value: 8,
    dataType: 'number',
    description: 'Minimum password length requirement',
    validation: {
      min: 6,
      max: 20
    },
    isPublic: true
  },
  {
    category: 'security',
    key: 'login_attempts_limit',
    value: 5,
    dataType: 'number',
    description: 'Maximum login attempts before account lock',
    validation: {
      min: 3,
      max: 10
    },
    isPublic: false
  },
  {
    category: 'security',
    key: 'account_lock_duration',
    value: 30,
    dataType: 'number',
    description: 'Account lock duration in minutes',
    validation: {
      min: 5,
      max: 1440
    },
    isPublic: false
  },
  {
    category: 'security',
    key: 'session_timeout',
    value: 1440,
    dataType: 'number',
    description: 'Session timeout in minutes',
    validation: {
      min: 30,
      max: 10080
    },
    isPublic: false
  },
  {
    category: 'security',
    key: 'require_email_verification',
    value: true,
    dataType: 'boolean',
    description: 'Require email verification for new accounts',
    isPublic: true
  },

  // Notifications Settings
  {
    category: 'notifications',
    key: 'email_notifications_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Enable email notifications system-wide',
    isPublic: false
  },
  {
    category: 'notifications',
    key: 'push_notifications_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Enable push notifications system-wide',
    isPublic: false
  },
  {
    category: 'notifications',
    key: 'smtp_host',
    value: 'localhost',
    dataType: 'string',
    description: 'SMTP server host for email notifications',
    isPublic: false
  },
  {
    category: 'notifications',
    key: 'smtp_port',
    value: 587,
    dataType: 'number',
    description: 'SMTP server port',
    isPublic: false
  },

  // Features Settings
  {
    category: 'features',
    key: 'user_registration_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Allow new user registrations',
    isPublic: true
  },
  {
    category: 'features',
    key: 'museum_registration_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Allow new museum registrations',
    isPublic: true
  },
  {
    category: 'features',
    key: 'rental_system_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Enable artifact rental system',
    isPublic: true
  },
  {
    category: 'features',
    key: 'virtual_tours_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Enable virtual tour functionality',
    isPublic: true
  },
  {
    category: 'features',
    key: 'reviews_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Enable user reviews and ratings',
    isPublic: true
  },
  {
    category: 'features',
    key: 'social_sharing_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Enable social media sharing',
    isPublic: true
  },

  // API Settings
  {
    category: 'api',
    key: 'api_rate_limit',
    value: 100,
    dataType: 'number',
    description: 'API requests per 15 minutes per IP',
    validation: {
      min: 10,
      max: 1000
    },
    isPublic: false
  },
  {
    category: 'api',
    key: 'max_upload_size',
    value: 10,
    dataType: 'number',
    description: 'Maximum file upload size in MB',
    validation: {
      min: 1,
      max: 100
    },
    isPublic: true
  },

  // Analytics Settings
  {
    category: 'analytics',
    key: 'analytics_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Enable analytics tracking',
    isPublic: false
  },
  {
    category: 'analytics',
    key: 'data_retention_days',
    value: 365,
    dataType: 'number',
    description: 'Days to retain analytics data',
    validation: {
      min: 30,
      max: 2555
    },
    isPublic: false
  },

  // Visitor Dashboard Features
  {
    category: 'features',
    key: 'visitor_sidebar_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Enable visitor dashboard sidebar',
    isPublic: true
  },
  {
    category: 'features',
    key: 'visitor_notes_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Enable notes feature in visitor dashboard',
    isPublic: true
  },
  {
    category: 'features',
    key: 'visitor_goals_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Enable goals feature in visitor dashboard',
    isPublic: true
  },
  {
    category: 'features',
    key: 'visitor_flashcards_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Enable flashcards feature in visitor dashboard',
    isPublic: true
  },
  {
    category: 'features',
    key: 'visitor_analytics_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Enable analytics feature in visitor dashboard',
    isPublic: true
  },
  {
    category: 'features',
    key: 'visitor_achievements_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Enable achievements feature in visitor dashboard',
    isPublic: true
  },
  {
    category: 'features',
    key: 'visitor_activity_log_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Enable activity log feature in visitor dashboard',
    isPublic: true
  },
  {
    category: 'features',
    key: 'visitor_bookmarks_enabled',
    value: true,
    dataType: 'boolean',
    description: 'Enable bookmarks feature in visitor dashboard',
    isPublic: true
  },
  {
    category: 'features',
    key: 'visitor_sidebar_config',
    value: {
      notes: {
        enabled: true,
        icon: 'FaStickyNote',
        order: 1
      },
      goals: {
        enabled: true,
        icon: 'FaBullseye',
        order: 2
      },
      flashcards: {
        enabled: true,
        icon: 'FaGraduationCap',
        order: 3
      },
      analytics: {
        enabled: true,
        icon: 'FaChartLine',
        order: 4
      },
      achievements: {
        enabled: true,
        icon: 'FaTrophy',
        order: 5
      },
      activity: {
        enabled: true,
        icon: 'FaHistory',
        order: 6
      },
      bookmarks: {
        enabled: true,
        icon: 'FaBookmark',
        order: 7
      }
    },
    dataType: 'object',
    description: 'Configuration object for visitor sidebar features and their display order',
    isPublic: true
  },

  // Maintenance Settings
  {
    category: 'maintenance',
    key: 'maintenance_mode',
    value: false,
    dataType: 'boolean',
    description: 'Enable maintenance mode',
    isPublic: true
  },
  {
    category: 'maintenance',
    key: 'maintenance_message',
    value: 'We are currently performing maintenance. Please check back later.',
    dataType: 'string',
    description: 'Message displayed during maintenance mode',
    isPublic: true
  }
];

const seedSettings = async () => {
  console.log('Seeding system settings...');
  
  try {
    // Clear existing settings
    await SystemSettings.deleteMany({});
    
    // Insert default settings
    const settings = await SystemSettings.insertMany(defaultSettings.map(setting => ({
      ...setting,
      lastModifiedBy: null
    })));
    
    console.log(`✅ Successfully seeded ${settings.length} system settings`);
    
    return settings;
  } catch (error) {
    console.error('❌ Error seeding system settings:', error);
    throw error;
  }
};

const createSuperAdmin = async () => {
  console.log('Creating super admin user...');
  
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'superAdmin' });
    
    if (existingSuperAdmin) {
      console.log('⚠️ Super admin user already exists');
      return existingSuperAdmin;
    }

    // Create super admin user
    const superAdminData = {
      firstName: 'System',
      lastName: 'Administrator',
      name: 'System Administrator',
      email: 'admin@ethioheritage360.com',
      password: 'SuperAdmin123!',
      role: 'superAdmin',
      isActive: true,
      isVerified: true,
      bio: 'System Administrator with full platform access',
      permissions: [
        'manage_all_users', 'manage_all_museums', 'approve_museum_registrations',
        'manage_heritage_sites', 'view_platform_analytics', 'manage_system_settings',
        'approve_high_value_rentals', 'manage_api_keys', 'view_audit_logs'
      ],
      preferences: {
        language: 'en',
        notifications: {
          email: true,
          push: true
        }
      }
    };

    const superAdmin = new User(superAdminData);
    await superAdmin.save();
    
    console.log('✅ Super admin user created successfully');
    console.log(`📧 Email: ${superAdminData.email}`);
    console.log(`🔐 Password: ${superAdminData.password}`);
    console.log('⚠️ IMPORTANT: Change the default password after first login!');
    
    return superAdmin;
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    throw error;
  }
};

const main = async () => {
  try {
    console.log('🚀 Starting system initialization...\n');
    
    await connectDB();
    
    const settings = await seedSettings();
    const superAdmin = await createSuperAdmin();
    
    console.log('\n🎉 System initialization completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • System settings: ${settings.length} created`);
    console.log(`   • Super admin user: ${superAdmin ? 'Created' : 'Already exists'}`);
    
    console.log('\n🔗 Next steps:');
    console.log('   1. Start the server: npm run dev');
    console.log('   2. Login as super admin with the credentials above');
    console.log('   3. Change the default super admin password');
    console.log('   4. Configure additional settings as needed');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ System initialization failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  seedSettings,
  createSuperAdmin,
  defaultSettings
};
