# Shared integration API contracts between CareConnect360, HealthHub Mobile, and MedTrack Pro

## MedTrack Pro (medication service)

- **Base URL**: `MEDTRACK_API_URL` (e.g. http://localhost:4000/api)
- **Used by**: CareConnect360, HealthHub Mobile

### Endpoints consumed by other apps

- `GET /api/integration/medications/:userId` — list medications for a patient (requires internal API key or JWT)
- `GET /api/integration/adherence/:userId` — adherence summary for a patient
- `POST /api/integration/medications` — create/update medication (from provider/patient app)

---

## CareConnect360 (provider / patient records)

- **Base URL**: `CARECONNECT_API_URL` (e.g. http://localhost:3000/api)
- **Used by**: HealthHub Mobile

### Endpoints consumed by HealthHub

- `GET /api/integration/patients/:patientId` — patient record summary
- `GET /api/integration/appointments/:patientId` — appointments for patient
- `GET /api/integration/care-plans/:patientId` — care plans for patient

---

## HealthHub Mobile

- **Base URL**: `HEALTHHUB_API_URL` (e.g. http://localhost:5000/api)
- **Used by**: CareConnect360 (optional: patient engagement metrics)

### Endpoints

- Patient profile and preferences; aggregates data from CareConnect360 and MedTrack Pro via its backend.
