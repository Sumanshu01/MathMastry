import db from '../db/knex.js';
import { createNotification } from '../utils/notifications.js';

export const requestDiscount = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { siblingName, siblingEmail, siblingStudentId, courseId, requestedPercentage = 20, notes } = req.body;

    let parsedCourseId = null;
    if (courseId) {
      parsedCourseId = Number(String(courseId).replace(/\D/g, '')) || null;
    }

    const [inserted] = await db('sibling_discount_requests')
      .insert({
        requested_by: studentId,
        family_id: req.user.familyId || null,
        sibling_name: siblingName || null,
        sibling_email: siblingEmail || null,
        sibling_student_id: siblingStudentId || null,
        course_id: parsedCourseId,
        status: 'PENDING',
        requested_percentage: Number(requestedPercentage) || 20.0,
        discount_percent: 0.0,
        notes: notes || null,
      })
      .returning('*');

    await createNotification(studentId, {
      type: 'SYSTEM',
      title: 'Discount Request Submitted 📝',
      message: `Your sibling discount request (${inserted.requested_percentage}%) has been sent for administrative review.`,
    });

    const formatted = {
      id: inserted.id,
      studentName: `${req.user.firstName} ${req.user.lastName}`,
      studentEmail: req.user.email,
      siblingName: inserted.sibling_name,
      siblingEmail: inserted.sibling_email,
      requestedPercentage: Number(inserted.requested_percentage),
      status: inserted.status,
      appliedDate: inserted.created_at,
      notes: inserted.notes,
    };

    res.status(201).json({
      message: 'Sibling discount request submitted successfully.',
      discount: formatted,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyDiscounts = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const discounts = await db('sibling_discount_requests')
      .leftJoin('courses', 'sibling_discount_requests.course_id', 'courses.id')
      .select(
        'sibling_discount_requests.*',
        'courses.name as course_title'
      )
      .where('sibling_discount_requests.requested_by', studentId)
      .orderBy('sibling_discount_requests.id', 'desc');

    const formatted = discounts.map((d) => ({
      id: d.id,
      studentName: `${req.user.firstName} ${req.user.lastName}`,
      studentEmail: req.user.email,
      courseTitle: d.course_title || 'General Mathematics',
      siblingName: d.sibling_name,
      siblingEmail: d.sibling_email,
      requestedPercentage: Number(d.requested_percentage),
      approvedPercentage: Number(d.discount_percent),
      status: d.status,
      appliedDate: d.created_at,
      reviewedAt: d.reviewed_at,
      adminNotes: d.notes,
    }));

    res.json({ discounts: formatted });
  } catch (err) {
    next(err);
  }
};
