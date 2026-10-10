// Test helpers: an in-memory stand-in for the Mongoose models so the REAL Express app,
// controllers, middleware and Socket.IO handlers run without a MongoDB server.
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.CLIENT_URL = "https://frontend.example.vercel.app";

import http from "http";
import { Server } from "socket.io";
import User from "../models/User.js";
import Room from "../models/Room.js";

export function installFakeModels() {
  const users = [];
  let n = 0;

  User.exists = async (q) => (users.find((u) => Object.entries(q).every(([k, v]) => u[k] === v)) ? { _id: "x" } : null);
  User.findOne = async (q) => users.find((u) => Object.entries(q).every(([k, v]) => u[k] === v)) || null;
  User.create = async (data) => {
    const user = { _id: `u${++n}`, ...data };
    users.push(user);
    return user;
  };
  User.findById = (id) => ({
    select: async () => {
      const u = users.find((x) => x._id === id);
      if (!u) return null;
      const { password, ...rest } = u; // eslint-disable-line no-unused-vars
      return rest;
    },
  });

  const rooms = [];
  Room.findOne = async ({ roomCode }) => rooms.find((r) => r.roomCode === roomCode) || null;
  Room.create = async (data) => {
    const room = { isPlaying: false, currentTime: 0, videoId: "dQw4w9WgXcQ", ...data, save: async () => {} };
    rooms.push(room);
    return room;
  };

  return { users, rooms };
}

export async function startServer(app, registerSocketHandlers) {
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: true } });
  registerSocketHandlers(io);
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const { port } = server.address();
  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise((r) => { io.close(); server.close(r); }),
  };
}
