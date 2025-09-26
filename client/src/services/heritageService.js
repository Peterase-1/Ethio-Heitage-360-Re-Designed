import api from '../utils/api.js';

class HeritageService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 10 * 60 * 1000; // 10 minutes for cultural data
  }

  /**
   * Get Ethiopian heritage sites
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Heritage sites
   */
  async getHeritageSites(filters = {}) {
    const cacheKey = `heritage_sites_${JSON.stringify(filters)}`;

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const response = await api.request('/heritage/sites', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      let sites = response.sites || response.data || response;

      // Apply filters
      if (filters.type) {
        sites = sites.filter(site => site.type === filters.type);
      }
      if (filters.region) {
        sites = sites.filter(site => site.region === filters.region);
      }
      if (filters.unesco) {
        sites = sites.filter(site => site.isUnescoSite === filters.unesco);
      }

      // Cache result
      this.cache.set(cacheKey, {
        data: sites,
        timestamp: Date.now()
      });

      return sites;
    } catch (error) {
      // Return mock data for Ethiopian heritage sites
      const mockSites = [
        {
          id: 1,
          name: 'Rock-Hewn Churches of Lalibela',
          type: 'Religious',
          region: 'Amhara',
          isUnescoSite: true,
          description: 'Eleven medieval monolithic cave churches carved from volcanic rock',
          period: '12th-13th Century',
          significance: 'New Jerusalem of Ethiopia',
          coordinates: { lat: 12.0309, lng: 39.0406 },
          image: 'https://picsum.photos/400/300?random=101'
        },
        {
          id: 2,
          name: 'Simien Mountains National Park',
          type: 'Natural',
          region: 'Amhara',
          isUnescoSite: true,
          description: 'Spectacular landscapes with rare wildlife including Gelada baboons',
          period: 'Geological formation',
          significance: 'Biodiversity hotspot and endemic species sanctuary',
          coordinates: { lat: 13.1833, lng: 38.0167 },
          image: 'https://picsum.photos/400/300?random=102'
        },
        {
          id: 3,
          name: 'Aksum Archaeological Site',
          type: 'Archaeological',
          region: 'Tigray',
          isUnescoSite: true,
          description: 'Ancient capital of the Kingdom of Aksum with towering obelisks',
          period: '1st-8th Century AD',
          significance: 'Center of ancient Ethiopian civilization',
          coordinates: { lat: 14.1319, lng: 38.7166 },
          image: 'https://picsum.photos/400/300?random=103'
        },
        {
          id: 4,
          name: 'Harar Jugol',
          type: 'Cultural',
          region: 'Harari',
          isUnescoSite: true,
          description: 'Fortified historic town, fourth holiest city of Islam',
          period: '10th Century onwards',
          significance: 'Cultural crossroads of Africa and Arabia',
          coordinates: { lat: 9.3147, lng: 42.1184 },
          image: 'https://picsum.photos/400/300?random=104'
        }
      ];

      return mockSites;
    }
  }

  /**
   * Get heritage site by ID
   * @param {string|number} id - Site ID
   * @returns {Promise<Object>} Heritage site details
   */
  async getHeritageSiteById(id) {
    try {
      const response = await api.request(`/heritage/sites/${id}`);
      return response.site || response.data || response;
    } catch (error) {
      console.error('Get heritage site error:', error);
      throw error;
    }
  }

  /**
   * Get Ethiopian cultural traditions
   * @returns {Promise<Array>} Cultural traditions
   */
  async getCulturalTraditions() {
    const cacheKey = 'cultural_traditions';

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const response = await api.request('/heritage/traditions');
      const traditions = response.traditions || response.data || response;

      this.cache.set(cacheKey, {
        data: traditions,
        timestamp: Date.now()
      });

      return traditions;
    } catch (error) {
      // Return mock cultural traditions data
      const mockTraditions = [
        {
          id: 1,
          name: 'Coffee Ceremony',
          category: 'Social Ritual',
          description: 'Sacred ritual of preparing and serving coffee, central to Ethiopian hospitality',
          origin: 'Kaffa Region',
          significance: 'Symbol of friendship, respect, and blessing',
          steps: ['Washing green coffee beans', 'Roasting over fire', 'Grinding by hand', 'Brewing three rounds'],
          image: 'https://picsum.photos/400/300?random=201'
        },
        {
          id: 2,
          name: 'Timkat Festival',
          category: 'Religious Celebration',
          description: 'Ethiopian Orthodox celebration of Epiphany with colorful processions',
          origin: 'Ethiopian Orthodox Church',
          significance: 'Commemoration of Christ\'s baptism in the Jordan River',
          date: 'January 19 (Gregorian calendar)',
          image: 'https://picsum.photos/400/300?random=202'
        },
        {
          id: 3,
          name: 'Ge\'ez Script',
          category: 'Written Heritage',
          description: 'Ancient Semitic script still used in Ethiopian Orthodox liturgy',
          origin: 'Kingdom of Aksum',
          significance: 'One of Africa\'s ancient writing systems',
          characteristics: 'Alphasyllabic script with 276 characters',
          image: 'https://picsum.photos/400/300?random=203'
        }
      ];

      return mockTraditions;
    }
  }

  /**
   * Get Ethiopian historical periods
   * @returns {Promise<Array>} Historical periods
   */
  async getHistoricalPeriods() {
    const cacheKey = 'historical_periods';

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const response = await api.request('/heritage/periods');
      const periods = response.periods || response.data || response;

      this.cache.set(cacheKey, {
        data: periods,
        timestamp: Date.now()
      });

      return periods;
    } catch (error) {
      // Return mock historical periods
      const mockPeriods = [
        {
          id: 1,
          name: 'Kingdom of Aksum',
          period: '100-940 AD',
          description: 'Ancient trading empire and major naval and trading power',
          achievements: ['Coinage system', 'Monumental obelisks', 'International trade'],
          significance: 'One of the four great powers of its time'
        },
        {
          id: 2,
          name: 'Zagwe Dynasty',
          period: '900-1270 AD',
          description: 'Medieval dynasty known for church construction',
          achievements: ['Rock-hewn churches of Lalibela', 'Religious architecture'],
          significance: 'Continuation of Christian tradition'
        },
        {
          id: 3,
          name: 'Ethiopian Empire',
          period: '1270-1974 AD',
          description: 'Long-lasting empire under various dynasties',
          achievements: ['Expansion of territory', 'Resistance to colonialism', 'Cultural development'],
          significance: 'Maintained independence except brief Italian occupation'
        }
      ];

      return mockPeriods;
    }
  }

  /**
   * Get Ethiopian languages information
   * @returns {Promise<Array>} Language information
   */
  async getLanguageHeritage() {
    const cacheKey = 'language_heritage';

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const response = await api.request('/heritage/languages');
      const languages = response.languages || response.data || response;

      this.cache.set(cacheKey, {
        data: languages,
        timestamp: Date.now()
      });

      return languages;
    } catch (error) {
      // Return mock language data
      const mockLanguages = [
        {
          id: 1,
          name: 'Amharic',
          family: 'Semitic',
          speakers: '32 million',
          status: 'Federal working language',
          script: 'Ge\'ez (Fidel)',
          description: 'Official language of Ethiopia'
        },
        {
          id: 2,
          name: 'Oromo',
          family: 'Cushitic',
          speakers: '37 million',
          status: 'Regional language',
          script: 'Latin alphabet',
          description: 'Most widely spoken language in Ethiopia'
        },
        {
          id: 3,
          name: 'Tigrinya',
          family: 'Semitic',
          speakers: '7 million',
          status: 'Regional language',
          script: 'Ge\'ez (Fidel)',
          description: 'Spoken in Tigray region'
        }
      ];

      return mockLanguages;
    }
  }

  /**
   * Get Ethiopian art forms
   * @returns {Promise<Array>} Traditional art forms
   */
  async getTraditionalArts() {
    const cacheKey = 'traditional_arts';

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const response = await api.request('/heritage/arts');
      const arts = response.arts || response.data || response;

      this.cache.set(cacheKey, {
        data: arts,
        timestamp: Date.now()
      });

      return arts;
    } catch (error) {
      // Return mock arts data
      const mockArts = [
        {
          id: 1,
          name: 'Ethiopian Orthodox Icon Painting',
          category: 'Visual Art',
          description: 'Religious paintings with distinctive Ethiopian characteristics',
          materials: 'Natural pigments on cloth or wood',
          significance: 'Spiritual and cultural expression'
        },
        {
          id: 2,
          name: 'Traditional Weaving',
          category: 'Textile Art',
          description: 'Hand-woven cotton textiles including shamma and netela',
          materials: 'Cotton, natural dyes',
          significance: 'Daily wear and ceremonial clothing'
        },
        {
          id: 3,
          name: 'Ethiopian Music',
          category: 'Performing Art',
          description: 'Unique pentatonic scales and traditional instruments',
          instruments: 'Krar, masenqo, washint, kebero',
          significance: 'Cultural identity and storytelling'
        }
      ];

      return mockArts;
    }
  }

  /**
   * Get UNESCO World Heritage Sites in Ethiopia
   * @returns {Promise<Array>} UNESCO sites
   */
  async getUNESCOSites() {
    const sites = await this.getHeritageSites({ unesco: true });
    return sites;
  }

  /**
   * Get heritage learning resources
   * @param {string} topic - Topic to get resources for
   * @returns {Promise<Array>} Learning resources
   */
  async getLearningResources(topic) {
    try {
      const response = await api.request(`/heritage/resources?topic=${topic}`);
      return response.resources || response.data || response;
    } catch (error) {
      // Return mock learning resources
      const mockResources = [
        {
          id: 1,
          title: 'Introduction to Ethiopian History',
          type: 'Article',
          duration: '15 min read',
          difficulty: 'Beginner',
          topics: ['Ancient Ethiopia', 'Kingdom of Aksum', 'Modern Ethiopia']
        },
        {
          id: 2,
          title: 'Virtual Tour: Lalibela Churches',
          type: 'Interactive Tour',
          duration: '30 min',
          difficulty: 'Intermediate',
          topics: ['Medieval architecture', 'Religious heritage', 'Stone carving']
        },
        {
          id: 3,
          title: 'Ethiopian Cultural Practices',
          type: 'Video',
          duration: '20 min watch',
          difficulty: 'Beginner',
          topics: ['Coffee ceremony', 'Traditional festivals', 'Social customs']
        }
      ];

      return mockResources;
    }
  }

  /**
   * Search heritage content
   * @param {string} query - Search query
   * @param {string} category - Content category
   * @returns {Promise<Array>} Search results
   */
  async searchHeritage(query, category = 'all') {
    try {
      const response = await api.request(`/heritage/search?q=${encodeURIComponent(query)}&category=${category}`);
      return response.results || response.data || response;
    } catch (error) {
      console.error('Search heritage error:', error);
      throw error;
    }
  }

  /**
   * Get heritage timeline events
   * @returns {Promise<Array>} Timeline events
   */
  async getHeritageTimeline() {
    const cacheKey = 'heritage_timeline';

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const response = await api.request('/heritage/timeline');
      const timeline = response.timeline || response.data || response;

      this.cache.set(cacheKey, {
        data: timeline,
        timestamp: Date.now()
      });

      return timeline;
    } catch (error) {
      // Return mock timeline data
      const mockTimeline = [
        {
          year: '3.2 million BCE',
          event: 'Lucy (Australopithecus afarensis) lived in Afar region',
          category: 'Prehistoric',
          significance: 'Early human ancestor discovery'
        },
        {
          year: '1000 BCE',
          event: 'Kingdom of D\'mt established',
          category: 'Ancient',
          significance: 'First known Ethiopian kingdom'
        },
        {
          year: '100 CE',
          event: 'Kingdom of Aksum rises to power',
          category: 'Ancient',
          significance: 'Major trading empire'
        },
        {
          year: '330 CE',
          event: 'Christianity introduced to Ethiopia',
          category: 'Religious',
          significance: 'Beginning of Ethiopian Orthodox Christianity'
        }
      ];

      return mockTimeline;
    }
  }

  /**
   * Clear service cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache info
   * @returns {Object} Cache information
   */
  getCacheInfo() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      expiry: this.cacheExpiry
    };
  }
}

export default new HeritageService();
