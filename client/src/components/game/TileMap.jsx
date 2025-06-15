// TileMap.jsx
export default function TileMap({ tiles }) {
    const getColorByType = (type) => {
        switch (type) {
            case "START": return "bg-green-600";
            case "SWORD": return "bg-red-600";
            case "CUP": return "bg-blue-500";
            case "WAND": return "bg-purple-500";
            case "DISK": return "bg-yellow-500";
            case "TREASURE": return "bg-orange-500";
            case "ABIL": return "bg-white-500";
            case "GOAL": return "bg-emerald-400";
            default: return "bg-gray-500";
        }
    };

    return (
        <div className="absolute top-0 left-0 w-full h-full">
            {tiles.map((tile) => (
                <div
                    key={tile.id}
                    className={`w-12 h-12 ${getColorByType(tile.type)} border border-black absolute rounded flex items-center justify-center text-white text-xs font-bold`}
                    style={{
                        left: `${tile.x}px`,
                        top: `${tile.y}px`,
                        zIndex: 0
                    }}
                >
                    {tile.id}
                </div>
            ))}
        </div>
    );
}
