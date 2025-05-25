import db from '../config/db.js'; // better-sqlite3 인스턴스

// [1] 로비 접속자 목록 조회
export async function getLobbyUsers() {
  const stmt = db.prepare(`
    SELECT id, nickname, avatar
    FROM users
    WHERE status = 'LOBBY'
  `);
  const users = stmt.all();

  // JSON 파싱 처리
  return users.map((u) => ({
    ...u,
    avatar: safeParseJson(u.avatar)
  }));
}

// [2] 유저 상태 업데이트 (LOBBY, OFFLINE 등)
export async function updateUserStatus(userId, status) {
  const stmt = db.prepare(`
    UPDATE users
    SET status = ?
    WHERE id = ?
  `);
  stmt.run(status, userId);
}

// [3] 전체 유저 정보 업데이트
export async function updateUser(userId, newUserData) {
  const oldUser = getUserById(userId);
  if (!oldUser) return null;

  const updated = {
    ...oldUser,
    ...newUserData,
    avatar: JSON.stringify(newUserData.avatar || oldUser.avatar),
    characters: JSON.stringify(newUserData.characters || oldUser.characters),
  };

  const stmt = db.prepare(`
    UPDATE users
    SET nickname = ?, gp = ?, avatar = ?, characters = ?
    WHERE id = ?
  `);
  stmt.run(
    updated.nickname,
    updated.gp,
    updated.avatar,
    updated.characters,
    userId
  );

  return {
    ...updated,
    avatar: JSON.parse(updated.avatar),
    characters: JSON.parse(updated.characters),
  };
}

// [4] 유저 단일 조회
export function getUserById(userId) {
  const stmt = db.prepare(`
    SELECT * FROM users WHERE id = ?
  `);
  const user = stmt.get(userId);
  if (!user) return null;

  return {
    ...user,
    avatar: safeParseJson(user.avatar),
    characters: safeParseJson(user.characters),
  };
}

// ✅ JSON 파싱 안전 유틸
function safeParseJson(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}
