const OpenAI = require('openai');
const retry = require('retry');

class OpenAIService {
  constructor() {
    this.openai = null;
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 1000;
    this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7;
    this.timeout = parseInt(process.env.OPENAI_TIMEOUT) || 30000;
    this.maxRetries = parseInt(process.env.OPENAI_MAX_RETRIES) || 3;
    this.retryDelay = parseInt(process.env.OPENAI_RETRY_DELAY) || 1000;
  }

  /**
   * Initialize OpenAI client if not already initialized
   */
  initializeOpenAI() {
    if (!this.openai && this.isConfigured()) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    return this.openai !== null;
  }

  /**
   * Check if method can be executed
   */
  canExecute() {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'OpenAI service is not configured. Please set OPENAI_API_KEY environment variable.'
      };
    }
    
    if (!this.initializeOpenAI()) {
      return {
        success: false,
        error: 'Failed to initialize OpenAI client.'
      };
    }
    
    return { success: true };
  }

  /**
   * Generate artifact description using AI
   */
  async generateArtifactDescription(artifactName, category, historicalPeriod) {
    const canExecute = this.canExecute();
    if (!canExecute.success) {
      return canExecute;
    }

    try {
      const prompt = `Generate a detailed and engaging description for an Ethiopian cultural artifact called "${artifactName}" from the ${category} category, dating from the ${historicalPeriod} period. Include historical context, cultural significance, and interesting facts about Ethiopian heritage. Keep it educational but accessible, around 150-200 words.`;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert in Ethiopian culture, history, and museum curation. Provide accurate, respectful, and engaging descriptions of Ethiopian cultural artifacts.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: 0.7,
      });

      return {
        success: true,
        description: completion.choices[0].message.content.trim()
      };
    } catch (error) {
      console.error('OpenAI artifact description generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate museum tour guide content
   */
  async generateTourGuide(museumName, exhibits, targetAudience = 'general') {
    const canExecute = this.canExecute();
    if (!canExecute.success) {
      return canExecute;
    }

    try {
      const prompt = `Create an engaging tour guide script for ${museumName} featuring these exhibits: ${exhibits.join(', ')}. Target audience: ${targetAudience}. Include interesting stories, historical context, and interactive questions. Make it culturally sensitive and educational about Ethiopian heritage.`;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional museum tour guide specializing in Ethiopian heritage and culture. Create engaging, informative, and respectful content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.maxTokens * 2,
        temperature: 0.8,
      });

      return {
        success: true,
        tourGuide: completion.choices[0].message.content.trim()
      };
    } catch (error) {
      console.error('OpenAI tour guide generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate educational content for heritage learning
   */
  async generateEducationalContent(topic, difficulty = 'intermediate', contentType = 'lesson') {
    const canExecute = this.canExecute();
    if (!canExecute.success) {
      return canExecute;
    }

    try {
      let prompt = '';
      
      switch (contentType) {
        case 'lesson':
          prompt = `Create a ${difficulty}-level educational lesson about ${topic} in Ethiopian heritage. Include learning objectives, key concepts, historical context, and discussion questions.`;
          break;
        case 'quiz':
          prompt = `Create a ${difficulty}-level quiz with 10 multiple-choice questions about ${topic} in Ethiopian heritage. Include correct answers and explanations.`;
          break;
        case 'summary':
          prompt = `Write a comprehensive but accessible summary about ${topic} in Ethiopian heritage, suitable for ${difficulty}-level learners.`;
          break;
        default:
          prompt = `Create educational content about ${topic} in Ethiopian heritage for ${difficulty}-level learners.`;
      }

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert educator specializing in Ethiopian heritage, history, and culture. Create accurate, engaging, and culturally respectful educational content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.maxTokens * 1.5,
        temperature: 0.7,
      });

      return {
        success: true,
        content: completion.choices[0].message.content.trim(),
        topic,
        difficulty,
        contentType
      };
    } catch (error) {
      console.error('OpenAI educational content generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate chatbot responses for visitor questions
   */
  async generateChatResponse(userMessage, context = '') {
    const canExecute = this.canExecute();
    if (!canExecute.success) {
      return canExecute;
    }

    try {
      const systemPrompt = `You are a helpful AI assistant for EthioHeritage360, an Ethiopian cultural heritage platform. You help visitors with questions about Ethiopian museums, artifacts, culture, history, and heritage sites. Be informative, friendly, and culturally respectful. If you don't know something specific, suggest they contact the museum directly.

Context: ${context}`;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 500,
        temperature: 0.8,
      });

      return {
        success: true,
        response: completion.choices[0].message.content.trim()
      };
    } catch (error) {
      console.error('OpenAI chat response generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate personalized recommendations
   */
  async generateRecommendations(userPreferences, visitHistory = []) {
    const canExecute = this.canExecute();
    if (!canExecute.success) {
      return canExecute;
    }

    try {
      const prompt = `Based on a user's preferences: ${JSON.stringify(userPreferences)} and their visit history: ${visitHistory.join(', ')}, recommend 5 Ethiopian heritage sites, museums, or cultural experiences. Explain why each recommendation matches their interests.`;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a cultural heritage recommendation expert specializing in Ethiopian museums, sites, and experiences. Provide personalized, relevant recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: 0.8,
      });

      return {
        success: true,
        recommendations: completion.choices[0].message.content.trim()
      };
    } catch (error) {
      console.error('OpenAI recommendations generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Translate content to different languages
   */
  async translateContent(content, targetLanguage) {
    const canExecute = this.canExecute();
    if (!canExecute.success) {
      return canExecute;
    }

    try {
      const prompt = `Translate the following content about Ethiopian heritage to ${targetLanguage}. Maintain cultural context and respectful tone:\n\n${content}`;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator specializing in cultural and heritage content. Maintain accuracy while preserving cultural nuances.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: 0.3,
      });

      return {
        success: true,
        translatedContent: completion.choices[0].message.content.trim(),
        originalLanguage: 'English',
        targetLanguage
      };
    } catch (error) {
      console.error('OpenAI translation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if OpenAI is properly configured
   */
  isConfigured() {
    return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-');
  }

  /**
   * Test OpenAI connection
   */
  async testConnection() {
    const canExecute = this.canExecute();
    if (!canExecute.success) {
      return canExecute;
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: 'Say "OpenAI connection test successful for EthioHeritage360!"'
          }
        ],
        max_tokens: 50,
        temperature: 0,
      });

      return {
        success: true,
        message: completion.choices[0].message.content.trim(),
        model: this.model
      };
    } catch (error) {
      console.error('OpenAI connection test error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if OpenAI service is available
   */
  isAvailable() {
    return this.isConfigured() && !!this.openai;
  }

  /**
   * Execute OpenAI request with retry logic and enhanced error handling
   */
  async executeWithRetry(apiCall, operationType = 'API call') {
    const operation = retry.operation({
      retries: this.maxRetries,
      factor: 2,
      minTimeout: this.retryDelay,
      maxTimeout: this.retryDelay * 8,
      randomize: true,
    });

    return new Promise((resolve, reject) => {
      operation.attempt(async (currentAttempt) => {
        try {
          const result = await apiCall();
          resolve(result);
        } catch (error) {
          const shouldRetry = this.shouldRetryError(error);
          
          if (operation.retry(shouldRetry ? error : null)) {
            console.warn(`${operationType} attempt ${currentAttempt} failed, retrying...`, error.message);
            return;
          }
          
          // Log final error with context
          console.error(`${operationType} failed after ${currentAttempt} attempts:`, {
            error: error.message,
            code: error.code,
            status: error.status,
            type: error.type
          });
          
          reject(this.formatError(error, operationType));
        }
      });
    });
  }

  /**
   * Determine if an error should trigger a retry
   */
  shouldRetryError(error) {
    if (!error) return false;
    
    // Retry on rate limit, timeout, and temporary server errors
    const retryableCodes = ['rate_limit_exceeded', 'timeout', 'server_error'];
    const retryableStatuses = [429, 500, 502, 503, 504];
    
    return retryableCodes.includes(error.code) || 
           retryableStatuses.includes(error.status) ||
           error.message?.includes('timeout') ||
           error.message?.includes('network');
  }

  /**
   * Format error for consistent error handling
   */
  formatError(error, operation) {
    const errorInfo = {
      operation,
      timestamp: new Date().toISOString(),
      message: error.message || 'Unknown error occurred',
      code: error.code,
      status: error.status,
      type: error.type
    };

    // Provide user-friendly error messages
    if (error.code === 'rate_limit_exceeded') {
      errorInfo.userMessage = 'AI service is currently busy. Please try again in a moment.';
    } else if (error.code === 'insufficient_quota') {
      errorInfo.userMessage = 'AI service quota exceeded. Please contact support.';
    } else if (error.code === 'invalid_api_key') {
      errorInfo.userMessage = 'AI service configuration error. Please contact support.';
    } else if (error.status >= 500) {
      errorInfo.userMessage = 'AI service is temporarily unavailable. Please try again later.';
    } else {
      errorInfo.userMessage = 'AI service encountered an error. Please try again.';
    }

    return errorInfo;
  }

  /**
   * Get chat completion for enhanced chatbot
   * Compatible with standard OpenAI API format
   */
  async getChatCompletion(request) {
    const canExecute = this.canExecute();
    if (!canExecute.success) {
      throw new Error(canExecute.error);
    }

    return this.executeWithRetry(
      () => this.openai.chat.completions.create(request),
      'Chat completion'
    );
  }

  /**
   * Generate Ethiopian heritage focused response
   */
  async generateHeritageResponse(userMessage, context = {}) {
    const canExecute = this.canExecute();
    if (!canExecute.success) {
      return canExecute;
    }

    try {
      const systemPrompt = this.buildHeritageSystemPrompt(context);
      
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 600,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      return {
        success: true,
        response: completion.choices[0].message.content.trim(),
        context: context,
        model: this.model
      };
    } catch (error) {
      console.error('OpenAI heritage response generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Build comprehensive system prompt for Ethiopian heritage context
   */
  buildHeritageSystemPrompt(context = {}) {
    const basePrompt = `You are an intelligent assistant for EthioHeritage360, a platform dedicated to Ethiopian cultural heritage preservation and education. You are knowledgeable, culturally respectful, and enthusiastic about Ethiopian history, culture, and heritage sites.

Key Ethiopian Heritage Information:
- Heritage Sites: Lalibela (rock churches), Aksum (ancient kingdom), Gondar (royal city), Harar (historic city), Simien Mountains
- Coffee Culture: Ethiopia is the birthplace of coffee with traditional ceremonies central to social life
- Calendar: Ethiopian calendar has 13 months, 7-8 years behind Gregorian calendar
- Languages: Over 80 languages spoken, Amharic is official, Ge'ez script used
- Religious Diversity: Orthodox Christianity (4th century), Islam, traditional beliefs
- Major Festivals: Timkat (Epiphany), Meskel (True Cross), Enkutatash (New Year)

Platform Features:
- Virtual 3D tours of heritage sites
- Digital museum with artifacts and historical items
- Educational courses and cultural learning modules
- Tour booking system for physical visits
- Interactive heritage maps and guides`;

    // Add context-specific information
    let contextPrompt = '';
    if (context.userRole) {
      const rolePrompts = {
        'museumAdmin': '\n\nUser Role: Museum administrator who needs help with platform management, staff coordination, visitor analytics, and artifact curation.',
        'user': '\n\nUser Role: Registered user interested in Ethiopian culture, heritage tours, and educational content.',
        'visitor': '\n\nUser Role: General visitor exploring the platform and learning about Ethiopian heritage.'
      };
      contextPrompt += rolePrompts[context.userRole] || rolePrompts.visitor;
    }

    if (context.platformContext) {
      const contextPrompts = {
        'museum_exploration': '\n\nCurrent Context: User is exploring virtual museums and artifact collections.',
        'artifact_viewing': '\n\nCurrent Context: User is viewing specific artifacts and learning about their history.',
        'tour_booking': '\n\nCurrent Context: User is interested in booking tours or travel experiences.',
        'virtual_tour': '\n\nCurrent Context: User is taking or interested in virtual tours of heritage sites.',
        'learning': '\n\nCurrent Context: User is engaged with educational content and learning modules.',
        'admin_overview': '\n\nCurrent Context: Museum administrator viewing dashboard and analytics.',
        'artifact_management': '\n\nCurrent Context: Museum administrator managing artifact uploads and curation.',
        'visitor_analytics': '\n\nCurrent Context: Museum administrator reviewing visitor statistics and engagement.'
      };
      contextPrompt += contextPrompts[context.platformContext] || '';
    }

    return basePrompt + contextPrompt + '\n\nAlways provide helpful, accurate, and culturally respectful responses. Include practical suggestions for user actions when appropriate.';
  }
}

module.exports = new OpenAIService();
