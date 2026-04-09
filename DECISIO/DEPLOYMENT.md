# Deploying Decisio (Vercel / Netlify + FastAPI + Postgres)

Decisio is a **3‑tier app**:

- **Frontend** (React/Vite) → deploy to **Vercel or Netlify**
- **Backend** (FastAPI) → deploy to any **Docker/Python host** (Render / Railway / Fly.io / VPS)
- **Database** (PostgreSQL) → managed Postgres (Render, Railway, Supabase, Neon, etc.)

Vercel/Netlify are excellent for the **frontend**, but the **FastAPI backend and Postgres** must run elsewhere.

---

## 1) Deploy the backend (FastAPI)

### Option A: Docker-based deploy (recommended)

You already have `backend/Dockerfile`. Any platform that supports Docker can run it.

**Required environment variables**

- `DATABASE_URL` (from your managed Postgres provider)
- `CORS_ORIGINS` (your deployed frontend domains)

Example:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
CORS_ORIGINS=["https://yourapp.vercel.app","https://yourapp.netlify.app"]
```

**Start command**

Run:

```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

> If your platform doesn’t inject `$PORT`, use `8000`.

### Notes

- On startup we create tables via `init_db()` (simple scaffolding). For long-term production, add Alembic migrations.

---

## 2) Deploy the frontend (Vercel or Netlify)

The frontend supports two modes:

- **Proxy mode**: `/api/*` is proxied to the backend (Docker/Nginx)
- **Direct mode (deployment)**: frontend calls the backend directly using an env variable

### Set the frontend API URL

Set this env var in Vercel/Netlify:

```
VITE_API_BASE_URL=https://<your-backend-domain>/api/v1
```

This makes the browser call the backend directly.

### Vercel

1. Import the repo in Vercel.
2. Set **Root Directory** to `frontend/`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add env var: `VITE_API_BASE_URL`

`frontend/vercel.json` is included for SPA routing.

### Netlify

1. New site → import repo.
2. Base directory: `frontend/`
3. Build command: `npm run build`
4. Publish directory: `frontend/dist`
5. Add env var: `VITE_API_BASE_URL`

`frontend/netlify.toml` + `frontend/public/_redirects` handle SPA routing.

---

## 3) Update backend CORS for your deployed frontend domains

Set `CORS_ORIGINS` on the backend. Supports:

- JSON list: `["https://a.com","https://b.com"]`
- comma list: `https://a.com,https://b.com`

If CORS is wrong, the browser will block API calls even if the backend is up.

---

## 4) Quick local production-like run (Docker)

From repo root:

```powershell
docker-compose -f docker-compose.prod.yml up -d --build
```

Then open:

- Frontend: `http://localhost:3000`
- Backend docs: `http://localhost:8000/docs`

