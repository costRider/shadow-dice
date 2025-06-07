import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Context & Hooks
import { AvatarProvider } from "@/context/AvatarContext";
import { UserProvider } from '@/context/UserContext';
import { ToastProvider } from '@/context/ToastContext';
import { SocketController } from '@/components/controller/SocketController';
import { RoomProvider } from '@/context/RoomContext';

// Pages
import LoginPage from '@/pages/LoginPage';
import LobbyPage from '@/pages/LobbyPage';
import GameLobby from '@/pages/GameLobbyPage';
import GamePage from '@/pages/GamePage';
// Components

export default function App() {

  return (
    <AvatarProvider>
      <UserProvider>
        <SocketController>
          <ToastProvider>
            <BrowserRouter>
              <RoomProvider>
                <Routes>
                  <Route path="/" element={<LoginPage />} />
                  <Route path="/lobby" element={<LobbyPage />} />
                  <Route path="/gamelobby" element={<GameLobby />} />
                  <Route path="/game" element={<GamePage />} />
                  {/* 추가적인 라우트가 필요하면 여기에 작성 */}
                </Routes>
              </RoomProvider>
            </BrowserRouter>
          </ToastProvider>
        </SocketController>
      </UserProvider>
    </AvatarProvider>
  );
}


