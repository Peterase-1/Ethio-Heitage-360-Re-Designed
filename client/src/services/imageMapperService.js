// Ethiopian Heritage Image Mapper Service
// Maps courses, lessons, and content to appropriate local images

class ImageMapperService {
  constructor() {
    this.baseImagePath = '/src/assets/';
    this.imageMapping = this.initializeImageMapping();
    this.categoryImages = this.initializeCategoryImages();
    this.fallbackImages = this.initializeFallbackImages();
  }

  /**
   * Initialize mapping of course/content topics to specific images
   */
  initializeImageMapping() {
    return {
      // History courses
      'ethiopian-history-fundamentals': 'Ethiopian History Fundamentals.jpg',
      'ancient-history': 'Lucy-Bone.jpg',
      'modern-history': 'modern-ethiopia.jpg',
      'kingdoms': 'Archaeological Wonders.jpg',
      
      // Archaeological courses
      'archaeological-wonders': 'Archaeological Wonders.jpg',
      'aksum': 'artifacts.jpg',
      'lalibela': 'Ethiopia.jpg',
      'gondar': 'Gonder.jpg',
      'architecture': 'Ethiopian Architecture Through Ages.jpg',
      
      // Cultural courses
      'cultural-traditions': 'Cultural Traditions of Ethiopia.jpg',
      'festivals': 'Ethiopian Festivals and Celebrations.jpg',
      'timkat': 'timkat-festival.jpg',
      'meskel': 'meskel-festival.jpg',
      'traditions': 'traditional-clothing.jpg',
      
      // Language and scripts
      'languages-scripts': 'Ethiopian Languages and Scripts.jpg',
      'geez': 'geez-script.jpg',
      'manuscripts': 'Ancient Ge\'ez Script and Manuscripts.jpg',
      
      // Religion
      'orthodox-christianity': 'Ethiopian Orthodox Christianity.jpg',
      'orthodox-traditions': 'Ethiopian Orthodox Traditions.jpg',
      'religious-sites': 'orthodox-church.jpg',
      
      // Arts and crafts
      'traditional-arts-crafts': 'Traditional Ethiopian Arts and Crafts.jpg',
      'traditional-crafts': 'Traditional Ethiopian Crafts.jpg',
      'crafts': 'traditional-crafts.jpg',
      'weaving': 'alnejashin.jpg',
      
      // Food and cuisine
      'cuisine-food-culture': 'Ethiopian Cuisine and Food Culture.jpg',
      'cuisine': 'ethiopian-cuisine.jpg',
      'coffee-culture': 'Ethiopian Coffee Culture.jpg',
      'coffee': 'coffee-ceremony.jpg',
      
      // Music and dance
      'music-dance': 'Music and Dance of Ethiopia.jpg',
      'traditional-dance': 'traditional-dance.png',
      'music': 'traditional-instruments.jpg',
      
      // Traditional medicine
      'traditional-medicine': 'Traditional Ethiopian Medicine.jpg',
      'medicine': 'traditional-medicine.jpg',
      
      // Tribal cultures
      'tribal-cultures': 'Ethiopian Tribal Cultures.jpg',
      'tribes': 'tribal-cultures.jpg',
      
      // Nature and geography
      'nature': 'ethiopian-highlands.jpg',
      'highlands': 'ethiopian-highlands.jpg',
      'geography': 'Ethiopia.jpg',
      
      // Markets and commerce
      'markets': 'traditional-market.jpg',
      'commerce': 'traditional-market.jpg',
      
      // Development
      'modern-development': 'Modern Ethiopia & Development.jpg',
      'development': 'modern-ethiopia.jpg'
    };
  }

