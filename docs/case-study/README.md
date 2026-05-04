# Case study — Healthcare Apps platform (security, infra, CI/CD)

Portfolio-ready narrative for **CareConnect360**, **HealthHub Mobile**, and **MedTrack Pro**: threat modeling, AWS/EKS baseline, hardened Kubernetes manifests, and a **security-first GitHub Actions** pipeline. This folder documents **blocking issues encountered while hardening the repo** and how each was resolved, with **file and workflow references** as evidence (replace run URLs with your GitHub Actions run links after merge).

---

## TL;DR

- **What:** Monorepo (npm workspaces) with three Express + Vite apps, SQLite for local dev, Terraform for VPC/EKS/KMS/flow logs, `k8s/base` deployments, and `secure-ci-cd.yml` gates.
- **Why it matters:** PHI-oriented workflows and **cross-service `INTEGRATION_API_KEY`** create a compact but real attack surface; gates prevent shipping known-bad deps, secrets, or IaC.
- **Evidence:** Workflow [`.github/workflows/secure-ci-cd.yml`](../../.github/workflows/secure-ci-cd.yml), `.security/*`, `infra/terraform`, `k8s/base/microservices.yaml`, and the [incident log](./05-incident-log.md).

---

## Contents

| File | Description |
|------|-------------|
| [01-overview.md](./01-overview.md) | Goals, apps, stack, pointers to threat model + infra doc |
| [02-architecture.md](./02-architecture.md) | Runtime, integration, CI/CD, OIDC (Mermaid) |
| [03-security-controls.md](./03-security-controls.md) | Per-gate mapping (Gitleaks, Semgrep, Checkov, Trivy, npm audit) |
| [04-cicd-pipeline.md](./04-cicd-pipeline.md) | Jobs, permissions, deploy confirmation, ECR push pattern |
| [05-incident-log.md](./05-incident-log.md) | Chronological index of issues and fixes with proof pointers |

---

## How to cite from a portfolio site

1. Link this README and [05-incident-log.md](./05-incident-log.md) for “evidence of fixes.”
2. Link [docs/threat-model-risk-analysis.md](../threat-model-risk-analysis.md) for HIPAA-oriented qualitative analysis.
3. Add **Actions run permalinks** next to each incident after your first green `main` build.

---

## Scope notes

- Local SQLite paths in manifests are **dev-oriented**; production should use managed DBs per root README.
- EKS API is **private** in Terraform — ensure break-glass access (bastion or SSO) before first deploy.
