// Storage picker + shared id helpers.
//   DATABASE_URL set -> Postgres (Neon in production)
//   otherwise         -> JSON files (local preview, zero setup)

import { createJsonStore } from "./jsonStore.js";
import { createPgStore } from "./pgStore.js";

let store = null;

export async function getStore() {
  if (store) return store;
  if (process.env.DATABASE_URL) {
    store = createPgStore(process.env.DATABASE_URL);
    await store.init();
    console.log("  Storage: Postgres");
  } else {
    store = createJsonStore();
    console.log("  Storage: local JSON files");
  }
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
