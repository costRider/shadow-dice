import { getRoomUserInfo, leaveRoom, getUserCharacterList } from '../../services/roomModel.js';
import { updateUserStatusWithSocket } from '../../services/userModel.js';
import { roomEvents } from "../../events.js";

function handleGameLobby(io, socket) {

    socket.on("join-room", async (roomId) => {
        try {
            /*
            if (roomId && socket.rooms.has(roomId)) {
                console.warn('이미 해당 방에 입장 중입니다.');
                return;
            }
             */
            socket.join(roomId);
            socket.data.roomId = roomId;
            const userId = socket.data.userId;

            const charList = await getUserCharacterList(userId);
            socket.emit('char-list', charList);

            const users = await getRoomUserInfo(roomId);
            io.to(roomId).emit("room-users", users);


        } catch (err) {
            console.error("join-room 에러:", err);
            socket.emit('error', { message: "방 참여 중 오류 발생" });
        }
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