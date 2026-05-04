# 01 — Overview

## Goals

- Deliver three integrated healthcare experiences (provider, patient, medication) with **documented security** suitable for portfolio and **HIPAA-oriented** discussions.
- Enforce **DevSecOps gates** on every PR to `main` and controlled deploy via `workflow_dispatch`.

## Applications

| App | Role | Default ports |
|-----|------|----------------|
| **CareConnect360** | Provider patient management, MedTrack integration | API 3000, UI 3001 |
| **HealthHub Mobile** | Patient dashboard aggregating CareConnect + MedTrack | API 5000, UI 5001 |
| **MedTrack Pro** | Medications, schedules, adherence; integration API | API 4002, UI 4001 |

## Stack (summary)

- **Frontend:** React + Vite (each `client/`).
- **Backend:** Node.js 22 + Express + `node:sqlite` (each `server/`).
- **Cloud:** AWS VPC, EKS (private API), KMS, VPC flow logs, ECR (see `infra/terraform`).
- **Orchestration:** Kubernetes manifests under `k8s/base/`.

## Related documentation

- [Threat model (STRIDE)](../threat-model.md)
- [Threat model & risk analysis](../threat-model-risk-analysis.md)
- [Infrastructure and security](../infrastructure-and-security.md)
- [SDLC security baseline](../sdlc-security-baseline.md)
