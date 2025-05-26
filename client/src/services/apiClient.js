// client/src/services/apiClient.js
import { toast } from '@/context/ToastContext';

const BASE = import.meta.env.VITE_API_URL;

async function handleResponse(res) {
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); }
    catch { /* not JSON, ignore */ }

    if (!res.ok) {
        // 1) 서버가 내려준 data.message 우선
        let msg = data?.message;
        console.error('API Error:', res.status, msg || text);
        // 2) data.message가 없으면 status 코드별 커스텀 메시지
        if (!msg) {
            if (res.status === 404) msg = '요청하신 리소스를 찾을 수 없습니다.';
            else if (res.status === 401) msg = '권한이 없습니다. 로그인 상태를 확인하세요.';
            else msg = `서버 오류 (${res.status})`;
        }
        // 3) 토스트로 알림
        toast(msg);
    }

    return { ok: res.ok, data };
}

export default {
    post: async (path, payload) => {
        const res = await fetch(`${BASE}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include',
        });
        return handleResponse(res);
    },
    get: async (path) => {
        const res = await fetch(`${BASE}${path}`, {
            method: 'GET',
            credentials: 'include',
        });
        return handleResponse(res);
    },
    put: async (path, payload) => {
        const res = await fetch(`${BASE}${path}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include',
        });
        return handleResponse(res);
    },
    delete: async (path) => {
        const res = await fetch(`${BASE}${path}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        return handleResponse(res);
    },
};
