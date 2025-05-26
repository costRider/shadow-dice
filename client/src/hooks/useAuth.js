// This file is part of the client-side authentication logic.
// client/src/hooks/useAuth.js
import { useContext, useCallback } from 'react';
import { UserContext } from '@/context/UserContext';
import { loginUser, signupUser, logoutUser } from '@/services/auth';
import { toast } from '@/context/ToastContext';

export default function useAuth() {
    const { user, setUser, flush } = useContext(UserContext);

    const login = useCallback(async (userid, password) => {

        const res = await loginUser(userid, password);
        if (!res.success) {
            toast(data.message || '❌ 로그인 실패');
            return res;
        }
        console.log('로그인 성공:', res);
        const u = res.user;
        setUser(u); // 1) 유저 먼저 저장
        console.log('유저 정보 저장됨:', u);
        return { success: true, user: u };
    }, [setUser]);



    // 회원 가입 
    const signup = useCallback(async ({ userId, password, nickname }) => {
        /*try {
            const res = await signupUser({ userId, password, nickname });
            return { success: true };
        } catch (error) {
            return { success: false, error };
        }
    }, []);*/
        const { ok, data } = await signupUser({ userId, password, nickname });
        // HTTP 레벨 실패 (ok === false)는 네트워크/서버 오류
        /*
        if (!ok) {
            toast(data.message || '서버 통신 오류: 회원가입 실패');
            return { success: false, error: data.message };
        }*/

        // API 레벨 로직 실패 (data.success === false)
        if (!data.success) {
            // data.error: 'DUPLICATE_ID' 등f
            return { success: false, error: data.error };
        }
        // 회원가입 성공
        return { success: true };
    },
        [toast]
    );


    const logout = useCallback(async () => {
        try {
            await flush();
            await logoutUser();
            console.log('로그 아웃 유저:', user);
            setUser(null);
        }
        catch (error) {
            toast('로그아웃 실패:', error);
            return { ok: false, error };
        }
    }, [flush, setUser]);

    return { signup, user, login, logout };

}
