// Ethiopian Heritage Image Service
// Comprehensive service for managing Ethiopian cultural and heritage photos

import { EthiopianImageUrls, EthiopianColors } from '../assets/EthiopianAssets.js';

class EthiopianImageService {
  constructor() {
    this.imageCache = new Map();
    this.metadataCache = new Map();
    this.categories = this.initializeCategories();
    this.regions = this.initializeRegions();
    this.periods = this.initializePeriods();
  }

  // Initialize image categories
  initializeCategories() {
    return [
      { id: 'religious', name: 'Religious Sites', icon: '⛪', color: EthiopianColors.blue },
      { id: 'archaeological', name: 'Archaeological Sites', icon: '🏛️', color: EthiopianColors.earth },
      { id: 'cultural', name: 'Cultural Heritage', icon: '🎭', color: EthiopianColors.yellow },
      { id: 'traditional', name: 'Traditional Clothing', icon: '👘', color: EthiopianColors.red },
      { id: 'cuisine', name: 'Ethiopian Cuisine', icon: '🍽️', color: EthiopianColors.green },
      { id: 'festivals', name: 'Festivals & Celebrations', icon: '🎉', color: EthiopianColors.yellow },
      { id: 'crafts', name: 'Arts & Crafts', icon: '🎨', color: EthiopianColors.gold },
      { id: 'nature', name: 'Natural Heritage', icon: '🏔️', color: EthiopianColors.green },
      { id: 'architecture', name: 'Architecture', icon: '🏛️', color: EthiopianColors.earth },
      { id: 'music', name: 'Music & Dance', icon: '🎵', color: EthiopianColors.red },
      { id: 'tribal', name: 'Tribal Cultures', icon: '👥', color: EthiopianColors.earth },
      { id: 'literature', name: 'Literature & Manuscripts', icon: '📜', color: EthiopianColors.blue }
    ];
  }

  // Initialize Ethiopian regions
  initializeRegions() {
    return [
      { id: 'tigray', name: 'Tigray', capital: 'Mekelle' },
      { id: 'amhara', name: 'Amhara', capital: 'Bahir Dar' },
      { id: 'oromia', name: 'Oromia', capital: 'Addis Ababa' },
      { id: 'somali', name: 'Somali', capital: 'Jijiga' },
      { id: 'afar', name: 'Afar', capital: 'Semera' },
      { id: 'southern', name: 'Southern Nations', capital: 'Hawassa' },
      { id: 'benishangul', name: 'Benishangul-Gumuz', capital: 'Assosa' },
      { id: 'gambela', name: 'Gambela', capital: 'Gambela' },
      { id: 'harari', name: 'Harari', capital: 'Harar' },
      { id: 'addis', name: 'Addis Ababa', capital: 'Addis Ababa' },
      { id: 'dire', name: 'Dire Dawa', capital: 'Dire Dawa' }
    ];
  }

  // Initialize historical periods
  initializePeriods() {
    return [
      { id: 'ancient', name: 'Ancient Period', range: 'Before 100 AD', description: 'Pre-Aksumite civilizations' },
      { id: 'aksumite', name: 'Aksumite Kingdom', range: '100-960 AD', description: 'Great trading empire' },
      { id: 'zagwe', name: 'Zagwe Dynasty', range: '1137-1270', description: 'Rock-hewn churches era' },
      { id: 'solomonic', name: 'Solomonic Dynasty', range: '1270-1974', description: 'Medieval to modern Ethiopia' },
      { id: 'modern', name: 'Modern Ethiopia', range: '1974-Present', description: 'Contemporary period' },
      { id: 'traditional', name: 'Traditional/Timeless', range: 'Ongoing', description: 'Continuing cultural practices' }
    ];
  }

