import db from '../db/knex.js';

export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await db('users').where({ id: userId }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let teacherProfile = null;
    if (user.role === 'TEACHER') {
      teacherProfile = await db('teacher_profiles').where({ user_id: userId }).first();
    }

    const payload = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      emailVerified: user.email_verified,
      twoFactorEnabled: user.two_factor_enabled,
      familyId: user.family_id,
      bio: teacherProfile?.bio || '',
      qualifications: teacherProfile?.qualifications || '',
      qualification: teacherProfile?.qualifications || '',
      specialization: teacherProfile?.specialization || '',
      availability: teacherProfile?.availability
        ? (typeof teacherProfile.availability === 'string'
          ? JSON.parse(teacherProfile.availability)
          : teacherProfile.availability)
        : null,
      createdAt: user.created_at,
    };

    res.json({ user: payload });
  } catch (err) {
    next(err);
  }
};

export const updateCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phone, bio, qualifications, qualification, specialization } = req.body;

    const updates = { updated_at: new Date() };
    if (firstName) updates.first_name = firstName.trim();
    if (lastName) updates.last_name = lastName.trim();
    if (phone !== undefined) updates.phone = phone ? phone.trim() : null;

    const [updatedUser] = await db('users')
      .where({ id: userId })
      .update(updates)
      .returning('*');

    let teacherProfile = null;
    if (updatedUser.role === 'TEACHER') {
      const quals = qualifications || qualification;
      const tUpdates = { updated_at: new Date() };
      if (bio !== undefined) tUpdates.bio = bio;
      if (quals !== undefined) tUpdates.qualifications = quals;
      if (specialization !== undefined) tUpdates.specialization = specialization;

      const existingProfile = await db('teacher_profiles').where({ user_id: userId }).first();
      if (existingProfile) {
        [teacherProfile] = await db('teacher_profiles')
          .where({ user_id: userId })
          .update(tUpdates)
          .returning('*');
      } else {
        [teacherProfile] = await db('teacher_profiles')
          .insert({
            user_id: userId,
            bio: bio || '',
            qualifications: quals || '',
            specialization: specialization || '',
            availability: '{}',
          })
          .returning('*');
      }
    }

    const payload = {
      id: updatedUser.id,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      emailVerified: updatedUser.email_verified,
      twoFactorEnabled: updatedUser.two_factor_enabled,
      familyId: updatedUser.family_id,
      bio: teacherProfile?.bio || '',
      qualifications: teacherProfile?.qualifications || '',
      qualification: teacherProfile?.qualifications || '',
      specialization: teacherProfile?.specialization || '',
      availability: teacherProfile?.availability
        ? (typeof teacherProfile.availability === 'string'
          ? JSON.parse(teacherProfile.availability)
          : teacherProfile.availability)
        : null,
    };

    res.json({ message: 'Profile updated successfully.', user: payload });
  } catch (err) {
    next(err);
  }
};
