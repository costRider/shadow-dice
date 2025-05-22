import React, { createContext, useState, useEffect, useCallback } from 'react';
import apiClient from '@/services/apiClient'; // Fetch wrapper

export const UserContext = createContext({
  user: null,
  setUser: () => { },
  markDirty: () => { },
  flush: () => { },
});

export const UserProvider = ({ children }) => {
  const [user, _setUser] = useState(null);
  const [dirty, setDirty] = useState(false);

  // 1) 사용자 정보 변경 시 Dirty 표시
  const setUser = useCallback((newUser) => {
    _setUser(newUser);
    setDirty(true);
  }, []);

  // 2) 외부에서 Dirty만 표시하고 싶을 때
  const markDirty = useCallback(() => setDirty(true), []);

  // Helper: 서버에 user 업데이트
  const updateUser = useCallback(async (userData) => {
    if (!userData) return;
    try {
      await apiClient.put(`users/${userData.id}`, userData);
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  }, []);

  // 3) 주기적(15분) 또는 Dirty 시 반영
  useEffect(() => {
    if (!user) return;
    const intervalId = setInterval(() => {
      if (dirty) {
        updateUser(user);
        setDirty(false);
      }
    }, 1000 * 60 * 15);
    return () => clearInterval(intervalId);
  }, [user, dirty, updateUser]);

  // 4) flush: 즉시 반영
  const flush = useCallback(async () => {
    if (dirty && user) {
      await updateUser(user);
      setDirty(false);
    }
  }, [user, dirty, updateUser]);

  // 5) 언마운트 또는 브라우저 종료 시
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        // sendBeacon로 동기 요청
        const url = `${import.meta.env.VITE_API_URL}users/${user.id}/status`;
        const blob = new Blob([JSON.stringify({ status: 'OFFLINE' })], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      }
      // flush final state sync
      flush();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, flush]);

  return (
    <UserContext.Provider value={{ user, setUser, markDirty, flush }}>
      {children}
    </UserContext.Provider>
  );
};
// UserProvider는 사용자 정보를 관리하는 Context Provider입니다.