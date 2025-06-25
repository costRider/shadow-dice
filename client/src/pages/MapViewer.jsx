useEffect(() => {
    const fetchMapData = async () => {
        const resMap = await fetch(`/api/maps/1`);
        const resTiles = await fetch(`/api/maps/1/tiles`);
        const mapData = await resMap.json();
        const tileData = await resTiles.json();

        setMap(mapData);
        setTiles(tileData);
    };

    fetchMapData();
}, []);


<div className="relative w-full h-full">
    {map?.image_path && (
        <img
            src={map.image_path}
            className="absolute inset-0 w-full h-full object-contain"
            alt="Map Background"
        />
    )}
    {tiles.map(tile => (
        <div
            key={tile.id}
            className="absolute w-10 h-10 bg-blue-500 text-white flex items-center justify-center"
            style={{
                left: tile.x,
                top: tile.y,
                transform: 'translate(-50%, -50%)',
            }}
        >
            {tile.id}
        </div>
    ))}
</div>
