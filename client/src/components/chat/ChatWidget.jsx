import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, User, Bot } from 'lucide-react';

const ChatWidget = ({ isOpen, toggleChat }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      const newMessage = { id: messages.length + 1, text: input, sender: 'user' };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInput('');
      // Simulate bot response
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: prevMessages.length + 1, text: `Echo: ${input}`, sender: 'bot' },
        ]);
      }, 500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${isOpen ? 'w-80 h-96' : 'w-16 h-16'}`}>
      {!isOpen ? (
        <button
          onClick={toggleChat}
          className="w-full h-full flex items-center justify-center bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          <MessageSquare className="h-8 w-8" />
        </button>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 bg-amber-600 text-white">
            <h3 className="font-semibold">Chat with Support</h3>
            <button onClick={toggleChat} className="p-1 rounded-full hover:bg-amber-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start space-x-2 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  <div className={`p-2 rounded-full ${msg.sender === 'user' ? 'bg-amber-600 text-white' : 'bg-gray-300 text-gray-800'}`}>
                    {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-gray-200 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <button
              onClick={handleSend}
              className="ml-2 p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;