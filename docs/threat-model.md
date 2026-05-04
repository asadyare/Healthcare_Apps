# Threat Model (STRIDE) - Healthcare Apps Platform

## Scope and Assets
- Patient PII/PHI data across CareConnect360, MedTrack Pro, and HealthHub Mobile
- Authentication tokens (`JWT_SECRET`) and inter-service key (`INTEGRATION_API_KEY`)
- Service APIs and integration endpoints
- Source code, dependencies, CI pipelines, and deployment manifests
- Runtime environments: AWS EKS workloads, VPC network plane, IAM roles

## Trust Boundaries
1. Browser/mobile clients -> API services
2. Internet ingress -> Kubernetes ingress controller
3. Service-to-service traffic inside cluster
4. CI/CD runner -> cloud control plane (AWS)
5. Secrets manager -> application runtime

## STRIDE Risk Matrix
| Threat | STRIDE | Likelihood | Impact | Severity | Mitigation |
|---|---|---|---|---|---|
| Stolen JWT enables unauthorized patient data access | Spoofing | M | H | H | Short token TTL, key rotation, strict audience/issuer checks, MFA for admins |
| Tampered container image introduces malware | Tampering | M | H | H | Signed images, immutable tags, Trivy gate, registry scanning |
| Lack of audit trails for patient record updates | Repudiation | M | H | H | Structured audit logs, immutable retention, trace IDs |
| PHI leakage via misconfigured ingress/TLS | Information Disclosure | M | H | H | TLS-only ingress, security headers, WAF, strict CORS |
| API resource exhaustion (DoS) | Denial of Service | M | M | M | HPA, rate limiting, pod resource limits/requests |
| Over-privileged IAM role in CI/CD | Elevation of Privilege | M | H | H | OIDC least privilege, scoped IAM policies, environment approvals |
| Exposed secrets in git history | Information Disclosure | M | H | H | Gitleaks and TruffleHog gates, secret rotation policy |
| Vulnerable OSS dependency exploited | Tampering | H | M | H | Dependabot, npm audit, SCA severity thresholds |
| Unrestricted east-west traffic in cluster | Elevation of Privilege | M | H | H | Kubernetes NetworkPolicy default deny + explicit allow |
| Drift between reviewed IaC and deployed infra | Repudiation | M | M | M | Terraform plan artifact approval and drift detection |

## Security Requirements by SDLC Phase

### 1) Plan / Design
- Architecture review before implementation
- Data classification (PHI = high confidentiality)
- Threat model update required for each new service

### 2) Build
- Secure coding baseline (OWASP ASVS L2 controls)
- Mandatory pull request reviews
- Dependency pinning and lockfile enforcement

### 3) Verify
- SAST, SCA, secret scanning, IaC scanning on every PR
- Container scan on built images before push
- Policy checks for Kubernetes manifests

### 4) Release
- Signed artifact provenance
- Manual approval for production deploy
- Blue/green or rolling strategy with health checks

### 5) Operate
- Runtime monitoring (logs/metrics/traces)
- Alerting for auth failures, elevated 5xx, and anomalous access
- Regular key and credential rotation

### 6) Improve
- Quarterly threat model refresh
- Incident postmortems with corrective actions
- Vulnerability remediation SLA: Critical 24h, High 7d

---

## Related documentation

- [Threat model & risk analysis (HIPAA-oriented qualitative)](./threat-model-risk-analysis.md)
- [Infrastructure and security](./infrastructure-and-security.md)
- [Case study: incidents, CI/CD evidence](./case-study/README.md)
