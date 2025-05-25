// server/src/controllers/userController.js
/*
import * as userService from '../services/userService.js';

export async function getOnlineUsers(req, res, next) {
    try {
        const users = await userService.getLobbyUsers();
        res.json({ users });
    } catch (err) {
        next(err);
    }
}

export async function updateStatusController(req, res, next) {
    try {
        const { userId } = req.params;
        const { status } = req.body;
        await userService.updateUserStatus(userId, status);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
}
*/
import * as userService from '../services/userService.js';

// [GET] 로비 접속자 목록
export async function getOnlineUsers(req, res, next) {
    try {
        const users = await userService.getLobbyUsers();
        res.json({ users });
    } catch (err) {
        console.error('❌ getOnlineUsers error:', err);
        next(err);
    }
}

// [PUT] 유저 상태(status: LOBBY, OFFLINE 등) 업데이트
export async function updateStatusController(req, res, next) {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: '상태 값이 필요합니다.' });
        }

        await userService.updateUserStatus(userId, status);
        res.json({ success: true });
    } catch (err) {
        console.error('❌ updateStatusController error:', err);
        next(err);
    }
}

// [PUT] 유저 전체 정보 업데이트
export async function updateUserController(req, res, next) {
    try {
        const { userId } = req.params;
        const updatedUserData = req.body;

        if (!userId || typeof updatedUserData !== 'object') {
            return res.status(400).json({ error: '유효하지 않은 요청입니다.' });
        }

        const updated = await userService.updateUser(userId, updatedUserData);

        if (!updated) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        res.json({ success: true, user: updated });
    } catch (err) {
        console.error('❌ updateUserController error:', err);
        next(err);
    }
}
