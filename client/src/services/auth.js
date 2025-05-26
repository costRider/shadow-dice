// client/src/services/auth.js
import apiClient from './apiClient';

// 가입
export async function signupUser({ userId, password, nickname }) {
    // apiClient.post 내부에서 실패 시 toast()는 이미 띄워주므로,
    // 여기서는 OK/ERROR 여부를 그대로 돌려줍니다.
    const result = await apiClient.post(
        'auth/signup',
        { userId, password, nickname }
    );
    // result: { ok: boolean, data: any }
    return result;
}

// 로그인
export async function loginUser(userId, password) {
    const { ok, data } = await apiClient.post('auth/login', { userId, password });
    if (!ok) throw new Error(data.message || '로그인 실패');
    return data;
}

// 로그아웃
export async function logoutUser() {
    const { ok, data } = await apiClient.post('auth/logout');
    if (!ok) throw new Error(data.message || '로그아웃 실패');
    return data;
}
