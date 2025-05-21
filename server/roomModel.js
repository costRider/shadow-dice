import db from './db.js';
import { v4 as uuid } from 'uuid';

// 방 생성
export function createRoom({ title, map, maxPlayers, isPrivate, password, hostId }) {
  const id = uuid();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO rooms (id, title, map, maxPlayers, isPrivate, password, hostId, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'WAITING', ?)
  `).run(id, title, map, maxPlayers, isPrivate ? 1 : 0, password || null, hostId, now);

  // 생성자 자동 입장
  db.prepare(`
    INSERT INTO room_players (roomId, userId)
    VALUES (?, ?)
  `).run(id, hostId);

  return getRoomById(id);
}

// 전체 방 목록
export function getAllRooms() {
  return db.prepare(`
    SELECT r.*, u.nickname as hostNickname
    FROM rooms r
    JOIN users u ON r.hostId = u.id
    ORDER BY r.createdAt DESC
  `).all().map(r => ({
    ...r,
    isPrivate: !!r.isPrivate
  }));
}

// 특정 방 상세
export function getRoomById(roomId) {
  const room = db.prepare(`
    SELECT r.*, u.nickname AS hostNickname
    FROM rooms r
    JOIN users u ON r.hostId = u.id
    WHERE r.id = ?
  `).get(roomId);

  if (!room) return null;

  const players = db.prepare(`
    SELECT rp.userId, u.nickname, rp.isReady, rp.selectedCharacter
    FROM room_players rp
    JOIN users u ON rp.userId = u.id
    WHERE rp.roomId = ?
  `).all(roomId);

  return {
    ...room,
    isPrivate: !!room.isPrivate,
    players: players.map(p => ({
      userId: p.userId,
      nickname: p.nickname,
      isReady: !!p.isReady,
      selectedCharacter: p.selectedCharacter
    }))
  };
}

// 방 상태 변경
export function updateRoomStatus(roomId, status) {
  db.prepare(`UPDATE rooms SET status = ? WHERE id = ?`).run(status, roomId);
}

// 유저 방 입장
export function addPlayerToRoom(roomId, userId) {
  db.prepare(`
    INSERT OR IGNORE INTO room_players (roomId, userId)
    VALUES (?, ?)
  `).run(roomId, userId);
}

// 준비 상태 변경
export function setPlayerReady(roomId, userId, isReady) {
  db.prepare(`
    UPDATE room_players SET isReady = ?
    WHERE roomId = ? AND userId = ?
  `).run(isReady ? 1 : 0, roomId, userId);
}
