import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Info, Star, Navigation, ZoomIn, ZoomOut } from 'lucide-react';
// Import Leaflet CSS in index.html or App.css
// import 'leaflet/dist/leaflet.css';

const InteractiveMap = ({ sites, selectedSite, onSiteSelect }) => {
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState({ lat: 12.0, lng: 39.0 }); // Center of Ethiopia
  const [zoom, setZoom] = useState(6);

  // Simple map implementation using CSS and positioning
  // In production, you'd replace this with Leaflet or Mapbox
  useEffect(() => {
    if (selectedSite) {
      setMapCenter({ lat: selectedSite.lat, lng: selectedSite.lng });
      setZoom(10);
    }
  }, [selectedSite]);

  const handleMarkerClick = (site) => {
    onSiteSelect(site);
  };

  // Convert lat/lng to pixel coordinates for display
  const getMarkerPosition = (site) => {
    // Simple projection (not accurate, but works for demo)
    const mapWidth = 800;
    const mapHeight = 600;
    
    // Ethiopia bounds approximately
    const minLat = 3, maxLat = 18;
    const minLng = 33, maxLng = 48;
    
    const x = ((site.lng - minLng) / (maxLng - minLng)) * mapWidth;
    const y = ((maxLat - site.lat) / (maxLat - minLat)) * mapHeight;
    
    return { x: `${x}px`, y: `${y}px` };
  };

  return (
    <div className="relative h-full bg-background">
      {/* Map Container */}
      <div 
        ref={mapRef}
        className="relative w-full h-full bg-gradient-to-br from-green-100 to-blue-100 overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(34, 197, 94, 0.1) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(34, 197, 94, 0.1) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(34, 197, 94, 0.1) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(34, 197, 94, 0.1) 75%)
          `,
          backgroundSize: '60px 60px',
          backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0px'
        }}
      >
        {/* Ethiopia Map Outline (simplified) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl text-primary/10 font-bold transform -rotate-12">
            ETHIOPIA
          </div>
        </div>

        {/* Site Markers */}
        {sites.map(site => {
          const position = getMarkerPosition(site);
          const isSelected = selectedSite?.id === site.id;
          
          return (
            <div
              key={site.id}
              onClick={() => handleMarkerClick(site)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110 ${
                isSelected ? 'z-20 scale-125' : 'z-10'
              }`}
              style={{ left: position.x, top: position.y }}
            >
              {/* Marker Pin */}
              <div className={`relative ${
                isSelected ? 'animate-pulse' : ''
              }`}>
                <MapPin 
                  className={`w-8 h-8 ${
                    site.category === 'UNESCO World Heritage' 
                      ? 'text-yellow-600' 
                      : site.category === 'Natural Heritage'
                      ? 'text-green-600'
                      : 'text-primary'
                  } drop-shadow-lg`}
                  fill="currentColor"
                />
                
                {/* Site Label */}
                <div className={`absolute top-8 left-1/2 transform -translate-x-1/2 transition-all duration-200 ${
                  isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'
                }`}>
                  <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                    <div className="text-sm font-semibold text-foreground">
                      {site.name}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      {site.category === 'UNESCO World Heritage' && (
                        <Star className="w-3 h-3 text-yellow-500 mr-1" />
                      )}
                      {site.region}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 bg-card border border-border rounded-lg p-2 shadow-lg">
        <div className="flex flex-col space-y-2">
          <button 
            onClick={() => setZoom(Math.min(zoom + 1, 12))}
            className="p-2 hover:bg-muted rounded text-foreground transition-colors"
          >
            +
          </button>
          <button 
            onClick={() => setZoom(Math.max(zoom - 1, 4))}
            className="p-2 hover:bg-muted rounded text-foreground transition-colors"
          >
            -
          </button>
        </div>
      </div>

      {/* Selected Site Info Panel */}
      {selectedSite && (
        <div className="absolute bottom-4 left-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                {selectedSite.category === 'UNESCO World Heritage' && (
                  <Star className="w-4 h-4 text-yellow-500 mr-2" />
                )}
                <h3 className="text-lg font-bold text-foreground">
                  {selectedSite.name}
                </h3>
              </div>
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <MapPin className="w-3 h-3 mr-1" />
                {selectedSite.region} Region
              </div>
              <div className="text-sm bg-secondary/20 text-secondary px-2 py-1 rounded-full inline-block">
                {selectedSite.category}
              </div>
            </div>
            <button 
              onClick={() => onSiteSelect(null)}
              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-card border border-border rounded-lg p-3 shadow-lg">
        <h4 className="text-sm font-semibold text-foreground mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 text-yellow-600 mr-2" />
            <span>UNESCO World Heritage</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 text-green-600 mr-2" />
            <span>Natural Heritage</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 text-primary mr-2" />
            <span>Other Sites</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;