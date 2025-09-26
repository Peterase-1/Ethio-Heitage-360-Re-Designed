#!/usr/bin/env node

/**
 * Setup script for Enhanced Community Features
 * This script helps initialize the database with sample data and configurations
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const { Post, Follow, Activity } = require('../models/Community');
const StudyGroup = require('../models/StudyGroup');

class CommunitySetup {
  constructor() {
    this.sampleUsers = [];
    this.samplePosts = [];
    this.sampleActivities = [];
  }

  async connectToDatabase() {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethiopian-heritage');
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error.message);
      process.exit(1);
    }
  }

  async createSampleUsers() {
    console.log('\n📝 Creating sample users...');
    
    const sampleUsers = [
      {
        name: 'Amara Tesfa',
        email: 'amara@example.com',
        password: 'password123',
        role: 'visitor',
        bio: 'Passionate about Ethiopian heritage and ancient history. Love exploring historical sites and learning about our rich culture.',
        preferences: {
          interests: ['heritage', 'history', 'culture', 'archaeology']
        },
        profile: {
          location: 'Addis Ababa, Ethiopia'
        }
      },
      {
        name: 'Dawit Mengistu',
        email: 'dawit@example.com',
        password: 'password123',
        role: 'visitor',
        bio: 'Museum curator and cultural researcher specializing in Ethiopian artifacts and traditional crafts.',
        preferences: {
          interests: ['museums', 'artifacts', 'traditional-crafts', 'culture']
        },
        profile: {
          location: 'Axum, Ethiopia'
        }
      },
      {
        name: 'Hana Solomon',
        email: 'hana@example.com',
        password: 'password123',
        role: 'visitor',
        bio: 'Student of Ethiopian linguistics and cultural studies. Interested in preserving our ancient languages.',
        preferences: {
          interests: ['language', 'culture', 'heritage', 'education']
        },
        profile: {
          location: 'Gondar, Ethiopia'
        }
      },
      {
        name: 'Getachew Alemu',
        email: 'getachew@example.com',
        password: 'password123',
        role: 'visitor',
        bio: 'Travel guide and heritage enthusiast. Love sharing the beauty of Ethiopian historical sites with visitors.',
        preferences: {
          interests: ['tourism', 'heritage-sites', 'history', 'culture']
        },
        profile: {
          location: 'Lalibela, Ethiopia'
        }
      },
      {
        name: 'Meron Tadesse',
        email: 'meron@example.com',
        password: 'password123',
        role: 'visitor',
        bio: 'Digital preservation specialist working on documenting Ethiopian cultural heritage for future generations.',
        preferences: {
          interests: ['digital-preservation', 'heritage', 'technology', 'culture']
        },
        profile: {
          location: 'Dire Dawa, Ethiopia'
        }
      }
    ];

    for (const userData of sampleUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          console.log(`⚠️  User ${userData.email} already exists, skipping...`);
          this.sampleUsers.push(existingUser);
          continue;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);

        // Create user
        const user = new User(userData);
        await user.save();
        this.sampleUsers.push(user);
        console.log(`✅ Created user: ${userData.name} (${userData.email})`);
      } catch (error) {
        console.error(`❌ Failed to create user ${userData.email}:`, error.message);
      }
    }

    console.log(`\n📊 Created ${this.sampleUsers.length} sample users`);
  }

  async createSampleFollows() {
    console.log('\n🔗 Creating sample follow relationships...');
    
    if (this.sampleUsers.length < 2) {
      console.log('⚠️  Not enough users to create follow relationships');
      return;
    }

    const followPairs = [
      [0, 1], // Amara follows Dawit
      [0, 2], // Amara follows Hana
      [1, 0], // Dawit follows Amara (mutual)
      [1, 2], // Dawit follows Hana
      [1, 3], // Dawit follows Getachew
      [2, 0], // Hana follows Amara (mutual)
      [2, 3], // Hana follows Getachew
      [2, 4], // Hana follows Meron
      [3, 1], // Getachew follows Dawit
      [3, 4], // Getachew follows Meron
      [4, 2], // Meron follows Hana
      [4, 3]  // Meron follows Getachew
    ];

    let followsCreated = 0;
    for (const [followerIndex, followingIndex] of followPairs) {
      if (followerIndex < this.sampleUsers.length && followingIndex < this.sampleUsers.length) {
        try {
          const existingFollow = await Follow.findOne({
            follower: this.sampleUsers[followerIndex]._id,
            following: this.sampleUsers[followingIndex]._id
          });

          if (!existingFollow) {
            await new Follow({
              follower: this.sampleUsers[followerIndex]._id,
              following: this.sampleUsers[followingIndex]._id
            }).save();
            followsCreated++;
          }
        } catch (error) {
          console.error('❌ Failed to create follow relationship:', error.message);
        }
      }
    }

    console.log(`✅ Created ${followsCreated} follow relationships`);
  }

  async createSamplePosts() {
    console.log('\n📝 Creating sample community posts...');
    
    const samplePosts = [
      {
        title: 'Amazing Discovery at Aksum',
        content: 'Just visited the incredible obelisks of Aksum! These ancient monuments continue to amaze me with their intricate carvings and historical significance. The craftsmanship of our ancestors is truly remarkable.',
        category: 'heritage-sites',
        tags: ['aksum', 'obelisks', 'ancient-history', 'monuments'],
        author: 0 // Amara
      },
      {
        title: 'New Ethiopian Artifacts Exhibition',
        content: 'Exciting news! Our museum is opening a new exhibition featuring recently discovered Ethiopian artifacts from the 4th century. These pieces showcase the rich trading history of the Aksumite Empire.',
        category: 'museums',
        tags: ['exhibition', 'artifacts', 'aksumite-empire', 'museums'],
        author: 1 // Dawit
      },
      {
        title: 'Ge\'ez Script Workshop Success',
        content: 'Had an amazing workshop on ancient Ge\'ez script today! It\'s fascinating how this ancient writing system continues to influence modern Ethiopian languages. Preserving our linguistic heritage is so important.',
        category: 'culture',
        tags: ['geez', 'ancient-script', 'linguistics', 'education'],
        author: 2 // Hana
      },
      {
        title: 'Lalibela Churches - A Spiritual Journey',
        content: 'Guided another group through the rock-hewn churches of Lalibela today. The spiritual energy and architectural mastery of these 12th-century churches never fails to move visitors to tears.',
        category: 'heritage-sites',
        tags: ['lalibela', 'churches', 'architecture', 'spirituality'],
        author: 3 // Getachew
      },
      {
        title: 'Digital Heritage Preservation Project',
        content: 'Making great progress on our digital heritage preservation initiative! We\'ve now digitally cataloged over 500 historical documents and artifacts, making them accessible to researchers worldwide.',
        category: 'general',
        tags: ['digital-preservation', 'technology', 'research', 'accessibility'],
        author: 4 // Meron
      }
    ];

    for (const postData of samplePosts) {
      try {
        if (postData.author < this.sampleUsers.length) {
          const post = new Post({
            title: postData.title,
            content: postData.content,
            category: postData.category,
            tags: postData.tags,
            author: this.sampleUsers[postData.author]._id
          });

          await post.save();
          this.samplePosts.push(post);
          console.log(`✅ Created post: "${postData.title}"`);

          // Create activity for post creation
          await new Activity({
            user: this.sampleUsers[postData.author]._id,
            type: 'post_created',
            entityType: 'post',
            entityId: post._id,
            entityName: post.title,
            isPublic: true
          }).save();
        }
      } catch (error) {
        console.error(`❌ Failed to create post "${postData.title}":`, error.message);
      }
    }

    console.log(`📊 Created ${this.samplePosts.length} sample posts`);
  }

  async createSampleActivities() {
    console.log('\n📊 Creating sample activities...');
    
    const activityTypes = [
      { type: 'course_completed', entityName: 'Introduction to Ethiopian History' },
      { type: 'heritage_explored', entityName: 'Harar Historic Town Visit' },
      { type: 'museum_visited', entityName: 'National Museum of Ethiopia' },
      { type: 'artifact_discovered', entityName: 'Ancient Pottery Fragment' },
      { type: 'quiz_passed', entityName: 'Ethiopian Culture Quiz' }
    ];

    let activitiesCreated = 0;
    for (let i = 0; i < this.sampleUsers.length; i++) {
      for (let j = 0; j < 2; j++) { // Create 2 activities per user
        const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        
        try {
          const activity = new Activity({
            user: this.sampleUsers[i]._id,
            type: activityType.type,
            entityType: 'general',
            entityId: this.sampleUsers[i]._id, // Generic entity
            entityName: activityType.entityName,
            isPublic: true,
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last week
          });

          await activity.save();
          activitiesCreated++;
        } catch (error) {
          console.error('❌ Failed to create activity:', error.message);
        }
      }
    }

    console.log(`✅ Created ${activitiesCreated} sample activities`);
  }

  async createSampleInteractions() {
    console.log('\n💬 Creating sample post interactions...');
    
    let interactionsCreated = 0;
    
    // Add likes to posts
    for (const post of this.samplePosts) {
      const numLikes = Math.floor(Math.random() * 4) + 1; // 1-4 likes per post
      const usersToLike = this.sampleUsers
        .filter(user => !user._id.equals(post.author)) // Don't like own posts
        .sort(() => Math.random() - 0.5)
        .slice(0, numLikes);

      for (const user of usersToLike) {
        post.likes.push({
          user: user._id,
          createdAt: new Date()
        });
        interactionsCreated++;
      }

      await post.save();
    }

    // Add comments to posts
    const sampleComments = [
      'This is absolutely fascinating!',
      'Thanks for sharing this amazing insight.',
      'I would love to visit this place someday.',
      'Your work is so important for preserving our heritage.',
      'This brings back memories of my own visit.',
      'Incredible craftsmanship from our ancestors!',
      'Keep up the great work documenting our history.'
    ];

    for (const post of this.samplePosts) {
      const numComments = Math.floor(Math.random() * 3) + 1; // 1-3 comments per post
      const usersToComment = this.sampleUsers
        .filter(user => !user._id.equals(post.author))
        .sort(() => Math.random() - 0.5)
        .slice(0, numComments);

      for (const user of usersToComment) {
        const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
        post.comments.push({
          user: user._id,
          content: randomComment,
          createdAt: new Date()
        });
        interactionsCreated++;
      }

      await post.save();
    }

    console.log(`✅ Created ${interactionsCreated} post interactions`);
  }

  async createSampleStudyGroup() {
    console.log('\n👥 Creating sample study group...');
    
    try {
      const groupData = {
        name: 'Ethiopian Heritage Explorers',
        description: 'A community for passionate learners exploring the rich heritage and history of Ethiopia. We share discoveries, plan visits to historical sites, and support each other\'s learning journey.',
        creator: this.sampleUsers[0]._id, // Amara creates the group
        category: 'heritage',
        tags: ['heritage', 'history', 'exploration', 'community'],
        maxMembers: 50,
        isPrivate: false,
        requiresApproval: false,
        settings: {
          allowInvites: true,
          allowFileSharing: true,
          enableNotifications: true
        },
        members: [
          { user: this.sampleUsers[0]._id, role: 'owner' },
          { user: this.sampleUsers[1]._id, role: 'moderator' },
          { user: this.sampleUsers[2]._id, role: 'member' },
          { user: this.sampleUsers[3]._id, role: 'member' }
        ]
      };

      const studyGroup = new StudyGroup(groupData);
      await studyGroup.save();
      console.log(`✅ Created study group: "${groupData.name}"`);
    } catch (error) {
      console.error('❌ Failed to create study group:', error.message);
    }
  }

  async displayStatistics() {
    console.log('\n📈 Community Statistics:');
    
    try {
      const stats = await Promise.all([
        User.countDocuments({ role: 'visitor' }),
        Post.countDocuments({ status: 'active' }),
        Follow.countDocuments({}),
        Activity.countDocuments({ isPublic: true }),
        StudyGroup.countDocuments({ status: 'active' })
      ]);

      console.log(`👥 Users: ${stats[0]}`);
      console.log(`📝 Posts: ${stats[1]}`);
      console.log(`🔗 Follows: ${stats[2]}`);
      console.log(`📊 Activities: ${stats[3]}`);
      console.log(`👥 Study Groups: ${stats[4]}`);
      
      // Calculate average interactions per post
      const posts = await Post.find({ status: 'active' });
      const totalLikes = posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);
      const totalComments = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);
      
      if (posts.length > 0) {
        console.log(`❤️  Average likes per post: ${(totalLikes / posts.length).toFixed(1)}`);
        console.log(`💬 Average comments per post: ${(totalComments / posts.length).toFixed(1)}`);
      }
    } catch (error) {
      console.error('❌ Failed to calculate statistics:', error.message);
    }
  }

  async runSetup() {
    console.log('🚀 Starting Enhanced Community Features Setup...\n');
    console.log('=' .repeat(60));

    try {
      await this.connectToDatabase();
      await this.createSampleUsers();
      await this.createSampleFollows();
      await this.createSamplePosts();
      await this.createSampleActivities();
      await this.createSampleInteractions();
      await this.createSampleStudyGroup();
      await this.displayStatistics();

      console.log('\n' + '=' .repeat(60));
      console.log('🎉 Setup completed successfully!');
      console.log('\nYou can now:');
      console.log('1. Start the server: npm run dev');
      console.log('2. Test the API endpoints');
      console.log('3. Run the test suite: node scripts/test-community-features.js');
      console.log('4. Explore the enhanced social features');
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
    } finally {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Command line options
const args = process.argv.slice(2);
const options = {
  clean: args.includes('--clean'),
  verbose: args.includes('--verbose')
};

if (options.clean) {
  console.log('⚠️  --clean flag detected. This will remove existing data!');
  // Add cleanup logic here if needed
}

// Run setup
if (require.main === module) {
  const setup = new CommunitySetup();
  setup.runSetup().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Setup error:', error);
    process.exit(1);
  });
}

module.exports = CommunitySetup;
