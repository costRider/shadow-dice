import express from 'express';
import { fetchCharacterSprite } from '../services/character-service.js';

const router = express.Router();

/**
 * GET /api/character-resources?code=CHR001
 */
router.get('/character-resources', (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ error: 'code query parameter is required' });
  }

  try {
    const sprite = fetchCharacterSprite(code);
    if (!sprite) {
      return res.status(404).json({ error: 'Character resource not found' });
    }
    res.json(sprite);
  } catch (err) {
    console.error('[character-resources] error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
