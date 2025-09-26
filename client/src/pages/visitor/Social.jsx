import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  FaUsers, 
  FaUserFriends, 
  FaSearch, 
  FaUser, 
  FaHeart, 
  FaComment,
  FaTrophy,
  FaEye,
  FaStar,
  FaUserPlus,
  FaUserMinus
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Social = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [loading, setLoading] = useState(true);
  
  // Activity Feed State
  const [activityFeed, setActivityFeed] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [userStats, setUserStats] = useState({});
  
  // Search and Discovery
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      await Promise.all([
        fetchActivityFeed(),
        fetchFollowing(),
        fetchFollowers(),
        fetchUserStats(),
        fetchLeaderboard()
      ]);
    } catch (error) {
      console.error('Error fetching social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityFeed = async () => {
    try {
      const response = await fetch('/api/social/activity-feed', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activity feed');
      }

      const data = await response.json();
      setActivityFeed(data.activities || []);
    } catch (error) {
      console.error('Error fetching activity feed:', error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await fetch('/api/social/following', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch following');
      }

      const data = await response.json();
      setFollowingUsers(data.following || []);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const fetchFollowers = async () => {
    try {
      const response = await fetch('/api/social/followers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch followers');
      }

      const data = await response.json();
      setFollowers(data.followers || []);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/social/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }

      const data = await response.json();
      setUserStats(data.stats || {});
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/social/leaderboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/social/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      const data = await response.json();
      setSearchResults(data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    }
  };

  const followUser = async (userId) => {
    try {
      const response = await fetch(`/api/social/follow/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to follow user');
      }

      toast.success('User followed successfully');
      fetchFollowing();
      fetchUserStats();
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
    }
  };

  const unfollowUser = async (userId) => {
    try {
      const response = await fetch(`/api/social/unfollow/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to unfollow user');
      }

      toast.success('User unfollowed successfully');
      fetchFollowing();
      fetchUserStats();
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast.error('Failed to unfollow user');
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    
    // Debounce search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      searchUsers(query);
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FaUsers className="text-purple-600" />
                Community
              </h1>
              <p className="text-gray-600 mt-2">Connect with fellow heritage enthusiasts</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{userStats.followingCount || 0}</div>
                <div className="text-sm text-gray-600">Following</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{userStats.followersCount || 0}</div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{userStats.totalPoints || 0}</div>
                <div className="text-sm text-gray-600">Points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            {[
              { id: 'feed', label: 'Activity Feed', icon: FaHeart },
              { id: 'following', label: 'Following', icon: FaUserFriends },
              { id: 'followers', label: 'Followers', icon: FaUsers },
              { id: 'discover', label: 'Discover', icon: FaSearch },
              { id: 'leaderboard', label: 'Leaderboard', icon: FaTrophy }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-purple-500 text-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'feed' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              {activityFeed.length === 0 ? (
                <div className="text-center py-12">
                  <FaHeart className="mx-auto text-6xl text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No activity yet</h3>
                  <p className="text-gray-500">Follow some users to see their activities here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activityFeed.map((activity, index) => (
                    <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-purple-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{activity.userName}</span>
                            <span className="text-sm text-gray-500">{activity.action}</span>
                          </div>
                          <p className="text-gray-700">{activity.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                            {activity.points && (
                              <span className="flex items-center gap-1">
                                <FaStar className="text-yellow-500" />
                                +{activity.points} points
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'following' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Following ({followingUsers.length})</h2>
              {followingUsers.length === 0 ? (
                <div className="text-center py-12">
                  <FaUserFriends className="mx-auto text-6xl text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Not following anyone yet</h3>
                  <p className="text-gray-500">Discover and follow other heritage enthusiasts</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {followingUsers.map(followingUser => (
                    <div key={followingUser._id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <FaUser className="text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{followingUser.fullName}</h3>
                          <p className="text-sm text-gray-600">@{followingUser.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{followingUser.followersCount || 0} followers</span>
                          <span>{followingUser.totalPoints || 0} points</span>
                        </div>
                        <button
                          onClick={() => unfollowUser(followingUser._id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <FaUserMinus />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'followers' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Followers ({followers.length})</h2>
              {followers.length === 0 ? (
                <div className="text-center py-12">
                  <FaUsers className="mx-auto text-6xl text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No followers yet</h3>
                  <p className="text-gray-500">Stay active to attract followers</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {followers.map(follower => (
                    <div key={follower._id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <FaUser className="text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{follower.fullName}</h3>
                          <p className="text-sm text-gray-600">@{follower.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{follower.followersCount || 0} followers</span>
                          <span>{follower.totalPoints || 0} points</span>
                        </div>
                        {!followingUsers.find(f => f._id === follower._id) && (
                          <button
                            onClick={() => followUser(follower._id)}
                            className="text-purple-600 hover:text-purple-800 transition-colors"
                          >
                            <FaUserPlus />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'discover' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Discover Users</h2>
              <div className="mb-6">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or username..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              
              {searchResults.length === 0 && searchTerm ? (
                <div className="text-center py-12">
                  <FaSearch className="mx-auto text-6xl text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No users found</h3>
                  <p className="text-gray-500">Try searching with different keywords</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <FaUsers className="mx-auto text-6xl text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Search for users</h3>
                  <p className="text-gray-500">Enter a name or username to discover new people</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map(searchUser => (
                    <div key={searchUser._id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <FaUser className="text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{searchUser.fullName}</h3>
                          <p className="text-sm text-gray-600">@{searchUser.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{searchUser.followersCount || 0} followers</span>
                          <span>{searchUser.totalPoints || 0} points</span>
                        </div>
                        {searchUser._id !== user?._id && !followingUsers.find(f => f._id === searchUser._id) && (
                          <button
                            onClick={() => followUser(searchUser._id)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                          >
                            Follow
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Top Contributors</h2>
              {leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <FaTrophy className="mx-auto text-6xl text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No rankings yet</h3>
                  <p className="text-gray-500">Be the first to earn points and climb the leaderboard</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((userEntry, index) => (
                    <div key={userEntry._id} className={`flex items-center gap-4 p-4 rounded-lg ${
                      index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50'
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {index + 1}
                      </div>
                      
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-purple-600" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold">{userEntry.fullName}</h3>
                        <p className="text-sm text-gray-600">@{userEntry.username}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">
                          {userEntry.totalPoints || 0} pts
                        </div>
                        <div className="text-sm text-gray-600">
                          {userEntry.followersCount || 0} followers
                        </div>
                      </div>
                      
                      {index < 3 && (
                        <FaTrophy className={`text-2xl ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          'text-orange-600'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Social;
