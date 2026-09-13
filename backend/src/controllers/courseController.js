import db from '../db/knex.js';

export const getCourses = async (req, res, next) => {
  try {
    const { search, category, level, teacherId } = req.query;

    let query = db('courses')
      .leftJoin('users as teachers', 'courses.teacher_id', 'teachers.id')
      .select(
        'courses.*',
        db.raw("CONCAT(teachers.first_name, ' ', teachers.last_name) as teacher_name")
      )
      .where('courses.status', 'ACTIVE');

    if (search) {
      const term = `%${search.trim().toLowerCase()}%`;
      query = query.andWhere((builder) => {
        builder
          .whereRaw('LOWER(courses.name) LIKE ?', [term])
          .orWhereRaw('LOWER(courses.category) LIKE ?', [term])
          .orWhereRaw('LOWER(courses.description) LIKE ?', [term])
          .orWhereRaw("LOWER(CONCAT(teachers.first_name, ' ', teachers.last_name)) LIKE ?", [term]);
      });
    }

    if (category && category !== 'ALL') {
      query = query.andWhere('courses.category', category);
    }

    if (level && level !== 'ALL') {
      query = query.andWhere('courses.level', level);
    }

    if (teacherId && teacherId !== 'ALL') {
      const parsedTeacherId = Number(String(teacherId).replace(/\D/g, ''));
      if (parsedTeacherId) {
        query = query.andWhere('courses.teacher_id', parsedTeacherId);
      }
    }

    const courses = await query.orderBy('courses.id', 'asc');

    // Fetch enrollment counts per course
    const enrollmentCounts = await db('enrollments')
      .select('course_id')
      .count('id as enrolled_count')
      .whereIn('status', ['ACTIVE', 'PENDING', 'COMPLETED'])
      .groupBy('course_id');

    const countMap = {};
    for (const ec of enrollmentCounts) {
      countMap[ec.course_id] = Number(ec.enrolled_count);
    }

    // Format courses with frontend expected aliases
    const formatted = courses.map((c) => {
      const enrolledCount = countMap[c.id] || (c.capacity - c.seats_available) || 0;
      return {
        id: c.id,
        title: c.name,
        name: c.name,
        category: c.category,
        level: c.level,
        description: c.description,
        teacherId: c.teacher_id,
        teacher_id: c.teacher_id,
        teacherName: c.teacher_name || 'Math Faculty',
        schedule: c.schedule,
        fee: Number(c.fee),
        capacity: c.capacity,
        seats_available: c.seats_available,
        enrolledCount,
        rating: Number(c.rating || 5.0),
        status: c.status,
        modules: typeof c.modules === 'string' ? JSON.parse(c.modules) : (c.modules || []),
        createdAt: c.created_at,
      };
    });

    res.json({ courses: formatted });
  } catch (err) {
    next(err);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const rawId = req.params.id;
    const courseId = Number(String(rawId).replace(/\D/g, ''));

    const course = await db('courses')
      .leftJoin('users as teachers', 'courses.teacher_id', 'teachers.id')
      .select(
        'courses.*',
        db.raw("CONCAT(teachers.first_name, ' ', teachers.last_name) as teacher_name")
      )
      .where('courses.id', courseId)
      .first();

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const enrolled = await db('enrollments')
      .where('course_id', course.id)
      .whereIn('status', ['ACTIVE', 'PENDING', 'COMPLETED'])
      .count('id as count')
      .first();

    const enrolledCount = Number(enrolled?.count || 0);

    const formatted = {
      id: course.id,
      title: course.name,
      name: course.name,
      category: course.category,
      level: course.level,
      description: course.description,
      teacherId: course.teacher_id,
      teacher_id: course.teacher_id,
      teacherName: course.teacher_name || 'Math Faculty',
      schedule: course.schedule,
      fee: Number(course.fee),
      capacity: course.capacity,
      seats_available: course.seats_available,
      enrolledCount,
      rating: Number(course.rating || 5.0),
      status: course.status,
      modules: typeof course.modules === 'string' ? JSON.parse(course.modules) : (course.modules || []),
    };

    res.json({ course: formatted });
  } catch (err) {
    next(err);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const {
      title,
      name,
      category,
      level = 'Intermediate',
      description = '',
      teacherId,
      teacher_id,
      schedule = 'TBA',
      fee = 0,
      capacity = 30,
      modules = [],
    } = req.body;

    const courseName = (title || name || '').trim();
    let teacherUserId = teacherId || teacher_id;
    if (teacherUserId) {
      teacherUserId = Number(String(teacherUserId).replace(/\D/g, ''));
    } else if (req.user?.role === 'TEACHER') {
      teacherUserId = req.user.id;
    } else {
      // Default to first teacher in DB if not provided
      const defaultTeacher = await db('users').where({ role: 'TEACHER' }).first();
      teacherUserId = defaultTeacher ? defaultTeacher.id : null;
    }

    const numCapacity = Number(capacity) || 30;
    const numFee = Number(fee) || 0;

    const [inserted] = await db('courses')
      .insert({
        name: courseName,
        category,
        level,
        description,
        teacher_id: teacherUserId,
        schedule,
        fee: numFee,
        capacity: numCapacity,
        seats_available: numCapacity,
        status: 'ACTIVE',
        rating: 5.0,
        modules: JSON.stringify(modules),
      })
      .returning('*');

    const teacher = teacherUserId ? await db('users').where({ id: teacherUserId }).first() : null;
    const teacherName = teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Math Faculty';

    const formatted = {
      id: inserted.id,
      title: inserted.name,
      name: inserted.name,
      category: inserted.category,
      level: inserted.level,
      description: inserted.description,
      teacherId: inserted.teacher_id,
      teacher_id: inserted.teacher_id,
      teacherName,
      schedule: inserted.schedule,
      fee: Number(inserted.fee),
      capacity: inserted.capacity,
      seats_available: inserted.seats_available,
      enrolledCount: 0,
      rating: 5.0,
      status: inserted.status,
      modules,
    };

    res.status(201).json({
      message: 'Course created successfully.',
      course: formatted,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const rawId = req.params.id;
    const courseId = Number(String(rawId).replace(/\D/g, ''));

    const existing = await db('courses').where({ id: courseId }).first();
    if (!existing) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const updates = {};
    const { title, name, category, level, description, teacherId, teacher_id, schedule, fee, capacity, status, modules } = req.body;

    if (title || name) updates.name = (title || name).trim();
    if (category) updates.category = category;
    if (level) updates.level = level;
    if (description !== undefined) updates.description = description;
    if (teacherId !== undefined || teacher_id !== undefined) {
      const tid = teacherId !== undefined ? teacherId : teacher_id;
      updates.teacher_id = tid ? Number(String(tid).replace(/\D/g, '')) : null;
    }
    if (schedule !== undefined) updates.schedule = schedule;
    if (fee !== undefined) updates.fee = Number(fee);
    if (capacity !== undefined) {
      const newCap = Number(capacity);
      const enrolled = await db('enrollments')
        .where('course_id', courseId)
        .whereIn('status', ['ACTIVE', 'PENDING', 'COMPLETED'])
        .count('id as count')
        .first();
      const currentEnrolled = Number(enrolled?.count || 0);
      updates.capacity = newCap;
      updates.seats_available = Math.max(0, newCap - currentEnrolled);
    }
    if (status) updates.status = status;
    if (modules) updates.modules = JSON.stringify(modules);
    updates.updated_at = new Date();

    const [updated] = await db('courses').where({ id: courseId }).update(updates).returning('*');

    const teacher = updated.teacher_id ? await db('users').where({ id: updated.teacher_id }).first() : null;
    const teacherName = teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Math Faculty';

    const enrolled = await db('enrollments')
      .where('course_id', updated.id)
      .whereIn('status', ['ACTIVE', 'PENDING', 'COMPLETED'])
      .count('id as count')
      .first();

    const formatted = {
      id: updated.id,
      title: updated.name,
      name: updated.name,
      category: updated.category,
      level: updated.level,
      description: updated.description,
      teacherId: updated.teacher_id,
      teacher_id: updated.teacher_id,
      teacherName,
      schedule: updated.schedule,
      fee: Number(updated.fee),
      capacity: updated.capacity,
      seats_available: updated.seats_available,
      enrolledCount: Number(enrolled?.count || 0),
      rating: Number(updated.rating || 5.0),
      status: updated.status,
      modules: typeof updated.modules === 'string' ? JSON.parse(updated.modules) : (updated.modules || []),
    };

    res.json({ message: 'Course updated successfully.', course: formatted });
  } catch (err) {
    next(err);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const rawId = req.params.id;
    const courseId = Number(String(rawId).replace(/\D/g, ''));

    const existing = await db('courses').where({ id: courseId }).first();
    if (!existing) {
      return res.status(404).json({ error: 'Course not found' });
    }

    await db('courses').where({ id: courseId }).del();
    res.json({ message: 'Course deleted successfully.', id: courseId });
  } catch (err) {
    next(err);
  }
};
