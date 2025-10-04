// Enhanced Intelligent Chat Service for EthioHeritage360
// Provides contextual responses about Ethiopian heritage, culture, and platform features
// Now with OpenAI integration and advanced platform detection

import apiService from '../utils/api.js';

class IntelligentChatService {
  constructor() {
    // Ethiopian heritage knowledge base
    this.heritageKnowledge = {
      sites: {
        lalibela: {
          name: "Lalibela Rock Churches",
          description: "UNESCO World Heritage site featuring 11 medieval rock-hewn churches",
          location: "Lalibela, Amhara Region",
          significance: "Symbol of Ethiopia's Christian heritage and architectural marvel",
          visitInfo: "Available for virtual tours and educational programs"
        },
        aksum: {
          name: "Aksum Archaeological Site",
          description: "Ancient capital of the Kingdom of Aksum with towering obelisks",
          location: "Axum, Tigray Region",
          significance: "Birthplace of Ethiopian civilization and Christianity",
          features: "Stelae fields, royal tombs, Church of St. Mary of Zion"
        },
        gondar: {
          name: "Gondar Royal Enclosure",
          description: "17th-century royal city with castles and palaces",
          location: "Gondar, Amhara Region",
          significance: "Former capital of Ethiopian Empire, architectural fusion",
          highlights: "Fasil Ghebbi fortress, Debre Berhan Selassie Church"
        },
        harar: {
          name: "Harar Jugol",
          description: "Historic fortified city, considered the fourth holiest city of Islam",
          location: "Harari Region",
          significance: "Cultural crossroads, unique architecture and traditions",
          features: "Ancient city walls, 82 mosques, traditional Harari houses"
        },
        simien: {
          name: "Simien Mountains National Park",
          description: "Dramatic mountain landscape with endemic wildlife",
          location: "Amhara Region",
          significance: "Home to Gelada baboons, Walia ibex, and Ethiopian wolf",
          activities: "Trekking, wildlife viewing, cultural encounters"
        }
      },
      
      culture: {
        coffee: {
          origin: "Ethiopia is the birthplace of coffee",
          ceremony: "Traditional coffee ceremony is a social and spiritual ritual",
          regions: "Sidamo, Yirgacheffe, and Harrar are famous coffee regions",
          significance: "Coffee (buna) is central to Ethiopian social life"
        },
        calendar: {
          system: "Ethiopian calendar has 13 months",
          newYear: "Enkutatash celebrated in September",
          difference: "7-8 years behind the Gregorian calendar"
        },
        languages: {
          official: "Amharic is the official language",
          diversity: "Over 80 languages spoken",
          script: "Ge'ez script used for Amharic and other languages",
          ancient: "Ge'ez is an ancient liturgical language"
        },
        religion: {
          orthodox: "Ethiopian Orthodox Christianity since 4th century",
          islam: "Islam has deep historical roots",
          diversity: "Religious tolerance and coexistence",
          festivals: "Timkat, Meskel, Eid celebrations"
        }
      },
      
      platformFeatures: {
        virtualTours: "Immersive 3D tours of heritage sites",
        interactiveMap: "Explore locations with detailed information",
        artifacts: "Digital museum with historical artifacts",
        education: "Learning modules and cultural courses",
        booking: "Reserve guided tours and experiences"
      }
    };

    // Response patterns for different contexts
    this.responsePatterns = {
      greeting: [
        "Hello! I'm excited to help you explore Ethiopian heritage.",
        "Welcome! Ready to discover the wonders of Ethiopia?",
        "Hi there! Let's journey through Ethiopia's rich cultural landscape."
      ],
      
      heritage: [
        "Ethiopia's heritage is truly remarkable. Let me tell you about...",
        "That's a fascinating aspect of Ethiopian culture...",
        "Ethiopian heritage sites are among the world's most significant..."
      ],
      
      tours: [
        "Our tours offer immersive experiences of Ethiopian heritage...",
        "I can help you find the perfect tour for your interests...",
        "Ethiopia offers incredible touring opportunities..."
      ],
      
      technical: [
        "I can help you navigate the platform...",
        "Let me guide you through that feature...",
        "Here's how you can use this functionality..."
      ]
    };

    // Conversation history
    this.conversationHistory = [];
    this.maxHistoryLength = 10;
    
    // Platform context detection
    this.platformContexts = {
      '/museums': 'museum_exploration',
      '/artifacts': 'artifact_viewing', 
      '/tours': 'tour_booking',
      '/virtual-tours': 'virtual_tour',
      '/education': 'learning',
      '/admin/dashboard': 'admin_overview',
      '/admin/artifacts': 'artifact_management',
      '/admin/visitors': 'visitor_analytics',
      '/admin/staff': 'staff_management',
      '/profile': 'user_profile',
      '/booking': 'tour_booking'
    };
    
    // Common questions and their responses
    this.commonQuestions = {
      "what is lalibela": {
        answer: "Lalibela is home to 11 remarkable rock-hewn churches carved directly into the bedrock in the 12th century. These churches are still active places of worship and represent one of the world's greatest architectural achievements. The site is designed to represent 'New Jerusalem' and attracts pilgrims from around the world, especially during Timkat (Ethiopian Orthodox Epiphany).",
        suggestions: ["Tell me about other UNESCO sites", "How can I take a virtual tour?", "What makes the churches unique?"]
      },
      
      "ethiopian coffee": {
        answer: "Ethiopia is the birthplace of coffee! Legend says a goat herder named Kaldi discovered coffee when his goats became energetic after eating certain berries. The traditional Ethiopian coffee ceremony involves roasting green beans, grinding them by hand, and brewing in a clay pot called a jebena. It's a social ritual that can take hours and represents hospitality, community, and spiritual connection.",
        suggestions: ["Tell me about coffee regions", "How to participate in a coffee ceremony?", "Coffee tours available?"]
      },
      
      "virtual tours": {
        answer: "Our virtual tours use advanced 3D technology to let you explore Ethiopian heritage sites from anywhere in the world. You can walk through Lalibela's churches, climb Aksum's stelae, and explore Gondar's castles. Each tour includes expert narration, historical context, and interactive elements. Some tours also offer AR features when you visit the actual sites.",
        suggestions: ["Which tours are available?", "How do I start a virtual tour?", "Can I book group tours?"]
      },
      
      "timkat festival": {
        answer: "Timkat is the Ethiopian Orthodox celebration of Epiphany, usually held in January. It commemorates the baptism of Jesus Christ in the Jordan River. The celebration involves processions, blessing of waters, and renewal of baptismal vows. The Timkat celebration in Lalibela and Gondar are particularly spectacular, with thousands of pilgrims and colorful ceremonies.",
        suggestions: ["When is Timkat celebrated?", "Where to experience Timkat?", "Other Ethiopian festivals?"]
      }
    };
  }

