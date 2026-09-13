import db from '../db/knex.js';

/**
 * Creates an internal notification for a user.
 * @param {number} userId
 * @param {object} param1
 * @param {string} param1.type - 'ACADEMIC' | 'SCHEDULE' | 'SYSTEM' | 'ACHIEVEMENT'
 * @param {string} param1.title
 * @param {string} param1.message
 */
export const createNotification = async (userId, { type = 'SYSTEM', title, message }) => {
  try {
    const [notif] = await db('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        is_read: false,
      })
      .returning('*');
    return notif;
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
};
