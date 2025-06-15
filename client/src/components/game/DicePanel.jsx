// src/components/game/DicePanel.jsx
import React from "react";

export default function DicePanel({ onRoll, diceValue, currentPlayer, disabled }) {
    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center">
            <p className="mb-2 text-lg font-semibold">
                🎯 현재 턴: <span className="text-yellow-400">{currentPlayer.nickname}</span>
            </p>
            <button
                onClick={onRoll}
                disabled={disabled}
                className={`bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50`}
            >
                🎲 주사위 굴리기
            </button>
            {diceValue && <p className="mt-2 text-lg">주사위 결과: {diceValue}</p>}
        </div>
    );
}
