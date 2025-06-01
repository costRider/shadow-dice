import { createContext, useContext, useState } from "react";
import { fetchRoomPlayers } from "@/services";


const RoomContext = createContext();

export function RoomProvider({ children }) {
    const [gameroom, setRoom] = useState(null); // 현재 방 정보
    const [players, setPlayers] = useState([]); // 참여자 목록
    const [characterList, setCharacterList] = useState([]); // 보유한 캐릭터 목록
    const [myCharacters, setMyCharacters] = useState([]); // 선택한 캐릭터
    const [ready, setReady] = useState(false); // 준비 상태

    const loadPlayers = async (roomId) => {
        const data = await fetchRoomPlayers(roomId);
        console.log("룸 플레이어 목록:", data);
        setPlayers(data);
    };

    const value = {
        gameroom,
        setRoom,
        players,
        setPlayers,
        characterList,
        setCharacterList,
        myCharacters,
        setMyCharacters,
        ready,
        setReady,
        loadPlayers,
    };

    return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export function useRoom() {
    const context = useContext(RoomContext);
    if (!context) {
        throw new Error("useRoom must be used within a RoomProvider");
    }
    return context;
}