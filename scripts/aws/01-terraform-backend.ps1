<#
.SYNOPSIS
  Creates S3 + DynamoDB for Terraform remote state (matches infra/terraform/versions.tf defaults).

.USAGE
  .\01-terraform-backend.ps1 -Region eu-west-1 -BucketName healthcare-apps-tf-state -LockTable healthcare-apps-tf-locks

  Then ensure infra/terraform/versions.tf backend block matches bucket, key, region, dynamodb_table.
#>
param(
  [string]$Region = "eu-west-1",
  [string]$BucketName = "healthcare-apps-tf-state",
  [string]$LockTable = "healthcare-apps-tf-locks"
)

$ErrorActionPreference = "Stop"
$AccountId = (aws sts get-caller-identity --query Account --output text).Trim()

Write-Host "Account: $AccountId  Region: $Region"

aws s3api head-bucket --bucket $BucketName 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  aws s3api create-bucket `
    --bucket $BucketName `
    --region $Region `
    --create-bucket-configuration LocationConstraint=$Region | Out-Null
  Write-Host "Created bucket: $BucketName"
} else {
  Write-Host "Bucket already exists: $BucketName"
}

aws s3api put-bucket-versioning --bucket $BucketName --versioning-configuration Status=Enabled
aws s3api put-bucket-encryption --bucket $BucketName --server-side-encryption-configuration '{
  "Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]
}'
aws s3api put-public-access-block --bucket $BucketName --public-access-block-configuration `
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

aws dynamodb describe-table --table-name $LockTable --region $Region 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  aws dynamodb create-table `
    --table-name $LockTable `
    --billing-mode PAY_PER_REQUEST `
    --attribute-definitions AttributeName=LockID,AttributeType=S `
    --key-schema AttributeName=LockID,KeyType=HASH `
    --region $Region | Out-Null
  aws dynamodb wait table-exists --table-name $LockTable --region $Region
  Write-Host "Created DynamoDB table: $LockTable"
} else {
  Write-Host "DynamoDB table already exists: $LockTable"
}

Write-Host ""
Write-Host "Backend resources ready. Use in GitHub (informational) or local terraform init:"
Write-Host "  bucket         = `"$BucketName`""
Write-Host "  key            = `"eks/terraform.tfstate`""
Write-Host "  region         = `"$Region`""
Write-Host "  dynamodb_table = `"$LockTable`""
Write-Host ""
Write-Host "IAM for Terraform state (attach to the human/CI role that runs terraform apply):"
Write-Host "  Grant s3:GetObject, s3:PutObject, s3:DeleteObject, s3:ListBucket on arn:aws:s3:::$BucketName and arn:aws:s3:::$BucketName/*"
Write-Host "  Grant dynamodb:GetItem, dynamodb:PutItem, dynamodb:DeleteItem on arn:aws:dynamodb:${Region}:${AccountId}:table/${LockTable}"
