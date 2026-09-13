import { Router } from 'express';
import * as enrollmentController from '../controllers/enrollmentController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { enrollmentCreateSchema } from '../validations/schemas.js';

const router = Router();

router.get('/my', authenticateToken, enrollmentController.getMyEnrollments);
router.get('/', authenticateToken, enrollmentController.getAllEnrollments);
router.post('/', authenticateToken, validateBody(enrollmentCreateSchema), enrollmentController.enrollInCourse);
router.patch('/:id', authenticateToken, enrollmentController.updateEnrollment);

export default router;
