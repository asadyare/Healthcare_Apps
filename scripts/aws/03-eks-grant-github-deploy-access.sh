#!/usr/bin/env bash
set -euo pipefail
# Usage: CLUSTER=healthcare-apps-eks ROLE_ARN=arn:aws:iam::123:role/github-actions-healthcare-deploy REGION=eu-west-1 ./03-eks-grant-github-deploy-access.sh

: "${CLUSTER:?Set CLUSTER (EKS cluster name)}"
: "${ROLE_ARN:?Set ROLE_ARN (IAM role from 02 script)}"
REGION="${REGION:-eu-west-1}"

ENTRIES_JSON="$(aws eks list-access-entries --cluster-name "${CLUSTER}" --region "${REGION}" --output json)"
if echo "${ENTRIES_JSON}" | grep -Fq "${ROLE_ARN}"; then
  echo "Access entry already exists for ${ROLE_ARN}"
else
  aws eks create-access-entry \
    --cluster-name "${CLUSTER}" \
    --principal-arn "${ROLE_ARN}" \
    --type STANDARD \
    --region "${REGION}"
  echo "Created access entry"
fi

ASSOC_JSON="$(aws eks list-associated-access-policies --cluster-name "${CLUSTER}" --principal-arn "${ROLE_ARN}" --region "${REGION}" --output json)"
if echo "${ASSOC_JSON}" | grep -q "AmazonEKSClusterAdminPolicy"; then
  echo "Cluster admin policy already associated"
else
  aws eks associate-access-policy \
    --cluster-name "${CLUSTER}" \
    --principal-arn "${ROLE_ARN}" \
    --policy-arn arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy \
    --access-scope type=cluster \
    --region "${REGION}"
  echo "Associated AmazonEKSClusterAdminPolicy"
fi

echo "Done. kubectl in GitHub Actions can authenticate to ${CLUSTER}."
