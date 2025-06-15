// src/components/game/GamePage.jsx
import React, { useState, useEffect } from "react";
import TileMap from "./TileMap";
import PlayerPiece from "./PlayerPiece";
import DicePanel from "./DicePanel";
import { tiles } from "@/data/testTiles";

export default function GamePage({ initialPlayers }) {
    // 🎮 게임 상태 관련 state
    const [players, setPlayers] = useState(initialPlayers);
    const [currentTurn, setCurrentTurn] = useState(0);
    const [dice, setDice] = useState(null);
    const [isMoving, setIsMoving] = useState(false);
    const [cameraPos, setCameraPos] = useState({ x: tiles[0].x, y: tiles[0].y });
    const [isWaitingDirection, setIsWaitingDirection] = useState(false);
    const [availableDirections, setAvailableDirections] = useState(null);
    const [remainingSteps, setRemainingSteps] = useState(0);

    //START 타일 찾기
    const getStartTileId = () => {
        const startTile = tiles.find(t => t.type === "START");
        return startTile ? startTile.id : 0; // fallback to 0 if not found
    };

    // 🧭 특정 타일로 이동 + 카메라 이동 + 효과 로그 출력
    const moveTo = async (nextId) => {
        console.log("이동할 ID", nextId);
        const tile = tiles.find(t => t.id === nextId);
        if (!tile) return;

        setPlayers(prev => {
            const updated = [...prev];
            updated[currentTurn] = {
                ...updated[currentTurn],
                position: nextId
            };
            return updated;
        });

        setCameraPos({ x: tile.x, y: tile.y });

        console.log(`📍 이동 → Tile ${tile.id} [${tile.type}]`);

        switch (tile.type) {
            case "TREASURE":
                console.log("✨ 보물상자 도착: 아이템 획득 예정");
                break;
            case "GOAL":
                console.log("🏁 GOAL 도착: 게임 종료 조건 진입");
                break;
            case "CUP":
                console.log("🧠 컵 속성: 지력 보너스 효과 적용 예정");
                break;
            default:
                console.log("➖ 일반 타일 도착");
        }
    };

    // 🎲 주사위 수만큼 이동하는 재귀적 이동 함수
    const handleMoveStep = async (remainingSteps, currentId) => {
        const tile = tiles.find(t => t.id === currentId);
        const dirKeys = Object.keys(tile.directions || {});

        if (dirKeys.length > 1) {
            console.log("🛑 분기점 도착 → 방향 선택 대기");
            setIsWaitingDirection(true);
            setAvailableDirections(tile.directions);
            setRemainingSteps(remainingSteps);
            return;
        }

        if (dirKeys.length === 0) {
            console.log("🚫 이동 불가 → 턴 종료");
            setIsMoving(false);
            setCurrentTurn((prev) => (prev + 1) % players.length);
            return;
        }

        const nextId = tile.directions[dirKeys[0]];
        console.log("➡️ 다음 타일 ID:", nextId);

        await new Promise(res => setTimeout(res, 400));
        await moveTo(nextId);

        const nextStep = remainingSteps - 1;
        console.log(`📦 남은 스텝: ${nextStep}`);

        if (nextStep > 0) {
            setTimeout(() => handleMoveStep(nextStep, nextId), 400);
        } else {
            console.log("🔚 이동 종료 → 다음 턴으로");
            setIsMoving(false);
            setCurrentTurn((prevTurn) => (prevTurn + 1) % players.length);
        }
    };

    // 🎲 주사위 굴리기 시작
    const handleRollDice = async () => {
        if (isMoving || isWaitingDirection) return;
        const rolled = Math.floor(Math.random() * 6) + 1;
        console.log(`🎲 주사위 결과: ${rolled}`);

        setDice(rolled);
        setIsMoving(true);
        setRemainingSteps(rolled);

        handleMoveStep(rolled, players[currentTurn].position);
    };

    // ↪️ 분기점에서 사용자가 방향 선택
    const handleChooseDirection = async (dir) => {

        const tile = tiles.find(t => t.id === players[currentTurn].position);
        const nextId = tile.directions[dir];

        console.log(`🧭 선택 방향: ${dir} → 다음 ID: ${nextId}`);

        setIsWaitingDirection(false);
        setAvailableDirections(null);

        await new Promise(res => setTimeout(res, 400));
        await moveTo(nextId);

        const nextStep = remainingSteps - 1;
        setRemainingSteps(nextStep);
        console.log(`📦 분기 후 남은 스텝: ${nextStep}`);

        if (nextStep > 0) {
            setTimeout(() => handleMoveStep(nextStep, nextId), 400);
        } else {
            console.log("🔚 이동 종료 → 다음 턴으로");
            setIsMoving(false);
            setCurrentTurn((prevTurn) => (prevTurn + 1) % players.length);
        }
    };

    //GO 타일에서 시작
    useEffect(() => {
        const startId = getStartTileId();
        setPlayers(prev =>
            prev.map(p => ({ ...p, position: startId }))
        );
        setCameraPos({ x: tiles[startId].x, y: tiles[startId].y });
    }, []);

    // 📷 플레이어 기준으로 카메라 자동 이동
    useEffect(() => {
        const current = players[currentTurn];
        const tile = tiles.find(t => t.id === current.position);
        setCameraPos({ x: tile.x, y: tile.y });
    }, [players[currentTurn].position]);

    return (
        <div className="w-full h-screen bg-gray-600 relative overflow-hidden">
            {/* 전체 카메라 트래킹 wrapper */}
            <div
                className="absolute w-full h-full"
                style={{
                    transform: `translate(${-cameraPos.x + window.innerWidth / 2}px, ${-cameraPos.y + window.innerHeight / 2}px)`,
                    transition: 'transform 0.8s ease-out',
                }}
            >
                <TileMap tiles={tiles} />
                {players.map((player) => (
                    <PlayerPiece
                        key={player.id}
                        tile={tiles.find(t => t.id === player.position)}
                        nickname={player.nickname}
                    />
                ))}
            </div>

            <DicePanel
                onRoll={handleRollDice}
                diceValue={dice}
                currentPlayer={players[currentTurn]}
                disabled={isMoving || isWaitingDirection}
            />

            {/* 🔀 분기 선택 UI */}
            {isWaitingDirection && availableDirections && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-50">
                    {Object.entries(availableDirections).map(([dir, id]) => (
                        <button
                            key={dir}
                            onClick={() => handleChooseDirection(dir)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
                        >
                            {dir}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
