import db from "../config/db.js";

export function createUser({ id, password, nickname }) {
  const now = new Date().toISOString();
  const avatar = JSON.stringify({ id: "default", name: "기본 아바타" });
  const characters = JSON.stringify([
    {
      id: "horse_default",
      name: "기본 말",
      level: 1,
      exp: 0,
      stats: { speed: 5, power: 5, luck: 5 },
      skills: ["달리기"],
      skin: "default",
    },
  ]);

  try {
    db.prepare(
      `
        INSERT INTO users
          (id, password, nickname, gp, avatar, characters, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
    ).run(id, password, nickname, 3000, avatar, characters, now);
    return { success: true };
  } catch (err) {
    // UNIQUE 제약 위반 시 id/nickname 구분
    if (err.code && err.code.startsWith("SQLITE_CONSTRAINT")) {
      const msg = err.message || "";
      if (msg.includes("users.id")) {
        return { success: false, error: "DUPLICATE_ID" };
      }
      if (msg.includes("users.nickname")) {
        return { success: false, error: "DUPLICATE_NICKNAME" };
      }
      return { success: false, error: "DUPLICATE" };
    }
    return { success: false, error: err.message };
  }
}


export function getUserById(id) {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  if (!row) return null;
  return {
    ...row,
    avatar: JSON.parse(row.avatar || '{}'),
    characters: JSON.parse(row.characters || '[]'),
  };
}

export function getUserByNickname(nickname) {
  const row = db
    .prepare("SELECT * FROM users WHERE nickname = ?")
    .get(nickname);
  if (!row) return null;
  return {
    ...row,
    avatar: JSON.parse(row.avatar),
    characters: JSON.parse(row.characters),
  };
}

export function updateUser(id, updates) {
  const user = getUserById(id);
  if (!user) return null;

  const updatedUser = { ...user, ...updates };
  db.prepare(
    `
    UPDATE users
    SET password = ?, nickname = ?, gp = ?, avatar = ?, characters = ?
    WHERE id = ?
  `,
  ).run(
    updatedUser.password,
    updatedUser.nickname,
    updatedUser.gp,
    JSON.stringify(updatedUser.avatar),
    JSON.stringify(updatedUser.characters),
    id,
  );

  return updatedUser;
}

export function deleteUser(id) {
  const user = getUserById(id);
  if (!user) return null;

  db.prepare("DELETE FROM users WHERE id = ?").run(id);
  return user;
}

export function getAllUsers() {
  const rows = db.prepare("SELECT * FROM users").all();
  return rows.map((row) => ({
    ...row,
    avatar: JSON.parse(row.avatar),
    characters: JSON.parse(row.characters),
  }));
}

/*
export function updateUserField(id, field, value) {
  const user = getUserById(id);
  if (!user) return null;

  db.prepare(`UPDATE users SET ${field} = ? WHERE id = ?`).run(value, id);
  return { ...user, [field]: value };
}

export function deleteUserField(id, field) {
  const user = getUserById(id);
  if (!user) return null;

  db.prepare(`UPDATE users SET ${field} = NULL WHERE id = ?`).run(id);
  return { ...user, [field]: null };
}
*/

export function updateUserAvatar(id, avatar) {
  const user = getUserById(id);
  if (!user) return null;

  db.prepare("UPDATE users SET avatar = ? WHERE id = ?").run(
    JSON.stringify(avatar),
    id,
  );
  return { ...user, avatar };
}

export function updateUserCharacters(id, characters) {
  const user = getUserById(id);
  if (!user) return null;

  db.prepare("UPDATE users SET characters = ? WHERE id = ?").run(
    JSON.stringify(characters),
    id,
  );
  return { ...user, characters };
}

export function updateUserGp(id, gp) {
  const user = getUserById(id);
  if (!user) return null;

  db.prepare("UPDATE users SET gp = ? WHERE id = ?").run(gp, id);
  return { ...user, gp };
}

export function updateUserNickname(id, nickname) {
  const user = getUserById(id);
  if (!user) return null;

  db.prepare("UPDATE users SET nickname = ? WHERE id = ?").run(nickname, id);
  return { ...user, nickname };
}

export function updateUserPassword(id, password) {
  const user = getUserById(id);
  if (!user) return null;

  db.prepare("UPDATE users SET password = ? WHERE id = ?").run(password, id);
  return { ...user, password };
}

export function updateUserStatus(id, status) {
  console.log(`Updating user ${id} status to ${status}`);
  const stmt = db.prepare(
    `UPDATE users SET status = ? WHERE id = ?`
  );
  stmt.run(status, id);
}

export function updateUserStatusWithSocket(id, status, socketId = null) {
  console.log(`Updating user ${id} status to ${status} with socketId ${socketId}`);
  const stmt = db.prepare(
    `UPDATE users SET status = ?, socketId = ? WHERE id = ?`
  );
  stmt.run(status, socketId, id);
}


export function getLobbyUsers() {
  const rows = db.prepare(
    "SELECT * FROM users WHERE status = 'LOBBY'"
  ).all();
  return rows.map(row => ({
    ...row,
    avatar: JSON.parse(row.avatar || '{}'),
  }));
}


