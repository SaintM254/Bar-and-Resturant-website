# Photos & Logo Guide (plain English, no coding)

Your gallery starts with 8 elegant AI-made Kenyan photos. This guide shows how
to add **your own real photos** and how the **logo** works.

## Option A — add your own photos yourself (free, ~10 minutes)

Your staff page can't receive photo uploads directly (the free hosting forgets
uploaded files when it restarts), so your photos live on a free image host and
the website shows them from their link. You do this once per photo, from your
phone or computer:

1. Create a free account at **cloudinary.com** (free plan is plenty).
2. Open Cloudinary's **Media Library** → **Upload** → pick a photo from your
   phone or computer. Landscape (sideways) photos look best.
3. Once uploaded, open the photo and copy its **URL** (it looks like
   `https://res.cloudinary.com/…/your-photo.jpg`). In Cloudinary click the
   photo → copy the "URL" — make sure it starts with `https://`.
4. Open your **staff page** → **Gallery** tab → **+ Add a photo**.
5. Fill in: Caption ("Our new terrace tables"), Category (Restaurant, Bar,
   Rooms, Outdoors — or invent your own), paste the link, Position (low
   numbers show first), keep Visible ticked → **Add photo**.
6. Open your website, refresh — your photo is live. 🎉

Tips: landscape over portrait, under ~2MB each (Cloudinary shows the size),
and short captions read best under photos.

To **replace** a photo: Gallery tab → Edit → paste the new link in
"Replace photo" → Save. To **remove**: Delete. To **reorder**: change the
Position numbers (1, 2, 3…). To **hide without deleting**: Hide.

## Option B — ask your developer (easiest, best quality)

Just send the photo files and say "add these to the gallery" (plus captions).
They get baked into the website itself: fastest loading, never depend on
another company, and included in backups. Same for removing or reordering.

## The logo

- The current logo (bronze acacia mark) lives in the code at
  `premium-kenyan-hotel-website/src/assets/logo.png`. It appears in the
  website header, the footer, and as the little browser-tab icon (favicon).
- **To use your own logo:** send the file to your developer and say "use this
  as the logo". Square-ish images work best (the site shows it as a round
  badge). They'll swap it and rebuild — a 5-minute job.
- You cannot change the logo from the staff page (it's part of the design,
  like paint on the walls — the gallery is the furniture you rearrange).

## Rebranding for a new client

All business details live in **one file**: `src/site.ts` (name, tagline,
phone, email, address, hours). Rebranding = edit that file + swap the logo +
update the page title in `index.html` (marked `BRAND`) + rebuild. The web
addresses (github.io, onrender.com) keep working; renaming them is optional
and also just a few clicks each.
