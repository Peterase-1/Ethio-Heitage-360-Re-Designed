import axios from 'axios';
import io from 'socket.io-client';

const API_URL = '/api/chat';
const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || `${API_URL}/ask`;
const FOLDERS_API_URL = import.meta.env.VITE_CHAT_FOLDERS_URL || `${API_URL}/folders`;
let socket = null;

const initializeSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || import.meta.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
  }
  return socket;
};

const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

const sendMessage = async (messageData) => {
  try {
    const response = await axios.post(`${API_URL}/messages`, messageData);
    return response.data;
  } catch (error) {
    console.error('Error sending message', error);
    throw error;
  }
};

const getMessages = async (chatId) => {
  try {
    const response = await axios.get(`${API_URL}/messages/${chatId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages', error);
    throw error;
  }
};

const getChatRooms = async () => {
  try {
    const response = await axios.get(`${API_URL}/rooms`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat rooms', error);
    throw error;
  }
};

const joinRoom = (roomId, callback) => {
  const socketInstance = initializeSocket();
  socketInstance.emit('join_room', roomId);
  if (callback) socketInstance.on('room_joined', callback);
};

const leaveRoom = (roomId) => {
  if (socket) {
    socket.emit('leave_room', roomId);
  }
};

const onNewMessage = (callback) => {
  if (socket) {
    socket.on('new_message', callback);
  }
};

// Listen for bot replies if the backend emits them
const onBotReply = (callback) => {
  if (socket) {
    socket.on('bot_reply', callback);
  }
};

// Ask the backend a question and get an answer
const askQuestion = async (question, options = {}) => {
  try {
    const payload = {
      question,
      context: options.context || 'general',
      user: options.user || null,
      history: options.history || [],
      metadata: options.metadata || {},
    };
    const response = await axios.post(CHAT_API_URL, payload);
    // Normalize common response shapes
    const data = response.data || {};
    return {
      text: data.answer || data.text || data.message || '',
      suggestions: data.suggestions || [],
      references: data.references || data.citations || [],
      raw: data,
    };
  } catch (error) {
    console.error('Error asking chat question', error);
    throw error;
  }
};

// Optionally fetch a folder index from the backend to power suggestions
const getFolderIndex = async () => {
  try {
    const response = await axios.get(FOLDERS_API_URL);
    return response.data;
  } catch (error) {
    // Silently fail if endpoint not available
    console.warn('Folder index endpoint not available:', error?.response?.status || error?.message);
    return null;
  }
};

export default {
  initializeSocket,
  disconnectSocket,
  sendMessage,
  getMessages,
  getChatRooms,
  joinRoom,
  leaveRoom,
  onNewMessage,
  onBotReply,
  askQuestion,
  getFolderIndex,
};
