// server/routes/characterResources.js
import express from 'express';
import db from "../config/db.js";
const router = express.Router();

/**
 * GET /api/character-resources?code=CHR001
 * returns { jsonUrl, imageUrl }
 */
router.get('/api/character-resources', (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).json({ error: 'code query parameter is required' });
    }

    const row = db.prepare(`
    SELECT
    meta_file_path ,
    file_path    
  FROM character_resources
  WHERE character_id = ?
    AND meta_file_path  IS NOT NULL
    AND file_path       IS NOT NULL
    AND resource_type   = 'sprite_atlas'
  LIMIT 1
  `).get(code);

    if (!row) {
        return res.status(404).json({ error: 'Character resource not found' });
    }

    // public 디렉터리에 assets 링크가 걸려 있다고 가정
    res.json({
        jsonUrl: `/resources/${row.meta_file_path}`,
        imageUrl: `/resources/${row.file_path}`,
    });
});

export default router;
