import { useState, useEffect } from 'react';
import socket from '@/socket/socket';

export function useSocket() {
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        // 연결/해제 이벤트
        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);

        // cleanup on unmount
        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
        };
    }, []);

    // 소켓 연결 함수
    const connect = () => {
        if (!socket.connected) {
            socket.connect();
        }
    };

    // 소켓 연결 해제 함수
    const disconnect = () => {
        if (socket.connected) {
            socket.disconnect();
        }
    };

    return {
        socket,
        isConnected,
        connect,
        disconnect,
    };
}
