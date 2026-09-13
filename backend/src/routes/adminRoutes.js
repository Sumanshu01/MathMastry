import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import * as courseController from '../controllers/courseController.js';
import * as enrollmentController from '../controllers/enrollmentController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';
import { courseCreateSchema, courseUpdateSchema, discountReviewSchema } from '../validations/schemas.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRole('ADMIN'));

// Users
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.delete('/users/:id', adminController.deleteUser);

// Teachers list (for course assignment dropdown)
router.get('/teachers', adminController.getTeachers);

// Courses
router.get('/courses', courseController.getCourses);
router.post('/courses', validateBody(courseCreateSchema), courseController.createCourse);
router.put('/courses/:id', validateBody(courseUpdateSchema), courseController.updateCourse);
router.patch('/courses/:id', validateBody(courseUpdateSchema), courseController.updateCourse);
router.delete('/courses/:id', courseController.deleteCourse);

// Enrollments
router.get('/enrollments', enrollmentController.getAllEnrollments);
router.patch('/enrollments/:id', enrollmentController.updateEnrollment);

// Discounts
router.get('/discounts', adminController.getDiscounts);
router.patch('/discounts/:id', validateBody(discountReviewSchema), adminController.reviewDiscount);

// Stats & Dashboard Aggregates
router.get('/stats', adminController.getAdminStats);
router.get('/dashboard-stats', adminController.getAdminStats);

// Reports & Analytics
router.get('/reports', adminController.getAdminReports);

export default router;
