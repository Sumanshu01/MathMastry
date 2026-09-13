import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { updateProfileSchema } from '../validations/schemas.js';

const router = Router();

router.get('/me', authenticateToken, userController.getCurrentUser);
router.patch('/me', authenticateToken, validateBody(updateProfileSchema), userController.updateCurrentUser);

export default router;
