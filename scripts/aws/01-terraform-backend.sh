#!/usr/bin/env bash
set -euo pipefail
# Usage: REGION=eu-west-1 BUCKET=healthcare-apps-tf-state TABLE=healthcare-apps-tf-locks ./01-terraform-backend.sh

REGION="${REGION:-eu-west-1}"
BUCKET="${BUCKET:-healthcare-apps-tf-state}"
TABLE="${TABLE:-healthcare-apps-tf-locks}"
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"

echo "Account: ${ACCOUNT_ID} Region: ${REGION}"

if ! aws s3api head-bucket --bucket "${BUCKET}" 2>/dev/null; then
  aws s3api create-bucket \
    --bucket "${BUCKET}" \
    --region "${REGION}" \
    --create-bucket-configuration "LocationConstraint=${REGION}"
  echo "Created bucket: ${BUCKET}"
else
  echo "Bucket already exists: ${BUCKET}"
fi

aws s3api put-bucket-versioning --bucket "${BUCKET}" --versioning-configuration Status=Enabled
aws s3api put-bucket-encryption --bucket "${BUCKET}" --server-side-encryption-configuration \
  '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
aws s3api put-public-access-block --bucket "${BUCKET}" --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

if ! aws dynamodb describe-table --table-name "${TABLE}" --region "${REGION}" >/dev/null 2>&1; then
  aws dynamodb create-table \
    --table-name "${TABLE}" \
    --billing-mode PAY_PER_REQUEST \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --region "${REGION}"
  aws dynamodb wait table-exists --table-name "${TABLE}" --region "${REGION}"
  echo "Created DynamoDB table: ${TABLE}"
else
  echo "DynamoDB table already exists: ${TABLE}"
fi

echo ""
echo "Match infra/terraform/versions.tf:"
echo "  bucket         = \"${BUCKET}\""
echo "  key            = \"eks/terraform.tfstate\""
echo "  region         = \"${REGION}\""
echo "  dynamodb_table = \"${TABLE}\""
echo ""
echo "Terraform state IAM (attach to role/user running terraform apply):"
echo "  arn:aws:s3:::${BUCKET} and arn:aws:s3:::${BUCKET}/* (GetObject,PutObject,DeleteObject,ListBucket)"
echo "  arn:aws:dynamodb:${REGION}:${ACCOUNT_ID}:table/${TABLE} (GetItem,PutItem,DeleteItem)"
