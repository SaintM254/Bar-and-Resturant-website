// JSON-file backend. Zero setup; used for local preview and tests.
// Selected automatically when DATABASE_URL is not set.
// Same interface as pgStore.js — the API code can't tell the difference.

import fs from "fs";
import path from "path";
import { config } from "./config.js";
import { seedMenuItems, seedDrinks, seedGallery } from "./seed.js";

const FILES = {
  reservations: "reservations.json",
  menuItems: "menu-items.json",
  drinks: "drinks.json",
  gallery: "gallery.json",
};

const filePath = (collection) => path.join(config.dataDir, FILES[collection]);

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

// Atomic save (temp file + rename) so a crash can't corrupt data.
function writeAtomic(file, value) {
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, file);
}

const live = (rows) => rows.filter((r) => !["cancelled", "no-show"].includes(r.status));

export function createJsonStore() {
  fs.mkdirSync(config.dataDir, { recursive: true });
  const s = {
    reservations: readJson(filePath("reservations"), null) ?? [],
    menuItems: readJson(filePath("menuItems"), null) ?? seedMenuItems(),
    drinks: readJson(filePath("drinks"), null) ?? seedDrinks(),
    gallery: readJson(filePath("gallery"), null) ?? seedGallery(),
  };
  const persist = () => {
    for (const key of Object.keys(FILES)) writeAtomic(filePath(key), s[key]);
  };
  persist(); // writes seed files on first run

  return {
    kind: "json",

    async listReservations({ date, status, upcoming, today }) {
      let rows = [...s.reservations];
      if (date) rows = rows.filter((r) => r.date === date);
      if (status) rows = rows.filter((r) => r.status === status);
      if (upcoming) rows = live(rows).filter((r) => r.date >= today);
      rows.sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1));
      return rows;
    },

    async createReservation(row) {
      s.reservations.push(row);
      persist();
      return row;
    },

    async setReservationStatus(id, status) {
      const row = s.reservations.find((r) => r.id === id);
      if (!row) return null;
      row.status = status;
      row.updatedAt = new Date().toISOString();
      persist();
      return row;
    },

    async countSeats(date, time) {
      return live(s.reservations)
        .filter((r) => r.date === date && r.time === time)
        .reduce((sum, r) => sum + r.guestsCount, 0);
    },

    async stats(today) {
      const rows = live(s.reservations);
      const upcoming = rows.filter((r) => r.date >= today);
      return {
        pending: rows.filter((r) => r.status === "pending").length,
        todayCount: rows.filter((r) => r.date === today).length,
        upcomingCount: upcoming.length,
        upcomingGuests: upcoming.reduce((sum, r) => sum + r.guestsCount, 0),
      };
    },

    async listMenuItems() {
      return [...s.menuItems];
    },
    async createMenuItem(row) {
      s.menuItems.push(row);
      persist();
      return row;
    },
    async updateMenuItem(id, patch) {
      const row = s.menuItems.find((i) => i.id === id);
      if (!row) return null;
      Object.assign(row, patch);
      persist();
      return row;
    },
    async deleteMenuItem(id) {
      const idx = s.menuItems.findIndex((i) => i.id === id);
      if (idx === -1) return null;
      const [removed] = s.menuItems.splice(idx, 1);
      persist();
      return removed;
    },

    async listDrinks() {
      return [...s.drinks];
    },
    async createDrink(row) {
      s.drinks.push(row);
      persist();
      return row;
    },
    async updateDrink(id, patch) {
      const row = s.drinks.find((d) => d.id === id);
      if (!row) return null;
      Object.assign(row, patch);
      persist();
      return row;
    },
    async deleteDrink(id) {
      const idx = s.drinks.findIndex((d) => d.id === id);
      if (idx === -1) return null;
      const [removed] = s.drinks.splice(idx, 1);
      persist();
      return removed;
    },

    async listGallery({ visibleOnly }) {
      const rows = visibleOnly ? s.gallery.filter((g) => g.visible) : [...s.gallery];
      rows.sort((a, b) => a.position - b.position || (a.id < b.id ? -1 : 1));
      return rows;
    },
    async createGalleryItem(row) {
      s.gallery.push(row);
      persist();
      return row;
    },
    async updateGalleryItem(id, patch) {
      const row = s.gallery.find((g) => g.id === id);
      if (!row) return null;
      Object.assign(row, patch);
      persist();
      return row;
    },
    async deleteGalleryItem(id) {
      const idx = s.gallery.findIndex((g) => g.id === id);
      if (idx === -1) return null;
      const [removed] = s.gallery.splice(idx, 1);
      persist();
      return removed;
    },

    async close() {},
  };
}