  /**
   * Enhanced chat response with OpenAI integration and context detection
   * @param {string} userInput - User's message
   * @param {string} context - Platform context (auto-detected or provided)
   * @param {Object} user - User information (role, preferences, etc.)
   * @param {Array} conversationHistory - Previous conversation messages
   * @returns {Object} Response with text, suggestions, and metadata
   */
  async getChatResponse(userInput, context = 'general', user = null, conversationHistory = []) {
    try {
      const lowercaseInput = userInput.toLowerCase();
      
      // Update conversation history
      this.updateConversationHistory('user', userInput);
      
      // Detect platform context if not provided
      const detectedContext = this.detectPlatformContext();
      const finalContext = context !== 'general' ? context : detectedContext;
      
      // Check for direct matches first (fast response)
      const directAnswer = this.findDirectAnswer(lowercaseInput);
      if (directAnswer) {
        this.updateConversationHistory('assistant', directAnswer.text);
        return {
          ...directAnswer,
          context: finalContext,
          source: 'knowledge_base'
        };
      }

      // Try OpenAI for intelligent responses
      const openAIResponse = await this.getOpenAIResponse(userInput, finalContext, user, this.conversationHistory);
      if (openAIResponse) {
        this.updateConversationHistory('assistant', openAIResponse.text);
        return {
          ...openAIResponse,
          context: finalContext,
          source: 'openai_enhanced'
        };
      }

      // Fallback to pattern-based responses
      const fallbackResponse = this.getFallbackResponse(lowercaseInput, finalContext, user);
      this.updateConversationHistory('assistant', fallbackResponse.text);
      
      return {
        ...fallbackResponse,
        context: finalContext,
        source: 'pattern_based'
      };
      
    } catch (error) {
      console.error('Chat service error:', error);
      const errorResponse = {
        text: "I apologize, but I'm having trouble processing your request right now. Please try rephrasing your question or contact our support team.",
        suggestions: ["Contact support", "Try asking about heritage sites", "Explore virtual tours"],
        context: context,
        source: 'error_fallback'
      };
      
      this.updateConversationHistory('assistant', errorResponse.text);
      return errorResponse;
    }
  }

