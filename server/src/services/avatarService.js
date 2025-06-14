import db from '../config/db.js';

export function getUserAvatarInventory(userId) {
    const stmt = db.prepare(`
        SELECT i.id AS item_id, i.part_code, i.description, i.image_path,
               inv.equipped
        FROM user_avatar_inventory inv
        JOIN avatar_items i ON inv.item_id = i.id
        WHERE inv.user_id = ? AND inv.state = 'owned'
        ORDER BY i.part_code, i.id
    `);
    return stmt.all(userId); // ✅ 여기서 실행
}

export function getUserEquippedItems(userId) {
    const stmt = db.prepare(`
        SELECT part_code, item_id
        FROM user_avatar_equips
        WHERE user_id = ?
    `);
    const rows = stmt.all(userId);

    const equips = {};
    for (const row of rows) {
        equips[row.part_code] = row.item_id;
    }
    return equips;
}

export function equipAvatarItem(userId, partCode, itemId) {
    const stmt = db.prepare(`
        INSERT INTO user_avatar_equips (user_id, part_code, item_id, updated_at)
        VALUES (?, ?, ?, datetime('now'))
        ON CONFLICT(user_id, part_code) DO UPDATE
        SET item_id = excluded.item_id,
            updated_at = datetime('now')
    `);
    return stmt.run(userId, partCode, itemId); // ✅ 수정
}

export function unequipAvatarItem(userId, partCode) {
    const stmt = db.prepare(`
        DELETE FROM user_avatar_equips
        WHERE user_id = ? AND part_code = ?
    `);
    return stmt.run(userId, partCode); // ✅ 수정
}
