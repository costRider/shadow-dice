// server/src/services/userService.js
import db from '../config/db.js'; // better-sqlite3 인스턴스

export async function getLobbyUsers() {
  const stmt = db.prepare(`
    SELECT id, nickname, avatar
    FROM users
    WHERE status = 'LOBBY'
  `);
  const users = stmt.all();
  return users;  // [{ id, nickname, avatar }, ...]
}


// 사용자의 status 업데이트 유틸
export async function updateUserStatus(userId, status) {
  const stmt = db.prepare(`
    UPDATE users
    SET status = ?
    WHERE id = ?
  `);
  stmt.run(status, userId);
}

