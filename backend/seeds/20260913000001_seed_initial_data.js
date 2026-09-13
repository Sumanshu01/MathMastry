import bcrypt from 'bcryptjs';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Clear existing records in reverse dependency order
  await knex('otp_codes').del();
  await knex('password_reset_tokens').del();
  await knex('email_verification_tokens').del();
  await knex('notifications').del();
  await knex('sibling_discount_requests').del();
  await knex('payments').del();
  await knex('enrollments').del();
  await knex('courses').del();
  await knex('teacher_profiles').del();
  await knex('users').del();
  await knex('families').del();

  // Reset serial sequences
  const tables = [
    'families', 'users', 'teacher_profiles', 'courses', 'enrollments',
    'payments', 'sibling_discount_requests', 'notifications',
    'email_verification_tokens', 'password_reset_tokens', 'otp_codes'
  ];
  for (const table of tables) {
    await knex.raw(`ALTER SEQUENCE IF EXISTS ${table}_id_seq RESTART WITH 1;`);
  }

  // 1. Families
  const [mercerFamily, chenFamily] = await knex('families').insert([
    {
      guardian_name: 'Robert Mercer',
      address: '742 Evergreen Terrace, Springfield',
      phone: '+1 (555) 349-8800'
    },
    {
      guardian_name: 'Wei Chen',
      address: '1088 Park Avenue, New York, NY',
      phone: '+1 (555) 219-9000'
    }
  ]).returning('*');

  // Password hashes
  const adminHash = await bcrypt.hash('Admin123!', 10);
  const teacherHash = await bcrypt.hash('Teacher123!', 10);
  const studentHash = await bcrypt.hash('Student123!', 10);

  // 2. Users
  const insertedUsers = await knex('users').insert([
    {
      first_name: 'Admin',
      last_name: 'Master',
      email: 'admin@mathmastry.com',
      password_hash: adminHash,
      phone: '+1 (555) 000-1111',
      role: 'ADMIN',
      email_verified: true,
      two_factor_enabled: false
    },
    {
      first_name: 'Sarah',
      last_name: 'Jenkins',
      email: 'teacher@mathmastry.com',
      password_hash: teacherHash,
      phone: '+1 (555) 832-1109',
      role: 'TEACHER',
      email_verified: true,
      two_factor_enabled: false
    },
    {
      first_name: 'Marcus',
      last_name: 'Vance',
      email: 'marcus.vance@mathmastry.com',
      password_hash: teacherHash,
      phone: '+1 (555) 441-2098',
      role: 'TEACHER',
      email_verified: true,
      two_factor_enabled: false
    },
    {
      first_name: 'Alex',
      last_name: 'Mercer',
      email: 'student@example.com',
      password_hash: studentHash,
      phone: '+1 (555) 349-8821',
      role: 'STUDENT',
      email_verified: true,
      two_factor_enabled: false,
      family_id: mercerFamily.id
    },
    {
      first_name: 'Sophia',
      last_name: 'Chen',
      email: 'sophia.c@example.com',
      password_hash: studentHash,
      phone: '+1 (555) 219-9021',
      role: 'STUDENT',
      email_verified: true,
      two_factor_enabled: false,
      family_id: chenFamily.id
    },
    {
      first_name: 'Liam',
      last_name: 'Johnson',
      email: 'liam.j@example.com',
      password_hash: studentHash,
      phone: '+1 (555) 772-3312',
      role: 'STUDENT',
      email_verified: false,
      two_factor_enabled: false
    }
  ]).returning('*');

  const [admin, teacher1, teacher2, student1, student2, student3] = insertedUsers;

  // 3. Teacher Profiles
  await knex('teacher_profiles').insert([
    {
      user_id: teacher1.id,
      qualifications: 'Ph.D. in Pure Mathematics, Cambridge University',
      specialization: 'Number Theory, Formal Proofs & Olympiad Mathematics',
      bio: 'Senior Lecturer in Mathematics with 12+ years of experience training Olympiad medalists and university scholars.',
      availability: JSON.stringify({
        timezone: 'UTC+00:00 (London)',
        weeklyHoursLimit: 25,
        slots: [
          { day: 'Monday', enabled: true, startTime: '09:00', endTime: '17:00', maxStudentsPerSlot: 4 },
          { day: 'Tuesday', enabled: true, startTime: '10:00', endTime: '16:00', maxStudentsPerSlot: 3 },
          { day: 'Wednesday', enabled: true, startTime: '09:00', endTime: '17:00', maxStudentsPerSlot: 4 },
          { day: 'Thursday', enabled: true, startTime: '10:00', endTime: '16:00', maxStudentsPerSlot: 3 },
          { day: 'Friday', enabled: true, startTime: '09:00', endTime: '15:00', maxStudentsPerSlot: 5 },
          { day: 'Saturday', enabled: false, startTime: '10:00', endTime: '14:00', maxStudentsPerSlot: 2 },
          { day: 'Sunday', enabled: false, startTime: '10:00', endTime: '14:00', maxStudentsPerSlot: 2 }
        ],
        officeHoursNotice: 'Available on Discord/Slack channel every weekday between 4:00 PM - 5:00 PM.'
      })
    },
    {
      user_id: teacher2.id,
      qualifications: 'M.Sc. in Applied Mathematics, MIT',
      specialization: 'Linear Algebra, Advanced Calculus & Differential Equations',
      bio: 'Former aerospace data analyst and collegiate mathematics instructor passionate about making abstract math accessible.',
      availability: JSON.stringify({
        timezone: 'America/New_York (EST)',
        weeklyHoursLimit: 20,
        slots: [
          { day: 'Monday', enabled: true, startTime: '13:00', endTime: '19:00', maxStudentsPerSlot: 4 },
          { day: 'Tuesday', enabled: true, startTime: '13:00', endTime: '19:00', maxStudentsPerSlot: 4 },
          { day: 'Wednesday', enabled: true, startTime: '13:00', endTime: '19:00', maxStudentsPerSlot: 4 },
          { day: 'Thursday', enabled: true, startTime: '13:00', endTime: '19:00', maxStudentsPerSlot: 4 },
          { day: 'Friday', enabled: true, startTime: '13:00', endTime: '17:00', maxStudentsPerSlot: 3 }
        ],
        officeHoursNotice: 'Available via Zoom every Wednesday afternoon.'
      })
    }
  ]);

  // 4. Courses
  const insertedCourses = await knex('courses').insert([
    {
      name: 'Foundations of Pure Mathematics',
      category: 'Pure Mathematics',
      level: 'Intermediate',
      description: 'Deep dive into number theory, mathematical proofs, set theory, and formal logic structures.',
      teacher_id: teacher1.id,
      schedule: 'Mon & Wed • 4:00 PM - 5:30 PM',
      fee: 140.00,
      capacity: 25,
      seats_available: 7,
      status: 'ACTIVE',
      rating: 4.9,
      modules: JSON.stringify([
        { id: 'm1', title: 'Set Theory & Relations', duration: '2 weeks', lessons: 6 },
        { id: 'm2', title: 'Formal Proof Techniques', duration: '3 weeks', lessons: 8 },
        { id: 'm3', title: 'Number Theory Fundamentals', duration: '3 weeks', lessons: 9 }
      ])
    },
    {
      name: 'Advanced Algebra & Polynomial Equations',
      category: 'Algebra',
      level: 'Advanced',
      description: 'Master quadratic systems, complex numbers, matrices, sequences, and polynomial root theorem.',
      teacher_id: teacher2.id,
      schedule: 'Tue & Thu • 5:00 PM - 6:30 PM',
      fee: 160.00,
      capacity: 20,
      seats_available: 1,
      status: 'ACTIVE',
      rating: 4.8,
      modules: JSON.stringify([
        { id: 'm1', title: 'Complex Number Field', duration: '2 weeks', lessons: 5 },
        { id: 'm2', title: 'Matrix Operations & Determinants', duration: '3 weeks', lessons: 7 },
        { id: 'm3', title: 'Polynomial Analysis', duration: '3 weeks', lessons: 8 }
      ])
    },
    {
      name: 'Euclidean & Analytic Geometry',
      category: 'Geometry',
      level: 'Beginner to Intermediate',
      description: 'Explore geometric proofs, coordinate transformations, 3D spatial reasoning, and conic sections.',
      teacher_id: teacher1.id,
      schedule: 'Sat • 10:00 AM - 1:00 PM',
      fee: 130.00,
      capacity: 30,
      seats_available: 8,
      status: 'ACTIVE',
      rating: 4.7,
      modules: JSON.stringify([
        { id: 'm1', title: 'Axiomatic Geometry & Triangle Proofs', duration: '2 weeks', lessons: 6 },
        { id: 'm2', title: 'Coordinate Transformations', duration: '2 weeks', lessons: 5 },
        { id: 'm3', title: 'Conic Sections in 2D & 3D', duration: '3 weeks', lessons: 8 }
      ])
    },
    {
      name: 'Probability & Inferential Statistics',
      category: 'Statistics',
      level: 'Intermediate',
      description: 'Essential data analysis, probability distributions, hypothesis testing, and regression modeling.',
      teacher_id: teacher2.id,
      schedule: 'Fri • 4:30 PM - 7:00 PM',
      fee: 150.00,
      capacity: 25,
      seats_available: 11,
      status: 'ACTIVE',
      rating: 4.9,
      modules: JSON.stringify([
        { id: 'm1', title: 'Random Variables & Distributions', duration: '3 weeks', lessons: 7 },
        { id: 'm2', title: 'Hypothesis Testing & Confidence Intervals', duration: '3 weeks', lessons: 8 },
        { id: 'm3', title: 'Linear & Non-linear Regression', duration: '2 weeks', lessons: 5 }
      ])
    },
    {
      name: 'Calculus I: Limits, Derivatives & Applications',
      category: 'Calculus',
      level: 'Advanced',
      description: 'Comprehensive study of limits, continuity, rate of change, derivatives, and optimization problems.',
      teacher_id: teacher2.id,
      schedule: 'Mon & Fri • 6:00 PM - 7:30 PM',
      fee: 175.00,
      capacity: 20,
      seats_available: 4,
      status: 'ACTIVE',
      rating: 5.0,
      modules: JSON.stringify([
        { id: 'm1', title: 'Limits & Continuity', duration: '2 weeks', lessons: 6 },
        { id: 'm2', title: 'Differentiation Rules & Chain Rule', duration: '3 weeks', lessons: 8 },
        { id: 'm3', title: 'Extrema & Optimization Applications', duration: '3 weeks', lessons: 7 }
      ])
    },
    {
      name: 'Olympiad Math & Creative Problem Solving',
      category: 'Olympiad',
      level: 'Elite',
      description: 'Competition-level mathematics, combinatorics, pigeonhole principle, and non-standard problem solving.',
      teacher_id: teacher1.id,
      schedule: 'Sun • 2:00 PM - 5:00 PM',
      fee: 210.00,
      capacity: 15,
      seats_available: 3,
      status: 'ACTIVE',
      rating: 5.0,
      modules: JSON.stringify([
        { id: 'm1', title: 'Combinatorics & Pigeonhole Principle', duration: '3 weeks', lessons: 6 },
        { id: 'm2', title: 'Inequalities (AM-GM, Cauchy-Schwarz)', duration: '3 weeks', lessons: 8 },
        { id: 'm3', title: 'Non-standard Geometry Challenges', duration: '3 weeks', lessons: 7 }
      ])
    }
  ]).returning('*');

  const [course1, course2, course3, course4, course5, course6] = insertedCourses;

  // 5. Enrollments
  const insertedEnrollments = await knex('enrollments').insert([
    {
      student_id: student1.id,
      course_id: course1.id,
      enrolled_at: '2026-01-15T00:00:00Z',
      status: 'ACTIVE',
      progress_percent: 75,
      completed_lessons: 18,
      total_lessons: 23,
      grade: 'A (92%)',
      last_accessed: new Date()
    },
    {
      student_id: student1.id,
      course_id: course2.id,
      enrolled_at: '2026-02-01T00:00:00Z',
      status: 'ACTIVE',
      progress_percent: 60,
      completed_lessons: 12,
      total_lessons: 20,
      grade: 'B+ (88%)',
      last_accessed: new Date()
    },
    {
      student_id: student1.id,
      course_id: course3.id,
      enrolled_at: '2026-02-10T00:00:00Z',
      status: 'ACTIVE',
      progress_percent: 45,
      completed_lessons: 9,
      total_lessons: 19,
      grade: 'B (84%)',
      last_accessed: new Date()
    },
    {
      student_id: student1.id,
      course_id: course4.id,
      enrolled_at: '2026-02-18T00:00:00Z',
      status: 'ACTIVE',
      progress_percent: 30,
      completed_lessons: 6,
      total_lessons: 20,
      grade: 'In Progress',
      last_accessed: new Date()
    },
    {
      student_id: student2.id,
      course_id: course5.id,
      enrolled_at: '2026-01-20T00:00:00Z',
      status: 'ACTIVE',
      progress_percent: 85,
      completed_lessons: 17,
      total_lessons: 21,
      grade: 'A+ (96%)',
      last_accessed: new Date()
    },
    {
      student_id: student3.id,
      course_id: course1.id,
      enrolled_at: '2026-02-05T00:00:00Z',
      status: 'ACTIVE',
      progress_percent: 40,
      completed_lessons: 9,
      total_lessons: 23,
      grade: 'B (82%)',
      last_accessed: new Date()
    }
  ]).returning('*');

  // 6. Payments
  for (const enr of insertedEnrollments) {
    const course = insertedCourses.find((c) => c.id === enr.course_id);
    await knex('payments').insert({
      enrollment_id: enr.id,
      amount: course ? course.fee : 150.00,
      status: 'PAID',
      method: 'CARD',
      paid_at: new Date()
    });
  }

  // 7. Sibling Discount Requests
  await knex('sibling_discount_requests').insert([
    {
      family_id: mercerFamily.id,
      requested_by: student1.id,
      sibling_name: 'Maya Mercer (Class 9)',
      sibling_email: 'maya.m@example.com',
      sibling_student_id: 'u-sibling-98',
      course_id: course2.id,
      status: 'PENDING',
      requested_percentage: 20.00,
      discount_percent: 0.00,
      proof_document_name: 'enrollment_receipt_sibling.pdf',
      notes: 'Sibling enrolled in Grade 9 mathematics.'
    },
    {
      family_id: null,
      requested_by: student3.id,
      sibling_name: 'Ethan Johnson',
      sibling_email: 'ethan.j@example.com',
      sibling_student_id: 'u-sibling-104',
      course_id: course1.id,
      status: 'APPROVED',
      requested_percentage: 15.00,
      discount_percent: 15.00,
      reviewed_by: admin.id,
      reviewed_at: new Date('2026-02-19T00:00:00Z'),
      notes: 'Eligible for semester launch discount.'
    },
    {
      family_id: chenFamily.id,
      requested_by: student2.id,
      sibling_name: 'Lucas Chen (Class 11)',
      sibling_email: 'lucas.c@example.com',
      sibling_student_id: 'u-sibling-55',
      course_id: course5.id,
      status: 'PENDING',
      requested_percentage: 25.00,
      discount_percent: 0.00,
      proof_document_name: 'family_id_card.pdf',
      notes: 'Family has two children attending semester courses.'
    }
  ]);

  // 8. Notifications for Alex Mercer
  await knex('notifications').insert([
    {
      user_id: student1.id,
      type: 'ACADEMIC',
      title: 'New Quiz Available',
      message: 'Module 2: Proof Techniques Quiz has been published in Foundations of Pure Mathematics.',
      is_read: false
    },
    {
      user_id: student1.id,
      type: 'SCHEDULE',
      title: 'Class Schedule Update',
      message: 'Algebra session on Thursday is shifted to 5:30 PM with Prof. Marcus Vance.',
      is_read: false
    },
    {
      user_id: student1.id,
      type: 'SYSTEM',
      title: 'Discount Application Status',
      message: 'Your sibling discount request of 20% is currently under review by the administration.',
      is_read: true
    },
    {
      user_id: student1.id,
      type: 'ACHIEVEMENT',
      title: 'Milestone Achieved 🎉',
      message: 'You have completed 75% of your Mathematics course! Keep up the momentum.',
      is_read: true
    }
  ]);
}
