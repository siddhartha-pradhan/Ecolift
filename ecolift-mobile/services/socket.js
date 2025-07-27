// src/utils/socket.js
import { io } from 'socket.io-client';
import { BASE_URL } from './Api';

const socket = io(BASE_URL, {
  transports: ['websocket'],
});

export default socket;
