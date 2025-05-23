// server/socket.js
import { Server } from 'socket.io';
import { updateUserStatus, getLobbyUsers, getUserById } from '../services/userModel.js';


const socketUserMap = new Map(); // socket.id ↔ userId 매핑

export default function setupSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log(`🔌 New client connected: ${socket.id}`);

        socket.on('enter-lobby', async (payload) => {
            // 1) 상태 및 socketId 저장
            console.log('📥 enter-lobby payload:', payload);
            const { success, user } = payload;
            if (!success || !user || !user.id) {
                console.warn('🚨 enter-lobby: 유효하지 않은 payload', payload);
                return;
            }
            socketUserMap.set(socket.id, user.id);
            await updateUserStatus(user.id, 'LOBBY', socket.id);
            console.log('✅ User Info:', user);
            // 2) 현재 로비 유저 목록 가져와 브로드캐스트
            const lobbyUsers = await getLobbyUsers();
            io.emit('lobby-users', lobbyUsers);
        });

        socket.on('disconnect', async () => {
            const userId = socketUserMap.get(socket.id);
            if (userId) {
                // 상태 OFFLINE으로 변경 (socketId는 null)
                await updateUserStatus(userId, 'OFFLINE', null);
                socketUserMap.delete(socket.id);

                // 갱신된 유저 목록 브로드캐스트
                const lobbyUsers = await getLobbyUsers();
                io.emit('lobby-users', lobbyUsers);
                console.log(`❌ User disconnected: ${userId}`);
            }
        });
    });

    return io;
}
