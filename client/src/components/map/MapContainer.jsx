import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Filter, ChevronDown, Star, Navigation, ZoomIn, ZoomOut, Info, Layers, Search, X } from 'lucide-react';
import LeafletMap from './LeafletMap';
import InteractiveMap from './InteractiveMap';

const MapContainer = ({ 
  sites = [], 
  selectedSite, 
  onSiteSelect, 
  showSidebar = true, 
  mapType = 'auto', // 'leaflet', 'interactive', 'auto'
  showFilters = true,
  showSearch = true,
  className = ''
}) => {
  const [filteredSites, setFilteredSites] = useState(sites);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [useLeaflet, setUseLeaflet] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check for Leaflet availability
  useEffect(() => {
    if (mapType === 'leaflet') {
      setUseLeaflet(true);
    } else if (mapType === 'interactive') {
      setUseLeaflet(false);
    } else {
      // Auto-detect
      setUseLeaflet(typeof window !== 'undefined' && window.L);
    }
  }, [mapType]);

  // Get unique filter options
  const categories = ['all', ...new Set(sites.map(site => site.category))];
  const regions = ['all', ...new Set(sites.map(site => site.region))];
  const types = ['all', ...new Set(sites.map(site => site.type).filter(Boolean))];

  // Apply filters and search
  useEffect(() => {
    let filtered = [...sites];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(site =>
        site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.region.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(site => site.category === selectedCategory);
    }

    if (selectedRegion !== 'all') {
      filtered = filtered.filter(site => site.region === selectedRegion);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(site => site.type === selectedType);
    }

    setFilteredSites(filtered);
  }, [sites, searchQuery, selectedCategory, selectedRegion, selectedType]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedRegion('all');
    setSelectedType('all');
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'UNESCO World Heritage':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'Natural Heritage':
        return <Layers className="w-4 h-4 text-green-500" />;
      case 'National Museum':
      case 'Museum':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <MapPin className="w-4 h-4 text-primary" />;
    }
  };

  const MapComponent = useLeaflet ? LeafletMap : InteractiveMap;

  return (
    <div className={`flex h-full bg-background ${className}`}>
      {/* Map Container */}
      <div className="flex-1 relative">
        <MapComponent 
          sites={filteredSites}
          selectedSite={selectedSite}
          onSiteSelect={onSiteSelect}
        />

        {/* Map Type Indicator */}
        <div className="absolute top-4 left-4 bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${useLeaflet ? 'bg-green-500' : 'bg-blue-500'}`}></div>
            {useLeaflet ? 'Leaflet Map' : 'Interactive Map'}
          </div>
        </div>

        {/* Search Bar (if enabled and no sidebar) */}
        {showSearch && !showSidebar && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-96 max-w-[calc(100%-2rem)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search heritage sites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors shadow-lg"
              />
            </div>
          </div>
        )}

        {/* Filters Button (if no sidebar) */}
        {showFilters && !showSidebar && (
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`absolute top-4 right-4 bg-card border border-border rounded-lg px-3 py-2 shadow-lg hover:bg-muted transition-colors ${
              showFilterPanel ? 'bg-primary text-primary-foreground' : ''
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        )}

        {/* Filter Panel (if no sidebar) */}
        {showFilters && !showSidebar && showFilterPanel && (
          <div className="absolute top-16 right-4 bg-card border border-border rounded-lg p-4 shadow-lg w-80 max-w-[calc(100%-2rem)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setShowFilterPanel(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region Filter */}
              <div>
                <label className="block text-sm font-medium mb-1">Region</label>
                <select 
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                >
                  {regions.map(region => (
                    <option key={region} value={region}>
                      {region === 'all' ? 'All Regions' : region}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              {types.length > 1 && (
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select 
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  >
                    {types.map(type => (
                      <option key={type} value={type}>
                        {type === 'all' ? 'All Types' : type}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full mt-3 px-3 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div className={`bg-card border-l border-border transition-all duration-300 ${
          sidebarCollapsed ? 'w-12' : 'w-80'
        } relative`}>
          {/* Sidebar Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -left-3 top-4 bg-card border border-border rounded-full p-1 shadow-lg hover:bg-muted transition-colors z-10"
          >
            <ChevronDown className={`w-4 h-4 transform transition-transform ${
              sidebarCollapsed ? 'rotate-90' : '-rotate-90'
            }`} />
          </button>

          {!sidebarCollapsed && (
            <div className="p-4 h-full overflow-y-auto">
              {/* Header */}
              <div className="flex items-center mb-4">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                <h2 className="text-lg font-bold">Heritage Sites</h2>
              </div>

              {/* Search */}
              {showSearch && (
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search sites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
              )}

              {/* Filters */}
              {showFilters && (
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Filters</h3>
                    {(selectedCategory !== 'all' || selectedRegion !== 'all' || selectedType !== 'all') && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-destructive hover:text-destructive/80"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-border rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                  
                  <select 
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full p-2 border border-border rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {regions.map(region => (
                      <option key={region} value={region}>
                        {region === 'all' ? 'All Regions' : region}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sites List */}
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground mb-3">
                  {filteredSites.length} of {sites.length} sites
                </div>
                
                {filteredSites.map(site => (
                  <div
                    key={site.id}
                    onClick={() => onSiteSelect(site)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${
                      selectedSite?.id === site.id
                        ? 'bg-primary/10 border-primary border'
                        : 'hover:bg-muted border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {getCategoryIcon(site.category)}
                          <h4 className="font-semibold text-sm ml-2 line-clamp-2">
                            {site.name}
                          </h4>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mb-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {site.region}
                        </div>
                        <div className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full inline-block">
                          {site.category}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapContainer;
