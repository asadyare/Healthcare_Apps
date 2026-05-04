# Healthcare Apps – CareConnect360, HealthHub Mobile, MedTrack Pro

Integrated healthcare apps as described in the solution documents:

- **CareConnect360** – Provider-facing patient management (unified records, appointments, care plans, secure messaging, MedTrack Pro integration).
- **HealthHub Mobile** – Patient-facing app (dashboard aggregating CareConnect360 + MedTrack Pro, profile, link IDs).
- **MedTrack Pro** – Medication tracking and reminders (medications, schedules, adherence); exposes integration API for the other two.

## Architecture

- **MedTrack Pro**: React (Vite) + Node/Express + SQLite. Port **4002** (API), **4001** (UI).
- **CareConnect360**: React (Vite) + Node/Express + SQLite. Port **3000** (API), **3001** (UI).
- **HealthHub Mobile**: React (Vite) + Node/Express + SQLite. Port **5000** (API), **5001** (UI).

Integration is via internal REST APIs and a shared `INTEGRATION_API_KEY` (see `.env`).

## Quick start

**Requirements:** Node.js 22+ (uses built-in `node:sqlite`; no native build tools required).

### 1. Install dependencies

From repo root (uses npm workspaces):

```bash
npm install
```

This installs dependencies for all six packages (client + server for each app).

### 2. Run all three apps

**Option A – Run each app in its own terminal**

```bash
# Terminal 1 – MedTrack Pro
cd apps/medtrack-pro/server && npm run dev
# Terminal 2 – MedTrack Pro UI
cd apps/medtrack-pro/client && npm run dev

# Terminal 3 – CareConnect360
cd apps/care-connect-360/server && npm run dev
# Terminal 4 – CareConnect360 UI
cd apps/care-connect-360/client && npm run dev

# Terminal 5 – HealthHub Mobile
cd apps/healthhub-mobile/server && npm run dev
# Terminal 6 – HealthHub Mobile UI
cd apps/healthhub-mobile/client && npm run dev
```

**Option B – From root with concurrently (after `npm install` at root)**

```bash
npm run dev:medtrack
# In other terminals:
npm run dev:careconnect
npm run dev:healthhub
```

### 3. Open the UIs

- **MedTrack Pro**: <http://localhost:4001> — Register/login, add medications and schedules.
- **CareConnect360**: <http://localhost:3001> — Register/login as provider, add patients. Open a patient to see “Medications (MedTrack Pro)” when the patient’s `external_user_id` matches a MedTrack user ID.
- **HealthHub Mobile**: <http://localhost:5001> — Register/login. In **Profile**, set **CareConnect360 patient ID** and **MedTrack Pro user ID** to the same IDs used in the other apps; **Dashboard** will show aggregated records, medications, adherence, appointments, and care plans.

### 4. Integration flow

- **CareConnect360 → MedTrack Pro**: CareConnect360 calls `GET /api/integration/medications/:userId` and `GET /api/integration/adherence/:userId` on MedTrack Pro (using `X-API-Key`). Set a patient’s `external_user_id` to the MedTrack user ID to see that patient’s medications in CareConnect360.
- **HealthHub Mobile → CareConnect360**: HealthHub calls CareConnect integration endpoints (patient, appointments, care plans) using the profile’s `careconnect_patient_id`.
- **HealthHub Mobile → MedTrack Pro**: HealthHub calls MedTrack integration endpoints using the profile’s `medtrack_user_id` (defaults to HealthHub user ID).

Use the same **integration API key** in all three servers (see `.env.example`).

## Environment

Copy `.env.example` to `.env` in each server directory (or set in the environment):

- `PORT` – API port (defaults: 3000, 4002, 5000).
- `JWT_SECRET` – Auth token signing (change in production).
- `INTEGRATION_API_KEY` – Must match across all three servers for integration calls.
- `CARECONNECT_API_URL` – Used by HealthHub (default `<http://localhost:3000>`).
- `MEDTRACK_API_URL` – Used by CareConnect360 and HealthHub (default `http://localhost:4002`).

## Data

- Each server stores data in `apps/<app>/server/data/` (SQLite). No Docker or external DB required for local run.
- For production, the design docs specify MariaDB (CareConnect360), PostgreSQL (MedTrack Pro), and MongoDB (HealthHub); replace the SQLite layer with the appropriate driver and connection string.

---

## Security, threat model, and case study

| Document | Purpose |
|----------|---------|
| [docs/threat-model.md](docs/threat-model.md) | STRIDE matrix and SDLC security requirements |
| [docs/threat-model-risk-analysis.md](docs/threat-model-risk-analysis.md) | Trust boundaries, top risks, HIPAA-oriented qualitative analysis |
| [docs/infrastructure-and-security.md](docs/infrastructure-and-security.md) | Terraform (VPC, EKS, KMS, flow logs), Kubernetes hardening, CI gates |
| [docs/sdlc-security-baseline.md](docs/sdlc-security-baseline.md) | Release gates and evidence to retain |
| [docs/github-actions-setup.md](docs/github-actions-setup.md) | Required GitHub secrets and branch protection |
| [docs/case-study/README.md](docs/case-study/README.md) | **Start here** — portfolio narrative, architecture, controls, pipeline, **incident log with proof pointers** |

Local security scans (Docker): see root `package.json` scripts `scan:secrets`, `scan:sast`, `scan:sca`, `scan:iac`, `scan:fs`.
