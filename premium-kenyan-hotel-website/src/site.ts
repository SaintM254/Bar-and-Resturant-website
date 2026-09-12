// ═══════════════════════════════════════════════════════════════════
// THE BRAND IN ONE PLACE
// ───────────────────────────────────────────────────────────────────
// Rebranding — e.g. handing this site to a new hotel client?
//   1. Edit the values below.
//   2. Swap src/assets/logo.png for the new logo (square-ish, ≤ 256px).
//   3. Update <title> + meta description in index.html (marked with BRAND).
//   4. Rebuild + redeploy. Done — no hunting through files.
// The whole website (and staff page) reads from here.
// ═══════════════════════════════════════════════════════════════════

const NAME = "The Acacia House";

export const SITE = {
  /** Full business name, as guests know it. */
  name: NAME,
  /** Short name for tight spaces (staff page, small labels). */
  shortName: "Acacia House",
  tagline: "Hotel · Restaurant · Bar",
  place: "Westlands, Nairobi",

  address: "14 Riverside Drive, Westlands",
  city: "Nairobi, Kenya",
  phone: "+254 712 345 678",
  phoneHref: "tel:+254712345678",
  email: "reservations@acaciahouse.co.ke",

  /** One-line opening hours for footers and info rows. */
  hours: "Open daily · 6:30 AM – 11:00 PM",
  /** Hero bottom-strip variant (slightly different punctuation). */
  heroHours: "Open Daily · 6:30 AM — 11:00 PM",
  barHours: "The bar stays open until midnight",
  barShort: "Until Midnight",
  kitchenLine: "Breakfast 6:30 — 10:30 · All day from 12:00",
  breakfastTime: "6:30 — 10:30",
  kitchenTime: "12:00 — 22:00",
  morningFrom: "From 6:30",

  mapQuery: "Riverside Drive, Westlands, Nairobi, Kenya",
  mapTitle: `Map — ${NAME}, Riverside Drive, Westlands, Nairobi`,
  driverNote: `Riverside Drive, Westlands — tell your driver "${NAME}, past the fig tree."`,
  heroEyebrow: `${NAME} · Westlands, Nairobi`,
};
