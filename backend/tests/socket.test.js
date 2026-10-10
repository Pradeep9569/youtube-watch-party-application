import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "module";
import jwt from "jsonwebtoken";
import { installFakeModels, startServer } from "./helpers.js";

// socket.io-client lives in the frontend workspace
const require = createRequire(new URL("../../frontend/package.json", import.meta.url));
const { io: connect } = require("socket.io-client");

const { default: app } = await import("../app.js");
const { default: registerSocketHandlers } = await import("../socket/socketHandler.js");

let srv, fake;
before(async () => {
  fake = installFakeModels();
  srv = await startServer(app, registerSocketHandlers);
});
after(() => srv.close());

const tokenFor = (username) => jwt.sign({ id: username, username }, process.env.JWT_SECRET);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const once = (s, ev) => new Promise((r) => s.once(ev, r));

function client(username) {
  const s = connect(srv.url, { auth: { token: tokenFor(username) }, transports: ["websocket"], forceNew: true });
  return new Promise((resolve, reject) => {
    s.on("connect", () => resolve(s));
    s.on("connect_error", reject);
  });
}

test("socket: connection without a token is rejected", async () => {
  const s = connect(srv.url, { transports: ["websocket"], forceNew: true, reconnection: false });
  const err = await new Promise((r) => s.on("connect_error", r));
  assert.match(err.message, /Authentication required/);
  s.close();
});

test("socket: room sync, permissions, persisted play state, single chat delivery", async () => {
  await fake.rooms.push({ roomCode: "ABC123", host: "host", videoId: "dQw4w9WgXcQ", currentTime: 0, isPlaying: false,
    participants: [{ username: "host", role: "host", socketId: null }], save: async () => {} });

  const host = await client("host");
  const guest = await client("guest");

  const hostSync = once(host, "sync_state");
  host.emit("join_room", { roomCode: "abc123", username: "host" }); // lower-case code is normalised
  assert.equal((await hostSync).role, "host");

  const guestSync = once(guest, "sync_state");
  guest.emit("join_room", { roomCode: "ABC123", username: "guest" });
  const g = await guestSync;
  assert.equal(g.role, "participant");
  assert.equal(g.participants.length, 2);

  // host play -> guest receives it, and isPlaying is persisted (was lost by the isPaying typo)
  const guestPlay = once(guest, "play");
  host.emit("play", {});
  await guestPlay;
  assert.equal(fake.rooms[0].isPlaying, true);

  // guest cannot control playback or change the video
  const denied = once(guest, "permission_denied");
  guest.emit("pause", {});
  await denied;
  const denied2 = once(guest, "permission_denied");
  guest.emit("seek", { currentTime: 99 });
  await denied2;
  const denied3 = once(guest, "permission_denied");
  guest.emit("change_video", { videoId: "M7lc1UVf-VE" });
  await denied3;
  assert.equal(fake.rooms[0].isPlaying, true);
  assert.equal(fake.rooms[0].currentTime, 0);

  // re-joining must not duplicate chat handlers: one message => one delivery
  guest.emit("join_room", { roomCode: "ABC123", username: "guest" });
  await wait(100);
  let received = 0;
  host.on("chat_message", () => received++);
  guest.emit("send_message", { text: "hello" });
  await wait(200);
  assert.equal(received, 1);

  // non-hosts cannot assign roles; host can
  const d4 = once(guest, "permission_denied");
  guest.emit("assign_role", { username: "guest", role: "moderator" });
  await d4;
  const assigned = once(guest, "role_assigned");
  host.emit("assign_role", { username: "guest", role: "moderator" });
  assert.equal((await assigned).role, "moderator");

  host.close();
  guest.close();
});

test("socket: joining a missing room returns an error", async () => {
  const s = await client("someone");
  const err = once(s, "error_message");
  s.emit("join_room", { roomCode: "ZZZZZZ", username: "someone" });
  assert.equal((await err).message, "Room not found");
  s.close();
});
