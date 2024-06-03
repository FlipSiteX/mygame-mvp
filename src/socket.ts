import { io } from 'socket.io-client';

const options = {
    'force new connection': true,
    reconnectionAttempt: 'Infinity',
    reconnection: true,
    reconnectionAttempts: 3,
    timeout: 10000,
    transports: ['websocket'],
};
export const socket = io("http://192.168.1.33:3800", options);