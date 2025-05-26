import { useState, useEffect, useCallback } from 'react';
import {
    getRooms,
    createRoom,
    joinRoom,
    readyRoom,
    startRoom,
    leaveRoom,
    // optionally: leaveRoom
} from '@/services/rooms';
import { updateUserStatus } from '@/services/user';

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
            console.log('🧪 getRooms 결과:', list);
            console.log('🧪 isArray?', Array.isArray(list));
            setRooms(list);
        } catch (err) {
            console.error('fetchAll rooms failed:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // 방장 조회
    const fetchHost = useCallback(async (roomId) => {
        setError(null);
        try {
            const room = rooms.find(r => r.id === roomId);
            if (!room) throw new Error('방을 찾을 수 없습니다.');
            return room.host;
        } catch (err) {
            console.error('fetchHost failed:', err);
            setError(err);
            throw err;
        }
    }, [rooms]);

    // 방 생성
    const create = useCallback(async (roomData, user) => {
        setError(null);
        try {
            const newRoom = await createRoom(roomData);
            await updateUserStatus(user.id, 'IN_ROOM');
            setRooms(prev => [...prev, newRoom]);
            return newRoom;
        } catch (err) {
            console.error('createRoom failed:', err);
            setError(err);
            throw err;
        }
    }, []);

    // 방 입장
    const join = useCallback(async (roomId, user) => {
        setError(null);
        try {
            await updateUserStatus(user.id, 'IN_ROOM');
            const updatedRoom = await joinRoom(roomId, user.id);
            setRooms(prev => prev.map(r => r.id === roomId ? updatedRoom : r));
            return updatedRoom;
        } catch (err) {
            console.error('joinRoom failed:', err);
            setError(err);
            throw err;
        }
    }, []);

    // 방 나가기 (추가 필요)
    const leave = useCallback(async (roomId, user) => {
        setError(null);
        try {
            await leaveRoom(roomId, user.id);
            setRooms(prev => prev.filter(r => r.id !== roomId));
            return true;
        } catch (err) {
            console.error('leaveRoom failed:', err);
            setError(err);
            throw err;
        }
    }, []);

    // 준비 상태 토글
    const ready = useCallback(async (roomId, user, isReady) => {
        setError(null);
        try {
            const updatedRoom = await readyRoom(roomId, user.id, isReady);
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
        leave,
        // leave: useCallback(async (roomId) => { /* ... */ }, []),
    };
}
