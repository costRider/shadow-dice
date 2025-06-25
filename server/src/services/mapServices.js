// services/mapService.js
import db from '../config/db.js'; // better-sqlite3 기반 db 인스턴스

export function getAllMaps() {
    const stmt = db.prepare("SELECT * FROM maps");
    return stmt.all();
}

export function getMapById(mapId) {
    const stmt = db.prepare("SELECT * FROM maps WHERE id = ?");
    return stmt.get(mapId);
}

export function getTilesByMapId(mapId) {
    const stmt = db.prepare("SELECT * FROM tiles WHERE map_id = ?");
    return stmt.all(mapId);
}


