import { io } from 'socket.io-client';

const options = {
    'force new connection': true,
    reconnectionAttempt: 'Infinity',
    reconnection: true,
    reconnectionAttempts: 3,
    timeout: 10000,
    transports: ['websocket'],
};
export const socket = io("http://172.20.10.9:3800", options);