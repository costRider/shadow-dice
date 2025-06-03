import { getRoomUserInfo, getRoomById, getAllRooms, leaveRoom, getUserCharacterList, setPlayerTeam } from '../../services/roomModel.js';
import { updateUserStatusWithSocket } from '../../services/userModel.js';
import { roomEvents } from "../../events.js";

function handleGameLobby(io, socket) {

    socket.on("join-room", async (roomId) => {
        try {
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
        console.log("leave-room 콜");
        try {
            socket.leave(roomId);
            // 2) 방이 여전히 남아있는지 확인
            const roomExists = await getRoomById(roomId);
            if (!roomExists) {
                // 방 자체가 삭제된 경우: 
                //   - 해당 roomId를 구독하고 있는 클라이언트에게 "room-deleted" 이벤트를 보내거나
                //   - 혹은 별도 처리가 필요 없으면 그냥 return
                //io.to(roomId).emit("room-deleted", { roomId });
                return;
            }

            // 3) 방이 남아있는 경우: 현재 방의 사용자 목록을 다시 조회해서 브로드캐스트
            const users = await getRoomUserInfo(roomId);
            io.to(roomId).emit("room-users", users);
        } catch (err) {
            console.error("leave-room 처리 중 오류:", err);
            socket.emit("error", { message: "방 나가기 처리 실패" });
        }
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

    socket.on("change-team", async ({ roomId, userId, team }) => {
        try {
            console.log("받은 팀 교체 요청:", roomId, userId, team);
            // 팀 유효성 체크 (blue 또는 red만 허용)
            if (!['blue', 'red'].includes(team)) {
                socket.emit("error", { message: "잘못된 팀 정보입니다." });
                return;
            }

            // 본인 확인
            if (userId !== socket.data.userId) {
                socket.emit("error", { message: "다른 사용자의 팀을 변경할 수 없습니다." });
                return;
            }

            // DB 업데이트
            setPlayerTeam(roomId, userId, team);

            // 사용자 목록 다시 가져오기
            const users = await getRoomUserInfo(roomId);
            io.to(roomId).emit("room-users", users);

        } catch (err) {
            console.error("change-team 에러:", err);
            socket.emit("error", { message: "팀 변경 중 오류 발생" });
        }
    });

    socket.on("request-room-list-refresh", async () => {
        try {
            const allRooms = await getAllRooms(); // DB에서 최신 목록 조회
            io.emit("room-list-changed", allRooms);
        } catch (err) {
            console.error("room-list refresh error:", err);
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