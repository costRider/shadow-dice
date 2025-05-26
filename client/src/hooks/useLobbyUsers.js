// client/src/hooks/useLobbyUsers.js
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/context/UserContext';
import { useSocket } from './useSocket';

export default function useLobbyUsers() {
    const { user, setLobbyUsers } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!user || !isConnected) return;

        // 서버에 입장 요청
        socket.emit('enter-lobby', { user });

        // 목록 수신
        const handler = (list) => {
            setLobbyUsers(list);
            setLoading(false);
        };
        socket.on('lobby-users', handler);

        return () => {
            // 나갈 때
            socket.emit('leave-lobby', { user });
            socket.off('lobby-users', handler);
            setLoading(true);
        };
    }, [user, isConnected, socket, setLobbyUsers]);

    return { loading };
}
