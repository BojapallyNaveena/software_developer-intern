const { dbAll, dbRun } = require('../config/db');

const getChatHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const messages = await dbAll(
      `SELECT * FROM (SELECT * FROM messages ORDER BY timestamp DESC LIMIT ?) ORDER BY timestamp ASC`,
      [limit]
    );
    return res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { sender, text, id, timestamp, status } = req.body;

    if (!sender || !text || !text.trim()) {
      return res.status(400).json({ error: 'Sender and text message are required' });
    }

    const messageId = id || 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const msgTimestamp = timestamp || new Date().toISOString();
    const msgStatus = status || 'sent';
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

    // Emit socket event if io instance is attached to app
    const io = req.app.get('io');
    if (io) {
      io.emit('message:received', newMessage);
    }

    return res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
};

module.exports = {
  getChatHistory,
  sendMessage
};
