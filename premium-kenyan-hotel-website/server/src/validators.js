// All input checking lives here so bad data can never reach the database.

import { config } from "./config.js";

/** Today's date (YYYY-MM-DD) in Nairobi time, regardless of server location. */
export function todayNairobi() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function formatKES(amount) {
  return `KSh ${Number(amount).toLocaleString("en-KE")}`;
}

/**
 * Accept Kenyan mobile numbers in any common shape and normalise to +2547XXXXXXXX.
 * Returns the normalised number, or null when invalid.
 */
export function normaliseKePhone(raw) {
  if (typeof raw !== "string") return null;
  const digits = raw.replace(/[\s\-().]/g, "");
  let m;
  if ((m = digits.match(/^\+254([17]\d{8})$/))) return `+254${m[1]}`;
  if ((m = digits.match(/^254([17]\d{8})$/))) return `+254${m[1]}`;
  if ((m = digits.match(/^0([17]\d{8})$/))) return `+254${m[1]}`;
  return null;
}

/** "9+ (Group)" counts as 12 seats for capacity math; plain numbers count as-is. */
export function guestsCount(label) {
  if (label === "9+ (Group)") return 12;
  const n = Number(label);
  return Number.isInteger(n) && n >= 1 && n <= 30 ? n : null;
}

export function validateReservation(body) {
  const errors = {};

  const name = typeof body?.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  if (name.length < 2) errors.name = "Please give your name.";
  else if (name.length > 80) errors.name = "Name is too long.";

  const phone = normaliseKePhone(body?.phone);
  if (!phone) errors.phone = "Please give a valid Kenyan mobile number, e.g. 0712 345 678.";

  const date = typeof body?.date === "string" ? body.date.trim() : "";
  const today = todayNairobi();
  const maxDate = addDays(today, config.maxDaysAhead);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(`${date}T12:00:00`).getTime())) {
    errors.date = "Please pick a valid date.";
  } else if (date < today) {
    errors.date = "That date is in the past — please pick today or a future day.";
  } else if (date > maxDate) {
    errors.date = `We take bookings up to ${config.maxDaysAhead} days ahead — please call us for later dates.`;
  }

  const time = typeof body?.time === "string" ? body.time.trim() : "";
  if (!config.timeSlots.includes(time)) errors.time = "Please choose one of our seating times.";

  const guestsLabel = typeof body?.guests === "string" ? body.guests.trim() : "";
  const count = guestsCount(guestsLabel);
  if (count === null) errors.guests = "Please choose how many guests are coming.";

  const request =
    typeof body?.request === "string" ? body.request.trim().replace(/\s+/g, " ").slice(0, 500) : "";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { name, phone, date, time, guestsLabel, guestsCount: count, request } };
}

function addDays(yyyymmdd, days) {
  const d = new Date(`${yyyymmdd}T12:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function validateMenuItem(body, { partial = false } = {}) {
  const errors = {};
  const out = {};

  const check = (key, fn, opts = {}) => {
    if (body?.[key] === undefined) {
      if (partial) return; // PATCH: absent = leave unchanged
      if ("default" in opts) {
        out[key] = opts.default; // POST: absent = sensible default
        return;
      }
      errors[key] = "Missing.";
      return;
    }
    const r = fn(body[key]);
    if (r.error) errors[key] = r.error;
    else out[key] = r.value;
  };

  check("name", (v) => {
    const s = String(v ?? "").trim().replace(/\s+/g, " ");
    if (s.length < 2) return { error: "Name is required." };
    if (s.length > 80) return { error: "Name is too long." };
    return { value: s };
  });
  check("desc", (v) => {
    const s = String(v ?? "").trim().replace(/\s+/g, " ");
    if (s.length < 2) return { error: "Description is required." };
    if (s.length > 300) return { error: "Description is too long." };
    return { value: s };
  });
  check("priceKES", (v) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n < 0 || n > 1000000) return { error: "Price must be a whole shilling amount." };
    return { value: n };
  });
  check("category", (v) => {
    const allowed = ["featured", "grill", "sides", "mornings"];
    if (!allowed.includes(v)) return { error: `Category must be one of: ${allowed.join(", ")}.` };
    return { value: v };
  });
  check(
    "pexelsId",
    (v) => {
      if (v === null || v === "" || v === undefined) return { value: null };
      const n = Number(v);
      if (!Number.isInteger(n) || n <= 0) return { error: "Photo id must be a number." };
      return { value: n };
    },
    { default: null }
  );
  check(
    "imageUrl",
    (v) => {
      if (v === null || v === "" || v === undefined) return { value: null };
      try {
        const u = new URL(String(v));
        if (!["http:", "https:"].includes(u.protocol)) throw new Error();
        return { value: String(v).slice(0, 500) };
      } catch {
        return { error: "Photo URL must start with http(s)://" };
      }
    },
    { default: null }
  );
  check(
    "available",
    (v) => {
      if (typeof v !== "boolean") return { error: "Available must be true/false." };
      return { value: v };
    },
    { default: true }
  );

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: out };
}

export function validateDrink(body, { partial = false } = {}) {
  // Drinks are simple: name + description + price, no photo or category.
  const errors = {};
  const out = {};
  const b = body || {};

  if (b.name !== undefined || !partial) {
    const s = String(b.name ?? "").trim().replace(/\s+/g, " ");
    if (s.length < 2) errors.name = "Name is required.";
    else if (s.length > 80) errors.name = "Name is too long.";
    else out.name = s;
  }
  if (b.desc !== undefined || !partial) {
    const s = String(b.desc ?? "").trim().replace(/\s+/g, " ");
    if (s.length < 2) errors.desc = "Description is required.";
    else if (s.length > 300) errors.desc = "Description is too long.";
    else out.desc = s;
  }
  if (b.priceKES !== undefined || !partial) {
    const n = Number(b.priceKES);
    if (!Number.isInteger(n) || n < 0 || n > 1000000)
      errors.priceKES = "Price must be a whole shilling amount.";
    else out.priceKES = n;
  }
  if (b.available !== undefined) {
    if (typeof b.available !== "boolean") errors.available = "Available must be true/false.";
    else out.available = b.available;
  } else if (!partial) {
    out.available = true;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: out };
}
