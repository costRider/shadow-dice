// client/src/hooks/useAuth.js
import { useContext, useCallback } from 'react';
import { UserContext } from '@/context/UserContext';
import { loginUser, signupUser, logoutUser } from '@/services/auth';

export default function useAuth() {
    const { user, setUser, flush } = useContext(UserContext);

    const login = useCallback(async (userid, password) => {
        const data = await loginUser(userid, password);
        setUser(data);
        return data;
    }, [setUser]);

    const signup = useCallback(async (userid, password, nickname) => {
        const data = await signupUser(userid, password, nickname);
        setUser(data);
        return data;
    }, [setUser]);

    const logout = useCallback(async () => {
        await flush();
        await logoutUser();
        setUser(null);
    }, [flush, setUser]);

    return { user, login, signup, logout };
}
