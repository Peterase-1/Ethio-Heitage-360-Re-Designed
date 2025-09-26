import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Users, Star, Eye, Calendar, MapPin, BookOpen, Award, MessageSquare } from 'lucide-react';
import educationalToursApi from '../../services/educationalToursApi';

const EducationalTourManager = () => {
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTour, setEditingTour] = useState(null);
  const [selectedTour, setSelectedTour] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({
    totalTours: 0,
    publishedTours: 0,
    totalEnrollments: 0,
    averageRating: 0
  });

  // Form data for creating/editing tours
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: 'Cultural Heritage',
    difficulty: 'Beginner',
    startDate: '',
    endDate: '',
    duration: 1,
    maxParticipants: 20,
    location: {
      name: '',
      address: '',
      meetingPoint: ''
    },
    pricing: {
      price: 0,
      currency: 'ETB',
      includes: [],
      excludes: []
    },
    learningObjectives: [''],
    curriculum: [],
    requirements: {
      ageLimit: { min: 8, max: 100 },
      fitnessLevel: 'Easy',
      prerequisites: [],
      recommendedItems: []
    },
    images: [],
    tags: []
  });

  const categories = [
    'Islamic Heritage', 'Islamic Architecture', 'Ethiopian Scripts',
    'Traditional Arts', 'Religious Heritage', 'Cultural Festivals',
    'Culinary Heritage', 'Musical Heritage', 'Cultural Heritage',
    'Traditional Knowledge', 'Natural Heritage', 'Modern Heritage'
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const statuses = ['draft', 'published', 'cancelled', 'completed'];

  useEffect(() => {
    fetchTours();
    fetchStats();
  }, []);

  useEffect(() => {
    filterTours();
  }, [tours, activeTab]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const response = await educationalToursApi.organizer.getMyTours();
      if (response.success) {
        setTours(response.data);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
      // Mock data for demo
      setTours([
        {
          _id: '1',
          title: 'Islamic Architecture of Harar',
          shortDescription: 'Explore the ancient Islamic architecture and cultural sites',
          category: 'Islamic Architecture',
          difficulty: 'Intermediate',
          status: 'published',
          startDate: '2024-02-15T09:00:00Z',
          endDate: '2024-02-15T17:00:00Z',
          maxParticipants: 25,
          enrollments: [{ status: 'confirmed' }, { status: 'pending' }],
          stats: { views: 156, enrollments: 12, averageRating: 4.5 },
          location: { name: 'Harar Jugol' },
          pricing: { price: 850, currency: 'ETB' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await educationalToursApi.organizer.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Mock data
      setStats({
        totalTours: 5,
        publishedTours: 3,
        totalEnrollments: 47,
        averageRating: 4.3
      });
    }
  };

  const filterTours = () => {
    if (activeTab === 'all') {
      setFilteredTours(tours);
    } else {
      setFilteredTours(tours.filter(tour => tour.status === activeTab));
    }
  };

  const handleCreateTour = async (e) => {
    e.preventDefault();
    try {
      const response = await educationalToursApi.organizer.createTour(formData);
      if (response.success) {
        setTours([...tours, response.data]);
        setShowCreateForm(false);
        resetForm();
        fetchStats();
        alert('Educational tour created successfully!');
      }
    } catch (error) {
      console.error('Error creating tour:', error);
      alert('Error creating tour: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateTour = async (tourId) => {
    try {
      const response = await educationalToursApi.organizer.updateTour(tourId, formData);
      if (response.success) {
        setTours(tours.map(tour => tour._id === tourId ? response.data : tour));
        setEditingTour(null);
        resetForm();
        alert('Tour updated successfully!');
      }
    } catch (error) {
      console.error('Error updating tour:', error);
      alert('Error updating tour: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteTour = async (tourId) => {
    if (window.confirm('Are you sure you want to delete this tour?')) {
      try {
        const response = await educationalToursApi.organizer.deleteTour(tourId);
        if (response.success) {
          setTours(tours.filter(tour => tour._id !== tourId));
          fetchStats();
          alert('Tour deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting tour:', error);
        alert('Error deleting tour: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      shortDescription: '',
      category: 'Cultural Heritage',
      difficulty: 'Beginner',
      startDate: '',
      endDate: '',
      duration: 1,
      maxParticipants: 20,
      location: {
        name: '',
        address: '',
        meetingPoint: ''
      },
      pricing: {
        price: 0,
        currency: 'ETB',
        includes: [],
        excludes: []
      },
      learningObjectives: [''],
      curriculum: [],
      requirements: {
        ageLimit: { min: 8, max: 100 },
        fitnessLevel: 'Easy',
        prerequisites: [],
        recommendedItems: []
      },
      images: [],
      tags: []
    });
  };

  const addLearningObjective = () => {
    setFormData({
      ...formData,
      learningObjectives: [...formData.learningObjectives, '']
    });
  };

  const updateLearningObjective = (index, value) => {
    const updated = [...formData.learningObjectives];
    updated[index] = value;
    setFormData({ ...formData, learningObjectives: updated });
  };

  const removeLearningObjective = (index) => {
    setFormData({
      ...formData,
      learningObjectives: formData.learningObjectives.filter((_, i) => i !== index)
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-heritage-moss text-white';
      case 'draft': return 'bg-heritage-sand text-heritage-dark';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-heritage-terra text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-heritage-sand text-heritage-dark';
      case 'Intermediate': return 'bg-heritage-amber text-white';
      case 'Advanced': return 'bg-heritage-terra text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heritage-moss"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-heritage-sand/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-heritage-dark flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-heritage-moss" />
            Educational Tour Management
          </h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-heritage-moss text-white px-4 py-2 rounded-lg hover:bg-heritage-moss/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Tour
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-heritage-moss/5 p-4 rounded-lg border border-heritage-moss/10">
            <div className="text-2xl font-bold text-heritage-moss">{stats.totalTours}</div>
            <div className="text-heritage-dark/70 text-sm">Total Tours</div>
          </div>
          <div className="bg-heritage-amber/5 p-4 rounded-lg border border-heritage-amber/10">
            <div className="text-2xl font-bold text-heritage-amber">{stats.publishedTours}</div>
            <div className="text-heritage-dark/70 text-sm">Published</div>
          </div>
          <div className="bg-heritage-terra/5 p-4 rounded-lg border border-heritage-terra/10">
            <div className="text-2xl font-bold text-heritage-terra">{stats.totalEnrollments}</div>
            <div className="text-heritage-dark/70 text-sm">Total Enrollments</div>
          </div>
          <div className="bg-heritage-sand/20 p-4 rounded-lg border border-heritage-sand/30">
            <div className="text-2xl font-bold text-heritage-dark flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              {stats.averageRating}
            </div>
            <div className="text-heritage-dark/70 text-sm">Avg Rating</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-heritage-sand/10 p-1 rounded-lg">
          {['all', 'draft', 'published', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-white text-heritage-moss shadow-sm'
                  : 'text-heritage-dark/70 hover:text-heritage-dark'
              }`}
            >
              {tab} {tab === 'all' ? `(${tours.length})` : `(${tours.filter(t => t.status === tab).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Tours List */}
      <div className="grid gap-6">
        {filteredTours.map((tour) => (
          <div key={tour._id} className="bg-white rounded-lg shadow-sm border border-heritage-sand/20 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-heritage-dark">{tour.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tour.status)}`}>
                    {tour.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(tour.difficulty)}`}>
                    {tour.difficulty}
                  </span>
                </div>
                <p className="text-heritage-dark/70 mb-3">{tour.shortDescription}</p>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-heritage-dark/70">
                    <Calendar className="w-4 h-4" />
                    {new Date(tour.startDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-heritage-dark/70">
                    <MapPin className="w-4 h-4" />
                    {tour.location.name}
                  </div>
                  <div className="flex items-center gap-2 text-heritage-dark/70">
                    <Users className="w-4 h-4" />
                    {tour.enrollments?.filter(e => e.status === 'confirmed').length || 0}/{tour.maxParticipants}
                  </div>
                  <div className="flex items-center gap-2 text-heritage-dark/70">
                    <span className="text-heritage-moss font-medium">{tour.pricing.price} {tour.pricing.currency}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => {
                    setEditingTour(tour._id);
                    setFormData({ ...tour });
                  }}
                  className="p-2 text-heritage-dark/70 hover:text-heritage-moss hover:bg-heritage-moss/5 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTour(tour._id)}
                  className="p-2 text-heritage-dark/70 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tour Stats */}
            <div className="flex items-center gap-6 text-sm text-heritage-dark/70 pt-4 border-t border-heritage-sand/20">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {tour.stats.views} views
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {tour.stats.enrollments} enrolled
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                {tour.stats.averageRating.toFixed(1)}
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                {tour.category}
              </div>
            </div>
          </div>
        ))}

        {filteredTours.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-heritage-sand mx-auto mb-4" />
            <p className="text-heritage-dark/70">
              {activeTab === 'all' ? 'No tours created yet.' : `No ${activeTab} tours found.`}
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 text-heritage-moss hover:underline"
            >
              Create your first educational tour
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Tour Modal */}
      {(showCreateForm || editingTour) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-heritage-sand/20">
              <h3 className="text-xl font-semibold text-heritage-dark">
                {editingTour ? 'Edit Tour' : 'Create New Educational Tour'}
              </h3>
            </div>

            <form onSubmit={editingTour ? (e) => { e.preventDefault(); handleUpdateTour(editingTour); } : handleCreateTour} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-heritage-dark mb-1">Tour Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 border border-heritage-sand/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-moss"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-heritage-dark mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-3 border border-heritage-sand/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-moss"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-heritage-dark mb-1">Short Description</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full p-3 border border-heritage-sand/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-moss"
                  maxLength="200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-heritage-dark mb-1">Full Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full p-3 border border-heritage-sand/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-moss"
                  required
                />
              </div>

              {/* Date and Duration */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-heritage-dark mb-1">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-3 border border-heritage-sand/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-moss"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-heritage-dark mb-1">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-3 border border-heritage-sand/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-moss"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-heritage-dark mb-1">Duration (hours) *</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full p-3 border border-heritage-sand/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-moss"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-heritage-dark mb-1">Location Name *</label>
                  <input
                    type="text"
                    value={formData.location.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, name: e.target.value }
                    })}
                    className="w-full p-3 border border-heritage-sand/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-moss"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-heritage-dark mb-1">Meeting Point *</label>
                  <input
                    type="text"
                    value={formData.location.meetingPoint}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, meetingPoint: e.target.value }
                    })}
                    className="w-full p-3 border border-heritage-sand/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-moss"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-heritage-dark mb-1">Full Address *</label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, address: e.target.value }
                  })}
                  className="w-full p-3 border border-heritage-sand/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-moss"
                  required
                />
              </div>

              {/* Pricing and Participants */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-heritage-dark mb-1">Price *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.pricing.price}
                    onChange={(e) => setFormData({
                      ...formData,
                      pricing: { ...formData.pricing, price: parseFloat(e.target.value) }
                    })}
                    className="w-full p-3 border border-heritage-sand/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-moss"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-heritage-dark mb-1">Currency</label>
                  <select
                    value={formData.pricing.currency}
                    onChange={(e) => setFormData({
                      ...formData,
                      pricing: { ...formData.pricing, currency: e.target.value }
                    })}
                    className="w-full p-3 border border-heritage-sand/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-moss"
                  >
                    <option value="ETB">ETB</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-heritage-dark mb-1">Max Participants *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                    className="w-full p-3 border border-heritage-sand/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-moss"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-heritage-dark mb-1">Difficulty Level</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full p-3 border border-heritage-sand/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-moss"
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-heritage-dark mb-1">Fitness Level</label>
                  <select
                    value={formData.requirements.fitnessLevel}
                    onChange={(e) => setFormData({
                      ...formData,
                      requirements: { ...formData.requirements, fitnessLevel: e.target.value }
                    })}
                    className="w-full p-3 border border-heritage-sand/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-moss"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Challenging">Challenging</option>
                  </select>
                </div>
              </div>

              {/* Learning Objectives */}
              <div>
                <label className="block text-sm font-medium text-heritage-dark mb-2">Learning Objectives</label>
                {formData.learningObjectives.map((objective, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => updateLearningObjective(index, e.target.value)}
                      className="flex-1 p-3 border border-heritage-sand/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-moss"
                      placeholder="What will participants learn?"
                    />
                    {formData.learningObjectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLearningObjective(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addLearningObjective}
                  className="text-heritage-moss hover:underline text-sm"
                >
                  + Add Learning Objective
                </button>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-6 border-t border-heritage-sand/20">
                <button
                  type="submit"
                  className="bg-heritage-moss text-white px-6 py-2 rounded-lg hover:bg-heritage-moss/90 transition-colors"
                >
                  {editingTour ? 'Update Tour' : 'Create Tour'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingTour(null);
                    resetForm();
                  }}
                  className="bg-heritage-sand/20 text-heritage-dark px-6 py-2 rounded-lg hover:bg-heritage-sand/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationalTourManager;
