// server/src/services/shopService.js
import db from '../config/db.js';

const RESOURCE_PREFIX = '/resources/';
/**
 * 판매 중인 상품 목록을 가져옵니다.
 * @param {'character'|'avatar_costume'} category
 */
export function listShopItems(category, userId) {
  if (!['character', 'avatar_costume'].includes(category)) {
    throw new Error('Invalid category');
  }

  const urlPrefix = category === 'avatar_costume'
    ? '/resources/avatar/'
    : '/resources/';

  const rows = db.prepare(`
    SELECT
      si.id,
      si.price,
      si.metadata,
      '${urlPrefix}' || si.thumbnail_path    AS thumbnailUrl,
      '${urlPrefix}' || si.preview_json_path AS previewJson,
      '${urlPrefix}' || si.preview_image_path AS previewImg,
      CASE
        WHEN si.category='character'
          AND EXISTS(
            SELECT 1 FROM users_characters uc
             WHERE uc.user_id      = ? 
               AND uc.character_id = si.target_id
          ) THEN 1
        WHEN si.category='avatar_costume'
          AND EXISTS(
            SELECT 1 FROM user_avatar_inventory ai
             WHERE ai.user_id = ?
               AND ai.item_id    = si.target_id   -- 수정된 부분
          ) THEN 1
        ELSE 0
      END AS owned
    FROM shop_items si
    WHERE si.category = ?
      AND si.active = 1
    ORDER BY si.created_at DESC
  `).all(userId, userId, category);
  return rows.map(r => ({
    ...r,
    metadata: JSON.parse(r.metadata || '{}'),
  }));
}

/**
 * 아이템을 구매 처리합니다.
 * @param {string} userId
 * @param {number} shopItemId
 */
export function purchaseItem(userId, shopItemId) {
  const now = new Date().toISOString();

  // 1) 상품 조회
  const item = db.prepare(`
    SELECT price, category, target_id
    FROM shop_items
    WHERE id = ? AND active = 1
  `).get(shopItemId);

  if (!item) {
    throw new Error('Invalid or inactive shop item');
  }

  // 2) 사용자 GP 조회
  const user = db.prepare(`
    SELECT gp
    FROM users
    WHERE id = ?
  `).get(userId);

  if (!user) {
    throw new Error('User not found');
  }
  if (user.gp < item.price) {
    throw new Error('Insufficient GP');
  }

  // 0) 이미 보유 중인지 검사
  const ownCheck = db.prepare(`
    SELECT 1
      FROM shop_items si
      WHERE si.id = ?
        AND (
          (si.category='character'
            AND EXISTS(
              SELECT 1 FROM users_characters uc
               WHERE uc.user_id=? AND uc.character_id=si.target_id
            )
          )
          OR
          (si.category='avatar_costume'
            AND EXISTS(
              SELECT 1 FROM user_avatar_inventory ai
               WHERE ai.user_id=? AND ai.item_id=si.target_id
            )
          )
        )
  `).get(shopItemId, userId, userId);
  if (ownCheck) {
    throw new Error('이미 보유 중');
  }


  // 3) 트랜잭션으로 구매 처리
  const txn = db.transaction(() => {
    // GP 차감
    db.prepare(`
      UPDATE users
      SET gp = gp - ?
      WHERE id = ?
    `).run(item.price, userId);

    // 구매 이력 기록
    const info = db.prepare(`
      INSERT INTO purchase_history
        (user_id, shop_item_id, price_at_purchase, purchased_at)
      VALUES (?, ?, ?, ?)
    `).run(userId, shopItemId, item.price, now);

    // GP 변경 로그
    db.prepare(`
      INSERT INTO gp_transaction_log
        (user_id, change_amount, reason, related_id, created_at)
      VALUES (?, ?, 'purchase', ?, ?)
    `).run(userId, -item.price, info.lastInsertRowid, now);

    // 인벤토리 업데이트
    if (item.category === 'character') {
      db.prepare(`
        INSERT INTO users_characters (user_id, character_id, obtained_at)
        VALUES (?, ?, ?)
      `).run(userId, item.target_id, now);
    } else {
      db.prepare(`
        INSERT INTO user_avatar_inventory
          (user_id, item_id, state, obtained_at, equipped)
        VALUES (?, ?, 'owned', ?, 0)
      `).run(userId, item.target_id, now);
    }
  });

  txn();

  return { success: true };
}
