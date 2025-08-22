import React, { useState } from 'react';
import { Eye, RotateCcw, ZoomIn, ZoomOut, Move3D, Info, X, Maximize, Minimize } from 'lucide-react';

// Simple 3D-like viewer component without Three.js dependencies
const SimpleARVRViewer = ({ artifact, onClose }) => {
  const [viewMode, setViewMode] = useState('3d'); // '3d', 'ar', 'vr'
  const [showInfo, setShowInfo] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(true);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => prev + 90);
  };

  const resetView = () => {
    setZoom(1);
    setRotation(0);
  };

  // Fallback viewer when 3D model isn't available
  const renderFallbackViewer = () => {
    return (
      <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div 
          className="max-w-2xl max-h-2xl transition-all duration-300 ease-in-out"
          style={{ 
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: 'center'
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="relative">
              <img
                src={artifact.image || 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=600&h=400&fit=crop&crop=center'}
                alt={artifact.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=600&h=400&fit=crop&crop=center';
                }}
              />
              
              {/* Artifact Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h2 className="text-white text-2xl font-bold mb-2">{artifact.name}</h2>
                <p className="text-white/90 text-sm">{artifact.description}</p>
                <div className="flex items-center gap-4 mt-3 text-white/80 text-sm">
                  <span>{artifact.origin}</span>
                  <span>•</span>
                  <span>{artifact.period}</span>
                  <span>•</span>
                  <span>{artifact.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced 3D-like viewer with animations
  const render3DViewer = () => {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse" style={{ top: '10%', left: '10%' }}></div>
          <div className="absolute w-64 h-64 bg-blue-500/5 rounded-full blur-2xl animate-pulse delay-1000" style={{ bottom: '20%', right: '15%' }}></div>
        </div>
        
        <div className="relative z-10">
          <div 
            className="transition-all duration-500 ease-out"
            style={{ 
              transform: `scale(${zoom}) rotate(${rotation}deg) perspective(1000px) rotateX(5deg)`,
              transformOrigin: 'center'
            }}
          >
            <div className="bg-gradient-to-br from-white to-gray-100 rounded-3xl shadow-2xl overflow-hidden border-4 border-white/20 backdrop-blur-sm">
              <div className="relative group">
                <img
                  src={artifact.image || 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop&crop=center'}
                  alt={artifact.name}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop&crop=center';
                  }}
                />
                
                {/* 3D-like frame effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 delay-200"></div>
                
                {/* Interactive hotspots */}
                <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-amber-500 rounded-full animate-ping cursor-pointer" title="Click for details"></div>
                <div className="absolute bottom-1/3 right-1/4 w-4 h-4 bg-blue-500 rounded-full animate-ping delay-500 cursor-pointer" title="Historical context"></div>
                
                {/* Museum-like lighting effect */}
                <div className="absolute top-0 left-1/2 w-32 h-32 bg-gradient-to-br from-white/30 to-transparent transform -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
              </div>
              
              {/* Enhanced info panel */}
              <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{artifact.name}</h2>
                <p className="text-gray-700 mb-4 leading-relaxed">{artifact.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/60 rounded-lg p-3">
                    <span className="font-semibold text-amber-800">Origin:</span>
                    <br />
                    <span className="text-gray-700">{artifact.origin}</span>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <span className="font-semibold text-amber-800">Period:</span>
                    <br />
                    <span className="text-gray-700">{artifact.period}</span>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <span className="font-semibold text-amber-800">Category:</span>
                    <br />
                    <span className="text-gray-700">{artifact.category}</span>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <span className="font-semibold text-amber-800">Museum:</span>
                    <br />
                    <span className="text-gray-700 text-xs">{artifact.museum}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 bg-black z-50 ${isFullscreen ? '' : 'p-8'}`}>
      {/* Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('3d')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
              viewMode === '3d' 
                ? 'bg-amber-600 text-white shadow-lg' 
                : 'bg-white/90 text-gray-800 hover:bg-amber-50'
            }`}
          >
            <Move3D size={18} />
            <span className="font-medium">3D View</span>
          </button>
          
          <button
            onClick={() => setViewMode('ar')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
              viewMode === 'ar' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white/90 text-gray-800 hover:bg-blue-50'
            }`}
          >
            <Eye size={18} />
            <span className="font-medium">AR Mode</span>
            <span className="text-xs bg-white/20 px-1 rounded">Soon</span>
          </button>
          
          <button
            onClick={() => setViewMode('vr')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
              viewMode === 'vr' 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'bg-white/90 text-gray-800 hover:bg-purple-50'
            }`}
          >
            <Eye size={18} />
            <span className="font-medium">VR Mode</span>
            <span className="text-xs bg-white/20 px-1 rounded">Soon</span>
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          
          <button
            onClick={handleZoomIn}
            className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          
          <button
            onClick={handleRotate}
            className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition-colors"
            title="Rotate"
          >
            <RotateCcw size={18} />
          </button>
          
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-all ${
              showInfo 
                ? 'bg-green-600 text-white'
                : 'bg-white/90 text-gray-700 hover:bg-green-50'
            }`}
          >
            <Info size={18} />
            <span className="text-sm font-medium">Info</span>
          </button>
          
          <button
            onClick={resetView}
            className="px-3 py-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition-colors flex items-center space-x-1"
          >
            <RotateCcw size={18} />
            <span className="text-sm font-medium">Reset</span>
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
          >
            <X size={18} />
            <span className="font-medium">Close</span>
          </button>
        </div>
      </div>

      {/* Main Viewer Area */}
      <div className="w-full h-full pt-16">
        {viewMode === '3d' ? render3DViewer() : renderFallbackViewer()}
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="absolute top-20 right-4 w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 z-20 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Virtual Museum Guide</h3>
            <button
              onClick={() => setShowInfo(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Controls:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Zoom: Use zoom buttons</li>
                <li>• Rotate: Click rotate button</li>
                <li>• Reset: Return to original view</li>
                <li>• Fullscreen: Toggle viewing mode</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">View Modes:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <span className="font-medium">3D View:</span> Enhanced interactive viewing</li>
                <li>• <span className="font-medium">AR Mode:</span> Coming soon - augmented reality</li>
                <li>• <span className="font-medium">VR Mode:</span> Coming soon - virtual reality</li>
              </ul>
            </div>
            
            <div className="pt-2 border-t border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-2">Artifact Details:</h4>
              <div className="text-sm text-gray-600">
                <p><span className="font-medium">Views:</span> {artifact.views}</p>
                <p><span className="font-medium">Likes:</span> {artifact.likes}</p>
                <p><span className="font-medium">Rating:</span> {artifact.rating}/5.0</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicators */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-4 text-white">
        <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Viewer Active</span>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
          <span className="text-sm font-medium">Zoom: {(zoom * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* View Mode Indicator */}
      <div className="absolute bottom-4 right-4 text-white">
        <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
          <span className="text-sm font-medium">
            Mode: <span className="text-amber-400">{viewMode.toUpperCase()}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SimpleARVRViewer;
