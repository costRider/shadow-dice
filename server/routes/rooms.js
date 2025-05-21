import express from "express";
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoomStatus,
  addPlayerToRoom,
  setPlayerReady,
} from "../roomModel.js";
const router = express.Router();

// 방 목록 조회
router.get("/list", (req, res) => {
  const rooms = getAllRooms(); // roomModel.js 내부 함수
  res.json({ rooms });
});

// 방 생성
router.post("/create", (req, res) => {
  const { title, map, maxPlayers, isPrivate, password, hostId } = req.body;
  const room = createRoom({
    title,
    map,
    maxPlayers,
    isPrivate,
    password,
    hostId,
  });
  res.json({ room });
});

// 방 상세 조회
router.get("/:id", (req, res) => {
  const room = getRoomById(req.params.id);
  if (!room) return res.status(404).json({ error: "NOT_FOUND" });
  res.json({ room });
});

// server/routes/rooms.js
router.post("/join", (req, res) => {
  const { roomId, userId } = req.body;
  addPlayerToRoom(roomId, userId);
  const room = getRoomById(roomId);
  res.json({ room });
});

// 준비 상태 토글
router.put("/:id/ready", (req, res) => {
  setPlayerReady(req.params.id, req.body.userId, req.body.isReady);
  res.json({ success: true });
});

// 게임 시작 (호스트 전용)
router.put("/:id/start", (req, res) => {
  updateRoomStatus(req.params.id, "IN_PROGRESS");
  res.json({ success: true });
});

export default router;
