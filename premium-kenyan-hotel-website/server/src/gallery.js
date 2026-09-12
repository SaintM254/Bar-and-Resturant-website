// Gallery feature module: serves the house photos + CRUD API for the staff page.
//
//   GET  /gallery/*                 house photos (committed files, deployed with the code)
//   GET  /api/gallery              visible photos for the website
//   GET/POST /api/admin/gallery     full list / add (staff only)
//   PUT/DELETE /api/admin/gallery/:id   edit / remove (staff only)
//
// Photo locations are stored as either:
//   - a site path  (/gallery/terrace.jpg)  -> served from ./public/gallery
//   - a full URL   (https://...)           -> owner-hosted (see PHOTOS-AND-LOGO-GUIDE.md)

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { requireAdmin } from "./auth.js";
import { slugify } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PATH_RE = /^(\/gallery\/[A-Za-z0-9._-]+|https?:\/\/.{4,500})$/;

export function validateGalleryItem(body, { partial = false } = {}) {
  const errors = {};
  const out = {};
  const b = body || {};

  if (b.caption !== undefined || !partial) {
    const s = String(b.caption ?? "").trim().replace(/\s+/g, " ");
    if (s.length < 2) errors.caption = "Caption is required.";
    else if (s.length > 120) errors.caption = "Caption is too long.";
    else out.caption = s;
  }
  if (b.category !== undefined || !partial) {
    const s = String(b.category ?? "").trim().replace(/\s+/g, " ");
    if (s.length < 2) errors.category = "Category is required.";
    else if (s.length > 40) errors.category = "Category is too long.";
    else out.category = s;
  }
  if (b.path !== undefined || !partial) {
    const s = String(b.path ?? "").trim();
    if (!PATH_RE.test(s)) errors.path = "Must be a /gallery/… path or an https:// image link.";
    else out.path = s.slice(0, 500);
  }
  if (b.position !== undefined) {
    const n = Number(b.position);
    if (!Number.isInteger(n) || n < 0 || n > 1000) errors.position = "Position must be 0–1000.";
    else out.position = n;
  } else if (!partial) {
    out.position = 999; // new photos go last unless positioned
  }
  if (b.visible !== undefined) {
    if (typeof b.visible !== "boolean") errors.visible = "Visible must be true/false.";
    else out.visible = b.visible;
  } else if (!partial) {
    out.visible = true;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: out };
}

export function mountGallery(app, store) {
  // House photos on disk. Short cache so swapped files refresh quickly.
  app.use("/gallery", express.static(path.join(__dirname, "..", "public", "gallery"), { maxAge: "1d" }));

  const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

  app.get("/api/gallery", ah(async (req, res) => {
    const rows = await store.listGallery({ visibleOnly: true });
    res.json({
      images: rows.map((r) => ({ id: r.id, caption: r.caption, category: r.category, src: r.path })),
    });
  }));

  app.get("/api/admin/gallery", requireAdmin, ah(async (req, res) => {
    res.json({ images: await store.listGallery({ visibleOnly: false }) });
  }));

  app.post("/api/admin/gallery", requireAdmin, ah(async (req, res) => {
    const parsed = validateGalleryItem(req.body);
    if (!parsed.ok) return res.status(400).json({ error: "Please check the photo.", fields: parsed.errors });
    const existing = await store.listGallery({ visibleOnly: false });
    const ids = new Set(existing.map((g) => g.id));
    let id = slugify(parsed.value.caption).slice(0, 50) || "photo";
    if (ids.has(id)) {
      let n = 2;
      while (ids.has(`${id}-${n}`)) n += 1;
      id = `${id}-${n}`;
    }
    const item = await store.createGalleryItem({ id, ...parsed.value });
    res.status(201).json({ message: "Photo added.", item });
  }));

  app.put("/api/admin/gallery/:id", requireAdmin, ah(async (req, res) => {
    const parsed = validateGalleryItem(req.body, { partial: true });
    if (!parsed.ok) return res.status(400).json({ error: "Please check the photo.", fields: parsed.errors });
    const item = await store.updateGalleryItem(req.params.id, parsed.value);
    if (!item) return res.status(404).json({ error: "Photo not found." });
    res.json({ message: "Photo updated.", item });
  }));

  app.delete("/api/admin/gallery/:id", requireAdmin, ah(async (req, res) => {
    const removed = await store.deleteGalleryItem(req.params.id);
    if (!removed) return res.status(404).json({ error: "Photo not found." });
    res.json({ message: `“${removed.caption}” removed from the gallery.` });
  }));
}
