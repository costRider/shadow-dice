import { useEffect, useRef } from "react";
import { useSocket } from "./useSocket";
import { useRoom } from "@/context/RoomContext";

export default function useGameLobbyUsers(roomId, userId) {
    const { socket } = useSocket();
    const {
        setRoom,
        setPlayers,
        setCharacterList,
        loadPlayers,
    } = useRoom();

    // “한 번만 join-room emit”을 보장하기 위한 ref
    const joinedRef = useRef(false);

    // 팀 변경 요청
    const handleChangeTeam = (playerId, team) => {
        if (playerId !== userId) return;
        socket.emit("change-team", { roomId, userId, team });
    };

    useEffect(() => {
        if (!socket || !roomId) return;

        // 이미 join-room을 보낸 적이 있으면 다시 보내지 않음
        if (!joinedRef.current) {
            socket.emit("join-room", roomId);
            joinedRef.current = true;
        }

        const handleRoomUsers = (players) => {
            setPlayers(players);
        };
        const handleCharList = (characters) => {
            setCharacterList(characters);
        };
        const handleRoomUpdated = (updatedRoom) => {
            setRoom(updatedRoom);
            loadPlayers(roomId);
            // 필요하다면, 여기서 로컬 상태를 초기화하고 싶으면 호출
            // 예: setSelectedCharacters([]); setIsReady(false);
        };

        socket.on("room-users", handleRoomUsers);
        socket.on("char-list", handleCharList);
        socket.on("room-updated", handleRoomUpdated);

        return () => {
            if (roomId) {
                socket.emit("leave-room", roomId);
                joinedRef.current = false;
            }
            socket.off("room-users", handleRoomUsers);
            socket.off("char-list", handleCharList);
            socket.off("room-updated", handleRoomUpdated);
        };
        // ↓ 여기에 “socket”과 “roomId”만 넣으면, 두 값이 바뀔 때만 이 Effect가 다시 실행됩니다.
    }, [socket, roomId]);

    return {
        handleChangeTeam,
    };
}
