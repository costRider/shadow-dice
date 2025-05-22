// client/src/hooks/useLobbyUsers.js
import { useState, useEffect, useCallback } from 'react';
import { getLobbyUsers } from '@/services/user';

export default function useLobbyUsers(intervalMs = 5000) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchLobbyUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await getLobbyUsers();
            setUsers(list);
        } catch (err) {
            console.error('getLobbyUsers failed:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLobbyUsers();
        const timer = setInterval(fetchLobbyUsers, intervalMs);
        return () => clearInterval(timer);
    }, [fetchLobbyUsers, intervalMs]);

    return { users, loading, error, refresh: fetchLobbyUsers };
}
