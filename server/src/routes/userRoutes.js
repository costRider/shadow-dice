// server/src/routes/userRoutes.js
import { Router } from 'express';
import { getOnlineUsers } from '../controllers/userController.js';
import { updateStatusController } from '../controllers/userController.js';

const router = Router();

router.get('/online', getOnlineUsers);

// PUT /api/users/:userId/status
router.put('/:userId/status', updateStatusController);


export default router;
