import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import LogoutButton from '../components/common/LogoutButton';
import { 
  Users, 
  Building2, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Settings, 
  FileCheck, 
  DollarSign,
  BarChart3,
  Home,
  ChevronDown,
  ChevronUp,
  Bell,
  Shield,
  Eye,
  MessageSquare,
  Globe,
  Key,
  Activity,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Archive
} from 'lucide-react';
import logo from '../assets/Logo.jpg';
import HeritageSiteManager from '../components/HeritageSiteManager';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const SuperAdminDashboard = ({ darkMode, toggleDarkMode }) => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [expandedSections, setExpandedSections] = useState({
    'Platform Overview': true,
    'User & Content Management': true, 
    'Business Operations': true,
    'System Administration': true
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    museums: 0,
    heritageSites: 0,
    activeTours: 0,
    userGrowth: 0,
    museumGrowth: 0,
    siteGrowth: 0,
    tourGrowth: 0
  });

  // User management state
  const [usersState, setUsersState] = useState({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    role: '',
    loading: false,
    error: ''
  });

  // Create/Edit user modal state
  const [userModal, setUserModal] = useState({ open: false, mode: 'create', data: { name: '', email: '', password: '', role: 'visitor', isActive: true }, submitting: false, error: '' });

  // Museum oversight state
  const [museumsState, setMuseumsState] = useState({ items: [], total: 0, page: 1, limit: 10, loading: false, error: '' });

  // Content moderation state
  const [contentModerationState, setContentModerationState] = useState({
    activeTab: 'overview',
    filterStatus: 'all',
    typeFilter: 'all',
    museumFilter: 'all',
    searchTerm: '',
    page: 1,
    limit: 10,
    total: 0,
    items: [],
    loading: false,
    error: ''
  });

  const [feedbackModal, setFeedbackModal] = useState({ 
    open: false, 
    item: null, 
    feedback: '', 
    submitting: false 
  });

  const [selectedContentItem, setSelectedContentItem] = useState(null);

  const sidebarItems = [
    {
      category: 'Platform Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Complete analytics - user activity, artifact stats, rentals' },
        { id: 'platform-analytics', label: 'Platform Analytics', icon: BarChart3, description: 'Insights for all museums combined' },
        { id: 'audit-logs', label: 'Audit Logs', icon: Activity, description: 'Track all approvals, rejections, and changes' }
      ]
    },
    {
      category: 'User & Content Management',
      items: [
        { id: 'user-management', label: 'User Management', icon: Users, description: 'Create, edit, delete, approve/reject users across all roles' },
        { id: 'museum-oversight', label: 'Museum Oversight', icon: Building2, description: 'Approve or reject museum registrations and updates' },
        { id: 'heritage-sites', label: 'Heritage Sites', icon: MapPin, description: 'Add and manage Ethiopian cultural/heritage sites' }
      ]
    },
    {
      category: 'Business Operations',
      items: [
        { id: 'rental-oversight', label: 'Rental System', icon: DollarSign, description: 'Manage artifact rental requests from users' },
        { id: 'approval-feedback', label: 'Approval Feedback', icon: MessageSquare, description: 'Send comments/clarifications to Museum Admins' }
      ]
    },
    {
      category: 'System Administration',
      items: [
        { id: 'system-settings', label: 'System Settings', icon: Settings, description: 'Global branding, themes, languages, API keys, security rules' },
        { id: 'security', label: 'Security Center', icon: Shield, description: 'Security rules, access control, and monitoring' }
      ]
    }
  ];

  useEffect(() => {
    // Fetch live stats
    const load = async () => {
      try {
        const res = await api.getAdminStats();
        const s = res.stats || {};
        setStats((prev) => ({
          ...prev,
          totalUsers: s.totalUsers ?? prev.totalUsers,
          museums: s.totalMuseums ?? prev.museums,
        }));
      } catch (e) {
        // keep defaults if fails
        console.error('Failed to load admin stats', e);
      }
    };
    load();
  }, []);

  // Load museums when Museum Oversight active
  useEffect(() => {
    if (activeSection !== 'museum-oversight') return;
    const loadMuseums = async () => {
      setMuseumsState(prev => ({ ...prev, loading: true, error: '' }));
      try {
        const res = await api.listMuseums({ page: museumsState.page, limit: museumsState.limit });
        setMuseumsState(prev => ({ ...prev, items: res.items || [], total: res.total || 0, loading: false }));
      } catch (e) {
        setMuseumsState(prev => ({ ...prev, loading: false, error: e.message || 'Failed to load museums' }));
      }
    };
    loadMuseums();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, museumsState.page, museumsState.limit]);

  // Load users when opening User Management or when paging/filter changes
  useEffect(() => {
    if (activeSection !== 'user-management') return;
    const loadUsers = async () => {
      setUsersState(prev => ({ ...prev, loading: true, error: '' }));
      try {
        const { page, limit, role } = usersState;
        const res = await api.listUsers({ page, limit, role: role || undefined });
        setUsersState(prev => ({ ...prev, items: res.items || [], total: res.total || 0, loading: false }));
      } catch (e) {
        setUsersState(prev => ({ ...prev, loading: false, error: e.message || 'Failed to load users' }));
      }
    };
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, usersState.page, usersState.limit, usersState.role]);

  const handleRoleChange = async (id, role) => {
    try {
      await api.setUserRole(id, role);
      setUsersState(prev => ({ ...prev, items: prev.items.map(u => (u._id === id ? { ...u, role } : u)) }));
    } catch (e) {
      alert(`Failed to update role: ${e.message}`);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.deleteUser(id);
      setUsersState(prev => ({ ...prev, items: prev.items.filter(u => u._id !== id), total: Math.max(0, prev.total - 1) }));
    } catch (e) {
      alert(`Failed to delete: ${e.message}`);
    }
  };

  const submitUserModal = async () => {
    setUserModal(prev => ({ ...prev, submitting: true, error: '' }));
    try {
      if (userModal.mode === 'create') {
        await api.createUser(userModal.data);
      } else {
        const payload = { ...userModal.data };
        if (!payload.password) delete payload.password; // do not send empty password
        await api.updateUser(userModal.data._id, payload);
      }
      setUserModal({ open: false, mode: 'create', data: { name: '', email: '', password: '', role: 'visitor', isActive: true }, submitting: false, error: '' });
      // refresh list
      const res = await api.listUsers({ page: usersState.page, limit: usersState.limit, role: usersState.role || undefined });
      setUsersState(prev => ({ ...prev, items: res.items || [], total: res.total || 0 }));
    } catch (e) {
      setUserModal(prev => ({ ...prev, submitting: false, error: e.message || 'Failed to save user' }));
      return;
    }
  };

  const setMuseumVerification = async (id, verified) => {
    try {
      await api.setMuseumVerified(id, verified);
      setMuseumsState(prev => ({ ...prev, items: prev.items.map(m => (m._id === id ? { ...m, museumInfo: { ...(m.museumInfo || {}), verified } } : m)) }));
    } catch (e) {
      alert(`Failed to update: ${e.message}`);
    }
  };

  // Content moderation handlers
  const handleContentApprove = async (item) => {
    try {
      // optimistic UI update
      setContentModerationState(prev => ({
        ...prev,
        items: prev.items.map(i => i._id === item._id ? { ...i, status: 'approved', feedback: undefined } : i)
      }));
      await api.approveContent(item._id, item.type);
    } catch (e) {
      alert(`Failed to approve: ${e.message}`);
    }
  };

  const handleContentReject = (item) => {
    setFeedbackModal({ open: true, item, feedback: '', submitting: false });
  };

  const submitContentRejection = async () => {
    const { item, feedback } = feedbackModal;
    if (!feedback.trim()) {
      alert('Please provide feedback for the rejection.');
      return;
    }

    setFeedbackModal(prev => ({ ...prev, submitting: true }));
    try {
      await api.rejectContent(item._id, item.type, feedback);
      // optimistic update with feedback
      setContentModerationState(prev => ({
        ...prev,
        items: prev.items.map(i => i._id === item._id ? { ...i, status: 'rejected', feedback } : i)
      }));
      setFeedbackModal({ open: false, item: null, feedback: '', submitting: false });
    } catch (e) {
      alert(`Failed to reject: ${e.message}`);
      setFeedbackModal(prev => ({ ...prev, submitting: false }));
    }
  };

  // Mock content data for demonstration (fallback when API unavailable)
  const mockContentData = [
    {
      _id: '1',
      name: 'Ancient Ethiopian Crown',
      museum: 'National Museum',
      submittedAt: '2025-01-12',
      status: 'pending',
      type: 'artifact',
      description: 'A royal crown from the 15th century',
      category: 'Royal Artifacts'
    },
    {
      _id: '2', 
      name: 'Ethiopian Heritage Virtual Tour',
      museum: 'National Museum',
      submittedAt: '2025-01-11',
      status: 'pending',
      type: 'virtualMuseum',
      description: '360-degree virtual tour of main exhibition halls',
      artifacts: 25
    },
    {
      _id: '3',
      name: 'Coffee Ceremony Workshop', 
      museum: 'Ethnological Museum',
      submittedAt: '2025-01-10',
      status: 'rejected',
      type: 'event',
      date: '2025-02-15',
      feedback: 'Event date conflicts with national holiday. Please select alternative date.'
    },
    {
      _id: '4',
      artifactName: 'Ceremonial Sword',
      museum: 'National Museum',
      renter: 'University of Addis Ababa',
      submittedAt: '2025-01-09',
      status: 'pending',
      type: 'rental',
      duration: '30 days',
      fee: 'ETB 20,000'
    },
    {
      _id: '5',
      name: 'Traditional Coffee Set',
      museum: 'Ethnological Museum',
      submittedAt: '2025-01-08',
      status: 'approved',
      type: 'artifact',
      description: 'Complete traditional Ethiopian coffee ceremony set'
    }
  ];

  const getFilteredContent = () => {
    const source = contentModerationState.items.length ? contentModerationState.items : mockContentData;
    return source.filter(item => {
      const matchesStatus = contentModerationState.filterStatus === 'all' || item.status === contentModerationState.filterStatus;
      const matchesType = contentModerationState.typeFilter === 'all' || item.type === contentModerationState.typeFilter;
      const matchesMuseum = contentModerationState.museumFilter === 'all' || item.museum === contentModerationState.museumFilter;
      const matchesSearch = !contentModerationState.searchTerm || 
        (item.name?.toLowerCase().includes(contentModerationState.searchTerm.toLowerCase()) ||
         item.artifactName?.toLowerCase().includes(contentModerationState.searchTerm.toLowerCase()) ||
         item.museum?.toLowerCase().includes(contentModerationState.searchTerm.toLowerCase()));
      return matchesStatus && matchesType && matchesMuseum && matchesSearch;
    });
  };

  const StatCard = ({ title, value, growth, subtitle, icon: Icon, color = 'brown' }) => {
    const colorClasses = {
      brown: 'bg-amber-50 text-amber-800',
      darkBrown: 'bg-amber-100 text-amber-900',
      lightBrown: 'bg-stone-50 text-stone-700',
      neutral: 'bg-stone-100 text-stone-800'
    };
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-stone-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-stone-900 mb-1">{value.toLocaleString()}</p>
            <div className="flex items-center">
              <span className="text-sm text-amber-700 font-medium">+{growth}% from last month</span>
            </div>
            <p className="text-sm text-stone-500 mt-1">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.brown}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    );
  };

  const renderDashboardContent = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage the Ethiopian Heritage 360 platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          growth={stats.userGrowth}
          subtitle="Active platform users"
          icon={Users}
          color="brown"
        />
        <StatCard
          title="Museums"
          value={stats.museums}
          growth={stats.museumGrowth}
          subtitle="Registered museums"
          icon={Building2}
          color="darkBrown"
        />
        <StatCard
          title="Heritage Sites"
          value={stats.heritageSites}
          growth={stats.siteGrowth}
          subtitle="Mapped heritage locations"
          icon={MapPin}
          color="lightBrown"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-stone-200">
        <div className="px-6 py-4 border-b border-stone-200">
          <h3 className="text-lg font-semibold text-stone-900">Recent Platform Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
              <span className="text-sm text-stone-600">Recent Activities</span>
              <span className="text-xs text-stone-400">- hours ago</span>
            </div>
            
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-stone-200">
        <div className="px-6 py-4 border-b border-stone-200">
          <h3 className="text-lg font-semibold text-stone-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-stone-200 rounded-lg hover:bg-stone-50 text-left">
              <FileCheck className="h-6 w-6 text-amber-700 mb-2" />
              <h4 className="font-medium text-stone-900">Review Pending Approvals</h4>
              <p className="text-sm text-stone-600">12 items waiting for review</p>
            </button>
            <button className="p-4 border border-stone-200 rounded-lg hover:bg-stone-50 text-left">
              <Users className="h-6 w-6 text-amber-700 mb-2" />
              <h4 className="font-medium text-stone-900">Manage Users</h4>
              <p className="text-sm text-stone-600">View and manage user accounts</p>
            </button>
            <button className="p-4 border border-stone-200 rounded-lg hover:bg-stone-50 text-left">
              <BarChart3 className="h-6 w-6 text-amber-700 mb-2" />
              <h4 className="font-medium text-stone-900">View Analytics</h4>
              <p className="text-sm text-stone-600">Platform performance insights</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Load content items when Content Moderation section is active or filters/page change
  useEffect(() => {
    if (activeSection !== 'artifact-approval') return;
    const load = async () => {
      setContentModerationState(prev => ({ ...prev, loading: true, error: '' }));
      try {
        // Try API if available. If it fails, fallback to mock.
        if (typeof api.listContent === 'function') {
          const { page, limit, filterStatus, typeFilter, museumFilter, searchTerm } = contentModerationState;
          const res = await api.listContent({
            page,
            limit,
            status: filterStatus === 'all' ? undefined : filterStatus,
            type: typeFilter === 'all' ? undefined : typeFilter,
            museum: museumFilter === 'all' ? undefined : museumFilter,
            q: searchTerm || undefined,
          });
          setContentModerationState(prev => ({
            ...prev,
            items: res.items || [],
            total: res.total || (res.items ? res.items.length : 0),
            loading: false,
          }));
          return;
        }
        // Fallback to mock data with client-side paging
        const filtered = getFilteredContent();
        const start = (contentModerationState.page - 1) * contentModerationState.limit;
        const paged = filtered.slice(start, start + contentModerationState.limit);
        setContentModerationState(prev => ({ ...prev, items: paged, total: filtered.length, loading: false }));
      } catch (e) {
        // Fallback to mock on error as well
        const filtered = getFilteredContent();
        const start = (contentModerationState.page - 1) * contentModerationState.limit;
        const paged = filtered.slice(start, start + contentModerationState.limit);
        setContentModerationState(prev => ({ ...prev, items: paged, total: filtered.length, loading: false, error: e.message || 'Failed to load content' }));
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, contentModerationState.page, contentModerationState.limit, contentModerationState.filterStatus, contentModerationState.typeFilter, contentModerationState.museumFilter, contentModerationState.searchTerm]);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboardContent();
      case 'user-management':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
              <div className="flex items-center space-x-2">
                <select
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                  value={usersState.role}
                  onChange={(e) => setUsersState(prev => ({ ...prev, role: e.target.value, page: 1 }))}
                >
                  <option value="">All roles</option>
                  <option value="visitor">visitor</option>
                  <option value="museum">museum</option>
                  <option value="museum_admin">museum_admin</option>
                  <option value="organizer">organizer</option>
                  <option value="admin">admin</option>
                  <option value="super_admin">super_admin</option>
                </select>
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                  onClick={() => setUserModal({ open: true, mode: 'create', data: { name: '', email: '', password: '', role: 'visitor', isActive: true }, submitting: false, error: '' })}
                >
                  + Add User
                </button>
              </div>
            </div>
            <div className="p-6">
              {usersState.error && (
                <div className="mb-4 text-red-600 text-sm">{usersState.error}</div>
              )}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usersState.loading ? (
                      <tr><td colSpan="4" className="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
                    ) : usersState.items.length === 0 ? (
                      <tr><td colSpan="4" className="px-4 py-6 text-center text-gray-500">No users found</td></tr>
                    ) : (
                      usersState.items.map(u => (
                        <tr key={u._id}>
                          <td className="px-4 py-2 text-sm text-gray-900">{u.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{u.email}</td>
                          <td className="px-4 py-2">
                            <select
                              className="border border-gray-300 rounded px-2 py-1 text-sm"
                              value={u.role}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            >
                              <option value="visitor">visitor</option>
                              <option value="museum">museum</option>
                              <option value="museum_admin">museum_admin</option>
                              <option value="organizer">organizer</option>
                              <option value="admin">admin</option>
                              <option value="super_admin">super_admin</option>
                            </select>
                          </td>
                          <td className="px-4 py-2 text-right space-x-3">
                            <button className="text-blue-600 hover:text-blue-700 text-sm" onClick={() => setUserModal({ open: true, mode: 'edit', data: { ...u, password: '' }, submitting: false, error: '' })}>Edit</button>
                            <button className="text-red-600 hover:text-red-700 text-sm" onClick={() => handleDeleteUser(u._id)}>Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Page {usersState.page} of {Math.max(1, Math.ceil(usersState.total / usersState.limit))}
                </div>
                <div className="space-x-2">
                  <button
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                    disabled={usersState.page <= 1}
                    onClick={() => setUsersState(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Prev
                  </button>
                  <button
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                    disabled={usersState.page >= Math.ceil(usersState.total / usersState.limit)}
                    onClick={() => setUsersState(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Create/Edit User Modal */}
            {userModal.open && (
              <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">{userModal.mode === 'create' ? 'Add User' : 'Edit User'}</h3>
                  {userModal.error && <p className="text-red-600 text-sm mb-2">{userModal.error}</p>}
                  <div className="grid grid-cols-1 gap-3">
                    <input className="border rounded px-3 py-2" placeholder="Full name" value={userModal.data.name} onChange={(e) => setUserModal(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))} />
                    <input className="border rounded px-3 py-2" placeholder="Email" type="email" value={userModal.data.email} onChange={(e) => setUserModal(prev => ({ ...prev, data: { ...prev.data, email: e.target.value } }))} />
                    <input className="border rounded px-3 py-2" placeholder="Password" type="password" value={userModal.data.password || ''} onChange={(e) => setUserModal(prev => ({ ...prev, data: { ...prev.data, password: e.target.value } }))} />
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">Role</label>
                      <select className="border rounded px-2 py-1" value={userModal.data.role} onChange={(e) => setUserModal(prev => ({ ...prev, data: { ...prev.data, role: e.target.value } }))}>
                        <option value="visitor">visitor</option>
                        <option value="museum">museum</option>
                        <option value="museum_admin">museum_admin</option>
                        <option value="organizer">organizer</option>
                        <option value="admin">admin</option>
                        <option value="super_admin">super_admin</option>
                      </select>
                      <label className="text-sm text-gray-600 ml-4">
                        <input type="checkbox" className="mr-1" checked={!!userModal.data.isActive} onChange={(e) => setUserModal(prev => ({ ...prev, data: { ...prev.data, isActive: e.target.checked } }))} />
                        Active
                      </label>
                    </div>
                  </div>
                  <div className="mt-5 flex justify-end space-x-2">
                    <button className="px-3 py-1 border rounded" onClick={() => setUserModal({ open: false, mode: 'create', data: { name: '', email: '', password: '', role: 'visitor', isActive: true }, submitting: false, error: '' })} disabled={userModal.submitting}>Cancel</button>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={submitUserModal} disabled={userModal.submitting}>{userModal.submitting ? 'Saving...' : 'Save'}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'museum-oversight':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Museum Oversight</h3>
            </div>
            <div className="p-6">
              {museumsState.error && <div className="mb-4 text-red-600 text-sm">{museumsState.error}</div>}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Museum</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {museumsState.loading ? (
                      <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
                    ) : museumsState.items.length === 0 ? (
                      <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-500">No museums found</td></tr>
                    ) : (
                      museumsState.items.map(m => (
                        <tr key={m._id}>
                          <td className="px-4 py-2 text-sm text-gray-900">{m.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{m.email}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{m.museumInfo?.name || '-'}</td>
                          <td className="px-4 py-2 text-sm">{m.museumInfo?.verified ? 'Yes' : 'No'}</td>
                          <td className="px-4 py-2 text-right space-x-3">
                            {m.museumInfo?.verified ? (
                              <button className="text-yellow-700 hover:text-yellow-800 text-sm" onClick={() => setMuseumVerification(m._id, false)}>Reject</button>
                            ) : (
                              <button className="text-green-700 hover:text-green-800 text-sm" onClick={() => setMuseumVerification(m._id, true)}>Approve</button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Page {museumsState.page} of {Math.max(1, Math.ceil(museumsState.total / museumsState.limit))}
                </div>
                <div className="space-x-2">
                  <button className="px-3 py-1 border rounded text-sm disabled:opacity-50" disabled={museumsState.page <= 1} onClick={() => setMuseumsState(prev => ({ ...prev, page: prev.page - 1 }))}>Prev</button>
                  <button className="px-3 py-1 border rounded text-sm disabled:opacity-50" disabled={museumsState.page >= Math.ceil(museumsState.total / museumsState.limit)} onClick={() => setMuseumsState(prev => ({ ...prev, page: prev.page + 1 }))}>Next</button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'rental-oversight':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Rental Oversight</h3>
              <p className="text-sm text-gray-600">Monitor and manage all artifact rental activities</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800">Active Rentals</h4>
                  <p className="text-2xl font-bold text-blue-900">45</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800">Total Revenue</h4>
                  <p className="text-2xl font-bold text-green-900">ETB 2,85,000</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800">Pending Approvals</h4>
                  <p className="text-2xl font-bold text-yellow-900">8</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-800">Overdue Returns</h4>
                  <p className="text-2xl font-bold text-purple-900">3</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Artifact</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Renter</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-900">Ancient Vase</td>
                      <td className="px-4 py-2 text-sm text-gray-600">University of Addis</td>
                      <td className="px-4 py-2 text-sm text-gray-600">30 days</td>
                      <td className="px-4 py-2 text-sm text-gray-600">ETB 15,000</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
                      </td>
                      <td className="px-4 py-2 space-x-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm">View Details</button>
                        <button className="text-red-600 hover:text-red-700 text-sm">Terminate</button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-900">Historical Manuscript</td>
                      <td className="px-4 py-2 text-sm text-gray-600">Ethiopian Heritage Foundation</td>
                      <td className="px-4 py-2 text-sm text-gray-600">14 days</td>
                      <td className="px-4 py-2 text-sm text-gray-600">ETB 25,000</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Overdue</span>
                      </td>
                      <td className="px-4 py-2 space-x-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm">Contact</button>
                        <button className="text-red-600 hover:text-red-700 text-sm">Report Issue</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'system-settings':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
              <p className="text-sm text-gray-600">Configure platform-wide settings and parameters</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Platform Configuration</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                    <input type="text" className="w-full border rounded px-3 py-2" defaultValue="Ethiopian Heritage 360" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
                    <select className="w-full border rounded px-3 py-2">
                      <option>English</option>
                      <option>Amharic</option>
                      <option>Oromo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Upload Size (MB)</label>
                    <input type="number" className="w-full border rounded px-3 py-2" defaultValue="50" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Rental System Settings</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Rental Period (days)</label>
                    <input type="number" className="w-full border rounded px-3 py-2" defaultValue="30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (%)</label>
                    <input type="number" className="w-full border rounded px-3 py-2" defaultValue="20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Late Fee (ETB/day)</label>
                    <input type="number" className="w-full border rounded px-3 py-2" defaultValue="100" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Email Notifications</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm text-gray-700">New user registrations</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm text-gray-700">Artifact approvals</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm text-gray-700">Rental activities</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="text-sm text-gray-700">Weekly reports</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Security Settings</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
                    <input type="number" className="w-full border rounded px-3 py-2" defaultValue="30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Login Attempts</label>
                    <input type="number" className="w-full border rounded px-3 py-2" defaultValue="5" />
                  </div>
                  <div className="space-y-2">
                    <button className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Backup Database</button>
                    <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">Generate Reports</button>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t">
                <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Save All Settings</button>
              </div>
            </div>
          </div>
        );
      case 'platform-analytics':
        return <AnalyticsDashboard />;
      
      case 'heritage-sites':
        return <HeritageSiteManager />;
      
      
      case 'approval-feedback':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Approval Feedback System</h3>
              <p className="text-sm text-gray-600">Send comments/clarifications to Museum Admins for revisions</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-800">Rejections Sent</h4>
                  <p className="text-2xl font-bold text-red-900">8</p>
                  <p className="text-sm text-red-700">With feedback</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800">Awaiting Response</h4>
                  <p className="text-2xl font-bold text-yellow-900">5</p>
                  <p className="text-sm text-yellow-700">Museums revising content</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800">Resubmissions</h4>
                  <p className="text-2xl font-bold text-green-900">3</p>
                  <p className="text-sm text-green-700">Ready for review</p>
                </div>
              </div>
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-4">Send New Feedback</h4>
                <div className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Museum</label>
                      <select className="w-full border rounded px-3 py-2">
                        <option>Select Museum</option>
                        <option>National Museum</option>
                        <option>Ethnological Museum</option>
                        <option>Addis Ababa Museum</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                      <select className="w-full border rounded px-3 py-2">
                        <option>Artifact</option>
                        <option>Virtual Museum</option>
                        <option>Event Listing</option>
                        <option>Rental Request</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Feedback Message</label>
                    <textarea className="w-full border rounded px-3 py-2 h-24" placeholder="Provide detailed feedback for the museum admin to revise and resubmit..."></textarea>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Send Feedback</button>
                    <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Save Draft</button>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Recent Feedback Activity</h4>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-gray-900">Artifact Image Quality Issue</h5>
                      <span className="text-xs text-gray-500">2 hours ago</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">To: National Museum</p>
                    <p className="text-sm text-gray-700 mb-3">The artifact images need higher resolution (minimum 1920x1080) and better lighting. Please retake photos following the guidelines provided.</p>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Awaiting Response</span>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-gray-900">Event Date Conflict</h5>
                      <span className="text-xs text-gray-500">1 day ago</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">To: Ethnological Museum</p>
                    <p className="text-sm text-gray-700 mb-3">The proposed event date conflicts with a national holiday. Please select an alternative date from the available slots.</p>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Resolved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      
      case 'security':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Security Center</h3>
              <p className="text-sm text-gray-600">Security rules, access control, and monitoring</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800">System Status</h4>
                  <p className="text-2xl font-bold text-green-900">Secure</p>
                  <p className="text-sm text-green-700">All systems operational</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800">Active Sessions</h4>
                  <p className="text-2xl font-bold text-blue-900">247</p>
                  <p className="text-sm text-blue-700">Current user sessions</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800">Failed Logins</h4>
                  <p className="text-2xl font-bold text-yellow-900">12</p>
                  <p className="text-sm text-yellow-700">Last 24 hours</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-800">API Calls</h4>
                  <p className="text-2xl font-bold text-purple-900">15.2K</p>
                  <p className="text-sm text-purple-700">Today</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Access Control</h4>
                  <div className="space-y-4 border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Two-Factor Authentication</span>
                      <button className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">Enabled</button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">IP Whitelisting</span>
                      <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">Configure</button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Session Timeout</span>
                      <span className="text-sm text-gray-600">30 minutes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Password Policy</span>
                      <button className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm">Update</button>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Security Monitoring</h4>
                  <div className="space-y-3 border rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">SSL Certificate Valid</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">Database Encrypted</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">API Rate Limiting Active</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-gray-700">Backup Pending (Due in 2 days)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-4">Recent Security Events</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Event Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-600">2025-08-13 10:30</td>
                        <td className="px-4 py-2 text-sm text-gray-900">Failed Login Attempt</td>
                        <td className="px-4 py-2 text-sm text-gray-600">unknown@user.com</td>
                        <td className="px-4 py-2 text-sm text-gray-600">192.168.1.100</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Blocked</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-gray-600">2025-08-13 09:15</td>
                        <td className="px-4 py-2 text-sm text-gray-900">Admin Login</td>
                        <td className="px-4 py-2 text-sm text-gray-600">admin@heritage360.et</td>
                        <td className="px-4 py-2 text-sm text-gray-600">203.0.113.45</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Success</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'audit-logs':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Audit Logs</h3>
                <p className="text-sm text-gray-600">Track all approvals, rejections, and changes</p>
              </div>
              <div className="flex items-center space-x-2">
                <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                  <option>All Actions</option>
                  <option>Approvals</option>
                  <option>Rejections</option>
                  <option>User Changes</option>
                  <option>System Changes</option>
                </select>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Export Logs</button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800">Approvals</h4>
                  <p className="text-2xl font-bold text-green-900">156</p>
                  <p className="text-sm text-green-700">This month</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-800">Rejections</h4>
                  <p className="text-2xl font-bold text-red-900">23</p>
                  <p className="text-sm text-red-700">This month</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800">User Changes</h4>
                  <p className="text-2xl font-bold text-blue-900">45</p>
                  <p className="text-sm text-blue-700">This month</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-800">System Changes</h4>
                  <p className="text-2xl font-bold text-purple-900">12</p>
                  <p className="text-sm text-purple-700">This month</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-600">2025-08-13 10:30</td>
                      <td className="px-4 py-2 text-sm text-gray-900">Artifact Approved</td>
                      <td className="px-4 py-2 text-sm text-gray-600">super_admin@heritage360.et</td>
                      <td className="px-4 py-2 text-sm text-gray-600">Ancient Ethiopian Crown</td>
                      <td className="px-4 py-2 text-sm text-gray-600">National Museum submission</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Success</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-600">2025-08-13 09:45</td>
                      <td className="px-4 py-2 text-sm text-gray-900">User Role Changed</td>
                      <td className="px-4 py-2 text-sm text-gray-600">super_admin@heritage360.et</td>
                      <td className="px-4 py-2 text-sm text-gray-600">john@museum.et</td>
                      <td className="px-4 py-2 text-sm text-gray-600">visitor → museum_admin</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Updated</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-600">2025-08-13 08:30</td>
                      <td className="px-4 py-2 text-sm text-gray-900">Event Rejected</td>
                      <td className="px-4 py-2 text-sm text-gray-600">super_admin@heritage360.et</td>
                      <td className="px-4 py-2 text-sm text-gray-600">Coffee Ceremony Workshop</td>
                      <td className="px-4 py-2 text-sm text-gray-600">Date conflict - feedback sent</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Rejected</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-600">2025-08-12 16:15</td>
                      <td className="px-4 py-2 text-sm text-gray-900">System Setting Updated</td>
                      <td className="px-4 py-2 text-sm text-gray-600">super_admin@heritage360.et</td>
                      <td className="px-4 py-2 text-sm text-gray-600">Max Upload Size</td>
                      <td className="px-4 py-2 text-sm text-gray-600">Changed from 25MB to 50MB</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Modified</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-600">2025-08-12 14:20</td>
                      <td className="px-4 py-2 text-sm text-gray-900">Museum Verified</td>
                      <td className="px-4 py-2 text-sm text-gray-600">super_admin@heritage360.et</td>
                      <td className="px-4 py-2 text-sm text-gray-600">Addis Ababa Museum</td>
                      <td className="px-4 py-2 text-sm text-gray-600">Verification approved</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Verified</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">Showing 1-5 of 234 audit log entries</p>
                <div className="space-x-2">
                  <button className="px-3 py-1 border rounded text-sm">Previous</button>
                  <button className="px-3 py-1 border rounded text-sm">Next</button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        {/* Logo and User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <img 
              src={logo} 
              alt="Heritage 360 Logo" 
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Heritage 360</h2>
              <p className="text-sm text-gray-600">Super Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          {sidebarItems.map((section) => (
            <div key={section.category} className="p-4">
              <div 
                className="flex items-center justify-between cursor-pointer mb-3"
                onClick={() => setExpandedSections(prev => ({ 
                  ...prev, 
                  [section.category]: !prev[section.category] 
                }))}
              >
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {section.category}
                </h3>
                {expandedSections[section.category] ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
              
              {expandedSections[section.category] && (
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                          activeSection === item.id
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>
          ))}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <img 
              src={logo} 
              alt="Super Admin" 
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'Super Admin'}</p>
              <p className="text-xs text-gray-600">{user?.email || 'admin@heritage360.et'}</p>
            </div>
          </div>
          <LogoutButton 
            variant="sidebar"
            className="w-full text-red-600 hover:bg-red-50"
            showConfirmModal={true}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
