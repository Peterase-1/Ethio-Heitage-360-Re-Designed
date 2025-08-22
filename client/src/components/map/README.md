# Map Components

This directory contains all map-related components for the Ethiopian Heritage Platform.

## Components Overview

### MapContainer.jsx (Main Component)
**Primary unified map component** that combines all map functionality:
- **Features**: Search, filtering, sidebar, site selection
- **Map Support**: Auto-detects between Leaflet and InteractiveMap
- **Usage**: Use this for all map implementations
- **Props**: `sites`, `selectedSite`, `onSiteSelect`, `showSidebar`, `showFilters`, `showSearch`, `mapType`

### InteractiveMap.jsx 
**CSS-based fallback map** for when external map libraries aren't available:
- **Features**: Simple pin positioning, site selection, zoom controls
- **Usage**: Automatic fallback or explicitly use for simple maps
- **Dependencies**: None (pure CSS/React)

### LeafletMap.jsx
**Leaflet-powered interactive map** with full mapping capabilities:
- **Features**: Real map tiles, advanced controls, popups
- **Usage**: Automatically used when Leaflet is available
- **Dependencies**: Leaflet library (window.L)

### SiteSelector.jsx
**Site filtering and selection component**:
- **Features**: Category/region filters, search, site list
- **Usage**: Can be used standalone or integrated into MapContainer
- **Props**: `sites`, `onSiteSelect`, `selectedSite`

### MapPin.jsx
**Individual map pin component**:
- **Features**: Simple pin display with tooltip
- **Usage**: Individual pin representation
- **Props**: `location`, `onClick`

## Services & Hooks

### mapService.js
**Comprehensive map service** for API interactions:
- Heritage sites CRUD operations
- Geocoding (Mapbox integration)
- Distance calculations
- Map utilities

### useMap.js
**Enhanced map hook** supporting multiple providers:
- **Providers**: Auto-detection, Leaflet, Mapbox, fallback
- **Features**: Marker management, bounds fitting, provider abstraction
- **Usage**: Advanced map interactions

## Usage Examples

### Basic Map Implementation
```jsx
import { MapContainer } from '../components/map';

<MapContainer 
  sites={heritageSites}
  selectedSite={selectedSite}
  onSiteSelect={setSelectedSite}
  showSidebar={true}
  showFilters={true}
  mapType="auto"
/>
```

### Custom Map with Specific Provider
```jsx
import { useMap } from '../hooks/useMap';

const { mapContainer, addMarker, flyTo } = useMap({
  provider: 'leaflet',
  initialCenter: { lat: 9.0292, lng: 38.7578 }
});
```

### Service Usage
```jsx
import { mapService } from '../services/mapService';

// Load heritage sites
const sites = await mapService.getHeritageSites();

// Search with filters
const filtered = await mapService.searchHeritageSites('Lalibela', {
  category: 'UNESCO World Heritage'
});
```

## Map Provider Detection

The system automatically detects available map providers:

1. **Leaflet** - Preferred when available (window.L)
2. **Mapbox** - Secondary option (requires token)
3. **InteractiveMap** - CSS fallback (always available)

## File Structure

```
/components/map/
├── MapContainer.jsx      # Main unified component
├── InteractiveMap.jsx    # CSS-based fallback map
├── LeafletMap.jsx        # Leaflet-powered map
├── SiteSelector.jsx      # Site filtering sidebar
├── MapPin.jsx            # Individual pin component
├── index.js              # Export index
└── README.md             # This file

/services/
└── mapService.js         # Map API service

/hooks/
└── useMap.js             # Enhanced map hook
```

## Best Practices

1. **Use MapContainer** for most implementations - it handles complexity
2. **Let auto-detection work** - don't force specific providers unless needed  
3. **Handle loading states** - maps may take time to initialize
4. **Provide fallbacks** - not all environments have map libraries
5. **Use the service layer** - don't make direct API calls from components

## Dependencies

- **Required**: React, lucide-react (icons)
- **Optional**: Leaflet (for LeafletMap), Mapbox GL JS (for enhanced features)
- **Fallback**: Pure CSS/React implementation

## Configuration

Environment variables for enhanced features:
- `REACT_APP_MAPBOX_TOKEN` - Mapbox access token
- `VITE_MAPBOX_ACCESS_TOKEN` - Vite alternative

The system works without these but provides enhanced functionality when available.
