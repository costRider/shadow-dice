// users.router.js
import express from 'express';
import authenticate from '../middleware/authenticate.js';
import { updateUserStatus } from '../services/userModel.js';


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

export default router;