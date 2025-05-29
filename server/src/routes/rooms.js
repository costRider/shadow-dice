import express from "express";
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoomStatus,
  addPlayerToRoom,
  leaveRoom,
  setPlayerReady,
} from "../services/roomModel.js";
import { updateUserStatus } from '../services/userModel.js';
import { roomEvents } from "../events.js";

import authenticate from '../middleware/authenticate.js';

const router = express.Router();

// 방 목록 조회
router.get("/list", (req, res) => {
  const rooms = getAllRooms(); // roomModel.js 내부 함수
  res.json({ rooms });
});

// 방 생성
/*
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
*/
// 방 생성 
router.post(
  "/create",
  authenticate,          // req.session.user 검증, req.user 세팅
  async (req, res, next) => {
    try {
      const { id: hostId } = req.user;     // 세션에서 꺼내 쓰기
      const { title, map, maxPlayers, isPrivate, password } = req.body;

      const room = await createRoom({
        title,
        map,
        maxPlayers,
        isPrivate,
        password,
        hostId,
      });
      await updateUserStatus(req.user.id, 'IN_ROOM');
      roomEvents.emit("list-changed");
      res.json({ room });
    } catch (err) {
      next(err);
    }
  }
);

// 방 입장
router.post(
  "/:roomId/join",
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;           // 세션 기반
      const { roomId } = req.params;

      // 서비스 레이어에서 이미 중복 입장 방지 로직, 공개/비공개 비밀번호 검증 등을 처리
      await addPlayerToRoom(roomId, userId);
      const room = getRoomById(roomId);
      roomEvents.emit("list-changed");
      res.json(room);
    } catch (err) {
      next(err);
    }
  }
);


// 방 나가기기
router.post("/:roomId/leave", authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { roomId } = req.params;
    console.log('방 나가기 유저: ', userId, '방 나가기 룸: ', roomId)
    await leaveRoom(roomId, userId);
    roomEvents.emit("list-changed");
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});


// 방 상세 조회
router.get("/:id", (req, res) => {
  const room = getRoomById(req.params.id);
  roomEvents.emit("list-changed");
  if (!room) return res.status(404).json({ error: "NOT_FOUND" });
  res.json({ room });
});

// server/routes/rooms.js
/*
router.post("/join", (req, res) => {
  const { roomId, userId } = req.body;
  addPlayerToRoom(roomId, userId);
  const room = getRoomById(roomId);
  res.json({ room });
});
*/

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
