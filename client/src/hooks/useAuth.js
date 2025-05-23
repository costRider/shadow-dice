// client/src/hooks/useLobbyUsers.js
// 소켓연결부터 로비 유저 목록을 가져오는 부분까지
import { useContext, useCallback, useState } from 'react';
import { UserContext } from '@/context/UserContext';
import { loginUser, signupUser, logoutUser } from '@/services/auth';
import socket from '@/socket/socket';

export default function useAuth() {
    const { user, setUser, flush } = useContext(UserContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const login = useCallback(async (userid, password) => {
        const data = await loginUser(userid, password);
        // ✅ 로그인 성공 시 소켓 연결 및 로비 입장 이벤트 전송
        socket.connect();  // 소켓 연결 시작
        setUser(data);
        socket.emit('enter-lobby', data);
        return data;
    }, [setUser]);

    // 2) 서버로부터 전체 로비 유저 목록을 수신
    socket.on('lobby-users', (lobbyList) => {
        setUsers(lobbyList);
        setLoading(false);
    });

    const signup = useCallback(async (userid, password, nickname) => {
        const data = await signupUser(userid, password, nickname);
        setUser(data);
        return data;
    }, [setUser]);

    const logout = useCallback(async () => {
        try {
            socket.disconnect(); // 소켓 연결 종료
            await flush();
            await logoutUser();
            setUser(null);
        }
        catch (error) {
            console.error('로그아웃 실패:', error);
            return { ok: false, error };
        }
    }, [flush, setUser]);

    return { user, login, signup, logout, loading, setLoading, users, setUsers };
} 