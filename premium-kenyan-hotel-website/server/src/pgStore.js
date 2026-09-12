// Postgres backend (Neon in production). Used automatically when DATABASE_URL is set.
// Same interface as jsonStore.js — the API code can't tell the difference.
// SQL is kept deliberately boring (plain CRUD + COUNT/SUM) for max compatibility.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { seedMenuItems, seedDrinks, seedGallery } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIVE = `status NOT IN ('cancelled','no-show')`;

// Row mappers: snake_case columns -> the camelCase shapes the API uses.
const mapReservation = (r) => ({
  id: r.id,
  ref: r.ref,
  name: r.name,
  phone: r.phone,
  date: r.date,
  time: r.time,
  guestsLabel: r.guests_label,
  guestsCount: Number(r.guests_count),
  request: r.request,
  status: r.status,
  source: r.source,
  createdAt: new Date(r.created_at).toISOString(),
  ...(r.updated_at ? { updatedAt: new Date(r.updated_at).toISOString() } : {}),
});

const mapItem = (i) => ({
  id: i.id,
  name: i.name,
  desc: i.desc,
  priceKES: Number(i.price_kes),
  pexelsId: i.pexels_id === null ? null : Number(i.pexels_id),
  imageUrl: i.image_url,
  category: i.category,
  available: i.available,
});

const mapDrink = (d) => ({
  id: d.id,
  name: d.name,
  desc: d.desc,
  priceKES: Number(d.price_kes),
  available: d.available,
});

const mapImage = (g) => ({
  id: g.id,
  caption: g.caption,
  category: g.category,
  path: g.path,
  position: Number(g.position),
  visible: g.visible,
});

