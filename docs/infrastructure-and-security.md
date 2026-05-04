# Infrastructure and security — Healthcare Apps

This document ties **Terraform**, **Kubernetes**, and **CI/CD** to the threat model and SDLC baseline.

---

## 1. AWS baseline (Terraform)

Path: `infra/terraform/`

| Area | What is provisioned | Security note |
|------|----------------------|---------------|
| **Network** | VPC, public/private subnets, IGW, NAT, flow logs → CloudWatch (365d retention, KMS) | Flow logs support forensics; NAT for private egress. |
| **Encryption** | Dedicated KMS keys for EKS envelope encryption, ECR, application secrets, logs | Key rotation enabled; scoped policies. |
| **Compute** | EKS 1.30 cluster, private API (`endpoint_public_access = false`), control-plane logging | Reduces API server exposure; audit trail. |
| **Identity** | IAM roles for cluster, nodes, VPC flow logs writer | Least-privilege attachments. |

**CI integration:** `terraform fmt`, `validate`, and optional `plan` run in `.github/workflows/secure-ci-cd.yml` (`terraform-validate` job). OIDC via `aws-actions/configure-aws-credentials` for deploy paths.

---

## 2. Kubernetes workloads

Path: `k8s/base/microservices.yaml`

| Control | Implementation |
|---------|----------------|
| Namespace | `healthcare` |
| Pod security | `runAsNonRoot`, non-root UID 10001, `readOnlyRootFilesystem`, `drop: ALL`, `seccompProfile: RuntimeDefault` |
| Probes | Liveness/readiness HTTP `/api/health` per service |
| Resources | Requests/limits per container |
| Secrets | Projected volumes for app secrets (pattern for production) |

Images reference ECR URIs with immutable-style tags (`v0.1.0`) as documented in CI.

---

## 3. Container build and scan

- **Dockerfile:** per app under `apps/<service>/server/`.
- **CI:** matrix build for `care-connect-360`, `medtrack-pro`, `healthhub-mobile` → **Trivy image** scan (HIGH/CRITICAL, `exit-code: 1`).
- **Registry:** ECR prefix `healthcare/`; push gated on `workflow_dispatch` with approval.

---

## 4. Repository security gates

| Gate | Tool / job | Config |
|------|------------|--------|
| Secrets | Gitleaks, TruffleHog | `.security/gitleaks.toml` |
| SAST | Semgrep | `.security/semgrep-rules.yaml` + `auto` |
| SCA | npm audit | `--omit=dev --audit-level=critical` |
| IaC | Checkov | `.security/checkov.yaml` (Terraform + k8s; documented skips) |
| FS vulns | Trivy fs | HIGH/CRITICAL |

See [.security/security-gates.md](../.security/security-gates.md) and [sdlc-security-baseline.md](./sdlc-security-baseline.md).

---

## 5. Secrets and configuration (runtime)

| Variable | Use |
|----------|-----|
| `JWT_SECRET` | Auth signing — rotate per environment policy. |
| `INTEGRATION_API_KEY` | **Must match** across all three servers for inter-service calls. |
| `*_API_URL` | Service discovery for HealthHub / CareConnect integrations. |

**Production:** Prefer AWS Secrets Manager + IRSA (per SDLC baseline); never commit `.env`.

---

## 6. References

- [github-actions-setup.md](./github-actions-setup.md) — required GitHub secrets and branch protection.
- [case-study/04-cicd-pipeline.md](./case-study/04-cicd-pipeline.md) — workflow stages and evidence pattern.
