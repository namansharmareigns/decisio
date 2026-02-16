# Decisio – Project Overview & How Everything Works

This document explains what Decisio is, how it is built, and how data and logic flow through the system from the UI to the database.

---

## 1. What Is Decisio?

**Decisio** is a **decision intelligence platform** for software teams. It helps you:

- **Record** engineering decisions (architecture, technology, process).
- **Capture** the project context and assumptions at the time of each decision.
- **Track** how the project changes over time (team size, users, timeline).
- **Detect decision drift** by comparing “context when we decided” vs “context now.”
- **Assign risk levels** (low / medium / high) based on how much things have changed.
- **Explain** why a decision might be at risk (e.g. “Team size changed by 80%”).

So: you store *what* you decided and *under which conditions*. Later, when the project evolves, Decisio tells you which decisions might need to be revisited.

---

## 2. High-Level Architecture

Decisio has three main parts:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER (Browser)                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  FRONTEND (React + TypeScript + Vite)                                    │
│  • Port 3000 (dev) or served via Nginx (Docker)                         │
│  • Pages: Dashboard, Decisions, Decision Detail, Project Context         │
│  • Calls backend via /api/v1/* (proxied in dev, Nginx in prod)           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP (JSON)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  BACKEND (FastAPI + Python 3.11)                                         │
│  • Port 8000                                                              │
│  • REST API under /api/v1                                                │
│  • Business logic in services (drift_engine, evaluation_service)          │
│  • No business logic in route handlers                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ SQLAlchemy ORM
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  DATABASE (PostgreSQL)                                                   │
│  • Port 5432                                                             │
│  • Tables: decisions, project_contexts, decision_context_snapshots,       │
│            decision_evaluations                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Frontend**: UI and user actions; all server communication goes through the backend API.
- **Backend**: API, validation (Pydantic), business rules (drift, evaluation), and database access.
- **Database**: Persistent storage; schema defined by SQLAlchemy models.

---

## 3. Core Concepts & Data Model

### 3.1 Decision

A **decision** is something the team decided (e.g. “Use PostgreSQL,” “Adopt microservices”).

- **Stored in:** `decisions` table.
- **Fields:** id (UUID), title, description, decision_type (architecture / technology / process), confidence_level (low / medium / high), created_at, updated_at.
- **Relations:** One decision can have many **snapshots** and many **evaluations**.

### 3.2 Project Context

**Project context** is the *current* view of the project: team size, expected users, timeline, and optional constraints.

- **Stored in:** `project_contexts` table.
- **Fields:** id, team_size, expected_users, timeline_months, constraints, updated_at.
- **Usage:** There is effectively “one current context” (the latest row). The app uses it as “how things are *now*” when computing drift.

So: **Project Context = today’s reality.**

### 3.3 Decision Context Snapshot

A **snapshot** is a copy of project context *at the time a decision was made* (or when you explicitly captured it).

- **Stored in:** `decision_context_snapshots` table.
- **Fields:** id, decision_id (FK to decisions), team_size_at_decision, expected_users_at_decision, timeline_at_decision, assumptions (text), created_at.
- **Relation:** Many snapshots per decision; evaluations use the *latest* snapshot for that decision.

So: **Snapshot = how things were when we made (or recorded) this decision.**

### 3.4 Decision Evaluation

An **evaluation** is the result of a single “drift check” for one decision.

- **Stored in:** `decision_evaluations` table.
- **Fields:** id, decision_id (FK), drift_score (0–100), risk_level (low / medium / high), explanation (text), evaluated_at.
- **Relation:** Many evaluations per decision (each time you click “Evaluate,” a new row is created).

So: **Evaluation = one run of the drift engine for that decision, at a point in time.**

### 3.5 How They Connect

- You **create a decision** (e.g. “Use microservices”).
- You **create a snapshot** for that decision (e.g. team_size=5, expected_users=10k, timeline=6 months). That snapshot is “the world when we made this decision.”
- You keep **project context** up to date (e.g. later: team_size=12, expected_users=50k, timeline=12 months). That is “the world now.”
- You click **Evaluate decision**. The backend compares *current project context* to *latest snapshot* for that decision, computes a drift score and risk level, and saves an **evaluation** with an explanation.

So: **Drift = difference between snapshot (then) and project context (now).**

---

## 4. How the Drift Engine Works

The drift engine lives in **`backend/app/services/drift_engine.py`**. It is **rule-based** (no ML).

**Inputs:**

- **Current context:** one `ProjectContext` (latest in DB).
- **Snapshot:** one `DecisionContextSnapshot` (latest for that decision).

**Outputs:**

- **drift_score:** 0–100 (higher = more change).
- **risk_level:** low / medium / high (derived from score).
- **explanation:** short text describing what changed.

**Logic (simplified):**

1. **Team size**
   - Compute absolute percentage change vs snapshot.
   - \> 50% → +30 to score; \> 25% → +15.
2. **Expected users**
   - Same idea: \> 100% → +35; \> 50% → +20; \> 25% → +10.
3. **Timeline (months)**
   - \> 50% → +35; \> 25% → +20.
4. **Cap** total score at 100.
5. **Risk level:**
   - 0–30 → low  
   - 31–70 → medium  
   - 71–100 → high  
6. **Explanation:** concatenate which factors contributed (e.g. “Team size changed by 80%, Expected users changed by 150%”).

So: the more the current context diverges from the snapshot, the higher the score and the more likely the risk is medium or high.

---

## 5. Backend Flow (Request → Response)

### 5.1 Structure

- **`app/main.py`** – Creates FastAPI app, CORS, mounts routers under `/api/v1`, health and root.
- **`app/core/config.py`** – Settings (e.g. `DATABASE_URL`, `API_V1_PREFIX`) from env.
- **`app/core/database.py`** – SQLAlchemy engine, `Base`, `SessionLocal`, `get_db()` for dependency injection.
- **`app/models/*`** – SQLAlchemy models (tables).
- **`app/schemas/*`** – Pydantic models (request/response validation and serialization).
- **`app/api/*`** – Route modules (thin: parse request, call service or DB, return response).
- **`app/services/*`** – Business logic (drift calculation, evaluation orchestration).

### 5.2 Important API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Health check (no DB). |
| POST | `/api/v1/decisions` | Create a decision. |
| GET | `/api/v1/decisions` | List decisions. |
| GET | `/api/v1/decisions/{id}` | Get one decision. |
| PUT | `/api/v1/project-context` | Create or update project context (single “current” context). |
| GET | `/api/v1/project-context` | Get current project context. |
| POST | `/api/v1/decisions/{id}/snapshot` | Create a snapshot for a decision. |
| GET | `/api/v1/decisions/{id}/snapshots` | List snapshots for a decision (newest first). |
| POST | `/api/v1/decisions/{id}/evaluate` | Run drift engine, save evaluation, return result. |
| GET | `/api/v1/decisions/{id}/evaluations` | List evaluations for a decision. |

### 5.3 Evaluate Flow (Step by Step)

When you call **POST `/api/v1/decisions/{id}/evaluate`**:

1. **Route** (`evaluation_routes.py`) receives `decision_id`, gets DB session via `get_db()`.
2. **EvaluationService.evaluate_decision(db, decision_id)** is called.
3. **Service** (`evaluation_service.py`):
   - Loads the **decision** (or raises “not found”).
   - Loads the **latest project context** (or raises “set project context first”).
   - Loads the **latest snapshot** for this decision (or raises “create snapshot first”).
   - Calls **drift_engine.calculate_drift_score(current_context, snapshot)** → (score, risk_level, explanation).
   - Creates a **DecisionEvaluation** row with that result.
   - Commits, refreshes, returns the evaluation as response.
4. **Route** returns that evaluation (e.g. 201 + JSON).

So: **evaluate = load decision + current context + latest snapshot → run drift engine → save and return evaluation.**

---

## 6. Frontend Flow (User Action → UI Update)

### 6.1 Tech Stack

- **React 18**, **TypeScript**, **Vite**, **React Router**, **Tailwind CSS**, **Axios**, **Lucide icons**, **date-fns**.

### 6.2 Main Pages

- **Dashboard** – Summary (e.g. decision count, project context stats), recent decisions, link to set project context if missing.
- **Decisions** – List of decisions; “Create Decision” opens a modal; each row links to decision detail.
- **Decision Detail** – One decision: title, description, type, confidence; **Context Snapshot** (create / view); **Drift Evaluation** (evaluate / list past evaluations).
- **Project Context** – Form to set/update team size, expected users, timeline, constraints; saved via PUT project-context.

### 6.3 API Layer

- **`src/services/api.ts`** – Axios instance with `baseURL: '/api/v1'`.  
  Exposes: `decisionsApi`, `projectContextApi`, `evaluationApi` (getSnapshots, createSnapshot, evaluate, getEvaluations, etc.).
- In **development**, Vite proxies `/api` to the backend (e.g. `localhost:8000`).  
  In **Docker**, Nginx serves the frontend and proxies `/api` to the backend container.

### 6.4 Snapshot Create → Display Flow

1. User opens a decision → **DecisionDetail** loads decision, project context, **snapshots**, and evaluations.
2. **getSnapshots(decisionId)** → GET `/api/v1/decisions/{id}/snapshots` → backend returns list (newest first).
3. Frontend sets **snapshot** state to the first item (latest). If list is empty, “Create Snapshot” is shown.
4. User clicks “Create Snapshot,” fills form, submits → **createSnapshot(decisionId, payload)** → POST `/api/v1/decisions/{id}/snapshot`.
5. Backend saves snapshot, returns 201 + snapshot JSON.
6. Frontend runs **onSuccess()** → closes modal and calls **loadData()** again.
7. **loadData()** fetches snapshots again → new snapshot is first → **setSnapshot(snapshotsData[0])**.
8. UI re-renders and shows the new snapshot (and can show “Evaluate Decision” if project context exists).

So: **create snapshot → reload data → latest snapshot is now in state → UI shows it and can run evaluations.**

---

## 7. Database (Tables & Relations)

- **decisions** – One row per decision; referenced by snapshots and evaluations.
- **project_contexts** – One or more rows over time; “current” = latest by `updated_at`.
- **decision_context_snapshots** – Many per decision; each row = one captured context for that decision; evaluations use the latest by `created_at`.
- **decision_evaluations** – Many per decision; each row = one drift check.

Relations:

- Decision 1 → N DecisionContextSnapshot (and 1 → N DecisionEvaluation).
- Snapshot N → 1 Decision; Evaluation N → 1 Decision.
- No direct FK from snapshot/evaluation to project_context; “current context” is read at evaluate time.

---

## 8. Running the Project (Docker)

- **Root `docker-compose.yml`** defines three services: **postgres**, **backend**, **frontend**.
- **postgres:** PostgreSQL 15; creates DB `decisio`; backend connects via `DATABASE_URL`.
- **backend:** Builds from `backend/Dockerfile`, runs init_db (creates tables) then Uvicorn; volume-mounts `backend/app` for live code; depends on postgres healthy.
- **frontend:** Builds from `frontend/Dockerfile` (Node build → Nginx serve); Nginx proxies `/api` to backend; serves SPA on `/`.

Commands (from project root):

- **Start:** `docker-compose up -d --build`
- **Stop:** `docker-compose down`

URLs:

- App: **http://localhost:3000**
- API: **http://localhost:8000**
- API docs: **http://localhost:8000/docs**

---

## 9. End-to-End User Story

1. **Set project context** (Project Context page) – e.g. team 5, users 10k, 6 months.  
   → PUT project-context; one row (or update) in `project_contexts`.

2. **Create a decision** (Decisions → Create Decision) – e.g. “Use PostgreSQL,” type technology, confidence high.  
   → POST decisions; one row in `decisions`.

3. **Open that decision** → Decision Detail loads; snapshots fetched → none yet; “Create Snapshot” shown.

4. **Create snapshot** – e.g. same numbers (5, 10k, 6), optional assumptions.  
   → POST decisions/{id}/snapshot; one row in `decision_context_snapshots`.  
   → Frontend reloads snapshots; latest snapshot is shown; “Evaluate Decision” appears (if project context exists).

5. **Later:** Update project context (e.g. team 12, users 50k, 12 months).  
   → PUT project-context; current context in DB is updated.

6. **Evaluate decision** – Click “Evaluate Decision.”  
   → POST decisions/{id}/evaluate.  
   → Backend loads current context + latest snapshot, runs drift engine, saves evaluation.  
   → Frontend gets back drift score, risk level, explanation and adds it to the list.

7. **Interpret:** e.g. “Drift detected: Team size changed by 140%, Expected users changed by 400%. Score: 85/100. High risk.”  
   → You use that to decide whether to revisit the “Use PostgreSQL” decision.

---

## 10. Summary

- **Decisio** = record decisions + capture context at decision time (snapshots) + track current context + compute drift (snapshot vs now) + store and show risk and explanation.
- **Backend** = FastAPI, REST, Pydantic, SQLAlchemy, rule-based drift engine, evaluation service; no business logic in routes.
- **Frontend** = React SPA; API client in `api.ts`; decision detail loads and displays snapshots and evaluations; create snapshot triggers reload so the new snapshot is shown and evaluate can be used.
- **Database** = PostgreSQL with four main tables; relations support “one current context,” “many snapshots per decision,” “many evaluations per decision.”
- **Drift** = numeric and categorical (risk) summary of how much “project context now” differs from “snapshot when we decided,” with a short text explanation.

With this, you have a full picture of how the project is structured and how everything works end to end.
