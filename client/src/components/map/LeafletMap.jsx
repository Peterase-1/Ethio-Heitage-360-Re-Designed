import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Info, Star, Navigation, ZoomIn, ZoomOut } from 'lucide-react';

const LeafletMap = ({ sites, selectedSite, onSiteSelect }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current) return;

    // Check if Leaflet is available (fallback to CSS map if not)
    if (typeof window !== 'undefined' && window.L) {
      const leafletMap = window.L.map(mapRef.current, {
        center: [9.0, 38.7], // Center of Ethiopia
        zoom: 6,
        zoomControl: false,
      });

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(leafletMap);

      setMap(leafletMap);

      return () => {
        leafletMap.remove();
      };
    }
  }, []);

  // Add markers when sites change
  useEffect(() => {
    if (!map || !sites.length) return;

    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));

    const newMarkers = sites.map(site => {
      const icon = window.L.divIcon({
        html: `
          <div class="flex flex-col items-center">
            <div class="w-8 h-8 ${getMarkerColor(site.category)} rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div class="mt-1 px-2 py-1 bg-white rounded shadow-lg text-xs font-medium text-gray-800 whitespace-nowrap">
              ${site.name}
            </div>
          </div>
        `,
        className: 'heritage-marker',
        iconSize: [100, 60],
        iconAnchor: [50, 60],
        popupAnchor: [0, -60],
      });

      const marker = window.L.marker([site.lat, site.lng], { icon })
        .bindPopup(`
          <div class="p-3 min-w-[200px]">
            <h3 class="font-bold text-lg mb-2 flex items-center">
              ${site.category === 'UNESCO World Heritage' ? '<span class="text-yellow-500 mr-2">⭐</span>' : ''}
              ${site.name}
            </h3>
            <p class="text-sm text-gray-600 mb-2">
              <span class="font-medium">Region:</span> ${site.region}
            </p>
            <p class="text-sm text-gray-600 mb-3">
              <span class="font-medium">Category:</span> ${site.category}
            </p>
            ${site.description ? `<p class="text-sm text-gray-700">${site.description}</p>` : ''}
          </div>
        `)
        .on('click', () => onSiteSelect(site))
        .addTo(map);

      return marker;
    });

    setMarkers(newMarkers);
  }, [map, sites, onSiteSelect]);

  // Focus on selected site
  useEffect(() => {
    if (!map || !selectedSite) return;

    map.flyTo([selectedSite.lat, selectedSite.lng], 10, {
      animate: true,
      duration: 1
    });

    // Find and open popup for selected site
    const selectedMarker = markers.find((marker, index) => 
      sites[index]?.id === selectedSite.id
    );
    if (selectedMarker) {
      selectedMarker.openPopup();
    }
  }, [map, selectedSite, markers, sites]);

  const getMarkerColor = (category) => {
    switch (category) {
      case 'UNESCO World Heritage':
        return 'bg-yellow-600';
      case 'Natural Heritage':
        return 'bg-green-600';
      case 'Archaeological Site':
        return 'bg-orange-600';
      case 'Religious Site':
        return 'bg-purple-600';
      default:
        return 'bg-blue-600';
    }
  };

  const resetMapView = () => {
    if (map) {
      map.flyTo([9.0, 38.7], 6, { animate: true, duration: 1 });
      onSiteSelect(null);
    }
  };

  // Fallback CSS map if Leaflet not available
  if (typeof window === 'undefined' || !window.L) {
    return (
      <div className="relative h-full bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Loading Map...</h3>
          <p className="text-muted-foreground">
            Interactive map will load once dependencies are installed.
          </p>
          <div className="mt-4 text-sm text-muted-foreground">
            Run: <code className="bg-muted px-2 py-1 rounded">npm install react-leaflet leaflet</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />

      {/* Custom Controls */}
      <div className="absolute top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg">
        <div className="flex flex-col">
          <button 
            onClick={() => map?.zoomIn()}
            className="p-3 hover:bg-gray-100 border-b border-gray-200 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
          <button 
            onClick={() => map?.zoomOut()}
            className="p-3 hover:bg-gray-100 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Reset View Button */}
      <button
        onClick={resetMapView}
        className="absolute top-4 left-20 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg hover:bg-primary/90 transition-colors flex items-center text-sm"
      >
        <Navigation className="w-4 h-4 mr-2" />
        Reset View
      </button>

      {/* Sites Count */}
      <div className="absolute bottom-4 right-4 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-lg">
        <div className="text-sm text-gray-600">
          <strong>{sites.length}</strong> heritage sites
        </div>
      </div>
    </div>
  );
};

export default LeafletMap;