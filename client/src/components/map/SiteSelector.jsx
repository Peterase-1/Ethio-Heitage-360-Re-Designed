import React, { useState } from 'react';
import { MapPin, Filter, ChevronDown, Star } from 'lucide-react';

const SiteSelector = ({ sites, onSiteSelect, selectedSite }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Get unique categories and regions
  const categories = ['all', ...new Set(sites.map(site => site.category))];
  const regions = ['all', ...new Set(sites.map(site => site.region))];

  // Filter sites based on selections
  const filteredSites = sites.filter(site => {
    const categoryMatch = selectedCategory === 'all' || site.category === selectedCategory;
    const regionMatch = selectedRegion === 'all' || site.region === selectedRegion;
    return categoryMatch && regionMatch;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Filter className="w-5 h-5 mr-2 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Heritage Sites</h2>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Category
          </label>
          <div className="relative">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none cursor-pointer"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Region Filter */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Region
          </label>
          <div className="relative">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none cursor-pointer"
            >
              {regions.map(region => (
                <option key={region} value={region}>
                  {region === 'all' ? 'All Regions' : region}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Sites List */}
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground mb-3">
          {filteredSites.length} sites found
        </div>
        
        {filteredSites.map(site => (
          <div
            key={site.id}
            onClick={() => onSiteSelect(site)}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedSite?.id === site.id 
                ? 'border-primary bg-primary/5 shadow-sm' 
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                  {site.name}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="w-3 h-3 mr-1" />
                  {site.region}
                </div>
                <div className="flex items-center">
                  {site.category === 'UNESCO World Heritage' && (
                    <Star className="w-3 h-3 text-yellow-500 mr-1" />
                  )}
                  <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
                    {site.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SiteSelector;