import axios from 'axios';

const API_URL = '/api/map';
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.REACT_APP_MAPBOX_TOKEN;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Map API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Heritage Sites API
const getHeritageSites = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await apiClient.get(`/heritage-sites?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching heritage sites:', error);
    // Fallback to mock data if API fails
    return {
      success: true,
      data: [],
      message: 'Using fallback data'
    };
  }
};

// Get heritage site filters/options
const getHeritageSiteFilters = async () => {
  try {
    const response = await apiClient.get('/heritage-sites/filters');
    return response.data;
  } catch (error) {
    console.error('Error fetching heritage site filters:', error);
    return {
      success: true,
      data: {
        categories: [],
        regions: [],
        types: []
      }
    };
  }
};

// Get single heritage site
const getHeritageSite = async (siteId) => {
  try {
    const response = await apiClient.get(`/heritage-sites/${siteId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching heritage site:', error);
    throw error;
  }
};

// Search heritage sites
const searchHeritageSites = async (query, filters = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('search', query);
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await apiClient.get(`/heritage-sites/search?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error searching heritage sites:', error);
    throw error;
  }
};

// Museums API
const getMuseumLocations = async () => {
  try {
    const response = await apiClient.get('/museums');
    return response.data;
  } catch (error) {
    console.error('Error fetching museum locations:', error);
    return {
      success: true,
      data: []
    };
  }
};

// Nearby locations
const getNearbyLocations = async (lat, lng, radius = 10, type = 'all') => {
  try {
    const response = await apiClient.get(`/nearby?lat=${lat}&lng=${lng}&radius=${radius}&type=${type}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching nearby locations:', error);
    throw error;
  }
};

// Geocoding services
const geocodeAddress = async (address) => {
  if (!MAPBOX_TOKEN) {
    throw new Error('Mapbox token not configured');
  }
  
  try {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&country=ET&limit=5`
    );
    return response.data;
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw error;
  }
};

const reverseGeocode = async (lat, lng) => {
  if (!MAPBOX_TOKEN) {
    throw new Error('Mapbox token not configured');
  }
  
  try {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=place,locality,neighborhood`
    );
    return response.data;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    throw error;
  }
};

// Directions
const getDirections = async (start, end, profile = 'driving') => {
  if (!MAPBOX_TOKEN) {
    throw new Error('Mapbox token not configured');
  }
  
  try {
    const response = await axios.get(
      `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start.lng},${start.lat};${end.lng},${end.lat}?access_token=${MAPBOX_TOKEN}&geometries=geojson&overview=full&steps=true`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting directions:', error);
    throw error;
  }
};

// Location management
const addLocation = async (locationData) => {
  try {
    const response = await apiClient.post('/locations', locationData);
    return response.data;
  } catch (error) {
    console.error('Error adding location:', error);
    throw error;
  }
};

const updateLocation = async (locationId, locationData) => {
  try {
    const response = await apiClient.put(`/locations/${locationId}`, locationData);
    return response.data;
  } catch (error) {
    console.error('Error updating location:', error);
    throw error;
  }
};

const deleteLocation = async (locationId) => {
  try {
    const response = await apiClient.delete(`/locations/${locationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting location:', error);
    throw error;
  }
};

// Map utilities
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

const getBounds = (locations) => {
  if (!locations || locations.length === 0) {
    return null;
  }
  
  const bounds = {
    north: -90,
    south: 90,
    east: -180,
    west: 180
  };
  
  locations.forEach(location => {
    const lat = location.lat || location.latitude;
    const lng = location.lng || location.longitude;
    
    if (lat > bounds.north) bounds.north = lat;
    if (lat < bounds.south) bounds.south = lat;
    if (lng > bounds.east) bounds.east = lng;
    if (lng < bounds.west) bounds.west = lng;
  });
  
  return bounds;
};

// Export service object
const mapService = {
  // Heritage Sites
  getHeritageSites,
  getHeritageSiteFilters,
  getHeritageSite,
  searchHeritageSites,
  
  // Museums
  getMuseumLocations,
  
  // Location services
  getNearbyLocations,
  addLocation,
  updateLocation,
  deleteLocation,
  
  // Geocoding
  geocodeAddress,
  reverseGeocode,
  
  // Directions
  getDirections,
  
  // Utilities
  calculateDistance,
  formatDistance,
  getBounds,
  
  // Constants
  ETHIOPIA_CENTER: { lat: 9.0292, lng: 38.7578 },
  ETHIOPIA_BOUNDS: {
    north: 18.0,
    south: 3.0,
    east: 48.0,
    west: 33.0
  }
};

export default mapService;
