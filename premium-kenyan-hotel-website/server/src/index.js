// The Acacia House — backend API
//   Public : GET  /api/health, /api/config, /api/menu ; POST /api/reservations
//   Staff  : POST /api/admin/login ; GET/PATCH /api/admin/reservations ;
//            GET/POST/PUT/DELETE /api/admin/menu/items + /drinks ; GET /api/admin/stats

import express from "express";
import cors from "cors";
import { config, RESERVATION_STATUS, MENU_GROUP_LABELS } from "./config.js";
import { initDb, mutate, db, newId, newBookingRef } from "./db.js";
import { slugify } from "./seed.js";
import {
  validateReservation,
  validateMenuItem,
  validateDrink,
  todayNairobi,
  formatKES,
} from "./validators.js";
import { createSession, destroySession, requireAdmin } from "./auth.js";
import { rateLimit } from "./rateLimit.js";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

// CORS: in preview allow everywhere; in production set ALLOWED_ORIGIN.
if (config.allowedOrigins.length > 0) {
  app.use(cors({ origin: config.allowedOrigins }));
} else {
  app.use(cors());
}

initDb();

/* ---------------- public helpers ---------------- */

const pexImg = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=880&h=660&fit=crop`;
const pexThumb = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&fit=crop`;

function publicMenuItem(item) {
  return {
    id: item.id,
    name: item.name,
    desc: item.desc,
    price: formatKES(item.priceKES),
    img: item.imageUrl || (item.pexelsId ? pexImg(item.pexelsId) : ""),
    thumb: item.imageUrl || (item.pexelsId ? pexThumb(item.pexelsId) : ""),
    available: item.available,
  };
}

function publicDrink(drink) {
  return {
    id: drink.id,
    name: drink.name,
    desc: drink.desc,
    price: formatKES(drink.priceKES),
    available: drink.available,
  };
}

function publicMenuPayload() {
  const { menuItems, drinks } = db();
  const live = menuItems.filter((i) => i.available);
  return {
    featured: live.filter((i) => i.category === "featured").map(publicMenuItem),
    groups: Object.entries(MENU_GROUP_LABELS).map(([category, group]) => ({
      group,
      items: live.filter((i) => i.category === category).map(publicMenuItem),
    })),
    drinks: drinks.filter((d) => d.available).map(publicDrink),
  };
}

/** Seats already taken for a date+time (ignores cancelled & no-show). */
function seatsTaken(date, time) {
  return db()
    .reservations.filter((r) => r.date === date && r.time === time && !["cancelled", "no-show"].includes(r.status))
    .reduce((sum, r) => sum + r.guestsCount, 0);
}

/* ---------------- public routes ---------------- */

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "acacia-house-api", time: new Date().toISOString() });
});

app.get("/api/config", (req, res) => {
  res.json({
    timeSlots: config.timeSlots,
    guestOptions: config.guestOptions,
    maxDaysAhead: config.maxDaysAhead,
    maxGuestsPerSlot: config.maxGuestsPerSlot,
  });
});

app.get("/api/menu", (req, res) => {
  res.json(publicMenuPayload());
});

app.post(
  "/api/reservations",
  rateLimit({ windowMs: 60_000, max: 20, message: "Too many booking attempts — please wait a minute and try again." }),
  (req, res) => {
    const parsed = validateReservation(req.body);
    if (!parsed.ok) return res.status(400).json({ error: "Please check the form.", fields: parsed.errors });

    const { date, time, guestsCount } = parsed.value;
    const taken = seatsTaken(date, time);
    if (taken + guestsCount > config.maxGuestsPerSlot) {
      return res.status(409).json({
        error: `Sorry, ${time} on that day is fully booked — please choose another time.`,
        code: "SLOT_FULL",
      });
    }

    const reservation = mutate((store) => {
      const row = {
        id: newId("rsv"),
        ref: newBookingRef(),
        ...parsed.value,
        status: "pending",
        source: "website",
        createdAt: new Date().toISOString(),
      };
      store.reservations.push(row);
      return row;
    });

    res.status(201).json({
      message: "Reservation received.",
      reservation: {
        ref: reservation.ref,
        name: reservation.name,
        date: reservation.date,
        time: reservation.time,
        guests: reservation.guestsLabel,
      },
    });
  }
);

/* ---------------- staff auth ---------------- */

app.post(
  "/api/admin/login",
  rateLimit({ windowMs: 60_000, max: 10, message: "Too many login attempts — please wait a minute." }),
  (req, res) => {
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    // Constant-time-ish compare to avoid timing leaks.
    const expected = config.adminPassword;
    const ok =
      password.length === expected.length &&
      password.split("").reduce((acc, ch, i) => acc | (ch.charCodeAt(0) ^ expected.charCodeAt(i)), 0) === 0;
    if (!ok) return res.status(401).json({ error: "Wrong password." });
    res.json({ message: "Welcome back.", ...createSession() });
  }
);

app.post("/api/admin/logout", requireAdmin, (req, res) => {
  const token = (req.headers.authorization || "").slice(7);
  destroySession(token);
  res.json({ message: "Signed out." });
});

/* ---------------- staff: reservations ---------------- */

app.get("/api/admin/reservations", requireAdmin, (req, res) => {
  const { date = "", status = "", upcoming = "" } = req.query;
  const today = todayNairobi();
  let rows = [...db().reservations];
  if (date) rows = rows.filter((r) => r.date === date);
  if (status) rows = rows.filter((r) => r.status === status);
  if (upcoming === "1") rows = rows.filter((r) => r.date >= today && !["cancelled", "no-show"].includes(r.status));
  rows.sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1));
  res.json({ reservations: rows });
});

