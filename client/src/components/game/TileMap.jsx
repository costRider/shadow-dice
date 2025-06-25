import React from "react";
import tileTypeToImageMap from "@/components/game/tileImageMap";
import ShufflingTile from "@/components/game/ShufflingTile";

export default function TileMap({
    tiles,
    jokerTempMap = {},
    questionTileMap = {},
    shufflingTileMap = {},
}) {
    return (
        <>
            {tiles.map((tile) => {
                const id = tile.id;

                // ✅ 셔플 중인 타일이면 별도 컴포넌트 사용
                if (shufflingTileMap[id]) {
                    return <ShufflingTile key={`shuffle-${id}`} tile={tile} />;
                }

                const tempType = jokerTempMap[id] || questionTileMap[id];
                const effectiveType = tempType || tile.type;
                const imgSrc = tileTypeToImageMap[effectiveType] || tileTypeToImageMap.DEFAULT;

                return (
                    <img
                        key={id}
                        src={imgSrc}
                        alt={effectiveType}
                        className="absolute pointer-events-none z-10"
                        style={{
                            left: `${tile.x}px`,
                            top: `${tile.y}px`,
                            transform: "translate(-50%, -50%)",
                        }}
                    />
                );
            })}
        </>
    );
}
