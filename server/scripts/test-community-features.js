const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const TEST_USER_TOKEN = process.env.TEST_USER_TOKEN || '';

// Test user credentials (you'll need to set these up first)
const testUsers = [
  {
    email: 'testuser1@example.com',
    password: 'testpassword123',
    name: 'Test User 1'
  },
  {
    email: 'testuser2@example.com', 
    password: 'testpassword123',
    name: 'Test User 2'
  }
];

class CommunityFeaturesTest {
  constructor() {
    this.tokens = {};
    this.testData = {};
  }

  // Helper method to make authenticated requests
  async makeRequest(method, endpoint, data = null, token = null) {
    try {
      const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`❌ ${method.toUpperCase()} ${endpoint}:`, error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  // Test user authentication
  async testAuthentication() {
    console.log('\n🔐 Testing Authentication...');
    
    for (const user of testUsers) {
      const result = await this.makeRequest('POST', '/auth/login', {
        email: user.email,
        password: user.password
      });

      if (result.success && result.data.token) {
        this.tokens[user.email] = result.data.token;
        console.log(`✅ Login successful for ${user.email}`);
      } else {
        console.log(`❌ Login failed for ${user.email}`);
        // Try registration if login fails
        const registerResult = await this.makeRequest('POST', '/auth/register', {
          name: user.name,
          email: user.email,
          password: user.password,
          role: 'visitor'
        });

        if (registerResult.success) {
          console.log(`✅ Registration successful for ${user.email}`);
          // Try login again
          const loginResult = await this.makeRequest('POST', '/auth/login', {
            email: user.email,
            password: user.password
          });
          if (loginResult.success) {
            this.tokens[user.email] = loginResult.data.token;
            console.log(`✅ Login after registration successful for ${user.email}`);
          }
        }
      }
    }
  }

  // Test Share Progress functionality
  async testShareProgress() {
    console.log('\n📤 Testing Share Progress...');
    const token = Object.values(this.tokens)[0];

    // Test sharing different types of progress
    const shareTests = [
      {
        name: 'Share Activity Progress',
        data: {
          activityType: 'course_completed',
          message: 'Just completed an amazing Ethiopian heritage course!',
          platforms: ['internal', 'twitter', 'facebook'],
          privacy: 'public'
        }
      },
      {
        name: 'Share Heritage Exploration',
        data: {
          activityType: 'heritage_explored',
          message: 'Discovered fascinating artifacts from ancient Ethiopia!',
          platforms: ['internal', 'linkedin'],
          privacy: 'public'
        }
      },
      {
        name: 'Share Museum Visit',
        data: {
          activityType: 'museum_visited',
          message: 'Had an incredible visit to the National Museum!',
          platforms: ['internal', 'whatsapp'],
          privacy: 'followers'
        }
      }
    ];

    for (const test of shareTests) {
      const result = await this.makeRequest('POST', '/community/share-progress', test.data, token);
      
      if (result.success) {
        console.log(`✅ ${test.name}: Shared successfully`);
        console.log(`   - Social links generated: ${Object.keys(result.data.socialLinks || {}).join(', ')}`);
        console.log(`   - Internal post created: ${result.data.sharedActivities?.[0]?.success ? 'Yes' : 'No'}`);
      } else {
        console.log(`❌ ${test.name}: Failed to share`);
      }
    }
  }

  // Test Find Friends functionality
  async testFindFriends() {
    console.log('\n👥 Testing Find Friends...');
    const token = Object.values(this.tokens)[0];

    // Test user search with different filters
    const searchTests = [
      {
        name: 'Basic Search',
        params: { search: 'test', page: 1, limit: 10 }
      },
      {
        name: 'Search with Filter - All',
        params: { search: 'user', filter: 'all', sortBy: 'recent' }
      },
      {
        name: 'Search with Interests',
        params: { search: 'test', interests: 'heritage,culture', sortBy: 'name' }
      }
    ];

    for (const test of searchTests) {
      const queryString = new URLSearchParams(test.params).toString();
      const result = await this.makeRequest('GET', `/community/find-friends?${queryString}`, null, token);
      
      if (result.success) {
        console.log(`✅ ${test.name}: Found ${result.data.data?.length || 0} users`);
        if (result.data.data?.[0]) {
          console.log(`   - Sample user: ${result.data.data[0].name} (${result.data.data[0].email})`);
          console.log(`   - Relationship status: Following=${result.data.data[0].relationshipStatus?.isFollowing}`);
        }
      } else {
        console.log(`❌ ${test.name}: Search failed`);
      }
    }
  }

  // Test Suggested Friends
  async testSuggestedFriends() {
    console.log('\n💡 Testing Suggested Friends...');
    const token = Object.values(this.tokens)[0];

    const result = await this.makeRequest('GET', '/community/users/suggested?page=1&limit=5', null, token);
    
    if (result.success) {
      console.log(`✅ Suggested Friends: Found ${result.data.data?.length || 0} suggestions`);
      result.data.data?.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} - ${user.suggestionMeta?.reason || 'No reason'}`);
        if (user.suggestionMeta?.mutualConnections?.length) {
          console.log(`      Mutual connections: ${user.suggestionMeta.mutualConnections.length}`);
        }
      });
    } else {
      console.log('❌ Suggested Friends: Failed to get suggestions');
    }
  }

  // Test Follow/Unfollow functionality
  async testFollowSystem() {
    console.log('\n🔗 Testing Follow System...');
    const tokens = Object.values(this.tokens);
    
    if (tokens.length < 2) {
      console.log('❌ Need at least 2 users to test follow system');
      return;
    }

    // Get user profiles to get user IDs
    const user1Profile = await this.makeRequest('GET', '/user/profile', null, tokens[0]);
    const user2Profile = await this.makeRequest('GET', '/user/profile', null, tokens[1]);

    if (!user1Profile.success || !user2Profile.success) {
      console.log('❌ Failed to get user profiles for follow test');
      return;
    }

    const user1Id = user1Profile.data.data.id;
    const user2Id = user2Profile.data.data.id;

    // Test follow
    const followResult = await this.makeRequest('POST', `/community/users/${user2Id}/follow`, null, tokens[0]);
    
    if (followResult.success) {
      console.log(`✅ Follow: User 1 successfully followed User 2`);
      console.log(`   - Following status: ${followResult.data.data.isFollowing}`);
      console.log(`   - Follower count: ${followResult.data.data.followerCount}`);

      // Test unfollow
      const unfollowResult = await this.makeRequest('POST', `/community/users/${user2Id}/follow`, null, tokens[0]);
      
      if (unfollowResult.success) {
        console.log(`✅ Unfollow: User 1 successfully unfollowed User 2`);
        console.log(`   - Following status: ${unfollowResult.data.data.isFollowing}`);
      } else {
        console.log('❌ Unfollow: Failed to unfollow user');
      }
    } else {
      console.log('❌ Follow: Failed to follow user');
    }
  }

  // Test Community Posts
  async testCommunityPosts() {
    console.log('\n📝 Testing Community Posts...');
    const token = Object.values(this.tokens)[0];

    // Test creating posts
    const postData = {
      title: 'Exploring Ethiopian Heritage',
      content: 'Just discovered amazing historical sites in Aksum! The obelisks are incredible and tell such a rich story of our ancient civilization.',
      category: 'heritage-sites',
      tags: ['aksum', 'obelisks', 'history', 'heritage']
    };

    const createResult = await this.makeRequest('POST', '/community/posts', postData, token);
    
    if (createResult.success) {
      console.log(`✅ Post Created: "${createResult.data.data.title}"`);
      this.testData.postId = createResult.data.data._id;

      // Test liking the post
      const likeResult = await this.makeRequest('POST', `/community/posts/${this.testData.postId}/like`, null, token);
      
      if (likeResult.success) {
        console.log(`✅ Post Like: Successfully liked post (${likeResult.data.data.likesCount} likes)`);
      }

      // Test commenting on the post
      const commentResult = await this.makeRequest('POST', `/community/posts/${this.testData.postId}/comments`, {
        content: 'This is fascinating! I would love to visit Aksum soon.'
      }, token);
      
      if (commentResult.success) {
        console.log(`✅ Comment Added: Successfully commented on post`);
      }
    } else {
      console.log('❌ Post Creation: Failed to create post');
    }

    // Test getting posts
    const getPostsResult = await this.makeRequest('GET', '/community/posts?page=1&limit=5&sortBy=recent', null, token);
    
    if (getPostsResult.success) {
      console.log(`✅ Get Posts: Retrieved ${getPostsResult.data.data.posts?.length || 0} posts`);
    }
  }

  // Test Study Groups
  async testStudyGroups() {
    console.log('\n👥 Testing Study Groups...');
    const token = Object.values(this.tokens)[0];

    // Test creating a study group
    const groupData = {
      name: 'Ethiopian Heritage Explorers',
      description: 'A group for enthusiasts exploring Ethiopian cultural heritage and history.',
      category: 'heritage',
      tags: ['heritage', 'culture', 'history', 'exploration'],
      maxMembers: 25,
      isPrivate: false,
      requiresApproval: false
    };

    const createGroupResult = await this.makeRequest('POST', '/community/study-groups', groupData, token);
    
    if (createGroupResult.success) {
      console.log(`✅ Study Group Created: "${createGroupResult.data.data.name}"`);
      this.testData.groupId = createGroupResult.data.data._id;

      // Test getting study groups
      const getGroupsResult = await this.makeRequest('GET', '/community/study-groups?page=1&limit=5', null, token);
      
      if (getGroupsResult.success) {
        console.log(`✅ Get Study Groups: Retrieved ${getGroupsResult.data.data?.length || 0} groups`);
      }

      // Test joining group with second user
      if (Object.values(this.tokens).length > 1) {
        const joinResult = await this.makeRequest('POST', `/community/study-groups/${this.testData.groupId}/join`, {}, Object.values(this.tokens)[1]);
        
        if (joinResult.success) {
          console.log(`✅ Join Group: Second user successfully joined group`);
        }
      }
    } else {
      console.log('❌ Study Group Creation: Failed to create group');
    }
  }

  // Test Activity Feed
  async testActivityFeed() {
    console.log('\n📊 Testing Activity Feed...');
    const token = Object.values(this.tokens)[0];

    const result = await this.makeRequest('GET', '/community/activity?page=1&limit=10', null, token);
    
    if (result.success) {
      console.log(`✅ Activity Feed: Retrieved ${result.data.data.activities?.length || 0} activities`);
      result.data.data.activities?.slice(0, 3).forEach((activity, index) => {
        console.log(`   ${index + 1}. ${activity.user?.name || 'Unknown'} - ${activity.type} (${activity.entityName || 'N/A'})`);
      });
    } else {
      console.log('❌ Activity Feed: Failed to retrieve activities');
    }
  }

  // Test Community Stats
  async testCommunityStats() {
    console.log('\n📈 Testing Community Stats...');
    const token = Object.values(this.tokens)[0];

    const result = await this.makeRequest('GET', '/community/stats', null, token);
    
    if (result.success) {
      console.log(`✅ Community Stats: Retrieved successfully`);
      const stats = result.data.data;
      console.log(`   - Total Members: ${stats.totalMembers || 0}`);
      console.log(`   - Active Discussions: ${stats.activeDiscussions || 0}`);
      console.log(`   - Study Groups: ${stats.studyGroups || 0}`);
      console.log(`   - Online Users: ${stats.onlineUsers || 0}`);
    } else {
      console.log('❌ Community Stats: Failed to retrieve stats');
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Community Features Tests...\n');
    console.log('=' .repeat(50));

    try {
      await this.testAuthentication();
      
      if (Object.keys(this.tokens).length === 0) {
        console.log('❌ No valid tokens obtained. Cannot proceed with tests.');
        return;
      }

      await this.testShareProgress();
      await this.testFindFriends();
      await this.testSuggestedFriends();
      await this.testFollowSystem();
      await this.testCommunityPosts();
      await this.testStudyGroups();
      await this.testActivityFeed();
      await this.testCommunityStats();

      console.log('\n' + '=' .repeat(50));
      console.log('🎉 All tests completed!');
      
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
    }
  }
}

// Run tests
if (require.main === module) {
  const tester = new CommunityFeaturesTest();
  tester.runAllTests().then(() => {
    console.log('Test suite finished.');
    process.exit(0);
  }).catch(error => {
    console.error('Test suite error:', error);
    process.exit(1);
  });
}

module.exports = CommunityFeaturesTest;
