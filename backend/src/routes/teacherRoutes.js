import { Router } from 'express';
import * as teacherController from '../controllers/teacherController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRole('TEACHER', 'ADMIN'));

router.get('/me/courses', teacherController.getTeacherCourses);
router.get('/me/courses/:id/roster', teacherController.getCourseRoster);
router.get('/me/courses/:id/students', teacherController.getCourseRoster);
router.get('/me/availability', teacherController.getTeacherAvailability);
router.patch('/me/availability', teacherController.updateTeacherAvailability);

export default router;
