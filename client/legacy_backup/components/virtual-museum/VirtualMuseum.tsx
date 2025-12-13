import { useState, useEffect, useMemo } from "react";
import { HeroSection } from "./HeroSection";
import { FilterBar } from "./FilterBar";
import { ArtifactGrid } from "./ArtifactGrid";
import { EmptyState } from "./EmptyState";
import { Footer } from "./Footer";
import { artifacts } from "../data/artifactData";
import { ArtifactDetailsModal } from "./ArtifactDetailsModal";
import { toast } from "sonner";

export function VirtualMuseum() {
  const [filters, setFilters] = useState({
    search: '',
    culture: 'all',
    period: 'all',
    region: 'all',
    category: 'all',
    condition: 'all',
    materials: [],
    featured: null,
    sortBy: 'title',
    viewMode: 'grid',
  });

  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [displayCount, setDisplayCount] = useState(12);
  const [isLoading, setIsLoading] = useState(false);

  // Filter and sort artifacts
  const filteredAndSortedArtifacts = useMemo(() => {
    let filtered = artifacts.filter((artifact) => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          artifact.title.toLowerCase().includes(searchTerm) ||
          artifact.description.toLowerCase().includes(searchTerm) ||
          artifact.culture.toLowerCase().includes(searchTerm) ||
          artifact.region.toLowerCase().includes(searchTerm) ||
          artifact.category.toLowerCase().includes(searchTerm) ||
          artifact.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
          artifact.materials.some(material => material.toLowerCase().includes(searchTerm));
        
        if (!matchesSearch) return false;
      }

      if (filters.culture !== 'all' && artifact.culture !== filters.culture) return false;
      if (filters.period !== 'all' && artifact.period !== filters.period) return false;
      if (filters.region !== 'all' && artifact.region !== filters.region) return false;
      if (filters.category !== 'all' && artifact.category !== filters.category) return false;
      if (filters.condition !== 'all' && artifact.condition.toLowerCase() !== filters.condition) return false;
      if (filters.featured !== null && artifact.featured !== filters.featured) return false;

      return true;
    });

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'period':
          return a.period.localeCompare(b.period);
        case 'period-desc':
          return b.period.localeCompare(a.period);
        case 'culture':
          return a.culture.localeCompare(b.culture);
        case 'region':
          return a.region.localeCompare(b.region);
        case 'featured':
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [filters]);

  const displayedArtifacts = filteredAndSortedArtifacts.slice(0, displayCount);
  const hasMore = displayCount < filteredAndSortedArtifacts.length;

  const handleSearch = (query) => {
    setFilters(prev => ({ ...prev, search: query }));
    setDisplayCount(12);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setDisplayCount(12);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      culture: 'all',
      period: 'all',
      region: 'all',
      category: 'all',
      condition: 'all',
      materials: [],
      featured: null,
      sortBy: 'title',
      viewMode: 'grid',
    });
    setDisplayCount(12);
  };

  const handleViewDetails = (artifact) => {
    setSelectedArtifact(artifact);
  };

  const handleToggleFavorite = (artifactId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(artifactId)) {
        newFavorites.delete(artifactId);
        toast.success("Removed from favorites");
      } else {
        newFavorites.add(artifactId);
        toast.success("Added to favorites");
      }
      return newFavorites;
    });
  };

  const handleShare = (artifact) => {
    if (navigator.share) {
      navigator.share({
        title: artifact.title,
        text: artifact.description,
        url: window.location.href + '?artifact=' + artifact.id,
      }).catch(err => {
        console.log('Error sharing:', err);
        fallbackShare(artifact);
      });
    } else {
      fallbackShare(artifact);
    }
  };

  const fallbackShare = (artifact) => {
    const url = window.location.href + '?artifact=' + artifact.id;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied to clipboard!");
    }).catch(() => {
      toast.error("Unable to copy link");
    });
  };

  const handleLoadMore = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setDisplayCount(prev => prev + 12);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <HeroSection 
        onSearch={handleSearch}
        totalArtifacts={artifacts.length}
      />

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <FilterBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          totalResults={filteredAndSortedArtifacts.length}
          onClearFilters={handleClearFilters}
        />

        {filteredAndSortedArtifacts.length === 0 ? (
          <EmptyState 
            onClearFilters={handleClearFilters}
            hasActiveFilters={filters.search !== '' || filters.culture !== 'all' || filters.period !== 'all'}
          />
        ) : (
          <ArtifactGrid
            artifacts={displayedArtifacts}
            onViewDetails={handleViewDetails}
            onToggleFavorite={handleToggleFavorite}
            onShare={handleShare}
            favorites={favorites}
            viewMode={filters.viewMode}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            isLoading={isLoading}
          />
        )}
      </div>

      <Footer />

      {selectedArtifact && (
        <ArtifactDetailsModal
          artifact={selectedArtifact}
          isOpen={!!selectedArtifact}
          onClose={() => setSelectedArtifact(null)}
          onToggleFavorite={handleToggleFavorite}
          onShare={handleShare}
          isFavorited={favorites.has(selectedArtifact.id)}
        />
      )}
    </div>
  );
}
