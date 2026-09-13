import db from '../db/knex.js';

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const notifs = await db('notifications')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');

    const formatted = notifs.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.is_read,
      is_read: n.is_read,
      timestamp: n.created_at,
      createdAt: n.created_at,
    }));

    res.json({ notifications: formatted });
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const rawId = req.params.id;
    const notifId = Number(String(rawId).replace(/\D/g, ''));
    const userId = req.user.id;

    await db('notifications')
      .where({ id: notifId, user_id: userId })
      .update({ is_read: true });

    res.json({ message: 'Notification marked as read.', id: notifId });
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await db('notifications')
      .where({ user_id: userId })
      .update({ is_read: true });

    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};
