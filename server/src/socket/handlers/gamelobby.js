import { getRoomUserInfo, getRoomById, getAllRooms, leaveRoom, getUserCharacterList, setPlayerTeam } from '../../services/roomModel.js';
import { updateUserStatusWithSocket } from '../../services/userModel.js';
import { updateRoomStatus, assignTurnOrder } from '../../services/roomModel.js';
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
            await setPlayerTeam(roomId, userId, team);

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

        const allReady = players.every(p => p.isReady);
        console.log(`[READY] ${roomId} ▶ 모든 준비 상태: ${allReady}`);
        console.log(`[READY] 플레이어 상태:`, players.map(p => ({ id: p.id, isReady: p.isReady })));

        // ✅ 1. 최소 인원 체크
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

        // ✅ 2. 팀 밸런스 체크
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

        // ✅ 3. 캐릭터 선택 여부
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

        // ✅ 4. 준비 완료된 경우 → 카운트다운 시작
        if (allReady) {
            if (startCountdownMap.has(roomId)) {
                console.log(`[READY] 카운트다운 이미 진행 중 → 무시`);
                return;
            }

            let secondsLeft = 5;
            const userIds = players.map(p => p.id);
            startPlayersMap.set(roomId, userIds);

            console.log(`[READY] ${roomId} ▶ 게임 시작 카운트다운 시작`);

            const intervalId = setInterval(async () => {
                const currentPlayers = await getRoomUserInfo(roomId);
                const currentUserIds = currentPlayers.map(p => p.id);

                const isSameUsers = (
                    userIds.length === currentUserIds.length &&
                    userIds.slice().sort().join() === currentUserIds.slice().sort().join()
                );

                const allReadyNow = currentPlayers.every(p => p.isReady);

                if (!isSameUsers || !allReadyNow) {
                    clearInterval(intervalId);
                    startCountdownMap.delete(roomId);
                    startPlayersMap.delete(roomId);
                    io.to(roomId).emit("chat:room:message", {
                        roomId,
                        user: { id: "system", nickname: "시스템" },
                        message: "❌ 준비 상태나 플레이어 변경으로 인해 게임 시작이 취소되었습니다.",
                        type: "system",
                        timestamp: Date.now(),
                    });
                    console.log(`[READY] ${roomId} ▶ 카운트다운 취소됨`);
                    return;
                }

                if (secondsLeft <= 0) {
                    clearInterval(intervalId);
                    startCountdownMap.delete(roomId);
                    startPlayersMap.delete(roomId);
                    // turnOrder 지정
                    const orderedPlayers = await assignTurnOrder(roomId);
                    await updateRoomStatus(roomId, "IN_PROGRESS");
                    io.to(roomId).emit("game-start");
                    console.log(`[READY] ${roomId} ▶ 게임 시작`);
                    console.log("[READY] 턴 순서:", orderedPlayers.map(p => ({ id: p.id, turnOrder: p.turnOrder })));

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
        }

        // ✅ 5. 준비 취소 → 카운트다운 중단
        else {
            if (startCountdownMap.has(roomId)) {
                console.log(`[READY] ${roomId} ▶ 준비 취소 감지 → 카운트다운 중단`);
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