  /**
   * Initialize category-based image mapping
   */
  initializeCategoryImages() {
    return {
      'History': ['Ethiopian History Fundamentals.jpg', 'Lucy-Bone.jpg', 'modern-ethiopia.jpg', 'Archaeological Wonders.jpg'],
      'Culture': ['Cultural Traditions of Ethiopia.jpg', 'Ethiopian Festivals and Celebrations.jpg', 'traditional-clothing.jpg', 'coffee-ceremony.jpg'],
      'Archaeology': ['Archaeological Wonders.jpg', 'artifacts.jpg', 'Ethiopia.jpg', 'Gonder.jpg'],
      'Language': ['Ethiopian Languages and Scripts.jpg', 'geez-script.jpg', 'Ancient Ge\'ez Script and Manuscripts.jpg'],
      'Religion': ['Ethiopian Orthodox Christianity.jpg', 'orthodox-church.jpg', 'Ethiopian Orthodox Traditions.jpg'],
      'Arts': ['Traditional Ethiopian Arts and Crafts.jpg', 'traditional-crafts.jpg', 'traditional-dance.png', 'traditional-instruments.jpg'],
      'Traditional Knowledge': ['Traditional Ethiopian Medicine.jpg', 'traditional-medicine.jpg'],
      'Nature': ['ethiopian-highlands.jpg', 'Ethiopia.jpg'],
      'Anthropology': ['Ethiopian Tribal Cultures.jpg', 'tribal-cultures.jpg']
    };
  }

  /**
   * Initialize fallback images for when no specific mapping exists
   */
  initializeFallbackImages() {
    return [
      'Ethiopia.jpg',
      'Ethiopian History Fundamentals.jpg',
      'Cultural Traditions of Ethiopia.jpg',
      'Archaeological Wonders.jpg',
      'ethiopian-highlands.jpg'
    ];
  }

  /**
   * Get image for course based on title and category
   * @param {Object} course - Course object
   * @returns {string} Image path
   */
  getCourseImage(course) {
    if (!course) return this.getRandomFallbackImage();

    const title = course.title.toLowerCase();
    const category = course.category || '';

    // Try exact mapping first
    const exactMatch = this.findExactMatch(title);
    if (exactMatch) return this.baseImagePath + exactMatch;

    // Try keyword matching
    const keywordMatch = this.findKeywordMatch(title);
    if (keywordMatch) return this.baseImagePath + keywordMatch;

    // Try category matching
    const categoryMatch = this.findCategoryMatch(category);
    if (categoryMatch) return this.baseImagePath + categoryMatch;

    // Return fallback
    return this.baseImagePath + this.getRandomFallbackImage();
  }

  /**
   * Find exact match in image mapping
   * @param {string} title - Course title
   * @returns {string|null} Image filename
   */
  findExactMatch(title) {
    const normalizedTitle = this.normalizeTitle(title);
    return this.imageMapping[normalizedTitle] || null;
  }

  /**
   * Find match based on keywords in title
   * @param {string} title - Course title
   * @returns {string|null} Image filename
   */
  findKeywordMatch(title) {
    const keywords = title.split(/\s+/);
    
    for (const keyword of keywords) {
      for (const [key, image] of Object.entries(this.imageMapping)) {
        if (key.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(key)) {
          return image;
        }
      }
    }
    
    return null;
  }

  /**
   * Find match based on category
   * @param {string} category - Course category
   * @returns {string|null} Image filename
   */
  findCategoryMatch(category) {
    const categoryImages = this.categoryImages[category];
    if (categoryImages && categoryImages.length > 0) {
      return categoryImages[Math.floor(Math.random() * categoryImages.length)];
    }
    return null;
  }

  /**
   * Normalize title for matching
   * @param {string} title - Original title
   * @returns {string} Normalized title
   */
  normalizeTitle(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/and/g, '') // Remove common words
      .replace(/the/g, '')
      .replace(/of/g, '')
      .replace(/--+/g, '-') // Replace multiple hyphens
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Get random fallback image
   * @returns {string} Image filename
   */
  getRandomFallbackImage() {
    return this.fallbackImages[Math.floor(Math.random() * this.fallbackImages.length)];
  }

