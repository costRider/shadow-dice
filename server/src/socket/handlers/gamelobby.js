import { getRoomUserInfo } from '../../services/roomModel.js'

function handleGameLobby(io, socket) {

    socket.on("join-room", async (roomId) => {
        socket.join(roomId);
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
        // 필요한 경우 여기서도 사용자 제거 후 갱신
        socket.leave(roomId);
        const users = await getRoomUserInfo(roomId);
        console.log('퇴장 후 사용자 정보:', users);
        io.to(roomId).emit("room-users", users);
    });

}
export default handleGameLobby;