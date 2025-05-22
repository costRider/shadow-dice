// server/src/controllers/userController.js
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

