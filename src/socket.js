// src/socket.js
import { io } from 'socket.io-client';

const socket = io('http://185.155.18.145:15777'); // Замените на ваш адрес сервера

export default socket;