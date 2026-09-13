import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mathmastry_super_secret_jwt_key_2026_production_grade_99887766';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const setTokenCookie = (res, token) => {
  const isSecure = process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
  const sameSite = process.env.COOKIE_SAME_SITE || 'lax';

  const cookieOptions = {
    httpOnly: true,
    secure: isSecure,
    sameSite: sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };

  res.cookie('token', token, cookieOptions);
  res.cookie('session_token', token, cookieOptions);
};

export const clearTokenCookie = (res) => {
  const isSecure = process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
  const sameSite = process.env.COOKIE_SAME_SITE || 'lax';

  const cookieOptions = {
    httpOnly: true,
    secure: isSecure,
    sameSite: sameSite,
    path: '/',
  };

  res.clearCookie('token', cookieOptions);
  res.clearCookie('session_token', cookieOptions);
};

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
