import { Router } from 'express';
import * as courseController from '../controllers/courseController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';
import { courseCreateSchema, courseUpdateSchema } from '../validations/schemas.js';

const router = Router();

router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourseById);

router.post(
  '/',
  authenticateToken,
  requireRole('TEACHER', 'ADMIN'),
  validateBody(courseCreateSchema),
  courseController.createCourse
);

router.put(
  '/:id',
  authenticateToken,
  requireRole('TEACHER', 'ADMIN'),
  validateBody(courseUpdateSchema),
  courseController.updateCourse
);

router.patch(
  '/:id',
  authenticateToken,
  requireRole('TEACHER', 'ADMIN'),
  validateBody(courseUpdateSchema),
  courseController.updateCourse
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole('ADMIN'),
  courseController.deleteCourse
);

export default router;
