import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required.').max(100),
  lastName: z.string().min(1, 'Last name is required.').max(100),
  name: z.string().optional(),
  email: z.string().email('Please enter a valid email address.').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  phone: z.string().optional().nullable(),
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']).default('STUDENT'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  otp: z.string().min(1, 'Verification OTP is required.').max(10),
});

export const resendOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  purpose: z.string().optional().default('EMAIL_VERIFY'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  otp: z.string().min(1, 'Reset code is required.'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long.'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(50).optional().nullable(),
  bio: z.string().optional().nullable(),
  qualifications: z.string().optional().nullable(),
  qualification: z.string().optional().nullable(),
  specialization: z.string().optional().nullable(),
});

export const courseCreateSchema = z.object({
  title: z.string().min(2, 'Course title is required.').optional(),
  name: z.string().min(2, 'Course name is required.').optional(),
  category: z.string().min(1, 'Category is required.'),
  level: z.string().default('Intermediate'),
  description: z.string().optional().nullable(),
  teacherId: z.union([z.number(), z.string()]).optional().nullable(),
  teacher_id: z.union([z.number(), z.string()]).optional().nullable(),
  teacherName: z.string().optional().nullable(),
  schedule: z.string().optional().nullable(),
  fee: z.union([z.number(), z.string()]).transform((val) => Number(val) || 0),
  capacity: z.union([z.number(), z.string()]).transform((val) => Number(val) || 30),
  modules: z.array(z.any()).optional(),
}).refine((data) => data.title || data.name, {
  message: 'Course title/name is required.',
  path: ['title'],
});

export const courseUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  name: z.string().min(2).optional(),
  category: z.string().min(1).optional(),
  level: z.string().optional(),
  description: z.string().optional().nullable(),
  teacherId: z.union([z.number(), z.string()]).optional().nullable(),
  teacher_id: z.union([z.number(), z.string()]).optional().nullable(),
  teacherName: z.string().optional().nullable(),
  schedule: z.string().optional().nullable(),
  fee: z.union([z.number(), z.string()]).transform((val) => Number(val)).optional(),
  capacity: z.union([z.number(), z.string()]).transform((val) => Number(val)).optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
  modules: z.array(z.any()).optional(),
});

export const enrollmentCreateSchema = z.object({
  courseId: z.union([z.number(), z.string()]).transform((val) => {
    // If courseId is passed as 'c-101' or '101', extract number if possible or handle lookup
    const parsed = Number(String(val).replace(/\D/g, ''));
    return parsed || 1;
  }),
});

export const discountRequestSchema = z.object({
  siblingName: z.string().optional().nullable(),
  siblingEmail: z.string().email().optional().or(z.literal('')).nullable(),
  siblingStudentId: z.string().optional().nullable(),
  courseId: z.union([z.number(), z.string()]).optional().nullable(),
  requestedPercentage: z.union([z.number(), z.string()]).transform((val) => Number(val) || 20).optional(),
  notes: z.string().optional().nullable(),
});

export const discountReviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  approvedPercentage: z.union([z.number(), z.string()]).transform((val) => Number(val) || 0).optional(),
  reason: z.string().optional().nullable(),
  adminNotes: z.string().optional().nullable(),
});

export const availabilitySchema = z.object({
  timezone: z.string().optional(),
  weeklyHoursLimit: z.number().optional(),
  slots: z.array(z.any()).optional(),
  officeHoursNotice: z.string().optional().nullable(),
});
