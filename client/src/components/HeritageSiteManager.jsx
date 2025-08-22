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
  X
} from 'lucide-react';
import api from '../utils/api';

const HeritageSiteManager = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: 'Cultural',
    description: '',
    coordinates: { lat: '', lng: '' },
    isUNESCO: false,
    establishedYear: '',
    significance: '',
    visitingHours: '',
    entryFee: '',
    images: [],
    status: 'active'
  });

  const siteTypes = [
    'Cultural Heritage',
    'Natural Heritage',
    'UNESCO World Heritage',
    'Historical Site',
    'Archaeological Site',
    'Religious Site',
    'Architectural Heritage',
    'Museum',
    'Monument'
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
      const response = await api.getHeritageSites();
      setSites(response.data || []);
    } catch (error) {
      console.error('Failed to fetch heritage sites:', error);
      // Set mock data for demonstration
      setSites([
        {
          _id: '1',
          name: 'Rock-Hewn Churches of Lalibela',
          location: 'Lalibela, Amhara',
          type: 'UNESCO World Heritage',
          description: 'A cluster of eleven medieval monolithic churches carved directly into volcanic rock.',
          coordinates: { lat: '12.0337', lng: '39.0473' },
          isUNESCO: true,
          establishedYear: '12th-13th century',
          significance: 'Outstanding universal value as a masterpiece of human creative genius',
          visitingHours: '6:00 AM - 6:00 PM',
          entryFee: '500 ETB',
          images: [],
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          name: 'Axum Obelisks',
          location: 'Axum, Tigray',
          type: 'UNESCO World Heritage',
          description: 'Ancient stelae marking the tombs of Axumite royalty.',
          coordinates: { lat: '14.1313', lng: '38.7217' },
          isUNESCO: true,
          establishedYear: '1st-8th century AD',
          significance: 'Testimony to the ancient Kingdom of Axum',
          visitingHours: '8:00 AM - 5:00 PM',
          entryFee: '300 ETB',
          images: [],
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSite = async () => {
    try {
      const response = await api.createHeritageSite(formData);
      setSites(prev => [response.data, ...prev]);
      setShowAddModal(false);
      resetForm();
      alert('Heritage site added successfully!');
    } catch (error) {
      console.error('Failed to add heritage site:', error);
      alert('Failed to add heritage site. Please try again.');
    }
  };

  const handleUpdateSite = async () => {
    try {
      const response = await api.updateHeritageSite(selectedSite._id, formData);
      setSites(prev => prev.map(site => 
        site._id === selectedSite._id ? response.data : site
      ));
      setShowAddModal(false);
      setSelectedSite(null);
      resetForm();
      alert('Heritage site updated successfully!');
    } catch (error) {
      console.error('Failed to update heritage site:', error);
      alert('Failed to update heritage site. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      type: 'Cultural',
      description: '',
      coordinates: { lat: '', lng: '' },
      isUNESCO: false,
      establishedYear: '',
      significance: '',
      visitingHours: '',
      entryFee: '',
      images: [],
      status: 'active'
    });
  };

  const openEditModal = (site) => {
    setSelectedSite(site);
    setFormData({
      name: site.name,
      location: site.location,
      type: site.type,
      description: site.description,
      coordinates: site.coordinates,
      isUNESCO: site.isUNESCO,
      establishedYear: site.establishedYear,
      significance: site.significance,
      visitingHours: site.visitingHours,
      entryFee: site.entryFee,
      images: site.images || [],
      status: site.status
    });
    setShowAddModal(true);
  };

  const openDetailModal = (site) => {
    setSelectedSite(site);
    setShowDetailModal(true);
  };

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.location.toLowerCase().includes(searchTerm.toLowerCase());
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
            {site.location}
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Heritage Site Management</h1>
          <p className="text-gray-600">Manage Ethiopian cultural and heritage sites</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Heritage Site</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{sites.length}</p>
              <p className="text-sm text-gray-600">Total Sites</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gold-100 rounded-lg">
              <Award className="h-6 w-6 text-gold-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{sites.filter(s => s.isUNESCO).length}</p>
              <p className="text-sm text-gray-600">UNESCO Sites</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Globe className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{new Set(sites.map(s => s.location.split(',')[1]?.trim())).size}</p>
              <p className="text-sm text-gray-600">Regions</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{sites.filter(s => s.status === 'active').length}</p>
              <p className="text-sm text-gray-600">Active Sites</p>
            </div>
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

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSites.map(site => (
          <SiteCard key={site._id} site={site} />
        ))}
      </div>

      {filteredSites.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No heritage sites found matching your criteria.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {selectedSite ? 'Edit Heritage Site' : 'Add New Heritage Site'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedSite(null);
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
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    {siteTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.establishedYear}
                    onChange={(e) => setFormData({...formData, establishedYear: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Historical Significance</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.significance}
                  onChange={(e) => setFormData({...formData, significance: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visiting Hours</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.visitingHours}
                    onChange={(e) => setFormData({...formData, visitingHours: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entry Fee</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.entryFee}
                    onChange={(e) => setFormData({...formData, entryFee: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.coordinates.lat}
                    onChange={(e) => setFormData({...formData, coordinates: {...formData.coordinates, lat: e.target.value}})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.coordinates.lng}
                    onChange={(e) => setFormData({...formData, coordinates: {...formData.coordinates, lng: e.target.value}})}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={formData.isUNESCO}
                    onChange={(e) => setFormData({...formData, isUNESCO: e.target.checked})}
                  />
                  <span className="text-sm text-gray-700">UNESCO World Heritage Site</span>
                </label>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
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
                  setSelectedSite(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={selectedSite ? handleUpdateSite : handleAddSite}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {selectedSite ? 'Update Site' : 'Add Site'}
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
                    <div><span className="font-medium">Location:</span> {selectedSite.location}</div>
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
                    <div><span className="font-medium">Coordinates:</span> {selectedSite.coordinates.lat}, {selectedSite.coordinates.lng}</div>
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
    </div>
  );
};

export default HeritageSiteManager;
