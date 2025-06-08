// src/services/userModel.js
import db from "../config/db.js";

/**
 * 새 회원 생성
 */
export function createUser({ id, password, nickname, avatarCode, gender }) {
  const now = new Date().toISOString();
  try {
    db.prepare(`
      INSERT INTO users
        (id, password, nickname, gp, createdAt, avatar_code, avatar_gender, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'OFFLINE')
    `).run(id, password, nickname, 3000, now, avatarCode, gender);
    return { success: true };
  } catch (err) {
    if (err.code?.startsWith("SQLITE_CONSTRAINT")) {
      const msg = err.message || "";
      if (msg.includes("users.id")) return { success: false, error: "DUPLICATE_ID" };
      if (msg.includes("users.nickname")) return { success: false, error: "DUPLICATE_NICKNAME" };
      return { success: false, error: "DUPLICATE" };
    }
    return { success: false, error: err.message };
  }
}

/** 
 * 로그인 검사용: 최소한의 컬럼만 조회
 */
export function getUserBasic(id) {
  return db
    .prepare("SELECT id, password, status FROM users WHERE id = ?")
    .get(id);
}

/**
 * 순수 users 테이블 조회
 */
export function getUserById(id) {
  const row = db
    .prepare(`
      SELECT
        id,
        password,
        nickname,
        gp,
        createdAt,
        status,
        avatar_code,
        avatar_gender,
        socketId
      FROM users
      WHERE id = ?
    `)
    .get(id);
  return row || null;
}

/**
 * 로그인/프로필 조회용: 유저 기본 정보 + 장착 아이템(join)
 */
export function getUserProfile(userId) {
  // 1) users 기본 정보
  const userRow = db
    .prepare(`
      SELECT
        id,
        nickname,
        gp,
        createdAt,
        avatar_code,
        avatar_gender,
        expression,
        exp_number,
        status
      FROM users
      WHERE id = ?
    `)
    .get(userId);
  if (!userRow) return null;

  // 2) equippedItems 조회 (avatar_items + avatar_parts 조인)
  const equippedItems = db
    .prepare(`
      SELECT
        ai.part_code,
        ai.image_path,
        ap.depth
      FROM user_avatar_equips uae
      JOIN avatar_items ai   ON uae.item_id     = ai.id
      JOIN avatar_parts ap   ON ai.part_code     = ap.part_code
      WHERE uae.user_id = ?
      ORDER BY ap.depth
    `)
    .all(userId);

  return {
    ...userRow,
    equippedItems,  // [{ part_code, image_path, depth }, …]
  };
}

/**
 * 닉네임으로 users 조회
 */
export function getUserByNickname(nickname) {
  const row = db
    .prepare(`
      SELECT
        id,
        password,
        nickname,
        gp,
        avatar_code,
        avatar_gender,
        status
      FROM users
      WHERE nickname = ?
    `)
    .get(nickname);
  return row || null;
}

/**
 * 유저 정보 일부 업데이트
 */
export function updateUser(id, { password, nickname, gp }) {
  db.prepare(`
    UPDATE users
    SET password = ?, nickname = ?, gp = ?
    WHERE id = ?
  `).run(password, nickname, gp, id);

  return getUserById(id);
}

/**
 * 기본 아바타 코드·성별만 업데이트
 */
export function updateUserAvatar(id, avatarCode, avatarGender) {
  db.prepare(`
    UPDATE users
    SET avatar_code   = ?,
        avatar_gender = ?
    WHERE id = ?
  `).run(avatarCode, avatarGender, id);

  return getUserById(id);
}

/**
 * GP 갱신
 */
export function updateUserGp(id, gp) {
  db.prepare(`
    UPDATE users
    SET gp = ?
    WHERE id = ?
  `).run(gp, id);
  return getUserById(id);
}

/**
 * 상태(ONLINE/OFFLINE/LOBBY 등) 업데이트
 */
export function updateUserStatus(id, status) {
  db.prepare(`
    UPDATE users
    SET status = ?
    WHERE id = ?
  `).run(status, id);
}

/**
 * 상태+socketId 함께 업데이트
 */
export function updateUserStatusWithSocket(id, status, socketId) {
  db.prepare(`
    UPDATE users
    SET status   = ?,
        socketId = ?
    WHERE id = ?
  `).run(status, socketId, id);
}

/**
 * 로비(= status='LOBBY')에 있는 유저 리스트
 */
export function getLobbyUsers() {
  return db.prepare(`
    SELECT
      id,
      nickname,
      gp,
      avatar_code,
      avatar_gender,
      status,
      socketId
    FROM users
    WHERE status = 'LOBBY'
  `).all();
}

/**
 * 전체 유저 리스트 (관리자용 등)
 */
export function getAllUsers() {
  return db.prepare(`
    SELECT
      id,
      nickname,
      gp,
      avatar_code,
      avatar_gender,
      status,
      createdAt
    FROM users
  `).all();
}

/**
 * 회원 탈퇴
 */
export function deleteUser(id) {
  const user = getUserById(id);
  if (!user) return null;
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
  return user;
}
