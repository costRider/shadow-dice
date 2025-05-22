import { useState, useEffect, useCallback } from 'react';
import {
    getRooms,
    createRoom,
    joinRoom,
    readyRoom,
    startRoom,
    // optionally: leaveRoom
} from '@/services/rooms';

/**
 * useRooms 훅: 방 목록 조회 및 조작 로직을 관리합니다.
 */
export default function useRooms() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 방 목록 전체 조회
    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await getRooms();
            setRooms(list);
        } catch (err) {
            console.error('fetchAll rooms failed:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // 방 생성
    const create = useCallback(async (roomData) => {
        setError(null);
        try {
            const newRoom = await createRoom(roomData);
            setRooms(prev => [...prev, newRoom]);
            return newRoom;
        } catch (err) {
            console.error('createRoom failed:', err);
            setError(err);
            throw err;
        }
    }, []);

    // 방 입장
    const join = useCallback(async (roomId, userId) => {
        setError(null);
        try {
            const updatedRoom = await joinRoom(roomId, userId);
            setRooms(prev => prev.map(r => r.id === roomId ? updatedRoom : r));
            return updatedRoom;
        } catch (err) {
            console.error('joinRoom failed:', err);
            setError(err);
            throw err;
        }
    }, []);

    // 준비 상태 토글
    const ready = useCallback(async (roomId, userId, isReady) => {
        setError(null);
        try {
            const updatedRoom = await readyRoom(roomId, userId, isReady);
            setRooms(prev => prev.map(r => r.id === roomId ? updatedRoom : r));
            return updatedRoom;
        } catch (err) {
            console.error('readyRoom failed:', err);
            setError(err);
            throw err;
        }
    }, []);

    // 게임 시작 (호스트만)
    const start = useCallback(async (roomId) => {
        setError(null);
        try {
            const updatedRoom = await startRoom(roomId);
            setRooms(prev => prev.map(r => r.id === roomId ? updatedRoom : r));
            return updatedRoom;
        } catch (err) {
            console.error('startRoom failed:', err);
            setError(err);
            throw err;
        }
    }, []);

    // initial fetch
    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return {
        rooms,
        loading,
        error,
        fetchAll,
        create,
        join,
        ready,
        start,
        // leave: useCallback(async (roomId) => { /* ... */ }, []),
    };
}