  findDirectAnswer(input) {
    // Look for exact or partial matches in common questions
    for (const [key, value] of Object.entries(this.commonQuestions)) {
      if (input.includes(key.toLowerCase()) || this.containsKeywords(input, key)) {
        return {
          text: value.answer,
          suggestions: value.suggestions
        };
      }
    }

    // Check for heritage site mentions
    for (const [siteKey, siteInfo] of Object.entries(this.heritageKnowledge.sites)) {
      if (input.includes(siteKey) || input.includes(siteInfo.name.toLowerCase())) {
        return {
          text: `${siteInfo.name} is ${siteInfo.description}. Located in ${siteInfo.location}, it's significant because ${siteInfo.significance}. ${siteInfo.features || siteInfo.visitInfo || siteInfo.highlights || ''}`,
          suggestions: [
            "Tell me more about visiting this site",
            "Are there virtual tours available?",
            "What other heritage sites can I explore?"
          ]
        };
      }
    }

    return null;
  }

  containsKeywords(input, questionKey) {
    const keywords = questionKey.split(' ');
    return keywords.some(keyword => input.includes(keyword));
  }

  getAdminResponse(input, user) {
    if (input.includes('upload') || input.includes('artifact')) {
      return {
        text: "To upload artifacts, navigate to the 'Artifact Management' section in your dashboard. You can upload images, add descriptions, historical context, and categorize items. Make sure to include metadata like date, origin, and cultural significance. Need help with the upload process?",
        suggestions: [
          "Show me artifact categories",
          "How to add historical context?",
          "Photo requirements for uploads"
        ]
      };
    }

    if (input.includes('visitor') || input.includes('analytics')) {
      return {
        text: "Your visitor analytics dashboard shows engagement metrics, popular exhibits, tour bookings, and user feedback. You can track which artifacts get the most views, peak visiting hours, and visitor demographics. This helps optimize your museum's digital presence.",
        suggestions: [
          "Show visitor statistics",
          "Most popular exhibits",
          "How to improve engagement"
        ]
      };
    }

    if (input.includes('staff') || input.includes('manage')) {
      return {
        text: "The staff management system lets you add team members, assign roles, track activities, and manage permissions. You can create different access levels for curators, guides, and administrative staff.",
        suggestions: [
          "How to add new staff?",
          "Role permissions explained",
          "Staff activity monitoring"
        ]
      };
    }

    return {
      text: "As a museum administrator, I can help you with artifact management, visitor analytics, staff coordination, virtual exhibit creation, and promotional activities. What specific area would you like assistance with?",
      suggestions: [
        "Artifact upload process",
        "Visitor analytics overview",
        "Staff management tools"
      ]
    };
  }

