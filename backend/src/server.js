require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const initSocketHandler = require('./sockets/socketHandler');
require('./config/db'); // Ensure DB tables are initialized

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || '*';

// Middleware
app.use(cors({
  origin: CLIENT_URL === '*' ? '*' : [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Attach io instance to app for REST controllers
app.set('io', io);

// Initialize Socket event handlers
initSocketHandler(io);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Chat server is running cleanly.' });
});

// REST Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal server error occurred' });
});

server.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 Chat Backend Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for real-time connections`);
  console.log(`=================================`);
});

module.exports = app;
