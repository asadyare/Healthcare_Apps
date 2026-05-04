# 04 — CI/CD pipeline

## Workflow

File: [`.github/workflows/secure-ci-cd.yml`](../../.github/workflows/secure-ci-cd.yml)

| Job | Trigger | Purpose |
|-----|---------|---------|
| **Security Gates** | PR, push `main`, `workflow_dispatch` | Gitleaks, TruffleHog, Semgrep, npm audit, Checkov, Trivy fs |
| **Terraform Validate and Plan** | After gates; plan on `workflow_dispatch` only | `fmt`, `init`, `validate`; optional `plan` + artifact with OIDC |
| **Build and Scan Service Images** | After gates | Matrix: three services → `docker build` + Trivy image |
| **Final Pre-Deploy Double Check** | `workflow_dispatch` + environment approval | Confirm `DEPLOY` input, OIDC, `kubectl` dry-run/apply, rollout status |

## Permissions

```yaml
permissions:
  contents: read
  security-events: write
  id-token: write
```

`security-events: write` supports SARIF or security tab integrations where applicable; `id-token: write` enables OIDC to AWS.

## Secrets (repository)

Documented in [github-actions-setup.md](../github-actions-setup.md):

- `AWS_DEPLOY_ROLE_ARN`
- `EKS_CLUSTER_NAME`

## Deploy safety

- Manual **environment** (`staging` / `production`) on `pre-deploy-double-check`.
- User must type **`DEPLOY`** in `confirm_deploy` input (see job condition).

## Dependabot

Root [`.github/dependabot.yml`](../../.github/dependabot.yml) maintains **npm** and **github-actions** updates on a weekly schedule.
