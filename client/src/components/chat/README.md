# EthioHeritage360 Enhanced Chatbot

## Overview
The Enhanced Chatbot is an intelligent, context-aware virtual assistant designed specifically for the EthioHeritage360 platform. It provides personalized support for different user roles and contains extensive knowledge about Ethiopian heritage, culture, and platform features.

## Features

### ✨ Core Features
- **AI-Powered Responses**: Intelligent responses based on Ethiopian heritage knowledge
- **Context-Aware**: Adapts behavior based on user role (visitor, museum admin, super admin, etc.)
- **Multi-Mode Display**: Chat bubble, windowed chat, and fullscreen mode
- **Suggestions**: Interactive quick-action buttons for common queries
- **Dark Mode Support**: Seamless integration with your app's dark theme
- **Real-time Typing Indicators**: Visual feedback during response generation

### 🎯 User Role Customization
- **Visitors**: Heritage exploration, virtual tours, cultural education
- **Museum Admins**: Artifact management, visitor analytics, staff coordination
- **Super Admins**: System management, platform oversight, strategic insights

### 🏛️ Ethiopian Heritage Knowledge Base
- **Historical Sites**: Lalibela, Aksum, Gondar, Harar, Simien Mountains
- **Cultural Information**: Coffee ceremonies, festivals, traditions, languages
- **Platform Features**: Virtual tours, interactive maps, educational courses
- **Contextual Responses**: Role-specific assistance and guidance

## File Structure

```
src/components/chat/
├── EnhancedChatbot.jsx          # Main chatbot component
├── ChatWidget.jsx               # Legacy simple widget
├── FullScreenChat.jsx           # Legacy fullscreen chat
└── README.md                    # This documentation

src/services/
├── intelligentChatService.js    # AI response logic and knowledge base
├── chatService.js               # Legacy chat service
└── ...

src/config/
├── chatbotConfig.js            # Configuration and customization settings
└── ...

src/hooks/
├── useChat.js                  # Chat functionality hook
└── ...
```

## Usage

The chatbot is automatically integrated into your App.jsx and appears on all pages as a floating button in the bottom-right corner.

### Basic Interaction
1. Click the orange chat bubble to open
2. Type questions about Ethiopian heritage, tours, or platform features
3. Click suggestions for quick access to common information
4. Use the expand button for fullscreen mode

### Key Chat Features
- **Reset**: Clear conversation history
- **Fullscreen**: Expanded chat experience
- **Suggestions**: Quick action buttons
- **Context-Aware**: Responses adapt to your user role

## Configuration

The chatbot behavior can be customized through `src/config/chatbotConfig.js`:

```javascript
import { getChatbotConfigForRole } from '../config/chatbotConfig';

// Get configuration for current user
const config = getChatbotConfigForRole(userRole);
```

### Customizable Aspects
- Welcome messages per user role
- Quick action suggestions
- Personality traits (tone, style)
- Theme colors and appearance
- Feature toggles (suggestions, fullscreen, etc.)

## Knowledge Areas

### Heritage Sites
- **Lalibela**: Rock-hewn churches, UNESCO site, architectural marvel
- **Aksum**: Ancient obelisks, Kingdom origins, archaeological significance
- **Gondar**: Royal castles, 17th-century architecture, Fasil Ghebbi
- **Harar**: Islamic heritage, fortified city, cultural crossroads
- **Simien Mountains**: Natural heritage, endemic wildlife, trekking

### Cultural Topics
- **Coffee Culture**: Origin stories, ceremony significance, regional varieties
- **Festivals**: Timkat, Meskel, religious celebrations
- **Languages**: Amharic, Ge'ez script, linguistic diversity
- **History**: Ancient kingdoms, Lucy fossil, colonial resistance

### Platform Features
- Virtual museum tours with 3D technology
- Interactive heritage site mapping
- Educational courses and certifications
- Tour booking and planning assistance

## Technical Implementation

### Architecture
- **React Component**: Modern functional component with hooks
- **Service Layer**: Real API integration with local intelligence fallback
- **Configuration System**: Flexible customization options
- **Context Awareness**: User role and conversation history
- **API Integration**: REST endpoints for chat and optional folder indexing

### Key Technologies
- React 18+ with modern hooks
- Axios for API communication
- Lucide React icons for UI elements
- Tailwind CSS for responsive styling
- Context-aware AI response system with API fallback