  // Comprehensive Ethiopian Heritage Image Collection
  getHeritageImages() {
    return [
      {
        id: 'lalibela_1',
        title: 'Church of St. George, Lalibela',
        description: 'The most famous of the rock-hewn churches of Lalibela, carved directly into volcanic rock in the 12th century. A UNESCO World Heritage site representing the New Jerusalem.',
        category: 'religious',
        region: 'amhara',
        period: 'zagwe',
        location: 'Lalibela, Amhara Region',
        photographer: 'Ethiopian Heritage Foundation',
        year: '2023',
        tags: ['church', 'rock-hewn', 'unesco', 'pilgrimage', 'medieval'],
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
        dimensions: { width: 800, height: 600 },
        fileSize: '245KB',
        significance: 'One of the most important Christian pilgrimage sites in Africa'
      },
      {
        id: 'aksum_obelisk',
        title: 'Aksum Obelisks (Stelae)',
        description: 'Ancient granite obelisks dating from the 3rd-4th centuries AD, marking royal tombs of the Kingdom of Aksum. These are among the tallest single pieces of stone ever quarried.',
        category: 'archaeological',
        region: 'tigray',
        period: 'aksumite',
        location: 'Aksum, Tigray Region',
        photographer: 'Archaeological Survey Team',
        year: '2023',
        tags: ['obelisk', 'aksum', 'ancient', 'royal', 'unesco'],
        url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&h=600&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=300&h=200&fit=crop',
        dimensions: { width: 800, height: 600 },
        fileSize: '320KB',
        significance: 'Symbols of the ancient Kingdom of Aksum, major trading empire'
      },
      {
        id: 'coffee_ceremony',
        title: 'Traditional Ethiopian Coffee Ceremony',
        description: 'The traditional Ethiopian coffee ceremony, a social and cultural ritual central to Ethiopian hospitality. Ethiopia is the birthplace of coffee, and this ceremony represents community bonding.',
        category: 'cultural',
        region: 'oromia',
        period: 'traditional',
        location: 'Kaffa Region, Oromia',
        photographer: 'Cultural Heritage Project',
        year: '2023',
        tags: ['coffee', 'ceremony', 'tradition', 'hospitality', 'culture'],
        url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=600&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=200&fit=crop',
        dimensions: { width: 800, height: 600 },
        fileSize: '280KB',
        significance: 'Birthplace of coffee, central to Ethiopian social culture'
      },
      {
        id: 'habesha_dress',
        title: 'Traditional Habesha Dress',
        description: 'Beautiful traditional Ethiopian dress (Habesha kemis) worn during special occasions and festivals. Features intricate hand-woven patterns and traditional Ethiopian colors.',
        category: 'traditional',
        region: 'amhara',
        period: 'traditional',
        location: 'Gondar, Amhara Region',
        photographer: 'Fashion Heritage Documentation',
        year: '2023',
        tags: ['clothing', 'habesha', 'traditional', 'festival', 'weaving'],
        url: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop',
        dimensions: { width: 800, height: 600 },
        fileSize: '195KB',
        significance: 'Represents traditional Ethiopian textile craftsmanship'
      },
      {
        id: 'injera_preparation',
        title: 'Traditional Injera Preparation',
        description: 'The preparation of injera, Ethiopia\'s staple food made from teff grain. This ancient grain is unique to Ethiopia and forms the basis of Ethiopian cuisine and culture.',
        category: 'cuisine',
        region: 'oromia',
        period: 'traditional',
        location: 'Rural Oromia',
        photographer: 'Culinary Heritage Project',
        year: '2023',
        tags: ['injera', 'teff', 'food', 'traditional', 'staple'],
        url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
        dimensions: { width: 800, height: 600 },
        fileSize: '215KB',
        significance: 'Teff is indigenous to Ethiopia, basis of traditional cuisine'
      },
      {
        id: 'timkat_festival',
        title: 'Timkat Festival Celebration',
        description: 'Timkat (Ethiopian Orthodox Epiphany) celebration with colorful processions and traditional ceremonies. One of the most important religious festivals in Ethiopian Orthodox Christianity.',
        category: 'festivals',
        region: 'amhara',
        period: 'traditional',
        location: 'Gondar, Amhara Region',
        photographer: 'Festival Documentation Team',
        year: '2024',
        tags: ['timkat', 'festival', 'orthodox', 'celebration', 'religious'],
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
        dimensions: { width: 800, height: 600 },
        fileSize: '340KB',
        significance: 'Major religious festival celebrating Ethiopian Orthodox Christianity'
      },
      {
        id: 'basket_weaving',
        title: 'Traditional Basket Weaving',
        description: 'Skilled artisan creating traditional Ethiopian baskets using ancient weaving techniques. These colorful baskets serve both functional and decorative purposes in Ethiopian households.',
        category: 'crafts',
        region: 'southern',
        period: 'traditional',
        location: 'Southern Nations Region',
        photographer: 'Artisan Heritage Project',
        year: '2023',
        tags: ['crafts', 'weaving', 'baskets', 'artisan', 'traditional'],
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
        dimensions: { width: 800, height: 600 },
        fileSize: '260KB',
        significance: 'Traditional craft skills passed down through generations'
      },
      {
        id: 'simien_mountains',
        title: 'Simien Mountains National Park',
        description: 'The dramatic landscape of the Simien Mountains, home to rare wildlife including the Gelada baboon and Ethiopian wolf. A UNESCO World Heritage natural site.',
        category: 'nature',
        region: 'amhara',
        period: 'ancient',
        location: 'Simien Mountains, Amhara Region',
        photographer: 'Natural Heritage Survey',
        year: '2023',
        tags: ['mountains', 'wildlife', 'unesco', 'landscape', 'nature'],
        url: 'https://images.unsplash.com/photo-1573160103600-7c2a3c6cd5e0?w=800&h=600&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1573160103600-7c2a3c6cd5e0?w=300&h=200&fit=crop',
        dimensions: { width: 800, height: 600 },
        fileSize: '385KB',
        significance: 'Unique Ethiopian highland ecosystem and endemic species'
      },
      {
        id: 'fasil_castle',
        title: 'Fasil Ghebbi (Gondar Castle)',
        description: 'The royal compound of Emperor Fasilides in Gondar, built in 17th century. This fortress-city represents a unique blend of Portuguese, Moorish, and local architectural styles.',
        category: 'architecture',
        region: 'amhara',
        period: 'solomonic',
        location: 'Gondar, Amhara Region',
        photographer: 'Architectural Heritage Survey',
        year: '2023',
        tags: ['castle', 'gondar', 'royal', 'architecture', 'unesco'],
        url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
        dimensions: { width: 800, height: 600 },
        fileSize: '295KB',
        significance: 'Unique architectural heritage of Gondarian period'
      },
      {
        id: 'eskista_dance',
        title: 'Traditional Eskista Dance',
        description: 'Performer demonstrating the traditional Ethiopian shoulder dance (Eskista), characterized by intricate shoulder movements and cultural storytelling through dance.',
        category: 'music',
        region: 'amhara',
        period: 'traditional',
        location: 'Addis Ababa Cultural Center',
        photographer: 'Dance Heritage Documentation',
        year: '2023',
        tags: ['dance', 'eskista', 'traditional', 'performance', 'culture'],
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
        dimensions: { width: 800, height: 600 },
        fileSize: '225KB',
        significance: 'Traditional dance form expressing Ethiopian cultural identity'
      },
      {
        id: 'omo_valley_tribe',
        title: 'Omo Valley Tribal Culture',
        description: 'Portrait from the Omo Valley showcasing the diverse tribal cultures of southern Ethiopia. The region is home to over 20 different ethnic groups with unique traditions.',
        category: 'tribal',
        region: 'southern',
        period: 'traditional',
        location: 'Omo Valley, Southern Region',
        photographer: 'Anthropological Research Team',
        year: '2023',
        tags: ['tribal', 'omo valley', 'culture', 'diversity', 'traditional'],
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
        dimensions: { width: 800, height: 600 },
        fileSize: '310KB',
        significance: 'Represents Ethiopia\'s incredible ethnic and cultural diversity'
      },
      {
        id: 'geez_manuscript',
        title: 'Ancient Ge\'ez Manuscript',
        description: 'Illuminated manuscript written in ancient Ge\'ez script, containing religious texts and biblical commentaries. Represents Ethiopia\'s ancient literary and religious traditions.',
        category: 'literature',
        region: 'tigray',
        period: 'zagwe',
        location: 'Monastery Library, Tigray',
        photographer: 'Manuscript Preservation Project',
        year: '2023',
        tags: ['manuscript', 'geez', 'ancient', 'religious', 'literature'],
        url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop',
        dimensions: { width: 800, height: 600 },
        fileSize: '180KB',
        significance: 'Ancient Ethiopian script and religious literary tradition'
      }
    ];
  }

