// Intelligent Chat Service for EthioHeritage360
// Provides contextual responses about Ethiopian heritage, culture, and platform features

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

  async getChatResponse(userInput, context = 'general', user = null, conversationHistory = []) {
    try {
      const lowercaseInput = userInput.toLowerCase();
      
      // Check for direct matches in common questions
      const directAnswer = this.findDirectAnswer(lowercaseInput);
      if (directAnswer) {
        return directAnswer;
      }

      // Context-based responses
      if (context === 'museumAdmin') {
        return this.getAdminResponse(lowercaseInput, user);
      } else if (context === 'user' || context === 'visitor') {
        return this.getVisitorResponse(lowercaseInput, user);
      }

      // General heritage and culture responses
      return this.getGeneralResponse(lowercaseInput, user, conversationHistory);
      
    } catch (error) {
      console.error('Chat service error:', error);
      return {
        text: "I apologize, but I'm having trouble processing your request right now. Please try rephrasing your question or contact our support team.",
        suggestions: ["Contact support", "Try asking about heritage sites", "Explore virtual tours"]
      };
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

  // Get contextual suggestions based on user role and input
  getContextualSuggestions(context, input) {
    const baseSuggestions = [
      "Tell me about Ethiopian heritage",
      "How do I use this platform?",
      "Contact support"
    ];

    if (context === 'user') {
      return [
        "Explore virtual tours",
        "Learn about Ethiopian culture",
        "Find heritage sites near me"
      ];
    }

    if (context === 'museumAdmin') {
      return [
        "Help with artifact uploads",
        "Visitor analytics guide",
        "Staff management tips"
      ];
    }

    return baseSuggestions;
  }
}

// Create singleton instance
export const intelligentChatService = new IntelligentChatService();
export default intelligentChatService;
