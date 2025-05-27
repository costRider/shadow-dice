// App.jsx or a layout component
import React, { useContext, useEffect } from 'react';
import { UserContext } from '@/context/UserContext';
import { useSocket } from '@/hooks/useSocket';

export function SocketController({ children }) {
    const { user } = useContext(UserContext);
    const { isConnected, connect, disconnect } = useSocket();


    useEffect(() => {

        if (user && !isConnected) {
            // 로그인 성공 후 단 1회만 connect()
            connect();
        } else if (!user && isConnected) {
            // 로그아웃 후 단 1회만 disconnect()
            disconnect();
        }
    }, [user, isConnected, connect, disconnect]);

    return <>{children}</>;
}
