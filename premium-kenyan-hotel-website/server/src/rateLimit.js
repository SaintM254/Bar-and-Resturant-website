// Tiny fixed-window rate limiter (per IP). Keeps bots from spamming
// the booking form or guessing the admin password.

export function rateLimit({ windowMs, max, message }) {
  const hits = new Map(); // ip -> { count, resetAt }
  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    const now = Date.now();
    let entry = hits.get(ip);
    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(ip, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      return res.status(429).json({
        error: message || "Too many requests — please slow down and try again shortly.",
      });
    }
    next();
  };
}
