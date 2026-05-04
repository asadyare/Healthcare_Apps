# 03 — Security controls

Each section answers: **What** · **Where** · **Why** · **Findings policy**

---

## Secret scanning

| Tool | Where | Why |
|------|-------|-----|
| **Gitleaks** | `security-gates` job, `.security/gitleaks.toml` | Block verified secrets in git history and working tree. |
| **TruffleHog** | Same job; PR uses `base`/`head`, push uses `before`/`sha` | Verified + unknown entropy findings on deltas. |

**Policy:** Fail workflow on verified leaks; fix or rotate before merge.

---

## SAST

| Tool | Where | Why |
|------|-------|-----|
| **Semgrep** | `returntocorp/semgrep-action` with `auto` + `.security/semgrep-rules.yaml` | Catch dangerous patterns across TS/JS and config. |

**Policy:** Fail on configured severities per organisation ruleset (see Semgrep output in Actions).

---

## SCA

| Tool | Where | Why |
|------|-------|-----|
| **npm audit** | `npm audit --omit=dev --audit-level=critical` | Critical CVEs in production dependency tree block merge. |

**Rationale:** Dev-only advisories should not block shipping when workspaces pull large dev graphs.

---

## IaC

| Tool | Where | Why |
|------|-------|-----|
| **Checkov** | `bridgecrewio/checkov-action`, `.security/checkov.yaml` | Terraform + Kubernetes posture (with documented `skip-check` rationale). |

---

## Container and filesystem

| Tool | Where | Why |
|------|-------|-----|
| **Trivy fs** | Full repo scan, HIGH/CRITICAL | Catch vulnerable libs and misconfigs before image build. |
| **Trivy image** | Per-service Docker build | Ensure built images are not HIGH/CRITICAL vulnerable. |

---

## Kubernetes runtime (manifest-level)

Non-root pods, dropped capabilities, read-only root FS, seccomp, probes — see `k8s/base/microservices.yaml` and [infrastructure-and-security.md](../infrastructure-and-security.md).
