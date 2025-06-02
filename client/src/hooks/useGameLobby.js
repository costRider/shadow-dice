import { useState, useCallback } from 'react';
import { joinRoom, leaveRoom, readyRoom, startRoom } from '@/services/rooms';
import { updateUserStatus } from '@/services/user';
import { useRoom } from "@/context/RoomContext";

export default function useGameLobby() {

    const { setMyCharacters, setReady, } = useRoom();
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

    const ready = useCallback(async ({ roomId, userId, characterIds, isReady }) => {
        setError(null);
        try {
            const updated = await readyRoom(roomId, userId, characterIds, isReady);
            setReady(isReady);
            setMyCharacters(characterIds);
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
