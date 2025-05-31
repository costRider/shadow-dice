import { getRoomUserInfo, leaveRoom } from '../../services/roomModel.js'
import { updateUserStatusWithSocket } from '../../services/userModel.js';
import { roomEvents } from "../../events.js";

function handleGameLobby(io, socket) {

    socket.on("join-room", async (roomId) => {
        socket.join(roomId);
        socket.data.roomId = roomId;
        const users = await getRoomUserInfo(roomId); // DB 또는 메모리에서 조회
        console.log('현재 방 입장 후 사용자 정보:', users);
        io.to(roomId).emit("room-users", users);
    });

    socket.on("leave-room", async (roomId) => {
        socket.leave(roomId);
        const users = await getRoomUserInfo(roomId);
        console.log('퇴장 후 사용자 정보:', users);
        io.to(roomId).emit("room-users", users);
    });

    socket.on("disconnect", async () => {
        try {
            const user = socket.data.user;
            if (user?.status === 'IN_ROOM') {
                const userId = socket.data.userId;
                const roomId = socket.data.roomId;

                console.log('방 나가기 유저:', userId, '방 나가기 룸:', roomId);
                await leaveRoom(roomId, userId);

                const users = await getRoomUserInfo(roomId);
                io.to(roomId).emit("room-users", users); // 사용자 목록 갱신
                socket.leave(roomId);

                roomEvents.emit("list-changed");
                socketToUserMap.delete(userId);
                await updateUserStatusWithSocket(userId, 'OFFLINE', null);
                socket.data.hasLeft = true;

                console.log('퇴장 후 사용자 정보:', users);
            }
        } catch (err) {
            console.error('disconnect 처리 중 오류:', err);
        }
    });

    socket.on("room-chat", ({ roomId, user, message }) => {
        io.to(roomId).emit("room-chat", {
            user,
            message,
            timestamp: Date.now(),
        });
    });

}
export default handleGameLobby;