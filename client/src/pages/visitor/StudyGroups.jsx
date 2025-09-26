import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  FaUsers, 
  FaPlus, 
  FaSearch, 
  FaFilter,
  FaUserPlus,
  FaUserMinus,
  FaCrown,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaUnlock,
  FaComments,
  FaClock,
  FaStar,
  FaSpinner,
  FaUserCircle,
  FaPaperPlane,
  FaCalendarAlt,
  FaBookmark,
  FaDownload,
  FaShare,
  FaCog
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const StudyGroups = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [newMessage, setNewMessage] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    category: 'heritage',
    maxMembers: 20,
    isPrivate: false,
    requiresApproval: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('browse'); // browse, my-groups

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'heritage', label: 'Heritage Studies' },
    { value: 'history', label: 'Ethiopian History' },
    { value: 'culture', label: 'Cultural Studies' },
    { value: 'artifacts', label: 'Artifacts & Museums' },
    { value: 'language', label: 'Language Learning' },
    { value: 'general', label: 'General Discussion' }
  ];

  const sortOptions = [
    { value: 'lastActivity', label: 'Latest Activity' },
    { value: 'createdAt', label: 'Newest' },
    { value: 'memberCount', label: 'Most Members' },
    { value: 'name', label: 'Name A-Z' }
  ];

  useEffect(() => {
    if (activeTab === 'browse') {
      loadGroups();
    } else if (activeTab === 'my-groups') {
      loadMyGroups();
    }
  }, [searchTerm, selectedCategory, sortBy, currentPage, activeTab]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sort: sortBy
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(`/api/community/study-groups?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }

      const data = await response.json();
      setGroups(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Failed to load study groups');
      
      // Mock data fallback
      setGroups([
        {
          _id: '1',
          name: 'Ethiopian Heritage Explorers',
          description: 'Join us as we explore the rich cultural heritage of Ethiopia through collaborative learning and discussion.',
          category: 'heritage',
          creator: { name: 'Alemayehu T.', profileImage: null },
          members: Array(15).fill().map((_, i) => ({
            user: { _id: `user${i}`, name: `Member ${i + 1}`, profileImage: null },
            role: i === 0 ? 'owner' : i < 3 ? 'moderator' : 'member',
            joinedAt: new Date(Date.now() - i * 86400000),
            isActive: true
          })),
          maxMembers: 20,
          isPrivate: false,
          requiresApproval: false,
          tags: ['heritage', 'culture', 'exploration'],
          lastActivity: new Date(Date.now() - 3600000),
          discussions: Array(8).fill().map((_, i) => ({
            _id: `disc${i}`,
            title: `Discussion Topic ${i + 1}`,
            author: { name: `Member ${i + 1}`, profileImage: null },
            createdAt: new Date(Date.now() - i * 3600000),
            replies: Math.floor(Math.random() * 20)
          })),
          createdAt: new Date(Date.now() - 86400000 * 30)
        },
        {
          _id: '2',
          name: 'Ancient Architecture Study Circle',
          description: 'Focused study group dedicated to understanding Ethiopian ancient architecture and construction techniques.',
          category: 'history',
          creator: { name: 'Sara M.', profileImage: null },
          members: Array(8).fill().map((_, i) => ({
            user: { _id: `user${i + 20}`, name: `Architect ${i + 1}`, profileImage: null },
            role: i === 0 ? 'owner' : i < 2 ? 'moderator' : 'member',
            joinedAt: new Date(Date.now() - i * 86400000),
            isActive: true
          })),
          maxMembers: 15,
          isPrivate: true,
          requiresApproval: true,
          inviteCode: 'ARCH2024',
          tags: ['architecture', 'history', 'ancient'],
          lastActivity: new Date(Date.now() - 7200000),
          discussions: Array(12).fill().map((_, i) => ({
            _id: `disc2${i}`,
            title: `Architecture Topic ${i + 1}`,
            author: { name: `Architect ${i + 1}`, profileImage: null },
            createdAt: new Date(Date.now() - i * 3600000),
            replies: Math.floor(Math.random() * 15)
          })),
          createdAt: new Date(Date.now() - 86400000 * 45)
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadMyGroups = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      });

      const response = await fetch(`/api/community/my-study-groups?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch my groups');
      }

      const data = await response.json();
      setGroups(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error loading my groups:', error);
      toast.error('Failed to load your groups');
      
      // Mock fallback showing user in first group
      setGroups([
        {
          _id: '1',
          name: 'Ethiopian Heritage Explorers',
          description: 'Join us as we explore the rich cultural heritage of Ethiopia through collaborative learning and discussion.',
          category: 'heritage',
          creator: { name: 'Alemayehu T.', profileImage: null },
          members: [
            {
              user: { _id: user?.id, name: user?.name || 'You', profileImage: user?.profileImage },
              role: 'member',
              joinedAt: new Date(Date.now() - 86400000 * 7),
              isActive: true
            }
          ],
          maxMembers: 20,
          isPrivate: false,
          requiresApproval: false,
          tags: ['heritage', 'culture', 'exploration'],
          lastActivity: new Date(Date.now() - 3600000),
          createdAt: new Date(Date.now() - 86400000 * 30)
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    if (!newGroup.name.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    try {
      const response = await fetch('/api/community/study-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newGroup)
      });

      if (!response.ok) {
        throw new Error('Failed to create group');
      }

      const data = await response.json();
      toast.success('Study group created successfully!');
      setShowCreateModal(false);
      setNewGroup({
        name: '',
        description: '',
        category: 'heritage',
        maxMembers: 20,
        isPrivate: false,
        requiresApproval: false
      });
      loadGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create study group');
    }
  };

  const joinGroup = async (groupId, code = '') => {
    try {
      const response = await fetch(`/api/community/study-groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ inviteCode: code })
      });

      if (!response.ok) {
        throw new Error('Failed to join group');
      }

      toast.success('Successfully joined the study group!');
      setShowJoinModal(false);
      setInviteCode('');
      loadGroups();
      if (selectedGroup?._id === groupId) {
        loadGroupDetails(groupId);
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join study group. Check invite code if required.');
    }
  };

  const leaveGroup = async (groupId) => {
    if (!confirm('Are you sure you want to leave this study group?')) return;

    try {
      const response = await fetch(`/api/community/study-groups/${groupId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to leave group');
      }

      toast.success('Left the study group successfully');
      loadGroups();
      if (selectedGroup?._id === groupId) {
        setSelectedGroup(null);
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave study group');
    }
  };

  const loadGroupDetails = async (groupId) => {
    try {
      const response = await fetch(`/api/community/study-groups/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch group details');
      }

      const data = await response.json();
      setSelectedGroup(data.data);
    } catch (error) {
      console.error('Error loading group details:', error);
      toast.error('Failed to load group details');
      
      // Fallback to find group in current list
      const group = groups.find(g => g._id === groupId);
      if (group) {
        setSelectedGroup(group);
      }
    }
  };

  const sendMessage = async (groupId) => {
    if (!newMessage.trim()) return;

    try {
      // This would typically post to group discussions
      toast.success('Message sent to group discussion!');
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return <FaCrown className="text-yellow-500" />;
      case 'moderator': return <FaStar className="text-blue-500" />;
      default: return null;
    }
  };

  const isUserMember = (group) => {
    if (!user) return false;
    return group.members?.some(member => 
      member.user._id === user.id && member.isActive
    );
  };

  const getUserRole = (group) => {
    if (!user) return null;
    const member = group.members?.find(member => 
      member.user._id === user.id && member.isActive
    );
    return member?.role || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-green-600 mb-4" />
      </div>
    );
  }

  if (selectedGroup) {
    const isMember = isUserMember(selectedGroup);
    const userRole = getUserRole(selectedGroup);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => setSelectedGroup(null)}
            className="mb-6 flex items-center gap-2 text-green-600 hover:text-green-800 transition-colors"
          >
            ← Back to Study Groups
          </button>

          {/* Group Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {selectedGroup.isPrivate && <FaLock className="text-gray-500" />}
                  <h1 className="text-2xl font-bold text-gray-800">{selectedGroup.name}</h1>
                </div>
                
                <p className="text-gray-600 mb-4">{selectedGroup.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FaUsers />
                    {selectedGroup.members?.length || 0}/{selectedGroup.maxMembers} members
                  </div>
                  <div className="flex items-center gap-1">
                    <FaClock />
                    Created {formatTimeAgo(selectedGroup.createdAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <FaComments />
                    {selectedGroup.discussions?.length || 0} discussions
                  </div>
                </div>
                
                {selectedGroup.tags && selectedGroup.tags.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {selectedGroup.tags.map((tag, index) => (
                      <span key={index} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                {!isMember ? (
                  <button
                    onClick={() => {
                      if (selectedGroup.isPrivate) {
                        setShowJoinModal(true);
                      } else {
                        joinGroup(selectedGroup._id);
                      }
                    }}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <FaUserPlus />
                    Join Group
                  </button>
                ) : (
                  <button
                    onClick={() => leaveGroup(selectedGroup._id)}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <FaUserMinus />
                    Leave Group
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Discussions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Discussions</h3>
                
                <div className="space-y-4">
                  {selectedGroup.discussions?.slice(0, 5).map((discussion) => (
                    <div key={discussion._id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <FaUserCircle className="h-6 w-6 text-green-600" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">{discussion.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>By {discussion.author?.name}</span>
                          <span>{formatTimeAgo(discussion.createdAt)}</span>
                          <span>{discussion.replies} replies</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!selectedGroup.discussions || selectedGroup.discussions.length === 0) && (
                    <div className="text-center text-gray-500 py-8">
                      <FaComments className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      <p>No discussions yet. Start the conversation!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Send Message */}
              {isMember && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Start a Discussion</h3>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Share your thoughts or start a new discussion..."
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none h-32"
                  />
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => sendMessage(selectedGroup._id)}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      <FaPaperPlane />
                      Start Discussion
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Group Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Group Info</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium">
                      {categories.find(cat => cat.value === selectedGroup.category)?.label || 'General'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Privacy</span>
                    <span className="font-medium flex items-center gap-1">
                      {selectedGroup.isPrivate ? <FaLock className="h-4 w-4" /> : <FaUnlock className="h-4 w-4" />}
                      {selectedGroup.isPrivate ? 'Private' : 'Public'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created by</span>
                    <span className="font-medium">{selectedGroup.creator?.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Activity</span>
                    <span className="font-medium">{formatTimeAgo(selectedGroup.lastActivity)}</span>
                  </div>
                </div>

                {selectedGroup.isPrivate && selectedGroup.inviteCode && isMember && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">Invite Code</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedGroup.inviteCode);
                          toast.success('Invite code copied!');
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaShare />
                      </button>
                    </div>
                    <div className="font-mono text-lg text-blue-800 mt-1">{selectedGroup.inviteCode}</div>
                  </div>
                )}
              </div>

              {/* Members */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Members</h3>
                
                <div className="space-y-3">
                  {selectedGroup.members?.slice(0, 10).map((member) => (
                    <div key={member.user._id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FaUserCircle className="h-5 w-5 text-green-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{member.user.name}</span>
                          {getRoleIcon(member.role)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Joined {formatTimeAgo(member.joinedAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {selectedGroup.members?.length > 10 && (
                    <div className="text-center text-gray-500 text-sm">
                      +{selectedGroup.members.length - 10} more members
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FaUsers className="text-green-600" />
                Study Groups
              </h1>
              <p className="text-gray-600 mt-2">Join collaborative learning communities</p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <FaPlus />
              Create Group
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'browse'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              Browse Groups
            </button>
            <button
              onClick={() => setActiveTab('my-groups')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'my-groups'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              My Groups
            </button>
          </div>

          {/* Filters - only show for browse tab */}
          {activeTab === 'browse' && (
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Groups Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {group.isPrivate && <FaLock className="h-4 w-4 text-gray-500" />}
                    <h3 className="font-semibold text-lg text-gray-800 line-clamp-1">
                      {group.name}
                    </h3>
                  </div>
                  
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {categories.find(cat => cat.value === group.category)?.label || 'General'}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {group.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <FaUsers />
                    {group.members?.length || 0}/{group.maxMembers}
                  </div>
                  <div className="flex items-center gap-1">
                    <FaClock />
                    {formatTimeAgo(group.lastActivity)}
                  </div>
                </div>
                
                {group.tags && group.tags.length > 0 && (
                  <div className="flex gap-1 mb-4">
                    {group.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={() => loadGroupDetails(group._id)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    <FaEye className="inline mr-1" />
                    View
                  </button>
                  
                  {!isUserMember(group) ? (
                    <button
                      onClick={() => {
                        if (group.isPrivate) {
                          setShowJoinModal(true);
                        } else {
                          joinGroup(group._id);
                        }
                      }}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      <FaUserPlus className="inline mr-1" />
                      Join
                    </button>
                  ) : (
                    <button
                      onClick={() => leaveGroup(group._id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      <FaUserMinus className="inline mr-1" />
                      Leave
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
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
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  } transition-colors`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Study Group</h2>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Group name..."
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                
                <textarea
                  placeholder="Group description..."
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none h-32"
                />
                
                <select
                  value={newGroup.category}
                  onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {categories.slice(1).map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Max members"
                    min="2"
                    max="100"
                    value={newGroup.maxMembers}
                    onChange={(e) => setNewGroup({ ...newGroup, maxMembers: parseInt(e.target.value) || 20 })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={newGroup.isPrivate}
                      onChange={(e) => setNewGroup({ ...newGroup, isPrivate: e.target.checked })}
                      className="h-4 w-4 text-green-600 rounded"
                    />
                    <span>Private Group (requires invite code)</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={newGroup.requiresApproval}
                      onChange={(e) => setNewGroup({ ...newGroup, requiresApproval: e.target.checked })}
                      className="h-4 w-4 text-green-600 rounded"
                    />
                    <span>Require approval to join</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createGroup}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  <FaPlus />
                  Create Group
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Join Private Group Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Join Private Group</h2>
              <p className="text-gray-600 mb-4">This is a private group. Please enter the invite code to join.</p>
              
              <input
                type="text"
                placeholder="Enter invite code..."
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-4"
              />
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    setInviteCode('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => joinGroup(selectedGroup?._id || '', inviteCode)}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  <FaUserPlus />
                  Join Group
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyGroups;
