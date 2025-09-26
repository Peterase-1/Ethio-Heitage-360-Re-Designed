import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Search,
  Edit,
  Eye,
  Star,
  Globe,
  Calendar,
  Users,
  Camera,
  Clock,
  Award,
  X,
  FileText,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import api from '../utils/api';

const HeritageSiteManager = ({ onDataChange }) => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    location: {
      region: '',
      zone: '',
      woreda: '',
      city: '',
      coordinates: { latitude: '', longitude: '' }
    },
    type: 'Cultural',
    category: '',
    designation: '',
    description: '',
    significance: '',
    management: {
      authority: ''
    },
    isUNESCO: false,
    establishedYear: '',
    visitingHours: '',
    entryFee: '',
    images: [],
    status: 'active'
  });

  const siteTypes = [
    'Archaeological',
    'Historical',
    'Religious',
    'Natural',
    'Cultural',
    'Mixed'
  ];

  const categories = [
    'Ancient Ruins',
    'Churches & Monasteries',
    'Palaces & Castles',
    'Rock Art Sites',
    'Burial Sites',
    'Archaeological Sites',
    'Museums',
    'Cultural Landscapes',
    'Traditional Architecture',
    'Natural Monuments',
    'National Parks',
    'Religious Centers',
    'Historical Cities',
    'Trading Posts',
    'Other'
  ];

  const designations = [
    'UNESCO World Heritage',
    'National Heritage',
    'Regional Heritage',
    'Local Heritage',
    'Proposed'
  ];

  const managementAuthorities = [
    'Authority for Research and Conservation of Cultural Heritage (ARCCH)',
    'Ethiopian Orthodox Church',
    'Regional Culture Bureau',
    'Local Administration',
    'International Organization',
    'Private Foundation',
    'Community-based'
  ];

  const regions = [
    'Addis Ababa',
    'Afar',
    'Amhara',
    'Benishangul-Gumuz',
    'Dire Dawa',
    'Gambela',
    'Harari',
    'Oromia',
    'Sidama',
    'SNNPR',
    'Somali',
    'Tigray'
  ];

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const response = await api.getSuperAdminHeritageSites({
        page: 1,
        limit: 100,
        status: 'active'
      });
      setSites(response.data || []);
    } catch (error) {
      console.error('Failed to fetch heritage sites:', error);
      setSites([]);
      // Show user-friendly error message
      if (error.message && error.message.includes('Failed to fetch')) {
        alert('Server is not running. Please start the server to view heritage sites.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddSite = async () => {
    try {
      // Validate required fields
      if (!formData.location.region) {
        setErrorMessage('Please select a region');
        setShowErrorModal(true);
        return;
      }
      if (!formData.location.zone) {
        setErrorMessage('Please enter zone/special woreda');
        setShowErrorModal(true);
        return;
      }
      if (!formData.location.woreda) {
        setErrorMessage('Please enter woreda');
        setShowErrorModal(true);
        return;
      }
      if (!formData.location.city) {
        setErrorMessage('Please enter nearest city');
        setShowErrorModal(true);
        return;
      }
      if (!formData.location.coordinates.latitude || !formData.location.coordinates.longitude) {
        setErrorMessage('Please enter latitude and longitude');
        setShowErrorModal(true);
        return;
      }
      if (!formData.type) {
        setErrorMessage('Please select a type');
        setShowErrorModal(true);
        return;
      }
      if (!formData.category) {
        setErrorMessage('Please select a category');
        setShowErrorModal(true);
        return;
      }
      if (!formData.designation) {
        setErrorMessage('Please select a designation');
        setShowErrorModal(true);
        return;
      }
      if (!formData.management.authority) {
        setErrorMessage('Please select a managing authority');
        setShowErrorModal(true);
        return;
      }

      // Map coordinates from lat/lng to latitude/longitude format
      const siteData = {
        ...formData,
        location: {
          ...formData.location,
          coordinates: {
            latitude: parseFloat(formData.location.coordinates.latitude),
            longitude: parseFloat(formData.location.coordinates.longitude)
          }
        }
      };

      const response = await api.createHeritageSite(siteData);
      setSites(prev => [response.data, ...prev]);
      setShowAddModal(false);
      resetForm();
      setSuccessMessage('Heritage site added successfully!');
      setShowSuccessModal(true);
      // Notify parent component of data change
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error('Failed to add heritage site:', error);
      setErrorMessage('Failed to add heritage site. Please try again.');
      setShowErrorModal(true);
    }
  };

  const handleUpdateSite = async () => {
    try {
      // Map coordinates from lat/lng to latitude/longitude format
      const siteData = {
        ...formData,
        location: {
          ...formData.location,
          coordinates: {
            latitude: parseFloat(formData.location.coordinates.latitude),
            longitude: parseFloat(formData.location.coordinates.longitude)
          }
        }
      };

      console.log('🔄 UPDATE SITE - ID:', editingSite._id);
      console.log('📋 Form data:', formData);
      console.log('📋 Site data being sent:', siteData);

      const response = await api.updateHeritageSite(editingSite._id, siteData);
      setSites(prev => prev.map(site =>
        site._id === editingSite._id ? response.data : site
      ));
      setShowEditModal(false);
      setEditingSite(null);
      resetForm();
      setSuccessMessage('Heritage site updated successfully!');
      setShowSuccessModal(true);
      // Notify parent component of data change
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error('Failed to update heritage site:', error);
      setErrorMessage('Failed to update heritage site. Please try again.');
      setShowErrorModal(true);
    }
  };

  const handleDeleteSite = async () => {
    try {
      await api.deleteHeritageSite(siteToDelete._id);
      setSites(prev => prev.filter(site => site._id !== siteToDelete._id));
      setShowDeleteModal(false);
      setSiteToDelete(null);
      setSuccessMessage('Heritage site deleted successfully!');
      setShowSuccessModal(true);
      // Notify parent component of data change
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error('Failed to delete heritage site:', error);
      setErrorMessage('Failed to delete heritage site. Please try again.');
      setShowErrorModal(true);
    }
  };

  const openDeleteModal = (site) => {
    setSiteToDelete(site);
    setShowDeleteModal(true);
  };

  const openEditModal = (site) => {
    console.log('🔍 EDIT MODAL - Site data:', site);
    console.log('🔍 EDIT MODAL - Management data:', site.management);
    setEditingSite(site);
    setFormData({
      name: site.name,
      location: {
        region: site.location?.region || '',
        zone: site.location?.zone || '',
        woreda: site.location?.woreda || '',
        city: site.location?.city || '',
        coordinates: {
          latitude: site.location?.coordinates?.latitude || site.coordinates?.lat || '',
          longitude: site.location?.coordinates?.longitude || site.coordinates?.lng || ''
        }
      },
      type: site.type,
      category: site.category || '',
      designation: site.designation || '',
      description: site.description,
      significance: site.significance || '',
      management: {
        authority: site.management?.authority || ''
      },
      isUNESCO: site.isUNESCO || false,
      establishedYear: site.establishedYear || '',
      visitingHours: site.visitingHours || '',
      entryFee: site.entryFee || '',
      images: site.images || [],
      status: site.status || 'active'
    });
    setShowEditModal(true);
    setShowDetailModal(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: {
        region: '',
        zone: '',
        woreda: '',
        city: '',
        coordinates: { latitude: '', longitude: '' }
      },
      type: 'Cultural',
      category: '',
      designation: '',
      description: '',
      significance: '',
      management: {
        authority: ''
      },
      isUNESCO: false,
      establishedYear: '',
      visitingHours: '',
      entryFee: '',
      images: [],
      status: 'active'
    });
  };


  const openDetailModal = (site) => {
    setSelectedSite(site);
    setShowDetailModal(true);
  };

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.location?.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.location?.zone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.location?.woreda?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || site.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const SiteCard = ({ site }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{site.name}</h3>
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            {site.location?.region}, {site.location?.zone}
          </div>
          {site.isUNESCO && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gold-100 text-gold-800">
              <Star className="h-3 w-3 mr-1" />
              UNESCO World Heritage
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openDetailModal(site)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => openEditModal(site)}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{site.description}</p>

      <div className="flex justify-between items-center text-xs text-gray-500">
        <span className="px-2 py-1 bg-gray-100 rounded">{site.type}</span>
        <span>{site.establishedYear}</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading heritage sites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Action Bar with View Toggle, Refresh, and Add Buttons */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* View Toggle Buttons */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">View:</span>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-2 text-sm font-medium flex items-center space-x-1 ${viewMode === 'card'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                </div>
                <span>Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm font-medium flex items-center space-x-1 ${viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <div className="grid grid-cols-3 gap-0.5">
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                </div>
                <span>Table</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Heritage Site</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search heritage sites..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            {siteTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sites Display - Card or Table View */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map(site => (
            <SiteCard key={site._id} site={site} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSites.map(site => (
                  <tr key={site._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{site.name}</div>
                          <div className="text-sm text-gray-500">{site.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {site.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {site.location?.region}, {site.location?.zone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {site.designation || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${site.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {site.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailModal(site)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(site)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(site)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredSites.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {loading ? 'Loading heritage sites...' :
              sites.length === 0 ? 'No heritage sites found. Please start the server to load data.' :
                'No heritage sites found matching your criteria.'}
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {showEditModal ? 'Edit Heritage Site' : 'Add New Heritage Site'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedSite(null);
                  setEditingSite(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.location.region}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, region: e.target.value } })}
                    required
                  >
                    <option value="">Select Region</option>
                    {regions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zone/Special Woreda *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.location.zone}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, zone: e.target.value } })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Woreda *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.location.woreda}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, woreda: e.target.value } })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nearest City *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.location.city}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.location.coordinates.latitude}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, coordinates: { ...formData.location.coordinates, latitude: e.target.value } } })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.location.coordinates.longitude}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, coordinates: { ...formData.location.coordinates, longitude: e.target.value } } })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="">Select Type</option>
                    {siteTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    required
                  >
                    <option value="">Select Designation</option>
                    {designations.map(designation => (
                      <option key={designation} value={designation}>{designation}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Managing Authority *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.management.authority}
                    onChange={(e) => setFormData({ ...formData, management: { ...formData.management, authority: e.target.value } })}
                    required
                  >
                    <option value="">Select Authority</option>
                    {managementAuthorities.map(authority => (
                      <option key={authority} value={authority}>{authority}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.establishedYear}
                    onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Historical Significance</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.significance}
                  onChange={(e) => setFormData({ ...formData, significance: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visiting Hours</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.visitingHours}
                    onChange={(e) => setFormData({ ...formData, visitingHours: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entry Fee</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.entryFee}
                    onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.location.coordinates.latitude}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, coordinates: { ...formData.location.coordinates, latitude: e.target.value } } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.location.coordinates.longitude}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, coordinates: { ...formData.location.coordinates, longitude: e.target.value } } })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={formData.isUNESCO}
                    onChange={(e) => setFormData({ ...formData, isUNESCO: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">UNESCO World Heritage Site</span>
                </label>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedSite(null);
                  setEditingSite(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={showEditModal ? handleUpdateSite : handleAddSite}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {showEditModal ? 'Update Site' : 'Add Site'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedSite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">{selectedSite.name}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Location:</span> {selectedSite.location?.region}, {selectedSite.location?.zone}, {selectedSite.location?.woreda}</div>
                    <div><span className="font-medium">Type:</span> {selectedSite.type}</div>
                    <div><span className="font-medium">Established:</span> {selectedSite.establishedYear}</div>
                    <div><span className="font-medium">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${selectedSite.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {selectedSite.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Visitor Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Visiting Hours:</span> {selectedSite.visitingHours}</div>
                    <div><span className="font-medium">Entry Fee:</span> {selectedSite.entryFee}</div>
                    <div><span className="font-medium">Coordinates:</span> {selectedSite.location?.coordinates?.latitude}, {selectedSite.location?.coordinates?.longitude}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 text-sm">{selectedSite.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Historical Significance</h3>
                <p className="text-gray-700 text-sm">{selectedSite.significance}</p>
              </div>

              {selectedSite.isUNESCO && (
                <div className="bg-gold-50 p-4 rounded-lg border border-gold-200">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-gold-600 mr-2" />
                    <span className="font-semibold text-gold-800">UNESCO World Heritage Site</span>
                  </div>
                  <p className="text-gold-700 text-sm mt-1">This site has been recognized by UNESCO for its outstanding universal value.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Success</h3>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">{successMessage}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Error</h3>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">{errorMessage}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && siteToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Delete Heritage Site</h3>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete "{siteToDelete.name}"? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSiteToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSite}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeritageSiteManager;
