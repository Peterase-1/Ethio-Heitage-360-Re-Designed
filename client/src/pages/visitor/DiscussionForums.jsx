import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  FaComments, 
  FaPlus, 
  FaSearch, 
  FaFilter,
  FaReply,
  FaHeart,
  FaBell,
  FaEye,
  FaClock,
  FaUser,
  FaTags,
  FaPaperPlane,
  FaSpinner,
  FaThumbsUp,
  FaStar,
  FaPin,
  FaLock,
  FaSort,
  FaCommentAlt,
  FaUserCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const DiscussionForums = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [newPost, setNewPost] = useState('');
  const [newTopic, setNewTopic] = useState({
    title: '',
    description: '',
    category: 'general',
    tags: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'general', label: 'General Discussion' },
    { value: 'heritage-discussion', label: 'Heritage Discussion' },
    { value: 'learning-help', label: 'Learning Help' },
    { value: 'museums', label: 'Museums' },
    { value: 'events', label: 'Events' },
    { value: 'artifacts', label: 'Artifacts' },
    { value: 'culture', label: 'Culture' },
    { value: 'announcements', label: 'Announcements' }
  ];

  const sortOptions = [
    { value: 'lastActivity', label: 'Latest Activity' },
    { value: 'createdAt', label: 'Newest' },
    { value: 'views', label: 'Most Viewed' },
    { value: 'title', label: 'Title A-Z' }
  ];

  useEffect(() => {
    loadTopics();
  }, [searchTerm, selectedCategory, sortBy, currentPage]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sort: sortBy
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(`/api/community/forums/topics?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch topics');
      }

      const data = await response.json();
      setTopics(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error loading topics:', error);
      toast.error('Failed to load forum topics');
      
      // Mock data fallback
      setTopics([
        {
          _id: '1',
          title: 'Welcome to the Ethiopian Heritage Community!',
          description: 'Introduce yourself and share what brought you here.',
          category: 'general',
          author: { name: 'Admin', profileImage: null },
          isPinned: true,
          isLocked: false,
          views: 245,
          posts: Array(8).fill().map((_, i) => ({
            _id: `post${i}`,
            content: `Sample post content ${i + 1}`,
            author: { name: `User ${i + 1}`, profileImage: null },
            createdAt: new Date(Date.now() - i * 60000 * 60),
            likes: Array(Math.floor(Math.random() * 10)).fill().map((_, j) => ({ user: `user${j}` }))
          })),
          lastPost: {
            author: { name: 'User 8', profileImage: null },
            createdAt: new Date(Date.now() - 60000 * 30)
          },
          tags: ['welcome', 'introduction'],
          createdAt: new Date(Date.now() - 86400000 * 7)
        },
        {
          _id: '2',
          title: 'Ancient Ethiopian Architecture Patterns',
          description: 'Discussing the unique architectural elements found in Ethiopian heritage sites.',
          category: 'heritage-discussion',
          author: { name: 'Alemayehu T.', profileImage: null },
          isPinned: false,
          isLocked: false,
          views: 127,
          posts: Array(15).fill().map((_, i) => ({
            _id: `post${i}`,
            content: `Architectural discussion point ${i + 1}`,
            author: { name: `Expert ${i + 1}`, profileImage: null },
            createdAt: new Date(Date.now() - i * 60000 * 30),
            likes: Array(Math.floor(Math.random() * 5)).fill().map((_, j) => ({ user: `user${j}` }))
          })),
          lastPost: {
            author: { name: 'Sara M.', profileImage: null },
            createdAt: new Date(Date.now() - 60000 * 15)
          },
          tags: ['architecture', 'history'],
          createdAt: new Date(Date.now() - 86400000 * 3)
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createTopic = async () => {
    if (!newTopic.title.trim()) {
      toast.error('Please enter a topic title');
      return;
    }

    try {
      const response = await fetch('/api/community/forums/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newTopic,
          tags: newTopic.tags.filter(tag => tag.trim())
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create topic');
      }

      const data = await response.json();
      toast.success('Topic created successfully!');
      setShowCreateModal(false);
      setNewTopic({ title: '', description: '', category: 'general', tags: [] });
      loadTopics();
    } catch (error) {
      console.error('Error creating topic:', error);
      toast.error('Failed to create topic');
    }
  };

  const loadTopicDetails = async (topicId) => {
    try {
      const response = await fetch(`/api/community/forums/topics/${topicId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch topic details');
      }

      const data = await response.json();
      setSelectedTopic(data.data);
    } catch (error) {
      console.error('Error loading topic details:', error);
      toast.error('Failed to load topic details');
      
      // Fallback to find topic in current list
      const topic = topics.find(t => t._id === topicId);
      if (topic) {
        setSelectedTopic(topic);
      }
    }
  };

  const addPost = async (topicId) => {
    if (!newPost.trim()) {
      toast.error('Please enter a post content');
      return;
    }

    try {
      const response = await fetch(`/api/community/forums/topics/${topicId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: newPost
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add post');
      }

      toast.success('Post added successfully!');
      setNewPost('');
      loadTopicDetails(topicId);
    } catch (error) {
      console.error('Error adding post:', error);
      toast.error('Failed to add post');
    }
  };

  const likePost = async (topicId, postId) => {
    try {
      const response = await fetch(`/api/community/forums/topics/${topicId}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to like post');
      }

      const data = await response.json();
      toast.success(data.data.liked ? 'Post liked!' : 'Like removed');
      loadTopicDetails(topicId);
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const subscribeToTopic = async (topicId) => {
    try {
      const response = await fetch(`/api/community/forums/topics/${topicId}/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe to topic');
      }

      toast.success('Subscribed to topic notifications!');
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      toast.error('Failed to subscribe to topic');
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'general': FaComments,
      'heritage-discussion': FaStar,
      'learning-help': FaUser,
      'museums': FaEye,
      'events': FaClock,
      'artifacts': FaTags,
      'culture': FaCommentAlt,
      'announcements': FaBell
    };
    return icons[category] || FaComments;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return format(new Date(date), 'MMM dd, yyyy');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
      </div>
    );
  }

  if (selectedTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => setSelectedTopic(null)}
            className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to Forums
          </button>

          {/* Topic Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {selectedTopic.isPinned && <FaPin className="text-yellow-500" />}
                  {selectedTopic.isLocked && <FaLock className="text-gray-500" />}
                  <h1 className="text-2xl font-bold text-gray-800">{selectedTopic.title}</h1>
                </div>
                
                <p className="text-gray-600 mb-4">{selectedTopic.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FaUser />
                    {selectedTopic.author?.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <FaClock />
                    {formatTimeAgo(selectedTopic.createdAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <FaEye />
                    {selectedTopic.views} views
                  </div>
                  <div className="flex items-center gap-1">
                    <FaComments />
                    {selectedTopic.posts?.length || 0} replies
                  </div>
                </div>
                
                {selectedTopic.tags && selectedTopic.tags.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {selectedTopic.tags.map((tag, index) => (
                      <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => subscribeToTopic(selectedTopic._id)}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FaBell />
                Subscribe
              </button>
            </div>
          </div>

          {/* Posts */}
          <div className="space-y-4 mb-6">
            {selectedTopic.posts?.map((post, index) => (
              <div key={post._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUserCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-800">{post.author?.name}</span>
                      <span className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</span>
                    </div>
                    
                    <div className="text-gray-700 mb-3">
                      {post.content}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => likePost(selectedTopic._id, post._id)}
                        className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <FaHeart />
                        {post.likes?.length || 0}
                      </button>
                      
                      <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                        <FaReply />
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Post */}
          {!selectedTopic.isLocked && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add a Reply</h3>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none h-32"
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => addPost(selectedTopic._id)}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  <FaPaperPlane />
                  Post Reply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FaComments className="text-blue-600" />
                Discussion Forums
              </h1>
              <p className="text-gray-600 mt-2">Join conversations about Ethiopian heritage and culture</p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <FaPlus />
              New Topic
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Topics List */}
        <div className="space-y-4">
          {topics.map((topic) => {
            const CategoryIcon = getCategoryIcon(topic.category);
            
            return (
              <div
                key={topic._id}
                onClick={() => loadTopicDetails(topic._id)}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2 text-blue-600">
                    <CategoryIcon className="h-5 w-5" />
                    {topic.isPinned && <FaPin className="h-4 w-4 text-yellow-500" />}
                    {topic.isLocked && <FaLock className="h-4 w-4 text-gray-500" />}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                      {topic.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">{topic.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {categories.find(cat => cat.value === topic.category)?.label || 'General'}
                      </span>
                      <span>By {topic.author?.name}</span>
                      <span>{formatTimeAgo(topic.createdAt)}</span>
                      <span>{topic.views} views</span>
                      <span>{topic.posts?.length || 0} replies</span>
                    </div>
                    
                    {topic.tags && topic.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {topic.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                        {topic.tags.length > 3 && (
                          <span className="text-gray-500 text-xs">+{topic.tags.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {topic.lastPost && (
                    <div className="text-right text-xs text-gray-500">
                      <div>Last reply by</div>
                      <div className="font-medium text-gray-700">{topic.lastPost.author?.name}</div>
                      <div>{formatTimeAgo(topic.lastPost.createdAt)}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  } transition-colors`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Create Topic Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl m-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Topic</h2>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Topic title..."
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                
                <textarea
                  placeholder="Topic description..."
                  value={newTopic.description}
                  onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none h-32"
                />
                
                <select
                  value={newTopic.category}
                  onChange={(e) => setNewTopic({ ...newTopic, category: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.slice(1).map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                
                <input
                  type="text"
                  placeholder="Tags (comma separated)..."
                  value={newTopic.tags.join(', ')}
                  onChange={(e) => setNewTopic({ 
                    ...newTopic, 
                    tags: e.target.value.split(',').map(tag => tag.trim()) 
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createTopic}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  <FaPlus />
                  Create Topic
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionForums;
