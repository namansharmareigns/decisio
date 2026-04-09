# How to Run Decisio

## Quick start (Docker – recommended)

From the project root (`DECISIO`):

```powershell
cd C:\Users\Naman\Desktop\DECISIO
docker-compose up -d --build
```

If you see **container name already in use**:

```powershell
docker rm -f decisio_postgres decisio_backend decisio_frontend
docker-compose up -d
```

If the **backend/frontend stay in "Created"** (waiting for Postgres healthcheck), start them manually:

```powershell
docker start decisio_backend
docker start decisio_frontend
```

## What’s running

| Service   | URL                     | Port |
|----------|--------------------------|------|
| Frontend | http://localhost:3000    | 3000 |
| Backend  | http://localhost:8000     | 8000 |
| API docs | http://localhost:8000/docs | 8000 |
| Postgres | localhost:5432           | 5432 |

## Stop everything

```powershell
cd C:\Users\Naman\Desktop\DECISIO
docker-compose down
```

## Frontend only (no Docker)

If you prefer to run the frontend locally:

1. Backend must be running (e.g. via Docker as above).
2. In a terminal:

```powershell
cd C:\Users\Naman\Desktop\DECISIO\frontend
npm install
npm run dev
```

3. Open http://localhost:3000 (Vite proxies `/api` to the backend).

## Backend only (no Docker)

```powershell
cd C:\Users\Naman\Desktop\DECISIO\backend
# Ensure Postgres is running and set DATABASE_URL in .env
pip install -r requirements.txt
python -c "from app.core.init_db import init_db; init_db()"
uvicorn app.main:app --reload --port 8000
```
