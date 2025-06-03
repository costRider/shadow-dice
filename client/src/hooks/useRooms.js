import { useState, useEffect, useCallback } from 'react';
import { getRooms, createRoom, updateRoomInfo } from '@/services/rooms';
import { useSocket } from './useSocket';
import { useRoom } from "@/context/RoomContext";

export default function useRooms() {
    const { setRoom } = useRoom();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { socket } = useSocket();

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await getRooms();
            setRooms(list);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // 1) 최초 방 목록 로드
        fetchAll();

        // 2) 소켓으로부터 방 목록 변경 이벤트 받기
        socket.on("room-list-changed", newList => {
            setRooms(newList);
        });

        return () => {
            socket.off("room-list-changed");
        };
    }, [fetchAll, socket]);

    const create = useCallback(async (roomData) => {
        setError(null);
        try {
            const newRoom = await createRoom(roomData);
            return newRoom;
        } catch (err) {
            setError(err);
            throw err;
        }
    }, []);

    // 3) 방 정보 업데이트 (팀전, costLimit 등)
    const updateRoom = useCallback(
        async (roomId, updatedFields) => {
            setError(null);
            try {
                // 서비스 레이어 호출: PUT /rooms/:roomId/update
                const updatedRoom = await updateRoomInfo(roomId, updatedFields);

                // RoomContext의 gameroom을 즉시 갱신
                console.log("업데이트 방 정보:", updatedRoom);
                setRoom(updatedRoom);

                // 소켓으로 전체 목록 새로고침 요청
                socket.emit("request-room-list-refresh");

                return updatedRoom;
            } catch (err) {
                setError(err);
                throw err;
            }
        },
        [setRoom, socket]
    );

    return {
        rooms,
        loading,
        error,
        fetchAll,
        create,
        updateRoom
    };
}
