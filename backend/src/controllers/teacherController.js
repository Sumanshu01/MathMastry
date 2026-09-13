import db from '../db/knex.js';

export const getTeacherCourses = async (req, res, next) => {
  try {
    const teacherId = req.user.id;

    const courses = await db('courses')
      .leftJoin('users as teachers', 'courses.teacher_id', 'teachers.id')
      .select(
        'courses.*',
        db.raw("CONCAT(teachers.first_name, ' ', teachers.last_name) as teacher_name")
      )
      .where('courses.teacher_id', teacherId)
      .andWhere('courses.status', 'ACTIVE')
      .orderBy('courses.id', 'asc');

    // Count enrollments
    const counts = await db('enrollments')
      .select('course_id')
      .count('id as count')
      .whereIn('status', ['ACTIVE', 'PENDING', 'COMPLETED'])
      .groupBy('course_id');

    const countMap = {};
    for (const item of counts) {
      countMap[item.course_id] = Number(item.count);
    }

    const formatted = courses.map((c) => ({
      id: c.id,
      title: c.name,
      name: c.name,
      category: c.category,
      level: c.level,
      description: c.description,
      teacherId: c.teacher_id,
      teacher_id: c.teacher_id,
      teacherName: c.teacher_name || `${req.user.firstName} ${req.user.lastName}`,
      schedule: c.schedule,
      fee: Number(c.fee),
      capacity: c.capacity,
      seats_available: c.seats_available,
      enrolledCount: countMap[c.id] || 0,
      rating: Number(c.rating || 5.0),
      status: c.status,
      modules: typeof c.modules === 'string' ? JSON.parse(c.modules) : (c.modules || []),
    }));

    res.json({ courses: formatted });
  } catch (err) {
    next(err);
  }
};

export const getCourseRoster = async (req, res, next) => {
  try {
    const rawId = req.params.id;
    const courseId = Number(String(rawId).replace(/\D/g, ''));
    const teacherId = req.user.id;

    // Verify course exists
    const course = await db('courses').where({ id: courseId }).first();
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if teacher is assigned to this course or is admin
    if (course.teacher_id !== teacherId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied to this course roster.' });
    }

    const enrollments = await db('enrollments')
      .join('users as students', 'enrollments.student_id', 'students.id')
      .select(
        'enrollments.*',
        db.raw("CONCAT(students.first_name, ' ', students.last_name) as student_name"),
        'students.email as student_email',
        'students.phone as student_phone'
      )
      .where('enrollments.course_id', courseId)
      .orderBy('enrollments.id', 'asc');

    const roster = enrollments.map((e) => ({
      id: e.id,
      studentId: e.student_id,
      studentName: e.student_name,
      studentEmail: e.student_email,
      studentPhone: e.student_phone,
      enrolledAt: e.enrolled_at,
      progress: e.progress_percent,
      completedLessons: e.completed_lessons,
      totalLessons: e.total_lessons,
      grade: e.grade || 'In Progress',
      status: e.status,
      lastAccessed: e.last_accessed,
      attendance: '95%',
    }));

    res.json({
      course: { id: course.id, name: course.name, title: course.name },
      roster,
      students: roster, // alias for both roster and students
    });
  } catch (err) {
    next(err);
  }
};

export const getTeacherAvailability = async (req, res, next) => {
  try {
    const teacherId = req.user.id;

    const profile = await db('teacher_profiles').where({ user_id: teacherId }).first();
    const defaultAvailability = {
      timezone: 'UTC+00:00 (London)',
      weeklyHoursLimit: 25,
      slots: [
        { day: 'Monday', enabled: true, startTime: '09:00', endTime: '17:00', maxStudentsPerSlot: 4 },
        { day: 'Tuesday', enabled: true, startTime: '10:00', endTime: '16:00', maxStudentsPerSlot: 3 },
        { day: 'Wednesday', enabled: true, startTime: '09:00', endTime: '17:00', maxStudentsPerSlot: 4 },
        { day: 'Thursday', enabled: true, startTime: '10:00', endTime: '16:00', maxStudentsPerSlot: 3 },
        { day: 'Friday', enabled: true, startTime: '09:00', endTime: '15:00', maxStudentsPerSlot: 5 },
        { day: 'Saturday', enabled: false, startTime: '10:00', endTime: '14:00', maxStudentsPerSlot: 2 },
        { day: 'Sunday', enabled: false, startTime: '10:00', endTime: '14:00', maxStudentsPerSlot: 2 },
      ],
      officeHoursNotice: 'Available on Discord/Slack channel every weekday between 4:00 PM - 5:00 PM.',
    };

    if (!profile || !profile.availability) {
      return res.json({ availability: defaultAvailability });
    }

    const availability = typeof profile.availability === 'string'
      ? JSON.parse(profile.availability)
      : profile.availability;

    res.json({ availability: Object.keys(availability).length > 0 ? availability : defaultAvailability });
  } catch (err) {
    next(err);
  }
};

export const updateTeacherAvailability = async (req, res, next) => {
  try {
    const teacherId = req.user.id;
    const availabilityData = req.body;

    const profile = await db('teacher_profiles').where({ user_id: teacherId }).first();

    if (profile) {
      await db('teacher_profiles')
        .where({ user_id: teacherId })
        .update({
          availability: JSON.stringify(availabilityData),
          updated_at: new Date(),
        });
    } else {
      await db('teacher_profiles').insert({
        user_id: teacherId,
        qualifications: '',
        bio: '',
        specialization: '',
        availability: JSON.stringify(availabilityData),
      });
    }

    res.json({
      message: 'Teacher availability updated successfully.',
      availability: availabilityData,
    });
  } catch (err) {
    next(err);
  }
};
