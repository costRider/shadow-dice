import db from "../config/db.js";// 혹은 실제 DB 모듈 경로

/**
 * userId가 오늘분 보상을 안 받았다면 +100GP, lastDailyReward를 오늘 날짜로 업데이트
 * @returns {boolean} 보상을 지급했으면 true, 아니면 false
 */
export function grantDailyGP(userId) {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();

  // 1) 이미 오늘 지급받았으면 종료
  const row = db.prepare(`
    SELECT lastDailyReward
      FROM users
     WHERE id = ?
  `).get(userId);
  if (!row || row.lastDailyReward === today) return false;

  // 2) 트랜잭션 블록
  const txn = db.transaction(() => {
    db.prepare(`
      UPDATE users
         SET gp = gp + 100,
             lastDailyReward = ?
       WHERE id = ?
    `).run(today, userId);

    db.prepare(`
      INSERT INTO gp_transaction_log
        (user_id, change_amount, reason, related_id, created_at)
      VALUES (?, ?, 'login_reward', NULL, ?)
    `).run(userId, 100, now);
  });

  txn();  // 커밋
  return true;
}