// src/pages/GamePage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAvatar } from "@/context/AvatarContext";
import GameBoard from "@/components/game/GameBoard";
import useGameEngine from "@/hooks/useGameEngine";
import useAuth from "@/hooks/useAuth";

const GamePage = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const initialRoom = location.state?.room;
    const [room, setRoom] = useState(initialRoom);
    const [showTurnBanner, setShowTurnBanner] = useState(true);

    const {
        tiles,
        map,
        players,
        cameraPos,
        currentTurnPlayerId,
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
    }, [currentTurnPlayerId]);

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
        toAvatarUrl,
    } = useAvatar();

    useEffect(() => {
        players.forEach((p) => loadAvatars(p.avatar_gender));
    }, [players, loadAvatars]);

    const half = Math.ceil(players.length / 2);
    const leftTeam = players.slice(0, half);
    const rightTeam = players.slice(half);

    const currentPlayer = players.find(p => p.id === currentTurnPlayerId);
    const isMyTurn = currentPlayer?.id === user?.id;

    const GameAvatar = ({ player, reverse = false }) => {
        const gender = player.avatar_gender;
        const baseMeta = (avatarsByGender[gender] || []).find(a => a.code === player.avatar_code) || {};
        const equipped = player.equippedItems || [];
        const layers = [];

        if (baseMeta.image_path) {
            layers.push({
                part_code: "BODY",
                url: toAvatarUrl(baseMeta.image_path),
                depth: partDepth["BODY"] || 0,
            });
        }

        Object.keys(partDepth).forEach(partCode => {
            if (partCode === "BODY" || partCode === "EXP") return;
            const equippedItem = equipped.find(e => e.part_code === partCode);
            const defItem = (baseMeta.defaultItems || []).find(d => d.part_code === partCode);
            const image_path = equippedItem?.image_path || defItem?.image_path;
            if (image_path) {
                layers.push({
                    part_code: partCode,
                    url: toAvatarUrl(image_path),
                    depth: partDepth[partCode],
                });
            }
        });

        const expUrl = getExpressionLayer(player.avatar_code, player.expression || "default", player.exp_number || 1, gender);
        if (expUrl) {
            layers.push({
                part_code: "EXP",
                url: expUrl,
                depth: Math.max(...Object.values(partDepth)) + 1,
            });
        }

        return (
            <div className="flex flex-col items-center">
                <div className="relative w-20 h-28">
                    {layers.map(layer => (
                        <img
                            key={layer.part_code}
                            src={layer.url}
                            alt={layer.part_code}
                            className={`absolute inset-0 w-full h-full object-contain ${reverse ? "scale-x-[-1]" : ""}`}
                            style={{ zIndex: layer.depth }}
                            draggable={false}
                        />
                    ))}
                </div>
                <div className="mt-1 text-white text-xs text-center">{player.nickname}</div>
            </div>
        );

    };


    return (
        <div className="flex flex-col h-screen w-screen bg-[rgba(0,0,40,0.8)]">
            <div className="flex" style={{ height: "75%" }}>
                <div className="w-[15%] border-r border-blue-600 bg-[rgba(10,10,40,0.6)] p-2 overflow-auto">
                    <h4 className="font-bold text-center text-yellow-300 mb-2">👥 좌파</h4>
                    {leftTeam.map((p) => (
                        <GameAvatar key={p.id} player={p} reverse />
                    ))}
                </div>
                <div className="w-[70%] flex flex-col border-x border-blue-600 bg-[rgba(10,10,40,0.6)]">
                    <div className="h-[10%] border-b border-blue-600 flex items-center justify-between px-6 bg-[rgba(20,20,80,0.7)]">
                        <div className="text-white text-lg font-semibold">
                            🗺️ {map?.name || "로딩 중..."}
                        </div>
                        <div className="text-yellow-300 text-md font-bold">
                            🎯 현재 턴: {players.find(p => p.id === currentTurnPlayerId)?.nickname || "대기 중"}
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
                        players={players}
                        tiles={tiles}
                        map={map}
                        cameraPos={cameraPos}
                        currentPlayer={currentPlayer}
                        isMyTurn={isMyTurn}
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
                    <h4 className="font-bold text-center text-yellow-300 mb-2">👥 우파</h4>
                    {rightTeam.map((p) => (
                        <GameAvatar key={p.id} player={p} />
                    ))}
                </div>
            </div>

            {/* 하단 25% - 미니맵, 채팅, 내 캐릭터 (기존 유지) */}
            {/* ... */}
        </div>
    );
};

export default GamePage;
