import { Server } from 'socket.io';
import handleLobby from './handlers/lobby.js';
import handleChat from './handlers/chat.js';
import { roomEvents } from "../events.js";
import { getAllRooms, getRoomById, getRoomUserInfo } from "../services/roomModel.js";
import handleGameLobby from './handlers/gamelobby.js';


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
        handleGameLobby(io, socket);
    });

    // 방 목록이 변경될 때마다 로비 방들한테 전체 목록을 보낸다
    roomEvents.on("list-changed", async () => {
        const allRooms = await getAllRooms();
        io.in("lobby").emit("room-list-changed", allRooms);
        console.log("🔌 Emitted room-list-changed", allRooms.length, "rooms");
    });

    //방에 있는 사용자 변경사항 업데이트 
    roomEvents.on("room-users-updated", async (roomId) => {
        const users = await getRoomUserInfo(roomId);
        io.to(roomId).emit("room-users", users);
        console.log(`🔁 room-users emitted for room ${roomId}`);
    });

    roomEvents.on("room-info-updated", async (roomId) => {
        const room = await getRoomById(roomId);
        io.to(roomId).emit("room-updated", room);
        console.log(`🔁 room-info emitted for room ${roomId}`)
    }
    )

    return io;
}