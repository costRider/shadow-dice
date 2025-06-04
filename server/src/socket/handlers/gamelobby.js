import { getRoomUserInfo, getRoomById, getAllRooms, leaveRoom, getUserCharacterList, setPlayerTeam } from '../../services/roomModel.js';
import { updateUserStatusWithSocket } from '../../services/userModel.js';
import { roomEvents } from "../../events.js";

function handleGameLobby(io, socket) {

    const startCountdownMap = new Map(); // roomId => timeoutId
    const startPlayersMap = new Map();

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

                const newHostId = await leaveRoom(roomId, userId);
                roomEvents.emit("list-changed");
                if (newHostId != null) { roomEvents.emit("room-info-updated", roomId); };

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

    socket.on("player-ready-status-changed", async ({ roomId }) => {
        const players = await getRoomUserInfo(roomId);
        const room = await getRoomById(roomId);
        const allReady = players.every((p) => p.isReady);

        // 1. 최소 인원 체크
        if (players.length < 2) {
            io.to(roomId).emit("chat:room:message", {
                roomId,
                user: { id: "system", nickname: "시스템" },
                message: "❗ 최소 2명 이상일 때만 게임을 시작할 수 있습니다.",
                type: "system",
                timestamp: Date.now(),
            });
            return;
        }

        // 3. 팀전일 경우 팀 밸런스 체크
        if (room.teamMode) {
            const red = players.filter(p => p.team === 'red').length;
            const blue = players.filter(p => p.team === 'blue').length;
            if (red !== blue) {
                io.to(roomId).emit("chat:room:message", {
                    roomId,
                    user: { id: "system", nickname: "시스템" },
                    message: "⚖️ 팀 인원이 같지 않아 게임을 시작할 수 없습니다.",
                    type: "system",
                    timestamp: Date.now(),
                });
                return;
            }
        }

        // 캐릭터가 선택되지 않은 유저 체크
        const hasEmptyChar = players.some(p => {
            let list = [];
            try {
                list = JSON.parse(p.selectedCharacters || "[]");
            } catch { }
            return !Array.isArray(list) || list.length === 0;
        });
        if (hasEmptyChar) {
            io.to(roomId).emit("chat:room:message", {
                roomId,
                user: { id: "system", nickname: "시스템" },
                message: "❗ 모든 유저가 최소 한 명의 캐릭터를 선택해야 합니다.",
                type: "system",
                timestamp: Date.now(),
            });
            return;
        }

        if (allReady) {
            // 이미 진행 중이면 무시
            if (startCountdownMap.has(roomId)) return;

            let secondsLeft = 5;

            const userIds = players.map(p => p.id);
            startPlayersMap.set(roomId, userIds);

            const intervalId = setInterval(async () => {
                const currentPlayers = await getRoomUserInfo(roomId);
                const currentUserIds = currentPlayers.map(p => p.id);

                // ✅ 사용자 변동 감지
                const originalUserIds = startPlayersMap.get(roomId) || [];
                const isSame = (
                    originalUserIds.length === currentUserIds.length &&
                    originalUserIds.every(id => currentUserIds.includes(id))
                );

                if (!isSame) {
                    clearInterval(intervalId);
                    startCountdownMap.delete(roomId);
                    startPlayersMap.delete(roomId);
                    io.to(roomId).emit("chat:room:message", {
                        roomId,
                        user: { id: "system", nickname: "시스템" },
                        message: "❌ 플레이어 목록이 변경되어 게임 시작이 취소되었습니다.",
                        type: "system",
                        timestamp: Date.now(),
                    });
                    return;
                }

                if (secondsLeft <= 0) {
                    clearInterval(intervalId);
                    startCountdownMap.delete(roomId);
                    startPlayersMap.delete(roomId);
                    io.to(roomId).emit("game-start");
                    return;
                }

                io.to(roomId).emit("chat:room:message", {
                    roomId,
                    user: { id: "system", nickname: "시스템" },
                    message: `⏳ ${secondsLeft}초 뒤 게임이 시작됩니다!`,
                    type: "system",
                    timestamp: Date.now(),
                });

                secondsLeft--;
            }, 1000);

            startCountdownMap.set(roomId, intervalId);
        } else {
            // 누군가 Ready를 풀거나 나갔다면
            if (startCountdownMap.has(roomId)) {
                clearInterval(startCountdownMap.get(roomId));
                startCountdownMap.delete(roomId);
                startPlayersMap.delete(roomId);
                io.to(roomId).emit("chat:room:message", {
                    roomId,
                    user: { id: "system", nickname: "시스템" },
                    message: "❌ 게임 시작이 취소되었습니다.",
                    type: "system",
                    timestamp: Date.now(),
                });
            }
        }
    });


}
export default handleGameLobby;