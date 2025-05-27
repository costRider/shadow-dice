// client/src/hooks/useLobbyUsers.js
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/context/UserContext';
import { useSocket } from './useSocket';

export default function useLobbyUsers() {
    const { user, setLobbyUsers } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const { socket, isConnected, connect } = useSocket();

    useEffect(() => {
        /*//if (!user || !isConnected) return;
        if (!user) return;
        // 소켓 연결이 안 되어 있으면 연결 시도
        if (!isConnected) {
            console.log('Connecting to lobby socket...');
            connect();
            return;
        }*/

        if (!user || !isConnected) return;
        if (!socket) {
            console.error('소켓이 초기화되지 않았습니다.');
            return;
        }

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
