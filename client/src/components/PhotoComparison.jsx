import React, { useState, useEffect, useRef } from 'react';
import { 
  Move, RotateCw, ZoomIn, ZoomOut, Maximize2, Minimize2,
  Calendar, MapPin, Info, Eye, EyeOff, Layers, ArrowLeftRight,
  Clock, Camera, Award, Play, Pause
} from 'lucide-react';

const PhotoComparison = ({ 
  beforeImage, 
  afterImage, 
  title,
  description,
  location,
  beforeDate,
  afterDate,
  comparisonType = "restoration", // restoration, archaeological, seasonal, development
  autoSlide = false,
  showMetadata = true,
  height = "400px"
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoSlide);
  const containerRef = useRef(null);
  const sliderRef = useRef(null);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setSliderPosition(prev => {
        if (prev >= 95) return 5;
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const getComparisonTypeInfo = () => {
    switch (comparisonType) {
      case 'restoration':
        return {
          icon: <Award className="w-4 h-4" />,
          label: 'Heritage Restoration',
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      case 'archaeological':
        return {
          icon: <Layers className="w-4 h-4" />,
          label: 'Archaeological Discovery',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
      case 'seasonal':
        return {
          icon: <Clock className="w-4 h-4" />,
          label: 'Seasonal Change',
          color: 'text-orange-600',
          bgColor: 'bg-orange-100'
        };
      case 'development':
        return {
          icon: <RotateCw className="w-4 h-4" />,
          label: 'Development Progress',
          color: 'text-purple-600',
          bgColor: 'bg-purple-100'
        };
      default:
        return {
          icon: <ArrowLeftRight className="w-4 h-4" />,
          label: 'Comparison',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
    }
  };

  const typeInfo = getComparisonTypeInfo();

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const resetSlider = () => {
    setSliderPosition(50);
  };

  const containerClasses = isFullscreen 
    ? "fixed inset-0 z-50 bg-black flex items-center justify-center" 
    : "";

  return (
    <div className={containerClasses}>
      <div className={`relative ${isFullscreen ? 'w-full h-full max-w-6xl max-h-full' : 'w-full'} bg-white rounded-lg overflow-hidden shadow-lg`}>
        
        {/* Header */}
        {showMetadata && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color} ${typeInfo.bgColor}`}>
                    {typeInfo.icon}
                    {typeInfo.label}
                  </span>
                  {location && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {location}
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
                {description && (
                  <p className="text-sm text-gray-600">{description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => setShowOverlay(!showOverlay)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                  title={showOverlay ? "Hide overlay" : "Show overlay"}
                >
                  {showOverlay ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>

                <button
                  onClick={toggleAutoPlay}
                  className={`p-2 rounded-lg transition-colors ${
                    isAutoPlaying 
                      ? 'text-primary bg-primary/10 hover:bg-primary/20' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  title={isAutoPlaying ? "Pause auto-slide" : "Start auto-slide"}
                >
                  {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  onClick={resetSlider}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                  title="Reset to center"
                >
                  <Move className="w-4 h-4" />
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Date Information */}
            {(beforeDate || afterDate) && (
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                {beforeDate && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span className="font-medium">Before:</span>
                    <span>{beforeDate}</span>
                  </div>
                )}
                {afterDate && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span className="font-medium">After:</span>
                    <span>{afterDate}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Comparison Container */}
        <div 
          ref={containerRef}
          className="relative select-none cursor-ew-resize"
          style={{ height: isFullscreen ? 'calc(100vh - 120px)' : height }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          
          {/* Before Image */}
          <div className="absolute inset-0">
            <img
              src={beforeImage.url || beforeImage}
              alt={beforeImage.alt || "Before"}
              className="w-full h-full object-cover"
              draggable={false}
            />
            
            {/* Before Label */}
            {showOverlay && (
              <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium">
                Before
              </div>
            )}
          </div>

          {/* After Image (Clipped) */}
          <div 
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
          >
            <img
              src={afterImage.url || afterImage}
              alt={afterImage.alt || "After"}
              className="w-full h-full object-cover"
              draggable={false}
            />
            
            {/* After Label */}
            {showOverlay && (
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium">
                After
              </div>
            )}
          </div>

          {/* Slider Line and Handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Handle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
              <div className="bg-white rounded-full p-3 shadow-lg border border-gray-200 cursor-ew-resize hover:bg-gray-50 transition-colors">
                <ArrowLeftRight className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Percentage Indicator */}
          {showOverlay && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium">
              {Math.round(sliderPosition)}% After
            </div>
          )}

          {/* Instructions */}
          {showOverlay && !isDragging && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium opacity-75 animate-pulse">
                ← Drag to compare →
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            
            {/* Preset Positions */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Quick positions:</span>
              <div className="flex gap-1">
                {[0, 25, 50, 75, 100].map(position => (
                  <button
                    key={position}
                    onClick={() => setSliderPosition(position)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      Math.abs(sliderPosition - position) < 5
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {position}%
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Before</span>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-200"
                  style={{ width: `${sliderPosition}%` }}
                />
              </div>
              <span>After</span>
            </div>
          </div>
        </div>

        {/* Fullscreen Exit Button */}
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-lg hover:bg-black/70 transition-colors z-20"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

// Gallery of Comparison Photos
const ComparisonGallery = ({ comparisons = [] }) => {
  const [selectedComparison, setSelectedComparison] = useState(null);

  const defaultComparisons = [
    {
      id: 'lalibela_restoration',
      title: 'Church of St. George Restoration',
      description: 'Major restoration work completed on the iconic rock-hewn church, preserving its structural integrity while maintaining historical authenticity.',
      location: 'Lalibela, Amhara Region',
      comparisonType: 'restoration',
      beforeDate: 'January 2020',
      afterDate: 'December 2023',
      beforeImage: {
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
        alt: 'Church before restoration'
      },
      afterImage: {
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&sat=20&bright=10',
        alt: 'Church after restoration'
      }
    },
    {
      id: 'aksum_excavation',
      title: 'Aksum Archaeological Excavation',
      description: 'Recent archaeological excavation has revealed new structures and artifacts, providing insights into the ancient Kingdom of Aksum.',
      location: 'Aksum, Tigray Region',
      comparisonType: 'archaeological',
      beforeDate: 'March 2022',
      afterDate: 'November 2023',
      beforeImage: {
        url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=600&fit=crop',
        alt: 'Site before excavation'
      },
      afterImage: {
        url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=600&fit=crop&sat=15&con=10',
        alt: 'Site after excavation'
      }
    },
    {
      id: 'gondar_castle_restoration',
      title: 'Gondar Castle Complex Restoration',
      description: 'Comprehensive restoration of the royal compound, focusing on structural stability and preservation of original architectural features.',
      location: 'Gondar, Amhara Region',
      comparisonType: 'restoration',
      beforeDate: 'June 2019',
      afterDate: 'August 2023',
      beforeImage: {
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&sat=-20',
        alt: 'Castle before restoration'
      },
      afterImage: {
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
        alt: 'Castle after restoration'
      }
    },
    {
      id: 'simien_seasonal',
      title: 'Simien Mountains Seasonal Change',
      description: 'The dramatic seasonal transformation of the Simien Mountains landscape, showing the difference between dry and wet seasons.',
      location: 'Simien Mountains National Park',
      comparisonType: 'seasonal',
      beforeDate: 'March 2023 (Dry Season)',
      afterDate: 'September 2023 (Wet Season)',
      beforeImage: {
        url: 'https://images.unsplash.com/photo-1573160103600-7c2a3c6cd5e0?w=800&h=600&fit=crop&sat=-10',
        alt: 'Mountains in dry season'
      },
      afterImage: {
        url: 'https://images.unsplash.com/photo-1573160103600-7c2a3c6cd5e0?w=800&h=600&fit=crop&sat=20',
        alt: 'Mountains in wet season'
      }
    }
  ];

  const allComparisons = comparisons.length > 0 ? comparisons : defaultComparisons;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Heritage Photo Comparisons</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Witness the transformation of Ethiopian heritage sites through restoration projects, 
          archaeological discoveries, and the passage of time.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {allComparisons.map((comparison) => (
          <div key={comparison.id} className="space-y-4">
            <PhotoComparison
              {...comparison}
              height="300px"
              autoSlide={false}
            />
            
            {/* Additional Info Card */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {comparison.comparisonType === 'restoration' && <Award className="w-4 h-4 text-green-600" />}
                  {comparison.comparisonType === 'archaeological' && <Layers className="w-4 h-4 text-blue-600" />}
                  {comparison.comparisonType === 'seasonal' && <Clock className="w-4 h-4 text-orange-600" />}
                  <span className="text-sm font-medium text-gray-900">
                    {comparison.comparisonType.charAt(0).toUpperCase() + comparison.comparisonType.slice(1)} Project
                  </span>
                </div>
                
                <button
                  onClick={() => setSelectedComparison(comparison)}
                  className="text-sm text-primary hover:text-primary-dark font-medium"
                >
                  View Details →
                </button>
              </div>
              
              <p className="text-sm text-gray-600 leading-relaxed">
                {comparison.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Modal */}
      {selectedComparison && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <PhotoComparison
                {...selectedComparison}
                height="500px"
                autoSlide={true}
              />
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedComparison(null)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoComparison;
export { ComparisonGallery };
