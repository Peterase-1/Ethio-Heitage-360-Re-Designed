# Chatbot Integration Documentation

## Overview

The EthioHeritage360 platform now includes a fully integrated chatbot system that provides real-time assistance to users. The chatbot connects to the backend API and offers intelligent responses with fallback to local knowledge.

## Features

### ✅ Backend API Integration
- **Real API First**: The chatbot calls the backend API (`POST /api/chat/ask`) for intelligent responses
- **Graceful Fallback**: If the API fails, it falls back to local intelligent responses
- **User Authentication**: Supports both authenticated and anonymous users
- **Chat History**: Saves conversation history for logged-in users

### ✅ Intelligent Response System
- **Contextual Understanding**: Analyzes user questions using keyword matching and patterns
- **Topic Categories**: Supports multiple topics including:
  - Greetings and general inquiries
  - Account and profile management
  - Museum operations and artifact management
  - Technical support and troubleshooting
  - User roles and permissions
- **Dynamic Suggestions**: Provides relevant follow-up questions
- **Reference Links**: Includes helpful links and resources

### ✅ User Experience Features
- **Conversation History**: Tracks and displays recent chat interactions
- **Quick Suggestions**: Pre-built question suggestions for common topics
- **Typing Indicators**: Real-time feedback during response generation
- **Mobile Responsive**: Works seamlessly on all device sizes

## API Endpoints

### Chatbot Question Processing
```
POST /api/chat/ask
```

**Request Body:**
```json
{
  "question": "How do I add a new artifact?",
  "context": {},
  "chatHistory": [
    {
      "role": "user",
      "content": "Previous question",
      "timestamp": "2024-01-01T12:00:00Z"
    }
  ],
  "userInfo": {
    "userAgent": "Mozilla/5.0...",
    "timestamp": "2024-01-01T12:00:00Z"
  },
  "metadata": {
    "conversationId": "conv_123456"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "To add a new artifact, navigate to the Artifacts section in your dashboard...",
    "suggestions": [
      "How do I categorize artifacts?",
      "Can I upload images for artifacts?",
      "How do I edit artifact information?"
    ],
    "references": [
      {
        "title": "Artifact Management Guide",
        "url": "/help/artifacts",
        "description": "Complete guide for managing artifacts"
      }
    ],
    "confidence": "high",
    "timestamp": "2024-01-01T12:00:00Z",
    "conversationId": "conv_123456"
  }
}
```

### Get Topic Folders
```
GET /api/chat/folders
```

Returns categorized topics for enhanced suggestions:
```json
{
  "success": true,
  "data": {
    "getting-started": {
      "name": "Getting Started",
      "description": "Basic information and setup guides",
      "topics": ["Account creation", "First steps", "Basic navigation"]
    },
    "features": {
      "name": "Features & Functions",
      "description": "Learn about available features",
      "topics": ["Museum management", "Artifact cataloging"]
    }
  }
}
```

### Chat History Management
```
GET /api/chat/history       # Get user's chat history
POST /api/chat/save         # Save chat interaction  
DELETE /api/chat/history    # Clear chat history
```

## Frontend Integration

### EnhancedChatbot Component

The `EnhancedChatbot` component automatically:

1. **Calls Backend API First**: Sends user questions to `/api/chat/ask`
2. **Handles Authentication**: Includes JWT token if user is logged in
3. **Processes Responses**: Displays answers, suggestions, and references
4. **Falls Back Gracefully**: Uses local intelligence if API fails
5. **Manages State**: Tracks conversation history and user interactions

### chatService Integration

The `chatService.askQuestion()` method:
- Sends requests with full context (chat history, user info, metadata)
- Handles authentication tokens automatically
- Provides error handling and retry logic
- Returns structured responses with answers, suggestions, and references

## Environment Setup

### Backend Requirements

