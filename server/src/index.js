import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import roomsRouter from "./routes/rooms.js";
import userRoutes from './routes/userRoutes.js';
import setupSocket from './socket/socket.js';

const app = express();
const PORT = process.env.PORT || 4000;
const server = app.listen(3001, () => console.log('🚀 서버 실행 중'));
// 소켓 서버 설정
setupSocket(server);

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomsRouter);
app.use('/api/users', userRoutes);
