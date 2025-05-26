// useSocket.js
import { useState, useEffect, useRef } from 'react';
import socket from '@/socket/socket';

export function useSocket() {
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, []);

    const connect = () => {
        if (!socket.connected) socket.connect();
    };
    const disconnect = () => {
        if (socket.connected) socket.disconnect();
    };

    return { socket, isConnected, connect, disconnect };
}
