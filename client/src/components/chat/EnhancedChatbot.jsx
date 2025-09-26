import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, User, Bot, Minimize2, Maximize2, RotateCcw, ExternalLink } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { intelligentChatService } from '../../services/intelligentChatService';
import { getChatbotConfigForRole } from '../../config/chatbotConfig';
import chatService from '../../services/chatService';

const EnhancedChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatContext, setChatContext] = useState('general');
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  // Initialize with welcome message
  useEffect(() => {
    const userRole = user?.role || 'visitor';
    const config = getChatbotConfigForRole(userRole);
    
    const welcomeMessage = {
      id: 'welcome',
      text: config.welcomeMessage,
      sender: 'bot',
      timestamp: new Date(),
      suggestions: config.quickActions.slice(0, 3) // Show first 3 quick actions
    };
    setMessages([welcomeMessage]);

    // Set context based on user role
    setChatContext(userRole);
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      const userMessage = {
        id: Date.now(),
        text: input.trim(),
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      const question = input.trim();
      setInput('');
      setIsLoading(true);

      try {
        let botResponse;
        let isApiResponse = false;

        // First, try the real API
        try {
          const apiResponse = await chatService.askQuestion(question, {
            context: chatContext,
            user,
            history: messages.slice(-10), // Send last 10 messages for context
            metadata: {
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent
            }
          });

          if (apiResponse.text && apiResponse.text.trim()) {
            botResponse = {
              text: apiResponse.text,
              suggestions: apiResponse.suggestions || [],
              references: apiResponse.references || []
            };
            isApiResponse = true;
            console.log('✅ Using API response');
          }
        } catch (apiError) {
          console.warn('API unavailable, falling back to local intelligence:', apiError.message);
        }

        // Fallback to local intelligence if API fails
        if (!isApiResponse) {
          console.log('🔄 Using local intelligence fallback');
          botResponse = await intelligentChatService.getChatResponse(
            question,
            chatContext,
            user,
            messages
          );
        }

        const botMessage = {
          id: Date.now() + 1,
          text: botResponse.text,
          sender: 'bot',
          timestamp: new Date(),
          suggestions: botResponse.suggestions || [],
          references: botResponse.references || [],
          isApiResponse
        };

        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('Chat error:', error);
        const errorMessage = {
          id: Date.now() + 1,
          text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or contact our support team if the issue persists.",
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isFullScreen) {
      setIsFullScreen(false);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const resetChat = () => {
    setMessages([{
      id: 'reset',
      text: "Chat reset! How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }]);
  };

  // Chat bubble (closed state)
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className="w-16 h-16 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center group"
          aria-label="Open chat"
        >
          <MessageSquare className="h-8 w-8 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    );
  }

  // Full screen chat
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col z-50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">EthioHeritage360 Assistant</h3>
              <p className="text-sm text-amber-100">Always here to help</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={resetChat}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title="Reset chat"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              onClick={toggleFullScreen}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title="Minimize"
            >
              <Minimize2 className="h-5 w-5" />
            </button>
            <button
              onClick={toggleChat}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-800 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`p-2 rounded-full ${msg.sender === 'user' ? 'bg-amber-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200'}`}>
                  {msg.sender === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-amber-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'}`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  {msg.references && msg.references.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">References:</p>
                      <div className="space-y-1">
                        {msg.references.map((ref, index) => (
                          <div key={index} className="text-xs bg-gray-50 dark:bg-gray-600 p-2 rounded border-l-2 border-amber-500">
                            {typeof ref === 'string' ? (
                              <span className="text-gray-700 dark:text-gray-300">{ref}</span>
                            ) : (
                              <>
                                {ref.title && <div className="font-medium text-gray-800 dark:text-gray-200">{ref.title}</div>}
                                {ref.url && (
                                  <a href={ref.url} target="_blank" rel="noopener noreferrer" 
                                     className="text-amber-600 dark:text-amber-400 hover:underline flex items-center mt-1">
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    {ref.url}
                                  </a>
                                )}
                                {ref.content && <div className="text-gray-600 dark:text-gray-400 mt-1">{ref.content}</div>}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suggested questions:</p>
                      {msg.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left text-sm bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 p-2 rounded-lg transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  {msg.isApiResponse && (
                    <div className="mt-2 flex items-center text-xs text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      API Response
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-[80%]">
                <div className="p-2 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="bg-white dark:bg-gray-700 p-4 rounded-2xl border border-gray-200 dark:border-gray-600">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about Ethiopian heritage, tours, or anything else..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                rows="2"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
            >
              <Send className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regular chat window
  return (
    <div className="fixed bottom-6 right-6 w-96 h-[32rem] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Heritage Assistant</h3>
            <p className="text-xs text-amber-100">Online now</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={resetChat}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            title="Reset chat"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={toggleFullScreen}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            title="Expand"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            onClick={toggleChat}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 h-80 overflow-y-auto bg-gray-50 dark:bg-gray-800 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`p-1.5 rounded-full ${msg.sender === 'user' ? 'bg-amber-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200'}`}>
                {msg.sender === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
              </div>
              <div className={`p-3 rounded-lg shadow-sm ${msg.sender === 'user' ? 'bg-amber-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                {msg.references && msg.references.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">References:</p>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {msg.references.slice(0, 2).map((ref, index) => (
                        <div key={index} className="text-xs bg-gray-50 dark:bg-gray-600 p-1.5 rounded border-l-2 border-amber-500">
                          {typeof ref === 'string' ? (
                            <span className="text-gray-700 dark:text-gray-300 truncate block">{ref}</span>
                          ) : (
                            <>
                              {ref.title && <div className="font-medium text-gray-800 dark:text-gray-200 truncate">{ref.title}</div>}
                              {ref.url && (
                                <a href={ref.url} target="_blank" rel="noopener noreferrer" 
                                   className="text-amber-600 dark:text-amber-400 hover:underline flex items-center mt-1 truncate">
                                  <ExternalLink className="w-3 h-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">{ref.url}</span>
                                </a>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Quick questions:</p>
                    {msg.suggestions.slice(0, 2).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left text-xs bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 p-2 rounded transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                {msg.isApiResponse && (
                  <div className="mt-1 flex items-center text-xs text-green-600 dark:text-green-400">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                    API
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 max-w-[85%]">
              <div className="p-1.5 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                <Bot className="h-3 w-3" />
              </div>
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about heritage sites, tours..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatbot;
