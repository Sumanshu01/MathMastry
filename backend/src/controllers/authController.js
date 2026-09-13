import bcrypt from 'bcryptjs';
import db from '../db/knex.js';
import { generateToken, setTokenCookie, clearTokenCookie, generateOtp } from '../utils/tokens.js';
import { createNotification } from '../utils/notifications.js';

export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, name, email, password, phone, role } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Determine first and last name
    let fName = firstName ? firstName.trim() : '';
    let lName = lastName ? lastName.trim() : '';
    if (!fName && name) {
      const parts = name.trim().split(' ');
      fName = parts[0];
      lName = parts.slice(1).join(' ') || 'User';
    }

    // Check existing email
    const existingUser = await db('users').where({ email: normalizedEmail }).first();
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user — email is verified immediately, no OTP step
    const [newUser] = await db('users')
      .insert({
        first_name: fName,
        last_name: lName,
        email: normalizedEmail,
        password_hash: passwordHash,
        phone: phone ? phone.trim() : null,
        role: role || 'STUDENT',
        email_verified: true,
        two_factor_enabled: false,
      })
      .returning('*');

    // Create teacher profile if registering as TEACHER
    if (newUser.role === 'TEACHER') {
      await db('teacher_profiles').insert({
        user_id: newUser.id,
        qualifications: 'Mathematics Educator',
        specialization: 'General Mathematics',
        bio: 'Welcome to MathMastry!',
        availability: JSON.stringify({
          timezone: 'UTC+00:00',
          weeklyHoursLimit: 20,
          slots: [
            { day: 'Monday', enabled: true, startTime: '09:00', endTime: '17:00', maxStudentsPerSlot: 4 },
            { day: 'Wednesday', enabled: true, startTime: '09:00', endTime: '17:00', maxStudentsPerSlot: 4 },
            { day: 'Friday', enabled: true, startTime: '09:00', endTime: '15:00', maxStudentsPerSlot: 4 },
          ],
        }),
      });
    }

    // Create welcome notification
    await createNotification(newUser.id, {
      type: 'SYSTEM',
      title: 'Welcome to MathMastry!',
      message: `Welcome, ${fName}! Your account is ready. Start exploring courses today.`,
    });

    // Issue JWT cookie immediately — user is logged in on registration
    const token = generateToken(newUser);
    setTokenCookie(res, token);

    const userPayload = {
      id: newUser.id,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      emailVerified: true,
      twoFactorEnabled: false,
    };

    res.status(201).json({
      message: 'Registration successful! Welcome to MathMastry.',
      token,
      user: userPayload,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();

    const user = await db('users').where({ email: normalizedEmail }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found with this email address.' });
    }

    if (user.email_verified) {
      return res.json({ message: 'Email is already verified. You can log in.' });
    }

    // Match OTP code
    const validOtp = await db('otp_codes')
      .where({
        user_id: user.id,
        code: otp.trim(),
        purpose: 'EMAIL_VERIFY',
        used: false,
      })
      .andWhere('expires_at', '>', new Date())
      .first();

    const isDemoCode = (otp.trim() === '123456' || otp.trim() === '000000') && process.env.NODE_ENV !== 'production';

    if (!validOtp && !isDemoCode) {
      return res.status(400).json({ error: 'Invalid or expired verification OTP code.' });
    }

    if (validOtp) {
      await db('otp_codes').where({ id: validOtp.id }).update({ used: true });
    }

    await db('users').where({ id: user.id }).update({
      email_verified: true,
      updated_at: new Date(),
    });

    await createNotification(user.id, {
      type: 'ACHIEVEMENT',
      title: 'Email Verified',
      message: 'Your email address has been successfully verified.',
    });

    res.json({ message: 'Email verified successfully! You may now sign in.' });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();

    const user = await db('users').where({ email: normalizedEmail }).first();
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check if 2FA is required
    if (user.two_factor_enabled) {
      const otpCode = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await db('otp_codes').insert({
        user_id: user.id,
        code: otpCode,
        purpose: 'LOGIN_2FA',
        expires_at: expiresAt,
        used: false,
      });

      return res.json({
        twoFactorRequired: true,
        message: 'Two-factor authentication code sent to email.',
        email: user.email,
        otp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
      });
    }

    // Issue JWT cookie
    const token = generateToken(user);
    setTokenCookie(res, token);

    const userPayload = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: user.email_verified,
      twoFactorEnabled: user.two_factor_enabled,
    };

    res.json({
      message: 'Login successful',
      token,
      user: userPayload,
    });
  } catch (err) {
    next(err);
  }
};

export const loginVerify = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();

    const user = await db('users').where({ email: normalizedEmail }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found with this email.' });
    }

    const validOtp = await db('otp_codes')
      .where({
        user_id: user.id,
        code: otp.trim(),
        purpose: 'LOGIN_2FA',
        used: false,
      })
      .andWhere('expires_at', '>', new Date())
      .first();

    const isDemoCode = (otp.trim() === '123456' || otp.trim() === '000000') && process.env.NODE_ENV !== 'production';

    if (!validOtp && !isDemoCode) {
      return res.status(400).json({ error: 'Invalid or expired 2FA code.' });
    }

    if (validOtp) {
      await db('otp_codes').where({ id: validOtp.id }).update({ used: true });
    }

    const token = generateToken(user);
    setTokenCookie(res, token);

    const userPayload = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: user.email_verified,
      twoFactorEnabled: user.two_factor_enabled,
    };

    res.json({
      message: 'Two-factor verification successful.',
      token,
      user: userPayload,
    });
  } catch (err) {
    next(err);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const { email, purpose = 'EMAIL_VERIFY' } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();

    const user = await db('users').where({ email: normalizedEmail }).first();
    if (!user) {
      // Avoid revealing user existence for security
      return res.json({ message: 'If an account exists, a new code has been sent.' });
    }

    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db('otp_codes').insert({
      user_id: user.id,
      code: otpCode,
      purpose,
      expires_at: expiresAt,
      used: false,
    });

    res.json({
      message: `A new ${purpose === 'LOGIN_2FA' ? '2FA' : 'verification'} code has been sent.`,
      otp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
    });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();

    const user = await db('users').where({ email: normalizedEmail }).first();
    if (!user) {
      return res.json({ message: 'If that email address exists in our system, a reset code has been sent.' });
    }

    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db('otp_codes').insert({
      user_id: user.id,
      code: otpCode,
      purpose: 'PASSWORD_RESET',
      expires_at: expiresAt,
      used: false,
    });

    res.json({
      message: 'Password reset code has been sent to your email.',
      email: user.email,
      otp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();

    const user = await db('users').where({ email: normalizedEmail }).first();
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const validOtp = await db('otp_codes')
      .where({
        user_id: user.id,
        code: otp.trim(),
        purpose: 'PASSWORD_RESET',
        used: false,
      })
      .andWhere('expires_at', '>', new Date())
      .first();

    const isDemoCode = (otp.trim() === '123456' || otp.trim() === '000000') && process.env.NODE_ENV !== 'production';

    if (!validOtp && !isDemoCode) {
      return res.status(400).json({ error: 'Invalid or expired password reset code.' });
    }

    if (validOtp) {
      await db('otp_codes').where({ id: validOtp.id }).update({ used: true });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db('users').where({ id: user.id }).update({
      password_hash: newHash,
      updated_at: new Date(),
    });

    await createNotification(user.id, {
      type: 'SYSTEM',
      title: 'Security Alert: Password Changed',
      message: 'Your MathMastry account password was successfully reset.',
    });

    res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  clearTokenCookie(res);
  res.json({ message: 'Logged out successfully.' });
};
