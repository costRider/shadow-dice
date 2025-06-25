// routes/mapRoutes.js
import express from 'express';
import { getAllMaps, getMapById, getTilesByMapId } from "../services/mapServices.js";

const router = express.Router();

// 전체 맵 목록
router.get("/", async (req, res) => {
    try {
        const maps = await getAllMaps();
        res.json(maps);
    } catch (err) {
        console.error("[GET /maps]", err);
        res.status(500).json({ error: "서버 에러" });
    }
});

// 단일 맵 조회
router.get("/:id", async (req, res) => {
    const mapId = req.params.id;
    try {
        const map = await getMapById(mapId);
        if (!map) return res.status(404).json({ error: "맵 없음" });
        res.json(map);
    } catch (err) {
        console.error("[GET /maps/:id]", err);
        res.status(500).json({ error: "서버 에러" });
    }
});

// 해당 맵의 타일 목록
router.get("/:id/tiles", async (req, res) => {
    const mapId = req.params.id;
    try {
        const tiles = await getTilesByMapId(mapId);

        // directions가 문자열이면 JSON.parse 처리
        const parsedTiles = tiles.map(tile => ({
            ...tile,
            directions: tile.directions ? JSON.parse(tile.directions) : {}
        }));

        res.json(parsedTiles);
    } catch (err) {
        console.error("[GET /maps/:id/tiles]", err);
        res.status(500).json({ error: "서버 에러" });
    }
});

export default router;
