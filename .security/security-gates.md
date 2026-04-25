# Repository-level security gates and policy

## Required gates for PR and main
- Secret scan: gitleaks + trufflehog
- SAST: semgrep (custom + default rules)
- SCA: npm audit (critical threshold on prod deps)
- IaC scan: checkov for Terraform and Kubernetes
- Container scan: trivy filesystem and image scans

## Blocking policy
- Block merge/deploy on any CRITICAL findings
- Block merge/deploy on HIGH findings in IaC/container scans
- Warn-only on MEDIUM/LOW unless repeated or internet-facing

## Exceptions
- Exceptions require issue link, owner, and expiration date
- Exception max validity: 30 days
