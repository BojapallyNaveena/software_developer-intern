# PulseChat - Real-Time Chat Application

A high-performance, real-time full-stack chat application built with **React**, **Node.js**, **Express**, **Socket.io**, and **SQLite**.

---

## 🌟 Key Features

- ⚡ **Instant Real-Time Messaging**: Socket.io bidirectional WebSocket communication for zero-latency messaging without page refreshes.
- 📜 **Chat History Persistence**: Previous chat messages stored in SQLite database and fetched via REST API (`GET /api/messages`) on application reload.
- 🕒 **Message Timestamps & Delivery Status**: Accurate message creation timestamps with sent and read status checkmark indicators.
- 👤 **Username-Based Login**: Simple user session registration (`POST /api/auth/login`) stored in browser local storage.
- 🟢 **Online/Offline User Status**: Real-time user list showing active connected community members and offline users.
- ✍️ **Typing Indicators**: Real-time broadcast alerts ("Alice is typing...") when users are composing messages.
- 🔌 **REST API & Socket Dual-Support**: Backend supports both REST API endpoints and Socket.io events with a frontend toggle for demonstration.

---

## 🏗️ Architecture & Project Structure

```text
software developer/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # SQLite database setup & table initialization
│   │   ├── controllers/
│   │   │   ├── authController.js     # User login & user list controllers
│   │   │   └── messageController.js  # REST controllers for chat messages
│   │   ├── db/
│   │   │   └── chat.db               # Persistent SQLite database file
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # /api/auth API endpoints
│   │   │   └── messageRoutes.js      # /api/messages API endpoints
│   │   ├── sockets/
│   │   │   └── socketHandler.js      # Socket.io event listeners & broadcasting logic
│   │   └── server.js                 # Main Express & Socket.io server entry point
│   ├── .env.example                  # Environment configuration template
│   └── package.json                  # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatHeader.jsx        # Chat title, online status & session controls
│   │   │   ├── ChatInput.jsx         # Message composer with mode toggle & typing trigger
│   │   │   ├── LoginModal.jsx        # Clean username entry modal
│   │   │   ├── MessageList.jsx       # Chat timeline with read receipts & timestamps
│   │   │   └── OnlineUsersList.jsx   # Sidebar displaying connected users
│   │   ├── context/
│   │   │   └── SocketContext.jsx     # Socket.io state provider & event listeners
│   │   ├── services/
│   │   │   └── api.js                # REST API HTTP client wrappers
│   │   ├── App.jsx                   # Main chat container layout
│   │   ├── main.jsx                  # React application entry point
│   │   └── index.css                 # Tailwind CSS styles & animations
│   ├── .env.example                  # Environment configuration template
│   ├── vite.config.js                # Vite build & development proxy setup
│   └── package.json                  # Frontend dependencies
└── README.md                         # Project documentation
```

---

## ⚙️ Environment Variables Required

### Backend (`backend/.env`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port on which Express server listens |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin for frontend |
| `NODE_ENV` | `development` | Application environment mode |

### Frontend (`frontend/.env`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_BACKEND_URL` | `http://localhost:5000` | Target URL of backend API & Socket.io server |

---

## 🚀 Quick Start & Setup Instructions

### Prerequisites
- **Node.js**: v18.x or higher installed on your machine
- **npm**: v9.x or higher

---

### Step 1: Backend Setup & Execution

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Start the backend server:
   - **Development Mode** (auto-reload):
     ```bash
     npm run dev
     ```
   - **Production Mode**:
     ```bash
     npm start
     ```

   *The server will start listening on `http://localhost:5000` and automatically create the SQLite database `src/db/chat.db`.*

---

### Step 2: Frontend Setup & Execution

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Start the frontend application:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```text
   http://localhost:5173
   ```

---

## 📡 REST API Documentation

### 1. Fetch Chat History
- **Endpoint**: `GET /api/messages`
- **Query Params**: `limit` (optional, default: 100)
- **Response**:
  ```json
  {
    "success": true,
    "count": 2,
    "messages": [
      {
        "id": "msg_1711540000000_abc12",
        "sender": "Alice",
        "text": "Hello world!",
        "timestamp": "2026-09-27T12:00:00.000Z",
        "status": "read"
      }
    ]
  }
  ```

### 2. Send Message via REST API
- **Endpoint**: `POST /api/messages`
- **Body**:
  ```json
  {
    "sender": "Alice",
    "text": "Hello via REST API!"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": {
      "id": "msg_1711540010000_xyz89",
      "sender": "Alice",
      "text": "Hello via REST API!",
      "timestamp": "2026-09-27T12:00:10.000Z",
      "status": "sent"
    }
  }
  ```

### 3. User Login
- **Endpoint**: `POST /api/auth/login`
- **Body**:
  ```json
  {
    "username": "Alice"
  }
  ```

---

## 🔌 Socket.io Real-Time Events

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `user:join` | Client ➔ Server | `{ username, userId }` | Registers user session and updates online status |
| `users:update` | Server ➔ Client | `Array<User>` | Broadcasts updated list of online/offline users |
| `message:send` | Client ➔ Server | `{ sender, text, id, timestamp }` | Sends new message to room |
| `message:received` | Server ➔ Client | `MessageObject` | Delivers new real-time message to all clients |
| `typing:start` | Client ➔ Server | `{ username }` | Broadcasts typing state start |
| `typing:stop` | Client ➔ Server | `{ username }` | Broadcasts typing state end |
| `typing:status` | Server ➔ Client | `{ username, isTyping }` | Updates active typing users list |
| `message:read` | Client ➔ Server | `{ messageIds }` | Marks messages as read in DB |
| `disconnect` | Automated | `None` | Updates user offline status on tab close/disconnect |

---

## 🧠 Design Decisions

1. **SQLite Database Persistence**: Chosen over in-memory or heavy external databases (MongoDB/PostgreSQL) because SQLite is lightweight, zero-configuration, file-based, and guarantees data survives server restarts while keeping the codebase self-contained.
2. **React Context (`SocketContext.jsx`)**: Centralizes Socket.io connections, error handling, state synchronization, and event listeners across components cleanly.
3. **Vite + Tailwind CSS**: Provides rapid build times, modern design tokens, and smooth responsive styling across web and mobile viewports.
4. **Graceful Disconnect Handling**: Socket disconnect listener verifies if a user has other active connections before marking them offline, avoiding flickering status on tab refreshes.

---

## 💡 Assumptions Made

1. **Authentication**: Dummy authentication is based on lightweight username sessions without password encryption or JWT requirement (as allowed by the bonus spec).
2. **Global Chat Room**: Connected users join a primary broadcast chat room.
3. **Local Storage Persistence**: Username sessions are cached in browser `localStorage` so users stay logged in upon page reloads.

---

## 🌐 Deployment Instructions (Render / Railway)

### Backend Deployment (Render)
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your repository and set Root Directory to `backend`.
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Add Environment Variables (`PORT=5000`, `CLIENT_URL=https://your-frontend.onrender.com`).

### Frontend Deployment (Render / Vercel)
1. Create a **Static Site** on Render or Vercel.
2. Set Root Directory to `frontend`.
3. Set Build Command: `npm run build`
4. Set Publish Directory: `dist`
5. Set Environment Variable `VITE_BACKEND_URL=https://your-backend.onrender.com`.
