import request from 'supertest';
import app from '../src/app.js';
import db from '../src/db/knex.js';

describe('Authentication & Hardening Suite', () => {
  const testUser = {
    firstName: 'JestTest',
    lastName: 'Student',
    email: `jest_auth_${Date.now()}@example.com`,
    password: 'Password123!',
    phone: '+1 (555) 123-4567',
    role: 'STUDENT',
  };

  afterAll(async () => {
    // Clean up test user
    await db('users').where({ email: testUser.email }).del();
    await db.destroy();
  });

  it('should register a new user with hashed password and generate OTP', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/registration successful/i);
    expect(res.body.email).toBe(testUser.email);

    // Verify user in DB has hashed password and email_verified = false
    const dbUser = await db('users').where({ email: testUser.email }).first();
    expect(dbUser).toBeDefined();
    expect(dbUser.password_hash).not.toBe(testUser.password);
    expect(dbUser.email_verified).toBe(false);

    // Verify OTP code created
    const otp = await db('otp_codes')
      .where({ user_id: dbUser.id, purpose: 'EMAIL_VERIFY' })
      .first();
    expect(otp).toBeDefined();
    expect(otp.code).toHaveLength(6);
  });

  it('should reject registration if email is already taken', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already exists/i);
  });

  it('should verify email using the generated OTP code', async () => {
    const dbUser = await db('users').where({ email: testUser.email }).first();
    const otpRecord = await db('otp_codes')
      .where({ user_id: dbUser.id, purpose: 'EMAIL_VERIFY', used: false })
      .first();

    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ email: testUser.email, otp: otpRecord.code });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/verified successfully/i);

    const updatedUser = await db('users').where({ id: dbUser.id }).first();
    expect(updatedUser.email_verified).toBe(true);
  });

  it('should successfully log in with valid credentials and issue httpOnly cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.token).toBeDefined();

    // Verify cookies set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.includes('token='))).toBe(true);
    expect(cookies.some((c) => c.includes('HttpOnly'))).toBe(true);
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'WrongPassword999!' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid/i);
  });
});