app.patch("/api/admin/reservations/:id", requireAdmin, (req, res) => {
  const { status } = req.body || {};
  if (!RESERVATION_STATUS.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${RESERVATION_STATUS.join(", ")}.` });
  }
  const updated = mutate((store) => {
    const row = store.reservations.find((r) => r.id === req.params.id);
    if (!row) return null;
    row.status = status;
    row.updatedAt = new Date().toISOString();
    return row;
  });
  if (!updated) return res.status(404).json({ error: "Booking not found." });
  res.json({ message: `Booking ${updated.ref} marked as ${status}.`, reservation: updated });
});

app.get("/api/admin/stats", requireAdmin, (req, res) => {
  const today = todayNairobi();
  const rows = db().reservations.filter((r) => !["cancelled", "no-show"].includes(r.status));
  res.json({
    today: todayNairobi(),
    pending: rows.filter((r) => r.status === "pending").length,
    todayCount: rows.filter((r) => r.date === today).length,
    upcomingCount: rows.filter((r) => r.date >= today).length,
    upcomingGuests: rows.filter((r) => r.date >= today).reduce((s, r) => s + r.guestsCount, 0),
  });
});

/* ---------------- staff: menu ---------------- */

app.get("/api/admin/menu", requireAdmin, (req, res) => {
  res.json({ items: db().menuItems, drinks: db().drinks });
});

function uniqueId(collection, base) {
  const ids = new Set(collection.map((x) => x.id));
  let id = slugify(base) || "item";
  if (!ids.has(id)) return id;
  let n = 2;
  while (ids.has(`${id}-${n}`)) n += 1;
  return `${id}-${n}`;
}

app.post("/api/admin/menu/items", requireAdmin, (req, res) => {
  const parsed = validateMenuItem(req.body);
  if (!parsed.ok) return res.status(400).json({ error: "Please check the dish.", fields: parsed.errors });
  const item = mutate((store) => {
    const row = { id: uniqueId(store.menuItems, parsed.value.name), ...parsed.value };
    store.menuItems.push(row);
    return row;
  });
  res.status(201).json({ message: "Dish added.", item });
});

app.put("/api/admin/menu/items/:id", requireAdmin, (req, res) => {
  const parsed = validateMenuItem(req.body, { partial: true });
  if (!parsed.ok) return res.status(400).json({ error: "Please check the dish.", fields: parsed.errors });
  const item = mutate((store) => {
    const row = store.menuItems.find((i) => i.id === req.params.id);
    if (!row) return null;
    Object.assign(row, parsed.value);
    return row;
  });
  if (!item) return res.status(404).json({ error: "Dish not found." });
  res.json({ message: "Dish updated.", item });
});

app.delete("/api/admin/menu/items/:id", requireAdmin, (req, res) => {
  const removed = mutate((store) => {
    const idx = store.menuItems.findIndex((i) => i.id === req.params.id);
    if (idx === -1) return null;
    return store.menuItems.splice(idx, 1)[0];
  });
  if (!removed) return res.status(404).json({ error: "Dish not found." });
  res.json({ message: `“${removed.name}” removed from the menu.` });
});

app.post("/api/admin/menu/drinks", requireAdmin, (req, res) => {
  const parsed = validateDrink(req.body);
  if (!parsed.ok) return res.status(400).json({ error: "Please check the drink.", fields: parsed.errors });
  const drink = mutate((store) => {
    const row = { id: uniqueId(store.drinks, parsed.value.name), ...parsed.value };
    store.drinks.push(row);
    return row;
  });
  res.status(201).json({ message: "Drink added.", drink });
});

app.put("/api/admin/menu/drinks/:id", requireAdmin, (req, res) => {
  const parsed = validateDrink(req.body, { partial: true });
  if (!parsed.ok) return res.status(400).json({ error: "Please check the drink.", fields: parsed.errors });
  const drink = mutate((store) => {
    const row = store.drinks.find((d) => d.id === req.params.id);
    if (!row) return null;
    Object.assign(row, parsed.value);
    return row;
  });
  if (!drink) return res.status(404).json({ error: "Drink not found." });
  res.json({ message: "Drink updated.", drink });
});

app.delete("/api/admin/menu/drinks/:id", requireAdmin, (req, res) => {
  const removed = mutate((store) => {
    const idx = store.drinks.findIndex((d) => d.id === req.params.id);
    if (idx === -1) return null;
    return store.drinks.splice(idx, 1)[0];
  });
  if (!removed) return res.status(404).json({ error: "Drink not found." });
  res.json({ message: `“${removed.name}” removed from the bar list.` });
});

/* ---------------- fallback + errors ---------------- */

app.use("/api", (req, res) => res.status(404).json({ error: "Unknown API address." }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body must be valid JSON." });
  }
  console.error("API error:", err);
  res.status(500).json({ error: "Something went wrong on our side — please try again." });
});

app.listen(config.port, "0.0.0.0", () => {
  console.log(`\n  Acacia House API listening on http://localhost:${config.port}`);
  console.log(`  Health check: http://localhost:${config.port}/api/health`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log(`  Staff password (default, set ADMIN_PASSWORD to change): ${config.adminPassword}`);
  }
  if (config.allowedOrigins.length === 0) {
    console.log(`  CORS: allowing all origins (preview mode — set ALLOWED_ORIGIN in production)`);
  }
  console.log("");
});
