// Simple token auth for the staff/admin page.
// Login with the admin password -> receive a token -> send it back as
//   Authorization: Bearer <token>
// on every /api/admin/* request.

import crypto from "crypto";
import { config } from "./config.js";

// token -> expiresAt (timestamp). In-memory: restarting the server logs everyone out.
const sessions = new Map();

export function createSession() {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + config.tokenTtlMs;
  sessions.set(token, expiresAt);
  return { token, expiresAt: new Date(expiresAt).toISOString() };
}

export function verifyToken(token) {
  if (typeof token !== "string" || token.length < 10) return false;
  const expiresAt = sessions.get(token);
  if (!expiresAt) return false;
  if (expiresAt < Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function destroySession(token) {
  sessions.delete(token);
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!verifyToken(token)) {
    return res.status(401).json({ error: "Not signed in. Please log in on the staff page." });
  }
  next();
}

// Housekeeping: drop expired tokens every hour.
setInterval(() => {
  const now = Date.now();
  for (const [token, exp] of sessions) if (exp < now) sessions.delete(token);
}, 60 * 60 * 1000).unref();
