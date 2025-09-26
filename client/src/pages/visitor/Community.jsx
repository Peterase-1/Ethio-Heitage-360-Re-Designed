import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  FaUsers, 
  FaComments, 
  FaTrophy, 
  FaUserFriends,
  FaShare,
  FaStar,
  FaFire,
  FaGlobe,
  FaPlus,
  FaHeart,
  FaRegHeart,
  FaReply,
  FaEye,
  FaClock,
  FaSearch,
  FaFilter,
  FaThumbsUp,
  FaComment,
  FaBookmark,
  FaPaperPlane
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [studyGroups, setStudyGroups] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeDiscussions: 0,
    studyGroups: 0,
    onlineUsers: 0
  });
  
  // Post creation state
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general', tags: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Load community data
  useEffect(() => {
    loadCommunityData();
  }, [activeTab]);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      
      // Load community stats
      const statsResponse = await axios.get(`${API_BASE_URL}/community/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
      
      // Load content based on active tab
      if (activeTab === 'posts') {
        await loadPosts();
      } else if (activeTab === 'groups') {
        await loadStudyGroups();
      } else if (activeTab === 'activity') {
        await loadActivityFeed();
      }
      
    } catch (error) {
      console.error('Error loading community data:', error);
      toast.error('Failed to load community data');
    } finally {
      setLoading(false);
    }
  };
  
  const loadPosts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/community/posts`, {
        params: {
          sortBy,
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          search: searchQuery || undefined,
          limit: 20
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setPosts(response.data.data.posts);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };
  
  const loadStudyGroups = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/community/study-groups`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setStudyGroups(response.data.data);
      }
    } catch (error) {
      console.error('Error loading study groups:', error);
    }
  };
  
  const loadActivityFeed = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/community/activity`, {
        headers: {
          Authorization: `Bearer ${localStorage.getToken()}`
        }
      });
      
      if (response.data.success) {
        setActivityFeed(response.data.data.activities);
      }
    } catch (error) {
      console.error('Error loading activity feed:', error);
    }
  };
  
  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content) {
      toast.error('Please fill in title and content');
      return;
    }
    
    try {
      const response = await axios.post(`${API_BASE_URL}/community/posts`, newPost, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        toast.success('Post created successfully!');
        setNewPost({ title: '', content: '', category: 'general', tags: [] });
        setShowCreatePost(false);
        loadPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };
  
  const handleLikePost = async (postId, isLiked) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/community/posts/${postId}/like`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        // Update local state
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId 
              ? { 
                  ...post, 
                  isLiked: response.data.data.isLiked,
                  likesCount: response.data.data.likesCount 
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FaGlobe className="text-indigo-600" />
                Community Hub
              </h1>
              <p className="text-gray-600 mt-2">Connect, learn, and share with fellow heritage enthusiasts</p>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{stats.totalMembers.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.onlineUsers}</div>
                <div className="text-sm text-gray-600">Online</div>
              </div>
            </div>
          </div>
        </div>

        {/* Community Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <FaUsers className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.totalMembers.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Members</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <FaComments className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.activeDiscussions}</div>
            <div className="text-sm text-gray-600">Active Discussions</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <FaUsers className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.studyGroups}</div>
            <div className="text-sm text-gray-600">Study Groups</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <FaFire className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.onlineUsers}</div>
            <div className="text-sm text-gray-600">Online Now</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'posts', label: 'Community Posts', icon: FaComments },
              { id: 'groups', label: 'Study Groups', icon: FaUsers },
              { id: 'activity', label: 'Activity Feed', icon: FaFire }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium ${
                  activeTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'posts' && (
              <div>
                {/* Posts Header */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">Community Discussions</h3>
                  <button
                    onClick={() => setShowCreatePost(!showCreatePost)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <FaPlus className="h-4 w-4" />
                    Create Post
                  </button>
                </div>
                
                {/* Create Post Form */}
                {showCreatePost && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <input
                      type="text"
                      placeholder="Post title..."
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg mb-3"
                    />
                    <textarea
                      placeholder="What's on your mind about Ethiopian heritage?"
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg mb-3 h-32 resize-none"
                    />
                    <div className="flex gap-3">
                      <select
                        value={newPost.category}
                        onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                        className="p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="general">General</option>
                        <option value="artifacts">Artifacts</option>
                        <option value="history">History</option>
                        <option value="culture">Culture</option>
                        <option value="heritage-sites">Heritage Sites</option>
                        <option value="museums">Museums</option>
                      </select>
                      <button
                        onClick={handleCreatePost}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <FaPaperPlane className="h-4 w-4" />
                        Post
                      </button>
                      <button
                        onClick={() => setShowCreatePost(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Posts List */}
                <div className="space-y-6">
                  {posts.map((post) => (
                    <div key={post._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <img
                          src={post.author.avatar || '/default-avatar.png'}
                          alt={post.author.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">{post.author.name}</h4>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              post.category === 'general' ? 'bg-gray-100 text-gray-800' :
                              post.category === 'artifacts' ? 'bg-amber-100 text-amber-800' :
                              post.category === 'history' ? 'bg-blue-100 text-blue-800' :
                              post.category === 'culture' ? 'bg-purple-100 text-purple-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {post.category}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                          <p className="text-gray-700 mb-4">{post.content}</p>
                          
                          {/* Post Actions */}
                          <div className="flex items-center gap-6">
                            <button
                              onClick={() => handleLikePost(post._id, post.isLiked)}
                              className={`flex items-center gap-2 ${
                                post.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                              }`}
                            >
                              {post.isLiked ? <FaHeart className="h-4 w-4" /> : <FaRegHeart className="h-4 w-4" />}
                              <span>{post.likesCount}</span>
                            </button>
                            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600">
                              <FaComment className="h-4 w-4" />
                              <span>{post.commentsCount}</span>
                            </button>
                            <button className="flex items-center gap-2 text-gray-500 hover:text-green-600">
                              <FaEye className="h-4 w-4" />
                              <span>{post.views || 0}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'groups' && (
              <div>
                <h3 className="text-xl font-semibold mb-6">Study Groups</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {studyGroups.map((group) => (
                    <div key={group._id} className="border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-lg mb-2">{group.name}</h4>
                      <p className="text-gray-600 mb-4">{group.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {group.membersCount || 0} members
                        </span>
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                          Join Group
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'activity' && (
              <div>
                <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {activityFeed.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={activity.user?.avatar || '/default-avatar.png'}
                        alt={activity.user?.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user?.name}</span>
                          {' '}{activity.type === 'post_created' ? 'created a new post' :
                               activity.type === 'comment_added' ? 'commented on a post' :
                               activity.type === 'user_followed' ? 'followed a user' :
                               activity.type === 'group_joined' ? 'joined a study group' :
                               'performed an action'}
                          {activity.entityName && (
                            <span className="text-indigo-600"> "{activity.entityName}"</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaStar className="text-yellow-500" />
            Recent Community Activity
          </h2>
          
          <div className="space-y-4">
            {[
              {
                user: 'Alemayehu T.',
                action: 'started a new discussion about "Ancient Axum Architecture"',
                time: '2 hours ago',
                type: 'discussion'
              },
              {
                user: 'Sara M.',
                action: 'joined the "Ethiopian Language Study Group"',
                time: '4 hours ago',
                type: 'group'
              },
              {
                user: 'Daniel K.',
                action: 'achieved "Heritage Explorer" badge',
                time: '6 hours ago',
                type: 'achievement'
              },
              {
                user: 'Meron A.',
                action: 'shared progress on "Ethiopian History Course"',
                time: '8 hours ago',
                type: 'progress'
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <FaUsers className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
