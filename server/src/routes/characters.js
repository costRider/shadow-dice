import express from 'express';
import { listCharacterResources } from '../services/character-service.js';

const router = express.Router();

/**
 * GET /api/characters/:code/resources
 */
router.get('/:code/resources', (req, res) => {
    const code = req.params.code;
    if (!code) {
        return res.status(400).json({ error: 'Character code is required' });
    }

    try {
        const resources = listCharacterResources(code);
        if (!resources.length) {
            return res.status(404).json({ error: 'No resources found for this character' });
        }
        res.json(resources);
    } catch (err) {
        console.error('[characters] GET /:code/resources error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
