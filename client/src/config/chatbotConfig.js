// Chatbot Configuration for EthioHeritage360
// Customizable settings for different user contexts and themes

export const chatbotConfig = {
  // Theme configurations
  themes: {
    default: {
      primaryColor: '#d97706', // amber-600
      secondaryColor: '#ea580c', // orange-600  
      accentColor: '#f59e0b', // amber-500
      backgroundColor: '#ffffff',
      textColor: '#111827',
      borderRadius: '16px'
    },
    
    dark: {
      primaryColor: '#d97706',
      secondaryColor: '#ea580c',
      accentColor: '#f59e0b',
      backgroundColor: '#111827',
      textColor: '#f9fafb',
      borderRadius: '16px'
    },

    heritage: {
      primaryColor: '#b45309', // amber-700
      secondaryColor: '#c2410c', // orange-700
      accentColor: '#d97706', // amber-600
      backgroundColor: '#fef7ed', // orange-50
      textColor: '#431407',
      borderRadius: '16px'
    }
  },

  // User role specific configurations
  roleConfigurations: {
    visitor: {
      welcomeMessage: "Welcome to EthioHeritage360! I'm your virtual heritage guide. Ask me about Ethiopian cultural sites, tours, virtual museums, or anything related to our rich heritage. How can I help you today?",
      personality: "friendly_guide",
      primaryFunctions: [
        "Heritage site information",
        "Virtual tour guidance", 
        "Cultural education",
        "Tour booking assistance"
      ],
      quickActions: [
        "Explore Lalibela churches",
        "Learn about Ethiopian coffee",
        "Take a virtual tour",
        "Find heritage sites"
      ],
      theme: "default"
    },

    user: {
      welcomeMessage: "Welcome to EthioHeritage360! I'm your virtual heritage guide. Ask me about Ethiopian cultural sites, tours, virtual museums, or anything related to our rich heritage. How can I help you today?",
      personality: "friendly_guide",
      primaryFunctions: [
        "Heritage site information",
        "Virtual tour guidance", 
        "Cultural education",
        "Tour booking assistance"
      ],
      quickActions: [
        "Explore Lalibela churches",
        "Learn about Ethiopian coffee",
        "Take a virtual tour",
        "Find heritage sites"
      ],
      theme: "default"
    },

    museumAdmin: {
      welcomeMessage: "Hello! I'm here to assist you with museum management, artifact uploads, visitor analytics, and administrative tasks. What do you need help with?",
      personality: "professional_assistant",
      primaryFunctions: [
        "Artifact management help",
        "Visitor analytics insights",
        "Staff management guidance",
        "Technical support"
      ],
      quickActions: [
        "Upload artifact guide",
        "View visitor stats",
        "Manage staff roles",
        "System settings help"
      ],
      theme: "heritage"
    },

    admin: {
      welcomeMessage: "Greetings, Administrator! I'm your system assistant. I can help with platform management, user oversight, system analytics, and technical support.",
      personality: "technical_expert",
      primaryFunctions: [
        "System administration",
        "User management",
        "Platform analytics",
        "Technical troubleshooting"
      ],
      quickActions: [
        "System health check",
        "User activity reports",
        "Platform statistics",
        "Technical documentation"
      ],
      theme: "heritage"
    },

    superAdmin: {
      welcomeMessage: "Welcome, Super Administrator! I'm here to assist with high-level system management, platform oversight, and strategic analytics.",
      personality: "strategic_advisor",
      primaryFunctions: [
        "Strategic platform insights",
        "System-wide analytics",
        "Advanced administration",
        "Performance optimization"
      ],
      quickActions: [
        "Platform overview",
        "Performance metrics",
        "System optimization",
        "Strategic insights"
      ],
      theme: "heritage"
    }
  },

  // Personality configurations
  personalities: {
    friendly_guide: {
      tone: "warm and enthusiastic",
      style: "conversational and educational",
      emoji: true,
      examples: true,
      encouragement: true
    },

    professional_assistant: {
      tone: "professional and helpful",
      style: "clear and instructional",
      emoji: false,
      examples: true,
      encouragement: false
    },

    technical_expert: {
      tone: "knowledgeable and precise",
      style: "detailed and technical",
      emoji: false,
      examples: true,
      encouragement: false
    },

    strategic_advisor: {
      tone: "analytical and insightful",
      style: "strategic and comprehensive",
      emoji: false,
      examples: false,
      encouragement: false
    }
  },

  // Feature toggles
  features: {
    suggestions: true,
    fullscreen: true,
    reset: true,
    typing_indicator: true,
    message_history: true,
    context_awareness: true,
    multilingual: false, // Future feature
    voice_input: false,  // Future feature
    file_upload: false   // Future feature
  },

  // Response timing configuration
  timing: {
    typing_delay: 1000,      // ms to simulate typing
    response_delay: 500,     // ms before showing response
    suggestion_delay: 2000   // ms before showing suggestions
  },

  // Maximum limits
  limits: {
    message_length: 1000,
    conversation_history: 100,
    suggestions_per_message: 3
  },

  // Default fallback responses
  fallbackResponses: {
    error: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment, or contact our support team.",
    
    no_match: "That's an interesting question! While I may not have a specific answer right now, I'd love to help you explore Ethiopian heritage. I can tell you about our amazing heritage sites, rich cultural traditions, virtual tours, and educational resources.",
    
    technical_issue: "I'm experiencing a temporary technical issue. Please try asking your question again, or contact support if the problem persists."
  },

  // Analytics configuration
  analytics: {
    track_interactions: true,
    track_popular_questions: true,
    track_user_satisfaction: true,
    track_response_effectiveness: true
  }
};

// Helper function to get configuration for a specific user role
export const getChatbotConfigForRole = (userRole = 'visitor') => {
  const roleConfig = chatbotConfig.roleConfigurations[userRole] || 
                   chatbotConfig.roleConfigurations.visitor;
  
  const personality = chatbotConfig.personalities[roleConfig.personality];
  const theme = chatbotConfig.themes[roleConfig.theme] || 
                chatbotConfig.themes.default;

  return {
    ...roleConfig,
    personality,
    theme,
    features: chatbotConfig.features,
    timing: chatbotConfig.timing,
    limits: chatbotConfig.limits,
    fallbackResponses: chatbotConfig.fallbackResponses
  };
};

// Helper function to update chatbot configuration
export const updateChatbotConfig = (updates) => {
  Object.assign(chatbotConfig, updates);
};

// Export default configuration
export default chatbotConfig;