  getVisitorResponse(input, user) {
    if (input.includes('tour') || input.includes('visit')) {
      return {
        text: "We offer both virtual and physical tours of Ethiopia's heritage sites. Virtual tours let you explore from home with 3D experiences, while our guided physical tours provide in-person cultural immersion. Popular destinations include Lalibela, Aksum, Gondar, and Harar.",
        suggestions: [
          "Available virtual tours",
          "Book a guided tour",
          "Tour scheduling and pricing"
        ]
      };
    }

    if (input.includes('learn') || input.includes('course') || input.includes('education')) {
      return {
        text: "Our educational platform offers courses on Ethiopian history, culture, archaeology, and languages. You can earn certificates, participate in interactive lessons, and join study groups. Courses range from beginner introductions to advanced cultural studies.",
        suggestions: [
          "Browse available courses",
          "How to enroll in programs?",
          "Certificate requirements"
        ]
      };
    }

    if (input.includes('artifact') || input.includes('museum') || input.includes('collection')) {
      return {
        text: "Our virtual museum houses thousands of Ethiopian artifacts including ancient manuscripts, religious items, traditional crafts, archaeological finds, and cultural objects. Each item includes detailed descriptions, historical context, and high-resolution imagery.",
        suggestions: [
          "Browse artifact collections",
          "Search for specific items",
          "Create personal favorites"
        ]
      };
    }

    return {
      text: "I'm here to help you discover Ethiopian heritage! You can explore virtual museums, take guided tours, learn about our rich culture and history, or plan visits to heritage sites. What interests you most?",
      suggestions: [
        "Explore heritage sites",
        "Start a virtual tour",
        "Learn about Ethiopian culture"
      ]
    };
  }

  getGeneralResponse(input, user, conversationHistory) {
    // Handle greetings
    if (input.match(/\b(hi|hello|hey|greetings)\b/i)) {
      const greeting = this.responsePatterns.greeting[Math.floor(Math.random() * this.responsePatterns.greeting.length)];
      return {
        text: `${greeting} I can help you learn about Ethiopian heritage sites, plan tours, explore our virtual museum, or navigate the platform. What would you like to discover?`,
        suggestions: [
          "Tell me about Ethiopian heritage sites",
          "How do virtual tours work?",
          "What can I learn here?"
        ]
      };
    }

    // Handle help requests
    if (input.match(/\b(help|assist|guide|how)\b/i)) {
      return {
        text: "I'm here to guide you through EthioHeritage360! I can provide information about Ethiopian culture, heritage sites, virtual tours, educational programs, and help you navigate the platform. What specific help do you need?",
        suggestions: [
          "Platform navigation help",
          "Ethiopian heritage information",
          "Technical support"
        ]
      };
    }

    // Handle culture-related queries
    if (input.match(/\b(culture|tradition|custom|festival|food|music|dance)\b/i)) {
      return {
        text: "Ethiopian culture is incredibly rich and diverse! We have unique traditions like the coffee ceremony, colorful festivals like Timkat and Meskel, traditional music and dance, diverse cuisines, and over 80 ethnic groups each with their own customs. What aspect of Ethiopian culture interests you most?",
        suggestions: [
          "Tell me about Ethiopian festivals",
          "Traditional Ethiopian food",
          "Ethiopian music and dance"
        ]
      };
    }

    // Handle history queries
    if (input.match(/\b(history|ancient|kingdom|empire|past)\b/i)) {
      return {
        text: "Ethiopia has one of the longest and most fascinating histories in the world! From the ancient Kingdom of Aksum to the medieval Zagwe dynasty, from the powerful Ethiopian Empire to modern times. We're home to Lucy, one of humanity's earliest ancestors, and have never been fully colonized. What period of Ethiopian history would you like to explore?",
        suggestions: [
          "Ancient Kingdom of Aksum",
          "Medieval Ethiopian history",
          "Modern Ethiopian development"
        ]
      };
    }

    // Default response with helpful suggestions
    return {
      text: "That's an interesting question! While I may not have a specific answer right now, I'd love to help you explore Ethiopian heritage. I can tell you about our amazing heritage sites, rich cultural traditions, virtual tours, and educational resources.",
      suggestions: [
        "Explore heritage sites like Lalibela",
        "Learn about Ethiopian coffee culture",
        "Take a virtual museum tour"
      ]
    };
  }

  // Utility method to analyze conversation sentiment and adjust responses
  analyzeSentiment(input) {
    const positiveWords = ['love', 'amazing', 'beautiful', 'wonderful', 'great', 'excellent'];
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who'];
    
    const isPositive = positiveWords.some(word => input.toLowerCase().includes(word));
    const isQuestion = questionWords.some(word => input.toLowerCase().startsWith(word));
    
    return {
      isPositive,
      isQuestion,
      enthusiasm: isPositive ? 'high' : 'normal'
    };
  }