  /**
   * Get all available images
   * @returns {Array} Array of image filenames
   */
  getAllImages() {
    return [
      // Primary images (no duplicates)
      'Ethiopian History Fundamentals.jpg',
      'Archaeological Wonders.jpg', 
      'Cultural Traditions of Ethiopia.jpg',
      'Ethiopian Architecture Through Ages.jpg',
      'Ethiopian Coffee Culture.jpg',
      'Ethiopian Cuisine and Food Culture.jpg',
      'Ethiopian Festivals and Celebrations.jpg',
      'Ethiopian Languages and Scripts.jpg',
      'Ethiopian Orthodox Christianity.jpg',
      'Ethiopian Orthodox Traditions.jpg',
      'The Fourth Holy City of Islam.jpg',
      'Traditional Ethiopian Arts and Crafts.jpg',
      'Traditional Ethiopian Crafts.jpg',
      'Traditional Ethiopian Medicine.jpg',
      'Modern Ethiopia & Development.jpg',
      'Music and Dance of Ethiopia.jpg',
      'Ancient Ge\'ez Script and Manuscripts.jpg',
      'coffee-ceremony.jpg',
      'ethiopian-cuisine.jpg',
      'ethiopian-highlands.jpg',
      'geez-script.jpg',
      'meskel-festival.jpg',
      'modern-ethiopia.jpg',
      'orthodox-church.jpg',
      'timkat-festival.jpg',
      'traditional-clothing.jpg',
      'traditional-crafts.jpg',
      'traditional-dance.png',
      'traditional-instruments.jpg',
      'traditional-market.jpg',
      'traditional-medicine.jpg',
      'tribal-cultures.jpg',
      'Ai-tour.jpg',
      'Ethiopia.jpg',
      'Gonder.jpg',
      'Logo.jpg',
      'Lucy-Bone.jpg',
      'ace8d911-1cd1-4a0c-a981-36c00a299262.jpg',
      'alnejashin.jpg',
      'architecture.jpg',
      'artifacts.jpg',
      'add4e4fc-6a4a-47b4-9841-a98a5194e7fa.jpg'
    ];
  }

  /**
   * Get duplicate images that should be removed
   * @returns {Array} Array of duplicate image filenames
   */
  getDuplicateImages() {
    return [
      'Ancient Ge\'ez Script and Manuscripts - Copy.jpg',
      'Archaeological Wonders (2).jpg',
      'Ethiopian Cuisine and Food Culture - Copy.jpg',
      'Ethiopian Festivals Timkat Meskel - Copy - Copy.jpg',
      'Ethiopian Tribal Cultures - Copy.jpg',
      'Music and Dance of Ethiopia - Copy.jpg',
      'Traditional Ethiopian Arts and Crafts - Copy.jpg',
      'Traditional Ethiopian Medicine - Copy.jpg'
    ];
  }

  /**
   * Get image statistics
   * @returns {Object} Image statistics
   */
  getImageStats() {
    const allImages = this.getAllImages();
    const duplicates = this.getDuplicateImages();
    
    return {
      totalImages: allImages.length,
      duplicateImages: duplicates.length,
      cleanImages: allImages.length - duplicates.length,
      categories: Object.keys(this.categoryImages).length,
      mappings: Object.keys(this.imageMapping).length
    };
  }

  /**
   * Validate image exists
   * @param {string} imagePath - Image path to validate
   * @returns {Promise<boolean>} Whether image exists
   */
  async validateImage(imagePath) {
    try {
      const img = new Image();
      return new Promise((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = imagePath;
      });
    } catch (error) {
      console.error('Image validation error:', error);
      return false;
    }
  }

  /**
   * Get recommended images for a course
   * @param {Object} course - Course object
   * @param {number} count - Number of images to return
   * @returns {Array} Array of recommended image paths
   */
  getRecommendedImages(course, count = 3) {
    const primaryImage = this.getCourseImage(course);
    const recommendations = [primaryImage];
    
    // Add category-based images
    if (course.category && this.categoryImages[course.category]) {
      const categoryImages = this.categoryImages[course.category]
        .map(img => this.baseImagePath + img)
        .filter(img => img !== primaryImage);
      
      recommendations.push(...categoryImages.slice(0, count - 1));
    }
    
    // Fill remaining with fallback images
    while (recommendations.length < count) {
      const fallback = this.baseImagePath + this.getRandomFallbackImage();
      if (!recommendations.includes(fallback)) {
        recommendations.push(fallback);
      }
    }
    
    return recommendations.slice(0, count);
  }
}

// Export singleton instance
export default new ImageMapperService();
