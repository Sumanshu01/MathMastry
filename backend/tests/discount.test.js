import request from 'supertest';
import app from '../src/app.js';
import db from '../src/db/knex.js';
import { generateToken } from '../src/utils/tokens.js';

describe('Sibling Discount Review & RBAC Suite', () => {
  let studentUser;
  let studentToken;
  let adminUser;
  let adminToken;
  let discountId;

  beforeAll(async () => {
    // Create test student
    [studentUser] = await db('users')
      .insert({
        first_name: 'DiscountTest',
        last_name: 'Student',
        email: `jest_disc_${Date.now()}@example.com`,
        password_hash: 'dummyhash',
        role: 'STUDENT',
        email_verified: true,
      })
      .returning('*');
    studentToken = generateToken(studentUser);

    // Create test admin
    [adminUser] = await db('users')
      .insert({
        first_name: 'AdminTest',
        last_name: 'Officer',
        email: `jest_admin_${Date.now()}@example.com`,
        password_hash: 'dummyhash',
        role: 'ADMIN',
        email_verified: true,
      })
      .returning('*');
    adminToken = generateToken(adminUser);
  });

  afterAll(async () => {
    if (studentUser) await db('users').where({ id: studentUser.id }).del();
    if (adminUser) await db('users').where({ id: adminUser.id }).del();
    await db.destroy();
  });

  it('should allow student to submit a sibling discount request', async () => {
    const res = await request(app)
      .post('/api/discounts/request')
      .set('Cookie', [`token=${studentToken}`])
      .send({
        siblingName: 'Lucy Test',
        siblingEmail: 'lucy@example.com',
        requestedPercentage: 20,
        notes: 'Enrolled in middle school math.',
      });

    expect(res.status).toBe(201);
    expect(res.body.discount).toBeDefined();
    expect(res.body.discount.status).toBe('PENDING');
    expect(res.body.discount.requestedPercentage).toBe(20);

    discountId = res.body.discount.id;

    // Verify DB record
    const dbRecord = await db('sibling_discount_requests').where({ id: discountId }).first();
    expect(dbRecord).toBeDefined();
    expect(dbRecord.status).toBe('PENDING');
  });

  it('should deny non-admin users from accessing the admin discounts queue (RBAC)', async () => {
    const res = await request(app)
      .get('/api/admin/discounts')
      .set('Cookie', [`token=${studentToken}`]);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/access denied/i);
  });

  it('should allow admin to view discount queue and approve request with percentage', async () => {
    const listRes = await request(app)
      .get('/api/admin/discounts')
      .set('Cookie', [`token=${adminToken}`]);

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.discounts)).toBe(true);
    expect(listRes.body.discounts.some((d) => d.id === discountId)).toBe(true);

    // Admin approves discount
    const approveRes = await request(app)
      .patch(`/api/admin/discounts/${discountId}`)
      .set('Cookie', [`token=${adminToken}`])
      .send({
        status: 'APPROVED',
        approvedPercentage: 25,
        reason: 'Confirmed sibling enrollment in MathMastry.',
      });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.discount.status).toBe('APPROVED');
    expect(approveRes.body.discount.approvedPercentage).toBe(25);

    // Verify student received approval notification
    const notif = await db('notifications')
      .where({ user_id: studentUser.id })
      .andWhere('title', 'like', '%Approved%')
      .first();

    expect(notif).toBeDefined();
    expect(notif.message).toMatch(/25%/);
  });
});
