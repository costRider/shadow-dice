// src/components/game/GameBoard.jsx
import React from "react";
import TileMap from "./TileMap";
import PlayerPiece from "./PlayerPiece";
import DicePanel from "./DicePanel";
import BattleModal from "./battle/BattleModal";

export default function GameBoard({
    tiles,
    map,
    players,
    cameraPos,
    currentPlayer,
    dice,
    isMoving,
    isWaitingDirection,
    awaitingTaxRoll,
    awaitingAbilityRoll,
    awaitingDOARoll,
    jokerTempMap,
    questionTileMap,
    shufflingTileMap,
    onRollDice,
    onTaxRoll,
    onAbilityDiceRoll,
    onDOADiceRoll,
    availableDirections,
    onChooseDirection,
    gameEnded,
}) {
    return (
        <div
            className="w-full h-screen relative overflow-hidden bg-[url('/resources/bg/gameBackground.png')] bg-repeat"
            style={{ backgroundSize: "1024px 1024px" }}
        >
            {/* 맵 영역 */}
            <div
                className="absolute"
                style={{
                    width: map?.width || "1600px",
                    height: map?.height || "900px",
                    transform: `translate(${-cameraPos.x + window.innerWidth / 2}px, ${-cameraPos.y + window.innerHeight / 2}px)`,
                    transition: "transform 0.8s ease-out",
                }}
            >
                <TileMap
                    tiles={tiles}
                    jokerTempMap={jokerTempMap}
                    questionTileMap={questionTileMap}
                    shufflingTileMap={shufflingTileMap}
                />
                {players.map((p) => (
                    <PlayerPiece key={p.id} tile={tiles.find(t => t.id === p.position)} nickname={p.nickname} />
                ))}
            </div>

            {showTurnBanner && (
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-3xl font-bold z-50 bg-black bg-opacity-60 px-6 py-3 rounded shadow"
                    onClick={() => setShowTurnBanner(false)}
                >
                    🎯 {players[currentTurn]?.nickname} 님의 턴입니다!
                </div>
            )}

            {/* 주사위 UI */}
            <DicePanel
                onRoll={onRollDice}
                diceValue={dice}
                currentPlayer={currentPlayer}
                disabled={isMoving || isWaitingDirection || awaitingTaxRoll || awaitingAbilityRoll}
            />

            {/* 전투 모달 */}
            <BattleModal />

            {/* 세금 주사위 모달 */}
            {awaitingTaxRoll && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg text-center">
                        <p className="mb-4 text-xl font-bold">세금 주사위를 굴려주세요!</p>
                        <button onClick={onTaxRoll} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded font-bold">
                            🎲 주사위 굴리기
                        </button>
                    </div>
                </div>
            )}

            {/* 어빌리티 주사위 모달 */}
            {awaitingAbilityRoll && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg text-center">
                        <p className="mb-4 text-xl font-bold">어빌리티 주사위를 굴려주세요!</p>
                        <button onClick={onAbilityDiceRoll} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded font-bold">
                            🎲 주사위 굴리기
                        </button>
                    </div>
                </div>
            )}

            {/* DOA 주사위 모달 */}
            {awaitingDOARoll && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg text-center">
                        <p className="mb-4 text-xl font-bold">DOA 주사위를 굴려주세요!</p>
                        <button onClick={onDOADiceRoll} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-bold">
                            🎲 주사위 굴리기
                        </button>
                    </div>
                </div>
            )}

            {/* 분기 선택 UI */}
            {isWaitingDirection && availableDirections && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-50">
                    {Object.entries(availableDirections).map(([dir]) => (
                        <button
                            key={dir}
                            onClick={() => onChooseDirection(dir)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
                        >
                            {dir}
                        </button>
                    ))}
                </div>
            )}

            {/* 게임 종료 화면 */}
            {gameEnded && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="text-white text-4xl font-bold">🎊 게임 종료!</div>
                </div>
            )}
        </div>
    );
}
