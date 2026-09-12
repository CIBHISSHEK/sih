# Deployment

The whole app ships as **one web service** (frontend + REST API + realtime,
one Node process, one port) plus an **optional ML service**. The API has
analytical fallbacks, so the ML container is recommended but not required.

There is no separate static host and no CORS to configure — the API serves
the built frontend from its own origin.

---

## Option A — Docker Compose (any Linux VPS, recommended)

Needs Docker + the Compose plugin on the host.

```bash
git clone <your-repo> && cd "SIH DEMO 2"
cp .env.example .env

# Edit .env — at minimum set a real JWT_SECRET:
#   JWT_SECRET="$(openssl rand -hex 32)"
# Keep DEMO_MODE=false. Set SEED_ON_START=true for the very first boot only.

docker compose up -d --build
```

The app is now on `http://<host>:4000` (change with `APP_PORT` in `.env`).
The ML service runs internally on `ml:8000` and is not published.

**First boot only:** set `SEED_ON_START=true` in `.env` before `up` to load
the reference centres/slots into the empty database, then set it back to
`false` and `docker compose up -d` again so it never re-wipes.

Everyday operations:

```bash
docker compose logs -f app          # tail logs
docker compose restart app          # restart after an .env change
docker compose pull && docker compose up -d --build   # deploy an update
docker compose exec app npx prisma studio   # inspect the DB
```

Data lives in the `db-data` Docker volume (SQLite file at `/data/app.db`).
Back it up with `docker compose exec app sh -c "cp /data/app.db /data/backup-$(date +%F).db"`
or copy the volume out.

### Put it on a real domain with HTTPS

Run a reverse proxy (Caddy is the least effort) on the host:

```
# /etc/caddy/Caddyfile
procuremintra.example.gov.in {
    reverse_proxy localhost:4000
}
```

Caddy fetches and renews the TLS certificate automatically. Then set
`CORS_ORIGIN` to that domain (only matters if you ever split the frontend off)
and restart.

---

## Option B — Managed platform (Render / Railway / Fly.io)

Two services from this one repo:

| Service | Build | Start | Key env |
|---|---|---|---|
| **web + API** | Docker, root `Dockerfile` | (image `CMD`) | `NODE_ENV=production`, `JWT_SECRET`, `DATABASE_URL`, `ML_SERVICE_URL`, `DEMO_MODE=false` |
| **ML** | Docker, `apps/ml/Dockerfile` | (image `CMD`) | `ML_PORT` (platform's assigned port) |

Notes:

- **Database:** platforms have ephemeral disks. Either attach a **persistent
  volume/disk** and keep `DATABASE_URL="file:/data/app.db"`, or provision a
  **managed Postgres** and switch Prisma:
  1. `prisma/schema.prisma` → `datasource db { provider = "postgresql" ... }`
  2. `DATABASE_URL="postgresql://user:pass@host:5432/db"`
  3. `npx prisma migrate deploy` runs on boot via the entrypoint.
- Point the web+API service's `ML_SERVICE_URL` at the ML service's internal URL.
- If the platform can't run the entrypoint script, add a pre-deploy/release
  command: `npx prisma migrate deploy --schema=prisma/schema.prisma`.
- `PORT` is injected by the platform — the server already reads it.

---

## Environment variables

| Var | Default | Notes |
|---|---|---|
| `NODE_ENV` | `development` | Set `production` for any deploy. |
| `PORT` | `4000` | The single app port. |
| `DATABASE_URL` | `file:./dev.db` | SQLite path or a Postgres URL. |
| `JWT_SECRET` | *demo string* | **Must change.** Signs auth tokens. |
| `WEB_DIST_DIR` | *(blank)* | Set by the Docker image to serve the SPA. |
| `DEMO_MODE` | `false` in prod | `true` mounts DB-wipe endpoints — never in prod. |
| `SEED_ON_START` | `false` | `true` once, against an empty DB. |
| `ML_SERVICE_URL` | `http://localhost:8000` | Internal URL of the ML container. |
| `WEATHER_MODE` | `live` | `offline` forces the seasonal fallback. |
| `VOICE_PROVIDER` | `mock` | `sarvam` + `SARVAM_API_KEY` for real multilingual STT/TTS. |
| `CORS_ORIGIN` | localhost:5173 | Only relevant if the frontend is hosted separately. |
| `FIREBASE_SERVICE_ACCOUNT_PATH` + `VITE_FIREBASE_*` | *(blank)* | Enables real SMS OTP; otherwise mock OTP `123456`. |

---

## Local development (unchanged)

```bash
npm install          # also bootstraps the Python venv + trains models
npm run dev          # api :4000, web :5173, ml :8000
```

## Not yet production-grade

Deployable ≠ finished. Still open before a real procurement centre relies on it:
real staff/admin accounts scoped per centre (currently two hard-coded phone
numbers), real payment/DBT integration (payment status is currently
*simulated*), ML models retrained on real history (currently synthetic), an
audit trail, automated tests, and monitoring. See the project notes for the
full list.
