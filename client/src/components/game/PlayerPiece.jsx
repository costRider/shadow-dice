// src/components/game/PlayerPiece.jsx
import React from "react";

export default function PlayerPiece({ tile, nickname }) {
    const size = 20;

    return (
        <div
            className="absolute transition-transform duration-800 ease-linear z-50"
            style={{
                transform: `translate(${tile.x}px, ${tile.y}px)`,
                width: size,
                height: size,
                marginLeft: -size / 4,
                marginTop: -size / 4,
            }}
        >
            <div className="w-full h-full bg-yellow-400 rounded-full text-black text-xs font-bold flex items-center justify-center shadow">
                {nickname?.[0]?.toUpperCase() || "?"}
            </div>
        </div>
    );
}
