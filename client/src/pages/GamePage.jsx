// src/pages/GamePage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAvatar } from "@/context/AvatarContext";
import GameBoard from "@/components/game/GameBoard";
import useGameEngine from "@/hooks/useGameEngine";

const GamePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const initialRoom = location.state?.room;
    const [room, setRoom] = useState(initialRoom);
    const [roomplayers, setRoomplayers] = useState(initialRoom?.players || []);
    const [showTurnBanner, setShowTurnBanner] = useState(true);

    const {
        tiles,
        map,
        players,
        cameraPos,
        currentTurn,
        dice,
        isMoving,
        isWaitingDirection,
        awaitingTaxRoll,
        awaitingAbilityRoll,
        awaitingDOARoll,
        jokerTempMap,
        questionTileMap,
        shufflingTileMap,
        handleRollDice,
        handleTaxRoll,
        handleAbilityDiceRoll,
        handleDOADiceRoll,
        availableDirections,
        mapAttribute,
        handleChooseDirection,
        gameEnded,
        gameRoom,
    } = useGameEngine(initialRoom);

    useEffect(() => {
        if (!gameRoom) return;
        setRoom(gameRoom);
        setRoomplayers(gameRoom.players || []);
    }, [gameRoom]);

    useEffect(() => {
        console.log("🚀 게임 시작 시 전달된 room 정보:", initialRoom);
    }, []);

    useEffect(() => {
        console.log("🧑‍🤝‍🧑 플레이어 목록 및 캐릭터:", players.map(p => ({
            id: p.id, nickname: p.nickname, characterIds: p.characterIds, team: p.team
        })));
    }, [players]);

    useEffect(() => {
        setShowTurnBanner(true);
    }, [currentTurn]);

    if (!initialRoom) {
        navigate("/lobby");
        return null;
    }

    const {
        partDepth,
        avatarsByGender,
        loadAvatars,
        getBodyLayer,
        getExpressionLayer,
    } = useAvatar();

    useEffect(() => {
        roomplayers.forEach((p) => loadAvatars(p.avatar_gender));
    }, [roomplayers, loadAvatars]);

    const half = Math.ceil(roomplayers.length / 2);
    const leftTeam = roomplayers.slice(0, half);
    const rightTeam = roomplayers.slice(half);

    const makeLayers = (p) => {
        const meta = (avatarsByGender[p.avatar_gender] || []).find(a => a.code === p.avatar_code) || {};
        const bodyLayer = getBodyLayer(meta);
        const defaultItems = meta.defaultItems || [];
        const expLayer = getExpressionLayer(p.avatar_code, "default", 1, p.avatar_gender);
        const raw = [bodyLayer, ...defaultItems, expLayer];
        const unique = Array.from(
            raw.reduce((m, l) => m.has(l.part_code) ? m : m.set(l.part_code, l), new Map()).values()
        );
        return unique.sort((a, b) => (partDepth[a.part_code] || 0) - (partDepth[b.part_code] || 0));
    };

    const CharacterCard = ({ player }) => {
        const layers = makeLayers(player);
        return (
            <div className="flex flex-col items-center mb-4">
                <div className="relative w-24 h-32 bg-gray-800 rounded overflow-hidden">
                    {layers.map(layer => (
                        <img
                            key={layer.id}
                            src={`/resources/avatar/${layer.image_path.replace(/\\/g, "/")}`}
                            alt={layer.part_code}
                            className="absolute inset-0 w-full h-full object-contain"
                            style={{ zIndex: partDepth[layer.part_code] || 0 }}
                            draggable={false}
                        />
                    ))}
                </div>
                <div className="mt-2 text-white text-sm">{player.nickname}</div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-[rgba(0,0,40,0.8)]">
            <div className="flex" style={{ height: "75%" }}>
                <div className="w-[15%] border-r border-blue-600 bg-[rgba(10,10,40,0.6)] p-2 overflow-auto">
                    <h4 className="font-bold text-center text-yellow-300 mb-2">👥 좌측 팀</h4>
                    {leftTeam.map(p => (
                        <CharacterCard key={p.id} player={p} />
                    ))}
                </div>
                <div className="w-[70%] flex flex-col border-x border-blue-600 bg-[rgba(10,10,40,0.6)]">
                    <div className="h-[10%] border-b border-blue-600 flex items-center justify-between px-6 bg-[rgba(20,20,80,0.7)]">
                        <div className="text-white text-lg font-semibold">
                            🗺️ {map?.name || "로딩 중..."}
                        </div>
                        <div className="text-yellow-300 text-md font-bold">
                            🎯 현재 턴: {players[currentTurn]?.nickname || "대기 중"}
                        </div>
                        <div className="text-green-300 text-md font-bold">
                            🧩 현재 속성: {mapAttribute || "NONE"}
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => navigate("/lobby")}
                                className="px-4 py-1 bg-gradient-to-b from-blue-500 to-blue-700 text-white rounded shadow hover:scale-105 transition"
                            >
                                나가기
                            </button>
                            <button
                                onClick={() => toast("⚙️ 설정 기능은 준비 중입니다!")}
                                className="px-4 py-1 bg-gradient-to-b from-gray-300 to-gray-400 text-black rounded shadow hover:scale-105 transition"
                            >
                                설정
                            </button>
                        </div>
                    </div>

                    <GameBoard
                        tiles={tiles}
                        players={players}
                        map={map}
                        cameraPos={cameraPos}
                        currentPlayer={players[currentTurn]}
                        dice={dice}
                        isMoving={isMoving}
                        isWaitingDirection={isWaitingDirection}
                        awaitingTaxRoll={awaitingTaxRoll}
                        awaitingAbilityRoll={awaitingAbilityRoll}
                        awaitingDOARoll={awaitingDOARoll}
                        jokerTempMap={jokerTempMap}
                        questionTileMap={questionTileMap}
                        shufflingTileMap={shufflingTileMap}
                        onRollDice={handleRollDice}
                        onTaxRoll={handleTaxRoll}
                        onAbilityDiceRoll={handleAbilityDiceRoll}
                        onDOADiceRoll={handleDOADiceRoll}
                        availableDirections={availableDirections}
                        onChooseDirection={handleChooseDirection}
                        gameEnded={gameEnded}
                        showTurnBanner={showTurnBanner}
                        setShowTurnBanner={setShowTurnBanner}
                    />
                </div>
                <div className="w-[15%] border-l border-blue-600 bg-[rgba(10,10,40,0.6)] p-2 overflow-auto">
                    <h4 className="font-bold text-center text-yellow-300 mb-2">👥 우측 팀</h4>
                    {rightTeam.map(p => (
                        <CharacterCard key={p.id} player={p} />
                    ))}
                </div>
            </div>

            {/* 하단 25% - 미니맵, 채팅, 내 캐릭터 (기존 유지) */}
            {/* ... */}
        </div>
    );
};

export default GamePage;
