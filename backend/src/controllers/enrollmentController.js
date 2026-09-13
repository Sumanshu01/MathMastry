import db from '../db/knex.js';
import { createNotification } from '../utils/notifications.js';

export const getMyEnrollments = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const enrollments = await db('enrollments')
      .join('courses', 'enrollments.course_id', 'courses.id')
      .leftJoin('users as teachers', 'courses.teacher_id', 'teachers.id')
      .join('users as students', 'enrollments.student_id', 'students.id')
      .select(
        'enrollments.*',
        'courses.name as course_title',
        'courses.category as course_category',
        db.raw("CONCAT(teachers.first_name, ' ', teachers.last_name) as teacher_name"),
        db.raw("CONCAT(students.first_name, ' ', students.last_name) as student_name"),
        'students.email as student_email'
      )
      .where('enrollments.student_id', studentId)
      .orderBy('enrollments.id', 'desc');

    const formatted = enrollments.map((e) => ({
      id: e.id,
      courseId: e.course_id,
      courseTitle: e.course_title,
      category: e.course_category,
      teacherName: e.teacher_name || 'Math Faculty',
      studentId: e.student_id,
      studentName: e.student_name,
      studentEmail: e.student_email,
      enrolledAt: e.enrolled_at,
      progress: e.progress_percent,
      completedLessons: e.completed_lessons,
      totalLessons: e.total_lessons,
      status: e.status,
      grade: e.grade,
      lastAccessed: e.last_accessed,
    }));

    res.json({ enrollments: formatted });
  } catch (err) {
    next(err);
  }
};

export const enrollInCourse = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    let { courseId } = req.body;

    const parsedCourseId = Number(String(courseId).replace(/\D/g, ''));

    // Check course existence
    const course = await db('courses').where({ id: parsedCourseId }).first();
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'This course is currently not accepting new enrollments.' });
    }

    // Capacity check
    if (course.seats_available <= 0) {
      return res.status(400).json({ error: 'Course is at maximum capacity. No seats available.' });
    }

    // Check existing enrollment
    const existing = await db('enrollments')
      .where({ student_id: studentId, course_id: parsedCourseId })
      .first();

    if (existing) {
      if (existing.status === 'ACTIVE' || existing.status === 'PENDING') {
        return res.status(400).json({ error: 'You are already enrolled in this course.' });
      }
    }

    // Perform enrollment in transaction
    const result = await db.transaction(async (trx) => {
      // Decrement seats
      await trx('courses')
        .where({ id: parsedCourseId })
        .decrement('seats_available', 1);

      // Insert enrollment
      const [enrollment] = await trx('enrollments')
        .insert({
          student_id: studentId,
          course_id: parsedCourseId,
          status: 'ACTIVE',
          progress_percent: 0,
          completed_lessons: 0,
          total_lessons: 20,
          grade: 'Not graded',
          last_accessed: new Date(),
        })
        .returning('*');

      // Auto-create PENDING payment record
      await trx('payments').insert({
        enrollment_id: enrollment.id,
        amount: course.fee,
        status: 'PENDING',
        method: 'OFFLINE',
      });

      return enrollment;
    });

    // Send internal notification
    await createNotification(studentId, {
      type: 'ACADEMIC',
      title: 'Enrollment Confirmed! 🎓',
      message: `You have successfully enrolled in ${course.name}. Next session: ${course.schedule || 'Check calendar'}.`,
    });

    // Format response
    const teacher = course.teacher_id ? await db('users').where({ id: course.teacher_id }).first() : null;
    const formatted = {
      id: result.id,
      courseId: result.course_id,
      courseTitle: course.name,
      category: course.category,
      teacherName: teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Math Faculty',
      studentId,
      studentName: `${req.user.firstName} ${req.user.lastName}`,
      studentEmail: req.user.email,
      enrolledAt: result.enrolled_at,
      progress: 0,
      completedLessons: 0,
      totalLessons: 20,
      status: 'ACTIVE',
      grade: 'Not graded',
      lastAccessed: result.last_accessed,
    };

    res.status(201).json({
      message: 'Enrolled successfully!',
      enrollment: formatted,
    });
  } catch (err) {
    next(err);
  }
};

