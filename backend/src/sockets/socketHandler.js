const { dbAll, dbRun } = require('../config/db');

// Keep track of connected sockets (socketId -> { username, userId })
const activeUsers = new Map();

const initSocketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Helper to broadcast active online users list
    const broadcastOnlineUsers = async () => {
      try {
        const users = await dbAll('SELECT * FROM users ORDER BY is_online DESC, username ASC');
        io.emit('users:update', users);
      } catch (err) {
        console.error('Error broadcasting online users:', err);
      }
    };

    // User join event
    socket.on('user:join', async (userData) => {
      try {
        if (!userData || !userData.username) return;

        const { username, userId } = userData;
        activeUsers.set(socket.id, { username, userId });

        const timestamp = new Date().toISOString();
        if (userId) {
          await dbRun('UPDATE users SET is_online = 1, last_seen = ? WHERE id = ?', [timestamp, userId]);
        } else {
          await dbRun('UPDATE users SET is_online = 1, last_seen = ? WHERE username = ?', [timestamp, username]);
        }

        socket.broadcast.emit('user:joined', { username, timestamp });
        await broadcastOnlineUsers();
      } catch (err) {
        console.error('Error handling user:join:', err);
      }
    });

    // Real-time message send
    socket.on('message:send', async (msgData, callback) => {
      try {
        const { sender, text, id, timestamp } = msgData;
        if (!sender || !text || !text.trim()) {
          if (typeof callback === 'function') {
            callback({ error: 'Sender and text message are required' });
          }
          return;
        }

        const messageId = id || 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        const msgTimestamp = timestamp || new Date().toISOString();
        const msgStatus = 'sent';
        const cleanText = text.trim();

        await dbRun(
          'INSERT INTO messages (id, sender, text, timestamp, status) VALUES (?, ?, ?, ?, ?)',
          [messageId, sender, cleanText, msgTimestamp, msgStatus]
        );

        const newMessage = {
          id: messageId,
          sender,
          text: cleanText,
          timestamp: msgTimestamp,
          status: msgStatus
        };

        // Broadcast to all connected clients including sender
        io.emit('message:received', newMessage);

        if (typeof callback === 'function') {
          callback({ success: true, message: newMessage });
        }
      } catch (err) {
        console.error('Error handling message:send:', err);
        if (typeof callback === 'function') {
          callback({ error: 'Failed to save and deliver message' });
        }
      }
    });

    // Typing status indicators
    socket.on('typing:start', (data) => {
      if (data && data.username) {
        socket.broadcast.emit('typing:status', { username: data.username, isTyping: true });
      }
    });

    socket.on('typing:stop', (data) => {
      if (data && data.username) {
        socket.broadcast.emit('typing:status', { username: data.username, isTyping: false });
      }
    });

    // Message read status update
    socket.on('message:read', async (data) => {
      try {
        const { messageIds } = data;
        if (Array.isArray(messageIds) && messageIds.length > 0) {
          const placeholders = messageIds.map(() => '?').join(',');
          await dbRun(
            `UPDATE messages SET status = 'read' WHERE id IN (${placeholders})`,
            messageIds
          );
          io.emit('message:status_update', { messageIds, status: 'read' });
        }
      } catch (err) {
        console.error('Error handling message:read:', err);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      const user = activeUsers.get(socket.id);
      if (user) {
        activeUsers.delete(socket.id);

        // Check if user has any remaining connected sockets
        const isStillConnected = Array.from(activeUsers.values()).some(
          (u) => u.username === user.username
        );

        if (!isStillConnected) {
          const timestamp = new Date().toISOString();
          if (user.userId) {
            await dbRun('UPDATE users SET is_online = 0, last_seen = ? WHERE id = ?', [timestamp, user.userId]);
          } else {
            await dbRun('UPDATE users SET is_online = 0, last_seen = ? WHERE username = ?', [timestamp, user.username]);
          }
          socket.broadcast.emit('user:left', { username: user.username, timestamp });
          await broadcastOnlineUsers();
        }
      }
    });
  });
};

module.exports = initSocketHandler;
