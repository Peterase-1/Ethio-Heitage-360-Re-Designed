import { useState, useEffect, useRef } from 'react';

export function useChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const newMessage = { id: Date.now(), text, sender: 'user' };
    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    // Simulate API call to a chat AI or support system
    try {
      const response = await new Promise(resolve => setTimeout(() => {
        resolve({ text: `Thank you for your message: "${text}". A support agent will be with you shortly.` });
      }, 1500));

      setMessages((prev) => [...prev, { id: Date.now() + 1, text: response.text, sender: 'bot' }]);
    } catch (error) {
      console.error('Chat message failed:', error);
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: 'Sorry, I could not process your request at this time.', sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isOpen, 
    toggleChat, 
    messages, 
    sendMessage, 
    isLoading
  };
}