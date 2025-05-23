import React, { createContext, useState, useEffect, useCallback } from 'react';
import apiClient from '@/services/apiClient'; // Fetch wrapper

export const UserContext = createContext({
  user: null,
  setUser: () => { },
  markDirty: () => { },
  flush: () => { },
  lobbyUsers: [],
  setLobbyUsers: () => { },
});

export const UserProvider = ({ children }) => {
  const [user, _setUser] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [lobbyUsers, setLobbyUsers] = useState([]);

  // 1) 사용자 정보 변경 시 Dirty 표시
  const setUser = useCallback((newUser) => {
    _setUser(newUser);
    setDirty(true);
  }, []);

  // 2) 외부에서 Dirty만 표시하고 싶을 때
  const markDirty = useCallback(() => setDirty(true), []);

  // Helper: 서버에 user 업데이트
  const updateUser = useCallback(async (userData) => {
    if (!userData || !userData.id) return;
    try {
      await apiClient.put(`users/${userData.id}`, userData);
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  }, []);

  // 3) Dirty 시 즉시 반영 (이벤트 기반)
  useEffect(() => {
    if (dirty && user) {
      updateUser(user);
      setDirty(false);
    }
  }, [dirty, user, updateUser]);

  // 4) flush: 외부에서 강제 동기화
  const flush = useCallback(async () => {
    if (dirty && user) {
      await updateUser(user);
      setDirty(false);
    }
  }, [dirty, user, updateUser]);

  // 5) 언마운트 또는 브라우저 종료 시 최종 상태 전송
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        const url = `${import.meta.env.VITE_API_URL}/users/${user.id}/status`;
        const blob = new Blob(
          [JSON.stringify({ status: 'OFFLINE' })],
          { type: 'application/json' }
        );
        navigator.sendBeacon(url, blob);
        flush();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, flush]);

  return (
    <UserContext.Provider
      value={{ user, setUser, markDirty, flush, lobbyUsers, setLobbyUsers }}
    >
      {children}
    </UserContext.Provider>
  );
};
