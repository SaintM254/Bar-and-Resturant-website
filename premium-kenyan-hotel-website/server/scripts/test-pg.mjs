// Exercises the Postgres store against an in-memory emulator (pg-mem).
// Run:  npm run test:pg   (no real database needed)

import { newDb } from "pg-mem";
import { createPgStore } from "../src/pgStore.js";

const assert = (name, cond, extra = "") => {
  console.log(`${cond ? "  PASS" : "  FAIL"}  ${name}${extra ? ` — ${extra}` : ""}`);
  if (!cond) process.exitCode = 1;
};

const mem = newDb();
const { Pool } = mem.adapters.createPg();
const store = createPgStore("postgres://test.local/acacia", new Pool());
await store.init();

const items = await store.listMenuItems();
const drinks = await store.listDrinks();
assert("menu seeded (17 dishes)", items.length === 17, `${items.length} items`);
assert("drinks seeded (6)", drinks.length === 6, `${drinks.length} drinks`);
const chicken = items.find((i) => i.id === "grilled-chicken");
assert("dish shape", !!chicken && chicken.priceKES === 850 && chicken.category === "featured");

// --- reservations ---
const mk = (over = {}) => ({
  id: "t1",
  ref: "AH-TEST01",
  name: "Test Guest",
  phone: "+254700000000",
  date: "2026-10-01",
  time: "7:00 PM",
  guestsLabel: "4",
  guestsCount: 4,
  request: "",
  status: "pending",
  source: "website",
  createdAt: new Date().toISOString(),
  ...over,
});
const r1 = await store.createReservation(mk());
assert("create booking", r1.ref === "AH-TEST01" && r1.status === "pending");
await store.createReservation(mk({ id: "t2", ref: "AH-TEST02", guestsLabel: "9+ (Group)", guestsCount: 12 }));
assert("seats counted (4+12=16)", (await store.countSeats("2026-10-01", "7:00 PM")) === 16);
assert("other slot empty", (await store.countSeats("2026-10-01", "8:00 PM")) === 0);
const upd = await store.setReservationStatus("t1", "confirmed");
assert("status update", upd.status === "confirmed" && !!upd.updatedAt);
assert("missing booking -> null", (await store.setReservationStatus("nope", "confirmed")) === null);
const upcoming = await store.listReservations({ upcoming: true, today: "2026-09-12" });
assert("upcoming lists both", upcoming.length === 2);
const day = await store.listReservations({ date: "2026-10-01" });
assert("date filter", day.length === 2);
const st = await store.stats("2026-09-12");
assert(
  "stats correct",
  st.pending === 1 && st.upcomingCount === 2 && st.upcomingGuests === 16,
  JSON.stringify(st)
);

// --- menu CRUD ---
const added = await store.createMenuItem({
  id: "x-pilau",
  name: "X Pilau",
  desc: "test",
  priceKES: 500,
  pexelsId: null,
  imageUrl: null,
  category: "featured",
  available: true,
});
assert("add dish", added.id === "x-pilau");
assert("edit dish", (await store.updateMenuItem("x-pilau", { priceKES: 550 })).priceKES === 550);
assert("edit missing -> null", (await store.updateMenuItem("nope", { priceKES: 1 })) === null);
const gone = await store.deleteMenuItem("x-pilau");
assert("delete dish", !!gone && gone.id === "x-pilau");
assert("delete missing -> null", (await store.deleteMenuItem("x-pilau")) === null);
assert("menu count restored", (await store.listMenuItems()).length === 17);

// --- drinks CRUD ---
await store.createDrink({ id: "x-juice", name: "X", desc: "d", priceKES: 100, available: true });
await store.updateDrink("x-juice", { priceKES: 150 });
assert("edit drink", (await store.listDrinks()).find((d) => d.id === "x-juice").priceKES === 150);
await store.deleteDrink("x-juice");
assert("drinks count restored", (await store.listDrinks()).length === 6);

// --- gallery CRUD ---
const gallerySeed = await store.listGallery({ visibleOnly: false });
assert("gallery seeded (8 photos)", gallerySeed.length === 8, `${gallerySeed.length} photos`);
assert("gallery order", gallerySeed[0].position === 1 && gallerySeed[7].position === 8);
await store.createGalleryItem({
  id: "x-test",
  caption: "X",
  category: "Test",
  path: "https://example.com/x.jpg",
  position: 50,
  visible: true,
});
assert("add photo", (await store.listGallery({ visibleOnly: false })).length === 9);
await store.updateGalleryItem("x-test", { visible: false });
const visOnly = await store.listGallery({ visibleOnly: true });
assert("visible filter hides photo", visOnly.length === 8 && !visOnly.some((g) => g.id === "x-test"));
assert("edit photo", (await store.updateGalleryItem("x-test", { caption: "X2" })).caption === "X2");
assert("edit missing -> null", (await store.updateGalleryItem("nope", { caption: "z" })) === null);
assert("delete photo", (await store.deleteGalleryItem("x-test")).id === "x-test");
assert("gallery count restored", (await store.listGallery({ visibleOnly: false })).length === 8);

await store.close();
console.log(process.exitCode ? "\nPG STORE: failures." : "\nPG STORE: all checks passed.");
