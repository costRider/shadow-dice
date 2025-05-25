// client/src/hooks/useLobbyUsers.js
// 소켓연결부터 로비 유저 목록을 가져오는 부분까지

// client/src/hooks/useAuth.js
import { useContext, useCallback, useState } from 'react';
import { UserContext } from '@/context/UserContext';
import { loginUser, signupUser, logoutUser } from '@/services/auth';
import socket from '@/socket/socket';

export default function useAuth() {
    const { user, setUser, flush } = useContext(UserContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const login = useCallback(async (userid, password) => {

        const res = await loginUser(userid, password);
        if (!res.success) {
            console.warn('❌ 로그인 실패:', res.error);
            return res;
        }

        //const user = res.user;
        console.log('로그인 성공:', res);
        setUser(res); // 1) 유저 먼저 저장
        console.log('유저 정보 저장됨:', res.user);
        // 2) 소켓 연결
        if (!socket.connected) {
            console.log('소켓 연결 시도 중...');
            socket.connect();
        } else {
            console.log('이미 소켓이 연결되어 있음');
        }

        socket.on('connect', () => {
            console.log('✅ 소켓 연결됨');
            socket.emit('enter-lobby', { success: true, user: res.user });
        });

        socket.on('connect_error', (err) => {
            console.error('❌ 소켓 연결 실패:', err.message);
        });

        return res;
    }, [setUser]);

    // 2) 서버로부터 전체 로비 유저 목록을 수신
    socket.on('lobby-users', (lobbyList) => {
        console.log('🔌 로비 유저 목록:', lobbyList);
        setUsers(lobbyList);
        setLoading(false);
    });

    const signup = useCallback(async (userid, password, nickname) => {
        const data = await signupUser(userid, password, nickname);
        if (!res.success) {
            console.warn('❌ 회원가입 실패');
            return res;
        }
        const user = res.user;

        setUser(user);
        return user;
    }, [setUser]);

    const logout = useCallback(async () => {
        try {

            await flush();
            await logoutUser();
            console.log('유저:', user);
            socket.emit('leave-lobby', user.user); // 로비에서 나가기
            console.log('로비에서 나감:', user.user);
            socket.disconnect(); // 소켓 연결 종료
            console.log('소켓 연결 종료됨');
            setUser(null);
        }
        catch (error) {
            console.error('로그아웃 실패:', error);
            return { ok: false, error };
        }
    }, [flush, setUser]);

    return { user, login, signup, logout, loading, setLoading, users, setUsers };
}

