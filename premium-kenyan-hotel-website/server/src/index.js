// The Acacia House — backend API
//   Public : GET  /api/health, /api/config, /api/menu ; POST /api/reservations
//   Staff  : POST /api/admin/login ; GET/PATCH /api/admin/reservations ;
//            GET/POST/PUT/DELETE /api/admin/menu/items + /drinks ; GET /api/admin/stats
//
// Storage: Postgres when DATABASE_URL is set (production), else local JSON
// files (preview). See store.js.

import express from "express";
import cors from "cors";
import { config, RESERVATION_STATUS, MENU_GROUP_LABELS } from "./config.js";
import { getStore, newId, newBookingRef } from "./store.js";
import { slugify } from "./seed.js";
import { mountGallery } from "./gallery.js";
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

// Express 4 doesn't catch async errors — wrap every async handler.
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const store = await getStore();
mountGallery(app, store);

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

async function publicMenuPayload() {
  const [menuItems, drinks] = await Promise.all([store.listMenuItems(), store.listDrinks()]);
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

function uniqueId(existingIds, base) {
  const ids = new Set(existingIds);
  const id = slugify(base) || "item";
  if (!ids.has(id)) return id;
  let n = 2;
  while (ids.has(`${id}-${n}`)) n += 1;
  return `${id}-${n}`;
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

app.get("/api/menu", ah(async (req, res) => {
  res.json(await publicMenuPayload());
}));

app.post(
  "/api/reservations",
  rateLimit({ windowMs: 60_000, max: 20, message: "Too many booking attempts — please wait a minute and try again." }),
  ah(async (req, res) => {
    const parsed = validateReservation(req.body);
    if (!parsed.ok) return res.status(400).json({ error: "Please check the form.", fields: parsed.errors });

    const { date, time, guestsCount } = parsed.value;
    const taken = await store.countSeats(date, time);
    if (taken + guestsCount > config.maxGuestsPerSlot) {
      return res.status(409).json({
        error: `Sorry, ${time} on that day is fully booked — please choose another time.`,
        code: "SLOT_FULL",
      });
    }

    const reservation = await store.createReservation({
      id: newId("rsv"),
      ref: newBookingRef(),
      ...parsed.value,
      status: "pending",
      source: "website",
      createdAt: new Date().toISOString(),
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
  })
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

app.get("/api/admin/reservations", requireAdmin, ah(async (req, res) => {
  const { date = "", status = "", upcoming = "" } = req.query;
  const rows = await store.listReservations({
    date,
    status,
    upcoming: upcoming === "1",
    today: todayNairobi(),
  });
  res.json({ reservations: rows });
}));

app.patch("/api/admin/reservations/:id", requireAdmin, ah(async (req, res) => {
  const { status } = req.body || {};
  if (!RESERVATION_STATUS.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${RESERVATION_STATUS.join(", ")}.` });
  }
  const updated = await store.setReservationStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ error: "Booking not found." });
  res.json({ message: `Booking ${updated.ref} marked as ${status}.`, reservation: updated });
}));

app.get("/api/admin/stats", requireAdmin, ah(async (req, res) => {
  const today = todayNairobi();
  res.json({ today, ...(await store.stats(today)) });
}));

/* ---------------- staff: menu ---------------- */

app.get("/api/admin/menu", requireAdmin, ah(async (req, res) => {
  const [items, drinks] = await Promise.all([store.listMenuItems(), store.listDrinks()]);
  res.json({ items, drinks });
}));

app.post("/api/admin/menu/items", requireAdmin, ah(async (req, res) => {
  const parsed = validateMenuItem(req.body);
  if (!parsed.ok) return res.status(400).json({ error: "Please check the dish.", fields: parsed.errors });
  const existing = await store.listMenuItems();
  const item = await store.createMenuItem({
    id: uniqueId(existing.map((i) => i.id), parsed.value.name),
    ...parsed.value,
  });
  res.status(201).json({ message: "Dish added.", item });
}));

app.put("/api/admin/menu/items/:id", requireAdmin, ah(async (req, res) => {
  const parsed = validateMenuItem(req.body, { partial: true });
  if (!parsed.ok) return res.status(400).json({ error: "Please check the dish.", fields: parsed.errors });
  const item = await store.updateMenuItem(req.params.id, parsed.value);
  if (!item) return res.status(404).json({ error: "Dish not found." });
  res.json({ message: "Dish updated.", item });
}));

app.delete("/api/admin/menu/items/:id", requireAdmin, ah(async (req, res) => {
  const removed = await store.deleteMenuItem(req.params.id);
  if (!removed) return res.status(404).json({ error: "Dish not found." });
  res.json({ message: `“${removed.name}” removed from the menu.` });
}));

app.post("/api/admin/menu/drinks", requireAdmin, ah(async (req, res) => {
  const parsed = validateDrink(req.body);
  if (!parsed.ok) return res.status(400).json({ error: "Please check the drink.", fields: parsed.errors });
  const existing = await store.listDrinks();
  const drink = await store.createDrink({
    id: uniqueId(existing.map((d) => d.id), parsed.value.name),
    ...parsed.value,
  });
  res.status(201).json({ message: "Drink added.", drink });
}));

app.put("/api/admin/menu/drinks/:id", requireAdmin, ah(async (req, res) => {
  const parsed = validateDrink(req.body, { partial: true });
  if (!parsed.ok) return res.status(400).json({ error: "Please check the drink.", fields: parsed.errors });
  const drink = await store.updateDrink(req.params.id, parsed.value);
  if (!drink) return res.status(404).json({ error: "Drink not found." });
  res.json({ message: "Drink updated.", drink });
}));

app.delete("/api/admin/menu/drinks/:id", requireAdmin, ah(async (req, res) => {
  const removed = await store.deleteDrink(req.params.id);
  if (!removed) return res.status(404).json({ error: "Drink not found." });
  res.json({ message: `“${removed.name}” removed from the bar list.` });
}));

/* ---------------- status page (so opening the API address isn't a blank screen) ---------------- */

app.get("/", ah(async (req, res) => {
  const rows = await store.listReservations({});
  res.send(`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Acacia House API</title>
<style>body{font-family:Georgia,serif;background:#faf7f1;color:#221b12;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}
.card{border:1px solid #e3dac9;background:#fcfaf5;padding:40px 48px;max-width:520px;text-align:center}
h1{font-weight:500;margin:0 0 8px}.ok{color:#2e7d4f;font-weight:bold}
a{color:#a4512a}p{line-height:1.7;color:#564c3f}</style></head>
<body><div class="card">
<h1>The Acacia House — API</h1>
<p class="ok">● Backend is running</p>
<p>${rows.length} booking(s) stored. This address is for the app's data only —
please use the <strong>Restaurant Website</strong> preview to see the site.</p>
<p><a href="/api/health">health check</a> · <a href="/api/menu">menu data</a></p>
</div></body></html>`);
}));

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
  if (!process.env.DATABASE_URL) {
    console.log(`  Tip: set DATABASE_URL to use Postgres instead of JSON files.`);
  }
  if (config.allowedOrigins.length === 0) {
    console.log(`  CORS: allowing all origins (preview mode — set ALLOWED_ORIGIN in production)`);
  }
  console.log("");
});
