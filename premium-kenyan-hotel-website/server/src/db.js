// Tiny JSON-file database. No setup needed:
// - First run creates server/data/*.json from the seed menu.
// - Every save writes atomically (temp file + rename) so a crash can't corrupt data.
//
// Good for a restaurant's volume. If you ever outgrow it, swap this file for
// SQLite/Postgres — the rest of the code only uses the functions below.

import fs from "fs";
import path from "path";
import { config } from "./config.js";
import { seedMenuItems, seedDrinks } from "./seed.js";

const FILES = {
  reservations: "reservations.json",
  menuItems: "menu-items.json",
  drinks: "drinks.json",
};

let store = null;

function filePath(collection) {
  return path.join(config.dataDir, FILES[collection]);
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJsonAtomic(file, value) {
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, file);
}

export function initDb() {
  fs.mkdirSync(config.dataDir, { recursive: true });
  store = {
    reservations: readJson(filePath("reservations"), null) ?? [],
    menuItems: readJson(filePath("menuItems"), null) ?? seedMenuItems(),
    drinks: readJson(filePath("drinks"), null) ?? seedDrinks(),
  };
  persist(); // writes seed files on first run
  return store;
}

export function persist() {
  for (const key of Object.keys(FILES)) writeJsonAtomic(filePath(key), store[key]);
}

/** Run a mutation and save afterwards. Usage: mutate(() => store.reservations.push(x)) */
export function mutate(fn) {
  const result = fn(store);
  persist();
  return result;
}

export function db() {
  if (!store) throw new Error("Database not initialised — call initDb() first.");
  return store;
}

export function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Short guest-facing booking reference, e.g. AH-7KQ2D9 */
export function newBookingRef() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let ref = "";
  for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return `AH-${ref}`;
}