  /**
   * OpenAI integration for intelligent responses
   * @param {string} userInput - User's message
   * @param {string} context - Platform context
   * @param {Object} user - User information
   * @param {Array} conversationHistory - Previous messages
   * @returns {Object|null} OpenAI response or null if unavailable
   */
  async getOpenAIResponse(userInput, context, user, conversationHistory) {
    try {
      // Prepare context for OpenAI
      const systemPrompt = this.buildSystemPrompt(context, user);
      const conversationContext = this.buildConversationContext(conversationHistory);
      
      const payload = {
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationContext,
          { role: 'user', content: userInput }
        ],
        context: context,
        userRole: user?.role || 'visitor',
        platform: 'EthioHeritage360'
      };

      // Call backend OpenAI service
      const response = await apiService.post('/chat/openai', payload);
      
      if (response.success && response.data) {
        return {
          text: response.data.text,
          suggestions: response.data.suggestions || this.getContextualSuggestions(context, userInput),
          intent: response.data.intent,
          confidence: response.data.confidence
        };
      }
      
      return null;
    } catch (error) {
      console.error('OpenAI service error:', error);
      return null;
    }
  }

  /**
   * Build system prompt for OpenAI based on context and user
   */
  buildSystemPrompt(context, user) {
    const basePrompt = `You are an intelligent assistant for EthioHeritage360, a platform dedicated to Ethiopian cultural heritage preservation and education. You are knowledgeable, culturally respectful, and enthusiastic about Ethiopian history, culture, and heritage sites.

Key Information:
- Ethiopian heritage sites: Lalibela (rock churches), Aksum (ancient kingdom), Gondar (royal city), Harar (historic city), Simien Mountains
- Coffee is central to Ethiopian culture - birthplace of coffee with traditional ceremonies
- Ethiopian calendar has 13 months, 7-8 years behind Gregorian calendar
- Over 80 languages spoken, Amharic is official, Ge'ez script used
- Rich religious diversity: Orthodox Christianity (4th century), Islam, traditional beliefs
- Major festivals: Timkat (Epiphany), Meskel (True Cross), Enkutatash (New Year)

Platform Features:
- Virtual 3D tours of heritage sites
- Digital museum with artifacts and historical items
- Educational courses and cultural learning modules
- Tour booking system for physical visits
- Interactive heritage maps and guides`;

    const contextPrompts = {
      museum_exploration: '\n\nCurrent Context: User is exploring virtual museums and artifact collections.',
      artifact_viewing: '\n\nCurrent Context: User is viewing specific artifacts and learning about their history.',
      tour_booking: '\n\nCurrent Context: User is interested in booking tours or travel experiences.',
      virtual_tour: '\n\nCurrent Context: User is taking or interested in virtual tours of heritage sites.',
      learning: '\n\nCurrent Context: User is engaged with educational content and learning modules.',
      admin_overview: '\n\nCurrent Context: Museum administrator viewing dashboard and analytics.',
      artifact_management: '\n\nCurrent Context: Museum administrator managing artifact uploads and curation.',
      visitor_analytics: '\n\nCurrent Context: Museum administrator reviewing visitor statistics and engagement.',
      staff_management: '\n\nCurrent Context: Museum administrator handling staff coordination and roles.'
    };

    const userPrompts = {
      museumAdmin: '\n\nUser Role: Museum administrator who needs help with platform management, staff coordination, visitor analytics, and artifact curation.',
      user: '\n\nUser Role: Registered user interested in Ethiopian culture, heritage tours, and educational content.',
      visitor: '\n\nUser Role: General visitor exploring the platform and learning about Ethiopian heritage.'
    };

    return basePrompt + 
           (contextPrompts[context] || '') + 
           (userPrompts[user?.role] || userPrompts.visitor) + 
           '\n\nAlways provide helpful, accurate, and culturally respectful responses. Include practical suggestions for user actions.';
  }

  /**
   * Build conversation context for OpenAI from history
   */
  buildConversationContext(history) {
    return history.slice(-6).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
  }

  /**
   * Detect platform context based on current URL or page
   */
  detectPlatformContext() {
    try {
      const currentPath = window.location.pathname;
      
      // Check for exact matches first
      if (this.platformContexts[currentPath]) {
        return this.platformContexts[currentPath];
      }
      
      // Check for partial matches
      for (const [path, context] of Object.entries(this.platformContexts)) {
        if (currentPath.includes(path.replace('/', ''))) {
          return context;
        }
      }
      
      // Default context based on URL patterns
      if (currentPath.includes('admin')) {
        return 'admin_overview';
      } else if (currentPath.includes('museum')) {
        return 'museum_exploration';
      } else if (currentPath.includes('tour')) {
        return 'tour_booking';
      } else if (currentPath.includes('learn') || currentPath.includes('education')) {
        return 'learning';
      }
      
      return 'general';
    } catch (error) {
      console.error('Context detection error:', error);
      return 'general';
    }
  }

  /**
   * Update conversation history
   */
  updateConversationHistory(role, content) {
    this.conversationHistory.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });
    
    // Keep only recent messages
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }
  }

  /**
   * Clear conversation history
   */
  clearConversationHistory() {
    this.conversationHistory = [];
  }

  /**
   * Get fallback response when OpenAI is unavailable
   */
  getFallbackResponse(input, context, user) {
    // Context-based fallback responses
    if (context === 'museumAdmin' || (user && user.role === 'museumAdmin')) {
      return this.getAdminResponse(input, user);
    } else if (context === 'user' || context === 'visitor' || (user && user.role === 'user')) {
      return this.getVisitorResponse(input, user);
    }

    // General fallback response
    return this.getGeneralResponse(input, user, this.conversationHistory);
  }

  /**
   * Enhanced contextual suggestions based on current context and input
   */
  getContextualSuggestions(context, input) {
    const contextSuggestions = {
      museum_exploration: [
        "Browse artifact collections",
        "Learn about artifact history",
        "Search for specific items"
      ],
      artifact_viewing: [
        "View related artifacts",
        "Learn more about this period",
        "Save to favorites"
      ],
      tour_booking: [
        "Available virtual tours",
        "Book physical tours",
        "Check tour schedules"
      ],
      virtual_tour: [
        "Start 3D heritage tour",
        "Navigate to different sites",
        "Access tour guides"
      ],
      learning: [
        "Browse courses available",
        "Track learning progress",
        "Join study groups"
      ],
      admin_overview: [
        "View visitor analytics",
        "Manage artifacts",
        "Staff coordination"
      ],
      artifact_management: [
        "Upload new artifacts",
        "Edit descriptions",
        "Organize collections"
      ],
      visitor_analytics: [
        "View engagement metrics",
        "Popular content analysis",
        "Export reports"
      ]
    };
    
    return contextSuggestions[context] || [
      "Tell me about Ethiopian heritage",
      "How do I use this platform?",
      "Contact support"
    ];
  }

  /**
   * Get conversation summary for context
   */
  getConversationSummary() {
    if (this.conversationHistory.length === 0) {
      return null;
    }
    
    const recentMessages = this.conversationHistory.slice(-4);
    const topics = [];
    
    recentMessages.forEach(msg => {
      if (msg.role === 'user') {
        // Extract key topics from user messages
        const content = msg.content.toLowerCase();
        if (content.includes('lalibela') || content.includes('church')) topics.push('Lalibela Churches');
        if (content.includes('coffee')) topics.push('Ethiopian Coffee');
        if (content.includes('tour')) topics.push('Tours');
        if (content.includes('museum')) topics.push('Museums');
        if (content.includes('artifact')) topics.push('Artifacts');
      }
    });
    
    return {
      messageCount: this.conversationHistory.length,
      recentTopics: [...new Set(topics)],
      lastMessage: recentMessages[recentMessages.length - 1]
    };
  }
}

// Create singleton instance
export const intelligentChatService = new IntelligentChatService();
export default intelligentChatService;
