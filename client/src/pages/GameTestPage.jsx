// src/pages/GameTestPage.jsx
import React from "react";
import GamePage from "@/components/game/GamePage";
//import GamePage from "./GamePage";

export default function GameTestPage() {
    // 테스트용 더미 유저 목록
    const dummyPlayers = [
        { id: "p1", nickname: "Nova", position: 0 },
        { id: "p2", nickname: "TestPlayer", position: 0 }
    ];

    return (
        <GamePage
            initialPlayers={dummyPlayers}
            testMode={true}
        />
    );
}
