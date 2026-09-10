import { io, Socket } from 'socket.io-client';
import { getSocketUrl } from './apiConfig';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const backendUrl = getSocketUrl();
    socket = io(backendUrl, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};
