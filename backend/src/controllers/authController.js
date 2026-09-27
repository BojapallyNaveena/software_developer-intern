const { dbAll, dbGet, dbRun } = require('../config/db');

const loginUser = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const cleanUsername = username.trim();
    let existingUser = await dbGet('SELECT * FROM users WHERE username = ?', [cleanUsername]);

    const timestamp = new Date().toISOString();
    if (!existingUser) {
      const id = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      await dbRun(
        'INSERT INTO users (id, username, is_online, last_seen) VALUES (?, ?, 1, ?)',
        [id, cleanUsername, timestamp]
      );
      existingUser = { id, username: cleanUsername, is_online: 1, last_seen: timestamp };
    } else {
      await dbRun('UPDATE users SET is_online = 1, last_seen = ? WHERE id = ?', [timestamp, existingUser.id]);
      existingUser.is_online = 1;
      existingUser.last_seen = timestamp;
    }

    return res.status(200).json({
      success: true,
      user: existingUser
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    return res.status(500).json({ error: 'Failed to process login request' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await dbAll('SELECT * FROM users ORDER BY is_online DESC, username ASC');
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users list' });
  }
};

module.exports = {
  loginUser,
  getUsers
};
