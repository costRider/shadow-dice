// server/src/routes/shop.js
import express from 'express';
import { listShopItems, purchaseItem } from '../services/shopService.js';

const router = express.Router();

// 세션 기반 인증 미들웨어
function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// --- 1) 판매 상품 목록 조회 ---
// GET /api/shop/items?category=character|avatar_costume
router.get('/items', requireAuth, (req, res) => {
  try {
    const { category } = req.query;
    const items = listShopItems(category, req.session.userId);
    return res.json(items);
  } catch (err) {
    if (err.message === 'Invalid category') {
      return res.status(400).json({ error: err.message });
    }
    console.error('[shop] GET /items error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// --- 2) 상품 구매 ---
// POST /api/shop/purchase  { itemId: number }
router.post('/purchase', requireAuth, (req, res) => {
  const userId = req.session.userId;
  const { itemId } = req.body;

  if (!itemId) {
    return res.status(400).json({ error: 'itemId is required' });
  }

  try {
    purchaseItem(userId, itemId);
    return res.json({ success: true });
  } catch (err) {
    console.error('[shop] POST /purchase error:', err);
    // GP 부족 에러는 400으로
    if (err.message === 'Insufficient GP' || err.message === '이미 보유 중') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
});

export default router;
