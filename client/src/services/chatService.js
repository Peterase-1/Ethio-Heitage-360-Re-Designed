import axios from 'axios';
import io from 'socket.io-client';

const API_URL = '/api/chat';
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

export default {
  initializeSocket,
  disconnectSocket,
  sendMessage,
  getMessages,
  getChatRooms,
  joinRoom,
  leaveRoom,
  onNewMessage,
};
