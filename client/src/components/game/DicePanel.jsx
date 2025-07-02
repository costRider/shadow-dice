// src/components/game/DicePanel.jsx
import React from "react";

export default function DicePanel({ onRoll, diceValue, currentPlayer, isMyTurn, disabled }) {
    if (!currentPlayer) return null;

    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center z-50">
            <p className="mb-2 text-lg font-semibold">
                🎯 현재 턴: <span className="text-yellow-400">{currentPlayer.nickname}</span>
            </p>

            {isMyTurn ? (
                <button
                    onClick={onRoll}
                    disabled={disabled}
                    className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    🎲 주사위 굴리기
                </button>
            ) : (
                <p className="text-sm text-gray-300 italic">다른 플레이어의 턴입니다. 잠시만 기다려 주세요...</p>
            )}

            {diceValue != null && (
                <p className="mt-2 text-lg text-green-300">🎲 주사위 결과: {diceValue}</p>
            )}
        </div>
    );
}