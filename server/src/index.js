import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import roomsRouter from "./routes/rooms.js";
import userRoutes from './routes/userRoutes.js';

// Socket 관련
import { setupSocket } from './socket/socket.js';

dotenv.config();

const app = express();

// 1) 공통 미들웨어: CORS, JSON 파싱, 세션
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
}));

// 2) REST API 라우트
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomsRouter);
app.use("/api/users", userRoutes);

// 3) HTTP 서버 생성 (express + Socket.IO 용)
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
    console.log(`🚀 HTTP & Socket.IO server listening on ${PORT}`);
});

// 4) Socket.IO 초기화
// setupSocket은 (server: http.Server) => io 반환
setupSocket(server);
