# SDLC Security Control Baseline

## Objective
Establish a repeatable DevSecOps lifecycle for Healthcare Apps with security gates that prevent vulnerable artifacts from reaching production.

## Control Framework Mapping (High-Level)
- OWASP SAMM: Governance, Design, Verification, Operations
- NIST SSDF: Prepare, Protect, Produce, Respond
- CIS Software Supply Chain Security

## Release Gates
1. `gitleaks` and `trufflehog`: fail if any verified secret is detected.
2. `semgrep`: fail on high-confidence high-severity findings.
3. `npm audit`: fail on critical vulnerabilities in production dependencies.
4. `checkov` (Terraform + Kubernetes): fail on high/critical misconfigurations.
5. `trivy fs` and `trivy image`: fail on high/critical vulnerabilities.
6. Infrastructure plan must be generated and attached before approval.
7. Production deployment requires protected environment approval.

## Evidence to Retain
- Threat model document revision history
- CI scan reports (SARIF/JUnit/JSON)
- Terraform plan artifacts and approval logs
- Deployment logs and health verification output
- Incident and remediation records

## Operational Security Minimums
- Enforce TLS for all ingress paths
- Use AWS Secrets Manager for application secrets
- Use IRSA for pod-level IAM and avoid static cloud credentials
- Enable CloudTrail, VPC Flow Logs, and EKS control-plane logging
