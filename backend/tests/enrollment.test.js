import request from 'supertest';
import app from '../src/app.js';
import db from '../src/db/knex.js';
import { generateToken } from '../src/utils/tokens.js';

describe('Enrollment & Capacity Suite', () => {
  let studentUser;
  let studentToken;
  let testCourse;
  let fullCourse;

  beforeAll(async () => {
    // Create test student
    [studentUser] = await db('users')
      .insert({
        first_name: 'EnrollTest',
        last_name: 'Student',
        email: `jest_enr_${Date.now()}@example.com`,
        password_hash: 'dummyhash',
        role: 'STUDENT',
        email_verified: true,
      })
      .returning('*');

    studentToken = generateToken(studentUser);

    // Create course with available seats
    [testCourse] = await db('courses')
      .insert({
        name: 'Jest Linear Algebra',
        category: 'Algebra',
        fee: 150.0,
        capacity: 10,
        seats_available: 2,
        status: 'ACTIVE',
      })
      .returning('*');

    // Create full course with 0 seats
    [fullCourse] = await db('courses')
      .insert({
        name: 'Jest Full Calculus',
        category: 'Calculus',
        fee: 180.0,
        capacity: 10,
        seats_available: 0,
        status: 'ACTIVE',
      })
      .returning('*');
  });

  afterAll(async () => {
    if (testCourse) await db('courses').where({ id: testCourse.id }).del();
    if (fullCourse) await db('courses').where({ id: fullCourse.id }).del();
    if (studentUser) await db('users').where({ id: studentUser.id }).del();
    await db.destroy();
  });

  it('should successfully enroll student, decrement seats, and create PENDING payment', async () => {
    const res = await request(app)
      .post('/api/enrollments')
      .set('Cookie', [`token=${studentToken}`])
      .send({ courseId: testCourse.id });

    expect(res.status).toBe(201);
    expect(res.body.enrollment).toBeDefined();
    expect(res.body.enrollment.status).toBe('ACTIVE');

    // Verify seats decremented from 2 to 1
    const updatedCourse = await db('courses').where({ id: testCourse.id }).first();
    expect(updatedCourse.seats_available).toBe(1);

    // Verify PENDING payment created
    const payment = await db('payments')
      .where({ enrollment_id: res.body.enrollment.id })
      .first();
    expect(payment).toBeDefined();
    expect(payment.status).toBe('PENDING');
    expect(Number(payment.amount)).toBe(Number(testCourse.fee));

    // Verify notification emitted
    const notif = await db('notifications')
      .where({ user_id: studentUser.id })
      .first();
    expect(notif).toBeDefined();
    expect(notif.title).toMatch(/Enrollment Confirmed/i);
  });

  it('should reject enrollment if student is already enrolled in the course', async () => {
    const res = await request(app)
      .post('/api/enrollments')
      .set('Cookie', [`token=${studentToken}`])
      .send({ courseId: testCourse.id });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already enrolled/i);
  });

  it('should reject enrollment if course has zero seats available', async () => {
    const res = await request(app)
      .post('/api/enrollments')
      .set('Cookie', [`token=${studentToken}`])
      .send({ courseId: fullCourse.id });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/no seats available/i);
  });
});
