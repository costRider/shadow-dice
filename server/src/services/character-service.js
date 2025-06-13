import db from '../config/db.js';

const RES_PREFIX = '/resources/';

/**
 * 단일 sprite_atlas 리소스 하나를 가져옵니다.
 * @param {string} characterCode
 * @returns {{ jsonUrl: string, imageUrl: string }|null}
 */
export function fetchCharacterSprite(characterCode) {
  const row = db.prepare(`
    SELECT meta_file_path, file_path
      FROM character_resources
     WHERE character_id   = ?
       AND resource_type  = 'sprite_atlas'
       AND meta_file_path IS NOT NULL
       AND file_path      IS NOT NULL
     LIMIT 1
  `).get(characterCode);

  if (!row) return null;

  return {
    jsonUrl: RES_PREFIX + row.meta_file_path,
    imageUrl: RES_PREFIX + row.file_path,
  };
}


/**
 * 해당 캐릭터의 모든 리소스를 리턴합니다.
 * @param {string} characterCode
 * @returns {Array<{ type: string, jsonUrl: string|null, imageUrl: string|null }>}
 */
export function listCharacterResources(characterCode) {
  const rows = db.prepare(`
    SELECT resource_type, meta_file_path, file_path
      FROM character_resources
     WHERE character_id = ?
  `).all(characterCode);

  return rows.map(r => ({
    type: r.resource_type,
    jsonUrl: r.meta_file_path ? RES_PREFIX + r.meta_file_path : null,
    imageUrl: r.file_path ? RES_PREFIX + r.file_path : null,
  }));
}
