import db from "../config/db.js";
import { v4 as uuid } from "uuid";
import { getMapById, getTilesByMapId } from "./mapServices.js";

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

export function getRoomWithMapInfo(roomId) {
  const room = getRoomById(roomId);
  if (!room) return null;

  const map = getMapById(room.map);
  const tiles = getTilesByMapId(room.map);

  return {
    ...room,
    mapInfo: {
      ...map,
      tiles,
    },
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
  const allowedKeys = ["mode", "costLimit"];
  const currentRoom = getRoomById(roomId);
  const fieldsToUpdate = {};
  for (const key of allowedKeys) {
    if (updatedFields.hasOwnProperty(key)) {
      fieldsToUpdate[key] = updatedFields[key];
    }
  }

  if (Object.keys(fieldsToUpdate).length === 0) {
    return getRoomById(roomId);
  }

  const sets = [];
  const params = [];
  if (fieldsToUpdate.mode !== undefined) {
    sets.push("teamMode = ?");
    params.push(fieldsToUpdate.mode ? 1 : 0);
  }
  if (fieldsToUpdate.costLimit !== undefined) {
    sets.push("costLimit = ?");
    params.push(fieldsToUpdate.costLimit);
  }
  if (fieldsToUpdate.mode === true && currentRoom.maxPlayers % 2 !== 0) {
    sets.push("maxPlayers = ?");
    params.push(currentRoom.maxPlayers + 1);
  }
  params.push(roomId);

  const sql = `
    UPDATE rooms
    SET ${sets.join(", ")}
    WHERE id = ?;
  `;
  db.prepare(sql).run(...params);

  // 1. 변경된 teamMode 값을 결정
  const isTeamMode = fieldsToUpdate.mode;

  // 2. room_players 초기화
  //   - isReady = 0
  //   - selectedCharacters = '[]'
  //   - team = "blue" 또는 NULL
  const resetSql = `
    UPDATE room_players
    SET
      isReady = 0,
      selectedCharacters = '[]',
      team = ${isTeamMode ? `'blue'` : `NULL`}
    WHERE roomId = ?;
  `;
  db.prepare(resetSql).run(roomId);

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
  rp.userId AS id,
  u.nickname AS nickname,
  rp.isReady AS isReady,
  rp.selectedCharacters AS selectedCharacters,
  rp.team AS team,
  u.avatar_code AS avatar_code,
  u.avatar_gender AS avatar_gender,
  u.expression AS expression,
  u.exp_number AS exp_number
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

// 특정 방의 플레이어들에게 turn_order를 무작위로 부여
export function assignTurnOrder(roomId) {
  const players = getRoomUserInfo(roomId); // 이건 기존 함수라고 가정

  const shuffled = [...players].sort(() => Math.random() - 0.5);

  const updateStmt = db.prepare(`UPDATE room_players SET turn_order = ? WHERE roomId = ? AND userId = ?`);
  shuffled.forEach((player, index) => {
    updateStmt.run(index, roomId, player.id);
  });

  return shuffled.map((p, i) => ({ ...p, turnOrder: i }));
}

// roomModel.js 예시
export function getRoomUserInfoWithTurnOrder(roomId) {
  const stmt = db.prepare(`
        SELECT u.id, u.nickname, u.avatar_gender, u.avatar_code, 
        rp.turn_order, rp.isReady, rp.selectedCharacters, rp.team
        FROM room_players rp
        JOIN users u ON u.id = rp.userId
        WHERE rp.roomId = ?
        ORDER BY rp.turn_order ASC
    `);
  return stmt.all(roomId);
}

//사용자 ID로 룸 정보 get
export function getRoomByUserId(userId) {
  return db.prepare(`
    SELECT roomId, userId, isReady, selectedCharacters
    FROM room_players WHERE userId = ?
    `
  ).all(userId);

}
