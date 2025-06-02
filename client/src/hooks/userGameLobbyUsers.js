import { useEffect } from "react";
import { useSocket } from './useSocket';
import { useRoom } from "@/context/RoomContext";

export default function useGameLobbyUsers(roomId) {
    const { socket } = useSocket();
    const { setPlayers, setCharacterList } = useRoom();

    useEffect(() => {
        if (!socket || !roomId) return;

        // 방 참여 요청
        socket.emit("join-room", roomId);

        // 서버에서 현재 접속자 목록 수신
        const handleRoomUsers = (players) => {
            setPlayers(players);
        };
        //사용자 보유 캐릭터 목록 수신
        const handleCharList = (characters) => {
            setCharacterList(characters);
        }

        socket.on("room-users", handleRoomUsers);
        socket.on("char-list", handleCharList);

        return () => {
            // 방 나가기 시 
            socket.emit("leave-room", roomId);
            socket.off("room-users", handleRoomUsers);
            socket.off("char-list", handleCharList);
        };
    }, [socket, roomId, setPlayers, setCharacterList]);

}
