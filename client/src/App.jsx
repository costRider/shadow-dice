import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginScreen from './screens/LoginScreen';
import LobbyScreen from './screens/LobbyScreen';
import GameLobby from './screens/GameLobby';
import GameScreen from './screens/GameScreen';
import { UserProvider } from './context/UserContext';

function App() {
  
  
  return (
    <UserProvider>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<LoginScreen />} />
            <Route path="/lobby" element={<LobbyScreen />} />
            <Route path="/gamelobby" element={<GameLobby />} />
            <Route path="/game" element={<GameScreen />} />
          </Routes>
        </Router>
      </div>  
    </UserProvider>
  );
}

export default App;
