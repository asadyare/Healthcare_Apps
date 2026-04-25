# CI/CD Deployment Variables

Configure these GitHub repository secrets before running deployment:

- AWS_DEPLOY_ROLE_ARN
- EKS_CLUSTER_NAME

Recommended repository protection:
- Require pull request reviews (min 1)
- Require status checks: Security Gates, Terraform Validate and Plan, Build and Scan Service Images
- Restrict direct pushes to `main`
- Require signed commits for privileged branches
