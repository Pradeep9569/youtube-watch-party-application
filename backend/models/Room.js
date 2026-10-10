import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
  username: { type: String, required: true },
  socketId: { type: String, default: null },
  role: {
    type: String,
    enum: ["host", "moderator", "participant"],
    default: "participant",
  },
});

const roomSchema = new mongoose.Schema(
  {
    roomCode: { type: String, required: true, unique: true },
    host: { type: String, required: true },
    videoId: { type: String, default: "dQw4w9WgXcQ" },
    currentTime: { type: Number, default: 0 },
    // Was misspelled "isPaying": socketHandler writes isPlaying, which Mongoose silently
    // dropped (strict mode), so play state was never persisted or synced to late joiners.
    isPlaying: { type: Boolean, default: false },
    participants: [participantSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
