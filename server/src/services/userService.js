import db from "../config/db.js";// 혹은 실제 DB 모듈 경로

/**
 * userId가 오늘분 보상을 안 받았다면 +100GP, lastDailyReward를 오늘 날짜로 업데이트
 * @returns {boolean} 보상을 지급했으면 true, 아니면 false
 */
export function grantDailyGP(userId) {
  // 서버 시간 기준 “오늘” 날짜 (YYYY-MM-DD)
  const today = new Date().toISOString().slice(0, 10);

  // 1) 해당 유저의 lastDailyReward 조회
  const row = db.prepare(`
    SELECT gp, lastDailyReward
      FROM users
     WHERE id = ?
  `).get(userId);

  if (!row) return false;

  // 2) 이미 오늘 지급받았으면 아무 일도 안 함
  if (row.lastDailyReward === today) {
    return false;
  }

  // 3) 아직 지급받지 않았다면 GP +100, lastDailyReward를 오늘로 갱신
  db.prepare(`
    UPDATE users
       SET gp = gp + 100,
           lastDailyReward = ?
     WHERE id = ?
  `).run(today, userId);

  return true;
}
