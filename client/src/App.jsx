import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Context & Hooks
import usePageBgm from '@/hooks/usePageBgm';
import unlockAudio from '@/utils/unlockAudio';
import { AvatarProvider } from "@/context/AvatarContext";
import { UserProvider } from '@/context/UserContext';
import { ToastProvider } from '@/context/ToastContext';
import { SocketController } from '@/components/controller/SocketController';
import { RoomProvider } from '@/context/RoomContext';
import { BgmProvider } from '@/context/BgmContext';

// Pages
import LoginPage from '@/pages/LoginPage';
import LobbyPage from '@/pages/LobbyPage';
import GameLobby from '@/pages/GameLobbyPage';
import GamePage from '@/pages/GamePage';

// Components
import PageBgmController from '@/components/PageBgmController';

function AppContent() {
  usePageBgm(); // ✅ Router 내부에서 호출됨
  // AppContent or App.jsx 내부
  useEffect(() => {
    const handler = () => {
      unlockAudio();
      window.removeEventListener('click', handler);
    };
    window.addEventListener('click', handler, { once: true });
  }, []);


  return (
    <>
      <BgmProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/gamelobby" element={<GameLobby />} />
          <Route path="/game" element={<GamePage />} />
        </Routes>
        <PageBgmController />
      </BgmProvider>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AvatarProvider>
          <ToastProvider>
            <SocketController>
              <RoomProvider>
                <AppContent /> {/* ✅ Router 내부에서 렌더링 */}
              </RoomProvider>
            </SocketController>
          </ToastProvider>
        </AvatarProvider>
      </UserProvider>
    </BrowserRouter>
  );
}