1. **MongoDB Connection**: Ensure MongoDB is running and connected
2. **Environment Variables**: Set up required environment variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ethioheritage360
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   NODE_ENV=development
   ```

3. **Dependencies**: All required npm packages are included in package.json

### Database Schema

The chatbot uses the User model with an added `chatHistory` field:

```javascript
chatHistory: [{
  question: String,
  answer: String,
  timestamp: Date,
  metadata: {
    confidence: String,
    suggestions: [String],
    references: [{
      title: String,
      url: String,
      description: String
    }],
    conversationId: String,
    userAgent: String,
    ipAddress: String
  }
}]
```

## Usage Instructions

### For Developers

1. **Start the Backend Server**:
   ```bash
   cd server
   npm install
   npm start
   ```

2. **Start the Frontend**:
   ```bash
   cd client  # or your frontend directory
   npm install
   npm run dev
   ```

3. **Access the Chatbot**: The chatbot is available on all pages as a floating widget

### For Users

1. **Click the Chat Icon**: Open the chatbot from any page
2. **Ask Questions**: Type questions about the platform, museums, or features  
3. **Use Suggestions**: Click on suggested questions for quick help
4. **View References**: Follow reference links for detailed information
5. **Chat History**: View previous conversations (logged-in users only)

## Response Categories

### 🟢 High Confidence Responses
- Specific keywords matched
- Direct answers provided
- Relevant suggestions offered
- Reference links included

### 🟡 Medium Confidence Responses  
- General topic area identified
- Broad guidance provided
- Generic suggestions offered

### 🟠 Low Confidence Responses
- Fallback responses used
- Asks for clarification
- Provides general help options

## Supported Topics

### Museum Management
- Adding/editing artifacts
- Managing collections
- Creating exhibits
- Inventory management

### User Account
- Registration and login
- Profile management
- Password reset
- Account settings

### Technical Support
- Error troubleshooting
- Performance issues
- Browser compatibility
- Feature problems

### Administrative Functions
- User management
- System settings
- Reports and analytics
- Permission management

## Error Handling

The chatbot includes comprehensive error handling:

1. **API Failures**: Falls back to local responses
2. **Authentication Issues**: Works for both logged-in and anonymous users
3. **Network Problems**: Provides offline-capable responses
4. **Invalid Input**: Validates and sanitizes user input
5. **Rate Limiting**: Respects API rate limits

## Customization

### Adding New Response Patterns

To add new topics or responses, edit the `generateChatbotResponse()` function in `server/routes/chat.js`:

```javascript
const responses = {
  newTopic: {
    keywords: ['keyword1', 'keyword2'],
    responses: [
      'Response option 1',
      'Response option 2'
    ],
    suggestions: [
      'Related question 1',
      'Related question 2'
    ]
  }
};
```

### Modifying UI Components

The chatbot UI can be customized by editing:
- `EnhancedChatbot.jsx`: Main chatbot component
- `chatService.js`: API communication logic
- CSS styles for appearance and animations

## Security Features

- **Input Validation**: All user inputs are validated and sanitized
- **Rate Limiting**: Prevents spam and abuse
- **Authentication**: Secure token-based authentication
- **Data Privacy**: Chat history is user-specific and protected
- **CORS Protection**: Secure cross-origin requests

## Performance Optimization

- **Response Caching**: Caches common responses
- **Lazy Loading**: Components load on demand
- **Debounced Input**: Reduces unnecessary API calls
- **Efficient State Management**: Optimized React state handling

## Monitoring and Analytics

The system logs:
- User questions and response patterns
- API response times and success rates
- Error frequencies and types
- User engagement metrics

## Future Enhancements

Planned improvements include:
- **AI/ML Integration**: More sophisticated natural language processing
- **Multi-language Support**: Support for local Ethiopian languages
- **Voice Interface**: Speech-to-text and text-to-speech capabilities
- **Advanced Analytics**: Detailed user behavior insights
- **Custom Training**: Museum-specific knowledge base training

## Support

For issues or questions about the chatbot integration:

1. Check the console logs for error messages
2. Verify API endpoints are accessible
3. Ensure database connection is working
4. Review authentication token validity
5. Check network connectivity

The chatbot provides a robust, user-friendly support system that enhances the overall platform experience while maintaining high performance and security standards.
