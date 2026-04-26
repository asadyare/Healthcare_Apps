#!/usr/bin/env bash
set -euo pipefail
# Usage: GITHUB_ORG=asadyare GITHUB_REPO=Healthcare_Apps REGION=eu-west-1 ROLE=github-actions-healthcare-deploy ./02-github-oidc-deploy-role.sh

GITHUB_ORG="${GITHUB_ORG:-asadyare}"
GITHUB_REPO="${GITHUB_REPO:-Healthcare_Apps}"
REGION="${REGION:-eu-west-1}"
ROLE_NAME="${ROLE_NAME:-github-actions-healthcare-deploy}"

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
OIDC_URL="token.actions.githubusercontent.com"
PROVIDER_ARN="arn:aws:iam::${ACCOUNT_ID}:oidc-provider/${OIDC_URL}"

if ! aws iam get-open-id-connect-provider --open-id-connect-provider-arn "${PROVIDER_ARN}" >/dev/null 2>&1; then
  aws iam create-open-id-connect-provider \
    --url "https://${OIDC_URL}" \
    --client-id-list sts.amazonaws.com \
    --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
  echo "Created OIDC provider: ${PROVIDER_ARN}"
else
  echo "OIDC provider already exists: ${PROVIDER_ARN}"
fi

TRUST_FILE="$(mktemp)"
cat >"${TRUST_FILE}" <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Federated": "${PROVIDER_ARN}" },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:${GITHUB_ORG}/${GITHUB_REPO}:*"
        }
      }
    }
  ]
}
EOF

if aws iam get-role --role-name "${ROLE_NAME}" >/dev/null 2>&1; then
  aws iam update-assume-role-policy --role-name "${ROLE_NAME}" --policy-document "file://${TRUST_FILE}"
  echo "Updated assume role policy: ${ROLE_NAME}"
else
  aws iam create-role --role-name "${ROLE_NAME}" --assume-role-policy-document "file://${TRUST_FILE}"
  echo "Created role: ${ROLE_NAME}"
fi
rm -f "${TRUST_FILE}"

INLINE_FILE="$(mktemp)"
cat >"${INLINE_FILE}" <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EksDescribeForKubeconfig",
      "Effect": "Allow",
      "Action": ["eks:DescribeCluster"],
      "Resource": "arn:aws:eks:${REGION}:${ACCOUNT_ID}:cluster/*"
    },
    {
      "Sid": "EcrAuthAndPush",
      "Effect": "Allow",
      "Action": ["ecr:GetAuthorizationToken"],
      "Resource": "*"
    },
    {
      "Sid": "EcrDataPlane",
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "arn:aws:ecr:${REGION}:${ACCOUNT_ID}:repository/healthcare/*"
    },
    {
      "Sid": "SecretsManagerReadAppSecrets",
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"],
      "Resource": "arn:aws:secretsmanager:${REGION}:${ACCOUNT_ID}:secret:*healthcare*"
    }
  ]
}
EOF

aws iam put-role-policy --role-name "${ROLE_NAME}" --policy-name HealthcareDeployInline --policy-document "file://${INLINE_FILE}"
rm -f "${INLINE_FILE}"

ROLE_ARN="$(aws iam get-role --role-name "${ROLE_NAME}" --query Role.Arn --output text)"
echo ""
echo "GitHub secret AWS_DEPLOY_ROLE_ARN = ${ROLE_ARN}"
echo "Then run 03-eks-grant-github-deploy-access after the cluster exists."
echo "GitHub secret EKS_CLUSTER_NAME = (same as Terraform cluster_name, default healthcare-apps-eks)"
