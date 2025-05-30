import { useState, useEffect, useCallback } from 'react';
import { getRooms, createRoom } from '@/services/rooms';
import { useSocket } from './useSocket';

export default function useRooms() {
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
    }, [fetchAll]);

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

    return {
        rooms,
        loading,
        error,
        fetchAll,
        create,
    };
}
