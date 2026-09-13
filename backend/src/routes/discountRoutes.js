import { Router } from 'express';
import * as discountController from '../controllers/discountController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { discountRequestSchema } from '../validations/schemas.js';

const router = Router();

router.use(authenticateToken);

router.post('/request', validateBody(discountRequestSchema), discountController.requestDiscount);
router.get('/my', discountController.getMyDiscounts);

export default router;
