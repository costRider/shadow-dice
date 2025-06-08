// src/services/character-services.js
import db from "../config/db.js";

export function getCharacterResources(characterCode) {
    return db.prepare(`
    SELECT
      resource_type,
      file_path,
      meta_file_path
    FROM character_resources
    WHERE character_id = ?
  `).all(characterCode);
}
