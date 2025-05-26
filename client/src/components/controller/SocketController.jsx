import React, { useContext, useEffect } from 'react';
import { UserContext } from '@/context/UserContext';
import { useSocket } from '@/hooks/useSocket';

export function SocketController({ children }) {
    const { user } = useContext(UserContext);
    const { isConnected, connect, disconnect } = useSocket();

    useEffect(() => {
        if (user && !isConnected) {
            // 로그인 성공한 직후 한 번만 연결
            connect();
        }
        if (!user && isConnected) {
            // 로그아웃 직후 한 번만 해제
            disconnect();
        }
    }, [user, isConnected, connect, disconnect]);

    return <>{children}</>;
}
