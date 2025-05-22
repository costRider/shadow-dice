import React, { createContext, useState, useEffect, useCallback } from "react";
import { updateUser as apiUpdateUser } from "@/services";

export const UserContext = createContext({
  user: null,
  setUser: () => { },
  markDirty: () => { },
  flush: () => { },
});

export const UserProvider = ({ children }) => {
  const [user, _setUser] = useState(null);
  const [dirty, setDirty] = useState(false);

  // 1) user 변경
  const setUser = useCallback((newUser) => {
    _setUser(newUser);
    setDirty(true); // 변경 감지
  }, []);

  // 2) 외부에서 “더티 표시”만 할 때
  const markDirty = useCallback(() => setDirty(true), []);

  // 3) 15분마다, 혹은 dirty일 때 DB에 반영
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(
      async () => {
        if (dirty) {
          await apiUpdateUser(user);
          setDirty(false);
        }
      },
      1000 * 60 * 15,
    ); // 15분
    return () => clearInterval(interval);
  }, [user, dirty]);

  // 4) 게임 종료나 로그아웃 이벤트 시점에 즉시 반영
  const flush = useCallback(async () => {
    if (dirty && user) {
      await apiUpdateUser(user);
      setDirty(false);
    }
  }, [user, dirty]);

  // 5) 로그아웃 시점에 DB flush
  // (이펙트는 unmount 될 때 flush 해 줌)
  useEffect(() => {
    return () => {
      flush();
    };
  }, [flush]);

  return (
    <UserContext.Provider value={{ user, setUser, markDirty, flush }}>
      {children}
    </UserContext.Provider>
  );
};
