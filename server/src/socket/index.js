import { Server } from 'socket.io';
import handleLobby from './handlers/lobby.js';
import handleChat from './handlers/chat.js';

export function setupSocket(server) {
    const io = new Server(server, { /* cors 등 옵션 */ });

    io.on('connection', (socket) => {
        console.log('🔌 New client:', socket.id);

        handleLobby(io, socket);
        handleChat(io, socket);
        // handleGame(io, socket);
    });

    return io;
}