  // Get images by category
  getImagesByCategory(categoryId) {
    const images = this.getHeritageImages();
    return images.filter(image => image.category === categoryId);
  }

  // Get images by region
  getImagesByRegion(regionId) {
    const images = this.getHeritageImages();
    return images.filter(image => image.region === regionId);
  }

  // Get images by period
  getImagesByPeriod(periodId) {
    const images = this.getHeritageImages();
    return images.filter(image => image.period === periodId);
  }

  // Search images
  searchImages(query, filters = {}) {
    const images = this.getHeritageImages();
    const searchTerm = query.toLowerCase();
    
    return images.filter(image => {
      // Text search
      const matchesSearch = !query || 
        image.title.toLowerCase().includes(searchTerm) ||
        image.description.toLowerCase().includes(searchTerm) ||
        image.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        image.location.toLowerCase().includes(searchTerm);

      // Filter by category
      const matchesCategory = !filters.category || image.category === filters.category;
      
      // Filter by region
      const matchesRegion = !filters.region || image.region === filters.region;
      
      // Filter by period
      const matchesPeriod = !filters.period || image.period === filters.period;
      
      // Filter by tags
      const matchesTags = !filters.tags || filters.tags.every(tag => 
        image.tags.includes(tag)
      );

      return matchesSearch && matchesCategory && matchesRegion && matchesPeriod && matchesTags;
    });
  }

