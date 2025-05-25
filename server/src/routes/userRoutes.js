// server/src/routes/userRoutes.js


import { Router } from 'express';
import { getOnlineUsers, updateStatusController, updateUserController } from '../controllers/userController.js';

const router = Router();

// 전체 온라인 유저 조회
router.get('/online', getOnlineUsers);

// 특정 유저 상태 업데이트
router.put('/:userId/status', updateStatusController);

// 전체 유저 정보 업데이트
router.put('/:userId', updateUserController); // ✅ 유저 업데이트 기능 추가

export default router;