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
  costLimit,
  mode
}) {
  const id = uuid();
  const now = new Date().toISOString();
  const passwordValue = password && password.trim().length > 0 ? password : null;
  db.prepare(
    `
    INSERT INTO rooms (id, title, map, maxPlayers, isPrivate, password, hostId, teamMode, costLimit, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,'WAITING', ?)
  `,
  ).run(
    id,
    title,
    map,
    maxPlayers,
    isPrivate ? 1 : 0,
    passwordValue,
    hostId,
    mode ? 1 : 0,
    costLimit,
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
     SELECT r.*, u.nickname AS hostNickname,
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
    SELECT rp.userId, u.nickname, rp.isReady, rp.selectedCharacters
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
      selectedCharacters: p.selectedCharacters,
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

// 방 정보 업데이트 

export async function updateRoomInfo(roomId, updatedFields) {
  // updatedFields 예시: { mode: true, costLimit: 120 }

  // 1) 요청된 필드 중 유효한 키만 골라내기 (선택적으로)
  const allowedKeys = ["mode", "costLimit"];
  const fieldsToUpdate = {};
  for (const key of allowedKeys) {
    if (updatedFields.hasOwnProperty(key)) {
      fieldsToUpdate[key] = updatedFields[key];
    }
  }

  // 2) 변경할 필드가 없다면 바로 기존 정보 반환
  if (Object.keys(fieldsToUpdate).length === 0) {
    return getRoomById(roomId);
  }

  // 3) SQL 쿼리 생성 예시 (better-sqlite3 문법 가정)
  //   - mode, costLimit 이외의 필드는 무시
  //   - updatedFields에 따라 바인딩 파라미터를 동적으로 생성
  const sets = [];
  const params = [];
  if (fieldsToUpdate.mode !== undefined) {
    sets.push("teamMode = ?");
    params.push(fieldsToUpdate.mode ? 1 : 0);
  }
  if (fieldsToUpdate.costLimit !== undefined) {
    // costLimit이 null이면 NULL로, 숫자면 해당 값으로
    sets.push("costLimit = ?");
    params.push(fieldsToUpdate.costLimit);
  }
  // 최종: params 순서 [mode?, costLimit?, roomId, roomId]
  const sql = `
    UPDATE rooms
    SET ${sets.join(", ")}
    WHERE id = ?;
  `;
  params.push(roomId);

  // 4) 실제 DB 업데이트
  db.prepare(sql).run(...params);

  // 5) 갱신된 방 정보(SELECT)를 바로 반환
  return getRoomById(roomId);
}

// 유저 방 나가기
// 방에 유저가 없으면 방 삭제
export function leaveRoom(roomId, userId) {
  db.prepare(`DELETE FROM room_players WHERE roomId = ? AND userId = ?`).run(roomId, userId);

  const remainingUsers = db.prepare(`
    SELECT userId FROM room_players WHERE roomId = ?
  `).all(roomId);

  if (remainingUsers.length === 0) {
    db.prepare(`DELETE FROM rooms WHERE id = ?`).run(roomId);
    console.log(`🗑️ Room ${roomId} deleted because it became empty.`);
    return { newHostId: null };
  }

  const room = db.prepare(`SELECT hostId FROM rooms WHERE id = ?`).get(roomId);
  if (room.hostId === userId) {
    const newHostId = remainingUsers[0].userId;
    db.prepare(`UPDATE rooms SET hostId = ? WHERE id = ?`).run(newHostId, roomId);
    console.log(`👑 Host changed to ${newHostId} in room ${roomId}`);
    return { newHostId };
  }

  return { newHostId: null }; // host 변경 없음

}

//GameLobby(방) 접속자 목록
export function getRoomPlayers(roomId) {
  return db.prepare(`
    SELECT users.id, users.nickname
    FROM room_players
    JOIN users ON users.id = room_players.userId
    WHERE room_players.roomId = ?
  `).all(roomId);
}

export function getRoomUserInfo(roomId) {
  // 1) room_players + users JOIN, 사용자가 선택한 캐릭터 정보까지 가져오기
  const rows = db.prepare(
    `
    SELECT
      rp.userId                AS id,
      u.nickname               AS nickname,
      rp.isReady               AS isReady,
      rp.selectedCharacters    AS selectedCharacters,
      rp.team                   AS team
    FROM room_players rp
      JOIN users u ON rp.userId = u.id
    WHERE rp.roomId = ?
    `
  ).all(roomId);

  // 2) 각 row.selectedCharacters를 JSON.parse → cost 합산
  for (const row of rows) {
    let ids = [];
    if (typeof row.selectedCharacters === "string") {
      try {
        ids = JSON.parse(row.selectedCharacters);
      } catch {
        ids = [];
      }
    }
    if (!Array.isArray(ids)) ids = [];

    if (ids.length > 0) {
      // "?, ?, ?, ..." 형태의 플레이스홀더 생성
      const placeholders = ids.map(() => "?").join(",");
      // 해당 ID들에 대한 cost만 조회
      const charRows = db.prepare(
        `
        SELECT id, cost
        FROM characters
        WHERE id IN (${placeholders})
        `
      ).all(...ids);
      // charRows 예: [ { id: "CHR015", cost: 164 }, { id: "CHR011", cost: 187 } ]
      row.totalCost = charRows.reduce((sum, ch) => sum + (ch.cost || 0), 0);
    } else {
      row.totalCost = 0;
    }
  }

  return rows;
}

//사용자 보유 캐릭터 목록 전달
export function getUserCharacterList(userId) {
  return db.prepare(`
      SELECT c.id, c.name, c.move, c.attack, c.def, c.int, c.type, c.ability, c.skin, c.cost
      FROM characters c
      JOIN users_characters uc ON c.id = uc.character_id
      WHERE uc.user_id = ?
    `).all(userId);
}

// 준비 상태 변경
export function setPlayerReady(roomId, userId, characterIds, isReady) {
  const jsonCharacterIds = JSON.stringify(characterIds);

  db.prepare(
    `
    UPDATE room_players
    SET isReady = ?, selectedCharacters = ?
    WHERE roomId = ? AND userId = ?
    `
  ).run(isReady ? 1 : 0, jsonCharacterIds, roomId, userId);
}

//팀 변경
export function setPlayerTeam(roomId, userId, team) {
  db.prepare(
    `
    UPDATE room_players SET team = ? WHERE roomId = ? AND userId = ? 

    `
  ).run(team, roomId, userId);
}


//사용자 ID로 룸 정보 get
export function getRoomByUserId(userId) {
  db.prepare(`
    SELECT roomId, userId, isReady, selectedCharacters
    FROM room_players WHERE userId = ?
    `
  ).all(userId);

}
