import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import LogoutButton from '../components/common/LogoutButton';
import CommunicationsCenter from '../components/admin/CommunicationsCenter';
import ErrorBoundary from '../components/common/ErrorBoundary';
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
  Archive,
  Monitor,
  Award,
  Star,
  BookOpen,
  GraduationCap,
  FileText,
  Users2,
  Presentation,
  Package
} from 'lucide-react';
import logo from '../assets/Logo.jpg';
import HeritageSiteManager from '../components/HeritageSiteManager';
import RentalRequestManager from '../components/RentalRequestManager';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import PerformanceAnalytics from '../components/PerformanceAnalytics';
import PerformanceMetricsDashboard from '../components/PerformanceMetricsDashboard';
import SuperAdminProgressManagement from '../components/admin/SuperAdminProgressManagement';

const SuperAdminDashboard = ({ darkMode, toggleDarkMode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [expandedSections, setExpandedSections] = useState({
    'Platform Overview': true,
    'User & Content Management': true,
    'Educational Management': true,
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

  // Enhanced dashboard data from backend
  const [dashboardData, setDashboardData] = useState(null);

  // User management state
  const [usersState, setUsersState] = useState({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    role: '',
    status: '',
    searchTerm: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    loading: false,
    error: ''
  });

  // User statistics state
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    usersByRole: [],
    usersByStatus: [],
    userActivity: [],
    loading: false,
    error: ''
  });

  // Bulk operations state
  const [bulkOperations, setBulkOperations] = useState({
    selectedUsers: [],
    action: '',
    loading: false,
    error: ''
  });

  // Create/Edit user modal state
  const [userModal, setUserModal] = useState({ open: false, mode: 'create', data: { name: '', email: '', password: '', role: 'visitor', isActive: true }, submitting: false, error: '' });

  // Museum oversight state
  const [museumsState, setMuseumsState] = useState({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    status: '',
    verified: '',
    region: '',
    searchTerm: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    loading: false,
    error: ''
  });

  // Museum statistics state
  const [museumStats, setMuseumStats] = useState({
    totalMuseums: 0,
    activeMuseums: 0,
    pendingMuseums: 0,
    approvedMuseums: 0,
    rejectedMuseums: 0,
    museumsByStatus: [],
    museumsByRegion: [],
    newMuseums: 0,
    museumActivity: [],
    loading: false,
    error: ''
  });

  // Heritage Sites state
  const [heritageSitesState, setHeritageSitesState] = useState({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    status: '',
    verified: '',
    region: '',
    type: '',
    designation: '',
    searchTerm: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    loading: false,
    error: ''
  });

  // Heritage Sites statistics state
  const [heritageSitesStats, setHeritageSitesStats] = useState({
    totalSites: 0,
    activeSites: 0,
    unescoSites: 0,
    verifiedSites: 0,
    newSites: 0,
    sitesByRegion: [],
    sitesByType: [],
    sitesByDesignation: [],
    conservationStatus: [],
    loading: false,
    error: ''
  });

  // Museum bulk operations state
  const [museumBulkOperations, setMuseumBulkOperations] = useState({
    selectedMuseums: [],
    action: '',
    loading: false,
    error: ''
  });

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    museumId: null,
    museumName: '',
    action: ''
  });

  // Museum rejection modal state
  const [rejectionModal, setRejectionModal] = useState({
    isOpen: false,
    museumId: null,
    museumName: '',
    reason: ''
  });

  // User deletion modal state
  const [userDeleteModal, setUserDeleteModal] = useState({
    isOpen: false,
    userId: null,
    userName: '',
    userEmail: ''
  });

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

  // Audit logs state
  const [auditLogsState, setAuditLogsState] = useState({
    items: [],
    total: 0,
    page: 1,
    limit: 20,
    loading: false,
    error: ''
  });

  const sidebarItems = [
    {
      category: 'Platform Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Complete analytics - user activity, artifact stats, rentals' },
        { id: 'platform-analytics', label: 'Platform Analytics', icon: BarChart3, description: 'Insights for all museums combined' },
        { id: 'performance-analytics', label: 'Performance Analytics', icon: Activity, description: 'Real-time system performance and metrics' },
        { id: 'performance-metrics', label: 'Performance Metrics', icon: Monitor, description: 'Live system monitoring and health metrics' },
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
      category: 'Educational Management',
      items: [
        { id: 'education-overview', label: 'Education Overview', icon: GraduationCap, description: 'Educational content statistics and management' },
        { id: 'course-management', label: 'Course Management', icon: BookOpen, description: 'Manage educational courses across the platform' },
        { id: 'assignment-management', label: 'Assignment Management', icon: FileText, description: 'Oversee assignments and grading system' },
        { id: 'student-management', label: 'Student Management', icon: Users2, description: 'Manage student enrollments and progress', link: '/super-admin/student-management' },
        { id: 'educational-tours', label: 'Educational Tours', icon: Presentation, description: 'Manage educational tour programs' }
      ]
    },
    {
      category: 'Business Operations',
      items: [
        { id: 'rental-requests', label: 'Rental System', icon: Package, description: 'Manage artifact rental requests between museums and virtual museum' },
        { id: 'communications', label: 'Communications', icon: MessageSquare, description: 'Communicate with Museum Admins and manage messages' }
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
    // Fetch enhanced dashboard data with retry logic
    const loadDashboard = async (retryCount = 0) => {
      const maxRetries = 3;
      
      try {
        console.log('Loading dashboard data...');
        const res = await api.getSuperAdminDashboard();
        
        if (res.success && res.dashboard) {
          const dashboard = res.dashboard;
          console.log('Dashboard data loaded successfully');

          // Update stats with enhanced data
          setStats((prev) => ({
            ...prev,
            totalUsers: dashboard.systemOverview?.users?.total ?? prev.totalUsers,
            museums: dashboard.systemOverview?.museums?.total ?? prev.museums,
            heritageSites: dashboard.systemOverview?.heritageSites?.total ?? prev.heritageSites,
            activeTours: dashboard.systemOverview?.rentals?.active ?? prev.activeTours,
            userGrowth: dashboard.trends?.userGrowth?.growthRate ?? prev.userGrowth,
            museumGrowth: dashboard.trends?.museumGrowth?.approvalRate ?? prev.museumGrowth,
            siteGrowth: dashboard.trends?.heritageSiteGrowth?.verificationRate ?? prev.siteGrowth,
            tourGrowth: dashboard.systemOverview?.rentals?.completionRate ?? prev.tourGrowth
          }));

          // Store enhanced dashboard data for use in components
          setDashboardData(dashboard);
        } else {
          throw new Error('Invalid dashboard response format');
        }
      } catch (e) {
        console.error(`Dashboard data load attempt ${retryCount + 1} failed:`, e.message);
        
        // Retry logic for network/timeout errors
        if (retryCount < maxRetries && 
            (e.message.includes('fetch') || e.message.includes('timeout') || 
             e.message.includes('502') || e.message.includes('503') ||
             e.message.includes('Failed to fetch') || e.message.includes('NetworkError'))) {
          const delay = 2000 * Math.pow(2, retryCount); // Exponential backoff: 2s, 4s, 8s
          console.log(`Retrying dashboard data load in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
          setTimeout(() => loadDashboard(retryCount + 1), delay);
          return;
        }
        
        // If all retries failed or it's a non-retryable error, try fallback
        console.log('Attempting fallback to basic stats API...');
        try {
          const res = await api.getAdminStats();
          const s = res.stats || {};
          console.log('Fallback stats loaded successfully');
          setStats((prev) => ({
            ...prev,
            totalUsers: s.totalUsers ?? prev.totalUsers,
            museums: s.totalMuseums ?? prev.museums,
          }));
        } catch (fallbackError) {
          console.error('Fallback stats also failed:', fallbackError.message);
          // Could set an error state here if needed for UI feedback
        }
      }
    };
    
    loadDashboard();
  }, []);

  // Load museums when Museum Oversight active
  useEffect(() => {
    if (activeSection !== 'museum-oversight') return;
    const loadMuseums = async () => {
      setMuseumsState(prev => ({ ...prev, loading: true, error: '' }));
      try {
        const { page, limit, status, verified, region, searchTerm, sortBy, sortOrder } = museumsState;

        // Use enhanced search API if search term is provided, otherwise use regular museums API
        const apiEndpoint = searchTerm ? '/super-admin/museums/search' : '/super-admin/museums';
        const queryParams = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          ...(status && { status }),
          ...(verified && { verified }),
          ...(region && { region }),
          ...(searchTerm && { q: searchTerm }),
          ...(sortBy && { sortBy }),
          ...(sortOrder && { sortOrder })
        });

        const res = await api.request(`${apiEndpoint}?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        setMuseumsState(prev => ({
          ...prev,
          items: res.museums || [],
          total: res.pagination?.total || 0,
          loading: false
        }));
      } catch (e) {
        setMuseumsState(prev => ({ ...prev, loading: false, error: e.message || 'Failed to load museums' }));
      }
    };
    loadMuseums();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, museumsState.page, museumsState.limit, museumsState.status, museumsState.verified, museumsState.region, museumsState.searchTerm, museumsState.sortBy, museumsState.sortOrder]);

  // Load museum statistics when Museum Oversight is active
  useEffect(() => {
    if (activeSection !== 'museum-oversight') return;
    const loadMuseumStats = async () => {
      setMuseumStats(prev => ({ ...prev, loading: true, error: '' }));
      try {
        const res = await api.getMuseumStatistics({ timeRange: '30d' });
        if (res.success) {
          setMuseumStats(prev => ({
            ...prev,
            totalMuseums: res.statistics?.totalMuseums || 0,
            activeMuseums: res.statistics?.activeMuseums || 0,
            pendingMuseums: res.statistics?.pendingMuseums || 0,
            approvedMuseums: res.statistics?.approvedMuseums || 0,
            rejectedMuseums: res.statistics?.rejectedMuseums || 0,
            museumsByStatus: res.statistics?.museumsByStatus || [],
            museumsByRegion: res.statistics?.museumsByRegion || [],
            newMuseums: res.statistics?.newMuseums || 0,
            museumActivity: res.statistics?.museumActivity || [],
            loading: false
          }));
        }
      } catch (e) {
        setMuseumStats(prev => ({ ...prev, loading: false, error: e.message || 'Failed to load museum statistics' }));
      }
    };
    loadMuseumStats();
  }, [activeSection]);

  // Load heritage sites when Heritage Sites section is active
  useEffect(() => {
    if (activeSection !== 'heritage-sites') return;
    const loadHeritageSites = async () => {
      setHeritageSitesState(prev => ({ ...prev, loading: true, error: '' }));
      try {
        const { page, limit, status, verified, region, type, designation, searchTerm, sortBy, sortOrder } = heritageSitesState;

        // Use enhanced search API if search term is provided, otherwise use regular heritage sites API
        const apiEndpoint = searchTerm ? '/super-admin/heritage-sites/search' : '/super-admin/heritage-sites';
        const queryParams = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          sortBy,
          sortOrder,
          ...(status && { status }),
          ...(verified && { verified }),
          ...(region && { region }),
          ...(type && { type }),
          ...(designation && { designation }),
          ...(searchTerm && { query: searchTerm })
        });

        const response = await api.request(`${apiEndpoint}?${queryParams.toString()}`);
        setHeritageSitesState(prev => ({
          ...prev,
          items: response.data || [],
          total: response.pagination?.total || 0,
          loading: false,
          error: ''
        }));
      } catch (error) {
        console.error('Load heritage sites error:', error);
        setHeritageSitesState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load heritage sites'
        }));
      }
    };
    loadHeritageSites();
  }, [activeSection, heritageSitesState.page, heritageSitesState.limit, heritageSitesState.status, heritageSitesState.verified, heritageSitesState.region, heritageSitesState.type, heritageSitesState.designation, heritageSitesState.searchTerm, heritageSitesState.sortBy, heritageSitesState.sortOrder]);

  // Load heritage sites statistics when Heritage Sites section is active
  useEffect(() => {
    if (activeSection !== 'heritage-sites') return;
    const loadHeritageSitesStats = async () => {
      setHeritageSitesStats(prev => ({ ...prev, loading: true, error: '' }));
      try {
        const response = await api.getHeritageSiteStatistics({ timeRange: '30d' });
        console.log('📊 Heritage Sites Statistics Response (useEffect):', response);
        if (response.success) {
          const stats = {
            totalSites: response.data.overview?.totalSites || 0,
            activeSites: response.data.overview?.activeSites || 0,
            unescoSites: response.data.overview?.unescoSites || 0,
            verifiedSites: response.data.overview?.verifiedSites || 0,
            newSites: response.data.overview?.newSites || 0,
            sitesByRegion: response.data.distribution?.byRegion || [],
            sitesByType: response.data.distribution?.byType || [],
            sitesByDesignation: response.data.distribution?.byDesignation || [],
            conservationStatus: response.data.distribution?.byConservationStatus || [],
            loading: false,
            error: ''
          };
          console.log('📊 Setting Heritage Sites Stats (useEffect):', stats);
          setHeritageSitesStats(prev => ({
            ...prev,
            ...stats
          }));
        }
      } catch (error) {
        console.error('Load heritage sites stats error:', error);
        setHeritageSitesStats(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to load heritage sites statistics'
        }));
      }
    };
    loadHeritageSitesStats();
  }, [activeSection]);

  // Load users function - moved outside useEffect to be accessible
  const loadUsers = async () => {
    setUsersState(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const { page, limit, role, status, searchTerm, sortBy, sortOrder } = usersState;

      // Use enhanced search API if search term is provided, otherwise use regular users API
      const apiEndpoint = searchTerm ? '/super-admin/users/search' : '/super-admin/users';
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(role && { role }),
        ...(status && { status }),
        ...(searchTerm && { q: searchTerm }),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder })
      });

      const res = await api.request(`${apiEndpoint}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setUsersState(prev => ({
        ...prev,
        items: res.users || [],
        total: res.pagination?.total || 0,
        loading: false
      }));
    } catch (e) {
      setUsersState(prev => ({ ...prev, loading: false, error: e.message || 'Failed to load users' }));
    }
  };

  // Load users when opening User Management or when paging/filter changes
  useEffect(() => {
    if (activeSection !== 'user-management') return;
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, usersState.page, usersState.limit, usersState.role, usersState.status, usersState.searchTerm, usersState.sortBy, usersState.sortOrder]);

  // Load user statistics function - moved outside useEffect to be accessible
  const loadUserStats = async () => {
    setUserStats(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const res = await api.getUserStatistics({ timeRange: '30d' });
      if (res.success) {
        setUserStats(prev => ({
          ...prev,
          totalUsers: res.statistics?.totalUsers || 0,
          activeUsers: res.statistics?.activeUsers || 0,
          newUsers: res.statistics?.newUsers || 0,
          usersByRole: res.statistics?.usersByRole || [],
          usersByStatus: res.statistics?.usersByStatus || [],
          userActivity: res.statistics?.userActivity || [],
          loading: false
        }));
      }
    } catch (e) {
      setUserStats(prev => ({ ...prev, loading: false, error: e.message || 'Failed to load user statistics' }));
    }
  };

  // Load user statistics when User Management is active
  useEffect(() => {
    if (activeSection !== 'user-management') return;
    loadUserStats();
  }, [activeSection]);

  // Load audit logs when Audit Logs section is active
  useEffect(() => {
    if (activeSection !== 'audit-logs') return;
    const loadAuditLogs = async () => {
      setAuditLogsState(prev => ({ ...prev, loading: true, error: '' }));
      try {
        const { page, limit } = auditLogsState;
        const queryParams = new URLSearchParams({
          page: String(page),
          limit: String(limit)
        });

        const res = await api.request(`/super-admin/audit-logs?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        setAuditLogsState(prev => ({
          ...prev,
          items: res.logs || [],
          total: res.pagination?.total || 0,
          loading: false
        }));
      } catch (e) {
        setAuditLogsState(prev => ({ ...prev, loading: false, error: e.message || 'Failed to load audit logs' }));
      }
    };
    loadAuditLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, auditLogsState.page, auditLogsState.limit]);

  const handleRoleChange = async (id, role) => {
    try {
      await api.setUserRole(id, role);
      setUsersState(prev => ({ ...prev, items: prev.items.map(u => (u._id === id ? { ...u, role } : u)) }));
    } catch (e) {
      alert(`Failed to update role: ${e.message}`);
    }
  };


  // Bulk operations handlers
  const handleBulkAction = async (action, userIds, data = {}) => {
    setBulkOperations(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const res = await api.bulkUserActions(action, userIds, data);
      if (res.success) {
        alert(`${res.message} (${res.modifiedCount || res.deletedCount} users affected)`);
        // Refresh user list
        setUsersState(prev => ({ ...prev, page: 1 }));
        setBulkOperations(prev => ({ ...prev, selectedUsers: [], action: '', loading: false }));
      } else {
        throw new Error(res.message || 'Bulk action failed');
      }
    } catch (e) {
      setBulkOperations(prev => ({ ...prev, loading: false, error: e.message }));
      alert(`Bulk action failed: ${e.message}`);
    }
  };

  const handleSelectUser = (userId) => {
    setBulkOperations(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter(id => id !== userId)
        : [...prev.selectedUsers, userId]
    }));
  };

  const handleSelectAllUsers = () => {
    setBulkOperations(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.length === usersState.items.length
        ? []
        : usersState.items.map(user => user._id)
    }));
  };

  // Museum bulk operations handlers
  const handleMuseumBulkAction = async (action, museumIds, data = {}) => {
    setMuseumBulkOperations(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const res = await api.bulkMuseumActions(action, museumIds, data);
      if (res.success) {
        alert(`${res.message} (${res.modifiedCount || res.deletedCount} museums affected)`);
        // Refresh museum list
        setMuseumsState(prev => ({ ...prev, page: 1 }));
        setMuseumBulkOperations(prev => ({ ...prev, selectedMuseums: [], action: '', loading: false }));
      } else {
        throw new Error(res.message || 'Bulk action failed');
      }
    } catch (e) {
      setMuseumBulkOperations(prev => ({ ...prev, loading: false, error: e.message }));
      alert(`Bulk action failed: ${e.message}`);
    }
  };

  const handleSelectMuseum = (museumId) => {
    setMuseumBulkOperations(prev => ({
      ...prev,
      selectedMuseums: prev.selectedMuseums.includes(museumId)
        ? prev.selectedMuseums.filter(id => id !== museumId)
        : [...prev.selectedMuseums, museumId]
    }));
  };

  const handleSelectAllMuseums = () => {
    setMuseumBulkOperations(prev => ({
      ...prev,
      selectedMuseums: prev.selectedMuseums.length === museumsState.items.length
        ? []
        : museumsState.items.map(museum => museum._id)
    }));
  };

  // Handle museum delete with confirmation
  const handleMuseumDelete = (museumId, museumName) => {
    setDeleteModal({
      isOpen: true,
      museumId,
      museumName,
      action: 'delete'
    });
  };

  // Confirm museum deletion
  const confirmMuseumDelete = async () => {
    if (!deleteModal.museumId) return;

    try {
      const result = await api.bulkMuseumActions('delete', [deleteModal.museumId]);
      if (result.success) {
        // Reload museums and statistics
        await loadMuseums();
        await loadMuseumStats();

        // Close modal
        setDeleteModal({ isOpen: false, museumId: null, museumName: '', action: '' });

        // Show success message
        alert(`Successfully deleted museum: ${deleteModal.museumName}`);
      } else {
        alert(`Failed to delete museum: ${result.message}`);
      }
    } catch (error) {
      console.error('Museum delete error:', error);
      alert('Failed to delete museum');
    }
  };

  // Handle museum rejection with modal
  const handleMuseumRejection = (museumId, museumName) => {
    setRejectionModal({
      isOpen: true,
      museumId,
      museumName,
      reason: ''
    });
  };

  // Confirm museum rejection
  const confirmMuseumRejection = async () => {
    if (!rejectionModal.museumId) return;

    try {
      const result = await api.bulkMuseumActions('reject', [rejectionModal.museumId], { reason: rejectionModal.reason });
      if (result.success) {
        // Reload museums and statistics
        await loadMuseums();
        await loadMuseumStats();

        // Close modal
        setRejectionModal({ isOpen: false, museumId: null, museumName: '', reason: '' });

        // Show success message
        alert(`Successfully rejected museum: ${rejectionModal.museumName}`);
      } else {
        alert(`Failed to reject museum: ${result.message}`);
      }
    } catch (error) {
      console.error('Museum rejection error:', error);
      alert('Failed to reject museum');
    }
  };

  // Handle user deletion with modal
  const handleUserDeletion = (userId, userName, userEmail) => {
    setUserDeleteModal({
      isOpen: true,
      userId,
      userName,
      userEmail
    });
  };

  // Confirm user deletion
  const confirmUserDeletion = async () => {
    if (!userDeleteModal.userId) return;

    try {
      const result = await api.deleteUser(userDeleteModal.userId);
      if (result.success) {
        // Reload users and statistics
        await loadUsers();
        await loadUserStats();

        // Close modal
        setUserDeleteModal({ isOpen: false, userId: null, userName: '', userEmail: '' });

        // Show success message
        alert(`Successfully deleted user: ${userDeleteModal.userName}`);
      } else {
        alert(`Failed to delete user: ${result.message}`);
      }
    } catch (error) {
      console.error('User deletion error:', error);
      alert('Failed to delete user');
    }
  };

  // Standalone functions for refresh buttons
  const loadMuseums = async () => {
    setMuseumsState(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const { page, limit, status, verified, region, searchTerm, sortBy, sortOrder } = museumsState;

      // Use enhanced search API if search term is provided, otherwise use regular museums API
      const apiEndpoint = searchTerm ? '/super-admin/museums/search' : '/super-admin/museums';
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy,
        sortOrder,
        ...(status && { status }),
        ...(verified !== '' && { verified }),
        ...(region && { region }),
        ...(searchTerm && { q: searchTerm })
      });

      const res = await api.request(`${apiEndpoint}?${queryParams.toString()}`);
      if (res.success) {
        setMuseumsState(prev => ({
          ...prev,
          items: res.museums || res.data || [],
          total: res.pagination?.total || res.total || 0,
          loading: false,
          error: ''
        }));
      } else {
        throw new Error(res.message || 'Failed to load museums');
      }
    } catch (error) {
      console.error('Load museums error:', error);
      setMuseumsState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load museums'
      }));
    }
  };

  const loadMuseumStats = async () => {
    setMuseumStats(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const res = await api.getMuseumStatistics({ timeRange: '30d' });
      if (res.success) {
        setMuseumStats(prev => ({
          ...prev,
          totalMuseums: res.statistics?.totalMuseums || 0,
          activeMuseums: res.statistics?.activeMuseums || 0,
          pendingMuseums: res.statistics?.pendingMuseums || 0,
          approvedMuseums: res.statistics?.approvedMuseums || 0,
          rejectedMuseums: res.statistics?.rejectedMuseums || 0,
          museumsByStatus: res.statistics?.museumsByStatus || [],
          museumsByRegion: res.statistics?.museumsByRegion || [],
          newMuseums: res.statistics?.newMuseums || 0,
          museumActivity: res.statistics?.museumActivity || [],
          loading: false,
          error: ''
        }));
      } else {
        throw new Error(res.message || 'Failed to load museum statistics');
      }
    } catch (error) {
      console.error('Load museum stats error:', error);
      setMuseumStats(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load museum statistics'
      }));
    }
  };

  // Heritage Sites loading functions for refresh button
  const loadHeritageSites = async () => {
    setHeritageSitesState(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const { page, limit, status, verified, region, type, designation, searchTerm, sortBy, sortOrder } = heritageSitesState;

      // Use enhanced search API if search term is provided, otherwise use regular heritage sites API
      const apiEndpoint = searchTerm ? '/super-admin/heritage-sites/search' : '/super-admin/heritage-sites';
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy,
        sortOrder,
        ...(status && { status }),
        ...(verified && { verified }),
        ...(region && { region }),
        ...(type && { type }),
        ...(designation && { designation }),
        ...(searchTerm && { query: searchTerm })
      });

      const response = await api.request(`${apiEndpoint}?${queryParams.toString()}`);
      setHeritageSitesState(prev => ({
        ...prev,
        items: response.data || [],
        total: response.pagination?.total || 0,
        loading: false,
        error: ''
      }));
    } catch (error) {
      console.error('Load heritage sites error:', error);
      setHeritageSitesState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load heritage sites'
      }));
    }
  };

  const loadHeritageSitesStats = async () => {
    setHeritageSitesStats(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const response = await api.getHeritageSiteStatistics({ timeRange: '30d' });
      console.log('📊 Heritage Sites Statistics Response:', response);
      if (response.success) {
        const stats = {
          totalSites: response.data.overview?.totalSites || 0,
          activeSites: response.data.overview?.activeSites || 0,
          unescoSites: response.data.overview?.unescoSites || 0,
          verifiedSites: response.data.overview?.verifiedSites || 0,
          newSites: response.data.overview?.newSites || 0,
          sitesByRegion: response.data.distribution?.byRegion || [],
          sitesByType: response.data.distribution?.byType || [],
          sitesByDesignation: response.data.distribution?.byDesignation || [],
          conservationStatus: response.data.distribution?.byConservationStatus || [],
          loading: false,
          error: ''
        };
        console.log('📊 Setting Heritage Sites Stats:', stats);
        setHeritageSitesStats(prev => ({
          ...prev,
          ...stats
        }));
      } else {
        throw new Error(response.message || 'Failed to load heritage sites statistics');
      }
    } catch (error) {
      console.error('Load heritage sites stats error:', error);
      setHeritageSitesStats(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load heritage sites statistics'
      }));
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
          subtitle={`${dashboardData?.systemOverview?.users?.active || 0} active users`}
          icon={Users}
          color="brown"
        />
        <StatCard
          title="Museums"
          value={stats.museums}
          growth={stats.museumGrowth}
          subtitle={`${dashboardData?.systemOverview?.museums?.pendingApprovals || 0} pending approval`}
          icon={Building2}
          color="darkBrown"
        />
        <StatCard
          title="Heritage Sites"
          value={stats.heritageSites}
          growth={stats.siteGrowth}
          subtitle={`${dashboardData?.systemOverview?.heritageSites?.unesco || 0} UNESCO sites`}
          icon={MapPin}
          color="lightBrown"
        />
        <StatCard
          title="Active Rentals"
          value={stats.activeTours}
          growth={stats.tourGrowth}
          subtitle={`${dashboardData?.systemOverview?.rentals?.revenue || 0} ETB revenue`}
          icon={DollarSign}
          color="green"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-stone-200">
        <div className="px-6 py-4 border-b border-stone-200">
          <h3 className="text-lg font-semibold text-stone-900">Recent Platform Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {dashboardData?.recentActivities?.length > 0 ? (
              dashboardData.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${activity.type === 'user_registration' ? 'bg-green-500' :
                    activity.type === 'museum_application' ? 'bg-blue-500' :
                      'bg-amber-600'
                    }`}></div>
                  <span className="text-sm text-stone-600">{activity.description}</span>
                  <span className="text-xs text-stone-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-stone-600">No recent activity</span>
              </div>
            )}
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
            <button
              className="p-4 border border-stone-200 rounded-lg hover:bg-stone-50 text-left"
              onClick={() => setActiveSection('artifact-approval')}
            >
              <FileCheck className="h-6 w-6 text-amber-700 mb-2" />
              <h4 className="font-medium text-stone-900">Review Pending Approvals</h4>
              <p className="text-sm text-stone-600">
                {dashboardData?.alerts?.pendingApprovals || 0} items waiting for review
              </p>
            </button>
            <button
              className="p-4 border border-stone-200 rounded-lg hover:bg-stone-50 text-left"
              onClick={() => setActiveSection('user-management')}
            >
              <Users className="h-6 w-6 text-amber-700 mb-2" />
              <h4 className="font-medium text-stone-900">Manage Users</h4>
              <p className="text-sm text-stone-600">View and manage user accounts</p>
            </button>
            <button
              className="p-4 border border-stone-200 rounded-lg hover:bg-stone-50 text-left"
              onClick={() => setActiveSection('platform-analytics')}
            >
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
          <div className="space-y-6">
            {/* User Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{userStats.totalUsers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Active Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{userStats.activeUsers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">New This Month</p>
                    <p className="text-2xl font-semibold text-gray-900">{userStats.newUsers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Roles</p>
                    <p className="text-2xl font-semibold text-gray-900">{userStats.usersByRole.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced User Management */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={() => {
                        loadUsers();
                        loadUserStats();
                      }}
                      disabled={usersState.loading}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {usersState.loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                      onClick={() => setUserModal({ open: true, mode: 'create', data: { name: '', email: '', password: '', role: 'visitor', isActive: true }, submitting: false, error: '' })}
                    >
                      + Add User
                    </button>
                  </div>
                </div>
              </div>

              {/* Enhanced Filters and Search */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      placeholder="Search by name, email..."
                      value={usersState.searchTerm}
                      onChange={(e) => setUsersState(prev => ({ ...prev, searchTerm: e.target.value, page: 1 }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      value={usersState.role}
                      onChange={(e) => setUsersState(prev => ({ ...prev, role: e.target.value, page: 1 }))}
                    >
                      <option value="">All roles</option>
                      <option value="visitor">visitor</option>
                      <option value="museum">museum</option>
                      <option value="museum_admin">museum_admin</option>
                      <option value="admin">admin</option>
                      <option value="super_admin">super_admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      value={usersState.status}
                      onChange={(e) => setUsersState(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                    >
                      <option value="">All status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="verified">Verified</option>
                      <option value="unverified">Unverified</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      value={`${usersState.sortBy}-${usersState.sortOrder}`}
                      onChange={(e) => {
                        const [sortBy, sortOrder] = e.target.value.split('-');
                        setUsersState(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
                      }}
                    >
                      <option value="createdAt-desc">Newest First</option>
                      <option value="createdAt-asc">Oldest First</option>
                      <option value="name-asc">Name A-Z</option>
                      <option value="name-desc">Name Z-A</option>
                      <option value="email-asc">Email A-Z</option>
                      <option value="email-desc">Email Z-A</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bulk Operations Bar */}
              {bulkOperations.selectedUsers.length > 0 && (
                <div className="px-6 py-3 bg-blue-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">
                      {bulkOperations.selectedUsers.length} user(s) selected
                    </span>
                    <div className="flex items-center space-x-2">
                      <select
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                        value={bulkOperations.action}
                        onChange={(e) => setBulkOperations(prev => ({ ...prev, action: e.target.value }))}
                      >
                        <option value="">Select action...</option>
                        <option value="activate">Activate</option>
                        <option value="deactivate">Deactivate</option>
                        <option value="verify">Verify</option>
                        <option value="unverify">Unverify</option>
                        <option value="changeRole">Change Role</option>
                        <option value="delete">Delete</option>
                      </select>
                      {bulkOperations.action && (
                        <>
                          {bulkOperations.action === 'changeRole' && (
                            <select
                              className="border border-gray-300 rounded px-2 py-1 text-sm"
                              onChange={(e) => {
                                const role = e.target.value;
                                if (role) {
                                  handleBulkAction('changeRole', bulkOperations.selectedUsers, { role });
                                }
                              }}
                            >
                              <option value="">Select role...</option>
                              <option value="visitor">visitor</option>
                              <option value="museum">museum</option>
                              <option value="museum_admin">museum_admin</option>
                              <option value="admin">admin</option>
                              <option value="super_admin">super_admin</option>
                            </select>
                          )}
                          <button
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                            onClick={() => handleBulkAction(bulkOperations.action, bulkOperations.selectedUsers)}
                            disabled={bulkOperations.loading}
                          >
                            {bulkOperations.loading ? 'Processing...' : 'Apply'}
                          </button>
                        </>
                      )}
                      <button
                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                        onClick={() => setBulkOperations(prev => ({ ...prev, selectedUsers: [], action: '' }))}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6">
                {usersState.error && (
                  <div className="mb-4 text-red-600 text-sm">{usersState.error}</div>
                )}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">
                          <input
                            type="checkbox"
                            checked={bulkOperations.selectedUsers.length === usersState.items.length && usersState.items.length > 0}
                            onChange={handleSelectAllUsers}
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {usersState.loading ? (
                        <tr><td colSpan="7" className="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
                      ) : usersState.items.length === 0 ? (
                        <tr><td colSpan="7" className="px-4 py-6 text-center text-gray-500">No users found</td></tr>
                      ) : (
                        usersState.items.map(u => (
                          <tr key={u._id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                checked={bulkOperations.selectedUsers.includes(u._id)}
                                onChange={() => handleSelectUser(u._id)}
                                className="rounded border-gray-300"
                              />
                            </td>
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
                                <option value="admin">admin</option>
                                <option value="super_admin">super_admin</option>
                              </select>
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                  {u.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${u.isEmailVerified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                  {u.isEmailVerified ? 'Verified' : 'Unverified'}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-4 py-2 text-right space-x-2">
                              <button
                                className="text-blue-600 hover:text-blue-700 text-sm"
                                onClick={() => setUserModal({ open: true, mode: 'edit', data: { ...u, password: '' }, submitting: false, error: '' })}
                              >
                                Edit
                              </button>
                              <button
                                className="text-red-600 hover:text-red-700 text-sm"
                                onClick={() => handleUserDeletion(u._id, u.name, u.email)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Enhanced Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Showing {((usersState.page - 1) * usersState.limit) + 1} to {Math.min(usersState.page * usersState.limit, usersState.total)} of {usersState.total} users
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                      disabled={usersState.page <= 1}
                      onClick={() => setUsersState(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">
                      Page {usersState.page} of {Math.max(1, Math.ceil(usersState.total / usersState.limit))}
                    </span>
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
          <div className="space-y-6">
            {/* Museum Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Museums</p>
                    <p className="text-2xl font-semibold text-gray-900">{museumStats.totalMuseums}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Active</p>
                    <p className="text-2xl font-semibold text-gray-900">{museumStats.activeMuseums}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-2xl font-semibold text-gray-900">{museumStats.pendingMuseums}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Approved</p>
                    <p className="text-2xl font-semibold text-gray-900">{museumStats.approvedMuseums}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Rejected</p>
                    <p className="text-2xl font-semibold text-gray-900">{museumStats.rejectedMuseums}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Museum Oversight */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Museum Oversight</h3>
                  <button
                    className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => {
                      loadMuseums();
                      loadMuseumStats();
                    }}
                    disabled={museumsState.loading}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {museumsState.loading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
              </div>

              {/* Enhanced Filters and Search */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      placeholder="Search by name, description..."
                      value={museumsState.searchTerm}
                      onChange={(e) => setMuseumsState(prev => ({ ...prev, searchTerm: e.target.value, page: 1 }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      value={museumsState.status}
                      onChange={(e) => setMuseumsState(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                    >
                      <option value="">All status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Verified</label>
                    <select
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      value={museumsState.verified}
                      onChange={(e) => setMuseumsState(prev => ({ ...prev, verified: e.target.value, page: 1 }))}
                    >
                      <option value="">All</option>
                      <option value="true">Verified</option>
                      <option value="false">Unverified</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                    <select
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      value={museumsState.region}
                      onChange={(e) => setMuseumsState(prev => ({ ...prev, region: e.target.value, page: 1 }))}
                    >
                      <option value="">All regions</option>
                      <option value="Addis Ababa">Addis Ababa</option>
                      <option value="Oromia">Oromia</option>
                      <option value="Amhara">Amhara</option>
                      <option value="Tigray">Tigray</option>
                      <option value="SNNPR">SNNPR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      value={`${museumsState.sortBy}-${museumsState.sortOrder}`}
                      onChange={(e) => {
                        const [sortBy, sortOrder] = e.target.value.split('-');
                        setMuseumsState(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
                      }}
                    >
                      <option value="createdAt-desc">Newest First</option>
                      <option value="createdAt-asc">Oldest First</option>
                      <option value="name-asc">Name A-Z</option>
                      <option value="name-desc">Name Z-A</option>
                      <option value="status-asc">Status A-Z</option>
                      <option value="status-desc">Status Z-A</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bulk Operations Bar */}
              {museumBulkOperations.selectedMuseums.length > 0 && (
                <div className="px-6 py-3 bg-blue-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">
                      {museumBulkOperations.selectedMuseums.length} museum(s) selected
                    </span>
                    <div className="flex items-center space-x-2">
                      <select
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                        value={museumBulkOperations.action}
                        onChange={(e) => setMuseumBulkOperations(prev => ({ ...prev, action: e.target.value }))}
                      >
                        <option value="">Select action...</option>
                        <option value="approve">Approve</option>
                        <option value="reject">Reject</option>
                        <option value="suspend">Suspend</option>
                        <option value="activate">Activate</option>
                        <option value="deactivate">Deactivate</option>
                        <option value="verify">Verify</option>
                        <option value="unverify">Unverify</option>
                        <option value="delete">Delete</option>
                      </select>
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                        onClick={() => handleMuseumBulkAction(museumBulkOperations.action, museumBulkOperations.selectedMuseums)}
                        disabled={museumBulkOperations.loading}
                      >
                        {museumBulkOperations.loading ? 'Processing...' : 'Apply'}
                      </button>
                      <button
                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                        onClick={() => setMuseumBulkOperations(prev => ({ ...prev, selectedMuseums: [], action: '' }))}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6">
                {museumsState.error && (
                  <div className="mb-4 text-red-600 text-sm">{museumsState.error}</div>
                )}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">
                          <input
                            type="checkbox"
                            checked={museumBulkOperations.selectedMuseums.length === museumsState.items.length && museumsState.items.length > 0}
                            onChange={handleSelectAllMuseums}
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {museumsState.loading ? (
                        <tr><td colSpan="7" className="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
                      ) : museumsState.items.length === 0 ? (
                        <tr><td colSpan="7" className="px-4 py-6 text-center text-gray-500">No museums found</td></tr>
                      ) : (
                        museumsState.items.map(m => (
                          <tr key={m._id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                checked={museumBulkOperations.selectedMuseums.includes(m._id)}
                                onChange={() => handleSelectMuseum(m._id)}
                                className="rounded border-gray-300"
                              />
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">{m.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{m.location?.address || '-'}</td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${m.status === 'approved' ? 'bg-green-100 text-green-800' :
                                m.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  m.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                {m.status || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${m.verified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {m.verified ? 'Verified' : 'Unverified'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-4 py-2 text-right space-x-2">
                              <button
                                className="text-blue-600 hover:text-blue-700 text-sm"
                                onClick={() => {
                                  if (m.status === 'approved') {
                                    handleMuseumRejection(m._id, m.name);
                                  } else {
                                    handleMuseumBulkAction('approve', [m._id]);
                                  }
                                }}
                              >
                                {m.status === 'approved' ? 'Reject' : 'Approve'}
                              </button>
                              <button
                                className="text-red-600 hover:text-red-700 text-sm"
                                onClick={() => handleMuseumDelete(m._id, m.name)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Enhanced Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Showing {((museumsState.page - 1) * museumsState.limit) + 1} to {Math.min(museumsState.page * museumsState.limit, museumsState.total)} of {museumsState.total} museums
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                      disabled={museumsState.page <= 1}
                      onClick={() => setMuseumsState(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">
                      Page {museumsState.page} of {Math.max(1, Math.ceil(museumsState.total / museumsState.limit))}
                    </span>
                    <button
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                      disabled={museumsState.page >= Math.ceil(museumsState.total / museumsState.limit)}
                      onClick={() => setMuseumsState(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      Next
                    </button>
                  </div>
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

      case 'performance-analytics':
        return <PerformanceAnalytics />;

      case 'performance-metrics':
        return <PerformanceMetricsDashboard />;

      case 'heritage-sites':
        return (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Heritage Sites Management</h2>
              <p className="text-gray-600">Manage Ethiopian cultural and heritage sites</p>
            </div>

            {/* Heritage Sites Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{heritageSitesStats.totalSites || 0}</p>
                    <p className="text-sm text-gray-600">Total Sites</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{heritageSitesStats.activeSites || 0}</p>
                    <p className="text-sm text-gray-600">Active Sites</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{heritageSitesStats.unescoSites || 0}</p>
                    <p className="text-sm text-gray-600">UNESCO Sites</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Heritage Sites Management Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <button
                    className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => {
                      loadHeritageSites();
                      loadHeritageSitesStats();
                    }}
                    disabled={heritageSitesState.loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-1 ${heritageSitesState.loading ? 'animate-spin' : ''}`} />
                    {heritageSitesState.loading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
              </div>

              <div className="p-6">
                {heritageSitesState.error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Connection Error</h4>
                        <p className="text-sm text-red-700 mt-1">
                          {heritageSitesState.error.includes('Failed to fetch')
                            ? 'Server is not running. Please start the server to view heritage sites.'
                            : heritageSitesState.error
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <HeritageSiteManager onDataChange={() => {
                  loadHeritageSitesStats();
                }} />
              </div>
            </div>
          </div>
        );

      case 'rental-requests':
        return (
          <div className="space-y-6">
            <RentalRequestManager />
          </div>
        );

      case 'education-overview':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Education Overview</h3>
                <p className="text-sm text-gray-600">Educational content statistics and management</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <GraduationCap className="h-8 w-8 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-600">Total Courses</p>
                        <p className="text-2xl font-bold text-blue-900">24</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Users2 className="h-8 w-8 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-600">Active Students</p>
                        <p className="text-2xl font-bold text-green-900">156</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-yellow-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-yellow-600">Assignments</p>
                        <p className="text-2xl font-bold text-yellow-900">89</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Presentation className="h-8 w-8 text-purple-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-purple-600">Educational Tours</p>
                        <p className="text-2xl font-bold text-purple-900">12</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'course-management':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Course Management</h3>
              <p className="text-sm text-gray-600">Manage educational courses across the platform</p>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Course management interface will be implemented here</p>
              </div>
            </div>
          </div>
        );

      case 'assignment-management':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Assignment Management</h3>
              <p className="text-sm text-gray-600">Oversee assignments and grading system</p>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Assignment management interface will be implemented here</p>
              </div>
            </div>
          </div>
        );

      case 'student-management':
        return (
          <SuperAdminProgressManagement />
        );

      case 'educational-tours':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Educational Tours</h3>
              <p className="text-sm text-gray-600">Manage educational tour programs</p>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <Presentation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Educational tours management interface will be implemented here</p>
              </div>
            </div>
          </div>
        );

      case 'communications':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Communications Center</h3>
              <p className="text-sm text-gray-600">Manage communications with Museum Admins and track message history</p>
            </div>
            <div className="p-6">
              <ErrorBoundary>
                <CommunicationsCenter />
              </ErrorBoundary>
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
                        onClick={() => {
                          if (item.link) {
                            navigate(item.link);
                          } else {
                            setActiveSection(item.id);
                          }
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${activeSection === item.id
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

      {/* Museum Rejection Modal */}
      {rejectionModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Reject Museum</h3>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-3">
                Are you sure you want to reject <strong>{rejectionModal.museumName}</strong>?
                Please provide a reason for rejection.
              </p>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                rows="3"
                placeholder="Enter reason for rejection..."
                value={rejectionModal.reason}
                onChange={(e) => setRejectionModal(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                onClick={() => setRejectionModal({ isOpen: false, museumId: null, museumName: '', reason: '' })}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                onClick={confirmMuseumRejection}
                disabled={!rejectionModal.reason.trim()}
              >
                Reject Museum
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Deletion Modal */}
      {userDeleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete user <strong>{userDeleteModal.userName}</strong> ({userDeleteModal.userEmail})?
                This action cannot be undone and will permanently remove the user and all their data.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                onClick={() => setUserDeleteModal({ isOpen: false, userId: null, userName: '', userEmail: '' })}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                onClick={confirmUserDeletion}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Museum Deletion Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Delete Museum</h3>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete <strong>{deleteModal.museumName}</strong>?
                This action cannot be undone and will permanently remove the museum and all its data.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                onClick={() => setDeleteModal({ isOpen: false, museumId: null, museumName: '', action: '' })}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                onClick={confirmMuseumDelete}
              >
                Delete Museum
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
