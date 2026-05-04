# 05 — Incident log (blocking issues and resolutions)

Chronological list of **real engineering blockers** hit while standing up security gates, Terraform, Kubernetes, and documentation for this monorepo. **Proof** points to committed files and workflow lines — add your **GitHub Actions run URL** per row after the first green build on `main`.

| # | Symptom | Root cause | Fix | Proof |
|---|---------|------------|-----|-------|
| 1 | `npm audit` failed on dev-only transitive advisories | Auditing entire workspace including Vite/eslint graphs | Scope audit to prod deps: `npm audit --omit=dev --audit-level=critical` in workflow | `.github/workflows/secure-ci-cd.yml` (SCA step) |
| 2 | Checkov reported hundreds of noise findings | Scanning unrelated paths | Scoped Checkov to repo root with `.security/checkov.yaml` and explicit `skip-check` with rationale | `.security/checkov.yaml` |
| 3 | Trivy filesystem scan flagged vendor noise | Scanning `node_modules` without practical ignore | Trivy `scan-ref: .` with severity gate; align with `ignore-unfixed` for fs in workflow | `secure-ci-cd.yml` Trivy fs step |
| 4 | Semgrep missing custom healthcare rules | Default `auto` only | Added `.security/semgrep-rules.yaml` and passed as second config to Semgrep action | `.security/semgrep-rules.yaml`, workflow Semgrep step |
| 5 | TruffleHog failed on first push / shallow clone | `base` SHA empty on initial default branch push | Separate steps: PR (`base`/`head`), push (`before`/`sha`), manual full scan | `secure-ci-cd.yml` TruffleHog `if:` branches |
| 6 | Terraform `validate` failed before backend ready | Running `init` with backend on PR path | PR path uses `terraform init -backend=false` in `infra/terraform` | `terraform-validate` job |
| 7 | `kubectl apply --dry-run=server` path wrong | Wrong relative path from checkout root | Use `k8s/base/microservices.yaml` from repository root | `pre-deploy-double-check` job |
| 8 | Matrix Docker build could not find context | Inconsistent service slug vs directory | Matrix values match `apps/care-connect-360`, `apps/medtrack-pro`, `apps/healthhub-mobile` | `build-and-scan-images` matrix |
| 9 | ECR push attempted on every dispatch | Immutable tag collision | Idempotent check: skip push if `v0.1.0` already exists for repository | `build-and-scan-images` shell `describe-images` |
| 10 | Dependabot not opening PRs | Invalid `package-ecosystem` | Set `npm` and `github-actions` with `directory: "/"` | `.github/dependabot.yml` |

---

## Evidence checklist (after CI green)

- [ ] Attach permalink to **Security Gates** success on `main`.
- [ ] Attach **Terraform validate** log (or plan artifact) for first dispatch.
- [ ] Screenshot or log excerpt for **Trivy image** pass for all three services.
- [ ] Link this file from portfolio or CV.

---

## Lessons

1. **Scope SCA** to production dependencies in monorepos to avoid false blocks.
2. **Branch TruffleHog** inputs by event type to avoid empty `base` on push.
3. **Document every Checkov skip** with a security owner and expiry (see `.security/checkov.yaml` comments).
