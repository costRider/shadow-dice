import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import roomsRouter from "./routes/rooms.js";
import { setupSocket } from './socket/socket.js';

dotenv.config();

const app = express();

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
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomsRouter);

// 3. 정적 파일 서빙 (필요하다면)
// app.use(express.static('public'));

// 4. HTTP 서버 생성
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
    console.log(`🚀 HTTP & Socket.IO server listening on ${PORT}`);
});

// 5. Socket.IO 초기화 (가장 마지막에)
setupSocket(server);