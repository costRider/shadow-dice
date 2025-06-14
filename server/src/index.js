import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import roomsRouter from "./routes/rooms.js";
import usersRouter from "./routes/users.js";
import avatarRouter from "./routes/avatars.js";
import partsRouter from "./routes/parts.js";
import characterRouter from "./routes/characters.js";
import shopRouter from "./routes/shop.js";
import avatarEquips from "./routes/avatarEquip.js";
import { setupSocket } from './socket/socket.js';
import path from "path";
import { fileURLToPath } from "url";

import characterResourcesRouter from './routes/characterResources.js';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. 공통 미들웨어
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
}));

// 2. REST API 라우트
app.use(characterResourcesRouter);
app.use("/api/parts", partsRouter);
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomsRouter);
app.use("/api/users", usersRouter);
app.use("/api/characters", characterRouter);
app.use("/api/avatars", avatarRouter);
app.use("/api/shop/", shopRouter);
app.use("/api/user-avatar", avatarEquips);
app.use(
    "/resources",
    express.static(path.join(__dirname, "../resources"))
);

// 3. 정적 파일 서빙 (필요하다면)
// app.use(express.static('public'));

// 4. HTTP 서버 생성
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
    console.log(`🚀 HTTP & Socket.IO server listening on ${PORT}`);
});

// 5. Socket.IO 초기화 (가장 마지막에)
setupSocket(server);