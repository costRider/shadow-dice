// users.router.js
import express from 'express';
import authenticate from '../middleware/authenticate.js';
import { updateUserStatus, getUserProfile } from '../services/userModel.js';


const router = express.Router();

router.put(
    "/status",
    authenticate,
    async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { status } = req.body;
            const updated = await updateUserStatus(userId, status);
            res.json(updated);
        } catch (err) {
            next(err);
        }
    }
);

router.get('/:id', authenticate, (req, res, next) => {
    const userId = req.params.id;
    try {
        const profile = getUserProfile(userId);
        if (!profile) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        res.json(profile);
    } catch (err) {
        next(err);
    }
});

export default router;