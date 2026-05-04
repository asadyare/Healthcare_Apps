# 02 — Architecture

## Runtime (local and target production)

```mermaid
flowchart TB
  subgraph users [Users]
    P[Provider]
    U[Patient]
  end
  subgraph apps [Three apps]
    CC[CareConnect360]
    HH[HealthHub Mobile]
    MT[MedTrack Pro]
  end
  P --> CC
  U --> HH
  U --> MT
  CC -->|"X-API-Key"| MT
  HH -->|"X-API-Key"| CC
  HH -->|"X-API-Key"| MT
```

## CI/CD (simplified)

```mermaid
flowchart LR
  PR[PR / push main] --> SG[Security Gates]
  SG --> TV[Terraform validate]
  SG --> BI[Build + Trivy image x3]
  TV --> PD[Pre-deploy - manual]
  BI --> PD
  PD --> EKS[EKS apply]
```

## OIDC trust (deploy)

GitHub Actions assumes `AWS_DEPLOY_ROLE_ARN` with `id-token: write` to run `terraform plan`, ECR login/push, and `kubectl apply` — **no static AWS access keys** in the workflow YAML.

See `.github/workflows/secure-ci-cd.yml` jobs `terraform-validate`, `build-and-scan-images`, and `pre-deploy-double-check`.
