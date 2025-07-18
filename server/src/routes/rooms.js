import express from "express";
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoomStatus,
  getRoomWithMapInfo,
  updateRoomInfo,
  addPlayerToRoom,
  leaveRoom,
  getRoomUserInfo,
  getRoomUserInfoWithTurnOrder,
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
router.post(
  "/create",
  authenticate,          // req.session.user 검증, req.user 세팅
  async (req, res, next) => {
    try {
      const { id: hostId } = req.user;     // 세션에서 꺼내 쓰기
      const { title, map, maxPlayers, isPrivate, password, costLimit, mode } = req.body;

      const room = await createRoom({
        title,
        map,
        maxPlayers,
        isPrivate,
        password,
        hostId,
        costLimit,
        mode
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
      const roomCheck = getRoomById(roomId);
      if (!roomCheck) {
        return res.status(404).json({ error: "방이 존재하지 않습니다." });
      } else {
        if (roomCheck.players.length >= roomCheck.maxPlayers) return res.status(400).json({ message: "방 정원이 가득 찼습니다." });
        await addPlayerToRoom(roomId, userId);
        const room = getRoomById(roomId);
        return res.json(room);
      }
      // 서비스 레이어에서 이미 중복 입장 방지 로직, 공개/비공개 비밀번호 검증 등을 처리
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
    const newHostId = await leaveRoom(roomId, userId);
    roomEvents.emit("list-changed");
    if (newHostId != null) { roomEvents.emit("room-info-updated", roomId); };
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// 방 접속자 목록 조회
router.get('/:roomId/players', authenticate, (req, res, next) => {
  try {
    const { roomId } = req.params;
    console.log('접속자 목록 요청 방 ID:', roomId);
    const players = getRoomUserInfo(roomId);
    console.log('방 접속자 목록:', players)
    res.json({ ok: true, players });
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

// 준비 상태 토글
router.put("/:id/ready", authenticate, async (req, res) => {
  const roomId = req.params.id;
  const userId = req.user.id;     // 세션에서 꺼내 쓰기
  const { characterIds, isReady } = req.body;

  try {
    await setPlayerReady(roomId, userId, characterIds, isReady);
    roomEvents.emit("room-users-updated", roomId);
    res.json({ success: true });
  } catch (err) {
    console.error("ready 상태 설정 실패:", err);
    res.status(500).json({ message: "서버 오류로 준비 상태 설정 실패" });
  }

});

//방 정보 업데이트(옵션 변경)

router.put("/:roomId/update", async (req, res) => {
  try {
    const { roomId } = req.params;
    const updatedFields = req.body.updatedFields;
    // 예: { mode: true, costLimit: 120 }

    // 서비스 레이어에 그대로 전달
    const updatedRoom = await updateRoomInfo(roomId, updatedFields);
    roomEvents.emit("room-info-updated", roomId);
    roomEvents.emit("room-users-updated", roomId);
    return res.json(updatedRoom);
  } catch (err) {
    console.error("방 정보 변경 실패:", err);
    return res.status(400).json({ message: err.message });
  }
});

// GET /rooms/:roomId/game
router.get("/:roomId/game", authenticate, async (req, res) => {
  try {
    console.log("게임 시작 Call");
    const { roomId } = req.params;
    const userId = req.user.id;

    // ✅ map + tiles 포함된 room 정보로 대체
    const room = getRoomWithMapInfo(roomId);
    if (!room) return res.status(404).json({ error: "방을 찾을 수 없습니다." });

    // 게임이 시작되지 않았다면 거부
    if (room.status !== "IN_PROGRESS") {
      return res.status(403).json({ error: "게임이 아직 시작되지 않았습니다." });
    }

    const orderedPlayers = getRoomUserInfoWithTurnOrder(roomId);

    console.log("현재 players 목록:", orderedPlayers);

    const currentTurnPlayerId = orderedPlayers[0]?.id;

    return res.json({
      room: {
        ...room,
        currentTurnPlayerId, // ✅ 클라이언트는 이 값을 기준으로 턴 판단
      },
      players: orderedPlayers,
    });
  } catch (err) {
    console.error("게임 정보 요청 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

export default router;
