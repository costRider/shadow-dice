// client/src/services/auth.js
import apiClient from './apiClient';

// 가입
export async function signupUser({ userId, password, nickname }) {
    const { ok, data } = await apiClient.post('auth/signup', { userId, password, nickname });
    if (!ok) throw new Error(data.message || '회원가입 실패');
    return data;
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
