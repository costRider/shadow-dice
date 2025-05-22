// client/src/services/apiClient.js
const BASE = import.meta.env.VITE_API_URL;
export default {
    post: async (path, payload) => {
        const res = await fetch(`${BASE}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include', // 쿠키 사용 시
        });
        const data = await res.json();
        return { ok: res.ok, data };
    },
    // get, put, delete 등도 유사하게 추가
    get: async (path) => {
        const res = await fetch(`${BASE}${path}`, {
            method: 'GET',
            credentials: 'include', // 쿠키 사용 시
        });
        const data = await res.json();
        return { ok: res.ok, data };
    },
    put: async (path, payload) => {
        const res = await fetch(`${BASE}${path}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include', // 쿠키 사용 시
        });
        const data = await res.json();
        return { ok: res.ok, data };
    },
    delete: async (path) => {
        const res = await fetch(`${BASE}${path}`, {
            method: 'DELETE',
            credentials: 'include', // 쿠키 사용 시
        });
        const data = await res.json();
        return { ok: res.ok, data };
    },
};
// 이 파일은 API 요청을 처리하는 클라이언트 모듈입니다.
// API 요청을 보내고 응답을 처리하는 기능을 제공합니다.
// fetch API를 사용하여 HTTP 요청을 보내고, 응답을 JSON 형식으로 파싱합니다.