// server/routes/userAvatars.js
import express from 'express';
import {
    getUserAvatarInventory,
    getUserEquippedItems,
    equipAvatarItem,
    unequipAvatarItem
} from '../services/avatarService.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

router.get('/inventory', authenticate, async (req, res) => {
    try {
        const items = await getUserAvatarInventory(req.user.id);
        res.json(items);
    } catch (err) {
        console.error('[GET /inventory] 에러', err);
        res.status(500).json({ error: '보유 아이템 조회 실패' });
    }
});

router.get('/equipped', authenticate, async (req, res) => {
    try {
        const equips = await getUserEquippedItems(req.user.id);
        res.json(equips);
    } catch (err) {
        console.error('[GET /equipped] 에러', err);
        res.status(500).json({ error: '장착 정보 조회 실패' });
    }
});

router.post('/equip', authenticate, async (req, res) => {
    const { partCode, itemId } = req.body;
    console.log("요청 ID:", itemId);
    if (!partCode || !itemId) {
        return res.status(400).json({ error: '필수 값 누락' });
    }

    try {
        await equipAvatarItem(req.user.id, partCode, itemId);
        res.json({ success: true });
    } catch (err) {
        console.error('[POST /equip] 에러', err);
        res.status(500).json({ error: '아이템 장착 실패' });
    }
});

router.post('/unequip', authenticate, async (req, res) => {
    const { partCode } = req.body;
    if (!partCode) {
        return res.status(400).json({ error: 'partCode 누락' });
    }

    try {
        await unequipAvatarItem(req.user.id, partCode);
        res.json({ success: true });
    } catch (err) {
        console.error('[POST /unequip] 에러', err);
        res.status(500).json({ error: '아이템 탈착 실패' });
    }
});

export default router;
