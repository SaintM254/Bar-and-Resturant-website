// Central settings for the backend.
// In production these come from environment variables; defaults are preview-friendly.

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: Number(process.env.PORT || 3001),
  // Password for the private staff/admin page (#/admin).
  // Change it in production:  ADMIN_PASSWORD=your-secret npm start
  adminPassword: process.env.ADMIN_PASSWORD || "acacia2026",
  // Where bookings + menu are stored (simple JSON files, auto-created).
  dataDir: process.env.DATA_DIR || path.join(__dirname, "..", "data"),
  // Bookings: how far ahead guests may reserve, and max guests per time slot.
  maxDaysAhead: 90,
  maxGuestsPerSlot: 40,
  // Must stay in sync with the frontend reservation form.
  timeSlots: [
    "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM",
    "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
    "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM",
    "8:30 PM", "9:00 PM",
  ],
  guestOptions: ["1", "2", "3", "4", "5", "6", "7", "8", "9+ (Group)"],
  // Admin login tokens expire after 12 hours.
  tokenTtlMs: 12 * 60 * 60 * 1000,
  // Comma-separated origins allowed to call the API, e.g.
  // ALLOWED_ORIGIN=https://saintm254.github.io
  // Empty = allow all (fine for local preview, restrict in production).
  allowedOrigins: (process.env.ALLOWED_ORIGIN || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};

export const RESERVATION_STATUS = [
  "pending",
  "confirmed",
  "seated",
  "cancelled",
  "no-show",
];

export const MENU_CATEGORIES = ["featured", "grill", "sides", "mornings"];

export const MENU_GROUP_LABELS = {
  grill: "From the Charcoal Grill",
  sides: "Sides & Small Plates",
  mornings: "Mornings",
};
