import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import LobbyPage from "./pages/LobbyPage";
import GameLobbyPage from "./pages/GameLobbyPage";
import GamePage from "./pages/GamePage";
import { UserProvider } from "./context/UserContext";

function App() {
  return (
    <UserProvider>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/lobby" element={<LobbyPage />} />
            <Route path="/gamelobby" element={<GameLobbyPage />} />
            <Route path="/game" element={<GamePage />} />
          </Routes>
        </Router>
      </div>
    </UserProvider>
  );
}

export default App;
