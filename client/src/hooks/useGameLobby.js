import { useState, useCallback } from 'react';
import { joinRoom, leaveRoom, readyRoom, startRoom } from '@/services/rooms';
import { updateUserStatus } from '@/services/user';

export default function useGameLobby() {

    const [error, setError] = useState(null);

    const join = useCallback(async (roomId) => {
        setError(null);
        try {
            await updateUserStatus('IN_ROOM');
            const updated = await joinRoom(roomId);
            return updated;
        } catch (err) {
            setError(err);
            throw err;
        }
    }, []);

    const leave = useCallback(async (roomId) => {
        setError(null);
        try {
            await leaveRoom(roomId);
            await updateUserStatus('LOBBY');
            return true;
        } catch (err) {
            setError(err);
            throw err;
        }
    }, []);

    const ready = useCallback(async (roomId, isReady) => {
        setError(null);
        try {
            const updated = await readyRoom(roomId, isReady);
            return updated;
        } catch (err) {
            setError(err);
            throw err;
        }
    }, []);

    const start = useCallback(async (roomId) => {
        setError(null);
        try {
            const updated = await startRoom(roomId);
            return updated;
        } catch (err) {
            setError(err);
            throw err;
        }
    }, []);

    return {
        join,
        leave,
        ready,
        start,
    }

}
