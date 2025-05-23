import db from "../config/db.js";
import { v4 as uuid } from "uuid";

// 방 생성
export function createRoom({
  title,
  map,
  maxPlayers,
  isPrivate,
  password,
  hostId,
}) {
  const id = uuid();
  const now = new Date().toISOString();

  db.prepare(
    `
    INSERT INTO rooms (id, title, map, maxPlayers, isPrivate, password, hostId, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'WAITING', ?)
  `,
  ).run(
    id,
    title,
    map,
    maxPlayers,
    isPrivate ? 1 : 0,
    password || null,
    hostId,
    now,
  );

  // 생성자 자동 입장
  db.prepare(
    `
    INSERT INTO room_players (roomId, userId)
    VALUES (?, ?)
  `,
  ).run(id, hostId);

  return getRoomById(id);
}

// 전체 방 목록
export function getAllRooms() {
  return db
    .prepare(
      `
     SELECT r.*, 
         json_group_array(json_object('id', u.id, 'nickname', u.nickname)) as players
      FROM rooms r
      LEFT JOIN room_players rp ON r.id = rp.roomid
      LEFT JOIN users u ON rp.userid = u.id
      GROUP BY r.id
  `,
    )
    .all()
    /*.map((r) => ({
      ...r,
      isPrivate: !!r.isPrivate,
    }));*/
    .map((r) => {
      let parsedPlayers;
      try {
        parsedPlayers = JSON.parse(r.players); // 👈 JSON 파싱
      } catch (err) {
        console.error('[⚠️ players 파싱 실패]', r.players);
        parsedPlayers = [];
      }

      return {
        ...r,
        isPrivate: !!r.isPrivate,
        players: parsedPlayers,
      };
    });
}

// 특정 방 상세
export function getRoomById(roomId) {
  const room = db
    .prepare(
      `
    SELECT r.*, u.nickname AS hostNickname
    FROM rooms r
    JOIN users u ON r.hostId = u.id
    WHERE r.id = ?
  `,
    )
    .get(roomId);

  if (!room) return null;

  const players = db
    .prepare(
      `
    SELECT rp.userId, u.nickname, rp.isReady, rp.selectedCharacter
    FROM room_players rp
    JOIN users u ON rp.userId = u.id
    WHERE rp.roomId = ?
  `,
    )
    .all(roomId);

  return {
    ...room,
    isPrivate: !!room.isPrivate,
    players: players.map((p) => ({
      userId: p.userId,
      nickname: p.nickname,
      isReady: !!p.isReady,
      selectedCharacter: p.selectedCharacter,
    })),
  };
}

// 방 상태 변경
export function updateRoomStatus(roomId, status) {
  db.prepare(`UPDATE rooms SET status = ? WHERE id = ?`).run(status, roomId);
}

// 유저 방 입장
export function addPlayerToRoom(roomId, userId) {
  db.prepare(
    `
    INSERT OR IGNORE INTO room_players (roomId, userId)
    VALUES (?, ?)
  `,
  ).run(roomId, userId);
}

// 유저 방 나가기
// 방에 유저가 없으면 방 삭제
export function leaveRoom(roomId, userId) {
  db.prepare(`DELETE FROM room_players WHERE room_id = ? AND user_id = ?`).run(roomId, userId);

  const remaining = db.prepare(`SELECT COUNT(*) as count FROM room_players WHERE room_id = ?`).get(roomId);

  if (remaining.count === 0) {
    db.prepare(`DELETE FROM rooms WHERE id = ?`).run(roomId);
    console.log(`🗑️  Room ${roomId} deleted because it became empty.`);
  }
}


// 준비 상태 변경
export function setPlayerReady(roomId, userId, isReady) {
  db.prepare(
    `
    UPDATE room_players SET isReady = ?
    WHERE roomId = ? AND userId = ?
  `,
  ).run(isReady ? 1 : 0, roomId, userId);
}
