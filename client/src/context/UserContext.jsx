import React, { createContext, useState, useEffect, useCallback } from 'react';

export const UserContext = createContext({
  user: null,
  setUser: () => { },
  lobbyUsers: [],
  setLobbyUsers: () => { },
});

export const UserProvider = ({ children }) => {
  const [user, _setUser] = useState(null);
  const [lobbyUsers, setLobbyUsers] = useState([]);

  const setUser = useCallback((newUser) => {
    _setUser(newUser);
  }, []);

  // 브라우저 종료 시 OFFLINE 전송
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        const url = `${import.meta.env.VITE_API_URL}/users/${user.id}/status`;
        const blob = new Blob(
          [JSON.stringify({ status: 'OFFLINE' })],
          { type: 'application/json' }
        );
        navigator.sendBeacon(url, blob);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user]);

  return (
    <UserContext.Provider
      value={{ user, setUser, lobbyUsers, setLobbyUsers }}
    >
      {children}
    </UserContext.Provider>
  );
};

