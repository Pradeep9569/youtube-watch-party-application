# 🎬 YouTube Watch Party

A real-time **YouTube Watch Party** web application that allows multiple users to join the same room and watch YouTube videos together. Users can create or join rooms and synchronize their video-watching experience.

## 🚀 Features

- 🔐 User Registration & Login
- 🛡️ Protected Routes
- 🎥 Watch YouTube videos together
- 🏠 Create a watch party room
- 🔗 Join a room using a room code
- 🔄 Real-time video synchronization
- 👑 Host/Moderator controls
- 👥 Multiple users in the same room
- ⚡ Real-time communication using Socket.IO
- 📱 Responsive web interface

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router
- React YouTube
- Socket.IO Client
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT Authentication

## 📂 Project Structure

```text
Youtube-watch-party/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   ├── src/
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── ...
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Pradeep9569/youtube-watch-party-system.git
```

```bash
cd youtube-watch-party-system
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=4001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm start
```

Or, if your project uses nodemon:

```bash
npm run dev
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

## 🔄 How It Works

### 1. Register / Login

Users create an account and log in to access the watch-party features.

### 2. Create a Room

The host creates a watch-party room and receives a unique room code.

### 3. Join a Room

Other users enter the room code to join the same watch party.

### 4. Watch Together

The host can control the YouTube video. Video actions such as play, pause, and seeking can be synchronized with other users through **Socket.IO**.

### 5. Real-Time Communication

Socket.IO maintains communication between users and the server, allowing room members to receive updates in real time.

## 🔐 Authentication

The application uses **JWT-based authentication** to protect user-specific functionality and routes.

Protected pages are accessible only after successful authentication.

## 🌐 API / Communication

The application follows a client-server architecture:

```text
React Frontend
      │
      │ HTTP Requests
      ▼
Express Backend
      │
      ├──────────► MongoDB
      │
      │ Socket.IO
      ▼
Real-Time Watch Party
```

## 🎯 Learning Objectives

This project demonstrates practical experience with:

- React component development
- React Router
- REST APIs
- Node.js & Express
- MongoDB & Mongoose
- JWT authentication
- Protected routes
- Socket.IO
- Real-time communication
- YouTube API/player integration
- Full-stack application architecture

## 🔮 Future Improvements

- 💬 Real-time chat
- 🎵 Support for playlists
- 👤 User profiles
- 🔔 Room notifications
- 📺 Better video synchronization
- 🎨 Improved UI/UX
- 🟢 Online user indicators
- 🔒 Advanced room permissions

## 👨‍💻 Author

**Pradeep Yadav**

B.Tech Student | Full Stack Developer

GitHub: [Pradeep9569](https://github.com/Pradeep9569)

## ⭐ Support

If you find this project useful, consider giving it a ⭐ on GitHub.

## 🚀 Deployment

**Render (backend)** – Root Directory `backend`, Build `npm ci`, Start `npm start`, Health Check Path `/health`.
Environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your Vercel URL, no trailing slash; comma-separate several). `PORT` is set by Render automatically.

**Vercel (frontend)** – Root Directory `frontend`, Framework Vite. Environment variable: `VITE_API_URL` = backend origin only
(e.g. `https://youtube-watch-party-system-1-y992.onrender.com`, no `/api`, no `/auth`). Redeploy after changing it.

API routes: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/rooms/create`, `POST /api/rooms/join`.

Tests: `cd backend && npm test`.
