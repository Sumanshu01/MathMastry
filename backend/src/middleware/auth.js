import jwt from 'jsonwebtoken';
import db from '../db/knex.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mathmastry_super_secret_jwt_key_2026_production_grade_99887766';

export const authenticateToken = async (req, res, next) => {
  try {
    let token = req.cookies?.token || req.cookies?.session_token;

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. No session token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await db('users').where({ id: decoded.id }).first();
    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists.' });
    }

    req.user = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: user.email_verified,
      twoFactorEnabled: user.two_factor_enabled,
      familyId: user.family_id,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid or malformed session token.' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token || req.cookies?.session_token;

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db('users').where({ id: decoded.id }).first();
    if (user) {
      req.user = {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.email_verified,
        twoFactorEnabled: user.two_factor_enabled,
        familyId: user.family_id,
      };
    } else {
      req.user = null;
    }
    next();
  } catch {
    req.user = null;
    next();
  }
};
