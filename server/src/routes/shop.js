// 예시 Express 라우트
import express from 'express';

const router = express.Router();

router.get('/api/shop/items', async (req, res) => {
    const { category } = req.query;
    if (!['character', 'avatar_costume'].includes(category)) return res.status(400).send();
    const items = db.prepare(`
    SELECT si.id, si.price, si.metadata,
           c.portrait_path AS thumbnailUrl,
           cr.meta_file_path  AS previewJson,
           cr.file_path       AS previewImg
    FROM shop_items si
    LEFT JOIN characters c 
      ON (category='character' AND si.target_id = c.id)
    LEFT JOIN character_resources cr 
      ON (si.target_id = cr.character_id AND cr.resource_type='sprite')
    WHERE si.category = ?
  `).all(category);
    res.json(items);
});

export default router;