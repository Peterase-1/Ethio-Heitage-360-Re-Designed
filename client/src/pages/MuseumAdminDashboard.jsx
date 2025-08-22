import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import LogoutButton from '../components/common/LogoutButton';
import { 
  Building2, 
  Users, 
  Package, 
  Calendar, 
  TrendingUp, 
  Bell, 
  Settings,
  FileCheck, 
  DollarSign,
  BarChart3,
  Home,
  ChevronDown,
  ChevronUp,
  Eye,
  MessageSquare,
  Globe,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Archive,
  Plus,
  Edit,
  Trash2,
  Upload,
  Send,
  RefreshCw
} from 'lucide-react';
import logo from '../assets/Logo.jpg';

const MuseumAdminDashboard = ({ darkMode, toggleDarkMode }) => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [expandedSections, setExpandedSections] = useState({
    'Museum Management': true,
    'Content & Exhibitions': true,
    'Operations & Analytics': true,
    'Communications': true
  });

  // Museum profile state
  const [museumProfile, setMuseumProfile] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    openingHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true }
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: ''
    },
    loading: false,
    error: ''
  });

  // Artifacts management state
  const [artifactsState, setArtifactsState] = useState({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    category: '',
    searchTerm: '',
    loading: false,
    error: ''
  });

  // Staff management state
  const [staffState, setStaffState] = useState({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    loading: false,
    error: ''
  });

  // Virtual museum submissions state
  const [virtualMuseumState, setVirtualMuseumState] = useState({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    status: 'all',
    loading: false,
    error: ''
  });

  // Rental system state
  const [rentalState, setRentalState] = useState({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    status: 'all',
    loading: false,
    error: ''
  });

  // Events management state
  const [eventsState, setEventsState] = useState({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    loading: false,
    error: ''
  });

  // Analytics state
  const [analytics, setAnalytics] = useState({
    visitors: { total: 0, growth: 0 },
    artifacts: { total: 0, popular: [] },
    revenue: { total: 0, growth: 0 },
    events: { upcoming: 0, total: 0 }
  });

  // Notifications state
  const [notifications, setNotifications] = useState({
    unread: 0,
    items: [],
    loading: false
  });

  // Modals state
  const [artifactModal, setArtifactModal] = useState({ 
    open: false, 
    mode: 'create', 
    data: { 
      name: '', 
      description: '', 
      category: '', 
      period: '', 
      images: [],
      isAvailableForRental: false,
      rentalPrice: 0
    }, 
    submitting: false, 
    error: '' 
  });

  const [staffModal, setStaffModal] = useState({ 
    open: false, 
    mode: 'create', 
    data: { 
      name: '', 
      email: '', 
      role: 'curator', 
      permissions: [],
      isActive: true 
    }, 
    submitting: false, 
    error: '' 
  });

  const [eventModal, setEventModal] = useState({ 
    open: false, 
    mode: 'create', 
    data: { 
      title: '', 
      description: '', 
      date: '', 
      time: '', 
      duration: '', 
      capacity: 0,
      price: 0,
      isPublic: true
    }, 
    submitting: false, 
    error: '' 
  });

  const [virtualSubmissionModal, setVirtualSubmissionModal] = useState({
    open: false,
    data: {
      title: '',
      description: '',
      artifacts: [],
      submissionNotes: ''
    },
    submitting: false,
    error: ''
  });

  const sidebarItems = [
    {
      category: 'Museum Management',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Overview of museum operations and analytics' },
        { id: 'museum-profile', label: 'Museum Profile', icon: Building2, description: 'Update info, hours, contact details' },
        { id: 'staff-management', label: 'Staff Management', icon: Users, description: 'Add/remove staff and assign permissions' }
      ]
    },
    {
      category: 'Content & Exhibitions',
      items: [
        { id: 'artifact-management', label: 'Artifact Management', icon: Package, description: 'CRUD operations on museum collections' },
        { id: 'virtual-submissions', label: 'Virtual Museum', icon: Globe, description: 'Send digital artifacts/exhibits to Super Admin' },
        { id: 'event-management', label: 'Event Management', icon: Calendar, description: 'Create/edit events and exhibitions' }
      ]
    },
    {
      category: 'Operations & Analytics',
      items: [
        { id: 'rental-system', label: 'Rental System', icon: DollarSign, description: 'Manage artifact rental requests from users' },
        { id: 'visitor-analytics', label: 'Visitor Analytics', icon: BarChart3, description: 'Track museum visits, popular artifacts, revenue' },
        { id: 'notifications', label: 'Smart Notifications', icon: Bell, description: 'Alerts for pending approvals, rejected items' }
      ]
    },
    {
      category: 'Communications',
      items: [
        { id: 'admin-communication', label: 'Admin Communication', icon: MessageSquare, description: 'Direct channel to respond to Super Admin feedback' },
        { id: 'settings', label: 'Settings', icon: Settings, description: 'Museum-specific settings and preferences' }
      ]
    }
  ];

  // Load museum profile
  useEffect(() => {
    const loadMuseumProfile = async () => {
      if (activeSection !== 'museum-profile') return;
      setMuseumProfile(prev => ({ ...prev, loading: true, error: '' }));
      try {
        const response = await api.getMuseumProfile();
        if (response.museum) {
          setMuseumProfile(prev => ({ 
            ...prev, 
            ...response.museum, 
            loading: false 
          }));
        } else {
          setMuseumProfile(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        setMuseumProfile(prev => ({ 
          ...prev, 
          loading: false,
          error: 'Failed to load museum profile. Please check your connection and try again.'
        }));
      }
    };

    loadMuseumProfile();
  }, [activeSection]);

  // Load artifacts
  useEffect(() => {
    const loadArtifacts = async () => {
      if (activeSection !== 'artifact-management') return;
      setArtifactsState(prev => ({ ...prev, loading: true, error: '' }));
      try {
        const response = await api.getMuseumArtifacts({
          page: artifactsState.page,
          limit: artifactsState.limit,
          category: artifactsState.category || undefined,
          search: artifactsState.searchTerm || undefined
        });
        setArtifactsState(prev => ({
          ...prev,
          items: response.items || [],
          total: response.total || 0,
          loading: false
        }));
      } catch (error) {
        setArtifactsState(prev => ({
          ...prev,
          items: [],
          total: 0,
          loading: false,
          error: 'Failed to load artifacts. Please check your connection and try again.'
        }));
      }
    };

    loadArtifacts();
  }, [activeSection, artifactsState.page, artifactsState.limit, artifactsState.category, artifactsState.searchTerm]);

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      if (activeSection !== 'visitor-analytics' && activeSection !== 'dashboard') return;
      try {
        const response = await api.getMuseumAnalytics();
        if (response.analytics) {
          setAnalytics(response.analytics);
        } else {
          setAnalytics({
            visitors: { total: 0, growth: 0 },
            artifacts: { total: 0, popular: [] },
            revenue: { total: 0, growth: 0 },
            events: { upcoming: 0, total: 0 }
          });
        }
      } catch (error) {
        setAnalytics({
          visitors: { total: 0, growth: 0 },
          artifacts: { total: 0, popular: [] },
          revenue: { total: 0, growth: 0 },
          events: { upcoming: 0, total: 0 }
        });
      }
    };

    loadAnalytics();
  }, [activeSection]);

  const StatCard = ({ title, value, growth, subtitle, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {growth !== undefined && (
            <div className="flex items-center">
              <span className={`text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growth >= 0 ? '+' : ''}{growth}% from last month
              </span>
            </div>
          )}
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const renderDashboardContent = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Museum Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your museum operations and content</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Monthly Visitors"
          value={analytics.visitors.total}
          growth={analytics.visitors.growth}
          subtitle="Museum visits this month"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Artifacts"
          value={analytics.artifacts.total}
          subtitle="In your collection"
          icon={Package}
          color="green"
        />
        <StatCard
          title="Revenue"
          value={`₹${analytics.revenue.total.toLocaleString()}`}
          growth={analytics.revenue.growth}
          subtitle="From rentals and events"
          icon={DollarSign}
          color="purple"
        />
        <StatCard
          title="Upcoming Events"
          value={analytics.events.upcoming}
          subtitle={`${analytics.events.total} total this year`}
          icon={Calendar}
          color="orange"
        />
      </div>

      {/* Popular Artifacts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Artifacts</h3>
        <div className="space-y-3">
          {analytics.artifacts.popular.map((artifact, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">{artifact.name}</span>
              <span className="text-sm text-gray-500">{artifact.views} views</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveSection('artifact-management')}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <Package className="h-6 w-6 text-blue-600 mb-2" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Add Artifact</div>
              <div className="text-sm text-gray-500">Add new item to collection</div>
            </div>
          </button>
          <button 
            onClick={() => setActiveSection('event-management')}
            className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-sm transition-all"
          >
            <Calendar className="h-6 w-6 text-green-600 mb-2" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Create Event</div>
              <div className="text-sm text-gray-500">Schedule new exhibition</div>
            </div>
          </button>
          <button 
            onClick={() => setActiveSection('virtual-submissions')}
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all"
          >
            <Globe className="h-6 w-6 text-purple-600 mb-2" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Virtual Submission</div>
              <div className="text-sm text-gray-500">Submit to Super Admin</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderMuseumProfile = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Museum Profile</h1>
        <p className="text-gray-600 mt-1">Update your museum information and settings</p>
      </div>

      {museumProfile.error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">{museumProfile.error}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Museum Name</label>
            <input
              type="text"
              value={museumProfile.name}
              onChange={(e) => setMuseumProfile(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={museumProfile.email}
              onChange={(e) => setMuseumProfile(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={museumProfile.description}
              onChange={(e) => setMuseumProfile(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={museumProfile.address}
              onChange={(e) => setMuseumProfile(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={museumProfile.phone}
              onChange={(e) => setMuseumProfile(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <input
              type="url"
              value={museumProfile.website}
              onChange={(e) => setMuseumProfile(prev => ({ ...prev, website: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-8">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Opening Hours</h4>
          <div className="space-y-3">
            {Object.entries(museumProfile.openingHours || {}).map(([day, hours]) => (
              <div key={day} className="flex items-center space-x-4">
                <div className="w-20">
                  <label className="text-sm font-medium text-gray-700 capitalize">{day}</label>
                </div>
                <input
                  type="checkbox"
                  checked={!hours.closed}
                  onChange={(e) => setMuseumProfile(prev => ({
                    ...prev,
                    openingHours: {
                      ...prev.openingHours,
                      [day]: { ...hours, closed: !e.target.checked }
                    }
                  }))}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-600 mr-4">Open</span>
                {!hours.closed && (
                  <>
                    <input
                      type="time"
                      value={hours.open}
                      onChange={(e) => setMuseumProfile(prev => ({
                        ...prev,
                        openingHours: {
                          ...prev.openingHours,
                          [day]: { ...hours, open: e.target.value }
                        }
                      }))}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) => setMuseumProfile(prev => ({
                        ...prev,
                        openingHours: {
                          ...prev.openingHours,
                          [day]: { ...hours, close: e.target.value }
                        }
                      }))}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={async () => {
              setMuseumProfile(prev => ({ ...prev, loading: true }));
              try {
                await api.updateMuseumProfile(museumProfile);
                alert('Profile updated successfully!');
              } catch (error) {
                alert('Failed to update profile. Demo mode active.');
              } finally {
                setMuseumProfile(prev => ({ ...prev, loading: false }));
              }
            }}
            disabled={museumProfile.loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {museumProfile.loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderArtifactManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Artifact Management</h1>
          <p className="text-gray-600 mt-1">Manage your museum's artifact collection</p>
        </div>
        <button
          onClick={() => setArtifactModal({ 
            open: true, 
            mode: 'create', 
            data: { 
              name: '', 
              description: '', 
              category: '', 
              period: '', 
              images: [],
              isAvailableForRental: false,
              rentalPrice: 0
            }, 
            submitting: false, 
            error: '' 
          })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Artifact</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search artifacts..."
                value={artifactsState.searchTerm}
                onChange={(e) => setArtifactsState(prev => ({ 
                  ...prev, 
                  searchTerm: e.target.value, 
                  page: 1 
                }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={artifactsState.category}
            onChange={(e) => setArtifactsState(prev => ({ 
              ...prev, 
              category: e.target.value, 
              page: 1 
            }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            <option value="Royal Artifacts">Royal Artifacts</option>
            <option value="Cultural Artifacts">Cultural Artifacts</option>
            <option value="Documents">Documents</option>
            <option value="Textiles">Textiles</option>
            <option value="Jewelry">Jewelry</option>
          </select>
        </div>
      </div>

      {/* Artifacts List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {artifactsState.loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Loading artifacts...</p>
          </div>
        ) : artifactsState.items.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No artifacts found</p>
            <p className="text-gray-400">Add your first artifact to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artifact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rental
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {artifactsState.items.map((artifact) => (
                  <tr key={artifact._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{artifact.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {artifact.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {artifact.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {artifact.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {artifact.isAvailableForRental ? `₹${artifact.rentalPrice.toLocaleString()}` : 'Not for rent'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        artifact.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : artifact.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {artifact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setArtifactModal({ 
                            open: true, 
                            mode: 'edit', 
                            data: artifact, 
                            submitting: false, 
                            error: '' 
                          })}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this artifact?')) {
                              setArtifactsState(prev => ({
                                ...prev,
                                items: prev.items.filter(a => a._id !== artifact._id),
                                total: prev.total - 1
                              }));
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {artifactsState.total > artifactsState.limit && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((artifactsState.page - 1) * artifactsState.limit) + 1} to{' '}
              {Math.min(artifactsState.page * artifactsState.limit, artifactsState.total)} of{' '}
              {artifactsState.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setArtifactsState(prev => ({ 
                  ...prev, 
                  page: Math.max(1, prev.page - 1) 
                }))}
                disabled={artifactsState.page === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setArtifactsState(prev => ({ 
                  ...prev, 
                  page: prev.page + 1 
                }))}
                disabled={artifactsState.page * artifactsState.limit >= artifactsState.total}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {artifactsState.error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">{artifactsState.error}</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderVirtualSubmissions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Virtual Museum Submissions</h1>
          <p className="text-gray-600 mt-1">Submit digital exhibits to Super Admin for approval</p>
        </div>
        <button
          onClick={() => setVirtualSubmissionModal({
            open: true,
            data: {
              title: '',
              description: '',
              artifacts: [],
              submissionNotes: ''
            },
            submitting: false,
            error: ''
          })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Send className="h-4 w-4" />
          <span>New Submission</span>
        </button>
      </div>

      {/* Mock Submissions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artifacts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feedback
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Ethiopian Heritage Virtual Tour</div>
                    <div className="text-sm text-gray-500">360-degree virtual tour of main exhibition halls</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  25 artifacts
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  2025-01-11
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  -
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Royal Artifacts Showcase</div>
                    <div className="text-sm text-gray-500">Collection of royal Ethiopian artifacts</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  12 artifacts
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  2025-01-08
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Rejected
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Images need better resolution
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const toggleSection = (category) => {
    setExpandedSections(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboardContent();
      case 'museum-profile':
        return renderMuseumProfile();
      case 'artifact-management':
        return renderArtifactManagement();
      case 'virtual-submissions':
        return renderVirtualSubmissions();
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {sidebarItems.flatMap(cat => cat.items).find(item => item.id === activeSection)?.label}
              </h3>
              <p className="text-gray-500">This section is coming soon!</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Museum Admin</h2>
              <p className="text-sm text-gray-500">{user?.name || 'Museum Administrator'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {sidebarItems.map((section) => (
              <div key={section.category}>
                <button
                  onClick={() => toggleSection(section.category)}
                  className="w-full flex items-center justify-between p-3 text-left text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <span>{section.category}</span>
                  {expandedSections[section.category] ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                
                {expandedSections[section.category] && (
                  <div className="ml-4 space-y-1">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-start space-x-3 p-3 rounded-lg text-left transition-colors ${
                          activeSection === item.id
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <item.icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          activeSection === item.id ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{item.label}</div>
                          <div className="text-xs text-gray-500 mt-1 leading-tight">
                            {item.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-8">
          {renderContent()}
        </div>
      </div>

      {/* Artifact Modal */}
      {artifactModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {artifactModal.mode === 'create' ? 'Add New Artifact' : 'Edit Artifact'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={artifactModal.data.name}
                    onChange={(e) => setArtifactModal(prev => ({
                      ...prev,
                      data: { ...prev.data, name: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={artifactModal.data.description}
                    onChange={(e) => setArtifactModal(prev => ({
                      ...prev,
                      data: { ...prev.data, description: e.target.value }
                    }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={artifactModal.data.category}
                      onChange={(e) => setArtifactModal(prev => ({
                        ...prev,
                        data: { ...prev.data, category: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select category</option>
                      <option value="Royal Artifacts">Royal Artifacts</option>
                      <option value="Cultural Artifacts">Cultural Artifacts</option>
                      <option value="Documents">Documents</option>
                      <option value="Textiles">Textiles</option>
                      <option value="Jewelry">Jewelry</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                    <input
                      type="text"
                      value={artifactModal.data.period}
                      onChange={(e) => setArtifactModal(prev => ({
                        ...prev,
                        data: { ...prev.data, period: e.target.value }
                      }))}
                      placeholder="e.g., 15th Century"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={artifactModal.data.isAvailableForRental}
                      onChange={(e) => setArtifactModal(prev => ({
                        ...prev,
                        data: { ...prev.data, isAvailableForRental: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Available for rental</span>
                  </label>
                  
                  {artifactModal.data.isAvailableForRental && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rental Price (₹)</label>
                      <input
                        type="number"
                        value={artifactModal.data.rentalPrice}
                        onChange={(e) => setArtifactModal(prev => ({
                          ...prev,
                          data: { ...prev.data, rentalPrice: parseInt(e.target.value) || 0 }
                        }))}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {artifactModal.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{artifactModal.error}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setArtifactModal({ ...artifactModal, open: false })}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const { data } = artifactModal;
                    if (!data.name || !data.description || !data.category) {
                      setArtifactModal(prev => ({ ...prev, error: 'Please fill all required fields' }));
                      return;
                    }
                    
                    setArtifactModal(prev => ({ ...prev, submitting: true, error: '' }));
                    
                    try {
                      if (artifactModal.mode === 'create') {
                        // Simulate API call
                        const newArtifact = { 
                          ...data, 
                          _id: Date.now().toString(), 
                          status: 'pending' 
                        };
                        setArtifactsState(prev => ({
                          ...prev,
                          items: [newArtifact, ...prev.items],
                          total: prev.total + 1
                        }));
                      } else {
                        // Update existing
                        setArtifactsState(prev => ({
                          ...prev,
                          items: prev.items.map(a => a._id === data._id ? data : a)
                        }));
                      }
                      
                      setArtifactModal({ ...artifactModal, open: false });
                    } catch (error) {
                      setArtifactModal(prev => ({ 
                        ...prev, 
                        submitting: false, 
                        error: 'Failed to save artifact' 
                      }));
                    }
                  }}
                  disabled={artifactModal.submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {artifactModal.submitting ? 'Saving...' : 'Save Artifact'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Virtual Submission Modal */}
      {virtualSubmissionModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Submit Virtual Museum Exhibition
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exhibition Title</label>
                  <input
                    type="text"
                    value={virtualSubmissionModal.data.title}
                    onChange={(e) => setVirtualSubmissionModal(prev => ({
                      ...prev,
                      data: { ...prev.data, title: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={virtualSubmissionModal.data.description}
                    onChange={(e) => setVirtualSubmissionModal(prev => ({
                      ...prev,
                      data: { ...prev.data, description: e.target.value }
                    }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes to Super Admin</label>
                  <textarea
                    value={virtualSubmissionModal.data.submissionNotes}
                    onChange={(e) => setVirtualSubmissionModal(prev => ({
                      ...prev,
                      data: { ...prev.data, submissionNotes: e.target.value }
                    }))}
                    rows={3}
                    placeholder="Any special instructions or information for the approval process..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setVirtualSubmissionModal({ ...virtualSubmissionModal, open: false })}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const { data } = virtualSubmissionModal;
                    if (!data.title || !data.description) {
                      setVirtualSubmissionModal(prev => ({ ...prev, error: 'Please fill all required fields' }));
                      return;
                    }
                    
                    setVirtualSubmissionModal(prev => ({ ...prev, submitting: true, error: '' }));
                    
                    try {
                      // Simulate submission
                      await new Promise(resolve => setTimeout(resolve, 1000));
                      alert('Virtual museum submission sent to Super Admin for review!');
                      setVirtualSubmissionModal({ ...virtualSubmissionModal, open: false });
                    } catch (error) {
                      setVirtualSubmissionModal(prev => ({ 
                        ...prev, 
                        submitting: false, 
                        error: 'Failed to submit' 
                      }));
                    }
                  }}
                  disabled={virtualSubmissionModal.submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {virtualSubmissionModal.submitting ? 'Submitting...' : 'Submit for Approval'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuseumAdminDashboard;
