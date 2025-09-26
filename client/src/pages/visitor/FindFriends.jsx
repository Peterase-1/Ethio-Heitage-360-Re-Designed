import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  FaUserFriends, 
  FaSearch, 
  FaUserPlus,
  FaUserCheck,
  FaUserTimes,
  FaUserCircle,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaStar,
  FaTrophy,
  FaComments,
  FaUsers,
  FaSpinner,
  FaFilter,
  FaEye,
  FaHeart,
  FaShare,
  FaGraduationCap,
  FaMuseum,
  FaLanguage,
  FaBookmark,
  FaGlobe,
  FaClock,
  FaFire,
  FaMedal,
  FaCheck
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const FindFriends = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    interests: [],
    experience: '',
    location: '',
    joinedRecently: false
  });
  const [activeTab, setActiveTab] = useState('discover'); // discover, friends, requests
  const [friendRequests, setFriendRequests] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const interests = [
    'Ethiopian History', 'Ancient Architecture', 'Cultural Heritage', 
    'Museum Studies', 'Archaeology', 'Traditional Art', 'Folk Music',
    'Language Learning', 'Travel', 'Photography', 'Religious History'
  ];

  const experienceLevels = [
    { value: '', label: 'Any Level' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];

  useEffect(() => {
    loadUsers();
    loadFriends();
    loadFriendRequests();
  }, [searchTerm, selectedFilters, currentPage, activeTab]);

  const loadUsers = async () => {
    if (activeTab !== 'discover') return;

    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        search: searchTerm,
        page: currentPage.toString(),
        limit: '12'
      });

      if (selectedFilters.experience) params.append('experience', selectedFilters.experience);
      if (selectedFilters.location) params.append('location', selectedFilters.location);
      if (selectedFilters.joinedRecently) params.append('joinedRecently', 'true');
      if (selectedFilters.interests.length > 0) {
        params.append('interests', selectedFilters.interests.join(','));
      }

      const response = await fetch(`/api/community/find-friends?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
      
      // Mock data fallback
      setUsers([
        {
          _id: '1',
          name: 'Alemayehu Tesfaye',
          email: 'alemayehu@example.com',
          profileImage: null,
          bio: 'Passionate about Ethiopian heritage and ancient history. Love exploring museums and archaeological sites.',
          location: 'Addis Ababa, Ethiopia',
          joinedAt: new Date(Date.now() - 86400000 * 30),
          stats: {
            coursesCompleted: 12,
            achievementsEarned: 18,
            communityPoints: 2580,
            studyStreak: 28
          },
          interests: ['Ethiopian History', 'Ancient Architecture', 'Cultural Heritage'],
          experienceLevel: 'advanced',
          isOnline: true,
          lastActive: new Date(Date.now() - 300000),
          mutualFriends: 3
        },
        {
          _id: '2',
          name: 'Sara Mohammed',
          email: 'sara@example.com',
          profileImage: null,
          bio: 'Museum curator interested in traditional Ethiopian art and cultural preservation.',
          location: 'Bahir Dar, Ethiopia',
          joinedAt: new Date(Date.now() - 86400000 * 60),
          stats: {
            coursesCompleted: 8,
            achievementsEarned: 14,
            communityPoints: 1890,
            studyStreak: 15
          },
          interests: ['Traditional Art', 'Museum Studies', 'Cultural Heritage'],
          experienceLevel: 'expert',
          isOnline: false,
          lastActive: new Date(Date.now() - 3600000),
          mutualFriends: 1
        },
        {
          _id: '3',
          name: 'Daniel Kebede',
          email: 'daniel@example.com',
          profileImage: null,
          bio: 'New to Ethiopian heritage studies but eager to learn! Looking for study partners and mentors.',
          location: 'Mekelle, Ethiopia',
          joinedAt: new Date(Date.now() - 86400000 * 7),
          stats: {
            coursesCompleted: 3,
            achievementsEarned: 5,
            communityPoints: 450,
            studyStreak: 7
          },
          interests: ['Language Learning', 'Travel', 'Photography'],
          experienceLevel: 'beginner',
          isOnline: true,
          lastActive: new Date(Date.now() - 60000),
          mutualFriends: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    if (activeTab !== 'friends') return;

    try {
      setLoading(true);
      
      const response = await fetch('/api/social/friends', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
      // Mock fallback
      setFriends([
        {
          _id: '1',
          name: 'Meron Addis',
          profileImage: null,
          bio: 'Fellow heritage enthusiast and study partner',
          isOnline: true,
          lastActive: new Date(),
          mutualFriends: 5,
          friendsSince: new Date(Date.now() - 86400000 * 90)
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    if (activeTab !== 'requests') return;

    try {
      setLoading(true);
      
      const response = await fetch('/api/social/friend-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFriendRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error loading friend requests:', error);
      // Mock fallback
      setFriendRequests([
        {
          _id: '1',
          from: {
            _id: 'req1',
            name: 'Yohannes Tadesse',
            profileImage: null,
            bio: 'History teacher passionate about Ethiopian culture'
          },
          sentAt: new Date(Date.now() - 86400000 * 2),
          message: 'Hi! I saw we have similar interests in Ethiopian history. Would love to connect!'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      const response = await fetch('/api/social/friend-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        toast.success('Friend request sent!');
        // Update UI to show request sent
        setUsers(users.map(user => 
          user._id === userId 
            ? { ...user, requestSent: true }
            : user
        ));
      } else {
        throw new Error('Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    }
  };

  const respondToFriendRequest = async (requestId, action) => {
    try {
      const response = await fetch(`/api/social/friend-request/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ action }) // 'accept' or 'decline'
      });

      if (response.ok) {
        toast.success(`Friend request ${action}ed!`);
        setFriendRequests(friendRequests.filter(req => req._id !== requestId));
        
        if (action === 'accept') {
          loadFriends(); // Refresh friends list
        }
      } else {
        throw new Error(`Failed to ${action} friend request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error);
      toast.error(`Failed to ${action} friend request`);
    }
  };

  const removeFriend = async (friendId) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;

    try {
      const response = await fetch(`/api/social/friend/${friendId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Friend removed');
        setFriends(friends.filter(friend => friend._id !== friendId));
      } else {
        throw new Error('Failed to remove friend');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const getExperienceBadge = (level) => {
    const badges = {
      beginner: { icon: FaBookmark, color: 'bg-green-100 text-green-700', label: 'Beginner' },
      intermediate: { icon: FaMedal, color: 'bg-blue-100 text-blue-700', label: 'Intermediate' },
      advanced: { icon: FaTrophy, color: 'bg-purple-100 text-purple-700', label: 'Advanced' },
      expert: { icon: FaStar, color: 'bg-yellow-100 text-yellow-700', label: 'Expert' }
    };
    return badges[level] || badges.beginner;
  };

  const toggleInterestFilter = (interest) => {
    const newInterests = selectedFilters.interests.includes(interest)
      ? selectedFilters.interests.filter(i => i !== interest)
      : [...selectedFilters.interests, interest];
    
    setSelectedFilters({ ...selectedFilters, interests: newInterests });
  };

  if (loading && activeTab === 'discover') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-pink-600 mb-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaUserFriends className="text-pink-600" />
            Find Friends
          </h1>
          <p className="text-gray-600 mt-2">Connect with fellow heritage enthusiasts</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'discover'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              <FaSearch className="inline mr-2" />
              Discover
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'friends'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              <FaUserFriends className="inline mr-2" />
              My Friends
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'requests'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              <FaUserPlus className="inline mr-2" />
              Friend Requests
              {friendRequests.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                  {friendRequests.length}
                </span>
              )}
            </button>
          </div>

          {/* Search and Filters for Discover tab */}
          {activeTab === 'discover' && (
            <div className="p-6 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              {/* Filters */}
              <div className="grid md:grid-cols-3 gap-4">
                <select
                  value={selectedFilters.experience}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, experience: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  {experienceLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Location..."
                  value={selectedFilters.location}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, location: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />

                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedFilters.joinedRecently}
                    onChange={(e) => setSelectedFilters({ ...selectedFilters, joinedRecently: e.target.checked })}
                    className="h-4 w-4 text-pink-600 rounded"
                  />
                  <span className="text-sm">Joined recently</span>
                </label>
              </div>

              {/* Interest Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by interests:
                </label>
                <div className="flex flex-wrap gap-2">
                  {interests.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterestFilter(interest)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedFilters.interests.includes(interest)
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-pink-100'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {activeTab === 'discover' && (
          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => {
                const experienceBadge = getExperienceBadge(user.experienceLevel);
                const ExperienceIcon = experienceBadge.icon;
                
                return (
                  <div
                    key={user._id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    {/* User Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                            <FaUserCircle className="h-8 w-8 text-pink-600" />
                          </div>
                          {user.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800">{user.name}</h3>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${experienceBadge.color}`}>
                            <ExperienceIcon className="h-3 w-3" />
                            {experienceBadge.label}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right text-xs text-gray-500">
                        {user.isOnline ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Online
                          </span>
                        ) : (
                          <span>Last seen {formatTimeAgo(user.lastActive)}</span>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    {user.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                        <FaMapMarkerAlt />
                        {user.location}
                      </div>
                    )}

                    {/* Bio */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{user.bio}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                          <FaGraduationCap className="h-4 w-4" />
                        </div>
                        <div className="font-semibold text-lg">{user.stats.coursesCompleted}</div>
                        <div className="text-xs text-gray-500">Courses</div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
                          <FaTrophy className="h-4 w-4" />
                        </div>
                        <div className="font-semibold text-lg">{user.stats.achievementsEarned}</div>
                        <div className="text-xs text-gray-500">Achievements</div>
                      </div>
                    </div>

                    {/* Interests */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {user.interests.slice(0, 3).map((interest, index) => (
                          <span key={index} className="bg-pink-50 text-pink-700 px-2 py-1 rounded text-xs">
                            {interest}
                          </span>
                        ))}
                        {user.interests.length > 3 && (
                          <span className="text-gray-500 text-xs">+{user.interests.length - 3} more</span>
                        )}
                      </div>
                    </div>

                    {/* Mutual Friends */}
                    {user.mutualFriends > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                        <FaUsers className="h-4 w-4" />
                        {user.mutualFriends} mutual friend{user.mutualFriends > 1 ? 's' : ''}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowProfileModal(true);
                        }}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <FaEye />
                        View Profile
                      </button>
                      
                      {user.requestSent ? (
                        <button
                          disabled
                          className="flex-1 bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-1"
                        >
                          <FaCheck />
                          Request Sent
                        </button>
                      ) : (
                        <button
                          onClick={() => sendFriendRequest(user._id)}
                          className="flex-1 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                        >
                          <FaUserPlus />
                          Add Friend
                        </button>
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
                          ? 'bg-pink-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      } transition-colors`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map((friend) => (
              <div key={friend._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                      <FaUserCircle className="h-8 w-8 text-pink-600" />
                    </div>
                    {friend.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{friend.name}</h3>
                    <div className="text-sm text-gray-500">
                      Friends since {format(new Date(friend.friendsSince), 'MMM yyyy')}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{friend.bio}</p>

                {friend.mutualFriends > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                    <FaUsers className="h-4 w-4" />
                    {friend.mutualFriends} mutual friend{friend.mutualFriends > 1 ? 's' : ''}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedUser(friend);
                      setShowProfileModal(true);
                    }}
                    className="flex-1 bg-pink-100 hover:bg-pink-200 text-pink-700 px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    <FaComments className="inline mr-1" />
                    Message
                  </button>
                  
                  <button
                    onClick={() => removeFriend(friend._id)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    <FaUserTimes />
                  </button>
                </div>
              </div>
            ))}
            
            {friends.length === 0 && !loading && (
              <div className="col-span-full text-center text-gray-500 py-12">
                <FaUserFriends className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No friends yet</p>
                <p>Start connecting with fellow heritage enthusiasts!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4">
            {friendRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <FaUserCircle className="h-8 w-8 text-pink-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg text-gray-800">{request.from.name}</h3>
                      <span className="text-sm text-gray-500">{formatTimeAgo(request.sentAt)}</span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{request.from.bio}</p>
                    
                    {request.message && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700">"{request.message}"</p>
                      </div>
                    )}
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => respondToFriendRequest(request._id, 'accept')}
                        className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-1"
                      >
                        <FaUserCheck />
                        Accept
                      </button>
                      
                      <button
                        onClick={() => respondToFriendRequest(request._id, 'decline')}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-1"
                      >
                        <FaUserTimes />
                        Decline
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedUser(request.from);
                          setShowProfileModal(true);
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-1"
                      >
                        <FaEye />
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {friendRequests.length === 0 && !loading && (
              <div className="text-center text-gray-500 py-12">
                <FaUserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No friend requests</p>
                <p>When people send you friend requests, they'll appear here.</p>
              </div>
            )}
          </div>
        )}

        {/* Profile Modal */}
        {showProfileModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Profile</h2>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>

                {/* Profile Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                      <FaUserCircle className="h-12 w-12 text-pink-600" />
                    </div>
                    {selectedUser.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{selectedUser.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {selectedUser.location && (
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt />
                          {selectedUser.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt />
                        Joined {formatTimeAgo(selectedUser.joinedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">About</h4>
                  <p className="text-gray-600">{selectedUser.bio}</p>
                </div>

                {/* Stats */}
                {selectedUser.stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <FaGraduationCap className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <div className="font-bold text-xl">{selectedUser.stats.coursesCompleted}</div>
                      <div className="text-sm text-gray-500">Courses</div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <FaTrophy className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                      <div className="font-bold text-xl">{selectedUser.stats.achievementsEarned}</div>
                      <div className="text-sm text-gray-500">Achievements</div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <FaStar className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <div className="font-bold text-xl">{selectedUser.stats.communityPoints}</div>
                      <div className="text-sm text-gray-500">Points</div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <FaFire className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <div className="font-bold text-xl">{selectedUser.stats.studyStreak}</div>
                      <div className="text-sm text-gray-500">Day Streak</div>
                    </div>
                  </div>
                )}

                {/* Interests */}
                {selectedUser.interests && selectedUser.interests.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.interests.map((interest, index) => (
                        <span key={index} className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  
                  {activeTab === 'friends' ? (
                    <button className="flex-1 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors">
                      <FaComments className="inline mr-2" />
                      Send Message
                    </button>
                  ) : !selectedUser.requestSent ? (
                    <button
                      onClick={() => {
                        sendFriendRequest(selectedUser._id);
                        setShowProfileModal(false);
                      }}
                      className="flex-1 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <FaUserPlus className="inline mr-2" />
                      Add Friend
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 bg-gray-300 text-gray-500 px-4 py-2 rounded-lg"
                    >
                      <FaCheck className="inline mr-2" />
                      Request Sent
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindFriends;
