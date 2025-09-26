import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  FaTools, 
  FaSearch, 
  FaFilter, 
  FaStar, 
  FaUsers, 
  FaEye, 
  FaExternalLinkAlt,
  FaPlay,
  FaDownload,
  FaHeart,
  FaComment,
  FaShareAlt,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaTags,
  FaCalendarAlt,
  FaCalculator,
  FaLanguage,
  FaGlobe,
  FaLaptop,
  FaMobile,
  FaCog,
  FaQuestionCircle,
  FaBug,
  FaFlag,
  FaThumbsUp,
  FaThumbsDown,
  FaBookmark,
  FaCode,
  FaDesktop,
  FaTablet,
  FaArrowLeft,
  FaInfoCircle,
  FaClipboard,
  FaArrowRight,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { toast } from 'sonner';

const ToolsAndResources = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toolId } = useParams();

  // State management
  const [tools, setTools] = useState([]);
  const [featuredTools, setFeaturedTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [view, setView] = useState(toolId ? 'detail' : 'browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [showEmbeddedTool, setShowEmbeddedTool] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    comment: '',
    title: ''
  });

  // Tool categories
  const toolCategories = [
    { value: 'all', label: 'All Tools', icon: FaTools },
    { value: 'calculator', label: 'Calculators', icon: FaCalculator },
    { value: 'converter', label: 'Converters', icon: FaCog },
    { value: 'language', label: 'Language Tools', icon: FaLanguage },
    { value: 'geography', label: 'Geography', icon: FaGlobe },
    { value: 'calendar', label: 'Calendar Tools', icon: FaCalendarAlt },
    { value: 'reference', label: 'References', icon: FaBookmark },
    { value: 'simulation', label: 'Simulations', icon: FaDesktop },
    { value: 'utility', label: 'Utilities', icon: FaTools }
  ];

  const platformTypes = [
    { value: 'all', label: 'All Platforms' },
    { value: 'web', label: 'Web Browser' },
    { value: 'mobile', label: 'Mobile App' },
    { value: 'desktop', label: 'Desktop' },
    { value: 'embedded', label: 'Embedded' }
  ];

  const sortOptions = [
    { value: 'featured', label: 'Featured First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'name', label: 'Alphabetical' }
  ];

  // Load tools data
  useEffect(() => {
    loadTools();
    if (toolId) {
      loadToolDetail(toolId);
    }
  }, [toolId]);

  const loadTools = async () => {
    try {
      setLoading(true);
      
      // Load all tools and featured tools
      const [allToolsResponse, featuredResponse] = await Promise.all([
        fetch('/api/tools-resources/public', {
          headers: user ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {}
        }),
        fetch('/api/tools-resources/featured', {
          headers: user ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {}
        })
      ]);

      if (allToolsResponse.ok && featuredResponse.ok) {
        const allTools = await allToolsResponse.json();
        const featured = await featuredResponse.json();
        
        setTools(allTools.tools || []);
        setFeaturedTools(featured.tools || []);
      }
    } catch (error) {
      console.error('Error loading tools:', error);
      toast.error('Failed to load tools. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadToolDetail = async (id) => {
    try {
      const response = await fetch(`/api/tools-resources/public/${id}`, {
        headers: user ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {}
      });
      
      if (response.ok) {
        const toolData = await response.json();
        setSelectedTool(toolData.tool);
        setView('detail');
        
        // Load reviews
        loadToolReviews(id);
      } else {
        toast.error('Tool not found');
        navigate('/visitor/tools-resources');
      }
    } catch (error) {
      console.error('Error loading tool detail:', error);
      toast.error('Failed to load tool details');
    }
  };

  const loadToolReviews = async (id) => {
    try {
      const response = await fetch(`/api/tools-resources/${id}/reviews`);
      
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleUseTool = async (tool) => {
    if (!user) {
      toast.error('Please sign in to use tools');
      navigate('/auth');
      return;
    }

    try {
      // Record usage
      await fetch(`/api/tools-resources/${tool._id}/usage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      // Handle different tool types
      if (tool.toolType === 'external') {
        window.open(tool.configuration.externalUrl, '_blank');
      } else if (tool.toolType === 'embedded') {
        setShowEmbeddedTool(true);
      } else if (tool.toolType === 'downloadable') {
        window.open(tool.configuration.downloadUrl, '_blank');
      }

      toast.success('Tool launched successfully!');
    } catch (error) {
      console.error('Error using tool:', error);
      toast.error('Failed to launch tool');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to submit reviews');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/tools-resources/${selectedTool._id}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewFormData)
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(prev => [data.review, ...prev]);
        setShowReviewModal(false);
        setReviewFormData({ rating: 5, comment: '', title: '' });
        toast.success('Review submitted successfully!');
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setActionLoading(false);
    }
  };

  const getToolIcon = (category) => {
    const categoryData = toolCategories.find(cat => cat.value === category);
    return categoryData ? categoryData.icon : FaTools;
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      web: FaGlobe,
      mobile: FaMobile,
      desktop: FaDesktop,
      embedded: FaCode,
      tablet: FaTablet
    };
    return icons[platform] || FaLaptop;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-600 bg-green-100',
      maintenance: 'text-yellow-600 bg-yellow-100',
      deprecated: 'text-red-600 bg-red-100',
      beta: 'text-blue-600 bg-blue-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  // Filter and sort tools
  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesPlatform = selectedPlatform === 'all' || 
                           tool.supportedPlatforms?.includes(selectedPlatform) ||
                           tool.toolType === selectedPlatform;
    
    return matchesSearch && matchesCategory && matchesPlatform;
  });

  const sortedTools = [...filteredTools].sort((a, b) => {
    switch (sortBy) {
      case 'featured':
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      case 'popular':
        return (b.usage?.totalUsage || 0) - (a.usage?.totalUsage || 0);
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'rating':
        return (b.averageRating || 0) - (a.averageRating || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4 mx-auto" />
          <p className="text-gray-600">Loading tools...</p>
        </div>
      </div>
    );
  }

  // Tool Detail View
  if (view === 'detail' && selectedTool) {
    const ToolIcon = getToolIcon(selectedTool.category);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => {
              setView('browse');
              navigate('/visitor/tools-resources');
            }}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Tools</span>
          </button>

          {/* Tool Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Tool Icon/Image */}
              <div className="lg:w-1/4">
                <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center text-white">
                  {selectedTool.iconUrl ? (
                    <img
                      src={selectedTool.iconUrl}
                      alt={selectedTool.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <ToolIcon className="text-6xl opacity-75" />
                  )}
                </div>
              </div>

              {/* Tool Info */}
              <div className="lg:w-3/4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      {selectedTool.name}
                    </h1>
                    <p className="text-gray-600 mb-4">{selectedTool.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTool.status)}`}>
                      {selectedTool.status}
                    </span>
                    {selectedTool.isFeatured && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Tool Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedTool.usage?.totalUsage || 0}
                    </div>
                    <div className="text-sm text-gray-500">Total Uses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedTool.averageRating ? selectedTool.averageRating.toFixed(1) : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedTool.reviews?.length || 0}
                    </div>
                    <div className="text-sm text-gray-500">Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedTool.version || '1.0'}
                    </div>
                    <div className="text-sm text-gray-500">Version</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleUseTool(selectedTool)}
                    disabled={selectedTool.status === 'maintenance' || selectedTool.status === 'deprecated'}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FaPlay />
                    Use Tool
                  </button>

                  {user && (
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      <FaStar />
                      Write Review
                    </button>
                  )}

                  {selectedTool.toolType === 'external' && (
                    <button
                      onClick={() => window.open(selectedTool.configuration?.externalUrl, '_blank')}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      <FaExternalLinkAlt />
                      Open External
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tool Content Sections */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tool Description */}
              {selectedTool.longDescription && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4">About This Tool</h3>
                  <div className="prose max-w-none text-gray-700">
                    {selectedTool.longDescription.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3">{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* How to Use */}
              {selectedTool.instructions && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4">How to Use</h3>
                  <div className="prose max-w-none text-gray-700">
                    {selectedTool.instructions.split('\n').map((step, index) => (
                      <div key={index} className="flex items-start gap-3 mb-3">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <p className="flex-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Screenshots/Examples */}
              {selectedTool.screenshots && selectedTool.screenshots.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4">Screenshots</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedTool.screenshots.map((screenshot, index) => (
                      <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={screenshot.url}
                          alt={screenshot.caption || `Screenshot ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">User Reviews ({reviews.length})</h3>
                  {selectedTool.averageRating && (
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={star <= Math.round(selectedTool.averageRating) ? 'text-yellow-500' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {selectedTool.averageRating.toFixed(1)} out of 5
                      </span>
                    </div>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <FaComment className="text-4xl text-gray-300 mb-4 mx-auto" />
                    <p className="text-gray-500">No reviews yet. Be the first to review this tool!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.slice(0, 5).map((review, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {review.user.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-medium">{review.user.name}</h4>
                              <div className="flex text-yellow-500 text-sm">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <FaStar
                                    key={star}
                                    className={star <= review.rating ? 'text-yellow-500' : 'text-gray-300'}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.title && (
                          <h5 className="font-medium mb-2">{review.title}</h5>
                        )}
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tool Details */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">Tool Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium capitalize">{selectedTool.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{selectedTool.toolType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-medium">{selectedTool.version || '1.0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">
                      {new Date(selectedTool.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Supported Platforms */}
                {selectedTool.supportedPlatforms && selectedTool.supportedPlatforms.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Supported Platforms:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTool.supportedPlatforms.map((platform, index) => {
                        const PlatformIcon = getPlatformIcon(platform);
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm"
                          >
                            <PlatformIcon className="text-gray-600" />
                            <span className="capitalize">{platform}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedTool.tags && selectedTool.tags.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTool.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* System Requirements */}
              {selectedTool.systemRequirements && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4">System Requirements</h3>
                  <div className="space-y-2 text-sm">
                    {Object.entries(selectedTool.systemRequirements).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Tools */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">Related Tools</h3>
                <div className="space-y-3">
                  {tools
                    .filter(tool => 
                      tool._id !== selectedTool._id && 
                      tool.category === selectedTool.category
                    )
                    .slice(0, 3)
                    .map((tool, index) => {
                      const RelatedIcon = getToolIcon(tool.category);
                      return (
                        <div
                          key={index}
                          onClick={() => {
                            setSelectedTool(tool);
                            navigate(`/visitor/tools-resources/${tool._id}`);
                          }}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <RelatedIcon className="text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{tool.name}</h4>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Write a Review</h2>
              
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewFormData(prev => ({ ...prev, rating: star }))}
                        className={`text-2xl transition-colors ${
                          star <= reviewFormData.rating ? 'text-yellow-500' : 'text-gray-300'
                        }`}
                      >
                        <FaStar />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Title
                  </label>
                  <input
                    type="text"
                    value={reviewFormData.title}
                    onChange={(e) => setReviewFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief summary of your experience"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Comment *
                  </label>
                  <textarea
                    value={reviewFormData.comment}
                    onChange={(e) => setReviewFormData(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Share your experience with this tool"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !reviewFormData.comment.trim()}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Review'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Tools Browser View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FaTools className="text-blue-600" />
                Tools & Resources
              </h1>
              <p className="text-gray-600 mt-2">
                Discover powerful tools and resources to enhance your learning experience
              </p>
            </div>
          </div>
        </div>

        {/* Featured Tools */}
        {featuredTools.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaStar className="text-yellow-500" />
              Featured Tools
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTools.slice(0, 3).map((tool) => {
                const ToolIcon = getToolIcon(tool.category);
                return (
                  <div
                    key={tool._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => {
                      setSelectedTool(tool);
                      setView('detail');
                      navigate(`/visitor/tools-resources/${tool._id}`);
                    }}
                  >
                    <div className="aspect-video bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white">
                      {tool.iconUrl ? (
                        <img
                          src={tool.iconUrl}
                          alt={tool.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ToolIcon className="text-4xl opacity-75" />
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {tool.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tool.status)}`}>
                          {tool.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {tool.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaUsers />
                            {tool.usage?.totalUsage || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaStar />
                            {tool.averageRating ? tool.averageRating.toFixed(1) : 'N/A'}
                          </span>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUseTool(tool);
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          <FaPlay className="text-xs" />
                          Use Tool
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools and resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {toolCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Platform Filter */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {platformTypes.map((platform) => (
                <option key={platform.value} value={platform.value}>
                  {platform.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedTools.map((tool) => {
            const ToolIcon = getToolIcon(tool.category);
            return (
              <div
                key={tool._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => {
                  setSelectedTool(tool);
                  setView('detail');
                  navigate(`/visitor/tools-resources/${tool._id}`);
                }}
              >
                <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white">
                  {tool.iconUrl ? (
                    <img
                      src={tool.iconUrl}
                      alt={tool.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ToolIcon className="text-4xl opacity-75" />
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {tool.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tool.status)}`}>
                      {tool.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {tool.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaUsers />
                        {tool.usage?.totalUsage || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaStar />
                        {tool.averageRating ? tool.averageRating.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseTool(tool);
                      }}
                      disabled={tool.status === 'maintenance' || tool.status === 'deprecated'}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaPlay className="text-xs" />
                      Use
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {sortedTools.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaTools className="text-6xl text-gray-300 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Tools Found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedCategory !== 'all' || selectedPlatform !== 'all'
                ? 'Try adjusting your search filters'
                : 'Tools and resources will appear here once they are available'}
            </p>
            {(searchQuery || selectedCategory !== 'all' || selectedPlatform !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedPlatform('all');
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Quick Access Legacy Tools */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mt-8 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <FaInfoCircle />
            Quick Access
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={() => navigate('/map')}
              className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:shadow-md transition-all"
            >
              <FaGlobe className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Heritage Map</span>
            </div>
            
            <div 
              onClick={() => navigate('/courses')}
              className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:shadow-md transition-all"
            >
              <FaLaptop className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Browse Courses</span>
            </div>
            
            <div 
              onClick={() => navigate('/virtual-museum')}
              className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:shadow-md transition-all"
            >
              <FaEye className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-800">Virtual Museum</span>
            </div>
            
            <div 
              onClick={() => navigate('/support')}
              className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:shadow-md transition-all"
            >
              <FaQuestionCircle className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-800">Get Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsAndResources;