  // Get image metadata
  getImageMetadata(imageId) {
    const images = this.getHeritageImages();
    const image = images.find(img => img.id === imageId);
    
    if (!image) return null;

    const category = this.categories.find(cat => cat.id === image.category);
    const region = this.regions.find(reg => reg.id === image.region);
    const period = this.periods.find(per => per.id === image.period);

    return {
      ...image,
      categoryInfo: category,
      regionInfo: region,
      periodInfo: period
    };
  }

  // Load image with caching
  async loadImage(imageId, size = 'url') {
    const cacheKey = `${imageId}-${size}`;
    
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey);
    }

    const metadata = this.getImageMetadata(imageId);
    if (!metadata) return null;

    try {
      const imageUrl = metadata[size] || metadata.url;
      const img = new Image();
      
      const loadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve(imageUrl);
        img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
      });
      
      img.src = imageUrl;
      const result = await loadPromise;
      
      this.imageCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error loading image:', error);
      return null;
    }
  }

  // Get featured images (curated selection)
  getFeaturedImages() {
    const images = this.getHeritageImages();
    const featuredIds = [
      'lalibela_1',
      'aksum_obelisk', 
      'coffee_ceremony',
      'timkat_festival',
      'simien_mountains',
      'fasil_castle'
    ];
    
    return images.filter(image => featuredIds.includes(image.id));
  }

  // Get random images for exploration
  getRandomImages(count = 6) {
    const images = this.getHeritageImages();
    const shuffled = [...images].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // Get related images
  getRelatedImages(imageId, count = 4) {
    const currentImage = this.getImageMetadata(imageId);
    if (!currentImage) return [];

    const images = this.getHeritageImages();
    const related = images.filter(image => 
      image.id !== imageId && (
        image.category === currentImage.category ||
        image.region === currentImage.region ||
        image.period === currentImage.period ||
        image.tags.some(tag => currentImage.tags.includes(tag))
      )
    );

    // Sort by relevance (more matching criteria = higher score)
    related.sort((a, b) => {
      let scoreA = 0, scoreB = 0;
      
      if (a.category === currentImage.category) scoreA += 3;
      if (a.region === currentImage.region) scoreA += 2;
      if (a.period === currentImage.period) scoreA += 2;
      scoreA += a.tags.filter(tag => currentImage.tags.includes(tag)).length;
      
      if (b.category === currentImage.category) scoreB += 3;
      if (b.region === currentImage.region) scoreB += 2;
      if (b.period === currentImage.period) scoreB += 2;
      scoreB += b.tags.filter(tag => currentImage.tags.includes(tag)).length;
      
      return scoreB - scoreA;
    });

    return related.slice(0, count);
  }

  // Image statistics
  getImageStatistics() {
    const images = this.getHeritageImages();
    const stats = {
      total: images.length,
      byCategory: {},
      byRegion: {},
      byPeriod: {},
      totalSize: 0
    };

    images.forEach(image => {
      // Count by category
      if (!stats.byCategory[image.category]) {
        stats.byCategory[image.category] = 0;
      }
      stats.byCategory[image.category]++;

      // Count by region
      if (!stats.byRegion[image.region]) {
        stats.byRegion[image.region] = 0;
      }
      stats.byRegion[image.region]++;

      // Count by period
      if (!stats.byPeriod[image.period]) {
        stats.byPeriod[image.period] = 0;
      }
      stats.byPeriod[image.period]++;

      // Add to total size (convert KB to bytes for calculation)
      const sizeInBytes = parseInt(image.fileSize.replace('KB', '')) * 1024;
      stats.totalSize += sizeInBytes;
    });

    // Convert total size back to readable format
    stats.totalSizeFormatted = `${Math.round(stats.totalSize / 1024)}KB`;

    return stats;
  }

  // Clear image cache
  clearCache() {
    this.imageCache.clear();
    this.metadataCache.clear();
  }

  // Utility methods
  getCategories() {
    return this.categories;
  }

  getRegions() {
    return this.regions;
  }

  getPeriods() {
    return this.periods;
  }
}

// Export singleton instance
export default new EthiopianImageService();
