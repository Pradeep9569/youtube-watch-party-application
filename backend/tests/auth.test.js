import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { installFakeModels, startServer } from "./helpers.js";

const { default: app } = await import("../app.js");
const { default: registerSocketHandlers } = await import("../socket/socketHandler.js");

let srv;
before(async () => {
  installFakeModels();
  srv = await startServer(app, registerSocketHandlers);
});
after(() => srv.close());

const post = (path, body, headers = {}) =>
  fetch(srv.url + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const alice = { username: "alice", email: "Alice@Example.com", password: "secret123" };

test("register: success returns 201, no password/hash in response", async () => {
  const res = await post("/api/auth/register", alice);
  const data = await res.json();
  assert.equal(res.status, 201);
  assert.equal(data.user.email, "alice@example.com"); // normalised
  assert.ok(!JSON.stringify(data).includes("password"));
  assert.ok(!JSON.stringify(data).includes("$2")); // no bcrypt hash
});

test("register: missing fields -> 400 with clear message", async () => {
  const res = await post("/api/auth/register", { username: "bob" });
  assert.equal(res.status, 400);
  assert.match((await res.json()).message, /required/i);
});

test("register: invalid email -> 400", async () => {
  const res = await post("/api/auth/register", { username: "bob", email: "nope", password: "secret123" });
  assert.equal(res.status, 400);
});

test("register: short password -> 400", async () => {
  const res = await post("/api/auth/register", { username: "bob", email: "b@x.com", password: "123" });
  assert.equal(res.status, 400);
});

test("register: duplicate email -> 409 (any letter case)", async () => {
  const res = await post("/api/auth/register", { ...alice, username: "alice2", email: "ALICE@example.com" });
  assert.equal(res.status, 409);
  assert.match((await res.json()).message, /email/i);
});

test("register: duplicate username -> 409", async () => {
  const res = await post("/api/auth/register", { ...alice, email: "other@example.com" });
  assert.equal(res.status, 409);
  assert.match((await res.json()).message, /username/i);
});

test("register: malformed JSON -> 400 JSON error (not an HTML stack trace)", async () => {
  const res = await post("/api/auth/register", "{bad json");
  assert.equal(res.status, 400);
  assert.equal((await res.json()).message, "Invalid JSON body");
});

test("login: valid credentials -> 200 + token + safe user", async () => {
  const res = await post("/api/auth/login", { email: "alice@example.com", password: "secret123" });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.ok(data.token);
  assert.ok(!("password" in data.user));
});

test("login: wrong password and unknown email -> identical 401", async () => {
  const a = await post("/api/auth/login", { email: "alice@example.com", password: "wrong-pass" });
  const b = await post("/api/auth/login", { email: "ghost@example.com", password: "whatever1" });
  assert.equal(a.status, 401);
  assert.equal(b.status, 401);
  assert.equal((await a.json()).message, (await b.json()).message);
});

test("login: missing body fields -> 400", async () => {
  const res = await post("/api/auth/login", {});
  assert.equal(res.status, 400);
});

test("route paths: /api/auth/login exists, /api/auth/auth/login is 404", async () => {
  const ok = await post("/api/auth/login", {});
  const dup = await post("/api/auth/auth/login", {});
  assert.notEqual(ok.status, 404);
  assert.equal(dup.status, 404);
});

test("/me: no token -> 401, bad token -> 401, valid Bearer token -> 200", async () => {
  assert.equal((await fetch(srv.url + "/api/auth/me")).status, 401);
  assert.equal((await fetch(srv.url + "/api/auth/me", { headers: { Authorization: "Bearer garbage" } })).status, 401);

  const login = await (await post("/api/auth/login", { email: "alice@example.com", password: "secret123" })).json();
  const me = await fetch(srv.url + "/api/auth/me", { headers: { Authorization: `Bearer ${login.token}` } });
  const data = await me.json();
  assert.equal(me.status, 200);
  assert.equal(data.user.username, "alice");
  assert.ok(!("password" in data.user));
});

test("rooms API is protected: 401 without token, works with token", async () => {
  assert.equal((await post("/api/rooms/create", { username: "alice" })).status, 401);
  const login = await (await post("/api/auth/login", { email: "alice@example.com", password: "secret123" })).json();
  const res = await post("/api/rooms/create", { username: "alice" }, { Authorization: `Bearer ${login.token}` });
  const room = await res.json();
  assert.equal(res.status, 201);
  assert.match(room.roomCode, /^[A-Z0-9]{6}$/);
});

test("CORS: allowed Vercel origin echoed with credentials; unknown origin not allowed", async () => {
  const good = await fetch(srv.url + "/api/auth/login", {
    method: "OPTIONS",
    headers: { Origin: "https://frontend.example.vercel.app", "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type,authorization" },
  });
  assert.equal(good.headers.get("access-control-allow-origin"), "https://frontend.example.vercel.app");
  assert.equal(good.headers.get("access-control-allow-credentials"), "true");

  const bad = await fetch(srv.url + "/api/auth/login", {
    method: "OPTIONS",
    headers: { Origin: "https://evil.example.com", "Access-Control-Request-Method": "POST" },
  });
  assert.equal(bad.headers.get("access-control-allow-origin"), null);
});

test("health endpoints and unknown routes", async () => {
  assert.equal((await fetch(srv.url + "/")).status, 200);
  assert.equal((await fetch(srv.url + "/health")).status, 200);
  assert.equal((await fetch(srv.url + "/nope")).status, 404);
});
