import { Server } from 'socket.io';
import handleLobby from './handlers/lobby.js';
import handleChat from './handlers/chat.js';

// 연결된 소켓을 저장할 맵 (선택적, 필요시 사용)
export const socketToUserMap = new Map(); // 사용자 ID와 소켓 ID 매핑

export function setupSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
        }
    });
    console.log('🔌 Socket.IO server started');

    io.on('connection', socket => {
        console.log('🔌 New client connected:', socket.id); // 이 로그!
        handleLobby(io, socket);
        handleChat(io, socket);
    });

    return io;
}