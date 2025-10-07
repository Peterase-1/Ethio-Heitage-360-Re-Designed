import React, { useState, useEffect } from 'react';
import { MapPin, Filter, Info, Globe, AlertCircle } from 'lucide-react';
import LeafletMap from '../components/map/LeafletMap';
import SiteSelector from '../components/map/SiteSelector';

const MapPage = () => {
  const [selectedSite, setSelectedSite] = useState(null);
  const [sites, setSites] = useState([]);
  const [filteredSites, setFilteredSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch heritage sites from API
  useEffect(() => {
    const fetchSites = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch from API, fallback to mock data
        let sitesData;
        try {
          const response = await fetch('http://localhost:5000/api/map/heritage-sites');
          if (response.ok) {
            const result = await response.json();
            sitesData = result.data;
          } else {
            throw new Error('API not available');
          }
        } catch (apiError) {
          console.error('API Error:', apiError);
          throw new Error('Failed to fetch heritage sites from API');
        }

        setSites(sitesData);
        setFilteredSites(sitesData);
      } catch (err) {
        setError('Failed to load heritage sites');
        console.error('Error fetching sites:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  const handleSiteSelect = (site) => {
    setSelectedSite(site);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary text-xl">Loading heritage sites...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center mb-4">
            <Globe className="w-8 h-8 mr-3" />
            <h1 className="text-3xl font-bold">Ethiopian Heritage Map</h1>
          </div>
          <p className="text-primary-foreground/80 text-lg">
            Explore Ethiopia's rich cultural and natural heritage sites across the country
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-200px)]">
        {/* Left Sidebar - Site Selector */}
        <div className="w-1/3 bg-card border-r border-border overflow-y-auto">
          <SiteSelector
            sites={sites}
            onSiteSelect={handleSiteSelect}
            selectedSite={selectedSite}
          />
        </div>

        {/* Right Side - Interactive Map */}
        <div className="flex-1">
          <LeafletMap
            sites={filteredSites}
            selectedSite={selectedSite}
            onSiteSelect={handleSiteSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default MapPage;
