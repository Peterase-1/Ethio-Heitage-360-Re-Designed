import { useState, useEffect, useRef, useCallback } from 'react';
import mapService from '../services/mapService';

// Map provider detection and initialization
const detectMapProviders = () => {
  return {
    leaflet: typeof window !== 'undefined' && window.L,
    mapbox: typeof window !== 'undefined' && window.mapboxgl,
    hasMapbox: !!(import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.REACT_APP_MAPBOX_TOKEN)
  };
};

export function useMap({
  initialCenter = mapService.ETHIOPIA_CENTER,
  initialZoom = 6,
  provider = 'auto', // 'auto', 'leaflet', 'mapbox', 'fallback'
  style = 'streets'
} = {}) {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [center, setCenter] = useState(initialCenter);
  const [zoom, setZoom] = useState(initialZoom);
  const [error, setError] = useState(null);
  const [activeProvider, setActiveProvider] = useState(null);
  const [bounds, setBounds] = useState(null);

  // Detect and choose map provider
  useEffect(() => {
    const providers = detectMapProviders();
    let chosenProvider = 'fallback';

    if (provider === 'auto') {
      if (providers.mapbox && providers.hasMapbox) {
        chosenProvider = 'mapbox';
      } else if (providers.leaflet) {
        chosenProvider = 'leaflet';
      }
    } else if (provider === 'mapbox' && providers.mapbox && providers.hasMapbox) {
      chosenProvider = 'mapbox';
    } else if (provider === 'leaflet' && providers.leaflet) {
      chosenProvider = 'leaflet';
    }

    setActiveProvider(chosenProvider);
  }, [provider]);

  // Initialize map based on chosen provider
  useEffect(() => {
    if (!mapContainer.current || !activeProvider) return;
    if (mapInstance.current) return; // Already initialized

    setIsLoading(true);
    setError(null);

    try {
      if (activeProvider === 'mapbox') {
        initializeMapbox();
      } else if (activeProvider === 'leaflet') {
        initializeLeaflet();
      } else {
        // Fallback - no actual map initialization needed
        setIsLoaded(true);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Map initialization error:', err);
      setError(err.message);
      setIsLoading(false);
    }

    return () => {
      if (mapInstance.current) {
        if (activeProvider === 'mapbox') {
          mapInstance.current.remove();
        } else if (activeProvider === 'leaflet') {
          mapInstance.current.remove();
        }
        mapInstance.current = null;
      }
      markersRef.current = [];
    };
  }, [activeProvider]);

  const initializeMapbox = useCallback(() => {
    if (!window.mapboxgl) throw new Error('Mapbox GL JS not loaded');
    
    window.mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.REACT_APP_MAPBOX_TOKEN;
    
    const mapStyles = {
      streets: 'mapbox://styles/mapbox/streets-v11',
      satellite: 'mapbox://styles/mapbox/satellite-v9',
      outdoors: 'mapbox://styles/mapbox/outdoors-v11'
    };

    mapInstance.current = new window.mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyles[style] || mapStyles.streets,
      center: [center.lng, center.lat],
      zoom: zoom,
      bounds: mapService.ETHIOPIA_BOUNDS
    });

    mapInstance.current.on('load', () => {
      setIsLoaded(true);
      setIsLoading(false);
    });

    mapInstance.current.on('move', () => {
      const mapCenter = mapInstance.current.getCenter();
      setCenter({ lat: mapCenter.lat, lng: mapCenter.lng });
      setZoom(mapInstance.current.getZoom());
    });

    mapInstance.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right');
  }, [center, zoom, style]);

  const initializeLeaflet = useCallback(() => {
    if (!window.L) throw new Error('Leaflet not loaded');

    mapInstance.current = window.L.map(mapContainer.current, {
      center: [center.lat, center.lng],
      zoom: zoom,
      zoomControl: false
    });

    // Add tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(mapInstance.current);

    // Add zoom control
    window.L.control.zoom({ position: 'topright' }).addTo(mapInstance.current);

    mapInstance.current.on('moveend', () => {
      const mapCenter = mapInstance.current.getCenter();
      setCenter({ lat: mapCenter.lat, lng: mapCenter.lng });
      setZoom(mapInstance.current.getZoom());
    });

    setIsLoaded(true);
    setIsLoading(false);
  }, [center, zoom]);

  // Add marker function
  const addMarker = useCallback((location, options = {}) => {
    if (!mapInstance.current) return null;

    const { popup, icon, draggable = false } = options;
    let marker;

    if (activeProvider === 'mapbox') {
      marker = new window.mapboxgl.Marker({ draggable })
        .setLngLat([location.lng, location.lat])
        .addTo(mapInstance.current);

      if (popup) {
        marker.setPopup(
          new window.mapboxgl.Popup({ offset: 25 })
            .setHTML(typeof popup === 'string' ? popup : popup.content)
        );
      }
    } else if (activeProvider === 'leaflet') {
      const markerOptions = { draggable };
      if (icon) markerOptions.icon = icon;

      marker = window.L.marker([location.lat, location.lng], markerOptions)
        .addTo(mapInstance.current);

      if (popup) {
        marker.bindPopup(typeof popup === 'string' ? popup : popup.content);
      }
    }

    markersRef.current.push(marker);
    return marker;
  }, [activeProvider]);

  // Remove all markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => {
      if (activeProvider === 'mapbox') {
        marker.remove();
      } else if (activeProvider === 'leaflet') {
        mapInstance.current.removeLayer(marker);
      }
    });
    markersRef.current = [];
  }, [activeProvider]);

  // Fly to location
  const flyTo = useCallback((location, zoomLevel = 12, options = {}) => {
    if (!mapInstance.current) return;

    if (activeProvider === 'mapbox') {
      mapInstance.current.flyTo({
        center: [location.lng, location.lat],
        zoom: zoomLevel,
        ...options
      });
    } else if (activeProvider === 'leaflet') {
      mapInstance.current.flyTo([location.lat, location.lng], zoomLevel, {
        animate: true,
        duration: 1,
        ...options
      });
    }
  }, [activeProvider]);

  // Fit bounds
  const fitBounds = useCallback((bounds, options = {}) => {
    if (!mapInstance.current || !bounds) return;

    if (activeProvider === 'mapbox') {
      mapInstance.current.fitBounds([
        [bounds.west, bounds.south],
        [bounds.east, bounds.north]
      ], {
        padding: 50,
        ...options
      });
    } else if (activeProvider === 'leaflet') {
      mapInstance.current.fitBounds([
        [bounds.south, bounds.west],
        [bounds.north, bounds.east]
      ], {
        padding: [20, 20],
        ...options
      });
    }
  }, [activeProvider]);

  // Get current bounds
  const getCurrentBounds = useCallback(() => {
    if (!mapInstance.current) return null;

    if (activeProvider === 'mapbox') {
      const bounds = mapInstance.current.getBounds();
      return {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      };
    } else if (activeProvider === 'leaflet') {
      const bounds = mapInstance.current.getBounds();
      return {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      };
    }
    return null;
  }, [activeProvider]);

  return {
    // Refs
    mapContainer,
    mapInstance: mapInstance.current,
    
    // State
    isLoaded,
    isLoading,
    error,
    center,
    zoom,
    bounds,
    activeProvider,
    
    // Methods
    addMarker,
    clearMarkers,
    flyTo,
    fitBounds,
    getCurrentBounds,
    
    // Utilities
    resetView: () => flyTo(mapService.ETHIOPIA_CENTER, 6),
    
    // Provider info
    providerInfo: {
      name: activeProvider,
      isMapbox: activeProvider === 'mapbox',
      isLeaflet: activeProvider === 'leaflet',
      isFallback: activeProvider === 'fallback'
    }
  };
}