### API Integration
The chatbot integrates with your backend API for real-time responses:

**Required Environment Variables:**
```bash
# Optional: Custom chat API endpoint (defaults to /api/chat/ask)
VITE_CHAT_API_URL=https://your-backend.com/api/chat/ask

# Optional: Folder index endpoint for enhanced suggestions (defaults to /api/chat/folders)
VITE_CHAT_FOLDERS_URL=https://your-backend.com/api/chat/folders

# Optional: WebSocket URL for real-time features (defaults to http://localhost:5001)
VITE_SOCKET_URL=https://your-backend.com
```

**API Endpoints Expected:**

1. **POST `/api/chat/ask`** - Main chat endpoint
   ```json
   {
     "question": "Tell me about Lalibela",
     "context": "visitor",
     "user": { "id": "123", "role": "visitor" },
     "history": [...],
     "metadata": { "timestamp": "...", "userAgent": "..." }
   }
   ```
   
   Response:
   ```json
   {
     "answer": "Lalibela is home to...",
     "suggestions": ["Tell me more about...", "How can I visit?"],
     "references": [
       { "title": "UNESCO World Heritage", "url": "https://...", "content": "..." },
       "Simple text reference"
     ]
   }
   ```

2. **GET `/api/chat/folders`** - Optional folder index for suggestions
   ```json
   {
     "folders": ["heritage-sites", "cultural-events", "museums"],
     "files": ["lalibela.md", "aksum.md", "gondar.md"],
     "categories": ["UNESCO Sites", "Festivals", "Architecture"]
   }
   ```

**WebSocket Events (Optional):**
- `bot_reply` - Real-time bot responses
- `stats_update` - Platform statistics updates

### Performance Features
- Lazy loading of chat history
- Optimized re-rendering with React.memo patterns
- Efficient state management
- Smooth animations and transitions

## Extending the Chatbot

### Adding New Knowledge
1. Edit `src/services/intelligentChatService.js`
2. Add new entries to the `heritageKnowledge` object
3. Update `commonQuestions` for frequently asked topics

### Customizing Appearance
1. Modify `src/config/chatbotConfig.js`
2. Update theme colors, personalities, or features
3. Add new user role configurations

### Adding New Features
1. Update the feature toggles in `chatbotConfig.js`
2. Implement new functionality in `EnhancedChatbot.jsx`
3. Add corresponding service methods if needed

## Sample Interactions

### For Visitors
**User**: "Tell me about Lalibela"
**Bot**: "Lalibela is home to 11 remarkable rock-hewn churches carved directly into the bedrock in the 12th century. These churches are still active places of worship and represent one of the world's greatest architectural achievements..."

### For Museum Admins  
**User**: "How do I upload artifacts?"
**Bot**: "To upload artifacts, navigate to the 'Artifact Management' section in your dashboard. You can upload images, add descriptions, historical context, and categorize items..."

### Cultural Queries
**User**: "What is the Ethiopian coffee ceremony?"
**Bot**: "The traditional Ethiopian coffee ceremony involves roasting green beans, grinding them by hand, and brewing in a clay pot called a jebena. It's a social ritual that can take hours..."

## Future Enhancements

### Planned Features
- **Multilingual Support**: Amharic, Oromo, and other local languages
- **Voice Input/Output**: Speech recognition and text-to-speech
- **File Uploads**: Image sharing and document analysis
- **Integration**: Direct booking and navigation assistance
- **Analytics**: User satisfaction tracking and popular query analysis

### Potential Improvements
- Advanced AI integration (GPT-style responses)
- Real-time language translation
- Augmented reality guidance integration
- Personalized learning path recommendations

## Support and Maintenance

### Regular Updates
- Heritage site information updates
- Festival dates and cultural event information
- Platform feature announcements
- User feedback integration

### Monitoring
- Response accuracy tracking
- User satisfaction metrics
- Popular query identification
- Performance optimization

## Contributing

To contribute to the chatbot:

1. Review the existing knowledge base
2. Test new responses thoroughly
3. Maintain consistency with Ethiopian cultural accuracy
4. Follow the established code patterns
5. Update documentation as needed

---

The Enhanced Chatbot represents a significant step forward in making Ethiopian heritage accessible and engaging for users worldwide. It combines intelligent AI responses with deep cultural knowledge to create an authentic and helpful virtual guide experience.
