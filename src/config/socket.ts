import io, { Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CURRENT_API_BASE_URL, TOKEN_STORAGE_KEY } from './api';

let socket: Socket | null = null;

export const getSocketUrl = (): string => {
  return CURRENT_API_BASE_URL.replace('/api', '');
};

export const initSocket = async (): Promise<Socket> => {
  if (socket && socket.connected) {
    return socket;
  }

  const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  const socketUrl = getSocketUrl();

  socket = io(socketUrl, {
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    auth: {
      token: token || '',
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('Mobile Socket connected to:', socketUrl);
  });

  socket.on('connect_error', (err) => {
    console.warn('Mobile Socket connection error:', err.message);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
