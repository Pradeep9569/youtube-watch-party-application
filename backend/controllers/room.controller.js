import { randomUUID } from "crypto";
import Room from "../models/Room.js";

const makeRoomCode = () =>
    randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();

const getAuthenticatedUsername = (req) =>
    String(
        req.user?.username ||
        req.user?.user?.username ||
        req.user?.name ||
        ""
    ).trim();

export const createRoom = async (req, res) => {
    try {
        const username = getAuthenticatedUsername(req);

        if (!username) {
            return res.status(401).json({
                message: "Authentication required. Please log in again.",
            });
        }

        for (let attempt = 0; attempt < 5; attempt++) {
            try {
                const room = await Room.create({
                    roomCode: makeRoomCode(),
                    host: username,
                    participants: [
                        {
                            username,
                            role: "host",
                        },
                    ],
                });

                return res.status(201).json(room);
            } catch (error) {
                // Retry only for duplicate-key collisions.
                if (error?.code === 11000) {
                    continue;
                }

                throw error;
            }
        }

        return res.status(500).json({
            message: "Could not generate a unique room code. Please try again.",
        });
    } catch (error) {
        console.error("createRoom error:", error);

        return res.status(500).json({
            message: "Failed to create room.",
        });
    }
};

export const joinRoom = async (req, res) => {
    try {
        const username = getAuthenticatedUsername(req);
        const roomCode = String(
            req.body?.roomCode || ""
        ).trim().toUpperCase();

        if (!username) {
            return res.status(401).json({
                message: "Authentication required. Please log in again.",
            });
        }

        if (!/^[A-F0-9]{6}$/.test(roomCode)) {
            return res.status(400).json({
                message: "Please provide a valid room code.",
            });
        }

        const room = await Room.findOne({ roomCode });

        if (!room) {
            return res.status(404).json({
                message: "Room not found.",
            });
        }

        const existingParticipant = room.participants.find(
            (participant) => participant.username === username
        );

        if (!existingParticipant) {
            room.participants.push({
                username,
                role: "participant",
            });

            await room.save();
        }

        return res.status(200).json(room);
    } catch (error) {
        console.error("joinRoom error:", error);

        return res.status(500).json({
            message: "Failed to join room.",
        });
    }
};