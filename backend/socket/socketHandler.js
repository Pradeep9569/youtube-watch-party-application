import jwt from "jsonwebtoken";
import Room from "../models/Room.js";
import { canControl } from "./permision.js";
import {
    addUser,
    removeUser,
    getUser,
    updateRole,
} from "./roomManger.js";

const normalizeCode = (code) =>
    String(code || "").trim().toUpperCase();

const safe = (socket, fn) => async (...args) => {
    try {
        await fn(...args);
    } catch (error) {
        console.error("Socket handler error:", error);
        socket.emit("error_message", {
            message: "Something went wrong. Please try again.",
        });
    }
};

export default function registerSocketHandlers(io) {
    // Authenticate every socket connection using the JWT.
    io.use((socket, next) => {
        try {
            if (!process.env.JWT_SECRET) {
                console.error("JWT_SECRET is not configured.");
                return next(new Error("Server authentication is not configured"));
            }

            const token = socket.handshake.auth?.token;

            if (!token) {
                return next(new Error("Authentication required"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Use the username from the verified token, never from
            // the client-supplied join_room payload.
            const username = String(
                decoded.username ||
                decoded.user?.username ||
                decoded.name ||
                ""
            ).trim();

            if (!username) {
                return next(
                    new Error("Username missing from token. Please log in again.")
                );
            }

            socket.data.user = {
                ...decoded,
                username,
            };

            next();
        } catch (error) {
            console.error("Socket authentication failed:", error.message);
            next(new Error("Invalid or expired token"));
        }
    });

    io.on("connection", (socket) => {
        console.log("Connected:", socket.id);

        // Join room using the verified JWT identity.
        socket.on(
            "join_room",
            safe(socket, async ({ roomCode } = {}) => {
                const code = normalizeCode(roomCode);
                const username = socket.data.user?.username;

                if (!code || !username) {
                    socket.emit("error_message", {
                        message: "Valid room code and authentication are required.",
                    });
                    return;
                }

                const room = await Room.findOne({ roomCode: code });

                if (!room) {
                    socket.emit("error_message", {
                        message: "Room not found.",
                    });
                    return;
                }

                // Leave a previously joined room if the same socket
                // attempts to join a different room.
                const previousUser = getUser(socket.id);

                if (previousUser && previousUser.roomCode !== code) {
                    socket.leave(previousUser.roomCode);
                    removeUser(socket.id);
                }

                let participant = room.participants.find(
                    (p) => p.username === username
                );

                if (!participant) {
                    participant = {
                        username,
                        socketId: socket.id,
                        role: "participant",
                    };

                    room.participants.push(participant);
                } else {
                    participant.socketId = socket.id;
                }

                await room.save();
                await socket.join(code);

                addUser(socket.id, {
                    roomCode: code,
                    username,
                    role: participant.role,
                });

                socket.emit("sync_state", {
                    videoId: room.videoId,
                    currentTime: room.currentTime,
                    isPlaying: room.isPlaying,
                    role: participant.role,
                    participants: room.participants,
                });

                io.to(code).emit("user_joined", {
                    username,
                    participants: room.participants,
                });
            })
        );

        // Typing indicator.
        socket.on("typing", () => {
            const user = getUser(socket.id);
            if (!user) return;

            socket.to(user.roomCode).emit("typing", {
                username: user.username,
            });
        });

        // Chat messages always use the authenticated username.
        socket.on("send_message", ({ text } = {}) => {
            const user = getUser(socket.id);
            if (!user) return;

            const clean = String(text || "").trim().slice(0, 1000);
            if (!clean) return;

            io.to(user.roomCode).emit("chat_message", {
                username: user.username,
                text: clean,
                time: Date.now(),
            });
        });

        // Playback controls: host and moderator only.
        const controlHandler = (mutate, emitToOthers) =>
            safe(socket, async (payload = {}) => {
                const user = getUser(socket.id);

                if (!user || !canControl(user.role)) {
                    socket.emit("permission_denied");
                    return;
                }

                const room = await Room.findOne({
                    roomCode: user.roomCode,
                });

                if (!room) return;

                const result = mutate(room, payload);

                if (result === false) return;

                await room.save();
                emitToOthers(user.roomCode, payload, room);
            });

        socket.on(
            "play",
            controlHandler(
                (room) => {
                    room.isPlaying = true;
                },
                (code) => socket.to(code).emit("play")
            )
        );

        socket.on(
            "pause",
            controlHandler(
                (room) => {
                    room.isPlaying = false;
                },
                (code) => socket.to(code).emit("pause")
            )
        );

        socket.on(
            "seek",
            controlHandler(
                (room, { currentTime } = {}) => {
                    const time = Number(currentTime);

                    if (!Number.isFinite(time) || time < 0) {
                        return false;
                    }

                    room.currentTime = time;
                },
                (code, { currentTime }) => {
                    socket.to(code).emit("seek", {
                        currentTime: Number(currentTime),
                    });
                }
            )
        );

        socket.on(
            "change_video",
            controlHandler(
                (room, { videoId } = {}) => {
                    const id = String(videoId || "").trim();

                    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) {
                        return false;
                    }

                    room.videoId = id;
                    room.currentTime = 0;
                    room.isPlaying = false;
                },
                (code, { videoId }) => {
                    io.to(code).emit("change_video", {
                        videoId: String(videoId).trim(),
                    });
                }
            )
        );

        // Host-only role management.
        socket.on(
            "assign_role",
            safe(socket, async ({ username, role } = {}) => {
                const sender = getUser(socket.id);

                if (!sender || sender.role !== "host") {
                    socket.emit("permission_denied");
                    return;
                }

                if (!["moderator", "participant"].includes(role)) {
                    return;
                }

                const room = await Room.findOne({
                    roomCode: sender.roomCode,
                });

                if (!room) return;

                const participant = room.participants.find(
                    (p) => p.username === username
                );

                if (!participant || participant.role === "host") {
                    return;
                }

                participant.role = role;
                await room.save();

                if (participant.socketId) {
                    updateRole(participant.socketId, role);
                }

                io.to(sender.roomCode).emit("role_assigned", {
                    username,
                    role,
                    participants: room.participants,
                });
            })
        );

        // Host-only participant removal.
        socket.on(
            "remove_participant",
            safe(socket, async ({ username } = {}) => {
                const sender = getUser(socket.id);

                if (!sender || sender.role !== "host") {
                    socket.emit("permission_denied");
                    return;
                }

                const room = await Room.findOne({
                    roomCode: sender.roomCode,
                });

                if (!room) return;

                const participant = room.participants.find(
                    (p) => p.username === username
                );

                if (!participant || participant.role === "host") {
                    return;
                }

                room.participants = room.participants.filter(
                    (p) => p.username !== username
                );

                await room.save();

                if (participant.socketId) {
                    const targetSocket = io.sockets.sockets.get(
                        participant.socketId
                    );

                    if (targetSocket) {
                        targetSocket.emit("removed_from_room");
                        targetSocket.leave(sender.roomCode);
                    }

                    removeUser(participant.socketId);
                }

                io.to(sender.roomCode).emit("participant_removed", {
                    username,
                    participants: room.participants,
                });
            })
        );

        // Handle disconnect and preserve participant history.
        socket.on(
            "disconnect",
            safe(socket, async () => {
                const user = getUser(socket.id);

                removeUser(socket.id);

                if (user) {
                    const room = await Room.findOne({
                        roomCode: user.roomCode,
                    });

                    const participant = room?.participants.find(
                        (p) => p.username === user.username
                    );

                    // Do not clear a newer socket's connection.
                    if (
                        room &&
                        participant &&
                        participant.socketId === socket.id
                    ) {
                        participant.socketId = null;
                        await room.save();
                    }

                    io.to(user.roomCode).emit("user_left", {
                        username: user.username,
                        participants: room?.participants || [],
                    });
                }

                console.log("Disconnected:", socket.id);
            })
        );
    });
}