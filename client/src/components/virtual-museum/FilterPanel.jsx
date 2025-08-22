import React from 'react';
import { Filter, X, Sliders, MapPin, Calendar, Building, Box } from 'lucide-react';

const FilterPanel = ({ filters, onFiltersChange, onClearFilters, artifacts }) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleToggle3D = () => {
    onFiltersChange({
      ...filters,
      has3D: !filters.has3D
    });
  };

  // Extract unique values for dropdowns
  const categories = [...new Set(artifacts.map(artifact => artifact.category))];
  const periods = [...new Set(artifacts.map(artifact => artifact.period))];
  const origins = [...new Set(artifacts.map(artifact => artifact.origin))];
  const museums = [...new Set(artifacts.map(artifact => artifact.museum))];

  const hasActiveFilters = Object.values(filters).some(value => 
    typeof value === 'boolean' ? value : value !== ''
  );

  return (
    <div className="bg-card rounded-3xl border border-border shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Sliders className="w-5 h-5 text-muted-foreground mr-2" />
          <h3 className="text-lg font-semibold text-card-foreground">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center text-sm text-destructive hover:text-destructive/90 font-medium"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <label className="flex items-center text-sm font-medium text-muted-foreground mb-2">
            <Filter className="w-4 h-4 mr-1" />
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm bg-background"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Time Period Filter */}
        <div>
          <label className="flex items-center text-sm font-medium text-muted-foreground mb-2">
            <Calendar className="w-4 h-4 mr-1" />
            Time Period
          </label>
          <select
            value={filters.period}
            onChange={(e) => handleFilterChange('period', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm bg-background"
          >
            <option value="">All Periods</option>
            {periods.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
        </div>

        {/* Origin Filter */}
        <div>
          <label className="flex items-center text-sm font-medium text-muted-foreground mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            Origin
          </label>
          <select
            value={filters.origin}
            onChange={(e) => handleFilterChange('origin', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm bg-background"
          >
            <option value="">All Origins</option>
            {origins.map((origin) => (
              <option key={origin} value={origin}>
                {origin}
              </option>
            ))}
          </select>
        </div>

        {/* Museum Filter */}
        <div>
          <label className="flex items-center text-sm font-medium text-muted-foreground mb-2">
            <Building className="w-4 h-4 mr-1" />
            Museum
          </label>
          <select
            value={filters.museum}
            onChange={(e) => handleFilterChange('museum', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm bg-background"
          >
            <option value="">All Museums</option>
            {museums.map((museum) => (
              <option key={museum} value={museum}>
                {museum}
              </option>
            ))}
          </select>
        </div>

        {/* 3D Models Filter */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.has3D}
              onChange={handleToggle3D}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
            />
            <div className="ml-3 flex items-center">
              <Box className="w-4 h-4 text-muted-foreground mr-1" />
              <span className="text-sm font-medium text-muted-foreground">
                Has 3D Model
              </span>
            </div>
          </label>
          <p className="mt-1 text-xs text-muted-foreground/70 ml-7">
            Show only artifacts with 3D viewing capability
          </p>
        </div>
      </div>

      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Active filters:</p>
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Category: {filters.category}
                <button
                  onClick={() => handleFilterChange('category', '')}
                  className="ml-1 text-amber-600 hover:text-amber-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.period && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Period: {filters.period}
                <button
                  onClick={() => handleFilterChange('period', '')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.origin && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Origin: {filters.origin}
                <button
                  onClick={() => handleFilterChange('origin', '')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.museum && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Museum: {filters.museum.length > 20 ? filters.museum.substring(0, 20) + '...' : filters.museum}
                <button
                  onClick={() => handleFilterChange('museum', '')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.has3D && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                3D Models Only
                <button
                  onClick={() => handleFilterChange('has3D', false)}
                  className="ml-1 text-red-600 hover:text-red-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
