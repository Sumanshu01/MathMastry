/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. families table
  await knex.schema.createTable('families', (table) => {
    table.increments('id').primary();
    table.string('guardian_name', 255);
    table.text('address');
    table.string('phone', 50);
    table.timestamps(true, true);
  });

  // 2. users table
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('phone', 50);
    table.string('role', 20).notNullable().defaultTo('STUDENT'); // 'STUDENT' | 'TEACHER' | 'ADMIN'
    table.boolean('email_verified').notNullable().defaultTo(false);
    table.boolean('two_factor_enabled').notNullable().defaultTo(false);
    table.integer('family_id').unsigned().references('id').inTable('families').onDelete('SET NULL');
    table.timestamps(true, true);
  });

  // 3. teacher_profiles table
  await knex.schema.createTable('teacher_profiles', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().unique().references('id').inTable('users').onDelete('CASCADE');
    table.text('qualifications');
    table.text('bio');
    table.text('specialization');
    table.jsonb('availability').defaultTo('{}');
    table.timestamps(true, true);
  });

  // 4. courses table
  await knex.schema.createTable('courses', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.string('category', 100).notNullable();
    table.string('level', 50).defaultTo('Intermediate');
    table.text('description');
    table.integer('teacher_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
    table.string('schedule', 255);
    table.decimal('fee', 10, 2).notNullable().defaultTo(0.00);
    table.integer('capacity').notNullable().defaultTo(30);
    table.integer('seats_available').notNullable().defaultTo(30);
    table.string('status', 20).notNullable().defaultTo('ACTIVE'); // 'ACTIVE' | 'ARCHIVED'
    table.decimal('rating', 3, 2).defaultTo(5.0);
    table.jsonb('modules').defaultTo('[]');
    table.timestamps(true, true);
  });

  // 5. enrollments table
  await knex.schema.createTable('enrollments', (table) => {
    table.increments('id').primary();
    table.integer('student_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('course_id').unsigned().notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.timestamp('enrolled_at').defaultTo(knex.fn.now());
    table.string('status', 20).notNullable().defaultTo('PENDING'); // 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
    table.integer('progress_percent').notNullable().defaultTo(0);
    table.integer('completed_lessons').notNullable().defaultTo(0);
    table.integer('total_lessons').notNullable().defaultTo(20);
    table.string('grade', 50).defaultTo('In Progress');
    table.timestamp('last_accessed').defaultTo(knex.fn.now());
    table.timestamps(true, true);

    table.unique(['student_id', 'course_id']);
  });

  // 6. payments table
  await knex.schema.createTable('payments', (table) => {
    table.increments('id').primary();
    table.integer('enrollment_id').unsigned().notNullable().references('id').inTable('enrollments').onDelete('CASCADE');
    table.decimal('amount', 10, 2).notNullable().defaultTo(0.00);
    table.string('status', 20).notNullable().defaultTo('PENDING'); // 'PENDING' | 'PAID' | 'OVERDUE' | 'REFUNDED'
    table.string('method', 50).defaultTo('OFFLINE');
    table.timestamp('paid_at');
    table.timestamps(true, true);
  });

  // 7. sibling_discount_requests table
  await knex.schema.createTable('sibling_discount_requests', (table) => {
    table.increments('id').primary();
    table.integer('family_id').unsigned().references('id').inTable('families').onDelete('SET NULL');
    table.integer('requested_by').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('sibling_name', 255);
    table.string('sibling_email', 255);
    table.string('sibling_student_id', 100);
    table.integer('course_id').unsigned().references('id').inTable('courses').onDelete('SET NULL');
    table.string('status', 20).notNullable().defaultTo('PENDING'); // 'PENDING' | 'APPROVED' | 'REJECTED'
    table.decimal('requested_percentage', 5, 2).defaultTo(20.00);
    table.decimal('discount_percent', 5, 2).defaultTo(0.00);
    table.integer('reviewed_by').unsigned().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('reviewed_at');
    table.text('notes');
    table.string('proof_document_name', 255);
    table.timestamps(true, true);
  });

  // 8. notifications table
  await knex.schema.createTable('notifications', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('type', 50).notNullable().defaultTo('SYSTEM'); // 'ACADEMIC' | 'SCHEDULE' | 'SYSTEM' | 'ACHIEVEMENT'
    table.string('title', 255).notNullable();
    table.text('message').notNullable();
    table.boolean('is_read').notNullable().defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 9. email_verification_tokens table
  await knex.schema.createTable('email_verification_tokens', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token', 255).notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 10. password_reset_tokens table
  await knex.schema.createTable('password_reset_tokens', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token', 255).notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 11. otp_codes table
  await knex.schema.createTable('otp_codes', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('code', 10).notNullable();
    table.string('purpose', 50).notNullable(); // 'EMAIL_VERIFY' | 'LOGIN_2FA' | 'PASSWORD_RESET'
    table.timestamp('expires_at').notNullable();
    table.boolean('used').notNullable().defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('otp_codes');
  await knex.schema.dropTableIfExists('password_reset_tokens');
  await knex.schema.dropTableIfExists('email_verification_tokens');
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.dropTableIfExists('sibling_discount_requests');
  await knex.schema.dropTableIfExists('payments');
  await knex.schema.dropTableIfExists('enrollments');
  await knex.schema.dropTableIfExists('courses');
  await knex.schema.dropTableIfExists('teacher_profiles');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('families');
}
