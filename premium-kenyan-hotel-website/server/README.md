# Acacia House — Backend API

Simple Node.js + Express backend. No database to install: bookings and the menu
are stored in JSON files under `server/data/` (created automatically on first run).

## Run it

```bash
cd premium-kenyan-hotel-website/server
npm install
npm start            # serves http://localhost:3001
```

The website's dev server forwards `/api/*` here automatically (see `vite.config.ts`),
so one preview address covers both site + backend.

Default staff password: `acacia2026` — change with `ADMIN_PASSWORD=... npm start`.

## Endpoints

Public:

| Method | Path                 | What it does                              |
| ------ | -------------------- | ----------------------------------------- |
| GET    | `/api/health`        | Liveness check                            |
| GET    | `/api/config`        | Time slots, guest options, booking limits |
| GET    | `/api/menu`          | Featured dishes, menu groups, bar drinks  |
| POST   | `/api/reservations`  | Create a booking (validated, capacity-checked) |

Staff (needs `Authorization: Bearer <token>` from login):

| Method | Path                              | What it does                        |
| ------ | --------------------------------- | ----------------------------------- |
| POST   | `/api/admin/login`                | Sign in with the staff password     |
| POST   | `/api/admin/logout`               | Sign out                            |
| GET    | `/api/admin/stats`                | Pending / today / upcoming counts   |
| GET    | `/api/admin/reservations`         | List bookings (`?date=&status=&upcoming=1`) |
| PATCH  | `/api/admin/reservations/:id`     | Set status: pending/confirmed/seated/cancelled/no-show |
| GET    | `/api/admin/menu`                 | Full menu incl. hidden items        |
| POST   | `/api/admin/menu/items`           | Add a dish                          |
| PUT    | `/api/admin/menu/items/:id`       | Edit a dish                         |
| DELETE | `/api/admin/menu/items/:id`       | Remove a dish                       |
| POST   | `/api/admin/menu/drinks`          | Add a bar drink                     |
| PUT    | `/api/admin/menu/drinks/:id`      | Edit a drink                        |
| DELETE | `/api/admin/menu/drinks/:id`      | Remove a drink                      |

## Storage

- No `DATABASE_URL` → JSON files under `server/data/` (local preview, zero setup).
- `DATABASE_URL` set → Postgres (production). Schema + seed menu are applied
  automatically on first boot. Test the Postgres code without a database:
  `npm run test:pg` (uses an in-memory emulator, 19 checks).

## Production (Render + Neon, free tier)

1. Create a Neon project (Postgres) and copy its connection string.
2. On Render: New → Blueprint → this repo → the session branch. `render.yaml`
   (repo root) fills in build/start/health-check; paste `DATABASE_URL` and
   invent `ADMIN_PASSWORD` when asked.
3. Point the website at the live API and rebuild it:
   `VITE_API_URL=https://<your-api>.onrender.com npm run build`.
4. `ALLOWED_ORIGIN` is pre-set to the GitHub Pages site in `render.yaml`.
