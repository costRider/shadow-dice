// server/routes/avatars.js
import express from 'express';
import { getAvatars } from '../services/avatar-utils.js';

const router = express.Router();

router.get('/', (req, res) => {
    try {
        const { gender } = req.query;
        // 로그로 입력 파라미터 확인
        console.log("[avatars.js] GET /api/avatars 진입", gender);

        const avatarList = getAvatars({ gender }); // 서비스 함수에서 DB 처리
        res.json(avatarList);

    } catch (err) {
        console.error('[avatars 라우트 에러]', err);
        res.status(500).json({ error: "서버 오류: 아바타 목록 조회 실패" });
    }
});

export default router;
