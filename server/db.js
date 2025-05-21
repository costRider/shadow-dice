import Database from 'better-sqlite3';
import path from 'path';

const dbFile = path.resolve(process.cwd(), 'data', 'userdata.db');
const db = new Database(dbFile);

// users 테이블 생성
db
  .prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      nickname TEXT UNIQUE NOT NULL,
      gp INTEGER DEFAULT 5000,
      avatar TEXT,
      characters TEXT,
      createdAt TEXT
    )
  `)
  .run();

  // server/db.js 
db.prepare(`
  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    map TEXT NOT NULL,
    maxPlayers INTEGER NOT NULL,
    isPrivate INTEGER NOT NULL,
    password TEXT,
    hostId TEXT NOT NULL,
    status TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS room_players (
    roomId TEXT NOT NULL,
    userId TEXT NOT NULL,
    isReady INTEGER NOT NULL DEFAULT 0,
    selectedCharacter TEXT,
    PRIMARY KEY(roomId, userId)
  )
`).run();


export default db;
