// src/components/game/ShufflingTile.jsx
import React, { useEffect, useState } from "react";
import tileTypeToImageMap from "@/components/game/tileImageMap";

const questionTypes = [
    "NORMAL", "BLESS", "CURSE", "TREASURE", "PLUS3", "PLUS4",
    "SPADE", "CLOVER", "TAX", "ABIL25", "ABIL",
    "DOA", "PRISON", "DISK", "WAND", "SWORD", "CUP"
];

export default function ShufflingTile({ tile, duration = 2000 }) {
    const [shuffledType, setShuffledType] = useState(() => {
        return questionTypes[Math.floor(Math.random() * questionTypes.length)];
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const newType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
            setShuffledType(newType);
        }, 100);

        const timeout = setTimeout(() => {
            clearInterval(interval);
        }, duration);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [duration]);

    const imgSrc = tileTypeToImageMap[shuffledType] || tileTypeToImageMap.DEFAULT;

    return (
        <img
            key={`shuffle-${tile.id}`}
            src={imgSrc}
            alt={shuffledType}
            className="absolute pointer-events-none z-10"
            style={{
                left: `${tile.x}px`,
                top: `${tile.y}px`,
                transform: "translate(-50%, -50%)",
            }}
        />
    );
}