export function createPgStore(connectionString, poolOverride) {
  const pool =
    poolOverride ??
    new pg.Pool({
      connectionString,
      // Neon requires SSL. Verification is relaxed so managed certificates
      // can never block booting; traffic is still encrypted.
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  pool.on("error", (err) => console.error("Postgres pool error:", err.message));

  const store = {
    kind: "pg",

    async init() {
      // Run schema statements one by one (works on every driver/emulator).
      const ddl = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
      for (const stmt of ddl.split(";").map((s) => s.trim()).filter(Boolean)) {
        await pool.query(stmt);
      }
      // First boot: seed the menu from the website's original dishes.
      const items = await store.listMenuItems();
      if (items.length === 0) {
        const seed = seedMenuItems();
        for (const dish of seed) await store.createMenuItem(dish);
        console.log(`  Seeded ${seed.length} menu items.`);
      }
      const drinks = await store.listDrinks();
      if (drinks.length === 0) {
        const seed = seedDrinks();
        for (const drink of seed) await store.createDrink(drink);
        console.log(`  Seeded ${seed.length} bar drinks.`);
      }
      const gallery = await store.listGallery({ visibleOnly: false });
      if (gallery.length === 0) {
        const seed = seedGallery();
        for (const img of seed) await store.createGalleryItem(img);
        console.log(`  Seeded ${seed.length} gallery photos.`);
      }
    },

    async listReservations({ date, status, upcoming, today }) {
      const conds = [];
      const params = [];
      if (date) {
        params.push(date);
        conds.push(`date = $${params.length}`);
      }
      if (status) {
        params.push(status);
        conds.push(`status = $${params.length}`);
      }
      if (upcoming) {
        conds.push(LIVE);
        params.push(today);
        conds.push(`date >= $${params.length}`);
      }
      const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
      const { rows } = await pool.query(
        `SELECT * FROM reservations ${where} ORDER BY date, "time"`,
        params
      );
      return rows.map(mapReservation);
    },

    async createReservation(row) {
      const { rows } = await pool.query(
        `INSERT INTO reservations
           (id, ref, name, phone, date, "time", guests_label, guests_count, request, status, source, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING *`,
        [
          row.id,
          row.ref,
          row.name,
          row.phone,
          row.date,
          row.time,
          row.guestsLabel,
          row.guestsCount,
          row.request,
          row.status,
          row.source,
          row.createdAt,
        ]
      );
      return mapReservation(rows[0]);
    },

    async setReservationStatus(id, status) {
      const { rows } = await pool.query(
        `UPDATE reservations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status, id]
      );
      return rows.length ? mapReservation(rows[0]) : null;
    },

    async countSeats(date, time) {
      const { rows } = await pool.query(
        `SELECT COALESCE(SUM(guests_count), 0)::int AS seats
         FROM reservations WHERE date = $1 AND "time" = $2 AND ${LIVE}`,
        [date, time]
      );
      return Number(rows[0].seats);
    },

    async stats(today) {
      // Small table: fetch live rows once and count in JS (100% portable SQL).
      const { rows } = await pool.query(
        `SELECT status, date, guests_count FROM reservations WHERE ${LIVE}`
      );
      const upcoming = rows.filter((r) => r.date >= today);
      return {
        pending: rows.filter((r) => r.status === "pending").length,
        todayCount: rows.filter((r) => r.date === today).length,
        upcomingCount: upcoming.length,
        upcomingGuests: upcoming.reduce((sum, r) => sum + Number(r.guests_count), 0),
      };
    },

    async listMenuItems() {
      const { rows } = await pool.query("SELECT * FROM menu_items");
      return rows.map(mapItem);
    },

    async createMenuItem(dish) {
      const { rows } = await pool.query(
        `INSERT INTO menu_items (id, name, "desc", price_kes, pexels_id, image_url, category, available)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [dish.id, dish.name, dish.desc, dish.priceKES, dish.pexelsId, dish.imageUrl, dish.category, dish.available]
      );
      return mapItem(rows[0]);
    },

    async updateMenuItem(id, patch) {
      const cols = {
        name: "name",
        desc: '"desc"',
        priceKES: "price_kes",
        pexelsId: "pexels_id",
        imageUrl: "image_url",
        category: "category",
        available: "available",
      };
      const sets = [];
      const params = [];
      for (const [key, value] of Object.entries(patch)) {
        if (!(key in cols)) continue;
        params.push(value);
        sets.push(`${cols[key]} = $${params.length}`);
      }
      if (sets.length === 0) {
        const { rows } = await pool.query("SELECT * FROM menu_items WHERE id = $1", [id]);
        return rows.length ? mapItem(rows[0]) : null;
      }
      params.push(id);
      const { rows } = await pool.query(
        `UPDATE menu_items SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`,
        params
      );
      return rows.length ? mapItem(rows[0]) : null;
    },

    async deleteMenuItem(id) {
      const { rows } = await pool.query("DELETE FROM menu_items WHERE id = $1 RETURNING *", [id]);
      return rows.length ? mapItem(rows[0]) : null;
    },

    async listDrinks() {
      const { rows } = await pool.query("SELECT * FROM drinks");
      return rows.map(mapDrink);
    },

    async createDrink(drink) {
      const { rows } = await pool.query(
        `INSERT INTO drinks (id, name, "desc", price_kes, available)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [drink.id, drink.name, drink.desc, drink.priceKES, drink.available]
      );
      return mapDrink(rows[0]);
    },

    async updateDrink(id, patch) {
      const cols = { name: "name", desc: '"desc"', priceKES: "price_kes", available: "available" };
      const sets = [];
      const params = [];
      for (const [key, value] of Object.entries(patch)) {
        if (!(key in cols)) continue;
        params.push(value);
        sets.push(`${cols[key]} = $${params.length}`);
      }
      if (sets.length === 0) {
        const { rows } = await pool.query("SELECT * FROM drinks WHERE id = $1", [id]);
        return rows.length ? mapDrink(rows[0]) : null;
      }
      params.push(id);
      const { rows } = await pool.query(
        `UPDATE drinks SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`,
        params
      );
      return rows.length ? mapDrink(rows[0]) : null;
    },

    async deleteDrink(id) {
      const { rows } = await pool.query("DELETE FROM drinks WHERE id = $1 RETURNING *", [id]);
      return rows.length ? mapDrink(rows[0]) : null;
    },

    async listGallery({ visibleOnly }) {
      const { rows } = await pool.query(
        visibleOnly
          ? "SELECT * FROM gallery_images WHERE visible = TRUE ORDER BY position, id"
          : "SELECT * FROM gallery_images ORDER BY position, id"
      );
      return rows.map(mapImage);
    },

    async createGalleryItem(img) {
      const { rows } = await pool.query(
        `INSERT INTO gallery_images (id, caption, category, path, position, visible)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [img.id, img.caption, img.category, img.path, img.position, img.visible]
      );
      return mapImage(rows[0]);
    },

    async updateGalleryItem(id, patch) {
      const cols = {
        caption: "caption",
        category: "category",
        path: "path",
        position: "position",
        visible: "visible",
      };
      const sets = [];
      const params = [];
      for (const [key, value] of Object.entries(patch)) {
        if (!(key in cols)) continue;
        params.push(value);
        sets.push(`${cols[key]} = $${params.length}`);
      }
      if (sets.length === 0) {
        const { rows } = await pool.query("SELECT * FROM gallery_images WHERE id = $1", [id]);
        return rows.length ? mapImage(rows[0]) : null;
      }
      params.push(id);
      const { rows } = await pool.query(
        `UPDATE gallery_images SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`,
        params
      );
      return rows.length ? mapImage(rows[0]) : null;
    },

    async deleteGalleryItem(id) {
      const { rows } = await pool.query("DELETE FROM gallery_images WHERE id = $1 RETURNING *", [id]);
      return rows.length ? mapImage(rows[0]) : null;
    },

    async close() {
      try {
        await pool.end();
      } catch {
        /* already closed */
      }
    },
  };
  return store;
}
