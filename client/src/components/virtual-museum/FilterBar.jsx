import { useState } from "react";
import { Filter, X, Search, Grid, List, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { cultures, periods, regions, categories } from "../data/artifactData";

export function FilterBar({ filters, onFiltersChange, totalResults, onClearFilters }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const updateFilter = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.culture && filters.culture !== 'all') count++;
    if (filters.period && filters.period !== 'all') count++;
    if (filters.region && filters.region !== 'all') count++;
    if (filters.category && filters.category !== 'all') count++;
    if (filters.condition && filters.condition !== 'all') count++;
    if (filters.featured !== null) count++;
    if (filters.materials.length > 0) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  const sortOptions = [
    { value: 'title', label: 'Title A-Z' },
    { value: 'title-desc', label: 'Title Z-A' },
    { value: 'period', label: 'Period (Oldest First)' },
    { value: 'period-desc', label: 'Period (Newest First)' },
    { value: 'culture', label: 'Culture' },
    { value: 'region', label: 'Region' },
    { value: 'featured', label: 'Featured First' },
  ];

  const conditionOptions = [
    { value: 'all', label: 'All Conditions' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'weathered', label: 'Weathered' },
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-white border-stone-200 shadow-sm">
        <CardContent className="p-6">
          {/* Top Row */}
          <div className="flex items-center gap-4 mb-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
              <Input
                placeholder="Search artifacts..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10 bg-stone-50 border-stone-200 focus:border-emerald-400 focus:ring-emerald-300"
              />
            </div>

            {/* View Toggle */}
            <div className="flex rounded-lg overflow-hidden border border-stone-200 bg-stone-50">
              <Button
                variant={filters.viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => updateFilter('viewMode', 'grid')}
                className={`rounded-none ${filters.viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'text-stone-600'}`}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={filters.viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => updateFilter('viewMode', 'list')}
                className={`rounded-none ${filters.viewMode === 'list' ? 'bg-emerald-600 text-white' : 'text-stone-600'}`}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Advanced Filters */}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="border-stone-200 text-stone-700 hover:bg-stone-50">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Advanced Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2 bg-emerald-600 text-white text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {/* Culture */}
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-2 block">Culture</label>
                    <Select
                      value={filters.culture}
                      onValueChange={(value) => updateFilter('culture', value)}
                    >
                      <SelectTrigger className="bg-white border-stone-200">
                        <SelectValue placeholder="All Cultures" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cultures</SelectItem>
                        {cultures.map((culture) => (
                          <SelectItem key={culture} value={culture}>
                            {culture}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Period */}
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-2 block">Period</label>
                    <Select
                      value={filters.period}
                      onValueChange={(value) => updateFilter('period', value)}
                    >
                      <SelectTrigger className="bg-white border-stone-200">
                        <SelectValue placeholder="All Periods" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Periods</SelectItem>
                        {periods.map((period) => (
                          <SelectItem key={period} value={period}>
                            {period}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Region */}
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-2 block">Region</label>
                    <Select
                      value={filters.region}
                      onValueChange={(value) => updateFilter('region', value)}
                    >
                      <SelectTrigger className="bg-white border-stone-200">
                        <SelectValue placeholder="All Regions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-2 block">Category</label>
                    <Select
                      value={filters.category}
                      onValueChange={(value) => updateFilter('category', value)}
                    >
                      <SelectTrigger className="bg-white border-stone-200">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-2 block">Condition</label>
                    <Select
                      value={filters.condition}
                      onValueChange={(value) => updateFilter('condition', value)}
                    >
                      <SelectTrigger className="bg-white border-stone-200">
                        <SelectValue placeholder="All Conditions" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-2 block">Sort By</label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) => updateFilter('sortBy', value)}
                    >
                      <SelectTrigger className="bg-white border-stone-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                  <div className="flex gap-4">
                    <Button
                      variant={filters.featured === true ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        updateFilter('featured', filters.featured === true ? null : true)
                      }
                      className={filters.featured === true ? 'bg-emerald-600 text-white' : ''}
                    >
                      Featured Only
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="text-stone-600 border-stone-200 hover:bg-stone-50"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 pt-4 border-t border-stone-100">
              <span className="text-sm font-medium text-stone-700">Active Filters:</span>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    Search: {filters.search}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-2 text-emerald-600 hover:text-emerald-800"
                      onClick={() => updateFilter('search', '')}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                )}
                {filters.culture && filters.culture !== 'all' && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    Culture: {filters.culture}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-2 text-emerald-600 hover:text-emerald-800"
                      onClick={() => updateFilter('culture', 'all')}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                )}
                {filters.period && filters.period !== 'all' && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    Period: {filters.period}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-2 text-emerald-600 hover:text-emerald-800"
                      onClick={() => updateFilter('period', 'all')}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="flex justify-between items-center pt-4 border-t border-stone-100">
            <p className="text-sm text-stone-600">
              Showing <span className="font-medium text-stone-800">{totalResults}</span> artifacts
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}