export const updateEnrollment = async (req, res, next) => {
  try {
    const rawId = req.params.id;
    const enrollmentId = Number(String(rawId).replace(/\D/g, ''));

    const enrollment = await db('enrollments').where({ id: enrollmentId }).first();
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment record not found.' });
    }

    // RBAC: student can update their own progress; teacher/admin can update status and grade
    const isOwner = req.user.id === enrollment.student_id;
    const isStaff = req.user.role === 'TEACHER' || req.user.role === 'ADMIN';

    if (!isOwner && !isStaff) {
      return res.status(403).json({ error: 'Access denied to this enrollment record.' });
    }

    const { status, progress, progress_percent, completed_lessons, grade } = req.body;
    const updates = { updated_at: new Date() };

    if (status && isStaff) updates.status = status;
    if (progress !== undefined) updates.progress_percent = Number(progress);
    if (progress_percent !== undefined) updates.progress_percent = Number(progress_percent);
    if (completed_lessons !== undefined) updates.completed_lessons = Number(completed_lessons);
    if (grade && isStaff) updates.grade = grade;

    const [updated] = await db('enrollments').where({ id: enrollmentId }).update(updates).returning('*');

    // Notify student if status changed by staff
    if (status && isStaff && status !== enrollment.status) {
      await createNotification(enrollment.student_id, {
        type: 'ACADEMIC',
        title: 'Enrollment Status Updated',
        message: `Your enrollment status was updated to ${status}.`,
      });
    }

    const course = await db('courses').where({ id: updated.course_id }).first();
    const student = await db('users').where({ id: updated.student_id }).first();
    const teacher = course?.teacher_id ? await db('users').where({ id: course.teacher_id }).first() : null;

    const formatted = {
      id: updated.id,
      courseId: updated.course_id,
      courseTitle: course?.name || 'Math Course',
      category: course?.category || 'General',
      teacherName: teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Math Faculty',
      studentId: updated.student_id,
      studentName: student ? `${student.first_name} ${student.last_name}` : 'Student',
      studentEmail: student?.email || '',
      enrolledAt: updated.enrolled_at,
      progress: updated.progress_percent,
      completedLessons: updated.completed_lessons,
      totalLessons: updated.total_lessons,
      status: updated.status,
      grade: updated.grade,
      lastAccessed: updated.last_accessed,
    };

    res.json({ message: 'Enrollment updated successfully.', enrollment: formatted });
  } catch (err) {
    next(err);
  }
};

export const getAllEnrollments = async (req, res, next) => {
  try {
    const { status, search, courseId } = req.query;

    let query = db('enrollments')
      .join('courses', 'enrollments.course_id', 'courses.id')
      .leftJoin('users as teachers', 'courses.teacher_id', 'teachers.id')
      .join('users as students', 'enrollments.student_id', 'students.id')
      .select(
        'enrollments.*',
        'courses.name as course_title',
        'courses.category as course_category',
        db.raw("CONCAT(teachers.first_name, ' ', teachers.last_name) as teacher_name"),
        db.raw("CONCAT(students.first_name, ' ', students.last_name) as student_name"),
        'students.email as student_email'
      );

    if (status && status !== 'ALL') {
      query = query.where('enrollments.status', status);
    }

    if (courseId) {
      const parsedCourseId = Number(String(courseId).replace(/\D/g, ''));
      if (parsedCourseId) query = query.where('enrollments.course_id', parsedCourseId);
    }

    if (search) {
      const term = `%${search.trim().toLowerCase()}%`;
      query = query.andWhere((b) => {
        b.whereRaw('LOWER(courses.name) LIKE ?', [term])
          .orWhereRaw('LOWER(students.email) LIKE ?', [term])
          .orWhereRaw("LOWER(CONCAT(students.first_name, ' ', students.last_name)) LIKE ?", [term]);
      });
    }

    const enrollments = await query.orderBy('enrollments.id', 'desc');

    const formatted = enrollments.map((e) => ({
      id: e.id,
      courseId: e.course_id,
      courseTitle: e.course_title,
      category: e.course_category,
      teacherName: e.teacher_name || 'Math Faculty',
      studentId: e.student_id,
      studentName: e.student_name,
      studentEmail: e.student_email,
      enrolledAt: e.enrolled_at,
      progress: e.progress_percent,
      completedLessons: e.completed_lessons,
      totalLessons: e.total_lessons,
      status: e.status,
      grade: e.grade,
      lastAccessed: e.last_accessed,
    }));

    res.json({ enrollments: formatted });
  } catch (err) {
    next(err);
  }
};
